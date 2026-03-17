import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MenuButton } from './SettingsButton';

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'u1', display_name: 'Tester' },
        isAuthenticated: true,
        isGuest: false,
        signOut: vi.fn(),
    }),
}));

vi.mock('../../features/user-iq/userIq.service', () => ({
    getUserIqStats: () => Promise.resolve({ iq_score: 1200, iq_rank: 'Gold' }),
}));

vi.mock('../../features/user-iq/userIqCalculator', () => ({
    getUserIqRankColor: () => '#c8aa6e',
}));

vi.mock('../../features/user-iq/components/IqRankIcon', () => ({
    IqRankIcon: () => <span data-testid="iq-rank-icon" />,
}));

vi.mock('../../features/tcoin/hooks/useTCoin', () => ({
    useTCoin: () => ({ balance: 500 }),
}));

vi.mock('../../features/video-library/hooks/useVideoLibrary', () => ({
    useVideoLibrary: () => ({ unlockedCount: 2, totalCount: 5 }),
}));

vi.mock('../Game/mobileLayout', () => ({
    getLayoutMode: () => 'desktop' as const,
}));

vi.mock('../../utils/fullscreen', () => ({
    canUseFullscreen: () => false,
    isFullscreenActive: () => false,
    requestDocumentFullscreenSafe: vi.fn(),
    exitDocumentFullscreenSafe: vi.fn(),
}));

vi.mock('./SupportModal', () => ({
    SupportModal: () => null,
}));

const baseProps = () => ({
    isAuthenticated: true,
    displayName: 'Tester',
    onArenaClick: vi.fn(),
    onProfileClick: vi.fn(),
    onLoginClick: vi.fn(),
    onLibraryClick: vi.fn(),
    isAdmin: false,
});

describe('SettingsButton — monetization packaging', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            configurable: true,
            value: vi.fn().mockImplementation((query: string) => ({
                matches: false,
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

    it('does not show upgrade CTA in menu during beta', async () => {
        const user = userEvent.setup();

        render(
            <MenuButton
                {...baseProps()}
                monetizationMode="beta"
                isProEntitled={false}
                onUpgradeClick={() => {}}
            />,
        );

        await user.click(screen.getByLabelText('Menu'));

        expect(screen.queryByText(/upgrade to pro/i)).not.toBeInTheDocument();
    });

    it('shows Pro upgrade entry in free-pro mode for non-pro users', async () => {
        const user = userEvent.setup();
        const onUpgradeClick = vi.fn();

        render(
            <MenuButton
                {...baseProps()}
                monetizationMode="free-pro"
                isProEntitled={false}
                onUpgradeClick={onUpgradeClick}
            />,
        );

        await user.click(screen.getByLabelText('Menu'));

        const upgradeBtn = screen.getByText(/upgrade to pro/i);
        expect(upgradeBtn).toBeInTheDocument();

        await user.click(upgradeBtn);
        expect(onUpgradeClick).toHaveBeenCalledOnce();
    });

    it('hides upgrade entry for pro-entitled users in free-pro mode', async () => {
        const user = userEvent.setup();

        render(
            <MenuButton
                {...baseProps()}
                monetizationMode="free-pro"
                isProEntitled={true}
                onUpgradeClick={() => {}}
            />,
        );

        await user.click(screen.getByLabelText('Menu'));

        expect(screen.queryByText(/upgrade to pro/i)).not.toBeInTheDocument();
    });
});
