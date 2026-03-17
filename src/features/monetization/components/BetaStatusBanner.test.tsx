import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BetaStatusBanner } from './BetaStatusBanner';

describe('BetaStatusBanner', () => {
    it('renders Open Beta chip while beta is active', () => {
        render(
            <BetaStatusBanner
                mode="beta"
                betaEndsAt="2026-04-16T23:59:59.999Z"
            />,
        );

        const banner = screen.getByTestId('beta-status-banner');
        expect(banner).toHaveTextContent(/open beta/i);
    });

    it('renders nothing after beta ends', () => {
        const { container } = render(
            <BetaStatusBanner
                mode="free-pro"
                betaEndsAt="2026-04-16T23:59:59.999Z"
            />,
        );

        expect(screen.queryByTestId('beta-status-banner')).not.toBeInTheDocument();
        expect(container.innerHTML).toBe('');
    });
});
