type LocalVisianChatRequestReceivedLog = {
  requestId: string;
  coachId: string;
  decisionType?: string;
  mode?: string;
};

type LocalVisianChatResponseReadyLog = {
  requestId: string;
  coachId: string;
  decisionType?: string;
  mode?: string;
  notebookId?: string;
  bridgeFetchMs?: number;
  totalMs: number;
  status: number;
};

export function logLocalVisianChatRequestReceived({
  requestId,
  coachId,
  decisionType,
  mode,
}: LocalVisianChatRequestReceivedLog): void {
  console.info('local visian-chat request received', {
    request_id: requestId,
    coach_id: coachId,
    decision_type: decisionType,
    mode,
  });
}

export function logLocalVisianChatResponseReady({
  requestId,
  coachId,
  decisionType,
  mode,
  notebookId,
  bridgeFetchMs,
  totalMs,
  status,
}: LocalVisianChatResponseReadyLog): void {
  console.info('local visian-chat response ready', {
    request_id: requestId,
    coach_id: coachId,
    decision_type: decisionType,
    mode,
    notebook_id: notebookId,
    bridge_fetch_ms: bridgeFetchMs,
    total_ms: totalMs,
    status,
  });
}
