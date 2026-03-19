import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PuzzleLockOverlay } from './PuzzleLockOverlay';

describe('PuzzleLockOverlay', () => {
    it('renders the lock overlay with available actions for locked paid tiers', () => {
        const { container } = render(
            <PuzzleLockOverlay
                tier="advanced"
                isProSupporter={false}
                canAfford={true}
                onUnlock={vi.fn()}
                onProSupporter={vi.fn()}
            />,
        );

        expect(container.querySelector('.puzzle-lock-overlay')).not.toBeNull();
        expect(container.querySelector('.puzzle-lock-content')).not.toBeNull();
        expect(screen.getByRole('button', { name: 'Mở khóa' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Pro Supporter/i })).toBeInTheDocument();
    });
});
