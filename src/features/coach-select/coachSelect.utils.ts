import type { Synergy } from '../../data/types';

export function deriveCoachCompLabel(
    synergies: Synergy[],
    boardChampions: string[],
): string {
    const activeSynergies = synergies
        .filter(synergy => (synergy.activeCount || 0) > 0)
        .sort((left, right) => {
            if (right.activeCount !== left.activeCount) {
                return right.activeCount - left.activeCount;
            }
            const leftTopBreakpoint = Math.max(...(left.breakpoints || [0]));
            const rightTopBreakpoint = Math.max(...(right.breakpoints || [0]));
            if (rightTopBreakpoint !== leftTopBreakpoint) {
                return rightTopBreakpoint - leftTopBreakpoint;
            }
            return left.name.localeCompare(right.name);
        })
        .slice(0, 2)
        .map(synergy => synergy.name)
        .filter(Boolean);

    if (activeSynergies.length > 0) {
        return activeSynergies.join(' / ');
    }

    const fallbackBoard = boardChampions.filter(Boolean).slice(0, 2);
    if (fallbackBoard.length > 0) {
        return fallbackBoard.join(' / ');
    }

    return 'Open Board';
}

export function getCoachTierLabel(tier?: number): string {
    if (tier === 3) return 'Prismatic';
    if (tier === 2) return 'Gold';
    return 'Silver';
}
