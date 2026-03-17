import { describe, expect, it, vi } from 'vitest';
import {
  logLocalVisianChatRequestReceived,
  logLocalVisianChatResponseReady,
} from './local_visian_chat_logging.ts';

describe('local visian-chat logging helpers', () => {
  it('logs immediately when request arrives', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    logLocalVisianChatRequestReceived({
      requestId: 'req-1',
      coachId: 'visian',
      decisionType: 'augment',
      mode: 'coach_select',
    });

    expect(infoSpy).toHaveBeenCalledWith('local visian-chat request received', {
      request_id: 'req-1',
      coach_id: 'visian',
      decision_type: 'augment',
      mode: 'coach_select',
    });
  });

  it('logs when response is ready with total response time', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    logLocalVisianChatResponseReady({
      requestId: 'req-1',
      coachId: 'buffalow',
      decisionType: 'path',
      mode: 'coach_select',
      notebookId: 'nb-1',
      bridgeFetchMs: 456.78,
      totalMs: 1234.56,
      status: 200,
    });

    expect(infoSpy).toHaveBeenCalledWith('local visian-chat response ready', {
      request_id: 'req-1',
      coach_id: 'buffalow',
      decision_type: 'path',
      mode: 'coach_select',
      notebook_id: 'nb-1',
      bridge_fetch_ms: 456.78,
      total_ms: 1234.56,
      status: 200,
    });
  });
});
