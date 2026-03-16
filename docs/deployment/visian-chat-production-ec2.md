# Visian Chat Production on EC2

Recommended production topology:

```text
Browser
  -> Supabase Edge Function (visian-chat)
  -> EC2 NotebookLM bridge
  -> notebooklm CLI
  -> NotebookLM
```

The local adapter in `scripts/local_visian_chat_server.ts` is for local development only. Do not ship a production frontend build with `VITE_VISIAN_CHAT_URL` pointing at `127.0.0.1` or `localhost`.

## 1. Local vs production env split

- Shared frontend env stays in `.env`.
- Local override for the adapter lives in `.env.local`.
- Production must leave `VITE_VISIAN_CHAT_URL` unset unless you intentionally host a public adapter endpoint.
- `vite.config.ts` now blocks production builds if `VITE_VISIAN_CHAT_URL` still points to `localhost`.

Current local-only file:

```env
VITE_VISIAN_CHAT_URL=http://127.0.0.1:54321/functions/v1/visian-chat
```

## 2. Pre-production checklist

1. Rotate the bridge API key if the old one was used in local testing or shared in chat/logs.
2. Confirm `services/notebooklm_bridge/.env` on the server has:
   - `NOTEBOOKLM_BRIDGE_API_KEY`
   - `NOTEBOOKLM_TIMEOUT_MS`
   - `NOTEBOOKLM_SOURCE_GROUPS_JSON`
3. Confirm `storage_state.json` is valid for the NotebookLM account you want production to use.
4. Keep `VITE_VISIAN_CHAT_URL` out of production env files.

## 3. Upload the bridge to EC2

From your Windows machine:

```powershell
powershell -ExecutionPolicy Bypass -File .\services\notebooklm_bridge\deploy\ec2\sync-to-ec2.ps1 -RemoteHost <EC2_PUBLIC_IP_OR_DNS> -KeyPath <PATH_TO_PEM> -User ubuntu
```

This copies the bridge source, compose file, bootstrap script, health script, nginx sample, and systemd timer sample.

## 4. Bootstrap on EC2

On the EC2 host:

```bash
cd ~/notebooklm-bridge
cp .env.example .env
mkdir -p secrets
# copy storage_state.json to ./secrets/storage_state.json
nano .env
./deploy/ec2/bootstrap.sh
```

`bootstrap.sh` will:

- create `.env` from `.env.example` if missing
- require `secrets/storage_state.json`
- run `docker compose up -d --build`
- verify `/live`
- run one `/health` check

The bridge container binds only to `127.0.0.1:8080`, which is the correct default for an Nginx reverse proxy setup.

## 5. Put Nginx in front

Copy the sample config:

```bash
sudo cp ~/notebooklm-bridge/deploy/ec2/nginx/notebooklm-bridge.conf /etc/nginx/sites-available/notebooklm-bridge.conf
```

Edit `server_name`, then enable it:

```bash
sudo ln -s /etc/nginx/sites-available/notebooklm-bridge.conf /etc/nginx/sites-enabled/notebooklm-bridge.conf
sudo nginx -t
sudo systemctl reload nginx
```

If you want HTTPS:

```bash
sudo certbot --nginx -d <YOUR_DOMAIN>
```

## 6. Point Supabase to the EC2 bridge

Current project ref inferred from the app URL is `jhhppdjjsxzzyfrvfgpr`.

Set Edge Function secrets:

```bash
supabase secrets set \
  NOTEBOOKLM_BRIDGE_URL=https://<YOUR_BRIDGE_DOMAIN> \
  NOTEBOOKLM_BRIDGE_API_KEY=<YOUR_ROTATED_BRIDGE_KEY> \
  --project-ref jhhppdjjsxzzyfrvfgpr
```

Then deploy the function:

```bash
supabase functions deploy visian-chat --project-ref jhhppdjjsxzzyfrvfgpr
```

## 7. Build and deploy the frontend

Before building:

- keep `.env.local` only on your dev machine
- do not copy `.env.local` to the production build machine
- keep `VITE_VISIAN_CHAT_URL` unset for production

Then build as usual:

```bash
npm run build
```

If `VITE_VISIAN_CHAT_URL` still points at `localhost`, Vite now throws and blocks the build.

## 8. Verify end-to-end

On EC2:

```bash
curl http://127.0.0.1:8080/live
curl http://127.0.0.1:8080/health
docker compose logs -f
```

Against Supabase:

```bash
curl -X POST "https://jhhppdjjsxzzyfrvfgpr.supabase.co/functions/v1/visian-chat" \
  -H "Content-Type: application/json" \
  -H "apikey: <SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -d '{"coachId":"visian","question":"test","gameContext":{"stage":"3-2","comp":"Flex","gold":20,"level":6,"hp":80,"decisionType":"augment","currentAugments":["A","B","C"],"chosenAugments":[],"synergies":[],"boardChampions":[],"items":[]},"mode":"coach_select"}'
```

In the app:

1. Open the coach modal.
2. Click `Hoi Visian`.
3. Confirm the answer returns normally.
4. Check bridge logs for the correlated request and cache headers.
