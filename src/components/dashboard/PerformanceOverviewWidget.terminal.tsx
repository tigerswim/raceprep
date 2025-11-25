import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';
import { TerminalCard, TerminalBarChart } from '../ui/terminal';

interface DailyTrainingData {
  date: string;
  totalTime: number;
  activities: number;
  swim: number;
  bike: number;
  run: number;
}

interface TrainingStats {
  last7Days: {
    totalTime: number;
    totalDistance: number;
    activities: number;
    swim: { time: number; distance: number; activities: number };
    bike: { time: number; distance: number; activities: number };
    run: { time: number; distance: number; activities: number };
    dailyData: DailyTrainingData[];
  };
  last30Days: {
    totalTime: number;
    totalDistance: number;
    activities: number;
    weeklyTrend: 'up' | 'down' | 'stable';
  };
  weekOverWeek: {
    timeChange: number;
    distanceChange: number;
    activitiesChange: number;
  };
}

/**
 * PerformanceOverviewWidget - Terminal Design Version
 *
 * Displays training performance overview with terminal-style horizontal bar chart.
 * Features retro training log aesthetic with monospace fonts and stacked bars.
 */
export const PerformanceOverviewWidgetTerminal: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stravaConnected, setStravaConnected] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfileAndStats();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      checkStravaConnection();
    }
  }, [userProfile]);

  const checkStravaConnection = () => {
    const hasValidStravaToken = userProfile?.strava_access_token &&
      userProfile?.strava_token_expires_at &&
      new Date(userProfile.strava_token_expires_at) > new Date();

    setStravaConnected(!!hasValidStravaToken);
  };

  const loadUserProfileAndStats = async () => {
    try {
      setIsLoading(true);

      const { data: profile, error: profileError } = await dbHelpers.users.getCurrent();
      if (profileError) {
        console.warn('Error loading user profile:', profileError);
      } else {
        setUserProfile(profile);
      }

      const { data: settings, error: settingsError } = await dbHelpers.userSettings.get();
      if (settingsError || !settings) {
        const defaultSettings = { distance_units: 'imperial' };
        setUserSettings(defaultSettings);
      } else {
        setUserSettings(settings);
      }

      await loadTrainingStats();
    } catch (error) {
      console.error('Error loading user data:', error);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrainingStats = async () => {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const { data: sessions, error } = await dbHelpers.trainingSessions.getByDateRange(
        thirtyDaysAgo.toISOString().split('T')[0],
        now.toISOString().split('T')[0]
      );

      if (error) {
        console.warn('Error loading training sessions:', error);
        setStats(null);
        return;
      }

      const allSessions = sessions || [];

      const last7DaySessions = allSessions.filter(s =>
        new Date(s.date) >= sevenDaysAgo
      );
      const last14DaySessions = allSessions.filter(s =>
        new Date(s.date) >= fourteenDaysAgo && new Date(s.date) < sevenDaysAgo
      );
      const last30DaySessions = allSessions.filter(s =>
        new Date(s.date) >= thirtyDaysAgo
      );

      const last7Days = calculatePeriodStats(last7DaySessions, true);
      const previous7Days = calculatePeriodStats(last14DaySessions);
      const last30Days = {
        ...calculatePeriodStats(last30DaySessions),
        weeklyTrend: determineWeeklyTrend(last7Days, previous7Days) as 'up' | 'down' | 'stable'
      };

      const weekOverWeek = {
        timeChange: previous7Days.totalTime > 0 ?
          ((last7Days.totalTime - previous7Days.totalTime) / previous7Days.totalTime) * 100 : 0,
        distanceChange: previous7Days.totalDistance > 0 ?
          ((last7Days.totalDistance - previous7Days.totalDistance) / previous7Days.totalDistance) * 100 : 0,
        activitiesChange: last7Days.activities - previous7Days.activities
      };

      setStats({
        last7Days,
        last30Days,
        weekOverWeek
      });
    } catch (error) {
      console.error('Error loading training stats:', error);
      setStats(null);
    }
  };

  const calculatePeriodStats = (sessions: any[], includeDailyData: boolean = false) => {
    const stats = {
      totalTime: 0,
      totalDistance: 0,
      activities: sessions.length,
      swim: { time: 0, distance: 0, activities: 0 },
      bike: { time: 0, distance: 0, activities: 0 },
      run: { time: 0, distance: 0, activities: 0 },
      ...(includeDailyData && { dailyData: [] as DailyTrainingData[] })
    };

    sessions.forEach(session => {
      const duration = session.moving_time || 0;
      const distance = session.distance || 0;

      stats.totalTime += duration;
      stats.totalDistance += distance;

      const type = session.type?.toLowerCase();
      if (type === 'swim') {
        stats.swim.time += duration;
        stats.swim.distance += distance;
        stats.swim.activities++;
      } else if (type === 'bike' || type === 'ride') {
        stats.bike.time += duration;
        stats.bike.distance += distance;
        stats.bike.activities++;
      } else if (type === 'run') {
        stats.run.time += duration;
        stats.run.distance += distance;
        stats.run.activities++;
      }
    });

    if (includeDailyData && 'dailyData' in stats) {
      const dailyMap = new Map<string, DailyTrainingData>();

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split('T')[0];
        dailyMap.set(dateKey, {
          date: dateKey,
          totalTime: 0,
          activities: 0,
          swim: 0,
          bike: 0,
          run: 0
        });
      }

      sessions.forEach(session => {
        const sessionDate = new Date(session.date + 'T00:00:00').toISOString().split('T')[0];
        const dayData = dailyMap.get(sessionDate);

        if (dayData) {
          const duration = session.moving_time || 0;
          dayData.totalTime += duration;
          dayData.activities += 1;

          const type = session.type?.toLowerCase();
          if (type === 'swim') {
            dayData.swim += duration;
          } else if (type === 'bike' || type === 'ride') {
            dayData.bike += duration;
          } else if (type === 'run') {
            dayData.run += duration;
          }
        }
      });

      const sortedDailyData = Array.from(dailyMap.values()).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      (stats as any).dailyData = sortedDailyData;
    }

    return stats;
  };

  const determineWeeklyTrend = (current: any, previous: any) => {
    const currentTotal = current.totalTime + current.totalDistance;
    const previousTotal = previous.totalTime + previous.totalDistance;

    if (previousTotal === 0) return 'stable';

    const change = (currentTotal - previousTotal) / previousTotal;
    if (change > 0.05) return 'up';
    if (change < -0.05) return 'down';
    return 'stable';
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number): string => {
    const distanceUnit = userSettings?.distance_units || 'imperial';

    if (distanceUnit === 'imperial') {
      const miles = meters * 0.000621371;
      return `${miles.toFixed(1)}mi`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  };

  const getDayLabel = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) return 'Today';

    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };

  const getTrendSymbol = (trend: string): string => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'up': return 'text-discipline-run';
      case 'down': return 'text-discipline-bike';
      default: return 'text-text-secondary';
    }
  };

  if (isLoading || !userProfile || !userSettings) {
    return (
      <TerminalCard>
        <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Performance Overview
        </Text>
        <Text className="font-mono text-sm text-text-secondary">
          Loading training data...
        </Text>
      </TerminalCard>
    );
  }

  if (!stravaConnected || !stats) {
    return (
      <TerminalCard>
        <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Performance Overview
        </Text>
        <Text className="font-mono text-sm text-text-secondary text-center py-6">
          {!stravaConnected ? 'CONNECT STRAVA TO VIEW TRAINING DATA' : 'NO TRAINING DATA AVAILABLE'}
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/training')}
          className="bg-accent-yellow border-2 border-accent-yellow px-4 py-3"
          style={{ borderRadius: 0 }}
        >
          <Text className="font-mono font-semibold text-sm uppercase tracking-wider text-terminal-bg text-center">
            {!stravaConnected ? 'Connect Strava' : 'View Training'}
          </Text>
        </TouchableOpacity>
      </TerminalCard>
    );
  }

  // Prepare chart data
  const chartData = stats.last7Days.dailyData.map(day => ({
    label: getDayLabel(day.date),
    swim: day.swim,
    bike: day.bike,
    run: day.run,
    total: day.totalTime
  }));

  return (
    <TerminalCard>
      {/* Header */}
      <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-6">
        Performance Overview
      </Text>

      {/* Weekly Summary Stats */}
      <View className="flex-row gap-2 mb-6">
        <View className="flex-1 bg-terminal-bg border border-terminal-border p-3" style={{ borderRadius: 0 }}>
          <Text className="font-mono text-xs text-text-secondary uppercase mb-1">
            Time
          </Text>
          <Text className="font-mono text-xl font-bold text-text-primary">
            {formatTime(stats.last7Days.totalTime)}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className={`font-mono text-xs ${getTrendColor(stats.last30Days.weeklyTrend)}`}>
              {getTrendSymbol(stats.last30Days.weeklyTrend)} {stats.weekOverWeek.timeChange >= 0 ? '+' : ''}{Math.round(stats.weekOverWeek.timeChange)}%
            </Text>
          </View>
        </View>

        <View className="flex-1 bg-terminal-bg border border-terminal-border p-3" style={{ borderRadius: 0 }}>
          <Text className="font-mono text-xs text-text-secondary uppercase mb-1">
            Distance
          </Text>
          <Text className="font-mono text-xl font-bold text-text-primary">
            {formatDistance(stats.last7Days.totalDistance)}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className={`font-mono text-xs ${getTrendColor(stats.last30Days.weeklyTrend)}`}>
              {getTrendSymbol(stats.last30Days.weeklyTrend)} {stats.weekOverWeek.distanceChange >= 0 ? '+' : ''}{Math.round(stats.weekOverWeek.distanceChange)}%
            </Text>
          </View>
        </View>

        <View className="flex-1 bg-terminal-bg border border-terminal-border p-3" style={{ borderRadius: 0 }}>
          <Text className="font-mono text-xs text-text-secondary uppercase mb-1">
            Activities
          </Text>
          <Text className="font-mono text-xl font-bold text-text-primary">
            {stats.last7Days.activities}
          </Text>
          <Text className="font-mono text-xs text-text-secondary mt-1">
            {stats.weekOverWeek.activitiesChange >= 0 ? '+' : ''}{stats.weekOverWeek.activitiesChange} WoW
          </Text>
        </View>
      </View>

      {/* Training Volume Chart */}
      <View className="mb-6">
        <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
          Last 7 Days
        </Text>
        <TerminalBarChart
          data={chartData}
          stacked={true}
          showValues={true}
          height={180}
        />
      </View>

      {/* Discipline Breakdown */}
      <View className="flex-row gap-2 mb-4">
        <View className="flex-1 bg-terminal-bg border border-terminal-border p-3" style={{ borderRadius: 0 }}>
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-mono text-xs text-discipline-swim uppercase">Swim</Text>
            <Text className="font-mono text-xs text-text-secondary">{stats.last7Days.swim.activities}</Text>
          </View>
          <Text className="font-mono text-sm font-bold text-discipline-swim">
            {formatTime(stats.last7Days.swim.time)}
          </Text>
          <Text className="font-mono text-xs text-text-secondary mt-1">
            {formatDistance(stats.last7Days.swim.distance)}
          </Text>
        </View>

        <View className="flex-1 bg-terminal-bg border border-terminal-border p-3" style={{ borderRadius: 0 }}>
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-mono text-xs text-discipline-bike uppercase">Bike</Text>
            <Text className="font-mono text-xs text-text-secondary">{stats.last7Days.bike.activities}</Text>
          </View>
          <Text className="font-mono text-sm font-bold text-discipline-bike">
            {formatTime(stats.last7Days.bike.time)}
          </Text>
          <Text className="font-mono text-xs text-text-secondary mt-1">
            {formatDistance(stats.last7Days.bike.distance)}
          </Text>
        </View>

        <View className="flex-1 bg-terminal-bg border border-terminal-border p-3" style={{ borderRadius: 0 }}>
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-mono text-xs text-discipline-run uppercase">Run</Text>
            <Text className="font-mono text-xs text-text-secondary">{stats.last7Days.run.activities}</Text>
          </View>
          <Text className="font-mono text-sm font-bold text-discipline-run">
            {formatTime(stats.last7Days.run.time)}
          </Text>
          <Text className="font-mono text-xs text-text-secondary mt-1">
            {formatDistance(stats.last7Days.run.distance)}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="pt-4 border-t border-terminal-border">
        <View className="flex-row items-center justify-between">
          <Text className="font-mono text-xs text-text-secondary uppercase">
            30-Day: {formatTime(stats.last30Days.totalTime)} / {formatDistance(stats.last30Days.totalDistance)}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/training')}>
            <Text className="font-mono text-xs font-semibold text-accent-yellow uppercase tracking-wider">
              View Training →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TerminalCard>
  );
};
