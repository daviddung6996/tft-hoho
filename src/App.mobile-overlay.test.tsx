import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeAll, beforeEach } from 'vitest';
import App from './App';

let fullscreenElement: Element | null = null;
let requestFullscreenMock = vi.fn();
let mockPuzzlePhase = 'declaring_intent';
let mockIsV2Puzzle = true;

vi.mock('./hooks/useArenaPreloader', () => ({
    useArenaPreloader: vi.fn()
}));

vi.mock('./hooks/usePuzzleGame', () => ({
    usePuzzleGame: vi.fn(() => ({
        currentPuzzle: {
            id: 'p1',
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
            meta_data: {}
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
        walletBalance: 0
    }))
}));

vi.mock('./hooks/useGameFlow', () => ({
    useGameFlow: vi.fn(() => ({
        puzzlePhase: mockPuzzlePhase,
        selectedAugment: null,
        communityVotes: {},
        iqChangeResult: null,
        currentAugments: [],
        rerollOrder: [],
        handleAugmentReroll: vi.fn(),
        handleAugmentSelect: vi.fn(),
        handleReplay: vi.fn(),
        resetFlow: vi.fn(),
        isV2Puzzle: mockIsV2Puzzle,
        declaredPath: null,
        handlePathDeclare: vi.fn(),
        is42Puzzle: false,
        declaredPlan: null,
        handlePlanDeclare: vi.fn()
    }))
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
            arenaId: 'summoners_rift'
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
                arenaId: 'summoners_rift'
            }
        ],
        synergies: [],
        items: []
    }))
}));

vi.mock('./contexts/AuthContext', () => ({
    useAuth: vi.fn(() => ({
        user: { id: 'u1', display_name: 'Tester', email: 'tester@example.com' },
        isAuthenticated: true,
        isAdmin: false,
        isLoading: false
    }))
}));

vi.mock('./components/Game/GameScene', () => ({
    GameScene: () => <div>GameScene</div>
}));

vi.mock('./components/Game/GameHUD', () => ({
    GameHUD: () => <div>GameHUD</div>
}));

vi.mock('./components/Arena/AugmentButton', () => ({
    AugmentButton: ({ onClick }: { onClick?: () => void }) => (
        <div className="augment-button-container">
            <button type="button" className="augment-button" onClick={onClick}>Augment</button>
        </div>
    )
}));

vi.mock('./components/Arena/GoldDisplay', () => ({
    GoldDisplay: () => <div>GoldDisplay</div>
}));

vi.mock('./components/Arena/AugmentModal', () => ({
    AugmentModal: () => <div>AugmentModal</div>
}));

vi.mock('./components/Arena/DecisionReview', () => ({
    DecisionReview: () => <div>DecisionReview</div>
}));

vi.mock('./components/Arena/TopStatusBar', () => ({
    TopStatusBar: () => <div>TopStatusBar</div>
}));

vi.mock('./features/augment-trainer/components/PathSelector', () => ({
    PathSelector: () => <div>PathSelector</div>
}));

vi.mock('./features/augment-trainer/components/PlanSelector', () => ({
    PlanSelector: () => <div>PlanSelector</div>
}));

vi.mock('./components/Settings/SettingsButton', () => ({
    MenuButton: () => (
        <div className="menu-container">
            <button type="button" className="fullscreen-button">Fullscreen</button>
            <button type="button" className="settings-button">Menu</button>
        </div>
    )
}));

vi.mock('./components/Settings/ArenaSelectorModal', () => ({
    ArenaSelectorModal: () => <div>ArenaSelectorModal</div>
}));

vi.mock('./components/Arena/PuzzleCompletionModal', () => ({
    PuzzleCompletionModal: () => <div>PuzzleCompletionModal</div>
}));

vi.mock('./features/tcoin/components/TCoinBalance', () => ({
    TCoinBalance: () => <div>TCoinBalance</div>
}));

vi.mock('./features/tcoin/components/TCoinEarnAnimation', () => ({
    TCoinEarnAnimation: () => <div>TCoinEarnAnimation</div>
}));

vi.mock('./features/tcoin/components/PuzzleLockOverlay', () => ({
    PuzzleLockOverlay: () => <div>PuzzleLockOverlay</div>
}));

vi.mock('./components/common/LandscapePrompt', () => ({
    LandscapePrompt: () => <div>LandscapePrompt</div>
}));

vi.mock('./components/Settings/SupportModal', () => ({
    SupportModal: () => <div>SupportModal</div>
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
                dispatchEvent: vi.fn()
            }))
        });
    });

    beforeEach(() => {
        fullscreenElement = null;
        mockPuzzlePhase = 'declaring_intent';
        mockIsV2Puzzle = true;
        requestFullscreenMock = vi.fn().mockImplementation(async () => {
            fullscreenElement = document.documentElement;
        });

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
                dispatchEvent: vi.fn()
            }))
        });
        Object.defineProperty(document.documentElement, 'requestFullscreen', {
            configurable: true,
            value: requestFullscreenMock
        });
        Object.defineProperty(document, 'exitFullscreen', {
            configurable: true,
            value: vi.fn().mockImplementation(async () => {
                fullscreenElement = null;
            })
        });
        Object.defineProperty(document, 'fullscreenElement', {
            configurable: true,
            get: () => fullscreenElement
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
                dispatchEvent: vi.fn()
            }))
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
                dispatchEvent: vi.fn()
            }))
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
});
