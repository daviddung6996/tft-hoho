from __future__ import annotations

import os
import subprocess
import threading
import time
import unittest
from io import StringIO
from pathlib import Path
from unittest.mock import Mock, patch

from services.notebooklm_bridge.bridge import (
    AskResult,
    BridgeConfig,
    BridgeError,
    CACHE_TTL_SECONDS,
    NotebookLMBridge,
    build_notebooklm_ask_command,
    build_subprocess_env,
    load_bridge_config,
    normalize_source_ids,
    parse_notebooklm_answer,
    strip_notebooklm_citations,
)


class NotebookLMBridgeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.storage_state = Path(__file__).resolve()
        self.config = BridgeConfig(
            notebook_id='nb-123',
            storage_state_path=self.storage_state,
            api_key='secret-key',
            timeout_ms=4567,
            command='notebooklm',
        )

    def test_build_subprocess_env_strips_python_virtualenv_noise(self) -> None:
        env = build_subprocess_env(
            {
                'PYTHONHOME': 'bad',
                'PYTHONPATH': 'bad',
                'VIRTUAL_ENV': 'bad',
                '__PYVENV_LAUNCHER__': 'bad',
                'PATH': os.environ.get('PATH', ''),
            }
        )

        self.assertNotIn('PYTHONHOME', env)
        self.assertNotIn('PYTHONPATH', env)
        self.assertNotIn('VIRTUAL_ENV', env)
        self.assertNotIn('__PYVENV_LAUNCHER__', env)
        self.assertEqual(env['PYTHONIOENCODING'], 'utf-8')
        self.assertEqual(env['PYTHONUTF8'], '1')

    def test_build_notebooklm_command_uses_new_json_and_notebook_id(self) -> None:
        command = build_notebooklm_ask_command(self.config, 'nb-123', 'hello')

        self.assertEqual(
            command,
            [
                'notebooklm',
                '--storage',
                str(self.storage_state),
                'ask',
                '--new',
                '-n',
                'nb-123',
                '--json',
                'hello',
            ],
        )

    def test_build_notebooklm_command_appends_source_ids_before_json_flag(self) -> None:
        command = build_notebooklm_ask_command(
            self.config,
            'nb-123',
            'hello',
            source_ids=['src-1', 'src-2'],
        )

        self.assertEqual(
            command,
            [
                'notebooklm',
                '--storage',
                str(self.storage_state),
                'ask',
                '--new',
                '-n',
                'nb-123',
                '-s',
                'src-1',
                '-s',
                'src-2',
                '--json',
                'hello',
            ],
        )

    def test_parse_notebooklm_answer_extracts_answer_text(self) -> None:
        answer = parse_notebooklm_answer({'answer': ' Pick this augment '})
        self.assertEqual(answer, 'Pick this augment')

    def test_parse_notebooklm_answer_strips_inline_notebooklm_citations(self) -> None:
        answer = parse_notebooklm_answer(
            {
                'answer': (
                    'Tai sao: Board nay dang thieu frontline nen uu tien on dinh [1]. '
                    'Neu tham econ luc nay se de mat mau them [2][3].'
                )
            }
        )

        self.assertEqual(
            answer,
            'Tai sao: Board nay dang thieu frontline nen uu tien on dinh. '
            'Neu tham econ luc nay se de mat mau them.',
        )

    def test_strip_notebooklm_citations_keeps_line_breaks_and_range_cleanup(self) -> None:
        cleaned = strip_notebooklm_citations(
            'Pick: Kinh Te [1-3]\n'
            'Tai sao: Lay loi nay de xoay tien truoc [4, 5] va giu do mo.\n\n'
            'Backup: Danh nhau [6].'
        )

        self.assertEqual(
            cleaned,
            'Pick: Kinh Te\n'
            'Tai sao: Lay loi nay de xoay tien truoc va giu do mo.\n\n'
            'Backup: Danh nhau.',
        )

    @patch('services.notebooklm_bridge.bridge.shutil.which', return_value='C:/bin/notebooklm')
    def test_load_bridge_config_allows_missing_default_notebook_id(self, _which: object) -> None:
        config = load_bridge_config(
            {
                'NOTEBOOKLM_STORAGE_STATE_PATH': str(self.storage_state),
                'NOTEBOOKLM_BRIDGE_API_KEY': 'secret',
            }
        )

        self.assertIsNone(config.notebook_id)

    @patch('services.notebooklm_bridge.bridge.shutil.which', return_value='C:/bin/notebooklm')
    def test_load_bridge_config_requires_storage_state_file(self, _which: object) -> None:
        with self.assertRaises(BridgeError) as ctx:
            load_bridge_config(
                {
                    'NOTEBOOKLM_NOTEBOOK_ID': 'nb-123',
                    'NOTEBOOKLM_STORAGE_STATE_PATH': str(self.storage_state.parent / 'missing-storage-state.json'),
                    'NOTEBOOKLM_BRIDGE_API_KEY': 'secret',
                }
            )

        self.assertEqual(ctx.exception.code, 'missing_storage_state')

    @patch('services.notebooklm_bridge.bridge.shutil.which', return_value='C:/bin/notebooklm')
    def test_load_bridge_config_requires_integer_timeout(self, _which: object) -> None:
        with self.assertRaises(BridgeError) as ctx:
            load_bridge_config(
                {
                    'NOTEBOOKLM_NOTEBOOK_ID': 'nb-123',
                    'NOTEBOOKLM_STORAGE_STATE_PATH': str(self.storage_state),
                    'NOTEBOOKLM_BRIDGE_API_KEY': 'secret',
                    'NOTEBOOKLM_TIMEOUT_MS': 'abc',
                }
            )

        self.assertEqual(ctx.exception.code, 'invalid_timeout')

    @patch('services.notebooklm_bridge.bridge.shutil.which', return_value='C:/bin/notebooklm')
    def test_load_bridge_config_parses_source_groups(self, _which: object) -> None:
        config = load_bridge_config(
            {
                'NOTEBOOKLM_STORAGE_STATE_PATH': str(self.storage_state),
                'NOTEBOOKLM_BRIDGE_API_KEY': 'secret',
                'NOTEBOOKLM_SOURCE_GROUPS_JSON': '{"coach:visian":["src-a","src-b","src-a"]}',
            }
        )

        self.assertEqual(config.source_groups, {'coach:visian': ('src-a', 'src-b')})

    def test_normalize_source_ids_dedupes_and_trims(self) -> None:
        self.assertEqual(
            normalize_source_ids([' src-a ', 'src-b', 'src-a', '', '  ']),
            ('src-a', 'src-b'),
        )

    def test_ask_rejects_invalid_api_key(self) -> None:
        bridge = NotebookLMBridge(self.config)

        with self.assertRaises(BridgeError) as ctx:
            bridge.ask('hello', 'wrong-key')

        self.assertEqual(ctx.exception.status_code, 401)
        self.assertEqual(ctx.exception.code, 'unauthorized')

    @patch.object(NotebookLMBridge, '_run_json_command')
    def test_ask_returns_answer_from_notebooklm_json(self, run_json_command: object) -> None:
        run_json_command.return_value = {'answer': 'Coach says hold econ'}
        bridge = NotebookLMBridge(self.config)

        result = bridge.ask('what now', 'secret-key', request_id='req-1', coach_id='visian')

        self.assertEqual(result.payload, {'answer': 'Coach says hold econ'})
        self.assertEqual(result.cache_status, 'miss')
        run_json_command.assert_called_once_with(
            build_notebooklm_ask_command(self.config, 'nb-123', 'what now'),
            request_id='req-1',
            coach_id='visian',
            notebook_id='nb-123',
            status_code_on_success=200,
        )

    @patch.object(NotebookLMBridge, '_run_json_command')
    def test_ask_uses_ttl_cache_for_identical_requests(self, run_json_command: object) -> None:
        run_json_command.return_value = {'answer': 'Coach says hold econ'}
        bridge = NotebookLMBridge(self.config)

        first = bridge.ask('what now', 'secret-key', request_id='req-1', coach_id='visian')
        second = bridge.ask('what now', 'secret-key', request_id='req-2', coach_id='visian')

        self.assertEqual(first.payload, {'answer': 'Coach says hold econ'})
        self.assertEqual(first.cache_status, 'miss')
        self.assertEqual(second.payload, {'answer': 'Coach says hold econ'})
        self.assertEqual(second.cache_status, 'hit')
        run_json_command.assert_called_once()

    @patch.object(NotebookLMBridge, '_run_json_command')
    def test_ask_cache_key_includes_coach_id(self, run_json_command: object) -> None:
        run_json_command.return_value = {'answer': 'Coach says hold econ'}
        bridge = NotebookLMBridge(self.config)

        bridge.ask('what now', 'secret-key', request_id='req-1', coach_id='visian')
        bridge.ask('what now', 'secret-key', request_id='req-2', coach_id='buffalow')

        self.assertEqual(run_json_command.call_count, 2)

    @patch.object(NotebookLMBridge, '_run_json_command')
    def test_ask_cache_key_includes_source_selection(self, run_json_command: object) -> None:
        run_json_command.return_value = {'answer': 'Coach says hold econ'}
        bridge = NotebookLMBridge(self.config)

        bridge.ask('what now', 'secret-key', request_id='req-1', coach_id='visian', source_ids=['src-a'])
        bridge.ask('what now', 'secret-key', request_id='req-2', coach_id='visian', source_ids=['src-b'])

        self.assertEqual(run_json_command.call_count, 2)

    @patch.object(NotebookLMBridge, '_run_json_command')
    def test_ask_resolves_source_groups_into_command(self, run_json_command: object) -> None:
        run_json_command.return_value = {'answer': 'Coach says hold econ'}
        bridge = NotebookLMBridge(
            BridgeConfig(
                notebook_id='nb-123',
                storage_state_path=self.storage_state,
                api_key='secret-key',
                timeout_ms=4567,
                command='notebooklm',
                source_groups={'coach:visian': ('src-a', 'src-b')},
            )
        )

        bridge.ask(
            'what now',
            'secret-key',
            request_id='req-1',
            coach_id='visian',
            source_groups=['coach:visian'],
        )

        run_json_command.assert_called_once_with(
            build_notebooklm_ask_command(self.config, 'nb-123', 'what now', source_ids=('src-a', 'src-b')),
            request_id='req-1',
            coach_id='visian',
            notebook_id='nb-123',
            status_code_on_success=200,
        )

    @patch.object(NotebookLMBridge, '_run_json_command')
    def test_ask_uses_canonical_cache_context_for_coach_select(self, run_json_command: object) -> None:
        run_json_command.return_value = {'answer': 'Coach says hold econ'}
        bridge = NotebookLMBridge(self.config)

        first = bridge.ask(
            'giup toi chon augment',
            'secret-key',
            request_id='req-1',
            coach_id='visian',
            request_mode='coach_select',
            cache_context='stage=3-2|decision=augment|options=hedge fund,component grab bag',
        )
        second = bridge.ask(
            'phan tich 3 augment nay',
            'secret-key',
            request_id='req-2',
            coach_id='visian',
            request_mode='coach_select',
            cache_context='stage=3-2|decision=augment|options=hedge fund,component grab bag',
        )

        self.assertEqual(first.cache_status, 'miss')
        self.assertEqual(second.cache_status, 'hit')
        run_json_command.assert_called_once()

    @patch.object(NotebookLMBridge, '_run_json_command')
    def test_ask_uses_different_cache_keys_for_different_canonical_contexts(self, run_json_command: object) -> None:
        run_json_command.return_value = {'answer': 'Coach says hold econ'}
        bridge = NotebookLMBridge(self.config)

        bridge.ask(
            'giup toi chon augment',
            'secret-key',
            request_id='req-1',
            coach_id='visian',
            request_mode='coach_select',
            cache_context='stage=3-2|decision=augment|options=hedge fund,component grab bag',
        )
        bridge.ask(
            'giup toi chon augment',
            'secret-key',
            request_id='req-2',
            coach_id='visian',
            request_mode='coach_select',
            cache_context='stage=3-2|decision=augment|options=jeweled lotus,component grab bag',
        )

        self.assertEqual(run_json_command.call_count, 2)

    @patch.object(NotebookLMBridge, '_run_json_command')
    def test_ask_uses_canonical_cache_context_for_coach_select_stream(self, run_json_command: object) -> None:
        run_json_command.return_value = {'answer': 'Tai sao: Tempo quan trong hon econ'}
        bridge = NotebookLMBridge(self.config)

        first = bridge.ask(
            'giai thich vi sao pro chon augment nay',
            'secret-key',
            request_id='req-1',
            coach_id='visian',
            request_mode='coach_select_stream',
            cache_context='stage=3-2|decision=augment|options=hedge fund,component grab bag|pro_choice=component grab bag',
        )
        second = bridge.ask(
            'phan tich ly do pick nay',
            'secret-key',
            request_id='req-2',
            coach_id='visian',
            request_mode='coach_select_stream',
            cache_context='stage=3-2|decision=augment|options=hedge fund,component grab bag|pro_choice=component grab bag',
        )

        self.assertEqual(first.cache_status, 'miss')
        self.assertEqual(second.cache_status, 'hit')
        run_json_command.assert_called_once()

    @patch.object(NotebookLMBridge, '_run_json_command')
    def test_ask_separates_select_and_stream_cache_namespaces(self, run_json_command: object) -> None:
        run_json_command.side_effect = [
            {'answer': 'Pick: Hedge Fund\nTai sao: Can econ.'},
            {'answer': 'Tai sao: Vi spot nay can econ truoc.'},
        ]
        bridge = NotebookLMBridge(self.config)
        cache_context = 'stage=3-2|decision=augment|options=hedge fund,component grab bag|pro_choice=hedge fund'

        select_result = bridge.ask(
            'giup toi chon augment',
            'secret-key',
            request_id='req-1',
            coach_id='visian',
            request_mode='coach_select',
            cache_context=cache_context,
        )
        stream_result = bridge.ask(
            'giai thich vi sao pro chon augment nay',
            'secret-key',
            request_id='req-2',
            coach_id='visian',
            request_mode='coach_select_stream',
            cache_context=cache_context,
        )

        self.assertEqual(select_result.payload, {'answer': 'Pick: Hedge Fund\nTai sao: Can econ.'})
        self.assertEqual(stream_result.payload, {'answer': 'Tai sao: Vi spot nay can econ truoc.'})
        self.assertEqual(run_json_command.call_count, 2)

    @patch.object(NotebookLMBridge, '_run_json_command')
    @patch('services.notebooklm_bridge.bridge.time.monotonic')
    def test_ask_cache_ttl_is_180_seconds(self, monotonic_mock: object, run_json_command: object) -> None:
        run_json_command.return_value = {'answer': 'Coach says hold econ'}
        monotonic_mock.side_effect = [100.0, 100.0, 279.0, 281.0, 281.0]
        bridge = NotebookLMBridge(self.config)

        first = bridge.ask('what now', 'secret-key', request_id='req-1', coach_id='visian')
        within_ttl = bridge.ask('what now', 'secret-key', request_id='req-2', coach_id='visian')
        after_ttl = bridge.ask('what now', 'secret-key', request_id='req-3', coach_id='visian')

        self.assertEqual(CACHE_TTL_SECONDS, 180)
        self.assertEqual(first.cache_status, 'miss')
        self.assertEqual(within_ttl.cache_status, 'hit')
        self.assertEqual(after_ttl.cache_status, 'miss')
        self.assertEqual(run_json_command.call_count, 2)

    @patch.object(NotebookLMBridge, '_run_json_command')
    def test_ask_dedupes_inflight_duplicate_requests(self, run_json_command: object) -> None:
        entered = threading.Event()
        release = threading.Event()
        bridge = NotebookLMBridge(self.config)
        results: list[AskResult] = []
        errors: list[Exception] = []

        def fake_run(*args: object, **kwargs: object) -> dict[str, str]:
            entered.set()
            self.assertTrue(release.wait(timeout=1))
            return {'answer': 'Coach says hold econ'}

        def worker(request_id: str) -> None:
            try:
                results.append(bridge.ask('what now', 'secret-key', request_id=request_id, coach_id='visian'))
            except Exception as exc:  # pragma: no cover - assertion helper
                errors.append(exc)

        run_json_command.side_effect = fake_run

        first = threading.Thread(target=worker, args=('req-1',))
        second = threading.Thread(target=worker, args=('req-2',))
        first.start()
        self.assertTrue(entered.wait(timeout=1))
        second.start()
        time.sleep(0.05)
        release.set()
        first.join(timeout=1)
        second.join(timeout=1)

        self.assertFalse(errors)
        self.assertEqual([result.payload for result in results], [{'answer': 'Coach says hold econ'}, {'answer': 'Coach says hold econ'}])
        self.assertEqual([result.cache_status for result in results], ['miss', 'hit'])
        run_json_command.assert_called_once()

    @patch.object(NotebookLMBridge, '_run_json_command')
    def test_healthcheck_requires_visible_notebook(self, run_json_command: object) -> None:
        run_json_command.return_value = {'notebooks': [{'id': 'nb-other'}]}
        bridge = NotebookLMBridge(self.config)

        with self.assertRaises(BridgeError) as ctx:
            bridge.healthcheck()

        self.assertEqual(ctx.exception.code, 'missing_notebook')

    @patch.object(NotebookLMBridge, '_run_json_command')
    def test_ask_requires_notebook_id_when_no_default_is_configured(self, run_json_command: object) -> None:
        bridge = NotebookLMBridge(
            BridgeConfig(
                notebook_id=None,
                storage_state_path=self.storage_state,
                api_key='secret-key',
                timeout_ms=4567,
                command='notebooklm',
            )
        )

        with self.assertRaises(BridgeError) as ctx:
            bridge.ask('what now', 'secret-key')

        self.assertEqual(ctx.exception.code, 'missing_notebook_id')

    @patch('services.notebooklm_bridge.bridge.subprocess.run')
    def test_run_json_command_maps_non_zero_exit(self, run_subprocess: object) -> None:
        run_subprocess.return_value.returncode = 1
        run_subprocess.return_value.stdout = ''
        run_subprocess.return_value.stderr = 'boom'
        bridge = NotebookLMBridge(self.config)

        with self.assertRaises(BridgeError) as ctx:
            bridge._run_json_command(['notebooklm'])

        self.assertEqual(ctx.exception.code, 'cli_failed')
        self.assertEqual(ctx.exception.status_code, 502)

    @patch(
        'services.notebooklm_bridge.bridge.subprocess.run',
        side_effect=subprocess.TimeoutExpired(cmd=['notebooklm'], timeout=4.567),
    )
    def test_timeout_path_returns_bridge_timeout(self, _run_subprocess: object) -> None:
        bridge = NotebookLMBridge(self.config)

        with self.assertRaises(BridgeError) as ctx:
            bridge._run_json_command(['notebooklm'])

        self.assertEqual(ctx.exception.code, 'timeout')
        self.assertEqual(ctx.exception.status_code, 504)

    @patch('services.notebooklm_bridge.bridge.subprocess.Popen')
    def test_stream_ask_yields_status_chunk_and_complete(self, popen_mock: object) -> None:
        process = Mock()
        process.stdout = StringIO('Tai sao: Tempo [1] quan trong hon econ.')
        process.stderr = StringIO('')
        process.poll.side_effect = [None, 0, 0]
        process.returncode = 0
        process.wait.return_value = 0
        popen_mock.return_value = process

        bridge = NotebookLMBridge(self.config)
        events = list(bridge.stream_ask('what now', 'secret-key', request_id='req-1', coach_id='visian'))

        self.assertEqual(events[0].event, 'status')
        self.assertEqual(events[0].data, {'phase': 'started'})
        self.assertEqual(events[1].event, 'chunk')
        self.assertIn('Tempo', events[1].data['text'])
        self.assertEqual(events[-1].event, 'complete')
        self.assertEqual(events[-1].data['answer'], 'Tai sao: Tempo quan trong hon econ.')


if __name__ == '__main__':
    unittest.main()
