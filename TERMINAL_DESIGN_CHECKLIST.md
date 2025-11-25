# Split-Flap Terminal Design - Implementation Checklist

**Quick progress tracker for implementing the new design system**

Use this checklist to track your progress through the implementation. Check off items as you complete them.

---

## 📋 Pre-Implementation (15 minutes)

- [x] Review mockup: `mockups/concept-1-split-flap.html`
- [x] Read quick start: `IMPLEMENTATION_QUICKSTART.md`
- [x] Create feature branch: `git checkout -b feature/split-flap-terminal-design`
- [x] Tag current state: `git tag pre-terminal-design`
- [x] Push tag: `git push origin pre-terminal-design`

---

## 🎨 Phase 1: Foundation (8-12 hours) ✅ **COMPLETE**

**Completed:** November 25, 2025
**Branch:** `feature/split-flap-terminal-design` (pushed to remote)
**Commits:** 5 commits

### 1.1 Color System (2h) ✅
- [x] Update `tailwind.config.js` with terminal colors
- [x] Add monospace font stack
- [x] Keep old colors for gradual migration
- [x] Test app loads without errors
- [x] Commit: "feat: Add terminal color palette to Tailwind config"

### 1.2 Base Components (4-6h) ✅
- [x] Create `src/components/ui/terminal/TerminalCard.tsx`
- [x] Create `src/components/ui/terminal/TerminalButton.tsx`
- [x] Create `src/components/ui/terminal/ScanLineOverlay.tsx`
- [x] Create index file: `src/components/ui/terminal/index.ts`
- [x] Test on Web (build successful: 7.13 MB bundle)
- [x] Commit: "feat: Add base terminal UI components"

### 1.3 Feature Flags (1h) ✅
- [x] Create `src/utils/featureFlags.ts`
- [x] Set all flags to `false` initially
- [x] Export `useTerminalDesign` hook
- [x] Commit: "feat: Add feature flag system for terminal design"

### 1.4 Global Styles (2h) ✅
- [x] Update `app/_layout.tsx` background to `#0A0E14`
- [x] Add `<ScanLineOverlay />` component
- [x] Test TypeScript (no errors)
- [x] Commit: "feat: Add terminal background and scan line overlay"
- [x] Commit: "fix: Remove JSX syntax from JSDoc comment"

**Phase 1 Complete!** ✅ Foundation is solid and ready for widget migration.

**Resume Point:** To continue from here:
1. `git checkout feature/split-flap-terminal-design`
2. Start Phase 2: Dashboard Widgets (see below)

---

## 📊 Phase 2: Dashboard Widgets (12-16 hours)

### Widget 1: PersonalBestsWidget (2h)
- [ ] Create `PersonalBestsWidget.terminal.tsx`
- [ ] Update main `PersonalBestsWidget.tsx` with feature flag
- [ ] Enable flag: `personalBests: true`
- [ ] Test: Data displays correctly in terminal style
- [ ] Test: Toggle flag works (legacy still functions)
- [ ] Commit: "feat(dashboard): Migrate PersonalBestsWidget to terminal"

### Widget 2: GoalsProgressWidget (2h)
- [ ] Create `GoalsProgressWidget.terminal.tsx`
- [ ] Update main `GoalsProgressWidget.tsx` with feature flag
- [ ] Enable flag: `goalsProgress: true`
- [ ] Test terminal style rendering
- [ ] Commit: "feat(dashboard): Migrate GoalsProgressWidget to terminal"

### Widget 3: TrainingPlanProgressWidget (2.5h)
- [ ] Create `TrainingPlanProgressWidget.terminal.tsx`
- [ ] Update main with feature flag
- [ ] Enable flag: `trainingPlan: true`
- [ ] Test rendering
- [ ] Commit: "feat(dashboard): Migrate TrainingPlanProgressWidget"

### Widget 4: WeatherWidget (2h)
- [ ] Create `WeatherWidget.terminal.tsx`
- [ ] Update main with feature flag
- [ ] Enable flag: `weather: true`
- [ ] Test weather data displays
- [ ] Commit: "feat(dashboard): Migrate WeatherWidget to terminal"

### Widget 5: TransitionAnalyticsWidget (3h)
**Special: Needs 7-segment display component**
- [ ] Create `src/components/ui/terminal/SevenSegmentDisplay.tsx`
- [ ] Test 7-segment rendering with glow effect
- [ ] Create `TransitionAnalyticsWidget.terminal.tsx`
- [ ] Update main with feature flag
- [ ] Enable flag: `transitions: true`
- [ ] Test T1/T2 displays correctly
- [ ] Commit: "feat(dashboard): Add 7-segment display and migrate TransitionAnalytics"

### Widget 6: UpcomingRacesWidget (3h)
**Special: Needs flip-card component**
- [ ] Create `src/components/ui/terminal/FlipCard.tsx`
- [ ] Test flip animation (web vs native)
- [ ] Create `UpcomingRacesWidget.terminal.tsx`
- [ ] Add race distance stats (1.2mi, 56mi, 13.1mi)
- [ ] Update main with feature flag
- [ ] Enable flag: `upcomingRaces: true`
- [ ] Test countdown updates
- [ ] Commit: "feat(dashboard): Add flip cards and migrate UpcomingRaces"

### Widget 7: PerformanceOverviewWidget (4h)
**Special: Needs terminal bar chart component**
- [ ] Create `src/components/charts/TerminalBarChart.tsx`
- [ ] Test bar rendering with edge glow
- [ ] Add stacked bar support for multi-discipline days
- [ ] Create `PerformanceOverviewWidget.terminal.tsx`
- [ ] Update main with feature flag
- [ ] Enable flag: `performance: true`
- [ ] Test training volume displays
- [ ] Commit: "feat(dashboard): Add terminal charts and migrate PerformanceOverview"

**Phase 2 Complete? All 7 widgets should now be in terminal style.**

---

## 🖥️ Phase 3: Screens (10-14 hours)

### 3.1 Dashboard Screen (2h)
- [ ] Update `src/components/WebDashboard.tsx`
- [ ] Remove blur orbs
- [ ] Update header styling (terminal borders)
- [ ] Adjust grid spacing
- [ ] Test widget grid layout
- [ ] Commit: "feat(screens): Update Dashboard screen to terminal style"

### 3.2 Races Screen (3h)
- [ ] Update `src/app/(tabs)/races.tsx`
- [ ] Redesign race cards (hard edges, mono font)
- [ ] Update race list styling
- [ ] Update status badges
- [ ] Update search/filter UI
- [ ] Test race data displays correctly
- [ ] Commit: "feat(screens): Update Races screen to terminal style"

### 3.3 Training Screen (3h)
- [ ] Update `src/app/(tabs)/training.tsx`
- [ ] Update training calendar styling
- [ ] Redesign workout cards
- [ ] Update Strava connection UI
- [ ] Test training data displays
- [ ] Commit: "feat(screens): Update Training screen to terminal style"

### 3.4 Planning Screen (2h)
- [ ] Update `src/app/(tabs)/planning.tsx`
- [ ] Update planning sections
- [ ] Redesign checklists
- [ ] Update nutrition plan UI
- [ ] Commit: "feat(screens): Update Planning screen to terminal style"

### 3.5 Profile Screen (2h)
- [ ] Update `src/app/(tabs)/profile.tsx`
- [ ] Update user stats display
- [ ] Redesign settings UI
- [ ] Update achievements display
- [ ] Commit: "feat(screens): Update Profile screen to terminal style"

### 3.6 Navigation Bar (2h)
- [ ] Update `src/app/(tabs)/_layout.tsx`
- [ ] Redesign tab bar (terminal style)
- [ ] Update active state indicator
- [ ] Test navigation between tabs
- [ ] Commit: "feat(nav): Update navigation bar to terminal style"

**Phase 3 Complete? All screens should be consistent.**

---

## 🔧 Phase 4: Modals & Forms (8-10 hours)

### 4.1 Modal System (3h)
- [ ] Create `src/components/ui/terminal/TerminalModal.tsx`
- [ ] Update `AddResultModal.tsx` to use terminal modal
- [ ] Update `RaceAnalysisModal.tsx`
- [ ] Update `AuthModal.tsx` (if exists)
- [ ] Test modal open/close
- [ ] Commit: "feat(modals): Migrate modals to terminal style"

### 4.2 Form Inputs (2h)
- [ ] Create `src/components/ui/terminal/TerminalInput.tsx`
- [ ] Add focus state (yellow border)
- [ ] Test typing and validation
- [ ] Commit: "feat(forms): Add terminal input component"

### 4.3 Select/Dropdown (2h)
- [ ] Create `src/components/ui/terminal/TerminalSelect.tsx`
- [ ] Test options display
- [ ] Commit: "feat(forms): Add terminal select component"

### 4.4 Checkbox/Toggle (1h)
- [ ] Create `src/components/ui/terminal/TerminalCheckbox.tsx`
- [ ] Test checked/unchecked states
- [ ] Commit: "feat(forms): Add terminal checkbox component"

### 4.5 Update All Forms (2h)
- [ ] Find all form usages
- [ ] Replace with terminal components
- [ ] Test form submissions
- [ ] Commit: "feat(forms): Update all forms to terminal style"

**Phase 4 Complete? All interactions should work.**

---

## ✨ Phase 5: Polish & Animation (6-8 hours)

### 5.1 Flip-Card Animation (2h)
- [ ] Refine web animation (CSS keyframes)
- [ ] Refine iOS/Android animation (Reanimated)
- [ ] Test smooth 60fps animation
- [ ] Commit: "feat(animation): Refine flip-card countdown"

### 5.2 Scan Line Optimization (1h)
- [ ] Test on low-end Android devices
- [ ] Add device detection for disable
- [ ] Optimize line count if needed
- [ ] Commit: "perf(ui): Optimize scan line overlay"

### 5.3 Bar Chart Animations (2h)
- [ ] Add reveal animation (bars grow on load)
- [ ] Test timing and easing
- [ ] Ensure 60fps
- [ ] Commit: "feat(charts): Add bar reveal animations"

### 5.4 Loading States (1h)
- [ ] Create terminal-style loading indicators
- [ ] Add to all async operations
- [ ] Test loading appearance
- [ ] Commit: "feat(ui): Add terminal loading states"

**Phase 5 Complete? Everything should be smooth and polished.**

---

## 🧪 Phase 6: Testing (8-10 hours)

### 6.1 iOS Testing (3h)
- [ ] Test on iPhone 13/14/15
- [ ] Test on iPad
- [ ] Verify SF Mono font displays
- [ ] Check 7-segment glow effects
- [ ] Verify flip card animations
- [ ] Test safe area handling
- [ ] Measure frame rate (target: 60fps)
- [ ] Check touch target sizes (44x44pt min)

### 6.2 Android Testing (3h)
- [ ] Test on Pixel device
- [ ] Test on Samsung device
- [ ] Test on low-end device (<2GB RAM)
- [ ] Verify monospace font fallback
- [ ] Check border rendering
- [ ] Test animations (no jank)
- [ ] Measure performance
- [ ] Document any platform-specific issues

### 6.3 Web Testing (2h)
- [ ] Test Chrome/Edge
- [ ] Test Safari
- [ ] Test Firefox
- [ ] Test responsive breakpoints (375px, 768px, 1024px)
- [ ] Verify hover states
- [ ] Test keyboard navigation
- [ ] Run WCAG contrast checker
- [ ] Test scan line rendering

### 6.4 Performance Testing (2h)
- [ ] Measure dashboard load time
- [ ] Measure widget render times
- [ ] Check frame rate across platforms
- [ ] Measure memory usage
- [ ] Check bundle size increase
- [ ] Document all metrics

**Phase 6 Complete? Document any issues found.**

---

## 🚀 Phase 7: Deployment (4-6 hours)

### 7.1 Pre-Deployment (1h)
- [ ] All tests passing
- [ ] Feature flags configured correctly
- [ ] Rollback plan documented
- [ ] Team briefed on changes

### 7.2 Week 1: Internal Testing (40h runtime)
- [ ] Enable for dev team only
- [ ] Collect internal feedback
- [ ] Fix critical bugs
- [ ] Monitor error rates

### 7.3 Week 2: 10% Rollout (7d runtime)
- [ ] Enable for 10% of users
- [ ] Monitor crash rate
- [ ] Monitor frame rate
- [ ] Collect user feedback
- [ ] Address issues found

### 7.4 Week 3: 50% Rollout (7d runtime)
- [ ] Enable for 50% of users
- [ ] Continue monitoring
- [ ] Validate metrics
- [ ] Address feedback

### 7.5 Week 4: 100% Rollout (7d runtime)
- [ ] Enable for all users
- [ ] Monitor closely for 2 weeks
- [ ] Collect feedback
- [ ] Document lessons learned

### 7.6 Week 5: Cleanup (4h)
- [ ] Remove legacy components
- [ ] Remove feature flags
- [ ] Update documentation
- [ ] Update screenshots
- [ ] Commit: "chore: Remove legacy design code"

**Phase 7 Complete? Terminal design is live!**

---

## 📊 Success Metrics

### Technical Metrics
- [ ] Crash rate: <1.5% (same as before)
- [ ] Frame rate: >55fps average
- [ ] Dashboard load: <1000ms
- [ ] Widget render: <60ms each
- [ ] Bundle size: <10% increase
- [ ] Memory: No increase >10%

### Visual Quality
- [ ] No glassmorphism visible
- [ ] All borders hard-edged
- [ ] Monospace font everywhere
- [ ] Terminal colors consistent
- [ ] Scan lines subtle

### User Experience
- [ ] All data displays correctly
- [ ] Forms submit successfully
- [ ] Navigation works smoothly
- [ ] Animations at 60fps
- [ ] Touch targets adequate

---

## 🚨 Emergency Rollback

If issues arise:

### Quick Disable
```typescript
// src/utils/featureFlags.ts
export const featureFlags = {
  useTerminalDesign: false,  // Disable everything
};
```

### Full Revert
```bash
git checkout main
git reset --hard pre-terminal-design
git push -f origin feature/split-flap-terminal-design
```

---

## 📝 Notes & Issues

Use this space to track issues, decisions, or questions:

```
Issue: [Date] - Description
Resolution: ...

Decision: [Date] - Description
Rationale: ...

Question: [Date] - Description
Answer: ...
```

---

## ✅ Final Verification

Before marking complete:
- [ ] All phases checked off
- [ ] All tests passing
- [ ] All platforms working
- [ ] Performance metrics met
- [ ] User feedback positive
- [ ] Documentation updated
- [ ] Team trained on new system
- [ ] Legacy code removed

---

**Implementation Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Started:** ___________
**Completed:** ___________
**Total Time:** _________ hours

---

## 🎉 Completion

When everything is checked:
- [ ] Update CHANGELOG.md
- [ ] Update README.md screenshots
- [ ] Create release notes
- [ ] Celebrate! 🎊

**Terminal Design System Implementation: COMPLETE!** 🚀