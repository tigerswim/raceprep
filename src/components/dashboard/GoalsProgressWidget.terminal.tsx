import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../services/supabase';
import { terminalColors, terminalText, terminalView, mergeStyles } from '../ui/terminal/terminalStyles';

interface Goal {
  id: string;
  title: string;
  type: 'race_count' | 'race_time' | 'training_volume' | 'transition_time' | 'other';
  target_value: string;
  current_value: string;
  target_date?: string;
  achievement_status: 'not_started' | 'in_progress' | 'achieved' | 'missed';
  progress_percentage: number;
}

interface GoalSummary {
  total: number;
  achieved: number;
  inProgress: number;
  achievementRate: number;
}

/**
 * GoalsProgressWidget - Terminal Design Version (Simplified for Web)
 * Uses inline styles instead of Tailwind classes
 */
export const GoalsProgressWidgetTerminal: React.FC = () => {
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

      if (error || !userGoals || userGoals.length === 0) {
        setGoals([]);
        setSummary(null);
        return;
      }

      const processedGoals: Goal[] = userGoals.map(g => ({
        ...g,
        progress_percentage: calculateProgressPercentage(g),
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
  };

  const calculateProgressPercentage = (goal: any): number => {
    const current = parseFloat(goal.current_value) || 0;
    const target = parseFloat(goal.target_value) || 1;
    return Math.min(100, (current / target) * 100);
  };

  const calculateSummary = (goals: Goal[]): GoalSummary => {
    const total = goals.length;
    const achieved = goals.filter(g => g.achievement_status === 'achieved').length;
    const inProgress = goals.filter(g => g.achievement_status === 'in_progress').length;
    const achievementRate = total > 0 ? (achieved / total) * 100 : 0;

    return { total, achieved, inProgress, achievementRate };
  };

  if (isLoading) {
    return (
      <View style={terminalView.card}>
        <Text style={terminalText.header}>Goals Progress</Text>
        <Text style={mergeStyles(terminalText.secondary, { marginTop: 16 })}>
          Loading goals...
        </Text>
      </View>
    );
  }

  if (!summary || goals.length === 0) {
    return (
      <View style={terminalView.card}>
        <Text style={terminalText.header}>Goals Progress</Text>
        <Text style={mergeStyles(terminalText.secondary, { marginTop: 16, textAlign: 'center' })}>
          NO GOALS SET
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile')}
          style={{ backgroundColor: terminalColors.yellow, padding: 12, marginTop: 16 }}
        >
          <Text style={mergeStyles(terminalText.small, { color: terminalColors.bg, textAlign: 'center', fontWeight: 'bold' })}>
            SET GOALS
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={terminalView.card}>
      {/* Header */}
      <View style={terminalView.spaceBetween}>
        <View>
          <Text style={terminalText.header}>Goals Progress</Text>
          <Text style={mergeStyles(terminalText.small, { marginTop: 4 })}>
            {goals.length} ACTIVE
          </Text>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={{ flexDirection: 'row', marginTop: 24, marginBottom: 24, borderWidth: 2, borderColor: terminalColors.border }}>
        <View style={{ flex: 1, alignItems: 'center', padding: 12, backgroundColor: terminalColors.panel, borderRightWidth: 2, borderRightColor: terminalColors.border }}>
          <Text style={mergeStyles(terminalText.large, { color: terminalColors.run })}>
            {summary.achieved}
          </Text>
          <Text style={mergeStyles(terminalText.small, { marginTop: 4 })}>
            DONE
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', padding: 12, backgroundColor: terminalColors.panel, borderRightWidth: 2, borderRightColor: terminalColors.border }}>
          <Text style={mergeStyles(terminalText.large, { color: terminalColors.yellow })}>
            {summary.inProgress}
          </Text>
          <Text style={mergeStyles(terminalText.small, { marginTop: 4 })}>
            ACTIVE
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', padding: 12, backgroundColor: terminalColors.panel }}>
          <Text style={terminalText.large}>
            {Math.round(summary.achievementRate)}%
          </Text>
          <Text style={mergeStyles(terminalText.small, { marginTop: 4 })}>
            RATE
          </Text>
        </View>
      </View>

      {/* Active Goals (top 3) */}
      <View>
        <Text style={mergeStyles(terminalText.subheader, { marginBottom: 12 })}>
          ACTIVE GOALS
        </Text>
        <View style={{ gap: 8 }}>
          {goals.slice(0, 3).map((goal) => (
            <View key={goal.id} style={mergeStyles(terminalView.panel, { padding: 12 })}>
              <View style={terminalView.spaceBetween}>
                <Text style={mergeStyles(terminalText.primary, { fontSize: 12, flex: 1 })}>
                  {goal.title}
                </Text>
                <Text style={mergeStyles(terminalText.secondary, { fontSize: 12, marginLeft: 8 })}>
                  {Math.round(goal.progress_percentage)}%
                </Text>
              </View>
              {/* Progress bar */}
              <View style={{ height: 4, backgroundColor: terminalColors.border, marginTop: 8 }}>
                <View style={{
                  height: 4,
                  width: `${goal.progress_percentage}%`,
                  backgroundColor: goal.achievement_status === 'achieved' ? terminalColors.run : terminalColors.yellow
                }} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={mergeStyles(terminalView.borderTop, { marginTop: 16 })}>
        <View style={terminalView.spaceBetween}>
          <Text style={terminalText.small}>
            {summary.total} TOTAL GOALS
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Text style={terminalText.yellow}>MANAGE →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
