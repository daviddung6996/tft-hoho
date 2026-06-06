/**
 * Populate champion abilities and stats from the generated Set 17 artifact.
 * Run with: npx tsx scripts/populateChampionStats.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { mapArtifactChampionToDbChampion, Set17ArtifactChampion } from '../src/utils/set17ChampionSeed';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DATA_FILE = path.resolve(process.cwd(), 'src/data/set17_champions.json');

function readSet17Artifact(): Set17ArtifactChampion[] {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as { champions: Set17ArtifactChampion[] };
    return parsed.champions ?? [];
}

async function updateChampionData() {
    const artifactChampions = readSet17Artifact();

    const { data: dbChamps, error: fetchError } = await supabase
        .from('champions')
        .select('id, name');

    if (fetchError) {
        console.error('Failed to fetch existing champions:', fetchError);
        return;
    }

    console.log(`Found ${artifactChampions.length} Set 17 champions in artifact.`);
    console.log(`Found ${dbChamps?.length || 0} champions in DB.`);

    let updated = 0;
    let notFound = 0;

    for (const artifactChampion of artifactChampions) {
        const championData = mapArtifactChampionToDbChampion(artifactChampion);
        const dbChamp = dbChamps?.find(
            (champion) =>
                champion.id?.toLowerCase() === championData.id.toLowerCase() ||
                champion.name?.toLowerCase() === artifactChampion.name.toLowerCase()
        );

        if (!dbChamp) {
            console.log(`No DB match for: ${artifactChampion.name} (${championData.id})`);
            notFound++;
            continue;
        }

        const updates = {
            ability_name: championData.ability_name,
            ability_name_en: championData.ability_name_en,
            ability_description: championData.ability_description,
            ability_variables: championData.ability_variables,
            stats: championData.stats,
        };

        const { error: updateError } = await supabase
            .from('champions')
            .update(updates)
            .eq('id', dbChamp.id);

        if (updateError) {
            console.error(`Error updating ${artifactChampion.name}:`, updateError);
        } else {
            console.log(`Updated ${artifactChampion.name}`);
            updated++;
        }
    }

    console.log(`Done. Updated ${updated} champions, ${notFound} not matched in DB.`);
}

updateChampionData().catch((error) => {
    console.error(error);
    process.exit(1);
});
