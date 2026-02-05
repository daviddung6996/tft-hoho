---
name: TFT Set 16 Data Fetcher
description: Fetch TFT Set 16 champions, traits, items, and augments from official RIOT APIs
---

# TFT Set 16 Data Fetcher

## Overview

This skill provides easy access to TFT Set 16 game data from the Community Dragon API. It fetches and filters champions, traits, items, and augments specifically for Set 16.

## Purpose

Use this skill when you need to:
- Fetch current Set 16 champion stats (HP, Mana, AD, AS, Armor, MR, Range)
- Get trait information and breakpoints
- Retrieve item data and recipes
- Access augment descriptions and effects
- Build TFT applications with up-to-date game data

## Data Source

**Primary API**: [Community Dragon](https://raw.communitydragon.org/latest/cdragon/tft/en_us.json)
- **Pros**: Latest patch data, includes all TFT sets
- **Cons**: Unofficial API, structure may change
- **Update Frequency**: Updated with each game patch

## Quick Start

### 1. Install Dependencies

```bash
cd .agent/skills/tft-set16-data/scripts
pip install -r requirements.txt
```

### 2. Basic Usage

**Fetch all Set 16 data:**
```bash
python fetch_data.py --output set16_data.json
```

**Fetch specific data types:**
```bash
# Champions only
python fetch_data.py --champions

# Multiple types
python fetch_data.py --champions --traits --items
```

**Test API connection:**
```bash
python fetch_data.py --test-connection
```

### 3. Python API

```python
from fetch_data import TFTDataFetcher

# Initialize fetcher
fetcher = TFTDataFetcher(verbose=True)

# Get champions
champions = fetcher.get_champions()
for champ in champions:
    print(f"{champ['name']} - Cost: {champ['cost']}")

# Get traits
traits = fetcher.get_traits()

# Get items
items = fetcher.get_items()

# Get augments
augments = fetcher.get_augments()
```

## Data Structure

### Champion Schema
```json
{
  "name": "Ahri",
  "apiName": "TFT16_Ahri",
  "characterName": "TFT16_Ahri",
  "cost": 2,
  "traits": ["Mythic", "Scholar"],
  "stats": {
    "hp": 550,
    "initialMana": 0,
    "mana": 40,
    "armor": 25,
    "magicResist": 25,
    "damage": 45,
    "attackSpeed": 0.75,
    "critChance": 0.25,
    "range": 4
  },
  "ability": {
    "name": "Orb of Deception",
    "desc": "...",
    "icon": "...",
    "variables": [...]
  },
  "icon": "ASSETS/..."
}
```

### Trait Schema
```json
{
  "name": "Mythic",
  "apiName": "TFT16_Mythic",
  "desc": "Your team gains bonus Health...",
  "icon": "...",
  "effects": [
    {
      "minUnits": 2,
      "maxUnits": 3,
      "variables": {...}
    }
  ]
}
```

### Item Schema
```json
{
  "name": "Deathblade",
  "apiName": "TFT_Item_Deathblade",
  "desc": "...",
  "icon": "...",
  "composition": ["BFSword", "BFSword"],
  "from": null,
  "effects": {...}
}
```

### Item Types Included
The fetcher filters items to only include actual equippable equipment:

| Type | API Pattern | Description | Examples |
|------|-------------|-------------|----------|
| **Component** | `TFT_Item_*` | Basic component items | B.F. Sword, Chain Vest, Recurve Bow |
| **Combined** | `TFT_Item_*` | Combined items from 2 components | Deathblade, Bloodthirster, Infinity Edge |
| **Ornn Set 4** | `TFT4_Item_Ornn*` | Original Ornn artifact items | Anima Visage, Infinity Force, Obsidian Cleaver |
| **Ornn Set 9** | `TFT9_Item_Ornn*` | Newer Ornn artifact items | Hullcrusher, Trickster's Glass, Deathfire Grasp |
| **Radiant** | `TFT5_Item_Radiant*` | Radiant versions of items | (currently included if available) |
| **Set 16 Emblems** | `TFT16_Item_*EmblemItem` | Trait emblems | Bruiser Emblem, Invoker Emblem, Slayer Emblem |
| **Set 16 Darkin** | `TFT16_TheDarkin*` | Darkin artifact items | The Darkin Aegis, The Darkin Bow, The Darkin Staff |

### Items Excluded
The following are **NOT** equipment and are filtered out:

| Pattern | Reason |
|---------|--------|
| `*ChampionItem*` | Champion star level data (1-star, 2-star, 3-star unit portraits) |
| `*Augment*` | Augments (fetched separately via `--augments`) |
| `*Consumable*`, `*Loot*`, `*Orb*` | Consumable/reward items |
| `*Anvil*`, `*Duplicator*`, `*Tome*`, `*Key*` | Shop/forge items (not equippable) |
| `*Quest*`, `*Explorer*` | Quest mechanic items |
| `*Fortune*`, `*Arcana*`, `*Tarot*` | Fortune/Arcana mechanic items |
| `*CarouselOfChaos*` | Special game mode items |
| `*Debug*`, `*Tutorial*`, `*_UI_*` | Internal/debug items |
| Bilgewater mechanics | BlackMarket, Brigand, Captain, Typhoon, etc. |
| Piltover mechanics | Voltage, Magnetron, E.M.P., etc. |

## CLI Reference

### Commands

```bash
# Basic fetch (all data types)
python fetch_data.py

# Output to file
python fetch_data.py --output data.json

# Filter by data type
python fetch_data.py --champions    # Champions only (Set 16)
python fetch_data.py --traits       # Traits only (Set 16)
python fetch_data.py --items        # Equipment items only (components, combined, ornn, radiant)
python fetch_data.py --augments     # Augments only (Set 16)

# Combine multiple types
python fetch_data.py --champions --traits

# Validation
python fetch_data.py --validate-set16

# Verbose mode (shows filtering details)
python fetch_data.py --verbose

# Test API connection
python fetch_data.py --test-connection
```

### Seed Items to Database

```bash
# Run from project root (requires .env with Supabase credentials)
npx tsx .agent/skills/tft-set16-data/scripts/seed_items_with_icons.ts
```

The seed script will:
1. Fetch all items from Community Dragon API
2. Filter to only include valid equipment items (~146 items)
3. Deduplicate items by name
4. Clear existing items table and insert fresh data
5. Generate icon URLs from Community Dragon CDN

### Exit Codes

- `0`: Success
- `1`: Error (connection failure, validation failure, etc.)

## Integration Examples

### Example 1: Build Champion Database

```python
from fetch_data import TFTDataFetcher

fetcher = TFTDataFetcher()
champions = fetcher.get_champions()

# Create lookup by name
champ_db = {c['name']: c for c in champions}

# Get specific champion
ahri = champ_db.get('Ahri')
if ahri:
    print(f"HP: {ahri['stats']['hp']}")
    print(f"Mana: {ahri['stats']['mana']}")
```

### Example 2: Filter by Cost

```python
from fetch_data import TFTDataFetcher

fetcher = TFTDataFetcher()
champions = fetcher.get_champions()

# Group by cost
by_cost = {}
for champ in champions:
    cost = champ.get('cost', 0)
    if cost not in by_cost:
        by_cost[cost] = []
    by_cost[cost].append(champ['name'])

for cost, names in sorted(by_cost.items()):
    print(f"{cost}-cost: {', '.join(names)}")
```

### Example 3: Trait Analysis

```python
from fetch_data import TFTDataFetcher

fetcher = TFTDataFetcher()
champions = fetcher.get_champions()

# Count champions per trait
trait_counts = {}
for champ in champions:
    for trait in champ.get('traits', []):
        trait_counts[trait] = trait_counts.get(trait, 0) + 1

print("Champions per trait:")
for trait, count in sorted(trait_counts.items(), key=lambda x: -x[1]):
    print(f"  {trait}: {count}")
```

## Troubleshooting

### API Connection Failures

If the API is down or unreachable:
1. Check your internet connection
2. Verify the API endpoint is accessible: `curl https://raw.communitydragon.org/latest/cdragon/tft/en_us.json`
3. Try again later (Community Dragon may be updating)

### Set 16 Not Found

If Set 16 data returns empty:
1. The set identifier may have changed - check `SET_16_PREFIX` in `fetch_data.py`
2. Update the script to match the current API structure
3. Run with `--verbose` to see what data is being returned

## Verification

**CRITICAL**: Automated verification against external sites (like `lolchess.gg` or `tactics.tools`) is unreliable due to anti-bot protection. You **MUST** perform manual verification before using this data in production.

### Manual Validation Steps
1. Run the fetch script: `python fetch_data.py --output set16_check.json`
2. Open [LOLChess Set 16 Stats](https://lolchess.gg/champions/set16/stats)
3. Compare 3 random champions (e.g. Ahri, Irelia, Warwick):
   - Check **HP**, **Mana**, **Armor**, **MR**, **Damage**
   - Verify **Cost** and **Traits** match
4. Open [Tactics.tools Augments](https://tactics.tools/info/augments)
   - Search for 2-3 new augments (e.g. Set 16 specific ones)
   - Verify description values match (e.g. "Grant 20% AS" vs "Grant 25% AS")

If data does not match, the Community Dragon API might be out of sync with the live server. In this case, wait for a patch update or check the [Community Dragon Discord](https://discord.gg/communitydragon).

- **Set Identification**: Currently uses `TFT16_` prefix. This may need updating if RIOT changes naming conventions.
- **Image URLs**: Icon paths are relative. Prepend `https://raw.communitydragon.org/latest/` to get full URLs.
- **Caching**: No built-in caching. Implement your own if making frequent requests.
- **Rate Limiting**: Community Dragon has no known rate limits, but be respectful with request frequency.

## Maintenance

When a new TFT set releases:
1. Update `SET_16_PREFIX` to the new set identifier
2. Test with `--validate-set16` to ensure correct filtering
3. Update this documentation with any API structure changes

## See Also

- [Community Dragon GitHub](https://github.com/CommunityDragon/Docs)
- [Riot Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon)
- [TFT Official Patch Notes](https://www.leagueoflegends.com/en-us/news/tags/teamfight-tactics/)
- [LOLChess - Set 16 Champion Stats](https://lolchess.gg/champions/set16/stats) - Tra cứu stat chi tiết cho từng tướng
- [Tactics.tools - Augments (Vietnamese)](https://tactics.tools/vie/info/augments) - Tra cứu tên tiếng Việt của Augment
