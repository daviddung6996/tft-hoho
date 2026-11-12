import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export const CHUNK_RELOAD_STORAGE_KEY = 'tftiseasy_hoho_chunk_reload_at';
export const CHUNK_RELOAD_COOLDOWN_MS = 15_000;

let reloadDispatched = false;

const CHUNK_ERROR_PATTERNS = [
    /failed to fetch dynamically imported module/i,
    /importing a module script failed/i,
    /error loading dynamically imported module/i,
    /unable to preload css/i,
    /loading chunk [\w-]+ failed/i,
    /expected a javascript-or-wasm module script/i,
];

function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message || String(error);
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object') {
        const record = error as { message?: unknown; payload?: { message?: unknown } };
        if (typeof record.message === 'string') return record.message;
        if (typeof record.payload?.message === 'string') return record.payload.message;
    }
    return '';
}

export function isChunkLoadError(error: unknown): boolean {
    const msg = extractErrorMessage(error);
    if (!msg) return false;
    return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(msg));
}

export function isChunkReloadPending(): boolean {
    return reloadDispatched;
}

export function clearChunkReloadGuard(): void {
    reloadDispatched = false;
    try {
        window.sessionStorage.removeItem(CHUNK_RELOAD_STORAGE_KEY);
    } catch {
        // Storage can be unavailable in strict browser privacy modes.
    }
}

function defaultTriggerReload(): void {
    window.location.reload();
}

/**
 * Reload once when an open tab tries to load a superseded hashed chunk after a deploy.
 * Cooldown in sessionStorage prevents an infinite reload loop when offline or broken.
 */
export function reloadOnceForChunkError(
    now = Date.now(),
    triggerReload: () => void = defaultTriggerReload,
): boolean {
    if (reloadDispatched) return true;
    try {
        const raw = window.sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY);
        const lastReload = raw ? Number(raw) : NaN;
        if (!Number.isFinite(lastReload) || now - lastReload > CHUNK_RELOAD_COOLDOWN_MS) {
            window.sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(now));
            reloadDispatched = true;
            triggerReload();
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

export function registerPreloadErrorRecovery(
    triggerReload: () => void = defaultTriggerReload,
): () => void {
    const handler = (event: Event) => {
        if (reloadOnceForChunkError(Date.now(), triggerReload)) {
            event.preventDefault();
        }
    };
    window.addEventListener('vite:preloadError', handler);
    return () => window.removeEventListener('vite:preloadError', handler);
}

export async function importWithChunkRetry<T>(
    importer: () => Promise<T>,
): Promise<T> {
    try {
        const module = await importer();
        // When vite:preloadError prevents default, Vite resolves undefined before navigation completes.
        if (!module && reloadDispatched) {
            return new Promise<T>(() => {
                // Keep caller pending while browser reloads the updated entry HTML.
            });
        }
        clearChunkReloadGuard();
        return module;
    } catch (error) {
        if (reloadDispatched || (isChunkLoadError(error) && reloadOnceForChunkError())) {
            return new Promise<T>(() => {
                // Keep caller pending while reload fetches the latest HTML and chunks.
            });
        }
        throw error;
    }
}

export function lazyWithRetry<T extends ComponentType<any>>(
    importer: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
    return lazy(() => importWithChunkRetry(importer));
}
