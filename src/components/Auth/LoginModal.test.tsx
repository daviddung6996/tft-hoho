import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoginModal } from './LoginModal';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithGoogle: vi.fn(),
    continueAsGuest: vi.fn(),
  }),
}));

describe('LoginModal', () => {
  it('shows the Set 17 badge on the login hero', () => {
    render(<LoginModal onClose={vi.fn()} />);

    expect(screen.getByText('SET 17')).toBeInTheDocument();
  });
});
