export type UserIqRank = 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster' | 'Challenger';

export interface UserIqStats {
    iq_score: number;
    iq_rank: UserIqRank;
    season: number;
    total_puzzles_solved: number;
    accuracy_weight: number;
    speed_weight: number;
}

export interface UserIqHistoryEntry {
    id: string;
    user_id: string;
    puzzle_id: string;
    change_amount: number;
    time_taken_ms: number;
    is_correct: boolean;
    created_at: string;
}

export const USER_IQ_RANKS: { min: number; rank: UserIqRank; icon: string }[] = [
    { min: 2000, rank: 'Challenger', icon: '👑' },
    { min: 1800, rank: 'Grandmaster', icon: '🔮' },
    { min: 1600, rank: 'Master', icon: '⚔️' },
    { min: 1400, rank: 'Diamond', icon: '💎' },
    { min: 1200, rank: 'Platinum', icon: '💠' },
    { min: 1000, rank: 'Gold', icon: '🥇' },
    { min: 800, rank: 'Silver', icon: '🥈' },
    { min: 500, rank: 'Bronze', icon: '🥉' },
    { min: 0, rank: 'Iron', icon: '🪨' },
];
