# NotebookLM Workspace Strategy

## Notebook Grouping (1 domain = 1 notebook)

Group documents by **development concern**, not by file type. A notebook should answer one class of questions.

| Notebook Name | What Goes Inside | Example Sources |
|---|---|---|
| `TFTISEASY - Core Architecture` | ARCHITECTURE.md, feature tree, migration history | `Architecture Rules v1`, `Supabase Migrations v5`, `Feature Folder Map` |
| `TFTISEASY - Sprint Planning` | SHIP-PLAN.md, task breakdowns, sprint notes | `Ship Plan v2 (Flex & Drama)`, `Sprint 1 Tasks`, `Go-to-Market VN` |
| `TFTISEASY - Economy Backend` | T-Coin schema, wallet logic, transaction rules | `T-Coin Schema v2`, `Earn/Spend Rules`, `Puzzle Tier System` |
| `TFTISEASY - Social & Flex` | IQ system, badge rules, share card design | `TFT IQ Formula`, `Badge Conditions`, `Profile Card Design Spec` |
| `TFTISEASY - Debug Log` | Error logs, Canvas API docs, Supabase error refs | `Canvas Render Error 2026-02-27`, `Supabase RLS Errors` |

**Rules:**
- Max **5-7 sources** per notebook. More = worse AI focus.
- One notebook per **sprint topic**, not per task.
- Cross-reference: If source A belongs to two topics, duplicate only the relevant excerpt as a pasted text source.

---

## Naming Convention (Source Title Format)

**Pattern:** `[Component] [Type/Version] [Date if volatile]`

| ❌ Bad | ✅ Good |
|---|---|
| Document 1 | `Supabase Schema v5` |
| notes | `Sprint 1 Task Breakdown` |
| code | `Canvas API Flow - Profile Card` |
| plan | `Ship Plan v2 (Flex & Drama)` |
| error | `Canvas Render Error 2026-02-27` |
| tcoin | `T-Coin Earn Rules (Economy Backend)` |

---

## Cleanup Protocol

Delete a source when **ANY** of:
- The feature it describes has been **shipped** and code is stable
- The schema it describes has been **superseded** by a newer migration
- The error log it describes has been **resolved**
- It is more than **4 weeks old** and has not been queried in the last sprint

**How to delete:**
```
mcp_notebooklm_source_delete(source_id=..., confirm=True)
```

Always `mcp_notebooklm_notebook_get(notebook_id)` first to get source IDs before deleting.

---

## Cross-Notebook Linking

NotebookLM does not natively link notebooks. To reference across notebooks:

1. Use `mcp_notebooklm_source_get_content(source_id)` to extract the relevant text from Notebook A.
2. Add that excerpt as a pasted text source in Notebook B via `mcp_notebooklm_notebook_add_text(notebook_id_B, text, title="[Excerpt] Original Title")`.
3. Mark the title with `[Excerpt]` prefix so you know it's a cross-reference, not the source of truth.
