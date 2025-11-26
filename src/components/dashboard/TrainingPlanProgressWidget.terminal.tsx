import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { trainingPlanService } from '../../services/trainingPlanService';
import type { TrainingPlanProgress } from '../../types/trainingPlans';
import { terminalColors, terminalText, terminalView, mergeStyles } from '../ui/terminal/terminalStyles';

export const TrainingPlanProgressWidgetTerminal: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [progress, setProgress] = useState<TrainingPlanProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgress();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProgress = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const plansResult = await trainingPlanService.getUserTrainingPlans(user.id, 'active');

      if (plansResult.error || !plansResult.data || plansResult.data.length === 0) {
        setActivePlanId(null);
        setProgress(null);
        return;
      }

      const activePlan = plansResult.data[0];
      setActivePlanId(activePlan.id);

      const progressResult = await trainingPlanService.getTrainingPlanProgress(activePlan.id);
      if (!progressResult.error && progressResult.data) {
        setProgress(progressResult.data);
      }
    } catch (error) {
      console.error('Error loading training plan progress:', error);
      setActivePlanId(null);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <View style={terminalView.card}>
        <Text style={terminalText.header}>Training Plan</Text>
        <Text style={mergeStyles(terminalText.secondary, { marginTop: 16 })}>
          Loading plan...
        </Text>
      </View>
    );
  }

  if (!activePlanId || !progress) {
    return (
      <View style={terminalView.card}>
        <Text style={terminalText.header}>Training Plan</Text>
        <Text style={mergeStyles(terminalText.secondary, { marginTop: 16, textAlign: 'center' })}>
          NO ACTIVE PLAN
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/training-plans')}
          style={{ backgroundColor: terminalColors.yellow, padding: 12, marginTop: 16 }}
        >
          <Text style={mergeStyles(terminalText.small, { color: terminalColors.bg, textAlign: 'center', fontWeight: 'bold' })}>
            START PLAN
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
          <Text style={terminalText.header}>Training Plan</Text>
          <Text style={mergeStyles(terminalText.small, { marginTop: 4 })}>
            WEEK {progress.currentWeek} OF {progress.totalWeeks}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/training-calendar')}>
          <Text style={terminalText.yellow}>CALENDAR →</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={{ marginTop: 24, marginBottom: 24 }}>
        <View style={terminalView.spaceBetween}>
          <Text style={terminalText.small}>PROGRESS</Text>
          <Text style={terminalText.small}>
            {Math.round(progress.completionPercentage)}%
          </Text>
        </View>
        <View style={{ height: 8, backgroundColor: terminalColors.border, marginTop: 8 }}>
          <View style={{
            height: 8,
            width: `${progress.completionPercentage}%`,
            backgroundColor: terminalColors.yellow
          }} />
        </View>
      </View>

      {/* This Week */}
      <View style={{ marginBottom: 24 }}>
        <Text style={mergeStyles(terminalText.subheader, { marginBottom: 12 })}>
          THIS WEEK
        </Text>
        <View style={terminalView.panel}>
          <View style={terminalView.spaceBetween}>
            <Text style={terminalText.primary}>
              {progress.completedWorkouts} / {progress.totalWorkoutsThisWeek}
            </Text>
            <Text style={terminalText.secondary}>
              WORKOUTS
            </Text>
          </View>
        </View>
      </View>

      {/* Upcoming Workout */}
      {progress.nextWorkout && (
        <View style={{ marginBottom: 16 }}>
          <Text style={mergeStyles(terminalText.subheader, { marginBottom: 12 })}>
            NEXT WORKOUT
          </Text>
          <View style={mergeStyles(terminalView.panel, { padding: 12 })}>
            <Text style={mergeStyles(terminalText.primary, { fontSize: 12, fontWeight: '600' })}>
              {progress.nextWorkout.name}
            </Text>
            <Text style={mergeStyles(terminalText.small, { marginTop: 8 })}>
              {progress.nextWorkout.type?.toUpperCase()} • {progress.nextWorkout.duration}
            </Text>
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={terminalView.borderTop}>
        <View style={terminalView.spaceBetween}>
          <Text style={terminalText.small}>
            {progress.daysRemaining} DAYS LEFT
          </Text>
          <TouchableOpacity onPress={() => router.push('/training-plans')}>
            <Text style={terminalText.yellow}>MANAGE →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
