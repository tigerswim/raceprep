import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  TbSwimming,
  TbBike,
  TbRun,
  TbWeight,
  TbBed,
  TbFlame,
} from 'react-icons/tb';
import { trainingPlanService } from '../../services/trainingPlanService';
import type { TrainingPlanProgress } from '../../types/trainingPlans';

interface TrainingPlanProgressWidgetProps {
  userId: string;
  onViewDetails?: () => void;
}

export const TrainingPlanProgressWidget: React.FC<TrainingPlanProgressWidgetProps> = ({
  userId,
  onViewDetails,
}) => {
  const router = useRouter();
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [progress, setProgress] = useState<TrainingPlanProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, [userId]);

  const handleViewCalendar = () => {
    if (activePlanId && progress) {
      router.push(`/training-calendar?planId=${activePlanId}&currentWeek=${progress.currentWeek}`);
    }
  };

  const handleStartPlan = () => {
    router.push("/training-plans");
  };

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's active training plan
      const plansResult = await trainingPlanService.getUserTrainingPlans(userId, 'active');

      if (plansResult.error) {
        setError(plansResult.error.message);
        return;
      }

      if (!plansResult.data || plansResult.data.length === 0) {
        setProgress(null);
        setActivePlanId(null);
        return;
      }

      // Get progress for the first active plan
      const activePlan = plansResult.data[0];
      setActivePlanId(activePlan.id);
      setCurrentWeek(activePlan.current_week || 1);
      const progressResult = await trainingPlanService.getTrainingPlanProgress(activePlan.id);

      if (progressResult.error) {
        setError(progressResult.error.message);
      } else {
        setProgress(progressResult.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Training Plan</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Training Plan</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!progress) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.title}>Training Plan</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No active training plan</Text>
          <TouchableOpacity onPress={handleStartPlan}>
            <LinearGradient
              colors={['#3B82F6', '#F97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>Start a Plan</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const completionPercentage = progress.totalWorkouts > 0
    ? Math.round((progress.completedWorkouts / progress.totalWorkouts) * 100)
    : 0;

  return (
    <TouchableOpacity style={styles.container} onPress={handleViewCalendar} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title}>Training Plan</Text>
        <Text style={styles.weekBadge}>
          Week {progress.currentWeek}/{progress.totalWeeks}
        </Text>
      </View>

      {/* Progress Ring */}
      <View style={styles.progressRing}>
        <View style={styles.progressRingInner}>
          <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
          <Text style={styles.progressLabel}>Complete</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{progress.completedWorkouts}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{progress.adherenceRate}%</Text>
          <Text style={styles.statLabel}>Adherence</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {progress.totalWorkouts - progress.completedWorkouts}
          </Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>

      {/* This Week Summary */}
      {progress.upcomingWorkouts && progress.upcomingWorkouts.length > 0 && (
        <View style={styles.upcomingSection}>
          <Text style={styles.upcomingTitle}>This Week:</Text>
          <View style={styles.upcomingWorkouts}>
            {progress.upcomingWorkouts.slice(0, 3).map((workout, index) => (
              <View key={index} style={styles.upcomingWorkout}>
                {getDisciplineIcon(workout.discipline)}
                <Text style={styles.workoutDetail}>
                  {workout.discipline} • {workout.duration_minutes || '?'} min
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity onPress={handleViewCalendar}>
        <LinearGradient
          colors={['#3B82F6', '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.viewDetailsButton}
        >
          <Text style={styles.viewDetailsText}>View Calendar →</Text>
        </LinearGradient>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const getDisciplineIcon = (discipline: string) => {


  switch (discipline.toLowerCase()) {
    case 'swim':
      return <TbSwimming size={16} color="#007AFF" style={{ marginRight: 4 }} />;
    case 'bike':
      return <TbBike size={16} color="#FF9500" style={{ marginRight: 4 }} />;
    case 'run':
      return <TbRun size={16} color="#34C759" style={{ marginRight: 4 }} />;
    case 'brick':
      return <TbFlame size={16} color="#AF52DE" style={{ marginRight: 4 }} />;
    case 'strength':
      return <TbWeight size={16} color="#FF3B30" style={{ marginRight: 4 }} />;
    case 'rest':
      return <TbBed size={16} color="#8E8E93" style={{ marginRight: 4 }} />;
    default:
      return <TbBed size={16} color="#8E8E93" style={{ marginRight: 4 }} />;
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 1)',
  },
  weekBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  progressRing: {
    alignItems: 'center',
    marginVertical: 20,
  },
  progressRingInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  upcomingSection: {
    marginTop: 16,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 1)',
    marginBottom: 12,
  },
  upcomingWorkouts: {
    gap: 8,
  },
  upcomingWorkout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutDiscipline: {
    fontSize: 20,
  },
  workoutDetail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  viewDetailsButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  startButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
  },
});
