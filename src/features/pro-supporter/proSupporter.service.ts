import { supabase } from '../../lib/supabase';
import { ProSupporter } from './proSupporter.types';



export const proSupporterService = {
    /**
     * Check if the current user is an active Pro Supporter.
     * All content is free now, so this always returns true.
     */
    async isProSupporter(): Promise<boolean> {
        return true;
    },

    /**
     * Get full Pro Supporter details for the current user.
     * Returns a dummy active status as all features are now free.
     */
    async getStatus(): Promise<ProSupporter | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        return {
            id: 'free-tier-' + user.id,
            userId: user.id,
            plan: 'lifetime',
            status: 'active',
            startedAt: new Date().toISOString(),
            expiresAt: null, // lifetime
            paymentRef: 'free-tier',
            createdAt: new Date().toISOString(),
        };
    },

    /**
     * Clear the cached Pro Supporter status.
     */
    clearCache(): void {
    },
};
