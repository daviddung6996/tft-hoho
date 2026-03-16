from __future__ import annotations

import json
import logging
import os
import re
import shutil
import subprocess
import time
from collections import OrderedDict
from concurrent.futures import Future, TimeoutError
from dataclasses import dataclass
from hmac import compare_digest
from pathlib import Path
from queue import Empty, Queue
from threading import Lock
from threading import Thread
from typing import Any, Iterator

DEFAULT_TIMEOUT_MS = 120_000
DEFAULT_COMMAND = 'notebooklm'
REMOVED_ENV_KEYS = ('PYTHONHOME', 'PYTHONPATH', 'VIRTUAL_ENV', '__PYVENV_LAUNCHER__')
REQUIRED_ENV_KEYS = (
    'NOTEBOOKLM_STORAGE_STATE_PATH',
    'NOTEBOOKLM_BRIDGE_API_KEY',
)
CACHE_TTL_SECONDS = 180
CACHE_MAX_ENTRIES = 128
COACH_CACHE_REQUEST_MODES = frozenset(('coach_select', 'coach_select_stream'))
STREAM_CHUNK_SIZE = 96
STREAM_QUEUE_POLL_INTERVAL_SECONDS = 0.1
MAX_SOURCE_IDS = 16

logger = logging.getLogger(__name__)

CITATION_BLOCK_RE = re.compile(r'\s*(?:\[(?:\d+(?:\s*[-,]\s*\d+)*)\]\s*)+(?=(?:[.,;:!?)]|\s|$))')
SPACE_BEFORE_PUNCTUATION_RE = re.compile(r'\s+([.,;:!?)](?:\s|$))')
MULTISPACE_RE = re.compile(r'[ \t]{2,}')
SPACE_AROUND_NEWLINE_RE = re.compile(r'[ \t]*\n[ \t]*')


class BridgeError(Exception):
    def __init__(
        self,
        message: str,
        *,
        status_code: int,
        detail: str | None = None,
        code: str | None = None,
        missing_env: list[str] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.detail = detail
        self.code = code or 'bridge_error'
        self.missing_env = missing_env or []

    def to_payload(self) -> dict[str, Any]:
        payload: dict[str, Any] = {'error': self.message, 'code': self.code}
        if self.detail:
            payload['detail'] = self.detail
        if self.missing_env:
            payload['missingEnv'] = self.missing_env
        return payload


@dataclass(frozen=True)
class BridgeConfig:
    notebook_id: str | None
    storage_state_path: Path
    api_key: str
    timeout_ms: int = DEFAULT_TIMEOUT_MS
    command: str = DEFAULT_COMMAND
    source_groups: dict[str, tuple[str, ...]] | None = None


@dataclass(frozen=True)
class CachedAnswer:
    answer: str
    expires_at: float


@dataclass(frozen=True)
class AskResult:
    payload: dict[str, str]
    cache_status: str
    total_ms: float


@dataclass(frozen=True)
class StreamEvent:
    event: str
    data: dict[str, Any]


def build_subprocess_env(base_env: dict[str, str] | None = None) -> dict[str, str]:
    env = dict(base_env or os.environ)
    for key in REMOVED_ENV_KEYS:
        env.pop(key, None)
    env['PYTHONIOENCODING'] = 'utf-8'
    env['PYTHONUTF8'] = '1'
    return env


def build_notebooklm_list_command(config: BridgeConfig) -> list[str]:
    return [
        config.command,
        '--storage',
        str(config.storage_state_path),
        'list',
        '--json',
    ]


def normalize_source_ids(source_ids: list[str] | tuple[str, ...] | None) -> tuple[str, ...]:
    if not source_ids:
        return ()

    normalized: list[str] = []
    seen: set[str] = set()

    for raw_value in source_ids:
        if not isinstance(raw_value, str):
            continue

        value = raw_value.strip()
        if not value or value in seen:
            continue

        seen.add(value)
        normalized.append(value)
        if len(normalized) >= MAX_SOURCE_IDS:
            break

    return tuple(normalized)


def build_notebooklm_ask_command(
    config: BridgeConfig,
    notebook_id: str,
    query: str,
    *,
    json_output: bool = True,
    source_ids: list[str] | tuple[str, ...] | None = None,
) -> list[str]:
    command = [
        config.command,
        '--storage',
        str(config.storage_state_path),
        'ask',
        '--new',
        '-n',
        notebook_id,
    ]

    for source_id in normalize_source_ids(source_ids):
        command.extend(('-s', source_id))

    if json_output:
        command.append('--json')

    command.append(query)
    return command


def parse_notebooklm_answer(payload: dict[str, Any]) -> str:
    answer = payload.get('answer')
    if not isinstance(answer, str) or not answer.strip():
        raise BridgeError(
            'NotebookLM returned an empty answer',
            status_code=502,
            detail='Expected a non-empty "answer" field in the NotebookLM response payload.',
            code='empty_answer',
        )
    return strip_notebooklm_citations(answer)


def strip_notebooklm_citations(answer: str) -> str:
    cleaned = CITATION_BLOCK_RE.sub(' ', answer.strip())
    cleaned = SPACE_BEFORE_PUNCTUATION_RE.sub(r'\1', cleaned)
    cleaned = MULTISPACE_RE.sub(' ', cleaned)
    cleaned = SPACE_AROUND_NEWLINE_RE.sub('\n', cleaned)
    return cleaned.strip()


def load_bridge_config(env: dict[str, str] | None = None) -> BridgeConfig:
    values = env or os.environ
    missing_env = [key for key in REQUIRED_ENV_KEYS if not values.get(key)]
    if missing_env:
        raise BridgeError(
            'NotebookLM bridge is not configured',
            status_code=500,
            detail=f'Missing required environment variables: {", ".join(missing_env)}',
            code='missing_env',
            missing_env=missing_env,
        )

    storage_state_path = Path(values['NOTEBOOKLM_STORAGE_STATE_PATH']).expanduser()
    if not storage_state_path.is_file():
        raise BridgeError(
            'NotebookLM storage state not found',
            status_code=500,
            detail=f'Expected storage_state.json at {storage_state_path}',
            code='missing_storage_state',
        )

    timeout_raw = values.get('NOTEBOOKLM_TIMEOUT_MS', str(DEFAULT_TIMEOUT_MS))
    try:
        timeout_ms = int(timeout_raw)
    except ValueError as exc:
        raise BridgeError(
            'NotebookLM timeout is invalid',
            status_code=500,
            detail=f'NOTEBOOKLM_TIMEOUT_MS must be an integer, got {timeout_raw!r}',
            code='invalid_timeout',
        ) from exc

    command = values.get('NOTEBOOKLM_COMMAND', DEFAULT_COMMAND)
    if shutil.which(command) is None:
        raise BridgeError(
            'NotebookLM CLI is unavailable',
            status_code=500,
            detail=f'Command {command!r} was not found in PATH.',
            code='missing_cli',
        )

    source_groups: dict[str, tuple[str, ...]] = {}
    source_groups_raw = values.get('NOTEBOOKLM_SOURCE_GROUPS_JSON', '').strip()
    if source_groups_raw:
        try:
            parsed_groups = json.loads(source_groups_raw)
        except json.JSONDecodeError as exc:
            raise BridgeError(
                'NotebookLM source groups are invalid',
                status_code=500,
                detail='NOTEBOOKLM_SOURCE_GROUPS_JSON must be valid JSON.',
                code='invalid_source_groups',
            ) from exc

        if not isinstance(parsed_groups, dict):
            raise BridgeError(
                'NotebookLM source groups are invalid',
                status_code=500,
                detail='NOTEBOOKLM_SOURCE_GROUPS_JSON must be a JSON object of group -> source-id array.',
                code='invalid_source_groups',
            )

        for raw_key, raw_value in parsed_groups.items():
            if not isinstance(raw_key, str):
                continue
            normalized_key = raw_key.strip()
            if not normalized_key:
                continue
            source_groups[normalized_key] = normalize_source_ids(raw_value if isinstance(raw_value, list) else None)

    return BridgeConfig(
        notebook_id=values.get('NOTEBOOKLM_NOTEBOOK_ID'),
        storage_state_path=storage_state_path,
        api_key=values['NOTEBOOKLM_BRIDGE_API_KEY'],
        timeout_ms=timeout_ms,
        command=command,
        source_groups=source_groups,
    )


class NotebookLMBridge:
    def __init__(self, config: BridgeConfig) -> None:
        self.config = config
        self._env = build_subprocess_env()
        self._cache_lock = Lock()
        self._answer_cache: OrderedDict[str, CachedAnswer] = OrderedDict()
        self._inflight_requests: dict[str, Future[AskResult]] = {}

    def authenticate(self, api_key: str) -> None:
        if not isinstance(api_key, str) or not compare_digest(api_key, self.config.api_key):
            raise BridgeError(
                'Unauthorized',
                status_code=401,
                detail='Invalid bridge API key.',
                code='unauthorized',
            )

    def _log_event(self, level: int, message: str, **fields: Any) -> None:
        payload = {
            'pid': os.getpid(),
            **{key: value for key, value in fields.items() if value is not None},
        }
        logger.log(level, '%s %s', message, json.dumps(payload, ensure_ascii=True, sort_keys=True))

    def _prune_cache_locked(self, now: float) -> None:
        expired_keys = [key for key, entry in self._answer_cache.items() if entry.expires_at <= now]
        for key in expired_keys:
            self._answer_cache.pop(key, None)

        while len(self._answer_cache) > CACHE_MAX_ENTRIES:
            self._answer_cache.popitem(last=False)

    def _normalize_query_for_cache(self, query: str) -> str:
        return MULTISPACE_RE.sub(' ', query.strip())

    def _normalize_cache_context(self, cache_context: str) -> str:
        return MULTISPACE_RE.sub(' ', cache_context.strip())

    def _build_cache_key(
        self,
        notebook_id: str,
        coach_id: str | None,
        query: str,
        request_mode: str | None = None,
        cache_context: str | None = None,
        source_selection: tuple[str, ...] | None = None,
    ) -> str:
        normalized_request_mode = (request_mode or 'default').strip() or 'default'
        cache_value = self._normalize_query_for_cache(query)
        if normalized_request_mode in COACH_CACHE_REQUEST_MODES and isinstance(cache_context, str) and cache_context.strip():
            cache_value = self._normalize_cache_context(cache_context)

        source_key = ','.join(source_selection or ()) or 'all'
        return '::'.join((notebook_id, coach_id or 'unknown', normalized_request_mode, source_key, cache_value))

    def _resolve_source_ids(
        self,
        source_ids: list[str] | tuple[str, ...] | None = None,
        source_groups: list[str] | tuple[str, ...] | None = None,
    ) -> tuple[str, ...]:
        resolved: list[str] = []

        configured_groups = self.config.source_groups or {}
        for group in normalize_source_ids(source_groups):
            resolved.extend(configured_groups.get(group, ()))

        resolved.extend(normalize_source_ids(source_ids))
        return normalize_source_ids(resolved)

    def _start_pipe_reader(
        self,
        pipe: Any,
        queue: Queue[object],
        sentinel: object,
    ) -> Thread:
        def reader() -> None:
            try:
                while True:
                    chunk = pipe.read(STREAM_CHUNK_SIZE)
                    if not chunk:
                        break
                    queue.put(chunk)
            finally:
                try:
                    pipe.close()
                finally:
                    queue.put(sentinel)

        thread = Thread(target=reader, daemon=True)
        thread.start()
        return thread

    def _drain_stream_queue(
        self,
        queue: Queue[object],
        target: list[str],
        sentinel: object,
    ) -> bool:
        seen_sentinel = False
        while True:
            try:
                item = queue.get_nowait()
            except Empty:
                break

            if item is sentinel:
                seen_sentinel = True
                continue

            if isinstance(item, str) and item:
                target.append(item)

        return seen_sentinel

    def _get_cached_answer(self, cache_key: str, now: float) -> str | None:
        with self._cache_lock:
            self._prune_cache_locked(now)
            entry = self._answer_cache.get(cache_key)
            if entry is None:
                return None

            self._answer_cache.move_to_end(cache_key)
            return entry.answer

    def _store_cached_answer(self, cache_key: str, answer: str, now: float) -> None:
        with self._cache_lock:
            self._prune_cache_locked(now)
            self._answer_cache[cache_key] = CachedAnswer(answer=answer, expires_at=now + CACHE_TTL_SECONDS)
            self._answer_cache.move_to_end(cache_key)
            self._prune_cache_locked(now)

    def _list_notebooks(self, *, request_id: str | None = None) -> list[dict[str, Any]]:
        payload = self._run_json_command(
            build_notebooklm_list_command(self.config),
            request_id=request_id,
            status_code_on_success=200,
        )
        notebooks = payload.get('notebooks')
        if not isinstance(notebooks, list):
            raise BridgeError(
                'NotebookLM list response is invalid',
                status_code=502,
                detail='Expected "notebooks" array in NotebookLM list output.',
                code='invalid_list_payload',
            )
        return [notebook for notebook in notebooks if isinstance(notebook, dict)]

    def _raise_missing_notebook(self, notebook_id: str) -> None:
        raise BridgeError(
            'Configured notebook was not found',
            status_code=500,
            detail=f'Notebook {notebook_id} is not visible to the current NotebookLM auth state.',
            code='missing_notebook',
        )

    def healthcheck(self, *, request_id: str | None = None) -> dict[str, Any]:
        started_at = time.perf_counter()
        notebooks = self._list_notebooks(request_id=request_id)
        if self.config.notebook_id and not any(notebook.get('id') == self.config.notebook_id for notebook in notebooks):
            self._raise_missing_notebook(self.config.notebook_id)

        payload = {
            'ok': True,
            'defaultNotebookId': self.config.notebook_id,
            'visibleNotebookCount': len(notebooks),
            'storageStatePath': str(self.config.storage_state_path),
        }
        self._log_event(
            logging.INFO,
            'NotebookLM bridge deep health completed',
            request_id=request_id,
            notebook_id=self.config.notebook_id,
            total_ms=round((time.perf_counter() - started_at) * 1000, 2),
            status_code=200,
        )
        return payload

    def livecheck(self, *, request_id: str | None = None) -> dict[str, Any]:
        payload = {'ok': True, 'pid': os.getpid()}
        self._log_event(
            logging.DEBUG,
            'NotebookLM bridge live check completed',
            request_id=request_id,
            status_code=200,
        )
        return payload

    def ask(
        self,
        query: str,
        api_key: str,
        notebook_id: str | None = None,
        *,
        request_id: str | None = None,
        coach_id: str | None = None,
        request_mode: str | None = None,
        cache_context: str | None = None,
        source_ids: list[str] | tuple[str, ...] | None = None,
        source_groups: list[str] | tuple[str, ...] | None = None,
    ) -> AskResult:
        started_at = time.perf_counter()
        self.authenticate(api_key)
        if not isinstance(query, str) or not query.strip():
            raise BridgeError(
                'Missing query',
                status_code=400,
                detail='POST /ask requires a non-empty "query" string.',
                code='missing_query',
            )

        resolved_notebook_id = notebook_id or self.config.notebook_id
        if not isinstance(resolved_notebook_id, str) or not resolved_notebook_id.strip():
            raise BridgeError(
                'Missing notebook_id',
                status_code=400,
                detail='POST /ask requires a notebook_id when no default NOTEBOOKLM_NOTEBOOK_ID is configured.',
                code='missing_notebook_id',
            )

        resolved_notebook_id = resolved_notebook_id.strip()
        normalized_query = query.strip()
        resolved_source_ids = self._resolve_source_ids(source_ids, source_groups)
        cache_key = self._build_cache_key(
            resolved_notebook_id,
            coach_id,
            normalized_query,
            request_mode=request_mode,
            cache_context=cache_context,
            source_selection=resolved_source_ids,
        )
        now = time.monotonic()
        cached_answer = self._get_cached_answer(cache_key, now)
        if cached_answer is not None:
            total_ms = round((time.perf_counter() - started_at) * 1000, 2)
            self._log_event(
                logging.INFO,
                'NotebookLM bridge ask cache hit',
                request_id=request_id,
                coach_id=coach_id,
                notebook_id=resolved_notebook_id,
                source_count=len(resolved_source_ids),
                query_chars=len(normalized_query),
                cache_hit=True,
                dedupe_hit=False,
                total_ms=total_ms,
                status_code=200,
            )
            return AskResult(payload={'answer': cached_answer}, cache_status='hit', total_ms=total_ms)

        leader = False
        future: Future[AskResult]
        with self._cache_lock:
            self._prune_cache_locked(now)
            future = self._inflight_requests.get(cache_key)
            if future is None:
                future = Future()
                self._inflight_requests[cache_key] = future
                leader = True

        if not leader:
            try:
                result = future.result(timeout=max(self.config.timeout_ms / 1000, 1) + 1)
                total_ms = round((time.perf_counter() - started_at) * 1000, 2)
                self._log_event(
                    logging.INFO,
                    'NotebookLM bridge ask in-flight dedupe hit',
                    request_id=request_id,
                    coach_id=coach_id,
                    notebook_id=resolved_notebook_id,
                    source_count=len(resolved_source_ids),
                    query_chars=len(normalized_query),
                    cache_hit=False,
                    dedupe_hit=True,
                    total_ms=total_ms,
                    status_code=200,
                )
                return AskResult(payload=result.payload, cache_status='hit', total_ms=total_ms)
            except TimeoutError as exc:
                raise BridgeError(
                    'NotebookLM in-flight request timed out',
                    status_code=504,
                    detail='Timed out while waiting for an identical request already running in this worker.',
                    code='inflight_timeout',
                ) from exc

        try:
            payload = self._run_json_command(
                build_notebooklm_ask_command(
                    self.config,
                    resolved_notebook_id,
                    normalized_query,
                    source_ids=resolved_source_ids,
                ),
                request_id=request_id,
                coach_id=coach_id,
                notebook_id=resolved_notebook_id,
                status_code_on_success=200,
            )
            answer = parse_notebooklm_answer(payload)
            total_ms = round((time.perf_counter() - started_at) * 1000, 2)
            result = AskResult(payload={'answer': answer}, cache_status='miss', total_ms=total_ms)
            self._store_cached_answer(cache_key, answer, time.monotonic())
            future.set_result(result)
            self._log_event(
                logging.INFO,
                'NotebookLM bridge ask completed',
                request_id=request_id,
                coach_id=coach_id,
                notebook_id=resolved_notebook_id,
                source_count=len(resolved_source_ids),
                query_chars=len(normalized_query),
                cache_hit=False,
                dedupe_hit=False,
                total_ms=total_ms,
                status_code=200,
            )
            return result
        except Exception as exc:
            if not future.done():
                future.set_exception(exc)
            if isinstance(exc, BridgeError):
                self._log_event(
                    logging.WARNING,
                    'NotebookLM bridge ask failed',
                    request_id=request_id,
                    coach_id=coach_id,
                    notebook_id=resolved_notebook_id,
                    source_count=len(resolved_source_ids),
                    query_chars=len(normalized_query),
                    cache_hit=False,
                    dedupe_hit=False,
                    total_ms=round((time.perf_counter() - started_at) * 1000, 2),
                    status_code=exc.status_code,
                    code=exc.code,
                )
            raise
        finally:
            with self._cache_lock:
                current_future = self._inflight_requests.get(cache_key)
                if current_future is future:
                    self._inflight_requests.pop(cache_key, None)

    def stream_ask(
        self,
        query: str,
        api_key: str,
        notebook_id: str | None = None,
        *,
        request_id: str | None = None,
        coach_id: str | None = None,
        source_ids: list[str] | tuple[str, ...] | None = None,
        source_groups: list[str] | tuple[str, ...] | None = None,
    ) -> Iterator[StreamEvent]:
        started_at = time.perf_counter()
        self.authenticate(api_key)
        if not isinstance(query, str) or not query.strip():
            raise BridgeError(
                'Missing query',
                status_code=400,
                detail='POST /ask-stream requires a non-empty "query" string.',
                code='missing_query',
            )

        resolved_notebook_id = notebook_id or self.config.notebook_id
        if not isinstance(resolved_notebook_id, str) or not resolved_notebook_id.strip():
            raise BridgeError(
                'Missing notebook_id',
                status_code=400,
                detail='POST /ask-stream requires a notebook_id when no default NOTEBOOKLM_NOTEBOOK_ID is configured.',
                code='missing_notebook_id',
            )

        resolved_notebook_id = resolved_notebook_id.strip()
        normalized_query = query.strip()
        resolved_source_ids = self._resolve_source_ids(source_ids, source_groups)
        command = build_notebooklm_ask_command(
            self.config,
            resolved_notebook_id,
            normalized_query,
            json_output=False,
            source_ids=resolved_source_ids,
        )
        command_name = command[3] if len(command) > 3 else command[0]
        stdout_chunks: list[str] = []
        stderr_chunks: list[str] = []
        stdout_queue: Queue[object] = Queue()
        stderr_queue: Queue[object] = Queue()
        stdout_done = False
        stdout_sentinel = object()
        stderr_sentinel = object()

        try:
            process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding='utf-8',
                env=self._env,
                bufsize=1,
            )
        except OSError as exc:
            raise BridgeError(
                'NotebookLM CLI request failed',
                status_code=502,
                detail=str(exc),
                code='cli_failed',
            ) from exc

        if process.stdout is None or process.stderr is None:
            process.kill()
            raise BridgeError(
                'NotebookLM CLI request failed',
                status_code=502,
                detail='NotebookLM CLI did not expose stdout/stderr pipes.',
                code='cli_failed',
            )

        stdout_thread = self._start_pipe_reader(process.stdout, stdout_queue, stdout_sentinel)
        stderr_thread = self._start_pipe_reader(process.stderr, stderr_queue, stderr_sentinel)
        deadline = time.monotonic() + max(self.config.timeout_ms / 1000, 1)

        try:
            yield StreamEvent('status', {'phase': 'started'})

            while True:
                self._drain_stream_queue(stderr_queue, stderr_chunks, stderr_sentinel)

                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    process.kill()
                    raise BridgeError(
                        'NotebookLM request timed out',
                        status_code=504,
                        detail=f'Command timed out after {self.config.timeout_ms} ms.',
                        code='timeout',
                    )

                try:
                    item = stdout_queue.get(timeout=min(STREAM_QUEUE_POLL_INTERVAL_SECONDS, remaining))
                except Empty:
                    item = None

                if item is stdout_sentinel:
                    stdout_done = True
                elif isinstance(item, str) and item:
                    stdout_chunks.append(item)
                    yield StreamEvent('chunk', {'text': item})

                self._drain_stream_queue(stderr_queue, stderr_chunks, stderr_sentinel)

                if stdout_done and process.poll() is not None:
                    break

            stdout_thread.join(timeout=1)
            stderr_thread.join(timeout=1)
            self._drain_stream_queue(stderr_queue, stderr_chunks, stderr_sentinel)
            process.wait(timeout=1)
        finally:
            if process.poll() is None:
                process.kill()

        stderr_text = ''.join(chunk for chunk in stderr_chunks if isinstance(chunk, str)).strip()
        subprocess_ms = round((time.perf_counter() - started_at) * 1000, 2)

        if process.returncode != 0:
            detail = stderr_text or 'NotebookLM CLI exited with a non-zero status.'
            self._log_event(
                logging.WARNING,
                'NotebookLM bridge stream command failed',
                request_id=request_id,
                coach_id=coach_id,
                notebook_id=resolved_notebook_id,
                source_count=len(resolved_source_ids),
                command=command_name,
                subprocess_ms=subprocess_ms,
                total_ms=subprocess_ms,
                status_code=502,
                detail=detail,
            )
            raise BridgeError(
                'NotebookLM CLI request failed',
                status_code=502,
                detail=detail,
                code='cli_failed',
            )

        answer = strip_notebooklm_citations(''.join(stdout_chunks))
        if not answer:
            raise BridgeError(
                'NotebookLM returned an empty answer',
                status_code=502,
                detail='Expected a non-empty answer in NotebookLM stream output.',
                code='empty_answer',
            )

        total_ms = round((time.perf_counter() - started_at) * 1000, 2)
        self._log_event(
            logging.INFO,
            'NotebookLM bridge stream completed',
            request_id=request_id,
            coach_id=coach_id,
            notebook_id=resolved_notebook_id,
            source_count=len(resolved_source_ids),
            query_chars=len(normalized_query),
            total_ms=total_ms,
            status_code=200,
        )
        yield StreamEvent('complete', {'answer': answer, 'total_ms': total_ms})

    def _run_json_command(
        self,
        cmd: list[str],
        *,
        request_id: str | None = None,
        coach_id: str | None = None,
        notebook_id: str | None = None,
        status_code_on_success: int | None = None,
    ) -> dict[str, Any]:
        command_name = cmd[3] if len(cmd) > 3 else cmd[0]
        started_at = time.perf_counter()
        try:
            completed = subprocess.run(
                cmd,
                check=False,
                capture_output=True,
                text=True,
                encoding='utf-8',
                env=self._env,
                timeout=max(self.config.timeout_ms / 1000, 1),
            )
        except subprocess.TimeoutExpired as exc:
            timeout_ms = round((time.perf_counter() - started_at) * 1000, 2)
            self._log_event(
                logging.WARNING,
                'NotebookLM bridge command timed out',
                request_id=request_id,
                coach_id=coach_id,
                notebook_id=notebook_id,
                command=command_name,
                subprocess_ms=timeout_ms,
                total_ms=timeout_ms,
                status_code=504,
            )
            raise BridgeError(
                'NotebookLM request timed out',
                status_code=504,
                detail=f'Command timed out after {self.config.timeout_ms} ms.',
                code='timeout',
            ) from exc

        subprocess_ms = round((time.perf_counter() - started_at) * 1000, 2)
        if completed.returncode != 0:
            stderr = (completed.stderr or '').strip()
            stdout = (completed.stdout or '').strip()
            detail = stderr or stdout or 'NotebookLM CLI exited with a non-zero status.'
            self._log_event(
                logging.WARNING,
                'NotebookLM bridge command failed',
                request_id=request_id,
                coach_id=coach_id,
                notebook_id=notebook_id,
                command=command_name,
                subprocess_ms=subprocess_ms,
                total_ms=subprocess_ms,
                status_code=502,
                detail=detail,
            )
            raise BridgeError(
                'NotebookLM CLI request failed',
                status_code=502,
                detail=detail,
                code='cli_failed',
            )

        parse_started_at = time.perf_counter()
        try:
            payload = json.loads(completed.stdout)
        except json.JSONDecodeError as exc:
            total_ms = round((time.perf_counter() - started_at) * 1000, 2)
            self._log_event(
                logging.WARNING,
                'NotebookLM bridge command returned invalid JSON',
                request_id=request_id,
                coach_id=coach_id,
                notebook_id=notebook_id,
                command=command_name,
                subprocess_ms=subprocess_ms,
                total_ms=total_ms,
                status_code=502,
            )
            raise BridgeError(
                'NotebookLM returned invalid JSON',
                status_code=502,
                detail=str(exc),
                code='invalid_json',
            ) from exc

        if not isinstance(payload, dict):
            raise BridgeError(
                'NotebookLM returned an invalid payload',
                status_code=502,
                detail='Expected NotebookLM CLI to return a JSON object.',
                code='invalid_payload',
            )

        parse_ms = round((time.perf_counter() - parse_started_at) * 1000, 2)
        total_ms = round((time.perf_counter() - started_at) * 1000, 2)
        self._log_event(
            logging.INFO,
            'NotebookLM bridge command completed',
            request_id=request_id,
            coach_id=coach_id,
            notebook_id=notebook_id,
            command=command_name,
            subprocess_ms=subprocess_ms,
            parse_ms=parse_ms,
            total_ms=total_ms,
            status_code=status_code_on_success,
        )
        return payload
