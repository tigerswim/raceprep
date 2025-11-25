# Split-Flap Terminal Design System - Implementation Plan

**Project:** RacePrep Mobile Application
**Design System:** Split-Flap Terminal (Airport Departure Board Aesthetic)
**Estimated Time:** 66-90 hours (2-5 weeks depending on commitment)
**Status:** Ready to Begin
**Created:** January 2025

---

## Executive Summary

Transform RacePrep from glassmorphism/vibe-coded design to Split-Flap Terminal aesthetic inspired by vintage airport displays and retro computing terminals. Implementation will be **incremental, testable, and reversible**, maintaining all functionality while systematically replacing visual elements across iOS, Android, and Web.

**Key Changes:**
- ❌ Remove: Glassmorphism, blur effects, gradients, rounded corners, blur orbs
- ✅ Add: Hard rectangles, monospace typography, scan lines, 7-segment displays, flip-card countdown, terminal bar charts

---

## Quick Start Guide

### Week 1: Foundation
1. Update `tailwind.config.js` with new color palette
2. Create base components (TerminalCard, TerminalButton, ScanLineOverlay)
3. Test on all three platforms

### Week 2-3: Core Widgets
4. Migrate dashboard widgets one by one (7 total)
5. Implement terminal charts and 7-segment displays
6. Add flip-card countdown animation

### Week 4: Screens & Polish
7. Update all screens (Dashboard, Races, Training, Profile)
8. Refactor modals and forms
9. Cross-platform testing

### Week 5: Launch
10. Gradual rollout with feature flags
11. Monitor metrics and user feedback
12. Full migration and cleanup

---

## Phase 1: Foundation (8-12 hours)

### 1.1 Color System Update

**File:** `tailwind.config.js`

Replace current colors with terminal palette:

```javascript
colors: {
  terminal: {
    bg: '#0A0E14',      // Deep navy-black
    panel: '#0F1419',   // Panel background
    border: '#1C2127',  // Dark borders
  },
  text: {
    primary: '#F8F8F2',    // Cream white
    secondary: '#B4B8C5',  // Light gray
  },
  accent: {
    yellow: '#FFD866',  // Warm yellow
  },
  discipline: {
    swim: '#00D4FF',    // Cyan
    bike: '#FF6B35',    // Coral
    run: '#4ECDC4',     // Turquoise
  }
}
```

Add monospace font stack:
```javascript
fontFamily: {
  mono: ['SF Mono', 'Monaco', 'Courier New', 'Consolas', 'monospace']
}
```

**Testing:** Run `npm start` - app loads without errors, no visual changes yet.

---

### 1.2 Base Components (4-6 hours)

Create new terminal-themed components:

#### TerminalCard Component
**File:** `src/components/ui/TerminalCard.tsx` (NEW)

```typescript
export const TerminalCard: React.FC<TerminalCardProps> = ({ children, className }) => {
  return (
    <View
      className={`bg-terminal-panel border-2 border-terminal-border p-5 ${className}`}
      style={{ borderRadius: 0 }}
    >
      {children}
    </View>
  );
};
```

**Key Features:**
- Hard rectangles (`borderRadius: 0`)
- No glassmorphism
- Solid panel background
- 2px borders

#### TerminalButton Component
**File:** `src/components/ui/TerminalButton.tsx` (NEW)

```typescript
export const TerminalButton: React.FC = ({ title, onPress, variant = 'primary' }) => {
  const variantClasses = {
    primary: 'bg-accent-yellow text-terminal-bg border-2 border-accent-yellow',
    secondary: 'bg-terminal-panel border-2 border-terminal-border text-text-primary',
  };

  return (
    <TouchableOpacity
      className={`font-mono font-semibold uppercase tracking-wider px-4 py-3 ${variantClasses[variant]}`}
      onPress={onPress}
      style={{ borderRadius: 0 }}
    >
      <Text className="font-mono font-semibold uppercase">{title}</Text>
    </TouchableOpacity>
  );
};
```

#### ScanLineOverlay Component
**File:** `src/components/ui/ScanLineOverlay.tsx` (NEW)

Subtle horizontal scan lines (1% opacity) for retro terminal feel.

**Web:** CSS gradient
**iOS/Android:** SVG lines (optimized for performance)

---

### 1.3 Global Style Updates (2 hours)

**File:** `src/app/_layout.tsx`

```typescript
<View style={{ flex: 1, backgroundColor: '#0A0E14' }}>
  {/* App content */}
  {Platform.OS === 'web' && <ScanLineOverlay />}
</View>
```

**Changes:**
- Set global background to terminal-bg (#0A0E14)
- Remove blur orbs
- Add scan line overlay (web only initially)

---

## Phase 2: Core Dashboard Widgets (12-16 hours)

Rebuild widgets one at a time. **Order by complexity:**

### Migration Order:
1. ✅ PersonalBestsWidget (2h) - Simplest
2. ✅ GoalsProgressWidget (2h)
3. ✅ TrainingPlanProgressWidget (2.5h)
4. ✅ WeatherWidget (2h)
5. ✅ TransitionAnalyticsWidget (3h) - 7-segment displays
6. ✅ UpcomingRacesWidget (3h) - Flip-card countdown
7. ✅ PerformanceOverviewWidget (4h) - Terminal bar charts

---

### 2.1 TransitionAnalyticsWidget (3 hours)

**File:** `src/components/dashboard/TransitionAnalyticsWidget.tsx`

**New Component:** `src/components/ui/SevenSegmentDisplay.tsx`

```typescript
export const SevenSegmentDisplay: React.FC<{ value: string; color: string; label: string }> =
  ({ value, color, label }) => {
  return (
    <View className="items-center">
      <Text
        style={{
          fontFamily: 'SF Mono',
          fontSize: 28,
          fontWeight: '700',
          color: color,
          textShadowColor: color,
          textShadowRadius: 10
        }}
      >
        {value}
      </Text>
      <Text className="font-mono text-xs uppercase tracking-wider text-text-secondary mt-2">
        {label}
      </Text>
    </View>
  );
};
```

**Widget Implementation:**
```tsx
<TerminalCard>
  <Text className="font-mono text-xs uppercase text-text-secondary mb-4">
    Transition Analytics
  </Text>

  <View className="grid grid-cols-2 gap-4">
    <View className="bg-terminal-bg border-2 border-discipline-swim/30 p-4">
      <SevenSegmentDisplay
        value="2:15"
        color="#00D4FF"
        label="Avg T1"
      />
    </View>

    <View className="bg-terminal-bg border-2 border-discipline-bike/30 p-4">
      <SevenSegmentDisplay
        value="1:30"
        color="#FF6B35"
        label="Avg T2"
      />
    </View>
  </View>

  <View className="bg-terminal-bg border-l-3 border-accent-yellow p-3 mt-3">
    <Text className="font-mono text-xs uppercase text-accent-yellow mb-1">
      Optimization Tip
    </Text>
    <Text className="text-xs text-text-secondary">
      Practice helmet removal to improve T2 by 15-20 seconds
    </Text>
  </View>
</TerminalCard>
```

---

### 2.2 UpcomingRacesWidget (3 hours)

**File:** `src/components/dashboard/UpcomingRacesWidget.tsx`

**New Component:** `src/components/ui/FlipCard.tsx`

Airport-style flip card countdown.

```typescript
export const FlipCard: React.FC<{ value: number }> = ({ value }) => {
  const formattedValue = value.toString().padStart(2, '0');

  return (
    <View className="w-9 h-13 bg-terminal-bg border-2 border-terminal-border items-center justify-center relative">
      <Text className="font-mono text-3xl font-bold text-accent-yellow">
        {formattedValue}
      </Text>
      <View className="absolute top-1/2 left-0 right-0 h-px bg-terminal-border" />
    </View>
  );
};
```

**Countdown Implementation:**
```tsx
<TerminalCard className="col-span-2">
  <Text className="font-mono text-base font-bold uppercase text-text-primary mb-2">
    CHATTANOOGA 70.3
  </Text>

  <View className="flex-row justify-center gap-3 my-5">
    {/* Days */}
    <View className="items-center">
      <View className="flex-row gap-1">
        <FlipCard value={Math.floor(race.daysUntil / 10)} />
        <FlipCard value={race.daysUntil % 10} />
      </View>
      <Text className="font-mono text-xs uppercase text-text-secondary mt-2">
        Days
      </Text>
    </View>

    {/* Hours & Minutes similar... */}
  </View>

  {/* Race Distance Info */}
  <View className="grid grid-cols-4 gap-3">
    <View className="bg-terminal-bg border border-terminal-border p-3 text-center">
      <Text className="font-mono text-2xl font-bold text-run-turquoise">65%</Text>
      <Text className="font-mono text-xs uppercase text-text-secondary">Training</Text>
    </View>
    <View className="bg-terminal-bg border border-terminal-border p-3 text-center">
      <Text className="font-mono text-2xl font-bold text-discipline-swim">1.2</Text>
      <Text className="font-mono text-xs uppercase text-text-secondary">Swim (Mi)</Text>
    </View>
    <View className="bg-terminal-bg border border-terminal-border p-3 text-center">
      <Text className="font-mono text-2xl font-bold text-discipline-bike">56</Text>
      <Text className="font-mono text-xs uppercase text-text-secondary">Bike (Mi)</Text>
    </View>
    <View className="bg-terminal-bg border border-terminal-border p-3 text-center">
      <Text className="font-mono text-2xl font-bold text-discipline-run">13.1</Text>
      <Text className="font-mono text-xs uppercase text-text-secondary">Run (Mi)</Text>
    </View>
  </View>
</TerminalCard>
```

---

### 2.3 PerformanceOverviewWidget (4 hours)

**File:** `src/components/dashboard/PerformanceOverviewWidget.tsx`

**New Component:** `src/components/charts/TerminalBarChart.tsx`

Replace custom SVG stacked area chart with terminal horizontal bars.

```typescript
export const TerminalBarChart: React.FC<{ data: BarData[] }> = ({ data }) => {
  return (
    <View className="my-5">
      {data.map((item, index) => {
        const percentage = (item.value / item.maxValue) * 100;
        return (
          <View key={index} className="flex-row items-center gap-3 mb-3">
            <Text className="font-mono text-xs uppercase text-text-secondary w-10">
              {item.label}
            </Text>

            <View className="flex-1 h-6 bg-terminal-bg border border-terminal-border relative overflow-hidden">
              <View
                className="h-full absolute left-0 top-0"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color
                }}
              >
                <View
                  className="absolute top-0 right-0 w-0.5 h-full"
                  style={{
                    backgroundColor: item.color,
                    shadowColor: item.color,
                    shadowRadius: 8
                  }}
                />
              </View>
            </View>

            <Text className="font-mono text-xs font-bold text-text-primary w-12 text-right">
              {item.value}{item.unit}
            </Text>
          </View>
        );
      })}
    </View>
  );
};
```

**Widget Implementation:**
```tsx
<TerminalCard>
  <Text className="font-mono text-xs uppercase text-text-secondary mb-4">
    Training Volume — Last 7 Days
  </Text>

  <TerminalBarChart
    data={[
      { label: 'MON', value: 3.2, maxValue: 8, color: '#00D4FF', unit: 'h' },
      { label: 'TUE', value: 1.5, maxValue: 8, color: '#4ECDC4', unit: 'h' },
      { label: 'WED', value: 4.0, maxValue: 8, color: '#FF6B35', unit: 'h' },
      // ... remaining days
    ]}
  />

  {/* Summary Stats */}
  <View className="grid grid-cols-4 gap-3 mt-5">
    <View className="bg-terminal-bg border border-terminal-border p-4 text-center">
      <Text className="font-mono text-3xl font-bold text-discipline-swim">5.3h</Text>
      <Text className="font-mono text-xs uppercase text-text-secondary">Swim</Text>
    </View>
    {/* Bike, Run, +12% similar... */}
  </View>
</TerminalCard>
```

**Stacked Bars (Multi-Discipline Days):**
For days with multiple workouts (e.g., Monday: 3.2h swim + 4h bike):

```tsx
<View className="flex-1 h-6 bg-terminal-bg border border-terminal-border relative">
  {/* Swim segment */}
  <View
    className="h-full absolute left-0"
    style={{ width: '40%', backgroundColor: '#00D4FF' }}
  />
  {/* Bike segment (starts where swim ends) */}
  <View
    className="h-full absolute"
    style={{ left: '40%', width: '50%', backgroundColor: '#FF6B35' }}
  />
</View>
```

---

## Phase 3: Screens & Navigation (10-14 hours)

### 3.1 Dashboard Screen (2 hours)

**File:** `src/components/WebDashboard.tsx`

```tsx
<View className="bg-terminal-bg min-h-screen">
  <View className="border-b-2 border-terminal-border px-5 py-4">
    <Text className="font-mono text-xs uppercase text-text-secondary">
      Dashboard
    </Text>
  </View>

  <View className="p-5 gap-5">
    {/* Widget Grid */}
  </View>
</View>
```

---

### 3.2 Races Screen (3 hours)

**File:** `src/app/(tabs)/races.tsx`

**Race Card Pattern:**
```tsx
<View className="bg-terminal-panel border-2 border-terminal-border p-4 mb-4">
  <Text className="font-mono text-base font-bold uppercase text-text-primary mb-2">
    CHATTANOOGA 70.3
  </Text>

  <View className="flex-row gap-4 mb-3">
    <View>
      <Text className="font-mono text-xs uppercase text-text-secondary">Date</Text>
      <Text className="font-mono text-sm font-semibold text-accent-yellow">
        MAY 19, 2024
      </Text>
    </View>
    <View>
      <Text className="font-mono text-xs uppercase text-text-secondary">Distance</Text>
      <Text className="font-mono text-sm font-semibold text-discipline-swim">
        70.3
      </Text>
    </View>
  </View>

  {/* Split Times Grid */}
  <View className="grid grid-cols-5 gap-2">
    <View className="bg-terminal-bg border border-terminal-border p-2 text-center">
      <Text className="font-mono text-xs uppercase text-text-secondary">Swim</Text>
      <Text className="font-mono text-sm font-bold text-discipline-swim">32:15</Text>
    </View>
    {/* T1, Bike, T2, Run similar... */}
  </View>
</View>
```

---

### 3.3 Navigation Bar (2 hours)

**File:** `src/app/(tabs)/_layout.tsx`

Terminal-style segmented tab bar:

```tsx
<View className="bg-terminal-panel border-t-2 border-terminal-border">
  <View className="flex-row justify-around py-3">
    {tabs.map(tab => (
      <TouchableOpacity
        key={tab.name}
        className={`flex-1 items-center py-2 ${
          currentTab === tab.name ? 'border-t-2 border-accent-yellow' : ''
        }`}
      >
        <Text className={`font-mono text-xs uppercase tracking-wider ${
          currentTab === tab.name ? 'text-accent-yellow font-bold' : 'text-text-secondary'
        }`}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>
```

---

## Phase 4: Modals & Forms (8-10 hours)

### 4.1 Modal System (3 hours)

**Files:**
- `src/components/AddResultModal.tsx`
- `src/components/RaceAnalysisModal.tsx`

**Pattern:**
```tsx
<View className="flex-1 bg-terminal-bg/95 items-center justify-center">
  <View className="bg-terminal-panel border-2 border-accent-yellow w-full max-w-lg">
    {/* Header */}
    <View className="border-b-2 border-terminal-border px-6 py-4 flex-row justify-between">
      <Text className="font-mono text-sm uppercase text-accent-yellow">
        Add Race Result
      </Text>
      <TouchableOpacity onPress={onClose}>
        <Text className="text-2xl text-text-secondary">×</Text>
      </TouchableOpacity>
    </View>

    {/* Body */}
    <View className="p-6">
      {children}
    </View>

    {/* Footer */}
    <View className="border-t-2 border-terminal-border px-6 py-4 flex-row gap-3 justify-end">
      <TerminalButton variant="secondary" title="Cancel" onPress={onClose} />
      <TerminalButton variant="primary" title="Submit" onPress={onSubmit} />
    </View>
  </View>
</View>
```

---

### 4.2 Form Inputs (2 hours)

**File:** `src/components/ui/TerminalInput.tsx` (NEW)

```typescript
export const TerminalInput: React.FC<InputProps> = ({ label, value, onChangeText }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      <Text className="font-mono text-xs uppercase text-text-secondary mb-2">
        {label}
      </Text>
      <View
        className="border-2 bg-terminal-bg"
        style={{ borderColor: isFocused ? '#FFD866' : '#1C2127' }}
      >
        <TextInput
          className="font-mono text-sm text-text-primary px-3 py-2"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{ borderRadius: 0 }}
        />
      </View>
    </View>
  );
};
```

---

## Phase 5: Testing & Optimization (8-10 hours)

### 5.1 Cross-Platform Testing

**iOS (3h):**
- [ ] SF Mono font renders correctly
- [ ] 7-segment glow effects visible
- [ ] Flip cards animate smoothly
- [ ] Safe area respected
- [ ] Touch targets adequate (44x44pt)

**Android (3h):**
- [ ] Monospace fallback works (Courier New likely)
- [ ] Borders render consistently
- [ ] No animation jank (60fps)
- [ ] Material nav conflicts resolved

**Web (2h):**
- [ ] Responsive breakpoints (375px, 768px, 1024px)
- [ ] Hover states functional
- [ ] Keyboard navigation
- [ ] WCAG AA contrast compliance

---

### 5.2 Performance Benchmarks

**Targets:**
- Dashboard load: <1000ms
- Widget render: <60ms each
- Frame rate: 60fps
- Memory: No increase >10%

**Monitor:**
- Bundle size (should be minimal - no new dependencies)
- Scan line performance (disable on low-end devices if needed)

---

## Phase 6: Migration Strategy (4-6 hours)

### Feature Flag System

**File:** `src/utils/featureFlags.ts` (NEW)

```typescript
export const featureFlags = {
  useTerminalDesign: true,
  useTerminalWidgets: {
    personalBests: true,
    transitions: true,
    upcomingRaces: true,
    performance: true,
    // ... all widgets
  }
};
```

**Usage in Components:**
```tsx
import { useTerminalDesign } from '../../utils/featureFlags';

export const PerformanceOverviewWidget = () => {
  const useTerminal = useTerminalDesign('performance');

  if (useTerminal) {
    return <TerminalPerformanceWidget />;
  }
  return <LegacyPerformanceWidget />;
};
```

### Gradual Rollout

1. **Week 1:** Internal testing (feature flag enabled for dev team)
2. **Week 2:** 10% users
3. **Week 3:** 50% users
4. **Week 4:** 100% users
5. **Week 5:** Remove legacy code

**Rollback Trigger:**
- Crash rate increase >2%
- Frame rate drops <55fps consistently
- User complaints >10% feedback

**Emergency Rollback:**
```typescript
featureFlags.useTerminalDesign = false;
```

---

## Technical Challenges & Solutions

### 1. Flip-Card Animation

**Challenge:** CSS transforms don't work in React Native.

**Solution:**
- **Web:** CSS `@keyframes rotateX`
- **iOS/Android:** React Native Animated API with interpolation
- Create platform-specific files: `FlipCard.web.tsx` and `FlipCard.tsx`

---

### 2. Scan Lines Performance

**Challenge:** Full-height repeating patterns can impact frame rate.

**Solution:**
- **Web:** CSS gradient (GPU-accelerated)
- **iOS/Android:** SVG lines with device detection
- **Low-end devices:** Disable via memory check (<2GB RAM)

---

### 3. Monospace Font Availability

**Challenge:** SF Mono not on all platforms.

**Solution:**
- Font stack with fallbacks:
  ```
  'SF Mono', 'Monaco', 'Consolas', 'Courier New', 'monospace'
  ```
- Test on multiple devices
- Ensure all fallbacks are readable

---

### 4. Stacked Bar Charts

**Challenge:** Layering multiple disciplines on same day.

**Solution:**
```tsx
<View className="relative h-6">
  <View className="absolute" style={{ width: '40%', backgroundColor: '#00D4FF' }} />
  <View className="absolute" style={{ left: '40%', width: '30%', backgroundColor: '#FF6B35' }} />
</View>
```

---

## Critical Files Checklist

### Create New:
- [ ] `src/components/ui/TerminalCard.tsx`
- [ ] `src/components/ui/TerminalButton.tsx`
- [ ] `src/components/ui/ScanLineOverlay.tsx`
- [ ] `src/components/ui/SevenSegmentDisplay.tsx`
- [ ] `src/components/ui/FlipCard.tsx`
- [ ] `src/components/ui/TerminalInput.tsx`
- [ ] `src/components/charts/TerminalBarChart.tsx`
- [ ] `src/utils/featureFlags.ts`

### Modify Existing:
- [ ] `tailwind.config.js` - Color system
- [ ] `src/app/_layout.tsx` - Global background
- [ ] All dashboard widgets (7 files)
- [ ] All screen files in `src/app/(tabs)/`
- [ ] `AddResultModal.tsx`, `RaceAnalysisModal.tsx`
- [ ] Navigation layout `src/app/(tabs)/_layout.tsx`

---

## Time Estimates Summary

| Phase | Hours | Description |
|-------|-------|-------------|
| 1 | 8-12 | Foundation & design system |
| 2 | 12-16 | Core dashboard widgets |
| 3 | 10-14 | Screens & navigation |
| 4 | 8-10 | Modals & forms |
| 5 | 8-10 | Testing & optimization |
| 6 | 4-6 | Migration & rollout |
| **Total** | **66-90** | **Complete implementation** |

**Timeline Options:**
- **Part-time (20 hrs/week):** 3-5 weeks
- **Full-time (40 hrs/week):** 2-2.5 weeks

---

## Success Criteria

✅ **Visual:**
- No glassmorphism/blur visible
- All borders hard-edged (0 radius)
- Monospace font throughout
- Terminal color palette consistent
- Scan lines subtle but present

✅ **Functional:**
- All data displays correctly
- Animations smooth (60fps)
- Forms submit successfully
- Navigation works on all platforms

✅ **Performance:**
- No crash rate increase
- Frame rate maintained
- Bundle size increase <10%
- User retention stable

---

## Next Steps

1. **Review this plan** with development team
2. **Set up feature flag system** in preparation
3. **Create backup branch** before starting
4. **Begin Phase 1** - Foundation (8-12 hours)
5. **Test after each widget** migration
6. **Monitor metrics** throughout rollout

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Status:** Ready to Implement
**Approved Mockup:** `/Users/danhoeller/Website Development/kineticbrandpartners/RacePrep/mockups/concept-1-split-flap.html`