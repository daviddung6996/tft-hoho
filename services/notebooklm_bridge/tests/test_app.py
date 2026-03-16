from __future__ import annotations

import unittest
from unittest.mock import Mock, patch

from services.notebooklm_bridge import app as bridge_app


class NotebookLMBridgeAppTests(unittest.TestCase):
    def setUp(self) -> None:
        bridge_app._cached_bridge = None
        self.client = bridge_app.app.test_client()

    def tearDown(self) -> None:
        bridge_app._cached_bridge = None

    @patch('services.notebooklm_bridge.app.NotebookLMBridge')
    @patch('services.notebooklm_bridge.app.load_bridge_config')
    def test_get_bridge_reuses_singleton(self, load_bridge_config: object, bridge_ctor: object) -> None:
        load_bridge_config.return_value = object()
        sentinel_bridge = object()
        bridge_ctor.return_value = sentinel_bridge

        first = bridge_app.get_bridge()
        second = bridge_app.get_bridge()

        self.assertIs(first, sentinel_bridge)
        self.assertIs(second, sentinel_bridge)
        load_bridge_config.assert_called_once()
        bridge_ctor.assert_called_once()

    @patch('services.notebooklm_bridge.app.get_bridge')
    def test_live_returns_request_id_header(self, get_bridge: object) -> None:
        mock_bridge = Mock()
        mock_bridge.livecheck.return_value = {'ok': True}
        get_bridge.return_value = mock_bridge

        response = self.client.get('/live', headers={'x-request-id': 'req-live'})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get('x-request-id'), 'req-live')
        mock_bridge.livecheck.assert_called_once_with(request_id='req-live')

    @patch('services.notebooklm_bridge.app.get_bridge')
    def test_ask_echoes_request_id_and_forwards_coach_id(self, get_bridge: object) -> None:
        mock_bridge = Mock()
        mock_bridge.ask.return_value = bridge_app.AskResult(
            payload={'answer': 'Coach says hold econ'},
            cache_status='hit',
            total_ms=123.45,
        )
        get_bridge.return_value = mock_bridge

        response = self.client.post(
            '/ask',
            headers={'x-request-id': 'req-ask'},
            json={
                'query': 'what now',
                'api_key': 'secret-key',
                'notebook_id': 'nb-123',
                'coach_id': 'visian',
                'request_mode': 'coach_select',
                'cache_context': 'stage=2-1|decision=augment|options=a,b,c',
                'source_ids': ['src-a'],
                'source_groups': ['coach:visian'],
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get('x-request-id'), 'req-ask')
        self.assertEqual(response.headers.get('x-bridge-cache'), 'hit')
        self.assertEqual(response.headers.get('x-bridge-total-ms'), '123.45')
        mock_bridge.ask.assert_called_once_with(
            'what now',
            'secret-key',
            'nb-123',
            request_id='req-ask',
            coach_id='visian',
            request_mode='coach_select',
            cache_context='stage=2-1|decision=augment|options=a,b,c',
            source_ids=['src-a'],
            source_groups=['coach:visian'],
        )

    @patch('services.notebooklm_bridge.app.get_bridge')
    def test_ask_stream_returns_sse_and_forwards_source_hints(self, get_bridge: object) -> None:
        mock_bridge = Mock()
        mock_bridge.stream_ask.return_value = iter([
            bridge_app.StreamEvent(event='status', data={'phase': 'started'}),
            bridge_app.StreamEvent(event='chunk', data={'text': 'Tempo first'}),
            bridge_app.StreamEvent(event='complete', data={'answer': 'Tempo first.', 'total_ms': 12.3}),
        ])
        get_bridge.return_value = mock_bridge

        response = self.client.post(
            '/ask-stream',
            headers={'x-request-id': 'req-stream'},
            json={
                'query': 'what now',
                'api_key': 'secret-key',
                'notebook_id': 'nb-123',
                'coach_id': 'visian',
                'source_groups': ['coach:visian'],
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get('x-request-id'), 'req-stream')
        self.assertEqual(response.headers.get('Content-Type'), 'text/event-stream; charset=utf-8')
        self.assertIn('event: status', response.get_data(as_text=True))
        self.assertIn('event: complete', response.get_data(as_text=True))
        mock_bridge.stream_ask.assert_called_once_with(
            'what now',
            'secret-key',
            'nb-123',
            request_id='req-stream',
            coach_id='visian',
            source_ids=None,
            source_groups=['coach:visian'],
        )


if __name__ == '__main__':
    unittest.main()
