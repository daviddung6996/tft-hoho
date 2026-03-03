import { supabase } from '../../lib/supabase';
import {
    UserWallet,
    TCoinTransaction,
    EarnReason,
    SpendReason,
    TCOIN_EARN_RATES,
    TCOIN_PUZZLE_DAILY_CAPPED_REASONS,
    TCOIN_PUZZLE_DAILY_CAP,
    TCOIN_SPEND_COSTS,
    PuzzleTier,
    PuzzleAccessResult,
} from './tcoin.types';
import { proSupporterService } from '../pro-supporter/proSupporter.service';

const UTC_PLUS_7_MS = 7 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const tcoinService = {
    /**
     * Get or create wallet for the current user.
     * New users start with 30 T-Coin (welcome bonus).
     */
    async getWallet(): Promise<UserWallet | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Try to fetch existing wallet
        const { data, error } = await supabase
            .from('user_wallets')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (data) {
            return mapWallet(data);
        }

        // Create wallet if it doesn't exist
        if (error?.code === 'PGRST116') {
            const { data: newWallet, error: insertError } = await supabase
                .from('user_wallets')
                .insert({ user_id: user.id, balance: 30, total_earned: 30, total_spent: 0 })
                .select()
                .single();

            if (insertError) {
                console.error('Error creating wallet:', insertError);
                return null;
            }
            return mapWallet(newWallet);
        }

        console.error('Error fetching wallet:', error);
        return null;
    },

    /**
     * Earn T-Coins. Atomically updates balance and logs transaction.
     */
    async earnCoins(reason: EarnReason, referenceId?: string): Promise<{ newBalance: number; earned: number } | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        let amount = TCOIN_EARN_RATES[reason];
        const wallet = await this.getWallet();
        if (!wallet) return null;

        if (isPuzzleDailyCappedReason(reason)) {
            const earnedToday = await getPuzzleCoinsEarnedTodayUtc7(user.id);
            const remainingToday = Math.max(0, TCOIN_PUZZLE_DAILY_CAP - earnedToday);
            amount = Math.min(amount, remainingToday);
        }

        if (amount <= 0) {
            return { newBalance: wallet.balance, earned: 0 };
        }

        const newBalance = wallet.balance + amount;

        // Update wallet
        const { error: walletError } = await supabase
            .from('user_wallets')
            .update({
                balance: newBalance,
                total_earned: wallet.totalEarned + amount,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

        if (walletError) {
            console.error('Error updating wallet:', walletError);
            return null;
        }

        // Log transaction
        await supabase.from('tcoin_transactions').insert({
            user_id: user.id,
            amount,
            balance_after: newBalance,
            type: 'earn',
            reason,
            reference_id: referenceId || null,
        });

        return { newBalance, earned: amount };
    },

    /**
     * Spend T-Coins. Checks balance first. Returns null if insufficient.
     */
    async spendCoins(reason: SpendReason, referenceId?: string): Promise<{ newBalance: number; spent: number } | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const amount = TCOIN_SPEND_COSTS[reason];
        const wallet = await this.getWallet();
        if (!wallet || wallet.balance < amount) return null;

        const newBalance = wallet.balance - amount;

        // Update wallet
        const { error: walletError } = await supabase
            .from('user_wallets')
            .update({
                balance: newBalance,
                total_spent: wallet.totalSpent + amount,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

        if (walletError) {
            console.error('Error spending coins:', walletError);
            return null;
        }

        // Log transaction
        await supabase.from('tcoin_transactions').insert({
            user_id: user.id,
            amount: -amount,
            balance_after: newBalance,
            type: 'spend',
            reason,
            reference_id: referenceId || null,
        });

        return { newBalance, spent: amount };
    },

    /**
     * Check if user can afford a purchase.
     */
    async canAfford(reason: SpendReason): Promise<boolean> {
        const wallet = await this.getWallet();
        if (!wallet) return false;
        return wallet.balance >= TCOIN_SPEND_COSTS[reason];
    },

    /**
     * Check if a puzzle is accessible to the current user.
     */
    async checkPuzzleAccess(puzzleId: string, tier: PuzzleTier): Promise<PuzzleAccessResult> {
        if (tier === 'free') {
            return { canPlay: true, reason: 'free', tier };
        }

        // Check Pro Supporter first (bypass all)
        const isPro = await proSupporterService.isProSupporter();
        if (isPro) {
            return { canPlay: true, reason: 'pro_supporter', tier };
        }

        // Check if puzzle is already unlocked
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            const cost = tier === 'advanced' ? TCOIN_SPEND_COSTS.unlock_advanced : TCOIN_SPEND_COSTS.unlock_rare;
            return { canPlay: false, reason: 'locked', cost, tier };
        }

        const { data: unlock } = await supabase
            .from('user_unlocked_puzzles')
            .select('id')
            .eq('user_id', user.id)
            .eq('puzzle_id', puzzleId)
            .single();

        if (unlock) {
            return { canPlay: true, reason: 'unlocked', tier };
        }

        const cost = tier === 'advanced' ? TCOIN_SPEND_COSTS.unlock_advanced : TCOIN_SPEND_COSTS.unlock_rare;
        return { canPlay: false, reason: 'locked', cost, tier };
    },

    /**
     * Unlock a puzzle by spending T-Coins.
     */
    async unlockPuzzle(puzzleId: string, tier: PuzzleTier): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const reason: SpendReason = tier === 'advanced' ? 'unlock_advanced' : 'unlock_rare';
        const result = await this.spendCoins(reason, puzzleId);
        if (!result) return false;

        // Record the unlock
        const { error } = await supabase.from('user_unlocked_puzzles').insert({
            user_id: user.id,
            puzzle_id: puzzleId,
            tier,
        });

        if (error) {
            console.error('Error recording unlock:', error);
            return false;
        }

        return true;
    },

    /**
     * Get recent transaction history.
     */
    async getTransactionHistory(limit = 20): Promise<TCoinTransaction[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('tcoin_transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error || !data) return [];
        return data.map(mapTransaction);
    },

    /**
     * Get all unlocked puzzle IDs for the current user.
     */
    async getUnlockedPuzzleIds(): Promise<Set<string>> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new Set();

        const { data, error } = await supabase
            .from('user_unlocked_puzzles')
            .select('puzzle_id')
            .eq('user_id', user.id);

        if (error || !data) return new Set();
        return new Set(data.map(d => d.puzzle_id));
    },
};

function mapWallet(row: any): UserWallet {
    return {
        id: row.id,
        userId: row.user_id,
        balance: row.balance,
        totalEarned: row.total_earned,
        totalSpent: row.total_spent,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapTransaction(row: any): TCoinTransaction {
    return {
        id: row.id,
        userId: row.user_id,
        amount: row.amount,
        balanceAfter: row.balance_after,
        type: row.type,
        reason: row.reason,
        referenceId: row.reference_id,
        createdAt: row.created_at,
    };
}

function isPuzzleDailyCappedReason(reason: EarnReason): boolean {
    return TCOIN_PUZZLE_DAILY_CAPPED_REASONS.includes(reason);
}

function getUtc7DayRange(now: Date = new Date()): { startIso: string; endIso: string } {
    const utc7Now = new Date(now.getTime() + UTC_PLUS_7_MS);
    const utc7StartOfDayMs = Date.UTC(
        utc7Now.getUTCFullYear(),
        utc7Now.getUTCMonth(),
        utc7Now.getUTCDate(),
        0, 0, 0, 0
    );

    const startUtcMs = utc7StartOfDayMs - UTC_PLUS_7_MS;
    const endUtcMs = startUtcMs + ONE_DAY_MS;

    return {
        startIso: new Date(startUtcMs).toISOString(),
        endIso: new Date(endUtcMs).toISOString(),
    };
}

async function getPuzzleCoinsEarnedTodayUtc7(userId: string): Promise<number> {
    const { startIso, endIso } = getUtc7DayRange();
    const { data, error } = await supabase
        .from('tcoin_transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'earn')
        .in('reason', TCOIN_PUZZLE_DAILY_CAPPED_REASONS)
        .gte('created_at', startIso)
        .lt('created_at', endIso);

    if (error || !data) {
        if (error) console.error('Error checking daily T-Coin cap:', error);
        return 0;
    }

    return data.reduce((sum, row) => sum + Math.max(0, row.amount ?? 0), 0);
}
