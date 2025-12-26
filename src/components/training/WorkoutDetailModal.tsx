import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { trainingPlanService } from '../../services/trainingPlanService';
import type { WorkoutWithCompletion } from '../../types/trainingPlans';

interface WorkoutDetailModalProps {
  visible: boolean;
  workout: WorkoutWithCompletion | null;
  planId: string;
  onClose: () => void;
  onWorkoutUpdated?: () => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  visible,
  workout,
  planId,
  onClose,
  onWorkoutUpdated,
}) => {
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [showSkipForm, setShowSkipForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [completionData, setCompletionData] = useState({
    actual_duration_minutes: '',
    actual_distance_miles: '',
    perceived_effort: '5',
    notes: '',
  });

  const [skipReason, setSkipReason] = useState('');

  if (!workout) return null;

  const resetForms = () => {
    setShowCompleteForm(false);
    setShowSkipForm(false);
    setCompletionData({
      actual_duration_minutes: '',
      actual_distance_miles: '',
      perceived_effort: '5',
      notes: '',
    });
    setSkipReason('');
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleCompleteWorkout = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const result = await trainingPlanService.completeWorkout({
        user_training_plan_id: planId,
        planned_workout_id: workout.id,
        scheduled_date: new Date().toISOString().split('T')[0],
        actual_duration_minutes: completionData.actual_duration_minutes 
          ? parseInt(completionData.actual_duration_minutes) 
          : undefined,
        actual_distance_miles: completionData.actual_distance_miles 
          ? parseFloat(completionData.actual_distance_miles) 
          : undefined,
        perceived_effort: parseInt(completionData.perceived_effort),
        notes: completionData.notes || undefined,
      });

      if (result.error) {
        Alert.alert('Error', result.error.message);
      } else {
        Alert.alert('Success', 'Workout completed!');
        onWorkoutUpdated?.();
        handleClose();
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to complete workout');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipWorkout = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const result = await trainingPlanService.skipWorkout({
        user_training_plan_id: planId,
        planned_workout_id: workout.id,
        scheduled_date: new Date().toISOString().split('T')[0],
        skip_reason: skipReason || undefined,
      });

      if (result.error) {
        Alert.alert('Error', result.error.message);
      } else {
        Alert.alert('Success', 'Workout marked as skipped');
        onWorkoutUpdated?.();
        handleClose();
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to skip workout');
    } finally {
      setSubmitting(false);
    }
  };

  const getDisciplineColor = (discipline: string): string => {
    switch (discipline.toLowerCase()) {
      case 'swim':
        return '#06b6d4'; // discipline-swim
      case 'bike':
        return '#fb923c'; // discipline-bike
      case 'run':
        return '#4ade80'; // discipline-run
      case 'brick':
        return '#fbbf24'; // accent-yellow
      case 'strength':
        return '#f87171'; // red
      case 'rest':
        return '#6b7f86'; // text-secondary
      default:
        return '#6b7f86';
    }
  };

  const renderWorkoutStructure = () => {
    if (!workout.structure) return null;

    const structure = workout.structure as any;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workout Structure</Text>
        
        {structure.warmup && (
          <View style={styles.structureBlock}>
            <Text style={styles.structureTitle}>Warmup ({structure.warmup.duration} min)</Text>
            <Text style={styles.structureDescription}>{structure.warmup.description}</Text>
          </View>
        )}

        {structure.main_set && (
          <View style={styles.structureBlock}>
            <Text style={styles.structureTitle}>Main Set ({structure.main_set.duration} min)</Text>
            <Text style={styles.structureDescription}>{structure.main_set.description}</Text>
          </View>
        )}

        {structure.cooldown && (
          <View style={styles.structureBlock}>
            <Text style={styles.structureTitle}>Cooldown ({structure.cooldown.duration} min)</Text>
            <Text style={styles.structureDescription}>{structure.cooldown.description}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCompletionForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Log Your Workout</Text>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Duration (minutes)</Text>
        <TextInput
          style={styles.formInput}
          placeholder={workout.duration_minutes?.toString() || "45"}
          keyboardType="numeric"
          value={completionData.actual_duration_minutes}
          onChangeText={(text) => setCompletionData({ ...completionData, actual_duration_minutes: text })}
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Distance (miles)</Text>
        <TextInput
          style={styles.formInput}
          placeholder={workout.distance_miles?.toString() || "5.0"}
          keyboardType="decimal-pad"
          value={completionData.actual_distance_miles}
          onChangeText={(text) => setCompletionData({ ...completionData, actual_distance_miles: text })}
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Perceived Effort (1-10)</Text>
        <View style={styles.effortButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.effortButton,
                completionData.perceived_effort === level.toString() && styles.effortButtonActive,
              ]}
              onPress={() => setCompletionData({ ...completionData, perceived_effort: level.toString() })}
            >
              <Text
                style={[
                  styles.effortButtonText,
                  completionData.perceived_effort === level.toString() && styles.effortButtonTextActive,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Notes (optional)</Text>
        <TextInput
          style={[styles.formInput, styles.formInputMultiline]}
          placeholder="How did it feel? Any observations?"
          multiline
          numberOfLines={3}
          value={completionData.notes}
          onChangeText={(text) => setCompletionData({ ...completionData, notes: text })}
        />
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={styles.formCancelButton}
          onPress={() => setShowCompleteForm(false)}
        >
          <Text style={styles.formCancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.formSubmitButton, submitting && styles.formSubmitButtonDisabled]}
          onPress={handleCompleteWorkout}
          disabled={submitting}
        >
          <Text style={styles.formSubmitButtonText}>
            {submitting ? 'Saving...' : 'Complete Workout'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSkipForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Skip Workout</Text>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Reason (optional)</Text>
        <TextInput
          style={[styles.formInput, styles.formInputMultiline]}
          placeholder="Why are you skipping this workout?"
          multiline
          numberOfLines={3}
          value={skipReason}
          onChangeText={setSkipReason}
        />
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={styles.formCancelButton}
          onPress={() => setShowSkipForm(false)}
        >
          <Text style={styles.formCancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.formSubmitButton, styles.formSubmitButtonSkip, submitting && styles.formSubmitButtonDisabled]}
          onPress={handleSkipWorkout}
          disabled={submitting}
        >
          <Text style={styles.formSubmitButtonText}>
            {submitting ? 'Saving...' : 'Skip Workout'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const isCompleted = workout.completion?.completed_date != null;
  const isSkipped = workout.completion?.skipped === true;
  const disciplineColor = getDisciplineColor(workout.discipline);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={terminalStyles.modalOverlay}>
        <View style={terminalStyles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={[
              terminalStyles.header,
              { borderColor: disciplineColor, borderWidth: 2, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0 }
            ]}>
              <Text style={terminalStyles.headerTitle}>
                {workout.discipline.toUpperCase()}
              </Text>
              <Text style={terminalStyles.headerSubtitle}>
                {workout.workout_type.toUpperCase()}
              </Text>
            </View>

            {/* Quick Stats */}
            <View style={terminalStyles.quickStats}>
              {workout.duration_minutes && (
                <View style={terminalStyles.quickStat}>
                  <Text style={terminalStyles.quickStatValue}>
                    {workout.duration_minutes}
                  </Text>
                  <Text style={terminalStyles.quickStatLabel}>
                    MINUTES
                  </Text>
                </View>
              )}
              {workout.distance_miles && (
                <View style={terminalStyles.quickStat}>
                  <Text style={terminalStyles.quickStatValue}>
                    {workout.distance_miles}
                  </Text>
                  <Text style={terminalStyles.quickStatLabel}>
                    MILES
                  </Text>
                </View>
              )}
            </View>

            {/* Intensity */}
            {workout.intensity_description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Intensity</Text>
                <Text style={styles.sectionText}>{workout.intensity_description}</Text>
              </View>
            )}

            {/* Description */}
            {workout.detailed_description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.sectionText}>{workout.detailed_description}</Text>
              </View>
            )}

            {/* Structure */}
            {renderWorkoutStructure()}

            {/* Coaching Notes */}
            {workout.coaching_notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Coaching Notes</Text>
                <Text style={styles.sectionText}>{workout.coaching_notes}</Text>
              </View>
            )}

            {/* Goals */}
            {workout.goals && workout.goals.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Workout Goals</Text>
                {workout.goals.map((goal, index) => (
                  <Text key={index} style={styles.goalItem}>• {goal}</Text>
                ))}
              </View>
            )}

            {/* Completion Status */}
            {isCompleted && workout.completion && (
              <View style={[styles.section, styles.completionSection]}>
                <Text style={styles.sectionTitle}>✓ Completed</Text>
                {workout.completion.actual_duration_minutes && (
                  <Text style={styles.completionText}>
                    Duration: {workout.completion.actual_duration_minutes} min
                  </Text>
                )}
                {workout.completion.actual_distance_miles && (
                  <Text style={styles.completionText}>
                    Distance: {workout.completion.actual_distance_miles} mi
                  </Text>
                )}
                {workout.completion.perceived_effort && (
                  <Text style={styles.completionText}>
                    Effort: {workout.completion.perceived_effort}/10
                  </Text>
                )}
                {workout.completion.notes && (
                  <Text style={styles.completionText}>Notes: {workout.completion.notes}</Text>
                )}
              </View>
            )}

            {isSkipped && workout.completion && (
              <View style={[styles.section, styles.skippedSection]}>
                <Text style={styles.sectionTitle}>⊘ Skipped</Text>
                {workout.completion.skip_reason && (
                  <Text style={styles.completionText}>Reason: {workout.completion.skip_reason}</Text>
                )}
              </View>
            )}

            {/* Forms */}
            {showCompleteForm && renderCompletionForm()}
            {showSkipForm && renderSkipForm()}
          </ScrollView>

          {/* Actions */}
          {!isCompleted && !isSkipped && !showCompleteForm && !showSkipForm && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.skipButton]}
                onPress={() => setShowSkipForm(true)}
              >
                <Text style={styles.actionButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => setShowCompleteForm(true)}
              >
                <Text style={[styles.actionButtonText, styles.completeButtonText]}>
                  Complete Workout
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Close Button */}
          <TouchableOpacity style={terminalStyles.closeButton} onPress={handleClose}>
            <Text style={terminalStyles.closeButtonText}>
              CLOSE
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    textTransform: 'capitalize',
  },
  quickStats: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  quickStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 1)',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 22,
  },
  structureBlock: {
    marginBottom: 16,
  },
  structureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 6,
  },
  structureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
  },
  goalItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
    lineHeight: 20,
  },
  completionSection: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
    borderWidth: 1,
  },
  skippedSection: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderColor: 'rgba(244, 67, 54, 0.3)',
    borderWidth: 1,
  },
  completionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  formContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 1)',
    marginBottom: 20,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 1)',
    marginBottom: 8,
  },
  formInput: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  effortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  effortButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  effortButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  effortButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 1)',
  },
  effortButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  formCancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  formCancelButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 1)',
    fontWeight: '600',
  },
  formSubmitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#34C759',
    alignItems: 'center',
  },
  formSubmitButtonSkip: {
    backgroundColor: '#FF3B30',
  },
  formSubmitButtonDisabled: {
    opacity: 0.5,
  },
  formSubmitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  actions: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButton: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  completeButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 1)',
    fontWeight: '600',
  },
  completeButtonText: {
    color: '#fff',
  },
  closeButton: {
    padding: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
});

const terminalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 15, 0.98)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderWidth: 2,
    borderColor: '#1a2e35',
    backgroundColor: '#0d1418',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    maxHeight: '90%',
  },
  header: {
    padding: 24,
    backgroundColor: '#0d1418',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e0e0e0',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#6b7f86',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  quickStats: {
    borderWidth: 2,
    borderColor: '#1a2e35',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#0a0e0f',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fbbf24',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6b7f86',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1a2e35',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  sectionText: {
    fontSize: 14,
    color: '#6b7f86',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  structureBlock: {
    marginBottom: 16,
  },
  structureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06b6d4',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  structureDescription: {
    fontSize: 13,
    color: '#6b7f86',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  goalItem: {
    fontSize: 13,
    color: '#6b7f86',
    marginBottom: 8,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  completionSection: {
    backgroundColor: '#0a0e0f',
    borderColor: '#4ade80',
    borderWidth: 2,
  },
  skippedSection: {
    backgroundColor: '#0a0e0f',
    borderColor: '#f87171',
    borderWidth: 2,
  },
  completionText: {
    fontSize: 13,
    color: '#6b7f86',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  formContainer: {
    borderWidth: 2,
    borderColor: '#1a2e35',
    padding: 20,
    backgroundColor: '#0a0e0f',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e0e0',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  formInput: {
    borderColor: '#1a2e35',
    color: '#e0e0e0',
    backgroundColor: '#0d1418',
    borderRadius: 0,
    padding: 12,
    fontSize: 14,
    borderWidth: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  formInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  effortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  effortButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: '#0d1418',
    borderWidth: 2,
    borderColor: '#1a2e35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  effortButtonActive: {
    backgroundColor: '#0a0e0f',
    borderColor: '#fbbf24',
  },
  effortButtonText: {
    fontSize: 14,
    color: '#e0e0e0',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  effortButtonTextActive: {
    color: '#fbbf24',
    fontWeight: 'bold',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  formCancelButton: {
    backgroundColor: '#0d1418',
    flex: 1,
    paddingVertical: 14,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#1a2e35',
    alignItems: 'center',
  },
  formCancelButtonText: {
    fontSize: 14,
    color: '#6b7f86',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  formSubmitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 0,
    backgroundColor: '#0d1418',
    borderWidth: 2,
    borderColor: '#4ade80',
    alignItems: 'center',
  },
  formSubmitButtonSkip: {
    borderColor: '#f87171',
  },
  formSubmitButtonDisabled: {
    opacity: 0.5,
  },
  formSubmitButtonText: {
    fontSize: 14,
    color: '#4ade80',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  actions: {
    borderWidth: 2,
    borderColor: '#1a2e35',
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: '#1a2e35',
    backgroundColor: '#0d1418',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 0,
    alignItems: 'center',
  },
  skipButton: {
    borderColor: '#1a2e35',
    backgroundColor: '#0d1418',
    borderWidth: 2,
  },
  completeButton: {
    backgroundColor: '#0d1418',
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#6b7f86',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  completeButtonText: {
    color: '#4ade80',
  },
  closeButton: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#0d1418',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#fbbf24',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
});
