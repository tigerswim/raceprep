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
        return '#00D4FF'; // terminal swim
      case 'bike':
        return '#FF6B35'; // terminal bike
      case 'run':
        return '#4ECDC4'; // terminal run
      case 'brick':
        return '#FFD866'; // terminal yellow
      case 'strength':
        return '#FF3B30'; // red
      case 'rest':
        return '#B4B8C5'; // terminal text-secondary
      default:
        return '#B4B8C5';
    }
  };

  const renderWorkoutStructure = () => {
    if (!workout.structure) return null;

    const structure = workout.structure as any;

    return (
      <View style={terminalStyles.section}>
        <Text style={terminalStyles.sectionTitle}>Workout Structure</Text>

        {structure.warmup && (
          <View style={terminalStyles.structureBlock}>
            <Text style={terminalStyles.structureTitle}>Warmup ({structure.warmup.duration} min)</Text>
            <Text style={terminalStyles.structureDescription}>{structure.warmup.description}</Text>
          </View>
        )}

        {structure.main_set && (
          <View style={terminalStyles.structureBlock}>
            <Text style={terminalStyles.structureTitle}>Main Set ({structure.main_set.duration} min)</Text>
            <Text style={terminalStyles.structureDescription}>{structure.main_set.description}</Text>
          </View>
        )}

        {structure.cooldown && (
          <View style={terminalStyles.structureBlock}>
            <Text style={terminalStyles.structureTitle}>Cooldown ({structure.cooldown.duration} min)</Text>
            <Text style={terminalStyles.structureDescription}>{structure.cooldown.description}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCompletionForm = () => (
    <View style={terminalStyles.formContainer}>
      <Text style={terminalStyles.formTitle}>Log Your Workout</Text>

      <View style={terminalStyles.formField}>
        <Text style={terminalStyles.formLabel}>Duration (minutes)</Text>
        <TextInput
          style={terminalStyles.formInput}
          placeholder={workout.duration_minutes?.toString() || "45"}
          keyboardType="numeric"
          value={completionData.actual_duration_minutes}
          onChangeText={(text) => setCompletionData({ ...completionData, actual_duration_minutes: text })}
        />
      </View>

      <View style={terminalStyles.formField}>
        <Text style={terminalStyles.formLabel}>Distance (miles)</Text>
        <TextInput
          style={terminalStyles.formInput}
          placeholder={workout.distance_miles?.toString() || "5.0"}
          keyboardType="decimal-pad"
          value={completionData.actual_distance_miles}
          onChangeText={(text) => setCompletionData({ ...completionData, actual_distance_miles: text })}
        />
      </View>

      <View style={terminalStyles.formField}>
        <Text style={terminalStyles.formLabel}>Perceived Effort (1-10)</Text>
        <View style={terminalStyles.effortButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                terminalStyles.effortButton,
                completionData.perceived_effort === level.toString() && terminalStyles.effortButtonActive,
              ]}
              onPress={() => setCompletionData({ ...completionData, perceived_effort: level.toString() })}
            >
              <Text
                style={[
                  terminalStyles.effortButtonText,
                  completionData.perceived_effort === level.toString() && terminalStyles.effortButtonTextActive,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={terminalStyles.formField}>
        <Text style={terminalStyles.formLabel}>Notes (optional)</Text>
        <TextInput
          style={[terminalStyles.formInput, terminalStyles.formInputMultiline]}
          placeholder="How did it feel? Any observations?"
          multiline
          numberOfLines={3}
          value={completionData.notes}
          onChangeText={(text) => setCompletionData({ ...completionData, notes: text })}
        />
      </View>

      <View style={terminalStyles.formActions}>
        <TouchableOpacity
          style={terminalStyles.formCancelButton}
          onPress={() => setShowCompleteForm(false)}
        >
          <Text style={terminalStyles.formCancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[terminalStyles.formSubmitButton, submitting && terminalStyles.formSubmitButtonDisabled]}
          onPress={handleCompleteWorkout}
          disabled={submitting}
        >
          <Text style={terminalStyles.formSubmitButtonText}>
            {submitting ? 'Saving...' : 'Complete Workout'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSkipForm = () => (
    <View style={terminalStyles.formContainer}>
      <Text style={terminalStyles.formTitle}>Skip Workout</Text>

      <View style={terminalStyles.formField}>
        <Text style={terminalStyles.formLabel}>Reason (optional)</Text>
        <TextInput
          style={[terminalStyles.formInput, terminalStyles.formInputMultiline]}
          placeholder="Why are you skipping this workout?"
          multiline
          numberOfLines={3}
          value={skipReason}
          onChangeText={setSkipReason}
        />
      </View>

      <View style={terminalStyles.formActions}>
        <TouchableOpacity
          style={terminalStyles.formCancelButton}
          onPress={() => setShowSkipForm(false)}
        >
          <Text style={terminalStyles.formCancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[terminalStyles.formSubmitButton, terminalStyles.formSubmitButtonSkip, submitting && terminalStyles.formSubmitButtonDisabled]}
          onPress={handleSkipWorkout}
          disabled={submitting}
        >
          <Text style={terminalStyles.formSubmitButtonText}>
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
              <View style={terminalStyles.section}>
                <Text style={terminalStyles.sectionTitle}>Intensity</Text>
                <Text style={terminalStyles.sectionText}>{workout.intensity_description}</Text>
              </View>
            )}

            {/* Description */}
            {workout.detailed_description && (
              <View style={terminalStyles.section}>
                <Text style={terminalStyles.sectionTitle}>Description</Text>
                <Text style={terminalStyles.sectionText}>{workout.detailed_description}</Text>
              </View>
            )}

            {/* Structure */}
            {renderWorkoutStructure()}

            {/* Coaching Notes */}
            {workout.coaching_notes && (
              <View style={terminalStyles.section}>
                <Text style={terminalStyles.sectionTitle}>Coaching Notes</Text>
                <Text style={terminalStyles.sectionText}>{workout.coaching_notes}</Text>
              </View>
            )}

            {/* Goals */}
            {workout.goals && workout.goals.length > 0 && (
              <View style={terminalStyles.section}>
                <Text style={terminalStyles.sectionTitle}>Workout Goals</Text>
                {workout.goals.map((goal, index) => (
                  <Text key={index} style={terminalStyles.goalItem}>• {goal}</Text>
                ))}
              </View>
            )}

            {/* Completion Status */}
            {isCompleted && workout.completion && (
              <View style={[terminalStyles.section, terminalStyles.completionSection]}>
                <Text style={terminalStyles.sectionTitle}>✓ Completed</Text>
                {workout.completion.actual_duration_minutes && (
                  <Text style={terminalStyles.completionText}>
                    Duration: {workout.completion.actual_duration_minutes} min
                  </Text>
                )}
                {workout.completion.actual_distance_miles && (
                  <Text style={terminalStyles.completionText}>
                    Distance: {workout.completion.actual_distance_miles} mi
                  </Text>
                )}
                {workout.completion.perceived_effort && (
                  <Text style={terminalStyles.completionText}>
                    Effort: {workout.completion.perceived_effort}/10
                  </Text>
                )}
                {workout.completion.notes && (
                  <Text style={terminalStyles.completionText}>Notes: {workout.completion.notes}</Text>
                )}
              </View>
            )}

            {isSkipped && workout.completion && (
              <View style={[terminalStyles.section, terminalStyles.skippedSection]}>
                <Text style={terminalStyles.sectionTitle}>⊘ Skipped</Text>
                {workout.completion.skip_reason && (
                  <Text style={terminalStyles.completionText}>Reason: {workout.completion.skip_reason}</Text>
                )}
              </View>
            )}

            {/* Forms */}
            {showCompleteForm && renderCompletionForm()}
            {showSkipForm && renderSkipForm()}
          </ScrollView>

          {/* Actions */}
          {!isCompleted && !isSkipped && !showCompleteForm && !showSkipForm && (
            <View style={terminalStyles.actions}>
              <TouchableOpacity
                style={[terminalStyles.actionButton, terminalStyles.skipButton]}
                onPress={() => setShowSkipForm(true)}
              >
                <Text style={terminalStyles.actionButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[terminalStyles.actionButton, terminalStyles.completeButton]}
                onPress={() => setShowCompleteForm(true)}
              >
                <Text style={[terminalStyles.actionButtonText, terminalStyles.completeButtonText]}>
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
