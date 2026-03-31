---
name: tft-set17-data-scraper
description: |
  Parse, extract, and seed TFT Set 17 game data into tftiseasy Supabase database.
  Use when: scraping TFT data, parsing set-update page, importing champion/trait/
  item/augment data, syncing CDragon to Supabase, updating tftiseasy with new set,
  building TFT data pipeline, "scrape set 17", "lấy data set 17", "cập nhật data
  tướng/tộc/trang bị", "parse CDragon", "parse tactics.tools", "seed database",
  "poll PBE for new set". ALWAYS read this skill before writing any TFT data code.
---

# Goal

Extract TFT Set 17 game data (champions, traits, items, augments) from community
sources and seed it into tftiseasy's Supabase database with bilingual support
(English + Vietnamese).

# Instructions

## Context Files — Read Before Coding

| File | What it covers | When to read |
|------|---------------|--------------|
| `parse-tactics-tools.md` | DOM parsing tactics.tools HTML | Phase 1 work |
| `parse-cdragon.md` | CDragon JSON mapping + Python code | Phase 2 work |
| `supabase-schema.md` | All 4 table schemas + upsert SQL | Any DB write |

> All files are siblings in the same directory as this SKILL.md.

## Data Sources (priority order)

| # | Source | When available | Completeness |
|---|--------|---------------|--------------|
| 1 | `tactics.tools/info/set-update` (HTML) | Pre-PBE, earliest | Partial — no stats, template vars in abilities |
| 2 | CDragon PBE JSON (`en_us.json` + `vi_vn.json`) | After PBE deploy | Complete — exact numbers, Vietnamese |
| 3 | `ap.tft.tools/static/s{SET}/data.js` | After live launch | Complete but late |

**What does NOT work:** CDragon PBE has NO new set data until PBE client deploys.
There is NO public API for pre-PBE data. `api.tft.tools` returns 404.

## 2-Phase Pipeline

### Phase 1: Pre-PBE → tactics.tools HTML parse

📚 **Read `parse-tactics-tools.md` for full guide.**

```bash
python3 scripts/parse_tactics_tools.py --set 17 --output set17_pre.json
```

1. Fetch `https://tactics.tools/info/set-update` → save HTML
2. Extract `__NEXT_DATA__` for anomalies
3. Parse champions from `img[src*="face_full_ultrawide/TFT17_"]`
4. Parse traits from `img[src*="trait-icons/new17_tft17_"]`
5. Parse augments from `img[src*="/augments/"]`
6. Parse items from `img[src*="/items_s14/"]`
7. Output JSON matching Supabase schema (many fields null — ok)

### Phase 2: Post-PBE → CDragon JSON merge

📚 **Read `parse-cdragon.md` for full guide.**

```bash
python3 scripts/parse_cdragon.py --set 17 --output set17_full.json
```

1. Fetch `en_us.json` + `vi_vn.json` from CDragon PBE
2. Check `data['sets']['17']` exists
3. Map champions with star scaling: HP×1.8/3.24, AD×1.5/2.7
4. Map traits with breakpoint effects
5. Filter items/augments from `data['items']` by `TFT17_` prefix
6. Merge Vietnamese from `vi_vn.json`
7. Upsert to Supabase with COALESCE (don't overwrite Phase 1 data with nulls)

### Upsert to Database

📚 **Read `supabase-schema.md` for schemas + SQL.**

```bash
python3 scripts/upsert_supabase.py --input set17_full.json
```

Supabase project: `jhhppdjjsxzzyfrvfgpr`

## Image URL Patterns (ap.tft.tools CDN)

```
Face:    /img/new17/face/tft17_{lower}.jpg
Splash:  /img/new17/face_full_ultrawide/TFT17_{Name}.jpg
Ability: /img/new17/ability/TFT17_{Name}.png
Trait:   /static/trait-icons/new17_tft17_{trait}_w.svg
God:     /img/new17/gods/{god_lower}.png
Item:    /img/items_s14/{ItemName}.png
Augment: /img/augments/{AugmentName}{Tier}.png
```

## Data Completeness Matrix

| Field | Phase 1 (HTML) | Phase 2 (CDragon) |
|-------|:-:|:-:|
| id, name, cost, traits | ✅ | ✅ |
| stats (hp/ad/as/armor/mr) | ❌ | ✅ |
| mana, range | ✅ | ✅ |
| ability name (EN) | ✅ | ✅ |
| ability desc | ⚠️ template vars | ✅ resolved |
| ability variables | ⚠️ partial | ✅ |
| trait description + breakpoints | ❌ | ✅ |
| augment description | ❌ | ✅ |
| item description + stats | ❌ | ✅ |
| Vietnamese translations | ❌ | ✅ |

# Examples

## Example 1: Poll CDragon for Set 17 availability

```python
import requests
data = requests.get("https://raw.communitydragon.org/pbe/cdragon/tft/en_us.json").json()
if "17" in data.get("sets", {}):
    print("Set 17 found! Champions:", len(data["sets"]["17"]["champions"]))
else:
    print("Not yet. Available:", list(data["sets"].keys()))
```

## Example 2: Quick champion lookup after Phase 2

```python
import json
with open("set17_full.json") as f:
    data = json.load(f)
champs = {c["name"]: c for c in data["champions"]}
aatrox = champs["Aatrox"]
print(f"HP: {aatrox['stats']['hp']}")  # [800, 1440, 2592]
print(f"Traits: {aatrox['traits']}")   # ["N.O.V.A.", "Bastion"]
```

# Constraints

- 🚫 NEVER hardcode Supabase credentials — use `.env` or env vars
- ✅ ALWAYS use COALESCE on upsert — Phase 1 nulls must not overwrite Phase 2 data
- ✅ ALWAYS fetch both `en_us.json` AND `vi_vn.json` — bilingual is mandatory
- ✅ ALWAYS deduplicate traits/augments — same icon appears multiple times in HTML
- ⚠️ CDragon `"value"` (singular) → Supabase `"values"` (plural) — rename on map
- ⚠️ Ability descriptions contain `@VariableName@` placeholders — resolve from `ability.variables`
- ⚠️ Star scaling is NOT in CDragon — calculate: HP×1.8/3.24, AD×1.5/2.7

## Adapting for Future Sets

1. Change `17` → `18` in: set prefix, URL paths, CDragon key
2. `tactics.tools/info/set-update` URL is reused each set
3. God parsing is Set 17 specific — future sets may have different mechanics
4. Always check `__NEXT_DATA__` pageProps structure — it changes per set

<!-- Generated by Skill Creator Ultra v1.0 -->
