import type { PuzzleTier } from '../tcoin/tcoin.types';
import type {
    MonetizationMode,
    MonetizationPackaging,
    PuzzleTierProductLabel,
    PuzzleTierProductLabelMap,
} from './monetization.types';

export const PUZZLE_TIER_PRODUCT_LABELS: PuzzleTierProductLabelMap = {
    free: 'free',
    advanced: 'Hard',
    rare: 'Pro',
};

export function isBetaActive(now: Date, config: MonetizationPackaging): boolean {
    const currentTime = now.getTime();
    const betaStartsAt = new Date(config.betaWindow.startsAt).getTime();
    const betaEndsAt = new Date(config.betaWindow.endsAt).getTime();

    return currentTime >= betaStartsAt && currentTime <= betaEndsAt;
}

export function resolveMonetizationMode(now: Date, config: MonetizationPackaging): MonetizationMode {
    return isBetaActive(now, config) ? 'beta' : 'free-pro';
}

export function getTierProductLabel(tier: PuzzleTier): PuzzleTierProductLabel {
    return PUZZLE_TIER_PRODUCT_LABELS[tier];
}
