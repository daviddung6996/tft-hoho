import { supabase } from '../../lib/supabase';
import { UserIqStats } from './userIq.types';
import { calculateIqChange, calculateUserIqRank } from './userIqCalculator';

export async function getUserIqStats(userId: string): Promise<UserIqStats | null> {
    const { data, error } = await supabase
        .from('users')
        .select('iq_score, iq_rank, season, total_puzzles_solved, accuracy_weight, speed_weight')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Lỗi khi lấy thông tin IQ:', error);
        return null;
    }

    return data;
}

export async function updateUserIq(
    userId: string,
    puzzleId: string,
    isCorrect: boolean,
    timeTakenSeconds: number
): Promise<{ changeAmount: number; newScore: number; newRank: string }> {

    // 1. Tính toán điểm cộng/trừ
    const changeAmount = calculateIqChange(isCorrect, timeTakenSeconds);

    // 2. Lấy stat hiện tại
    const currentStats = await getUserIqStats(userId);

    // Nếu chưa có, coi như đang ở 0 điểm (Iron)
    const currentScore = currentStats ? (currentStats.iq_score || 0) : 0;
    const currentTotalSolved = currentStats ? (currentStats.total_puzzles_solved || 0) : 0;

    const newScore = Math.max(0, currentScore + changeAmount);
    const newRank = calculateUserIqRank(newScore);
    const newTotalSolved = currentTotalSolved + 1;

    // 3. Update bảng users
    const { error: userUpdateErr } = await supabase
        .from('users')
        .update({
            iq_score: newScore,
            iq_rank: newRank,
            total_puzzles_solved: newTotalSolved
        })
        .eq('id', userId);

    if (userUpdateErr) {
        console.error('Lỗi khi cập nhật điểm IQ:', userUpdateErr);
    }

    // 4. Ghi lại lịch sử
    const { error: historyErr } = await supabase
        .from('user_iq_history')
        .insert({
            user_id: userId,
            puzzle_id: puzzleId,
            change_amount: changeAmount,
            time_taken_ms: timeTakenSeconds * 1000,
            is_correct: isCorrect
        });

    if (historyErr) {
        console.error('Lỗi khi thêm history:', historyErr);
    }

    return { changeAmount, newScore, newRank };
}
