import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';
import { TerminalCard } from '../ui/terminal';

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

interface UserGoal {
  id: string;
  title: string;
  type: 'race_count' | 'race_time' | 'training_volume' | 'transition_time' | 'other';
  target_value: string;
  current_value: string;
  target_date?: string;
  achievement_status: 'not_started' | 'in_progress' | 'achieved' | 'missed';
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

/**
 * GoalsProgressWidget - Terminal Design Version
 *
 * Displays user goals and progress with terminal aesthetics.
 * Features monospace fonts, hard-edged progress bars, and terminal colors.
 */
export const GoalsProgressWidgetTerminal: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState<GoalSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateProgressPercentage = useCallback((goal: UserGoal): number => {
    const current = parseFloat(goal.current_value) || 0;
    const target = parseFloat(goal.target_value) || 1;

    if (goal.type === 'race_time' || goal.type === 'transition_time') {
      const currentSeconds = parseTimeToSeconds(goal.current_value);
      const targetSeconds = parseTimeToSeconds(goal.target_value);
      if (currentSeconds <= targetSeconds) return 100;
      const improvement = Math.max(0, (currentSeconds - targetSeconds) / currentSeconds);
      return Math.min(99, Math.max(0, (1 - improvement) * 100));
    } else {
      return Math.min(100, (current / target) * 100);
    }
  }, []);

  const parseTimeToSeconds = useCallback((timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return parseFloat(timeStr) || 0;
  }, []);

  const categorizeGoal = useCallback((type: string): 'performance' | 'training' | 'racing' => {
    switch (type) {
      case 'race_count': return 'racing';
      case 'training_volume': return 'training';
      case 'race_time':
      case 'transition_time':
        return 'performance';
      default: return 'performance';
    }
  }, []);

  const calculateSummary = useCallback((goals: Goal[]): GoalSummary => {
    const total = goals.length;
    const achieved = goals.filter(g => g.achievement_status === 'achieved').length;
    const inProgress = goals.filter(g => g.achievement_status === 'in_progress').length;
    const notStarted = goals.filter(g => g.achievement_status === 'not_started').length;
    const achievementRate = total > 0 ? (achieved / total) * 100 : 0;

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
  }, []);

  const loadGoals = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: userGoals, error } = await dbHelpers.userGoals.getAll();

      if (error || !userGoals || userGoals.length === 0) {
        setGoals([]);
        setSummary(null);
        return;
      }

      const processedGoals: Goal[] = userGoals.map((goal: UserGoal) => ({
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
      setGoals([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [calculateProgressPercentage, categorizeGoal, calculateSummary]);

  useEffect(() => {
    if (user) {
      loadGoals();
    } else {
      setIsLoading(false);
    }
  }, [user, loadGoals]);

  const formatGoalValue = useCallback((goal: Goal): { current: string; target: string } => {
    if (goal.type === 'race_count') {
      return { current: goal.current_value, target: goal.target_value };
    } else if (goal.type === 'race_time' || goal.type === 'transition_time') {
      return { current: goal.current_value, target: goal.target_value };
    } else if (goal.type === 'training_volume') {
      return { current: `${goal.current_value}H`, target: `${goal.target_value}H/WK` };
    } else {
      return { current: goal.current_value, target: goal.target_value };
    }
  }, []);

  const getStatusLabel = (status: string): string => {
    return status.replace('_', ' ').toUpperCase();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'achieved': return 'text-discipline-run';
      case 'in_progress': return 'text-accent-yellow';
      case 'not_started': return 'text-text-secondary';
      case 'missed': return 'text-discipline-bike';
      default: return 'text-text-secondary';
    }
  };

  const getCategoryLabel = (category: string): string => {
    return category.toUpperCase().substring(0, 4);
  };

  if (isLoading) {
    return (
      <TerminalCard>
        <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Goals Progress
        </Text>
        <Text className="font-mono text-sm text-text-secondary">
          Loading goals...
        </Text>
      </TerminalCard>
    );
  }

  if (goals.length === 0) {
    return (
      <TerminalCard>
        <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          Goals Progress
        </Text>
        <View className="py-6">
          <Text className="font-mono text-sm text-text-secondary text-center mb-4">
            NO GOALS SET
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            className="bg-accent-yellow border-2 border-accent-yellow px-4 py-3"
            style={{ borderRadius: 0 }}
          >
            <Text className="font-mono font-semibold text-sm uppercase tracking-wider text-terminal-bg text-center">
              Set Goals
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
            Goals Progress
          </Text>
          <Text className="font-mono text-xs text-text-secondary mt-1">
            {goals.length} ACTIVE
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
          <Text className="font-mono text-xs font-semibold text-accent-yellow uppercase tracking-wider">
            MANAGE →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      {summary && (
        <View className="flex-row mb-6 border-2 border-terminal-border" style={{ borderRadius: 0 }}>
          <View className="flex-1 items-center py-3 bg-terminal-panel border-r-2 border-terminal-border">
            <Text className="font-mono text-2xl font-bold text-discipline-run">
              {summary.achieved}
            </Text>
            <Text className="font-mono text-xs text-text-secondary uppercase">
              Done
            </Text>
          </View>
          <View className="flex-1 items-center py-3 bg-terminal-panel border-r-2 border-terminal-border">
            <Text className="font-mono text-2xl font-bold text-accent-yellow">
              {summary.inProgress}
            </Text>
            <Text className="font-mono text-xs text-text-secondary uppercase">
              Active
            </Text>
          </View>
          <View className="flex-1 items-center py-3 bg-terminal-panel">
            <Text className="font-mono text-2xl font-bold text-text-primary">
              {Math.round(summary.achievementRate)}%
            </Text>
            <Text className="font-mono text-xs text-text-secondary uppercase">
              Rate
            </Text>
          </View>
        </View>
      )}

      {/* Next Milestone */}
      {summary?.nextMilestone && (
        <View className="bg-terminal-bg border-2 border-accent-yellow/40 p-4 mb-4" style={{ borderRadius: 0 }}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-accent-yellow">
              Next Milestone
            </Text>
            <Text className="font-mono text-sm font-bold text-accent-yellow">
              {Math.round(summary.nextMilestone.progress_percentage)}%
            </Text>
          </View>
          <Text className="font-mono text-sm font-semibold text-text-primary mb-3">
            {summary.nextMilestone.title.toUpperCase()}
          </Text>

          {/* Terminal Progress Bar */}
          <View className="h-6 border-2 border-terminal-border bg-terminal-bg mb-2" style={{ borderRadius: 0 }}>
            <View
              className="h-full bg-accent-yellow"
              style={{
                width: `${summary.nextMilestone.progress_percentage}%`,
                borderRadius: 0
              }}
            />
          </View>

          <View className="flex-row justify-between">
            <Text className="font-mono text-xs text-text-secondary">
              {formatGoalValue(summary.nextMilestone).current}
            </Text>
            <Text className="font-mono text-xs text-text-secondary">
              {formatGoalValue(summary.nextMilestone).target}
            </Text>
          </View>
        </View>
      )}

      {/* Goals List */}
      <View className="space-y-3 mb-4">
        {goals.slice(0, 4).map((goal) => (
          <View key={goal.id} className="bg-terminal-bg border-2 border-terminal-border p-3" style={{ borderRadius: 0 }}>
            {/* Goal Header */}
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="font-mono text-xs text-accent-yellow uppercase mr-2">
                    [{getCategoryLabel(goal.category)}]
                  </Text>
                  <Text className="font-mono text-xs text-text-primary flex-1">
                    {goal.title.toUpperCase()}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className={`font-mono text-xs ${getStatusColor(goal.achievement_status)}`}>
                    {getStatusLabel(goal.achievement_status)}
                  </Text>
                  <Text className="font-mono text-xs text-text-secondary">
                    {formatGoalValue(goal).current} / {formatGoalValue(goal).target}
                  </Text>
                </View>
              </View>
              <Text className="font-mono text-sm font-bold text-text-primary">
                {Math.round(goal.progress_percentage)}%
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="h-4 border border-terminal-border bg-terminal-panel" style={{ borderRadius: 0 }}>
              <View
                className={`h-full ${
                  goal.achievement_status === 'achieved' ? 'bg-discipline-run' :
                  goal.category === 'performance' ? 'bg-discipline-swim' :
                  goal.category === 'training' ? 'bg-discipline-run' :
                  'bg-discipline-bike'
                }`}
                style={{
                  width: `${goal.progress_percentage}%`,
                  borderRadius: 0
                }}
              />
            </View>

            {/* Goal Insight */}
            {goal.progress_percentage > 80 && goal.achievement_status !== 'achieved' && (
              <Text className="font-mono text-xs text-discipline-run mt-2">
                → ALMOST THERE!
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Footer */}
      <View className="pt-4 border-t border-terminal-border">
        <View className="flex-row items-center justify-between">
          <Text className="font-mono text-xs text-text-secondary uppercase">
            {goals.length} GOAL{goals.length !== 1 ? 'S' : ''}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Text className="font-mono text-xs font-semibold text-accent-yellow uppercase tracking-wider">
              VIEW ALL →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TerminalCard>
  );
};
