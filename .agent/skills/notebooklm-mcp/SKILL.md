---
name: notebooklm-mcp
description: Work with NotebookLM via MCP to manage knowledge workspaces, analyze architecture, troubleshoot bugs, and generate high-quality outputs while minimizing token usage in the IDE. Use this skill when: (1) creating or managing NotebookLM notebooks/sources, (2) querying NotebookLM for architecture decisions, schema design, or bug diagnosis, (3) generating artifacts (mind maps, briefing docs, data tables) from project documents, (4) optimizing context/token usage by fetching only the relevant content into the IDE instead of pasting full documents, (5) building prompts to get the best possible responses from NotebookLM.
---

# NotebookLM MCP Skill

NotebookLM serves as the **external brain** — it holds, analyzes, and synthesizes large documents so the IDE only receives the distilled output. This is the core token-saving pattern.

```
User Intent → NotebookLM (analyze/design/diagnose) → Targeted output → IDE (code it)
```

## Core Workflow

### 1. Classify the Request
| Request Type | Primary Tool | Reference |
|---|---|---|
| Design DB schema / architecture | `notebook_query` | `prompt-templates.md` → Schema Design |
| Debug error / bug diagnosis | `notebook_add_text` + `notebook_query` | `prompt-templates.md` → Troubleshooting |
| Feature strategy / comms | `notebook_query` | `prompt-templates.md` → Strategy |
| Get raw content for IDE | `source_get_content` | `token-optimization.md` |
| Organize / clean workspace | `notebook_list`, `source_delete` | `workspace-strategy.md` |
| Generate mind map / data table | `mind_map_create`, `data_table_create` | — |

### 2. Select the Right Notebook
→ Read [`references/workspace-strategy.md`](references/workspace-strategy.md) for notebook grouping rules and naming conventions.

### 3. Build a High-Quality Prompt
→ Read [`references/prompt-templates.md`](references/prompt-templates.md) for the 6 prompt templates (Schema, Troubleshoot, Strategy, Architecture, MindMap, Token Extract).

**Golden rule:** Always specify **Role + Task + Format + Constraints + Tone** for every `notebook_query` call.

### 4. Fetch Only What the IDE Needs
→ Read [`references/token-optimization.md`](references/token-optimization.md) for the MCP tools cheat sheet and decision tree.

**Never** paste entire documents into the IDE. Use `source_get_content` to retrieve specific source text, then summarize.

## MCP Quick Reference

```
# Get all notebooks
mcp_notebooklm_notebook_list()

# Query a notebook with a detailed prompt
mcp_notebooklm_notebook_query(notebook_id, query)

# Get raw text of ONE source (most token-efficient)
mcp_notebooklm_source_get_content(source_id)

# Add a text snippet as a source
mcp_notebooklm_notebook_add_text(notebook_id, text, title)

# Get AI summary of a source
mcp_notebooklm_source_describe(source_id)

# Create a mind map from sources
mcp_notebooklm_mind_map_create(notebook_id, confirm=True)

# Create a data table
mcp_notebooklm_data_table_create(notebook_id, description, confirm=True)

# Generate a briefing doc / study guide
mcp_notebooklm_report_create(notebook_id, report_format="Briefing Doc", confirm=True)
```

## Anti-Patterns

| ❌ Never | ✅ Instead |
|---|---|
| Paste full SHIP-PLAN.md (800 lines) into IDE | `source_get_content` → feed only relevant section |
| Use `notebook_query` with a vague prompt | Use a structured prompt with Role/Task/Format/Constraints |
| Create a notebook per feature | Group related features into one notebook (see workspace-strategy.md) |
| Keep outdated sources in notebooks | Delete after feature ships or schema changes |
