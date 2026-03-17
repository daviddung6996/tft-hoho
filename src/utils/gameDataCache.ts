const CACHE_PREFIX = 'tft_cache_';

export function readCache<T>(key: string): T[] | null {
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
    try {
        sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
    } catch {
        // sessionStorage full or unavailable — silently ignore
    }
}
