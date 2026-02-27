import { supabase } from '../lib/supabase';

// Types for tracking data
export interface AttemptData {
    puzzleId: string;
    userPickId: string;
    userPickName: string;
    isCorrect: boolean;
    rerollCount: number;
    rerollIndices: number[];
    timeToDecideMs: number;
    puzzleStage: string;
    proPickId: string;
}

export interface UserStats {
    totalAttempts: number;
    correctCount: number;
    accuracyPercent: number;
    avgTimeMs: number;
    avgRerolls: number;
}

export interface StageStats {
    stage: string;
    total: number;
    correct: number;
    accuracyPercent: number;
}

export interface AttemptRecord {
    id: string;
    puzzleId: string;
    userPickName: string;
    isCorrect: boolean;
    rerollCount: number;
    timeToDecideMs: number;
    puzzleStage: string;
    createdAt: string;
    iqChangeAmount?: number | null;
}

export interface AccuracyTrend {
    attemptNumber: number;
    isCorrect: boolean;
    rollingAccuracy: number;
    createdAt: string;
}

export const userStatsService = {
    /**
     * Record a user's puzzle attempt
     */
    async recordAttempt(data: AttemptData): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.warn('Cannot record attempt: user not authenticated');
            return;
        }

        const { error } = await supabase
            .from('user_puzzle_attempts')
            .insert({
                user_id: user.id,
                puzzle_id: data.puzzleId,
                user_pick_id: data.userPickId,
                user_pick_name: data.userPickName,
                is_correct: data.isCorrect,
                reroll_count: data.rerollCount,
                reroll_indices: data.rerollIndices,
                time_to_decide_ms: data.timeToDecideMs,
                puzzle_stage: data.puzzleStage,
                pro_pick_id: data.proPickId,
            });

        if (error) {
            console.error('Error recording attempt:', error);
        }
    },

    /**
     * Get overall user statistics
     */
    async getUserStats(userId?: string): Promise<UserStats> {
        const uid = userId || (await supabase.auth.getUser()).data.user?.id;
        if (!uid) {
            return { totalAttempts: 0, correctCount: 0, accuracyPercent: 0, avgTimeMs: 0, avgRerolls: 0 };
        }

        const { data, error } = await supabase
            .from('user_puzzle_attempts')
            .select('is_correct, time_to_decide_ms, reroll_count')
            .eq('user_id', uid);

        if (error || !data || data.length === 0) {
            return { totalAttempts: 0, correctCount: 0, accuracyPercent: 0, avgTimeMs: 0, avgRerolls: 0 };
        }

        const totalAttempts = data.length;
        const correctCount = data.filter(a => a.is_correct).length;
        const accuracyPercent = Math.round((correctCount / totalAttempts) * 100);

        const totalTime = data.reduce((sum, a) => sum + (a.time_to_decide_ms || 0), 0);
        const avgTimeMs = Math.round(totalTime / totalAttempts);

        const totalRerolls = data.reduce((sum, a) => sum + (a.reroll_count || 0), 0);
        const avgRerolls = Math.round((totalRerolls / totalAttempts) * 10) / 10;

        return { totalAttempts, correctCount, accuracyPercent, avgTimeMs, avgRerolls };
    },

    /**
     * Get accuracy breakdown by stage
     */
    async getStageBreakdown(userId?: string): Promise<StageStats[]> {
        const uid = userId || (await supabase.auth.getUser()).data.user?.id;
        if (!uid) return [];

        const { data, error } = await supabase
            .from('user_puzzle_attempts')
            .select('puzzle_stage, is_correct')
            .eq('user_id', uid);

        if (error || !data) return [];

        // Group by stage
        const stageMap = new Map<string, { total: number; correct: number }>();

        for (const attempt of data) {
            const stage = attempt.puzzle_stage || 'Unknown';
            const current = stageMap.get(stage) || { total: 0, correct: 0 };
            current.total++;
            if (attempt.is_correct) current.correct++;
            stageMap.set(stage, current);
        }

        // Convert to array and calculate percentages
        const stages: StageStats[] = [];
        stageMap.forEach((stats, stage) => {
            stages.push({
                stage,
                total: stats.total,
                correct: stats.correct,
                accuracyPercent: Math.round((stats.correct / stats.total) * 100)
            });
        });

        // Sort by stage name
        stages.sort((a, b) => a.stage.localeCompare(b.stage));
        return stages;
    },

    /**
     * Get recent attempts for activity feed
     */
    async getRecentAttempts(userId?: string, limit = 10): Promise<AttemptRecord[]> {
        const uid = userId || (await supabase.auth.getUser()).data.user?.id;
        if (!uid) return [];

        const { data: attemptsData, error: attemptsError } = await supabase
            .from('user_puzzle_attempts')
            .select('id, puzzle_id, user_pick_name, is_correct, reroll_count, time_to_decide_ms, puzzle_stage, created_at')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (attemptsError || !attemptsData) {
            console.error('Error fetching recent attempts:', attemptsError);
            return [];
        }

        if (attemptsData.length === 0) return [];

        // Fetch IQ history — latest entry per puzzle_id
        const puzzleIds = [...new Set(attemptsData.map(a => a.puzzle_id))];
        const { data: iqData, error: iqError } = await supabase
            .from('user_iq_history')
            .select('puzzle_id, change_amount, created_at')
            .eq('user_id', uid)
            .in('puzzle_id', puzzleIds)
            .order('created_at', { ascending: false });

        // Keep only the latest IQ entry per puzzle_id
        const iqByPuzzle = new Map<string, number>();
        if (!iqError && iqData) {
            for (const row of iqData) {
                if (!iqByPuzzle.has(row.puzzle_id)) {
                    iqByPuzzle.set(row.puzzle_id, row.change_amount);
                }
            }
        }

        return attemptsData.map((row: any) => ({
            id: row.id,
            puzzleId: row.puzzle_id,
            userPickName: row.user_pick_name,
            isCorrect: row.is_correct,
            rerollCount: row.reroll_count,
            timeToDecideMs: row.time_to_decide_ms,
            puzzleStage: row.puzzle_stage,
            createdAt: row.created_at,
            iqChangeAmount: iqByPuzzle.get(row.puzzle_id) ?? null
        }));
    },

    /**
     * Get accuracy trend data for line chart
     */
    async getAccuracyTrend(userId?: string, limit = 20): Promise<AccuracyTrend[]> {
        const uid = userId || (await supabase.auth.getUser()).data.user?.id;
        if (!uid) return [];

        const { data, error } = await supabase
            .from('user_puzzle_attempts')
            .select('is_correct, created_at')
            .eq('user_id', uid)
            .order('created_at', { ascending: true });

        if (error || !data) return [];

        // Calculate rolling accuracy
        const trends: AccuracyTrend[] = [];
        let correctSoFar = 0;

        // Take last N attempts
        const recentData = data.slice(-limit);

        recentData.forEach((attempt, index) => {
            if (attempt.is_correct) correctSoFar++;
            const rollingAccuracy = Math.round((correctSoFar / (index + 1)) * 100);

            trends.push({
                attemptNumber: index + 1,
                isCorrect: attempt.is_correct,
                rollingAccuracy,
                createdAt: attempt.created_at
            });
        });

        return trends;
    }
};
