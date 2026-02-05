import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CDRAGON_URL = "https://raw.communitydragon.org/latest/cdragon/tft/en_us.json";
const ICON_BASE_URL = "https://raw.communitydragon.org/latest/game/";

// Valid item categories
const VALID_ITEM_PATTERNS = {
    // Standard items (components + combined)
    standard: /^TFT_Item_/,
    // Ornn/Artifact items (from Set 4 and Set 9)
    ornnSet4: /^TFT4_Item_Ornn/,
    ornnSet9: /^TFT9_Item_Ornn/,
    // Radiant items
    radiant: /^TFT5_Item_Radiant/,
    // Set 16 Emblems (pattern: TFT16_Item_*EmblemItem)
    set16Emblem: /^TFT16_Item_.*EmblemItem$/,
    // Set 16 Darkin items (pattern: TFT16_TheDarkin*)
    set16Darkin: /^TFT16_TheDarkin/,
};

// Items that should NEVER be included (even if they match patterns above)
const BLACKLIST_KEYWORDS = [
    // Champion data (not items)
    'ChampionItem',
    // Augments
    'Augment',
    // Consumables and rewards
    'Consumable', 'Encounter', 'Loot', 'Orb', 'Anvil', 'Duplicator',
    'Tome', 'Key', 'Reforge', 'Remover', 'Chest',
    // Internal/debug
    'Admin', 'Debug', 'Tutorial', 'Tooltip', '_UI_', 'HyperRoll',
    'TFT_Assist_', 'MapSurface',
    // Set-specific mechanics (not equippable)
    'Quest', 'Explorer', 'Fortune', 'Arcana', 'Tarot', '_Card_', 'Fates',
    'CarouselOfChaos', // Special mode items
    'Desert', 'Oasis', 'Emperor', 'Faithful', 'Crumbling', 'Sacrificial',
    'Persistent', 'Artifact_Exc', 'Warmother', 'Time_Und', 'Trasmutable',
    'Ancient', 'Fateful', 'Ascended', 'Scale_Of', 'Rite_Of',
    // Bilgewater mechanics
    'BlackMarket', 'Brigand', 'Captain', 'Syren', 'Flintlock', 'Typhoon',
    'Spyglass', 'Citrus', 'Dreadway', 'Barknuckles', 'Doubloon', 'Cutthroat',
    'Blackmarket', 'Dead_Man', 'Lucky_',
    // Piltover/Zaun mechanics
    'Voltage', 'Micro-Rocket', 'Kinetic_Barrier', 'Magnetron', 'Gigantification',
    'Momentum_Drive', 'Blast_Shield', '90_Caliber', 'Overclocked', 'Continuum',
    'Tuned_Oscillator', 'EMP', 'Electrical_Over', 'Unstable_Core', 'Armor_Null',
    'Superior_Life', 'Mining_Drill', 'Echo_Engine', 'Acceleration_Gate',
    'Realm_Warp', 'Upgrade_',
    // Mercenary
    'Mercenary',
];

// Names that indicate non-equipment items
const NAME_BLACKLIST = [
    '@', '<', // Variable placeholders, HTML
    'tft_item_name_', 'TFT_item_name_', 'game_item_',
    'loot orb', 'component', 'completed item',
    'First One', 'Armor & Magic Resist', 'Attack Speed', 'Attack Damage',
    'Ability Power', 'Max Health', 'Restock', 'Gold', 'Split', 'Unusable',
    'Treasure Chest', 'Jammed', 'The Moon', 'The Chariot', 'The Lovers',
    'Judgment', 'The Emperor', '2-Costs',
];

function isValidEquipmentItem(item: any): boolean {
    const id = item.apiName || '';
    const name = item.name || '';

    // Must have id, name, and icon
    if (!id || !name || !item.icon) return false;

    // Check blacklist keywords in ID
    for (const keyword of BLACKLIST_KEYWORDS) {
        if (id.includes(keyword)) return false;
    }

    // Check blacklist in name
    for (const keyword of NAME_BLACKLIST) {
        if (name.includes(keyword)) return false;
        if (name.toLowerCase().startsWith(keyword.toLowerCase())) return false;
    }

    // Must match one of the valid patterns
    const isStandard = VALID_ITEM_PATTERNS.standard.test(id);
    const isOrnnSet4 = VALID_ITEM_PATTERNS.ornnSet4.test(id);
    const isOrnnSet9 = VALID_ITEM_PATTERNS.ornnSet9.test(id);
    const isRadiant = VALID_ITEM_PATTERNS.radiant.test(id);
    const isSet16Emblem = VALID_ITEM_PATTERNS.set16Emblem.test(id);
    const isSet16Darkin = VALID_ITEM_PATTERNS.set16Darkin.test(id);

    return isStandard || isOrnnSet4 || isOrnnSet9 || isRadiant || isSet16Emblem || isSet16Darkin;
}

async function fetchAndSeedItems() {
    console.log('Fetching data from Community Dragon...');
    const response = await fetch(CDRAGON_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const data = await response.json() as any;
    const items = data.items;

    console.log(`Found ${items.length} items from API.`);

    // Filter valid equipment items
    const validItems = items.filter(isValidEquipmentItem);
    console.log(`Filtered to ${validItems.length} valid equipment items.`);

    // Deduplicate by name (keep first occurrence)
    const seenNames = new Set<string>();
    const uniqueItems: any[] = [];
    for (const item of validItems) {
        const normalizedName = item.name.toLowerCase().trim();
        if (!seenNames.has(normalizedName)) {
            seenNames.add(normalizedName);
            uniqueItems.push(item);
        }
    }
    console.log(`After deduplication: ${uniqueItems.length} unique items.`);

    // Clear existing items to ensure clean state
    const { error: deleteError } = await supabase.from('items').delete().neq('id', '0');

    if (deleteError) {
        console.error('Error clearing items table:', deleteError.message);
    } else {
        console.log('Cleared existing items.');
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const item of uniqueItems) {
        // Convert relative icon path to absolute URL and fix extension
        let iconPath = item.icon.toLowerCase().replace(/\\/g, '/');
        if (iconPath.endsWith('.tex')) {
            iconPath = iconPath.replace('.tex', '.png');
        }

        const iconUrl = `${ICON_BASE_URL}${iconPath}`;

        const { error } = await supabase
            .from('items')
            .upsert({
                id: item.apiName,
                name: item.name,
                description: item.desc,
                stats: item.effects || {},
                icon: iconUrl
            }, { onConflict: 'id' });

        if (error) {
            console.error(`Error updating ${item.name} (${item.apiName}):`, error.message);
            errorCount++;
        } else {
            console.log(`Inserted: ${item.name}`);
            updatedCount++;
        }
    }

    console.log('-----------------------------------');
    console.log(`Sync Complete.`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);
}

fetchAndSeedItems().catch(console.error);
