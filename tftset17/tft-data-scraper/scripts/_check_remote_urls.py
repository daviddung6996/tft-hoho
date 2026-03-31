"""Check if any DB records still point to remote URLs instead of local assets."""
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
h = {"apikey": sb_key, "Authorization": f"Bearer {sb_key}"}

print("=== Champions (avatar) ===")
resp = requests.get(f"{sb_url}/rest/v1/champions?deleted_at=is.null&select=id,name,avatar&limit=5", headers=h, timeout=10)
for c in resp.json():
    avatar = c.get('avatar', '')
    is_local = avatar.startswith('/tft-assets/')
    print(f"  {'✅' if is_local else '❌'} {c['name']:20s} -> {avatar[:80]}")
total = requests.get(f"{sb_url}/rest/v1/champions?deleted_at=is.null&avatar=not.like./tft-assets/*&select=id", headers=h, timeout=10)
remote_count = len(total.json())
print(f"  Remote URLs remaining: {remote_count}")

print("\n=== Traits (icon) ===")
resp = requests.get(f"{sb_url}/rest/v1/traits?deleted_at=is.null&select=id,name,icon&limit=5", headers=h, timeout=10)
for t in resp.json():
    icon = t.get('icon', '')
    is_local = icon.startswith('/tft-assets/')
    print(f"  {'✅' if is_local else '❌'} {t['name']:20s} -> {icon[:80]}")
total = requests.get(f"{sb_url}/rest/v1/traits?deleted_at=is.null&icon=not.like./tft-assets/*&select=id", headers=h, timeout=10)
remote_count = len(total.json())
print(f"  Remote URLs remaining: {remote_count}")

print("\n=== Items (icon) ===")
resp = requests.get(f"{sb_url}/rest/v1/items?deleted_at=is.null&select=id,name,icon&limit=5", headers=h, timeout=10)
for i in resp.json():
    icon = i.get('icon', '')
    is_local = icon.startswith('/tft-assets/')
    print(f"  {'✅' if is_local else '❌'} {i['name']:20s} -> {icon[:80]}")
total = requests.get(f"{sb_url}/rest/v1/items?deleted_at=is.null&icon=not.like./tft-assets/*&select=id", headers=h, timeout=10)
remote_count = len(total.json())
print(f"  Remote URLs remaining: {remote_count}")

print("\n=== Augments (icon) ===")
resp = requests.get(f"{sb_url}/rest/v1/augments?deleted_at=is.null&select=id,name,icon&limit=5", headers=h, timeout=10)
for a in resp.json():
    icon = a.get('icon', '')
    is_local = icon.startswith('/tft-assets/')
    print(f"  {'✅' if is_local else '❌'} {a['name']:20s} -> {icon[:80]}")
total = requests.get(f"{sb_url}/rest/v1/augments?deleted_at=is.null&icon=not.like./tft-assets/*&select=id", headers=h, timeout=10)
remote_count = len(total.json())
print(f"  Remote URLs remaining: {remote_count}")
