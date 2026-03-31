"""
Seed TFT Set 17 data from CDragon into Supabase via REST API.

Usage:
  pip install requests
  
  # Set env vars (or use .env file in repo root):
  #   VITE_SUPABASE_URL=https://jhhppdjjsxzzyfrvfgpr.supabase.co
  #   SUPABASE_SERVICE_ROLE_KEY=...
  
  python seed_set17_from_cdragon.py [--soft-delete-old] [--dry-run]
"""

import argparse
import json
import os
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: 'requests' package required. Run: pip install requests")
    sys.exit(1)

# ─── Configuration ──────────────────────────────────────────

SET = 17
CDRAGON_EN = "https://raw.communitydragon.org/pbe/cdragon/tft/en_us.json"
CDRAGON_VI = "https://raw.communitydragon.org/pbe/cdragon/tft/vi_vn.json"
CDRAGON_EN_LIVE = "https://raw.communitydragon.org/latest/cdragon/tft/en_us.json"
CDRAGON_VI_LIVE = "https://raw.communitydragon.org/latest/cdragon/tft/vi_vn.json"
TACTICS_TOOLS_CDN = "https://ap.tft.tools"

# ─── Image URL builders ────────────────────────────────────

def build_face_url(api_name: str) -> str:
    name = api_name.split('_', 1)[1].lower()
    return f"{TACTICS_TOOLS_CDN}/img/new{SET}/face/tft{SET}_{name}.jpg"

def build_ability_url(api_name: str) -> str:
    return f"{TACTICS_TOOLS_CDN}/img/new{SET}/ability/{api_name}.png"

def build_trait_icon_url(trait_api_name: str) -> str:
    name = trait_api_name.split('_', 1)[1].lower()
    return f"{TACTICS_TOOLS_CDN}/static/trait-icons/new{SET}_tft{SET}_{name}_w.svg"

# ─── Star scaling ───────────────────────────────────────────

def star_scale_hp(base):
    if base is None: return None
    return [base, round(base * 1.8), round(base * 3.24)]

def star_scale_ad(base):
    if base is None: return None
    return [base, round(base * 1.5), round(base * 2.7)]

# ─── Mappers ────────────────────────────────────────────────

def extract_trait_names(champ_traits, trait_map):
    return [trait_map.get(tid, tid) for tid in champ_traits]

def map_champion(champ_en, champ_vi, trait_name_map):
    s = champ_en.get('stats', {})
    hp_base = s.get('hp')
    ad_base = s.get('damage')
    as_val = s.get('attackSpeed')

    hp_stars = star_scale_hp(hp_base)
    ad_stars = star_scale_ad(ad_base)
    dps_stars = None
    if ad_stars and as_val:
        dps_stars = [round(ad_stars[i] * as_val) for i in range(3)]

    ability_en = champ_en.get('ability', {})
    ability_vi = champ_vi.get('ability', {})

    variables = []
    for v in ability_en.get('variables', []):
        variables.append({
            "name": v.get("name", ""),
            "values": v.get("value", [])  # CDragon: "value" → Supabase: "values"
        })

    return {
        "id": champ_en["apiName"],
        "name": champ_vi.get("name", champ_en["name"]),
        "cost": champ_en["cost"],
        "traits": extract_trait_names(champ_en.get("traits", []), trait_name_map),
        "avatar": build_face_url(champ_en["apiName"]),
        "stats": {
            "hp": hp_stars,
            "ad": ad_stars,
            "as": as_val,
            "armor": s.get("armor"),
            "mr": s.get("magicResist"),
            "mana": {"min": s.get("initialMana", 0), "max": s.get("mana", 0)},
            "range": s.get("range"),
            "dps": dps_stars
        },
        "ability_name": ability_vi.get("name") or ability_en.get("name"),
        "ability_name_en": ability_en.get("name"),
        "ability_description": ability_vi.get("desc") or ability_en.get("desc", ""),
        "ability_variables": variables,
        "deleted_at": None
    }

def map_trait(trait_en, trait_vi):
    effects = []
    for e in trait_en.get('effects', []):
        effects.append({
            "minUnits": e.get("minUnits"),
            "maxUnits": e.get("maxUnits"),
            "style": e.get("style", 1),
            "variables": e.get("variables", {})
        })

    return {
        "id": trait_en["apiName"],
        "name": trait_en["name"],
        "description": trait_en.get("desc", ""),
        "effects": effects,
        "icon": build_trait_icon_url(trait_en["apiName"]),
        "name_vi": trait_vi.get("name"),
        "description_vi": trait_vi.get("desc"),
        "deleted_at": None
    }

def get_augment_tier(item):
    api = item.get('apiName', '')
    icon = item.get('icon', '')
    combined = api + icon
    if 'III' in combined or '_3' in combined:
        return 3
    elif 'II' in combined or '_2' in combined:
        return 2
    elif '_I' in combined or combined.endswith('I'):
        return 1
    return None

def map_augment(aug_en, aug_vi):
    tier = get_augment_tier(aug_en)
    tier_name_map = {1: "Silver", 2: "Gold", 3: "Prismatic"}

    return {
        "id": aug_en["apiName"],
        "name": aug_en["name"],
        "tier": tier,
        "description": aug_en.get("desc", ""),
        "icon": aug_en.get("icon", ""),
        "tier_name": tier_name_map.get(tier),
        "name_vi": aug_vi.get("name") if aug_vi else None,
        "description_vi": aug_vi.get("desc") if aug_vi else None,
        "deleted_at": None
    }

STAT_KEY_MAP = {
    'AD': 'ad', 'AP': 'ap', 'AS': 'as',
    'Armor': 'armor', 'MagicResist': 'mr',
    'Health': 'hp', 'Mana': 'mana',
    'CritChance': 'crit', 'CritDmg': 'critDamage',
    'Omnivamp': 'omnivamp'
}

def map_item(item_en, item_vi):
    stats = {}
    effects = item_en.get('effects', {})
    for k, v in effects.items():
        mapped = STAT_KEY_MAP.get(k)
        if mapped and v:
            stats[mapped] = v

    return {
        "id": item_en["apiName"],
        "name": item_en["name"],
        "description": item_en.get("desc", ""),
        "stats": stats if stats else None,
        "icon": item_en.get("icon", ""),
        "name_vi": item_vi.get("name") if item_vi else None,
        "description_vi": item_vi.get("desc") if item_vi else None,
        "deleted_at": None
    }

# ─── CDragon fetch ──────────────────────────────────────────

def find_set_in_data(data, set_num):
    """Find set data in CDragon JSON - handles both 'sets' dict and 'setData' array."""
    sets_data = data.get('sets', {})
    if str(set_num) in sets_data:
        return sets_data[str(set_num)]
    # Try setData array
    for sd in data.get('setData', []):
        mutator = sd.get('mutator', '')
        if mutator == f'TFTSet{set_num}' or mutator == f'TFTSet{set_num}_Stage2':
            return sd
    return None

def fetch_cdragon():
    cache_dir = Path(__file__).parent / ".cache"
    cache_dir.mkdir(exist_ok=True)
    
    en_cache = cache_dir / "cdragon_en.json"
    vi_cache = cache_dir / "cdragon_vi.json"

    for label, en_url, vi_url in [
        ("PBE", CDRAGON_EN, CDRAGON_VI),
        ("Live", CDRAGON_EN_LIVE, CDRAGON_VI_LIVE),
    ]:
        print(f"Fetching CDragon ({label})... (this may take a moment, ~20MB files)")
        try:
            en_resp = requests.get(en_url, timeout=120)
            en_resp.raise_for_status()
            en_data = en_resp.json()
            
            en_set = find_set_in_data(en_data, SET)
            if not en_set:
                available = list(en_data.get('sets', {}).keys())
                print(f"  Set {SET} not found in {label}. Available sets: {available}")
                continue

            vi_resp = requests.get(vi_url, timeout=120)
            vi_resp.raise_for_status()
            vi_data = vi_resp.json()
            
            vi_set = find_set_in_data(vi_data, SET)
            if not vi_set:
                vi_set = en_set

            en_cache.write_text(json.dumps(en_data, ensure_ascii=False), encoding='utf-8')
            vi_cache.write_text(json.dumps(vi_data, ensure_ascii=False), encoding='utf-8')

            print(f"  ✅ Set {SET} found in {label}!")
            print(f"  Champions: {len(en_set.get('champions', []))}")
            print(f"  Traits: {len(en_set.get('traits', []))}")
            return en_data, vi_data, en_set, vi_set
        except Exception as e:
            print(f"  ❌ {label} failed: {e}")
            continue

    if en_cache.exists() and vi_cache.exists():
        print("Using cached CDragon data...")
        en_data = json.loads(en_cache.read_text(encoding='utf-8'))
        vi_data = json.loads(vi_cache.read_text(encoding='utf-8'))
        en_set = find_set_in_data(en_data, SET)
        vi_set = find_set_in_data(vi_data, SET)
        if en_set:
            return en_data, vi_data, en_set, vi_set or en_set

    print(f"ERROR: Could not find Set {SET} data from CDragon.")
    sys.exit(1)

# ─── Supabase REST API ─────────────────────────────────────

def load_env():
    env_path = Path(__file__).resolve().parents[3] / '.env'
    if env_path.exists():
        for line in env_path.read_text(encoding='utf-8').splitlines():
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, _, val = line.partition('=')
                os.environ.setdefault(key.strip(), val.strip())

def get_supabase_config():
    load_env()
    url = os.environ.get('VITE_SUPABASE_URL', '').rstrip('/')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('VITE_SUPABASE_ANON_KEY')
    
    if not url or not key:
        print("ERROR: Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) env vars.")
        print("  Or create a .env file in the repo root.")
        sys.exit(1)

    return url, key

def supabase_upsert(url, key, table, rows, dry_run=False):
    if not rows:
        print(f"  {table}: no rows to upsert")
        return

    if dry_run:
        print(f"  [DRY RUN] {table}: would upsert {len(rows)} rows")
        for r in rows[:5]:
            print(f"    - {r.get('id', '?')}: {r.get('name', '?')}")
        if len(rows) > 5:
            print(f"    ... and {len(rows) - 5} more")
        return

    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    batch_size = 50
    total = 0
    errors = 0
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        try:
            resp = requests.post(
                f"{url}/rest/v1/{table}",
                headers=headers,
                json=batch,
                timeout=30
            )
            if resp.status_code in (200, 201):
                total += len(batch)
            else:
                print(f"    ❌ {table} batch {i}: HTTP {resp.status_code} - {resp.text[:200]}")
                errors += len(batch)
        except Exception as e:
            print(f"    ❌ {table} batch {i}: {e}")
            errors += len(batch)

    print(f"  ✅ {table}: {total} upserted, {errors} errors")

def supabase_soft_delete_old(url, key, dry_run=False):
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    tables = ['champions', 'traits', 'augments']
    old_prefixes = ['TFT16_', 'tft16_', 'Set16_', 'set16_']

    for table in tables:
        for prefix in old_prefixes:
            try:
                # Count matching
                count_resp = requests.get(
                    f"{url}/rest/v1/{table}?id=like.{prefix}*&deleted_at=is.null&select=id",
                    headers={"apikey": key, "Authorization": f"Bearer {key}"},
                    timeout=15
                )
                count = len(count_resp.json()) if count_resp.status_code == 200 else 0
                if count == 0:
                    continue

                if dry_run:
                    print(f"  [DRY RUN] {table}: would soft-delete {count} rows with prefix '{prefix}'")
                else:
                    resp = requests.patch(
                        f"{url}/rest/v1/{table}?id=like.{prefix}*&deleted_at=is.null",
                        headers=headers,
                        json={"deleted_at": "2026-03-31T00:00:00Z"},
                        timeout=15
                    )
                    if resp.status_code in (200, 204):
                        print(f"  ✅ {table}: soft-deleted {count} rows with prefix '{prefix}'")
                    else:
                        print(f"  ⚠️ {table}/{prefix}: HTTP {resp.status_code}")
            except Exception as e:
                print(f"  ⚠️ {table}/{prefix}: {e}")

# ─── Main ───────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Seed TFT Set 17 data from CDragon into Supabase')
    parser.add_argument('--soft-delete-old', action='store_true', help='Soft-delete Set 16 data first')
    parser.add_argument('--dry-run', action='store_true', help='Print what would be done without writing')
    parser.add_argument('--champions-only', action='store_true')
    parser.add_argument('--traits-only', action='store_true')
    parser.add_argument('--items-only', action='store_true')
    parser.add_argument('--augments-only', action='store_true')
    args = parser.parse_args()

    seed_all = not (args.champions_only or args.traits_only or args.items_only or args.augments_only)

    # 1. Fetch CDragon
    en_data, vi_data, en_set, vi_set = fetch_cdragon()

    # Build trait name map: "Set17_Nova" → "N.O.V.A."
    trait_name_map = {t['apiName']: t['name'] for t in en_set.get('traits', [])}

    # 2. Map champions
    champions_en = {c['apiName']: c for c in en_set.get('champions', [])}
    champions_vi = {c['apiName']: c for c in vi_set.get('champions', [])}
    champion_rows = []
    for api_name, champ_en in champions_en.items():
        champ_vi = champions_vi.get(api_name, champ_en)
        champion_rows.append(map_champion(champ_en, champ_vi, trait_name_map))
    print(f"\n📊 Mapped {len(champion_rows)} champions")

    # 3. Map traits
    traits_en = {t['apiName']: t for t in en_set.get('traits', [])}
    traits_vi = {t['apiName']: t for t in vi_set.get('traits', [])}
    trait_rows = []
    for api_name, trait_en in traits_en.items():
        trait_vi = traits_vi.get(api_name, trait_en)
        trait_rows.append(map_trait(trait_en, trait_vi))
    print(f"📊 Mapped {len(trait_rows)} traits")

    # 4. Map items & augments from top-level items
    en_items_all = en_data.get('items', [])
    vi_items_map = {it['apiName']: it for it in vi_data.get('items', [])}

    item_rows = []
    augment_rows = []

    for item_en in en_items_all:
        api = item_en.get('apiName', '')
        item_vi = vi_items_map.get(api)

        is_aug = 'Augment' in api or any('augment' in t.lower() for t in item_en.get('tags', []))

        if is_aug and f'TFT{SET}' in api:
            augment_rows.append(map_augment(item_en, item_vi))
        elif api.startswith('TFT_Item_') or api.startswith(f'TFT{SET}_Item_'):
            item_rows.append(map_item(item_en, item_vi))

    print(f"📊 Mapped {len(item_rows)} items")
    print(f"📊 Mapped {len(augment_rows)} augments")

    # 5. Get Supabase config
    sb_url, sb_key = get_supabase_config()

    # 6. Optional: soft-delete old data
    if args.soft_delete_old:
        print("\n🗑️  Soft-deleting old Set 16 data...")
        supabase_soft_delete_old(sb_url, sb_key, dry_run=args.dry_run)

    # 7. Upsert
    print("\n📤 Upserting to Supabase...")
    if seed_all or args.champions_only:
        supabase_upsert(sb_url, sb_key, 'champions', champion_rows, dry_run=args.dry_run)
    if seed_all or args.traits_only:
        supabase_upsert(sb_url, sb_key, 'traits', trait_rows, dry_run=args.dry_run)
    if seed_all or args.items_only:
        supabase_upsert(sb_url, sb_key, 'items', item_rows, dry_run=args.dry_run)
    if seed_all or args.augments_only:
        supabase_upsert(sb_url, sb_key, 'augments', augment_rows, dry_run=args.dry_run)

    print("\n✅ Done!")

    # 8. Save local JSON for reference
    output_dir = Path(__file__).parent / ".cache"
    output_dir.mkdir(exist_ok=True)
    output_file = output_dir / "set17_seed_data.json"
    output_file.write_text(json.dumps({
        "champions": champion_rows,
        "traits": trait_rows,
        "items": item_rows,
        "augments": augment_rows,
    }, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"💾 Saved seed data to {output_file}")


if __name__ == '__main__':
    main()
