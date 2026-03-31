
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { mapArtifactChampionToDbChampion, resolveSupabaseSeedKey } from './set17ChampionSeed';
// Database types imported from supabase_types if needed

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = resolveSupabaseSeedKey({
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_FILE = path.resolve(process.cwd(), 'src/data/set17_champions.json');

interface RiotChampion {
    name: string;
    apiName: string;
    cost: number;
    traits: string[];
    icon: string;
    tileIcon: string;
    squareIcon: string;
    stats: {
        hp: number | null;
        mana: number | null;
        initialMana: number | null;
        damage: number | null;
        attackSpeed: number | null;
        armor: number | null;
        magicResist: number | null;
        range: number | null;
    };
    ability: {
        name: string | null;
        desc: string | null;
        icon: string | null;
        variables?: unknown[];
    };
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
            const championData = mapArtifactChampionToDbChampion(champ);

            const { data: existing } = await supabase
                .from('champions')
                .select('id')
                .eq('id', championData.id)
                .maybeSingle();

            if (!existing) {
                const { data: existingByName } = await supabase
                    .from('champions')
                    .select('id')
                    .eq('name', champ.name)
                    .maybeSingle();

                if (existingByName) {
                    const { error } = await supabase
                        .from('champions')
                        .update(championData)
                        .eq('id', existingByName.id);

                    if (error) throw error;
                    console.log(`Updated by name fallback: ${champ.name}`);
                    successCount++;
                    continue;
                }
            }


            if (existing) {
                // Update
                const { error } = await supabase
                    .from('champions')
                    .update(championData)
                    .eq('id', existing.id);

                if (error) throw error;
                console.log(`Updated: ${champ.name}`);
            } else {
                const { error } = await supabase
                    .from('champions')
                    .insert([championData]);

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
