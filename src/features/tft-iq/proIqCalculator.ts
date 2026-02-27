import { ProIqTier, IQ_TIERS } from './proIq.types';

/**
 * Calculate IQ tier from score
 */
export function calculateIqTier(score: number): ProIqTier {
    for (const tier of IQ_TIERS) {
        if (score >= tier.min) return tier.tier;
    }
    return 'Rising';
}

/**
 * Get tier icon emoji
 */
export function getIqTierIcon(tier: ProIqTier): string {
    return IQ_TIERS.find(t => t.tier === tier)?.icon || '🌟';
}

/**
 * Get tier color for UI
 */
export function getIqTierColor(tier: ProIqTier): string {
    switch (tier) {
        case 'GOAT': return '#FFD700';
        case 'Elite': return '#FF6B35';
        case 'Top Pro': return '#00D1C1';
        case 'Pro': return '#8B5CF6';
        case 'Rising': return '#64748B';
        default: return '#94A3B8';
    }
}

/**
 * Suggest IQ from raw tournament + ladder stats.
 * Admin uses this as a reference, final value is manually confirmed.
 */
export function suggestIqFromStats(params: {
    tournamentWins?: number;
    tournamentTop4?: number;
    tournamentTop8?: number;
    worldsTop4?: number;
    worldsTop8?: number;
    ladderRank?: 'Challenger' | 'Grandmaster' | 'Master';
    ladderLp?: number;
    activeSeasonsCount?: number;
    isMultiRegion?: boolean;
}): { suggestedIq: number; breakdown: string[] } {
    const BASE = 1500;
    let total = BASE;
    const breakdown: string[] = [`Base: ${BASE}`];

    // Tournament points
    if (params.worldsTop4) {
        const pts = params.worldsTop4 * 300;
        total += pts;
        breakdown.push(`Worlds Top 4 (×${params.worldsTop4}): +${pts}`);
    }
    if (params.worldsTop8) {
        const pts = params.worldsTop8 * 200;
        total += pts;
        breakdown.push(`Worlds Top 8 (×${params.worldsTop8}): +${pts}`);
    }
    if (params.tournamentWins) {
        const pts = params.tournamentWins * 200;
        total += pts;
        breakdown.push(`Regional 1st (×${params.tournamentWins}): +${pts}`);
    }
    if (params.tournamentTop4) {
        const pts = params.tournamentTop4 * 100;
        total += pts;
        breakdown.push(`Regional Top 4 (×${params.tournamentTop4}): +${pts}`);
    }
    if (params.tournamentTop8) {
        const pts = params.tournamentTop8 * 50;
        total += pts;
        breakdown.push(`Regional Top 8 (×${params.tournamentTop8}): +${pts}`);
    }

    // Ladder points
    if (params.ladderRank) {
        const rankPts = params.ladderRank === 'Challenger' ? 200
            : params.ladderRank === 'Grandmaster' ? 150 : 100;
        total += rankPts;
        breakdown.push(`Rank ${params.ladderRank}: +${rankPts}`);
    }
    if (params.ladderLp && params.ladderLp > 0) {
        const lpPts = Math.floor(params.ladderLp / 10);
        total += lpPts;
        breakdown.push(`LP ${params.ladderLp} (÷10): +${lpPts}`);
    }

    // Consistency
    if (params.activeSeasonsCount && params.activeSeasonsCount >= 2) {
        total += 50;
        breakdown.push(`Active ${params.activeSeasonsCount}+ seasons: +50`);
    }
    if (params.isMultiRegion) {
        total += 75;
        breakdown.push(`Multi-region: +75`);
    }

    return { suggestedIq: total, breakdown };
}
