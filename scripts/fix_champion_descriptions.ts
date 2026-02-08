/**
 * Fix champion ability descriptions in DB
 * Resolves @Variable@ placeholders with actual values from Community Dragon
 * Strips HTML tags and formatting codes
 *
 * Run: npx tsx scripts/fix_champion_descriptions.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

// Fetch Vietnamese TFT data from Community Dragon
async function fetchVietnameseChampions(): Promise<CDragonChampion[]> {
    console.log('Fetching Vietnamese data from Community Dragon...');
    const response = await fetch('https://raw.communitydragon.org/latest/cdragon/tft/vi_vn.json');
    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
    const data = await response.json();

    // Find Set 16 champions
    const set16 = data.setData?.find((s: any) =>
        s.mutator === 'TFTSet16' || s.mutator === 'TFTSet16_Stage2'
    );
    if (!set16) {
        console.log('Available sets:', data.setData?.map((s: any) => s.mutator));
        throw new Error('Set 16 not found');
    }
    console.log(`Found ${set16.champions.length} champions in CDragon vi_vn`);
    return set16.champions;
}

// Format a number for display
function formatNum(val: number): string {
    if (val === 0) return '0';
    // Percentages (0 < val < 1) → show as percentage
    if (val > 0 && val < 1 && val !== Math.floor(val)) {
        const pct = val * 100;
        if (Number.isInteger(pct)) return String(pct) + '%';
        return String(Math.round(pct * 10) / 10) + '%';
    }
    if (Number.isInteger(val)) return String(val);
    return String(Math.round(val * 100) / 100);
}

// Format star-level values: "val1/val2/val3" or single value if constant
function formatStarValues(values: number[]): string {
    // Star levels: index 1 = 1★, index 2 = 2★, index 3 = 3★
    const v1 = values[1] ?? 0;
    const v2 = values[2] ?? 0;
    const v3 = values[3] ?? 0;

    // If all same, show single value
    if (v1 === v2 && v2 === v3) {
        return formatNum(v1);
    }
    return `${formatNum(v1)}/${formatNum(v2)}/${formatNum(v3)}`;
}

// Resolve @Variable@ placeholders in description using ability variables
function resolveDescription(desc: string, variables: CDragonVariable[]): string {
    if (!desc) return '';

    // Build variable lookup map (case-insensitive)
    const varMap = new Map<string, CDragonVariable>();
    for (const v of variables) {
        varMap.set(v.name.toLowerCase(), v);
    }

    // 1. Handle @Var*100@ patterns (percentage conversions)
    let resolved = desc.replace(/@(\w+)\*100@/g, (_match, varName: string) => {
        const v = findVariable(varName, varMap, variables);
        if (v) {
            const scaled = v.value.map(val => val * 100);
            return formatStarValues(scaled);
        }
        return '';
    });

    // 2. Handle @Variable@ patterns
    resolved = resolved.replace(/@(\w+)@/g, (_match, varName: string) => {
        const v = findVariable(varName, varMap, variables);
        if (v) {
            return formatStarValues(v.value);
        }
        // Try "Total" prefix → sum AD + AP components
        if (varName.toLowerCase().startsWith('total')) {
            const baseName = varName.substring(5); // Remove "Total"
            const adVar = findVariable('AD' + baseName, varMap, variables)
                || findVariable('ad' + baseName, varMap, variables);
            const apVar = findVariable('AP' + baseName, varMap, variables)
                || findVariable('ap' + baseName, varMap, variables);
            if (adVar && apVar) {
                const summed = adVar.value.map((val, i) => val + (apVar.value[i] || 0));
                return formatStarValues(summed);
            }
            // If only one found, use it
            if (adVar) return formatStarValues(adVar.value);
            if (apVar) return formatStarValues(apVar.value);
        }
        return '';
    });

    // 3. Clean up remaining @@ artifacts
    resolved = resolved.replace(/@+/g, '');

    // 4. Replace %i:scaleAP%, %i:scaleAD%, %i:scaleMana%, etc with readable text
    resolved = resolved.replace(/%i:scaleAP%/g, ' ST Phép');
    resolved = resolved.replace(/%i:scaleAD%/g, ' ST Vật lý');
    resolved = resolved.replace(/%i:scaleMana%/g, ' Năng lượng');
    resolved = resolved.replace(/%i:scaleAS%/g, ' Tốc đánh');
    resolved = resolved.replace(/%i:scaleHP%/g, ' Máu');
    resolved = resolved.replace(/%i:scaleArmor%/g, ' Giáp');
    resolved = resolved.replace(/%i:scaleMR%/g, ' Kháng phép');
    resolved = resolved.replace(/%i:TFTBaseAD%/g, ' ST Vật lý');
    resolved = resolved.replace(/%i:TFTBaseAP%/g, ' ST Phép');
    resolved = resolved.replace(/%i:TFT\w+%/g, ''); // Remove any remaining TFT markers
    resolved = resolved.replace(/%i:scale\w+%/g, ''); // Remove any remaining scale markers
    resolved = resolved.replace(/%i:\w+%/g, ''); // Remove any remaining %i:*% markers

    // 5. Replace {{TFT_Keyword_*}} with Vietnamese keyword names
    const keywordMap: Record<string, string> = {
        'TFT_Keyword_Shred': 'Cào Xé',
        'TFT_Keyword_Chill': 'Tê Tái',
        'TFT_Keyword_Burn': 'Thiêu Đốt',
        'TFT_Keyword_Wound': 'Vết Thương Sâu',
        'TFT_Keyword_Sunder': 'Phá Giáp',
        'TFT_Keyword_Mana_Reave': 'Hút Năng Lượng',
        'TFT_Keyword_Omnivamp': 'Hút Máu Toàn Phần',
    };
    resolved = resolved.replace(/\{\{(\w+)\}\}/g, (_match, keyword: string) => {
        return keywordMap[keyword] || '';
    });

    // 6. Remove TFTUnitProperty references (dynamic runtime properties)
    resolved = resolved.replace(/TFTUnitProperty\.[^)\s,]*/g, '');
    resolved = resolved.replace(/TFTUnitProperty\S*/g, '');

    // 7. Clean HTML tags but keep content
    resolved = resolved.replace(/<br\s*\/?>/gi, '\n');
    resolved = resolved.replace(/<[^>]+>/g, '');

    // 8. Clean &nbsp; and other HTML entities
    resolved = resolved.replace(/&nbsp;/g, ' ');
    resolved = resolved.replace(/&amp;/g, '&');
    resolved = resolved.replace(/&lt;/g, '<');
    resolved = resolved.replace(/&gt;/g, '>');

    // 9. Clean up extra whitespace and formatting
    resolved = resolved.replace(/\(\s*\)/g, ''); // Remove empty parentheses
    resolved = resolved.replace(/\([^)]*:\s*,\s*[^)]*\)/g, ''); // Remove "(Label: , Label2)" empty refs
    resolved = resolved.replace(/\([^)]*:\s*\)/g, ''); // Remove "(Label:)" empty refs
    resolved = resolved.replace(/\(\s+/g, '(');
    resolved = resolved.replace(/\s+\)/g, ')');
    resolved = resolved.replace(/:\s*\)/g, ')'); // Clean ": )" artifacts
    resolved = resolved.replace(/  +/g, ' ');
    resolved = resolved.split('\n').map(l => l.trim()).join('\n');
    resolved = resolved.replace(/\n{3,}/g, '\n\n');

    // 10. Remove duplicate content (CDragon sometimes doubles lines or inline content)
    const lines = resolved.split('\n');
    const dedupedLines: string[] = [];
    for (const line of lines) {
        // Check if this line is a doubled version of itself (e.g., "25: text25: text")
        const half = Math.floor(line.length / 2);
        if (line.length > 20 && line.substring(0, half) === line.substring(half)) {
            dedupedLines.push(line.substring(0, half));
        } else {
            // Check for "SectionA: textSectionA: text" pattern (bond descriptions)
            // Find repeated prefix patterns like "Huynh Đệ Kiếm Sư: ..."
            const colonIdx = line.indexOf(':');
            if (colonIdx > 0 && colonIdx < 40) {
                const prefix = line.substring(0, colonIdx + 1);
                const secondOccurrence = line.indexOf(prefix, colonIdx + 1);
                if (secondOccurrence > colonIdx) {
                    // Take only the second (more detailed) version
                    dedupedLines.push(line.substring(secondOccurrence));
                } else {
                    dedupedLines.push(line);
                }
            } else {
                dedupedLines.push(line);
            }
        }
    }
    resolved = dedupedLines.join('\n');

    // 11. Remove standalone keyword lines at the end (orphaned keyword names)
    const keywordValues = Object.values(keywordMap);
    resolved = resolved.split('\n').filter(line => {
        const trimmed = line.trim();
        return !keywordValues.includes(trimmed);
    }).join('\n');

    resolved = resolved.trim();

    return resolved;
}

// Find a variable by name with multiple matching strategies
function findVariable(
    varName: string,
    varMap: Map<string, CDragonVariable>,
    variables: CDragonVariable[]
): CDragonVariable | undefined {
    const lower = varName.toLowerCase();

    // 1. Exact match (case-insensitive)
    if (varMap.has(lower)) return varMap.get(lower);

    // 2. Remove "Modified" prefix
    if (lower.startsWith('modified')) {
        const base = lower.substring(8);
        if (varMap.has(base)) return varMap.get(base);
        // Try with common suffixes
        for (const [key, v] of varMap) {
            if (key === base || key.endsWith(base) || base.endsWith(key)) return v;
        }
    }

    // 3. Remove "Total" prefix
    if (lower.startsWith('total')) {
        const base = lower.substring(5);
        if (varMap.has(base)) return varMap.get(base);
        for (const [key, v] of varMap) {
            if (key === base || key.endsWith(base)) return v;
        }
    }

    // 4. Remove "Bonus" prefix
    if (lower.startsWith('bonus')) {
        const base = lower.substring(5);
        if (varMap.has(base)) return varMap.get(base);
    }

    // 5. Partial match - variable name contains or is contained in varName
    for (const [key, v] of varMap) {
        if (key.includes(lower) || lower.includes(key)) return v;
    }

    return undefined;
}

async function main() {
    try {
        // 1. Fetch Vietnamese champion data from Community Dragon
        const cdChampions = await fetchVietnameseChampions();

        // Build lookup by apiName and name
        const cdByApi = new Map<string, CDragonChampion>();
        const cdByName = new Map<string, CDragonChampion>();
        for (const c of cdChampions) {
            cdByApi.set(c.apiName.toLowerCase(), c);
            cdByName.set(c.name.toLowerCase(), c);
        }

        // 2. Get all champions from DB
        const { data: dbChampions, error } = await supabase
            .from('champions')
            .select('id, name, ability_name, ability_description');

        if (error) throw error;
        console.log(`Found ${dbChampions?.length} champions in DB`);

        // 3. Update each champion
        let updated = 0;
        let skipped = 0;
        const issues: string[] = [];

        for (const dbChamp of dbChampions || []) {
            // Find matching CDragon champion
            const cdChamp = cdByApi.get(dbChamp.id.toLowerCase())
                || cdByName.get(dbChamp.name.toLowerCase());

            if (!cdChamp) {
                console.log(`  ✗ No CDragon match for: ${dbChamp.name} (${dbChamp.id})`);
                skipped++;
                continue;
            }

            const viDesc = cdChamp.ability.desc;
            const viAbilityName = cdChamp.ability.name?.trim();
            const vars = cdChamp.ability.variables || [];

            if (!viDesc) {
                console.log(`  ✗ No description for: ${dbChamp.name}`);
                skipped++;
                continue;
            }

            // Resolve the Vietnamese description
            const resolvedDesc = resolveDescription(viDesc, vars);

            // Check if still has unresolved vars
            if (resolvedDesc.includes('@')) {
                issues.push(`${dbChamp.name}: still has @vars@ → ${resolvedDesc.substring(0, 100)}`);
            }

            // Build update payload
            const updateData: Record<string, any> = {
                ability_description: resolvedDesc
            };

            // Also update ability_name if CDragon has Vietnamese name
            if (viAbilityName) {
                updateData.ability_name = viAbilityName;
            }

            // Update DB
            const { error: updateError } = await supabase
                .from('champions')
                .update(updateData)
                .eq('id', dbChamp.id);

            if (updateError) {
                console.log(`  ✗ Failed to update ${dbChamp.name}: ${updateError.message}`);
            } else {
                console.log(`  ✓ ${dbChamp.name}: ${viAbilityName || ''}`);
                console.log(`    ${resolvedDesc.substring(0, 120)}...`);
                updated++;
            }
        }

        console.log('\n=== Summary ===');
        console.log(`Updated: ${updated}`);
        console.log(`Skipped: ${skipped}`);

        if (issues.length > 0) {
            console.log(`\n=== Issues (still has @vars@): ${issues.length} ===`);
            for (const issue of issues) {
                console.log(`  ${issue}`);
            }
        }

        // 4. Verify - check for remaining @ signs
        const { data: allChamps } = await supabase
            .from('champions')
            .select('name, ability_description');

        if (allChamps) {
            const stillBad = allChamps.filter(c =>
                c.ability_description && (
                    c.ability_description.includes('@') ||
                    c.ability_description.includes('%i:')
                )
            );
            console.log(`\nChampions still with placeholders: ${stillBad.length}`);
            for (const c of stillBad) {
                console.log(`  ${c.name}: ${c.ability_description?.substring(0, 80)}`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

main();
