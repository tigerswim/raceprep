/**
 * Feature Flags for Terminal Design System Migration
 *
 * This file controls the gradual rollout of the Split-Flap Terminal design.
 * Start with all flags disabled, then enable one widget at a time for testing.
 *
 * Emergency Rollback: Set useTerminalDesign to false to disable everything.
 *
 * TESTING:
 * - Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to toggle terminal mode on/off
 * - Alternative: Press Shift+D+D (tap D twice while holding Shift)
 * - This enables ALL terminal widgets for quick testing
 */

import { useState, useEffect } from 'react';

// Runtime toggle for testing (controlled by keyboard shortcut)
let terminalModeOverride: boolean | null = null;

export const featureFlags = {
  // Master switch - set to false to disable all terminal design features
  useTerminalDesign: true,

  // Individual widget flags - enable one at a time for testing
  useTerminalWidgets: {
    personalBests: true,
    goalsProgress: true,
    trainingPlan: true,
    weather: true,
    transitions: true,
    upcomingRaces: true,
    performance: true,
  },

  // Screen-level flags
  useTerminalScreens: {
    dashboard: false,
    races: false,
    training: false,
    planning: false,
    profile: false,
  },

  // Component-level flags
  useTerminalComponents: {
    modals: false,
    forms: false,
    navigation: false,
  },
};

/**
 * Toggle terminal mode on/off (for testing)
 * Call this from keyboard shortcut handler
 */
export const toggleTerminalMode = (): boolean => {
  if (terminalModeOverride === null) {
    // First toggle: enable all widgets
    terminalModeOverride = true;
  } else {
    // Subsequent toggles: flip the state
    terminalModeOverride = !terminalModeOverride;
  }

  console.log(`[TERMINAL MODE] ${terminalModeOverride ? 'ENABLED ✓' : 'DISABLED ✗'}`);
  console.log('Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to toggle');
  console.log('Or press Shift+D+D (tap D twice while holding Shift)');

  // Dispatch custom event to notify all widgets to re-render
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('terminalModeChanged'));
  }

  return terminalModeOverride;
};

/**
 * Get current terminal mode state
 */
export const getTerminalModeState = (): boolean => {
  return terminalModeOverride !== null ? terminalModeOverride : false;
};

/**
 * Hook to check if a specific widget should use terminal design
 * @param component - The widget name from featureFlags.useTerminalWidgets
 * @returns boolean - Whether to render terminal version
 */
export const useTerminalDesign = (
  component: keyof typeof featureFlags.useTerminalWidgets
): boolean => {
  // State to force re-render when terminal mode changes
  const [, setForceUpdate] = useState({});

  // Listen for terminal mode changes
  useEffect(() => {
    const handleTerminalModeChange = () => {
      console.log(`[${component}] Terminal mode change event received, forcing re-render`);
      setForceUpdate({}); // Force re-render with new object reference
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('terminalModeChanged', handleTerminalModeChange);
      return () => {
        window.removeEventListener('terminalModeChanged', handleTerminalModeChange);
      };
    }
  }, [component]);

  // Calculate result AFTER all hooks are called (to maintain consistent hook order)
  // If keyboard shortcut override is active, use that state for ALL widgets
  const result = terminalModeOverride !== null
    ? terminalModeOverride
    : featureFlags.useTerminalDesign && featureFlags.useTerminalWidgets[component];

  console.log(`[${component}] useTerminalDesign returning:`, result, '(override:', terminalModeOverride, ')');

  return result;
};

/**
 * Hook to check if a specific screen should use terminal design
 * @param screen - The screen name from featureFlags.useTerminalScreens
 * @returns boolean - Whether to render terminal version
 */
export const useTerminalScreen = (
  screen: keyof typeof featureFlags.useTerminalScreens
): boolean => {
  return featureFlags.useTerminalDesign && featureFlags.useTerminalScreens[screen];
};

/**
 * Hook to check if a specific component type should use terminal design
 * @param componentType - The component type from featureFlags.useTerminalComponents
 * @returns boolean - Whether to render terminal version
 */
export const useTerminalComponent = (
  componentType: keyof typeof featureFlags.useTerminalComponents
): boolean => {
  return featureFlags.useTerminalDesign && featureFlags.useTerminalComponents[componentType];
};
