# Project

## What This Is

TFTISEASY is a near-ship desktop-first web training tool for serious TFT VN players. The product drops the player straight into real pro-inspired puzzles, lets them ask for coach help when they get stuck, and then teaches why the pro choice made sense so the lesson carries into ranked instead of feeling like generic content.

## Core Value

A Gold+ TFT VN player can open the app, play a puzzle quickly, understand what the pro saw, and leave with knowledge that feels like “free LP” rather than a content feed.

## Current State

The app already has a working augment puzzle flow, coach selection overlay, freeform coach chat, user IQ/rank identity, T-Coin and supporter packaging, video library unlocks, and admin tooling for puzzle authoring. The current weakness is ship readiness: startup still feels slower than it should, coach feels slower than raw NotebookLM, some popup states interrupt the loop, and many puzzles do not yet surface enough “what matters here?” context to feel worth paying for.

## Architecture / Key Patterns

Active runtime is a React 18 + Vite SPA in `src/`, backed by Supabase for auth/data and Supabase Edge Functions for coach transport. Coach answers flow through `src/lib/visianChat.ts` / `src/features/coach-select/*` into `supabase/functions/visian-chat/`, then into the hosted NotebookLM bridge in `services/notebooklm_bridge/`. `src/App.tsx` still orchestrates the main shell. Puzzle metadata already carries richer context than the live UX currently surfaces, including `proLpRank`, `tournamentName`, `lobbyHealth`, `difficulty`, `boardStrength`, `hpPressure`, `rollState`, `proReasoningIntent`, `planReasoning`, and video links.

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [ ] M001: Ship-readiness core loop — Fast puzzle entry, sharper coach, higher puzzle value, and stronger desire to join Pro.
