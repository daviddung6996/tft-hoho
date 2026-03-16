# NotebookLM Bridge Context Export

Generated from the current working tree on 2026-03-12.

## 1. Current architecture in this repo

- Public app entrypoint stays the same: frontend still calls `supabase.functions.invoke('visian-chat')`.
- `visian-chat` is now a thin Supabase Edge Function adapter.
- The actual NotebookLM call is handled by a separate hosted Python bridge service under `services/notebooklm_bridge/`.
- The bridge shells out to the real `notebooklm` CLI. It does not use a fake local fallback and it does not use the old tunnel/proxy pattern.

Relevant files:

- `supabase/functions/visian-chat/index.ts`
- `services/notebooklm_bridge/bridge.py`
- `services/notebooklm_bridge/app.py`
- `services/notebooklm_bridge/Dockerfile`
- `services/notebooklm_bridge/tests/test_bridge.py`

## 2. NotebookLM transport contract

### 2.1 Edge Function contract

`visian-chat` expects these Supabase secrets:

- `NOTEBOOKLM_BRIDGE_URL`
- `NOTEBOOKLM_BRIDGE_API_KEY`

Behavior:

- If both secrets exist, the function builds the coach persona prompt and POSTs to `POST <NOTEBOOKLM_BRIDGE_URL>/ask`.
- If either secret is missing, the function returns a JSON error with `detail` and `missingEnv[]`.
- If the bridge errors, the function forwards a structured backend error instead of fabricating a fallback coach answer.

### 2.2 Bridge HTTP contract

The hosted bridge exposes:

- `GET /health`
- `POST /ask`

`POST /ask` request body:

```json
{
  "query": "prompt text",
  "api_key": "shared-secret"
}
```

Success response:

```json
{
  "answer": "NotebookLM answer text"
}
```

Failure response shape:

```json
{
  "error": "Human-readable error",
  "code": "machine_code",
  "detail": "More context",
  "missingEnv": ["OPTIONAL_IF_RELEVANT"]
}
```

## 3. Exact NotebookLM CLI behavior

The bridge mirrors the subprocess style you described from the other project.

Command used for asks:

```text
notebooklm --storage <STORAGE_STATE_PATH> ask --new -n <NOTEBOOK_ID> --json "<prompt>"
```

Health check command:

```text
notebooklm --storage <STORAGE_STATE_PATH> list --json
```

Subprocess hygiene:

- remove `PYTHONHOME`
- remove `PYTHONPATH`
- remove `VIRTUAL_ENV`
- remove `__PYVENV_LAUNCHER__`
- force `PYTHONIOENCODING=utf-8`
- force `PYTHONUTF8=1`

This is implemented in `services/notebooklm_bridge/bridge.py`.

## 4. Required bridge runtime config

Required environment variables for the bridge:

- `NOTEBOOKLM_NOTEBOOK_ID`
- `NOTEBOOKLM_STORAGE_STATE_PATH`
- `NOTEBOOKLM_BRIDGE_API_KEY`

Optional:

- `NOTEBOOKLM_TIMEOUT_MS`
- `NOTEBOOKLM_COMMAND`
- `PORT`

Runtime assumptions:

- The bridge uses a fixed notebook only.
- The bridge assumes `storage_state.json` already contains a valid logged-in NotebookLM session.
- The bridge returns real NotebookLM output only. No local fallback generation exists.

## 5. What was rolled back

Removed from the old temporary approach:

- local proxy script `scripts/notebooklm_proxy_server.mjs`
- local tunnel/proxy dependency model
- remote Supabase secrets `VISIAN_PROXY_URL` and `VISIAN_API_KEY`

Important result:

- Supabase no longer depends on a dev machine tunnel.
- `Coach Select` no longer shows fake `Pick / Why / When not / Backup` content when the backend is broken.

## 6. Local smoke test that already worked

Verified on 2026-03-12:

- `GET /health` returned `200`
- `POST /ask` returned `200`
- the bridge returned a real answer from NotebookLM using the local logged-in CLI session

That proves the bridge code path itself is valid.

## 7. Deployment options

## 7.1 Best production path on AWS

### Option A: AWS App Runner

Best when:

- you want managed container hosting
- you want easy HTTPS and autoscaling
- you are okay with a paid service

Why it fits:

- App Runner can run a ready-made container image from ECR or ECR Public.
- App Runner supports runtime environment variables and can reference secrets from AWS Secrets Manager / SSM as env vars.

Important caveat:

- This bridge currently expects `NOTEBOOKLM_STORAGE_STATE_PATH` to point to a real file.
- App Runner is great for env vars, but this repo does not yet include a startup bootstrap script that writes `storage_state.json` from an env secret before launching Gunicorn.
- So App Runner is good, but for the current codebase you should either:
  - add one small entrypoint/bootstrap patch later, or
  - use ECS/Fargate if you want truer file-mount semantics immediately.

Suggested AWS production decision:

- If you want the fastest managed deployment and you accept one more small bootstrap patch: choose App Runner.
- If you want strict file-based runtime semantics with less adaptation: choose ECS/Fargate.

### Option B: AWS ECS Fargate + EFS

Best when:

- you want AWS production hosting
- you want file mounting to match the current bridge contract closely
- you are okay with a bit more infra setup

Why it fits:

- ECS tasks can use secrets as runtime values.
- ECS/Fargate supports mounting Amazon EFS volumes.
- AWS docs explicitly cover EFS volumes with ECS/Fargate.

This path matches the current `NOTEBOOKLM_STORAGE_STATE_PATH` file-based design better than App Runner.

## 7.2 Best free or near-free path

### Option C: Render Free

Best when:

- you want the easiest free smoke-test deployment
- this is dev/test, not serious production

Why it fits:

- Render still documents free web services.
- Render supports Dockerfile-based deploys.
- Render supports overriding the Docker command with `/bin/sh -c ...`.

Important limitations from Render docs:

- free services can spin down
- free services can restart at any time
- free services do not support persistent disks
- free services are explicitly not for production

Practical implication:

- Render Free is good for validating that the bridge boots publicly and can answer requests.
- For the current repo, because there is no persistent disk on free tier, the practical way is to store `storage_state.json` as a secret, base64-encode it, and write it to a file in a custom Docker command before starting Gunicorn.

### Option D: Koyeb Free / low-cost

Best when:

- you want another easy container host with Docker support
- you want a hobby deploy with lighter ops than AWS

Why it fits:

- Koyeb supports deploy from Docker images and Dockerfile workflows.
- Koyeb allows overriding Docker entrypoint / command.
- Koyeb pricing still includes free usage / free capacity according to current docs and pricing pages.

Practical implication:

- Like Render, Koyeb is a good place to host this bridge if you use a startup command or entrypoint wrapper that materializes `storage_state.json` from a secret into a file.

### Not recommended if your goal is "free"

- Fly.io is no longer a strong free recommendation for new users. Current pricing pages emphasize pay-as-you-go, and the free allowances shown in docs are legacy allowances for older plans.

## 8. Recommended deploy strategy

### Recommendation by phase

If you want the fastest cheap public test:

- use Render Free first

If you want the cleanest AWS production path without changing bridge semantics much:

- use ECS/Fargate + EFS

If you want the cleanest managed AWS UX and are okay with one small future bootstrap patch:

- use App Runner

## 9. Minimal AWS App Runner playbook

This is the shortest practical AWS path if you accept that `storage_state.json` should be bootstrapped into a file at startup.

### 9.1 Build and push image

From repo root:

```powershell
docker build -t notebooklm-bridge:latest .\services\notebooklm_bridge
```

Then tag and push to ECR:

```powershell
aws ecr create-repository --repository-name notebooklm-bridge
aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com
docker tag notebooklm-bridge:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/notebooklm-bridge:latest
docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/notebooklm-bridge:latest
```

### 9.2 Create service

- Create an App Runner service from the ECR image.
- Set port `8080`.
- Set env vars:
  - `NOTEBOOKLM_NOTEBOOK_ID`
  - `NOTEBOOKLM_BRIDGE_API_KEY`
  - `NOTEBOOKLM_TIMEOUT_MS`
- Store secrets in AWS Secrets Manager where possible.

### 9.3 Storage state problem

Current repo expects:

```text
NOTEBOOKLM_STORAGE_STATE_PATH=/app/secrets/storage_state.json
```

To make App Runner work cleanly, the next small ops patch is:

- store the base64 form of `storage_state.json` as a secret
- use an entrypoint/startup wrapper to decode it into `/app/secrets/storage_state.json`
- then launch `gunicorn`

Without that bootstrap, App Runner has env vars but not the file this bridge expects.

## 10. Minimal Render Free playbook

Best for quick public validation, not production.

### 10.1 Create service

- Connect the repo to Render.
- Create a Web Service.
- Choose Docker runtime.
- Set Dockerfile path:

```text
services/notebooklm_bridge/Dockerfile
```

- Set root directory:

```text
services/notebooklm_bridge
```

### 10.2 Configure env vars

Set:

- `NOTEBOOKLM_NOTEBOOK_ID`
- `NOTEBOOKLM_BRIDGE_API_KEY`
- `NOTEBOOKLM_TIMEOUT_MS`
- `NOTEBOOKLM_STORAGE_STATE_JSON_B64` as a secret that contains base64 of your `storage_state.json`

### 10.3 Override Docker command

Because the current bridge expects a file path, use a custom Docker command that:

- creates `/app/secrets/storage_state.json`
- decodes `NOTEBOOKLM_STORAGE_STATE_JSON_B64`
- exports `NOTEBOOKLM_STORAGE_STATE_PATH=/app/secrets/storage_state.json`
- starts `gunicorn`

Example shape:

```sh
/bin/sh -c 'mkdir -p /app/secrets && python -c "import os,base64,pathlib; pathlib.Path(\"/app/secrets/storage_state.json\").write_bytes(base64.b64decode(os.environ[\"NOTEBOOKLM_STORAGE_STATE_JSON_B64\"]))" && export NOTEBOOKLM_STORAGE_STATE_PATH=/app/secrets/storage_state.json && gunicorn --bind 0.0.0.0:${PORT:-8080} app:app'
```

If you prefer less UI-level shell escaping, add a tiny entrypoint script to the image later.

## 11. Minimal Koyeb playbook

Same idea as Render:

- deploy from Dockerfile or a pushed image
- set `NOTEBOOKLM_NOTEBOOK_ID`
- set `NOTEBOOKLM_BRIDGE_API_KEY`
- set `NOTEBOOKLM_STORAGE_STATE_JSON_B64`
- override entrypoint or command to materialize the file before starting Gunicorn

Koyeb docs explicitly support overriding Docker entrypoint / command.

## 12. Supabase side after bridge is live

Once the bridge is reachable on a public URL, set Supabase secrets:

```powershell
supabase secrets set NOTEBOOKLM_BRIDGE_URL="https://<your-bridge-host>" NOTEBOOKLM_BRIDGE_API_KEY="<shared-secret>"
supabase functions deploy visian-chat
```

Then test:

- `GET https://<bridge-host>/health`
- `POST https://<bridge-host>/ask`
- frontend `Coach Select`

## 13. What I would choose

If the goal is:

- fastest free proof-of-concept: Render Free
- real AWS production: ECS/Fargate + EFS
- managed AWS with minimal ops and one small future bootstrap patch: App Runner

## 14. Exact source references

AWS:

- [AWS App Runner service from container image](https://docs.aws.amazon.com/apprunner/latest/dg/service-source-image.html)
- [Creating an App Runner service](https://docs.aws.amazon.com/apprunner/latest/dg/manage-create.html)
- [AWS App Runner env vars and Secrets Manager / SSM references](https://docs.aws.amazon.com/apprunner/latest/dg/env-variable.html)
- [AWS App Runner pricing](https://aws.amazon.com/apprunner/pricing/)
- [Use Amazon EFS volumes with Amazon ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/efs-volumes.html)

Render:

- [Render free web services](https://render.com/docs/free)
- [Docker on Render](https://render.com/docs/docker)
- [Deploy a prebuilt Docker image on Render](https://render.com/docs/deploying-an-image)

Koyeb:

- [Koyeb quick start](https://www.koyeb.com/docs/deploy)
- [Koyeb pre-built Docker images](https://www.koyeb.com/docs/build-and-deploy/prebuilt-docker-images)
- [Koyeb pricing](https://www.koyeb.com/pricing)

Fly.io:

- [Fly.io pricing](https://fly.io/pricing/)
