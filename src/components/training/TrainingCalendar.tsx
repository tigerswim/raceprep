import { logger } from '../../utils/logger';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import {
  TbSwimming,
  TbBike,
  TbRun,
  TbWeight,
  TbBed,
  TbFlame,
  TbEdit,
  TbTrash,
  TbBrandStrava,
} from 'react-icons/tb';
import { trainingPlanService } from '../../services/trainingPlanService';
import type { WorkoutWithCompletion } from '../../types/trainingPlans';

interface TrainingCalendarProps {
  planId: string;
  currentWeek: number;
  onWorkoutPress: (workout: WorkoutWithCompletion) => void;
  onWeekChange?: (weekNumber: number) => void;
}

export const TrainingCalendar: React.FC<TrainingCalendarProps> = ({
  planId,
  currentWeek,
  onWorkoutPress,
  onWeekChange,
}) => {
  const [weekNumber, setWeekNumber] = useState(currentWeek);
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutWithCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedPlanName, setEditedPlanName] = useState('');
  const [planData, setPlanData] = useState<any>(null);

  // Check for invalid planId
  const isInvalidPlan = !planId || planId === 'undefined';

  useEffect(() => {
    if (!isInvalidPlan) {
      loadWeekWorkouts();
      loadPlanDetails();
    }
  }, [planId, weekNumber, isInvalidPlan]);

  // Return error state after all hooks
  if (isInvalidPlan) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Invalid training plan ID</Text>
        <Text style={styles.errorDescription}>
          Please select a valid training plan to view your calendar.
        </Text>
      </View>
    );
  }

  const loadPlanDetails = async () => {
    try {
      const result = await trainingPlanService.getUserTrainingPlan(planId);
      if (!result.error && result.data) {
        setPlanData(result.data);
        setEditedPlanName(result.data.plan_name);
      }
    } catch (err) {
      logger.error('Failed to load plan details:', err);
    }
  };

  const loadWeekWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await trainingPlanService.getScheduledWorkouts(planId, weekNumber);

      if (result.error) {
        setError(result.error.message);
      } else {
        setWorkouts(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    if (weekNumber > 1) {
      const newWeek = weekNumber - 1;
      setWeekNumber(newWeek);
      onWeekChange?.(newWeek);
    }
  };

  const handleNextWeek = () => {
    const newWeek = weekNumber + 1;
    setWeekNumber(newWeek);
    onWeekChange?.(newWeek);
  };

  const handleEditPlan = () => {
    setShowEditModal(true);
  };

  const handleSavePlan = async () => {
    if (!editedPlanName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter a plan name');
      } else {
        Alert.alert('Error', 'Please enter a plan name');
      }
      return;
    }

    try {
      const result = await trainingPlanService.updateUserTrainingPlan(planId, {
        plan_name: editedPlanName.trim(),
      });

      if (result.error) {
        if (Platform.OS === 'web') {
          window.alert(`Failed to update plan: ${result.error}`);
        } else {
          Alert.alert('Error', `Failed to update plan: ${result.error}`);
        }
      } else {
        setShowEditModal(false);
        loadPlanDetails(); // Reload to show updated name
        if (Platform.OS === 'web') {
          window.alert('Training plan updated successfully');
        } else {
          Alert.alert('Success', 'Training plan updated successfully');
        }
      }
    } catch (err) {
      if (Platform.OS === 'web') {
        window.alert('Failed to update training plan');
      } else {
        Alert.alert('Error', 'Failed to update training plan');
      }
    }
  };

  const handleDeletePlan = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Are you sure you want to delete this training plan? This action cannot be undone.'
      );

      if (confirmed) {
        try {
          const result = await trainingPlanService.deleteUserTrainingPlan(planId);

          if (result.error) {
            window.alert(`Failed to delete plan: ${result.error.message}`);
          } else {
            window.alert('Training plan deleted successfully');
            router.back();
          }
        } catch (err) {
          window.alert('Failed to delete training plan');
        }
      }
    } else {
      Alert.alert(
        'Delete Training Plan',
        'Are you sure you want to delete this training plan? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await trainingPlanService.deleteUserTrainingPlan(planId);

                if (result.error) {
                  Alert.alert('Error', `Failed to delete plan: ${result.error.message}`);
                } else {
                  Alert.alert('Success', 'Training plan deleted successfully', [
                    {
                      text: 'OK',
                      onPress: () => router.back(),
                    },
                  ]);
                }
              } catch (err) {
                Alert.alert('Error', 'Failed to delete training plan');
              }
            },
          },
        ]
      );
    }
  };

  const getDisciplineColor = (discipline: string): string => {
    switch (discipline.toLowerCase()) {
      case 'swim':
        return '#00D4FF'; // terminal swim color
      case 'bike':
        return '#FF6B35'; // terminal bike color
      case 'run':
        return '#4ECDC4'; // terminal run color
      case 'brick':
        return '#AF52DE';
      case 'strength':
        return '#FF3B30';
      case 'rest':
        return '#B4B8C5'; // terminal text-secondary
      default:
        return '#B4B8C5';
    }
  };

  const getDisciplineIcon = (discipline: string) => {
    const iconSize = 20;

    switch (discipline.toLowerCase()) {
      case 'swim':
        return <TbSwimming size={iconSize} color="#00D4FF" />;
      case 'bike':
        return <TbBike size={iconSize} color="#FF6B35" />;
      case 'run':
        return <TbRun size={iconSize} color="#4ECDC4" />;
      case 'brick':
        return <TbFlame size={iconSize} color="#AF52DE" />;
      case 'strength':
        return <TbWeight size={iconSize} color="#FF3B30" />;
      case 'rest':
        return <TbBed size={iconSize} color="#B4B8C5" />;
      default:
        return <TbBed size={iconSize} color="#B4B8C5" />;
    }
  };

  const getDayName = (dayNumber: number): string => {
    const days = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[dayNumber] || '';
  };

  const renderWorkoutCard = (workout: WorkoutWithCompletion) => {
    const disciplineColor = getDisciplineColor(workout.discipline);
    const isCompleted = workout.completion?.completed_date != null;
    const isSkipped = workout.completion?.skipped === true;
    const isOverdue = workout.isOverdue && !isCompleted && !isSkipped;

    return (
      <TouchableOpacity
        key={workout.id}
        style={[
          styles.workoutCard,
          isCompleted && styles.workoutCardCompleted,
          isSkipped && styles.workoutCardSkipped,
          isOverdue && styles.workoutCardOverdue,
        ]}
        onPress={() => onWorkoutPress(workout)}
      >
        <View style={styles.workoutHeader}>
          <View style={styles.workoutDay}>
            <View>
              <Text style={styles.dayName}>{getDayName(workout.day_of_week)}</Text>
              {workout.scheduled_date && (
                <Text style={styles.scheduledDate}>
                  {new Date(workout.scheduled_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
              )}
            </View>
            <Text style={styles.dayIcon}>{getDisciplineIcon(workout.discipline)}</Text>
          </View>

          {isCompleted && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>✓</Text>
            </View>
          )}
          {isSkipped && (
            <View style={[styles.statusBadge, styles.statusBadgeSkipped]}>
              <Text style={styles.statusBadgeText}>⊘</Text>
            </View>
          )}
          {isOverdue && (
            <View style={[styles.statusBadge, styles.statusBadgeOverdue]}>
              <Text style={styles.statusBadgeText}>!</Text>
            </View>
          )}
        </View>

        <View style={[styles.disciplineBar, { backgroundColor: disciplineColor }]} />

        <View style={styles.workoutBody}>
          <Text style={styles.disciplineText}>{workout.discipline.toUpperCase()}</Text>
          <Text style={styles.workoutType}>{workout.workout_type}</Text>

          <View style={styles.workoutDetails}>
            {workout.duration_minutes && (
              <Text style={styles.detailText}>⏱️ {workout.duration_minutes} min</Text>
            )}
            {workout.distance_miles && (
              <Text style={styles.detailText}>📏 {workout.distance_miles} mi</Text>
            )}
          </View>

          {workout.intensity_description && (
            <Text style={styles.intensityText} numberOfLines={1}>
              {workout.intensity_description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const calculateWeekStats = () => {
    const completed = workouts.filter(w => w.completion?.completed_date).length;
    const skipped = workouts.filter(w => w.completion?.skipped).length;
    const total = workouts.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, skipped, total, completionRate };
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={terminalColors.yellow} />
        <Text style={styles.errorText}>LOADING...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadWeekWorkouts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stats = calculateWeekStats();

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Training Calendar</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push(`/strava-match-review?planId=${planId}`)}
          >
            <TbBrandStrava size={20} color="#FC4C02" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleEditPlan}>
            <TbEdit size={20} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleDeletePlan}>
            <TbTrash size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Week Navigation */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity
          style={[styles.navButton, weekNumber === 1 && styles.navButtonDisabled]}
          onPress={handlePreviousWeek}
          disabled={weekNumber === 1}
        >
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.weekInfo}>
          <Text style={styles.weekLabel}>Week {weekNumber}</Text>
          <Text style={styles.completionRate}>{stats.completionRate}% complete</Text>
        </View>

        <TouchableOpacity style={styles.navButton} onPress={handleNextWeek}>
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Week Stats */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.skipped}</Text>
          <Text style={styles.statLabel}>Skipped</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total - stats.completed - stats.skipped}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>

      {/* Workouts Grid */}
      <ScrollView
        style={styles.workoutsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.workoutsContent}
      >
        {workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No workouts scheduled for this week</Text>
          </View>
        ) : (
          workouts.map(renderWorkoutCard)
        )}
      </ScrollView>

      {/* Edit Plan Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Training Plan</Text>

            <Text style={styles.modalLabel}>Plan Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editedPlanName}
              onChangeText={setEditedPlanName}
              placeholder="Enter plan name"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowEditModal(false);
                  setEditedPlanName(planData?.plan_name || '');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSavePlan}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: terminalColors.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: terminalColors.bg,
    padding: 24,
  },
  weekNavigation: {
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: terminalColors.panel,
    borderBottomWidth: 2,
    borderBottomColor: terminalColors.border,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: terminalColors.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: terminalColors.yellow,
  },
  navButtonDisabled: {
    backgroundColor: terminalColors.border,
    borderColor: terminalColors.border,
  },
  navButtonText: {
    fontSize: 20,
    fontFamily: 'monospace',
    color: terminalColors.bg,
    fontWeight: 'bold',
  },
  weekInfo: {
    alignItems: 'center',
  },
  weekLabel: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: terminalColors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  completionRate: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: terminalColors.textSecondary,
    marginTop: 4,
  },
  statsBar: {
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: terminalColors.panel,
    borderBottomWidth: 2,
    borderBottomColor: terminalColors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: 'bold',
    color: terminalColors.yellow,
  },
  statLabel: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: terminalColors.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  workoutsContainer: {
    flex: 1,
  },
  workoutsContent: {
    padding: 16,
  },
  workoutCard: {
    borderWidth: 2,
    borderColor: terminalColors.border,
    backgroundColor: terminalColors.panel,
    borderRadius: 0,
    marginBottom: 12,
    overflow: 'hidden',
  },
  workoutCardCompleted: {
    opacity: 0.7,
    borderWidth: 2,
    borderColor: terminalColors.run,
  },
  workoutCardSkipped: {
    opacity: 0.5,
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  workoutCardOverdue: {
    borderWidth: 2,
    borderColor: terminalColors.bike,
  },
  disciplineBar: {
    height: 4,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 0,
  },
  workoutDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayName: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
    color: terminalColors.textPrimary,
    textTransform: 'uppercase',
  },
  scheduledDate: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: terminalColors.textSecondary,
    marginTop: 2,
  },
  dayIcon: {
    fontSize: 20,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 0,
    backgroundColor: terminalColors.run,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeSkipped: {
    backgroundColor: '#FF3B30',
  },
  statusBadgeOverdue: {
    backgroundColor: terminalColors.bike,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  workoutBody: {
    padding: 12,
  },
  disciplineText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: 'bold',
    color: terminalColors.swim,
    marginBottom: 4,
    letterSpacing: 1.2,
  },
  workoutType: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
    color: terminalColors.textPrimary,
    marginBottom: 8,
  },
  workoutDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  detailText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: terminalColors.textSecondary,
  },
  intensityText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: terminalColors.textSecondary,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: terminalColors.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  errorText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  errorDescription: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: terminalColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: terminalColors.yellow,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: terminalColors.yellow,
  },
  retryButtonText: {
    fontFamily: 'monospace',
    color: terminalColors.bg,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: terminalColors.border,
  },
  backButtonText: {
    fontFamily: 'monospace',
    color: terminalColors.yellow,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: 'bold',
    color: terminalColors.textPrimary,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: terminalColors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: terminalColors.panel,
    borderRadius: 0,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: terminalColors.border,
  },
  modalTitle: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: 'bold',
    color: terminalColors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  modalLabel: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    color: terminalColors.yellow,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  modalInput: {
    backgroundColor: terminalColors.bg,
    borderWidth: 2,
    borderColor: terminalColors.border,
    borderRadius: 0,
    padding: 12,
    fontFamily: 'monospace',
    fontSize: 14,
    color: terminalColors.textPrimary,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 0,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: terminalColors.border,
  },
  modalButtonSave: {
    backgroundColor: terminalColors.yellow,
    borderWidth: 2,
    borderColor: terminalColors.yellow,
  },
  modalButtonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    color: terminalColors.textPrimary,
    letterSpacing: 1.2,
  },
});
