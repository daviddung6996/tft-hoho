"""
Download TFT Set 17 champion face images + trait icons to public/tft-assets/
Then update Supabase avatar URLs to point to local assets.

Usage:
  python download_set17_assets.py [--update-db] [--dry-run]
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

try:
    import requests
except ImportError:
    print("ERROR: pip install requests")
    sys.exit(1)

SET = 17
REPO_ROOT = Path(__file__).resolve().parents[3]
ASSETS_DIR = REPO_ROOT / "public" / "tft-assets"
CHAMPIONS_JSON = REPO_ROOT / "src" / "data" / "set17_champions.json"
TACTICS_TOOLS = "https://ap.tft.tools"

def download_file(url, dest, retries=2):
    for attempt in range(retries + 1):
        try:
            r = requests.get(url, timeout=15)
            if r.status_code == 200 and len(r.content) > 100:
                dest.write_bytes(r.content)
                return True
            if attempt < retries:
                time.sleep(0.5)
        except Exception:
            if attempt < retries:
                time.sleep(1)
    return False

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
        return None, None
    return url, key

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--update-db', action='store_true', help='Update Supabase avatar URLs to local paths')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--traits', action='store_true', help='Also download trait icons')
    args = parser.parse_args()

    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    # Load champion data
    raw = json.loads(CHAMPIONS_JSON.read_text(encoding='utf-8'))
    champions = raw.get('champions', [])
    print(f"Found {len(champions)} champions in set17_champions.json\n")

    # Download champion faces
    print("=== Downloading champion face images ===")
    downloaded = 0
    skipped = 0
    failed = []
    champion_local_paths = {}

    for champ in champions:
        api_name = champ['apiName']
        name_lower = api_name.split('_', 1)[1].lower()
        local_filename = f"tft{SET}_{name_lower}_square.tft_set{SET}.png"
        local_path = ASSETS_DIR / local_filename

        # Try multiple URL patterns
        urls = [
            f"{TACTICS_TOOLS}/img/new{SET}/face/tft{SET}_{name_lower}.jpg",
            f"{TACTICS_TOOLS}/img/new{SET}/face/tft{SET}_{name_lower}.png",
        ]

        champion_local_paths[api_name] = f"/tft-assets/{local_filename}"

        if local_path.exists() and local_path.stat().st_size > 100:
            skipped += 1
            continue

        success = False
        for url in urls:
            if args.dry_run:
                print(f"  [DRY] {champ['name']} -> {local_filename}")
                success = True
                break
            if download_file(url, local_path):
                print(f"  OK {champ['name']} ({local_path.stat().st_size // 1024}KB)")
                downloaded += 1
                success = True
                break

        if not success and not args.dry_run:
            print(f"  FAIL {champ['name']} - tried: {urls[0]}")
            failed.append(champ['name'])

        time.sleep(0.1)  # Rate limit

    print(f"\nChampions: {downloaded} downloaded, {skipped} already exist, {len(failed)} failed")
    if failed:
        print(f"Failed: {', '.join(failed)}")

    # Download trait icons
    if args.traits:
        print("\n=== Downloading trait icons ===")
        all_traits = set()
        for c in champions:
            for t in c.get('traits', []):
                all_traits.add(t)

        trait_dl = 0
        trait_skip = 0
        for trait_name in sorted(all_traits):
            slug = trait_name.lower().replace('.', '').replace(' ', '').replace("'", '')
            local_filename = f"trait_icon_{SET}_{slug}.tft_set{SET}.svg"
            local_path = ASSETS_DIR / local_filename

            url = f"{TACTICS_TOOLS}/static/trait-icons/new{SET}_tft{SET}_{slug}_w.svg"

            if local_path.exists() and local_path.stat().st_size > 50:
                trait_skip += 1
                continue

            if args.dry_run:
                print(f"  [DRY] {trait_name} -> {local_filename}")
                trait_dl += 1
                continue

            if download_file(url, local_path):
                print(f"  OK {trait_name}")
                trait_dl += 1
            else:
                print(f"  FAIL {trait_name}")

            time.sleep(0.1)

        print(f"Traits: {trait_dl} downloaded, {trait_skip} already exist")

    # Update Supabase DB
    if args.update_db:
        print("\n=== Updating Supabase avatar URLs ===")
        sb_url, sb_key = get_supabase_config()
        if not sb_url:
            print("ERROR: Supabase config not found, skipping DB update")
            return

        headers = {
            "apikey": sb_key,
            "Authorization": f"Bearer {sb_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        }

        updated = 0
        for api_name, local_path in champion_local_paths.items():
            if args.dry_run:
                print(f"  [DRY] {api_name} -> {local_path}")
                updated += 1
                continue

            try:
                resp = requests.patch(
                    f"{sb_url}/rest/v1/champions?id=eq.{api_name}",
                    headers=headers,
                    json={"avatar": local_path},
                    timeout=10
                )
                if resp.status_code in (200, 204):
                    updated += 1
                else:
                    print(f"  FAIL {api_name}: HTTP {resp.status_code}")
            except Exception as e:
                print(f"  FAIL {api_name}: {e}")

        print(f"Updated {updated}/{len(champion_local_paths)} champion avatars in DB")

    print("\n✅ Done!")


if __name__ == '__main__':
    main()
