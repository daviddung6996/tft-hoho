# Token Optimization with NotebookLM MCP

## Core Principle

```
Goal: IDE context = only the DISTILLED OUTPUT, never the raw documents.

❌ Expensive:  paste SHIP-PLAN.md (817 lines) into IDE → ~4,000 tokens
✅ Cheap:      source_get_content(id) → notebook_query(targeted prompt) → ~200 tokens
```

---

## MCP Tools Cheat Sheet

| Tool | Token Cost | Use When |
|---|---|---|
| `source_get_content(source_id)` | ⚡ Lowest | You know EXACTLY which source has the info. Get raw text, summarize yourself. |
| `source_describe(source_id)` | ⚡ Low | Need a quick summary + keywords of one source without full content. |
| `notebook_describe(notebook_id)` | 🟡 Medium | Need an overview of the whole notebook before deciding what to query. |
| `notebook_query(notebook_id, query)` | 🟡 Medium | Need AI to synthesize across multiple sources. Use a structured prompt. |
| `notebook_add_text(notebook_id, text, title)` | ⚡ Lowest | Adding new context (error log, spec) without opening the browser. |
| `notebook_add_url(notebook_id, url)` | ⚡ Low | Adding external docs (MDN, Supabase docs) as reference. |
| `mind_map_create(notebook_id, confirm=True)` | 🟡 Medium | Visual planning — generates in NotebookLM Studio, no IDE tokens. |
| `data_table_create(notebook_id, description, confirm=True)` | 🟡 Medium | Structured comparison — outputs to Studio, not IDE context. |
| `report_create(notebook_id, report_format, confirm=True)` | 🔴 Highest | Full briefing doc — use only when you need a document artifact. |

---

## Decision Tree

```
Need information from NotebookLM?
│
├─ Do you know WHICH source has it?
│   ├─ YES → source_get_content(source_id)
│   │           Then summarize the relevant part yourself.
│   └─ NO  → notebook_describe(notebook_id) first to scout,
│             then source_get_content on the relevant one.
│
├─ Need AI to SYNTHESIZE across sources?
│   └─ notebook_query(notebook_id, structured_prompt)
│      → Use Template 6 (Token Extract) to get a max-30-line output.
│
├─ Need a VISUAL artifact (mind map, data table)?
│   └─ Use Studio tools (mind_map_create / data_table_create)
│      → These render in NotebookLM, ZERO impact on IDE context.
│
└─ Need to ADD new context (error log, spec snippet)?
    └─ notebook_add_text(notebook_id, text, title)
       → Never paste raw logs into IDE chat. Always route through NotebookLM first.
```

---

## Anti-Patterns (Ranked by Token Waste)

| Rank | Anti-Pattern | Why It's Wasteful | Fix |
|---|---|---|---|
| 🔴 1 | Paste entire markdown file into IDE | 2,000–10,000 tokens for largely irrelevant content | `source_get_content` → extract 30-line summary |
| 🔴 2 | `notebook_query` with vague prompt ("tell me about the project") | Forces AI to generate long response covering everything | Specific prompt with Format constraints (max 30 lines) |
| 🟡 3 | `report_create` when only one section is needed | Generates 2,000+ word document | `notebook_query` with Template 6 instead |
| 🟡 4 | Querying the wrong notebook (too many irrelevant sources) | AI gets confused by unrelated context | Keep notebooks focused (max 5-7 sources per domain) |
| 🟢 5 | Forgetting to delete resolved error logs from Debug notebook | Accumulates noise over time | Cleanup protocol: delete after issue resolved |

---

## Practical Example: Building TFT IQ Feature

```
Step 1: Scout
mcp_notebooklm_notebook_describe("TFTISEASY - Social & Flex")
→ See: "TFT IQ Formula" source exists

Step 2: Extract (targeted, not full dump)
mcp_notebooklm_source_get_content("<TFT IQ Formula source_id>")
→ Get raw content (~300 lines)

Step 3: Distill via query (Template 6)
mcp_notebooklm_notebook_query(
  notebook_id="<Social & Flex id>",
  query="Extract ONLY: IQ score formula, rank thresholds, and modifier rules.
         Max 20 lines. Bullet points. English. No prose."
)
→ Get 15-line distilled output ≈ 150 tokens

Step 4: Feed to IDE
Paste the 15-line output as context → write code
→ Total IDE cost: ~150 tokens vs ~3,000 if SHIP-PLAN was dumped
```

---

## Source ID Management

Always resolve source IDs before operating on them:

```python
# List sources in a notebook to get IDs
notebook = mcp_notebooklm_notebook_get(notebook_id)
# notebook.sources[i].id → use this for source_get_content or source_delete
```

Cache source IDs within a work session to avoid redundant API calls.
