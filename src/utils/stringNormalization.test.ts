import { describe, expect, it } from 'vitest';
import { normalizeCompactLookupValue, normalizeLookupValue } from './stringNormalization';

describe('stringNormalization', () => {
    it('normalizes string values safely', () => {
        expect(normalizeLookupValue('  Infinity Edge  ')).toBe('infinity edge');
        expect(normalizeCompactLookupValue('  Infinity Edge  ')).toBe('infinityedge');
    });

    it('returns empty string for non-string values', () => {
        expect(normalizeLookupValue(undefined)).toBe('');
        expect(normalizeLookupValue(null)).toBe('');
        expect(normalizeLookupValue(42)).toBe('');
        expect(normalizeCompactLookupValue(undefined)).toBe('');
    });
});
