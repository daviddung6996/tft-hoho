# Agentic Logs

This directory stores structured logs from agentic coding sessions.

## Structure

```
agentic-logs/
  errors/          ← Error logs from /log-error
  successes/       ← Success logs from /log-success
  handoffs/        ← Session handoffs from /handoff
  metadata.json    ← ID counters for errors and successes
```

## Commands

- `/log-error [description]` — Log a failure → interview → root cause analysis
- `/log-success [description]` — Log a win → capture what made it click
- `/handoff [notes]` — Export current session state for clean next-session startup
