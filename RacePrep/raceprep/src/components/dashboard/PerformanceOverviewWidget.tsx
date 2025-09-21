import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';
import {
  TbSwimming,
  TbBike,
  TbRun
} from 'react-icons/tb';

interface DailyTrainingData {
  date: string;
  totalTime: number; // in seconds
  activities: number;
  swim: number;
  bike: number;
  run: number;
}

interface TrainingStats {
  last7Days: {
    totalTime: number; // in seconds
    totalDistance: number; // in meters
    activities: number;
    swim: { time: number; distance: number; activities: number };
    bike: { time: number; distance: number; activities: number };
    run: { time: number; distance: number; activities: number };
    dailyData: DailyTrainingData[]; // Daily breakdown for chart
  };
  last30Days: {
    totalTime: number;
    totalDistance: number;
    activities: number;
    weeklyTrend: 'up' | 'down' | 'stable';
  };
  weekOverWeek: {
    timeChange: number; // percentage
    distanceChange: number; // percentage
    activitiesChange: number;
  };
}

export const PerformanceOverviewWidget: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProfileAndStats();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadUserProfileAndStats = async () => {
    try {
      setIsLoading(true);

      // Load user profile and settings FIRST
      const { data: profile, error: profileError } = await dbHelpers.users.getCurrent();
      if (profileError) {
        console.warn('Error loading user profile:', profileError);
      } else {
        // Profile loaded successfully
        setUserProfile(profile);
      }

      // Load user settings for distance units
      const { data: settings, error: settingsError } = await dbHelpers.userSettings.get();
      if (settingsError || !settings) {
        console.warn('User settings not found, creating default:', settingsError);
        // Create default user settings
        const defaultSettings = { distance_units: 'imperial' };
        try {
          const { data: newSettings, error: createError } = await dbHelpers.userSettings.create(defaultSettings);
          if (createError) {
            console.warn('Could not create user settings, using defaults:', createError);
            setUserSettings(defaultSettings);
          } else {
            setUserSettings(newSettings);
          }
        } catch (createErr) {
          console.warn('Error creating user settings, using defaults:', createErr);
          setUserSettings(defaultSettings);
        }
      } else {
        // Settings loaded successfully
        setUserSettings(settings);
      }

      // Load training stats AFTER profile is set
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

      // Get training sessions from last 30 days
      const { data: sessions, error } = await dbHelpers.trainingSessions.getUserSessions(
        user!.id,
        thirtyDaysAgo.toISOString().split('T')[0],
        now.toISOString().split('T')[0]
      );

      if (error) {
        console.warn('Error loading training sessions:', error);
        setStats(null);
        return;
      }

      const allSessions = sessions || [];

      // Filter sessions by time periods
      const last7DaySessions = allSessions.filter(s =>
        new Date(s.date) >= sevenDaysAgo
      );
      const last14DaySessions = allSessions.filter(s =>
        new Date(s.date) >= fourteenDaysAgo && new Date(s.date) < sevenDaysAgo
      );
      const last30DaySessions = allSessions.filter(s =>
        new Date(s.date) >= thirtyDaysAgo
      );

      // Calculate stats for last 7 days (with daily data for chart)
      const last7Days = calculatePeriodStats(last7DaySessions, true);

      // Calculate stats for previous 7 days (for comparison)
      const previous7Days = calculatePeriodStats(last14DaySessions);

      // Calculate stats for last 30 days
      const last30Days = {
        ...calculatePeriodStats(last30DaySessions),
        weeklyTrend: determineWeeklyTrend(last7Days, previous7Days) as 'up' | 'down' | 'stable'
      };

      // Calculate week-over-week changes
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

    // Calculate daily data if requested
    if (includeDailyData && 'dailyData' in stats) {
      const dailyMap = new Map<string, DailyTrainingData>();

      // Initialize last 7 days (oldest to newest, so today appears on far right)
      const now = new Date();
      // Use local date to avoid timezone issues
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

      // Aggregate sessions by day (handle timezone properly)
      sessions.forEach(session => {
        // Parse session date in local timezone
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

      // Sort dailyData chronologically so today appears on the far right
      const sortedDailyData = Array.from(dailyMap.values()).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      // Chart data ready
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

  // Simple minute formatting to match Training tab
  const formatMinutes = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    return `${minutes}min`;
  };

  const formatDistance = (meters: number, type: 'swim' | 'bike' | 'run' | 'total' = 'total'): string => {
    // Get user's preferred distance unit from user settings
    const distanceUnit = userSettings?.distance_units || 'imperial';
    // Distance formatting using user settings

    if (distanceUnit === 'imperial') {
      // Convert to miles
      const miles = meters * 0.000621371;
      if (type === 'swim') {
        return `${miles.toFixed(2)}mi`;
      } else if (type === 'bike') {
        return `${miles.toFixed(0)}mi`;
      } else {
        return `${miles.toFixed(1)}mi`;
      }
    } else {
      // Metric (kilometers)
      if (type === 'swim') {
        return `${(meters / 1000).toFixed(1)}km`;
      } else if (type === 'bike') {
        return `${(meters / 1000).toFixed(0)}km`;
      } else {
        return `${(meters / 1000).toFixed(1)}km`;
      }
    }
  };

  // Custom Chart Component
  const TrainingTrendChart: React.FC<{ dailyData: DailyTrainingData[] }> = ({ dailyData }) => {
    // Handle edge cases
    if (!dailyData || dailyData.length === 0) {
      return (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Training Trend</h4>
            <div className="text-xs text-white/50">Last 7 days</div>
          </div>
          <div className="text-center py-8">
            <p className="text-white/50 text-sm">No training data available for trend analysis</p>
          </div>
        </div>
      );
    }

    const maxTime = Math.max(...dailyData.map(d => d.totalTime), 1);
    const chartHeight = 120;
    const chartWidth = 320; // Increased for better mobile visibility
    const padding = { top: 20, right: 20, bottom: 30, left: 30 }; // Increased left padding for y-axis labels
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    const getYPosition = (value: number) => {
      return padding.top + innerHeight - (value / maxTime) * innerHeight;
    };

    const getXPosition = (index: number) => {
      return padding.left + (index / (dailyData.length - 1)) * innerWidth;
    };

    // Create path for total time line
    const totalTimePath = dailyData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getXPosition(i)} ${getYPosition(d.totalTime)}`)
      .join(' ');

    // Create area path for stacked disciplines
    const createStackedPath = (getValue: (d: DailyTrainingData) => number, baseGetValue?: (d: DailyTrainingData) => number) => {
      const topPath = dailyData
        .map((d, i) => {
          const baseValue = baseGetValue ? baseGetValue(d) : 0;
          const value = getValue(d) + baseValue;
          return `${i === 0 ? 'M' : 'L'} ${getXPosition(i)} ${getYPosition(value)}`;
        })
        .join(' ');

      const bottomPath = dailyData
        .slice()
        .reverse()
        .map((d, i) => {
          const baseValue = baseGetValue ? baseGetValue(d) : 0;
          return `L ${getXPosition(dailyData.length - 1 - i)} ${getYPosition(baseValue)}`;
        })
        .join(' ');

      return `${topPath} ${bottomPath} Z`;
    };

    const formatChartTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
      }
      return minutes > 0 ? `${minutes}m` : '0m';
    };

    const getDayLabel = (dateStr: string): string => {
      // Parse date in local timezone
      const date = new Date(dateStr + 'T00:00:00');
      const today = new Date();

      // Compare dates properly
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      if (dateOnly.getTime() === todayOnly.getTime()) return 'Today';

      // Always use 3-letter abbreviation for other days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Training Trend</h4>
          <div className="text-xs text-white/50">Last 7 days</div>
        </div>

        <div className="relative w-full overflow-x-auto">
          <svg
            width={chartWidth}
            height={chartHeight}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="min-w-full max-w-full h-auto overflow-visible"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid lines */}
            <defs>
              <linearGradient id="swimGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(96, 165, 250)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="rgb(96, 165, 250)" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="bikeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(251, 146, 60)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="rgb(251, 146, 60)" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="runGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(74, 222, 128)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="rgb(74, 222, 128)" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1={padding.left}
                x2={chartWidth - padding.right}
                y1={padding.top + innerHeight * ratio}
                y2={padding.top + innerHeight * ratio}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
                strokeDasharray="2,4"
              />
            ))}

            {/* Stacked areas for disciplines */}
            {/* Swim (bottom layer) */}
            <path
              d={createStackedPath(d => d.swim)}
              fill="rgb(96, 165, 250)"
              stroke="rgb(96, 165, 250)"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />

            {/* Bike (middle layer) */}
            <path
              d={createStackedPath(d => d.bike, d => d.swim)}
              fill="rgb(251, 146, 60)"
              stroke="rgb(251, 146, 60)"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />

            {/* Run (top layer) */}
            <path
              d={createStackedPath(d => d.run, d => d.swim + d.bike)}
              fill="rgb(74, 222, 128)"
              stroke="rgb(74, 222, 128)"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />

            {/* Total time line */}
            <path
              d={totalTimePath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {dailyData.map((d, i) => (
              <g key={d.date}>
                <circle
                  cx={getXPosition(i)}
                  cy={getYPosition(d.totalTime)}
                  r="4"
                  fill="rgba(255, 255, 255, 0.9)"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="6"
                  className="hover:r-6 transition-all duration-200"
                />

                {/* Hover tooltip */}
                <g className="opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <rect
                    x={getXPosition(i) - 25}
                    y={getYPosition(d.totalTime) - 35}
                    width="50"
                    height="25"
                    rx="4"
                    fill="rgba(0, 0, 0, 0.8)"
                    stroke="rgba(255, 255, 255, 0.2)"
                  />
                  <text
                    x={getXPosition(i)}
                    y={getYPosition(d.totalTime) - 15}
                    textAnchor="middle"
                    className="text-xs fill-white font-medium"
                  >
                    {formatChartTime(d.totalTime)}
                  </text>
                </g>
              </g>
            ))}

            {/* X-axis labels */}
            {dailyData.map((d, i) => (
              <text
                key={`label-${d.date}`}
                x={getXPosition(i)}
                y={chartHeight - 5}
                textAnchor="middle"
                className="text-xs fill-white/60 font-medium"
              >
                {getDayLabel(d.date)}
              </text>
            ))}

            {/* Y-axis labels */}
            {[0, 0.5, 1].map((ratio) => (
              <text
                key={`y-label-${ratio}`}
                x={padding.left - 5}
                y={padding.top + innerHeight * ratio + 4}
                textAnchor="end"
                className="text-xs fill-white/60"
              >
                {formatChartTime(maxTime * (1 - ratio))}
              </text>
            ))}
          </svg>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 sm:space-x-6 mt-4 flex-wrap">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-white/70">Swim</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs text-white/70">Bike</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-white/70">Run</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading || !userProfile || !userSettings) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Training Overview</h3>
            <p className="text-sm text-white/60">Loading performance data...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded"></div>
          <div className="h-4 bg-white/10 rounded"></div>
          <div className="h-4 bg-white/10 rounded"></div>
        </div>

        {/* Chart skeleton */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
            <div className="h-3 w-16 bg-white/10 rounded animate-pulse"></div>
          </div>
          <div className="h-32 bg-white/10 rounded animate-pulse"></div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-white/10 animate-pulse"></div>
              <div className="h-3 w-8 bg-white/10 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-white/10 animate-pulse"></div>
              <div className="h-3 w-8 bg-white/10 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-white/10 animate-pulse"></div>
              <div className="h-3 w-8 bg-white/10 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Training Overview</h3>
            <p className="text-sm text-white/60">Connect Strava to see your training data</p>
          </div>
        </div>
        <div className="text-center py-6">
          <p className="text-white/50 mb-4">No training data available</p>
          <button
            onClick={() => router.push('/(tabs)/training')}
            className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Connect Strava
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Training Overview</h3>
            <p className="text-sm text-white/60">Last 7 days performance</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {stats.weekOverWeek.timeChange > 0 ? (
            <div className="flex items-center text-green-400">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-sm font-medium">+{stats.weekOverWeek.timeChange.toFixed(0)}%</span>
            </div>
          ) : stats.weekOverWeek.timeChange < 0 ? (
            <div className="flex items-center text-red-400">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              <span className="text-sm font-medium">{stats.weekOverWeek.timeChange.toFixed(0)}%</span>
            </div>
          ) : (
            <div className="flex items-center text-white/60">
              <span className="text-sm font-medium">Stable</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-2xl font-bold text-white font-mono">{stats.last7Days.activities}</p>
          <p className="text-xs text-white/60">Activities</p>
          {stats.weekOverWeek.activitiesChange !== 0 && (
            <div className={`flex items-center justify-center mt-1 text-xs ${stats.weekOverWeek.activitiesChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={stats.weekOverWeek.activitiesChange > 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
              </svg>
              {stats.weekOverWeek.activitiesChange > 0 ? '+' : ''}{stats.weekOverWeek.activitiesChange}
            </div>
          )}
        </div>
        <div className="text-center bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-2xl font-bold text-white font-mono">{formatMinutes(stats.last7Days.totalTime)}</p>
          <p className="text-xs text-white/60">Total Time</p>
          {Math.abs(stats.weekOverWeek.timeChange) > 1 && (
            <div className={`flex items-center justify-center mt-1 text-xs ${stats.weekOverWeek.timeChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={stats.weekOverWeek.timeChange > 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
              </svg>
              {stats.weekOverWeek.timeChange > 0 ? '+' : ''}{stats.weekOverWeek.timeChange.toFixed(0)}%
            </div>
          )}
        </div>
      </div>

      {/* Discipline Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide">By Discipline</h4>
          <div className="text-xs text-white/50">Last 7 days</div>
        </div>

        {/* Swim */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TbSwimming className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <span className="text-white text-sm font-medium">Swim</span>
                <div className="text-xs text-white/60">{stats.last7Days.swim.activities} sessions</div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-mono text-lg font-bold">{formatMinutes(stats.last7Days.swim.time)}</p>
              <p className="text-blue-400 text-sm font-medium">{formatDistance(stats.last7Days.swim.distance, 'swim')}</p>
            </div>
          </div>
          {stats.last7Days.swim.time > 0 && (
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.last7Days.swim.time / stats.last7Days.totalTime) * 100)}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Bike */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <TbBike className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <span className="text-white text-sm font-medium">Bike</span>
                <div className="text-xs text-white/60">{stats.last7Days.bike.activities} sessions</div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-mono text-lg font-bold">{formatMinutes(stats.last7Days.bike.time)}</p>
              <p className="text-orange-400 text-sm font-medium">{formatDistance(stats.last7Days.bike.distance, 'bike')}</p>
            </div>
          </div>
          {stats.last7Days.bike.time > 0 && (
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-600 to-orange-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.last7Days.bike.time / stats.last7Days.totalTime) * 100)}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Run */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TbRun className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <span className="text-white text-sm font-medium">Run</span>
                <div className="text-xs text-white/60">{stats.last7Days.run.activities} sessions</div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-mono text-lg font-bold">{formatMinutes(stats.last7Days.run.time)}</p>
              <p className="text-green-400 text-sm font-medium">{formatDistance(stats.last7Days.run.distance, 'run')}</p>
            </div>
          </div>
          {stats.last7Days.run.time > 0 && (
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.last7Days.run.time / stats.last7Days.totalTime) * 100)}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Training Trend Chart */}
      {stats.last7Days.dailyData && stats.last7Days.dailyData.length > 0 && (
        <TrainingTrendChart dailyData={stats.last7Days.dailyData} />
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>30-day volume: {formatTime(stats.last30Days.totalTime)}</span>
          <span>Trend: {stats.last30Days.weeklyTrend === 'up' ? '📈' : stats.last30Days.weeklyTrend === 'down' ? '📉' : '➡️'}</span>
        </div>
      </div>
    </div>
  );
};