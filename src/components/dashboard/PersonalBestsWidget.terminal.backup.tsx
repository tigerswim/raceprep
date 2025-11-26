import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';
import { TerminalCard } from '../ui/terminal';

interface PersonalBest {
  distance_type: string;
  overall_time: string;
  race_name: string;
  race_date: string;
  swim_time?: string;
  bike_time?: string;
  run_time?: string;
  t1_time?: string;
  t2_time?: string;
  overall_placement?: number;
  age_group_placement?: number;
}

interface PersonalBests {
  sprint?: PersonalBest;
  olympic?: PersonalBest;
  '70.3'?: PersonalBest;
  ironman?: PersonalBest;
}

/**
 * PersonalBestsWidget - Terminal Design Version
 *
 * Displays user's fastest times for each triathlon distance
 * in Split-Flap Terminal aesthetic with monospace fonts and hard edges.
 */
export const PersonalBestsWidgetTerminal: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [personalBests, setPersonalBests] = useState<PersonalBests>({});
  const [recentPRs, setRecentPRs] = useState<PersonalBest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPersonalBests();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const timeToSeconds = (timeStr: string | null | undefined): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // MM:SS
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
    }
    return 0;
  };

  const loadPersonalBests = async () => {
    try {
      setIsLoading(true);

      // Get all user race results
      const { data: results, error } = await dbHelpers.userRaceResults.getAll();

      if (error || !results || results.length === 0) {
        setPersonalBests({});
        setRecentPRs([]);
        return;
      }

      // Group results by distance type and find best times
      const bestsByDistance: PersonalBests = {};
      const distanceTypes = ['sprint', 'olympic', '70.3', 'ironman'];

      distanceTypes.forEach(distanceType => {
        const distanceResults = results.filter(
          r => r.race?.distance_type === distanceType && r.overall_time
        );

        if (distanceResults.length > 0) {
          // Sort by overall time (ascending) to find fastest
          const sorted = distanceResults.sort((a, b) => {
            const timeA = timeToSeconds(a.overall_time);
            const timeB = timeToSeconds(b.overall_time);
            return timeA - timeB;
          });

          const best = sorted[0];
          bestsByDistance[distanceType as keyof PersonalBests] = {
            distance_type: distanceType,
            overall_time: best.overall_time!,
            race_name: best.race?.name || 'Unknown Race',
            race_date: best.race?.date || 'Unknown Date',
            swim_time: best.swim_time,
            bike_time: best.bike_time,
            run_time: best.run_time,
            t1_time: best.t1_time,
            t2_time: best.t2_time,
            overall_placement: best.overall_placement,
            age_group_placement: best.age_group_placement
          };
        }
      });

      setPersonalBests(bestsByDistance);

      // Find recent PRs (races from last 90 days that are personal bests)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const recent = results
        .filter(r => {
          const raceDate = new Date(r.race?.date || '');
          return raceDate >= ninetyDaysAgo && r.overall_time;
        })
        .filter(r => {
          const distanceType = r.race?.distance_type;
          const best = distanceType ? bestsByDistance[distanceType as keyof PersonalBests] : null;
          return best && best.overall_time === r.overall_time;
        })
        .map(r => ({
          distance_type: r.race?.distance_type || 'unknown',
          overall_time: r.overall_time!,
          race_name: r.race?.name || 'Unknown Race',
          race_date: r.race?.date || 'Unknown Date',
          swim_time: r.swim_time,
          bike_time: r.bike_time,
          run_time: r.run_time,
          overall_placement: r.overall_placement,
          age_group_placement: r.age_group_placement
        }))
        .slice(0, 3);

      setRecentPRs(recent);
    } catch (error) {
      console.error('Error loading personal bests:', error);
      setPersonalBests({});
      setRecentPRs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDistanceLabel = (distanceType: string): string => {
    switch (distanceType) {
      case 'sprint':
        return 'SPRINT';
      case 'olympic':
        return 'OLYMPIC';
      case '70.3':
        return '70.3';
      case 'ironman':
        return 'IRONMAN';
      default:
        return distanceType.toUpperCase();
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${day} '${year}`;
  };

  if (isLoading) {
    return (
      <TerminalCard>
        <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Personal Bests
        </Text>
        <Text className="font-mono text-sm text-text-secondary">
          Loading records...
        </Text>
      </TerminalCard>
    );
  }

  const pbCount = Object.keys(personalBests).length;

  if (pbCount === 0) {
    return (
      <TerminalCard>
        <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Personal Bests
        </Text>
        <View className="py-6">
          <Text className="font-mono text-sm text-text-secondary text-center mb-4">
            NO RECORDS FOUND
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
        </View>
      </TerminalCard>
    );
  }

  return (
    <TerminalCard>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Personal Bests
          </Text>
          <Text className="font-mono text-xs text-text-secondary mt-1">
            {pbCount} DISTANCE{pbCount === 1 ? '' : 'S'}
          </Text>
        </View>
        {recentPRs.length > 0 && (
          <View className="bg-discipline-run/20 border border-discipline-run/40 px-3 py-1" style={{ borderRadius: 0 }}>
            <Text className="font-mono text-xs font-semibold text-discipline-run uppercase tracking-wider">
              {recentPRs.length} RECENT PR{recentPRs.length > 1 ? 'S' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Personal Bests by Distance */}
      <View className="space-y-3 mb-6">
        {Object.entries(personalBests).map(([distanceType, pb]) => (
          <TouchableOpacity
            key={distanceType}
            onPress={() => router.push('/(tabs)/races')}
            className="bg-terminal-bg border-2 border-terminal-border p-4"
            style={{ borderRadius: 0 }}
            activeOpacity={0.8}
          >
            {/* Distance and Time */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="font-mono text-sm font-semibold uppercase tracking-wider text-text-primary">
                  {getDistanceLabel(distanceType)}
                </Text>
                <Text className="font-mono text-xs text-text-secondary mt-1">
                  {pb.race_name}
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-mono text-2xl font-bold text-accent-yellow">
                  {pb.overall_time}
                </Text>
                <Text className="font-mono text-xs text-text-secondary mt-1">
                  {formatDate(pb.race_date)}
                </Text>
              </View>
            </View>

            {/* Split Times */}
            {(pb.swim_time || pb.bike_time || pb.run_time) && (
              <View className="flex-row gap-2 pt-3 border-t border-terminal-border">
                {pb.swim_time && (
                  <View className="flex-1 items-center py-2 bg-terminal-panel">
                    <Text className="font-mono text-xs uppercase text-discipline-swim mb-1">
                      SWIM
                    </Text>
                    <Text className="font-mono text-sm font-bold text-text-primary">
                      {pb.swim_time}
                    </Text>
                  </View>
                )}
                {pb.bike_time && (
                  <View className="flex-1 items-center py-2 bg-terminal-panel">
                    <Text className="font-mono text-xs uppercase text-discipline-bike mb-1">
                      BIKE
                    </Text>
                    <Text className="font-mono text-sm font-bold text-text-primary">
                      {pb.bike_time}
                    </Text>
                  </View>
                )}
                {pb.run_time && (
                  <View className="flex-1 items-center py-2 bg-terminal-panel">
                    <Text className="font-mono text-xs uppercase text-discipline-run mb-1">
                      RUN
                    </Text>
                    <Text className="font-mono text-sm font-bold text-text-primary">
                      {pb.run_time}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Placements */}
            {(pb.overall_placement || pb.age_group_placement) && (
              <View className="flex-row gap-3 pt-3 border-t border-terminal-border">
                {pb.overall_placement && (
                  <Text className="font-mono text-xs text-text-secondary">
                    OVERALL: #{pb.overall_placement}
                  </Text>
                )}
                {pb.age_group_placement && (
                  <Text className="font-mono text-xs text-text-secondary">
                    AG: #{pb.age_group_placement}
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent PRs Section */}
      {recentPRs.length > 0 && (
        <View className="bg-terminal-bg border-2 border-discipline-run/40 p-4 mb-4" style={{ borderRadius: 0 }}>
          <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-discipline-run mb-3">
            Recent Personal Records
          </Text>
          <View className="space-y-2">
            {recentPRs.map((pr, index) => (
              <View key={index} className="flex-row items-center justify-between">
                <Text className="font-mono text-sm text-text-primary">
                  {getDistanceLabel(pr.distance_type)}
                </Text>
                <View className="flex-row items-center gap-3">
                  <Text className="font-mono text-sm font-bold text-discipline-run">
                    {pr.overall_time}
                  </Text>
                  <Text className="font-mono text-xs text-text-secondary">
                    {formatDate(pr.race_date)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <View className="pt-4 border-t border-terminal-border">
        <View className="flex-row items-center justify-between">
          <Text className="font-mono text-xs text-text-secondary uppercase">
            {pbCount} RECORD{pbCount !== 1 ? 'S' : ''}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/races')}>
            <Text className="font-mono text-xs font-semibold text-accent-yellow uppercase tracking-wider">
              VIEW ALL →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TerminalCard>
  );
};
