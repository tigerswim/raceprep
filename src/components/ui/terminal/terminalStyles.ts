import { TextStyle, ViewStyle } from 'react-native';

/**
 * Terminal Design System - Inline Styles
 *
 * Since Tailwind/NativeWind className props don't work reliably on web,
 * this file provides inline style equivalents for the terminal design system.
 *
 * Usage:
 * import { terminalColors, terminalText, terminalView } from '../ui/terminal/terminalStyles';
 *
 * <Text style={terminalText.header}>Header</Text>
 * <View style={terminalView.panel}>Content</View>
 */

// Terminal Color Palette (matching tailwind.config.js)
export const terminalColors = {
  bg: '#0A0E14',
  panel: '#0F1419',
  border: '#1C2127',
  textPrimary: '#F8F8F2',
  textSecondary: '#B4B8C5',
  yellow: '#FFD866',
  swim: '#00D4FF',
  bike: '#FF6B35',
  run: '#4ECDC4',
  green: '#4ECDC4',
  red: '#FF6B35',
};

// Common Text Styles
export const terminalText = {
  // Headers
  header: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: 'bold' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    color: terminalColors.textPrimary,
  },
  subheader: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    color: terminalColors.textSecondary,
  },

  // Body text
  base: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: terminalColors.textPrimary,
  },
  primary: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: terminalColors.textPrimary,
  },
  secondary: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: terminalColors.textSecondary,
  },
  small: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: terminalColors.textSecondary,
  },

  // Emphasis
  large: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: terminalColors.textPrimary,
  },
  xlarge: {
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: terminalColors.textPrimary,
  },

  // Colors
  yellow: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '600' as const,
    color: terminalColors.yellow,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
  },
  swim: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600' as const,
    color: terminalColors.swim,
  },
  bike: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600' as const,
    color: terminalColors.bike,
  },
  run: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600' as const,
    color: terminalColors.run,
  },
};

// Common View Styles
export const terminalView = {
  // Containers
  panel: {
    backgroundColor: terminalColors.bg,
    borderWidth: 1,
    borderColor: terminalColors.border,
    borderRadius: 0,
    padding: 12,
  } as ViewStyle,

  card: {
    backgroundColor: terminalColors.panel,
    borderWidth: 2,
    borderColor: terminalColors.border,
    borderRadius: 0,
    padding: 20,
  } as ViewStyle,

  // Layout
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  } as ViewStyle,

  spaceBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  } as ViewStyle,

  // Borders
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: terminalColors.border,
    paddingTop: 16,
  } as ViewStyle,

  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: terminalColors.border,
    paddingBottom: 16,
  } as ViewStyle,
};

// Utility function to merge styles
export const mergeStyles = (...styles: any[]) => {
  return Object.assign({}, ...styles);
};
