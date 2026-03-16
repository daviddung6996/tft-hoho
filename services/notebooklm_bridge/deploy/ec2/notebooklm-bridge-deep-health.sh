#!/usr/bin/env bash
set -euo pipefail

HEALTH_URL="${NOTEBOOKLM_BRIDGE_HEALTH_URL:-http://127.0.0.1:8080/health}"
TIMEOUT_SECONDS="${NOTEBOOKLM_BRIDGE_HEALTH_TIMEOUT_SECONDS:-10}"

if curl -fsS --max-time "$TIMEOUT_SECONDS" "$HEALTH_URL" >/dev/null; then
  logger -t notebooklm-bridge-deep-health "deep health ok url=$HEALTH_URL"
  exit 0
fi

logger -t notebooklm-bridge-deep-health "deep health failed url=$HEALTH_URL"
exit 1
