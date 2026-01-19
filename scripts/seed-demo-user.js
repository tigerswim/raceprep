/**
 * Demo User Seed Script
 * Creates "John Doe" test user with complete data for all dashboard widgets
 *
 * Features:
 * - Auto-updating training data (4 weeks past + 8 weeks future)
 * - Run anytime to refresh demo data - dates are always current!
 * - Creates ~120 training sessions with realistic triathlon patterns
 * - Includes race results, goals, planned races, and user settings
 *
 * Usage: node scripts/seed-demo-user.js
 *
 * Requirements:
 * - EXPO_PUBLIC_SUPABASE_URL in .env.local
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local
 * - SUPABASE_SERVICE_ROLE_KEY in .env.local (for user creation)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configuration
const DEMO_USER = {
  email: 'demo@raceprep.app',
  password: 'RacePrep2024!',
  name: 'John Doe',
  age_group: '35-39',
  gender: 'M',
  experience_level: 'intermediate',
  location: 'Atlanta, GA'
};

// Initialize Supabase clients
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  console.error('This key is required to bypass RLS policies.');
  console.error('Add SUPABASE_SERVICE_ROLE_KEY to .env.local');
  process.exit(1);
}

// Use service role key for all operations (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper functions
function generateUUID() {
  return crypto.randomUUID();
}

function getRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0]; // Return date-only format (YYYY-MM-DD)
}

function getFutureDate(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Main seed function
async function seedDemoUser() {
  console.log('🌱 Starting demo user seed...\n');

  let userId;

  // Step 1: Create auth user
  console.log('1️⃣  Creating auth user...');
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: DEMO_USER.email,
      password: DEMO_USER.password,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        console.log('   ℹ️  User already exists, fetching existing user...');
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === DEMO_USER.email);
        if (existingUser) {
          userId = existingUser.id;
          console.log(`   ✅ Found existing user: ${userId}`);
        } else {
          throw new Error('User exists but could not be found');
        }
      } else {
        throw authError;
      }
    } else {
      userId = authData.user.id;
      console.log(`   ✅ Auth user created: ${userId}`);
    }
  } catch (error) {
    // If we already handled the "user exists" case, userId should be set
    if (!userId) {
      console.error('   ❌ Error creating auth user:', error.message);
      process.exit(1);
    }
  }

  console.log('');

  // Step 2: Create user profile
  console.log('2️⃣  Creating user profile...');
  try {
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        age_group: DEMO_USER.age_group,
        gender: DEMO_USER.gender,
        experience_level: DEMO_USER.experience_level,
        location: DEMO_USER.location
      });

    if (profileError) throw profileError;
    console.log('   ✅ User profile created');
  } catch (error) {
    console.error('   ❌ Error creating profile:', error.message);
  }

  console.log('');

  // Step 3: Create training sessions (rolling 12-week window: 4 weeks past + 8 weeks future)
  //
  // AUTO-UPDATING TRAINING DATA:
  // This generates training sessions dynamically based on the current date.
  // - Past 4 weeks: Shows training history for analytics and trends
  // - Future 8 weeks: Shows upcoming workouts and training plan
  // - Total: ~120 sessions (10 sessions/week × 12 weeks)
  //
  // Run this script anytime to refresh demo data - it will automatically
  // generate fresh dates relative to today, so the demo never goes stale!
  console.log('3️⃣  Creating training sessions...');
  try {
    // First, delete any existing training sessions for this user
    const { error: deleteError } = await supabase
      .from('training_sessions')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.log('   ⚠️  Could not clear old sessions:', deleteError.message);
    } else {
      console.log('   🗑️  Cleared existing training sessions');
    }

    const sessions = [];

    // Generate training for a rolling 12-week window (4 past + 8 future)
    // This keeps demo data current without needing manual updates
    // Week structure: Mon-swim/run, Tue-bike, Wed-swim/run, Thu-bike, Fri-swim/run, Sat-bike/run, Sun-rest
    const PAST_WEEKS = 4;
    const FUTURE_WEEKS = 8;
    const TOTAL_WEEKS = PAST_WEEKS + FUTURE_WEEKS;

    for (let week = 0; week < TOTAL_WEEKS; week++) {
      // Calculate days offset from today (negative = past, positive = future)
      const weeksFromToday = week - PAST_WEEKS;
      const weekStartDaysOffset = weeksFromToday * 7;

      // Helper to get date for this week
      const getWeekDate = (dayOffset) => {
        if (weekStartDaysOffset + dayOffset < 0) {
          return getRandomDate(Math.abs(weekStartDaysOffset + dayOffset));
        } else {
          return getFutureDate(weekStartDaysOffset + dayOffset);
        }
      };

      // Monday (swim + run)
      sessions.push({
        user_id: userId,
        type: 'swim',
        date: getWeekDate(0), // Monday
        name: week % 3 === 0 ? 'Interval Training' : 'Endurance Swim',
        distance: Math.round(2000 + Math.random() * 1000),
        moving_time: Math.round(2400 + Math.random() * 600),
        average_speed: Math.round((1.2 + Math.random() * 0.3) * 100) / 100,
        average_heartrate: Math.round(140 + Math.random() * 15)
      });
      sessions.push({
        user_id: userId,
        type: 'run',
        date: getWeekDate(0),
        name: 'Easy Run',
        distance: Math.round(8000 + Math.random() * 4000),
        moving_time: Math.round(2700 + Math.random() * 900),
        average_speed: Math.round((10 + Math.random() * 2) * 100) / 100,
        total_elevation_gain: Math.round(50 + Math.random() * 100),
        average_heartrate: Math.round(145 + Math.random() * 15),
        average_cadence: Math.round(170 + Math.random() * 10)
      });

      // Tuesday (bike)
      sessions.push({
        user_id: userId,
        type: 'bike',
        date: getWeekDate(1),
        name: 'Tempo Ride',
        distance: Math.round(40000 + Math.random() * 20000),
        moving_time: Math.round(5400 + Math.random() * 1800),
        average_speed: Math.round((25 + Math.random() * 5) * 100) / 100,
        total_elevation_gain: Math.round(200 + Math.random() * 300),
        average_heartrate: Math.round(145 + Math.random() * 20),
        average_watts: Math.round(180 + Math.random() * 40),
        average_cadence: Math.round(85 + Math.random() * 10),
        trainer: true
      });

      // Wednesday (swim + run)
      sessions.push({
        user_id: userId,
        type: 'swim',
        date: getWeekDate(2),
        name: 'Drill Session',
        distance: Math.round(2500 + Math.random() * 500),
        moving_time: Math.round(2700 + Math.random() * 300),
        average_speed: Math.round((1.3 + Math.random() * 0.2) * 100) / 100,
        average_heartrate: Math.round(135 + Math.random() * 10)
      });
      sessions.push({
        user_id: userId,
        type: 'run',
        date: getWeekDate(2),
        name: week % 2 === 0 ? 'Interval Run' : 'Tempo Run',
        distance: Math.round(8000 + Math.random() * 3000),
        moving_time: Math.round(2400 + Math.random() * 600),
        average_speed: Math.round((11 + Math.random() * 2) * 100) / 100,
        total_elevation_gain: Math.round(30 + Math.random() * 70),
        average_heartrate: Math.round(155 + Math.random() * 15),
        average_cadence: Math.round(175 + Math.random() * 10)
      });

      // Thursday (bike)
      sessions.push({
        user_id: userId,
        type: 'bike',
        date: getWeekDate(3),
        name: 'Endurance Ride',
        distance: Math.round(50000 + Math.random() * 20000),
        moving_time: Math.round(6000 + Math.random() * 1800),
        average_speed: Math.round((26 + Math.random() * 4) * 100) / 100,
        total_elevation_gain: Math.round(300 + Math.random() * 200),
        average_heartrate: Math.round(140 + Math.random() * 15),
        average_watts: Math.round(170 + Math.random() * 30),
        average_cadence: Math.round(88 + Math.random() * 8),
        trainer: false
      });

      // Friday (swim + run)
      sessions.push({
        user_id: userId,
        type: 'swim',
        date: getWeekDate(4),
        name: 'Open Water Prep',
        distance: Math.round(2000 + Math.random() * 800),
        moving_time: Math.round(2400 + Math.random() * 400),
        average_speed: Math.round((1.25 + Math.random() * 0.25) * 100) / 100,
        average_heartrate: Math.round(140 + Math.random() * 12)
      });
      sessions.push({
        user_id: userId,
        type: 'run',
        date: getWeekDate(4),
        name: 'Recovery Run',
        distance: Math.round(6000 + Math.random() * 2000),
        moving_time: Math.round(2100 + Math.random() * 600),
        average_speed: Math.round((9.5 + Math.random() * 1.5) * 100) / 100,
        total_elevation_gain: Math.round(20 + Math.random() * 40),
        average_heartrate: Math.round(135 + Math.random() * 10),
        average_cadence: Math.round(168 + Math.random() * 8)
      });

      // Saturday (long bike + long run - brick day)
      sessions.push({
        user_id: userId,
        type: 'bike',
        date: getWeekDate(5),
        name: 'Long Ride',
        distance: Math.round(80000 + Math.random() * 40000),
        moving_time: Math.round(10800 + Math.random() * 3600),
        average_speed: Math.round((24 + Math.random() * 4) * 100) / 100,
        total_elevation_gain: Math.round(800 + Math.random() * 400),
        average_heartrate: Math.round(138 + Math.random() * 12),
        average_watts: Math.round(165 + Math.random() * 25),
        average_cadence: Math.round(85 + Math.random() * 8),
        trainer: false
      });
      sessions.push({
        user_id: userId,
        type: 'run',
        date: getWeekDate(5),
        name: 'Long Run',
        distance: Math.round(15000 + Math.random() * 5000),
        moving_time: Math.round(5400 + Math.random() * 1800),
        average_speed: Math.round((9.8 + Math.random() * 1.2) * 100) / 100,
        total_elevation_gain: Math.round(100 + Math.random() * 150),
        average_heartrate: Math.round(148 + Math.random() * 12),
        average_cadence: Math.round(172 + Math.random() * 8)
      });

      // Sunday is rest day - no sessions
    }

    const { error: sessionsError } = await supabase
      .from('training_sessions')
      .insert(sessions);

    if (sessionsError) throw sessionsError;
    console.log(`   ✅ Created ${sessions.length} training sessions (${PAST_WEEKS} weeks past + ${FUTURE_WEEKS} weeks future)`);
  } catch (error) {
    console.error('   ❌ Error creating training sessions:', error.message);
  }

  console.log('');

  // Step 4: Create user goals
  console.log('4️⃣  Creating user goals...');
  try {
    const goals = [
      {
        user_id: userId,
        goal_type: 'race_count',
        target_value: '3',
        current_value: '1',
        target_date: getFutureDate(180),
        achieved: false
      },
      {
        user_id: userId,
        goal_type: 'time_target',
        target_value: '2:30:00', // Olympic distance target
        current_value: '2:45:00',
        target_date: getFutureDate(90),
        achieved: false
      },
      {
        user_id: userId,
        goal_type: 'transition_time',
        target_value: '120', // 2 minutes
        current_value: '150',
        target_date: getFutureDate(60),
        achieved: false
      }
    ];

    const { error: goalsError } = await supabase
      .from('user_goals')
      .insert(goals);

    if (goalsError) throw goalsError;
    console.log(`   ✅ Created ${goals.length} goals`);
  } catch (error) {
    console.error('   ❌ Error creating goals:', error.message);
  }

  console.log('');

  // Step 5: Create external races (using external_races table)
  console.log('5️⃣  Creating external races...');
  try {
    const externalRaces = [
      {
        id: generateUUID(),
        external_id: `demo-race-1-${Date.now()}`,
        api_source: 'manual',
        name: 'Spring Lake Olympic Triathlon',
        date: getFutureDate(45),
        location: 'Gainesville, GA',
        city: 'Gainesville',
        state: 'GA',
        country: 'US',
        distance_type: 'olympic',
        difficulty: 'intermediate',
        description: 'Beautiful lake Olympic distance race',
        registration_url: 'https://example.com/register'
      },
      {
        id: generateUUID(),
        external_id: `demo-race-2-${Date.now()}`,
        api_source: 'manual',
        name: 'Georgia Sprint Championship',
        date: getFutureDate(90),
        location: 'Pine Mountain, GA',
        city: 'Pine Mountain',
        state: 'GA',
        country: 'US',
        distance_type: 'sprint',
        difficulty: 'beginner',
        description: 'Fast and flat sprint triathlon',
        registration_url: 'https://example.com/register'
      },
      {
        id: generateUUID(),
        external_id: `demo-race-3-${Date.now()}`,
        api_source: 'manual',
        name: 'Gulf Coast 70.3',
        date: getFutureDate(150),
        location: 'Panama City Beach, FL',
        city: 'Panama City Beach',
        state: 'FL',
        country: 'US',
        distance_type: '70.3',
        difficulty: 'advanced',
        description: 'Scenic beachside half iron distance',
        registration_url: 'https://example.com/register'
      }
    ];

    const { data: racesData, error: racesError } = await supabase
      .from('external_races')
      .upsert(externalRaces)
      .select();

    if (racesError) throw racesError;
    console.log(`   ✅ Created ${externalRaces.length} external races`);

    // Step 6: Create user planned races
    if (racesData && racesData.length > 0) {
      console.log('');
      console.log('6️⃣  Creating user planned races...');
      try {
        const plannedRaces = [
          {
            user_id: userId,
            external_race_id: racesData[0].id,
            status: 'registered',
            goal_time: '02:35:00',
            priority: 1
          },
          {
            user_id: userId,
            external_race_id: racesData[1].id,
            status: 'interested',
            goal_time: '01:15:00',
            priority: 2
          },
          {
            user_id: userId,
            external_race_id: racesData[2].id,
            status: 'training',
            goal_time: '05:30:00',
            priority: 1
          }
        ];

        const { error: plannedError } = await supabase
          .from('user_planned_races')
          .insert(plannedRaces);

        if (plannedError) throw plannedError;
        console.log(`   ✅ Created ${plannedRaces.length} planned race(s)`);
      } catch (error) {
        console.error('   ❌ Error creating planned races:', error.message);
      }
    }
  } catch (error) {
    console.error('   ❌ Error creating external races:', error.message);
  }

  console.log('');

  // Step 7: Create user settings
  console.log('7️⃣  Creating user settings...');
  try {
    const settings = {
      user_id: userId,
      distance_units: 'imperial',
      temperature_units: 'fahrenheit',
      notifications_race_reminders: true,
      notifications_training_updates: true,
      notifications_performance_insights: true,
      years_racing: 5
    };

    const { error: settingsError } = await supabase
      .from('user_settings')
      .upsert(settings);

    if (settingsError) throw settingsError;
    console.log('   ✅ Created user settings');
  } catch (error) {
    console.error('   ❌ Error creating user settings:', error.message);
  }

  console.log('');
  console.log('✅ Demo user seed complete!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📧 Email:    ' + DEMO_USER.email);
  console.log('🔑 Password: ' + DEMO_USER.password);
  console.log('🆔 User ID:  ' + userId);
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n💡 Share these credentials to demo RacePrep!\n');
}

// Run the seed
seedDemoUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
