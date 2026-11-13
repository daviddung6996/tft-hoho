import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Riot Palette Harness & After Hours Ban Guard', () => {
    const repoRoot = path.resolve(__dirname, '../../../');
    const indexCssPath = path.join(repoRoot, 'src/index.css');
    const designMdPath = path.join(repoRoot, 'DESIGN.md');
    const publicPreviewPath = path.join(repoRoot, 'public/true-damage-panel.html');

    it('enforces that public/true-damage-panel.html is NOT present as an ad-hoc page', () => {
        expect(fs.existsSync(publicPreviewPath)).toBe(false);
    });

    it('strictly BANS After Hours theme (--tui-theme: after-hours) in tft-hoho', () => {
        const indexCss = fs.readFileSync(indexCssPath, 'utf8');
        expect(indexCss).not.toContain('--tui-theme: after-hours');
        expect(indexCss).toMatch(/--tui-theme:\s*riot-panel/);
    });

    it('strictly BANS pure black (#000000 / 0 0 0) for core HUD surfaces', () => {
        const indexCss = fs.readFileSync(indexCssPath, 'utf8');
        // HUD surface teal must NOT be 0 0 0 or #000000
        expect(indexCss).not.toMatch(/--surface-teal-top:\s*#000000/);
        expect(indexCss).not.toMatch(/--surface-teal-top-rgb:\s*0\s+0\s+0/);
        expect(indexCss).not.toMatch(/--surface-teal-mid:\s*#000000/);
        expect(indexCss).not.toMatch(/--surface-teal-mid-rgb:\s*0\s+0\s+0/);
        expect(indexCss).not.toMatch(/--surface-teal-deep:\s*#000000/);
        expect(indexCss).not.toMatch(/--surface-teal-deep-rgb:\s*0\s+0\s+0/);
        expect(indexCss).not.toMatch(/--surface-teal-content:\s*#000000/);
        expect(indexCss).not.toMatch(/--color-surface-dark:\s*#000000/);
    });

    it('enforces exact measured Riot True Damage palette tokens in src/index.css', () => {
        const indexCss = fs.readFileSync(indexCssPath, 'utf8');

        // Flat Surface #0B1111 (RGB 11 17 17)
        expect(indexCss).toMatch(/--surface-teal-mid:\s*#0B1111/i);
        expect(indexCss).toMatch(/--surface-teal-mid-rgb:\s*11\s+17\s+17/);
        expect(indexCss).toMatch(/--color-surface-dark:\s*#0B1111/i);
        expect(indexCss).toMatch(/--color-surface-dark-rgb:\s*11\s+17\s+17/);

        // Gradient Top #0D1414 (RGB 13 20 20)
        expect(indexCss).toMatch(/--surface-teal-top:\s*#0D1414/i);
        expect(indexCss).toMatch(/--surface-teal-top-rgb:\s*13\s+20\s+20/);

        // Gradient Bottom #090D0D (RGB 9 13 13)
        expect(indexCss).toMatch(/--surface-teal-deep:\s*#090D0D/i);
        expect(indexCss).toMatch(/--surface-teal-deep-rgb:\s*9\s+13\s+13/);

        // Header / Content #0C1A1B (RGB 12 26 27)
        expect(indexCss).toMatch(/--surface-teal-content:\s*#0C1A1B/i);
        expect(indexCss).toMatch(/--surface-teal-content-rgb:\s*12\s+26\s+27/);
        expect(indexCss).toMatch(/--color-surface-panel:\s*#0C1A1B/i);

        // Border Gold #8A713F (RGB 138 113 63)
        expect(indexCss).toMatch(/--color-primary:\s*#8A713F/i);
        expect(indexCss).toMatch(/--color-primary-rgb:\s*138\s+113\s+63/);

        // Accent Gold (Active) #C9A961 (RGB 201 169 97)
        expect(indexCss).toMatch(/--color-accent-gold:\s*#C9A961/i);
        expect(indexCss).toMatch(/--color-accent-gold-rgb:\s*201\s+169\s+97/);

        // Text Gold Heading #EFE7D3
        expect(indexCss).toMatch(/--color-text-gold:\s*#EFE7D3/i);

        // Text Body #E9E2D0
        expect(indexCss).toMatch(/--color-text-primary:\s*#E9E2D0/i);
    });

    it('verifies DESIGN.md documents the ban of After Hours and enforcement of Riot Palette', () => {
        const designMd = fs.readFileSync(designMdPath, 'utf8');
        expect(designMd.toLowerCase()).toContain('ban');
        expect(designMd.toLowerCase()).toContain('after hours');
        expect(designMd).toContain('#0B1111');
        expect(designMd).toContain('#8A713F');
        expect(designMd).toContain('#C9A961');
    });
});
