import { logger } from '../../utils/logger';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';
import { terminalColors, terminalText, terminalView, mergeStyles } from '../ui/terminal/terminalStyles';

interface PersonalBest {
  distance_type: string;
  time: string;
  race_name: string;
  race_date: string;
}

export const PersonalBestsWidgetTerminal: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [personalBests, setPersonalBests] = useState<PersonalBest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPersonalBests();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadPersonalBests = async () => {
    try {
      setIsLoading(true);
      const { data: results, error } = await dbHelpers.userRaceResults.getAll();

      if (error || !results) {
        setPersonalBests([]);
        return;
      }

      const bestsByDistance: { [key: string]: PersonalBest } = {};

      results.forEach((result: any) => {
        const distanceType = result.distance_type;
        const time = result.total_time;

        if (!distanceType || !time) return;

        const existing = bestsByDistance[distanceType];
        if (!existing || time < existing.time) {
          bestsByDistance[distanceType] = {
            distance_type: distanceType,
            time: time,
            race_name: result.race_name || 'Unknown Race',
            race_date: result.race_date || ''
          };
        }
      });

      const bests = Object.values(bestsByDistance)
        .sort((a, b) => {
          const order = ['sprint', 'olympic', '70.3', 'ironman'];
          return order.indexOf(a.distance_type) - order.indexOf(b.distance_type);
        });

      setPersonalBests(bests);
    } catch (error) {
      logger.error('Error loading personal bests:', error);
      setPersonalBests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeStr: string): string => {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      return `${parts[0]}:${parts[1]}:${parts[2]}`;
    }
    return timeStr;
  };

  const getDistanceLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      'sprint': 'SPRINT',
      'olympic': 'OLYMPIC',
      '70.3': 'HALF IRON',
      'ironman': 'FULL IRON'
    };
    return labels[type] || type.toUpperCase();
  };

  if (isLoading) {
    return (
      <View style={terminalView.card}>
        <Text style={terminalText.header}>Personal Bests</Text>
        <Text style={mergeStyles(terminalText.secondary, { marginTop: 16 })}>
          Loading personal records...
        </Text>
      </View>
    );
  }

  if (personalBests.length === 0) {
    return (
      <View style={terminalView.card}>
        <Text style={terminalText.header}>Personal Bests</Text>
        <Text style={mergeStyles(terminalText.secondary, { marginTop: 16, textAlign: 'center' })}>
          NO RACE RESULTS YET
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
          <Text style={terminalText.header}>Personal Bests</Text>
          <Text style={mergeStyles(terminalText.small, { marginTop: 4 })}>
            {personalBests.length} RECORDS
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/races')}>
          <Text style={terminalText.yellow}>VIEW ALL →</Text>
        </TouchableOpacity>
      </View>

      {/* Personal Bests List */}
      <View style={{ marginTop: 24, gap: 8 }}>
        {personalBests.map((pb, index) => (
          <View key={index} style={mergeStyles(terminalView.panel, { padding: 12 })}>
            <View style={terminalView.spaceBetween}>
              <Text style={mergeStyles(terminalText.swim, { fontSize: 10 })}>
                [{getDistanceLabel(pb.distance_type)}]
              </Text>
              <Text style={mergeStyles(terminalText.large, { fontSize: 20 })}>
                {formatTime(pb.time)}
              </Text>
            </View>
            <Text style={mergeStyles(terminalText.small, { marginTop: 8 })}>
              {pb.race_name}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={mergeStyles(terminalView.borderTop, { marginTop: 16 })}>
        <View style={terminalView.spaceBetween}>
          <Text style={terminalText.small}>
            FASTEST TIMES
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/races')}>
            <Text style={terminalText.yellow}>RESULTS →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
