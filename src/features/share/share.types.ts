import { UserIqRank } from '../user-iq/userIq.types';

export interface FlexCardData {
    username: string;
    iqScore: number;
    iqRank: UserIqRank;
    topPercent?: number;
    region?: string;
    recentPuzzle?: {
        rank: string;
        addedIq: number;
    };
}
