import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const ASSET_ROOT = path.resolve(process.cwd(), 'public', 'tft-assets');
const LEGACY_SET_NUMBER = 16;
const LEGACY_ID_PREFIX = `TFT${LEGACY_SET_NUMBER}_`;
const LEGACY_ICON_MARKER = `set${LEGACY_SET_NUMBER}`;
const LEGACY_UNIT_MARKER = `tft${LEGACY_SET_NUMBER}`;

type AssetKind = 'items' | 'augments';
type AuditSummary = {
    champions: { total: number; active: number; legacyIds: number; activeLegacyIcons: number };
    traits: { total: number; active: number; legacyIds: number; activeLegacyIcons: number };
    items: { total: number; active: number; legacyIds: number; activeLegacyIcons: number };
    augments: { total: number; active: number; legacyIds: number; activeLegacyIcons: number };
    legacyPuzzleVotes: number;
    legacyUserPuzzleAttempts: number;
    legacyPuzzlePayloads: number;
    legacyAssetFiles: number;
    hasFeaturedPuzzleColumns: boolean;
    hasLegacyPuzzleColumns: boolean;
};

function slugify(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function getTargetRelativePath(kind: AssetKind, key: string, extension: string): string {
    return path.posix.join('tft-assets', kind, `${slugify(key)}${extension}`);
}

function walkFiles(root: string): string[] {
    if (!fs.existsSync(root)) {
        return [];
    }

    const files: string[] = [];
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        const fullPath = path.join(root, entry.name);
        if (entry.isDirectory()) {
            files.push(...walkFiles(fullPath));
            continue;
        }
        files.push(fullPath);
    }
    return files;
}

function getLocalAssetPath(assetRef: string): string | null {
    if (!assetRef) {
        return null;
    }

    if (assetRef.startsWith('/tft-assets/')) {
        const localPath = path.resolve(process.cwd(), 'public', assetRef.slice(1));
        return fs.existsSync(localPath) ? localPath : null;
    }

    const filename = assetRef.split('/').pop()?.split('?')[0];
    if (!filename) {
        return null;
    }

    const localPath = path.join(ASSET_ROOT, filename);
    return fs.existsSync(localPath) ? localPath : null;
}

async function writeAliasAsset(sourceIcon: string, targetRelativePath: string): Promise<void> {
    const targetPath = path.resolve(process.cwd(), 'public', targetRelativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });

    const existingSourcePath = getLocalAssetPath(sourceIcon);
    if (existingSourcePath) {
        fs.copyFileSync(existingSourcePath, targetPath);
        return;
    }

    const response = await fetch(sourceIcon);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${sourceIcon}: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(arrayBuffer));
}

async function normalizeActiveItems(): Promise<void> {
    const { data, error } = await supabase
        .from('items')
        .select('id, name, icon')
        .is('deleted_at', null)
        .or(`id.like.${LEGACY_ID_PREFIX}%,icon.ilike.%${LEGACY_ICON_MARKER}%`)
        .order('name');

    if (error) {
        throw error;
    }

    for (const row of data ?? []) {
        if (row.id.startsWith(LEGACY_ID_PREFIX)) {
            const { error: deleteError } = await supabase.from('items').delete().eq('id', row.id);
            if (deleteError) {
                throw deleteError;
            }
            console.log(`Deleted legacy item row: ${row.id}`);
            continue;
        }

        if (!row.icon || !row.icon.toLowerCase().includes(LEGACY_ICON_MARKER)) {
            continue;
        }

        const sourceName = row.icon.split('/').pop()?.split('?')[0] ?? `${row.id}.png`;
        const extension = path.extname(sourceName) || '.png';
        const targetRelativePath = getTargetRelativePath('items', row.id || row.name, extension);

        await writeAliasAsset(row.icon, targetRelativePath);

        const normalizedIcon = `/${targetRelativePath}`;
        const { error: updateError } = await supabase
            .from('items')
            .update({ icon: normalizedIcon })
            .eq('id', row.id);

        if (updateError) {
            throw updateError;
        }

        console.log(`Normalized item icon: ${row.id} -> ${normalizedIcon}`);
    }
}

async function normalizeActiveAugments(): Promise<void> {
    const { data, error } = await supabase
        .from('augments')
        .select('id, name, icon')
        .is('deleted_at', null)
        .or(`id.like.${LEGACY_ID_PREFIX}%,icon.ilike.%${LEGACY_ICON_MARKER}%`)
        .order('name');

    if (error) {
        throw error;
    }

    for (const row of data ?? []) {
        if (row.id.startsWith(LEGACY_ID_PREFIX)) {
            const { error: deleteError } = await supabase.from('augments').delete().eq('id', row.id);
            if (deleteError) {
                throw deleteError;
            }
            console.log(`Deleted legacy augment row: ${row.id}`);
            continue;
        }

        if (!row.icon || !row.icon.toLowerCase().includes(LEGACY_ICON_MARKER)) {
            continue;
        }

        const sourceName = row.icon.split('/').pop()?.split('?')[0] ?? `${row.id}.png`;
        const extension = path.extname(sourceName) || '.png';
        const targetRelativePath = getTargetRelativePath('augments', row.id || row.name, extension);

        await writeAliasAsset(row.icon, targetRelativePath);

        const normalizedIcon = `/${targetRelativePath}`;
        const { error: updateError } = await supabase
            .from('augments')
            .update({ icon: normalizedIcon })
            .eq('id', row.id);

        if (updateError) {
            throw updateError;
        }

        console.log(`Normalized augment icon: ${row.id} -> ${normalizedIcon}`);
    }
}

async function hardDeleteLegacyRows(): Promise<void> {
    const deletes = await Promise.all([
        supabase.from('champions').delete().ilike('id', `${LEGACY_ID_PREFIX}%`),
        supabase.from('traits').delete().ilike('id', `${LEGACY_ID_PREFIX}%`),
        supabase.from('items').delete().ilike('id', `${LEGACY_ID_PREFIX}%`),
        supabase.from('augments').delete().ilike('id', `${LEGACY_ID_PREFIX}%`),
        supabase.from('items').delete().not('deleted_at', 'is', null).ilike('icon', `%${LEGACY_ICON_MARKER}%`),
        supabase.from('augments').delete().not('deleted_at', 'is', null).ilike('icon', `%${LEGACY_ICON_MARKER}%`),
        supabase.from('puzzle_votes').delete().ilike('augment_id', `${LEGACY_ID_PREFIX}%`),
        supabase.from('user_puzzle_attempts').delete().or(`user_pick_id.like.${LEGACY_ID_PREFIX}%,pro_pick_id.like.${LEGACY_ID_PREFIX}%`),
    ]);

    for (const result of deletes) {
        if (result.error) {
            throw result.error;
        }
    }
}

function pruneLegacyAssetFiles(): number {
    let deleted = 0;
    for (const filePath of walkFiles(ASSET_ROOT)) {
        const relativePath = path.relative(ASSET_ROOT, filePath).replace(/\\/g, '/').toLowerCase();
        const basename = path.basename(filePath).toLowerCase();
        const isLegacyFile =
            relativePath.includes(LEGACY_ICON_MARKER) ||
            relativePath.includes(LEGACY_UNIT_MARKER) ||
            basename.includes(LEGACY_ICON_MARKER) ||
            basename.includes(LEGACY_UNIT_MARKER);

        if (!isLegacyFile) {
            continue;
        }

        fs.unlinkSync(filePath);
        deleted++;
    }

    return deleted;
}

async function countRows(table: string, filter?: (query: ReturnType<typeof supabase.from>) => any): Promise<number> {
    let query: any = supabase.from(table).select('id', { count: 'exact', head: true });
    if (filter) {
        query = filter(query);
    }
    const { count, error } = await query;
    if (error) {
        throw error;
    }
    return count ?? 0;
}

async function countPuzzlesWithLegacyPayloads(): Promise<number> {
    const { data, error } = await supabase
        .from('puzzles')
        .select('id, board_state, augments, pro_first_roll, pro_second_roll, meta_data');

    if (error) {
        throw error;
    }

    return (data ?? []).filter((row) => {
        const payload = JSON.stringify(row).toLowerCase();
        return payload.includes(LEGACY_ID_PREFIX.toLowerCase()) || payload.includes(LEGACY_ICON_MARKER);
    }).length;
}

async function probePuzzleColumns(): Promise<{ hasFeaturedPuzzleColumns: boolean; hasLegacyPuzzleColumns: boolean }> {
    const [featuredProbe, legacyProbe] = await Promise.all([
        supabase.from('puzzles').select('featured_path_id, featured_mod_ids').limit(1),
        supabase.from('puzzles').select('ionia_path_id, void_mod_ids').limit(1),
    ]);

    return {
        hasFeaturedPuzzleColumns: !featuredProbe.error,
        hasLegacyPuzzleColumns: !legacyProbe.error,
    };
}

function countLegacyAssetFiles(): number {
    return walkFiles(ASSET_ROOT).filter((filePath) => {
        const relativePath = path.relative(ASSET_ROOT, filePath).replace(/\\/g, '/').toLowerCase();
        return relativePath.includes(LEGACY_ICON_MARKER) || relativePath.includes(LEGACY_UNIT_MARKER);
    }).length;
}

async function auditState(): Promise<AuditSummary> {
    const [
        championsTotal,
        championsActive,
        championsLegacyIds,
        championsLegacyIcons,
        traitsTotal,
        traitsActive,
        traitsLegacyIds,
        traitsLegacyIcons,
        itemsTotal,
        itemsActive,
        itemsLegacyIds,
        itemsLegacyIcons,
        augmentsTotal,
        augmentsActive,
        augmentsLegacyIds,
        augmentsLegacyIcons,
        legacyPuzzleVotes,
        legacyUserPuzzleAttempts,
        legacyPuzzlePayloads,
        puzzleColumns,
    ] = await Promise.all([
        countRows('champions'),
        countRows('champions', (query) => query.is('deleted_at', null)),
        countRows('champions', (query) => query.ilike('id', `${LEGACY_ID_PREFIX}%`)),
        countRows('champions', (query) => query.is('deleted_at', null).ilike('avatar', `%${LEGACY_ICON_MARKER}%`)),
        countRows('traits'),
        countRows('traits', (query) => query.is('deleted_at', null)),
        countRows('traits', (query) => query.ilike('id', `${LEGACY_ID_PREFIX}%`)),
        countRows('traits', (query) => query.is('deleted_at', null).ilike('icon', `%${LEGACY_ICON_MARKER}%`)),
        countRows('items'),
        countRows('items', (query) => query.is('deleted_at', null)),
        countRows('items', (query) => query.ilike('id', `${LEGACY_ID_PREFIX}%`)),
        countRows('items', (query) => query.is('deleted_at', null).ilike('icon', `%${LEGACY_ICON_MARKER}%`)),
        countRows('augments'),
        countRows('augments', (query) => query.is('deleted_at', null)),
        countRows('augments', (query) => query.ilike('id', `${LEGACY_ID_PREFIX}%`)),
        countRows('augments', (query) => query.is('deleted_at', null).ilike('icon', `%${LEGACY_ICON_MARKER}%`)),
        countRows('puzzle_votes', (query) => query.ilike('augment_id', `${LEGACY_ID_PREFIX}%`)),
        countRows('user_puzzle_attempts', (query) => query.or(`user_pick_id.like.${LEGACY_ID_PREFIX}%,pro_pick_id.like.${LEGACY_ID_PREFIX}%`)),
        countPuzzlesWithLegacyPayloads(),
        probePuzzleColumns(),
    ]);

    return {
        champions: {
            total: championsTotal,
            active: championsActive,
            legacyIds: championsLegacyIds,
            activeLegacyIcons: championsLegacyIcons,
        },
        traits: {
            total: traitsTotal,
            active: traitsActive,
            legacyIds: traitsLegacyIds,
            activeLegacyIcons: traitsLegacyIcons,
        },
        items: {
            total: itemsTotal,
            active: itemsActive,
            legacyIds: itemsLegacyIds,
            activeLegacyIcons: itemsLegacyIcons,
        },
        augments: {
            total: augmentsTotal,
            active: augmentsActive,
            legacyIds: augmentsLegacyIds,
            activeLegacyIcons: augmentsLegacyIcons,
        },
        legacyPuzzleVotes,
        legacyUserPuzzleAttempts,
        legacyPuzzlePayloads,
        legacyAssetFiles: countLegacyAssetFiles(),
        hasFeaturedPuzzleColumns: puzzleColumns.hasFeaturedPuzzleColumns,
        hasLegacyPuzzleColumns: puzzleColumns.hasLegacyPuzzleColumns,
    };
}

async function main(): Promise<void> {
    const auditOnly = process.argv.includes('--audit');
    await fs.promises.mkdir(ASSET_ROOT, { recursive: true });

    if (auditOnly) {
        console.log(JSON.stringify({ mode: 'audit', before: await auditState() }, null, 2));
        return;
    }

    const before = await auditState();
    await normalizeActiveItems();
    await normalizeActiveAugments();
    await hardDeleteLegacyRows();
    const prunedLegacyAssetFiles = pruneLegacyAssetFiles();
    const after = await auditState();

    console.log(JSON.stringify({ mode: 'cleanup', before, prunedLegacyAssetFiles, after }, null, 2));
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
