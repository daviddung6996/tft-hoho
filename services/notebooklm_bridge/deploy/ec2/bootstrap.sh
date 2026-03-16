#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/notebooklm-bridge}"

echo "Using app dir: $APP_DIR"
cd "$APP_DIR"

mkdir -p secrets

if [[ ! -f ".env" ]]; then
  cp .env.example .env
  echo "Created $APP_DIR/.env from .env.example"
  echo "Edit .env before starting the bridge."
fi

if [[ ! -f "secrets/storage_state.json" ]]; then
  echo "Missing $APP_DIR/secrets/storage_state.json"
  echo "Copy your NotebookLM storage state file there first."
  exit 1
fi

docker compose up -d --build
docker compose ps

echo
echo "Waiting for bridge live check..."
for attempt in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:8080/live; then
    echo
    echo "Bridge process is live."
    break
  fi
  sleep 2
done

if ! curl -fsS http://127.0.0.1:8080/live >/dev/null; then
  echo "Bridge did not become live in time. Recent logs:"
  docker compose logs --tail=100
  exit 1
fi

echo
echo "Running one deep health check..."
if curl -fsS http://127.0.0.1:8080/health; then
  echo
  echo "Deep health check passed."
else
  echo
  echo "Deep health check failed. The service is up, but NotebookLM auth/notebook visibility still needs attention."
fi

echo
echo "Optional next step: install the 5-minute deep-health timer from deploy/ec2/systemd/."
