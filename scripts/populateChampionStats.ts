/**
 * Populate champion abilities and stats from Community Dragon API (Vietnamese)
 * Run with: npx tsx scripts/populateChampionStats.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

interface CDragonChampion {
    name: string;
    apiName: string;
    characterName: string;
    cost: number;
    traits: string[];
    stats: {
        hp: number;
        initialMana: number;
        mana: number;
        armor: number;
        magicResist: number;
        damage: number;
        attackSpeed: number;
        critChance: number;
        range: number;
    };
    ability: {
        name: string;
        desc: string;
        icon: string;
        variables: any[];
    };
}

async function fetchChampionsFromCDragon(): Promise<CDragonChampion[]> {
    console.log('🎯 Fetching from Community Dragon (Vietnamese)...');
    const response = await fetch('https://raw.communitydragon.org/latest/cdragon/tft/vi_vn.json');
    const data = await response.json();

    // Filter for Set 16 champions only
    const set16Champs = data.setData
        ?.find((set: any) => set.mutator === 'TFTSet16')
        ?.champions || [];

    console.log(`📊 Found ${set16Champs.length} Set 16 champions`);
    return set16Champs;
}

function calculateStarScaling(baseValue: number): [number, number, number] {
    // TFT scaling: 1★ = base, 2★ = 1.8x, 3★ = 3.24x (approximately)
    return [
        Math.round(baseValue),
        Math.round(baseValue * 1.8),
        Math.round(baseValue * 3.24)
    ];
}

async function updateChampionData() {
    const cdChamps = await fetchChampionsFromCDragon();

    // Get existing champions from DB
    const { data: dbChamps, error: fetchError } = await supabase
        .from('champions')
        .select('id, name');

    if (fetchError) {
        console.error('❌ Failed to fetch existing champions:', fetchError);
        return;
    }

    console.log(`📦 Found ${dbChamps?.length || 0} champions in DB`);

    let updated = 0;
    let notFound = 0;

    for (const cdChamp of cdChamps) {
        // Try to match by name or apiName
        const dbChamp = dbChamps?.find(
            c => c.name?.toLowerCase() === cdChamp.name?.toLowerCase() ||
                c.id?.toLowerCase().includes(cdChamp.apiName?.toLowerCase()?.replace('tft16_', ''))
        );

        if (!dbChamp) {
            console.log(`⚠️  No DB match for: ${cdChamp.name} (${cdChamp.apiName})`);
            notFound++;
            continue;
        }

        // Calculate star-scaled values
        const stats = {
            hp: calculateStarScaling(cdChamp.stats.hp),
            ad: calculateStarScaling(cdChamp.stats.damage),
            as: cdChamp.stats.attackSpeed,
            armor: cdChamp.stats.armor,
            mr: cdChamp.stats.magicResist,
            mana: {
                min: cdChamp.stats.initialMana,
                max: cdChamp.stats.mana
            },
            range: cdChamp.stats.range,
            dps: calculateStarScaling(Math.round(cdChamp.stats.damage * cdChamp.stats.attackSpeed))
        };

        const updates = {
            ability_name: cdChamp.ability?.name || null,
            ability_name_en: cdChamp.apiName?.replace('TFT16_', '') || null,
            ability_description: cdChamp.ability?.desc?.replace(/<[^>]*>/g, '') || null, // Strip HTML
            stats: stats
        };

        const { error: updateError } = await supabase
            .from('champions')
            .update(updates)
            .eq('id', dbChamp.id);

        if (updateError) {
            console.error(`❌ Error updating ${cdChamp.name}:`, updateError);
        } else {
            console.log(`✅ Updated ${cdChamp.name}`);
            updated++;
        }
    }

    console.log(`\n✨ Done! Updated ${updated} champions, ${notFound} not matched in DB`);
}

updateChampionData().catch(console.error);
