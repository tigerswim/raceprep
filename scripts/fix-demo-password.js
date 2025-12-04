/**
 * Fix Demo User Password
 * Updates the demo@raceprep.app user's password without sending email
 *
 * Usage: node scripts/fix-demo-password.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDemoPassword() {
  console.log('🔧 Fixing demo user password...\n');

  try {
    // Find the demo user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) throw listError;

    const demoUser = users.find(u => u.email === 'demo@raceprep.app');

    if (!demoUser) {
      console.error('❌ Demo user not found');
      console.log('Please run: node scripts/seed-demo-user.js');
      process.exit(1);
    }

    console.log(`Found user: ${demoUser.id}`);
    console.log(`Email: ${demoUser.email}`);
    console.log(`Email confirmed: ${demoUser.email_confirmed_at ? '✅' : '❌'}\n`);

    // Update password without sending email
    const { data, error } = await supabase.auth.admin.updateUserById(
      demoUser.id,
      {
        password: 'RacePrep2024!',
        email_confirm: true  // Ensure email is confirmed
      }
    );

    if (error) throw error;

    console.log('✅ Password updated successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📧 Email:    demo@raceprep.app');
    console.log('🔑 Password: RacePrep2024!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n✨ User can now log in!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixDemoPassword()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
