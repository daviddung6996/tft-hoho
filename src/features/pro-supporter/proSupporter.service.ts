import { supabase } from '../../lib/supabase';
import { ProSupporter } from './proSupporter.types';

let cachedStatus: boolean | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 1 minute cache

export const proSupporterService = {
    /**
     * Check if the current user is an active Pro Supporter.
     * Results are cached for 1 minute.
     */
    async isProSupporter(): Promise<boolean> {
        // Return cached result if fresh
        if (cachedStatus !== null && Date.now() - cacheTimestamp < CACHE_TTL) {
            return cachedStatus;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            cachedStatus = false;
            cacheTimestamp = Date.now();
            return false;
        }

        const { data, error } = await supabase
            .from('pro_supporters')
            .select('id, status, expires_at')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();

        if (error || !data) {
            cachedStatus = false;
            cacheTimestamp = Date.now();
            return false;
        }

        // Check expiry for monthly plans
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            // Expired — update status
            await supabase
                .from('pro_supporters')
                .update({ status: 'expired' })
                .eq('id', data.id);
            cachedStatus = false;
            cacheTimestamp = Date.now();
            return false;
        }

        cachedStatus = true;
        cacheTimestamp = Date.now();
        return true;
    },

    /**
     * Get full Pro Supporter details for the current user.
     */
    async getStatus(): Promise<ProSupporter | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('pro_supporters')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error || !data) return null;

        return {
            id: data.id,
            userId: data.user_id,
            plan: data.plan,
            status: data.status,
            startedAt: data.started_at,
            expiresAt: data.expires_at,
            paymentRef: data.payment_ref,
            createdAt: data.created_at,
        };
    },

    /**
     * Clear the cached Pro Supporter status (call after payment).
     */
    clearCache(): void {
        cachedStatus = null;
        cacheTimestamp = 0;
    },
};
