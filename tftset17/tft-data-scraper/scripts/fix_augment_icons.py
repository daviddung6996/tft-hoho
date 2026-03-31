"""Set default placeholder icon for augments that have no real icon."""
import os, sys, requests
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

REPO_ROOT = Path(__file__).resolve().parents[3]
env_path = REPO_ROOT / '.env'
if env_path.exists():
    for line in env_path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, _, v = line.partition('=')
            os.environ.setdefault(k.strip(), v.strip())

sb_url = os.environ.get('VITE_SUPABASE_URL', '').rstrip('/')
sb_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('VITE_SUPABASE_ANON_KEY')

DEFAULT_ICON = "/tft-assets/augment_default.svg"
ASSETS_DIR = REPO_ROOT / "public" / "tft-assets"

headers = {
    "apikey": sb_key,
    "Authorization": f"Bearer {sb_key}",
    "Content-Type": "application/json",
}

# Get all augments
resp = requests.get(
    f"{sb_url}/rest/v1/augments?deleted_at=is.null&select=id,name,icon",
    headers={"apikey": sb_key, "Authorization": f"Bearer {sb_key}"},
    timeout=15
)
augments = resp.json()
print(f"Total augments: {len(augments)}")

# Check which ones have broken icons (file doesn't exist locally)
updated = 0
for aug in augments:
    icon = aug.get('icon', '')
    
    # Check if icon file exists locally
    if icon.startswith('/tft-assets/'):
        local_file = ASSETS_DIR / icon.replace('/tft-assets/', '')
        if local_file.exists() and local_file.stat().st_size > 50:
            continue  # Has real icon
    
    # Update to default
    resp = requests.patch(
        f"{sb_url}/rest/v1/augments?id=eq.{aug['id']}",
        headers={**headers, "Prefer": "return=minimal"},
        json={"icon": DEFAULT_ICON},
        timeout=10
    )
    if resp.status_code in (200, 204):
        updated += 1
        print(f"  {aug['name']:30s} -> default icon")

print(f"\nUpdated {updated}/{len(augments)} augments to use default placeholder icon")
