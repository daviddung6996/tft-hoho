# ARCHITECTURE.md

> Core rules & boundaries. Keep it simple. Keep it fast.

## 1. Golden Rules
- **Anti Over-engineering**: 3-Tier Layer ONLY (`Controller -> Service -> Repo`). NO extra interfaces, adapters, or isolated domains unless strictly necessary (e.g., >2 DBs).
- **Feature Grouping**: All code MUST live inside a feature folder (`src/features/[name]` or `backend/features/[name]`). 
- **No Global Pollution**: NEVER create global `components/`, `controllers/`, or `services/` at the root level.
- **Single DB Source of Truth**: `supabase/migrations/` is the ONLY place for database schemas and seeds.

## 2. Directory Structure
```text
.agent/rules/     # Hard rules for AI agents (naming, structure).
backend/features/ # Backend logic grouped by domain (auth, user, etc).
src/features/     # Frontend UI, state, API grouped by domain.
src/shared/       # STRICTLY generic utilities (ui/, hooks/). No business logic.
supabase/         # Edge Functions, Database migrations and config.
```
