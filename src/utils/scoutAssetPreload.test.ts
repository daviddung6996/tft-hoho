import { describe, expect, it } from 'vitest';
import { buildScoutImagePreloadUrls } from './scoutAssetPreload';

describe('buildScoutImagePreloadUrls', () => {
    it('collects unique local scout-view assets from units, bench, items, and augments', () => {
        const urls = buildScoutImagePreloadUrls([
            {
                units: [
                    {
                        image: 'https://ap.tft.tools/img/new17/face/tft17_nautilus.jpg',
                        items: ['Redemption'],
                    },
                ],
                bench: [
                    {
                        image: 'https://ap.tft.tools/img/new17/face/tft17_fizz.jpg',
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
                        image: 'https://ap.tft.tools/img/new17/face/tft17_nautilus.jpg',
                        items: ['Redemption'],
                    },
                ],
                augments: [
                    { icon: 'https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/augments/hexcore/ascension2.png' },
                ],
            },
        ]);

        expect(urls).toEqual([
            '/tft-assets/tft17_nautilus.jpg',
            '/tft-assets/redemption.png',
            '/tft-assets/tft17_fizz.jpg',
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
