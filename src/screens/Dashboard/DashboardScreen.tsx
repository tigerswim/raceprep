import React from 'react';
import { Platform } from 'react-native';
import { WebDashboard } from '../../components/WebDashboard';

export const DashboardScreen: React.FC = () => {
  // Use web-optimized dashboard for both web and mobile
  return <WebDashboard />;
};