import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const RESEND_COOLDOWN_SECONDS = 30;

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [view, setView] = useState<'form' | 'confirm-sent'>('form');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sent' | 'error'>('idle');

  const { signIn, signUp, resendConfirmation } = useAuth();

  // Reset modal state every time it opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setView('form');
      setError('');
      setResendCooldown(0);
      setResendStatus('idle');
    }
  }, [isOpen, initialMode]);

  // Tick the resend cooldown down to zero
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error.message);
        } else {
          onClose();
          setEmail('');
          setPassword('');
          setName('');
          router.replace('/');
        }
      } else {
        const result = await signUp(email, password, { name });
        if (result.error) {
          setError(result.error.message);
        } else if (result.data?.session) {
          // Email confirmation disabled — full sign-in already happened.
          onClose();
          setEmail('');
          setPassword('');
          setName('');
          router.replace('/');
        } else {
          // Email confirmation required — show the "check your email" view.
          // Keep `email` in state so the screen can echo it back and the
          // resend action can target it.
          setPassword('');
          setName('');
          setView('confirm-sent');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setResendStatus('idle');
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    const result = await resendConfirmation(email);
    if (result.error) {
      setResendStatus('error');
      setError(result.error.message || 'Could not resend confirmation email');
    } else {
      setResendStatus('sent');
    }
  };

  const handleBackToSignIn = () => {
    setView('form');
    setMode('signin');
    setError('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-overlay-enter">
      <div className="bg-terminal-panel border-2 border-terminal-border max-w-md w-full animate-modal-enter" style={{ borderRadius: 0 }}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-primary font-mono tracking-wider">
              {view === 'confirm-sent'
                ? 'CHECK YOUR EMAIL'
                : mode === 'signin'
                  ? 'SIGN IN'
                  : 'CREATE ACCOUNT'}
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-2xl font-mono transition-colors duration-100 active:scale-[0.97]"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {view === 'confirm-sent' ? (
            <div className="space-y-5">
              <div className="text-5xl text-center" role="img" aria-label="Envelope">✉</div>

              <p className="text-text-primary text-sm font-mono leading-relaxed">
                We sent a confirmation link to{' '}
                <span className="text-accent-yellow font-bold break-all">{email}</span>.
                Click the link to activate your account. The link expires in 24 hours.
              </p>

              <p className="text-text-secondary text-xs font-mono">
                Don&apos;t see it? Check your spam folder.
              </p>

              {resendStatus === 'sent' && (
                <div className="p-3 bg-emerald-500/10 border-2 border-emerald-400/30" style={{ borderRadius: 0 }}>
                  <p className="text-emerald-300 text-xs font-mono">CONFIRMATION EMAIL RESENT ✓</p>
                </div>
              )}

              {resendStatus === 'error' && error && (
                <div className="p-3 bg-red-500/20 border-2 border-red-400/30" style={{ borderRadius: 0 }}>
                  <p className="text-red-300 text-xs font-mono">{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="w-full bg-accent-yellow text-terminal-bg px-6 py-3 font-medium hover:bg-accent-yellow/90 transition-colors duration-150 active:scale-[0.97] font-mono tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderRadius: 0 }}
                >
                  {resendCooldown > 0 ? `RESEND IN ${resendCooldown}s` : 'RESEND EMAIL'}
                </button>
                <button
                  type="button"
                  onClick={handleBackToSignIn}
                  className="w-full bg-terminal-panel text-text-secondary border-2 border-terminal-border px-6 py-3 font-medium hover:border-text-secondary hover:text-text-primary transition-colors duration-150 active:scale-[0.97] font-mono tracking-wider"
                  style={{ borderRadius: 0 }}
                >
                  BACK TO SIGN IN
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('signin')}
                    className={`flex-1 py-2 px-4 text-xs font-medium transition-colors duration-150 active:scale-[0.97] font-mono tracking-wider ${
                      mode === 'signin'
                        ? 'bg-accent-yellow text-terminal-bg'
                        : 'bg-terminal-panel text-text-secondary border-2 border-terminal-border hover:border-text-secondary hover:text-text-primary'
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    SIGN IN
                  </button>
                  <button
                    onClick={() => setMode('signup')}
                    className={`flex-1 py-2 px-4 text-xs font-medium transition-colors duration-150 active:scale-[0.97] font-mono tracking-wider ${
                      mode === 'signup'
                        ? 'bg-accent-yellow text-terminal-bg'
                        : 'bg-terminal-panel text-text-secondary border-2 border-terminal-border hover:border-text-secondary hover:text-text-primary'
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    SIGN UP
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border-2 border-red-400/30" style={{ borderRadius: 0 }}>
                  <p className="text-red-300 text-xs font-mono">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow transition-colors duration-150 font-mono"
                      style={{ borderRadius: 0 }}
                      placeholder="ENTER YOUR FULL NAME"
                      required={mode === 'signup'}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow transition-colors duration-150 font-mono"
                    style={{ borderRadius: 0 }}
                    placeholder="ENTER YOUR EMAIL"
                    required
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase">
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow transition-colors duration-150 font-mono"
                    style={{ borderRadius: 0 }}
                    placeholder="ENTER YOUR PASSWORD"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-accent-yellow text-terminal-bg px-6 py-3 font-medium hover:bg-accent-yellow/90 transition-colors duration-150 active:scale-[0.97] font-mono tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderRadius: 0 }}
                  >
                    {loading ? 'PLEASE WAIT...' : (mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT')}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
