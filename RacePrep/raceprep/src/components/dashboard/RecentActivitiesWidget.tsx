import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';
import { TbTrendingUp, TbTrendingDown, TbMinus, TbTarget, TbBolt, TbActivity } from 'react-icons/tb';

interface Activity {
  id: string;
  type: 'swim' | 'bike' | 'run';
  name: string;
  date: string;
  duration: number; // in seconds
  distance: number; // in meters
  average_speed?: number; // m/s
  average_heartrate?: number; // bpm
  max_heartrate?: number; // bpm
  total_elevation_gain?: number; // meters
  trainer?: boolean;
  performance_score?: number; // calculated performance indicator
  effort_level?: 'easy' | 'moderate' | 'hard' | 'very_hard';
  pace_trend?: 'improving' | 'declining' | 'stable';
  hr_zone?: 1 | 2 | 3 | 4 | 5;
  kudos_count?: number;
  tss?: number; // Training Stress Score
  normalized_power?: number; // for cycling
}

interface ActivityInsight {
  type: 'pace' | 'heart_rate' | 'distance' | 'consistency' | 'power' | 'volume' | 'recovery';
  message: string;
  trend: 'up' | 'down' | 'stable';
  importance: 'high' | 'medium' | 'low';
  actionable: boolean;
  value?: string; // numerical value to display
}

interface WeeklyStats {
  total?: {
    sessions: number;
    time: number;
    tss: number;
  };
}

interface TrainingSession {
  id: string;
  name?: string;
  type?: string;
  date: string;
  moving_time?: number;
  duration?: number;
  distance?: number;
  average_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  total_elevation_gain?: number;
  trainer?: boolean;
  kudos_count?: number;
  suffer_score?: number;
  average_watts?: number;
  speedImprovement?: number;
}

export const RecentActivitiesWidget: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [insights, setInsights] = useState<ActivityInsight[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecentActivities();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadRecentActivities = async () => {
    try {
      setIsLoading(true);

      // Load recent sessions with enhanced analytics
      const { data: sessions, error } = await dbHelpers.trainingSessions.getWithTrends(20);

      if (error) {
        console.warn('[RECENT_ACTIVITIES] Error loading training sessions:', error);
        setActivities(getSampleActivities());
        setInsights([]);
        setWeeklyStats(null);
        return;
      }

      if (!sessions || sessions.length === 0) {
        setActivities([]);
        setInsights([]);
        setWeeklyStats(null);
        return;
      }

      // Convert training sessions to enhanced activities format
      const processedActivities = sessions
        .slice(0, 5) // Show last 5 activities
        .map(session => ({
          id: session.id,
          type: (session.type?.toLowerCase() || 'run') as 'swim' | 'bike' | 'run',
          name: session.name || `${session.type || 'Workout'}`,
          date: session.date,
          duration: session.moving_time || 0,
          distance: session.distance || 0,
          average_speed: session.average_speed,
          average_heartrate: session.average_heartrate,
          max_heartrate: session.max_heartrate,
          total_elevation_gain: session.total_elevation_gain,
          trainer: session.trainer || false,
          performance_score: calculatePerformanceScore(session),
          effort_level: calculateEffortLevel(session),
          pace_trend: session.speedImprovement ? (session.speedImprovement > 5 ? 'improving' :
                      session.speedImprovement < -5 ? 'declining' : 'stable') : 'stable',
          hr_zone: calculateHRZone(session.average_heartrate),
          kudos_count: session.kudos_count,
          tss: session.suffer_score,
          normalized_power: session.average_watts
        }));

      setActivities(processedActivities);

      // Load weekly stats for comparison
      const { data: weekStats } = await dbHelpers.trainingSessions.getWeeklyStats?.() || { data: null };
      setWeeklyStats(weekStats);

      // Generate enhanced insights from the data
      const generatedInsights = generateEnhancedInsights(sessions, weekStats);
      setInsights(generatedInsights);

    } catch (error) {
      console.error('Error loading recent activities:', error);
      setActivities(getSampleActivities());
      setInsights([]);
      setWeeklyStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getSampleActivities = (): Activity[] => {
    const now = new Date();
    return [
      {
        id: 'sample-1',
        type: 'run',
        name: 'Morning Run',
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration: 2700, // 45 minutes
        distance: 8000, // 8km
        average_heartrate: 152,
        performance_score: 85
      },
      {
        id: 'sample-2',
        type: 'bike',
        name: 'Interval Training',
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration: 3600, // 60 minutes
        distance: 30000, // 30km
        trainer: true,
        performance_score: 92
      },
      {
        id: 'sample-3',
        type: 'swim',
        name: 'Pool Session',
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration: 2400, // 40 minutes
        distance: 2000, // 2km
        performance_score: 78
      }
    ];
  };

  const calculatePerformanceScore = useCallback((session: TrainingSession): number => {
    // Enhanced performance scoring
    let score = 50; // base score

    // Distance component (0-30 points)
    const distance = session.distance || 0;
    const activityType = session.type?.toLowerCase() || session.activity_type?.toLowerCase();

    if (activityType === 'swim') {
      score += Math.min(30, (distance / 2000) * 30); // 2km swim = max points
    } else if (activityType === 'bike') {
      score += Math.min(30, (distance / 40000) * 30); // 40km bike = max points
    } else { // run
      score += Math.min(30, (distance / 10000) * 30); // 10km run = max points
    }

    // Duration component (0-20 points)
    const duration = session.moving_time || session.duration || 0;
    score += Math.min(20, (duration / 3600) * 20); // 1 hour = max points

    return Math.round(Math.min(100, score));
  }, []);

  const calculateEffortLevel = useCallback((session: TrainingSession): 'easy' | 'moderate' | 'hard' | 'very_hard' => {
    const hr = session.average_heartrate;
    const tss = session.suffer_score;

    if (!hr && !tss) return 'moderate';

    if (tss) {
      if (tss > 300) return 'very_hard';
      if (tss > 200) return 'hard';
      if (tss > 100) return 'moderate';
      return 'easy';
    }

    // Estimate based on HR (assuming max HR of 190)
    const hrPercent = hr / 190;
    if (hrPercent > 0.9) return 'very_hard';
    if (hrPercent > 0.8) return 'hard';
    if (hrPercent > 0.7) return 'moderate';
    return 'easy';
  }, []);

  const calculateHRZone = (averageHR?: number): 1 | 2 | 3 | 4 | 5 => {
    if (!averageHR) return 2;

    // Assuming max HR of 190 for zone calculations
    const hrPercent = averageHR / 190;

    if (hrPercent >= 0.95) return 5;
    if (hrPercent >= 0.85) return 4;
    if (hrPercent >= 0.75) return 3;
    if (hrPercent >= 0.65) return 2;
    return 1;
  };

  const generateEnhancedInsights = useCallback((sessions: TrainingSession[], weekStats: WeeklyStats | null): ActivityInsight[] => {
    const insights: ActivityInsight[] = [];

    if (sessions.length < 3) return insights;

    // 1. Performance trends analysis
    const recentSessions = sessions.slice(0, 5);
    const performanceImprovement = recentSessions.filter(s => s.speedImprovement && s.speedImprovement > 2);

    if (performanceImprovement.length >= 2) {
      insights.push({
        type: 'pace',
        message: 'Strong performance gains this week',
        trend: 'up',
        importance: 'high',
        actionable: false,
        value: `+${Math.round(performanceImprovement[0].speedImprovement)}%`
      });
    }

    // 2. Training load analysis
    if (weekStats?.total?.tss) {
      const weeklyTSS = weekStats.total.tss;
      if (weeklyTSS > 500) {
        insights.push({
          type: 'volume',
          message: 'High training load - monitor recovery',
          trend: 'up',
          importance: 'medium',
          actionable: true,
          value: `${weeklyTSS} TSS`
        });
      } else if (weeklyTSS < 200) {
        insights.push({
          type: 'volume',
          message: 'Training volume is low this week',
          trend: 'down',
          importance: 'medium',
          actionable: true,
          value: `${weeklyTSS} TSS`
        });
      }
    }

    // 3. Heart rate zone analysis
    const hrSessions = recentSessions.filter(s => s.average_heartrate);
    if (hrSessions.length >= 3) {
      const avgHRZone = hrSessions.reduce((sum, s) => sum + calculateHRZone(s.average_heartrate), 0) / hrSessions.length;

      if (avgHRZone > 3.5) {
        insights.push({
          type: 'heart_rate',
          message: 'Training intensity is high',
          trend: 'up',
          importance: 'medium',
          actionable: true,
          value: `Zone ${Math.round(avgHRZone)}`
        });
      } else if (avgHRZone < 2.5) {
        insights.push({
          type: 'heart_rate',
          message: 'Consider adding intensity work',
          trend: 'stable',
          importance: 'medium',
          actionable: true,
          value: `Zone ${Math.round(avgHRZone)}`
        });
      }
    }

    // 4. Consistency analysis
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyActivities = sessions.filter(s => new Date(s.date) >= last7Days);

    if (weeklyActivities.length >= 5) {
      insights.push({
        type: 'consistency',
        message: 'Excellent training consistency',
        trend: 'up',
        importance: 'high',
        actionable: false,
        value: `${weeklyActivities.length} sessions`
      });
    } else if (weeklyActivities.length <= 2) {
      insights.push({
        type: 'consistency',
        message: 'Aim for more consistent training',
        trend: 'down',
        importance: 'high',
        actionable: true,
        value: `${weeklyActivities.length} sessions`
      });
    }

    // 5. Recovery analysis
    const hardSessions = recentSessions.filter(s => calculateEffortLevel(s) === 'hard' || calculateEffortLevel(s) === 'very_hard');
    if (hardSessions.length >= 3) {
      insights.push({
        type: 'recovery',
        message: 'Consider adding recovery sessions',
        trend: 'stable',
        importance: 'medium',
        actionable: true,
        value: `${hardSessions.length} hard sessions`
      });
    }

    return insights.slice(0, 3); // Return max 3 insights
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  const formatDistance = useCallback((meters: number, type: 'swim' | 'bike' | 'run'): string => {
    if (type === 'swim') {
      if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)}km`;
      }
      return `${meters}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }, []);

  const formatPace = useCallback((averageSpeed: number, type: 'swim' | 'bike' | 'run'): string => {
    if (!averageSpeed || averageSpeed === 0) return '';

    if (type === 'swim') {
      // For swimming, show pace per 100m in seconds
      const per100m = 100 / averageSpeed; // seconds per 100m
      const minutes = Math.floor(per100m / 60);
      const seconds = Math.round(per100m % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}/100m`;
    } else if (type === 'run') {
      // For running, show pace per km in min:sec
      const perKm = 1000 / averageSpeed; // seconds per km
      const minutes = Math.floor(perKm / 60);
      const seconds = Math.round(perKm % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
    } else {
      // For cycling, show speed in km/h
      const kmh = (averageSpeed * 3.6);
      return `${kmh.toFixed(1)}km/h`;
    }
  }, []);

  const getActivityIcon = useCallback((type: 'swim' | 'bike' | 'run') => {
    switch (type) {
      case 'swim':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'bike':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="m8 16 2.879-2.879"></path>
            <path d="m6.5 8 3.5 0"></path>
            <path d="m12 8 3.5 0"></path>
          </svg>
        );
      case 'run':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  }, []);

  const getActivityColor = useCallback((type: 'swim' | 'bike' | 'run') => {
    switch (type) {
      case 'swim':
        return 'bg-blue-500/20 border-blue-400/30 text-blue-400';
      case 'bike':
        return 'bg-green-500/20 border-green-400/30 text-green-400';
      case 'run':
        return 'bg-orange-500/20 border-orange-400/30 text-orange-400';
    }
  }, []);

  const getPerformanceColor = useCallback((score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  }, []);

  const formatRelativeTime = useCallback((dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Recent Activities</h3>
            <p className="text-sm text-white/60">Loading latest workouts...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded"></div>
          <div className="h-4 bg-white/10 rounded"></div>
          <div className="h-4 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Recent Activities</h3>
            <p className="text-sm text-white/60">Latest training sessions</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/(tabs)/training')}
          className="text-green-400 hover:text-green-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-white/50 mb-4">No recent activities</p>
          <button
            onClick={() => router.push('/(tabs)/training')}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Connect Strava
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Activities List */}
          {activities.map((activity) => (
            <div key={activity.id} className="border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-white font-medium">{activity.name}</h4>
                      {activity.pace_trend && activity.pace_trend !== 'stable' && (
                        <div className={`${activity.pace_trend === 'improving' ? 'text-green-400' : 'text-red-400'}`}>
                          {activity.pace_trend === 'improving' ? <TbTrendingUp className="w-3 h-3" /> : <TbTrendingDown className="w-3 h-3" />}
                        </div>
                      )}
                      {activity.kudos_count && activity.kudos_count > 0 && (
                        <span className="text-orange-400 text-xs flex items-center space-x-1">
                          <TbBolt className="w-3 h-3" />
                          <span>{activity.kudos_count}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-white/60">
                      <span>{formatRelativeTime(activity.date)}</span>
                      {activity.effort_level && (
                        <>
                          <span>•</span>
                          <span className={`${
                            activity.effort_level === 'very_hard' ? 'text-red-400' :
                            activity.effort_level === 'hard' ? 'text-orange-400' :
                            activity.effort_level === 'moderate' ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {activity.effort_level.replace('_', ' ')}
                          </span>
                        </>
                      )}
                      {activity.hr_zone && (
                        <>
                          <span>•</span>
                          <span className="text-blue-400">Zone {activity.hr_zone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {activity.performance_score && (
                  <div className="text-right">
                    <div className={`text-sm font-bold ${getPerformanceColor(activity.performance_score)}`}>
                      {activity.performance_score}%
                    </div>
                    <div className="text-xs text-white/60">Score</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-3">
                <div>
                  <p className="text-white/60 text-xs">Time</p>
                  <p className="text-white font-mono">{formatTime(activity.duration)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Distance</p>
                  <p className="text-white font-mono">{formatDistance(activity.distance, activity.type)}</p>
                </div>
                {activity.average_speed && (
                  <div>
                    <p className="text-white/60 text-xs">Pace/Speed</p>
                    <p className="text-white font-mono">{formatPace(activity.average_speed, activity.type)}</p>
                  </div>
                )}
                {activity.average_heartrate && (
                  <div>
                    <p className="text-white/60 text-xs">Avg HR</p>
                    <p className="text-white font-mono">{activity.average_heartrate} bpm</p>
                  </div>
                )}
              </div>

              {/* Additional metrics row */}
              {(activity.tss || activity.normalized_power || activity.max_heartrate) && (
                <div className="grid grid-cols-3 gap-3 text-xs mb-3 pb-3 border-b border-white/10">
                  {activity.tss && (
                    <div>
                      <p className="text-white/60">TSS</p>
                      <p className="text-white font-mono">{activity.tss}</p>
                    </div>
                  )}
                  {activity.normalized_power && (
                    <div>
                      <p className="text-white/60">Power</p>
                      <p className="text-white font-mono">{activity.normalized_power}W</p>
                    </div>
                  )}
                  {activity.max_heartrate && (
                    <div>
                      <p className="text-white/60">Max HR</p>
                      <p className="text-white font-mono">{activity.max_heartrate}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tags and badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {activity.trainer && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg border border-blue-400/30">
                      Indoor
                    </span>
                  )}
                  {activity.total_elevation_gain && activity.total_elevation_gain > 0 && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg border border-green-400/30">
                      +{activity.total_elevation_gain}m
                    </span>
                  )}
                  {activity.effort_level === 'very_hard' && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg border border-red-400/30">
                      High Intensity
                    </span>
                  )}
                </div>
                <button className="text-xs text-white/40 hover:text-white/60 transition-colors">
                  <TbActivity className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {/* Enhanced Insights */}
          {insights.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Training Insights</h4>
                <span className="text-xs text-white/50">{insights.length} insights</span>
              </div>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className={`rounded-xl p-3 border ${
                    insight.importance === 'high' ? 'border-orange-400/30 bg-orange-500/5' :
                    insight.importance === 'medium' ? 'border-blue-400/20 bg-blue-500/5' :
                    'border-white/10 bg-white/5'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          insight.trend === 'up' ? 'bg-green-400' :
                          insight.trend === 'down' ? 'bg-red-400' : 'bg-blue-400'
                        }`}></div>
                        <span className="text-sm text-white/90 font-medium">{insight.message}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {insight.value && (
                          <span className="text-xs font-mono text-white/70 px-2 py-1 bg-white/10 rounded">
                            {insight.value}
                          </span>
                        )}
                        <div className="text-white/60">
                          {insight.trend === 'up' && <TbTrendingUp className="w-3 h-3" />}
                          {insight.trend === 'down' && <TbTrendingDown className="w-3 h-3" />}
                          {insight.trend === 'stable' && <TbMinus className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs capitalize px-2 py-1 rounded-lg ${
                        insight.type === 'pace' ? 'bg-green-500/20 text-green-400' :
                        insight.type === 'heart_rate' ? 'bg-red-500/20 text-red-400' :
                        insight.type === 'volume' ? 'bg-blue-500/20 text-blue-400' :
                        insight.type === 'consistency' ? 'bg-purple-500/20 text-purple-400' :
                        insight.type === 'recovery' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-white/20 text-white/70'
                      }`}>
                        {insight.type.replace('_', ' ')}
                      </span>
                      {insight.actionable && (
                        <button className="text-xs text-white/60 hover:text-white/80 transition-colors flex items-center space-x-1">
                          <TbTarget className="w-3 h-3" />
                          <span>Act</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Performance Summary */}
          {weeklyStats && (
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-3">This Week</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-white font-mono">{weeklyStats.total?.sessions || 0}</p>
                  <p className="text-xs text-white/60">Activities</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white font-mono">
                    {weeklyStats.total?.time ? `${Math.round(weeklyStats.total.time / 3600)}h` : '0h'}
                  </p>
                  <p className="text-xs text-white/60">Training Time</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white font-mono">
                    {weeklyStats.total?.tss || 0}
                  </p>
                  <p className="text-xs text-white/60">Total TSS</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>{activities.length} recent activities</span>
              <button
                onClick={() => router.push('/(tabs)/training')}
                className="text-green-400 hover:text-green-300 transition-colors font-medium"
              >
                View All →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};