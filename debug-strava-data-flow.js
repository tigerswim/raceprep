/**
 * Debug utility to investigate Strava data flow issues
 * Run this in the browser console when experiencing sync problems
 */

const debugStravaDataFlow = async () => {
  console.log('🔍 Starting Strava Data Flow Debug');
  console.log('======================================');

  try {
    // 1. Check if user is authenticated
    console.log('1. Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return;
    }

    console.log('✅ User authenticated:', {
      id: user.id,
      email: user.email
    });

    // 2. Check user profile for Strava tokens
    console.log('\n2. Checking Strava tokens in profile...');
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('strava_access_token, strava_refresh_token, strava_token_expires_at, strava_user_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError);
      return;
    }

    const hasTokens = !!profile.strava_access_token;
    const tokenExpired = profile.strava_token_expires_at ?
      new Date(profile.strava_token_expires_at) < new Date() : true;

    console.log('✅ Profile data:', {
      hasAccessToken: hasTokens,
      hasRefreshToken: !!profile.strava_refresh_token,
      tokenExpired: tokenExpired,
      stravaUserId: profile.strava_user_id,
      expiresAt: profile.strava_token_expires_at
    });

    // 3. Check training_sessions table structure
    console.log('\n3. Checking training_sessions table structure...');
    const { data: columns, error: structureError } = await supabase.rpc('get_table_columns', {
      table_name: 'training_sessions'
    });

    if (structureError) {
      console.log('⚠️ Could not check table structure (custom function may not exist)');
      console.log('Running manual structure check...');

      // Alternative: try to insert a test record to see what fails
      try {
        const testInsert = await supabase
          .from('training_sessions')
          .insert({
            user_id: user.id,
            type: 'test',
            date: '2024-01-01',
            strava_activity_id: 'test-debug-12345'
          })
          .select();

        if (testInsert.error) {
          console.log('⚠️ Test insert failed:', testInsert.error);
        } else {
          console.log('✅ Table structure seems OK, cleaning up test record...');
          await supabase
            .from('training_sessions')
            .delete()
            .eq('strava_activity_id', 'test-debug-12345');
        }
      } catch (e) {
        console.log('⚠️ Table structure test failed:', e);
      }
    }

    // 4. Check existing training sessions
    console.log('\n4. Checking existing training sessions...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (sessionsError) {
      console.error('❌ Sessions fetch failed:', sessionsError);
    } else {
      console.log('✅ Training sessions found:', {
        count: sessions.length,
        latestSession: sessions[0] || 'none',
        allSessions: sessions
      });
    }

    // 5. Test Strava API if tokens exist
    if (hasTokens && !tokenExpired) {
      console.log('\n5. Testing Strava API...');
      try {
        const response = await fetch(`http://localhost:3001/api/strava/activities?access_token=${profile.strava_access_token}&per_page=5`);
        const data = await response.json();

        if (response.ok) {
          console.log('✅ Strava API test successful:', {
            activityCount: data.length,
            sampleActivity: data[0] || 'none'
          });
        } else {
          console.error('❌ Strava API test failed:', data);
        }
      } catch (apiError) {
        console.error('❌ Strava API test error:', apiError);
      }
    } else {
      console.log('\n5. Skipping Strava API test (no valid tokens)');
    }

    // 6. Check RLS policies
    console.log('\n6. Testing Row Level Security...');
    try {
      // Test if we can read our own data
      const { data: rlsTest, error: rlsError } = await supabase
        .from('training_sessions')
        .select('count(*)')
        .eq('user_id', user.id);

      if (rlsError) {
        console.error('❌ RLS test failed:', rlsError);
      } else {
        console.log('✅ RLS test passed - user can read own data');
      }
    } catch (rlsTestError) {
      console.error('❌ RLS test error:', rlsTestError);
    }

    // 7. Summary and recommendations
    console.log('\n📋 SUMMARY & RECOMMENDATIONS');
    console.log('===============================');

    if (!hasTokens) {
      console.log('🔧 Need to connect Strava (no tokens found)');
    } else if (tokenExpired) {
      console.log('🔧 Strava tokens expired - need to refresh');
    } else if (sessions.length === 0) {
      console.log('🔧 Strava connected but no activities synced');
      console.log('   - Try manual sync from Training tab');
      console.log('   - Check if activities are swim/bike/run only');
      console.log('   - Verify database permissions');
    } else {
      console.log('✅ Everything looks good! Data should be visible.');
      console.log('   - If UI still not showing data, check component rendering');
      console.log('   - Check date filtering in UI components');
    }

  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
};

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  // Add to window for manual execution
  window.debugStravaDataFlow = debugStravaDataFlow;
  console.log('🛠️ Debug utility loaded! Run debugStravaDataFlow() in console to investigate.');
} else {
  console.log('🛠️ Debug utility ready for Node.js environment');
}

module.exports = { debugStravaDataFlow };