import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { TrainingCalendar } from '../src/components/training/TrainingCalendar';
import { WorkoutDetailModal } from '../src/components/training/WorkoutDetailModal';
import { AuthGuard } from '../src/components/AuthGuard';
import type { WorkoutWithCompletion } from '../src/types/trainingPlans';

// Terminal color palette
const terminalColors = {
  bg: '#0A0E14',
  panel: '#0F1419',
  border: '#1C2127',
  textPrimary: '#F8F8F2',
  textSecondary: '#B4B8C5',
  yellow: '#FFD866',
  swim: '#00D4FF',
  bike: '#FF6B35',
  run: '#4ECDC4',
};

export default function TrainingCalendarScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const planId = params.planId as string;
  const currentWeek = parseInt(params.currentWeek as string) || 1;

  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutWithCompletion | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleWorkoutUpdated = () => {
    setSelectedWorkout(null);
    setRefreshKey(prev => prev + 1); // Force calendar to refresh
  };

  // Validate planId
  if (!planId || planId === 'undefined') {
    return (
      <AuthGuard>
        <View style={styles.container}>
          <Stack.Screen
            options={{
              title: 'TRAINING CALENDAR',
              headerShown: true,
              headerStyle: {
                backgroundColor: terminalColors.bg,
              },
              headerTintColor: terminalColors.yellow,
              headerTitleStyle: {
                color: terminalColors.textPrimary,
                fontFamily: 'monospace',
                fontWeight: 'bold',
                letterSpacing: 2,
              },
            }}
          />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>ERROR: NO TRAINING PLAN SPECIFIED</Text>
            <Text style={styles.errorDescription}>
              → PLEASE SELECT A TRAINING PLAN TO VIEW YOUR CALENDAR
            </Text>
            <TouchableOpacity
              style={styles.goToPlansButton}
              onPress={() => router.push('/training-plans')}
            >
              <Text style={styles.goToPlansButtonText}>[GO TO TRAINING PLANS]</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'TRAINING CALENDAR',
            headerShown: true,
            headerStyle: {
              backgroundColor: terminalColors.bg,
            },
            headerTintColor: terminalColors.yellow,
            headerTitleStyle: {
              color: terminalColors.textPrimary,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              letterSpacing: 2,
            },
          }}
        />

        <TrainingCalendar
          key={refreshKey}
          planId={planId}
          currentWeek={currentWeek}
          onWorkoutPress={setSelectedWorkout}
        />

        <WorkoutDetailModal
          visible={selectedWorkout !== null}
          workout={selectedWorkout}
          planId={planId}
          onClose={() => setSelectedWorkout(null)}
          onWorkoutUpdated={handleWorkoutUpdated}
        />
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: terminalColors.bg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  errorDescription: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: terminalColors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  goToPlansButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: terminalColors.yellow,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  goToPlansButtonText: {
    fontFamily: 'monospace',
    color: terminalColors.yellow,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
});
