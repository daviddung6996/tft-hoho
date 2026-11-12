// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    CHUNK_RELOAD_COOLDOWN_MS,
    CHUNK_RELOAD_STORAGE_KEY,
    clearChunkReloadGuard,
    importWithChunkRetry,
    isChunkLoadError,
    isChunkReloadPending,
    registerPreloadErrorRecovery,
    reloadOnceForChunkError,
} from './chunkRecovery';

describe('chunkRecovery', () => {
    beforeEach(() => {
        window.sessionStorage.clear();
        clearChunkReloadGuard();
    });

    afterEach(() => {
        clearChunkReloadGuard();
        vi.restoreAllMocks();
    });

    it('detects dynamic import and MIME chunk failures accurately', () => {
        expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://training.tftiseasy.com/assets/foo.js'))).toBe(true);
        expect(isChunkLoadError(new Error('Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html".'))).toBe(true);
        expect(isChunkLoadError(new Error('Unable to preload CSS for /assets/x.css'))).toBe(true);
        expect(isChunkLoadError(new Error('Network timeout on API fetch'))).toBe(false);
        expect(isChunkLoadError(null)).toBe(false);
    });

    it('reloads once and enforces cooldown against infinite reload loops', () => {
        const reloadMock = vi.fn();
        expect(reloadOnceForChunkError(10_000, reloadMock)).toBe(true);
        expect(reloadMock).toHaveBeenCalledTimes(1);
        expect(isChunkReloadPending()).toBe(true);
        expect(window.sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY)).toBe('10000');

        clearChunkReloadGuard();
        window.sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, '10000');
        expect(reloadOnceForChunkError(10_000 + CHUNK_RELOAD_COOLDOWN_MS - 1, reloadMock)).toBe(false);
        expect(reloadMock).toHaveBeenCalledTimes(1);

        expect(reloadOnceForChunkError(10_000 + CHUNK_RELOAD_COOLDOWN_MS + 1, reloadMock)).toBe(true);
        expect(reloadMock).toHaveBeenCalledTimes(2);
    });

    it('registers and unregisters vite:preloadError recovery', () => {
        const reloadMock = vi.fn();
        const cleanup = registerPreloadErrorRecovery(reloadMock);

        const firstEvent = new Event('vite:preloadError', { cancelable: true });
        window.dispatchEvent(firstEvent);
        expect(firstEvent.defaultPrevented).toBe(true);
        expect(reloadMock).toHaveBeenCalledTimes(1);

        cleanup();
    });

    it('importWithChunkRetry clears guard on success and rethrows non-chunk errors', async () => {
        window.sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(Date.now()));

        const Dummy = () => null;
        const loaded = await importWithChunkRetry(async () => ({ default: Dummy }));
        expect(loaded).toEqual({ default: Dummy });
        expect(window.sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY)).toBeNull();

        await expect(
            importWithChunkRetry(async () => {
                throw new Error('Regular runtime bug');
            }),
        ).rejects.toThrow('Regular runtime bug');
    });

    it('importWithChunkRetry stays pending while reload is dispatched for chunk skew', async () => {
        const reloadMock = vi.fn();
        const cleanup = registerPreloadErrorRecovery(reloadMock);

        // Simulate Vite preventing default on preloadError and resolving undefined before reload finishes.
        const skewPromise = importWithChunkRetry(async () => {
            window.dispatchEvent(new Event('vite:preloadError', { cancelable: true }));
            const missingModule = undefined as unknown as { Dummy: () => null };
            return { default: missingModule.Dummy };
        });

        const raceResult = await Promise.race([
            skewPromise.then(() => 'resolved').catch(() => 'rejected'),
            new Promise((resolve) => setTimeout(() => resolve('pending'), 30)),
        ]);

        expect(reloadMock).toHaveBeenCalledTimes(1);
        expect(isChunkReloadPending()).toBe(true);
        expect(raceResult).toBe('pending');
        cleanup();
    });
});
