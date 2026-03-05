import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, '../dist');
const tempPath = path.resolve(__dirname, '../dist_temp');

try {
    // 1. Rename dist to dist_temp
    fs.renameSync(distPath, tempPath);

    // 2. Create the new dist directory and training subdirectory
    fs.mkdirSync(path.join(distPath, 'training'), { recursive: true });

    // 3. Move files to their proper places
    const filesToMove = fs.readdirSync(tempPath);
    for (const file of filesToMove) {
        if (file === '_redirects' || file === '_headers') {
            // Keep at root of dist
            fs.renameSync(path.join(tempPath, file), path.join(distPath, file));
        } else {
            // Move into training folder
            fs.renameSync(path.join(tempPath, file), path.join(distPath, 'training', file));
        }
    }

    // 4. Cleanup
    fs.rmSync(tempPath, { recursive: true, force: true });

    console.log('✅ postbuild: Restructured dist/ for subdirectory deployment (/training/)');
} catch (error) {
    console.error('❌ postbuild error:', error);
    process.exit(1);
}
