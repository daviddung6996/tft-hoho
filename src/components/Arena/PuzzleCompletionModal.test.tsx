import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PuzzleCompletionModal } from './PuzzleCompletionModal';

describe('PuzzleCompletionModal', () => {
    it('adds the phone-landscape compact classes when the shell passes mobile layout mode', () => {
        const { container } = render(
            <PuzzleCompletionModal
                isOpen
                onClose={vi.fn()}
                layoutMode="phone-landscape"
            />,
        );

        expect(container.querySelector('.puzzle-done-overlay--phone-landscape')).not.toBeNull();
        expect(container.querySelector('.puzzle-done-modal--phone-landscape')).not.toBeNull();
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});
