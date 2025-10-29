const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

async function applyRLSFix() {
  try {
    console.log('🔒 Applying RLS Policy Fix for external_races table...');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'fix-external-races-rls.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL:');
    console.log('═'.repeat(80));
    console.log(migrationSQL);
    console.log('═'.repeat(80));

    console.log('\n🔧 To apply this RLS fix:');
    console.log('1. Go to https://supabase.com/dashboard/project/jpimixridnqwnpjhwdja/sql');
    console.log('2. Copy and paste the migration SQL above');
    console.log('3. Click "Run" to execute the migration');
    console.log('\nThis will fix the RLS policy error preventing race saves:');
    console.log('  • Adds INSERT policy for external_races table');
    console.log('  • Allows public INSERT operations for race discovery');
    console.log('  • Maintains existing SELECT policy for public reading');

  } catch (error) {
    console.error('❌ Error reading migration:', error.message);
  }
}

applyRLSFix();