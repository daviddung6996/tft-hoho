# TFT Set 17 Reference Skill Design

## Summary
Create an official Claude Code skill at `C:/Users/Administrator/.claude/skills/tft-set17-reference/` and migrate the useful Set 17 knowledge from the temporary repo folder `D:/TFT-hoho/tftset17/` into bundled reference files that live with the skill.

The new skill is a temporary bridge until an official TFT API exists. It must be usable after `D:/TFT-hoho/tftset17/` is deleted.

## Goals
- Create a durable official skill in the standard Claude Code skill location.
- Preserve the useful Set 17 guides currently stored in `tftset17/`.
- Trigger on both:
  - questions about Set 17 data sources, parsing constraints, and schema
  - requests to import or update Set 17 data in Supabase
- Avoid positioning the skill as a generic long-term TFT scraping framework.
- Keep a clean migration path to an official API.

## Non-Goals
- Building a general scraper for all TFT sets.
- Preserving Set 16 scrape-specific triggers or narratives.
- Keeping runtime dependencies on `D:/TFT-hoho/tftset17/`.
- Adding new scraping logic beyond the current documented guides.

## Target Location
Official skill directory:
- `C:/Users/Administrator/.claude/skills/tft-set17-reference/`

Planned files:
- `C:/Users/Administrator/.claude/skills/tft-set17-reference/SKILL.md`
- `C:/Users/Administrator/.claude/skills/tft-set17-reference/references/supabase-schema.md`
- `C:/Users/Administrator/.claude/skills/tft-set17-reference/references/parse-cdragon.md`
- `C:/Users/Administrator/.claude/skills/tft-set17-reference/references/parse-tactics-tools.md`

## Source Material to Migrate
From the temporary repo folder:
- `D:/TFT-hoho/tftset17/SKILL.md`
- `D:/TFT-hoho/tftset17/supabase-schema.md`
- `D:/TFT-hoho/tftset17/parse-cdragon.md`
- `D:/TFT-hoho/tftset17/parse-tactics-tools.md`

## Skill Identity
### Name
`tft-set17-reference`

### Trigger Scope
Trigger for both of these classes of requests:
1. Questions about Set 17 data, sources, constraints, parsing guidance, or Supabase schema.
2. Requests to import, update, or sync Set 17 data into Supabase.

### Positioning
The skill is a Set 17 reference and operational guide, not a generic scraper skill.

It should clearly say:
- current workflows are temporary because there is no official API yet
- current source guidance is still valid and should be followed for now
- once an official API exists, that source takes priority over the temporary parsing workflow

## Content Structure
### 1. Overview
The opening section should explain:
- what the skill is for
- why it exists
- that it is temporary but authoritative for the current no-official-API phase

### 2. Source Priority
The skill should define a strict source order:
1. Official API, if available
2. CDragon guidance, when full post-PBE data exists
3. `tactics.tools/info/set-update` HTML guidance, when operating in the pre-PBE or partial-data phase
4. Supabase schema as the target contract for normalized output

This section should make the distinction between data source and target schema explicit.

### 3. Reference Routing
The skill should tell Claude which bundled reference to read depending on the task:
- source completeness or exact numbers -> `references/parse-cdragon.md`
- pre-PBE or partial extraction workflow -> `references/parse-tactics-tools.md`
- target data shape or upsert semantics -> `references/supabase-schema.md`

### 4. Operational Guidance
The skill should distinguish between:
- answering reference questions
- planning or performing a Set 17 import/update
- avoiding unnecessary scraping when a better source already exists

### 5. Migration Note
The skill should explicitly state that when an official API becomes available, the source layer should be replaced or reprioritized rather than extending temporary scraping logic.

## Migration Rules
- Preserve useful Set 17 knowledge from the temporary files.
- Remove wording that frames the skill as a broad TFT scraping tool.
- Remove Set 16 scrape-oriented framing from the new skill.
- Ensure the new skill does not require any file under `D:/TFT-hoho/tftset17/` to function.
- Keep `description:` in `SKILL.md` on one line to match repo guidance.

## Set 16 Removal Strategy
The user wants Set 16 scrape skills removed entirely.

Current findings:
- no matching Set 16 scrape skill was found in `C:/Users/Administrator/.claude/skills/`

Implementation consequence:
- do not carry any Set 16 scrape trigger or narrative into the new skill
- if any Set 16 skill is discovered during implementation, remove it rather than deprecating it

## Acceptance Criteria
- The official skill exists under `C:/Users/Administrator/.claude/skills/tft-set17-reference/`.
- The skill works without the repo folder `D:/TFT-hoho/tftset17/`.
- The skill description triggers for both Set 17 reference questions and Set 17 Supabase update/import requests.
- Bundled references contain the migrated guidance needed for current workflows.
- The skill explicitly treats current parsing flows as temporary and prefers an official API once available.
- No Set 16 scrape-specific trigger surface remains in the new skill.

## Risks and Mitigations
### Risk: The new skill still reads like a generic scraper.
Mitigation: keep the name and description tightly scoped to Set 17 reference and update work.

### Risk: Deleting `tftset17/` breaks the skill.
Mitigation: move all required knowledge into bundled reference files inside the official skill.

### Risk: Future Claude instances overuse temporary scraping paths.
Mitigation: put source-priority rules near the top and explicitly prioritize the official API when available.

## Implementation Notes
This design intentionally keeps the skill lightweight in `SKILL.md` and moves detailed parsing/schema guidance into bundled reference files. That keeps the trigger surface clear while preserving the operational knowledge needed today.
