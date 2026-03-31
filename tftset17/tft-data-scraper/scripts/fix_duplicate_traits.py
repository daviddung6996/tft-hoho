"""Delete duplicate Set17_* traits, keep tft17_* ones."""
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

headers = {
    "apikey": sb_key,
    "Authorization": f"Bearer {sb_key}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# 1. Get all traits with Set17_ prefix
resp = requests.get(
    f"{sb_url}/rest/v1/traits?id=like.Set17_*&select=id,name",
    headers={"apikey": sb_key, "Authorization": f"Bearer {sb_key}"},
    timeout=15
)
set17_traits = resp.json()
print(f"Found {len(set17_traits)} traits with 'Set17_' prefix")

# 2. Hard-delete them (not soft-delete, since they're duplicates)
deleted = 0
for t in set17_traits:
    resp = requests.delete(
        f"{sb_url}/rest/v1/traits?id=eq.{t['id']}",
        headers=headers,
        timeout=10
    )
    if resp.status_code in (200, 204):
        deleted += 1
        print(f"  Deleted: {t['id']} ({t['name']})")
    else:
        print(f"  FAIL: {t['id']} - HTTP {resp.status_code}")

print(f"\nDeleted {deleted}/{len(set17_traits)} duplicate traits")
