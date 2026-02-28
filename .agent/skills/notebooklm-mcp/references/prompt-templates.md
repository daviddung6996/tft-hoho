# NotebookLM Prompt Templates

Every prompt to `notebook_query` MUST follow the **Role / Task / Format / Constraints / Tone** structure.
Use `---TEMPLATE START---` blocks below as copy-paste starting points, then customize the `[PLACEHOLDER]` fields.

---

## Template 1: Schema Design

**When to use:** Designing a new DB table or extending an existing Supabase schema.

```
---TEMPLATE START---
Role: You are a Staff Engineer specializing in Supabase PostgreSQL database design
with deep experience in Row-Level Security (RLS) and normalized schemas for consumer apps.

Task: Based on the documents in this notebook, design a complete database schema for
[FEATURE NAME — e.g., T-Coin Economy Backend].
Include: table names, column names with types, primary/foreign keys, RLS policies,
and at least one index recommendation per table.

Format:
1. A Markdown TABLE for each new table (columns: Field | Type | Constraints | Notes).
2. A numbered list explaining each table's purpose.
3. Bold all **Foreign Keys**.
4. A separate section for RLS policies and indexes.

Constraints:
- Stack: Supabase (PostgreSQL 15) + TypeScript client
- Follow the Single Source of Truth rule: schema lives in supabase/migrations/ only
- Solo developer — keep schema minimal, avoid premature normalization
- Respond in Vietnamese, keep SQL keywords and field names in English

Tone: Direct, pragmatic senior engineer. No fluff.
---TEMPLATE END---
```

---

## Template 2: Troubleshooting / Bug Diagnosis

**When to use:** Error log or stack trace exists and root cause is unclear.

```
---TEMPLATE START---
Role: You are a Staff Engineer with 10+ years debugging [LANGUAGE/FRAMEWORK —
e.g., TypeScript + Canvas API / Supabase RLS / React 18 hooks].

Task: Below is an error log from [DESCRIBE CONTEXT — e.g., rendering the Profile
Flex Card with Canvas API]. Diagnose the root cause. Then provide step-by-step
instructions to fix and prevent recurrence.

ERROR LOG:
[PASTE ERROR HERE]

Format:
- Root Cause: 1-2 sentences, plain language
- Diagnosis Steps: numbered list showing how you traced the cause
- Fix: bullet points, each with a code snippet or config change
- Prevention: 2-3 bullet points to avoid this class of bug in the future

Constraints:
- Do not suggest changing the tech stack
- All code examples in TypeScript
- Respond in Vietnamese, code in English

Tone: Pragmatic engineer — go straight to the solution, skip theory.
---TEMPLATE END---
```

---

## Template 3: Feature Strategy / Social Comms

**When to use:** Summarizing a feature for team alignment, Facebook post, or Discord announcement.

```
---TEMPLATE START---
Role: You are a Product Strategist + Community Manager who deeply understands
Vietnamese gaming culture and the TFT (Đấu Trường Chân Lý) community.

Task: Based on the documents in this notebook, write a [OUTPUT TYPE —
e.g., Facebook post / Discord announcement / internal 1-pager] summarizing
[FEATURE NAME — e.g., TFT IQ Score system].

The content must communicate: (1) what the feature does, (2) why players should care
(flex/social proof angle), (3) a clear call-to-action.

Format: [e.g., Facebook post with emojis, max 200 words + 3 hashtags]

Constraints:
- Target audience: Vietnamese TFT players, Diamond+ rank, 18-30 age group
- Tone must be: hype but credible, not cringe-corporate
- No mention of pricing or monetization in this draft
- Respond in Vietnamese

Tone: Thân thiện, hype như anh bạn Challenger — không phải thông cáo báo chí.
---TEMPLATE END---
```

---

## Template 4: Architecture Comparison

**When to use:** Choosing between 2+ technical approaches (e.g., client-side Canvas vs server-side image gen).

```
---TEMPLATE START---
Role: You are a Tech Lead who has shipped production-grade consumer apps on a
solo developer budget. You evaluate trade-offs ruthlessly.

Task: Based on the source documents, compare these [N] approaches for
[PROBLEM — e.g., generating the Profile Flex Card image]:
[LIST APPROACHES]

Format:
1. A comparison TABLE (rows: criteria, columns: each approach).
   Criteria must include: Implementation Complexity | Performance | Cost | Maintainability | VN Mobile Support
2. A clear Recommendation section with a single winner and 2-sentence justification.
3. One "Watch out" risk for the recommended approach.

Constraints:
- Solo dev, no DevOps budget
- Must work well on Vietnamese mobile networks (3G/4G, mid-range Android)
- Stack: React 18 + TypeScript + Supabase
- Respond in Vietnamese

Tone: Opinionated co-founder — pick a winner, don't hedge.
---TEMPLATE END---
```

---

## Template 5: Mind Map / Visual Planning

**When to use:** Before creating a mind map artifact in NotebookLM Studio, to verify scope.

> **Note:** Use `mcp_notebooklm_mind_map_create(notebook_id, title="...", confirm=True)` directly.
> This template is for the *pre-query* to validate the scope before generating the artifact.

```
---TEMPLATE START---
Role: You are a systems architect creating a visual dependency map.

Task: Based on all sources in this notebook, list the top-level concepts and their
2-3 most important sub-concepts for [TOPIC — e.g., T-Coin Economy].
This will be used to validate the scope of a mind map before generating it.

Format:
- Top-level concepts as H2 headers
- Sub-concepts as bullet points
- Mark any concept with ⚡ if it has cross-dependencies with other top-level concepts

Constraints: Maximum 5 top-level concepts. Focus on what is relevant to [SPRINT GOAL].

Tone: Architectural, terse.
---TEMPLATE END---
```

---

## Template 6: Token Extract (Context for IDE)

**When to use:** Extracting the minimum viable context from a large source to paste into the IDE.

```
---TEMPLATE START---
Role: You are a technical writer creating concise briefings for a software developer.

Task: From the source "[SOURCE TITLE]", extract ONLY the information relevant to
[SPECIFIC TASK — e.g., implementing the IQ score calculation formula in TypeScript].

Format:
- Max 30 lines total
- Bullet points only — no prose paragraphs
- Include exact values, formulas, or field names where present
- Omit anything not directly actionable for the coding task

Constraints:
- If a section has no coding relevance, skip it entirely
- Do not paraphrase formulas — quote them exactly as written
- Respond in English (this output goes directly into IDE context)

Tone: Engineering spec — dry, precise, complete.
---TEMPLATE END---
```
