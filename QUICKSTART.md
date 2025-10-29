# RacePrep - Quick Start Guide for Claude Code in Zed

**Last Updated:** September 30, 2025
**Project Status:** Phase 2 Complete (100%)
**Next Phase:** Phase 3 - Advanced Features

---

## 🚀 Quick Context for Claude Code

### What This Project Is
RacePrep is a **mobile-first triathlon tracking application** for beginner to intermediate triathletes. It provides integrated race analysis, training data from Strava, and performance analytics.

### Current Status
- **Phase 1 (MVP):** ✅ Complete - Auth, Strava integration, race discovery, basic UI
- **Phase 2 (Core Features):** ✅ Complete - Advanced analytics, dashboard widgets, race result tracking
- **Phase 3 (Advanced Features):** ⏳ Not started - Training plans, ML predictions, social features

### Tech Stack
- **Frontend:** React Native + Expo, TypeScript, Redux Toolkit, NativeWind (Tailwind)
- **Backend:** Node.js/Express (port 3001), Supabase PostgreSQL
- **APIs:** Strava OAuth2, RunSignup, OpenWeatherMap

---

## 📂 Project Structure

```
raceprep/
├── app/                    # Expo Router pages (tabs-based navigation)
│   ├── (tabs)/            # Main tab screens
│   │   ├── index.tsx      # Dashboard (home)
│   │   ├── training.tsx   # Training/Strava data
│   │   ├── races.tsx      # Race discovery & management
│   │   ├── planning.tsx   # Race planning tools
│   │   └── profile.tsx    # User profile & settings
│   └── _layout.tsx        # Root layout with auth context
│
├── src/
│   ├── components/        # React components
│   │   ├── dashboard/     # 6 dashboard widgets (NEW in Phase 2)
│   │   │   ├── PerformanceOverviewWidget.tsx
│   │   │   ├── UpcomingRacesWidget.tsx
│   │   │   ├── GoalsProgressWidget.tsx
│   │   │   ├── WeatherWidget.tsx
│   │   │   ├── TransitionAnalyticsWidget.tsx  ← NEW
│   │   │   └── PersonalBestsWidget.tsx        ← NEW
│   │   ├── AddResultModal.tsx                  ← Enhanced in Phase 2
│   │   ├── RaceAnalysisModal.tsx               ← Enhanced in Phase 2
│   │   └── ...other components
│   │
│   ├── services/          # API & database services
│   │   ├── supabase.ts    # Supabase client & database helpers
│   │   ├── stravaService.ts  # Strava API integration
│   │   └── apiIntegrations.ts # RunSignup, Weather APIs
│   │
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   │
│   └── store/             # Redux store (RTK)
│
├── server/                # Express API server
│   └── server.js          # Runs on localhost:3001
│
├── supabase/              # Database schema & migrations
│   ├── schema.sql         # Complete database schema
│   ├── migrations/        # 12 migration files
│   └── seed.sql           # Sample data (5 Georgia courses)
│
└── Documentation files:
    ├── README.md          # Main project documentation
    ├── DEVELOPMENT_PLAN.md  # Detailed roadmap
    ├── FEATURES.md        # Feature specifications
    ├── QUICKSTART.md      # This file
    └── PHASE_2_COMPLETION_SUMMARY.md  # Recent work summary
```

---

## 🎯 Phase 2 Accomplishments (Just Completed)

### What Was Built:
1. **TransitionAnalyticsWidget** - Tracks T1/T2 performance across all races
   - Average & best times
   - Trend analysis (improving/stable/declining)
   - Smart optimization tips

2. **PersonalBestsWidget** - PR tracking for all distances
   - Best time per distance type (Sprint/Olympic/70.3/Ironman)
   - Recent PR highlighting (90-day window)

3. **Enhanced Race Analytics**
   - Interactive race timeline visualization
   - Age group percentile comparisons
   - Color-coded performance indicators
   - Real-time T1/T2 validation with tips

### Key Files Modified:
- `src/components/AddResultModal.tsx` - Enhanced T1/T2 UI
- `src/components/RaceAnalysisModal.tsx` - Added timeline viz & age group comparison
- `src/components/dashboard/TransitionAnalyticsWidget.tsx` - NEW
- `src/components/dashboard/PersonalBestsWidget.tsx` - NEW

---

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- Supabase account (credentials in `.env.local`)

### Start Development

1. **Terminal 1 - API Server:**
   ```bash
   cd server
   node server.js
   # Runs on http://localhost:3001
   ```

2. **Terminal 2 - Expo Dev Server:**
   ```bash
   npm start
   # Web: http://localhost:8081
   # iOS: Press 'i' (macOS only)
   # Android: Press 'a'
   ```

### Environment Variables
Check `.env.local` for:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_STRAVA_CLIENT_ID`
- `OPENWEATHERMAP_API_KEY`

---

## 📊 Database Schema Overview

### Core Tables:
- **users** - User profiles and settings
- **user_races** - User-created races (NEW in Phase 2)
- **user_race_results** - Race results with T1/T2 times
- **user_goals** - User goals with progress tracking
- **training_sessions** - Strava activity data
- **courses** - Pre-defined courses (schema exists, not populated)
- **external_races** - RunSignup API race data

### Important Relationships:
```
users → user_races → user_race_results
users → user_goals
users → training_sessions (Strava)
courses → races (foreign key, optional)
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test src/services/__tests__/supabase.test.ts

# Coverage report
npm run test:coverage
```

**Current Status:** 7/7 service tests passing, 0 errors, 30 warnings

---

## 🎨 UI/UX Patterns

### Component Styling (NativeWind/Tailwind):
```tsx
// Glassmorphism containers
className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"

// Gradient buttons
className="bg-gradient-to-r from-blue-500 to-purple-500"

// Color-coded disciplines
🏊‍♂️ Swim: blue-500
🚴‍♂️ Bike: orange-500
🏃‍♂️ Run: green-500
⚡ Transitions: gray-500/yellow-500 (based on performance)
```

### Icons:
Using **Tabler Icons** (react-icons/tb):
```tsx
import { TbTrophy, TbClock, TbTrendingUp } from 'react-icons/tb';
```

---

## 🔑 Key Conventions

### File Naming:
- Components: `PascalCase.tsx` (e.g., `AddResultModal.tsx`)
- Services: `camelCase.ts` (e.g., `supabaseService.ts`)
- Utils: `camelCase.ts`

### Component Structure:
```tsx
// 1. Imports
import React, { useState, useEffect } from 'react';

// 2. Interfaces
interface Props { ... }

// 3. Component
export const ComponentName: React.FC<Props> = ({ prop }) => {
  // 4. State
  const [data, setData] = useState();

  // 5. Effects
  useEffect(() => { ... }, []);

  // 6. Handlers
  const handleClick = () => { ... };

  // 7. Render
  return ( ... );
};
```

### Database Queries (Supabase):
```typescript
// Always use dbHelpers from supabase.ts
import { dbHelpers } from '../services/supabase';

const { data, error } = await dbHelpers.userRaceResults.getAll();
```

---

## 🚨 Common Issues & Solutions

### Issue: Strava sync not working
**Solution:** Check `training_sessions` table has `strava_activity_id` field (migration 005)

### Issue: Dashboard widgets not loading
**Solution:** Verify user is authenticated via AuthContext

### Issue: Race results not saving
**Solution:** Check `user_races` table exists (migration 007)

### Issue: Build errors with TypeScript
**Solution:** Run `npx tsc --noEmit` to see all type errors

---

## 📋 Phase 3 Planning (Next Steps)

### Recommended Priorities:

1. **Training Plan Engine** (~40 hours)
   - Structured workout builder
   - Training calendar integration
   - Periodization support

2. **Advanced Analytics** (~30 hours)
   - Heart rate zone analysis
   - Power zone analysis (cycling)
   - Training load/fatigue tracking
   - Performance modeling

3. **Race Predictions** (~25 hours)
   - ML-based finish time predictions
   - Course difficulty adjustments
   - Weather impact modeling
   - Pacing recommendations

4. **Social Features** (~35 hours)
   - Training partners/clubs
   - Challenges and leaderboards
   - Activity sharing

### Optional Enhancements:
- Course database population (15-20 hours data collection)
- Advanced weather integration (7-day forecasts)
- Nutrition tracking
- Equipment management

---

## 💡 Quick Commands for Claude Code

### To understand existing code:
```
"Show me how race results are currently saved"
"Explain the TransitionAnalyticsWidget implementation"
"What database tables are used for race analytics?"
```

### To build new features:
```
"Create a training plan builder component"
"Add heart rate zone analysis to PerformanceOverviewWidget"
"Implement race time prediction using linear regression"
```

### To fix bugs:
```
"Fix the TypeScript error in AddResultModal.tsx:42"
"Why isn't the dashboard loading user data?"
"Debug Strava activity sync issues"
```

### To refactor:
```
"Extract the percentile calculation logic into a utility function"
"Optimize the PersonalBestsWidget database queries"
"Convert AddResultModal to use TypeScript generics"
```

---

## 📚 Important Documentation Files

1. **README.md** - High-level overview, setup instructions
2. **DEVELOPMENT_PLAN.md** - Detailed roadmap, priorities
3. **FEATURES.md** - Feature specifications and use cases
4. **PHASE_2_COMPLETION_SUMMARY.md** - Recent work summary
5. **SUPABASE_SETUP.md** - Database setup instructions (if exists)

---

## 🎯 Project Context for AI Assistants

### Current State:
- **Working Features:** Auth, Strava sync, race creation, result tracking, analytics
- **6 Dashboard Widgets:** All functional and integrated
- **Database:** Fully migrated (12 migrations complete)
- **Tests:** 7/7 passing

### Known Limitations:
- Course database is empty (schema exists, not populated)
- Weather integration is basic (current conditions only)
- No training plans or structured workouts
- No ML-based predictions

### Code Quality:
- 0 TypeScript errors
- 30 ESLint warnings (mostly unused vars)
- Full type safety maintained
- RLS policies active on all tables

---

## 🔐 Security Notes

- All API keys in `.env.local` (never commit)
- Supabase RLS policies enforce user data isolation
- Strava tokens stored securely in database
- Input validation on all user-created content
- Rate limiting on API endpoints

---

## 🎨 Design System

### Colors (Primary):
- Primary: Blue (#3B82F6)
- Secondary: Purple (#8B5CF6)
- Accent: Orange (#F97316)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)

### Typography:
- Headings: Bold, white
- Body: Regular, white/70
- Labels: Medium, white/80
- Monospace: Font-mono (for times/numbers)

---

## 🚀 Deployment

**Current Deployment:** Not set up for production yet

**Recommended:**
- Frontend: Vercel or Netlify (Expo web build)
- Backend: Railway or Fly.io (Node.js server)
- Database: Supabase (already hosted)

---

## 📞 Key Contacts & Resources

- **Strava API Docs:** https://developers.strava.com/
- **Supabase Docs:** https://supabase.com/docs
- **Expo Docs:** https://docs.expo.dev/
- **RunSignup API:** https://runsignup.com/API

---

## ✅ Pre-Session Checklist for Claude Code

Before starting a new session, verify:

1. ✅ Both servers running (API on 3001, Expo on 8081)
2. ✅ `.env.local` exists with valid credentials
3. ✅ Database migrations up to date (12 total)
4. ✅ Node modules installed (`npm install`)
5. ✅ Tests passing (`npm test`)

---

## 🎬 Getting Started in New Session

**Quick Start Commands:**
```bash
# Check project status
git status
npm test

# Start development
cd server && node server.js &
npm start
```

**First Questions to Ask Claude Code:**
- "What's the current project status?"
- "Show me what was completed in Phase 2"
- "What are the priorities for Phase 3?"
- "Explain the [component/feature] implementation"

---

**Ready to continue? Ask Claude Code to help with Phase 3 planning or any other tasks!**
