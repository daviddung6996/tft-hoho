const CACHE_VERSION = 'set17_v1';
const LEGACY_CACHE_PREFIX = 'tft_cache_';
const CACHE_PREFIX = `tft_cache_${CACHE_VERSION}_`;
let legacyCacheCleared = false;

function clearLegacyCacheOnce(): void {
    if (legacyCacheCleared || typeof sessionStorage === 'undefined') {
        return;
    }

    legacyCacheCleared = true;

    try {
        const legacyKeys: string[] = [];
        for (let index = 0; index < sessionStorage.length; index += 1) {
            const key = sessionStorage.key(index);
            if (key && key.startsWith(LEGACY_CACHE_PREFIX) && !key.startsWith(CACHE_PREFIX)) {
                legacyKeys.push(key);
            }
        }

        legacyKeys.forEach(key => sessionStorage.removeItem(key));
    } catch {
        // Ignore environments where sessionStorage is unavailable.
    }
}

export function readCache<T>(key: string): T[] | null {
    clearLegacyCacheOnce();

    try {
        const raw = sessionStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

export function writeCache<T>(key: string, data: T[]): void {
    clearLegacyCacheOnce();

    try {
        sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
    } catch {
        // sessionStorage full or unavailable - silently ignore.
    }
}
