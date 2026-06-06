import { useEffect, useRef } from 'react';
import { ARENA_SKINS } from '../data/arenas';
import { preloadArenaBackground } from '../utils/arenaBackgroundPreload';

/**
 * Preloads AND decodes all arena background images on mount so scouting
 * never shows a black flash while the image decodes on first switch.
 *
 * Uses the same preloadArenaBackground() that the scouting effect uses,
 * so images are registered in loadedImageAssets and isArenaBackgroundReady()
 * returns true immediately when the user clicks to scout.
 */
export function useArenaPreloader() {
    const startedRef = useRef(false);

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        const urls = ARENA_SKINS.map(a => a.backgroundUrl).filter(Boolean);
        urls.forEach(url => {
            void preloadArenaBackground(url);
        });
    }, []);
}
