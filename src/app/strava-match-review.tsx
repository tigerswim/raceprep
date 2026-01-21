import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { AuthGuard } from '../components/AuthGuard';
import { trainingPlanService } from '../services/trainingPlanService';
import { TbCheck, TbX, TbAlertCircle, TbCheckbox } from 'react-icons/tb';

export default function StravaMatchReviewScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const planId = params.planId as string;

  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMatches();
  }, [planId]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const result = await trainingPlanService.findStravaMatches(planId, 14);

      if (result.error) {
        showAlert('Error', result.error);
      } else {
        setMatches(result.data);
      }
    } catch (error) {
      showAlert('Error', 'Failed to load Strava matches');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const showConfirm = (title: string, message: string): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return Promise.resolve(window.confirm(`${title}\n\n${message}`));
    } else {
      return new Promise((resolve) => {
        Alert.alert(title, message, [
          { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
          { text: 'OK', onPress: () => resolve(true) },
        ]);
      });
    }
  };

  const handleAcceptMatch = async (match: any) => {
    const matchId = `${match.workout.id}-${match.activity.strava_activity_id}`;

    if (processingIds.has(matchId)) return;

    try {
      setProcessingIds(prev => new Set(prev).add(matchId));

      const result = await trainingPlanService.acceptStravaMatch(
        match.workout.id,
        planId,
        match.activity.strava_activity_id
      );

      if (result.error) {
        showAlert('Error', result.error);
      } else {
        setAcceptedIds(prev => new Set(prev).add(matchId));
        showAlert('Success', 'Workout marked as complete from Strava!');

        // Remove from matches
        setTimeout(() => {
          loadMatches(); // Refresh to update the list
        }, 1000);
      }
    } catch (error) {
      showAlert('Error', 'Failed to accept match');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(matchId);
        return newSet;
      });
    }
  };

  const handleRejectMatch = async (match: any) => {
    const matchId = `${match.workout.id}-${match.activity.strava_activity_id}`;

    // For now, just hide it (in future, could store rejections in DB)
    setAcceptedIds(prev => new Set(prev).add(matchId));
  };

  const handleAcceptAllHigh = async () => {
    if (!matches?.highConfidence || matches.highConfidence.length === 0) return;

    const confirmed = await showConfirm(
      'Accept All High-Confidence Matches?',
      `This will mark ${matches.highConfidence.length} workouts as complete from Strava.`
    );

    if (!confirmed) return;

    for (const match of matches.highConfidence) {
      await handleAcceptMatch(match);
    }
  };

  const renderMatchCard = (match: any, confidenceLevel: 'high' | 'medium' | 'low') => {
    const matchId = `${match.workout.id}-${match.activity.strava_activity_id}`;
    const isProcessing = processingIds.has(matchId);
    const isAccepted = acceptedIds.has(matchId);

    if (isAccepted) return null;

    const confidenceColors = {
      high: '#34C759',
      medium: '#FF9500',
      low: '#FF3B30',
    };

    const confidenceColor = confidenceColors[confidenceLevel];

    return (
      <View key={matchId} style={styles.matchCard}>
        {/* Confidence Badge */}
        <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}>
          <Text style={styles.confidenceBadgeText}>{match.confidence}%</Text>
          {confidenceLevel === 'high' && <TbCheck size={16} color="#fff" />}
          {confidenceLevel === 'low' && <TbAlertCircle size={16} color="#fff" />}
        </View>

        {/* Workout Info */}
        <View style={styles.matchSection}>
          <Text style={styles.sectionLabel}>Planned Workout</Text>
          <Text style={styles.workoutTitle}>
            {match.workout.discipline.toUpperCase()} • {match.workout.workout_type}
          </Text>
          <Text style={styles.workoutDetails}>
            {match.workout.scheduled_date &&
              new Date(match.workout.scheduled_date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })
            }
            {match.workout.duration_minutes && ` • ${match.workout.duration_minutes} min`}
            {match.workout.distance_miles && ` • ${match.workout.distance_miles} mi`}
          </Text>
        </View>

        {/* Strava Activity Info */}
        <View style={styles.matchSection}>
          <Text style={styles.sectionLabel}>Strava Activity</Text>
          <Text style={styles.activityTitle}>{match.activity.name}</Text>
          <Text style={styles.activityDetails}>
            {new Date(match.activity.start_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
            {match.activity.moving_time_seconds &&
              ` • ${Math.round(match.activity.moving_time_seconds / 60)} min`
            }
            {match.activity.distance_meters &&
              ` • ${(match.activity.distance_meters * 0.000621371).toFixed(2)} mi`
            }
          </Text>
        </View>

        {/* Match Reasons */}
        {match.matchReasons && match.matchReasons.length > 0 && (
          <View style={styles.matchReasons}>
            {match.matchReasons.map((reason: string, idx: number) => (
              <Text key={idx} style={styles.matchReason}>✓ {reason}</Text>
            ))}
          </View>
        )}

        {/* Warnings */}
        {match.warnings && match.warnings.length > 0 && (
          <View style={styles.warnings}>
            {match.warnings.map((warning: string, idx: number) => (
              <Text key={idx} style={styles.warning}>⚠️ {warning}</Text>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.matchActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectMatch(match)}
            disabled={isProcessing}
          >
            <TbX size={20} color="#FF3B30" />
            <Text style={styles.rejectButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton, isProcessing && styles.buttonDisabled]}
            onPress={() => handleAcceptMatch(match)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <TbCheck size={20} color="#fff" />
                <Text style={styles.acceptButtonText}>Accept Match</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <AuthGuard>
        <View style={styles.container}>
          <Stack.Screen
            options={{
              headerShown: false,
            }}
          />

          {/* Custom Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Strava Matches</Text>
          </View>

          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Finding matches...</Text>
          </View>
        </View>
      </AuthGuard>
    );
  }

  const totalMatches =
    (matches?.highConfidence?.length || 0) +
    (matches?.mediumConfidence?.length || 0) +
    (matches?.lowConfidence?.length || 0);

  return (
    <AuthGuard>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Strava Matches</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {totalMatches === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No Matches Found</Text>
              <Text style={styles.emptyStateText}>
                We couldn&apos;t find any Strava activities that match your recent training plan workouts.
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.back()}
              >
                <Text style={styles.emptyStateButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Summary */}
              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>Found {totalMatches} Potential Matches</Text>
                <Text style={styles.summaryText}>
                  Review and accept matches to automatically mark workouts as complete.
                </Text>
              </View>

              {/* Accept All Button */}
              {matches?.highConfidence && matches.highConfidence.length > 0 && (
                <TouchableOpacity
                  style={styles.acceptAllButton}
                  onPress={handleAcceptAllHigh}
                >
                  <TbCheckbox size={24} color="#fff" />
                  <Text style={styles.acceptAllButtonText}>
                    Accept All High-Confidence Matches ({matches.highConfidence.length})
                  </Text>
                </TouchableOpacity>
              )}

              {/* High Confidence Matches */}
              {matches?.highConfidence && matches.highConfidence.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>High Confidence Matches</Text>
                  {matches.highConfidence.map((match: any) => renderMatchCard(match, 'high'))}
                </View>
              )}

              {/* Medium Confidence Matches */}
              {matches?.mediumConfidence && matches.mediumConfidence.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Medium Confidence Matches</Text>
                  {matches.mediumConfidence.map((match: any) => renderMatchCard(match, 'medium'))}
                </View>
              )}

              {/* Low Confidence Matches */}
              {matches?.lowConfidence && matches.lowConfidence.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Low Confidence Matches</Text>
                  <Text style={styles.sectionSubtitle}>
                    These matches may not be accurate. Review carefully.
                  </Text>
                  {matches.lowConfidence.map((match: any) => renderMatchCard(match, 'low'))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  summary: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  acceptAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  acceptAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    gap: 4,
  },
  confidenceBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  matchSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FC4C02',
    marginBottom: 4,
  },
  activityDetails: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  matchReasons: {
    marginBottom: 8,
  },
  matchReason: {
    fontSize: 13,
    color: '#34C759',
    marginBottom: 2,
  },
  warnings: {
    marginBottom: 12,
  },
  warning: {
    fontSize: 13,
    color: '#FF9500',
    marginBottom: 2,
  },
  matchActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  rejectButtonText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
