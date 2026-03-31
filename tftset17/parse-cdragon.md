# Parse CDragon — Full Data Mapping Guide

## Overview

CommunityDragon (CDragon) scrapes Riot game client files. Once PBE deploys, it has COMPLETE data with exact numbers, apiNames, and all variables. This is the definitive source.

## Endpoints

```
English:    https://raw.communitydragon.org/pbe/cdragon/tft/en_us.json
Vietnamese: https://raw.communitydragon.org/pbe/cdragon/tft/vi_vn.json
Live:       https://raw.communitydragon.org/latest/cdragon/tft/en_us.json
```

Files are ~20MB. Cache locally.

## Detecting New Set Data

```python
import requests, json

data = requests.get("https://raw.communitydragon.org/pbe/cdragon/tft/en_us.json").json()
available_sets = list(data.get('sets', {}).keys())
print(f"Available sets: {available_sets}")

TARGET_SET = "17"
if TARGET_SET in available_sets:
    print("Set 17 data found!")
    set_data = data['sets'][TARGET_SET]
else:
    print("Not yet — keep polling")
```

## CDragon JSON Structure

```
{
  "items": [...],          # ALL items across all sets (including augments)
  "setData": [...],        # Set metadata
  "sets": {
    "1": {"champions": [...], "traits": [...], "name": "..."},
    "17": {"champions": [...], "traits": [...], "name": "Space Gods"}
  }
}
```

## Map Champions → Supabase

### CDragon champion object

```json
{
  "apiName": "TFT17_Aatrox",
  "name": "Aatrox",
  "cost": 1,
  "traits": ["Set17_Nova", "Set17_Bastion"],
  "stats": {
    "hp": 800, "mana": 90, "initialMana": 30,
    "damage": 60, "armor": 40, "magicResist": 40,
    "critMultiplier": 1.4, "critChance": 0.25,
    "attackSpeed": 0.75, "range": 1
  },
  "ability": {
    "name": "Stellar Slash",
    "desc": "Heal @HealAP@ (@ModifiedHealAP@), then deal @DamageAD@ + @DamagePercentArmor@ (@ModifiedDamage@) physical damage...",
    "icon": "ASSETS/...",
    "variables": [
      {"name": "HealAP", "value": [0, 150, 225, 350]},
      {"name": "DamageAD", "value": [0, 200, 300, 450]}
    ]
  }
}
```

### Star scaling formulas

TFT uses these multipliers:
```
HP:  1★ = base, 2★ = base × 1.8, 3★ = base × 3.24
AD:  1★ = base, 2★ = base × 1.5, 3★ = base × 2.7
DPS: ad_at_star × attack_speed
```

### Mapping code

```python
def map_champion(champ_en, champ_vi):
    s = champ_en['stats']
    hp_base = s['hp']
    ad_base = s['damage']
    as_val = s['attackSpeed']
    
    hp_stars = [hp_base, round(hp_base * 1.8), round(hp_base * 3.24)]
    ad_stars = [ad_base, round(ad_base * 1.5), round(ad_base * 2.7)]
    dps_stars = [round(ad_stars[i] * as_val) for i in range(3)]
    
    # Map ability variables: CDragon uses "value", Supabase uses "values"
    variables = []
    for v in champ_en.get('ability', {}).get('variables', []):
        variables.append({
            "name": v["name"],
            "values": v["value"]  # CDragon key is "value" (singular)
        })
    
    return {
        "id": champ_en["apiName"],
        "name": champ_vi["name"],                    # Vietnamese
        "cost": champ_en["cost"],
        "traits": extract_trait_names(champ_en, traits_en),  # resolve IDs to names
        "avatar": build_face_url(champ_en["apiName"]),
        "stats": {
            "hp": hp_stars,
            "ad": ad_stars,
            "as": as_val,
            "armor": s["armor"],
            "mr": s["magicResist"],
            "mana": {"min": s["initialMana"], "max": s["mana"]},
            "range": s["range"],
            "dps": dps_stars
        },
        "ability_name": champ_vi["ability"]["name"],
        "ability_name_en": champ_en["ability"]["name"],
        "ability_description": champ_vi["ability"].get("desc", ""),
        "ability": {
            "name": champ_en["ability"]["name"],
            "desc": champ_en["ability"].get("desc", ""),
            "icon": build_ability_url(champ_en["apiName"]),
            "variables": variables
        },
        "ability_variables": variables,
        "deleted_at": None
    }
```

### Resolve trait IDs to display names

CDragon champion traits are internal IDs like `"Set17_Nova"`. Map to display names:

```python
def extract_trait_names(champ, all_traits):
    """all_traits = set_data['traits'] list from CDragon"""
    trait_map = {t['apiName']: t['name'] for t in all_traits}
    return [trait_map.get(tid, tid) for tid in champ['traits']]
```

### Build image URLs

tactics.tools CDN has predictable URLs. CDragon also has icon paths but they need base URL mapping.

```python
SET = 17

def build_face_url(api_name):
    # TFT17_Aatrox → aatrox
    name = api_name.split('_', 1)[1].lower()
    return f"https://ap.tft.tools/img/new{SET}/face/tft{SET}_{name}.jpg"

def build_ability_url(api_name):
    return f"https://ap.tft.tools/img/new{SET}/ability/{api_name}.png"

def build_trait_icon_url(trait_api_name):
    # Set17_Nova → nova
    name = trait_api_name.split('_', 1)[1].lower()
    return f"https://ap.tft.tools/static/trait-icons/new{SET}_tft{SET}_{name}_w.svg"
```

**Alternative: CDragon icon paths**
CDragon provides icon paths like `ASSETS/Maps/TFT/Icons/...`. Map to:
```
https://raw.communitydragon.org/pbe/game/{path_lowered}
```
Replace `.tex` or `.dds` with `.png`.

## Map Traits → Supabase

### CDragon trait object

```json
{
  "apiName": "Set17_Nova",
  "name": "N.O.V.A.",
  "desc": "Your team gains...",
  "effects": [
    {"minUnits": 2, "maxUnits": 3, "style": 1, "variables": {"hp": 0.07}},
    {"minUnits": 4, "maxUnits": 5, "style": 2, "variables": {"hp": 0.12}},
    {"minUnits": 6, "maxUnits": 25, "style": 3, "variables": {"hp": 0.18}}
  ],
  "icon": "ASSETS/..."
}
```

### Mapping code

```python
def map_trait(trait_en, trait_vi):
    effects = []
    for e in trait_en.get('effects', []):
        effects.append({
            "minUnits": e["minUnits"],
            "maxUnits": e["maxUnits"],
            "desc": "",  # CDragon doesn't always have per-breakpoint desc
            "variables": e.get("variables", {})
        })
    
    return {
        "id": trait_en["apiName"],         # "Set17_Nova"
        "name": trait_en["name"],          # "N.O.V.A."
        "description": trait_en.get("desc", ""),
        "effects": effects,
        "icon": build_trait_icon_url(trait_en["apiName"]),
        "name_vi": trait_vi["name"],
        "description_vi": trait_vi.get("desc", ""),
        "deleted_at": None
    }
```

## Map Items → Supabase

Items are in `data['items']` (top-level, not inside sets). Filter by set prefix.

### CDragon item object

```json
{
  "apiName": "TFT_Item_InfinityEdge",
  "name": "Infinity Edge",
  "desc": "Abilities can critically strike...",
  "effects": {"AD": 15, "CritChance": 15, "CritDmg": 10},
  "from": ["TFT_Item_BFSword", "TFT_Item_SparringGloves"],
  "icon": "ASSETS/...",
  "composition": ["BFSword", "SparringGloves"]
}
```

### Filter items for current set

```python
# Base items (shared) + set-specific items + emblems
set_items = []
for item in data['items']:
    api = item.get('apiName', '')
    # Base items: TFT_Item_*
    # Set-specific: TFT17_Item_* or contains set number
    # Emblems: *EmblemItem*
    if api.startswith('TFT_Item_') or api.startswith(f'TFT{SET}_'):
        set_items.append(item)
```

### Mapping code

```python
def map_item(item_en, item_vi):
    stats = {}
    effects = item_en.get('effects', {})
    stat_key_map = {
        'AD': 'ad', 'AP': 'ap', 'AS': 'as',
        'Armor': 'armor', 'MagicResist': 'mr',
        'Health': 'hp', 'Mana': 'mana',
        'CritChance': 'crit', 'CritDmg': 'critDamage',
        'Omnivamp': 'omnivamp'
    }
    for k, v in effects.items():
        mapped = stat_key_map.get(k)
        if mapped and v:
            stats[mapped] = v
    
    return {
        "id": item_en["apiName"],
        "name": item_en["name"],
        "description": item_en.get("desc", ""),
        "stats": stats if stats else None,
        "icon": build_item_icon_url(item_en),
        "name_vi": item_vi["name"] if item_vi else None,
        "description_vi": item_vi.get("desc") if item_vi else None,
        "deleted_at": None
    }
```

## Map Augments → Supabase

Augments are also in `data['items']` but have augment-specific tags.

```python
def is_augment(item):
    tags = item.get('tags', [])
    api = item.get('apiName', '')
    return 'Augment' in api or any('augment' in t.lower() for t in tags)

def get_augment_tier(item):
    api = item.get('apiName', '')
    icon = item.get('icon', '')
    # Tier often in icon path: _I, _II, _III or 1, 2, 3
    if '_III' in icon or 'III' in api or '_3' in icon:
        return 3
    elif '_II' in icon or 'II' in api or '_2' in icon:
        return 2
    elif '_I' in icon or 'I' in api or '_1' in icon:
        return 1
    return None

augments = [item for item in data['items'] if is_augment(item)]
set_augments = [a for a in augments if f'TFT{SET}' in a.get('apiName', '')]
```

### Mapping code

```python
def map_augment(aug_en, aug_vi):
    tier = get_augment_tier(aug_en)
    tier_name_map = {1: "Silver", 2: "Gold", 3: "Prismatic"}
    
    return {
        "id": aug_en["apiName"],
        "name": aug_en["name"],
        "tier": tier,
        "description": aug_en.get("desc", ""),
        "icon": build_augment_icon_url(aug_en),
        "tier_name": tier_name_map.get(tier),
        "name_vi": aug_vi["name"] if aug_vi else None,
        "description_vi": aug_vi.get("desc") if aug_vi else None,
        "deleted_at": None
    }
```

## Polling Script

```python
import time, requests

def poll_cdragon(target_set, interval=1800):
    url = "https://raw.communitydragon.org/pbe/cdragon/tft/en_us.json"
    while True:
        try:
            data = requests.get(url).json()
            if str(target_set) in data.get('sets', {}):
                print(f"Set {target_set} found!")
                return data
            print(f"Set {target_set} not yet. Sets: {list(data['sets'].keys())}")
        except Exception as e:
            print(f"Error: {e}")
        time.sleep(interval)
```

## Vietnamese Data

Fetch `vi_vn.json` alongside `en_us.json`. Same structure, translated strings.

```python
en = requests.get(".../en_us.json").json()
vi = requests.get(".../vi_vn.json").json()

# Match by apiName (same across languages)
en_champs = {c['apiName']: c for c in en['sets'][SET]['champions']}
vi_champs = {c['apiName']: c for c in vi['sets'][SET]['champions']}

for api_name, champ_en in en_champs.items():
    champ_vi = vi_champs.get(api_name, champ_en)  # fallback to English
    row = map_champion(champ_en, champ_vi)
```

## Common Pitfalls

1. **CDragon `value` vs Supabase `values`**: CDragon ability variables use key `"value"` (singular). Supabase schema expects `"values"` (plural). Always rename.
2. **Items and augments mixed**: Both are in `data['items']`. Filter by apiName prefix and tags.
3. **Trait apiNames differ from IDs**: CDragon uses `"Set17_Nova"`, tactics.tools uses `"tft17_nova"`. Pick one format and stick with it.
4. **HP/AD star scaling**: CDragon gives base stats only. YOU calculate 2★ and 3★ using standard multipliers.
5. **Ability desc templates**: CDragon descs still have `@VariableName@` placeholders. To resolve, match with `ability.variables` by name.
6. **Icon path mapping**: CDragon paths start with `ASSETS/`. For CDragon CDN: lowercase the path, replace `.tex`/`.dds` with `.png`, prepend `https://raw.communitydragon.org/pbe/game/`.
7. **File size**: JSON is ~20MB. Parse once, cache locally.
