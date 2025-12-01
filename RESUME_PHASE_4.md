# Resume Phase 4 - Quick Start Guide

**Last Session**: December 1, 2025  
**Phase 3 Status**: Complete ✅  
**Next Task**: Begin Phase 4 (Modals & Forms)

---

## Quick Resume (Copy & Paste)

When you're ready to continue, tell Claude:

```
Continue with Phase 4 of the terminal design. Start with the AuthModal.
```

Or simply:

```
Start Phase 4
```

---

## What Was Completed

### Phase 3: Screens & Navigation ✅
All main application screens now have terminal styling:
- Dashboard, Races, Training, Planning, Profile screens
- Navigation bar with accent-yellow active states
- Terminal backgrounds, headers, and navigation elements
- Monospace fonts with uppercase text
- Hard edges (borderRadius: 0) throughout

### Terminal Design Pattern Established
Every screen follows this pattern:
1. Import `useTerminalModeToggle` and `getTerminalModeState`
2. Add terminal state with proper initialization
3. Add event listener for terminal mode changes
4. Conditional rendering for terminal vs legacy styles
5. Terminal colors: `bg-terminal-bg`, `bg-terminal-panel`, `accent-yellow`
6. Typography: `font-mono`, `tracking-wider`, uppercase text
7. Borders: `border-2 border-terminal-border`

---

## What's Next: Phase 4

### First Task: AuthModal
**File**: `src/components/AuthModal.tsx`  
**Estimated Time**: 1-2 hours

**Steps**:
1. Read the file
2. Add terminal mode state (same pattern as screens)
3. Update modal container with terminal panel
4. Update form inputs with terminal styling
5. Update buttons (primary = accent-yellow)
6. Update labels (uppercase monospace)
7. Test sign in/sign up flows
8. Build and commit

### After AuthModal
2. Race modals (add/edit race forms)
3. Goal modals (add/edit goals)
4. Training modals (workout details)
5. Planning calculators (nutrition, pacing)
6. Confirmation dialogs

---

## Reference Documents

- **Detailed Phase 4 Plan**: `PHASE_4_MODALS_FORMS_PLAN.md`
- **Implementation Patterns**: See completed screens (races.tsx, training.tsx, etc.)
- **CHANGELOG**: `CHANGELOG.md` - Phase 3 summary
- **Development Plan**: `DEVELOPMENT_PLAN.md` - Overall roadmap

---

## Terminal Design Quick Reference

### Colors
- Background: `bg-terminal-bg` (#1a1a1a)
- Panel: `bg-terminal-panel` (#262626)
- Border: `border-terminal-border` (#333333)
- Accent: `accent-yellow` (#fbbf24)
- Text Primary: `text-text-primary` (#e5e7eb)
- Text Secondary: `text-text-secondary` (#9ca3af)

### Typography
- Font: `font-mono` (monospace)
- Tracking: `tracking-wider`
- Case: Uppercase for labels/headings

### Borders
- Width: `border-2`
- Radius: `borderRadius: 0` (hard edges)
- Focus: `focus:border-accent-yellow`

### State Pattern
```tsx
// Add to component
useTerminalModeToggle();
const [useTerminal, setUseTerminal] = useState(() => {
  const override = getTerminalModeState();
  if (override !== false) return override;
  return true;
});

useEffect(() => {
  const handleTerminalModeChange = () => {
    setUseTerminal(getTerminalModeState());
  };
  if (typeof window !== "undefined") {
    window.addEventListener("terminalModeChanged", handleTerminalModeChange);
    return () => {
      window.removeEventListener("terminalModeChanged", handleTerminalModeChange);
    };
  }
}, []);
```

---

## Development Workflow

### Standard Process
1. **Start dev server**: `npm start` (or `npm run web`)
2. **Read target file**: Use Claude to read the component
3. **Add terminal mode**: State + event listeners
4. **Update UI**: Conditional rendering for terminal styles
5. **Test**: Check both terminal and legacy modes
6. **Build**: `npm run build:web`
7. **Commit**: Git commit with descriptive message

### Don't Push Unless Asked
Remember: Only commit locally. Don't push to remote unless user explicitly requests it.

---

## Build Commands

```bash
# Start dev server
npm start

# Web only
npm run web

# Build for production
npm run build:web

# Check for errors
npx tsc --noEmit
```

---

## Git Status Check

```bash
# Check current branch
git branch

# Should be on: main

# Check recent commits
git log --oneline -5

# Should see Phase 3 completion commits
```

---

## Session Checklist

Before starting Phase 4:
- [ ] Review PHASE_4_MODALS_FORMS_PLAN.md
- [ ] Check that Phase 3 is committed
- [ ] Start dev server
- [ ] Verify terminal mode is working on existing screens
- [ ] Begin with AuthModal migration

---

## Expected Phase 4 Duration

- **AuthModal**: 1-2 hours
- **Race Modals**: 2-3 hours
- **Form Components**: 1-2 hours
- **Calculators**: 2 hours
- **Goal/Training Modals**: 1-2 hours
- **Confirmation Dialogs**: 1 hour

**Total**: 8-10 hours

---

## Success Criteria

Phase 4 is complete when:
- ✅ All modals use terminal styling
- ✅ All form inputs have consistent terminal design
- ✅ All buttons follow terminal patterns
- ✅ Validation messages use terminal aesthetics
- ✅ Mobile layouts work correctly
- ✅ No functionality regressions
- ✅ Build succeeds
- ✅ Changes committed

---

## Contact Points

When Claude resumes:
- Claude will have access to all previous work
- Can reference completed screens as examples
- Has detailed Phase 4 plan
- Knows the established patterns
- Will follow the same systematic approach

---

**Ready to Resume**: Just say "Start Phase 4" or "Continue with terminal design Phase 4"

**Created**: December 1, 2025  
**Phase 3 Commits**: 6 commits (Dashboard, Races, Training, Planning, Profile, Navigation)  
**Next Milestone**: Phase 4 complete (all modals/forms with terminal styling)
