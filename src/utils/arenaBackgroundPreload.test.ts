import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import {
    isArenaBackgroundReady,
    preloadArenaBackground,
    resetArenaBackgroundPreloadStateForTests,
} from './arenaBackgroundPreload';

type MockImageBehavior = {
    completeOnSrc?: boolean;
    decodePromise?: Promise<void>;
};

const originalImage = globalThis.Image;
const mockImageBehaviors: MockImageBehavior[] = [];
const createdImages: MockImage[] = [];

class MockImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    decoding = '';
    complete = false;
    naturalWidth = 0;
    private behavior: MockImageBehavior;
    private currentSrc = '';

    constructor() {
        this.behavior = mockImageBehaviors.shift() ?? {};
        createdImages.push(this);
    }

    get src() {
        return this.currentSrc;
    }

    set src(value: string) {
        this.currentSrc = value;

        if (this.behavior.completeOnSrc) {
            this.complete = true;
            this.naturalWidth = 1;
        }
    }

    decode() {
        return this.behavior.decodePromise ?? Promise.resolve();
    }

    triggerLoad() {
        this.complete = true;
        this.naturalWidth = 1;
        this.onload?.();
    }
}

describe('arenaBackgroundPreload', () => {
    beforeEach(() => {
        resetArenaBackgroundPreloadStateForTests();
        mockImageBehaviors.length = 0;
        createdImages.length = 0;
        Object.defineProperty(globalThis, 'Image', {
            configurable: true,
            writable: true,
            value: MockImage,
        });
    });

    afterAll(() => {
        Object.defineProperty(globalThis, 'Image', {
            configurable: true,
            writable: true,
            value: originalImage,
        });
    });

    it('does not mark a cached arena background ready until decode finishes', async () => {
        let resolveDecode: (() => void) | null = null;
        const decodePromise = new Promise<void>((resolve) => {
            resolveDecode = resolve;
        });

        mockImageBehaviors.push({
            completeOnSrc: true,
            decodePromise,
        });

        const preloadPromise = preloadArenaBackground('/arena/cached.webp');
        let resolved = false;

        void preloadPromise.then(() => {
            resolved = true;
        });

        await Promise.resolve();

        expect(resolved).toBe(false);
        expect(isArenaBackgroundReady('/arena/cached.webp')).toBe(false);

        expect(resolveDecode).not.toBeNull();
        resolveDecode!();
        await preloadPromise;

        expect(isArenaBackgroundReady('/arena/cached.webp')).toBe(true);
    });

    it('dedupes concurrent arena background preloads onto one image request', async () => {
        let resolveDecode: (() => void) | null = null;
        const decodePromise = new Promise<void>((resolve) => {
            resolveDecode = resolve;
        });

        mockImageBehaviors.push({
            completeOnSrc: true,
            decodePromise,
        });

        const first = preloadArenaBackground('/arena/shared.webp');
        const second = preloadArenaBackground('/arena/shared.webp');

        expect(first).toBe(second);
        expect(createdImages).toHaveLength(1);

        expect(resolveDecode).not.toBeNull();
        resolveDecode!();
        await Promise.all([first, second]);
    });

    it('marks a background ready after a normal load event path', async () => {
        mockImageBehaviors.push({});

        const preloadPromise = preloadArenaBackground('/arena/normal.webp');

        expect(createdImages).toHaveLength(1);
        expect(isArenaBackgroundReady('/arena/normal.webp')).toBe(false);

        createdImages[0].triggerLoad();
        await preloadPromise;

        expect(isArenaBackgroundReady('/arena/normal.webp')).toBe(true);
    });
});
