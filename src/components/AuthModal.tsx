import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTerminalModeToggle } from '../hooks/useTerminalModeToggle';
import { getTerminalModeState } from '../utils/featureFlags';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();

  // Terminal mode
  useTerminalModeToggle();
  const [useTerminal, setUseTerminal] = useState(() => {
    const override = getTerminalModeState();
    if (override !== false) return override;
    return true; // Terminal mode is enabled in featureFlags.ts
  });

  // Listen for terminal mode changes
  useEffect(() => {
    const handleTerminalModeChange = () => {
      setUseTerminal(getTerminalModeState());
    };
    if (typeof window !== "undefined") {
      window.addEventListener("terminalModeChanged", handleTerminalModeChange);
      return () => {
        window.removeEventListener("terminalModeChanged", handleTerminalModeChange);
      };
    }
  }, []);

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
        // Success - close modal
        onClose();
        setEmail('');
        setPassword('');
        setName('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={useTerminal ?
          "bg-terminal-panel border-2 border-terminal-border max-w-md w-full" :
          "bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full"
        }
        style={useTerminal ? { borderRadius: 0 } : undefined}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={useTerminal ?
              "text-xl font-bold text-text-primary font-mono tracking-wider" :
              "text-2xl font-bold text-white"
            }>
              {useTerminal ?
                (mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT') :
                (mode === 'signin' ? 'Sign In' : 'Create Account')
              }
            </h2>
            <button
              onClick={onClose}
              className={useTerminal ?
                "text-text-secondary hover:text-text-primary text-2xl font-mono" :
                "text-white/70 hover:text-white text-2xl"
              }
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <div
              className={useTerminal ?
                "flex gap-2" :
                "flex rounded-xl bg-white/10 p-1"
              }
            >
              <button
                onClick={() => setMode('signin')}
                className={useTerminal ?
                  `flex-1 py-2 px-4 text-xs font-medium transition-all font-mono tracking-wider ${
                    mode === 'signin'
                      ? 'bg-accent-yellow text-terminal-bg'
                      : 'bg-terminal-panel text-text-secondary border-2 border-terminal-border hover:border-text-secondary hover:text-text-primary'
                  }` :
                  `flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    mode === 'signin'
                      ? 'bg-blue-500/30 text-blue-300'
                      : 'text-white/70 hover:text-white'
                  }`
                }
                style={useTerminal ? { borderRadius: 0 } : undefined}
              >
                {useTerminal ? 'SIGN IN' : 'Sign In'}
              </button>
              <button
                onClick={() => setMode('signup')}
                className={useTerminal ?
                  `flex-1 py-2 px-4 text-xs font-medium transition-all font-mono tracking-wider ${
                    mode === 'signup'
                      ? 'bg-accent-yellow text-terminal-bg'
                      : 'bg-terminal-panel text-text-secondary border-2 border-terminal-border hover:border-text-secondary hover:text-text-primary'
                  }` :
                  `flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    mode === 'signup'
                      ? 'bg-blue-500/30 text-blue-300'
                      : 'text-white/70 hover:text-white'
                  }`
                }
                style={useTerminal ? { borderRadius: 0 } : undefined}
              >
                {useTerminal ? 'SIGN UP' : 'Sign Up'}
              </button>
            </div>
          </div>

          {error && (
            <div
              className={useTerminal ?
                "mb-4 p-3 bg-red-500/20 border-2 border-red-400/30" :
                "mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl"
              }
              style={useTerminal ? { borderRadius: 0 } : undefined}
            >
              <p className={useTerminal ?
                "text-red-300 text-xs font-mono" :
                "text-red-300 text-sm"
              }>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className={useTerminal ?
                  "block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase" :
                  "block text-white/80 text-sm font-medium mb-2"
                }>
                  {useTerminal ? 'FULL NAME' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={useTerminal ?
                    "w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono" :
                    "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  }
                  style={useTerminal ? { borderRadius: 0 } : undefined}
                  placeholder={useTerminal ? "ENTER YOUR FULL NAME" : "Enter your full name"}
                  required={mode === 'signup'}
                />
              </div>
            )}

            <div>
              <label className={useTerminal ?
                "block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase" :
                "block text-white/80 text-sm font-medium mb-2"
              }>
                {useTerminal ? 'EMAIL' : 'Email'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={useTerminal ?
                  "w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono" :
                  "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                }
                style={useTerminal ? { borderRadius: 0 } : undefined}
                placeholder={useTerminal ? "ENTER YOUR EMAIL" : "Enter your email"}
                required
              />
            </div>

            <div>
              <label className={useTerminal ?
                "block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase" :
                "block text-white/80 text-sm font-medium mb-2"
              }>
                {useTerminal ? 'PASSWORD' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={useTerminal ?
                  "w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono" :
                  "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                }
                style={useTerminal ? { borderRadius: 0 } : undefined}
                placeholder={useTerminal ? "ENTER YOUR PASSWORD" : "Enter your password"}
                required
                minLength={6}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className={useTerminal ?
                  "flex-1 bg-accent-yellow text-terminal-bg px-6 py-3 font-medium hover:bg-accent-yellow/90 transition-all font-mono tracking-wider disabled:opacity-50 disabled:cursor-not-allowed" :
                  "flex-1 bg-gradient-to-r from-blue-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                }
                style={useTerminal ? { borderRadius: 0 } : undefined}
              >
                {loading ?
                  (useTerminal ? 'PLEASE WAIT...' : 'Please wait...') :
                  (mode === 'signin' ?
                    (useTerminal ? 'SIGN IN' : 'Sign In') :
                    (useTerminal ? 'CREATE ACCOUNT' : 'Create Account')
                  )
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};