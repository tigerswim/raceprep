import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
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
  console.log('[PerformanceOverviewWidgetTerminal] Component rendering...');

  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stravaConnected, setStravaConnected] = useState(false);

  console.log('[PerformanceOverviewWidgetTerminal] State:', { isLoading, hasStats: !!stats, hasUser: !!user });

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
      <View style={terminalView.card}>
        <View style={terminalView.center}>
          <Text style={terminalText.base}>LOADING...</Text>
        </View>
      </View>
    );
  }

  // Show empty state only if we have NO stats at all
  // (Allow rendering even if Strava not connected - user might have manual data)
  if (!stats) {
    return (
      <View style={terminalView.card}>
        <Text style={terminalText.header}>PERFORMANCE OVERVIEW</Text>
        <View style={mergeStyles(terminalView.center, { marginTop: 20 })}>
          <Text style={terminalText.base}>NO DATA AVAILABLE</Text>
          <Text style={mergeStyles(terminalText.small, { marginTop: 10 })}>
            {!stravaConnected ? 'CONNECT STRAVA TO VIEW STATS' : 'START TRAINING TO SEE PERFORMANCE DATA'}
          </Text>
        </View>
      </View>
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

  console.log('[PerformanceOverviewWidgetTerminal] Rendering SUCCESS state with data!');

  // Terminal colors (inline since Tailwind classes don't work on web)
  const colors = {
    bg: '#0F1419',
    border: '#1C2127',
    textPrimary: '#F8F8F2',
    textSecondary: '#B4B8C5',
    yellow: '#FFD866',
    swim: '#00D4FF',
    bike: '#FF6B35',
    run: '#4ECDC4',
  };

  return (
    <View style={{
      backgroundColor: colors.bg,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 0,
      padding: 20,
      margin: 10
    }}>
      {/* Header */}
      <Text style={{
        fontFamily: 'monospace',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: colors.textSecondary,
        marginBottom: 24
      }}>
        Performance Overview
      </Text>

      {/* Weekly Summary Stats */}
      <View style={{ flexDirection: width < 768 ? 'column' : 'row', gap: 12, marginBottom: 24 }}>
        {/* Time */}
        <View style={{ flex: 1, backgroundColor: '#0A0E14', borderWidth: 1, borderColor: colors.border, padding: 12 }}>
          <Text style={{ fontFamily: 'monospace', fontSize: 9, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>
            TIME
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 34, fontWeight: 'bold', color: colors.textPrimary }}>
            {formatTime(stats.last7Days.totalTime)}
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 8, color: colors.textSecondary, marginTop: 4 }}>
            {stats.weekOverWeek.timeChange >= 0 ? '▲' : '▼'} {Math.abs(Math.round(stats.weekOverWeek.timeChange))}%
          </Text>
        </View>

        {/* Distance */}
        <View style={{ flex: 1, backgroundColor: '#0A0E14', borderWidth: 1, borderColor: colors.border, padding: 12 }}>
          <Text style={{ fontFamily: 'monospace', fontSize: 9, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>
            DIST
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 34, fontWeight: 'bold', color: colors.textPrimary }}>
            {formatDistance(stats.last7Days.totalDistance)}
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 8, color: colors.textSecondary, marginTop: 4 }}>
            {stats.weekOverWeek.distanceChange >= 0 ? '▲' : '▼'} {Math.abs(Math.round(stats.weekOverWeek.distanceChange))}%
          </Text>
        </View>

        {/* Activities */}
        <View style={{ flex: 1, backgroundColor: '#0A0E14', borderWidth: 1, borderColor: colors.border, padding: 12 }}>
          <Text style={{ fontFamily: 'monospace', fontSize: 9, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>
            ACT
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 34, fontWeight: 'bold', color: colors.textPrimary }}>
            {stats.last7Days.activities}
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 8, color: colors.textSecondary, marginTop: 4 }}>
            LAST 7D
          </Text>
        </View>
      </View>

      {/* Discipline Breakdown */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.textSecondary, marginBottom: 12 }}>
          BY DISCIPLINE
        </Text>
        <View style={{ gap: 8 }}>
          {/* Swim */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0A0E14', borderWidth: 1, borderColor: colors.border, padding: 12 }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 12, color: colors.swim, fontWeight: '600' }}>[SWIM]</Text>
            <Text style={{ fontFamily: 'monospace', fontSize: 14, color: colors.textPrimary }}>
              {formatTime(stats.last7Days.swim.time)} • {formatDistance(stats.last7Days.swim.distance, 'swim')}
            </Text>
          </View>

          {/* Bike */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0A0E14', borderWidth: 1, borderColor: colors.border, padding: 12 }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 12, color: colors.bike, fontWeight: '600' }}>[BIKE]</Text>
            <Text style={{ fontFamily: 'monospace', fontSize: 14, color: colors.textPrimary }}>
              {formatTime(stats.last7Days.bike.time)} • {formatDistance(stats.last7Days.bike.distance, 'bike')}
            </Text>
          </View>

          {/* Run */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0A0E14', borderWidth: 1, borderColor: colors.border, padding: 12 }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 12, color: colors.run, fontWeight: '600' }}>[RUN]</Text>
            <Text style={{ fontFamily: 'monospace', fontSize: 14, color: colors.textPrimary }}>
              {formatTime(stats.last7Days.run.time)} • {formatDistance(stats.last7Days.run.distance, 'run')}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={{ paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: 'monospace', fontSize: 10, color: colors.textSecondary, textTransform: 'uppercase' }}>
            7-DAY SUMMARY
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/training')}>
            <Text style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: '600', color: colors.yellow, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              VIEW TRAINING →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
