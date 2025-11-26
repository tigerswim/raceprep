import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';
import { terminalColors, terminalText, terminalView, mergeStyles } from '../ui/terminal/terminalStyles';

interface TransitionStats {
  avgT1: string;
  avgT2: string;
  bestT1: string;
  bestT2: string;
  count: number;
}

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

  const loadTransitionData = async () => {
    try {
      setIsLoading(true);
      const { data: results, error } = await dbHelpers.userRaceResults.getAll();

      if (error || !results) {
        setStats(null);
        return;
      }

      const resultsWithTransitions = results.filter((r: any) => r.t1_time || r.t2_time);

      if (resultsWithTransitions.length === 0) {
        setStats(null);
        return;
      }

      const t1Times = resultsWithTransitions
        .filter((r: any) => r.t1_time)
        .map((r: any) => timeToSeconds(r.t1_time));

      const t2Times = resultsWithTransitions
        .filter((r: any) => r.t2_time)
        .map((r: any) => timeToSeconds(r.t2_time));

      const avgT1 = t1Times.length > 0 ? Math.round(t1Times.reduce((a, b) => a + b, 0) / t1Times.length) : 0;
      const avgT2 = t2Times.length > 0 ? Math.round(t2Times.reduce((a, b) => a + b, 0) / t2Times.length) : 0;
      const bestT1 = t1Times.length > 0 ? Math.min(...t1Times) : 0;
      const bestT2 = t2Times.length > 0 ? Math.min(...t2Times) : 0;

      setStats({
        avgT1: secondsToTime(avgT1),
        avgT2: secondsToTime(avgT2),
        bestT1: secondsToTime(bestT1),
        bestT2: secondsToTime(bestT2),
        count: resultsWithTransitions.length
      });
    } catch (error) {
      console.error('Error loading transition data:', error);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const timeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const secondsToTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <View style={terminalView.card}>
        <Text style={terminalText.header}>Transition Analytics</Text>
        <Text style={mergeStyles(terminalText.secondary, { marginTop: 16 })}>
          Loading transition data...
        </Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={terminalView.card}>
        <Text style={terminalText.header}>Transition Analytics</Text>
        <Text style={mergeStyles(terminalText.secondary, { marginTop: 16, textAlign: 'center' })}>
          NO TRANSITION DATA
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/races')}
          style={{ backgroundColor: terminalColors.yellow, padding: 12, marginTop: 16 }}
        >
          <Text style={mergeStyles(terminalText.small, { color: terminalColors.bg, textAlign: 'center', fontWeight: 'bold' })}>
            ADD RESULTS
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={terminalView.card}>
      {/* Header */}
      <View style={terminalView.spaceBetween}>
        <View>
          <Text style={terminalText.header}>Transition Analytics</Text>
          <Text style={mergeStyles(terminalText.small, { marginTop: 4 })}>
            {stats.count} RACES ANALYZED
          </Text>
        </View>
      </View>

      {/* Transition Times */}
      <View style={{ flexDirection: 'row', marginTop: 24, gap: 12 }}>
        {/* T1 */}
        <View style={{ flex: 1, backgroundColor: terminalColors.bg, borderWidth: 2, borderColor: terminalColors.swim, padding: 16 }}>
          <Text style={mergeStyles(terminalText.swim, { fontSize: 10, marginBottom: 8 })}>
            [T1] SWIM→BIKE
          </Text>
          <Text style={mergeStyles(terminalText.xlarge, { marginBottom: 12 })}>
            {stats.avgT1}
          </Text>
          <Text style={terminalText.small}>
            AVG • BEST: {stats.bestT1}
          </Text>
        </View>

        {/* T2 */}
        <View style={{ flex: 1, backgroundColor: terminalColors.bg, borderWidth: 2, borderColor: terminalColors.bike, padding: 16 }}>
          <Text style={mergeStyles(terminalText.bike, { fontSize: 10, marginBottom: 8 })}>
            [T2] BIKE→RUN
          </Text>
          <Text style={mergeStyles(terminalText.xlarge, { marginBottom: 12 })}>
            {stats.avgT2}
          </Text>
          <Text style={terminalText.small}>
            AVG • BEST: {stats.bestT2}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={mergeStyles(terminalView.borderTop, { marginTop: 24 })}>
        <View style={terminalView.spaceBetween}>
          <Text style={terminalText.small}>
            TRANSITION PERFORMANCE
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/races')}>
            <Text style={terminalText.yellow}>RESULTS →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
