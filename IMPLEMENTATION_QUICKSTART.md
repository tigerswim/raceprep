# Split-Flap Terminal - Quick Start Implementation Guide

**Ready to Begin:** This guide gets you started implementing the Split-Flap Terminal design system in 30 minutes.

---

## ⚡ Quick Overview

**What we're doing:** Transforming RacePrep from glassmorphism to vintage airport terminal aesthetic
**Time needed:** 66-90 hours total (2-5 weeks)
**Approach:** Incremental, testable, reversible
**Reference:** `/mockups/concept-1-split-flap.html`

---

## 🚀 Day 1: Get Your Bearings (30 minutes)

### Step 1: Review the Approved Mockup (5 min)
```bash
cd "/Users/danhoeller/Website Development/kineticbrandpartners/RacePrep/mockups"
open concept-1-split-flap.html
```

**Key elements to notice:**
- Hard rectangles (no rounded corners)
- Monospace typography throughout
- Scan lines in background (very subtle)
- 7-segment LED displays for T1/T2 times
- Flip-card countdown (airport style)
- Terminal bar charts with glowing edges
- Yellow accent color (#FFD866)

### Step 2: Review the Full Plan (10 min)
```bash
open SPLIT_FLAP_IMPLEMENTATION_PLAN.md
```

**Focus on:**
- Color palette (terminal colors)
- Phase 1 foundation steps
- Component patterns

### Step 3: Create a Feature Branch (2 min)
```bash
cd "/Users/danhoeller/Website Development/kineticbrandpartners/RacePrep"
git checkout -b feature/split-flap-terminal-design
git push -u origin feature/split-flap-terminal-design
```

### Step 4: Backup Current State (3 min)
```bash
# Tag current state for easy rollback
git tag pre-terminal-design
git push origin pre-terminal-design
```

### Step 5: Set Up Feature Flags (10 min)

Create feature flag system for safe rollback:

**New file:** `src/utils/featureFlags.ts`
```typescript
export const featureFlags = {
  useTerminalDesign: false,  // Start disabled
  useTerminalWidgets: {
    personalBests: false,
    goalsProgress: false,
    trainingPlan: false,
    weather: false,
    transitions: false,
    upcomingRaces: false,
    performance: false,
  }
};

export const useTerminalDesign = (component: keyof typeof featureFlags.useTerminalWidgets): boolean => {
  return featureFlags.useTerminalDesign && featureFlags.useTerminalWidgets[component];
};
```

**Commit this:**
```bash
git add src/utils/featureFlags.ts
git commit -m "feat: Add feature flag system for terminal design rollout"
```

---

## 📅 Week 1: Foundation (8-12 hours)

### Monday: Color System (2 hours)

**File:** `tailwind.config.js`

**Add new colors (keep old ones for now):**
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // New Terminal Colors
        terminal: {
          bg: '#0A0E14',
          panel: '#0F1419',
          border: '#1C2127',
        },
        text: {
          primary: '#F8F8F2',
          secondary: '#B4B8C5',
        },
        accent: {
          yellow: '#FFD866',
        },
        discipline: {
          swim: '#00D4FF',
          bike: '#FF6B35',
          run: '#4ECDC4',
        },
        // OLD COLORS (keep for gradual migration)
        primary: {
          500: '#3b82f6',
        },
        // ... existing colors
      },
      fontFamily: {
        mono: ['SF Mono', 'Monaco', 'Courier New', 'Consolas', 'monospace'],
      },
    },
  },
};
```

**Test:**
```bash
npm start
# App should load without errors, no visual changes yet
```

**Commit:**
```bash
git add tailwind.config.js
git commit -m "feat: Add terminal color palette to Tailwind config"
```

---

### Tuesday-Wednesday: Base Components (4-6 hours)

#### TerminalCard Component (1.5 hours)

**New file:** `src/components/ui/TerminalCard.tsx`

```typescript
import React from 'react';
import { View, ViewStyle } from 'react-native';

interface TerminalCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'highlighted';
  className?: string;
  style?: ViewStyle;
}

export const TerminalCard: React.FC<TerminalCardProps> = ({
  children,
  variant = 'default',
  className = '',
  style
}) => {
  const variantClasses = {
    default: 'bg-terminal-panel border-terminal-border',
    highlighted: 'bg-terminal-panel border-accent-yellow/30'
  };

  return (
    <View
      className={`border-2 p-5 ${variantClasses[variant]} ${className}`}
      style={[{ borderRadius: 0 }, style]}
    >
      {children}
    </View>
  );
};
```

#### TerminalButton Component (1.5 hours)

**New file:** `src/components/ui/TerminalButton.tsx`

```typescript
import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';

interface TerminalButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

export const TerminalButton: React.FC<TerminalButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  className = '',
  style
}) => {
  const variantClasses = {
    primary: 'bg-accent-yellow border-accent-yellow',
    secondary: 'bg-terminal-panel border-terminal-border',
    outline: 'bg-transparent border-accent-yellow/50'
  };

  const textClasses = {
    primary: 'text-terminal-bg',
    secondary: 'text-text-primary',
    outline: 'text-accent-yellow'
  };

  return (
    <TouchableOpacity
      className={`border-2 px-4 py-3 ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[{ borderRadius: 0 }, style]}
    >
      <Text className={`font-mono font-semibold text-sm uppercase tracking-wider ${textClasses[variant]}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
```

#### ScanLineOverlay Component (1.5 hours)

**New file:** `src/components/ui/ScanLineOverlay.tsx`

```typescript
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

export const ScanLineOverlay: React.FC = () => {
  // Only show on web for now (iOS/Android needs SVG optimization)
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
    // @ts-ignore - web only
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.01) 2px, rgba(255, 255, 255, 0.01) 4px)',
  }
});
```

**Create an index file for easy imports:**

**New file:** `src/components/ui/terminal/index.ts`

```typescript
export { TerminalCard } from './TerminalCard';
export { TerminalButton } from './TerminalButton';
export { ScanLineOverlay } from './ScanLineOverlay';
```

**Test the components:**

Create a test screen to verify components render:

**New file:** `src/components/ui/terminal/TerminalComponentTest.tsx`

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { TerminalCard } from './TerminalCard';
import { TerminalButton } from './TerminalButton';

export const TerminalComponentTest: React.FC = () => {
  return (
    <View className="bg-terminal-bg min-h-screen p-5">
      <TerminalCard>
        <Text className="font-mono text-text-primary mb-4">
          Terminal Card Component Test
        </Text>

        <TerminalButton
          title="Primary Button"
          onPress={() => console.log('Primary clicked')}
        />

        <View className="h-3" />

        <TerminalButton
          title="Secondary Button"
          variant="secondary"
          onPress={() => console.log('Secondary clicked')}
        />
      </TerminalCard>
    </View>
  );
};
```

**Commit:**
```bash
git add src/components/ui/terminal/
git commit -m "feat: Add base terminal UI components (Card, Button, ScanLineOverlay)"
```

---

### Thursday: Global Styles (2 hours)

**File:** `src/app/_layout.tsx`

Find the root layout and update the background:

```typescript
import { ScanLineOverlay } from '../components/ui/terminal';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0E14' }}>
      {/* Existing app content */}

      {/* Add scan line overlay */}
      <ScanLineOverlay />
    </View>
  );
}
```

**Commit:**
```bash
git add src/app/_layout.tsx
git commit -m "feat: Add terminal background and scan line overlay to root layout"
```

---

### Friday: Test & Review (2 hours)

**Run the app on all platforms:**
```bash
# Web
npm run web

# iOS (macOS only)
npm run ios

# Android
npm run android
```

**Checklist:**
- [ ] App loads without errors
- [ ] Background is dark navy (#0A0E14)
- [ ] Scan lines visible on web (very subtle)
- [ ] Test components render correctly
- [ ] No performance degradation

**Week 1 Complete!** Foundation is in place. You're ready to start migrating widgets.

---

## 📊 Week 2-3: Widget Migration (12-16 hours)

### Strategy: One Widget at a Time

**Order (easiest to hardest):**
1. PersonalBestsWidget → 2 hours
2. GoalsProgressWidget → 2 hours
3. WeatherWidget → 2 hours
4. TransitionAnalyticsWidget → 3 hours (needs 7-segment display)
5. UpcomingRacesWidget → 3 hours (needs flip cards)
6. PerformanceOverviewWidget → 4 hours (needs terminal bar chart)

### Example: PersonalBestsWidget

**Step 1:** Create terminal version alongside existing

**New file:** `src/components/dashboard/PersonalBestsWidget.terminal.tsx`

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { TerminalCard } from '../ui/terminal';

export const PersonalBestsWidgetTerminal: React.FC = () => {
  // Copy existing data loading logic from PersonalBestsWidget.tsx

  return (
    <TerminalCard>
      <Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
        Personal Bests
      </Text>

      <View className="space-y-3">
        {/* Sprint */}
        <View className="bg-terminal-bg border border-terminal-border p-4">
          <Text className="font-mono text-xs uppercase tracking-wider text-text-secondary mb-2">
            Sprint Distance
          </Text>
          <Text className="font-mono text-3xl font-bold text-discipline-swim">
            01:15:42
          </Text>
          <Text className="font-mono text-xs text-text-secondary mt-1">
            Nashville Sprint '24
          </Text>
        </View>

        {/* Olympic, 70.3 similar... */}
      </View>
    </TerminalCard>
  );
};
```

**Step 2:** Update main widget file to use feature flag

**File:** `src/components/dashboard/PersonalBestsWidget.tsx`

```typescript
import { useTerminalDesign } from '../../utils/featureFlags';
import { PersonalBestsWidgetTerminal } from './PersonalBestsWidget.terminal';
// Keep existing imports for legacy version

export const PersonalBestsWidget: React.FC = () => {
  const useTerminal = useTerminalDesign('personalBests');

  if (useTerminal) {
    return <PersonalBestsWidgetTerminal />;
  }

  // Return existing legacy component
  return (
    <View className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      {/* Existing code */}
    </View>
  );
};
```

**Step 3:** Enable the widget and test

**File:** `src/utils/featureFlags.ts`

```typescript
export const featureFlags = {
  useTerminalDesign: true,  // Enable
  useTerminalWidgets: {
    personalBests: true,  // Enable this widget
    // ... others still false
  }
};
```

**Test:**
```bash
npm start
# Verify PersonalBests widget shows terminal style
# Other widgets should still be legacy style
```

**Step 4:** Commit

```bash
git add .
git commit -m "feat(dashboard): Migrate PersonalBestsWidget to terminal design"
```

**Repeat for each widget.** After each migration:
- Test on all platforms
- Verify data displays correctly
- Check performance
- Commit

---

## 🎯 Quick Reference

### Terminal Design Checklist

Every component should have:
- ✅ `borderRadius: 0` (hard edges)
- ✅ `font-mono` on all text
- ✅ `bg-terminal-panel` or `bg-terminal-bg` for backgrounds
- ✅ `border-terminal-border` for borders
- ✅ `text-text-primary` or `text-text-secondary` for text colors
- ✅ Accent color `accent-yellow` for highlights
- ✅ Discipline colors for sport-specific data

### Common Patterns

**Widget Header:**
```tsx
<Text className="font-mono text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
  Widget Title
</Text>
```

**Stat Display:**
```tsx
<View className="bg-terminal-bg border border-terminal-border p-4 text-center">
  <Text className="font-mono text-3xl font-bold text-discipline-swim">
    01:23:45
  </Text>
  <Text className="font-mono text-xs uppercase text-text-secondary">
    Label
  </Text>
</View>
```

**Button:**
```tsx
<TerminalButton
  title="Action"
  variant="primary"
  onPress={handleAction}
/>
```

---

## 🚨 If Something Goes Wrong

### Emergency Rollback

**Quick disable (no code changes):**
```typescript
// src/utils/featureFlags.ts
export const featureFlags = {
  useTerminalDesign: false,  // Disable everything
  // ...
};
```

**Revert entire feature branch:**
```bash
git checkout main
git branch -D feature/split-flap-terminal-design
git checkout -b feature/split-flap-terminal-design pre-terminal-design
```

### Common Issues

**Issue:** Monospace font not showing
- **Fix:** Check font fallback stack in tailwind.config.js
- **Test:** Try 'Courier New' as fallback

**Issue:** Borders not visible
- **Fix:** Check contrast - may need brighter border color
- **Suggestion:** Try `#2A3139` instead of `#1C2127`

**Issue:** Performance degradation
- **Fix:** Disable scan line overlay on affected platform
- **Code:** `if (Platform.OS === 'android' && lowEndDevice) return null;`

---

## 📞 Need Help?

**Resources:**
- Full plan: `SPLIT_FLAP_IMPLEMENTATION_PLAN.md`
- Mockup reference: `mockups/concept-1-split-flap.html`
- Current RacePrep docs: `CLAUDE.md`, `README.md`

**Key Decision Points:**
1. When to enable each widget (test thoroughly before enabling)
2. Performance vs visual fidelity tradeoffs (scan lines, animations)
3. Platform-specific variations (iOS vs Android vs Web)

---

## ✅ Success Metrics

Track these throughout implementation:

**Technical:**
- [ ] Frame rate maintained at 60fps
- [ ] Bundle size increase <10%
- [ ] No crash rate increase
- [ ] All tests passing

**Visual:**
- [ ] No glassmorphism visible
- [ ] All corners hard-edged
- [ ] Monospace font everywhere
- [ ] Terminal color palette consistent

**Functional:**
- [ ] All data displays correctly
- [ ] Forms submit successfully
- [ ] Navigation works
- [ ] Animations smooth

---

**Ready to start? Begin with Week 1, Day 1 above!**

Good luck! 🚀