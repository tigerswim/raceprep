import React from 'react';
import { useTerminalModeToggle } from '../hooks/useTerminalModeToggle';
import { getTerminalModeState } from '../utils/featureFlags';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info',
}) => {
  // Terminal mode
  useTerminalModeToggle();
  const [useTerminal] = React.useState(() => {
    const override = getTerminalModeState();
    if (override !== false) return override;
    return true;
  });

  if (!isOpen) return null;

  const getVariantColors = () => {
    if (variant === 'danger') {
      return {
        border: useTerminal ? 'border-red-400/50' : 'border-red-500/30',
        bg: useTerminal ? 'bg-red-500/10' : 'bg-red-500/20',
        button: useTerminal ? 'bg-red-500 hover:bg-red-600' : 'bg-red-500 hover:bg-red-600',
        text: useTerminal ? 'text-red-300' : 'text-red-300',
      };
    }
    if (variant === 'warning') {
      return {
        border: useTerminal ? 'border-accent-yellow/50' : 'border-yellow-500/30',
        bg: useTerminal ? 'bg-yellow-500/10' : 'bg-yellow-500/20',
        button: useTerminal ? 'bg-accent-yellow hover:bg-accent-yellow/90 text-terminal-bg' : 'bg-yellow-500 hover:bg-yellow-600',
        text: useTerminal ? 'text-yellow-300' : 'text-yellow-300',
      };
    }
    return {
      border: useTerminal ? 'border-blue-400/50' : 'border-blue-500/30',
      bg: useTerminal ? 'bg-blue-500/10' : 'bg-blue-500/20',
      button: useTerminal ? 'bg-accent-yellow hover:bg-accent-yellow/90 text-terminal-bg' : 'bg-blue-500 hover:bg-blue-600',
      text: useTerminal ? 'text-blue-300' : 'text-blue-300',
    };
  };

  const colors = getVariantColors();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={useTerminal ?
          `bg-terminal-panel border-2 ${colors.border} p-6 w-full max-w-md` :
          `bg-slate-800 rounded-2xl border ${colors.border} p-6 w-full max-w-md`
        }
        style={useTerminal ? { borderRadius: 0 } : undefined}
      >
        <h3 className={useTerminal ?
          "text-lg font-bold text-text-primary mb-4 font-mono tracking-wider" :
          "text-xl font-bold text-white mb-4"
        }>
          {useTerminal ? title.toUpperCase() : title}
        </h3>

        <div
          className={useTerminal ?
            `${colors.bg} border-2 ${colors.border} p-4 mb-6` :
            `${colors.bg} rounded-xl p-4 mb-6`
          }
          style={useTerminal ? { borderRadius: 0 } : undefined}
        >
          <p className={useTerminal ?
            `${colors.text} text-sm font-mono` :
            `${colors.text} text-sm`
          }>
            {message}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={useTerminal ?
              "flex-1 bg-terminal-panel text-text-secondary border-2 border-terminal-border py-3 font-medium hover:border-text-secondary hover:text-text-primary transition-colors font-mono tracking-wider" :
              "flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-colors"
            }
            style={useTerminal ? { borderRadius: 0 } : undefined}
          >
            {useTerminal ? cancelLabel.toUpperCase() : cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={useTerminal ?
              `flex-1 ${colors.button} py-3 font-medium transition-colors font-mono tracking-wider` :
              `flex-1 ${colors.button} text-white py-3 rounded-xl font-medium transition-colors`
            }
            style={useTerminal ? { borderRadius: 0 } : undefined}
          >
            {useTerminal ? confirmLabel.toUpperCase() : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
