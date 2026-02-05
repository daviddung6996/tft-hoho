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

async function fetchAndSeedTraits() {
    console.log('Fetching TRAIT data from Community Dragon...');
    const response = await fetch(CDRAGON_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const data = await response.json() as any;
    const traits = data.setData.find((set: any) => set.mutator === 'TFTSet16').traits;

    console.log(`Found ${traits.length} traits for Set 16 from API.`);

    // Clear existing traits to ensure clean state
    const { error: deleteError } = await supabase.from('traits').delete().neq('id', '0');

    if (deleteError) {
        console.error('Error clearing traits table:', deleteError.message);
    } else {
        console.log('Cleared existing traits.');
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const trait of traits) {
        if (!trait.icon) continue;

        const id = trait.apiName;
        // Basic filtering: Start with TFT16_ to ensure Set 16 traits only.
        // Some set traits might not have TFT16 explicitly if they are generic, but usually they do.
        // Let's filter by ID prefix.
        if (!id.startsWith('TFT16_')) {
            // console.log(`Skipping non-Set16 trait: ${trait.name} (${id})`); 
            continue;
        }

        // Convert relative icon path to absolute URL and fix extension
        // Format: "ASSETS/Ux/TFT/Set16/Traits/..."
        let iconPath = trait.icon.toLowerCase().replace(/\\/g, '/');
        if (iconPath.endsWith('.tex')) {
            iconPath = iconPath.replace('.tex', '.png');
        }

        const iconUrl = `${ICON_BASE_URL}${iconPath}`;

        const { error } = await supabase
            .from('traits')
            .upsert({
                id: trait.apiName,
                name: trait.name,
                description: trait.desc,
                effects: trait.effects || [],
                icon: iconUrl
            }, { onConflict: 'id' });

        if (error) {
            console.error(`Error updating trait ${trait.name}:`, error.message);
            errorCount++;
        } else {
            console.log(`Inserted Trait: ${trait.name}`);
            updatedCount++;
        }
    }

    console.log('-----------------------------------');
    console.log(`Trait Sync Complete.`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);
}

fetchAndSeedTraits().catch(console.error);
