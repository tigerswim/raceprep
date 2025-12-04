/**
 * Demo User Seed Script
 * Creates "John Doe" test user with complete data for all dashboard widgets
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
  return date.toISOString();
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

  // Step 3: Create training sessions (last 60 days)
  console.log('3️⃣  Creating training sessions...');
  try {
    const sessions = [];

    // Generate 60 days of varied training
    for (let i = 0; i < 60; i++) {
      const dayOfWeek = (new Date().getDay() - i + 7) % 7;

      // Rest days (Sundays and occasional Wednesdays)
      if (dayOfWeek === 0 || (dayOfWeek === 3 && Math.random() > 0.5)) {
        continue;
      }

      // Swim sessions (Mon, Wed, Fri)
      if ([1, 3, 5].includes(dayOfWeek)) {
        sessions.push({
          user_id: userId,
          type: 'swim',
          date: getRandomDate(i),
          name: i % 10 === 0 ? 'Interval Training' : 'Endurance Swim',
          distance: Math.round(2000 + Math.random() * 1000), // 2-3km
          moving_time: Math.round(2400 + Math.random() * 600), // 40-50 min
          average_speed: Math.round((1.2 + Math.random() * 0.3) * 100) / 100,
          average_heartrate: Math.round(140 + Math.random() * 15)
        });
      }

      // Bike sessions (Tue, Thu, Sat)
      if ([2, 4, 6].includes(dayOfWeek)) {
        const isLongRide = dayOfWeek === 6;
        sessions.push({
          user_id: userId,
          type: 'bike',
          date: getRandomDate(i),
          name: isLongRide ? 'Long Ride' : (i % 7 === 0 ? 'Tempo Ride' : 'Endurance Ride'),
          distance: Math.round(isLongRide ? 80000 + Math.random() * 40000 : 40000 + Math.random() * 20000), // 40-60km or 80-120km
          moving_time: Math.round(isLongRide ? 10800 + Math.random() * 3600 : 5400 + Math.random() * 1800), // 90-120min or 180-240min
          average_speed: Math.round((25 + Math.random() * 5) * 100) / 100, // km/h
          total_elevation_gain: Math.round(isLongRide ? 800 + Math.random() * 400 : 200 + Math.random() * 300),
          average_heartrate: Math.round(145 + Math.random() * 20),
          average_watts: Math.round(180 + Math.random() * 40),
          average_cadence: Math.round(85 + Math.random() * 10),
          trainer: dayOfWeek === 2 // Indoor on Tuesdays
        });
      }

      // Run sessions (Mon, Wed, Fri, Sat)
      if ([1, 3, 5, 6].includes(dayOfWeek)) {
        const isLongRun = dayOfWeek === 6;
        sessions.push({
          user_id: userId,
          type: 'run',
          date: getRandomDate(i),
          name: isLongRun ? 'Long Run' : (i % 6 === 0 ? 'Interval Run' : 'Easy Run'),
          distance: Math.round(isLongRun ? 15000 + Math.random() * 5000 : 8000 + Math.random() * 4000), // 8-12km or 15-20km
          moving_time: Math.round(isLongRun ? 5400 + Math.random() * 1800 : 2700 + Math.random() * 900), // 45-60min or 90-120min
          average_speed: Math.round((10 + Math.random() * 2) * 100) / 100, // km/h (5:00-6:00 min/km pace)
          total_elevation_gain: Math.round(50 + Math.random() * 150),
          average_heartrate: Math.round(150 + Math.random() * 20),
          average_cadence: Math.round(170 + Math.random() * 15)
        });
      }
    }

    const { error: sessionsError } = await supabase
      .from('training_sessions')
      .insert(sessions);

    if (sessionsError) throw sessionsError;
    console.log(`   ✅ Created ${sessions.length} training sessions`);
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
