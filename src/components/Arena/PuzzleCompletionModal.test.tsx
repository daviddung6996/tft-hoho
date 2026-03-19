import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PuzzleCompletionModal } from './PuzzleCompletionModal';

describe('PuzzleCompletionModal', () => {
    it('renders the completion modal shell when open', () => {
        const { container } = render(
            <PuzzleCompletionModal
                isOpen
                onClose={vi.fn()}
            />,
        );

        expect(container.querySelector('.puzzle-done-overlay')).not.toBeNull();
        expect(container.querySelector('.puzzle-done-modal')).not.toBeNull();
        expect(screen.getByRole('button', { name: 'Đóng' })).toBeInTheDocument();
    });
});
