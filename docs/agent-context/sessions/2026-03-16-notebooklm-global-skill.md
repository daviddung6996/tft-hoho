# Session Note

Date: 2026-03-16

What changed:

- Upgraded the global NotebookLM skill at `C:\Users\Administrator\.agents\skills\notebooklm\SKILL.md`.
- Mirrored the same NotebookLM skill content to `C:\Users\Administrator\.claude\skills\notebooklm\SKILL.md` so `notebooklm skill show/status` reflects the same workflow.
- Reworked the trigger description so NotebookLM, Notebook LM, CLI, artifact-generation, source-ID, and bridge-debugging prompts are more likely to auto-load the skill.
- Rewrote the body around the real local workflow: explicit notebook/source IDs, JSON-first commands, source scoping, long-running generate/download handling, and bridge-aware debugging.

Why it matters:

- Future NotebookLM work in this repo should align with the real CLI and the existing `services/notebooklm_bridge` plus `supabase/functions/visian-chat` transport instead of generic web-only advice.

Next useful check:

- In a fresh Codex session, issue a NotebookLM-related prompt and confirm the updated skill appears in the selected skill set.
