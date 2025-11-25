import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { toggleTerminalMode, getTerminalModeState } from '../utils/featureFlags';

/**
 * Hook to enable keyboard shortcut for toggling terminal mode
 *
 * Keyboard Shortcut:
 * - Press: Shift + D + D (tap D twice while holding Shift)
 * - Alternative: Ctrl+K (Windows/Linux) or Cmd+K (Mac)
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

    // Double-tap detector for Shift+D+D
    let lastDKeyTime = 0;
    const DOUBLE_TAP_THRESHOLD = 500; // ms

    const handleKeyPress = (event: KeyboardEvent) => {
      // Method 1: Ctrl+K or Cmd+K (simple, single key)
      const isCtrlK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';

      // Method 2: Shift+D+D (double tap D while holding Shift)
      const isShiftD = event.shiftKey && event.key.toLowerCase() === 'd';

      if (isCtrlK) {
        event.preventDefault(); // Prevent default browser behavior
        toggleMode();
      } else if (isShiftD) {
        const now = Date.now();
        if (now - lastDKeyTime < DOUBLE_TAP_THRESHOLD) {
          // Double tap detected!
          event.preventDefault();
          toggleMode();
          lastDKeyTime = 0; // Reset
        } else {
          lastDKeyTime = now;
        }
      }
    };

    const toggleMode = () => {
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
      console.log('Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to toggle again.');
      console.log('Or press Shift+D+D (tap D twice while holding Shift)');
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Log initial instructions
    console.log('%cTerminal Mode Toggle Active', 'background: #0A0E14; color: #FFD866; font-size: 14px; padding: 4px;');
    console.log('Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to toggle terminal design');
    console.log('Alternative: Press Shift+D+D (tap D twice while holding Shift)');

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return { terminalModeEnabled };
};
