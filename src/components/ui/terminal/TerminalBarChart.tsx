import React from 'react';
import { View, Text, ViewStyle } from 'react-native';

interface BarData {
  label: string;
  swim?: number;
  bike?: number;
  run?: number;
  total: number;
}

interface TerminalBarChartProps {
  data: BarData[];
  maxValue?: number;
  height?: number;
  stacked?: boolean;
  showValues?: boolean;
  className?: string;
  style?: ViewStyle;
}

/**
 * TerminalBarChart - Horizontal bar chart for Split-Flap Terminal design
 *
 * Features:
 * - Horizontal bars with hard edges (borderRadius: 0)
 * - Stacked swim/bike/run data support
 * - Day labels on left side
 * - Discipline colors (swim=cyan, bike=coral, run=turquoise)
 * - Monospace value labels
 *
 * Usage:
 * <TerminalBarChart
 *   data={[
 *     { label: 'Mon', swim: 30, bike: 60, run: 45, total: 135 },
 *     { label: 'Tue', swim: 0, bike: 90, run: 30, total: 120 },
 *   ]}
 *   stacked={true}
 *   height={120}
 * />
 *
 * Design Notes:
 * - Bars are horizontal (better for day labels)
 * - Stacked mode shows swim/bike/run segments
 * - Non-stacked mode shows total only
 * - Hard edges (borderRadius: 0) throughout
 */
export const TerminalBarChart: React.FC<TerminalBarChartProps> = ({
  data,
  maxValue,
  height = 120,
  stacked = false,
  showValues = false,
  className = '',
  style
}) => {
  // Calculate max value if not provided
  const max = maxValue || Math.max(...data.map(d => d.total), 1);

  // Bar height
  const barHeight = Math.floor((height - 20) / data.length) - 4;

  const getBarWidth = (value: number): string => {
    return `${(value / max) * 100}%`;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }
    return minutes > 0 ? `${minutes}m` : '0m';
  };

  return (
    <View className={className} style={[{ height }, style]}>
      {data.map((item, index) => (
        <View key={index} className="flex-row items-center mb-1">
          {/* Label */}
          <Text className="font-mono text-xs text-text-secondary uppercase w-12">
            {item.label}
          </Text>

          {/* Bar Container */}
          <View className="flex-1 flex-row items-center">
            {stacked ? (
              // Stacked bars showing swim/bike/run
              <View className="flex-1 flex-row h-full">
                {/* Swim segment */}
                {item.swim && item.swim > 0 && (
                  <View
                    className="bg-discipline-swim"
                    style={{
                      width: getBarWidth(item.swim),
                      height: barHeight,
                      borderRadius: 0
                    }}
                  />
                )}

                {/* Bike segment */}
                {item.bike && item.bike > 0 && (
                  <View
                    className="bg-discipline-bike"
                    style={{
                      width: getBarWidth(item.bike),
                      height: barHeight,
                      borderRadius: 0
                    }}
                  />
                )}

                {/* Run segment */}
                {item.run && item.run > 0 && (
                  <View
                    className="bg-discipline-run"
                    style={{
                      width: getBarWidth(item.run),
                      height: barHeight,
                      borderRadius: 0
                    }}
                  />
                )}
              </View>
            ) : (
              // Single bar showing total
              <View
                className="bg-accent-yellow"
                style={{
                  width: getBarWidth(item.total),
                  height: barHeight,
                  borderRadius: 0
                }}
              />
            )}

            {/* Value label */}
            {showValues && (
              <Text className="font-mono text-xs text-text-secondary ml-2 w-16">
                {formatTime(item.total)}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};
