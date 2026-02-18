import { dbHelpers } from '../supabase';
import { logger } from '../../utils/logger';
import { rateLimiter } from './rateLimiter';
import { RunSignupAPIService } from './raceApi';

// Course Database API Integration
export class CourseAPIService {

  // Triathlon course database API integration
  static async syncTriathlonCourseData() {
    logger.debug('syncTriathlonCourseData() started');
    if (!rateLimiter.canMakeRequest('course_database', 500)) {
      throw new Error('Rate limit exceeded for Course Database API');
    }

    try {
      logger.debug('Rate limit passed, starting sync...');
      // Sample triathlon course data from various sources
      const sampleCourses = [
        {
          name: 'Ironman Louisville',
          location: 'Louisville, KY',
          distance_type: 'ironman',
          swim_type: 'river',
          bike_elevation_gain: 3200,
          run_elevation_gain: 400,
          overall_elevation: 3600,
          difficulty_score: 9,
          wetsuit_legal: true,
          description: 'Challenging Ironman course featuring a downstream/upstream Ohio River swim, rolling Kentucky countryside bike course, and multi-loop run through downtown Louisville.',
          website_url: 'https://www.ironman.com/louisville',
          features: ['river_swim', 'rolling_hills', 'urban_run', 'spectator_friendly']
        },
        {
          name: 'Escape from Alcatraz Triathlon',
          location: 'San Francisco, CA',
          distance_type: 'olympic',
          swim_type: 'ocean',
          bike_elevation_gain: 1800,
          run_elevation_gain: 900,
          overall_elevation: 2700,
          difficulty_score: 9,
          wetsuit_legal: true,
          description: 'Legendary triathlon featuring a frigid swim from Alcatraz Island, steep climbs through San Francisco hills, and challenging trail run.',
          website_url: 'https://www.escapefromalcatraztriathlon.com',
          features: ['cold_water_swim', 'steep_climbs', 'trail_run', 'iconic_course']
        },
        {
          name: 'ITU World Triathlon Championship',
          location: 'Yokohama, Japan',
          distance_type: 'olympic',
          swim_type: 'ocean',
          bike_elevation_gain: 800,
          run_elevation_gain: 200,
          overall_elevation: 1000,
          difficulty_score: 8,
          wetsuit_legal: false,
          description: 'Fast and technical Olympic distance course in Yokohama with non-wetsuit swim, technical bike course, and flat run.',
          features: ['non_wetsuit_swim', 'technical_bike', 'flat_run', 'draft_legal']
        },
        {
          name: 'Challenge Roth',
          location: 'Roth, Germany',
          distance_type: 'ironman',
          swim_type: 'lake',
          bike_elevation_gain: 3900,
          run_elevation_gain: 150,
          overall_elevation: 4050,
          difficulty_score: 9,
          wetsuit_legal: true,
          description: 'One of the most scenic Ironman-distance races with incredible spectator support, featuring rolling Bavarian countryside and the famous "Solar Hill".',
          features: ['lake_swim', 'rolling_hills', 'spectator_heavy', 'solar_hill']
        },
        {
          name: 'Wildflower Long Course',
          location: 'Lake San Antonio, CA',
          distance_type: '70.3',
          swim_type: 'lake',
          bike_elevation_gain: 2800,
          run_elevation_gain: 800,
          overall_elevation: 3600,
          difficulty_score: 9,
          wetsuit_legal: true,
          description: 'Brutal half-Ironman known as "The Beast" featuring massive climbs, challenging descents, and California heat.',
          features: ['reservoir_swim', 'massive_climbs', 'hot_weather', 'challenging_run']
        },
        {
          name: 'London Triathlon',
          location: 'London, UK',
          distance_type: 'olympic',
          swim_type: 'river',
          bike_elevation_gain: 200,
          run_elevation_gain: 50,
          overall_elevation: 250,
          difficulty_score: 7,
          wetsuit_legal: true,
          description: 'Urban triathlon through the heart of London with Thames river swim, closed-road cycling, and iconic landmarks on the run.',
          features: ['river_swim', 'urban_course', 'flat_profile', 'landmark_views']
        },
        {
          name: 'Ironman Hawaii Kona',
          location: 'Kailua-Kona, HI',
          distance_type: 'ironman',
          swim_type: 'ocean',
          bike_elevation_gain: 5200,
          run_elevation_gain: 800,
          overall_elevation: 6000,
          difficulty_score: 10,
          wetsuit_legal: false,
          description: 'The most legendary triathlon course in the world. Brutal heat, crosswinds, and lava fields make this the ultimate test.',
          features: ['ocean_swim', 'lava_fields', 'crosswinds', 'extreme_heat', 'world_championship']
        },
        {
          name: 'Eagleman 70.3',
          location: 'Cambridge, MD',
          distance_type: '70.3',
          swim_type: 'river',
          bike_elevation_gain: 400,
          run_elevation_gain: 100,
          overall_elevation: 500,
          difficulty_score: 6,
          wetsuit_legal: true,
          description: 'Fast and flat half-Ironman course perfect for personal bests, featuring Choptank River swim and pancake-flat bike and run.',
          features: ['river_swim', 'flat_fast', 'pr_course', 'beginner_friendly']
        },
        {
          name: 'St. George Ironman 70.3',
          location: 'St. George, UT',
          distance_type: '70.3',
          swim_type: 'reservoir',
          bike_elevation_gain: 2600,
          run_elevation_gain: 400,
          overall_elevation: 3000,
          difficulty_score: 8,
          wetsuit_legal: true,
          description: 'Challenging desert course with stunning red rock scenery, featuring Sand Hollow Reservoir swim and hilly terrain.',
          features: ['reservoir_swim', 'desert_course', 'red_rocks', 'hilly_terrain']
        },
        {
          name: 'IM 70.3 World Championship',
          location: 'Nice, France',
          distance_type: '70.3',
          swim_type: 'ocean',
          bike_elevation_gain: 1200,
          run_elevation_gain: 150,
          overall_elevation: 1350,
          difficulty_score: 8,
          wetsuit_legal: true,
          description: 'Prestigious world championship course along the French Riviera with Mediterranean swim and scenic coastal roads.',
          features: ['mediterranean_swim', 'coastal_roads', 'world_championship', 'scenic_course']
        }
      ];

      // Get existing courses to check for duplicates
      logger.debug('Getting existing courses...');
      const existingCoursesResult = await dbHelpers.courses.getAll();
      logger.debug('Existing courses result:', existingCoursesResult);
      const existingCourses = existingCoursesResult.data || [];
      logger.debug('Found', existingCourses.length, 'existing courses');

      let successCount = 0;
      let skippedCount = 0;

      for (const course of sampleCourses) {
        try {
          // Check if course already exists by name and location
          const isDuplicate = existingCourses.some(existing =>
            existing.name.toLowerCase() === course.name.toLowerCase() &&
            existing.location.toLowerCase() === course.location.toLowerCase()
          );

          if (isDuplicate) {
            logger.debug(`Skipping duplicate course: ${course.name}`);
            skippedCount++;
            continue;
          }

          const result = await dbHelpers.courses.create(course);
          if (result.data) {
            successCount++;
            logger.debug(`Added new course: ${course.name}`);
          } else if (result.error) {
            logger.error('Error inserting course:', result.error);
          }
        } catch (error) {
          logger.error('Error creating course:', error);
        }
      }

      return { success: true, count: successCount, skipped: skippedCount, total: sampleCourses.length };
    } catch (error) {
      logger.error('Course Database API sync failed:', error);
      throw error;
    }
  }

  // Strava Segments API integration (for course elevation profiles)
  static async syncStravaSegments() {
    if (!rateLimiter.canMakeRequest('strava', 100)) {
      throw new Error('Rate limit exceeded for Strava API');
    }

    try {
      // Sample Strava segment data that could be used to enhance course information
      const sampleSegments = [
        {
          name: 'Kona Queen K Highway',
          location: 'Kailua-Kona, HI',
          distance_type: 'ironman',
          swim_type: null,
          bike_elevation_gain: 2800,
          run_elevation_gain: null,
          overall_elevation: 2800,
          difficulty_score: 10,
          wetsuit_legal: null,
          description: 'The infamous bike segment from Ironman Hawaii featuring relentless headwinds and scorching heat across lava fields.',
          features: ['lava_fields', 'crosswinds', 'heat', 'iconic_segment']
        },
        {
          name: 'Wildflower Nasty Grade',
          location: 'Lake San Antonio, CA',
          distance_type: '70.3',
          swim_type: null,
          bike_elevation_gain: 1200,
          run_elevation_gain: null,
          overall_elevation: 1200,
          difficulty_score: 10,
          wetsuit_legal: null,
          description: 'Legendary climb at Wildflower with 18% gradients that breaks athletes every year.',
          features: ['steep_climb', 'legendary_difficulty', 'race_breaker']
        }
      ];

      // Get existing courses to check for duplicates
      logger.debug('Getting existing courses...');
      const existingCoursesResult = await dbHelpers.courses.getAll();
      logger.debug('Existing courses result:', existingCoursesResult);
      const existingCourses = existingCoursesResult.data || [];
      logger.debug('Found', existingCourses.length, 'existing courses');

      let successCount = 0;
      let skippedCount = 0;

      for (const segment of sampleSegments) {
        try {
          // Check if course already exists by name and location
          const isDuplicate = existingCourses.some(existing =>
            existing.name.toLowerCase() === segment.name.toLowerCase() &&
            existing.location.toLowerCase() === segment.location.toLowerCase()
          );

          if (isDuplicate) {
            logger.debug(`Skipping duplicate segment: ${segment.name}`);
            skippedCount++;
            continue;
          }

          const result = await dbHelpers.courses.create(segment);
          if (result.data) {
            successCount++;
            logger.debug(`Added new segment: ${segment.name}`);
          } else if (result.error) {
            logger.error('Error inserting segment course:', result.error);
          }
        } catch (error) {
          logger.error('Error creating segment course:', error);
        }
      }

      return { success: true, count: successCount, skipped: skippedCount, total: sampleSegments.length };
    } catch (error) {
      logger.error('Strava Segments API sync failed:', error);
      throw error;
    }
  }

  // Sync all course sources
  static async syncAllCourses() {
    logger.debug('CourseAPIService.syncAllCourses() started');
    const results = [];

    // Priority 1: RunSignup API
    try {
      logger.debug('Starting RunSignup sync...');
      const runSignupResult = await RunSignupAPIService.syncTriathlonRaces(25);
      logger.debug('RunSignup sync result:', runSignupResult);
      results.push(runSignupResult);
    } catch (error) {
      logger.error('RunSignup sync error:', error);
      results.push({ source: 'RunSignup', success: false, error: error.message });
    }

    // Priority 3: Strava Segments (requires OAuth token)
    try {
      // Note: Strava requires OAuth token - this would need to be handled in UI
      logger.debug('Strava sync skipped - requires OAuth token');
      results.push({ source: 'Strava Segments', success: false, error: 'OAuth token required' });
    } catch (error) {
      logger.error('Strava sync error:', error);
      results.push({ source: 'Strava Segments', success: false, error: error.message });
    }

    // Fallback: Mock data
    try {
      logger.debug('Starting syncTriathlonCourseData...');
      const courseResult = await this.syncTriathlonCourseData();
      logger.debug('syncTriathlonCourseData result:', courseResult);
      results.push({ source: 'Triathlon Database', ...courseResult });
    } catch (error) {
      logger.error('syncTriathlonCourseData error:', error);
      results.push({ source: 'Triathlon Database', success: false, error: error.message });
    }

    return results;
  }
}
