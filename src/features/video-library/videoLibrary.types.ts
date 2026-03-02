export interface VideoLibraryItem {
    puzzleId: string;
    puzzleTier: 'free' | 'advanced' | 'rare';
    videoUrl: string;
    videoTitle: string;
    videoThumbnailUrl: string;
    isUnlocked: boolean;
    unlockedAt?: string;
    userResult?: 'correct' | 'incorrect';
    iqDelta?: number;
    proPlayer?: string;
    stage?: string;
}

export type LibraryFilter = 'all' | 'unlocked' | 'locked';

export interface VideoMilestone {
    threshold: number;
    reward: number;
    message: string;
    badge?: string;
    earnReason: 'video_milestone_5' | 'video_milestone_15' | 'video_milestone_30';
}
