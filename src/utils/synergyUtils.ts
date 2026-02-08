import { Champion, Synergy, UnitData } from '../data/types';
import { Trait } from '../services/traitService';

/** Match a trait name (English, from champion.traits) against trait definitions */
function findTraitDef(traitName: string, traits: Trait[]): Trait | undefined {
    const lower = traitName.toLowerCase();
    return traits.find(t =>
        t.name_en?.toLowerCase() === lower ||
        t.name.toLowerCase() === lower
    );
}

/**
 * Calculates active synergies based on the units on the board.
 */
export const calculateSynergies = (
    units: UnitData[],
    champions: Champion[],
    traits: Trait[]
): Synergy[] => {
    // 1. Identify valid units (must be on board, not bench)
    // In TFT, usually only unique champions count towards traits (unless Built Different / certain augments, but assuming standard)
    // We filter for units that have a position (row/col defined)
    const boardUnits = units.filter(u => u.row !== undefined && u.col !== undefined);

    // 2. Get unique champions to count towards traits
    // If you have two Jinxes, it only counts as 1 Gunner.
    const uniqueChampionIds = new Set<string>();
    const activeTraitsCount: Record<string, number> = {};

    boardUnits.forEach(unit => {
        // Find the champion data
        // UnitData might have 'name' or 'id' that maps to Champion
        // In this codebase, UnitData.id is unique instance ID, UnitData.name usually matches Champion.name or id lookup
        const champ = champions.find(c => c.name === unit.name || c.id === unit.name.toLowerCase()); // Fallback matching

        if (champ && !uniqueChampionIds.has(champ.id)) {
            uniqueChampionIds.add(champ.id);

            // Add traits
            champ.traits.forEach(traitName => {
                activeTraitsCount[traitName] = (activeTraitsCount[traitName] || 0) + 1;
            });
        }
    });

    // 3. Map to Synergy objects
    const synergies: Synergy[] = [];

    Object.entries(activeTraitsCount).forEach(([traitName, count]) => {
        // Find trait definition (match by English name or Vietnamese name)
        const traitDef = findTraitDef(traitName, traits);
        if (!traitDef) return;

        // Extract breakpoints and styles from effects
        let breakpoints: number[] = [];
        let styles: number[] = [];

        if (traitDef.effects) {
            // Primary: Handle array format from Set 16 API
            // Format: [{ minUnits: 3, maxUnits: 4, style: 1, variables: {...} }, ...]
            if (Array.isArray(traitDef.effects) && traitDef.effects.length > 0) {
                const validEffects = traitDef.effects
                    .filter((e: any) => e.minUnits !== undefined && typeof e.minUnits === 'number')
                    .sort((a: any, b: any) => a.minUnits - b.minUnits);

                if (validEffects.length > 0) {
                    breakpoints = validEffects.map((e: any) => e.minUnits);
                    styles = validEffects.map((e: any) => e.style || 1);
                }
            } else if (typeof traitDef.effects === 'object') {
                // Fallback: Read keys from effects object (e.g., {"2": {...}, "4": {...}})
                const effectKeys = Object.keys(traitDef.effects)
                    .map(k => parseInt(k, 10))
                    .filter(n => !isNaN(n))
                    .sort((a, b) => a - b);

                if (effectKeys.length > 0) {
                    breakpoints = effectKeys;
                    styles = effectKeys.map(k => (traitDef.effects as any)[k]?.style || 1);
                }
            }
        }

        // If no breakpoints found, maybe it's a unique trait (1/1)
        if (breakpoints.length === 0) {
            breakpoints.push(1);
            styles.push(4); // Unique traits usually style 4
        }

        synergies.push({
            id: traitName.toLowerCase().replace(/\s+/g, '-'), // English name for asset lookup
            name: traitDef.name, // Vietnamese from DB
            breakpoints: breakpoints,
            styles: styles,
            activeCount: count,
            icon: ''
        });
    });

    // 4. Sort Synergies
    // Priority: Active Tier > Active Count > Name
    // We need a helper to determine tier
    return synergies.sort((a, b) => {
        const aTier = getTier(a);
        const bTier = getTier(b);

        if (bTier !== aTier) return bTier - aTier; // Higher tier first
        if (b.activeCount !== a.activeCount) return b.activeCount - a.activeCount; // Higher count first
        return a.name.localeCompare(b.name);
    });
};

const getTier = (synergy: Synergy): number => {
    let tier = 0;
    for (let i = 0; i < synergy.breakpoints.length; i++) {
        if (synergy.activeCount >= synergy.breakpoints[i]) {
            tier = i + 1;
        }
    }
    return tier;
};
