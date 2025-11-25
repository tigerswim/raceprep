import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';
import { TerminalCard, FlipCard } from '../ui/terminal';

interface UpcomingRace {
  id: string;
  name: string;
  date: string;
  location: string;
  distance_type: string;
  status: 'interested' | 'registered' | 'training' | 'completed';
  daysUntil: number;
  hoursUntil: number;
  minutesUntil: number;
  preparationStatus: 'excellent' | 'good' | 'needs-attention' | 'unknown';
  trainingProgress: number;
  equipmentReady: boolean;
  nutritionPlanReady: boolean;
  registration_url?: string | null;
}

interface PlannedRace {
  id: string;
  external_races?: {
    name?: string;
    date?: string;
    location?: string;
    distance_type?: string;
    registration_url?: string;
  };
  race_name?: string;
  race_date?: string;
  status?: string;
}

interface LocalStorageRace {
  id: string;
  name: string;
  date: string;
  location: string;
  distance_type: string;
  status?: string;
}

/**
 * UpcomingRacesWidget - Terminal Design Version
 *
 * Displays next upcoming races with airport-style flip-card countdown displays.
 * Features retro race schedule aesthetic with terminal styling.
 */
export const UpcomingRacesWidgetTerminal: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [upcomingRaces, setUpcomingRaces] = useState<UpcomingRace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cachedRaces, setCachedRaces] = useState<UpcomingRace[]>([]);
  const [lastCacheUpdate, setLastCacheUpdate] = useState<number>(0);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Helper functions
  const calculatePreparationStatus = useCallback((daysUntil: number, status: string): 'excellent' | 'good' | 'needs-attention' | 'unknown' => {
    if (status === 'registered' && daysUntil > 60) return 'excellent';
    if (status === 'training' && daysUntil > 30) return 'good';
    if (status === 'registered' && daysUntil > 30) return 'good';
    if (daysUntil <= 14) return 'needs-attention';
    return 'unknown';
  }, []);

  const calculateTrainingProgress = useCallback((daysUntil: number, status: string): number => {
    if (status === 'completed') return 100;
    if (status === 'interested') return 0;

    const maxDays = 90;
    const daysPassed = maxDays - daysUntil;
    const progressPercentage = Math.min(100, Math.max(0, (daysPassed / maxDays) * 100));

    if (status === 'training') return Math.min(progressPercentage + 20, 100);
    if (status === 'registered') return Math.min(progressPercentage + 10, 100);

    return progressPercentage;
  }, []);

  const getSampleUpcomingRaces = useCallback((): UpcomingRace[] => {
    const today = new Date();
    const race1Date = new Date(today);
    race1Date.setDate(today.getDate() + 45);

    const race2Date = new Date(today);
    race2Date.setDate(today.getDate() + 75);

    const race3Date = new Date(today);
    race3Date.setDate(today.getDate() + 120);

    return [
      {
        id: 'sample-1',
        name: 'Local Sprint Triathlon',
        date: race1Date.toISOString(),
        location: 'Lake City',
        distance_type: 'sprint',
        status: 'registered',
        daysUntil: 45,
        hoursUntil: 12,
        minutesUntil: 30,
        preparationStatus: 'good',
        trainingProgress: 65,
        equipmentReady: true,
        nutritionPlanReady: false
      },
      {
        id: 'sample-2',
        name: 'Half Ironman 70.3',
        date: race2Date.toISOString(),
        location: 'Coastal City',
        distance_type: '70.3',
        status: 'training',
        daysUntil: 75,
        hoursUntil: 8,
        minutesUntil: 15,
        preparationStatus: 'excellent',
        trainingProgress: 45,
        equipmentReady: true,
        nutritionPlanReady: false
      },
      {
        id: 'sample-3',
        name: 'Olympic Distance Championship',
        date: race3Date.toISOString(),
        location: 'Metro Area',
        distance_type: 'olympic',
        status: 'interested',
        daysUntil: 120,
        hoursUntil: 6,
        minutesUntil: 0,
        preparationStatus: 'unknown',
        trainingProgress: 15,
        equipmentReady: false,
        nutritionPlanReady: false
      }
    ];
  }, []);

  const loadUpcomingRaces = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const now = Date.now();
    if (cachedRaces.length > 0 && (now - lastCacheUpdate < CACHE_DURATION)) {
      setUpcomingRaces(cachedRaces);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const { data: plannedRaces, error } = await dbHelpers.plannedRaces.getAll();

      if (error) {
        try {
          const storedRaces = localStorage.getItem('user_races');
          if (storedRaces) {
            const parsedRaces = JSON.parse(storedRaces);

            const transformedLocalRaces = parsedRaces.map((race: LocalStorageRace) => ({
              id: race.id,
              external_races: {
                name: race.name,
                date: race.date,
                location: race.location,
                distance_type: race.distance_type
              },
              status: race.status || 'interested'
            }));

            const processedLocalRaces = transformedLocalRaces
              .filter((race: PlannedRace) => {
                const raceDate = new Date(race.external_races?.date || '');
                return raceDate > new Date();
              })
              .map((race: PlannedRace) => {
                const raceDate = new Date(race.external_races?.date || '');
                const now = new Date();
                const timeDiff = raceDate.getTime() - now.getTime();
                const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                const hoursUntil = Math.ceil((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutesUntil = Math.ceil((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

                return {
                  id: race.id,
                  name: race.external_races?.name || 'Unknown Race',
                  date: race.external_races?.date || '',
                  location: race.external_races?.location || 'Unknown Location',
                  distance_type: race.external_races?.distance_type || 'unknown',
                  status: race.status || 'interested',
                  daysUntil: Math.max(0, daysUntil),
                  hoursUntil: Math.max(0, hoursUntil),
                  minutesUntil: Math.max(0, minutesUntil),
                  registration_url: null,
                  preparationStatus: calculatePreparationStatus(daysUntil, race.status),
                  trainingProgress: calculateTrainingProgress(daysUntil, race.status),
                  equipmentReady: race.status === 'training' || race.status === 'registered',
                  nutritionPlanReady: race.status === 'training' && daysUntil < 30
                } as UpcomingRace;
              })
              .sort((a, b) => a.daysUntil - b.daysUntil)
              .slice(0, 3);

            setUpcomingRaces(processedLocalRaces);
            setCachedRaces(processedLocalRaces);
            setLastCacheUpdate(Date.now());
            return;
          }
        } catch (localError) {
          console.warn('Error loading from localStorage:', localError);
        }

        const sampleRaces = getSampleUpcomingRaces();
        setUpcomingRaces(sampleRaces);
        setCachedRaces(sampleRaces);
        setLastCacheUpdate(Date.now());
        return;
      }

      if (!plannedRaces || plannedRaces.length === 0) {
        setUpcomingRaces([]);
        return;
      }

      const now = new Date();
      const processedRaces = plannedRaces
        .filter(race => {
          const raceDate = new Date(race.external_races?.date || race.race_date || '');
          return raceDate > now;
        })
        .map(race => {
          const raceDate = new Date(race.external_races?.date || race.race_date || '');
          const timeDiff = raceDate.getTime() - now.getTime();
          const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          const hoursUntil = Math.ceil((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutesUntil = Math.ceil((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

          return {
            id: race.id,
            name: race.external_races?.name || race.race_name || 'Unknown Race',
            date: race.external_races?.date || race.race_date || '',
            location: race.external_races?.location || 'Unknown Location',
            distance_type: race.external_races?.distance_type || 'unknown',
            status: race.status || 'interested',
            daysUntil: Math.max(0, daysUntil),
            hoursUntil: Math.max(0, hoursUntil),
            minutesUntil: Math.max(0, minutesUntil),
            registration_url: race.external_races?.registration_url,
            preparationStatus: calculatePreparationStatus(daysUntil, race.status),
            trainingProgress: calculateTrainingProgress(daysUntil, race.status),
            equipmentReady: race.status === 'training' || race.status === 'registered',
            nutritionPlanReady: race.status === 'training' && daysUntil < 30
          } as UpcomingRace;
        })
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 3);

      setUpcomingRaces(processedRaces);
      setCachedRaces(processedRaces);
      setLastCacheUpdate(Date.now());
    } catch (error) {
      console.error('Error loading upcoming races:', error);
      const sampleRaces = getSampleUpcomingRaces();
      setUpcomingRaces(sampleRaces);
      setCachedRaces(sampleRaces);
      setLastCacheUpdate(Date.now());
    } finally {
      setIsLoading(false);
    }
  }, [user, calculatePreparationStatus, calculateTrainingProgress, getSampleUpcomingRaces, cachedRaces, lastCacheUpdate]);

  useEffect(() => {
    if (user) {
      loadUpcomingRaces();
    } else {
      setIsLoading(false);
    }
  }, [user, loadUpcomingRaces]);

  // Real-time countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Memoized countdown calculation
  const updatedRaces = useMemo(() => {
    if (upcomingRaces.length === 0) return [];

    return upcomingRaces.map(race => {
      const raceDate = new Date(race.date);
      const timeDiff = raceDate.getTime() - currentTime.getTime();
      const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      const hoursUntil = Math.ceil((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesUntil = Math.ceil((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      return {
        ...race,
        daysUntil: Math.max(0, daysUntil),
        hoursUntil: Math.max(0, hoursUntil),
        minutesUntil: Math.max(0, minutesUntil)
      };
    });
  }, [upcomingRaces, currentTime]);

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'registered': return '[REG]';
      case 'training': return '[TRA]';
      case 'interested': return '[INT]';
      case 'completed': return '[CMP]';
      default: return '[---]';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'registered': return 'text-discipline-run';
      case 'training': return 'text-discipline-swim';
      case 'interested': return 'text-accent-yellow';
      case 'completed': return 'text-text-secondary';
      default: return 'text-text-secondary';
    }
  };

  const getDistanceLabel = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'sprint': return 'SPRINT';
      case 'olympic': return 'OLYMPIC';
      case '70.3': return '70.3';
      case 'ironman': return 'IRONMAN';
      default: return type.toUpperCase();
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate().toString().padStart(2, '0');
    return `${month} ${day}`;
  };

  if (isLoading) {
    return (
      <TerminalCard>
        <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Upcoming Races
        </Text>
        <Text className="font-mono text-sm text-text-secondary">
          Loading race schedule...
        </Text>
      </TerminalCard>
    );
  }

  if (updatedRaces.length === 0) {
    return (
      <TerminalCard>
        <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Upcoming Races
        </Text>
        <Text className="font-mono text-sm text-text-secondary text-center py-6">
          NO RACES SCHEDULED
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/races')}
          className="bg-accent-yellow border-2 border-accent-yellow px-4 py-3"
          style={{ borderRadius: 0 }}
        >
          <Text className="font-mono font-semibold text-sm uppercase tracking-wider text-terminal-bg text-center">
            Discover Races
          </Text>
        </TouchableOpacity>
      </TerminalCard>
    );
  }

  return (
    <TerminalCard>
      {/* Header */}
      <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-6">
        Upcoming Races
      </Text>

      {/* Race List */}
      <View className="gap-4">
        {updatedRaces.map((race, index) => (
          <View key={race.id}>
            {/* Race Info */}
            <View className="mb-3">
              <Text className="font-mono text-sm font-semibold text-text-primary uppercase mb-1">
                {race.name}
              </Text>
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="font-mono text-xs text-text-secondary uppercase">
                  {formatDate(race.date)}
                </Text>
                <Text className="font-mono text-xs text-text-secondary">•</Text>
                <Text className="font-mono text-xs text-text-secondary uppercase">
                  {race.location}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className={`font-mono text-xs font-semibold uppercase ${getStatusColor(race.status)}`}>
                  {getStatusLabel(race.status)}
                </Text>
                <Text className="font-mono text-xs text-text-secondary uppercase">
                  {getDistanceLabel(race.distance_type)}
                </Text>
              </View>
            </View>

            {/* Flip Card Countdown */}
            <View className="flex-row gap-2 mb-3">
              <FlipCard
                value={race.daysUntil}
                label="DAYS"
                color="text-accent-yellow"
                size="small"
                className="flex-1"
              />
              <FlipCard
                value={race.hoursUntil}
                label="HRS"
                color="text-accent-yellow"
                size="small"
                className="flex-1"
              />
              <FlipCard
                value={race.minutesUntil}
                label="MIN"
                color="text-accent-yellow"
                size="small"
                className="flex-1"
              />
            </View>

            {/* Training Progress */}
            <View className="mb-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-mono text-xs text-text-secondary uppercase">
                  Training
                </Text>
                <Text className="font-mono text-xs text-text-secondary">
                  {race.trainingProgress}%
                </Text>
              </View>
              <View
                className="h-4 border border-terminal-border bg-terminal-bg"
                style={{ borderRadius: 0 }}
              >
                <View
                  className="h-full bg-discipline-swim"
                  style={{
                    width: `${race.trainingProgress}%`,
                    borderRadius: 0
                  }}
                />
              </View>
            </View>

            {/* Preparation Status */}
            <View className="flex-row items-center gap-3 mb-3">
              <View className="flex-row items-center gap-1">
                <View
                  className={`w-2 h-2 ${
                    race.preparationStatus === 'excellent' ? 'bg-discipline-run' :
                    race.preparationStatus === 'good' ? 'bg-discipline-swim' :
                    race.preparationStatus === 'needs-attention' ? 'bg-accent-yellow' :
                    'bg-text-secondary'
                  }`}
                  style={{ borderRadius: 0 }}
                />
                <Text className="font-mono text-xs text-text-secondary uppercase">Prep</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <View
                  className={`w-2 h-2 ${race.equipmentReady ? 'bg-discipline-run' : 'bg-discipline-bike'}`}
                  style={{ borderRadius: 0 }}
                />
                <Text className="font-mono text-xs text-text-secondary uppercase">Gear</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <View
                  className={`w-2 h-2 ${race.nutritionPlanReady ? 'bg-discipline-run' : 'bg-accent-yellow'}`}
                  style={{ borderRadius: 0 }}
                />
                <Text className="font-mono text-xs text-text-secondary uppercase">Nutrition</Text>
              </View>
            </View>

            {index < updatedRaces.length - 1 && (
              <View className="border-t border-terminal-border pt-4" />
            )}
          </View>
        ))}
      </View>

      {/* Footer */}
      <View className="pt-4 border-t border-terminal-border mt-4">
        <View className="flex-row items-center justify-between">
          <Text className="font-mono text-xs text-text-secondary uppercase">
            {updatedRaces.filter(r => r.status === 'registered').length} Registered
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/races')}>
            <Text className="font-mono text-xs font-semibold text-accent-yellow uppercase tracking-wider">
              View All →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TerminalCard>
  );
};
