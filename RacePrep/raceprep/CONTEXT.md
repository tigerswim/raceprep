# RacePrep - Project Context for AI Assistants

**Project:** RacePrep Triathlon Tracking Application
**Status:** Phase 2 Complete (100%)
**Last Updated:** September 30, 2025
**Target Users:** Beginner to intermediate triathletes

---

## 🎯 Project Vision

RacePrep is **"The only triathlon app that understands your race as a complete event, not three separate sports."**

Unlike existing platforms (Strava, TrainingPeaks, Garmin Connect), RacePrep focuses on:
- **Integrated race analysis** - T1/T2 transitions matter
- **Race-specific planning** - Nutrition, packing, predictions
- **Beginner-friendly analytics** - Clear insights, not overwhelming data

---

## 📊 Current Capabilities (Phase 1 + 2 Complete)

### Authentication & User Management ✅
- Supabase Auth with email/password
- User profiles with age group, experience level
- Settings and preferences

### Strava Integration ✅
- OAuth2 authentication flow
- Automatic activity sync (swim/bike/run)
- Activity detail views with HR zones, power, elevation
- API compliance with Strava branding requirements

### Race Discovery & Management ✅
- RunSignup API integration for race search
- User-created custom races
- Race status tracking (planned/completed/cancelled)
- Distance type validation (Sprint/Olympic/70.3/Ironman)

### Race Result Tracking ✅
- Complete split time entry (swim, T1, bike, T2, run)
- Automatic pace/speed calculations
- Overall and age group placements
- Personal best tracking per distance

### Advanced Analytics (NEW in Phase 2) ✅
- **TransitionAnalyticsWidget**: T1/T2 performance tracking
  - Average and best times across all races
  - Trend analysis (improving/stable/declining)
  - Smart optimization tips with priority levels
  - Elite/Competitive/Recreational benchmarks

- **PersonalBestsWidget**: PR tracking
  - Best time for each distance type
  - Recent achievements (90-day window)
  - Split time displays

- **RaceAnalysisModal**: Enhanced race analysis
  - Interactive timeline visualization
  - Age group percentile comparisons
  - Color-coded performance indicators
  - Discipline-specific insights

### Dashboard Widgets ✅
1. **PerformanceOverviewWidget** - 7-day training stats with SVG charts
2. **UpcomingRacesWidget** - Countdown timers and prep tracking
3. **GoalsProgressWidget** - Visual progress bars
4. **WeatherWidget** - Geolocation-based current conditions
5. **TransitionAnalyticsWidget** - T1/T2 analytics (NEW)
6. **PersonalBestsWidget** - PR tracking (NEW)

### Race Planning Tools ✅
- Nutrition planning (carbs, electrolytes, hydration)
- Packing lists (T1/T2 gear checklists)
- AI-powered race predictions
- Weather integration for race day

---

## 🏗️ Technical Architecture

### Frontend Stack
```
React Native (Expo)
├── TypeScript (strict mode)
├── Redux Toolkit (state management)
├── NativeWind (Tailwind CSS for RN)
├── Expo Router (file-based navigation)
└── React Icons (Tabler Icons)
```

### Backend Stack
```
Node.js/Express (port 3001)
├── Supabase PostgreSQL
├── Row Level Security (RLS) policies
├── 12 database migrations
└── API integrations (Strava, RunSignup, OpenWeatherMap)
```

### Key Dependencies
- `@supabase/supabase-js` - Database client
- `expo-router` - Navigation
- `@reduxjs/toolkit` - State management
- `nativewind` - Styling
- `react-icons` - Icons

---

## 🗄️ Database Schema

### Core Tables
```sql
users                    -- User profiles and auth
user_settings           -- User preferences
user_races              -- Custom races (Phase 2)
user_race_results       -- Race results with splits
user_planned_races      -- Upcoming race plans
user_goals              -- Training/racing goals
training_sessions       -- Strava activities
nutrition_plans         -- Race nutrition plans
packing_lists          -- Race gear checklists
courses                -- Pre-defined courses (empty)
external_races         -- RunSignup API data
```

### Critical Fields
**user_race_results:**
- `overall_time`, `swim_time`, `bike_time`, `run_time`
- `t1_time`, `t2_time` (transitions)
- `overall_placement`, `age_group_placement`
- Foreign key to `user_races`

**training_sessions:**
- `strava_activity_id` (unique)
- `type` (Swim/Ride/Run)
- `distance`, `moving_time`, `elevation_gain`
- `average_heartrate`, `average_watts`, `suffer_score`

---

## 🎨 Design System

### Color Palette
```
Disciplines:
- Swim:  Blue (#3B82F6)
- Bike:  Orange (#F97316)
- Run:   Green (#10B981)
- T1/T2: Gray (#6B7280) or Yellow (#F59E0B) for warnings

UI Elements:
- Primary:   Blue (#3B82F6)
- Secondary: Purple (#8B5CF6)
- Success:   Green (#10B981)
- Warning:   Yellow (#F59E0B)
- Danger:    Red (#EF4444)
```

### Component Patterns
```tsx
// Glassmorphism containers
className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"

// Gradient backgrounds
className="bg-gradient-to-r from-blue-500 to-purple-500"

// Color-coded performance
{percentile >= 75 ? 'text-green-400' : 'text-yellow-400'}
```

---

## 🧩 Component Architecture

### Modal Pattern
All major features use modal components:
- `AddResultModal` - Enter race results
- `RaceAnalysisModal` - View detailed analysis
- `RaceComparisonModal` - Compare races
- `RacePredictionModal` - AI predictions
- `UserRaceFormModal` - Create/edit races

### Widget Pattern
Dashboard widgets are standalone, data-fetching components:
- Self-contained state management
- Loading states
- Error handling
- Empty states with CTAs
- Consistent styling

### Service Layer
All database/API calls go through service modules:
- `src/services/supabase.ts` - Database operations
- `src/services/stravaService.ts` - Strava API
- `src/services/apiIntegrations.ts` - Other APIs

---

## 🔒 Security Implementation

### Row Level Security (RLS)
All user data tables have RLS policies:
```sql
-- Example policy
CREATE POLICY "Users can access own data" ON user_race_results
FOR ALL USING (auth.uid() = user_id);
```

### Input Validation
- TypeScript type checking at compile time
- Runtime validation for user inputs
- Sanitization of text fields
- Parameter validation on all queries

### API Security
- Strava tokens stored securely in database
- Rate limiting on API endpoints
- Environment variables for sensitive keys
- No credentials in code

---

## 📈 Performance Optimizations

### Database
- Indexes on frequently queried fields
- Materialized views for training stats
- Connection pooling
- Query result caching (client-side)

### Frontend
- Lazy loading of modals
- Memoized calculations (useMemo, useCallback)
- Efficient re-rendering (React.memo)
- Optimistic UI updates

### API
- Request batching where possible
- Minimal data fetching
- Background sync for Strava activities

---

## 🧪 Testing Strategy

### Current Coverage
- **Service Tests:** 7/7 passing
- **Focus Areas:** Database operations, API integrations
- **Framework:** Jest + React Testing Library

### Test Patterns
```typescript
describe('dbHelpers.userRaceResults', () => {
  it('should fetch all user race results', async () => {
    const { data, error } = await dbHelpers.userRaceResults.getAll();
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

---

## 🚨 Known Issues & Limitations

### Current Limitations
1. **No Training Plans** - Users can't create structured workout plans
2. **Basic Weather** - Only current conditions, no forecasts
3. **No Social Features** - No training partners, groups, challenges
4. **Empty Course Database** - Schema exists but not populated
5. **Limited Predictions** - AI predictions are basic, not ML-based

### Technical Debt
- 30 ESLint warnings (mostly unused vars)
- Some components need refactoring for reusability
- Error boundaries not implemented everywhere
- Loading states inconsistent across components

---

## 📋 Phase 3 Recommendations

### High Priority (~100 hours total)

1. **Training Plan Engine** (40 hours)
   - Structured workout builder
   - Training calendar integration
   - Periodization support (Base/Build/Peak)
   - Workout templates by distance

2. **Advanced Analytics** (30 hours)
   - Heart rate zone analysis
   - Power zone analysis (cycling)
   - Training load tracking (TSS/CTL/ATL)
   - Fatigue and form monitoring

3. **Race Time Predictions** (25 hours)
   - ML-based finish time predictions
   - Course difficulty adjustments
   - Weather impact modeling
   - Pacing recommendations

4. **Social Features** (35 hours)
   - Training partners/clubs
   - Activity sharing
   - Challenges and leaderboards
   - Group workouts

### Medium Priority
- Advanced weather integration (7-day forecasts)
- Nutrition tracking and analysis
- Equipment management
- Injury tracking and prevention

### Low Priority
- Course database population (data collection)
- Integration with other platforms (Garmin, etc.)
- Premium features and monetization

---

## 🎓 Key Decisions & Rationale

### Why React Native + Expo?
- Cross-platform (iOS/Android/Web)
- Fast development cycle
- Large ecosystem
- Easy deployment

### Why Supabase?
- PostgreSQL (reliable, feature-rich)
- Built-in authentication
- Real-time capabilities
- Row Level Security
- Generous free tier

### Why Redux Toolkit?
- Predictable state management
- Developer tools
- RTK Query for API caching
- TypeScript support

### Why NativeWind over StyleSheet?
- Utility-first approach
- Responsive design
- Consistent with web development
- Fast iteration

---

## 🔄 Development Workflow

### Git Strategy
```
main branch → production-ready code
feature branches → new development
No direct commits to main
```

### Code Review Checklist
- [ ] TypeScript errors cleared
- [ ] Tests passing
- [ ] No console.errors/warnings
- [ ] RLS policies applied
- [ ] Loading/error states handled
- [ ] Mobile responsive

### Deployment Process
1. Run tests: `npm test`
2. Build check: `npx tsc --noEmit`
3. Commit changes
4. Push to branch
5. Create PR (when ready)

---

## 💡 Best Practices

### Component Development
1. Start with TypeScript interfaces
2. Implement loading state
3. Implement error state
4. Implement empty state
5. Add success state
6. Handle edge cases

### Database Queries
```typescript
// Always use try/catch
try {
  const { data, error } = await dbHelpers.table.operation();
  if (error) throw error;
  // Use data
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly message
}
```

### State Management
- Local state (useState) for UI-only state
- Context for shared state within feature
- Redux for global app state
- Database for persisted state

---

## 🎯 Success Metrics

### User Engagement
- Daily active users
- Races tracked per user
- Strava sync rate
- Goal completion rate

### Performance
- Dashboard load time < 2s
- Race analysis load time < 1s
- Strava sync success rate > 95%

### Quality
- TypeScript error count: 0
- Test coverage > 70%
- Production error rate < 1%

---

## 📚 Learning Resources

### For Understanding Codebase
1. Read `README.md` - Overview
2. Read `QUICKSTART.md` - Setup guide
3. Review `DEVELOPMENT_PLAN.md` - Roadmap
4. Check `PHASE_2_COMPLETION_SUMMARY.md` - Recent work

### For Feature Development
- **Expo Docs:** https://docs.expo.dev/
- **Supabase Docs:** https://supabase.com/docs
- **Redux Toolkit:** https://redux-toolkit.js.org/
- **NativeWind:** https://www.nativewind.dev/

### For API Integration
- **Strava API:** https://developers.strava.com/
- **RunSignup API:** https://runsignup.com/API

---

## 🤝 Collaboration with AI Assistants

### Effective Prompts
**Good:**
- "Create a training plan builder component with TypeScript"
- "Add heart rate zone analysis to PerformanceOverviewWidget"
- "Fix the race result save error in AddResultModal.tsx:157"

**Bad:**
- "Make it better" (too vague)
- "Add features" (not specific)
- "Fix bugs" (which bugs?)

### Context Sharing
Always share:
- What you're trying to accomplish
- What you've already tried
- Any error messages
- Relevant file paths

### Code Review Requests
Ask for:
- Performance optimization suggestions
- TypeScript type safety improvements
- Accessibility enhancements
- Security vulnerability checks

---

## ✅ Pre-Development Checklist

Before starting new work:
1. [ ] Read this CONTEXT.md file
2. [ ] Review QUICKSTART.md for setup
3. [ ] Check DEVELOPMENT_PLAN.md for current priorities
4. [ ] Verify database migrations are up to date
5. [ ] Ensure tests are passing
6. [ ] Confirm both servers are running

---

**This document provides the essential context for any AI assistant to effectively work on the RacePrep project. Update it as the project evolves.**

---

*Last reviewed: September 30, 2025*
