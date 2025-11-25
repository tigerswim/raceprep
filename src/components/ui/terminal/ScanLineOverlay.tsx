import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

/**
 * ScanLineOverlay - Subtle scan line effect for Split-Flap Terminal design system
 *
 * Features:
 * - Very subtle horizontal scan lines (1% opacity)
 * - Currently web-only for performance (iOS/Android can be enabled later)
 * - Pointer events disabled (non-interactive)
 * - Covers entire screen
 *
 * Usage:
 * Add to root layout (_layout.tsx):
 * <View style={{ flex: 1 }}>
 *   {/* App content */}
 *   <ScanLineOverlay />
 * </View>
 *
 * Performance Notes:
 * - If performance issues on low-end devices, can be disabled via feature flag
 * - Native implementation would use SVG pattern for better performance
 */
export const ScanLineOverlay: React.FC = () => {
  // Only show on web for now (iOS/Android can be enabled after testing)
  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.scanLines} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  scanLines: {
    width: '100%',
    height: '100%',
    // @ts-ignore - web only CSS property
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.01) 2px, rgba(255, 255, 255, 0.01) 4px)',
  }
});
