import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';

interface TerminalButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

/**
 * TerminalButton - Button component for Split-Flap Terminal design system
 *
 * Features:
 * - Hard rectangles (no rounded corners)
 * - Three variants: primary, secondary, outline
 * - Monospace uppercase text
 * - Terminal color palette
 * - Disabled state support
 *
 * Usage:
 * <TerminalButton
 *   title="Submit"
 *   onPress={handleSubmit}
 * />
 *
 * <TerminalButton
 *   title="Cancel"
 *   variant="secondary"
 *   onPress={handleCancel}
 * />
 *
 * <TerminalButton
 *   title="Disabled"
 *   onPress={handleAction}
 *   disabled={true}
 * />
 */
export const TerminalButton: React.FC<TerminalButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  className = '',
  style
}) => {
  const variantClasses = {
    primary: 'bg-accent-yellow border-accent-yellow',
    secondary: 'bg-terminal-panel border-terminal-border',
    outline: 'bg-transparent border-accent-yellow/50'
  };

  const textClasses = {
    primary: 'text-terminal-bg',
    secondary: 'text-text-primary',
    outline: 'text-accent-yellow'
  };

  return (
    <TouchableOpacity
      className={`border-2 px-4 py-3 ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[{ borderRadius: 0 }, style]}
    >
      <Text className={`font-mono font-semibold text-sm uppercase tracking-wider ${textClasses[variant]} text-center`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
