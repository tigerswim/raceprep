import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Reset mode when modal opens with new initialMode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (mode === 'signin') {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, { name });
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        // Success - close modal and navigate to Dashboard
        onClose();
        setEmail('');
        setPassword('');
        setName('');
        // Redirect to Dashboard after successful sign-in
        router.replace('/');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-terminal-panel border-2 border-terminal-border max-w-md w-full" style={{ borderRadius: 0 }}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-primary font-mono tracking-wider">
              {mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-2xl font-mono"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 px-4 text-xs font-medium transition-all font-mono tracking-wider ${
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
                className={`flex-1 py-2 px-4 text-xs font-medium transition-all font-mono tracking-wider ${
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
              <p className="text-red-300 text-xs font-mono">
                {error}
              </p>
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
                  className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
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
                className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
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
                className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono"
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
                className="flex-1 bg-accent-yellow text-terminal-bg px-6 py-3 font-medium hover:bg-accent-yellow/90 transition-all font-mono tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderRadius: 0 }}
              >
                {loading ? 'PLEASE WAIT...' : (mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};