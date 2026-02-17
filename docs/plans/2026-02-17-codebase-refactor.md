# Codebase Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Clean up the RacePrep codebase (dead files, duplicate widgets, logging violations, mega-file splits) without changing any functionality or UI/UX.

**Architecture:** Bottom-up approach — lowest-risk changes first (delete orphan files, delete dead widget variants, replace console calls with logger), then structural improvements (split mega-files into domain modules with a barrel re-export to preserve all import paths).

**Tech Stack:** React Native, Expo, TypeScript, Supabase, Redux Toolkit, NativeWind

---

## Phase 1: Delete Orphan Stale Files

These are leftover backup/scratch files that are never imported anywhere and have no effect on the running app. Deleting them is zero-risk.

---

### Task 1: Delete backup and scratch files

**Files to delete:**
- `src/components/training/TrainingCalendar.tsx.backup`
- `src/components/training/WorkoutDetailModal.tsx.button`
- `src/components/training/WorkoutDetailModal.tsx.editfix`
- `src/components/training/WorkoutDetailModal.tsx.modal`
- `src/screens/Training/TrainingPlanSelectionScreen.tsx.backup`
- `src/services/trainingPlanService.ts.backup`

**Step 1: Verify none are imported anywhere**

```bash
grep -rn "\.backup\|\.button\|\.editfix\|\.modal" src/ --include="*.ts" --include="*.tsx"
```

Expected output: no results (these extensions are not importable by TypeScript/Metro).

**Step 2: Delete the files**

```bash
rm "src/components/training/TrainingCalendar.tsx.backup"
rm "src/components/training/WorkoutDetailModal.tsx.button"
rm "src/components/training/WorkoutDetailModal.tsx.editfix"
rm "src/components/training/WorkoutDetailModal.tsx.modal"
rm "src/screens/Training/TrainingPlanSelectionScreen.tsx.backup"
rm "src/services/trainingPlanService.ts.backup"
```

**Step 3: Verify app still starts**

```bash
npm run web
```

Expected: dev server starts, no errors about missing files.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete orphan backup and scratch files"
```

---

## Phase 2: Delete Dead Dashboard Widget Variants

The active widget chain is: `WebDashboard.tsx` → `[Widget].tsx` → `[Widget].terminal.tsx`.
The `.terminal.simple.tsx` and `.terminal.backup.tsx` variants are never imported anywhere.

---

### Task 2: Verify which widget files are dead

**Step 1: Confirm no imports of .simple or .backup widget variants**

```bash
grep -rn "terminal\.simple\|terminal\.backup" src/ --include="*.ts" --include="*.tsx"
```

Expected output: no results — confirming these are safe to delete.

**Step 2: List all dead widget files**

The files to delete are:
- `src/components/dashboard/GoalsProgressWidget.terminal.simple.tsx`
- `src/components/dashboard/GoalsProgressWidget.terminal.backup.tsx`
- `src/components/dashboard/PersonalBestsWidget.terminal.simple.tsx`
- `src/components/dashboard/PersonalBestsWidget.terminal.backup.tsx`
- `src/components/dashboard/TransitionAnalyticsWidget.terminal.simple.tsx`
- `src/components/dashboard/TransitionAnalyticsWidget.terminal.backup.tsx`
- `src/components/dashboard/UpcomingRacesWidget.terminal.simple.tsx`
- `src/components/dashboard/UpcomingRacesWidget.terminal.backup.tsx`
- `src/components/dashboard/WeatherWidget.terminal.simple.tsx`
- `src/components/dashboard/WeatherWidget.terminal.backup.tsx`

**Step 3: Delete all dead widget files**

```bash
rm src/components/dashboard/GoalsProgressWidget.terminal.simple.tsx
rm src/components/dashboard/GoalsProgressWidget.terminal.backup.tsx
rm src/components/dashboard/PersonalBestsWidget.terminal.simple.tsx
rm src/components/dashboard/PersonalBestsWidget.terminal.backup.tsx
rm src/components/dashboard/TransitionAnalyticsWidget.terminal.simple.tsx
rm src/components/dashboard/TransitionAnalyticsWidget.terminal.backup.tsx
rm src/components/dashboard/UpcomingRacesWidget.terminal.simple.tsx
rm src/components/dashboard/UpcomingRacesWidget.terminal.backup.tsx
rm src/components/dashboard/WeatherWidget.terminal.simple.tsx
rm src/components/dashboard/WeatherWidget.terminal.backup.tsx
```

**Step 4: Verify app still starts and dashboard renders**

```bash
npm run web
```

Navigate to the Dashboard tab in the browser. Confirm all 7 widgets render correctly.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: delete dead dashboard widget variants (.simple, .backup)"
```

---

## Phase 3: Replace console.* with logger in Active Source Files

The project has 323 `console.log/warn/error/debug` calls in active source files. These violate the logging policy (calls appear in production) and should use `src/utils/logger.ts`.

The logger API is: `logger.debug()`, `logger.info()`, `logger.warn()`, `logger.error()`

**Files to update (active files only — excludes already-deleted .backup/.simple files and test setup files):**

1. `src/services/supabase.ts`
2. `src/services/apiIntegrations.ts`
3. `src/services/trainingPlanService.ts`
4. `src/services/dashboardService.ts`
5. `src/services/auth.ts`
6. `src/services/enhanced/stravaApiService.ts`
7. `src/services/enhanced/goalsService.ts`
8. `src/services/enhanced/raceDataService.ts`
9. `src/services/shared/connectionPool.ts`
10. `src/services/shared/errorHandling.ts`
11. `src/services/shared/requestBatching.ts`
12. `src/services/shared/performanceMonitoring.ts`
13. `src/components/WebDashboard.tsx`
14. `src/components/dashboard/GoalsProgressWidget.terminal.tsx`
15. `src/components/dashboard/PersonalBestsWidget.terminal.tsx`
16. `src/components/dashboard/TransitionAnalyticsWidget.terminal.tsx`
17. `src/components/dashboard/UpcomingRacesWidget.terminal.tsx`
18. `src/components/dashboard/WeatherWidget.terminal.tsx`
19. `src/components/dashboard/PerformanceOverviewWidget.terminal.tsx`
20. `src/components/dashboard/TrainingPlanProgressWidget.terminal.tsx`
21. `src/components/AddResultModal.tsx`
22. `src/components/ImportedRaceUpdateModal.tsx`
23. `src/components/RaceSpecificPlanning.tsx`
24. `src/components/UserRaceFormModal.tsx`
25. `src/components/UserRaceManagement.tsx`
26. `src/components/training/TrainingCalendar.tsx`
27. `src/screens/Training/TrainingPlanSelectionScreen.tsx`
28. `src/app/strava-callback.tsx`
29. `src/data/sampleData.ts`
30. `src/utils/insertSampleRaces.ts`
31. `src/components/ErrorBoundary.tsx`

**Mapping rules:**
- `console.log(...)` → `logger.debug(...)`
- `console.warn(...)` → `logger.warn(...)`
- `console.error(...)` → `logger.error(...)`
- `console.debug(...)` → `logger.debug(...)`
- `console.info(...)` → `logger.info(...)`

**Note:** `src/utils/logger.ts` itself uses `console.*` internally — do NOT change that file.
**Note:** Files in `src/test/` are test infrastructure — do NOT change those files.
**Note:** `src/components/__tests__/` and `src/__tests__/` test files may use `console` — leave test files alone.

---

### Task 3: Update services/supabase.ts

**Step 1: Add logger import at the top of supabase.ts**

At line 1, add:
```typescript
import { logger } from '../utils/logger';
```

**Step 2: Replace all console calls in supabase.ts**

Use search-and-replace within the file. Every `console.log` → `logger.debug`, `console.warn` → `logger.warn`, `console.error` → `logger.error`.

**Step 3: Verify count dropped to zero for this file**

```bash
grep -n "console\." src/services/supabase.ts
```

Expected output: no results.

**Step 4: Check TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors introduced.

**Step 5: Commit**

```bash
git add src/services/supabase.ts
git commit -m "chore: replace console.* with logger in supabase.ts"
```

---

### Task 4: Update services/apiIntegrations.ts

**Step 1: Add logger import at the top of apiIntegrations.ts**

```typescript
import { logger } from '../utils/logger';
```

**Step 2: Replace all console calls in apiIntegrations.ts**

`console.log` → `logger.debug`, `console.warn` → `logger.warn`, `console.error` → `logger.error`

**Step 3: Verify**

```bash
grep -n "console\." src/services/apiIntegrations.ts
```

Expected: no results.

**Step 4: Commit**

```bash
git add src/services/apiIntegrations.ts
git commit -m "chore: replace console.* with logger in apiIntegrations.ts"
```

---

### Task 5: Update services/trainingPlanService.ts

**Step 1: Add logger import**

```typescript
import { logger } from '../utils/logger';
```

**Step 2: Replace all console calls**

**Step 3: Verify**

```bash
grep -n "console\." src/services/trainingPlanService.ts
```

Expected: no results.

**Step 4: Commit**

```bash
git add src/services/trainingPlanService.ts
git commit -m "chore: replace console.* with logger in trainingPlanService.ts"
```

---

### Task 6: Update remaining service files

Update these files in one commit, following the same pattern (add import, replace calls):

- `src/services/dashboardService.ts`
- `src/services/auth.ts`
- `src/services/enhanced/stravaApiService.ts`
- `src/services/enhanced/goalsService.ts`
- `src/services/enhanced/raceDataService.ts`
- `src/services/shared/connectionPool.ts`
- `src/services/shared/errorHandling.ts`
- `src/services/shared/requestBatching.ts`
- `src/services/shared/performanceMonitoring.ts`

Import path for enhanced/ and shared/ files is `'../../utils/logger'`.

**Step 1: Add logger import and replace console calls in each file**

For `src/services/dashboardService.ts` and `src/services/auth.ts`, the import is:
```typescript
import { logger } from '../utils/logger';
```

For `src/services/enhanced/*.ts` and `src/services/shared/*.ts`, the import is:
```typescript
import { logger } from '../../utils/logger';
```

**Step 2: Verify all service files are clean**

```bash
grep -rn "console\." src/services/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"
```

Expected: no results.

**Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

**Step 4: Commit**

```bash
git add src/services/
git commit -m "chore: replace console.* with logger in all service files"
```

---

### Task 7: Update component and screen files

Update these files in one commit:

- `src/components/WebDashboard.tsx` — import from `'../utils/logger'`
- `src/components/dashboard/GoalsProgressWidget.terminal.tsx` — import from `'../../utils/logger'`
- `src/components/dashboard/PersonalBestsWidget.terminal.tsx` — import from `'../../utils/logger'`
- `src/components/dashboard/TransitionAnalyticsWidget.terminal.tsx` — import from `'../../utils/logger'`
- `src/components/dashboard/UpcomingRacesWidget.terminal.tsx` — import from `'../../utils/logger'`
- `src/components/dashboard/WeatherWidget.terminal.tsx` — import from `'../../utils/logger'`
- `src/components/dashboard/PerformanceOverviewWidget.terminal.tsx` — import from `'../../utils/logger'`
- `src/components/dashboard/TrainingPlanProgressWidget.terminal.tsx` — import from `'../../utils/logger'`
- `src/components/AddResultModal.tsx` — import from `'../utils/logger'`
- `src/components/ImportedRaceUpdateModal.tsx` — import from `'../utils/logger'`
- `src/components/RaceSpecificPlanning.tsx` — import from `'../utils/logger'`
- `src/components/UserRaceFormModal.tsx` — import from `'../utils/logger'`
- `src/components/UserRaceManagement.tsx` — import from `'../utils/logger'`
- `src/components/ErrorBoundary.tsx` — import from `'../utils/logger'`
- `src/components/training/TrainingCalendar.tsx` — import from `'../../utils/logger'`
- `src/screens/Training/TrainingPlanSelectionScreen.tsx` — import from `'../../utils/logger'`
- `src/app/strava-callback.tsx` — import from `'../utils/logger'`
- `src/data/sampleData.ts` — import from `'../utils/logger'`
- `src/utils/insertSampleRaces.ts` — import from `'./logger'`

**Step 1: Add logger import and replace console calls in each file**

**Step 2: Verify no console calls remain in active source**

```bash
grep -rn "console\." src/ --include="*.ts" --include="*.tsx" \
  | grep -v "src/utils/logger.ts" \
  | grep -v "src/test/" \
  | grep -v "__tests__"
```

Expected: no results.

**Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

**Step 4: Start app and verify no runtime errors**

```bash
npm run web
```

Open the dashboard in the browser and navigate through tabs. Verify no white screens or JS errors in the browser console.

**Step 5: Commit**

```bash
git add src/components/ src/screens/ src/app/ src/data/ src/utils/insertSampleRaces.ts
git commit -m "chore: replace console.* with logger in components, screens, and app files"
```

---

## Phase 4: Split Mega-Files Into Domain Modules

Each mega-file is split into smaller focused files. A barrel index re-exports everything so **no import path in the rest of the codebase changes**. The existing file itself becomes the barrel.

---

### Task 8: Split supabase.ts

`src/services/supabase.ts` (2,727 lines) contains: client setup, authHelpers, and dbHelpers with these domains: users, races, raceResults, courses, nutritionPlans, packingLists, externalRaces, trainingEvents, gearProducts, trainingArticles, userLocations, userGoals, userSettings, userPlannedRaces, rssFeeds, trainingSessions, userRaces, cache.

**Target structure:**

```
src/services/supabase/
├── client.ts          # supabase client creation only
├── auth.ts            # authHelpers
├── users.ts           # dbHelpers.users
├── races.ts           # dbHelpers.races + dbHelpers.raceResults + dbHelpers.userRaces + dbHelpers.externalRaces
├── courses.ts         # dbHelpers.courses
├── goals.ts           # dbHelpers.userGoals + dbHelpers.userSettings + dbHelpers.userPlannedRaces
├── training.ts        # dbHelpers.trainingSessions + dbHelpers.trainingEvents
├── nutrition.ts       # dbHelpers.nutritionPlans + dbHelpers.packingLists
├── discover.ts        # dbHelpers.gearProducts + dbHelpers.trainingArticles + dbHelpers.rssFeeds
├── locations.ts       # dbHelpers.userLocations
├── cache.ts           # dbHelpers.cache
└── index.ts           # barrel: re-exports supabase, authHelpers, dbHelpers identically
```

**Step 1: Create the supabase/ directory**

```bash
mkdir -p src/services/supabase
```

**Step 2: Create src/services/supabase/client.ts**

Move the client creation code (lines 1–43 of current supabase.ts, excluding the console.log calls which were already replaced with logger in Phase 3). Content:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';
import { logger } from '../../utils/logger';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

logger.debug('[SUPABASE] Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined',
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'unknown'
});

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('[SUPABASE] Missing environment variables!', {
    EXPO_PUBLIC_SUPABASE_URL: supabaseUrl,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '[PRESENT]' : '[MISSING]'
  });
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-client-info': 'raceprep-web@1.0.0',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

**Step 3: Create each domain file**

Read the relevant lines from the original `src/services/supabase.ts` and place each section into its corresponding domain file. Each file imports `{ supabase }` from `./client` and `{ logger }` from `../../utils/logger`.

Example pattern for `src/services/supabase/auth.ts`:
```typescript
import { supabase } from './client';

export const authHelpers = {
  // ... paste authHelpers content from original file
};
```

Example pattern for `src/services/supabase/races.ts`:
```typescript
import { supabase } from './client';
import { logger } from '../../utils/logger';

export const racesHelpers = {
  races: { /* ... paste dbHelpers.races content */ },
  raceResults: { /* ... paste dbHelpers.raceResults content */ },
  userRaces: { /* ... paste dbHelpers.userRaces content */ },
  externalRaces: { /* ... paste dbHelpers.externalRaces content */ },
};
```

Repeat for all domain files.

**Step 4: Create src/services/supabase/index.ts (the barrel)**

This file must export `supabase`, `authHelpers`, and `dbHelpers` identically to the original file so all 18 existing import sites work without any changes:

```typescript
import { supabase } from './client';
import { authHelpers } from './auth';
import { usersHelpers } from './users';
import { racesHelpers } from './races';
import { coursesHelpers } from './courses';
import { goalsHelpers } from './goals';
import { trainingHelpers } from './training';
import { nutritionHelpers } from './nutrition';
import { discoverHelpers } from './discover';
import { locationsHelpers } from './locations';
import { cacheHelpers } from './cache';

export { supabase, authHelpers };

export const dbHelpers = {
  users: usersHelpers.users,
  races: racesHelpers.races,
  raceResults: racesHelpers.raceResults,
  userRaces: racesHelpers.userRaces,
  externalRaces: racesHelpers.externalRaces,
  courses: coursesHelpers.courses,
  userGoals: goalsHelpers.userGoals,
  userSettings: goalsHelpers.userSettings,
  userPlannedRaces: goalsHelpers.userPlannedRaces,
  trainingSessions: trainingHelpers.trainingSessions,
  trainingEvents: trainingHelpers.trainingEvents,
  nutritionPlans: nutritionHelpers.nutritionPlans,
  packingLists: nutritionHelpers.packingLists,
  gearProducts: discoverHelpers.gearProducts,
  trainingArticles: discoverHelpers.trainingArticles,
  rssFeeds: discoverHelpers.rssFeeds,
  userLocations: locationsHelpers.userLocations,
  cache: cacheHelpers.cache,
};
```

**Step 5: Replace src/services/supabase.ts with a re-export**

After creating the barrel at `src/services/supabase/index.ts`, replace the content of `src/services/supabase.ts` with:

```typescript
// Re-export from modular structure — see src/services/supabase/
export { supabase, authHelpers, dbHelpers } from './supabase/index';
```

This preserves all existing import paths (`from '../services/supabase'`) without any changes.

**Step 6: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

**Step 7: Verify app loads**

```bash
npm run web
```

Navigate to Dashboard, Races, Training, Planning tabs. Verify all data loads correctly.

**Step 8: Commit**

```bash
git add src/services/supabase.ts src/services/supabase/
git commit -m "refactor: split supabase.ts into domain modules (preserves all import paths)"
```

---

### Task 9: Split apiIntegrations.ts

`src/services/apiIntegrations.ts` (2,039 lines) contains: `RateLimiter` class, and 13 service classes: `RaceAPIService`, `RunSignupAPIService`, `StravaTrainingAPIService`, `StravaSegmentsAPIService`, `GoogleMapsAPIService`, `OpenWeatherMapAPIService`, `CourseAPIService`, `TrainingEventsService`, `GearProductsService`, `RSSFeedService`, `GeolocationService`, `TrainingDataSyncService`, `DiscoverSyncService`, `TrainingPerformanceService`.

Currently only `OpenWeatherMapAPIService` is imported anywhere (in `WeatherWidget.terminal.tsx`).

**Target structure:**

```
src/services/apiIntegrations/
├── rateLimiter.ts        # RateLimiter class (internal)
├── raceApi.ts            # RaceAPIService, RunSignupAPIService
├── stravaApi.ts          # StravaTrainingAPIService, StravaSegmentsAPIService
├── mapsApi.ts            # GoogleMapsAPIService, GeolocationService
├── weatherApi.ts         # OpenWeatherMapAPIService
├── courseApi.ts          # CourseAPIService
├── trainingApi.ts        # TrainingEventsService, TrainingDataSyncService, TrainingPerformanceService
├── discoverApi.ts        # GearProductsService, RSSFeedService, DiscoverSyncService
└── index.ts              # barrel: re-exports all classes
```

**Step 1: Create the directory**

```bash
mkdir -p src/services/apiIntegrations
```

**Step 2: Create rateLimiter.ts**

```typescript
// Internal rate limiting helper — not exported from barrel
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  canMakeRequest(service: string, limit: number): boolean {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const requests = this.requests.get(service) || [];
    const recentRequests = requests.filter(time => now - time < hour);
    this.requests.set(service, recentRequests);
    if (recentRequests.length >= limit) return false;
    recentRequests.push(now);
    this.requests.set(service, recentRequests);
    return true;
  }
}

export const rateLimiter = new RateLimiter();
```

**Step 3: Create each API file**

Each file imports `{ rateLimiter }` from `./rateLimiter`, `{ dbHelpers }` from `'../supabase'`, and `{ logger }` from `'../../utils/logger'` where needed.

Cut the relevant class(es) from `apiIntegrations.ts` and paste into the corresponding file.

**Step 4: Create src/services/apiIntegrations/index.ts (barrel)**

```typescript
export { RaceAPIService } from './raceApi';
export { RunSignupAPIService } from './raceApi';
export { StravaTrainingAPIService } from './stravaApi';
export { StravaSegmentsAPIService } from './stravaApi';
export { GoogleMapsAPIService } from './mapsApi';
export { GeolocationService } from './mapsApi';
export { OpenWeatherMapAPIService } from './weatherApi';
export { CourseAPIService } from './courseApi';
export { TrainingEventsService } from './trainingApi';
export { TrainingDataSyncService } from './trainingApi';
export { TrainingPerformanceService } from './trainingApi';
export { GearProductsService } from './discoverApi';
export { RSSFeedService } from './discoverApi';
export { DiscoverSyncService } from './discoverApi';
```

**Step 5: Replace src/services/apiIntegrations.ts with a re-export**

```typescript
// Re-export from modular structure — see src/services/apiIntegrations/
export {
  RaceAPIService,
  RunSignupAPIService,
  StravaTrainingAPIService,
  StravaSegmentsAPIService,
  GoogleMapsAPIService,
  GeolocationService,
  OpenWeatherMapAPIService,
  CourseAPIService,
  TrainingEventsService,
  TrainingDataSyncService,
  TrainingPerformanceService,
  GearProductsService,
  RSSFeedService,
  DiscoverSyncService,
} from './apiIntegrations/index';
```

**Step 6: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

**Step 7: Verify WeatherWidget still works**

```bash
npm run web
```

Navigate to Dashboard. Confirm the WeatherWidget renders without errors.

**Step 8: Commit**

```bash
git add src/services/apiIntegrations.ts src/services/apiIntegrations/
git commit -m "refactor: split apiIntegrations.ts into domain modules (preserves all import paths)"
```

---

### Task 10: Split trainingPlanService.ts

`src/services/trainingPlanService.ts` (1,099 lines) exports a single `trainingPlanService` object with methods grouped into: templates, user plans, scheduled workouts, workout completions, progress/analytics, date utilities, and Strava matching.

**Target structure:**

```
src/services/trainingPlan/
├── templates.ts       # getTrainingPlanTemplates, getTrainingPlanTemplate, getTemplateWorkouts
├── userPlans.ts       # getUserTrainingPlans, getUserTrainingPlan, createUserTrainingPlan, updateUserTrainingPlan, deleteUserTrainingPlan, getActivePlan
├── workouts.ts        # getScheduledWorkouts, getUpcomingWorkouts, getTodaysWorkouts
├── completions.ts     # completeWorkout, skipWorkout, updateWorkoutCompletion, deleteWorkoutCompletion, getWorkoutCompletions
├── analytics.ts       # getTrainingPlanProgress, getWeeklySchedule, calculateAdherenceRate
├── dateUtils.ts       # calculateWeekDates, isWorkoutOverdue, isToday
├── stravaMatch.ts     # matchStravaToWorkout, findStravaMatches, calculateMatchScore, acceptStravaMatch
└── index.ts           # barrel: re-exports as trainingPlanService object
```

**Step 1: Create the directory**

```bash
mkdir -p src/services/trainingPlan
```

**Step 2: Create each module file**

Each file imports `{ supabase }` from `'../supabase'` and types from `'../../types/trainingPlans'`. Add `{ logger }` from `'../../utils/logger'` where logger calls exist.

Example for `src/services/trainingPlan/templates.ts`:
```typescript
import { supabase } from '../supabase';
import { logger } from '../../utils/logger';
import type { TrainingPlanTemplateFilters } from '../../types/trainingPlans';

export const templates = {
  getTrainingPlanTemplates: async (filters?: TrainingPlanTemplateFilters) => {
    // ... paste from original
  },
  getTrainingPlanTemplate: async (templateId: string) => {
    // ... paste from original
  },
  getTemplateWorkouts: async (templateId: string, weekNumber?: number) => {
    // ... paste from original
  },
};
```

Repeat for each module.

**Step 3: Create src/services/trainingPlan/index.ts (barrel)**

```typescript
import { templates } from './templates';
import { userPlans } from './userPlans';
import { workouts } from './workouts';
import { completions } from './completions';
import { analytics } from './analytics';
import { dateUtils } from './dateUtils';
import { stravaMatch } from './stravaMatch';

export const trainingPlanService = {
  ...templates,
  ...userPlans,
  ...workouts,
  ...completions,
  ...analytics,
  ...dateUtils,
  ...stravaMatch,
};
```

**Step 4: Replace src/services/trainingPlanService.ts with a re-export**

```typescript
// Re-export from modular structure — see src/services/trainingPlan/
export { trainingPlanService } from './trainingPlan/index';
```

**Step 5: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

**Step 6: Run existing tests**

```bash
npm test -- --testPathPattern="trainingPlanService" --no-coverage
```

Expected: all tests pass (same as before refactor).

**Step 7: Verify app**

```bash
npm run web
```

Navigate to Training tab. Confirm training plans load, calendar shows, workouts display.

**Step 8: Commit**

```bash
git add src/services/trainingPlanService.ts src/services/trainingPlan/
git commit -m "refactor: split trainingPlanService.ts into domain modules (preserves all import paths)"
```

---

## Phase 5: Final Verification

### Task 11: Full verification pass

**Step 1: Run full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors (or same count as before refactor — no regressions).

**Step 2: Run all tests**

```bash
npm test --no-coverage
```

Expected: all tests pass.

**Step 3: Run lint**

```bash
npm run lint
```

Expected: 0 errors (warnings are acceptable if pre-existing).

**Step 4: Manual smoke test**

Start the web app:
```bash
npm run web
```

Check each tab:
- **Dashboard** — all 7 widgets render with data
- **Races** — race list loads, modals open/close
- **Training** — training plans load, calendar shows workouts
- **Planning** — race planning, nutrition, packing list work
- **Profile** — user settings load

**Step 5: Verify no console.* remain in active source**

```bash
grep -rn "console\." src/ --include="*.ts" --include="*.tsx" \
  | grep -v "src/utils/logger.ts" \
  | grep -v "src/test/" \
  | grep -v "__tests__"
```

Expected: no results.

**Step 6: Final commit**

```bash
git add -A
git commit -m "chore: final verification — refactor complete"
```

---

## Summary

| Phase | Tasks | Changes | Risk |
|-------|-------|---------|------|
| 1: Stale files | Task 1 | Delete 6 orphan files | Zero |
| 2: Dead widgets | Task 2 | Delete 10 dead widget files | Zero |
| 3: Logging | Tasks 3–7 | 323 console.* → logger | Very low |
| 4: Mega-files | Tasks 8–10 | Split 3 files into modules, barrel re-exports | Low |
| 5: Verification | Task 11 | TypeScript + tests + manual QA | — |

**No import paths in the rest of the codebase change.** All mega-file splits use barrel re-exports that preserve the original module path.
