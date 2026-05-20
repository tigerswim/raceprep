import React, { act } from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthModal } from '../AuthModal';

// Mock the auth context
const mockAuth = {
  user: null,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resendConfirmation: jest.fn(),
};

const mockRouterReplace = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
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

  it('shows the "check your email" view when signUp returns no session', async () => {
    mockAuth.signUp.mockResolvedValueOnce({
      data: { user: { id: 'new-user' }, session: null },
      error: null,
    });

    const onClose = jest.fn();
    const { container } = render(<AuthModal isOpen={true} onClose={onClose} initialMode="signup" />);

    fireEvent.change(screen.getByPlaceholderText('ENTER YOUR FULL NAME'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('ENTER YOUR EMAIL'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('ENTER YOUR PASSWORD'), { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]') as HTMLButtonElement);
    });

    expect(await screen.findByText('CHECK YOUR EMAIL')).toBeInTheDocument();
    expect(screen.getByText('new@example.com')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('redirects to dashboard when signUp returns a session', async () => {
    mockAuth.signUp.mockResolvedValueOnce({
      data: { user: { id: 'new-user' }, session: { access_token: 'token' } },
      error: null,
    });

    const onClose = jest.fn();
    const { container } = render(<AuthModal isOpen={true} onClose={onClose} initialMode="signup" />);

    fireEvent.change(screen.getByPlaceholderText('ENTER YOUR FULL NAME'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('ENTER YOUR EMAIL'), { target: { value: 'auto@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('ENTER YOUR PASSWORD'), { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]') as HTMLButtonElement);
    });

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(mockRouterReplace).toHaveBeenCalledWith('/');
    expect(screen.queryByText('CHECK YOUR EMAIL')).not.toBeInTheDocument();
  });

  it('resends the confirmation email and disables the button during cooldown', async () => {
    mockAuth.signUp.mockResolvedValueOnce({
      data: { user: { id: 'new-user' }, session: null },
      error: null,
    });
    mockAuth.resendConfirmation.mockResolvedValueOnce({ data: {}, error: null });

    const { container } = render(<AuthModal isOpen={true} onClose={() => {}} initialMode="signup" />);

    fireEvent.change(screen.getByPlaceholderText('ENTER YOUR FULL NAME'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('ENTER YOUR EMAIL'), { target: { value: 'resend@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('ENTER YOUR PASSWORD'), { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]') as HTMLButtonElement);
    });

    const resendBtn = await screen.findByText('RESEND EMAIL');

    await act(async () => {
      fireEvent.click(resendBtn);
    });

    expect(mockAuth.resendConfirmation).toHaveBeenCalledWith('resend@example.com');
    await waitFor(() => expect(screen.getByText(/RESEND IN \d+s/)).toBeInTheDocument());
    const cooldownBtn = screen.getByText(/RESEND IN \d+s/).closest('button') as HTMLButtonElement;
    expect(cooldownBtn).toBeDisabled();
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
