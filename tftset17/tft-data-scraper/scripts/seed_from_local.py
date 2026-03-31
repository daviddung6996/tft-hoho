"""
Seed TFT Set 17 data into Supabase from local JSON (src/data/set17_champions.json).
Also creates trait stubs from champion trait references.

Usage:
  pip install requests
  python seed_from_local.py [--soft-delete-old] [--dry-run]
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

try:
    import requests
except ImportError:
    print("ERROR: 'requests' package required. Run: pip install requests")
    sys.exit(1)

SET = 17
TACTICS_TOOLS_CDN = "https://ap.tft.tools"

REPO_ROOT = Path(__file__).resolve().parents[3]
CHAMPIONS_JSON = REPO_ROOT / "src" / "data" / "set17_champions.json"

# ─── Supabase REST helpers ──────────────────────────────────

def load_env():
    env_path = REPO_ROOT / '.env'
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
        print("ERROR: Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.")
        sys.exit(1)
    return url, key

def supabase_upsert(url, key, table, rows, dry_run=False):
    if not rows:
        print(f"  {table}: no rows")
        return 0

    if dry_run:
        print(f"  [DRY RUN] {table}: would upsert {len(rows)} rows")
        for r in rows[:5]:
            print(f"    - {r.get('id', '?')}: {r.get('name', '?')}")
        if len(rows) > 5:
            print(f"    ... and {len(rows) - 5} more")
        return len(rows)

    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    total = 0
    errors = 0
    batch_size = 50
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
                print(f"    ❌ {table} batch {i}: HTTP {resp.status_code} - {resp.text[:300]}")
                errors += len(batch)
        except Exception as e:
            print(f"    ❌ {table} batch {i}: {e}")
            errors += len(batch)

    print(f"  ✅ {table}: {total} upserted, {errors} errors")
    return total

def supabase_soft_delete_prefix(url, key, table, prefix, dry_run=False):
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    try:
        count_resp = requests.get(
            f"{url}/rest/v1/{table}?id=like.{prefix}*&deleted_at=is.null&select=id",
            headers={"apikey": key, "Authorization": f"Bearer {key}"},
            timeout=15
        )
        count = len(count_resp.json()) if count_resp.status_code == 200 else 0
        if count == 0:
            return 0
        if dry_run:
            print(f"  [DRY RUN] {table}: would soft-delete {count} rows with '{prefix}'")
            return count
        resp = requests.patch(
            f"{url}/rest/v1/{table}?id=like.{prefix}*&deleted_at=is.null",
            headers=headers,
            json={"deleted_at": "2026-03-31T00:00:00Z"},
            timeout=15
        )
        if resp.status_code in (200, 204):
            print(f"  ✅ {table}: soft-deleted {count} rows with '{prefix}'")
        return count
    except Exception as e:
        print(f"  ⚠️ {table}/{prefix}: {e}")
        return 0

# ─── Map champions ──────────────────────────────────────────

def map_champion(champ):
    return {
        "id": champ["apiName"],
        "name": champ["name"],
        "cost": champ["cost"],
        "traits": champ.get("traits", []),
        "avatar": champ.get("tileIcon") or champ.get("squareIcon") or champ.get("icon", ""),
        "stats": champ.get("stats"),
        "ability_name": champ.get("ability", {}).get("name"),
        "ability_name_en": champ.get("ability", {}).get("name"),
        "ability_description": champ.get("ability", {}).get("desc", ""),
        "ability_variables": champ.get("ability", {}).get("variables", []),
        "deleted_at": None,
    }

# ─── Map traits (stubs from champion data) ──────────────────

def build_trait_icon_url(trait_name):
    slug = trait_name.lower().replace('.', '').replace(' ', '').replace("'", '')
    return f"{TACTICS_TOOLS_CDN}/static/trait-icons/new{SET}_tft{SET}_{slug}_w.svg"

def build_trait_rows(champions):
    """Build trait stub rows from unique traits referenced by champions."""
    seen = set()
    traits = []
    for champ in champions:
        for trait_name in champ.get("traits", []):
            if trait_name in seen:
                continue
            seen.add(trait_name)
            slug = trait_name.lower().replace('.', '').replace(' ', '').replace("'", '')
            traits.append({
                "id": f"Set{SET}_{slug.title().replace(' ', '')}",
                "name": trait_name,
                "description": "",
                "effects": [],
                "icon": build_trait_icon_url(trait_name),
                "name_vi": None,
                "description_vi": None,
                "deleted_at": None,
            })
    return traits

# ─── Main ───────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Seed Set 17 from local set17_champions.json')
    parser.add_argument('--soft-delete-old', action='store_true', help='Soft-delete Set 16 data')
    parser.add_argument('--dry-run', action='store_true', help='Print without writing')
    args = parser.parse_args()

    # 1. Load local JSON
    if not CHAMPIONS_JSON.exists():
        print(f"ERROR: {CHAMPIONS_JSON} not found.")
        sys.exit(1)

    raw = json.loads(CHAMPIONS_JSON.read_text(encoding='utf-8'))
    champions = raw.get('champions', [])
    print(f"📊 Loaded {len(champions)} champions from {CHAMPIONS_JSON.name}")

    # 2. Map
    champion_rows = [map_champion(c) for c in champions]
    trait_rows = build_trait_rows(champions)
    print(f"📊 {len(champion_rows)} champion rows")
    print(f"📊 {len(trait_rows)} trait stubs")

    # 3. Supabase
    sb_url, sb_key = get_supabase_config()

    # 4. Soft-delete old
    if args.soft_delete_old:
        print("\n🗑️  Soft-deleting old Set 16 data...")
        for table in ['champions', 'traits', 'augments']:
            for prefix in ['TFT16_', 'tft16_', 'Set16_', 'set16_']:
                supabase_soft_delete_prefix(sb_url, sb_key, table, prefix, dry_run=args.dry_run)

    # 5. Upsert
    print("\n📤 Upserting Set 17 data...")
    supabase_upsert(sb_url, sb_key, 'champions', champion_rows, dry_run=args.dry_run)
    supabase_upsert(sb_url, sb_key, 'traits', trait_rows, dry_run=args.dry_run)

    print("\n✅ Done! Champions and traits seeded.")
    print("ℹ️  Note: Items and augments need CDragon (not available for Set 17 yet).")
    print("   Re-run seed_set17_from_cdragon.py when CDragon publishes Set 17 PBE data.")


if __name__ == '__main__':
    main()
