import { describe, expect, it } from 'vitest';
import { buildScoutImagePreloadUrls } from './scoutAssetPreload';

describe('buildScoutImagePreloadUrls', () => {
    it('collects unique local scout-view assets from units, bench, items, and augments', () => {
        const urls = buildScoutImagePreloadUrls([
            {
                units: [
                    {
                        image: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/tft16_nautilus/hud/tft16_nautilus_square.tft_set16.png',
                        items: ['Redemption'],
                    },
                ],
                bench: [
                    {
                        image: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/tft16_fizz/hud/tft16_fizz_square.tft_set16.png',
                        items: ['BlueBuff'],
                    },
                ],
                augments: [
                    { icon: 'https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/augments/hexcore/ascension2.png' },
                ],
            },
            {
                units: [
                    {
                        image: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/tft16_nautilus/hud/tft16_nautilus_square.tft_set16.png',
                        items: ['Redemption'],
                    },
                ],
                augments: [
                    { icon: 'https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/augments/hexcore/ascension2.png' },
                ],
            },
        ]);

        expect(urls).toEqual([
            '/tft-assets/tft16_nautilus_square.tft_set16.png',
            '/tft-assets/redemption.png',
            '/tft-assets/tft16_fizz_square.tft_set16.png',
            '/tft-assets/blue_buff.png',
            '/tft-assets/ascension2.png',
        ]);
    });

    it('ignores empty assets', () => {
        expect(buildScoutImagePreloadUrls([
            {
                units: [{ image: '', items: [] }],
                bench: [],
                augments: [{ icon: '' }],
            },
        ])).toEqual([]);
    });
});
