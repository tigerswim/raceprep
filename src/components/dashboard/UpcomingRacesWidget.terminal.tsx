import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';
import { terminalColors, terminalText, terminalView, mergeStyles } from '../ui/terminal/terminalStyles';

interface UpcomingRace {
  id: string;
  name: string;
  date: string;
  location: string;
  distance_type: string;
  status: string;
  daysUntil: number;
}

export const UpcomingRacesWidgetTerminal: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [upcomingRaces, setUpcomingRaces] = useState<UpcomingRace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUpcomingRaces();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadUpcomingRaces = async () => {
    try {
      setIsLoading(true);
      const { data: races, error } = await dbHelpers.userPlannedRaces?.getAll();

      if (error || !races) {
        setUpcomingRaces([]);
        return;
      }

      const now = new Date();
      const processedRaces = races
        .filter((r: any) => new Date(r.race_date || r.external_races?.date || '') >= now)
        .map((r: any) => {
          const raceDate = new Date(r.race_date || r.external_races?.date || '');
          const daysUntil = Math.ceil((raceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          return {
            id: r.id,
            name: r.race_name || r.external_races?.name || 'Unnamed Race',
            date: r.race_date || r.external_races?.date || '',
            location: r.external_races?.location || '',
            distance_type: r.external_races?.distance_type || '',
            status: r.status || 'interested',
            daysUntil
          };
        })
        .sort((a: any, b: any) => a.daysUntil - b.daysUntil)
        .slice(0, 5);

      setUpcomingRaces(processedRaces);
    } catch (error) {
      console.error('Error loading upcoming races:', error);
      setUpcomingRaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'registered': return terminalColors.run;
      case 'training': return terminalColors.yellow;
      default: return terminalColors.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <View style={terminalView.card}>
        <Text style={terminalText.header}>Upcoming Races</Text>
        <Text style={mergeStyles(terminalText.secondary, { marginTop: 16 })}>
          Loading races...
        </Text>
      </View>
    );
  }

  if (upcomingRaces.length === 0) {
    return (
      <View style={terminalView.card}>
        <Text style={terminalText.header}>Upcoming Races</Text>
        <Text style={mergeStyles(terminalText.secondary, { marginTop: 16, textAlign: 'center' })}>
          NO UPCOMING RACES
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/races')}
          style={{ backgroundColor: terminalColors.yellow, padding: 12, marginTop: 16 }}
        >
          <Text style={mergeStyles(terminalText.small, { color: terminalColors.bg, textAlign: 'center', fontWeight: 'bold' })}>
            FIND RACES
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
          <Text style={terminalText.header}>Upcoming Races</Text>
          <Text style={mergeStyles(terminalText.small, { marginTop: 4 })}>
            {upcomingRaces.length} SCHEDULED
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/races')}>
          <Text style={terminalText.yellow}>VIEW ALL →</Text>
        </TouchableOpacity>
      </View>

      {/* Races List */}
      <View style={{ marginTop: 24, gap: 8 }}>
        {upcomingRaces.map((race) => (
          <View key={race.id} style={mergeStyles(terminalView.panel, { padding: 12 })}>
            <View style={terminalView.spaceBetween}>
              <View style={{ flex: 1 }}>
                <Text style={mergeStyles(terminalText.primary, { fontSize: 12, fontWeight: '600' })}>
                  {race.name}
                </Text>
                <Text style={mergeStyles(terminalText.small, { marginTop: 4 })}>
                  {race.distance_type ? `[${race.distance_type.toUpperCase()}]` : ''} {race.location}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
                <Text style={mergeStyles(terminalText.large, { fontSize: 18, color: terminalColors.yellow })}>
                  {race.daysUntil}
                </Text>
                <Text style={mergeStyles(terminalText.small, { marginTop: 2 })}>
                  DAYS
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={mergeStyles(terminalText.small, { color: getStatusColor(race.status), fontWeight: '600' })}>
                {race.status.toUpperCase()}
              </Text>
              <Text style={terminalText.small}>
                {formatDate(race.date)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={mergeStyles(terminalView.borderTop, { marginTop: 16 })}>
        <View style={terminalView.spaceBetween}>
          <Text style={terminalText.small}>
            NEXT: {upcomingRaces[0]?.name.substring(0, 20)}...
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/races')}>
            <Text style={terminalText.yellow}>MANAGE →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
