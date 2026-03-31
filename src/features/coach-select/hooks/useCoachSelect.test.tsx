import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCoachQuestionForDecisionType } from '../coachSelect.data';
import type { CoachGameContext } from '../coachSelect.types';
import { useCoachSelect } from './useCoachSelect';

const { askCoachMock } = vi.hoisted(() => ({
    askCoachMock: vi.fn(),
}));

vi.mock('../coachSelect.service', () => ({
    coachSelectService: {
        askCoach: askCoachMock,
        streamCoachExplanation: vi.fn(),
    },
}));

const gameContext: CoachGameContext = {
    stage: '3-2',
    comp: 'Faerie / Mage',
    gold: 24,
    level: 6,
    hp: 72,
    decisionType: 'augment',
    proChoiceId: 'featherweights-3',
    proChoiceLabel: 'Featherweights III',
    currentDecisionOptions: [
        { id: 'featherweights-3', title: 'Featherweights III', icon: '/fw.png', tier: 2 as const },
        { id: 'jeweled-lotus-2', title: 'Jeweled Lotus II', icon: '/jl.png', tier: 2 as const },
        { id: 'metabolic-accelerator', title: 'Metabolic Accelerator', icon: '/ma.png', tier: 2 as const },
    ],
    currentAugments: ['Featherweights III', 'Jeweled Lotus II', 'Metabolic Accelerator'],
    currentAugmentOptions: [
        { id: 'featherweights-3', title: 'Featherweights III', icon: '/fw.png', tier: 2 as const },
        { id: 'jeweled-lotus-2', title: 'Jeweled Lotus II', icon: '/jl.png', tier: 2 as const },
        { id: 'metabolic-accelerator', title: 'Metabolic Accelerator', icon: '/ma.png', tier: 2 as const },
    ],
    chosenAugments: ['Starter Kit'],
    synergies: ['Faerie', 'Mage'],
    boardChampions: ['Lux', 'Seraphine'],
    items: ['Jeweled Gauntlet'],
};

describe('useCoachSelect', () => {
    beforeEach(() => {
        askCoachMock.mockReset();
    });

    describe('prefetch', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('prefetches on openSelect and uses cached result on askCoach', async () => {
            askCoachMock.mockResolvedValue({
                answer: 'Pick: Featherweights III\nGiai thich: Prefetched answer.',
            });

            const { result } = renderHook(() => useCoachSelect(gameContext, 'puzzle-1'));

            act(() => {
                result.current.openSelect();
            });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(600);
            });

            expect(askCoachMock).toHaveBeenCalledTimes(1);

            await act(async () => {
                await result.current.askCoach();
            });

            expect(askCoachMock).toHaveBeenCalledTimes(1);
            expect(result.current.answer).toBe('Featherweights III. Prefetched answer.');
            expect(result.current.uiState).toBe('response');
        });

        it('aborts prefetch when overlay is dismissed', async () => {
            let resolveAsk: ((value: { answer: string }) => void) | null = null;
            askCoachMock.mockImplementation(() => new Promise(resolve => {
                resolveAsk = resolve;
            }));

            const { result } = renderHook(() => useCoachSelect(gameContext, 'puzzle-1'));

            act(() => {
                result.current.openSelect();
            });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(600);
            });

            act(() => {
                result.current.dismissSession();
            });

            await act(async () => {
                resolveAsk?.({ answer: 'Should be ignored.' });
            });

            expect(result.current.uiState).toBe('closed');
            expect(result.current.answer).toBe('');
        });

        it('debounces rapid coach switches and only prefetches the last one', async () => {
            askCoachMock.mockResolvedValue({ answer: 'Pick: answer\nOK' });

            const { result } = renderHook(() => useCoachSelect(gameContext, 'puzzle-1'));

            act(() => {
                result.current.openSelect();
            });

            act(() => {
                result.current.selectCoach('dit_sap');
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(200);
            });
            act(() => {
                result.current.selectCoach('buffalow');
            });
            await act(async () => {
                await vi.advanceTimersByTimeAsync(200);
            });
            act(() => {
                result.current.selectCoach('tftiseasy');
            });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(600);
            });

            expect(askCoachMock).toHaveBeenCalledTimes(1);
            expect(askCoachMock.mock.calls[0][0]).toBe('tftiseasy');
        });

        it('does not abort prefetch when minimizing to board', async () => {
            askCoachMock.mockResolvedValue({
                answer: 'Pick: Featherweights III\nGiai thich: Still valid.',
            });

            const { result } = renderHook(() => useCoachSelect(gameContext, 'puzzle-1'));

            act(() => {
                result.current.openSelect();
            });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(600);
            });

            act(() => {
                result.current.minimizeToBoard();
            });

            act(() => {
                result.current.reopenOverlay();
            });

            await act(async () => {
                await result.current.askCoach();
            });

            expect(askCoachMock).toHaveBeenCalledTimes(1);
            expect(result.current.answer).toBe('Featherweights III. Still valid.');
        });

        it('reopens the in-flight minimized session instead of resetting the coach flow', async () => {
            let resolveAsk: ((value: { answer: string }) => void) | null = null;
            askCoachMock.mockImplementation(() => new Promise(resolve => {
                resolveAsk = resolve;
            }));

            const { result } = renderHook(() => useCoachSelect(gameContext, 'puzzle-1'));

            act(() => {
                result.current.openSelect();
            });

            let pendingAsk: Promise<void> | null = null;
            act(() => {
                pendingAsk = result.current.askCoach();
            });

            act(() => {
                result.current.minimizeToBoard();
            });

            expect(result.current.showReturnFab).toBe(true);
            expect(result.current.uiState).toBe('loading');

            act(() => {
                result.current.openSelect();
            });

            expect(result.current.showCoachOverlay).toBe(true);
            expect(result.current.showReturnFab).toBe(false);
            expect(result.current.uiState).toBe('loading');
            expect(askCoachMock).toHaveBeenCalledTimes(1);

            await act(async () => {
                resolveAsk?.({ answer: 'Pick: Featherweights III\nGiai thich: Still loading.' });
                await pendingAsk;
            });

            expect(result.current.uiState).toBe('response');
            expect(result.current.answer).toBe('Featherweights III. Still loading.');
        });
    });


    it('returns a single full answer from NotebookLM', async () => {
        askCoachMock.mockResolvedValue({
            answer: 'Pick: Featherweights III\nGiai thich: Board dang thieu tempo va can suc manh som.',
        });

        const { result } = renderHook(() => useCoachSelect(gameContext, 'puzzle-1'));

        act(() => {
            result.current.openSelect();
        });

        await act(async () => {
            await result.current.askCoach();
        });

        expect(askCoachMock).toHaveBeenCalledWith(
            'visian',
            getCoachQuestionForDecisionType('augment'),
            gameContext,
            expect.any(AbortSignal),
        );
        expect(result.current.uiState).toBe('response');
        expect(result.current.answer).toBe('Featherweights III. Board dang thieu tempo va can suc manh som.');
        expect(result.current.isAnswerLoading).toBe(false);
    });

    it('keeps the answer area empty during loading state', async () => {
        let resolveAsk: ((value: { answer: string }) => void) | null = null;
        askCoachMock.mockImplementation(() => new Promise(resolve => {
            resolveAsk = resolve;
        }));

        const { result } = renderHook(() => useCoachSelect(gameContext, 'puzzle-1'));

        act(() => {
            result.current.openSelect();
        });

        let pendingAsk: Promise<void> | null = null;
        act(() => {
            pendingAsk = result.current.askCoach();
        });

        expect(result.current.uiState).toBe('loading');
        expect(result.current.answer).toBe('');
        expect(result.current.isAnswerLoading).toBe(true);

        await act(async () => {
            resolveAsk?.({ answer: 'Pick: Jeweled Lotus II\nGiai thich: Lua chon nay hop hon cho spot nay.' });
            await pendingAsk;
        });

        expect(result.current.uiState).toBe('response');
        expect(result.current.answer).toBe('Jeweled Lotus II. Lua chon nay hop hon cho spot nay.');
    });

    it('caches the completed answer and reuses it on the next ask', async () => {
        askCoachMock.mockResolvedValue({
            answer: 'Pick: Featherweights III\nGiai thich: Day la lua chon de giu mau tot nhat o day.',
        });

        const { result } = renderHook(() => useCoachSelect(gameContext, 'puzzle-1'));

        act(() => {
            result.current.openSelect();
        });

        await act(async () => {
            await result.current.askCoach();
        });

        act(() => {
            result.current.backToSelect();
        });

        await act(async () => {
            await result.current.askCoach();
        });

        expect(askCoachMock).toHaveBeenCalledTimes(1);
        expect(result.current.answer).toBe('Featherweights III. Day la lua chon de giu mau tot nhat o day.');
    });

    it('drops stale response after changing coach mid-request', async () => {
        let resolveAsk: ((value: { answer: string }) => void) | null = null;
        askCoachMock.mockImplementation(() => new Promise(resolve => {
            resolveAsk = resolve;
        }));

        const { result } = renderHook(() => useCoachSelect(gameContext, 'puzzle-1'));

        act(() => {
            result.current.openSelect();
        });

        let pendingAsk: Promise<void> | null = null;
        act(() => {
            pendingAsk = result.current.askCoach();
        });

        act(() => {
            result.current.selectCoach('buffalow');
        });

        await act(async () => {
            resolveAsk?.({ answer: 'Old answer should be ignored.' });
            await pendingAsk;
        });

        expect(result.current.selectedCoachId).toBe('buffalow');
        expect(result.current.uiState).toBe('select');
        expect(result.current.answer).toBe('');
    });

    it('shows error state when askCoach fails', async () => {
        askCoachMock.mockRejectedValue(new Error('Coach đang bận train, thử lại sau nha.'));

        const { result } = renderHook(() => useCoachSelect(gameContext, 'puzzle-1'));

        act(() => {
            result.current.openSelect();
        });

        await act(async () => {
            await result.current.askCoach();
        });

        expect(result.current.uiState).toBe('response');
        expect(result.current.error).toBe('Coach đang bận train, thử lại sau nha.');
        expect(result.current.answer).toBe('');
    });

    it('triggers minimized completion notice after response completes', async () => {
        let resolveAsk: ((value: { answer: string }) => void) | null = null;
        askCoachMock.mockImplementation(() => new Promise(resolve => {
            resolveAsk = resolve;
        }));

        const { result } = renderHook(() => useCoachSelect(gameContext, 'puzzle-1'));

        act(() => {
            result.current.openSelect();
        });

        let pendingAsk: Promise<void> | null = null;
        act(() => {
            pendingAsk = result.current.askCoach();
        });

        act(() => {
            result.current.minimizeToBoard();
        });

        expect(result.current.showReturnFab).toBe(true);
        expect(result.current.hasUnreadResult).toBe(false);
        expect(result.current.completionNoticeToken).toBe(0);

        await act(async () => {
            resolveAsk?.({ answer: 'NotebookLM da tra ve phan tich hoan chinh.' });
            await pendingAsk;
        });

        expect(result.current.hasUnreadResult).toBe(true);
        expect(result.current.completionNoticeToken).toBe(1);
        expect(result.current.returnFabMode).toBe('ready');
    });
});
