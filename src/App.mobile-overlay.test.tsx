import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

let fullscreenElement: Element | null = null;
let requestFullscreenMock = vi.fn();
let mockHasRequestedMobileFullscreen = false;
let mockPuzzlePhase = 'declaring_intent';
let mockIsV2Puzzle = true;
let mockPuzzleId = 'p1';
let mockCoachUiState: 'closed' | 'select' | 'loading' | 'response' = 'closed';
let mockCoachAnswer: string | null = null;
let mockCoachError: string | null = null;
let mockShowCoachOverlay = false;
let mockShowReturnFab = false;
let mockReturnFabMode: 'loading' | 'ready' = 'loading';
let mockCompletionNoticeToken = 0;
let openCoachSelectMock = vi.fn();
let minimizeToBoardMock = vi.fn();
let reopenOverlayMock = vi.fn();
let dismissSessionMock = vi.fn();
let selectCoachMock = vi.fn();
let backToSelectMock = vi.fn();
let askCoachMock = vi.fn();
let playCoachCompletionChimeMock = vi.fn();

vi.mock('./hooks/useArenaPreloader', () => ({
    useArenaPreloader: vi.fn(),
}));

vi.mock('./hooks/usePuzzleGame', () => ({
    usePuzzleGame: vi.fn(() => ({
        currentPuzzle: {
            id: mockPuzzleId,
            stage: '3-2',
            streakHistory: [],
            streakCount: 0,
            tier: 'free',
            proPlayer: 'Pro',
            proFirstRoll: [],
            proFinalPick: null,
            augments: [],
            rerollAugments: [],
            explanation: '',
            meta_data: {},
        },
        isLoadingPuzzles: false,
        allPuzzlesCompleted: false,
        handleMarkCompleted: vi.fn(),
        handleNextPuzzle: vi.fn(),
        handleSkipToFreePuzzle: vi.fn(),
        hasFreePuzzlesAvailable: false,
        refreshPuzzles: vi.fn(),
        currentPuzzleAccess: null,
        isPuzzlePlayable: true,
        requiresLoginForUnlock: false,
        isUnlocking: false,
        isResolvingNextPuzzle: false,
        lockMessageVariant: 'default',
        handleUnlockCurrentPuzzle: vi.fn(),
        walletBalance: 0,
    })),
}));

vi.mock('./hooks/useGameFlow', () => ({
    useGameFlow: vi.fn(() => ({
        puzzlePhase: mockPuzzlePhase,
        selectedAugment: null,
        communityVotes: {},
        iqChangeResult: null,
        currentAugments: [],
        rerollOrder: [],
        secondRerollOrder: [],
        rollChargesRemaining: 0,
        hasExtraReroll: false,
        handleAugmentReroll: vi.fn(),
        handleAugmentSelect: vi.fn(),
        handleReplay: vi.fn(),
        resetFlow: vi.fn(),
        isV2Puzzle: mockIsV2Puzzle,
        declaredPath: null,
        handlePathDeclare: vi.fn(),
        is42Puzzle: false,
        declaredPlan: null,
        handlePlanDeclare: vi.fn(),
    })),
}));

vi.mock('./hooks/usePuzzleToPlayers', () => ({
    usePuzzleToPlayers: vi.fn(() => ({
        myPlayer: {
            id: '1',
            name: 'Me',
            avatar: 'me.png',
            hp: 100,
            gold: 50,
            level: 6,
            xp: 20,
            status: 'active',
            isMe: true,
            units: [],
            bench: [],
            arenaId: 'summoners_rift',
            augments: [],
        },
        allPlayers: [
            {
                id: '1',
                name: 'Me',
                avatar: 'me.png',
                hp: 100,
                gold: 50,
                level: 6,
                xp: 20,
                status: 'active',
                isMe: true,
                units: [],
                bench: [],
                arenaId: 'summoners_rift',
                augments: [],
            },
            {
                id: '2',
                name: 'Fuwa',
                avatar: 'fuwa.png',
                hp: 90,
                gold: 50,
                level: 6,
                xp: 20,
                status: 'active',
                isMe: false,
                units: [],
                bench: [],
                arenaId: 'summoners_rift',
                augments: [],
            },
        ],
        synergies: [],
        items: [],
    })),
}));

vi.mock('./hooks/useMobileAutoFullscreen', () => ({
    useMobileAutoFullscreen: vi.fn(() => {
        return vi.fn().mockImplementation(async () => {
            if (mockHasRequestedMobileFullscreen) {
                return;
            }

            mockHasRequestedMobileFullscreen = true;
            await document.documentElement.requestFullscreen?.();
        });
    }),
}));

vi.mock('./contexts/AuthContext', () => ({
    useAuth: vi.fn(() => ({
        user: { id: 'u1', display_name: 'Tester', email: 'tester@example.com' },
        isAuthenticated: true,
        isAdmin: false,
        isLoading: false,
    })),
}));

vi.mock('./features/coach-select/hooks/useCoachSelect', () => ({
    useCoachSelect: vi.fn(() => ({
        uiState: mockCoachUiState,
        selectedCoach: {
            id: 'visian',
            displayName: 'Visian',
            accentColor: '#00D1C1',
            role: 'Strategist',
            region: 'NA',
            avatarText: 'VI',
            imageSrc: '/coach-assets/visian-thumb.png',
            tagline: 'test',
            description: 'test',
            stats: [],
            ability: { key: 'Q', name: 'Test', description: 'Test ability' },
        },
        answer: mockCoachAnswer,
        error: mockCoachError,
        completionNoticeToken: mockCompletionNoticeToken,
        showCoachOverlay: mockShowCoachOverlay,
        showReturnFab: mockShowReturnFab,
        returnFabMode: mockReturnFabMode,
        openSelect: openCoachSelectMock,
        minimizeToBoard: minimizeToBoardMock,
        reopenOverlay: reopenOverlayMock,
        dismissSession: dismissSessionMock,
        selectCoach: selectCoachMock,
        backToSelect: backToSelectMock,
        askCoach: askCoachMock,
    })),
}));

vi.mock('./features/coach-select/coachCompletionChime', () => ({
    playCoachCompletionChime: () => playCoachCompletionChimeMock(),
}));

vi.mock('./components/Game/GameScene', () => ({
    GameScene: () => <div>GameScene</div>,
}));

vi.mock('./components/Game/GameHUD', () => ({
    GameHUD: ({
        onPlayerSelect,
        activePlayerId,
    }: {
        onPlayerSelect?: (id: string) => void;
        activePlayerId?: string;
    }) => (
        <div>
            GameHUD
            <div>ActivePlayer:{activePlayerId}</div>
            <button type="button" onClick={() => onPlayerSelect?.('2')}>Scout Fuwa</button>
            <button type="button" onClick={() => onPlayerSelect?.('1')}>Back Home</button>
        </div>
    ),
}));

vi.mock('./components/Arena/AugmentButton', () => ({
    AugmentButton: ({ onClick, isActive }: { onClick?: () => void; isActive?: boolean }) => (
        <div className="augment-button-container" data-active={isActive ? 'true' : 'false'}>
            <button type="button" className="augment-button" onClick={onClick}>Augment</button>
        </div>
    ),
}));

vi.mock('./components/Arena/GoldDisplay', () => ({
    GoldDisplay: () => <div>GoldDisplay</div>,
}));

vi.mock('./components/Arena/AugmentModal', () => ({
    AugmentModal: () => <div>AugmentModal</div>,
}));

vi.mock('./components/Arena/DecisionReview', () => ({
    DecisionReview: () => <div>DecisionReview</div>,
}));

vi.mock('./components/Arena/TopStatusBar', () => ({
    TopStatusBar: () => <div>TopStatusBar</div>,
}));

vi.mock('./features/augment-trainer/components/PathSelector', () => ({
    PathSelector: () => <div>PathSelector</div>,
}));

vi.mock('./features/augment-trainer/components/PlanSelector', () => ({
    PlanSelector: () => <div>PlanSelector</div>,
}));

vi.mock('./components/Settings/SettingsButton', () => ({
    MenuButton: () => (
        <div className="menu-container">
            <button type="button" className="fullscreen-button">Fullscreen</button>
            <button type="button" className="settings-button">Menu</button>
        </div>
    ),
}));

vi.mock('./components/Settings/ArenaSelectorModal', () => ({
    ArenaSelectorModal: () => <div>ArenaSelectorModal</div>,
}));

vi.mock('./components/Arena/PuzzleCompletionModal', () => ({
    PuzzleCompletionModal: () => <div>PuzzleCompletionModal</div>,
}));

vi.mock('./features/tcoin/components/TCoinBalance', () => ({
    TCoinBalance: () => <div>TCoinBalance</div>,
}));

vi.mock('./features/tcoin/components/TCoinEarnAnimation', () => ({
    TCoinEarnAnimation: () => <div>TCoinEarnAnimation</div>,
}));

vi.mock('./features/tcoin/components/PuzzleLockOverlay', () => ({
    PuzzleLockOverlay: () => <div>PuzzleLockOverlay</div>,
}));

vi.mock('./components/common/LandscapePrompt', () => ({
    LandscapePrompt: () => <div>LandscapePrompt</div>,
}));

vi.mock('./components/common/Toast', () => ({
    default: ({
        message,
        actionLabel,
        onAction,
        onClose,
    }: {
        message: string;
        actionLabel?: string;
        onAction?: () => void;
        onClose: () => void;
    }) => (
        <div data-testid="coach-toast">
            <span>{message}</span>
            {actionLabel && onAction && (
                <button
                    type="button"
                    onClick={() => {
                        onAction();
                        onClose();
                    }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    ),
}));

vi.mock('./components/Settings/SupportModal', () => ({
    SupportModal: () => <div>SupportModal</div>,
}));

vi.mock('./features/coach-select/components/CoachSelectOverlay', () => ({
    CoachSelectOverlay: ({
        uiState,
        answer,
        error,
        onObserveBoard,
        onClose,
    }: {
        uiState: string;
        answer: string | null;
        error: string | null;
        onObserveBoard: () => void;
        onClose: () => void;
    }) => (
        <div data-testid="coach-select-overlay">
            <div>CoachOverlay:{uiState}</div>
            {answer && <div>{answer}</div>}
            {error && <div>{error}</div>}
            <button type="button" onClick={onObserveBoard}>Observe Board</button>
            <button type="button" onClick={onClose}>Close Coach</button>
        </div>
    ),
}));

describe('App mobile overlay shell', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(() => ({
                matches: true,
                media: '(pointer: coarse)',
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    beforeEach(() => {
        fullscreenElement = null;
        mockPuzzlePhase = 'declaring_intent';
        mockIsV2Puzzle = true;
        mockPuzzleId = 'p1';
        mockCoachUiState = 'closed';
        mockCoachAnswer = null;
        mockCoachError = null;
        mockShowCoachOverlay = false;
        mockShowReturnFab = false;
        mockReturnFabMode = 'loading';
        mockCompletionNoticeToken = 0;
        mockHasRequestedMobileFullscreen = false;
        requestFullscreenMock = vi.fn().mockImplementation(async () => {
            fullscreenElement = document.documentElement;
        });
        openCoachSelectMock = vi.fn().mockImplementation(() => {
            mockCoachUiState = 'select';
            mockShowCoachOverlay = true;
        });
        minimizeToBoardMock = vi.fn().mockImplementation(() => {
            mockShowCoachOverlay = false;
            mockShowReturnFab = true;
            mockReturnFabMode = 'loading';
        });
        reopenOverlayMock = vi.fn().mockImplementation(() => {
            mockShowCoachOverlay = true;
            mockShowReturnFab = false;
        });
        dismissSessionMock = vi.fn().mockImplementation(() => {
            mockCoachUiState = 'closed';
            mockShowCoachOverlay = false;
            mockShowReturnFab = false;
            mockCoachAnswer = null;
            mockCoachError = null;
        });
        selectCoachMock = vi.fn();
        backToSelectMock = vi.fn();
        askCoachMock = vi.fn();
        playCoachCompletionChimeMock = vi.fn();

        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 667 });
        Object.defineProperty(window, 'innerHeight', { configurable: true, value: 375 });
        Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 5 });
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(() => ({
                matches: true,
                media: '(pointer: coarse)',
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
        Object.defineProperty(document.documentElement, 'requestFullscreen', {
            configurable: true,
            value: requestFullscreenMock,
        });
        Object.defineProperty(document, 'exitFullscreen', {
            configurable: true,
            value: vi.fn().mockImplementation(async () => {
                fullscreenElement = null;
            }),
        });
        Object.defineProperty(document, 'fullscreenElement', {
            configurable: true,
            get: () => fullscreenElement,
        });
    });

    it('sets data-mobile-overlay-mode to selector in phone-landscape selector flow', () => {
        const { container } = render(<App />);
        const viewportHudLayer = container.querySelector('.viewport-hud-layer');
        const appShell = container.querySelector('.app-container');

        expect(viewportHudLayer).not.toBeNull();
        expect(viewportHudLayer?.getAttribute('data-layout-mode')).toBe('phone-landscape');
        expect(viewportHudLayer?.getAttribute('data-mobile-overlay-mode')).toBe('selector');
        expect(appShell).not.toBeNull();
        expect(appShell?.getAttribute('data-layout-mode')).toBe('phone-landscape');
        expect(appShell?.getAttribute('data-mobile-overlay-mode')).toBe('selector');
        expect(viewportHudLayer?.nextElementSibling).toBe(appShell);
    });

    it('hides mobile utility controls while selector overlay is active', () => {
        const { container } = render(<App />);
        const viewportHudLayer = container.querySelector('.viewport-hud-layer');

        expect(viewportHudLayer).not.toBeNull();

        const hudLayer = viewportHudLayer as HTMLElement;
        expect(within(hudLayer).queryByRole('button', { name: 'Fullscreen' })).not.toBeInTheDocument();
        expect(within(hudLayer).queryByRole('button', { name: 'Menu' })).not.toBeInTheDocument();
        expect(within(hudLayer).getByRole('button', { name: 'Augment' })).toBeInTheDocument();
        expect(within(hudLayer).getByRole('button', { name: /Coach/i })).toBeInTheDocument();
        expect(container.querySelector('.app-container .coach-fab')).toBeNull();
    });

    it('restores mobile utility controls after the overlay is dismissed', async () => {
        const user = userEvent.setup();
        const { container } = render(<App />);
        const hudLayer = container.querySelector('.viewport-hud-layer') as HTMLElement;

        await user.click(within(hudLayer).getByRole('button', { name: 'Augment' }));

        await waitFor(() => {
            expect(within(hudLayer).getByRole('button', { name: 'Fullscreen' })).toBeInTheDocument();
            expect(within(hudLayer).getByRole('button', { name: 'Menu' })).toBeInTheDocument();
        });
    });

    it('shows coach entry in plan declaration phase too', () => {
        mockPuzzlePhase = 'declaring_plan';
        const { container } = render(<App />);
        const hudLayer = container.querySelector('.viewport-hud-layer') as HTMLElement;

        expect(within(hudLayer).getByRole('button', { name: /Coach/i })).toBeInTheDocument();
    });

    it('auto-requests fullscreen when the first mobile gameplay tap hits augment toggle', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(within(document.body).getByRole('button', { name: 'Augment' }));
        await user.click(within(document.body).getByRole('button', { name: 'Augment' }));

        await waitFor(() => {
            expect(requestFullscreenMock).toHaveBeenCalledTimes(1);
        });
    });

    it('does not auto-request fullscreen on desktop layouts', async () => {
        mockPuzzlePhase = 'selecting';
        mockIsV2Puzzle = false;
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
        Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
        Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 0 });
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(() => ({
                matches: false,
                media: '(pointer: fine)',
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        render(<App />);
        const user = userEvent.setup();
        await user.click(within(document.body).getByRole('button', { name: 'Menu' }));

        await new Promise(resolve => setTimeout(resolve, 0));
        expect(requestFullscreenMock).not.toHaveBeenCalled();
    });

    it('hides desktop utility controls during review screens', () => {
        mockPuzzlePhase = 'reviewing';
        mockIsV2Puzzle = false;
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
        Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
        Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 0 });
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(() => ({
                matches: false,
                media: '(pointer: fine)',
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        render(<App />);

        expect(within(document.body).queryByRole('button', { name: 'Fullscreen' })).not.toBeInTheDocument();
        expect(within(document.body).queryByRole('button', { name: 'Menu' })).not.toBeInTheDocument();
    });

    it('swallows mobile fullscreen rejections without console noise', async () => {
        const user = userEvent.setup();
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        requestFullscreenMock.mockRejectedValueOnce(new Error('blocked'));

        render(<App />);
        await user.click(within(document.body).getByRole('button', { name: 'Augment' }));

        await waitFor(() => {
            expect(requestFullscreenMock).toHaveBeenCalledTimes(1);
        });
        expect(consoleErrorSpy).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    it('blocks Q/R scouting while the coach overlay is open', () => {
        mockCoachUiState = 'loading';
        mockShowCoachOverlay = true;

        render(<App />);

        expect(screen.getByText('ActivePlayer:1')).toBeInTheDocument();

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }));

        expect(screen.getByText('ActivePlayer:1')).toBeInTheDocument();
        expect(screen.queryByText('ActivePlayer:2')).not.toBeInTheDocument();
    });

    it('blocks Q/R scouting while the review screen is active', () => {
        mockPuzzlePhase = 'reviewing';
        mockIsV2Puzzle = false;

        render(<App />);

        expect(screen.getByText('ActivePlayer:1')).toBeInTheDocument();

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));

        expect(screen.getByText('ActivePlayer:1')).toBeInTheDocument();
        expect(screen.queryByText('ActivePlayer:2')).not.toBeInTheDocument();
    });

    it('minimizes loading coach overlay back to the board and shows a dim return fab', async () => {
        const user = userEvent.setup();
        mockCoachUiState = 'loading';
        mockShowCoachOverlay = true;

        const { rerender } = render(<App />);

        await user.click(screen.getByRole('button', { name: 'Observe Board' }));
        rerender(<App />);

        expect(minimizeToBoardMock).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('coach-select-overlay')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Coach Visian đang nhìn nhận thế trận' })).toBeInTheDocument();
    });

    it('promotes the return fab when hidden analysis finishes', () => {
        mockCoachUiState = 'loading';
        mockShowReturnFab = true;
        mockReturnFabMode = 'loading';

        const { rerender } = render(<App />);

        mockCoachUiState = 'response';
        mockCoachAnswer = 'Pick: Kinh te';
        mockReturnFabMode = 'ready';
        mockCompletionNoticeToken = 1;
        rerender(<App />);

        expect(screen.getByRole('button', { name: 'Xem phân tích' })).toBeInTheDocument();
    });

    it('plays a coach completion chime once when hidden analysis finishes', () => {
        mockCoachUiState = 'loading';
        mockShowReturnFab = true;
        mockReturnFabMode = 'loading';

        const { rerender } = render(<App />);

        expect(playCoachCompletionChimeMock).not.toHaveBeenCalled();

        mockCoachUiState = 'response';
        mockCoachAnswer = 'Pick: Kinh te';
        mockShowReturnFab = true;
        mockReturnFabMode = 'ready';
        mockCompletionNoticeToken = 1;
        rerender(<App />);

        expect(playCoachCompletionChimeMock).toHaveBeenCalledTimes(1);

        rerender(<App />);
        expect(playCoachCompletionChimeMock).toHaveBeenCalledTimes(1);
    });

    it('reopens preserved coach analysis from the promoted return fab', async () => {
        const user = userEvent.setup();
        mockCoachUiState = 'loading';
        mockShowCoachOverlay = true;

        const { rerender } = render(<App />);

        await user.click(screen.getByRole('button', { name: 'Observe Board' }));
        rerender(<App />);

        mockCoachUiState = 'response';
        mockCoachAnswer = 'Pick: Kinh te';
        mockShowReturnFab = true;
        mockReturnFabMode = 'ready';
        rerender(<App />);

        await user.click(screen.getByRole('button', { name: 'Xem phân tích' }));
        rerender(<App />);

        expect(reopenOverlayMock).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('coach-select-overlay')).toBeInTheDocument();
        expect(screen.getByText('Pick: Kinh te')).toBeInTheDocument();
        expect(screen.queryByText('PathSelector')).not.toBeInTheDocument();
    });

    it('keeps the hidden coach session alive while scouting another board', async () => {
        const user = userEvent.setup();
        mockCoachUiState = 'loading';
        mockShowReturnFab = true;
        mockReturnFabMode = 'loading';

        render(<App />);

        await user.click(screen.getByRole('button', { name: 'Scout Fuwa' }));

        expect(dismissSessionMock).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Coach Visian đang nhìn nhận thế trận' })).toBeInTheDocument();
    });

    it('dismisses the hidden coach session when the overlay close action is used', async () => {
        const user = userEvent.setup();
        mockCoachUiState = 'response';
        mockCoachAnswer = 'Pick: Kinh te';
        mockShowCoachOverlay = true;

        const { rerender } = render(<App />);

        await user.click(screen.getByRole('button', { name: 'Close Coach' }));
        rerender(<App />);

        expect(dismissSessionMock).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('coach-select-overlay')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Xem phân tích' })).not.toBeInTheDocument();
    });
});
