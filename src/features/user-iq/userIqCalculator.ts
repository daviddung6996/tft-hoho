import { UserIqRank, USER_IQ_RANKS } from './userIq.types';

export function calculateUserIqRank(score: number): UserIqRank {
    for (const rank of USER_IQ_RANKS) {
        if (score >= rank.min) return rank.rank;
    }
    return 'Iron';
}

export function getUserIqRankIcon(rank: UserIqRank): string {
    return USER_IQ_RANKS.find((r) => r.rank === rank)?.icon || '🪨';
}

export function getUserIqRankColor(rank: UserIqRank): string {
    switch (rank) {
        case 'Challenger': return '#00D1C1';
        case 'Grandmaster': return '#FF6B35';
        case 'Master': return '#8B5CF6';
        case 'Diamond': return '#4F46E5';
        case 'Platinum': return '#0EA5E9';
        case 'Gold': return '#EAB308';
        case 'Silver': return '#94A3B8';
        case 'Bronze': return '#B45309';
        case 'Iron': return '#4B5563';
        default: return '#4B5563';
    }
}

export function calculateIqChange(isCorrect: boolean, timeTakenSeconds: number): number {
    if (!isCorrect) return -18;

    let points = 22;

    if (timeTakenSeconds < 8) {
        points += 8;
    } else if (timeTakenSeconds < 15) {
        points += 5;
    } else if (timeTakenSeconds < 25) {
        points += 2;
    }

    return points;
}

