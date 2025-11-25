/**
 * Feature Flags for Terminal Design System Migration
 *
 * This file controls the gradual rollout of the Split-Flap Terminal design.
 * Start with all flags disabled, then enable one widget at a time for testing.
 *
 * Emergency Rollback: Set useTerminalDesign to false to disable everything.
 */

export const featureFlags = {
  // Master switch - set to false to disable all terminal design features
  useTerminalDesign: false,

  // Individual widget flags - enable one at a time for testing
  useTerminalWidgets: {
    personalBests: false,
    goalsProgress: false,
    trainingPlan: false,
    weather: false,
    transitions: false,
    upcomingRaces: false,
    performance: false,
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
 * Hook to check if a specific widget should use terminal design
 * @param component - The widget name from featureFlags.useTerminalWidgets
 * @returns boolean - Whether to render terminal version
 */
export const useTerminalDesign = (
  component: keyof typeof featureFlags.useTerminalWidgets
): boolean => {
  return featureFlags.useTerminalDesign && featureFlags.useTerminalWidgets[component];
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
