# NotebookLM CLI Bridge

Hosted HTTP bridge that shells out to the real `notebooklm` CLI with a fixed notebook.

## Runtime contract

Required environment variables:

- `NOTEBOOKLM_STORAGE_STATE_PATH`
- `NOTEBOOKLM_BRIDGE_API_KEY`

Optional:

- `NOTEBOOKLM_NOTEBOOK_ID` (default notebook if request does not send `notebook_id`)
- `NOTEBOOKLM_TIMEOUT_MS` (default `90000`)
- `NOTEBOOKLM_SOURCE_GROUPS_JSON` (optional JSON map of source-group key -> source ID array)
- `GUNICORN_WORKERS` (default `1`)
- `GUNICORN_THREADS` (default `2`)
- `GUNICORN_TIMEOUT` (default `110`)
- `GUNICORN_GRACEFUL_TIMEOUT` (default `20`)
- `GUNICORN_KEEP_ALIVE` (default `5`)
- `GUNICORN_MAX_REQUESTS` (default `200`)
- `GUNICORN_MAX_REQUESTS_JITTER` (default `20`)
- `NOTEBOOKLM_COMMAND` (default `notebooklm`)
- `PORT` (default `8080`)

## API

- `GET /live`
  - lightweight liveness check for Gunicorn/Flask only
- `GET /health`
  - verifies config, storage state, CLI availability, and notebook visibility
- `POST /ask`
  - request body: `{ "query": "...", "api_key": "...", "notebook_id": "optional-notebook-id", "coach_id": "optional-coach-id", "source_ids": ["optional-src"], "source_groups": ["optional-group-key"] }`
  - response body: `{ "answer": "..." }`
  - if caller sends `x-request-id`, the bridge echoes it back in the response header for log correlation
- `POST /ask-stream`
  - request body: same as `POST /ask`
  - response body: SSE stream with `status`, `chunk`, `complete`, and `error` events

## Local run

```powershell
cd services/notebooklm_bridge
python -m pip install -r requirements.txt
$env:NOTEBOOKLM_STORAGE_STATE_PATH="D:\\path\\to\\storage_state.json"
$env:NOTEBOOKLM_BRIDGE_API_KEY="<shared-secret>"
python app.py
```

## Container deployment

Mount `storage_state.json` into the container, then set:

- `NOTEBOOKLM_NOTEBOOK_ID`
- `NOTEBOOKLM_STORAGE_STATE_PATH`
- `NOTEBOOKLM_BRIDGE_API_KEY`

Example mount target:

- `/app/secrets/storage_state.json`

Set:

- `NOTEBOOKLM_STORAGE_STATE_PATH=/app/secrets/storage_state.json`

## Docker Compose on EC2

This repo now includes a ready-to-run compose file:

- `services/notebooklm_bridge/docker-compose.yml`

Recommended folder layout on the server:

```text
~/notebooklm-bridge/
  Dockerfile
  app.py
  bridge.py
  requirements.txt
  docker-compose.yml
  .env
  secrets/
    storage_state.json
```

Quick start:

```bash
cd ~/notebooklm-bridge
cp .env.example .env
mkdir -p secrets
# copy storage_state.json into ./secrets/storage_state.json
docker compose up -d --build
docker compose ps
docker compose logs -f
```

The compose file:

- builds the image locally, so you do not need a placeholder `image: <YOUR_IMAGE>`
- mounts `./secrets/storage_state.json` to `/app/secrets/storage_state.json`
- binds only `127.0.0.1:8080:8080`
- restarts automatically with `unless-stopped`
- uses a Python-based healthcheck instead of `curl`

Example `.env`:

```env
NOTEBOOKLM_BRIDGE_API_KEY=replace-with-a-strong-secret
NOTEBOOKLM_TIMEOUT_MS=90000
NOTEBOOKLM_SOURCE_GROUPS_JSON={"coach:visian:decision:augment":["src_001","src_002"]}
GUNICORN_WORKERS=1
GUNICORN_THREADS=2
GUNICORN_TIMEOUT=110
GUNICORN_GRACEFUL_TIMEOUT=20
GUNICORN_KEEP_ALIVE=5
GUNICORN_MAX_REQUESTS=200
GUNICORN_MAX_REQUESTS_JITTER=20
```

Quick checks on the server:

```bash
curl http://127.0.0.1:8080/live
curl http://127.0.0.1:8080/health
```

### Files included for EC2 ops

- `deploy/ec2/bootstrap.sh`
- `deploy/ec2/notebooklm-bridge-deep-health.sh`
- `deploy/ec2/nginx/notebooklm-bridge.conf`
- `deploy/ec2/systemd/notebooklm-bridge-deep-health.service`
- `deploy/ec2/systemd/notebooklm-bridge-deep-health.timer`
- `deploy/ec2/sync-to-ec2.ps1`

### Sync from your Windows machine to EC2

From repo root on your local machine:

```powershell
powershell -ExecutionPolicy Bypass -File .\services\notebooklm_bridge\deploy\ec2\sync-to-ec2.ps1 -RemoteHost <EC2_PUBLIC_IP_OR_DNS> -KeyPath <PATH_TO_PEM> -User ubuntu
```

This uploads:

- app source
- Dockerfile
- compose file
- `.env.example`
- EC2 bootstrap script
- deep-health helper script
- Nginx config sample
- systemd timer sample for 5-minute deep health checks

Then on EC2:

```bash
cd ~/notebooklm-bridge
cp .env.example .env
mkdir -p secrets
# copy storage_state.json into ./secrets/storage_state.json
./deploy/ec2/bootstrap.sh
```

### Nginx reverse proxy on EC2

1. Copy the sample config:

```bash
sudo cp ~/notebooklm-bridge/deploy/ec2/nginx/notebooklm-bridge.conf /etc/nginx/sites-available/notebooklm-bridge.conf
```

2. Edit `server_name` to your real domain or subdomain.

3. Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/notebooklm-bridge.conf /etc/nginx/sites-enabled/notebooklm-bridge.conf
sudo nginx -t
sudo systemctl reload nginx
```

4. If you want HTTPS with Certbot later:

```bash
sudo certbot --nginx -d <YOUR_DOMAIN>
```

### Optional deep-health timer on EC2

If you want the deep NotebookLM check every 5 minutes without putting it in Docker Compose healthcheck:

```bash
mkdir -p ~/.config/systemd/user
cp ~/notebooklm-bridge/deploy/ec2/systemd/notebooklm-bridge-deep-health.service ~/.config/systemd/user/
cp ~/notebooklm-bridge/deploy/ec2/systemd/notebooklm-bridge-deep-health.timer ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now notebooklm-bridge-deep-health.timer
systemctl --user list-timers | grep notebooklm-bridge-deep-health
```

## Notes

- The bridge strips `PYTHONHOME`, `PYTHONPATH`, `VIRTUAL_ENV`, and `__PYVENV_LAUNCHER__` before spawning the CLI.
- The bridge forces UTF-8 subprocess output with `PYTHONIOENCODING=utf-8` and `PYTHONUTF8=1`.
- Docker Compose healthcheck should hit `/live`, not `/health`, so the container does not run `notebooklm list --json` every minute.
- The bridge keeps a per-worker 180-second in-memory cache plus in-flight dedupe for exact identical requests to cut duplicate subprocess work on low-concurrency EC2 setups.
- Source sharding works best when callers send `source_groups` that resolve to narrow `-s/--source` lists instead of querying the full notebook every time.
- The CLI help currently exposes source scoping (`-s`) but no dedicated stream flag, so `/ask-stream` is built from text-mode subprocess stdout rather than `--json`.
