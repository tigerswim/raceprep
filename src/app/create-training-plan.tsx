import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { AuthGuard } from '../components/AuthGuard';
import { useAuth } from '../contexts/AuthContext';
import { trainingPlanService } from '../services/trainingPlanService';
import type { TrainingPlanTemplate } from '../types/trainingPlans';

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

export default function CreateTrainingPlanScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const templateId = params.templateId as string;

  const [template, setTemplate] = useState<TrainingPlanTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const result = await trainingPlanService.getTrainingPlanTemplate(templateId);
      if (result.data) {
        setTemplate(result.data);
        setPlanName(result.data.name);
        // Set default start date to next Monday
        const nextMonday = getNextMonday();
        setStartDate(nextMonday.toISOString().split('T')[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const getNextMonday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday;
  };

  const calculateEndDate = (start: string, weeks: number) => {
    const startDate = new Date(start);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (weeks * 7));
    return endDate.toISOString().split('T')[0];
  };

  const handleCreatePlan = async () => {
    if (!user || !template) return;

    if (!planName.trim()) {
      Alert.alert('Error', 'Please enter a plan name');
      return;
    }

    if (!startDate) {
      Alert.alert('Error', 'Please select a start date');
      return;
    }

    try {
      setSubmitting(true);

      const endDate = calculateEndDate(startDate, template.duration_weeks);

      const result = await trainingPlanService.createUserTrainingPlan({
        user_id: user.id,
        template_id: template.id,
        plan_name: planName,
        start_date: startDate,
        end_date: endDate,
        current_week: 1,
      });

      if (result.error) {
        Alert.alert('Error', result.error.message);
      } else if (result.data) {
        // Navigate immediately to calendar
        router.replace({
          pathname: '/training-calendar',
          params: {
            planId: result.data.id,
            currentWeek: 1,
          },
        });
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create plan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen
          options={{
            title: 'CREATE TRAINING PLAN',
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
        <ActivityIndicator size="large" color={terminalColors.yellow} />
        <Text style={styles.loadingText}>LOADING TEMPLATE...</Text>
      </View>
    );
  }

  if (!template) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen
          options={{
            title: 'CREATE TRAINING PLAN',
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
        <Text style={styles.errorText}>TEMPLATE NOT FOUND</Text>
      </View>
    );
  }

  return (
    <AuthGuard>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'CREATE TRAINING PLAN',
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

        <ScrollView style={styles.content}>
          {/* Template Summary */}
          <View style={styles.templateSummary}>
            <Text style={styles.templateName}>{template.name.toUpperCase()}</Text>
            <View style={styles.templateStats}>
              <Text style={styles.templateStat}>
                [{template.duration_weeks} WEEKS]
              </Text>
              <Text style={styles.templateStatDivider}>•</Text>
              <Text style={styles.templateStat}>
                [{template.weekly_hours_min}-{template.weekly_hours_max} HRS/WEEK]
              </Text>
            </View>
            {template.description && (
              <Text style={styles.templateDescription}>{template.description}</Text>
            )}
          </View>

          {/* Plan Name */}
          <View style={styles.formField}>
            <Text style={styles.formLabel}>&gt; PLAN NAME:</Text>
            <TextInput
              style={styles.formInput}
              value={planName}
              onChangeText={setPlanName}
              placeholder="MY TRAINING PLAN"
              placeholderTextColor={`${terminalColors.textSecondary}66`}
            />
          </View>

          {/* Start Date */}
          <View style={styles.formField}>
            <Text style={styles.formLabel}>&gt; START DATE:</Text>
            <TextInput
              style={styles.formInput}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={`${terminalColors.textSecondary}66`}
            />
            <Text style={styles.formHint}>
              → RECOMMENDED: START ON A MONDAY
            </Text>
            <Text style={styles.formHint}>
              → PLAN ENDS: {calculateEndDate(startDate || new Date().toISOString().split('T')[0], template.duration_weeks)}
            </Text>
          </View>

          {/* Race Selection (Optional - can be added later) */}
          <View style={styles.formField}>
            <Text style={styles.formLabel}>&gt; TARGET RACE (OPTIONAL):</Text>
            <Text style={styles.formHint}>
              → LINK THIS PLAN TO A SPECIFIC RACE FROM YOUR CALENDAR
            </Text>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>[SELECT RACE]</Text>
            </TouchableOpacity>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, submitting && styles.createButtonDisabled]}
            onPress={handleCreatePlan}
            disabled={submitting}
          >
            <Text style={styles.createButtonText}>
              {submitting ? '[CREATING...]' : '[CREATE TRAINING PLAN]'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </AuthGuard>
  );
}

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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  templateSummary: {
    backgroundColor: terminalColors.panel,
    borderWidth: 2,
    borderColor: terminalColors.border,
    padding: 20,
    marginBottom: 24,
  },
  templateName: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: 'bold',
    color: terminalColors.textPrimary,
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  templateStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateStat: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: terminalColors.yellow,
    fontWeight: 'bold',
  },
  templateStatDivider: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: terminalColors.textSecondary,
    marginHorizontal: 8,
  },
  templateDescription: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: terminalColors.textSecondary,
    lineHeight: 18,
  },
  formField: {
    marginBottom: 24,
  },
  formLabel: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    color: terminalColors.yellow,
    marginBottom: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  formInput: {
    backgroundColor: terminalColors.panel,
    borderWidth: 2,
    borderColor: terminalColors.border,
    padding: 12,
    fontFamily: 'monospace',
    fontSize: 14,
    color: terminalColors.textPrimary,
  },
  formHint: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: terminalColors.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },
  linkButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: terminalColors.border,
    padding: 12,
    marginTop: 8,
  },
  linkButtonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: terminalColors.swim,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  createButton: {
    backgroundColor: terminalColors.yellow,
    padding: 16,
    marginTop: 8,
    marginBottom: 40,
    borderWidth: 2,
    borderColor: terminalColors.yellow,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
    color: terminalColors.bg,
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  loadingText: {
    marginTop: 16,
    fontFamily: 'monospace',
    fontSize: 12,
    color: terminalColors.textSecondary,
    letterSpacing: 1.2,
  },
  errorText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
});
