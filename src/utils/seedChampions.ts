
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
// Database types imported from supabase_types if needed

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_FILE = path.resolve(process.cwd(), 'src/data/set16_champions.json');

interface RiotChampion {
    name: string;
    apiName: string;
    cost: number;
    traits: string[];
    icon: string;
    tileIcon: string;
    squareIcon: string;
    stats: {
        hp: number;
        mana: number;
        initialMana: number;
        damage: number;
        attackSpeed: number;
        armor: number;
        magicResist: number;
        range: number;
    };
    ability: {
        name: string;
        desc: string;
        icon: string;
    };
}

const CDRAGON_URL_BASE = 'https://raw.communitydragon.org/latest/game/';

function formatIconUrl(path: string): string {
    if (!path) return '';
    // Convert "ASSETS/Characters/..." to lowercase and replace .tex with .png
    // Remove "ASSETS/" prefix if double (CommunityDragon path usually starts after ASSETS/ or game/assets)
    // Actually CommunityDragon raw usually maps 'game/assets' correctly.
    // The JSON paths start with "ASSETS/...".
    // CDragon URL: https://raw.communitydragon.org/latest/game/assets/characters/...

    let cleanPath = path.toLowerCase().replace('.tex', '.png');

    // If it starts with assets/, it maps to game/assets/
    // We can just prepend appropriate base.

    return CDRAGON_URL_BASE + cleanPath;
}

async function seedChampions() {
    console.log('Starting champion seeding...');

    if (!fs.existsSync(DATA_FILE)) {
        console.error(`Data file not found: ${DATA_FILE}`);
        process.exit(1);
    }

    const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
    const { champions } = JSON.parse(rawData) as { champions: RiotChampion[] };

    console.log(`Found ${champions.length} champions in source file.`);

    let successCount = 0;
    let errorCount = 0;

    for (const champ of champions) {
        try {
            // Check if champion exists by name
            const { data: existing } = await supabase
                .from('champions')
                .select('id')
                .eq('name', champ.name)
                .single();

            const championData = {
                name: champ.name,
                cost: champ.cost,
                traits: champ.traits,
                avatar: formatIconUrl(champ.tileIcon || champ.squareIcon || champ.icon), // Prefer tileIcon (Square) for HUD
                stats: champ.stats,
                ability: champ.ability
            };

            if (existing) {
                // Update
                const { error } = await supabase
                    .from('champions')
                    .update(championData)
                    .eq('id', existing.id);

                if (error) throw error;
                console.log(`Updated: ${champ.name}`);
            } else {
                // Insert - Need to generate ID
                // Node.js crypto global is available in recent versions, or use 'crypto' module
                // Since we are using tsx/node, we can try native global crypto or import it.
                // Let's assume global crypto is available or use a fallback.
                const { error } = await supabase
                    .from('champions')
                    .insert([{ ...championData, id: champ.apiName }]);

                if (error) throw error;
                console.log(`Inserted: ${champ.name}`);
            }

            successCount++;
        } catch (err: any) {
            console.error(`Error processing ${champ.name}:`, err.message);
            errorCount++;
        }
    }

    console.log(`Seeding complete. Success: ${successCount}, Errors: ${errorCount}`);
}

seedChampions().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
});
