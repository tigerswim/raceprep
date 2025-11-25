import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';
import { TbClock, TbTrendingUp, TbTarget, TbAlertCircle, TbCheck } from 'react-icons/tb';
import { useTerminalDesign } from '../../utils/featureFlags';
import { TransitionAnalyticsWidgetTerminal } from './TransitionAnalyticsWidget.terminal';

interface TransitionData {
  t1_time: string | null;
  t2_time: string | null;
  race_name: string;
  race_date: string;
  distance_type: string;
}

interface TransitionStats {
  avgT1Seconds: number;
  avgT2Seconds: number;
  bestT1Seconds: number;
  bestT2Seconds: number;
  totalT1Count: number;
  totalT2Count: number;
  t1Trend: 'improving' | 'stable' | 'declining';
  t2Trend: 'improving' | 'stable' | 'declining';
  recentRaces: TransitionData[];
}

export const TransitionAnalyticsWidget: React.FC = () => {
  // Check if terminal design is enabled for this widget
  const useTerminal = useTerminalDesign('transitions');

  if (useTerminal) {
    return <TransitionAnalyticsWidgetTerminal />;
  }

  // Legacy implementation below
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

  const timeToSeconds = (timeStr: string | null): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // MM:SS
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
    }
    return 0;
  };

  const secondsToTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadTransitionData = async () => {
    try {
      setIsLoading(true);

      // Get all user race results with transitions
      const { data: results, error } = await dbHelpers.userRaceResults.getAll();

      if (error || !results || results.length === 0) {
        setStats(null);
        return;
      }

      // Filter results that have transition times
      const resultsWithTransitions = results.filter(
        r => r.t1_time || r.t2_time
      );

      if (resultsWithTransitions.length === 0) {
        setStats(null);
        return;
      }

      // Calculate statistics
      const t1Times = resultsWithTransitions
        .filter(r => r.t1_time)
        .map(r => timeToSeconds(r.t1_time));

      const t2Times = resultsWithTransitions
        .filter(r => r.t2_time)
        .map(r => timeToSeconds(r.t2_time));

      const avgT1 = t1Times.length > 0
        ? t1Times.reduce((a, b) => a + b, 0) / t1Times.length
        : 0;

      const avgT2 = t2Times.length > 0
        ? t2Times.reduce((a, b) => a + b, 0) / t2Times.length
        : 0;

      const bestT1 = t1Times.length > 0 ? Math.min(...t1Times) : 0;
      const bestT2 = t2Times.length > 0 ? Math.min(...t2Times) : 0;

      // Calculate trends (compare first half vs second half of races)
      const midpoint = Math.floor(t1Times.length / 2);
      const t1FirstHalf = t1Times.slice(0, midpoint);
      const t1SecondHalf = t1Times.slice(midpoint);
      const t2FirstHalf = t2Times.slice(0, midpoint);
      const t2SecondHalf = t2Times.slice(midpoint);

      const avgT1First = t1FirstHalf.length > 0
        ? t1FirstHalf.reduce((a, b) => a + b, 0) / t1FirstHalf.length
        : 0;
      const avgT1Second = t1SecondHalf.length > 0
        ? t1SecondHalf.reduce((a, b) => a + b, 0) / t1SecondHalf.length
        : 0;

      const avgT2First = t2FirstHalf.length > 0
        ? t2FirstHalf.reduce((a, b) => a + b, 0) / t2FirstHalf.length
        : 0;
      const avgT2Second = t2SecondHalf.length > 0
        ? t2SecondHalf.reduce((a, b) => a + b, 0) / t2SecondHalf.length
        : 0;

      const t1Trend = avgT1Second < avgT1First * 0.95
        ? 'improving'
        : avgT1Second > avgT1First * 1.05
        ? 'declining'
        : 'stable';

      const t2Trend = avgT2Second < avgT2First * 0.95
        ? 'improving'
        : avgT2Second > avgT2First * 1.05
        ? 'declining'
        : 'stable';

      setStats({
        avgT1Seconds: Math.round(avgT1),
        avgT2Seconds: Math.round(avgT2),
        bestT1Seconds: bestT1,
        bestT2Seconds: bestT2,
        totalT1Count: t1Times.length,
        totalT2Count: t2Times.length,
        t1Trend,
        t2Trend,
        recentRaces: resultsWithTransitions.slice(-5).reverse() as TransitionData[]
      });
    } catch (error) {
      console.error('Error loading transition data:', error);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getOptimizationTips = () => {
    if (!stats) return [];

    const tips = [];

    // T1 tips
    if (stats.avgT1Seconds > 120) {
      tips.push({
        type: 'T1',
        severity: 'high',
        tip: 'T1 average is over 2 minutes. Practice wetsuit removal and bike mount to save 30-60 seconds.',
        icon: '🏊‍♂️→🚴‍♂️'
      });
    } else if (stats.avgT1Seconds > 90) {
      tips.push({
        type: 'T1',
        severity: 'medium',
        tip: 'T1 average is 90-120 seconds. Pre-unzip wetsuit before transition for faster removal.',
        icon: '🏊‍♂️→🚴‍♂️'
      });
    }

    // T2 tips
    if (stats.avgT2Seconds > 90) {
      tips.push({
        type: 'T2',
        severity: 'high',
        tip: 'T2 average is over 90 seconds. Quick helmet removal and elastic laces can save 15-30 seconds.',
        icon: '🚴‍♂️→🏃‍♂️'
      });
    } else if (stats.avgT2Seconds > 60) {
      tips.push({
        type: 'T2',
        severity: 'medium',
        tip: 'T2 average is 60-90 seconds. Practice dismount and run with bike for smoother transitions.',
        icon: '🚴‍♂️→🏃‍♂️'
      });
    }

    // Trend-based tips
    if (stats.t1Trend === 'improving') {
      tips.push({
        type: 'T1',
        severity: 'success',
        tip: 'Great work! Your T1 times are improving. Keep practicing your routine.',
        icon: '📈'
      });
    }

    if (stats.t2Trend === 'improving') {
      tips.push({
        type: 'T2',
        severity: 'success',
        tip: 'Excellent progress! Your T2 times are getting faster.',
        icon: '📈'
      });
    }

    // General tips if both are good
    if (stats.avgT1Seconds <= 90 && stats.avgT2Seconds <= 60) {
      tips.push({
        type: 'Both',
        severity: 'success',
        tip: 'Outstanding transition times! You\'re in the top tier. Focus on consistency.',
        icon: '🏆'
      });
    }

    return tips;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TbTrendingUp className="w-4 h-4 text-green-400" />;
      case 'declining':
        return <TbAlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <TbTarget className="w-4 h-4 text-blue-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-400';
      case 'declining':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <TbClock className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Transition Analytics</h3>
            <p className="text-sm text-white/60">Loading transition data...</p>
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

  if (!stats) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <TbClock className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Transition Analytics</h3>
            <p className="text-sm text-white/60">Track your T1 and T2 performance</p>
          </div>
        </div>
        <div className="text-center py-6">
          <p className="text-white/50 mb-4">No transition data available yet</p>
          <button
            onClick={() => router.push('/(tabs)/races')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Add Race Results
          </button>
        </div>
      </div>
    );
  }

  const tips = getOptimizationTips();

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <TbClock className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Transition Analytics</h3>
            <p className="text-sm text-white/60">{stats.totalT1Count} races analyzed</p>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500/10 to-orange-500/10 border border-blue-400/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">T1 Average</span>
            {getTrendIcon(stats.t1Trend)}
          </div>
          <div className="text-2xl font-bold text-white font-mono">{secondsToTime(stats.avgT1Seconds)}</div>
          <div className="text-xs text-white/60 mt-1">
            Best: {secondsToTime(stats.bestT1Seconds)}
          </div>
          <div className={`text-xs mt-1 capitalize ${getTrendColor(stats.t1Trend)}`}>
            {stats.t1Trend}
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500/10 to-green-500/10 border border-orange-400/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">T2 Average</span>
            {getTrendIcon(stats.t2Trend)}
          </div>
          <div className="text-2xl font-bold text-white font-mono">{secondsToTime(stats.avgT2Seconds)}</div>
          <div className="text-xs text-white/60 mt-1">
            Best: {secondsToTime(stats.bestT2Seconds)}
          </div>
          <div className={`text-xs mt-1 capitalize ${getTrendColor(stats.t2Trend)}`}>
            {stats.t2Trend}
          </div>
        </div>
      </div>

      {/* Optimization Tips */}
      {tips.length > 0 && (
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Optimization Tips</h4>
          {tips.map((tip, index) => (
            <div
              key={index}
              className={`rounded-xl p-3 border ${
                tip.severity === 'high' ? 'bg-red-500/10 border-red-400/30' :
                tip.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-400/30' :
                'bg-green-500/10 border-green-400/30'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{tip.icon}</span>
                <div className="flex-1">
                  <div className={`text-sm font-medium mb-1 ${
                    tip.severity === 'high' ? 'text-red-300' :
                    tip.severity === 'medium' ? 'text-yellow-300' :
                    'text-green-300'
                  }`}>
                    {tip.type} {tip.severity === 'success' ? 'Progress' : 'Opportunity'}
                  </div>
                  <p className="text-white/90 text-sm">{tip.tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transition Benchmarks */}
      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <h4 className="text-sm font-semibold text-white/80 mb-3">Target Times by Level</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-white/70">
            <span>🥇 Elite:</span>
            <span className="font-mono">T1 &lt;1:00, T2 &lt;0:45</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>🥈 Competitive:</span>
            <span className="font-mono">T1 &lt;1:30, T2 &lt;1:00</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>🥉 Recreational:</span>
            <span className="font-mono">T1 &lt;2:00, T2 &lt;1:30</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>Total transitions: {stats.totalT1Count + stats.totalT2Count}</span>
          <button
            onClick={() => router.push('/(tabs)/races')}
            className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
          >
            View All Results →
          </button>
        </div>
      </div>
    </div>
  );
};
