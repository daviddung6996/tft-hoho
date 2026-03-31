"""Fix HTML entities in champion names (local JSON + Supabase DB)."""
import html
import json
import os
import sys
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

import requests

REPO_ROOT = Path(__file__).resolve().parents[3]
CHAMPIONS_JSON = REPO_ROOT / "src" / "data" / "set17_champions.json"

# 1. Fix local JSON
data = json.loads(CHAMPIONS_JSON.read_text(encoding='utf-8'))
fixes = {}
for c in data['champions']:
    old = c['name']
    new = html.unescape(old)
    if old != new:
        fixes[c['apiName']] = new
        c['name'] = new
        print(f"  JSON: {old} -> {new}")
    if c.get('ability', {}).get('desc'):
        c['ability']['desc'] = html.unescape(c['ability']['desc'])

CHAMPIONS_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"Fixed {len(fixes)} names in local JSON\n")

# 2. Fix DB
env_path = REPO_ROOT / '.env'
if env_path.exists():
    for line in env_path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, _, v = line.partition('=')
            os.environ.setdefault(k.strip(), v.strip())

sb_url = os.environ.get('VITE_SUPABASE_URL', '').rstrip('/')
sb_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('VITE_SUPABASE_ANON_KEY')

if sb_url and sb_key and fixes:
    headers = {
        'apikey': sb_key,
        'Authorization': f'Bearer {sb_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
    }
    for api_id, name in fixes.items():
        resp = requests.patch(
            f'{sb_url}/rest/v1/champions?id=eq.{api_id}',
            headers=headers,
            json={'name': name},
            timeout=10
        )
        print(f"  DB: {api_id} -> {name}: HTTP {resp.status_code}")

print("\nDone!")
