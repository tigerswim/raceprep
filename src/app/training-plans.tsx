import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { TrainingPlanSelectionScreen } from '../screens/Training/TrainingPlanSelectionScreen';
import { AuthGuard } from '../components/AuthGuard';
import type { TrainingPlanTemplate } from '../types/trainingPlans';

export default function TrainingPlansScreen() {
  const router = useRouter();

  const handleSelectPlan = async (template: TrainingPlanTemplate) => {
    // Navigate to a plan creation screen or directly to calendar
    // For now, we'll navigate to a placeholder
    router.push({
      pathname: '/create-training-plan',
      params: { templateId: template.id }
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)');
    }
  };

  return (
    <AuthGuard>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <TrainingPlanSelectionScreen
          onSelectPlan={handleSelectPlan}
          onBack={handleBack}
        />
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
