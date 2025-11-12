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
            title: 'Create Training Plan',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#1a1a1a',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              color: '#fff',
            },
          }}
        />
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!template) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen
          options={{
            title: 'Create Training Plan',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#1a1a1a',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              color: '#fff',
            },
          }}
        />
        <Text style={styles.errorText}>Template not found</Text>
      </View>
    );
  }

  return (
    <AuthGuard>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Create Training Plan',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#1a1a1a',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              color: '#fff',
            },
          }}
        />

        <ScrollView style={styles.content}>
          {/* Template Summary */}
          <View style={styles.templateSummary}>
            <Text style={styles.templateName}>{template.name}</Text>
            <View style={styles.templateStats}>
              <Text style={styles.templateStat}>
                {template.duration_weeks} weeks
              </Text>
              <Text style={styles.templateStat}>•</Text>
              <Text style={styles.templateStat}>
                {template.weekly_hours_min}-{template.weekly_hours_max} hrs/week
              </Text>
            </View>
          </View>

          {/* Plan Name */}
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Plan Name</Text>
            <TextInput
              style={styles.formInput}
              value={planName}
              onChangeText={setPlanName}
              placeholder="My Training Plan"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
          </View>

          {/* Start Date */}
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Start Date</Text>
            <TextInput
              style={styles.formInput}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
            <Text style={styles.formHint}>
              Recommended: Start on a Monday. Your plan will end on{' '}
              {calculateEndDate(startDate || new Date().toISOString().split('T')[0], template.duration_weeks)}
            </Text>
          </View>

          {/* Race Selection (Optional - can be added later) */}
          <View style={styles.formField}>
            <Text style={styles.formLabel}>Target Race (Optional)</Text>
            <Text style={styles.formHint}>
              You can link this plan to a specific race from your race calendar
            </Text>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Select Race</Text>
            </TouchableOpacity>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, submitting && styles.createButtonDisabled]}
            onPress={handleCreatePlan}
            disabled={submitting}
          >
            <Text style={styles.createButtonText}>
              {submitting ? 'Creating...' : 'Create Training Plan'}
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
    backgroundColor: '#1a1a1a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  templateSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  templateName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 1)',
    marginBottom: 8,
  },
  templateStats: {
    flexDirection: 'row',
    gap: 8,
  },
  templateStat: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  formField: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 1)',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 1)',
  },
  formHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 6,
    lineHeight: 20,
  },
  linkButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
    marginTop: 8,
  },
  linkButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    textAlign: 'center',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    marginBottom: 40,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
});
