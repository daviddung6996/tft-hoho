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

async function fetchAndSeedAugments() {
    console.log('Fetching AUGMENT data from Community Dragon...');
    const MAX_RETRIES = 3;
    let response;

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            console.log(`Attempt ${i + 1}/${MAX_RETRIES} to fetch data...`);
            // @ts-ignore
            response = await fetch(CDRAGON_URL, { timeout: 30000 }); // 30s timeout
            if (response.ok) break;
        } catch (err: any) {
            console.warn(`Fetch attempt ${i + 1} failed:`, err.message);
            if (i === MAX_RETRIES - 1) throw err;
            await new Promise(res => setTimeout(res, 2000)); // Wait 2s
        }
    }

    if (!response || !response.ok) {
        throw new Error(`Failed to fetch data: ${response?.statusText || 'Unknown error'}`);
    }
    const data = await response.json() as any;
    // AUGMENTS are technically "items" in the data structure mostly, but in the API they might be separate or mixed.
    // In typical CDragon output, augments are items with "Augment" property or specific classification.
    // However, looking at the previous select, we saw augments in the 'items' table?
    // Wait, the user wants them in the 'augments' table (seed_augments.ts).
    // The CDragon structure puts everything under 'items' usually.

    const allItems = data.items; // This contains Augments too usually.

    console.log(`Found ${allItems.length} total objects (potential augments) from API.`);

    // Clear existing augments
    const { error: deleteError } = await supabase.from('augments').delete().neq('id', '0');

    if (deleteError) {
        console.error('Error clearing augments table:', deleteError.message);
    } else {
        console.log('Cleared existing augments.');
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const item of allItems) {
        if (!item.icon) continue;

        const id = item.apiName;
        const name = item.name;

        // FILTER: Augments Only
        // Must contain 'Augment' in ID or match explicit filter

        // 1. Must be Set 16 Augment OR Standard Augment that is valid.
        // User asked for Set 16 specifically.
        // Set 16 augments usually start with TFT16_Augment_
        // Standard augments: TFT_Augment_ (generic ones like "Rich Get Richer")

        const isSet16Augment = id.startsWith('TFT16_Augment');
        const isStandardAugment = id.startsWith('TFT_Augment');

        // But user said "fetching a lot of non-related stuff". 
        // We should just stick to pure Augments.
        // Exclude "Augment_Selection" or "Augment_reroll" utility items.

        if (!isSet16Augment && !isStandardAugment) {
            continue;
        }

        if (id.includes('Selection') || id.includes('Reroll') || id.includes('Button')) continue;

        // Convert relative icon path
        let iconPath = item.icon.toLowerCase().replace(/\\/g, '/');
        if (iconPath.endsWith('.tex')) {
            iconPath = iconPath.replace('.tex', '.png');
        }
        const iconUrl = `${ICON_BASE_URL}${iconPath}`;

        // Determine Tier (Silver/Gold/Prismatic)
        // Usually in 'icon' path or specific property if available. 
        // CDragon sometimes has 'tier' or 'rank'.
        // Let's guess from icon name 'tier1', 'tier2', 'tier3' or '_i', '_ii', '_iii'
        let tier = 1;; // Default Silver
        let tierName = 'Silver';

        // Try to parse tier from icon name logic if property missing
        if (iconPath.includes('tier1') || iconPath.includes('_i.') || iconPath.includes('_i_')) { tier = 1; tierName = 'Silver'; }
        else if (iconPath.includes('tier2') || iconPath.includes('_ii.') || iconPath.includes('_ii_')) { tier = 2; tierName = 'Gold'; }
        else if (iconPath.includes('tier3') || iconPath.includes('_iii.') || iconPath.includes('_iii_')) { tier = 3; tierName = 'Prismatic'; }

        // Use mapped data for DB
        const { error } = await supabase
            .from('augments')
            .upsert({
                id: item.apiName,
                name: item.name,
                description: item.desc,
                tier: tier,
                tier_name: tierName,
                icon: iconUrl
            }, { onConflict: 'id' });

        if (error) {
            console.error(`Error updating augment ${item.name}:`, error.message);
            errorCount++;
        } else {
            // console.log(`Inserted Augment: ${item.name} (${tierName})`);
            updatedCount++;
        }
    }

    console.log('-----------------------------------');
    console.log(`Augment Sync Complete.`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);
}

fetchAndSeedAugments().catch(console.error);
