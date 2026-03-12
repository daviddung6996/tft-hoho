import { OpponentData, PuzzleScenario } from '../../data/puzzleScenarios';
import { sanitizePlayerLevel, sanitizePlayerXp } from './playerLevel';

type PuzzlePlayerState = {
    gold?: number;
    level?: number;
    hp?: number;
    xp?: number;
} | null | undefined;

export function sanitizePuzzlePlayerState(stage: string, state?: PuzzlePlayerState) {
    const level = sanitizePlayerLevel(state?.level, stage);

    return {
        gold: state?.gold ?? 0,
        level,
        hp: state?.hp ?? 100,
        xp: sanitizePlayerXp(state?.xp, level, stage),
    };
}

export function sanitizePuzzleStateLevels(puzzle: PuzzleScenario): PuzzleScenario {
    return {
        ...puzzle,
        playerState: sanitizePuzzlePlayerState(puzzle.stage, puzzle.playerState),
        opponentState: sanitizePuzzlePlayerState(puzzle.stage, puzzle.opponentState),
        opponents: (puzzle.opponents || []).map((opponent: OpponentData) => {
            // If state.level is missing, infer from board unit count (number of units on board = level)
            const hasExplicitLevel = opponent.state?.level != null && Number.isFinite(opponent.state.level);
            const inferredLevel = hasExplicitLevel
                ? opponent.state.level
                : Math.max(1, (opponent.board || []).length);
            return {
                ...opponent,
                state: sanitizePuzzlePlayerState(puzzle.stage, {
                    ...opponent.state,
                    level: inferredLevel,
                }),
            };
        }),
    };
}
