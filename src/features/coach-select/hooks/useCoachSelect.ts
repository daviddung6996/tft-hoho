import {
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { COACHES_BY_ID, DEFAULT_COACH_ID, getCoachQuestionForDecisionType } from '../coachSelect.data';
import { coachSelectService } from '../coachSelect.service';
import type {
    CoachAnswerState,
    CoachGameContext,
    CoachId,
    CoachUiState,
} from '../coachSelect.types';

const DEFAULT_COACH_UNAVAILABLE_MESSAGE = 'Coach đang bận train, thử lại sau nha.';

function createEmptyAnswerState(): CoachAnswerState {
    return {
        answer: '',
        isLoading: false,
        isComplete: false,
    };
}

function normalizeCachePart(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeCoachAnswerText(answer: string): string {
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

function buildCoachContextSignature(gameContext: CoachGameContext | null): string {
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

function buildCoachAnswerCacheKey(
    puzzleId: string | null,
    coachId: CoachId,
    contextSignature: string,
): string | null {
    if (!puzzleId) {
        return null;
    }

    return `${puzzleId}:${coachId}:${contextSignature}`;
}

export function useCoachSelect(gameContext: CoachGameContext | null, puzzleId: string | null) {
    const [uiState, setUiState] = useState<CoachUiState>('closed');
    const [selectedCoachId, setSelectedCoachId] = useState<CoachId>(DEFAULT_COACH_ID);
    const [answerState, setAnswerState] = useState<CoachAnswerState>(() => createEmptyAnswerState());
    const [error, setError] = useState<string | null>(null);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [isMinimizedForBoard, setIsMinimizedForBoard] = useState(false);
    const [hasUnreadResult, setHasUnreadResult] = useState(false);
    const [completionNoticeToken, setCompletionNoticeToken] = useState(0);
    const selectedCoachIdRef = useRef(selectedCoachId);
    const uiStateRef = useRef(uiState);
    const puzzleIdRef = useRef(puzzleId);
    const isMinimizedForBoardRef = useRef(isMinimizedForBoard);
    const cachedAnswersRef = useRef(new Map<string, CoachAnswerState>());
    const interactionVersionRef = useRef(0);
    const abortControllerRef = useRef<AbortController | null>(null);
    const contextSignature = useMemo(() => buildCoachContextSignature(gameContext), [gameContext]);
    const contextSignatureRef = useRef(contextSignature);

    const selectedCoach = useMemo(() => COACHES_BY_ID[selectedCoachId], [selectedCoachId]);
    const showCoachOverlay = isOverlayVisible && uiState !== 'closed';
    const showReturnFab = isMinimizedForBoard && uiState !== 'closed';
    const returnFabMode = isMinimizedForBoard && uiState === 'response' ? 'ready' : 'loading';

    const abortInflight = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    const resetAnswerState = useCallback(() => {
        setAnswerState(createEmptyAnswerState());
    }, []);

    const markAnswerCompleted = useCallback((answer: string, cacheKey: string | null) => {
        const normalizedAnswer = normalizeCoachAnswerText(answer);
        const completedAnswer: CoachAnswerState = {
            answer: normalizedAnswer,
            isLoading: false,
            isComplete: true,
        };

        if (cacheKey) {
            cachedAnswersRef.current.set(cacheKey, completedAnswer);
        }

        setAnswerState(completedAnswer);
        setError(null);
        setUiState('response');

        if (isMinimizedForBoardRef.current) {
            setHasUnreadResult(true);
            setCompletionNoticeToken(current => current + 1);
        }
    }, []);

    useEffect(() => {
        selectedCoachIdRef.current = selectedCoachId;
    }, [selectedCoachId]);

    useEffect(() => {
        uiStateRef.current = uiState;
    }, [uiState]);

    useEffect(() => {
        isMinimizedForBoardRef.current = isMinimizedForBoard;
    }, [isMinimizedForBoard]);

    const dismissSession = useCallback(() => {
        abortInflight();
        interactionVersionRef.current += 1;
        setSelectedCoachId(DEFAULT_COACH_ID);
        resetAnswerState();
        setError(null);
        setUiState('closed');
        setIsOverlayVisible(false);
        setIsMinimizedForBoard(false);
        setHasUnreadResult(false);
    }, [abortInflight, resetAnswerState]);

    useEffect(() => {
        return () => { abortInflight(); };
    }, [abortInflight]);

    useEffect(() => {
        if (puzzleId === puzzleIdRef.current) {
            return;
        }

        puzzleIdRef.current = puzzleId;
        cachedAnswersRef.current.clear();
        setCompletionNoticeToken(0);
        dismissSession();
    }, [dismissSession, puzzleId]);

    useEffect(() => {
        if (contextSignature === contextSignatureRef.current) {
            return;
        }

        contextSignatureRef.current = contextSignature;
        abortInflight();
        interactionVersionRef.current += 1;
        resetAnswerState();
        setError(null);
        setHasUnreadResult(false);

        if (isMinimizedForBoardRef.current) {
            setIsMinimizedForBoard(false);
            setIsOverlayVisible(false);
        }

        if (uiStateRef.current === 'loading' || uiStateRef.current === 'response') {
            setUiState('select');
        }
    }, [abortInflight, contextSignature, resetAnswerState]);

    const openSelect = useCallback((coachId: CoachId = DEFAULT_COACH_ID) => {
        interactionVersionRef.current += 1;
        setSelectedCoachId(coachId);
        resetAnswerState();
        setError(null);
        setUiState('select');
        setIsOverlayVisible(true);
        setIsMinimizedForBoard(false);
        setHasUnreadResult(false);
    }, [resetAnswerState]);

    const minimizeToBoard = useCallback(() => {
        if (uiStateRef.current !== 'loading' && uiStateRef.current !== 'response') {
            return;
        }

        setIsOverlayVisible(false);
        setIsMinimizedForBoard(true);
    }, []);

    const reopenOverlay = useCallback(() => {
        if (uiStateRef.current === 'closed') {
            return;
        }

        setIsOverlayVisible(true);
        setIsMinimizedForBoard(false);
        setHasUnreadResult(false);
    }, []);

    const selectCoach = useCallback((coachId: CoachId) => {
        if (coachId === selectedCoachIdRef.current) return;

        abortInflight();
        startTransition(() => {
            interactionVersionRef.current += 1;
            setSelectedCoachId(coachId);
            resetAnswerState();
            setError(null);
            setHasUnreadResult(false);

            if (uiStateRef.current !== 'closed') {
                setUiState('select');
                setIsOverlayVisible(true);
                setIsMinimizedForBoard(false);
            }
        });
    }, [abortInflight, resetAnswerState]);

    const backToSelect = useCallback(() => {
        abortInflight();
        interactionVersionRef.current += 1;
        resetAnswerState();
        setError(null);
        setHasUnreadResult(false);
        setUiState('select');
        setIsOverlayVisible(true);
        setIsMinimizedForBoard(false);
    }, [abortInflight, resetAnswerState]);

    const askCoach = useCallback(async () => {
        const requestVersion = interactionVersionRef.current;
        const requestContextSignature = contextSignatureRef.current;
        const requestCoachId = selectedCoachId;
        const cacheKey = buildCoachAnswerCacheKey(puzzleId, selectedCoachId, requestContextSignature);
        const cachedAnswer = cacheKey ? cachedAnswersRef.current.get(cacheKey) : null;

        const isStaleRequest = () => (
            requestVersion !== interactionVersionRef.current
            || requestContextSignature !== contextSignatureRef.current
            || requestCoachId !== selectedCoachIdRef.current
        );

        const showErrorState = (message: string) => {
            setAnswerState(current => ({
                ...current,
                isLoading: false,
                isComplete: false,
            }));
            setError(message);
            setUiState('response');
        };

        if (cachedAnswer) {
            setError(null);
            setHasUnreadResult(false);
            setAnswerState({
                ...cachedAnswer,
                isLoading: false,
                isComplete: true,
            });
            setUiState('response');
            return;
        }

        abortInflight();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setError(null);
        setHasUnreadResult(false);
        setAnswerState({
            answer: '',
            isLoading: true,
            isComplete: false,
        });
        setUiState('loading');

        try {
            const response = await coachSelectService.askCoach(
                requestCoachId,
                getCoachQuestionForDecisionType(gameContext?.decisionType),
                gameContext,
                controller.signal,
            );

            if (isStaleRequest()) {
                return;
            }

            markAnswerCompleted(response.answer, cacheKey);
        } catch (err) {
            if (controller.signal.aborted) {
                return;
            }

            if (isStaleRequest()) {
                return;
            }

            showErrorState(err instanceof Error ? err.message : DEFAULT_COACH_UNAVAILABLE_MESSAGE);
        } finally {
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
        }
    }, [abortInflight, gameContext, markAnswerCompleted, puzzleId, selectedCoachId]);

    return {
        uiState,
        selectedCoachId,
        selectedCoach,
        answer: answerState.answer,
        isAnswerLoading: answerState.isLoading,
        isAnswerComplete: answerState.isComplete,
        error,
        isOverlayVisible,
        isMinimizedForBoard,
        hasUnreadResult,
        completionNoticeToken,
        showCoachOverlay,
        showReturnFab,
        returnFabMode,
        openSelect,
        minimizeToBoard,
        reopenOverlay,
        dismissSession,
        selectCoach,
        backToSelect,
        askCoach,
    };
}
