from __future__ import annotations

import json
import logging
import os
from uuid import uuid4

from flask import Flask, Response, jsonify, request, stream_with_context

try:
    from .bridge import AskResult, BridgeError, NotebookLMBridge, StreamEvent, load_bridge_config
except ImportError:
    from bridge import AskResult, BridgeError, NotebookLMBridge, StreamEvent, load_bridge_config

app = Flask(__name__)
logging.basicConfig(level=os.environ.get('NOTEBOOKLM_BRIDGE_LOG_LEVEL', 'INFO').upper())

_cached_bridge: NotebookLMBridge | None = None


def get_request_id() -> str:
    header_value = request.headers.get('x-request-id', '').strip()
    if header_value:
        return header_value
    return uuid4().hex


def build_json_response(
    payload: object,
    status_code: int,
    request_id: str,
    extra_headers: dict[str, str] | None = None,
):
    response = jsonify(payload)
    response.status_code = status_code
    response.headers['x-request-id'] = request_id
    for key, value in (extra_headers or {}).items():
        response.headers[key] = value
    return response


def get_bridge() -> NotebookLMBridge:
    global _cached_bridge
    if _cached_bridge is None:
        config = load_bridge_config(os.environ)
        _cached_bridge = NotebookLMBridge(config)
    return _cached_bridge


def format_sse_event(event: str, data: object) -> str:
    return f'event: {event}\ndata: {json.dumps(data, ensure_ascii=True)}\n\n'


@app.get('/health')
def health() -> tuple[object, int]:
    request_id = get_request_id()
    try:
        bridge = get_bridge()
        return build_json_response(bridge.healthcheck(request_id=request_id), 200, request_id)
    except BridgeError as err:
        return build_json_response(err.to_payload(), err.status_code, request_id)


@app.get('/live')
def live() -> tuple[object, int]:
    request_id = get_request_id()
    try:
        bridge = get_bridge()
        return build_json_response(bridge.livecheck(request_id=request_id), 200, request_id)
    except BridgeError as err:
        return build_json_response(err.to_payload(), err.status_code, request_id)


@app.post('/ask')
def ask() -> tuple[object, int]:
    request_id = get_request_id()
    try:
        payload = request.get_json(silent=True) or {}
        bridge = get_bridge()
        result: AskResult = bridge.ask(
            payload.get('query'),
            payload.get('api_key'),
            payload.get('notebook_id'),
            request_id=request_id,
            coach_id=payload.get('coach_id'),
            request_mode=payload.get('request_mode'),
            cache_context=payload.get('cache_context'),
            source_ids=payload.get('source_ids'),
            source_groups=payload.get('source_groups'),
        )
        return build_json_response(
            result.payload,
            200,
            request_id,
            extra_headers={
                'x-bridge-cache': result.cache_status,
                'x-bridge-total-ms': str(result.total_ms),
            },
        )
    except BridgeError as err:
        return build_json_response(err.to_payload(), err.status_code, request_id)


@app.post('/ask-stream')
def ask_stream() -> Response | tuple[object, int]:
    request_id = get_request_id()
    payload = request.get_json(silent=True) or {}

    try:
        bridge = get_bridge()
    except BridgeError as err:
        return build_json_response(err.to_payload(), err.status_code, request_id)

    def generate():
        try:
            for event in bridge.stream_ask(
                payload.get('query'),
                payload.get('api_key'),
                payload.get('notebook_id'),
                request_id=request_id,
                coach_id=payload.get('coach_id'),
                source_ids=payload.get('source_ids'),
                source_groups=payload.get('source_groups'),
            ):
                if isinstance(event, StreamEvent):
                    yield format_sse_event(event.event, event.data)
        except BridgeError as err:
            yield format_sse_event('error', err.to_payload())

    return Response(
        stream_with_context(generate()),
        status=200,
        headers={
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'x-request-id': request_id,
        },
    )


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '8080'))
    app.run(host='0.0.0.0', port=port)
