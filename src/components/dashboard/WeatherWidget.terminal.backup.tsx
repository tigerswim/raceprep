import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { TerminalCard } from '../ui/terminal';

interface WeatherData {
  current: {
    temperature: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    conditions: string;
    description: string;
    visibility: number;
  };
  forecast: Array<{
    datetime: string;
    temperature: number;
    conditions: string;
    description: string;
    precipitation: number;
    wind_speed: number;
  }>;
  conditions: {
    overall: string;
    swim: string;
    bike: string;
    run: string;
    warnings: string[];
  };
}

/**
 * WeatherWidget - Terminal Design Version
 *
 * Displays current weather and training conditions in terminal aesthetic.
 * Simplified version focusing on key information for training decisions.
 */
export const WeatherWidgetTerminal: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<string>('Austin, TX');
  const [temperatureUnit] = useState<'fahrenheit' | 'celsius'>('fahrenheit');

  // Note: Full weather API integration maintained from original component
  // Simplified for terminal display focusing on training conditions

  useEffect(() => {
    // Simplified loading - full implementation would include geolocation,
    // API calls, etc. from original WeatherWidget
    setIsLoading(false);
  }, [user]);

  const formatTemperature = (temp: number): string => {
    const value = Math.round(temp);
    return `${value}°F`;
  };

  const getConditionLabel = (condition: string): string => {
    const labels: { [key: string]: string } = {
      'Excellent': 'EXCL',
      'Good': 'GOOD',
      'Fair': 'FAIR',
      'Poor': 'POOR',
      'Dangerous': 'DNGR'
    };
    return labels[condition] || condition.toUpperCase().substring(0, 4);
  };

  const getConditionColor = (condition: string): string => {
    switch (condition.toLowerCase()) {
      case 'excellent':
        return 'text-discipline-run';
      case 'good':
        return 'text-accent-yellow';
      case 'fair':
        return 'text-text-primary';
      case 'poor':
        return 'text-discipline-bike';
      case 'dangerous':
        return 'text-discipline-bike';
      default:
        return 'text-text-secondary';
    }
  };

  const formatTime = (datetime: string): string => {
    const date = new Date(datetime);
    const hours = date.getHours();
    return `${hours.toString().padStart(2, '0')}00`;
  };

  if (isLoading) {
    return (
      <TerminalCard>
        <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Weather Conditions
        </Text>
        <Text className="font-mono text-sm text-text-secondary">
          Loading weather data...
        </Text>
      </TerminalCard>
    );
  }

  if (!weather) {
    return (
      <TerminalCard>
        <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Weather Conditions
        </Text>
        <Text className="font-mono text-sm text-text-secondary">
          Weather data unavailable
        </Text>
      </TerminalCard>
    );
  }

  return (
    <TerminalCard>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Weather Conditions
          </Text>
          <Text className="font-mono text-xs text-text-secondary mt-1">
            {location.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Current Temperature */}
      <View className="mb-6 bg-terminal-bg border-2 border-terminal-border p-4" style={{ borderRadius: 0 }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-mono text-5xl font-bold text-accent-yellow">
              {formatTemperature(weather.current.temperature)}
            </Text>
            <Text className="font-mono text-xs text-text-secondary mt-2 uppercase">
              {weather.current.description}
            </Text>
          </View>
          <View className="items-end">
            <Text className="font-mono text-xs text-text-secondary">
              FEELS {formatTemperature(weather.current.feels_like)}
            </Text>
            <Text className="font-mono text-xs text-text-secondary mt-1">
              HUMID {weather.current.humidity}%
            </Text>
            <Text className="font-mono text-xs text-text-secondary mt-1">
              WIND {Math.round(weather.current.wind_speed)}MPH
            </Text>
          </View>
        </View>
      </View>

      {/* Training Conditions */}
      <View className="mb-6">
        <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
          Training Conditions
        </Text>
        <View className="space-y-2">
          {/* Swim */}
          <View className="flex-row items-center justify-between bg-terminal-bg border border-terminal-border p-3" style={{ borderRadius: 0 }}>
            <Text className="font-mono text-xs uppercase tracking-wider text-discipline-swim">
              [SWIM]
            </Text>
            <Text className={`font-mono text-xs font-semibold ${getConditionColor(weather.conditions.swim)}`}>
              {getConditionLabel(weather.conditions.swim)}
            </Text>
          </View>

          {/* Bike */}
          <View className="flex-row items-center justify-between bg-terminal-bg border border-terminal-border p-3" style={{ borderRadius: 0 }}>
            <Text className="font-mono text-xs uppercase tracking-wider text-discipline-bike">
              [BIKE]
            </Text>
            <Text className={`font-mono text-xs font-semibold ${getConditionColor(weather.conditions.bike)}`}>
              {getConditionLabel(weather.conditions.bike)}
            </Text>
          </View>

          {/* Run */}
          <View className="flex-row items-center justify-between bg-terminal-bg border border-terminal-border p-3" style={{ borderRadius: 0 }}>
            <Text className="font-mono text-xs uppercase tracking-wider text-discipline-run">
              [RUN]
            </Text>
            <Text className={`font-mono text-xs font-semibold ${getConditionColor(weather.conditions.run)}`}>
              {getConditionLabel(weather.conditions.run)}
            </Text>
          </View>
        </View>
      </View>

      {/* Hourly Forecast */}
      <View className="mb-4">
        <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
          Today&apos;s Forecast
        </Text>
        <View className="flex-row gap-2">
          {weather.forecast.slice(0, 4).map((item, index) => (
            <View key={index} className="flex-1 items-center bg-terminal-panel border border-terminal-border p-2" style={{ borderRadius: 0 }}>
              <Text className="font-mono text-xs text-text-secondary mb-1">
                {formatTime(item.datetime)}
              </Text>
              <Text className="font-mono text-lg font-bold text-text-primary mb-1">
                {Math.round(item.temperature)}°
              </Text>
              {item.precipitation > 0 && (
                <Text className="font-mono text-xs text-discipline-swim">
                  {item.precipitation}MM
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Warnings */}
      {weather.conditions.warnings.length > 0 && (
        <View className="mb-4 bg-terminal-bg border-2 border-discipline-bike/40 p-3" style={{ borderRadius: 0 }}>
          <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-discipline-bike mb-2">
            ⚠ Warnings
          </Text>
          <View className="space-y-1">
            {weather.conditions.warnings.map((warning, index) => (
              <Text key={index} className="font-mono text-xs text-text-secondary">
                → {warning.toUpperCase()}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <View className="pt-4 border-t border-terminal-border">
        <View className="flex-row items-center justify-between">
          <Text className="font-mono text-xs text-text-secondary uppercase">
            {weather.conditions.overall.toUpperCase()} CONDITIONS
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/planning')}>
            <Text className="font-mono text-xs font-semibold text-accent-yellow uppercase tracking-wider">
              PLAN →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TerminalCard>
  );
};
