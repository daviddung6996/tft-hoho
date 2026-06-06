import { Augment } from './types';

/**
 * Legacy fallback module retained for compatibility.
 * Augments should be sourced from the live Set 17 database, not local fixtures.
 */
export const sampleAugments: Augment[] = [];

export function getRandomAugments(_count: number = 3): Augment[] {
    return [];
}
