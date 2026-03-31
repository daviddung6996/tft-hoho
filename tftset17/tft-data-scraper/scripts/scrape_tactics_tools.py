"""
Scrape TFT Set 17 traits, augments, items from tactics.tools/info/set-update.
Download icons to public/tft-assets/ and upsert to Supabase.

Usage:
  pip install requests beautifulsoup4 lxml
  python scrape_tactics_tools.py [--dry-run]
"""

import argparse
import html as html_mod
import json
import os
import re
import sys
import time
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("ERROR: pip install requests beautifulsoup4 lxml")
    sys.exit(1)

SET = 17
REPO_ROOT = Path(__file__).resolve().parents[3]
ASSETS_DIR = REPO_ROOT / "public" / "tft-assets"
CACHE_DIR = Path(__file__).parent / ".cache"
TACTICS_TOOLS = "https://ap.tft.tools"

# ─── Supabase helpers ───────────────────────────────────────

def load_env():
    env_path = REPO_ROOT / '.env'
    if env_path.exists():
        for line in env_path.read_text(encoding='utf-8').splitlines():
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, _, v = line.partition('=')
                os.environ.setdefault(k.strip(), v.strip())

def get_supabase_config():
    load_env()
    url = os.environ.get('VITE_SUPABASE_URL', '').rstrip('/')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('VITE_SUPABASE_ANON_KEY')
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
            resp = requests.post(f"{url}/rest/v1/{table}", headers=headers, json=batch, timeout=30)
            if resp.status_code in (200, 201):
                total += len(batch)
            else:
                print(f"    ❌ {table} batch {i}: HTTP {resp.status_code} - {resp.text[:200]}")
                errors += len(batch)
        except Exception as e:
            print(f"    ❌ {table} batch {i}: {e}")
            errors += len(batch)
    print(f"  ✅ {table}: {total} upserted, {errors} errors")
    return total

# ─── Download helper ────────────────────────────────────────

def download_file(url, dest, retries=2):
    for attempt in range(retries + 1):
        try:
            r = requests.get(url, timeout=15)
            if r.status_code == 200 and len(r.content) > 50:
                dest.write_bytes(r.content)
                return True
        except Exception:
            pass
        if attempt < retries:
            time.sleep(0.3)
    return False

# ─── Fetch HTML ─────────────────────────────────────────────

def fetch_html():
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / "set_update.html"

    # Use cache if fresh (< 6 hours)
    if cache_file.exists():
        age_hours = (time.time() - cache_file.stat().st_mtime) / 3600
        if age_hours < 6:
            print(f"Using cached HTML ({age_hours:.1f}h old)")
            return cache_file.read_text(encoding='utf-8')

    print("Fetching tactics.tools/info/set-update ...")
    resp = requests.get("https://tactics.tools/info/set-update", timeout=30,
                        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120"})
    resp.raise_for_status()
    cache_file.write_text(resp.text, encoding='utf-8')
    print(f"  Fetched {len(resp.text) // 1024}KB")
    return resp.text

# ─── Parse Traits ───────────────────────────────────────────

def parse_traits(soup):
    seen = {}
    for ti in soup.find_all('img', src=re.compile(r'trait-icons/new\d+_tft\d+_\w+_w\.svg')):
        m = re.search(r'tft(\d+)_(\w+)_w', ti['src'])
        if not m:
            continue
        trait_slug = m.group(2)
        trait_id = f"tft{m.group(1)}_{trait_slug}"
        if trait_id in seen:
            continue

        # Get trait name from sibling
        next_div = ti.find_next_sibling('div')
        name = html_mod.unescape(next_div.get_text(strip=True)) if next_div else trait_slug.title()

        icon_url = ti['src'].split('?')[0]
        if not icon_url.startswith('http'):
            icon_url = f"{TACTICS_TOOLS}{icon_url}"

        seen[trait_id] = {
            "id": trait_id,
            "name": name,
            "icon_url": icon_url,
            "slug": trait_slug,
        }

    return list(seen.values())

# ─── Parse Augments ─────────────────────────────────────────

def parse_augments(soup):
    seen = set()
    augments = []

    for ai in soup.find_all('img', src=re.compile(r'/augments/.*\.png')):
        src = ai['src'].split('?')[0]
        if src in seen:
            continue
        seen.add(src)

        m = re.search(r'/augments/(.+?)(\d*)\.png', src)
        if not m:
            continue

        raw_name = m.group(1)
        tier_str = m.group(2)
        tier = int(tier_str) if tier_str and tier_str in ('1', '2', '3') else None

        # Clean name
        name = raw_name.replace('%27', "'").replace('&#x27;', "'")
        name = html_mod.unescape(name)

        # Build icon URL
        icon_url = src
        if not icon_url.startswith('http'):
            icon_url = f"{TACTICS_TOOLS}{icon_url}"

        tier_name_map = {1: "Silver", 2: "Gold", 3: "Prismatic"}
        slug = raw_name.lower().replace(' ', '_').replace("'", '').replace('!', '')
        aug_id = f"tft{SET}_augment_{slug}"
        if tier:
            aug_id += f"_{tier}"

        augments.append({
            "id": aug_id,
            "name": name,
            "tier": tier,
            "tier_name": tier_name_map.get(tier),
            "icon_url": icon_url,
            "raw_filename": f"{raw_name}{tier_str}.png" if tier_str else f"{raw_name}.png",
        })

    return augments

# ─── Parse Items ────────────────────────────────────────────

def parse_items(soup):
    items = []
    seen = set()

    for ii in soup.find_all('img', src=re.compile(r'/items_s14/.*\.png')):
        m = re.search(r'/items_s14/(.+?)\.png', ii['src'])
        if not m:
            continue
        item_id = m.group(1)
        if item_id in seen:
            continue
        seen.add(item_id)

        src = ii['src'].split('?')[0]
        icon_url = src
        if not icon_url.startswith('http'):
            icon_url = f"{TACTICS_TOOLS}{icon_url}"

        # Generate readable name from ID
        name = item_id
        # Remove Set prefixes like "TFT17_"
        name = re.sub(r'^TFT\d+_', '', name)
        # Remove "EmblemItem" suffix
        name = name.replace('EmblemItem', ' Emblem')
        # CamelCase to spaces
        name = re.sub(r'([a-z])([A-Z])', r'\1 \2', name)
        name = name.strip()

        items.append({
            "id": f"TFT_Item_{item_id}" if not item_id.startswith('TFT') else item_id,
            "name": name,
            "icon_url": icon_url,
            "raw_filename": f"{item_id}.png",
        })

    return items

# ─── Download & build DB rows ──────────────────────────────

def download_and_build_traits(traits, dry_run=False):
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    rows = []
    dl_count = 0

    for t in traits:
        local_filename = f"trait_icon_{SET}_{t['slug']}.tft_set{SET}.svg"
        local_path = ASSETS_DIR / local_filename
        local_url = f"/tft-assets/{local_filename}"

        if not local_path.exists() or local_path.stat().st_size < 50:
            if not dry_run:
                if download_file(t['icon_url'], local_path):
                    dl_count += 1
                else:
                    # Try PNG fallback
                    png_url = t['icon_url'].replace('.svg', '.png')
                    local_filename = local_filename.replace('.svg', '.png')
                    local_path = ASSETS_DIR / local_filename
                    local_url = f"/tft-assets/{local_filename}"
                    if download_file(png_url, local_path):
                        dl_count += 1
                    else:
                        print(f"  FAIL trait: {t['name']}")

        rows.append({
            "id": t['id'],
            "name": t['name'],
            "description": "",
            "effects": [],
            "icon": local_url,
            "name_vi": None,
            "description_vi": None,
            "deleted_at": None,
        })

    print(f"  Downloaded {dl_count} trait icons")
    return rows

def download_and_build_augments(augments, dry_run=False):
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    rows = []
    dl_count = 0

    for a in augments:
        safe_name = re.sub(r'[^a-z0-9_-]', '', a['raw_filename'].lower().replace('.png', ''))
        local_filename = f"augment_{safe_name}.png"
        local_path = ASSETS_DIR / local_filename
        local_url = f"/tft-assets/{local_filename}"

        if not local_path.exists() or local_path.stat().st_size < 100:
            if not dry_run:
                if download_file(a['icon_url'], local_path):
                    dl_count += 1
                else:
                    print(f"  FAIL augment: {a['name']}")
            time.sleep(0.05)

        rows.append({
            "id": a['id'],
            "name": a['name'],
            "tier": a['tier'],
            "description": "",
            "icon": local_url,
            "tier_name": a.get('tier_name'),
            "name_vi": None,
            "description_vi": None,
            "deleted_at": None,
        })

    print(f"  Downloaded {dl_count} augment icons")
    return rows

def download_and_build_items(items, dry_run=False):
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    rows = []
    dl_count = 0

    for it in items:
        safe_name = re.sub(r'[^a-zA-Z0-9_-]', '', it['raw_filename'].replace('.png', ''))
        local_filename = f"item_{safe_name.lower()}.png"
        local_path = ASSETS_DIR / local_filename
        local_url = f"/tft-assets/{local_filename}"

        if not local_path.exists() or local_path.stat().st_size < 100:
            if not dry_run:
                if download_file(it['icon_url'], local_path):
                    dl_count += 1
                else:
                    print(f"  FAIL item: {it['name']}")
            time.sleep(0.05)

        rows.append({
            "id": it['id'],
            "name": it['name'],
            "description": "",
            "stats": None,
            "icon": local_url,
            "name_vi": None,
            "description_vi": None,
            "deleted_at": None,
        })

    print(f"  Downloaded {dl_count} item icons")
    return rows

# ─── Also update existing trait icons in DB ─────────────────

def update_existing_trait_icons(sb_url, sb_key, dry_run=False):
    """Update traits that were seeded as stubs with broken remote icon URLs."""
    headers = {
        "apikey": sb_key,
        "Authorization": f"Bearer {sb_key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }

    # List existing SVGs in assets dir
    existing = {}
    for f in ASSETS_DIR.iterdir():
        m = re.match(rf'trait_icon_{SET}_(\w+)\.tft_set{SET}\.(svg|png)', f.name)
        if m:
            existing[m.group(1)] = f"/tft-assets/{f.name}"

    # Update DB for Set17_ prefixed traits
    updated = 0
    for slug, local_url in existing.items():
        trait_id = f"Set17_{slug.title().replace(' ', '')}"
        if dry_run:
            print(f"  [DRY] {trait_id} -> {local_url}")
            updated += 1
            continue
        try:
            resp = requests.patch(
                f"{sb_url}/rest/v1/traits?id=eq.{trait_id}",
                headers=headers,
                json={"icon": local_url},
                timeout=10
            )
            if resp.status_code in (200, 204):
                updated += 1
        except Exception:
            pass
    print(f"  Updated {updated} existing trait icon URLs")

# ─── Main ───────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    # 1. Fetch HTML
    html_text = fetch_html()
    soup = BeautifulSoup(html_text, 'html.parser')

    # 2. Parse
    print("\n=== Parsing traits ===")
    traits = parse_traits(soup)
    print(f"  Found {len(traits)} traits")

    print("\n=== Parsing augments ===")
    augments = parse_augments(soup)
    print(f"  Found {len(augments)} augments")

    print("\n=== Parsing items ===")
    items = parse_items(soup)
    print(f"  Found {len(items)} items")

    # 3. Download icons & build DB rows
    print("\n=== Downloading trait icons ===")
    trait_rows = download_and_build_traits(traits, dry_run=args.dry_run)

    print("\n=== Downloading augment icons ===")
    augment_rows = download_and_build_augments(augments, dry_run=args.dry_run)

    print("\n=== Downloading item icons ===")
    item_rows = download_and_build_items(items, dry_run=args.dry_run)

    # 4. Upsert to Supabase
    sb_url, sb_key = get_supabase_config()
    if not sb_url or not sb_key:
        print("\n⚠️  Supabase config not found, skipping DB upsert")
        print("Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env")
    else:
        print("\n=== Upserting to Supabase ===")
        supabase_upsert(sb_url, sb_key, 'traits', trait_rows, dry_run=args.dry_run)
        supabase_upsert(sb_url, sb_key, 'augments', augment_rows, dry_run=args.dry_run)
        supabase_upsert(sb_url, sb_key, 'items', item_rows, dry_run=args.dry_run)

        # Also fix existing trait stubs with Set17_ prefix
        print("\n=== Updating existing trait icon URLs ===")
        update_existing_trait_icons(sb_url, sb_key, dry_run=args.dry_run)

    # 5. Save summary
    CACHE_DIR.mkdir(exist_ok=True)
    summary = {
        "traits": trait_rows,
        "augments": augment_rows,
        "items": item_rows,
    }
    (CACHE_DIR / "scraped_data.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f"\n✅ Done! Traits: {len(trait_rows)}, Augments: {len(augment_rows)}, Items: {len(item_rows)}")


if __name__ == '__main__':
    main()
