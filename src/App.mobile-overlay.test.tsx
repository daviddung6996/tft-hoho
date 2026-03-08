import { render } from '@testing-library/react';
import { describe, expect, it, vi, beforeAll, beforeEach } from 'vitest';
import App from './App';

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
        puzzlePhase: 'declaring_intent',
        selectedAugment: null,
        communityVotes: {},
        iqChangeResult: null,
        currentAugments: [],
        rerollOrder: [],
        handleAugmentReroll: vi.fn(),
        handleAugmentSelect: vi.fn(),
        handleReplay: vi.fn(),
        resetFlow: vi.fn(),
        isV2Puzzle: true,
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
    AugmentButton: () => <button type="button">Augment</button>
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
    MenuButton: () => <div>MenuButton</div>
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
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 667 });
        Object.defineProperty(window, 'innerHeight', { configurable: true, value: 375 });
        Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 5 });
    });

    it('sets data-mobile-overlay-mode to selector in phone-landscape selector flow', () => {
        const { container } = render(<App />);
        const appShell = container.querySelector('.app-container');

        expect(appShell).not.toBeNull();
        expect(appShell?.getAttribute('data-layout-mode')).toBe('phone-landscape');
        expect(appShell?.getAttribute('data-mobile-overlay-mode')).toBe('selector');
    });
});
