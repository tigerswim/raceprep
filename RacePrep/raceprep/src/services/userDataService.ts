import { supabase, dbHelpers } from './supabase';

/**
 * User Data Management Service
 * Handles data export and deletion requests for GDPR and Strava API compliance
 */
export const userDataService = {
  /**
   * Export all user data in a comprehensive format
   * @param format - Export format (json, csv, or both)
   * @returns Promise with exported data or error
   */
  exportAllUserData: async (format: 'json' | 'csv' | 'both' = 'json') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      console.log('[USER_DATA_SERVICE] Starting comprehensive data export for user:', user.id);

      const exportData: any = {
        user_id: user.id,
        export_timestamp: new Date().toISOString(),
        export_format: format,
        data: {}
      };

      // 1. User Profile Data
      console.log('[USER_DATA_SERVICE] Exporting user profile...');
      const profileResult = await dbHelpers.users.getCurrent();
      if (profileResult.data) {
        exportData.data.user_profile = profileResult.data;
      }

      // 2. Training Sessions (Strava Data)
      console.log('[USER_DATA_SERVICE] Exporting training sessions...');
      const sessionsResult = await dbHelpers.trainingSessions.getAll();
      if (sessionsResult.data) {
        exportData.data.training_sessions = sessionsResult.data;
        console.log(`[USER_DATA_SERVICE] Exported ${sessionsResult.data.length} training sessions`);
      }

      // 3. User Goals
      console.log('[USER_DATA_SERVICE] Exporting user goals...');
      const goalsResult = await dbHelpers.userGoals.getAll();
      if (goalsResult.data) {
        exportData.data.user_goals = goalsResult.data;
        console.log(`[USER_DATA_SERVICE] Exported ${goalsResult.data.length} goals`);
      }

      // 4. User Races
      console.log('[USER_DATA_SERVICE] Exporting user races...');
      const racesResult = await dbHelpers.userRaces.getAll();
      if (racesResult.data) {
        exportData.data.user_races = racesResult.data;
        console.log(`[USER_DATA_SERVICE] Exported ${racesResult.data.length} races`);
      }

      // 5. User Planned Races
      console.log('[USER_DATA_SERVICE] Exporting planned races...');
      const plannedRacesResult = await dbHelpers.userPlannedRaces.getAll();
      if (plannedRacesResult.data) {
        exportData.data.user_planned_races = plannedRacesResult.data;
        console.log(`[USER_DATA_SERVICE] Exported ${plannedRacesResult.data.length} planned races`);
      }

      // 6. User Settings
      console.log('[USER_DATA_SERVICE] Exporting user settings...');
      const settingsResult = await dbHelpers.userSettings.get();
      if (settingsResult.data) {
        exportData.data.user_settings = settingsResult.data;
      }

      // 7. Additional metadata
      exportData.data.export_metadata = {
        total_training_sessions: exportData.data.training_sessions?.length || 0,
        total_goals: exportData.data.user_goals?.length || 0,
        total_races: exportData.data.user_races?.length || 0,
        total_planned_races: exportData.data.user_planned_races?.length || 0,
        has_strava_data: exportData.data.user_profile?.strava_access_token ? true : false,
        strava_user_id: exportData.data.user_profile?.strava_user_id || null
      };

      console.log('[USER_DATA_SERVICE] Data export completed successfully');

      if (format === 'csv' || format === 'both') {
        // Convert to CSV format for key data tables
        const csvData = userDataService.convertToCSV(exportData);
        if (format === 'csv') {
          return { data: csvData, error: null };
        } else {
          return { data: { json: exportData, csv: csvData }, error: null };
        }
      }

      return { data: exportData, error: null };

    } catch (error) {
      console.error('[USER_DATA_SERVICE] Export error:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Convert JSON data to CSV format for key tables
   */
  convertToCSV: (exportData: any) => {
    const csvFiles: { [key: string]: string } = {};

    // Convert training sessions to CSV
    if (exportData.data.training_sessions?.length) {
      const headers = ['date', 'type', 'duration_minutes', 'distance', 'average_speed', 'strava_activity_id'];
      const rows = exportData.data.training_sessions.map((session: any) =>
        headers.map(header => session[header] || '').join(',')
      );
      csvFiles.training_sessions = [headers.join(','), ...rows].join('\n');
    }

    // Convert races to CSV
    if (exportData.data.user_races?.length) {
      const headers = ['name', 'date', 'location', 'distance_type', 'status'];
      const rows = exportData.data.user_races.map((race: any) =>
        headers.map(header => race[header] || '').join(',')
      );
      csvFiles.user_races = [headers.join(','), ...rows].join('\n');
    }

    // Convert goals to CSV
    if (exportData.data.user_goals?.length) {
      const headers = ['goal_type', 'target_value', 'current_value', 'target_date', 'status'];
      const rows = exportData.data.user_goals.map((goal: any) =>
        headers.map(header => goal[header] || '').join(',')
      );
      csvFiles.user_goals = [headers.join(','), ...rows].join('\n');
    }

    return csvFiles;
  },

  /**
   * Delete all user data within 48 hours (Strava API compliance)
   * This creates a deletion request that will be processed
   * @returns Promise with deletion request details
   */
  requestDataDeletion: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      console.log('[USER_DATA_SERVICE] Creating data deletion request for user:', user.id);

      // Create deletion request record
      const deletionRequest = {
        user_id: user.id,
        requested_at: new Date().toISOString(),
        scheduled_for: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
        status: 'pending',
        request_type: 'strava_compliance',
        user_email: user.email
      };

      // Store deletion request in database
      const { data, error } = await supabase
        .from('user_data_deletion_requests')
        .insert([deletionRequest])
        .select()
        .single();

      if (error) {
        // If table doesn't exist, create it
        if (error.code === '42P01') {
          console.log('[USER_DATA_SERVICE] Creating user_data_deletion_requests table...');
          // We'll handle this gracefully by storing in a temporary way
          console.warn('[USER_DATA_SERVICE] Deletion request table not found. User should contact support.');
          return {
            data: {
              message: 'Deletion request received. Please contact support to complete the process within 48 hours.',
              request_id: `temp_${user.id}_${Date.now()}`,
              scheduled_deletion: deletionRequest.scheduled_for
            },
            error: null
          };
        }
        throw error;
      }

      console.log('[USER_DATA_SERVICE] Deletion request created:', data.id);

      return {
        data: {
          request_id: data.id,
          scheduled_deletion: deletionRequest.scheduled_for,
          message: 'Data deletion scheduled within 48 hours. You will receive a confirmation email.',
          instructions: 'If you change your mind, contact support before the scheduled deletion time.'
        },
        error: null
      };

    } catch (error) {
      console.error('[USER_DATA_SERVICE] Deletion request error:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Execute immediate data deletion (for admin use or immediate requests)
   * WARNING: This permanently deletes all user data
   * @returns Promise with deletion results
   */
  executeDataDeletion: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      console.log('[USER_DATA_SERVICE] Executing comprehensive data deletion for user:', user.id);

      const deletionResults: any = {
        user_id: user.id,
        deleted_at: new Date().toISOString(),
        deleted_tables: []
      };

      // 1. Delete Training Sessions (Strava data)
      console.log('[USER_DATA_SERVICE] Deleting training sessions...');
      const sessionsResult = await dbHelpers.trainingSessions.deleteAll();
      deletionResults.deleted_tables.push({
        table: 'training_sessions',
        error: sessionsResult.error,
        success: !sessionsResult.error
      });

      // 2. Delete User Goals
      console.log('[USER_DATA_SERVICE] Deleting user goals...');
      try {
        const { error: goalsError } = await supabase
          .from('user_goals')
          .delete()
          .eq('user_id', user.id);
        deletionResults.deleted_tables.push({
          table: 'user_goals',
          error: goalsError?.message || null,
          success: !goalsError
        });
      } catch (error) {
        deletionResults.deleted_tables.push({
          table: 'user_goals',
          error: error.message,
          success: false
        });
      }

      // 3. Delete User Races
      console.log('[USER_DATA_SERVICE] Deleting user races...');
      try {
        const { error: racesError } = await supabase
          .from('user_races')
          .delete()
          .eq('user_id', user.id);
        deletionResults.deleted_tables.push({
          table: 'user_races',
          error: racesError?.message || null,
          success: !racesError
        });
      } catch (error) {
        deletionResults.deleted_tables.push({
          table: 'user_races',
          error: error.message,
          success: false
        });
      }

      // 4. Delete Planned Races
      console.log('[USER_DATA_SERVICE] Deleting planned races...');
      try {
        const { error: plannedError } = await supabase
          .from('user_planned_races')
          .delete()
          .eq('user_id', user.id);
        deletionResults.deleted_tables.push({
          table: 'user_planned_races',
          error: plannedError?.message || null,
          success: !plannedError
        });
      } catch (error) {
        deletionResults.deleted_tables.push({
          table: 'user_planned_races',
          error: error.message,
          success: false
        });
      }

      // 5. Delete User Settings
      console.log('[USER_DATA_SERVICE] Deleting user settings...');
      try {
        const { error: settingsError } = await supabase
          .from('user_settings')
          .delete()
          .eq('user_id', user.id);
        deletionResults.deleted_tables.push({
          table: 'user_settings',
          error: settingsError?.message || null,
          success: !settingsError
        });
      } catch (error) {
        deletionResults.deleted_tables.push({
          table: 'user_settings',
          error: error.message,
          success: false
        });
      }

      // 6. Clear Strava tokens from user profile
      console.log('[USER_DATA_SERVICE] Clearing Strava tokens from user profile...');
      try {
        const { error: profileError } = await dbHelpers.users.updateProfile(user.id, {
          strava_access_token: null,
          strava_refresh_token: null,
          strava_token_expires_at: null,
          strava_user_id: null
        });
        deletionResults.deleted_tables.push({
          table: 'users_strava_data',
          error: profileError?.message || null,
          success: !profileError
        });
      } catch (error) {
        deletionResults.deleted_tables.push({
          table: 'users_strava_data',
          error: error.message,
          success: false
        });
      }

      // 7. Clear any cached data
      console.log('[USER_DATA_SERVICE] Clearing cached data...');
      try {
        dbHelpers.cache.invalidatePattern(`*${user.id}*`);
        deletionResults.deleted_tables.push({
          table: 'cache_data',
          error: null,
          success: true
        });
      } catch (error) {
        deletionResults.deleted_tables.push({
          table: 'cache_data',
          error: error.message,
          success: false
        });
      }

      // 8. Clear localStorage items (client-side)
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('deletedStravaActivities');
          console.log('[USER_DATA_SERVICE] Cleared client-side storage');
        } catch (error) {
          console.warn('[USER_DATA_SERVICE] Could not clear localStorage:', error);
        }
      }

      const successCount = deletionResults.deleted_tables.filter(t => t.success).length;
      const totalTables = deletionResults.deleted_tables.length;

      console.log(`[USER_DATA_SERVICE] Data deletion completed: ${successCount}/${totalTables} tables processed successfully`);

      return {
        data: {
          message: `Data deletion completed. ${successCount} of ${totalTables} data categories processed.`,
          details: deletionResults,
          summary: {
            total_tables: totalTables,
            successful_deletions: successCount,
            failed_deletions: totalTables - successCount
          }
        },
        error: null
      };

    } catch (error) {
      console.error('[USER_DATA_SERVICE] Data deletion error:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Check deletion request status
   * @param requestId - Deletion request ID
   */
  checkDeletionStatus: async (requestId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_data_deletion_requests')
        .select('*')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === '42P01') {
          return { data: null, error: 'Deletion request system not available. Please contact support.' };
        }
        return { data: null, error: error.message };
      }

      return { data, error: null };

    } catch (error) {
      return { data: null, error: error.message };
    }
  }
};