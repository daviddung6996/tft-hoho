import { describe, expect, test } from 'vitest';

import {
    MONETIZATION_PACKAGING,
    PUZZLE_TIER_PRODUCT_LABELS,
    getTierProductLabel,
    isBetaActive,
    resolveMonetizationMode,
} from './monetization';

describe('monetization config', () => {
    test('returns beta mode while current date is inside the beta window', () => {
        const now = new Date('2026-03-20T12:00:00.000Z');

        expect(resolveMonetizationMode(now, MONETIZATION_PACKAGING)).toBe('beta');
        expect(isBetaActive(now, MONETIZATION_PACKAGING)).toBe(true);
    });

    test('returns free-pro mode after the beta window ends', () => {
        const now = new Date('2026-04-17T00:00:00.000Z');

        expect(resolveMonetizationMode(now, MONETIZATION_PACKAGING)).toBe('free-pro');
        expect(isBetaActive(now, MONETIZATION_PACKAGING)).toBe(false);
    });

    test('maps advanced and rare puzzle tiers to the approved product labels', () => {
        expect(getTierProductLabel('free')).toBe('free');
        expect(getTierProductLabel('advanced')).toBe('Hard');
        expect(getTierProductLabel('rare')).toBe('Pro');
        expect(PUZZLE_TIER_PRODUCT_LABELS).toEqual({
            free: 'free',
            advanced: 'Hard',
            rare: 'Pro',
        });
    });

    test('records packaging-only daily entitlement framing without enabling exact enforcement', () => {
        expect(MONETIZATION_PACKAGING.freeEntitlement).toEqual({
            featuredDailyCount: 1,
            recentDailyWindow: 7,
            enforceDailyWindow: false,
        });
        expect(MONETIZATION_PACKAGING.premiumLaneLabels).toEqual(['Hard', 'Pro']);
    });

    test('derives active mode from betaWindow instead of storing duplicate mode config', () => {
        expect('mode' in MONETIZATION_PACKAGING).toBe(false);
    });
});
