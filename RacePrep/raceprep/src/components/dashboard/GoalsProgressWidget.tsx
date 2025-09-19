import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';

interface Goal {
  id: string;
  title: string;
  type: 'race_count' | 'race_time' | 'training_volume' | 'transition_time' | 'other';
  target_value: string;
  current_value: string;
  target_date?: string;
  achievement_status: 'not_started' | 'in_progress' | 'achieved' | 'missed';
  progress_percentage: number;
  category: 'performance' | 'training' | 'racing';
  distance_type?: string;
}

interface GoalSummary {
  total: number;
  achieved: number;
  inProgress: number;
  notStarted: number;
  achievementRate: number;
  nextMilestone?: Goal;
}

export const GoalsProgressWidget: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState<GoalSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGoals();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadGoals = async () => {
    try {
      setIsLoading(true);

      const { data: userGoals, error } = await dbHelpers.userGoals.getAll();

      if (error) {
        console.warn('Error loading user goals:', error);
        setGoals(getSampleGoals());
        setSummary(calculateSummary(getSampleGoals()));
        return;
      }

      if (!userGoals || userGoals.length === 0) {
        setGoals([]);
        setSummary(null);
        return;
      }

      // Process goals and calculate progress
      const processedGoals = userGoals.map(goal => ({
        id: goal.id,
        title: goal.title,
        type: goal.type,
        target_value: goal.target_value,
        current_value: goal.current_value || '0',
        target_date: goal.target_date,
        achievement_status: goal.achievement_status,
        progress_percentage: calculateProgressPercentage(goal),
        category: categorizeGoal(goal.type),
        distance_type: goal.distance_type
      }));

      setGoals(processedGoals);
      setSummary(calculateSummary(processedGoals));

    } catch (error) {
      console.error('Error loading goals:', error);
      setGoals(getSampleGoals());
      setSummary(calculateSummary(getSampleGoals()));
    } finally {
      setIsLoading(false);
    }
  };

  const getSampleGoals = (): Goal[] => {
    return [
      {
        id: 'sample-1',
        title: 'Complete 5 Sprint Triathlons',
        type: 'race_count',
        target_value: '5',
        current_value: '2',
        achievement_status: 'in_progress',
        progress_percentage: 40,
        category: 'racing',
        distance_type: 'sprint'
      },
      {
        id: 'sample-2',
        title: 'Sub-25 min 5K Run',
        type: 'race_time',
        target_value: '25:00',
        current_value: '26:30',
        achievement_status: 'in_progress',
        progress_percentage: 75,
        category: 'performance'
      },
      {
        id: 'sample-3',
        title: '10 Hours Weekly Training',
        type: 'training_volume',
        target_value: '10',
        current_value: '8.5',
        achievement_status: 'in_progress',
        progress_percentage: 85,
        category: 'training'
      },
      {
        id: 'sample-4',
        title: 'Sub-2 min T1 Transition',
        type: 'transition_time',
        target_value: '02:00',
        current_value: '02:15',
        achievement_status: 'in_progress',
        progress_percentage: 89,
        category: 'performance'
      }
    ];
  };

  const calculateProgressPercentage = (goal: any): number => {
    const current = parseFloat(goal.current_value) || 0;
    const target = parseFloat(goal.target_value) || 1;

    if (goal.type === 'race_time' || goal.type === 'transition_time') {
      // For time-based goals, lower is better
      const currentSeconds = parseTimeToSeconds(goal.current_value);
      const targetSeconds = parseTimeToSeconds(goal.target_value);

      if (currentSeconds <= targetSeconds) {
        return 100; // Goal achieved
      }

      // Calculate progress towards the target (max 99% until achieved)
      const improvement = Math.max(0, (currentSeconds - targetSeconds) / currentSeconds);
      return Math.min(99, Math.max(0, (1 - improvement) * 100));
    } else {
      // For count/volume goals, higher is better
      return Math.min(100, (current / target) * 100);
    }
  };

  const parseTimeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // MM:SS
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
    }
    return parseFloat(timeStr) || 0;
  };

  const categorizeGoal = (type: string): 'performance' | 'training' | 'racing' => {
    switch (type) {
      case 'race_count':
        return 'racing';
      case 'training_volume':
        return 'training';
      case 'race_time':
      case 'transition_time':
        return 'performance';
      default:
        return 'performance';
    }
  };

  const calculateSummary = (goals: Goal[]): GoalSummary => {
    const total = goals.length;
    const achieved = goals.filter(g => g.achievement_status === 'achieved').length;
    const inProgress = goals.filter(g => g.achievement_status === 'in_progress').length;
    const notStarted = goals.filter(g => g.achievement_status === 'not_started').length;
    const achievementRate = total > 0 ? (achieved / total) * 100 : 0;

    // Find the goal closest to completion that hasn't been achieved yet
    const nextMilestone = goals
      .filter(g => g.achievement_status !== 'achieved')
      .sort((a, b) => b.progress_percentage - a.progress_percentage)[0];

    return {
      total,
      achieved,
      inProgress,
      notStarted,
      achievementRate,
      nextMilestone
    };
  };

  const formatGoalValue = (goal: Goal): { current: string; target: string } => {
    if (goal.type === 'race_count') {
      return {
        current: goal.current_value,
        target: goal.target_value
      };
    } else if (goal.type === 'race_time' || goal.type === 'transition_time') {
      return {
        current: goal.current_value,
        target: goal.target_value
      };
    } else if (goal.type === 'training_volume') {
      return {
        current: `${goal.current_value}h`,
        target: `${goal.target_value}h/week`
      };
    } else {
      return {
        current: goal.current_value,
        target: goal.target_value
      };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'not_started':
        return 'bg-white/20 text-white/70 border-white/30';
      case 'missed':
        return 'bg-red-500/20 text-red-400 border-red-400/30';
      default:
        return 'bg-white/20 text-white/70 border-white/30';
    }
  };

  const getCategoryIcon = (category: 'performance' | 'training' | 'racing') => {
    switch (category) {
      case 'performance':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'training':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'racing':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getCategoryColor = (category: 'performance' | 'training' | 'racing') => {
    switch (category) {
      case 'performance':
        return 'bg-purple-500/20 text-purple-400';
      case 'training':
        return 'bg-green-500/20 text-green-400';
      case 'racing':
        return 'bg-orange-500/20 text-orange-400';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Goals Progress</h3>
            <p className="text-sm text-white/60">Loading your goals...</p>
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
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Goals Progress</h3>
            <p className="text-sm text-white/60">Track your achievements</p>
          </div>
        </div>
        <button
          onClick={() => window.location.hash = '#/profile'}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="text-white/50 mb-4">No goals set yet</p>
          <button
            onClick={() => router.push('/(tabs)/profile')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Set Goals
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white font-mono">{summary.achieved}</p>
                <p className="text-xs text-white/60">Achieved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white font-mono">{summary.inProgress}</p>
                <p className="text-xs text-white/60">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white font-mono">{Math.round(summary.achievementRate)}%</p>
                <p className="text-xs text-white/60">Success Rate</p>
              </div>
            </div>
          )}

          {/* Next Milestone */}
          {summary?.nextMilestone && (
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-white">Next Milestone</span>
                </div>
                <span className="text-sm font-bold text-purple-400">
                  {Math.round(summary.nextMilestone.progress_percentage)}%
                </span>
              </div>
              <h4 className="text-white font-semibold mb-2">{summary.nextMilestone.title}</h4>
              <div className="bg-white/10 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${summary.nextMilestone.progress_percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-white/70">
                <span>{formatGoalValue(summary.nextMilestone).current}</span>
                <span>{formatGoalValue(summary.nextMilestone).target}</span>
              </div>
            </div>
          )}

          {/* Goals List */}
          <div className="space-y-3">
            {goals.slice(0, 4).map((goal) => (
              <div key={goal.id} className="border border-white/10 rounded-xl p-3 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`w-4 h-4 rounded-lg flex items-center justify-center ${getCategoryColor(goal.category)}`}>
                        {getCategoryIcon(goal.category)}
                      </div>
                      <h4 className="text-white text-sm font-medium">{goal.title}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-lg border text-xs font-medium ${getStatusColor(goal.achievement_status)}`}>
                        {goal.achievement_status ? goal.achievement_status.replace('_', ' ') : 'unknown'}
                      </span>
                      <span className="text-xs text-white/60">
                        {formatGoalValue(goal).current} / {formatGoalValue(goal).target}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {Math.round(goal.progress_percentage)}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-1000 ${
                      goal.achievement_status === 'achieved' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                      goal.category === 'performance' ? 'bg-gradient-to-r from-purple-400 to-purple-500' :
                      goal.category === 'training' ? 'bg-gradient-to-r from-green-400 to-teal-400' :
                      'bg-gradient-to-r from-orange-400 to-red-400'
                    }`}
                    style={{ width: `${goal.progress_percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>{goals.length} active goals</span>
              <button
                onClick={() => router.push('/(tabs)/profile')}
                className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                Manage Goals →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};