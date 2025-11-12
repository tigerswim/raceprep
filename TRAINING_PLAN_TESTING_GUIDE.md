# Training Plan UI - Testing Guide

**Date**: November 12, 2025
**Status**: Ready for Testing
**Dev Server**: http://localhost:8081

---

## 🚀 Quick Start

### Prerequisites
- ✅ Expo dev server is running on http://localhost:8081
- ✅ Database migrations applied (training plan tables exist)
- ✅ Training plan templates seeded in database
- ✅ Supabase connection configured in `.env.local`

### Access the App
1. Open your browser to **http://localhost:8081**
2. You should see the RacePrep dashboard
3. Navigate using the bottom tab bar

---

## 📋 Test Checklist

### Test 1: Dashboard Widget (No Active Plan)

**Location**: Dashboard (Home) tab

**Steps**:
1. ✅ Open http://localhost:8081
2. ✅ If not logged in, log in with your test account
3. ✅ Look for "Training Plan" widget on the dashboard
4. ✅ Should display: "No active training plan"
5. ✅ Should show a "Start a Plan" button

**Expected Result**:
```
┌─────────────────────────────┐
│ Training Plan               │
├─────────────────────────────┤
│ No active training plan     │
│                             │
│    [Start a Plan]           │
└─────────────────────────────┘
```

**Pass/Fail**: ___________

---

### Test 2: Plan Selection Screen

**Location**: Training Plans (`/training-plans`)

**Steps**:
1. ✅ Click "Start a Plan" from dashboard widget
   OR navigate to http://localhost:8081/training-plans
2. ✅ Verify page loads with header "Choose Your Training Plan"
3. ✅ Check distance filters visible: All, Sprint, Olympic, 70.3, Ironman
4. ✅ Check experience filters visible: All, Beginner, Intermediate, Advanced
5. ✅ Verify 3 training plan templates appear:
   - Sprint Beginner (12 weeks, 6-8 hrs/week)
   - Sprint Intermediate (12 weeks, 8-10 hrs/week)
   - Olympic Beginner (16 weeks, 8-10 hrs/week)

**Expected Templates**:
```
┌────────────────────────────────────────┐
│ Sprint Beginner Training Plan          │
│ [SPRINT] [beginner]                    │
│ 12-week program for first-time...     │
│ 12 weeks | 6-8 hrs/week               │
│ • Focus on building base endurance     │
│ • Gradual progression...               │
└────────────────────────────────────────┘
```

**Test Filters**:
- ✅ Click "Sprint" filter → should show 2 plans (Sprint Beginner & Intermediate)
- ✅ Click "Olympic" filter → should show 1 plan (Olympic Beginner)
- ✅ Click "Beginner" filter → should show 2 plans
- ✅ Click "Intermediate" filter → should show 1 plan
- ✅ Click "All" → should reset to 3 plans

**Pass/Fail**: ___________

---

### Test 3: Plan Detail Modal

**Location**: Training Plans screen → Click any template card

**Steps**:
1. ✅ Click on "Sprint Beginner Training Plan" card
2. ✅ Modal should open with full-screen view
3. ✅ Verify modal displays:
   - Plan name
   - Distance and experience badges
   - Duration (12 weeks) and hours/week (6-8)
   - Full description
   - Target audience section
   - Key features list (multiple items)
4. ✅ Check for "Cancel" and "Start This Plan" buttons at bottom

**Expected Modal**:
```
┌─────────────────────────────────────────┐
│ Sprint Beginner Training Plan           │
│ [SPRINT] [beginner]                     │
│                                         │
│ ┌─────────┬─────────┐                  │
│ │ 12      │ 6-8     │                  │
│ │ Weeks   │ Hrs/Wk  │                  │
│ └─────────┴─────────┘                  │
│                                         │
│ Description                             │
│ [Full description text...]              │
│                                         │
│ Target Audience                         │
│ [Audience text...]                      │
│                                         │
│ Key Features                            │
│ • Feature 1                             │
│ • Feature 2                             │
│ • ...                                   │
│                                         │
│ [Cancel]  [Start This Plan]            │
└─────────────────────────────────────────┘
```

**Interactions**:
- ✅ Click "Cancel" → modal closes, returns to plan list
- ✅ Re-open modal, click "Start This Plan" → proceed to next test

**Pass/Fail**: ___________

---

### Test 4: Plan Creation Wizard

**Location**: Create Training Plan (`/create-training-plan?templateId=...`)

**Steps**:
1. ✅ From plan detail modal, click "Start This Plan"
2. ✅ Should navigate to plan creation screen
3. ✅ Verify form displays:
   - Plan name field (pre-filled with template name)
   - Start date picker (default = next Monday)
   - Template summary (weeks, hours/week)
   - Description
4. ✅ Optionally: Edit plan name (e.g., "My First Sprint")
5. ✅ Optionally: Change start date
6. ✅ Click "Create Plan" button

**Expected Behavior**:
- Loading indicator appears briefly
- Navigates to training calendar with your new plan
- URL should be: `/training-calendar?planId=<uuid>&currentWeek=1`

**Pass/Fail**: ___________

---

### Test 5: Weekly Calendar View

**Location**: Training Calendar (`/training-calendar?planId=...&currentWeek=1`)

**Steps**:
1. ✅ After creating plan, should auto-navigate to calendar
2. ✅ Verify header shows "Training Calendar"
3. ✅ Check week navigation:
   - "Week 1 of 12" (or appropriate total)
   - Previous week button (should be disabled on Week 1)
   - Next week button (should be enabled)
4. ✅ Verify workout cards display for Week 1:
   - Monday through Sunday (7 days)
   - Each day shows workouts or "Rest Day"
   - Workout cards show:
     - Discipline icon (swim/bike/run/brick/strength/rest)
     - Discipline name and type
     - Duration in minutes
     - Distance (if applicable)
5. ✅ Check color coding:
   - Swim = Blue
   - Bike = Orange
   - Run = Green
   - Brick = Purple
   - Strength = Red
   - Rest = Gray

**Expected Week 1 Layout**:
```
┌─────────────────────────────────────────┐
│ Training Calendar                       │
│                                         │
│ [<] Week 1 of 12 [>]                   │
├─────────────────────────────────────────┤
│ Monday                                  │
│ ┌─────────────────────────┐            │
│ │ 🏊 Swim • Base          │            │
│ │ 30 min • 0.5 miles      │            │
│ └─────────────────────────┘            │
│                                         │
│ Tuesday                                 │
│ ┌─────────────────────────┐            │
│ │ 🚴 Bike • Endurance     │            │
│ │ 45 min • 10 miles       │            │
│ └─────────────────────────┘            │
│ ...                                     │
└─────────────────────────────────────────┘
```

**Test Navigation**:
- ✅ Click "Next Week" → should show Week 2 workouts
- ✅ Click "Next Week" again → Week 3
- ✅ Click "Previous Week" → back to Week 2
- ✅ Click "Previous Week" → back to Week 1

**Pass/Fail**: ___________

---

### Test 6: Workout Detail Modal

**Location**: Training Calendar → Click any workout card

**Steps**:
1. ✅ From calendar, click on any workout card (e.g., Monday's swim)
2. ✅ Workout detail modal should open
3. ✅ Verify modal displays:
   - Workout title (e.g., "Swim - Base Endurance")
   - Duration and distance
   - Workout type badge
   - Workout structure (warmup, main set, cooldown)
   - Detailed description
   - Coaching notes
   - Goals list
4. ✅ Check buttons at bottom:
   - "Close" button
   - "Complete Workout" button
   - "Skip Workout" button

**Expected Modal**:
```
┌─────────────────────────────────────────┐
│ 🏊 Swim - Base Endurance               │
│ [base] Week 1, Day 1                   │
├─────────────────────────────────────────┤
│ Duration: 30 minutes                    │
│ Distance: 0.5 miles                     │
│                                         │
│ Workout Structure                       │
│ Warmup:                                 │
│ • 5 min easy swimming                   │
│                                         │
│ Main Set:                               │
│ • 20 min steady pace                    │
│                                         │
│ Cooldown:                               │
│ • 5 min easy                            │
│                                         │
│ Coaching Notes                          │
│ Focus on form and breathing...          │
│                                         │
│ Goals                                   │
│ • Build aerobic base                    │
│ • Practice technique                    │
│                                         │
│ [Close] [Skip] [Complete Workout]      │
└─────────────────────────────────────────┘
```

**Pass/Fail**: ___________

---

### Test 7: Complete Workout

**Location**: Workout Detail Modal → Click "Complete Workout"

**Steps**:
1. ✅ From workout detail modal, click "Complete Workout"
2. ✅ Completion form should appear with fields:
   - Actual duration (minutes) - optional
   - Actual distance (miles) - optional
   - Perceived effort (1-10 scale) - default 5
   - Notes (text area) - optional
3. ✅ Fill in some data:
   - Duration: 32 minutes
   - Distance: 0.6 miles
   - Effort: 7
   - Notes: "Felt good, worked on breathing"
4. ✅ Click "Submit" or "Complete" button

**Expected Behavior**:
- Success message: "Workout completed!"
- Modal closes
- Calendar updates: workout card shows "✓ Completed" indicator
- Workout card may change color or show green checkmark

**Pass/Fail**: ___________

---

### Test 8: Skip Workout

**Location**: Workout Detail Modal → Click "Skip Workout"

**Steps**:
1. ✅ Open a different workout detail modal
2. ✅ Click "Skip Workout" button
3. ✅ Skip form should appear with field:
   - Reason for skipping (text area or dropdown)
4. ✅ Enter reason: "Feeling tired, need rest"
5. ✅ Click "Submit Skip" or similar button

**Expected Behavior**:
- Modal closes
- Calendar updates: workout card shows "⊘ Skipped" indicator
- Workout card may show with strikethrough or different styling

**Pass/Fail**: ___________

---

### Test 9: Dashboard Widget (Active Plan)

**Location**: Dashboard (navigate back to home)

**Steps**:
1. ✅ Navigate back to Dashboard (Home tab)
2. ✅ Find "Training Plan" widget
3. ✅ Should now display active plan information:
   - Week progress: "Week 1/12"
   - Completion percentage (circular progress or percentage)
   - Stats:
     - Completed workouts count
     - Adherence rate (%)
     - Remaining workouts count
   - This week's upcoming workouts (next 3)
   - "View Calendar" button

**Expected Widget (Active Plan)**:
```
┌─────────────────────────────────────────┐
│ Training Plan        [Week 1/12]        │
├─────────────────────────────────────────┤
│            ╭────────────╮               │
│            │    14%     │               │
│            │  Complete  │               │
│            ╰────────────╯               │
│                                         │
│ ┌───────┬─────────┬──────────┐         │
│ │   2   │   85%   │    12    │         │
│ │Compltd│Adherenc│Remaining │         │
│ └───────┴─────────┴──────────┘         │
│                                         │
│ This Week:                              │
│ 🏊 Swim • 30 min                        │
│ 🚴 Bike • 45 min                        │
│ 🏃 Run • 20 min                         │
│                                         │
│ [View Calendar →]                       │
└─────────────────────────────────────────┘
```

**Verify Stats**:
- ✅ Completed count = 2 (if you completed 2 workouts)
- ✅ Adherence rate should be calculated correctly
- ✅ Remaining count should update

**Test Button**:
- ✅ Click "View Calendar" → should navigate to calendar at current week

**Pass/Fail**: ___________

---

## 🐛 Known Issues / Notes

**Record any issues you find here:**

| Issue | Severity | Description | Screenshot/Details |
|-------|----------|-------------|-------------------|
| 1.    | High/Med/Low |             |                   |
| 2.    |              |             |                   |
| 3.    |              |             |                   |

---

## ✅ Browser Compatibility

Test in multiple browsers if possible:

- [ ] Chrome/Chromium
- [ ] Safari
- [ ] Firefox
- [ ] Edge

---

## 📱 Responsive Design

Test at different screen sizes:

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## 🔄 Additional Test Scenarios

### Scenario A: Multiple Weeks Navigation
1. Complete some workouts in Week 1
2. Navigate to Week 2
3. Verify Week 2 workouts load
4. Navigate back to Week 1
5. Verify completed workouts still show as completed

### Scenario B: Adherence Calculation
1. Complete 5 out of 7 workouts in a week
2. Skip 1 workout
3. Leave 1 workout incomplete
4. Check dashboard adherence rate
5. Should be: (5 completed / 7 total) × 100 = 71%

### Scenario C: Edge Cases
- **Test**: Try to create a plan with past start date
- **Test**: Navigate to week beyond plan duration
- **Test**: Complete the same workout twice
- **Test**: Refresh page during plan creation

---

## 📊 Test Summary

**Date Tested**: ___________
**Tester**: ___________
**Browser**: ___________
**Screen Size**: ___________

**Overall Result**:
- [ ] All tests passed ✅
- [ ] Some tests failed (see issues above) ⚠️
- [ ] Major issues found 🚨

**Total Tests**: 9
**Passed**: _____ / 9
**Failed**: _____ / 9

---

## 🚀 Next Steps After Testing

If all tests pass:
- [ ] Deploy to staging environment
- [ ] User acceptance testing with real users
- [ ] Performance optimization (if needed)
- [ ] Proceed to Phase 3 advanced analytics

If issues found:
- [ ] Document all issues in GitHub/project tracker
- [ ] Prioritize fixes (critical/high/medium/low)
- [ ] Create fix plan and re-test

---

**Testing completed on**: ___________
**Sign-off**: ___________
