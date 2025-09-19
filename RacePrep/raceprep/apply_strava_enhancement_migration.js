// Apply the Strava enhancement migration manually
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // We need this for admin operations

// Use anon key if service role key is not available
const supabaseKey = supabaseServiceRoleKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('🚀 Applying Strava enhancement migration...');

    // Read the migration file
    const migrationSQL = fs.readFileSync('./supabase/migrations/004_enhance_strava_fields.sql', 'utf8');

    console.log('📄 Migration SQL loaded');
    console.log('🔧 Executing migration...');

    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration applied successfully!');
    console.log('📊 New fields added to training_sessions table:');
    console.log('   - name (activity title)');
    console.log('   - average_speed (m/s)');
    console.log('   - total_elevation_gain (meters)');
    console.log('   - average_heartrate (bpm)');
    console.log('   - max_heartrate (bpm)');
    console.log('   - average_watts (watts)');
    console.log('   - trainer (boolean)');
    console.log('   - sport_type (VirtualRun, etc.)');
    console.log('   - suffer_score (training stress)');
    console.log('   - elapsed_time (total time)');
    console.log('   - average_cadence (steps/min or rpm)');
    console.log('   - start_latlng (coordinates)');
    console.log('   - kudos_count (social engagement)');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

applyMigration();