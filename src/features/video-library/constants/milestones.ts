import { VideoMilestone } from '../videoLibrary.types';

export const VIDEO_MILESTONES: VideoMilestone[] = [
    {
        threshold: 5,
        reward: 20,
        message: 'Bắt đầu xây kho kiến thức!',
        earnReason: 'video_milestone_5',
    },
    {
        threshold: 15,
        reward: 50,
        message: 'Nửa đường rồi — đi tiếp!',
        earnReason: 'video_milestone_15',
    },
    {
        threshold: 30,
        reward: 100,
        message: 'Mở khóa tất cả!',
        badge: 'full_collection',
        earnReason: 'video_milestone_30',
    },
];
