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
 * UPDATED FOR WEB: Uses inline styles instead of Tailwind classes
 * since NativeWind className props don't work reliably on web.
 *
 * Features:
 * - Hard rectangles (no rounded corners)
 * - Terminal color palette
 * - Two variants: default and highlighted
 *
 * Usage:
 * <TerminalCard>
 *   <Text style={{ fontFamily: 'monospace', color: '#F8F8F2' }}>Content</Text>
 * </TerminalCard>
 *
 * <TerminalCard variant="highlighted">
 *   <Text style={{ fontFamily: 'monospace', color: '#F8F8F2' }}>Highlighted content</Text>
 * </TerminalCard>
 */
export const TerminalCard: React.FC<TerminalCardProps> = ({
  children,
  variant = 'default',
  className = '',
  style
}) => {
  // Terminal color palette (matching tailwind.config.js)
  const colors = {
    panel: '#0F1419',
    border: '#1C2127',
    borderHighlight: 'rgba(255, 216, 102, 0.3)', // accent-yellow/30
  };

  const variantStyles: ViewStyle = variant === 'highlighted'
    ? {
        backgroundColor: colors.panel,
        borderColor: colors.borderHighlight,
      }
    : {
        backgroundColor: colors.panel,
        borderColor: colors.border,
      };

  return (
    <View
      style={[
        {
          borderWidth: 2,
          borderRadius: 0, // Hard edges
          padding: 20,
        },
        variantStyles,
        style
      ]}
    >
      {children}
    </View>
  );
};
