// Barrel file — assembles modular domain helpers into the same exports as the
// original src/services/supabase.ts so all existing import paths continue to work.

import { supabase } from './client';
import { authHelpers } from './auth';
import { usersHelpers } from './users';
import { racesHelpers, setDbHelpersRef as setRacesRef } from './races';
import { coursesHelpers } from './courses';
import { goalsHelpers } from './goals';
import { trainingHelpers, setDbHelpersRef as setTrainingRef } from './training';
import { nutritionHelpers } from './nutrition';
import { discoverHelpers } from './discover';
import { locationsHelpers } from './locations';
import { cacheHelpers, setDbHelpersRef as setCacheRef } from './cache';

export { supabase, authHelpers };

export const dbHelpers = {
  users: usersHelpers.users,
  races: racesHelpers.races,
  raceResults: racesHelpers.raceResults,
  courses: coursesHelpers.courses,
  nutritionPlans: nutritionHelpers.nutritionPlans,
  packingLists: nutritionHelpers.packingLists,
  externalRaces: discoverHelpers.externalRaces,
  trainingEvents: discoverHelpers.trainingEvents,
  gearProducts: discoverHelpers.gearProducts,
  trainingArticles: discoverHelpers.trainingArticles,
  userLocations: locationsHelpers.userLocations,
  userGoals: goalsHelpers.userGoals,
  userSettings: goalsHelpers.userSettings,
  userPlannedRaces: goalsHelpers.userPlannedRaces,
  rssFeeds: discoverHelpers.rssFeeds,
  trainingSessions: trainingHelpers.trainingSessions,
  userRaces: racesHelpers.userRaces,
  cache: cacheHelpers.cache,
};

// Inject the assembled dbHelpers reference into domain modules that need
// cross-domain or self-referencing access at runtime.
setRacesRef(dbHelpers);
setTrainingRef(dbHelpers);
setCacheRef(dbHelpers);

// Start auto-cleanup when the service is loaded
if (typeof window !== 'undefined') {
  dbHelpers.cache.startAutoCleanup();
}

export default supabase;
