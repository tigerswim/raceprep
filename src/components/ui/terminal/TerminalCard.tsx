import React from 'react';
import { View, ViewStyle } from 'react-native';

interface TerminalCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'highlighted';
  className?: string;
  style?: ViewStyle;
}

/**
 * TerminalCard - Base card component for Split-Flap Terminal design system
 *
 * Features:
 * - Hard rectangles (no rounded corners)
 * - Terminal color palette
 * - Two variants: default and highlighted
 * - NativeWind styling support
 *
 * Usage:
 * <TerminalCard>
 *   <Text className="font-mono text-text-primary">Content</Text>
 * </TerminalCard>
 *
 * <TerminalCard variant="highlighted">
 *   <Text className="font-mono text-text-primary">Highlighted content</Text>
 * </TerminalCard>
 */
export const TerminalCard: React.FC<TerminalCardProps> = ({
  children,
  variant = 'default',
  className = '',
  style
}) => {
  const variantClasses = {
    default: 'bg-terminal-panel border-terminal-border',
    highlighted: 'bg-terminal-panel border-accent-yellow/30'
  };

  return (
    <View
      className={`border-2 p-5 ${variantClasses[variant]} ${className}`}
      style={[{ borderRadius: 0 }, style]}
    >
      {children}
    </View>
  );
};
