import {
    resolveMonetizationMode,
    getTierProductLabel,
    isBetaActive,
    PUZZLE_TIER_PRODUCT_LABELS,
} from '../features/monetization/monetizationConfig';
import type { MonetizationPackaging } from '../features/monetization/monetization.types';

/**
 * Monetization packaging config.
 *
 * v1 intentionally ships framing and packaging only.
 * Exact daily entitlement enforcement is disabled until puzzle metadata exposes
 * a stable featured-daily identity and a reliable last-7 ordering source.
 */
export const MONETIZATION_PACKAGING: MonetizationPackaging = {
    betaWindow: {
        startsAt: '2026-03-17T00:00:00.000Z',
        endsAt: '2026-04-16T23:59:59.999Z',
    },
    freeEntitlement: {
        featuredDailyCount: 1,
        recentDailyWindow: 7,
        enforceDailyWindow: false,
    },
    premiumLaneLabels: ['Hard', 'Pro'],
};

export const MONETIZATION_MODE = resolveMonetizationMode(new Date(), MONETIZATION_PACKAGING);

/**
 * Compatibility export for existing callers that still branch on a boolean flag.
 * Monetization remains disabled during beta and becomes active after the beta window.
 */
export const MONETIZATION_ENABLED = MONETIZATION_MODE === 'free-pro';

export {
    getTierProductLabel,
    isBetaActive,
    PUZZLE_TIER_PRODUCT_LABELS,
    resolveMonetizationMode,
};
