import type { PuzzleTier } from '../tcoin/tcoin.types';

export type MonetizationMode = 'beta' | 'free-pro';

export interface BetaWindow {
    startsAt: string;
    endsAt: string;
}

export interface FreeEntitlement {
    featuredDailyCount: number;
    recentDailyWindow: number;
    enforceDailyWindow: boolean;
}

export type PremiumLaneLabel = 'Hard' | 'Pro';

export interface MonetizationPackaging {
    betaWindow: BetaWindow;
    freeEntitlement: FreeEntitlement;
    premiumLaneLabels: PremiumLaneLabel[];
}

export type PuzzleTierProductLabel = 'free' | 'Hard' | 'Pro';

export type PuzzleTierProductLabelMap = Record<PuzzleTier, PuzzleTierProductLabel>;
