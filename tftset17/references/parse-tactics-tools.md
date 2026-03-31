# Parse tactics.tools — DOM Parsing Guide

## Overview

tactics.tools/info/set-update is a Next.js SSR page. Data is embedded in:
1. `__NEXT_DATA__` script tag (partial — anomalies only as of Set 17)
2. HTML DOM elements (champions, traits, augments, items, gods)

Data is available BEFORE PBE opens. This is the earliest source.

## Step 0: Fetch

```bash
curl -s "https://tactics.tools/info/set-update" > set_update.html
```

File size ~500-600KB. Use BeautifulSoup + lxml for parsing.

```python
from bs4 import BeautifulSoup
import json, re

with open('set_update.html') as f:
    soup = BeautifulSoup(f.read(), 'lxml')
html_str = str(soup)
```

## Step 1: Extract __NEXT_DATA__

```python
match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html_str)
next_data = json.loads(match.group(1))
page_props = next_data['props']['pageProps']

# As of Set 17, pageProps contains:
# - anomalies: list of {id, title, type, desc, typ}
# Future sets may have different keys — always check first
```

## Step 2: Parse Champions

Each champion is a card with a `face_full_ultrawide` image.

```python
cards = soup.find_all('img', src=re.compile(r'face_full_ultrawide/TFT\d+_'))
```

### For each card, navigate to container:

```python
container = card_img.parent
for _ in range(7):
    if container.parent:
        container = container.parent
        if len(container.get_text(strip=True)) > 100:
            break
```

### Extract fields:

**id** — from image src:
```python
m = re.search(r'TFT(\d+)_(\w+)\.jpg', card_img['src'])
champ_id = f"TFT{m.group(1)}_{m.group(2)}"
```

**name** — first text in font-semibold div:
```python
header = container.find('div', class_=re.compile(r'font-semibold'))
name = header.find(string=True, recursive=False).strip()
```

**cost** — number before gold icon:
```python
gold_img = container.find('img', alt='gold')
cost_parent = gold_img.parent
cost = int(re.match(r'(\d)', cost_parent.get_text(strip=True)).group(1))
```

**traits** — from trait icon images:
```python
trait_imgs = container.find_all('img', src=re.compile(r'trait-icons/new\d+_tft\d+_'))
traits = []
for ti in trait_imgs:
    next_div = ti.find_next_sibling('div')
    tname = next_div.get_text(strip=True) if next_div else ''
    if tname and tname not in traits:
        traits.append(tname)
```

**avatar** — construct URL:
```python
avatar = f"https://ap.tft.tools/img/new{SET}/face/tft{SET}_{name.lower()}.jpg"
# Handle special names: AurelionSol → aurelionsol, ChoGath → chogath
```

**range** — after Range icon:
```python
range_img = container.find('img', title='Range')
range_div = range_img.find_next('div')
range_val = int(range_div.get_text(strip=True))
```

**ability_name + mana** — after ability icon:
```python
ability_img = container.find('img', src=re.compile(r'ability/TFT\d+_'))
text = ability_img.parent.get_text(strip=True)
mana_match = re.search(r'(\d+)/(\d+)$', text)
if mana_match:
    ability_name = text[:mana_match.start()].strip()
    mana_min = int(mana_match.group(1))
    mana_max = int(mana_match.group(2))
```

**ability_description** — div with damage/heal/shield keywords:
```python
for div in container.find_all('div'):
    t = div.get_text(strip=True)
    if 50 < len(t) < 600 and '/' in t:
        keywords = ['damage','heal','shield','gain','attack','magic','deal','cast','passive','active']
        if any(w in t.lower() for w in keywords):
            # Clean: remove role prefix, ability name prefix, mana prefix
            ability_desc = t
            break
```

**GOTCHA:** Ability descriptions contain template variables like `DamageAD`, `HealAP`, `Shield`. These are NOT numbers. The actual X/Y/Z scaling numbers appear near stat icons but are hard to associate with specific variables.

**scaling** — from stat type icons:
```python
stat_imgs = container.find_all('img', src=re.compile(r'/general/(ap|ad|hp|armor|mr|as|sv|dr|da)\.png'))
scaling = {}
for si in stat_imgs:
    stat_type = re.search(r'/general/(\w+)\.png', si['src']).group(1)
    parent = si.parent
    nums = re.findall(r'[\d.]+/[\d.]+/[\d.]+', parent.get_text())
    if nums:
        key = stat_type
        while key in scaling:
            key = f"{stat_type}_{len(scaling)}"
        scaling[key] = nums[0]
```

**role** — not a Supabase column but useful:
```python
role_div = container.find('div', class_=re.compile(r'bg-bg2'))
role = role_div.get_text(strip=True) if role_div else None
# Values: "Attack Tank", "Attack Carry", "Attack Fighter", "Attack Reaper",
#          "Magic Caster", "Magic Tank", "Magic Reaper", "Magic Fighter"
```

### Map to Supabase champions row:

```python
{
    "id": champ_id,
    "name": name,                     # English (Vietnamese comes from CDragon)
    "cost": cost,
    "traits": traits,                 # TEXT[] for Postgres
    "avatar": avatar_url,
    "stats": {
        "hp": None,                   # Not in HTML
        "ad": None,
        "as": None,
        "armor": None,
        "mr": None,
        "mana": {"min": mana_min, "max": mana_max},
        "range": range_val,
        "dps": None
    },
    "ability_name": None,             # Vietnamese — not in HTML
    "ability_name_en": ability_name,
    "ability_description": ability_desc,
    "ability": {
        "name": ability_name,
        "desc": ability_desc,
        "icon": f"https://ap.tft.tools/img/new{SET}/ability/{champ_id}.png",
        "variables": []               # Partial from scaling, full from CDragon
    },
    "ability_variables": [],
    "deleted_at": None
}
```

## Step 3: Parse Traits

```python
seen = {}
for ti in soup.find_all('img', src=re.compile(r'trait-icons/new\d+_tft\d+_\w+_w\.svg')):
    m = re.search(r'tft(\d+)_(\w+)_w', ti['src'])
    trait_id = f"tft{m.group(1)}_{m.group(2)}"
    if trait_id in seen:
        continue
    next_div = ti.find_next_sibling('div')
    name = next_div.get_text(strip=True) if next_div else m.group(2)
    seen[trait_id] = {
        "id": trait_id,
        "name": name,
        "description": None,          # Not in HTML
        "effects": None,              # Not in HTML
        "icon": ti['src'].split('?')[0],
        "name_vi": None,
        "description_vi": None,
        "deleted_at": None
    }
```

## Step 4: Parse Augments

```python
seen = set()
augments = []
for ai in soup.find_all('img', src=re.compile(r'/augments/.*\.png')):
    src = ai['src'].split('?')[0]
    if src in seen:
        continue
    seen.add(src)
    m = re.search(r'/augments/(.+?)(\d*)\.png', src)
    if m:
        name = m.group(1).replace('%27', "'").replace('&#x27;', "'").strip()
        tier = int(m.group(2)) if m.group(2) else 0
        tier_name_map = {1: "Silver", 2: "Gold", 3: "Prismatic"}
        augments.append({
            "id": f"tft{SET}_augment_{name.lower().replace(' ','_').replace('!','')}",
            "name": name,
            "tier": tier if tier in (1,2,3) else None,
            "description": None,
            "icon": f"https://ap.tft.tools{src}",
            "tier_name": tier_name_map.get(tier),
            "name_vi": None,
            "description_vi": None,
            "deleted_at": None
        })
```

**Note:** Augment IDs from HTML are generated (not official apiNames). CDragon will provide real IDs. Use `COALESCE` on upsert to avoid overwriting.

## Step 5: Parse Items

```python
items = []
seen = set()
for ii in soup.find_all('img', src=re.compile(r'/items_s14/.*\.png')):
    fname = re.search(r'/items_s14/(.+?)\.png', ii['src'])
    if fname and fname.group(1) not in seen:
        item_id = fname.group(1)
        seen.add(item_id)
        items.append({
            "id": item_id,
            "name": item_id.replace('EmblemItem','').replace('17',''),  # rough name
            "description": None,
            "stats": None,
            "icon": f"https://ap.tft.tools/img/items_s14/{item_id}.png",
            "name_vi": None,
            "description_vi": None,
            "deleted_at": None
        })
```

## Step 6: Parse Gods (Set 17 specific — bonus data)

Gods are not a Supabase table but useful for tftiseasy content.

```python
god_imgs = soup.find_all('img', src=re.compile(r'/gods/\w+\.png'))
gods = []
for gi in god_imgs:
    m = re.search(r'/gods/(\w+)\.png', gi['src'])
    god_name = m.group(1)
    # Navigate up to find offerings text
    parent = gi.parent
    for _ in range(8):
        if parent.parent and len(parent.get_text(strip=True)) < 200:
            parent = parent.parent
    raw_text = parent.get_text(separator='\n', strip=True)
    # Parse stages by splitting on "Stage X" and "4-7"
```

## Common Pitfalls

1. **Template variables in ability desc**: `DamageAD`, `HealAP` etc. are NOT numbers. Don't try to resolve them from HTML.
2. **Mana appended to ability name**: Always split with regex `(\d+)/(\d+)$`.
3. **Duplicate traits**: Same trait icon appears many times. Always deduplicate by trait_id.
4. **Champion name special cases**: `Cho'Gath` → `ChoGath` in URLs, `TahmKench` → single word, `TheMightyMech` = custom unit.
5. **Cost parsing**: Some cards have the cost number in unexpected positions. Always find `img[alt="gold"]` first, then look at its parent text.
6. **Container navigation**: Champion cards have nested divs. Going up 6-7 levels from the face image usually reaches the full card container.
7. **Scaling numbers inconsistency**: Not all champions have parseable scaling from DOM. Some render client-side only.
