import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';

interface Activity {
  id: string;
  type: 'swim' | 'bike' | 'run';
  name: string;
  date: string;
  duration: number; // in seconds
  distance: number; // in meters
  average_speed?: number; // m/s
  average_heartrate?: number; // bpm
  total_elevation_gain?: number; // meters
  trainer?: boolean;
  performance_score?: number; // calculated performance indicator
}

interface ActivityInsight {
  type: 'pace' | 'heart_rate' | 'distance' | 'consistency';
  message: string;
  trend: 'up' | 'down' | 'stable';
}

export const RecentActivitiesWidget: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [insights, setInsights] = useState<ActivityInsight[]>([]);
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

      // Get last 14 days of activities for analysis
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 14 * 24 * 60 * 60 * 1000);

      console.log('[RECENT_ACTIVITIES] Loading sessions for user:', user!.id);
      console.log('[RECENT_ACTIVITIES] Date range:', {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      });

      const { data: sessions, error } = await dbHelpers.trainingSessions.getUserSessions(
        user!.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      console.log('[RECENT_ACTIVITIES] Database response:', {
        sessionsCount: sessions?.length || 0,
        error: error?.message || 'none',
        firstSession: sessions?.[0] || 'none'
      });

      if (error) {
        console.warn('[RECENT_ACTIVITIES] Error loading training sessions:', error);
        console.warn('[RECENT_ACTIVITIES] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        setActivities(getSampleActivities());
        setInsights([]);
        return;
      }

      if (!sessions || sessions.length === 0) {
        console.log('[RECENT_ACTIVITIES] No sessions found, checking if any exist at all...');

        // Check if any sessions exist for this user (wider date range)
        const allSessionsResult = await dbHelpers.trainingSessions.getAll();
        console.log('[RECENT_ACTIVITIES] All sessions check:', {
          totalSessions: allSessionsResult.data?.length || 0,
          error: allSessionsResult.error?.message || 'none'
        });

        setActivities([]);
        setInsights([]);
        return;
      }

      // Convert training sessions to activities format
      const processedActivities = sessions
        .slice(0, 5) // Show last 5 activities
        .map(session => ({
          id: session.id,
          type: (session.activity_type?.toLowerCase() || 'run') as 'swim' | 'bike' | 'run',
          name: session.name || `${session.activity_type || 'Workout'}`,
          date: session.date,
          duration: session.duration || 0,
          distance: session.distance || 0,
          average_speed: session.average_speed,
          average_heartrate: session.average_heart_rate,
          total_elevation_gain: session.elevation_gain,
          trainer: session.indoor || false,
          performance_score: calculatePerformanceScore(session)
        }));

      setActivities(processedActivities);

      // Generate insights from the data
      const generatedInsights = generateInsights(sessions);
      setInsights(generatedInsights);

    } catch (error) {
      console.error('Error loading recent activities:', error);
      setActivities(getSampleActivities());
      setInsights([]);
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

  const calculatePerformanceScore = (session: any): number => {
    // Simple performance scoring based on duration and distance
    let score = 50; // base score

    // Distance component (0-30 points)
    const distance = session.distance || 0;
    if (session.activity_type?.toLowerCase() === 'swim') {
      score += Math.min(30, (distance / 2000) * 30); // 2km swim = max points
    } else if (session.activity_type?.toLowerCase() === 'bike') {
      score += Math.min(30, (distance / 40000) * 30); // 40km bike = max points
    } else { // run
      score += Math.min(30, (distance / 10000) * 30); // 10km run = max points
    }

    // Duration component (0-20 points)
    const duration = session.duration || 0;
    score += Math.min(20, (duration / 3600) * 20); // 1 hour = max points

    return Math.round(Math.min(100, score));
  };

  const generateInsights = (sessions: any[]): ActivityInsight[] => {
    const insights: ActivityInsight[] = [];

    if (sessions.length < 3) return insights;

    // Analyze recent vs older activities for trends
    const recentSessions = sessions.slice(0, 3);
    const olderSessions = sessions.slice(3, 6);

    // Pace analysis (for runs)
    const runSessions = sessions.filter(s => s.activity_type?.toLowerCase() === 'run' && s.average_speed);
    if (runSessions.length >= 2) {
      const recentPace = runSessions.slice(0, 2).reduce((sum, s) => sum + (s.average_speed || 0), 0) / 2;
      const olderPace = runSessions.slice(2, 4).reduce((sum, s) => sum + (s.average_speed || 0), 0) / 2;

      if (recentPace > olderPace * 1.05) {
        insights.push({
          type: 'pace',
          message: 'Running pace is improving',
          trend: 'up'
        });
      } else if (recentPace < olderPace * 0.95) {
        insights.push({
          type: 'pace',
          message: 'Running pace needs attention',
          trend: 'down'
        });
      }
    }

    // Consistency analysis
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivities = sessions.filter(s => new Date(s.date) >= last7Days);

    if (recentActivities.length >= 4) {
      insights.push({
        type: 'consistency',
        message: 'Great training consistency',
        trend: 'up'
      });
    } else if (recentActivities.length <= 1) {
      insights.push({
        type: 'consistency',
        message: 'Try to train more regularly',
        trend: 'down'
      });
    }

    // Distance trend
    if (sessions.length >= 4) {
      const recentDistance = recentSessions.reduce((sum, s) => sum + (s.distance || 0), 0);
      const olderDistance = olderSessions.reduce((sum, s) => sum + (s.distance || 0), 0);

      if (recentDistance > olderDistance * 1.2) {
        insights.push({
          type: 'distance',
          message: 'Training volume is increasing',
          trend: 'up'
        });
      }
    }

    return insights.slice(0, 2); // Return max 2 insights
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number, type: 'swim' | 'bike' | 'run'): string => {
    if (type === 'swim') {
      if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)}km`;
      }
      return `${meters}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  };

  const formatPace = (averageSpeed: number, type: 'swim' | 'bike' | 'run'): string => {
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
  };

  const getActivityIcon = (type: 'swim' | 'bike' | 'run') => {
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
  };

  const getActivityColor = (type: 'swim' | 'bike' | 'run') => {
    switch (type) {
      case 'swim':
        return 'bg-blue-500/20 border-blue-400/30 text-blue-400';
      case 'bike':
        return 'bg-green-500/20 border-green-400/30 text-green-400';
      case 'run':
        return 'bg-orange-500/20 border-orange-400/30 text-orange-400';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
          onClick={() => window.location.hash = '#/training'}
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
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{activity.name}</h4>
                    <p className="text-xs text-white/60">{formatRelativeTime(activity.date)}</p>
                  </div>
                </div>
                {activity.performance_score && (
                  <div className={`text-sm font-bold ${getPerformanceColor(activity.performance_score)}`}>
                    {activity.performance_score}%
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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

              {(activity.trainer || activity.total_elevation_gain) && (
                <div className="flex items-center space-x-2 mt-2">
                  {activity.trainer && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">Indoor</span>
                  )}
                  {activity.total_elevation_gain && activity.total_elevation_gain > 0 && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">
                      +{activity.total_elevation_gain}m
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Insights */}
          {insights.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-3">Training Insights</h4>
              <div className="space-y-2">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      insight.trend === 'up' ? 'bg-green-400' :
                      insight.trend === 'down' ? 'bg-red-400' : 'bg-blue-400'
                    }`}></div>
                    <span className="text-sm text-white/80">{insight.message}</span>
                    {insight.trend === 'up' && <span className="text-xs">📈</span>}
                    {insight.trend === 'down' && <span className="text-xs">📉</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>{activities.length} recent activities</span>
              <button
                onClick={() => window.location.hash = '#/training'}
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