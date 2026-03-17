import type { Synergy } from '../../data/types';
import type { CoachGameContext, CoachId } from './coachSelect.types';

export function normalizeCachePart(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

export function normalizeCoachAnswerText(answer: string): string {
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
        return '';
    }

    const pickMatch = trimmedAnswer.match(/(?:^|\n)\s*Pick:\s*(.+)$/im);
    const reasoningMatch = trimmedAnswer.match(/(?:^|\n)\s*(?:Giai thich|Giải thích|Tai sao):\s*([\s\S]+)$/im);
    const pick = pickMatch?.[1]?.trim() ?? '';
    const reasoning = reasoningMatch?.[1]?.trim()
        ?? trimmedAnswer
            .replace(/(?:^|\n)\s*Pick:\s*.+$/im, '')
            .replace(/(?:^|\n)\s*(?:Giai thich|Giải thích|Tai sao):\s*/im, '')
            .trim();

    if (pick && reasoning) {
        return `${pick}. ${reasoning}`.replace(/\s+/g, ' ').trim();
    }

    return trimmedAnswer
        .replace(/(?:^|\n)\s*Pick:\s*/im, '')
        .replace(/(?:^|\n)\s*(?:Giai thich|Giải thích|Tai sao):\s*/im, '')
        .replace(/\s*\n+\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function buildCoachContextSignature(gameContext: CoachGameContext | null): string {
    if (!gameContext) {
        return 'no-context';
    }

    const decisionType = gameContext.decisionType ?? 'augment';
    const optionParts = decisionType === 'augment'
        ? (gameContext.currentAugmentOptions?.length
            ? gameContext.currentAugmentOptions.map(option => normalizeCachePart(option.id) || normalizeCachePart(option.title))
            : gameContext.currentAugments)
        : (gameContext.currentDecisionOptions ?? []).map(option => normalizeCachePart(option.id) || normalizeCachePart(option.title));

    return [
        `stage=${normalizeCachePart(gameContext.stage)}`,
        `decision=${decisionType}`,
        `gold=${gameContext.gold}`,
        `level=${gameContext.level}`,
        `hp=${gameContext.hp}`,
        `comp=${normalizeCachePart(gameContext.comp)}`,
        `options=${optionParts.map(normalizeCachePart).filter(Boolean).join('|')}`,
        `chosen=${gameContext.chosenAugments.map(normalizeCachePart).filter(Boolean).join('|')}`,
    ].join('::');
}

export function buildCoachAnswerCacheKey(
    puzzleId: string | null,
    coachId: CoachId,
    contextSignature: string,
): string | null {
    if (!puzzleId) {
        return null;
    }

    return `${puzzleId}:${coachId}:${contextSignature}`;
}

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
