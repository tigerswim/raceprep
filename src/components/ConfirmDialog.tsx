import React from 'react';

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
  if (!isOpen) return null;

  const getVariantColors = () => {
    if (variant === 'danger') {
      return {
        border: 'border-red-400/50',
        bg: 'bg-red-500/10',
        button: 'bg-red-500 hover:bg-red-600',
        text: 'text-red-300',
      };
    }
    if (variant === 'warning') {
      return {
        border: 'border-accent-yellow/50',
        bg: 'bg-yellow-500/10',
        button: 'bg-accent-yellow hover:bg-accent-yellow/90 text-terminal-bg',
        text: 'text-yellow-300',
      };
    }
    return {
      border: 'border-blue-400/50',
      bg: 'bg-blue-500/10',
      button: 'bg-accent-yellow hover:bg-accent-yellow/90 text-terminal-bg',
      text: 'text-blue-300',
    };
  };

  const colors = getVariantColors();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={`bg-terminal-panel border-2 ${colors.border} p-6 w-full max-w-md`}
        style={{ borderRadius: 0 }}
      >
        <h3 className="text-lg font-bold text-text-primary mb-4 font-mono tracking-wider">
          {title.toUpperCase()}
        </h3>

        <div
          className={`${colors.bg} border-2 ${colors.border} p-4 mb-6`}
          style={{ borderRadius: 0 }}
        >
          <p className={`${colors.text} text-sm font-mono`}>
            {message}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-terminal-panel text-text-secondary border-2 border-terminal-border py-3 font-medium hover:border-text-secondary hover:text-text-primary transition-colors font-mono tracking-wider"
            style={{ borderRadius: 0 }}
          >
            {cancelLabel.toUpperCase()}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 ${colors.button} py-3 font-medium transition-colors font-mono tracking-wider`}
            style={{ borderRadius: 0 }}
          >
            {confirmLabel.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};
