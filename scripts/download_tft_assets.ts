import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ASSET_DIR = path.resolve(process.cwd(), 'public/tft-assets');

// Helper to extract the filename from a URL
function getFilenameFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1].split('?')[0];
}

async function downloadFile(url: string, destPath: string): Promise<boolean> {
    if (fs.existsSync(destPath)) {
        // console.log(`[SKIP] Already exists: ${path.basename(destPath)}`);
        return true;
    }

    try {
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

    // Collect all URLs to download
    const urlsToDownload = new Set<string>();

    for (const url of hardcodedUrls) {
        urlsToDownload.add(url);
    }

    // 1. Champions
    const { data: champions, error: cError } = await supabase.from('champions').select('avatar').not('avatar', 'is', null);
    if (!cError && champions) {
        for (const c of champions) {
            urlsToDownload.add(c.avatar);
        }
    }

    // 2. Augments
    const { data: augments, error: aError } = await supabase.from('augments').select('icon').not('icon', 'is', null);
    if (!aError && augments) {
        for (const a of augments) {
            urlsToDownload.add(a.icon);
        }
    }

    // 3. Items
    const { data: items, error: iError } = await supabase.from('items').select('icon').not('icon', 'is', null);
    if (!iError && items) {
        for (const i of items) {
            urlsToDownload.add(i.icon);
        }
    }

    // 4. Traits
    const { data: traits, error: tError } = await supabase.from('traits').select('icon').not('icon', 'is', null);
    if (!tError && traits) {
        for (const t of traits) {
            if (t.icon) urlsToDownload.add(t.icon);
        }
    }

    console.log(`Found ${urlsToDownload.size} unique asset URLs to download.`);

    // Download consecutively
    for (const url of urlsToDownload) {
        const filename = getFilenameFromUrl(url);
        const destPath = path.join(ASSET_DIR, filename);

        const success = await downloadFile(url, destPath);
        if (success) {
            successCount++;
        } else {
            errorCount++;
        }
    }

    console.log(`\nDownload complete! Success: ${successCount}. Failures: ${errorCount}`);
}

downloadTftAssets().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
});
