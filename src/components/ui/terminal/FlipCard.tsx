import React from 'react';
import { View, Text, ViewStyle } from 'react-native';

interface FlipCardProps {
  value: string | number;
  label?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: ViewStyle;
}

/**
 * FlipCard - Airport departure board style flip card for Split-Flap Terminal design
 *
 * Features:
 * - Split display with horizontal divider line
 * - Monospace font for numeric display
 * - Glow effect on numbers
 * - Optional label below value
 * - Customizable color (defaults to accent yellow)
 *
 * Usage:
 * <FlipCard
 *   value="14"
 *   label="DAYS"
 *   color="text-accent-yellow"
 *   size="large"
 * />
 *
 * Design Notes:
 * - Mimics classic airport split-flap displays
 * - Horizontal line represents the mechanical split
 * - Text shadow creates subtle glow effect
 * - Hard edges (borderRadius: 0) throughout
 */
export const FlipCard: React.FC<FlipCardProps> = ({
  value,
  label,
  color = 'text-accent-yellow',
  size = 'medium',
  className = '',
  style
}) => {
  const sizeClasses = {
    small: { card: 'p-2', text: 'text-2xl', label: 'text-xs' },
    medium: { card: 'p-3', text: 'text-4xl', label: 'text-xs' },
    large: { card: 'p-4', text: 'text-6xl', label: 'text-sm' }
  };

  const displayValue = String(value).padStart(2, '0');

  return (
    <View className={className} style={style}>
      {/* Flip Card Display */}
      <View
        className={`bg-terminal-bg border-2 border-terminal-border ${sizeClasses[size].card} items-center justify-center relative`}
        style={{ borderRadius: 0 }}
      >
        {/* Value */}
        <Text
          className={`font-mono font-bold ${sizeClasses[size].text} ${color}`}
          style={{
            textShadowColor: 'currentColor',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
            letterSpacing: 2
          }}
        >
          {displayValue}
        </Text>

        {/* Horizontal divider line (represents flip mechanism) */}
        <View
          className="absolute left-0 right-0 border-t border-terminal-border"
          style={{
            top: '50%',
            opacity: 0.3
          }}
        />
      </View>

      {/* Label */}
      {label && (
        <Text className={`font-mono ${sizeClasses[size].label} text-text-secondary text-center mt-2 uppercase tracking-wider`}>
          {label}
        </Text>
      )}
    </View>
  );
};
