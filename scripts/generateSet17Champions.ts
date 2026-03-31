import * as fs from 'fs';
import * as path from 'path';
import { buildSet17ChampionArtifactFromTacticsToolsHtml } from '../src/utils/tacticsToolsSet17Parser';

const SOURCE_URL = 'https://tactics.tools/info/set-update';
const OUTPUT_FILE = path.resolve(process.cwd(), 'src/data/set17_champions.json');

async function fetchSourceHtml(): Promise<string> {
    const response = await fetch(SOURCE_URL, {
        headers: {
            'user-agent': 'Mozilla/5.0',
            accept: 'text/html,application/xhtml+xml',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${SOURCE_URL}: ${response.status} ${response.statusText}`);
    }

    return response.text();
}

async function main() {
    const html = await fetchSourceHtml();
    const artifact = buildSet17ChampionArtifactFromTacticsToolsHtml(html);

    if (artifact.champions.length === 0) {
        throw new Error('No Set 17 champions were parsed from tactics.tools');
    }

    fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
    console.log(`Wrote ${artifact.champions.length} Set 17 champions to ${OUTPUT_FILE}`);
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
