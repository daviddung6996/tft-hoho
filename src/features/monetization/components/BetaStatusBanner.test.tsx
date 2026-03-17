import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BetaStatusBanner } from './BetaStatusBanner';

describe('BetaStatusBanner', () => {
    it('renders beta framing while beta is active', () => {
        render(
            <BetaStatusBanner
                mode="beta"
                betaEndsAt="2026-04-16T23:59:59.999Z"
            />,
        );

        const banner = screen.getByTestId('beta-status-banner');
        expect(banner).toHaveTextContent(/beta/i);
        expect(banner).toHaveTextContent(/free & pro coming/i);
        expect(banner).toHaveTextContent(/apr 16/i);
        expect(screen.queryByText(/beta ended/i)).not.toBeInTheDocument();
    });

    it('renders free pro transition framing after beta ends', () => {
        render(
            <BetaStatusBanner
                mode="free-pro"
                betaEndsAt="2026-04-16T23:59:59.999Z"
            />,
        );

        const banner = screen.getByTestId('beta-status-banner');
        expect(banner).toHaveTextContent(/free & pro/i);
        expect(banner).toHaveTextContent(/beta ended/i);
        expect(banner).toHaveTextContent(/apr 16/i);
    });

    it('falls back to the raw beta end string when the date is invalid', () => {
        render(
            <BetaStatusBanner
                mode="beta"
                betaEndsAt="beta-ending-soon"
            />,
        );

        expect(screen.getByTestId('beta-status-banner')).toHaveTextContent(/beta-ending-soon/i);
    });
});
