# Phase 4: Modals & Forms - Terminal Design Migration

**Status**: Ready to Start  
**Estimated Time**: 8-10 hours  
**Phase 3 Completion**: December 1, 2025

---

## Overview

Phase 4 focuses on migrating all modal dialogs and form components to the terminal design system. This includes authentication modals, data entry forms, calculators, and all interactive overlays.

---

## Phase 4 Objectives

1. **Modal Containers**: Update all modal backgrounds and containers with terminal styling
2. **Form Inputs**: Convert text inputs, selects, textareas to terminal aesthetic
3. **Buttons**: Standardize all button styles (primary, secondary, danger)
4. **Validation States**: Apply terminal styling to error/success messages
5. **Calculators**: Update planning tools with terminal design
6. **Consistency**: Ensure all modals follow the same terminal patterns

---

## Components to Migrate

### 1. Authentication Modal
**File**: `src/components/AuthModal.tsx`  
**Priority**: High (user's first interaction)  
**Features**:
- Sign in/sign up forms
- Email/password inputs
- Social auth buttons (if any)
- Error messages and validation

**Terminal Updates**:
- Modal background: `bg-terminal-panel` with `border-2 border-terminal-border`
- Hard edges: `borderRadius: 0`
- Heading: Monospace, uppercase, `text-text-primary`
- Input fields: Terminal styling with monospace fonts
- Buttons: `bg-accent-yellow text-terminal-bg` for primary actions
- Labels: `font-mono text-text-secondary`

---

### 2. Race Modals
**Files**:
- Add/Edit Race forms (in `app/(tabs)/races.tsx`)
- Race details modal
- Import race modal (`src/components/ImportedRaceUpdateModal.tsx`)

**Priority**: High (core functionality)  
**Features**:
- Race creation forms
- Race editing
- Distance selection
- Date/time pickers
- Race search results

**Terminal Updates**:
- All form containers with terminal panels
- Input fields with hard edges
- Dropdowns with terminal styling
- Date pickers with monospace fonts
- Save/Cancel buttons with terminal aesthetic

---

### 3. Goal Modals
**Location**: Profile screen goals section  
**Priority**: Medium  
**Features**:
- Add new goal form
- Edit existing goal
- Goal type selection
- Target value inputs
- Deadline selection

**Terminal Updates**:
- Modal container: terminal panel with borders
- Form labels: uppercase monospace
- Input fields: terminal styling
- Button actions: accent-yellow primary buttons

---

### 4. Training Modals
**Location**: Training screen  
**Priority**: Medium  
**Features**:
- Workout details modal
- Training plan selection
- Edit workout modal
- Activity details from Strava

**Terminal Updates**:
- Details display: terminal panels with monospace data
- Edit forms: terminal input styling
- Action buttons: consistent terminal buttons
- Stats display: uppercase labels with monospace values

---

### 5. Planning Calculators
**Location**: Planning screen  
**Priority**: Medium  
**Features**:
- Nutrition calculator
- Pacing calculator
- Transition time estimator
- Goal pace calculator

**Terminal Updates**:
- Calculator containers: terminal panels
- Input fields: monospace with terminal borders
- Results display: uppercase labels with accent colors
- Calculate buttons: accent-yellow primary style
- Reset buttons: secondary terminal style

---

### 6. Confirmation Dialogs
**Location**: Various (delete confirmations, etc.)  
**Priority**: Low (less frequent use)  
**Features**:
- Delete race confirmation
- Delete goal confirmation
- Sign out confirmation
- Data export confirmations

**Terminal Updates**:
- Warning panels: `border-accent-yellow` or red for destructive actions
- Message text: monospace with appropriate color
- Action buttons: danger (red) vs cancel (secondary)
- Icons: match terminal color scheme

---

## Form Element Patterns

### Text Input (Terminal Style)
```tsx
<input
  className={useTerminal ?
    "w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-yellow font-mono" :
    "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
  }
  style={useTerminal ? { borderRadius: 0 } : undefined}
/>
```

### Select Dropdown (Terminal Style)
```tsx
<select
  className={useTerminal ?
    "w-full bg-terminal-panel border-2 border-terminal-border px-4 py-3 text-text-primary focus:outline-none focus:border-accent-yellow font-mono" :
    "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
  }
  style={useTerminal ? { borderRadius: 0 } : undefined}
>
  <option value="">{useTerminal ? "SELECT OPTION" : "Select option"}</option>
</select>
```

### Label (Terminal Style)
```tsx
<label className={useTerminal ?
  "block text-text-secondary text-xs font-medium mb-2 font-mono tracking-wider uppercase" :
  "block text-white/80 text-sm font-medium mb-2"
}>
  {useTerminal ? "FIELD NAME" : "Field Name"}
</label>
```

### Primary Button (Terminal Style)
```tsx
<button
  className={useTerminal ?
    "bg-accent-yellow text-terminal-bg px-6 py-3 font-medium hover:bg-accent-yellow/90 transition-colors font-mono tracking-wider uppercase" :
    "bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
  }
  style={useTerminal ? { borderRadius: 0 } : undefined}
>
  {useTerminal ? "SUBMIT" : "Submit"}
</button>
```

### Secondary Button (Terminal Style)
```tsx
<button
  className={useTerminal ?
    "bg-terminal-panel text-text-secondary border-2 border-terminal-border px-6 py-3 font-medium hover:border-text-secondary hover:text-text-primary transition-colors font-mono tracking-wider uppercase" :
    "bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors"
  }
  style={useTerminal ? { borderRadius: 0 } : undefined}
>
  {useTerminal ? "CANCEL" : "Cancel"}
</button>
```

### Error Message (Terminal Style)
```tsx
<div className={useTerminal ?
  "text-red-400 text-xs mt-2 font-mono" :
  "text-red-400 text-sm mt-1"
}>
  {errorMessage}
</div>
```

---

## Implementation Order

1. **AuthModal** (1-2 hours)
   - Most important user touchpoint
   - Test thoroughly on sign in/sign up flows

2. **Race Modals** (2-3 hours)
   - Add/edit race forms
   - Import race modal
   - Search results styling

3. **Form Inputs** (1-2 hours)
   - Create reusable terminal input components
   - Text inputs, selects, textareas
   - Validation states

4. **Planning Calculators** (2 hours)
   - Nutrition calculator
   - Pacing calculator
   - Results display

5. **Goal & Training Modals** (1-2 hours)
   - Goal CRUD modals
   - Training details
   - Edit workout forms

6. **Confirmation Dialogs** (1 hour)
   - Delete confirmations
   - Destructive action warnings
   - Success messages

---

## Terminal Design Checklist for Each Modal

- [ ] Modal container uses `bg-terminal-panel` with `border-2 border-terminal-border`
- [ ] Hard edges applied (`borderRadius: 0`)
- [ ] Heading is uppercase monospace with `text-text-primary`
- [ ] All labels are uppercase monospace with `text-text-secondary`
- [ ] Input fields have terminal styling with 2px borders
- [ ] Primary buttons use `bg-accent-yellow text-terminal-bg`
- [ ] Secondary buttons use terminal panel with borders
- [ ] Error states use red text with monospace font
- [ ] Close buttons have terminal styling
- [ ] Responsive on mobile (forms stack properly)
- [ ] Focus states use `border-accent-yellow`
- [ ] All text uses monospace font in terminal mode

---

## Testing Checklist

After each modal is updated:
- [ ] Test in terminal mode (feature flag enabled)
- [ ] Test in legacy mode (feature flag disabled)
- [ ] Test form validation (errors display correctly)
- [ ] Test form submission (data saves properly)
- [ ] Test on mobile (responsive layout works)
- [ ] Test keyboard navigation (tab order, enter to submit)
- [ ] Test close/cancel actions
- [ ] Verify no console errors
- [ ] Build succeeds (`npm run build:web`)
- [ ] Commit changes locally

---

## Expected Challenges

1. **Complex Form Logic**: Some forms have dynamic fields - preserve functionality while updating styles
2. **Validation States**: Ensure error/success states are visible with terminal colors
3. **Date Pickers**: May need custom styling for calendar popups
4. **Mobile Forms**: Stack inputs properly, ensure touch targets are adequate
5. **Focus States**: Make sure keyboard navigation is clear with terminal borders

---

## Success Criteria

Phase 4 is complete when:
- ✅ All modal containers use terminal styling
- ✅ All form inputs have consistent terminal design
- ✅ All buttons follow terminal patterns (primary/secondary/danger)
- ✅ Validation messages use terminal aesthetics
- ✅ Mobile responsive layouts work correctly
- ✅ No regressions in form functionality
- ✅ Build succeeds without errors
- ✅ All changes committed to git

---

## Next Phase Preview

**Phase 5: Polish & Animation** (6-8 hours)
- Smooth transitions between legacy and terminal modes
- Split-flap letter flip animations
- Loading states with terminal aesthetics
- Hover effects and micro-interactions
- Performance optimization
- Cross-browser testing

---

## Resume Instructions

When resuming Phase 4:

1. **Start dev server**: `npm start` (or `npm run web` for web only)
2. **Check current branch**: Should be on `main` (Phase 3 complete)
3. **First task**: Update AuthModal (`src/components/AuthModal.tsx`)
4. **Pattern**: Read file → Add terminal mode state → Update container → Update forms → Update buttons → Test → Build → Commit
5. **Reference**: Use this document and completed screens (Dashboard, Races, etc.) as examples

---

**Document Created**: December 1, 2025  
**Last Updated**: December 1, 2025  
**Status**: Ready to begin Phase 4
