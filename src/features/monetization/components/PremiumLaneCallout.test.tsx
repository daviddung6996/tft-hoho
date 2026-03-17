import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PremiumLaneCallout } from './PremiumLaneCallout';

describe('PremiumLaneCallout', () => {
    it('shows premium lane CTA only in free-pro mode for non-pro users', () => {
        const onUpgradeClick = vi.fn();

        render(
            <PremiumLaneCallout
                mode="free-pro"
                isProEntitled={false}
                onUpgradeClick={onUpgradeClick}
            />,
        );

        const callout = screen.getByTestId('premium-lane-callout');
        expect(callout).toBeInTheDocument();
        expect(callout).toHaveTextContent(/pro/i);
    });

    it('does not render for pro-entitled users', () => {
        render(
            <PremiumLaneCallout
                mode="free-pro"
                isProEntitled={true}
                onUpgradeClick={() => {}}
            />,
        );

        expect(screen.queryByTestId('premium-lane-callout')).not.toBeInTheDocument();
    });

    it('does not render during beta mode', () => {
        render(
            <PremiumLaneCallout
                mode="beta"
                isProEntitled={false}
                onUpgradeClick={() => {}}
            />,
        );

        expect(screen.queryByTestId('premium-lane-callout')).not.toBeInTheDocument();
    });

    it('shows Hard and Pro lane labels', () => {
        render(
            <PremiumLaneCallout
                mode="free-pro"
                isProEntitled={false}
                onUpgradeClick={() => {}}
            />,
        );

        const callout = screen.getByTestId('premium-lane-callout');
        expect(callout).toHaveTextContent(/hard/i);
        expect(callout).toHaveTextContent(/pro/i);
    });

    it('calls onUpgradeClick when the CTA button is pressed', async () => {
        const user = userEvent.setup();
        const onUpgradeClick = vi.fn();

        render(
            <PremiumLaneCallout
                mode="free-pro"
                isProEntitled={false}
                onUpgradeClick={onUpgradeClick}
            />,
        );

        await user.click(screen.getByRole('button', { name: /upgrade/i }));
        expect(onUpgradeClick).toHaveBeenCalledOnce();
    });
});
