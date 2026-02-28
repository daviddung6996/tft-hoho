import { useState, useEffect, useCallback } from 'react';
import { proSupporterService } from '../proSupporter.service';
import { ProSupporter } from '../proSupporter.types';
import { useAuth } from '../../../contexts/AuthContext';

export function useProSupporter() {
    const { isAuthenticated, isGuest } = useAuth();
    const [isProSupporter, setIsProSupporter] = useState(false);
    const [details, setDetails] = useState<ProSupporter | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!isAuthenticated || isGuest) {
            setIsProSupporter(false);
            setDetails(null);
            return;
        }
        setIsLoading(true);
        try {
            const [isPro, status] = await Promise.all([
                proSupporterService.isProSupporter(),
                proSupporterService.getStatus(),
            ]);
            setIsProSupporter(isPro);
            setDetails(status);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, isGuest]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        isProSupporter,
        plan: details?.plan ?? null,
        expiresAt: details?.expiresAt ?? null,
        status: details?.status ?? null,
        isLoading,
        refresh,
    };
}
