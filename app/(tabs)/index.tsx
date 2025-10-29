import React from 'react';
import { DashboardScreen } from '../../src/screens/Dashboard/DashboardScreen';
import { AuthGuard } from '../../src/components/AuthGuard';

export default function HomeScreen() {
  return (
    <AuthGuard>
      <DashboardScreen />
    </AuthGuard>
  );
}
