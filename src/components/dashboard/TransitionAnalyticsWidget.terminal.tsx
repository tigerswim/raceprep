import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';
import { TerminalCard, SevenSegmentDisplay } from '../ui/terminal';

interface TransitionData {
  t1_time: string | null;
  t2_time: string | null;
  race_name: string;
  race_date: string;
  distance_type: string;
}

interface TransitionStats {
  avgT1Seconds: number;
  avgT2Seconds: number;
  bestT1Seconds: number;
  bestT2Seconds: number;
  totalT1Count: number;
  totalT2Count: number;
  t1Trend: 'improving' | 'stable' | 'declining';
  t2Trend: 'improving' | 'stable' | 'declining';
  recentRaces: TransitionData[];
}

/**
 * TransitionAnalyticsWidget - Terminal Design Version
 *
 * Displays T1/T2 transition analytics with 7-segment LED displays.
 * Features retro race timing aesthetic with monospace fonts.
 */
export const TransitionAnalyticsWidgetTerminal: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<TransitionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTransitionData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const timeToSeconds = (timeStr: string | null): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const secondsToTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const loadTransitionData = async () => {
    try {
      setIsLoading(true);

      const { data: results, error } = await dbHelpers.userRaceResults.getAll();

      if (error || !results || results.length === 0) {
        setStats(null);
        return;
      }

      const resultsWithTransitions = results.filter(r => r.t1_time || r.t2_time);

      if (resultsWithTransitions.length === 0) {
        setStats(null);
        return;
      }

      const t1Times = resultsWithTransitions
        .filter(r => r.t1_time)
        .map(r => timeToSeconds(r.t1_time));

      const t2Times = resultsWithTransitions
        .filter(r => r.t2_time)
        .map(r => timeToSeconds(r.t2_time));

      const avgT1 = t1Times.length > 0 ? t1Times.reduce((a, b) => a + b, 0) / t1Times.length : 0;
      const avgT2 = t2Times.length > 0 ? t2Times.reduce((a, b) => a + b, 0) / t2Times.length : 0;
      const bestT1 = t1Times.length > 0 ? Math.min(...t1Times) : 0;
      const bestT2 = t2Times.length > 0 ? Math.min(...t2Times) : 0;

      // Calculate trends
      const midpoint = Math.floor(t1Times.length / 2);
      const t1FirstHalf = t1Times.slice(0, midpoint);
      const t1SecondHalf = t1Times.slice(midpoint);
      const t2FirstHalf = t2Times.slice(0, midpoint);
      const t2SecondHalf = t2Times.slice(midpoint);

      const avgT1First = t1FirstHalf.length > 0 ? t1FirstHalf.reduce((a, b) => a + b, 0) / t1FirstHalf.length : 0;
      const avgT1Second = t1SecondHalf.length > 0 ? t1SecondHalf.reduce((a, b) => a + b, 0) / t1SecondHalf.length : 0;
      const avgT2First = t2FirstHalf.length > 0 ? t2FirstHalf.reduce((a, b) => a + b, 0) / t2FirstHalf.length : 0;
      const avgT2Second = t2SecondHalf.length > 0 ? t2SecondHalf.reduce((a, b) => a + b, 0) / t2SecondHalf.length : 0;

      const t1Trend = avgT1Second < avgT1First * 0.95 ? 'improving' : avgT1Second > avgT1First * 1.05 ? 'declining' : 'stable';
      const t2Trend = avgT2Second < avgT2First * 0.95 ? 'improving' : avgT2Second > avgT2First * 1.05 ? 'declining' : 'stable';

      setStats({
        avgT1Seconds: Math.round(avgT1),
        avgT2Seconds: Math.round(avgT2),
        bestT1Seconds: bestT1,
        bestT2Seconds: bestT2,
        totalT1Count: t1Times.length,
        totalT2Count: t2Times.length,
        t1Trend,
        t2Trend,
        recentRaces: resultsWithTransitions.slice(-5).reverse() as TransitionData[]
      });
    } catch (error) {
      console.error('Error loading transition data:', error);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendSymbol = (trend: string): string => {
    switch (trend) {
      case 'improving': return '↓';
      case 'declining': return '↑';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'improving': return 'text-discipline-run';
      case 'declining': return 'text-discipline-bike';
      default: return 'text-text-secondary';
    }
  };

  const getOptimizationTip = (): string | null => {
    if (!stats) return null;

    if (stats.avgT1Seconds > 120) {
      return 'T1 >2:00 - PRACTICE WETSUIT REMOVAL & BIKE MOUNT';
    }
    if (stats.avgT2Seconds > 90) {
      return 'T2 >1:30 - QUICK HELMET OFF, ELASTIC LACES RECOMMENDED';
    }
    if (stats.t1Trend === 'improving' && stats.t2Trend === 'improving') {
      return 'BOTH TRANSITIONS IMPROVING - KEEP UP THE PRACTICE!';
    }
    if (stats.avgT1Seconds < 90 && stats.avgT2Seconds < 60) {
      return 'EXCELLENT TRANSITIONS - SUB-90s T1, SUB-60s T2';
    }
    return null;
  };

  if (isLoading) {
    return (
      <TerminalCard>
        <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Transition Analytics
        </Text>
        <Text className="font-mono text-sm text-text-secondary">
          Loading transition data...
        </Text>
      </TerminalCard>
    );
  }

  if (!stats) {
    return (
      <TerminalCard>
        <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Transition Analytics
        </Text>
        <Text className="font-mono text-sm text-text-secondary text-center py-6">
          NO TRANSITION DATA
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/races')}
          className="bg-accent-yellow border-2 border-accent-yellow px-4 py-3"
          style={{ borderRadius: 0 }}
        >
          <Text className="font-mono font-semibold text-sm uppercase tracking-wider text-terminal-bg text-center">
            Add Results
          </Text>
        </TouchableOpacity>
      </TerminalCard>
    );
  }

  const tip = getOptimizationTip();

  return (
    <TerminalCard>
      {/* Header */}
      <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-6">
        Transition Analytics
      </Text>

      {/* 7-Segment Displays */}
      <View className="flex-row gap-3 mb-6">
        {/* T1 Display */}
        <View className="flex-1">
          <Text className="font-mono text-xs uppercase tracking-wider text-discipline-swim mb-2 text-center">
            T1 AVG
          </Text>
          <SevenSegmentDisplay
            value={secondsToTime(stats.avgT1Seconds)}
            color="text-discipline-swim"
            size="medium"
          />
          <View className="flex-row items-center justify-center mt-2">
            <Text className={`font-mono text-xs ${getTrendColor(stats.t1Trend)}`}>
              {getTrendSymbol(stats.t1Trend)} {stats.t1Trend.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* T2 Display */}
        <View className="flex-1">
          <Text className="font-mono text-xs uppercase tracking-wider text-discipline-run mb-2 text-center">
            T2 AVG
          </Text>
          <SevenSegmentDisplay
            value={secondsToTime(stats.avgT2Seconds)}
            color="text-discipline-run"
            size="medium"
          />
          <View className="flex-row items-center justify-center mt-2">
            <Text className={`font-mono text-xs ${getTrendColor(stats.t2Trend)}`}>
              {getTrendSymbol(stats.t2Trend)} {stats.t2Trend.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Best Times */}
      <View className="flex-row gap-3 mb-6">
        <View className="flex-1 bg-terminal-bg border border-terminal-border p-3" style={{ borderRadius: 0 }}>
          <Text className="font-mono text-xs text-text-secondary uppercase mb-1">
            T1 BEST
          </Text>
          <Text className="font-mono text-xl font-bold text-discipline-swim">
            {secondsToTime(stats.bestT1Seconds)}
          </Text>
        </View>
        <View className="flex-1 bg-terminal-bg border border-terminal-border p-3" style={{ borderRadius: 0 }}>
          <Text className="font-mono text-xs text-text-secondary uppercase mb-1">
            T2 BEST
          </Text>
          <Text className="font-mono text-xl font-bold text-discipline-run">
            {secondsToTime(stats.bestT2Seconds)}
          </Text>
        </View>
      </View>

      {/* Optimization Tip */}
      {tip && (
        <View className="bg-terminal-bg border-2 border-accent-yellow/40 p-3 mb-4" style={{ borderRadius: 0 }}>
          <Text className="font-mono text-xs text-accent-yellow">
            → {tip}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View className="pt-4 border-t border-terminal-border">
        <View className="flex-row items-center justify-between">
          <Text className="font-mono text-xs text-text-secondary uppercase">
            {stats.totalT1Count} T1 / {stats.totalT2Count} T2
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/races')}>
            <Text className="font-mono text-xs font-semibold text-accent-yellow uppercase tracking-wider">
              VIEW RACES →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TerminalCard>
  );
};
