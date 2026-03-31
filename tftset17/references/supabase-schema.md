# Supabase Schema Reference

Project ID: `jhhppdjjsxzzyfrvfgpr`

## Table: `champions`

| Column | Type | Required | Notes |
|---|---|---|---|
| `id` | TEXT PK | YES | `"TFT17_Aatrox"` — apiName from CDragon |
| `name` | TEXT | YES | Vietnamese name preferred, fallback English |
| `cost` | INTEGER | YES | 1-5 |
| `traits` | TEXT[] | NO | Postgres array: `{"N.O.V.A.", "Bastion"}` |
| `avatar` | TEXT | NO | Face image URL |
| `ability` | JSONB | NO | Full ability object (see below) |
| `stats` | JSONB | NO | Stats object (see below) |
| `ability_name` | TEXT | NO | Vietnamese ability name |
| `ability_name_en` | TEXT | NO | English ability name |
| `ability_description` | TEXT | NO | Full description text |
| `ability_variables` | JSONB | NO | `[]` array of scaling variables, default `[]` |
| `deleted_at` | TIMESTAMPTZ | NO | NULL = active, set timestamp for soft delete |

### stats JSONB structure

```json
{
  "hp": [800, 1440, 2592],
  "ad": [60, 90, 135],
  "as": 0.75,
  "armor": 40,
  "mr": 40,
  "mana": {"min": 30, "max": 90},
  "range": 1,
  "dps": [45, 67, 101]
}
```

- `hp` = array [1-star, 2-star, 3-star]. Scale: base, base×1.8, base×3.24
- `ad` = array [1-star, 2-star, 3-star]. Scale: base, base×1.5, base×2.7
- `as` = float attack speed
- `armor`, `mr` = flat integer
- `mana.min` = starting mana, `mana.max` = total mana to cast
- `range` = integer hex range
- `dps` = array [1★, 2★, 3★]. Calculate: ad[n] × as

### ability JSONB structure

```json
{
  "name": "Stellar Slash",
  "desc": "Heal HealAP (), then deal DamageAD + DamagePercentArmor () physical damage to the current target.",
  "icon": "https://ap.tft.tools/img/new17/ability/TFT17_Aatrox.png",
  "variables": [
    {"name": "HealAP", "values": [0, 150, 225, 350]},
    {"name": "DamageAD", "values": [0, 200, 300, 450]},
    {"name": "DamagePercentArmor", "values": [0, 250, 375, 550]}
  ]
}
```

- `variables[].values` = [placeholder_0, 1-star, 2-star, 3-star]
- First value (index 0) is usually 0 or a placeholder
- `desc` may contain template variable names that reference `variables[].name`

### ability_variables JSONB structure

Same as `ability.variables` — duplicated at top level for easy querying:
```json
[
  {"name": "HealAP", "values": [0, 150, 225, 350]},
  {"name": "DamageAD", "values": [0, 200, 300, 450]}
]
```

## Table: `traits`

| Column | Type | Required | Notes |
|---|---|---|---|
| `id` | TEXT PK | YES | `"TFT17_Nova"` or `"tft17_nova"` |
| `name` | TEXT | YES | English name: `"N.O.V.A."` |
| `description` | TEXT | NO | English description of trait effect |
| `effects` | JSONB | NO | Breakpoint effects array (see below) |
| `icon` | TEXT | NO | SVG icon URL |
| `name_vi` | TEXT | NO | Vietnamese name |
| `description_vi` | TEXT | NO | Vietnamese description |
| `deleted_at` | TIMESTAMPTZ | NO | Soft delete |

### effects JSONB structure

```json
[
  {"minUnits": 2, "maxUnits": 3, "desc": "Your team gains 12 Armor and MR. Bastions gain more."},
  {"minUnits": 4, "maxUnits": 5, "desc": "AND the value doubles in the first 10 seconds."},
  {"minUnits": 6, "maxUnits": 25, "desc": "AND Bastions gain even more."}
]
```

## Table: `augments`

| Column | Type | Required | Notes |
|---|---|---|---|
| `id` | TEXT PK | YES | apiName: `"TFT17_Augment_Bonk"` |
| `name` | TEXT | YES | English: `"Bonk!"` |
| `tier` | INTEGER | NO | 1=Silver, 2=Gold, 3=Prismatic. CHECK(1,2,3) |
| `description` | TEXT | NO | English effect description |
| `icon` | TEXT | NO | Image URL |
| `tier_name` | TEXT | NO | `"Silver"` / `"Gold"` / `"Prismatic"` |
| `name_vi` | TEXT | NO | Vietnamese name |
| `description_vi` | TEXT | NO | Vietnamese description |
| `deleted_at` | TIMESTAMPTZ | NO | Soft delete |

### tier mapping
```
1 → "Silver"
2 → "Gold"  
3 → "Prismatic"
```

## Table: `items`

| Column | Type | Required | Notes |
|---|---|---|---|
| `id` | TEXT PK | YES | apiName: `"TFT_Item_InfinityEdge"` |
| `name` | TEXT | YES | English: `"Infinity Edge"` |
| `description` | TEXT | NO | Effect description |
| `stats` | JSONB | NO | Stat bonuses (see below) |
| `icon` | TEXT | NO | Image URL |
| `name_vi` | TEXT | NO | Vietnamese name |
| `description_vi` | TEXT | NO | Vietnamese description |
| `deleted_at` | TIMESTAMPTZ | NO | Soft delete |

### stats JSONB structure

```json
{"ad": 10, "crit": 20, "critDamage": 40}
```

Possible keys: `ad`, `ap`, `as`, `armor`, `mr`, `hp`, `mana`, `crit`, `critDamage`, `omnivamp`, `range`.

## Upsert Strategy

Use Supabase upsert with `id` as conflict key:

```sql
INSERT INTO champions (id, name, cost, traits, avatar, stats, ability, ability_name, ability_name_en, ability_description, ability_variables)
VALUES (...)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  cost = EXCLUDED.cost,
  traits = EXCLUDED.traits,
  avatar = EXCLUDED.avatar,
  stats = COALESCE(EXCLUDED.stats, champions.stats),
  ability = COALESCE(EXCLUDED.ability, champions.ability),
  ability_name = COALESCE(EXCLUDED.ability_name, champions.ability_name),
  ability_name_en = COALESCE(EXCLUDED.ability_name_en, champions.ability_name_en),
  ability_description = COALESCE(EXCLUDED.ability_description, champions.ability_description),
  ability_variables = COALESCE(EXCLUDED.ability_variables, champions.ability_variables),
  deleted_at = NULL;
```

Use `COALESCE` so Phase 1 (partial) data does not overwrite Phase 2 (complete) data with nulls. Phase 2 overwrites everything.

## Set Rotation: Soft Delete

When a new set launches, soft-delete old set champions:
```sql
UPDATE champions SET deleted_at = now() WHERE id LIKE 'TFT16_%';
UPDATE traits SET deleted_at = now() WHERE id LIKE 'TFT16_%' OR id LIKE 'tft16_%';
UPDATE augments SET deleted_at = now() WHERE id LIKE 'TFT16_%';
```
