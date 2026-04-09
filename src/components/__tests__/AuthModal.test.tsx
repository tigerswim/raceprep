import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthModal } from '../AuthModal';

// Mock the auth context
const mockAuth = {
  user: null,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

describe('AuthModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.loading = false;
  });

  it('renders signin form by default', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />);

    const signInElements = screen.getAllByText('SIGN IN');
    expect(signInElements.length).toBeGreaterThan(0);
    expect(screen.getByText('EMAIL')).toBeInTheDocument();
    expect(screen.getByText('PASSWORD')).toBeInTheDocument();
  });

  it('switches to signup mode when clicking Sign Up button', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />);

    const signUpButton = screen.getAllByText('SIGN UP')[0];
    fireEvent.click(signUpButton);
    expect(screen.getAllByText('CREATE ACCOUNT').length).toBeGreaterThan(0);
    expect(screen.getByText('FULL NAME')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<AuthModal isOpen={false} onClose={() => {}} />);

    expect(screen.queryByText('EMAIL')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when submitting', async () => {
    mockAuth.signIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const { container } = render(<AuthModal isOpen={true} onClose={() => {}} />);

    const emailInput = screen.getByPlaceholderText('ENTER YOUR EMAIL');
    const passwordInput = screen.getByPlaceholderText('ENTER YOUR PASSWORD');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Find the submit button specifically
    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submitButton);

    expect(screen.getByText('PLEASE WAIT...')).toBeInTheDocument();
  });
});
