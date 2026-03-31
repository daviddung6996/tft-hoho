import { UnitData, Synergy, Champion } from '../data/types';
import { Trait } from '../services/traitService';
import { normalizeLookupValue } from './stringNormalization';

interface SynergyInput {
    units: UnitData[];
    championData: Champion[];
    traitData: Trait[];
}

/** Match a trait name (English, from champion.traits) against trait definitions */
function findTraitDef(traitName: string, traitData: Trait[]): Trait | undefined {
    const lower = normalizeLookupValue(traitName);
    return traitData.find(t =>
        normalizeLookupValue(t.name_en) === lower ||
        normalizeLookupValue(t.name) === lower
    );
}

/**
 * Calculate active synergies from board units
 * @param input - units on board, champion definitions, trait definitions
 * @returns Array of active synergies sorted by count (highest first)
 */
export function calculateSynergies(input: SynergyInput): Synergy[] {
    const { units, championData, traitData } = input;

    if (!units || units.length === 0 || !championData || championData.length === 0) {
        return [];
    }

    // Count traits from board units (only unique champions count towards traits)
    const traitCounts: Record<string, number> = {};
    const uniqueChampionIds = new Set<string>();

    units.forEach(unit => {
        const normalizedUnitName = normalizeLookupValue(unit.name);
        if (!normalizedUnitName) return;

        const champion = championData.find(c =>
            normalizeLookupValue(c.name) === normalizedUnitName ||
            normalizeLookupValue(c.id) === normalizedUnitName
        );

        // Only count each unique champion once for traits
        if (champion && !uniqueChampionIds.has(champion.id || champion.name)) {
            uniqueChampionIds.add(champion.id || champion.name);

            if (champion.traits) {
                champion.traits.forEach(traitName => {
                    traitCounts[traitName] = (traitCounts[traitName] || 0) + 1;
                });
            }
        }
    });

    // Build Synergy array with breakpoints
    const synergies: Synergy[] = [];

    Object.entries(traitCounts).forEach(([traitName, count]) => {
        const traitDef = findTraitDef(traitName, traitData);

        // Extract breakpoints from trait effects
        let breakpoints: number[] = [2, 4, 6]; // Default fallback
        let styles: number[] = [];

        if (traitDef?.effects) {
            // Primary: Handle array format from TFT API
            if (Array.isArray(traitDef.effects) && traitDef.effects.length > 0) {
                const validEffects = traitDef.effects
                    .filter((e: any) => e.minUnits !== undefined && typeof e.minUnits === 'number')
                    .sort((a: any, b: any) => a.minUnits - b.minUnits);

                if (validEffects.length > 0) {
                    breakpoints = validEffects.map((e: any) => e.minUnits);
                    styles = validEffects.map((e: any) => e.style || 1);
                }
            } else if (typeof traitDef.effects === 'object') {
                const effectKeys = Object.keys(traitDef.effects)
                    .map(k => parseInt(k, 10))
                    .filter(n => !isNaN(n))
                    .sort((a, b) => a - b);

                if (effectKeys.length > 0) {
                    breakpoints = effectKeys;
                    styles = effectKeys.map(k => traitDef.effects[k]?.style || 1);
                }
            }
        }

        // Use English name for id (asset lookup), Vietnamese name for display
        synergies.push({
            id: normalizeLookupValue(traitName).replace(/\s+/g, '-'),
            name: traitDef?.name || traitName, // Vietnamese from DB
            breakpoints,
            styles,
            activeCount: count,
            icon: ''
        });
    });

    // Sort: active traits first (by count desc), then inactive traits (by count desc)
    return synergies.sort((a, b) => {
        const aActive = a.activeCount >= (a.breakpoints[0] || 1);
        const bActive = b.activeCount >= (b.breakpoints[0] || 1);

        // Active traits come first
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;

        // Within same category, sort by count (highest first)
        return b.activeCount - a.activeCount;
    });
}

/**
 * Get all traits from board (including inactive) for display purposes
 */
export function getAllTraitsFromBoard(input: SynergyInput): Synergy[] {
    const { units, championData, traitData } = input;

    if (!units || units.length === 0 || !championData || championData.length === 0) {
        return [];
    }

    const traitCounts: Record<string, number> = {};
    const uniqueChampionIds = new Set<string>();

    units.forEach(unit => {
        const normalizedUnitName = normalizeLookupValue(unit.name);
        if (!normalizedUnitName) return;

        const champion = championData.find(c =>
            normalizeLookupValue(c.name) === normalizedUnitName ||
            normalizeLookupValue(c.id) === normalizedUnitName
        );

        // Only count each unique champion once for traits
        if (champion && !uniqueChampionIds.has(champion.id || champion.name)) {
            uniqueChampionIds.add(champion.id || champion.name);

            if (champion.traits) {
                champion.traits.forEach(traitName => {
                    traitCounts[traitName] = (traitCounts[traitName] || 0) + 1;
                });
            }
        }
    });

    return Object.entries(traitCounts)
        .map(([traitName, count]) => {
            const traitDef = findTraitDef(traitName, traitData);

            let breakpoints: number[] = [2, 4, 6];
            let styles: number[] = [];

            if (traitDef?.effects) {
                if (Array.isArray(traitDef.effects) && traitDef.effects.length > 0) {
                    const validEffects = traitDef.effects
                        .filter((e: any) => e.minUnits !== undefined && typeof e.minUnits === 'number')
                        .sort((a: any, b: any) => a.minUnits - b.minUnits);

                    if (validEffects.length > 0) {
                        breakpoints = validEffects.map((e: any) => e.minUnits);
                        styles = validEffects.map((e: any) => e.style || 1);
                    }
                } else if (typeof traitDef.effects === 'object') {
                    const effectKeys = Object.keys(traitDef.effects)
                        .map(k => parseInt(k, 10))
                        .filter(n => !isNaN(n))
                        .sort((a, b) => a - b);

                    if (effectKeys.length > 0) {
                        breakpoints = effectKeys;
                        styles = effectKeys.map(k => traitDef.effects[k]?.style || 1);
                    }
                }
            }

            return {
                id: normalizeLookupValue(traitName).replace(/\s+/g, '-'),
                name: traitDef?.name || traitName, // Vietnamese from DB
                breakpoints,
                styles,
                activeCount: count,
                icon: ''
            };
        })
        .sort((a, b) => b.activeCount - a.activeCount);
}
