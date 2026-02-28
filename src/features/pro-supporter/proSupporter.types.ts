export type ProSupporterPlan = 'monthly' | 'lifetime';
export type ProSupporterStatus = 'active' | 'expired' | 'cancelled';

export interface ProSupporter {
    id: string;
    userId: string;
    plan: ProSupporterPlan;
    status: ProSupporterStatus;
    startedAt: string;
    expiresAt: string | null;
    paymentRef?: string;
    createdAt: string;
}

export interface Donation {
    id: string;
    userId?: string;
    amount: number;
    tier: 'thanks' | 'superfan';
    message?: string;
    paymentRef?: string;
    createdAt: string;
}

/** Pro Supporter pricing (VND) */
export const PRO_SUPPORTER_PRICING = {
    monthly: 49_000,
    lifetime: 299_000,
} as const;

/** Donation tiers */
export const DONATION_TIERS = {
    thanks: { label: 'Cảm ơn', amount: 20_000 },
    superfan: { label: 'Fan cứng', amount: 50_000 },
} as const;
