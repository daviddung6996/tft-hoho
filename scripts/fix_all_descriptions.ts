/**
 * Fix placeholder variables in traits, items, and augments descriptions
 * Fetches Vietnamese data from Community Dragon and resolves all placeholders
 *
 * Run: npx tsx scripts/fix_all_descriptions.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ===== SHARED CLEANUP FUNCTIONS =====

function cleanDescription(desc: string): string {
    if (!desc) return '';
    let r = desc;

    // 1. Replace %i:scale*% with readable text
    r = r.replace(/%i:scaleAP%/g, ' ST Phép');
    r = r.replace(/%i:scaleAD%/g, ' ST Vật lý');
    r = r.replace(/%i:scaleMana%/g, ' Năng lượng');
    r = r.replace(/%i:scaleAS%/g, ' Tốc đánh');
    r = r.replace(/%i:scaleHP%/g, ' Máu');
    r = r.replace(/%i:scaleHealth%/g, ' Máu');
    r = r.replace(/%i:scaleArmor%/g, ' Giáp');
    r = r.replace(/%i:scaleMR%/g, ' Kháng phép');
    r = r.replace(/%i:scaleSerpents%/g, '');
    r = r.replace(/%i:TFTBaseAD%/g, ' ST Vật lý');
    r = r.replace(/%i:TFTBaseAP%/g, ' ST Phép');
    r = r.replace(/%i:TFT\w+%/g, '');
    r = r.replace(/%i:scale\w+%/g, '');
    r = r.replace(/%i:\w+%/g, '');

    // 2. Replace {{TFT_Keyword_*}} with Vietnamese
    const keywordMap: Record<string, string> = {
        'TFT_Keyword_Shred': 'Cào Xé',
        'TFT_Keyword_Chill': 'Tê Tái',
        'TFT_Keyword_Burn': 'Thiêu Đốt',
        'TFT_Keyword_Wound': 'Vết Thương Sâu',
        'TFT_Keyword_Sunder': 'Phá Giáp',
        'TFT_Keyword_Mana_Reave': 'Hút Năng Lượng',
        'TFT_Keyword_Omnivamp': 'Hút Máu Toàn Phần',
    };
    r = r.replace(/\{\{(\w+)\}\}/g, (_m, kw: string) => keywordMap[kw] || '');

    // 3. Remove TFTUnitProperty references
    r = r.replace(/TFTUnitProperty\.\w+:\w+/g, '');
    r = r.replace(/TFTUnitProperty\.[^)\s,]*/g, '');
    r = r.replace(/TFTUnitProperty\S*/g, '');

    // 4. Clean HTML
    r = r.replace(/<br\s*\/?>/gi, '\n');
    r = r.replace(/<[^>]+>/g, '');

    // 5. Clean HTML entities
    r = r.replace(/&nbsp;/g, ' ');
    r = r.replace(/&amp;/g, '&');
    r = r.replace(/&lt;/g, '<');
    r = r.replace(/&gt;/g, '>');

    // 6. Clean //%  artifacts
    r = r.replace(/\/\/%/g, '');

    // 7. Clean formatting
    r = r.replace(/\(\s*\)/g, '');
    r = r.replace(/\([^)]*:\s*,\s*[^)]*\)/g, '');
    r = r.replace(/\([^)]*:\s*\)/g, '');
    r = r.replace(/\(\s+/g, '(');
    r = r.replace(/\s+\)/g, ')');
    r = r.replace(/  +/g, ' ');
    r = r.split('\n').map(l => l.trim()).join('\n');
    r = r.replace(/\n{3,}/g, '\n\n');

    // 8. Remove duplicate lines
    const lines = r.split('\n');
    const deduped: string[] = [];
    for (const line of lines) {
        const half = Math.floor(line.length / 2);
        if (line.length > 20 && line.substring(0, half) === line.substring(half)) {
            deduped.push(line.substring(0, half));
        } else {
            deduped.push(line);
        }
    }
    r = deduped.join('\n');

    return r.trim();
}

function formatNum(val: number): string {
    if (val === 0) return '0';
    if (Number.isInteger(val)) return String(val);
    return String(Math.round(val * 100) / 100);
}

// ===== TRAIT PROCESSING =====

interface CDragonTrait {
    apiName: string;
    name: string;
    desc: string;
    effects: Array<{
        maxUnits: number;
        minUnits: number;
        variables: Record<string, number>;
    }>;
}

function resolveTraitDescription(desc: string, effects: CDragonTrait['effects']): string {
    if (!desc || !effects?.length) return cleanDescription(desc);

    // Build variable map: varName -> array of values across breakpoints
    const varValues = new Map<string, number[]>();
    for (const effect of effects) {
        if (!effect.variables) continue;
        for (const [name, value] of Object.entries(effect.variables)) {
            if (!varValues.has(name)) varValues.set(name, []);
            varValues.get(name)!.push(value);
        }
    }

    // Resolve @Var*100@ (percentage)
    let resolved = desc.replace(/@(\w+)\*100@/g, (_m, varName: string) => {
        const values = findTraitVar(varName, varValues);
        if (!values) return '';
        const pctValues = values.map(v => Math.round(v * 100));
        return formatTraitValues(pctValues);
    });

    // Resolve @Variable@ patterns
    resolved = resolved.replace(/@(\w+)@/g, (_m, varName: string) => {
        const values = findTraitVar(varName, varValues);
        if (!values) return '';
        return formatTraitValues(values);
    });

    // Clean remaining @ artifacts
    resolved = resolved.replace(/@+/g, '');

    return cleanDescription(resolved);
}

function findTraitVar(varName: string, varValues: Map<string, number[]>): number[] | undefined {
    const lower = varName.toLowerCase();

    // Exact match (case-insensitive)
    for (const [key, vals] of varValues) {
        if (key.toLowerCase() === lower) return vals;
    }

    // Remove "Modified" prefix
    if (lower.startsWith('modified')) {
        const base = lower.substring(8);
        for (const [key, vals] of varValues) {
            if (key.toLowerCase() === base) return vals;
        }
    }

    // Partial match
    for (const [key, vals] of varValues) {
        if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) return vals;
    }

    return undefined;
}

function formatTraitValues(values: number[]): string {
    // Remove duplicates for display
    const unique = [...new Set(values.map(v => formatNum(v)))];
    if (unique.length === 1) return unique[0];
    return unique.join('/');
}

// ===== ITEM PROCESSING =====

interface CDragonItem {
    apiName: string;
    name: string;
    desc: string;
    effects: Record<string, number>;
}

function resolveItemDescription(desc: string, effects: Record<string, number>): string {
    if (!desc) return '';

    // Resolve @Var*100@
    let resolved = desc.replace(/@(\w+)\*100@/g, (_m, varName: string) => {
        const val = findItemVar(varName, effects);
        if (val !== undefined) return formatNum(Math.round(val * 100));
        return '';
    });

    // Resolve @Variable@
    resolved = resolved.replace(/@(\w+)@/g, (_m, varName: string) => {
        const val = findItemVar(varName, effects);
        if (val !== undefined) return formatNum(val);
        return '';
    });

    resolved = resolved.replace(/@+/g, '');

    return cleanDescription(resolved);
}

function findItemVar(varName: string, effects: Record<string, number>): number | undefined {
    const lower = varName.toLowerCase();

    // Exact match
    for (const [key, val] of Object.entries(effects)) {
        if (key.toLowerCase() === lower) return val;
    }

    // Partial match
    for (const [key, val] of Object.entries(effects)) {
        if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) return val;
    }

    return undefined;
}

// ===== MAIN =====

async function fetchCDragon() {
    console.log('Fetching Vietnamese CDragon data...');
    const res = await fetch('https://raw.communitydragon.org/latest/cdragon/tft/vi_vn.json');
    if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
    return res.json();
}

async function fixTraits(cdData: any) {
    console.log('\n========== TRAITS ==========');

    const set17 = cdData.setData?.find((s: any) =>
        s.mutator === 'TFTSet17' || s.mutator === 'TFTSet17_Stage2'
    );
    if (!set17) throw new Error('Set 17 not found');

    const cdTraits: CDragonTrait[] = set17.traits || [];
    console.log(`CDragon traits: ${cdTraits.length}`);

    // Build lookup
    const cdByApi = new Map<string, CDragonTrait>();
    for (const t of cdTraits) {
        cdByApi.set(t.apiName.toLowerCase(), t);
    }

    // Get DB traits
    const { data: dbTraits, error } = await supabase
        .from('traits').select('id, name_vi, description_vi');
    if (error) throw error;
    console.log(`DB traits: ${dbTraits?.length}`);

    let updated = 0;
    for (const dbT of dbTraits || []) {
        const cdT = cdByApi.get(dbT.id.toLowerCase());
        if (!cdT) {
            // Try partial match
            let found: CDragonTrait | undefined;
            for (const [key, val] of cdByApi) {
                if (key.includes(dbT.id.toLowerCase().replace('tft16_', '')) ||
                    dbT.id.toLowerCase().includes(key.replace('set17_', ''))) {
                    found = val;
                    break;
                }
            }
            if (!found) {
                console.log(`  ✗ No match: ${dbT.id}`);
                continue;
            }
            const resolved = resolveTraitDescription(found.desc, found.effects);
            const updateData: Record<string, any> = { description_vi: resolved };
            if (found.name) updateData.name_vi = found.name.trim();

            const { error: e } = await supabase.from('traits').update(updateData).eq('id', dbT.id);
            if (!e) { updated++; console.log(`  ✓ ${dbT.id} → ${found.name}`); }
            continue;
        }

        const resolved = resolveTraitDescription(cdT.desc, cdT.effects);
        const updateData: Record<string, any> = { description_vi: resolved };
        if (cdT.name) updateData.name_vi = cdT.name.trim();

        const { error: e } = await supabase.from('traits').update(updateData).eq('id', dbT.id);
        if (!e) {
            updated++;
            console.log(`  ✓ ${dbT.id}: ${resolved.substring(0, 100)}...`);
        }
    }
    console.log(`Traits updated: ${updated}`);
}

async function fixItems(cdData: any) {
    console.log('\n========== ITEMS ==========');

    // Items are in cdData.items (not set-specific)
    const cdItems: CDragonItem[] = cdData.items || [];
    console.log(`CDragon items: ${cdItems.length}`);

    // Build lookup
    const cdByApi = new Map<string, CDragonItem>();
    for (const item of cdItems) {
        cdByApi.set(item.apiName.toLowerCase(), item);
    }

    // Get DB items
    const { data: dbItems, error } = await supabase
        .from('items').select('id, name_vi, description_vi');
    if (error) throw error;
    console.log(`DB items: ${dbItems?.length}`);

    let updated = 0;
    for (const dbI of dbItems || []) {
        const cdI = cdByApi.get(dbI.id.toLowerCase());
        if (!cdI) {
            console.log(`  ✗ No match: ${dbI.id}`);
            continue;
        }

        const resolved = resolveItemDescription(cdI.desc, cdI.effects || {});
        const updateData: Record<string, any> = { description_vi: resolved };
        if (cdI.name) updateData.name_vi = cdI.name.trim();

        const { error: e } = await supabase.from('items').update(updateData).eq('id', dbI.id);
        if (!e) {
            updated++;
            console.log(`  ✓ ${dbI.id}: ${resolved.substring(0, 100)}...`);
        }
    }
    console.log(`Items updated: ${updated}`);
}

async function fixAugments(cdData: any) {
    console.log('\n========== AUGMENTS ==========');

    // Augments are in items array (filtered by apiName containing "Augment")
    const cdItems: CDragonItem[] = cdData.items || [];
    const cdAugments = cdItems.filter(i => i.apiName.includes('Augment'));
    console.log(`CDragon augments: ${cdAugments.length}`);

    // Build lookup by apiName and name
    const cdByApi = new Map<string, CDragonItem>();
    const cdByName = new Map<string, CDragonItem>();
    for (const a of cdAugments) {
        cdByApi.set(a.apiName.toLowerCase(), a);
        if (a.name) cdByName.set(a.name.toLowerCase(), a);
    }

    // Get DB augments
    const { data: dbAugs, error } = await supabase
        .from('augments').select('id, name, name_vi, description_vi');
    if (error) throw error;
    console.log(`DB augments: ${dbAugs?.length}`);

    let updated = 0;
    let cleaned = 0;
    for (const dbA of dbAugs || []) {
        // Try to find CDragon match
        let cdA = cdByApi.get(dbA.id.toLowerCase());
        if (!cdA && dbA.name) {
            cdA = cdByName.get(dbA.name.toLowerCase());
        }

        if (cdA) {
            const resolved = resolveItemDescription(cdA.desc, cdA.effects || {});
            const updateData: Record<string, any> = { description_vi: resolved };
            if (cdA.name) updateData.name_vi = cdA.name.trim();

            const { error: e } = await supabase.from('augments').update(updateData).eq('id', dbA.id);
            if (!e) {
                updated++;
                console.log(`  ✓ ${dbA.id}: ${resolved.substring(0, 100)}...`);
            }
        } else {
            // No CDragon match - just clean existing description
            const currentDesc = dbA.description_vi || '';
            if (currentDesc.includes('TFTUnitProperty') || currentDesc.includes('%i:') ||
                currentDesc.includes('&nbsp;') || currentDesc.includes('{{')) {
                const cleanedDesc = cleanDescription(currentDesc);
                const { error: e } = await supabase.from('augments')
                    .update({ description_vi: cleanedDesc }).eq('id', dbA.id);
                if (!e) {
                    cleaned++;
                    console.log(`  ~ Cleaned ${dbA.id}: ${cleanedDesc.substring(0, 80)}...`);
                }
            }
        }
    }
    console.log(`Augments updated from CDragon: ${updated}`);
    console.log(`Augments cleaned (no CDragon match): ${cleaned}`);
}

async function verify() {
    console.log('\n========== VERIFICATION ==========');
    const tables = ['traits', 'items', 'augments'] as const;
    for (const table of tables) {
        const { data } = await supabase.from(table).select('id, description_vi');
        let issues = 0;
        for (const r of data || []) {
            const d = r.description_vi || '';
            if (d.includes('%i:') || d.includes('&nbsp;') || d.includes('TFTUnitProperty') ||
                d.includes('{{') || /@\w+@/.test(d) || d.includes('//%')) {
                issues++;
            }
        }
        console.log(`${table}: ${issues}/${(data || []).length} still with issues`);
    }
}

async function main() {
    const cdData = await fetchCDragon();
    await fixTraits(cdData);
    await fixItems(cdData);
    await fixAugments(cdData);
    await verify();
}

main().catch(console.error);
