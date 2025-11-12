import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { trainingPlanService } from '../../services/trainingPlanService';
import type { TrainingPlanTemplate, UserTrainingPlan } from '../../types/trainingPlans';

type DistanceFilter = 'all' | 'sprint' | 'olympic' | '70.3' | 'ironman';
type ExperienceFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

interface TrainingPlanSelectionScreenProps {
  onSelectPlan?: (template: TrainingPlanTemplate) => void;
  onBack?: () => void;
}

export const TrainingPlanSelectionScreen: React.FC<TrainingPlanSelectionScreenProps> = ({
  onSelectPlan,
  onBack,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [userPlans, setUserPlans] = useState<UserTrainingPlan[]>([]);
  const [templates, setTemplates] = useState<TrainingPlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('all');
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>('all');

  const [selectedTemplate, setSelectedTemplate] = useState<TrainingPlanTemplate | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Reload user plans when screen comes into focus (e.g., after navigating back from calendar)
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadUserPlans();
      }
    }, [user?.id])
  );

  useEffect(() => {
    if (user?.id) {
      loadUserPlans();
    }
    loadTemplates();
  }, [user?.id]);

  useEffect(() => {
    loadTemplates();
  }, [distanceFilter, experienceFilter]);

  const loadUserPlans = async () => {
    if (!user?.id) {
      console.log('No user ID, skipping load user plans');
      setLoadingPlans(false);
      return;
    }

    try {
      setLoadingPlans(true);
      console.log('Loading user plans for user:', user.id); // Debug log
      const result = await trainingPlanService.getUserTrainingPlans(user.id);

      console.log('User plans result:', result); // Debug log
      if (!result.error && result.data) {
        console.log('Setting user plans:', result.data); // Debug log
        setUserPlans(result.data);
      } else if (result.error) {
        console.error('Error loading user plans:', result.error);
      }
    } catch (err) {
      console.error('Failed to load user plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (distanceFilter !== 'all') filters.distance_type = distanceFilter;
      if (experienceFilter !== 'all') filters.experience_level = experienceFilter;

      const result = await trainingPlanService.getTrainingPlanTemplates(filters);

      if (result.error) {
        setError(result.error.message);
      } else {
        setTemplates(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplatePress = (template: TrainingPlanTemplate) => {
    setSelectedTemplate(template);
    setShowDetailModal(true);
  };

  const handleSelectPlan = () => {
    if (selectedTemplate && onSelectPlan) {
      onSelectPlan(selectedTemplate);
      setShowDetailModal(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this training plan? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await trainingPlanService.deleteUserTrainingPlan(planId);
      if (!result.error) {
        // Remove from local state
        setUserPlans(userPlans.filter(plan => plan.id !== planId));
      } else {
        alert('Failed to delete training plan: ' + result.error.message);
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
      alert('Failed to delete training plan');
    }
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Distance:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['all', 'sprint', 'olympic', '70.3', 'ironman'] as DistanceFilter[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                distanceFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setDistanceFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  distanceFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Experience:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['all', 'beginner', 'intermediate', 'advanced'] as ExperienceFilter[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                experienceFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setExperienceFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  experienceFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderTemplateCard = (template: TrainingPlanTemplate) => (
    <TouchableOpacity
      key={template.id}
      style={styles.templateCard}
      onPress={() => handleTemplatePress(template)}
    >
      <View style={styles.templateHeader}>
        <Text style={styles.templateName}>{template.name}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, styles.badgeDistance]}>
            <Text style={styles.badgeText}>{template.distance_type.toUpperCase()}</Text>
          </View>
          <View style={[styles.badge, styles.badgeLevel]}>
            <Text style={styles.badgeText}>{template.experience_level}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.templateDescription} numberOfLines={2}>
        {template.description}
      </Text>

      <View style={styles.templateStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{template.duration_weeks}</Text>
          <Text style={styles.statLabel}>weeks</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {template.weekly_hours_min}-{template.weekly_hours_max}
          </Text>
          <Text style={styles.statLabel}>hrs/week</Text>
        </View>
      </View>

      {template.key_features && template.key_features.length > 0 && (
        <View style={styles.featuresContainer}>
          {template.key_features.slice(0, 2).map((feature, index) => (
            <Text key={index} style={styles.featureItem}>
              • {feature}
            </Text>
          ))}
          {template.key_features.length > 2 && (
            <Text style={styles.moreFeatures}>
              +{template.key_features.length - 2} more features
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderDetailModal = () => {
    if (!selectedTemplate) return null;

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedTemplate.name}</Text>

              <View style={styles.modalBadges}>
                <View style={[styles.badge, styles.badgeDistance]}>
                  <Text style={styles.badgeText}>
                    {selectedTemplate.distance_type.toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.badge, styles.badgeLevel]}>
                  <Text style={styles.badgeText}>{selectedTemplate.experience_level}</Text>
                </View>
              </View>

              <View style={styles.modalStats}>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatValue}>{selectedTemplate.duration_weeks}</Text>
                  <Text style={styles.modalStatLabel}>Weeks</Text>
                </View>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatValue}>
                    {selectedTemplate.weekly_hours_min}-{selectedTemplate.weekly_hours_max}
                  </Text>
                  <Text style={styles.modalStatLabel}>Hours/Week</Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Description</Text>
                <Text style={styles.modalText}>{selectedTemplate.description}</Text>
              </View>

              {selectedTemplate.target_audience && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Target Audience</Text>
                  <Text style={styles.modalText}>{selectedTemplate.target_audience}</Text>
                </View>
              )}

              {selectedTemplate.key_features && selectedTemplate.key_features.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Key Features</Text>
                  {selectedTemplate.key_features.map((feature, index) => (
                    <Text key={index} style={styles.modalFeatureItem}>
                      • {feature}
                    </Text>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDetailModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.selectButton} onPress={handleSelectPlan}>
                <Text style={styles.selectButtonText}>Start This Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading training plans...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTemplates}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.header}>Training Plans</Text>
      <Text style={styles.subheader}>
        {userPlans.length > 0
          ? 'Continue your active plan or start a new one'
          : 'Select a structured training plan based on your goals and experience level'
        }
      </Text>

      {/* My Plans Section */}
      {userPlans.length > 0 && (
        <View style={styles.myPlansSection}>
          <Text style={styles.sectionTitle}>My Plans</Text>
          {userPlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={styles.userPlanCard}
              onPress={() => router.push(`/training-calendar?planId=${plan.id}&currentWeek=${plan.current_week || 1}`)}
            >
              <View style={styles.userPlanHeader}>
                <Text style={styles.userPlanName}>{plan.plan_name}</Text>
                <Text style={styles.userPlanWeek}>Week {plan.current_week || 1}/{plan.duration_weeks || 12}</Text>
              </View>
              {(plan.template?.distance_type || plan.template?.experience_level) && (
                <Text style={styles.userPlanSubtext}>
                  {plan.template?.distance_type?.toUpperCase() || 'Custom'} · {plan.template?.experience_level || 'Intermediate'}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Divider */}
      {userPlans.length > 0 && <View style={styles.divider} />}

      <Text style={styles.browsePlansTitle}>Browse Training Plan Templates</Text>

      {renderFilters()}

      <ScrollView style={styles.templatesContainer} showsVerticalScrollIndicator={false}>
        {templates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No training plans match your filters. Try adjusting your selection.
            </Text>
          </View>
        ) : (
          templates.map(renderTemplateCard)
        )}
      </ScrollView>

      {renderDetailModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    paddingBottom: 100, // Space for fixed bottom tab bar
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 1)',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 20,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 1)',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 1)',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  templatesContainer: {
    flex: 1,
  },
  templateCard: {
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 1)',
    flex: 1,
    marginRight: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeDistance: {
    backgroundColor: '#3B82F6',
  },
  badgeLevel: {
    backgroundColor: '#34C759',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  templateDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
    lineHeight: 20,
  },
  templateStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  featuresContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureItem: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  moreFeatures: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 4,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 1)',
    marginBottom: 16,
  },
  modalBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  modalStats: {
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  modalStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 1)',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
  },
  modalFeatureItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 1)',
    fontWeight: '600',
  },
  selectButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
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
  myPlansSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  userPlanCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  userPlanContent: {
    padding: 16,
    flex: 1,
  },
  userPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userPlanName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 1)',
    flex: 1,
  },
  userPlanWeek: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  userPlanSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  userPlanActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(59, 130, 246, 0.2)',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 20,
  },
  browsePlansTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
});
