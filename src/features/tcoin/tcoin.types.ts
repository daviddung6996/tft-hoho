export interface UserWallet {
    id: string;
    userId: string;
    balance: number;
    totalEarned: number;
    totalSpent: number;
    createdAt: string;
    updatedAt: string;
}

export interface TCoinTransaction {
    id: string;
    userId: string;
    amount: number;
    balanceAfter: number;
    type: 'earn' | 'spend';
    reason: EarnReason | SpendReason;
    referenceId?: string;
    createdAt: string;
}

export type EarnReason =
    | 'puzzle_correct'
    | 'puzzle_correct_no_reroll'
    | 'puzzle_correct_fast'
    | 'puzzle_incorrect'
    | 'daily_challenge_complete'
    | 'daily_challenge_correct'
    | 'streak_3'
    | 'streak_5'
    | 'first_share_daily'
    | 'first_puzzle'
    | 'video_milestone_5'
    | 'video_milestone_15'
    | 'video_milestone_30';

export type SpendReason =
    | 'unlock_advanced'
    | 'unlock_rare'
    | 'hint';

/** T-Coin earn rates from SHIP-PLAN */
export const TCOIN_EARN_RATES: Record<EarnReason, number> = {
    puzzle_correct: 5,
    puzzle_correct_no_reroll: 8,
    puzzle_correct_fast: 10,
    puzzle_incorrect: 1,
    daily_challenge_complete: 15,
    daily_challenge_correct: 30,
    streak_3: 10,
    streak_5: 25,
    first_share_daily: 5,
    first_puzzle: 30,
    video_milestone_5: 20,
    video_milestone_15: 50,
    video_milestone_30: 100,
};

/** T-Coin spend costs */
export const TCOIN_SPEND_COSTS: Record<SpendReason, number> = {
    unlock_advanced: 30,
    unlock_rare: 100,
    hint: 10,
};

export type PuzzleTier = 'free' | 'advanced' | 'rare';

export interface PuzzleAccessResult {
    canPlay: boolean;
    reason: 'free' | 'unlocked' | 'pro_supporter' | 'locked';
    cost?: number;
    tier: PuzzleTier;
}
