import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TrueDamagePanel } from './TrueDamagePanel';

describe('TrueDamagePanel Component', () => {
  it('renders A-Side by default with correct text and button', () => {
    render(<TrueDamagePanel />);

    expect(screen.getByText('True Damage')).toBeInTheDocument();
    expect(screen.getByText('A-Side: Win')).toBeInTheDocument();
    expect(screen.getByText('Flip to B-Side')).toBeInTheDocument();

    const tier5 = screen.getByText(/5\) 30% true damage/);
    expect(tier5).toBeInTheDocument();
    expect(tier5).toHaveClass('dim');
    expect(tier5).not.toHaveClass('bside');
  });

  it('renders B-Side when initialSide="B" with bside dim class', () => {
    render(<TrueDamagePanel initialSide="B" />);

    expect(screen.getByText('B-Side: Lose')).toBeInTheDocument();
    expect(screen.getByText('Flip to A-Side')).toBeInTheDocument();

    const tier5 = screen.getByText(/5\) Each round after combat/);
    expect(tier5).toBeInTheDocument();
    expect(tier5).toHaveClass('dim');
    expect(tier5).toHaveClass('bside');
  });

  it('flips between A-Side and B-Side when button is clicked', () => {
    const onFlip = vi.fn();
    render(<TrueDamagePanel onFlip={onFlip} />);

    // Initial A-Side
    expect(screen.getByText('A-Side: Win')).toBeInTheDocument();
    const flipBtn = screen.getByText('Flip to B-Side');

    // Click to flip to B-Side
    fireEvent.click(flipBtn);
    expect(onFlip).toHaveBeenCalledWith('B');
    expect(screen.getByText('B-Side: Lose')).toBeInTheDocument();
    expect(screen.getByText('Flip to A-Side')).toBeInTheDocument();

    // Click to flip back to A-Side
    fireEvent.click(screen.getByText('Flip to A-Side'));
    expect(onFlip).toHaveBeenCalledWith('A');
    expect(screen.getByText('A-Side: Win')).toBeInTheDocument();
  });

  it('renders CDN image in .icon-slot by default', () => {
    render(<TrueDamagePanel />);
    const img = screen.getByAltText('True Damage');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      'src',
      'https://ap.tft.tools/static/trait-icons/tft10_truedamage_w.svg'
    );
  });

  it('renders SVG fallback in .icon-slot when useSvgFallback is true', () => {
    render(<TrueDamagePanel useSvgFallback={true} />);
    const svg = screen.getByLabelText('True Damage Icon (Fallback)');
    expect(svg).toBeInTheDocument();
  });
});
