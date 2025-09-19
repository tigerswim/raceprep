const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

async function applyTriathlonMigration() {
  try {
    console.log('🏊‍♂️🚴‍♂️🏃‍♂️ Applying Triathlon Fields Migration...');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'add-triathlon-fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL:');
    console.log('═'.repeat(80));
    console.log(migrationSQL);
    console.log('═'.repeat(80));

    console.log('\n🔧 To apply this migration:');
    console.log('1. Go to https://supabase.com/dashboard/project/jpimixridnqwnpjhwdja/sql');
    console.log('2. Copy and paste the migration SQL above');
    console.log('3. Click "Run" to execute the migration');
    console.log('\nThis will add the following triathlon-specific fields to external_races:');
    console.log('  • swim_type, swim_distance_meters');
    console.log('  • bike_distance_meters, bike_elevation_gain');
    console.log('  • run_distance_meters');
    console.log('  • wetsuit_legal, difficulty_score');
    console.log('  • wave_start, qualifying_race');
    console.log('  • course_description, transition_area');
    console.log('  • age_group_categories, awards_info');
    console.log('  • course_records, weather_conditions');
    console.log('  • water_temperature_avg, draft_legal');

  } catch (error) {
    console.error('❌ Error reading migration:', error.message);
  }
}

applyTriathlonMigration();