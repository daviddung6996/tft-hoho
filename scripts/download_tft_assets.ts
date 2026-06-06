import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or Supabase key in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ASSET_DIR = path.resolve(process.cwd(), 'public/tft-assets');
const LEGACY_ICON_MARKER = `set${16}`;
const LEGACY_UNIT_MARKER = `tft${16}`;
const STATIC_LOCAL_FILES = new Set([
    'featured-path.svg',
    'featured-modifier.svg',
    'statmodsattackdamageicon.png',
    'statmodsarmoricon.png',
    'statmodsmagicresicon.png',
    'statmodsattackspeedicon.png',
]);

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

function getFilenameFromAsset(assetRef: string): string | null {
    if (!assetRef) {
        return null;
    }

    if (assetRef.startsWith('/tft-assets/')) {
        return assetRef.split('/').pop() ?? null;
    }

    if (/^https?:\/\//i.test(assetRef)) {
        const parts = assetRef.split('/');
        return parts[parts.length - 1].split('?')[0];
    }

    return null;
}

function getRelativeAssetPath(assetRef: string): string | null {
    if (!assetRef) {
        return null;
    }

    if (assetRef.startsWith('/tft-assets/')) {
        return assetRef.slice('/tft-assets/'.length).replace(/\\/g, '/');
    }

    return getFilenameFromAsset(assetRef);
}

async function downloadFile(url: string, destPath: string): Promise<boolean> {
    if (fs.existsSync(destPath)) {
        // console.log(`[SKIP] Already exists: ${path.basename(destPath)}`);
        return true;
    }

    try {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`[FAIL] HTTP ${response.status} - ${url}`);
            return false;
        }

        const buffer = await response.arrayBuffer();
        fs.writeFileSync(destPath, Buffer.from(buffer));
        console.log(`[DONE] Downloaded: ${path.basename(destPath)}`);
        return true;
    } catch (err: any) {
        console.error(`[FAIL] Error downloading ${url}:`, err.message);
        return false;
    }
}

async function downloadTftAssets() {
    console.log('Downloading TFT assets from Supabase/CommunityDragon...');

    if (!fs.existsSync(ASSET_DIR)) {
        fs.mkdirSync(ASSET_DIR, { recursive: true });
    }

    // Hardcoded icons from HextechTooltip.tsx
    const hardcodedUrls = [
        'https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsattackdamageicon.png',
        'https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsarmoricon.png',
        'https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsmagicresicon.png',
        'https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsattackspeedicon.png'
    ];

    let successCount = 0;
    let errorCount = 0;

    // Collect remote assets to download and the filenames we expect to keep.
    const urlsToDownload = new Map<string, string>();
    const expectedPaths = new Set<string>(STATIC_LOCAL_FILES);

    for (const url of hardcodedUrls) {
        const relativePath = getRelativeAssetPath(url);
        if (!relativePath) continue;
        urlsToDownload.set(url, relativePath);
        expectedPaths.add(relativePath);
    }

    const assetSpecs = [
        { table: 'champions', column: 'avatar' },
        { table: 'augments', column: 'icon' },
        { table: 'items', column: 'icon' },
        { table: 'traits', column: 'icon' },
    ] as const;

    for (const spec of assetSpecs) {
        const { data, error } = await supabase
            .from(spec.table)
            .select(`${spec.column}, deleted_at`)
            .is('deleted_at', null)
            .not(spec.column, 'is', null);

        if (error || !data) {
            continue;
        }

        for (const row of data as Array<Record<string, string | null>>) {
            const assetRef = row[spec.column];
            if (!assetRef) {
                continue;
            }

            const relativePath = getRelativeAssetPath(assetRef);
            if (!relativePath) {
                continue;
            }

            expectedPaths.add(relativePath);
            if (/^https?:\/\//i.test(assetRef)) {
                urlsToDownload.set(assetRef, relativePath);
            }
        }
    }

    console.log(`Found ${urlsToDownload.size} remote asset URLs to download.`);

    // Download consecutively
    for (const [url, relativePath] of urlsToDownload.entries()) {
        const destPath = path.join(ASSET_DIR, relativePath);

        const success = await downloadFile(url, destPath);
        if (success) {
            successCount++;
        } else {
            errorCount++;
        }
    }

    let prunedCount = 0;
    for (const filePath of walkFiles(ASSET_DIR)) {
        const relativePath = path.relative(ASSET_DIR, filePath).replace(/\\/g, '/');
        if (expectedPaths.has(relativePath)) {
            continue;
        }

        const lowerName = relativePath.toLowerCase();
        const isManagedStaleFile =
            lowerName.includes(LEGACY_UNIT_MARKER) ||
            lowerName.includes(LEGACY_ICON_MARKER) ||
            path.basename(relativePath).startsWith('set17_');
        if (!isManagedStaleFile) {
            continue;
        }

        fs.unlinkSync(filePath);
        prunedCount++;
    }

    console.log(`\nDownload complete! Success: ${successCount}. Failures: ${errorCount}. Pruned: ${prunedCount}`);
}

downloadTftAssets().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
});
