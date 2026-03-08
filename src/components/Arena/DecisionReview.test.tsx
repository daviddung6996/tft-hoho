import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DecisionReview, type DecisionReviewProps } from './DecisionReview';

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: vi.fn(() => ({
        user: { id: 'u1', display_name: 'Tester', email: 'tester@example.com' },
        isAuthenticated: true,
        isAdmin: false,
        isMod: false,
        isLoading: false,
    })),
}));

vi.mock('../../features/video-library/videoLibrary.service', () => ({
    videoLibraryService: {
        unlockVideo: vi.fn(),
    },
}));

vi.mock('../../features/share/components/ShareModal', () => ({
    ShareModal: () => <div>ShareModal</div>,
}));

const createMockProps = (): DecisionReviewProps => ({
    userChoice: {
        id: 'aug1',
        title: 'Test Augment',
        description: 'Test description',
        icon: 'test.png',
        tier: 1,
    },
    userRerollOrder: [1, 0, 0],
    correctAugmentId: 'aug2',
    proFirstRoll: [
        { id: 'aug1', title: 'Test Augment', description: 'Test', icon: 'test.png', tier: 1 },
        { id: 'aug2', title: 'Pro Augment', description: 'Test', icon: 'test.png', tier: 1 },
        { id: 'aug3', title: 'Other Augment', description: 'Test', icon: 'test.png', tier: 1 },
    ],
    initialAugments: [
        { id: 'aug1', title: 'Test Augment', description: 'Test', icon: 'test.png', tier: 1 },
        { id: 'aug2', title: 'Pro Augment', description: 'Test', icon: 'test.png', tier: 1 },
        { id: 'aug3', title: 'Other Augment', description: 'Test', icon: 'test.png', tier: 1 },
    ],
    rerollAugments: [
        { id: 'aug4', title: 'Reroll 1', description: 'Test', icon: 'test.png', tier: 1 },
        { id: 'aug5', title: 'Reroll 2', description: 'Test', icon: 'test.png', tier: 1 },
        { id: 'aug6', title: 'Reroll 3', description: 'Test', icon: 'test.png', tier: 1 },
    ],
    proRerollIndices: [0],
    onNextPuzzle: vi.fn(),
    onReplay: vi.fn(),
    puzzleId: 'test-puzzle-1',
    patch: '14.24',
    date: '2026-03-08',
    server: 'VN',
    encounter: 'Krugs',
    communityVotes: {
        'Test Augment': 12,
        'Pro Augment': 28,
        'Reroll 1': 9,
    },
    iqChangeResult: { changeAmount: 12, newScore: 1420, newRank: 'Gold' },
    proPlayerName: 'Tuyen thu',
    puzzleTier: 'advanced',
    explanation: 'Day la loi giai thich dai de dam bao khu vuc mobile co the scroll day du.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoTitle: 'Pro Review',
    onViewLibrary: vi.fn(),
    onSupportClick: vi.fn(),
});

const setViewport = (width: number, height = 812) => {
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
    });

    Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: height,
    });
};

describe('DecisionReview', () => {
    beforeEach(() => {
        setViewport(1024, 768);

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            configurable: true,
            value: vi.fn().mockImplementation((query: string) => ({
                matches: query.includes('max-width: 768px') ? window.innerWidth <= 768 : false,
                media: query,
                onchange: null,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                addListener: vi.fn(),
                removeListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    it('renders dedicated mobile shell at <=768px', () => {
        setViewport(390, 844);
        const { container } = render(<DecisionReview {...createMockProps()} />);

        expect(container.querySelector('.decision-review-mobile-shell')).toBeInTheDocument();
        expect(container.querySelector('.decision-review-mobile-header')).toBeInTheDocument();
        expect(container.querySelector('.decision-review-mobile-scroll')).toBeInTheDocument();
        expect(container.querySelector('.decision-review-mobile-footer')).toBeInTheDocument();
        expect(container.querySelector('.puzzle-context')).toBeNull();
    });

    it('keeps desktop header layout above 768px', () => {
        setViewport(1024, 768);
        const { container } = render(<DecisionReview {...createMockProps()} />);

        expect(container.querySelector('.decision-review-mobile-shell')).toBeNull();
        expect(container.querySelector('.puzzle-context')).toBeInTheDocument();
        expect(container.querySelector('.review-bottom-bar')).toBeInTheDocument();
    });

    it('shows mobile utility actions and iq summary in the header', () => {
        setViewport(393, 852);
        const { container } = render(<DecisionReview {...createMockProps()} />);

        expect(container.querySelector('.decision-review-mobile-utility-actions')).toBeInTheDocument();
        expect(container.querySelector('.decision-review-mobile-iq-overlay .iq-score-summary')).toBeInTheDocument();
        expect(screen.getByText('Pro VOD')).toBeInTheDocument();
    });

    it('renders the mobile card grid layout', () => {
        setViewport(375, 812);
        const { container } = render(<DecisionReview {...createMockProps()} />);

        expect(container.querySelector('.decision-review-mobile-grid-6')).toBeInTheDocument();
        expect(container.querySelectorAll('.decision-review-mobile-card-group').length).toBeGreaterThanOrEqual(1);
        expect(container.querySelectorAll('.review-card--mobile').length).toBeGreaterThanOrEqual(2);
        expect(container.querySelector('.final-augment-grid-6')).toBeNull();
    });

    it('renders mobile explanation, inline video, and footer actions', () => {
        setViewport(390, 844);
        const { container } = render(<DecisionReview {...createMockProps()} />);

        expect(container.querySelector('.decision-review-mobile-video iframe')).toBeInTheDocument();
        expect(container.querySelector('.decision-review-mobile-action-row')).toBeInTheDocument();
        expect(screen.getByText('Pro VOD')).toBeInTheDocument();
    });
});
