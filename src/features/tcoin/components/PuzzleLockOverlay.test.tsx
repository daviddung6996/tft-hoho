import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PuzzleLockOverlay } from './PuzzleLockOverlay';

describe('PuzzleLockOverlay', () => {
    it('adds the phone-landscape compact classes for short mobile lock states', () => {
        const { container } = render(
            <PuzzleLockOverlay
                tier="advanced"
                isProSupporter={false}
                canAfford={true}
                onUnlock={vi.fn()}
                onProSupporter={vi.fn()}
                layoutMode="phone-landscape"
            />,
        );

        expect(container.querySelector('.puzzle-lock-overlay--phone-landscape')).not.toBeNull();
        expect(container.querySelector('.puzzle-lock-content--phone-landscape')).not.toBeNull();
        expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });
});
