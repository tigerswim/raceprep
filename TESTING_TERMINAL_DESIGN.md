# Testing the Split-Flap Terminal Design System

This guide explains how to test the terminal design system that was implemented in Phase 2.

## Quick Start: Keyboard Shortcut

The fastest way to test terminal mode is using one of these keyboard shortcuts:

### Method 1 (Recommended): `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)

### Method 2 (Alternative): `Shift+D+D` (tap D twice while holding Shift)

Both methods will:
- ✅ **Enable ALL terminal widgets** instantly
- 🔄 **Toggle back to legacy design** when pressed again
- 📢 **Show status in console** with visual indicators
- ⚡ **Force immediate re-render** to display changes

### What Happens When You Toggle

**First Press** - Terminal Mode ON:
```
🖥️ TERMINAL MODE ENABLED
All dashboard widgets are now using the Split-Flap Terminal design.
Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to toggle again.
Or press Shift+D+D (tap D twice while holding Shift)
```

**Second Press** - Terminal Mode OFF:
```
❌ TERMINAL MODE DISABLED
All dashboard widgets are now using the default glassmorphism design.
Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to toggle again.
Or press Shift+D+D (tap D twice while holding Shift)
```

## Step-by-Step Testing

### 1. Start the Development Server

```bash
npm start
```

Then open the app:
- **Web**: Press `w` or visit http://localhost:8081
- **iOS Simulator**: Press `i` (macOS only)
- **Android Emulator**: Press `a`

### 2. Navigate to the Dashboard

The dashboard is the home screen (`/(tabs)/index`).

### 3. Press the Keyboard Shortcut

**Method 1 (Recommended)**:
- **Mac**: `Cmd+K`
- **Windows/Linux**: `Ctrl+K`

**Method 2 (Alternative)**:
- **Any platform**: `Shift+D+D` (tap D twice while holding Shift)

### 4. Observe the Changes

You should immediately see all 6 dashboard widgets transform:

#### Before (Legacy - Glassmorphism):
- ✨ Rounded corners everywhere
- 🌈 Gradient backgrounds
- 💨 Glass-blur effects
- 🌑 Soft shadows
- 📝 Sans-serif fonts

#### After (Terminal Design):
- 📐 **Sharp 90° corners** (borderRadius: 0)
- 🎨 **Flat solid colors** (terminal palette)
- 📺 **Scan line overlay** (CRT effect)
- 🔤 **Monospace fonts** (SF Mono → Monaco → Courier)
- ⏱️ **Retro race timing aesthetic**

## What Gets Enabled

When you press the keyboard shortcut, ALL of these widgets switch to terminal mode:

### 1. **PersonalBestsWidget**
- Discipline-colored split times (Swim=cyan, Bike=coral, Run=turquoise)
- Monospace time displays
- Recent PRs section

### 2. **GoalsProgressWidget**
- Hard-edged progress bars
- Category labels: `[PERF]`, `[TRAI]`, `[RACI]`
- Summary stats grid

### 3. **WeatherWidget**
- Large 5xl temperature display
- Training conditions with status labels
- `[SWIM]`, `[BIKE]`, `[RUN]` condition indicators

### 4. **TransitionAnalyticsWidget**
- Dual 7-segment LED displays for T1/T2 averages
- Trend indicators (↑↓→)
- Optimization tips in terminal style

### 5. **UpcomingRacesWidget**
- Airport flip-card countdown displays
- Days/Hours/Minutes in separate cards
- Race status labels: `[REG]`, `[TRA]`, `[INT]`
- Training progress bars

### 6. **PerformanceOverviewWidget**
- Horizontal bar chart (last 7 days)
- Stacked swim/bike/run segments
- Week-over-week change indicators
- Discipline breakdown grid

## Visual Checklist

Use this checklist to verify the terminal design is working:

### Core Visual Elements
- [ ] **Hard edges**: All components have borderRadius: 0
- [ ] **Monospace fonts**: All text uses monospace font stack
- [ ] **Uppercase labels**: Section headers are uppercase with letter-spacing
- [ ] **Dark backgrounds**: Terminal-bg color (#0A0E14)
- [ ] **Accent yellow**: Bright yellow (#FFD866) for highlights
- [ ] **Discipline colors**:
  - Swim: cyan (#00D4FF)
  - Bike: coral (#FF6B35)
  - Run: turquoise (#4ECDC4)

### Special Components
- [ ] **FlipCard**: Airport-style flip cards with horizontal split line
- [ ] **SevenSegmentDisplay**: LED glow effect on time values
- [ ] **TerminalBarChart**: Horizontal bars with stacked swim/bike/run
- [ ] **Progress bars**: Hard-edged solid color fills (no gradients)

### Widget-Specific Features
- [ ] **PersonalBests**: Split times use discipline colors
- [ ] **Goals**: Progress bars are hard-edged rectangles
- [ ] **Weather**: Temperature is very large (5xl size)
- [ ] **Transitions**: 7-segment displays glow
- [ ] **UpcomingRaces**: Countdown uses flip cards
- [ ] **Performance**: Bar chart shows stacked disciplines

## Manual Testing (Without Keyboard Shortcut)

If you prefer to test individual widgets, you can manually edit the feature flags:

### Edit `src/utils/featureFlags.ts`:

```typescript
export const featureFlags = {
  useTerminalDesign: true, // Enable master switch

  useTerminalWidgets: {
    personalBests: true,   // Enable individually
    goalsProgress: true,
    weather: true,
    transitions: true,
    upcomingRaces: true,
    performance: true,
  },
};
```

**Note**: The keyboard shortcut overrides these manual settings when active.

## Browser Console

Watch the browser console for helpful messages:

### On Page Load:
```
Terminal Mode Toggle Active
Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to toggle terminal design
Alternative: Press Shift+D+D (tap D twice while holding Shift)
```

### On Toggle:
```
🖥️ TERMINAL MODE ENABLED
[TERMINAL MODE] ENABLED ✓
```

## Troubleshooting

### Keyboard Shortcut Doesn't Work
- ✅ **Check platform**: Only works on web (not iOS/Android native)
- ✅ **Check console**: Look for "Terminal Mode Toggle Active" message
- ✅ **Try different key**: Some browsers block certain shortcuts
- ✅ **Refresh page**: Hard refresh with Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Widgets Don't Change
- ✅ **Check console**: Look for toggle confirmation messages
- ✅ **Force refresh**: The hook should trigger re-render automatically
- ✅ **Check feature flags**: Ensure `useTerminalDesign` hook is imported correctly
- ✅ **Clear cache**: Stop dev server and restart with `npm start -- --clear`

### Some Widgets Use Terminal, Others Don't
- ✅ **Check widget code**: Ensure widget imports `useTerminalDesign` hook
- ✅ **Check feature flag name**: Widget must use correct flag name (e.g., `'personalBests'`)
- ✅ **Check terminal file exists**: Each widget needs a `.terminal.tsx` version

## Testing on Different Platforms

### Web (Recommended)
- ✅ Keyboard shortcut works
- ✅ Best visual fidelity
- ✅ Easy to inspect with DevTools

### iOS Simulator
- ⚠️ Keyboard shortcut doesn't work (web only)
- ℹ️ Use manual feature flag editing instead
- ✅ Visual appearance should match web

### Android Emulator
- ⚠️ Keyboard shortcut doesn't work (web only)
- ℹ️ Use manual feature flag editing instead
- ✅ Visual appearance should match web

## Next Steps

After verifying the terminal design works:

1. **Take screenshots** for comparison
2. **Test on different screen sizes** (mobile, tablet, desktop)
3. **Check accessibility** (contrast, readability)
4. **Performance test** (render times, animations)
5. **Provide feedback** on the design

## Implementation Details

### How It Works

1. **Feature Flag System** (`src/utils/featureFlags.ts`)
   - Runtime toggle state (`terminalModeOverride`)
   - `useTerminalDesign()` hook checks override first
   - Falls back to individual widget flags

2. **Keyboard Hook** (`src/hooks/useTerminalModeToggle.ts`)
   - Web-only event listener for keydown
   - Detects Ctrl+Shift+T or Cmd+Shift+T
   - Calls `toggleTerminalMode()` and forces re-render

3. **Dashboard Integration** (`src/components/WebDashboard.tsx`)
   - Calls `useTerminalModeToggle()` hook
   - Hook registers keyboard listener
   - Widgets automatically respond to state changes

4. **Widget Pattern**
   - Each widget checks `useTerminalDesign('widgetName')`
   - Returns terminal version if enabled
   - Falls back to legacy version if disabled

### Files Modified

- `src/utils/featureFlags.ts` - Added toggle functions
- `src/hooks/useTerminalModeToggle.ts` - NEW: Keyboard hook
- `src/components/WebDashboard.tsx` - Added hook usage
- All dashboard widget files - Already had feature flag checks

## Support

If you encounter issues:
1. Check console for error messages
2. Verify all files are saved
3. Restart dev server with `npm start -- --clear`
4. Check that all `.terminal.tsx` files exist

---

**Happy Testing! 🖥️**

Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) to see the magic! ✨

Or press `Shift+D+D` (tap D twice while holding Shift) for a fun alternative!
