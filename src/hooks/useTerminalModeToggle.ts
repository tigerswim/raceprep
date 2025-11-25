import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { toggleTerminalMode, getTerminalModeState } from '../utils/featureFlags';

/**
 * Hook to enable keyboard shortcut for toggling terminal mode
 *
 * Keyboard Shortcut:
 * - Mac: Cmd+Shift+T
 * - Windows/Linux: Ctrl+Shift+T
 *
 * Usage:
 * Add this hook to your root layout or dashboard screen:
 * ```tsx
 * const { terminalModeEnabled } = useTerminalModeToggle();
 * ```
 *
 * The hook will:
 * 1. Listen for the keyboard shortcut (web only)
 * 2. Toggle terminal mode when pressed
 * 3. Force a re-render to show changes
 * 4. Log the state change to console
 */
export const useTerminalModeToggle = () => {
  const [terminalModeEnabled, setTerminalModeEnabled] = useState(getTerminalModeState());

  useEffect(() => {
    // Only enable keyboard shortcuts on web platform
    if (Platform.OS !== 'web') {
      return;
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+T (Windows/Linux) or Cmd+Shift+T (Mac)
      const isToggleShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === 't';

      if (isToggleShortcut) {
        event.preventDefault(); // Prevent default browser behavior

        // Toggle terminal mode
        const newState = toggleTerminalMode();
        setTerminalModeEnabled(newState);

        // Show visual feedback
        if (newState) {
          console.log('%c🖥️ TERMINAL MODE ENABLED', 'background: #FFD866; color: #0A0E14; font-size: 16px; font-weight: bold; padding: 8px;');
          console.log('All dashboard widgets are now using the Split-Flap Terminal design.');
        } else {
          console.log('%c❌ TERMINAL MODE DISABLED', 'background: #FF6B35; color: #FFF; font-size: 16px; font-weight: bold; padding: 8px;');
          console.log('All dashboard widgets are now using the default glassmorphism design.');
        }
        console.log('Press Ctrl+Shift+T (Cmd+Shift+T on Mac) to toggle again.');
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Log initial instructions
    console.log('%cTerminal Mode Toggle Active', 'background: #0A0E14; color: #FFD866; font-size: 14px; padding: 4px;');
    console.log('Press Ctrl+Shift+T (Cmd+Shift+T on Mac) to toggle terminal design on/off');

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return { terminalModeEnabled };
};
