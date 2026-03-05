import { useEffect, useState, useRef } from 'react';
import { ARENA_SKINS } from '../data/arenas';

/**
 * Preloads all arena background images on mount so scouting
 * never shows a bare teal background while the image downloads.
 *
 * Returns `isArenaReady(url)` — true when a specific URL is cached.
 */
export function useArenaPreloader() {
    const [loadedUrls, setLoadedUrls] = useState<Set<string>>(new Set());
    const startedRef = useRef(false);

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        const urls = ARENA_SKINS.map(a => a.backgroundUrl).filter(Boolean);

        urls.forEach(url => {
            const img = new Image();
            img.onload = () => {
                setLoadedUrls(prev => {
                    const next = new Set(prev);
                    next.add(url);
                    return next;
                });
            };
            img.onerror = () => {
                // Still mark as "loaded" so we don't block rendering forever
                setLoadedUrls(prev => {
                    const next = new Set(prev);
                    next.add(url);
                    return next;
                });
            };
            img.src = url;
        });
    }, []);

    const isArenaReady = (url: string) => loadedUrls.has(url);
    const allReady = ARENA_SKINS.every(a => loadedUrls.has(a.backgroundUrl));

    return { isArenaReady, allReady };
}
