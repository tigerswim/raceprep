/**
 * Add Demo Race Results
 * Adds 2 past race results for the demo user to enable Compare feature
 *
 * Usage: node scripts/add-demo-race-results.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function getPastDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0]; // Return date-only format (YYYY-MM-DD)
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function addRaceResults() {
  console.log('🏁 Adding demo race results...\n');

  try {
    // Find demo user
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const demoUser = users.find(u => u.email === 'demo@raceprep.app');

    if (!demoUser) {
      console.error('❌ Demo user not found');
      process.exit(1);
    }

    const userId = demoUser.id;
    console.log(`Found user: ${userId}\n`);

    // Create 2 past races
    console.log('1️⃣  Creating past races...');
    const pastRaces = [
      {
        id: crypto.randomUUID(),
        external_id: `demo-past-race-1-${Date.now()}`,
        api_source: 'manual',
        name: 'Summer Sprint Triathlon',
        date: getPastDate(120),
        location: 'Atlanta, GA',
        city: 'Atlanta',
        state: 'GA',
        country: 'US',
        distance_type: 'sprint',
        difficulty: 'beginner',
        description: 'Fast and flat sprint race'
      },
      {
        id: crypto.randomUUID(),
        external_id: `demo-past-race-2-${Date.now()}`,
        api_source: 'manual',
        name: 'Fall Olympic Triathlon',
        date: getPastDate(60),
        location: 'Gainesville, GA',
        city: 'Gainesville',
        state: 'GA',
        country: 'US',
        distance_type: 'olympic',
        difficulty: 'intermediate',
        description: 'Lake Olympic distance race'
      }
    ];

    const { data: racesData, error: racesError } = await supabase
      .from('external_races')
      .insert(pastRaces)
      .select();

    if (racesError) throw racesError;
    console.log(`   ✅ Created ${pastRaces.length} past races\n`);

    // Create race results for these races
    console.log('2️⃣  Creating race results...');
    const results = [
      {
        user_id: userId,
        race_id: racesData[0].id,
        overall_time: formatTime(4200), // 1:10:00 (Sprint)
        swim_time: formatTime(720), // 12:00
        t1_time: formatTime(120), // 2:00
        bike_time: formatTime(1920), // 32:00
        t2_time: formatTime(90), // 1:30
        run_time: formatTime(1350), // 22:30
        overall_placement: 28,
        age_group_placement: 5,
        bib_number: '142'
      },
      {
        user_id: userId,
        race_id: racesData[1].id,
        overall_time: formatTime(9900), // 2:45:00 (Olympic)
        swim_time: formatTime(1800), // 30:00
        t1_time: formatTime(180), // 3:00
        bike_time: formatTime(4320), // 1:12:00
        t2_time: formatTime(120), // 2:00
        run_time: formatTime(3480), // 58:00
        overall_placement: 45,
        age_group_placement: 8,
        bib_number: '287'
      }
    ];

    const { error: resultsError } = await supabase
      .from('race_results')
      .insert(results);

    if (resultsError) throw resultsError;
    console.log(`   ✅ Created ${results.length} race results\n`);

    console.log('✅ Demo race results added!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🏊‍♂️ Sprint (4 months ago): 1:10:00 - 5th in AG');
    console.log('🚴‍♂️ Olympic (2 months ago): 2:45:00 - 8th in AG');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n✨ Compare button should now be enabled!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addRaceResults()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
