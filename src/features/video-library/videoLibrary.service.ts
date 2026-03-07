import { supabase } from '../../lib/supabase';
import { VideoLibraryItem, VideoMilestone } from './videoLibrary.types';
import { VIDEO_MILESTONES } from './constants/milestones';
import { extractYouTubeVideoId } from '../../utils/youtube';

function resolveVideoThumbnailUrl(rawThumbnailUrl: string | null, videoUrl: string): string {
    const thumbnailUrl = (rawThumbnailUrl ?? '').trim();
    if (thumbnailUrl) return thumbnailUrl;

    const videoId = extractYouTubeVideoId(videoUrl);
    return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
}

export const videoLibraryService = {
    /**
     * Fetch all puzzles that have video content, with unlock status for current user.
     * Pro Supporters see everything as unlocked.
     */
    async getLibrary(): Promise<VideoLibraryItem[]> {
        // Fetch auth + puzzles in parallel (puzzles query doesn't need auth)
        const [{ data: { user } }, { data, error }] = await Promise.all([
            supabase.auth.getUser(),
            supabase
                .from('puzzles')
                .select(`
                    id,
                    tier,
                    video_url,
                    video_title,
                    video_thumbnail_url,
                    pro_player,
                    stage
                `)
                .not('video_url', 'is', null)
                .is('deleted_at', null)
                .order('tier', { ascending: true })
                .order('created_at', { ascending: false }),
        ]);

        if (error || !data) return [];

        // Fetch unlocks (pro features are free now)
        let unlockedMap = new Map<string, { unlocked_at: string; user_result: string; iq_delta: number }>();
        let isProSupporter = true;

        if (user) {
            const unlocksResult = await supabase
                .from('user_video_unlocks')
                .select('puzzle_id, unlocked_at, user_result, iq_delta')
                .eq('user_id', user.id);

            if (unlocksResult.data) {
                unlocksResult.data.forEach(u => {
                    unlockedMap.set(u.puzzle_id, {
                        unlocked_at: u.unlocked_at,
                        user_result: u.user_result,
                        iq_delta: u.iq_delta,
                    });
                });
            }
        }

        return data.map(puzzle => {
            const unlock = unlockedMap.get(puzzle.id);
            return {
                puzzleId: puzzle.id,
                puzzleTier: puzzle.tier || 'free',
                videoUrl: puzzle.video_url,
                videoTitle: puzzle.video_title || 'Pro Analysis',
                videoThumbnailUrl: resolveVideoThumbnailUrl(puzzle.video_thumbnail_url, puzzle.video_url),
                isUnlocked: isProSupporter || !!unlock,
                unlockedAt: unlock?.unlocked_at,
                userResult: unlock?.user_result as 'correct' | 'incorrect' | undefined,
                iqDelta: unlock?.iq_delta,
                proPlayer: puzzle.pro_player,
                stage: puzzle.stage,
            };
        });
    },

    /**
     * Record a video unlock after puzzle completion.
     * Upserts — safe to call multiple times for same puzzle.
     */
    async unlockVideo(params: {
        puzzleId: string;
        videoUrl: string;
        userResult: 'correct' | 'incorrect';
        iqDelta?: number;
    }): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('user_video_unlocks')
            .upsert({
                user_id: user.id,
                puzzle_id: params.puzzleId,
                video_url: params.videoUrl,
                user_result: params.userResult,
                iq_delta: params.iqDelta ?? null,
            }, { onConflict: 'user_id,puzzle_id' });

        if (error) {
            console.error('Error unlocking video:', error);
            return false;
        }
        return true;
    },

    /**
     * Get the count of unlocked videos for the current user.
     */
    async getUnlockedCount(): Promise<number> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 0;

        const { count, error } = await supabase
            .from('user_video_unlocks')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (error) return 0;
        return count ?? 0;
    },

    /**
     * Check if the user just reached a new milestone.
     * Returns the newly-reached milestone, or null if none.
     */
    checkMilestone(unlockedCount: number, previousCount: number): VideoMilestone | null {
        for (const milestone of VIDEO_MILESTONES) {
            // Just crossed the threshold
            if (unlockedCount >= milestone.threshold && previousCount < milestone.threshold) {
                return milestone;
            }
        }
        return null;
    },
};
