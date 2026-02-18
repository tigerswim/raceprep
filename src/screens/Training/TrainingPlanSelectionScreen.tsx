import { logger } from '../../utils/logger';
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
      logger.debug('No user ID, skipping load user plans');
      setLoadingPlans(false);
      return;
    }

    try {
      setLoadingPlans(true);
      logger.debug('Loading user plans for user:', user.id); // Debug log
      const result = await trainingPlanService.getUserTrainingPlans(user.id);

      logger.debug('User plans result:', result); // Debug log
      if (!result.error && result.data) {
        logger.debug('Setting user plans:', result.data); // Debug log
        setUserPlans(result.data);
      } else if (result.error) {
        logger.error('Error loading user plans:', result.error);
      }
    } catch (err) {
      logger.error('Failed to load user plans:', err);
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
      logger.error('Error deleting plan:', err);
      alert('Failed to delete training plan');
    }
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterGroup}>
        <Text style={[
          styles.filterLabel,
          {
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: 'bold',
            color: terminalColors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 1.2,
          }
        ]}>
          DISTANCE:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['all', 'sprint', 'olympic', '70.3', 'ironman'] as DistanceFilter[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                distanceFilter === filter && styles.filterButtonActive,
                {
                  backgroundColor: distanceFilter === filter ? terminalColors.yellow : terminalColors.panel,
                  borderWidth: 2,
                  borderColor: distanceFilter === filter ? terminalColors.yellow : terminalColors.border,
                  borderRadius: 0,
                }
              ]}
              onPress={() => setDistanceFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  distanceFilter === filter && styles.filterButtonTextActive,
                  {
                    fontFamily: 'monospace',
                    fontSize: 11,
                    fontWeight: 'bold',
                    color: distanceFilter === filter ? terminalColors.bg : terminalColors.textPrimary,
                    textTransform: 'uppercase',
                  }
                ]}
              >
                {filter === 'all' ? 'ALL' : filter.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterGroup}>
        <Text style={[
          styles.filterLabel,
          {
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: 'bold',
            color: terminalColors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 1.2,
          }
        ]}>
          EXPERIENCE:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['all', 'beginner', 'intermediate', 'advanced'] as ExperienceFilter[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                experienceFilter === filter && styles.filterButtonActive,
                {
                  backgroundColor: experienceFilter === filter ? terminalColors.yellow : terminalColors.panel,
                  borderWidth: 2,
                  borderColor: experienceFilter === filter ? terminalColors.yellow : terminalColors.border,
                  borderRadius: 0,
                }
              ]}
              onPress={() => setExperienceFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  experienceFilter === filter && styles.filterButtonTextActive,
                  {
                    fontFamily: 'monospace',
                    fontSize: 11,
                    fontWeight: 'bold',
                    color: experienceFilter === filter ? terminalColors.bg : terminalColors.textPrimary,
                    textTransform: 'uppercase',
                  }
                ]}
              >
                {filter === 'all' ? 'ALL' : filter.toUpperCase()}
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
      style={[
        styles.templateCard,
        {
          backgroundColor: terminalColors.panel,
          borderWidth: 2,
          borderColor: terminalColors.border,
          borderRadius: 0,
        }
      ]}
      onPress={() => handleTemplatePress(template)}
    >
      <View style={styles.templateHeader}>
        <Text style={[
          styles.templateName,
          {
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 'bold',
            color: terminalColors.textPrimary,
            textTransform: 'uppercase',
            letterSpacing: 1.2,
          }
        ]}>
          {template.name.toUpperCase()}
        </Text>
        <View style={styles.badges}>
          <View style={[
            styles.badge,
            styles.badgeDistance,
            {
              backgroundColor: `${terminalColors.swim}33`,
              borderWidth: 1,
              borderColor: terminalColors.swim,
              borderRadius: 0,
            }
          ]}>
            <Text style={[
              styles.badgeText,
              {
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: 'bold',
                color: terminalColors.swim,
              }
            ]}>
              {template.distance_type.toUpperCase()}
            </Text>
          </View>
          <View style={[
            styles.badge,
            styles.badgeLevel,
            {
              backgroundColor: `${terminalColors.yellow}33`,
              borderWidth: 1,
              borderColor: terminalColors.yellow,
              borderRadius: 0,
            }
          ]}>
            <Text style={[
              styles.badgeText,
              {
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: 'bold',
                color: terminalColors.yellow,
                textTransform: 'uppercase',
              }
            ]}>
              {template.experience_level.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[
        styles.templateDescription,
        {
          fontFamily: 'monospace',
          fontSize: 12,
          color: terminalColors.textSecondary,
        }
      ]} numberOfLines={2}>
        {template.description}
      </Text>

      <View style={styles.templateStats}>
        <View style={styles.stat}>
          <Text style={[
            styles.statValue,
            {
              fontFamily: 'monospace',
              fontSize: 20,
              fontWeight: 'bold',
              color: terminalColors.textPrimary,
            }
          ]}>
            {template.duration_weeks}
          </Text>
          <Text style={[
            styles.statLabel,
            {
              fontFamily: 'monospace',
              fontSize: 10,
              color: terminalColors.textSecondary,
              textTransform: 'uppercase',
            }
          ]}>
            WEEKS
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[
            styles.statValue,
            {
              fontFamily: 'monospace',
              fontSize: 20,
              fontWeight: 'bold',
              color: terminalColors.textPrimary,
            }
          ]}>
            {template.weekly_hours_min}-{template.weekly_hours_max}
          </Text>
          <Text style={[
            styles.statLabel,
            {
              fontFamily: 'monospace',
              fontSize: 10,
              color: terminalColors.textSecondary,
              textTransform: 'uppercase',
            }
          ]}>
            HRS/WEEK
          </Text>
        </View>
      </View>

      {template.key_features && template.key_features.length > 0 && (
        <View style={styles.featuresContainer}>
          {template.key_features.slice(0, 2).map((feature, index) => (
            <Text key={index} style={[
              styles.featureItem,
              {
                fontFamily: 'monospace',
                fontSize: 11,
                color: terminalColors.textSecondary,
              }
            ]}>
              {`[${feature.toUpperCase()}]`}
            </Text>
          ))}
          {template.key_features.length > 2 && (
            <Text style={[
              styles.moreFeatures,
              {
                fontFamily: 'monospace',
                fontSize: 10,
                color: terminalColors.yellow,
                fontWeight: 'bold',
              }
            ]}>
              {`+${template.key_features.length - 2} MORE FEATURES`}
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
        <View style={[
          styles.modalOverlay,
          { backgroundColor: `${terminalColors.bg}F0` }
        ]}>
          <View style={[
            styles.modalContent,
            {
              backgroundColor: terminalColors.panel,
              borderWidth: 2,
              borderColor: terminalColors.border,
              borderRadius: 0,
            }
          ]}>
            <ScrollView>
              <Text style={[
                styles.modalTitle,
                {
                  fontFamily: 'monospace',
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: terminalColors.textPrimary,
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                }
              ]}>
                {selectedTemplate.name.toUpperCase()}
              </Text>

              <View style={styles.modalBadges}>
                <View style={[
                  styles.badge,
                  styles.badgeDistance,
                  {
                    backgroundColor: `${terminalColors.swim}33`,
                    borderWidth: 1,
                    borderColor: terminalColors.swim,
                    borderRadius: 0,
                  }
                ]}>
                  <Text style={[
                    styles.badgeText,
                    {
                      fontFamily: 'monospace',
                      fontSize: 11,
                      fontWeight: 'bold',
                      color: terminalColors.swim,
                    }
                  ]}>
                    {selectedTemplate.distance_type.toUpperCase()}
                  </Text>
                </View>
                <View style={[
                  styles.badge,
                  styles.badgeLevel,
                  {
                    backgroundColor: `${terminalColors.yellow}33`,
                    borderWidth: 1,
                    borderColor: terminalColors.yellow,
                    borderRadius: 0,
                  }
                ]}>
                  <Text style={[
                    styles.badgeText,
                    {
                      fontFamily: 'monospace',
                      fontSize: 11,
                      fontWeight: 'bold',
                      color: terminalColors.yellow,
                      textTransform: 'uppercase',
                    }
                  ]}>
                    {selectedTemplate.experience_level.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.modalStats}>
                <View style={styles.modalStat}>
                  <Text style={[
                    styles.modalStatValue,
                    {
                      fontFamily: 'monospace',
                      fontSize: 28,
                      fontWeight: 'bold',
                      color: terminalColors.textPrimary,
                    }
                  ]}>
                    {selectedTemplate.duration_weeks}
                  </Text>
                  <Text style={[
                    styles.modalStatLabel,
                    {
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: terminalColors.textSecondary,
                      textTransform: 'uppercase',
                    }
                  ]}>
                    WEEKS
                  </Text>
                </View>
                <View style={styles.modalStat}>
                  <Text style={[
                    styles.modalStatValue,
                    {
                      fontFamily: 'monospace',
                      fontSize: 28,
                      fontWeight: 'bold',
                      color: terminalColors.textPrimary,
                    }
                  ]}>
                    {selectedTemplate.weekly_hours_min}-{selectedTemplate.weekly_hours_max}
                  </Text>
                  <Text style={[
                    styles.modalStatLabel,
                    {
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: terminalColors.textSecondary,
                      textTransform: 'uppercase',
                    }
                  ]}>
                    HOURS/WEEK
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={[
                  styles.modalSectionTitle,
                  {
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: terminalColors.textPrimary,
                    textTransform: 'uppercase',
                    letterSpacing: 1.2,
                  }
                ]}>
                  DESCRIPTION
                </Text>
                <Text style={[
                  styles.modalText,
                  {
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: terminalColors.textSecondary,
                  }
                ]}>
                  {selectedTemplate.description}
                </Text>
              </View>

              {selectedTemplate.target_audience && (
                <View style={styles.modalSection}>
                  <Text style={[
                    styles.modalSectionTitle,
                    {
                      fontFamily: 'monospace',
                      fontSize: 14,
                      fontWeight: 'bold',
                      color: terminalColors.textPrimary,
                      textTransform: 'uppercase',
                      letterSpacing: 1.2,
                    }
                  ]}>
                    TARGET AUDIENCE
                  </Text>
                  <Text style={[
                    styles.modalText,
                    {
                      fontFamily: 'monospace',
                      fontSize: 12,
                      color: terminalColors.textSecondary,
                    }
                  ]}>
                    {selectedTemplate.target_audience}
                  </Text>
                </View>
              )}

              {selectedTemplate.key_features && selectedTemplate.key_features.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={[
                    styles.modalSectionTitle,
                    {
                      fontFamily: 'monospace',
                      fontSize: 14,
                      fontWeight: 'bold',
                      color: terminalColors.textPrimary,
                      textTransform: 'uppercase',
                      letterSpacing: 1.2,
                    }
                  ]}>
                    KEY FEATURES
                  </Text>
                  {selectedTemplate.key_features.map((feature, index) => (
                    <Text key={index} style={[
                      styles.modalFeatureItem,
                      {
                        fontFamily: 'monospace',
                        fontSize: 12,
                        color: terminalColors.textSecondary,
                      }
                    ]}>
                      {`[${feature.toUpperCase()}]`}
                    </Text>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderColor: terminalColors.border,
                    borderRadius: 0,
                  }
                ]}
                onPress={() => setShowDetailModal(false)}
              >
                <Text style={[
                  styles.cancelButtonText,
                  {
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: terminalColors.textSecondary,
                    textTransform: 'uppercase',
                  }
                ]}>
                  CANCEL
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[
                styles.selectButton,
                {
                  backgroundColor: terminalColors.yellow,
                  borderWidth: 2,
                  borderColor: terminalColors.yellow,
                  borderRadius: 0,
                }
              ]} onPress={handleSelectPlan}>
                <Text style={[
                  styles.selectButtonText,
                  {
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: terminalColors.bg,
                    textTransform: 'uppercase',
                  }
                ]}>
                  START THIS PLAN
                </Text>
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
    <View style={[
      styles.container,
      {
        backgroundColor: terminalColors.bg,
        borderWidth: 2,
        borderColor: terminalColors.border,
        borderRadius: 0,
      }
    ]}>
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={[
            styles.backButtonText,
            {
              fontFamily: 'monospace',
              color: terminalColors.yellow,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
            }
          ]}>
            ← BACK
          </Text>
        </TouchableOpacity>
      )}
      <Text style={[
        styles.header,
        {
          fontFamily: 'monospace',
          fontSize: 24,
          fontWeight: 'bold',
          color: terminalColors.textPrimary,
          textTransform: 'uppercase',
          letterSpacing: 2,
        }
      ]}>
        TRAINING PLANS
      </Text>
      <Text style={[
        styles.subheader,
        {
          fontFamily: 'monospace',
          fontSize: 12,
          color: terminalColors.textSecondary,
        }
      ]}>
        {userPlans.length > 0
          ? 'CONTINUE YOUR ACTIVE PLAN OR START A NEW ONE'
          : 'SELECT A STRUCTURED TRAINING PLAN BASED ON YOUR GOALS AND EXPERIENCE LEVEL'
        }
      </Text>

      {/* My Plans Section */}
      {userPlans.length > 0 && (
        <View style={styles.myPlansSection}>
          <Text style={[
            styles.sectionTitle,
            {
              fontFamily: 'monospace',
              fontSize: 16,
              fontWeight: 'bold',
              color: terminalColors.textPrimary,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
            }
          ]}>
            MY PLANS
          </Text>
          {userPlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.userPlanCard,
                {
                  backgroundColor: terminalColors.panel,
                  borderWidth: 2,
                  borderColor: terminalColors.border,
                  borderRadius: 0,
                }
              ]}
              onPress={() => router.push(`/training-calendar?planId=${plan.id}&currentWeek=${plan.current_week || 1}`)}
            >
              <View style={styles.userPlanHeader}>
                <Text style={[
                  styles.userPlanName,
                  {
                    fontFamily: 'monospace',
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: terminalColors.textPrimary,
                    textTransform: 'uppercase',
                  }
                ]}>
                  {plan.plan_name.toUpperCase()}
                </Text>
                <Text style={[
                  styles.userPlanWeek,
                  {
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: terminalColors.yellow,
                    fontWeight: 'bold',
                  }
                ]}>
                  {`WEEK ${plan.current_week || 1}/${plan.duration_weeks || 12}`}
                </Text>
              </View>
              {(plan.template?.distance_type || plan.template?.experience_level) && (
                <Text style={[
                  styles.userPlanSubtext,
                  {
                    fontFamily: 'monospace',
                    fontSize: 11,
                    color: terminalColors.textSecondary,
                  }
                ]}>
                  {plan.template?.distance_type?.toUpperCase() || 'CUSTOM'} · {plan.template?.experience_level?.toUpperCase() || 'INTERMEDIATE'}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Divider */}
      {userPlans.length > 0 && <View style={[
        styles.divider,
        {
          backgroundColor: terminalColors.border,
          height: 2,
        }
      ]} />}

      <Text style={[
        styles.browsePlansTitle,
        {
          fontFamily: 'monospace',
          fontSize: 14,
          fontWeight: 'bold',
          color: terminalColors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
        }
      ]}>
        BROWSE TRAINING PLAN TEMPLATES
      </Text>

      {renderFilters()}

      <ScrollView style={styles.templatesContainer} showsVerticalScrollIndicator={false}>
        {templates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[
              styles.emptyStateText,
              {
                fontFamily: 'monospace',
                fontSize: 12,
                color: terminalColors.textSecondary,
                textTransform: 'uppercase',
              }
            ]}>
              NO TRAINING PLANS MATCH YOUR FILTERS. TRY ADJUSTING YOUR SELECTION.
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
