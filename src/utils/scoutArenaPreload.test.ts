import { describe, expect, it } from 'vitest';
import { buildScoutArenaPreloadUrls, buildScoutVisualPreloadUrls } from './scoutArenaPreload';

const arenaUrls: Record<string, string> = {
    a: '/arena/a.webp',
    b: '/arena/b.webp',
    c: '/arena/c.webp',
    d: '/arena/d.webp',
};

describe('buildScoutArenaPreloadUrls', () => {
    it('prioritizes likely next scout targets but keeps every current opponent arena in the queue', () => {
        const urls = buildScoutArenaPreloadUrls({
            opponents: [
                { arenaId: 'a' },
                { arenaId: 'b' },
                { arenaId: 'c' },
                { arenaId: 'd' },
            ],
            activeOpponentIndex: -1,
            resolveArenaUrl: (arenaId) => arenaId ? arenaUrls[arenaId] : undefined,
        });

        expect(urls).toEqual([
            '/arena/a.webp',
            '/arena/b.webp',
            '/arena/c.webp',
            '/arena/d.webp',
        ]);
    });

    it('keeps wraparound neighbors first when already scouting an opponent', () => {
        const urls = buildScoutArenaPreloadUrls({
            opponents: [
                { arenaId: 'a' },
                { arenaId: 'b' },
                { arenaId: 'c' },
                { arenaId: 'd' },
            ],
            activeOpponentIndex: 2,
            resolveArenaUrl: (arenaId) => arenaId ? arenaUrls[arenaId] : undefined,
        });

        expect(urls).toEqual([
            '/arena/d.webp',
            '/arena/b.webp',
            '/arena/a.webp',
            '/arena/c.webp',
        ]);
    });

    it('dedupes repeated arena skins across multiple opponents', () => {
        const urls = buildScoutArenaPreloadUrls({
            opponents: [
                { arenaId: 'a' },
                { arenaId: 'b' },
                { arenaId: 'a' },
            ],
            activeOpponentIndex: -1,
            resolveArenaUrl: (arenaId) => arenaId ? arenaUrls[arenaId] : undefined,
        });

        expect(urls).toEqual([
            '/arena/a.webp',
            '/arena/b.webp',
        ]);
    });

    it('returns an empty queue when there are no opponents', () => {
        expect(buildScoutArenaPreloadUrls({
            opponents: [],
            activeOpponentIndex: -1,
            resolveArenaUrl: (arenaId) => arenaId ? arenaUrls[arenaId] : undefined,
        })).toEqual([]);
    });

    it('collects unique scout visual asset urls from opponent boards, benches, items, and augments', () => {
        const urls = buildScoutVisualPreloadUrls([
            {
                units: [
                    { image: 'https://cdn.test/champion-a.png', items: ['Infinity Edge'] },
                    { image: 'https://cdn.test/champion-b.png', items: ['Statikk Shiv'] },
                ],
                bench: [
                    { image: 'https://cdn.test/champion-c.png', items: ['Infinity Edge'] },
                ],
                augments: [
                    { icon: 'https://cdn.test/augment-a.png' },
                    { icon: 'https://cdn.test/augment-a.png' },
                ],
            },
        ]);

        expect(urls).toEqual([
            'https://cdn.test/champion-a.png',
            '/tft-assets/infinity_edge.png',
            'https://cdn.test/champion-b.png',
            '/tft-assets/statikk_shiv.png',
            'https://cdn.test/champion-c.png',
            'https://cdn.test/augment-a.png',
        ]);
    });
});
