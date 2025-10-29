import React, { useEffect, useState, useRef } from 'react';
import { Provider } from 'react-redux';
import { router } from 'expo-router';
import { store } from '../src/store';
import { useConnectStravaMutation } from '../src/store/api';
import { dbHelpers, supabase } from '../src/services/supabase';
import { useAuth } from '../src/contexts/AuthContext';

function StravaCallbackContent() {
  const [connectStrava] = useConnectStravaMutation();
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing Strava authorization...');
  const hasRun = useRef(false);

  useEffect(() => {
    const handleStravaCallback = async () => {
      // Prevent duplicate execution
      if (hasRun.current) {
        console.log('[STRAVA_CALLBACK] Already processing, skipping...');
        return;
      }
      hasRun.current = true;

      // Additional safety check - if we're already showing an error, don't run again
      if (status === 'error') {
        console.log('[STRAVA_CALLBACK] Already in error state, skipping...');
        return;
      }

      // Debug the auth state
      console.log('[STRAVA_CALLBACK] Starting callback, user:', user);
      console.log('[STRAVA_CALLBACK] URL:', window.location.href);

      try {
        // Get authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Strava authorization failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received from Strava');
          return;
        }

        // Check for stored session data first before attempting Supabase call
        const storedUserId = sessionStorage.getItem('strava_auth_user_id');
        const storedTimestamp = sessionStorage.getItem('strava_auth_timestamp');
        console.log('[STRAVA_CALLBACK] Pre-check stored user ID:', storedUserId);

        let session = null;
        let sessionError = null;

        // If we have recent stored session data, use it immediately
        if (storedUserId && storedTimestamp) {
          const timestamp = parseInt(storedTimestamp);
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

          if (timestamp > fiveMinutesAgo) {
            console.log('[STRAVA_CALLBACK] Using stored session data immediately');
            session = { user: { id: storedUserId } } as any;
          }
        }

        // Only try Supabase if we don't have valid stored data
        if (!session) {
          console.log('[STRAVA_CALLBACK] No valid stored data, trying Supabase with short timeout...');

          try {
            // Create a much shorter timeout promise (2 seconds)
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Session fetch timeout')), 2000)
            );

          // Race the session fetch against the timeout
          const result = await Promise.race([
            supabase.auth.getSession(),
            timeoutPromise
          ]) as any;

          session = result.data?.session;
          sessionError = result.error;

            console.log('[STRAVA_CALLBACK] Supabase session check:', session?.user ? 'User found' : 'No user', sessionError);
          } catch (timeoutError) {
            console.error('[STRAVA_CALLBACK] Supabase session fetch timed out:', timeoutError);
            // Session will remain null, will be handled below
          }
        }

        // If we still don't have a session, redirect to login
        if (!session?.user) {
          console.log('[STRAVA_CALLBACK] No valid session found, redirecting to login');
          setStatus('error');
          setMessage('Please log in to RacePrep first, then try connecting Strava again.');
          setTimeout(() => {
            console.log('[STRAVA_CALLBACK] Redirecting to login...');
            window.location.href = '/';
          }, 3000);
          return;
        }

        const currentUser = session.user;
        console.log('[STRAVA_CALLBACK] Using user:', currentUser?.id);

        // Exchange authorization code for access token
        console.log('[STRAVA_CALLBACK] Exchanging code for token...', { code: code.substring(0, 10) + '...' });
        const tokenResponse = await connectStrava({ code }).unwrap();
        console.log('[STRAVA_CALLBACK] Token exchange successful:', {
          hasAccessToken: !!tokenResponse.access_token,
          hasRefreshToken: !!tokenResponse.refresh_token,
          athleteId: tokenResponse.athlete?.id
        });

        if (!tokenResponse.access_token) {
          setStatus('error');
          setMessage('Failed to get access token from Strava');
          return;
        }

        // Store Strava credentials in user profile with timeout and retry
        console.log('[STRAVA_CALLBACK] Updating user profile with Strava credentials...');

        const updateData = {
          strava_access_token: tokenResponse.access_token,
          strava_refresh_token: tokenResponse.refresh_token,
          strava_token_expires_at: new Date(tokenResponse.expires_at * 1000).toISOString(),
          strava_user_id: tokenResponse.athlete?.id?.toString()
        };

        let profileUpdateSuccess = false;
        let attempts = 0;
        const maxAttempts = 2;

        while (!profileUpdateSuccess && attempts < maxAttempts) {
          attempts++;
          console.log(`[STRAVA_CALLBACK] Profile update attempt ${attempts}/${maxAttempts}...`);

          try {
            const profileUpdatePromise = dbHelpers.users.updateProfile(currentUser.id, updateData);
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Profile update timeout (attempt ${attempts})`)), 8000)
            );

            await Promise.race([profileUpdatePromise, timeoutPromise]);
            profileUpdateSuccess = true;
            console.log('[STRAVA_CALLBACK] Profile updated successfully');
          } catch (error) {
            console.error(`[STRAVA_CALLBACK] Profile update attempt ${attempts} failed:`, error);
            if (attempts === maxAttempts) {
              throw error; // Re-throw after final attempt
            }
            // Wait 1 second before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // Get initial activities
        console.log('[STRAVA_CALLBACK] Fetching activities with token:', tokenResponse.access_token?.substring(0, 10) + '...');
        const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
        const activitiesUrl = `${apiBaseUrl}/strava/activities?access_token=${tokenResponse.access_token}&per_page=50`;
        console.log('[STRAVA_CALLBACK] Activities URL:', activitiesUrl);

        const activitiesResponse = await Promise.race([
          fetch(activitiesUrl),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Activities fetch timeout')), 10000)
          )
        ]) as Response;
        console.log('[STRAVA_CALLBACK] Activities response status:', activitiesResponse.status);

        const activitiesJsonPromise = activitiesResponse.json();
        const activitiesTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Activities JSON parsing timeout')), 5000)
        );

        const activities = await Promise.race([activitiesJsonPromise, activitiesTimeoutPromise]);
        console.log('[STRAVA_CALLBACK] Activities response:', activities);

        if (!activitiesResponse.ok) {
          throw new Error(`Failed to fetch activities: ${activities.error || activitiesResponse.status}`);
        }

        // Transform and store activities in database
        if (activities && activities.length > 0) {
          console.log('[STRAVA_CALLBACK] Processing', activities.length, 'activities from Strava');

          // Transform Strava activity format to match training_sessions table
          const transformedActivities = activities
            .filter((activity: any) => activity.id) // Ensure activity has an ID
            .map((activity: any) => {
              // Debug: Log the entire activity object for first few activities
              if (activities.indexOf(activity) < 3) {
                console.log('[STRAVA_CALLBACK] Activity debug:', {
                  id: activity.id,
                  name: activity.name,
                  type: activity.type,
                  sport_type: activity.sport_type,
                  date: activity.date,
                  distance: activity.distance,
                  moving_time: activity.moving_time,
                  allKeys: Object.keys(activity)
                });
              }

              // Use the correct field name from Strava API (either 'type' or 'sport_type')
              const stravaType = activity.type || activity.sport_type || '';
              const typeStr = stravaType.toLowerCase();

              console.log(`[STRAVA_CALLBACK] Processing activity ${activity.id}: stravaType="${stravaType}", typeStr="${typeStr}"`);

              // Map Strava activity types to our database schema (swim/bike/run only)
              // Note: Server already converts 'Ride' -> 'bike', 'Run' -> 'run', 'Swim' -> 'swim'
              let mappedType;
              if (typeStr === 'swim') {
                console.log('[STRAVA_CALLBACK] Mapped to: swim');
                mappedType = 'swim';
              } else if (typeStr === 'bike' || typeStr === 'ride' || typeStr === 'virtualride' || typeStr === 'ebikeride' || typeStr === 'mountainbikeride') {
                console.log('[STRAVA_CALLBACK] Mapped to: bike');
                mappedType = 'bike';
              } else if (typeStr === 'run' || typeStr === 'virtualrun') {
                console.log('[STRAVA_CALLBACK] Mapped to: run');
                mappedType = 'run';
              } else {
                // For any other activity types not supported in our schema, skip them
                console.log('[STRAVA_CALLBACK] Unmapped Strava activity type:', stravaType, '- skipping');
                return null;
              }

              const transformed = {
                strava_activity_id: activity.id?.toString(),
                date: activity.date, // Server already provides the correct date field
                type: mappedType,
                distance: activity.distance || null, // meters
                moving_time: activity.moving_time || null, // seconds
                name: activity.name || null, // activity title
                // Enhanced performance fields
                average_speed: activity.average_speed || null, // m/s
                total_elevation_gain: activity.total_elevation_gain || null, // meters
                average_heartrate: activity.average_heartrate || null, // bpm
                max_heartrate: activity.max_heartrate || null, // bpm
                average_watts: activity.average_watts || null, // watts (cycling)
                trainer: activity.trainer || false, // indoor trainer
                sport_type: activity.sport_type || null, // VirtualRun, TrailRun, etc.
                suffer_score: activity.suffer_score || null, // Strava training stress
                elapsed_time: activity.elapsed_time || null, // total elapsed time
                average_cadence: activity.average_cadence || null, // steps/min or rpm
                start_latlng: activity.start_latlng || null, // [lat, lng] coordinates
                kudos_count: activity.kudos_count || 0 // social engagement
              };

              console.log(`[STRAVA_CALLBACK] Transformed activity ${activity.id}:`, {
                id: transformed.strava_activity_id,
                type: transformed.type,
                name: transformed.name,
                date: transformed.date,
                distance: transformed.distance,
                moving_time: transformed.moving_time
              });

              return transformed;
            })
            .filter((activity: any) => activity !== null); // Remove null entries for unsupported types

          console.log('[STRAVA_CALLBACK] Final transformed activities count:', transformedActivities.length);

          if (transformedActivities.length === 0) {
            console.warn('[STRAVA_CALLBACK] No activities were transformed successfully - all may have been filtered out');
            setStatus('success');
            setMessage('Strava connected but no compatible activities found (swim/bike/run only).');
            return;
          }

          try {
            console.log('[STRAVA_CALLBACK] Attempting to insert', transformedActivities.length, 'activities to database');
            console.log('[STRAVA_CALLBACK] Sample activities:', transformedActivities.slice(0, 2)); // Log first 2 for debugging

            const bulkUpsertPromise = dbHelpers.trainingSessions.bulkUpsert(transformedActivities);
            const insertTimeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Database bulk insert timeout')), 15000)
            );

            const result = await Promise.race([bulkUpsertPromise, insertTimeoutPromise]);
            console.log('[STRAVA_CALLBACK] Database insert successful:', result);

            // Verify data was actually inserted
            const verifyResult = await dbHelpers.trainingSessions.getAll();
            console.log('[STRAVA_CALLBACK] Verification - total sessions in DB:', verifyResult.data?.length || 0);

            if (verifyResult.data && verifyResult.data.length > 0) {
              console.log('[STRAVA_CALLBACK] Sample inserted data:', verifyResult.data.slice(0, 2));
            } else {
              console.warn('[STRAVA_CALLBACK] Warning: No data found in database after insert');
            }

          } catch (insertError) {
            console.error('[STRAVA_CALLBACK] Database insert error:', insertError);
            console.error('[STRAVA_CALLBACK] Error details:', {
              message: insertError.message,
              code: insertError.code,
              details: insertError.details,
              hint: insertError.hint
            });
            throw insertError; // Re-throw to maintain existing error handling
          }
        } else {
          console.warn('[STRAVA_CALLBACK] No activities received from Strava API');
        }

        console.log('[STRAVA_CALLBACK] Setting success status...');
        setStatus('success');
        setMessage(`Successfully connected Strava! Imported ${activities?.length || 0} activities.`);

        // Clean up stored auth values
        console.log('[STRAVA_CALLBACK] Cleaning up stored auth values...');
        sessionStorage.removeItem('strava_auth_user_id');
        sessionStorage.removeItem('strava_auth_timestamp');

        // Redirect to training page after 3 seconds
        console.log('[STRAVA_CALLBACK] Setting up redirect to training page...');
        setTimeout(() => {
          console.log('[STRAVA_CALLBACK] Redirecting to training page...');
          router.replace('/(tabs)/training');
        }, 3000);

      } catch (error) {
        console.error('Strava callback error:', error);
        setStatus('error');
        setMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    handleStravaCallback();
  }, []); // Run once on mount

  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-purple-900/20"></div>
          <div className="absolute top-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-md w-full mx-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-xl text-center">
            {/* Logo/Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">RacePrep</h1>
              <p className="text-white/70">Connecting to Strava...</p>
            </div>

            {/* Status Icon */}
            <div className="mb-6">
              {status === 'processing' && (
                <div className="w-16 h-16 mx-auto border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              )}
              {status === 'success' && (
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl">✅</span>
                </div>
              )}
              {status === 'error' && (
                <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl">❌</span>
                </div>
              )}
            </div>

            {/* Status Message */}
            <div className="mb-6">
              <p className={`text-lg font-medium mb-2 ${
                status === 'success' ? 'text-green-400' :
                status === 'error' ? 'text-red-400' :
                'text-white'
              }`}>
                {status === 'processing' && 'Connecting to Strava...'}
                {status === 'success' && 'Successfully Connected!'}
                {status === 'error' && 'Connection Failed'}
              </p>
              <p className="text-white/70 text-sm">{message}</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {status === 'success' && (
                <p className="text-blue-400 text-sm">Redirecting to Training tab...</p>
              )}
              {status === 'error' && (
                <div className="space-y-3">
                  {message.includes('log in to RacePrep') ? (
                    <>
                      <button
                        onClick={() => router.replace('/(tabs)/')}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                      >
                        Go to Login
                      </button>
                      <p className="text-blue-400 text-sm">Redirecting to login in 5 seconds...</p>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => router.replace('/(tabs)/training')}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                      >
                        Go to Training
                      </button>
                      <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-white/10 text-white px-6 py-2 rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
                      >
                        Try Again
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-white/50">
                Having trouble? Make sure you&apos;re logged into Strava and try again.
              </p>
              <div className="flex items-center justify-center mt-3">
                <span className="text-xs text-white/30">Powered by Strava</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function StravaCallback() {
  return (
    <Provider store={store}>
      <StravaCallbackContent />
    </Provider>
  );
}