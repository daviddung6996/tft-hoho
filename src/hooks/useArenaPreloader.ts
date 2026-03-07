import { useEffect, useRef } from 'react';
import { ARENA_SKINS } from '../data/arenas';

/**
 * Preloads all arena background images on mount so scouting
 * never shows a bare teal background while the image downloads.
 *
 * All arena images are local bundled assets (webp via Vite import),
 * so they are effectively instant. We fire preload requests to warm
 * the browser cache but never gate rendering — this avoids the
 * opacity 0→1 flash on first load.
 */
export function useArenaPreloader() {
    const startedRef = useRef(false);

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        const urls = ARENA_SKINS.map(a => a.backgroundUrl).filter(Boolean);
        urls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }, []);
}
