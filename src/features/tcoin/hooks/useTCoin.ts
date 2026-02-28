import { useState, useEffect, useCallback } from 'react';
import { tcoinService } from '../tcoin.service';
import { UserWallet, EarnReason, SpendReason, PuzzleTier, PuzzleAccessResult } from '../tcoin.types';
import { useAuth } from '../../../contexts/AuthContext';

export function useTCoin() {
    const { isAuthenticated, isGuest } = useAuth();
    const [wallet, setWallet] = useState<UserWallet | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const balance = wallet?.balance ?? 0;

    const refresh = useCallback(async () => {
        if (!isAuthenticated || isGuest) {
            setWallet(null);
            return;
        }
        setIsLoading(true);
        try {
            const w = await tcoinService.getWallet();
            setWallet(w);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, isGuest]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const earn = useCallback(async (reason: EarnReason, referenceId?: string) => {
        const result = await tcoinService.earnCoins(reason, referenceId);
        if (result) {
            setWallet(prev => prev ? { ...prev, balance: result.newBalance, totalEarned: prev.totalEarned + result.earned } : prev);
        }
        return result;
    }, []);

    const spend = useCallback(async (reason: SpendReason, referenceId?: string) => {
        const result = await tcoinService.spendCoins(reason, referenceId);
        if (result) {
            setWallet(prev => prev ? { ...prev, balance: result.newBalance, totalSpent: prev.totalSpent + result.spent } : prev);
        }
        return result;
    }, []);

    const checkAccess = useCallback(async (puzzleId: string, tier: PuzzleTier): Promise<PuzzleAccessResult> => {
        return tcoinService.checkPuzzleAccess(puzzleId, tier);
    }, []);

    const unlockPuzzle = useCallback(async (puzzleId: string, tier: PuzzleTier): Promise<boolean> => {
        const result = await tcoinService.unlockPuzzle(puzzleId, tier);
        if (result) {
            await refresh();
        }
        return result;
    }, [refresh]);

    return {
        balance,
        wallet,
        isLoading,
        earn,
        spend,
        checkAccess,
        unlockPuzzle,
        refresh,
    };
}
