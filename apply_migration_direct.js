const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

async function applyMigration() {
  try {
    console.log('🚀 Applying Strava database migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/003_add_strava_integration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL:');
    console.log(migrationSQL);
    
    // We'll use the SQL editor endpoint to execute the migration
    // Note: This requires service role key for DDL operations
    console.log('🔧 To apply this migration:');
    console.log('1. Go to https://supabase.com/dashboard/project/jpimixridnqwnpjhwdja/sql');
    console.log('2. Copy and paste the migration SQL above');
    console.log('3. Click "Run" to execute the migration');
    console.log('4. Or add your service role key to .env.local as SUPABASE_SERVICE_KEY');
    
  } catch (error) {
    console.error('❌ Error reading migration:', error.message);
  }
}

applyMigration();