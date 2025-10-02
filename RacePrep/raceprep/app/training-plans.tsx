import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { TrainingPlanSelectionScreen } from '../src/screens/Training/TrainingPlanSelectionScreen';
import { AuthGuard } from '../src/components/AuthGuard';
import { useAuth } from '../src/contexts/AuthContext';
import type { TrainingPlanTemplate } from '../src/types/trainingPlans';

export default function TrainingPlansScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSelectPlan = async (template: TrainingPlanTemplate) => {
    // Navigate to a plan creation screen or directly to calendar
    // For now, we'll navigate to a placeholder
    router.push({
      pathname: '/create-training-plan',
      params: { templateId: template.id }
    });
  };

  return (
    <AuthGuard>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Training Plans',
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
        <TrainingPlanSelectionScreen onSelectPlan={handleSelectPlan} />
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});
