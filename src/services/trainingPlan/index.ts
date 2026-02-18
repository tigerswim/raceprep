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
