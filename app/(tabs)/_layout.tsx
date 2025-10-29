import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        headerShown: false,
        sceneStyle: Platform.OS === 'web' ? {
          flex: 1,
          minHeight: '100vh',
          minHeight: '100dvh', // Dynamic viewport height for iOS Safari
          overflow: 'auto'
        } : undefined,
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          position: Platform.OS === 'web' ? 'fixed' as any : 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
        }}
      />
      <Tabs.Screen
        name="races"
        options={{
          title: 'Races',
          tabBarIcon: ({ color }) => (
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <path d="M6 4L10 4L14 4L18 4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 8L18 8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 12L18 12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 16L14 16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 20L10 20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
              <circle cx="20" cy="16" r="2" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2"/>
            </svg>
          ),
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          title: 'Planning',
          tabBarIcon: ({ color }) => (
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: 'Training',
          tabBarIcon: ({ color }) => (
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <path d="M6.5 6.5H17.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
              <path d="M6.5 17.5H17.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
              <path d="M6.5 12H17.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
              <circle cx="3" cy="6.5" r="1.5" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2"/>
              <circle cx="3" cy="12" r="1.5" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2"/>
              <circle cx="3" cy="17.5" r="1.5" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2"/>
              <path d="M20 8.5L21.5 10L20 11.5L18.5 10Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.1"/>
            </svg>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1"/>
            </svg>
          ),
        }}
      />
    </Tabs>
  );
}
