import { useState, useEffect, useCallback, useMemo } from 'react';
import { videoLibraryService } from '../videoLibrary.service';
import { VideoLibraryItem, LibraryFilter, VideoMilestone } from '../videoLibrary.types';
import { useProSupporter } from '../../pro-supporter/hooks/useProSupporter';

export function useVideoLibrary() {
    const { isProSupporter } = useProSupporter();

    const [library, setLibrary] = useState<VideoLibraryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<LibraryFilter>('all');

    const fetchLibrary = useCallback(async () => {
        setIsLoading(true);
        try {
            const items = await videoLibraryService.getLibrary();
            setLibrary(items);
        } catch (err) {
            console.error('Failed to fetch video library:', err);
        } finally {
            setIsLoading(false);
        }
    }, []); // no isProSupporter dep — override is applied in useMemo below

    useEffect(() => {
        fetchLibrary();
    }, [fetchLibrary]);

    // Apply pro-override in derived state so fetchLibrary doesn't re-run on pro status change
    const effectiveLibrary = useMemo(
        () => isProSupporter ? library.map(v => ({ ...v, isUnlocked: true })) : library,
        [library, isProSupporter]
    );

    const unlockedCount = useMemo(
        () => isProSupporter ? library.length : library.filter(v => v.isUnlocked).length,
        [library, isProSupporter]
    );

    const totalCount = library.length;

    const filteredLibrary = useMemo(() => {
        switch (filter) {
            case 'unlocked':
                return effectiveLibrary.filter(v => v.isUnlocked);
            case 'locked':
                return effectiveLibrary.filter(v => !v.isUnlocked);
            default:
                return effectiveLibrary;
        }
    }, [effectiveLibrary, filter]);

    const unlockVideo = useCallback(async (params: {
        puzzleId: string;
        videoUrl: string;
        userResult: 'correct' | 'incorrect';
        iqDelta?: number;
    }): Promise<VideoMilestone | null> => {
        const prevCount = unlockedCount;
        const success = await videoLibraryService.unlockVideo(params);
        if (!success) return null;

        // Update local state optimistically
        setLibrary(prev => prev.map(item =>
            item.puzzleId === params.puzzleId
                ? { ...item, isUnlocked: true, userResult: params.userResult, iqDelta: params.iqDelta }
                : item
        ));

        const newCount = prevCount + 1;
        return videoLibraryService.checkMilestone(newCount, prevCount);
    }, [unlockedCount]);

    return {
        library,
        filteredLibrary,
        isLoading,
        filter,
        setFilter,
        unlockedCount,
        totalCount,
        unlockVideo,
        refresh: fetchLibrary,
        isProSupporter,
    };
}
