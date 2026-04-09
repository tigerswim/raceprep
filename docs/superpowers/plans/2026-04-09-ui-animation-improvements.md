# UI Animation Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Emil Kowalski design engineering principles to RacePrep's UI — adding press feedback to all buttons, modal enter animations, replacing `transition-all` with specific properties, transitioning input focus states, improving timeline bar easing, faster spinners, and guarding hover states behind pointer media queries.

**Architecture:** All changes are purely CSS/Tailwind class edits — no new libraries, no new components, no state changes. The terminal design aesthetic (crisp, fast, no bounce) is preserved throughout. Custom easing is added to `tailwind.config.js` as a plugin extension so it's reusable.

**Tech Stack:** Tailwind CSS 3, NativeWind 4, React (web targets for modal/button components)

---

## Files Modified

- `tailwind.config.js` — add custom `ease-terminal` cubic-bezier utility and `animation` keyframe for modal enter
- `src/components/ConfirmDialog.tsx` — modal enter animation + active:scale on buttons
- `src/components/AuthModal.tsx` — modal enter animation + active:scale + input focus transition + hover guard
- `src/components/UserRaceFormModal.tsx` — modal enter animation + active:scale + input focus transition + fix transition-all
- `src/components/AddResultModal.tsx` — modal enter animation + active:scale + input focus transition + fix transition-all
- `src/components/EditResultModal.tsx` — modal enter animation + active:scale + input focus transition
- `src/components/AddCourseModal.tsx` — modal enter animation + active:scale + input focus transition
- `src/components/EditCourseModal.tsx` — modal enter animation + active:scale + input focus transition
- `src/components/RaceAnalysisModal.tsx` — modal enter animation + fix timeline bar transitions
- `src/components/RaceComparisonModal.tsx` — modal enter animation + active:scale
- `src/components/RacePredictionModal.tsx` — modal enter animation + active:scale + fix transition-all
- `src/components/CourseDetailsModal.tsx` — modal enter animation + active:scale
- `src/components/ImportedRaceUpdateModal.tsx` — modal enter animation + active:scale + fix transition-all
- `src/components/UserRaceManagement.tsx` — active:scale on action buttons + hover guard + faster spinners
- `src/components/WebDashboard.tsx` — hover guard + active:scale
- `src/components/LandingPage.tsx` — active:scale already present, fix transition-all, hover guard
- `src/components/training/WorkoutDetailModal.tsx` — modal enter animation + active:scale
- `src/app/strava-callback.tsx` — faster spinners + hover guard

---

## Task 1: Add custom easing and modal-enter keyframe to tailwind.config.js

**Files:**
- Modify: `tailwind.config.js`

- [ ] **Step 1: Read the current tailwind.config.js**

Confirm current structure before editing.

- [ ] **Step 2: Add custom easing and keyframe**

In `tailwind.config.js`, update the `theme.extend` block:

```js
theme: {
  extend: {
    // ... existing colors, fontFamily, backdropBlur ...
    transitionTimingFunction: {
      'terminal': 'cubic-bezier(0.23, 1, 0.32, 1)',
    },
    keyframes: {
      'modal-enter': {
        '0%': { opacity: '0', transform: 'scale(0.97)' },
        '100%': { opacity: '1', transform: 'scale(1)' },
      },
      'overlay-enter': {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
    },
    animation: {
      'modal-enter': 'modal-enter 150ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
      'overlay-enter': 'overlay-enter 150ms ease-out forwards',
    },
  },
},
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.js
git commit -m "chore: add terminal easing and modal-enter keyframe to tailwind config"
```

---

## Task 2: Apply modal enter animation + press feedback to ConfirmDialog

**Files:**
- Modify: `src/components/ConfirmDialog.tsx`

- [ ] **Step 1: Add modal enter animation to the overlay and panel**

In `ConfirmDialog.tsx`, change line 54 (the overlay div) and line 55–58 (the panel div):

```tsx
// Overlay: was "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-overlay-enter">
  // Panel: add animate-modal-enter
  <div
    className={`bg-terminal-panel border-2 ${colors.border} p-6 w-full max-w-md animate-modal-enter`}
    style={{ borderRadius: 0 }}
  >
```

- [ ] **Step 2: Add active:scale to Cancel and Confirm buttons**

Cancel button (line 73–79): add `active:scale-[0.97] transition-transform duration-100` before `transition-colors`:

```tsx
<button
  onClick={onCancel}
  className="flex-1 bg-terminal-panel text-text-secondary border-2 border-terminal-border py-3 font-medium hover:border-text-secondary hover:text-text-primary transition-colors transition-transform duration-100 active:scale-[0.97] font-mono tracking-wider"
  style={{ borderRadius: 0 }}
>
```

Confirm button (line 80–86): add `active:scale-[0.97] transition-transform duration-100`:

```tsx
<button
  onClick={onConfirm}
  className={`flex-1 ${colors.button} py-3 font-medium transition-colors transition-transform duration-100 active:scale-[0.97] font-mono tracking-wider`}
  style={{ borderRadius: 0 }}
>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ConfirmDialog.tsx
git commit -m "feat: modal enter animation and press feedback on ConfirmDialog"
```

---

## Task 3: Apply changes to AuthModal

**Files:**
- Modify: `src/components/AuthModal.tsx`

- [ ] **Step 1: Add modal enter animation to overlay and panel**

Line 63 (overlay) and line 64 (panel):

```tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-overlay-enter">
  <div className="bg-terminal-panel border-2 border-terminal-border max-w-md w-full animate-modal-enter" style={{ borderRadius: 0 }}>
```

- [ ] **Step 2: Add active:scale to all interactive buttons**

Close button (line 70–74):

```tsx
<button
  onClick={onClose}
  className="text-text-secondary hover:text-text-primary text-2xl font-mono transition-colors duration-100 active:scale-[0.97]"
>
```

Sign In tab button (line 80–89) — replace `transition-all` with specific properties and add active:scale:

```tsx
<button
  onClick={() => setMode('signin')}
  className={`flex-1 py-2 px-4 text-xs font-medium transition-colors duration-150 active:scale-[0.97] font-mono tracking-wider ${
    mode === 'signin'
      ? 'bg-accent-yellow text-terminal-bg'
      : 'bg-terminal-panel text-text-secondary border-2 border-terminal-border hover:border-text-secondary hover:text-text-primary'
  }`}
  style={{ borderRadius: 0 }}
>
```

Sign Up tab button (line 91–100) — same treatment:

```tsx
<button
  onClick={() => setMode('signup')}
  className={`flex-1 py-2 px-4 text-xs font-medium transition-colors duration-150 active:scale-[0.97] font-mono tracking-wider ${
    mode === 'signup'
      ? 'bg-accent-yellow text-terminal-bg'
      : 'bg-terminal-panel text-text-secondary border-2 border-terminal-border hover:border-text-secondary hover:text-text-primary'
  }`}
  style={{ borderRadius: 0 }}
>
```

Submit button (line 163–170) — replace `transition-all` with `transition-colors duration-150` and add active:scale:

```tsx
<button
  type="submit"
  disabled={loading}
  className="flex-1 bg-accent-yellow text-terminal-bg px-6 py-3 font-medium hover:bg-accent-yellow/90 transition-colors duration-150 active:scale-[0.97] font-mono tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
  style={{ borderRadius: 0 }}
>
```

- [ ] **Step 3: Add transition-colors to all input focus states**

All three inputs have `focus:outline-none focus:border-accent-yellow`. Add `transition-colors duration-150` to each:

```tsx
// Name input (line 123)
className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow transition-colors duration-150 font-mono"

// Email input (line 136)
className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow transition-colors duration-150 font-mono"

// Password input (line 150)
className="w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow transition-colors duration-150 font-mono"
```

- [ ] **Step 4: Commit**

```bash
git add src/components/AuthModal.tsx
git commit -m "feat: modal enter animation, press feedback, and input focus transition on AuthModal"
```

---

## Task 4: Apply changes to UserRaceFormModal

**Files:**
- Modify: `src/components/UserRaceFormModal.tsx`

- [ ] **Step 1: Read the top of UserRaceFormModal to find the outer wrapper divs**

```bash
# Read lines 270–310 to find the overlay and panel structure
```

- [ ] **Step 2: Add modal enter animation to overlay and panel**

Find the `fixed inset-0 bg-black/50` overlay div and the inner panel div. Add:
- Overlay: `animate-overlay-enter`
- Panel: `animate-modal-enter`

- [ ] **Step 3: Fix transition-all on Cancel button (line 536) and Submit button (line 545)**

Cancel button — replace `transition-colors` (already specific, just add active:scale):

```tsx
className="bg-terminal-panel text-text-secondary border-2 border-terminal-border px-6 py-3 font-medium hover:border-text-secondary hover:text-text-primary transition-colors duration-150 active:scale-[0.97] disabled:opacity-50 font-mono tracking-wider"
```

Submit button — replace `transition-all` with `transition-colors duration-150` and add active:scale:

```tsx
className="bg-accent-yellow text-terminal-bg px-6 py-3 font-medium hover:bg-accent-yellow/90 transition-colors duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-mono tracking-wider"
```

- [ ] **Step 4: Add transition-colors to all input/select focus states**

Search for `focus:border-accent-yellow` in the file and add `transition-colors duration-150` to each input, select, and textarea that doesn't already have it.

- [ ] **Step 5: Commit**

```bash
git add src/components/UserRaceFormModal.tsx
git commit -m "feat: modal enter animation, press feedback, and input focus transitions on UserRaceFormModal"
```

---

## Task 5: Apply changes to AddResultModal and EditResultModal

**Files:**
- Modify: `src/components/AddResultModal.tsx`
- Modify: `src/components/EditResultModal.tsx`

- [ ] **Step 1: Read AddResultModal to locate overlay, panel, and buttons**

Read `src/components/AddResultModal.tsx` lines 660–690 for the action buttons, and the top of the return statement for the overlay.

- [ ] **Step 2: Apply to AddResultModal**

- Overlay div: add `animate-overlay-enter`
- Panel div: add `animate-modal-enter`
- Cancel button: add `transition-colors duration-150 active:scale-[0.97]`, remove any `transition-all`
- Submit button: replace `transition-all` with `transition-colors duration-150`, add `active:scale-[0.97]`
- All inputs with `focus:border-accent-yellow`: add `transition-colors duration-150`

- [ ] **Step 3: Read EditResultModal and apply same pattern**

Read `src/components/EditResultModal.tsx` lines 200–230 for overlay, and lines 520–545 for buttons.

Apply same changes:
- Overlay: `animate-overlay-enter`
- Panel: `animate-modal-enter`
- Buttons: `transition-colors duration-150 active:scale-[0.97]`
- Inputs: `transition-colors duration-150`

- [ ] **Step 4: Commit**

```bash
git add src/components/AddResultModal.tsx src/components/EditResultModal.tsx
git commit -m "feat: modal enter animation, press feedback, and input focus transitions on result modals"
```

---

## Task 6: Apply changes to AddCourseModal and EditCourseModal

**Files:**
- Modify: `src/components/AddCourseModal.tsx`
- Modify: `src/components/EditCourseModal.tsx`

- [ ] **Step 1: Read AddCourseModal overlay, panel, and button areas**

Read `src/components/AddCourseModal.tsx` lines 72–90 for overlay and panel, and lines 350–370 for action buttons.

- [ ] **Step 2: Apply to AddCourseModal**

- Overlay: add `animate-overlay-enter`
- Panel: add `animate-modal-enter`
- Cancel button: `transition-colors duration-150 active:scale-[0.97]`
- Submit button: replace `transition-all` with `transition-colors duration-150`, add `active:scale-[0.97]`
- Inputs: add `transition-colors duration-150` alongside `focus:border-accent-yellow`

- [ ] **Step 3: Read EditCourseModal and apply same pattern**

Read `src/components/EditCourseModal.tsx` to find overlay, panel, and buttons. Apply same changes.

- [ ] **Step 4: Commit**

```bash
git add src/components/AddCourseModal.tsx src/components/EditCourseModal.tsx
git commit -m "feat: modal enter animation, press feedback, and input focus transitions on course modals"
```

---

## Task 7: Apply changes to RaceAnalysisModal — enter animation + timeline bars

**Files:**
- Modify: `src/components/RaceAnalysisModal.tsx`

- [ ] **Step 1: Read the overlay and panel structure**

Read `src/components/RaceAnalysisModal.tsx` lines 214–240.

- [ ] **Step 2: Add modal enter animation**

- Overlay div: add `animate-overlay-enter`
- Panel div: add `animate-modal-enter`

- [ ] **Step 3: Fix timeline bar transitions (lines 267–300)**

The timeline bars currently use `transition-all duration-1000` which animates `width` (triggers layout). Change each timeline segment div to use explicit `transition-[width]` with strong ease-out:

```tsx
// Before (on each segment div):
className="... transition-all duration-1000 hover:brightness-110"

// After:
className="... transition-[width] duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:brightness-110"
```

Apply this to all 5 segment divs (swim, t1, bike, t2, run).

- [ ] **Step 4: Fix any remaining transition-all occurrences in the file**

Search for `transition-all` in `RaceAnalysisModal.tsx`. Replace each with the appropriate specific property (`transition-colors`, `transition-[width]`, etc.) with `duration-150`.

- [ ] **Step 5: Add active:scale to modal action buttons**

Find the Close/Cancel/action buttons near the bottom of the modal. Add `transition-colors duration-150 active:scale-[0.97]` to each.

- [ ] **Step 6: Commit**

```bash
git add src/components/RaceAnalysisModal.tsx
git commit -m "feat: modal enter animation, timeline bar easing fix, and press feedback on RaceAnalysisModal"
```

---

## Task 8: Apply changes to remaining modals

**Files:**
- Modify: `src/components/RaceComparisonModal.tsx`
- Modify: `src/components/RacePredictionModal.tsx`
- Modify: `src/components/CourseDetailsModal.tsx`
- Modify: `src/components/ImportedRaceUpdateModal.tsx`
- Modify: `src/components/training/WorkoutDetailModal.tsx`

- [ ] **Step 1: RaceComparisonModal**

Read `src/components/RaceComparisonModal.tsx` to find overlay and panel structure.
- Overlay: add `animate-overlay-enter`
- Panel: add `animate-modal-enter`
- Action buttons: add `transition-colors duration-150 active:scale-[0.97]`

- [ ] **Step 2: RacePredictionModal**

Read `src/components/RacePredictionModal.tsx` to find overlay, panel, and buttons.
- Overlay: add `animate-overlay-enter`
- Panel: add `animate-modal-enter`
- Replace any `transition-all` with `transition-colors duration-150`
- Action buttons: add `active:scale-[0.97]`

- [ ] **Step 3: CourseDetailsModal**

Read `src/components/CourseDetailsModal.tsx` to find overlay and panel.
- Overlay: add `animate-overlay-enter`
- Panel: add `animate-modal-enter`
- Action buttons: add `transition-colors duration-150 active:scale-[0.97]`

- [ ] **Step 4: ImportedRaceUpdateModal**

Read `src/components/ImportedRaceUpdateModal.tsx` lines 417–445 for overlay/panel and lines 620–645 for action buttons.
- Overlay: add `animate-overlay-enter`
- Panel: add `animate-modal-enter`
- Replace any `transition-all` with `transition-colors duration-150`
- Action buttons: add `active:scale-[0.97]`
- Toggle switch already uses `transition-colors duration-200` and `transition-transform duration-200` — these are correct, leave them.

- [ ] **Step 5: WorkoutDetailModal**

Read `src/components/training/WorkoutDetailModal.tsx` to find overlay and panel.
- Overlay: add `animate-overlay-enter`
- Panel: add `animate-modal-enter`
- Action buttons: add `transition-colors duration-150 active:scale-[0.97]`

- [ ] **Step 6: Commit**

```bash
git add src/components/RaceComparisonModal.tsx src/components/RacePredictionModal.tsx src/components/CourseDetailsModal.tsx src/components/ImportedRaceUpdateModal.tsx src/components/training/WorkoutDetailModal.tsx
git commit -m "feat: modal enter animation and press feedback on remaining modals"
```

---

## Task 9: Apply changes to UserRaceManagement, WebDashboard, LandingPage

**Files:**
- Modify: `src/components/UserRaceManagement.tsx`
- Modify: `src/components/WebDashboard.tsx`
- Modify: `src/components/LandingPage.tsx`

- [ ] **Step 1: Read UserRaceManagement action button and spinner areas**

Read `src/components/UserRaceManagement.tsx` lines 560–640.

- [ ] **Step 2: UserRaceManagement — active:scale, faster spinners, hover guard**

For each action button (Add Race, Edit, Delete, etc.):
- Add `active:scale-[0.97] transition-transform duration-100`
- Replace any `transition-all` with `transition-colors duration-150`

For hover states on interactive rows/buttons — wrap in pointer media query by adding the `[@media(hover:hover)]:hover:` Tailwind variant prefix. Example:

```tsx
// Before
className="... hover:bg-white/10 ..."

// After
className="... [@media(hover:hover)]:hover:bg-white/10 ..."
```

For loading spinners (`animate-spin`) — add `duration-700` to make them faster:

```tsx
// Before
className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"

// After
className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin duration-700"
```

- [ ] **Step 3: WebDashboard — hover guard and active:scale**

Read `src/components/WebDashboard.tsx` lines 1–50.

For all `hover:opacity-90` classes, add the hover guard:

```tsx
// Before
className="... hover:opacity-90 ..."

// After
className="... [@media(hover:hover)]:hover:opacity-90 ..."
```

Add `active:scale-[0.97] transition-transform duration-100` to all clickable buttons/cards.

- [ ] **Step 4: LandingPage — fix transition-all, hover guard, verify active:scale**

Read `src/components/LandingPage.tsx` lines 78–90.

The CTA button already has `active:scale-[0.98]` — change to `active:scale-[0.97]` for consistency.

Replace `transition-all` with `transition-colors duration-150`.

Add hover guard to `hover:opacity-90`:

```tsx
// Before
className="px-8 py-4 font-bold text-sm tracking-wider transition-all hover:opacity-90 active:scale-[0.98]"

// After
className="px-8 py-4 font-bold text-sm tracking-wider transition-colors duration-150 [@media(hover:hover)]:hover:opacity-90 active:scale-[0.97]"
```

- [ ] **Step 5: Commit**

```bash
git add src/components/UserRaceManagement.tsx src/components/WebDashboard.tsx src/components/LandingPage.tsx
git commit -m "feat: press feedback, faster spinners, and hover guards on management and landing components"
```

---

## Task 10: Apply faster spinners to strava-callback and fix hover states

**Files:**
- Modify: `src/app/strava-callback.tsx`

- [ ] **Step 1: Read the spinner and hover areas**

Read `src/app/strava-callback.tsx` lines 345–425.

- [ ] **Step 2: Faster spinners**

Find all `animate-spin` instances. Add `duration-700`:

```tsx
// Before
className="w-16 h-16 mx-auto border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"

// After
className="w-16 h-16 mx-auto border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin duration-700"
```

- [ ] **Step 3: Hover guard on card hover states**

Find all `hover:shadow-lg transition-all duration-300` patterns. Apply:
- Replace `transition-all` with `transition-shadow duration-150`
- Add `[@media(hover:hover)]:` prefix to `hover:shadow-lg`

```tsx
// Before
className="... hover:shadow-lg transition-all duration-300 ..."

// After
className="... [@media(hover:hover)]:hover:shadow-lg transition-shadow duration-150 ..."
```

- [ ] **Step 4: Commit**

```bash
git add src/app/strava-callback.tsx
git commit -m "feat: faster spinners and hover guards on strava-callback"
```

---

## Task 11: Verify all changes visually and run linter

- [ ] **Step 1: Run ESLint**

```bash
npm run lint
```

Expected: 0 errors (warnings acceptable). Fix any errors introduced.

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Start the dev server and verify in browser**

```bash
npm run web
```

Open http://localhost:8081. Verify:
- LandingPage CTA button has press feedback (click and hold)
- Click "Get Started" — AuthModal fades and scales in from 97%
- Input fields have smooth border transition on focus
- Submit button shows press feedback
- Dismiss modal — instant (no exit animation needed per design)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify animation improvements complete"
```
