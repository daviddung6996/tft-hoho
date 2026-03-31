---
name: tft-data-scraper
description: Parse and extract TFT (Teamfight Tactics) game data from community websites for tftiseasy Supabase database. Use this skill whenever Luc asks to scrape, parse, crawl, extract, or update TFT set data from websites like tactics.tools, metatft.com, tftactics.gg, mobalytics.gg, or any TFT stats site. Also triggers when Luc mentions updating tftiseasy database with new set data, importing champion/trait/item/augment data, building a data pipeline for TFT content, or syncing CDragon data to Supabase. Triggers on any mention of scraping TFT data, parsing set info, CDragon, Data Dragon, tactics.tools API, set-update page, new set data import, or automated TFT data collection. ALWAYS read this skill before writing any TFT data scraping code.
---

# TFT Data Scraper

Parse TFT game data from community websites into structured JSON matching tftiseasy Supabase schema.

Supabase project ID: `jhhppdjjsxzzyfrvfgpr`

## Target Tables & Schema

Read `references/supabase-schema.md` for the full column-by-column schema of all 4 target tables (champions, traits, augments, items) including JSONB structures and data types.

## Data Sources (verified March 2026)

### What DOES NOT work
- `raw.communitydragon.org/pbe/cdragon/tft/en_us.json` — does NOT have new set data until PBE client deploys. Verified Set 17: PBE JSON only had up to Set 16.
- `ddragon.leagueoflegends.com` — updates AFTER live launch, too late.
- `api.tft.tools` — exists but 404 on all paths. Not public.
- There is NO public API for new set data before PBE goes live.

### Source 1: tactics.tools/info/set-update (PRIMARY — pre-PBE)

Full data embedded in HTML via Next.js SSR. Available BEFORE PBE opens.

**How data is stored in the page:**
- `__NEXT_DATA__` script tag: partial data only (anomalies as of Set 17)
- DOM elements: all champion cards, traits, gods, augments, items
- Static JS files `ap.tft.tools/static/s{SET}/data.js`: only for LIVE sets

**Limitation:** ability descriptions have template variables (`DamageAD`, `HealAP`) NOT resolved to numbers. Full exact numbers only come from CDragon after PBE deploy.

### Source 2: CDragon PBE JSON (after PBE deploy)

```
https://raw.communitydragon.org/pbe/cdragon/tft/en_us.json  (~20MB)
https://raw.communitydragon.org/pbe/cdragon/tft/vi_vn.json  (Vietnamese)
```

COMPLETE data: exact numbers, apiNames, all variables. Check `data['sets']['{SET_NUM}']`. Champion IDs: `TFT{SetNum}_{ChampName}`.

### Source 3: tactics.tools static data.js (after set goes LIVE)

```
https://ap.tft.tools/static/s{SET}/data.js   — stats, abilities
https://ap.tft.tools/static/s{SET}/en.js     — English strings
```

Format: `window.data{SET} = JSON.parse(...)`. Available sets: s9-s16.

## Parse Workflow

### Phase 1: Pre-PBE (tactics.tools HTML)

Read `references/parse-tactics-tools.md` for the full DOM parsing guide.

Summary:
1. Fetch `https://tactics.tools/info/set-update`
2. Extract `__NEXT_DATA__` for anomalies
3. Parse champion cards from `img[src*="face_full_ultrawide/TFT{SET}_"]`
4. Parse traits from `img[src*="trait-icons/new{SET}_tft{SET}_"]`
5. Parse augments from `img[src*="/augments/"]`
6. Parse items from `img[src*="/items_s14/"]`
7. Output JSON matching Supabase schema (many fields null)

### Phase 2: Post-PBE (CDragon JSON)

Read `references/parse-cdragon.md` for the full CDragon mapping guide.

Summary:
1. Fetch `en_us.json` + `vi_vn.json` from CDragon PBE
2. Check if target set exists in `data['sets']`
3. Map champions, traits → Supabase schema with exact numbers
4. Map items, augments from `data['items']` filtered by set prefix
5. Vietnamese data from `vi_vn.json` for `name_vi`, `description_vi`
6. Output complete JSON — all fields populated

### Data Completeness by Phase

| Field | Phase 1 (HTML) | Phase 2 (CDragon) |
|---|---|---|
| champion id, name, cost, traits | YES | YES |
| champion stats (hp/ad/as/armor/mr) | NO | YES |
| champion mana, range | YES | YES |
| champion ability name (EN) | YES | YES |
| champion ability desc | PARTIAL (template vars) | YES (resolved) |
| champion ability variables | PARTIAL | YES |
| trait name + icon | YES | YES |
| trait description + breakpoints | NO | YES |
| augment name + tier + icon | YES | YES |
| augment description | NO | YES |
| item name + icon | PARTIAL (emblems) | YES |
| item description + stats | NO | YES |
| Vietnamese translations | NO | YES |

## Image URL Patterns (ap.tft.tools CDN)

```
/img/new{SET}/face/tft{SET}_{lower}.jpg?w=36          # face small
/img/new{SET}/face_full_ultrawide/TFT{SET}_{Name}.jpg  # splash
/img/new{SET}/ability/TFT{SET}_{Name}.png              # ability icon
/static/trait-icons/new{SET}_tft{SET}_{trait}_w.svg     # trait icon
/img/new{SET}/gods/{god_lower}.png                      # god image
/img/items_s14/{ItemName}.png                           # items
/img/augments/{AugmentName}{Tier}.png                   # augments
```

## Adapting for Future Sets

1. Change set number: `new17` → `new18`, `TFT17_` → `TFT18_`
2. `tactics.tools/info/set-update` URL reused each set
3. Set mechanic section changes — god parsing is Set 17 specific
4. Trait icon prefix: `new17_tft17_` → `new18_tft18_`
5. Always check `__NEXT_DATA__` pageProps structure first
6. CDragon set key: check `data['sets']` for new number

## Quick Reference

```bash
# Phase 1: Parse tactics.tools HTML
python3 scripts/parse_tactics_tools.py --set 17 --output set17_pre.json

# Phase 2: Parse CDragon
python3 scripts/parse_cdragon.py --set 17 --output set17_full.json

# Poll CDragon for new set
python3 scripts/poll_cdragon.py --set 17 --interval 1800

# Upsert to Supabase
python3 scripts/upsert_supabase.py --input set17_full.json
```
