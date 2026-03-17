# NotebookLM Bridge Context

## Purpose

Document the hosted NotebookLM CLI bridge that shells out to the real `notebooklm` command and exposes HTTP endpoints for the rest of the repo.

## Read This When

- You are touching `services/notebooklm_bridge/*`.
- You are debugging coach latency, source routing, bridge health, or deployment.
- You need the real NotebookLM transport contract.

## Key Entry Points

- `services/notebooklm_bridge/app.py`
- `services/notebooklm_bridge/bridge.py`
- `services/notebooklm_bridge/tests/test_app.py`
- `services/notebooklm_bridge/tests/test_bridge.py`
- `services/notebooklm_bridge/README.md`

## Inbound / Outbound Dependencies

- Inbound: `supabase/functions/visian-chat/`, local adapter scripts, and operational deployment flow.
- Outbound: `notebooklm` CLI, notebook auth state, source sharding, and hosted bridge infrastructure.

## Relevant Skills

- `notebooklm`
- `problem-solving-pro`
- `repo-memory`

## Rules and Invariants

- The bridge is a thin transport around the NotebookLM CLI, not a second prompt-authoring layer.
- Keep `/ask` as the stable JSON contract; streaming is an opt-in transport path.
- Strip NotebookLM citation tokens before returning text downstream.
- Source sharding should happen via CLI source IDs and source groups, not by bloating prompts.
- Healthchecks should hit `/live` for lightweight liveness and reserve `/health` for deeper validation.

## Known Gotchas

- NotebookLM CLI supports `-s/--source`, but does not expose a dedicated stream flag.
- Hitting `/health` too frequently can spawn expensive CLI checks and distort latency.
- A temporary local tunnel is not a durable production architecture for this bridge.
- If NotebookLM output still contains bracket citations, check stripping in both bridge and edge layers.

## How to Verify

- `cd services/notebooklm_bridge`
- `python -m unittest discover tests`
- `python app.py`

## Related Contexts

- `../../scripts/CONTEXT.md`
- `../../supabase/functions/visian-chat/CONTEXT.md`
- `README.md`
