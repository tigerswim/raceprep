import React from 'react';
import { View, Text, ViewStyle } from 'react-native';

interface SevenSegmentDisplayProps {
  value: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: ViewStyle;
}

/**
 * SevenSegmentDisplay - LED-style 7-segment display for Split-Flap Terminal design
 *
 * Features:
 * - Monospace font with text shadow glow effect
 * - Displays time values in MM:SS format
 * - Customizable color (defaults to accent yellow)
 * - Three size options: small, medium, large
 *
 * Usage:
 * <SevenSegmentDisplay
 *   value="02:15"
 *   color="text-discipline-swim"
 *   size="medium"
 * />
 *
 * Design Notes:
 * - Uses monospace font with bold weight for LED effect
 * - Text shadow creates subtle glow
 * - Hard edges (borderRadius: 0) on container
 * - Background slightly darker than panel for depth
 */
export const SevenSegmentDisplay: React.FC<SevenSegmentDisplayProps> = ({
  value,
  color = 'text-accent-yellow',
  size = 'medium',
  className = '',
  style
}) => {
  const sizeClasses = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl'
  };

  const paddingClasses = {
    small: 'p-2',
    medium: 'p-3',
    large: 'p-4'
  };

  // Parse the value to separate minutes and seconds for better display
  const displayValue = value.includes(':') ? value : `${value}:00`;

  return (
    <View
      className={`bg-terminal-bg border border-terminal-border ${paddingClasses[size]} items-center justify-center ${className}`}
      style={[{ borderRadius: 0 }, style]}
    >
      <Text
        className={`font-mono font-bold ${sizeClasses[size]} ${color}`}
        style={{
          textShadowColor: 'currentColor',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10,
          letterSpacing: 4
        }}
      >
        {displayValue}
      </Text>
    </View>
  );
};
