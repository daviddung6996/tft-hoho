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
    CoachAskResponse,
    CoachGameContext,
    CoachId,
    CoachUiState,
} from '../coachSelect.types';
import {
    buildCoachAnswerCacheKey,
    buildCoachContextSignature,
    normalizeCoachAnswerText,
} from '../coachSelect.utils';

const DEFAULT_COACH_UNAVAILABLE_MESSAGE = 'Coach đang bận train, thử lại sau nha.';

function createEmptyAnswerState(): CoachAnswerState {
    return {
        answer: '',
        isLoading: false,
        isComplete: false,
    };
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
    const prefetchAbortRef = useRef<AbortController | null>(null);
    const prefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prefetchCoachIdRef = useRef<CoachId | null>(null);
    const prefetchPromiseRef = useRef<Promise<CoachAskResponse | null> | null>(null);
    const prefetchSignatureRef = useRef<string | null>(null);
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

    const abortPrefetch = useCallback(() => {
        if (prefetchTimerRef.current) {
            clearTimeout(prefetchTimerRef.current);
            prefetchTimerRef.current = null;
        }
        if (prefetchAbortRef.current) {
            prefetchAbortRef.current.abort();
            prefetchAbortRef.current = null;
        }
        prefetchCoachIdRef.current = null;
        prefetchPromiseRef.current = null;
        prefetchSignatureRef.current = null;
    }, []);

    const triggerPrefetch = useCallback((coachId: CoachId) => {
        if (prefetchTimerRef.current) {
            clearTimeout(prefetchTimerRef.current);
        }

        prefetchTimerRef.current = setTimeout(() => {
            prefetchTimerRef.current = null;

            if (prefetchAbortRef.current) {
                prefetchAbortRef.current.abort();
            }

            const signature = contextSignatureRef.current;
            const controller = new AbortController();

            prefetchAbortRef.current = controller;
            prefetchCoachIdRef.current = coachId;
            prefetchSignatureRef.current = signature;

            const promise = coachSelectService.askCoach(
                coachId,
                getCoachQuestionForDecisionType(gameContext?.decisionType),
                gameContext,
                controller.signal,
            ).then(response => {
                const normalizedAnswer = normalizeCoachAnswerText(response.answer);
                const cacheKey = buildCoachAnswerCacheKey(puzzleId, coachId, signature);
                if (cacheKey && !controller.signal.aborted) {
                    cachedAnswersRef.current.set(cacheKey, {
                        answer: normalizedAnswer,
                        isLoading: false,
                        isComplete: true,
                    });
                }
                return response;
            }).catch(() => {
                return null;
            }).finally(() => {
                if (prefetchAbortRef.current === controller) {
                    prefetchAbortRef.current = null;
                }
                if (prefetchPromiseRef.current === promise) {
                    prefetchPromiseRef.current = null;
                }
                if (prefetchCoachIdRef.current === coachId) {
                    prefetchCoachIdRef.current = null;
                }
                if (prefetchSignatureRef.current === signature) {
                    prefetchSignatureRef.current = null;
                }
            });

            prefetchPromiseRef.current = promise;
        }, 500);
    }, [gameContext, puzzleId]);

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
        abortPrefetch();
        interactionVersionRef.current += 1;
        setSelectedCoachId(DEFAULT_COACH_ID);
        resetAnswerState();
        setError(null);
        setUiState('closed');
        setIsOverlayVisible(false);
        setIsMinimizedForBoard(false);
        setHasUnreadResult(false);
    }, [abortInflight, abortPrefetch, resetAnswerState]);

    useEffect(() => {
        return () => {
            abortInflight();
            abortPrefetch();
        };
    }, [abortInflight, abortPrefetch]);

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
        abortPrefetch();
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

        triggerPrefetch(coachId);
    }, [resetAnswerState, triggerPrefetch]);

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

        triggerPrefetch(coachId);
    }, [abortInflight, resetAnswerState, triggerPrefetch]);

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

        if (
            prefetchCoachIdRef.current === requestCoachId
            && prefetchSignatureRef.current === requestContextSignature
            && prefetchPromiseRef.current
        ) {
            await prefetchPromiseRef.current;
            if (isStaleRequest()) return;
            const reCachedAnswer = cacheKey ? cachedAnswersRef.current.get(cacheKey) : null;
            if (reCachedAnswer) {
                setError(null);
                setHasUnreadResult(false);
                setAnswerState({
                    ...reCachedAnswer,
                    isLoading: false,
                    isComplete: true,
                });
                setUiState('response');
                return;
            }
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
