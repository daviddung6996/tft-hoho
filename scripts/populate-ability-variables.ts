/**
 * Script to populate ability_variables from CommunityDragon API
 * Run with: npx ts-node scripts/populate-ability-variables.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface CDragonVariable {
    name: string;
    value: number[];
}

interface CDragonChampion {
    apiName: string;
    name: string;
    ability: {
        name: string;
        desc: string;
        variables: CDragonVariable[];
    };
}

interface CDragonData {
    setData: Array<{
        mutator: string;
        champions: CDragonChampion[];
    }>;
}

async function fetchCommunityDragonData(): Promise<CDragonData> {
    console.log('Fetching CommunityDragon TFT data...');
    const response = await fetch('https://raw.communitydragon.org/latest/cdragon/tft/en_us.json');
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    return response.json();
}

function findSet16Champions(data: CDragonData): CDragonChampion[] {
    // Find current set (TFT16 / Set 16)
    const set16 = data.setData.find(set =>
        set.mutator === 'TFTSet16' ||
        set.mutator === 'TFTSet16_Stage2'
    );

    if (!set16) {
        console.log('Available sets:', data.setData.map(s => s.mutator));
        throw new Error('Set 16 not found in data');
    }

    console.log(`Found set: ${set16.mutator} with ${set16.champions.length} champions`);
    return set16.champions;
}

async function populateAbilityVariables() {
    try {
        // 1. Fetch CommunityDragon data
        const cdData = await fetchCommunityDragonData();
        const champions = findSet16Champions(cdData);

        // 2. Get existing champions from our DB
        const { data: dbChampions, error: fetchError } = await supabase
            .from('champions')
            .select('id, name');

        if (fetchError) {
            throw new Error(`Failed to fetch champions: ${fetchError.message}`);
        }

        console.log(`Found ${dbChampions?.length} champions in DB`);

        // 3. Match and update each champion
        let updated = 0;
        let skipped = 0;

        for (const dbChamp of dbChampions || []) {
            // Find matching CDragon champion
            const cdChamp = champions.find(c =>
                c.apiName === dbChamp.id ||
                c.name.toLowerCase() === dbChamp.name.toLowerCase()
            );

            if (!cdChamp || !cdChamp.ability?.variables || cdChamp.ability.variables.length === 0) {
                console.log(`  Skipping ${dbChamp.name}: no ability variables`);
                skipped++;
                continue;
            }

            // Filter out empty/useless variables and format
            const variables = cdChamp.ability.variables
                .filter(v => {
                    // Check if it has meaningful values (not all zeros or all same)
                    const uniqueValues = new Set(v.value);
                    return uniqueValues.size > 1 || (uniqueValues.size === 1 && !uniqueValues.has(0));
                })
                .map(v => ({
                    name: v.name,
                    value: v.value.slice(0, 7) // Ensure 7 elements
                }));

            if (variables.length === 0) {
                console.log(`  Skipping ${dbChamp.name}: all variables are empty`);
                skipped++;
                continue;
            }

            // Update in DB
            const { error: updateError } = await supabase
                .from('champions')
                .update({ ability_variables: variables })
                .eq('id', dbChamp.id);

            if (updateError) {
                console.error(`  Failed to update ${dbChamp.name}: ${updateError.message}`);
            } else {
                console.log(`  ✓ Updated ${dbChamp.name} with ${variables.length} variables`);
                updated++;
            }
        }

        console.log('\n=== Summary ===');
        console.log(`Updated: ${updated}`);
        console.log(`Skipped: ${skipped}`);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Run the script
populateAbilityVariables();
