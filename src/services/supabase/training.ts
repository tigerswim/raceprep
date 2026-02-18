import { supabase } from './client';
import { logger } from '../../utils/logger';

// Late-binding reference to dbHelpers (set from index.ts after assembly)
// eslint-disable-next-line prefer-const
let dbHelpers: any = null;
export const setDbHelpersRef = (ref: any) => { dbHelpers = ref; };

export const trainingHelpers = {
  // Training events
  trainingEvents: {
    // Get all training events
    getAll: async () => {
      const { data, error } = await supabase
        .from('training_events')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      return { data, error };
    },

    // Get events by location
    getByLocation: async (city: string, state: string) => {
      const { data, error } = await supabase
        .from('training_events')
        .select('*')
        .or(`city.ilike.%${city}%,state.ilike.%${state}%`)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      return { data, error };
    },

    // Get events by type
    getByEventType: async (eventType: string) => {
      const { data, error } = await supabase
        .from('training_events')
        .select('*')
        .eq('event_type', eventType)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      return { data, error };
    },

    // Get upcoming events
    getUpcoming: async () => {
      const { data, error } = await supabase
        .from('training_events')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(10);
      return { data, error };
    },

    // Create new training event
    create: async (eventData: any) => {
      const { data, error } = await supabase
        .from('training_events')
        .insert(eventData)
        .select()
        .single();
      return { data, error };
    },
  },

  // Enhanced Training sessions with performance analytics
  trainingSessions: {
    // Get user's training sessions
    getAll: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      return { data, error };
    },

    // Get sessions with performance trends
    getWithTrends: async (limit: number = 50) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      try {
        const { data, error } = await supabase
          .from('training_sessions')
          .select(`
            *,
            (select avg(average_speed) from training_sessions ts2
             where ts2.user_id = training_sessions.user_id
             and ts2.type = training_sessions.type
             and ts2.date < training_sessions.date) as previous_avg_speed
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(limit);

        if (data) {
          // Calculate performance trends
          const sessionsWithTrends = data.map(session => ({
            ...session,
            speedImprovement: session.average_speed && session.previous_avg_speed
              ? ((session.average_speed - session.previous_avg_speed) / session.previous_avg_speed) * 100
              : null,
            paceImprovement: session.average_speed && session.previous_avg_speed && session.type === 'run'
              ? dbHelpers.trainingSessions.calculatePaceImprovement(session.average_speed, session.previous_avg_speed)
              : null
          }));

          return { data: sessionsWithTrends, error: null };
        }

        return { data, error };
      } catch (fetchError: any) {
        logger.error('[SUPABASE] Enhanced sessions query error:', fetchError);
        return { data: null, error: fetchError };
      }
    },

    // Get sessions by date range with analytics
    getByDateRange: async (startDate: string, endDate: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      return { data, error };
    },

    // Get advanced weekly stats with HR zones and power analysis
    getAdvancedWeeklyStats: async (weeksBack: number = 4) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const weeklyStats = [];

      for (let i = 0; i < weeksBack; i++) {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - (7 * (i + 1)));
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

        const { data, error } = await supabase
          .from('training_sessions')
          .select(`
            type, distance, moving_time, total_elevation_gain,
            average_heartrate, max_heartrate, average_watts,
            suffer_score, trainer
          `)
          .eq('user_id', user.id)
          .gte('date', startOfWeek.toISOString().split('T')[0])
          .lte('date', endOfWeek.toISOString().split('T')[0]);

        if (!error && data) {
          const weekStats = dbHelpers.trainingSessions.calculateWeekStatistics(data, startOfWeek);
          weeklyStats.push(weekStats);
        }
      }

      return { data: weeklyStats.reverse(), error: null };
    },

    // Get HR zone analysis for recent activities
    getHRZoneAnalysis: async (days: number = 30) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('training_sessions')
        .select('type, average_heartrate, max_heartrate, moving_time, distance, date')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .not('average_heartrate', 'is', null)
        .order('date', { ascending: false });

      if (data) {
        const hrAnalysis = dbHelpers.stravaData.analyzeHRZones(data);
        return { data: hrAnalysis, error: null };
      }

      return { data, error };
    },

    // Calculate pace improvement percentage
    calculatePaceImprovement: (currentSpeed: number, previousSpeed: number) => {
      if (!currentSpeed || !previousSpeed) return null;

      // Convert m/s to min/km for pace
      const currentPace = 16.6667 / currentSpeed; // min/km
      const previousPace = 16.6667 / previousSpeed; // min/km

      // Improvement is when pace gets faster (lower number)
      return ((previousPace - currentPace) / previousPace) * 100;
    },

    // Calculate comprehensive week statistics
    calculateWeekStatistics: (sessions: any[], weekStart: Date) => {
      const stats = {
        weekStart: weekStart.toISOString().split('T')[0],
        total: {
          sessions: sessions.length,
          distance: 0,
          time: 0,
          elevation: 0,
          tss: 0,
          indoorSessions: 0
        },
        swim: { sessions: 0, distance: 0, time: 0, avgHR: 0 },
        bike: {
          sessions: 0,
          distance: 0,
          time: 0,
          elevation: 0,
          avgWatts: 0,
          avgHR: 0,
          indoorSessions: 0
        },
        run: {
          sessions: 0,
          distance: 0,
          time: 0,
          elevation: 0,
          avgPace: 0,
          avgHR: 0
        }
      };

      let totalHRReadings = { swim: 0, bike: 0, run: 0 };
      let totalWattReadings = 0;
      let totalRunDistance = 0;
      let totalRunTime = 0;

      sessions.forEach(session => {
        const { type, distance = 0, moving_time = 0, total_elevation_gain = 0,
                average_heartrate, average_watts, suffer_score = 0, trainer } = session;

        // Update totals
        stats.total.distance += distance;
        stats.total.time += moving_time;
        stats.total.elevation += total_elevation_gain;
        stats.total.tss += suffer_score;
        if (trainer) stats.total.indoorSessions++;

        // Update by discipline
        if (stats[type as keyof typeof stats] && typeof stats[type as keyof typeof stats] === 'object') {
          const disciplineStats = stats[type as keyof typeof stats] as any;
          disciplineStats.sessions++;
          disciplineStats.distance += distance;
          disciplineStats.time += moving_time;

          if (type !== 'swim') {
            disciplineStats.elevation += total_elevation_gain;
          }

          if (type === 'bike' && trainer) {
            disciplineStats.indoorSessions++;
          }

          if (average_heartrate) {
            disciplineStats.avgHR += average_heartrate;
            totalHRReadings[type as keyof typeof totalHRReadings]++;
          }

          if (type === 'bike' && average_watts) {
            disciplineStats.avgWatts += average_watts;
            totalWattReadings++;
          }

          if (type === 'run' && distance > 0 && moving_time > 0) {
            totalRunDistance += distance;
            totalRunTime += moving_time;
          }
        }
      });

      // Calculate averages
      Object.keys(totalHRReadings).forEach(type => {
        const count = totalHRReadings[type as keyof typeof totalHRReadings];
        if (count > 0) {
          (stats[type as keyof typeof stats] as any).avgHR =
            Math.round((stats[type as keyof typeof stats] as any).avgHR / count);
        }
      });

      if (totalWattReadings > 0) {
        stats.bike.avgWatts = Math.round(stats.bike.avgWatts / totalWattReadings);
      }

      if (totalRunDistance > 0 && totalRunTime > 0) {
        const avgSpeedMs = totalRunDistance / totalRunTime;
        stats.run.avgPace = Math.round((16.6667 / avgSpeedMs) * 100) / 100; // min/km
      }

      return stats;
    },

    // Analyze HR zones distribution
    analyzeHRZones: (sessions: any[]) => {
      // Assume max HR of 190 for zone calculations (should be user-configurable)
      const maxHR = 190;
      const zones = {
        zone1: { min: 0, max: maxHR * 0.68, sessions: 0, time: 0 },
        zone2: { min: maxHR * 0.68, max: maxHR * 0.83, sessions: 0, time: 0 },
        zone3: { min: maxHR * 0.83, max: maxHR * 0.94, sessions: 0, time: 0 },
        zone4: { min: maxHR * 0.94, max: maxHR * 1.05, sessions: 0, time: 0 },
        zone5: { min: maxHR * 1.05, max: maxHR * 1.15, sessions: 0, time: 0 }
      };

      sessions.forEach(session => {
        if (session.average_heartrate) {
          const hr = session.average_heartrate;
          let zone: keyof typeof zones = 'zone1';

          if (hr >= zones.zone5.min) zone = 'zone5';
          else if (hr >= zones.zone4.min) zone = 'zone4';
          else if (hr >= zones.zone3.min) zone = 'zone3';
          else if (hr >= zones.zone2.min) zone = 'zone2';

          zones[zone].sessions++;
          zones[zone].time += session.moving_time || 0;
        }
      });

      return {
        zones,
        totalSessions: sessions.length,
        avgHR: Math.round(sessions.reduce((sum, s) => sum + (s.average_heartrate || 0), 0) / sessions.length),
        maxHR: Math.max(...sessions.map(s => s.max_heartrate || 0))
      };
    },

    // Get training load trends
    getTrainingLoad: async (weeks: number = 8) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (weeks * 7));

      const { data, error } = await supabase
        .from('training_sessions')
        .select('date, moving_time, distance, suffer_score, type')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (data) {
        const weeklyLoad = dbHelpers.stravaData.calculateWeeklyTrainingLoad(data, weeks);
        return { data: weeklyLoad, error: null };
      }

      return { data, error };
    },

    // Calculate weekly training load
    calculateWeeklyTrainingLoad: (sessions: any[], weeks: number) => {
      const weeklyData = Array(weeks).fill(0).map((_, i) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - ((weeks - i) * 7));
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday

        return {
          week: weekStart.toISOString().split('T')[0],
          tss: 0,
          duration: 0,
          distance: 0,
          sessions: 0
        };
      });

      sessions.forEach(session => {
        const sessionDate = new Date(session.date);
        const weekIndex = Math.floor((sessionDate.getTime() - new Date(weeklyData[0].week).getTime()) / (7 * 24 * 60 * 60 * 1000));

        if (weekIndex >= 0 && weekIndex < weeklyData.length) {
          weeklyData[weekIndex].tss += session.suffer_score || 0;
          weeklyData[weekIndex].duration += session.moving_time || 0;
          weeklyData[weekIndex].distance += session.distance || 0;
          weeklyData[weekIndex].sessions++;
        }
      });

      return weeklyData;
    },

    // Get training consistency metrics
    getConsistencyMetrics: async (weeks: number = 12) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (weeks * 7));

      const { data, error } = await supabase
        .from('training_sessions')
        .select('date, type, moving_time, distance')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (data) {
        const consistency = dbHelpers.stravaData.calculateConsistencyMetrics(data, weeks);
        return { data: consistency, error: null };
      }

      return { data, error };
    },

    // Calculate consistency metrics
    calculateConsistencyMetrics: (sessions: any[], weeks: number) => {
      const weeklyActivity = Array(weeks).fill(0).map(() => ({
        swim: 0, bike: 0, run: 0, total: 0
      }));

      sessions.forEach(session => {
        const sessionDate = new Date(session.date);
        const today = new Date();
        const weekIndex = Math.floor((today.getTime() - sessionDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

        if (weekIndex >= 0 && weekIndex < weeks) {
          const reverseIndex = weeks - 1 - weekIndex;
          if (reverseIndex >= 0) {
            weeklyActivity[reverseIndex][session.type as keyof typeof weeklyActivity[0]]++;
            weeklyActivity[reverseIndex].total++;
          }
        }
      });

      // Calculate consistency scores
      const consistentWeeks = {
        total: weeklyActivity.filter(week => week.total >= 3).length,
        swim: weeklyActivity.filter(week => week.swim >= 1).length,
        bike: weeklyActivity.filter(week => week.bike >= 1).length,
        run: weeklyActivity.filter(week => week.run >= 2).length
      };

      return {
        weeklyActivity,
        consistencyScores: {
          overall: Math.round((consistentWeeks.total / weeks) * 100),
          swim: Math.round((consistentWeeks.swim / weeks) * 100),
          bike: Math.round((consistentWeeks.bike / weeks) * 100),
          run: Math.round((consistentWeeks.run / weeks) * 100)
        },
        recommendations: dbHelpers.stravaData.generateConsistencyRecommendations(consistencyScores)
      };
    },

    // Generate consistency recommendations
    generateConsistencyRecommendations: (scores: any) => {
      const recommendations = [];

      if (scores.swim < 60) {
        recommendations.push('Increase swim frequency to 1-2 sessions per week for balanced training');
      }
      if (scores.bike < 70) {
        recommendations.push('Add more bike sessions to build cycling endurance');
      }
      if (scores.run < 80) {
        recommendations.push('Maintain consistent running with 2-3 sessions per week');
      }
      if (scores.overall < 70) {
        recommendations.push('Focus on consistency - aim for 3+ sessions per week');
      }

      return recommendations;
    },

    // Get weekly stats for current week (enhanced)
    getWeeklyStats: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      try {
        const { data, error } = await supabase
          .from('training_sessions')
          .select(`
            type, distance, moving_time, total_elevation_gain,
            average_heartrate, average_watts, suffer_score
          `)
          .eq('user_id', user.id)
          .gte('date', startOfWeek.toISOString().split('T')[0])
          .lte('date', endOfWeek.toISOString().split('T')[0]);

        if (error) {
          logger.error('[SUPABASE] Weekly stats query error:', error);
          return { data: null, error };
        }

        const stats = dbHelpers.trainingSessions.calculateWeekStatistics(data || [], startOfWeek);
        return { data: stats, error: null };
      } catch (fetchError: any) {
        logger.error('[SUPABASE] Weekly stats exception:', fetchError);
        return { data: null, error: fetchError };
      }
    },

    // Get recent sessions for dashboard widgets
    getRecent: async (limit: number = 10) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      // Validate and sanitize limit parameter to prevent abuse
      const validatedLimit = Math.max(1, Math.min(limit || 10, 100));

      try {
        const { data, error } = await supabase
          .from('training_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(validatedLimit);

        if (error) {
          logger.error('[SUPABASE] Recent sessions query error:', error);
          return { data: null, error };
        }

        return { data, error: null };
      } catch (fetchError: any) {
        logger.error('[SUPABASE] Recent sessions exception:', fetchError);
        return { data: null, error: fetchError };
      }
    },

    // Create or update training session
    upsert: async (sessionData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('training_sessions')
        .upsert({ ...sessionData, user_id: user.id })
        .select()
        .single();
      return { data, error };
    },

    // Bulk upsert training sessions (for Strava sync)
    bulkUpsert: async (sessions: any[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      if (!sessions || sessions.length === 0) {
        return { data: [], error: null };
      }

      // Ensure all sessions have the required fields and proper user_id
      const sessionsWithUserId = sessions.map(session => ({
        ...session,
        user_id: user.id,
        // Ensure strava_activity_id is a string if it exists
        strava_activity_id: session.strava_activity_id ? String(session.strava_activity_id) : null,
        // Ensure date is properly formatted
        date: session.date instanceof Date ? session.date.toISOString().split('T')[0] : session.date,
        // Set defaults for optional fields
        trainer: session.trainer ?? false,
        kudos_count: session.kudos_count ?? 0
      }));

      try {
        const { data, error } = await supabase
          .from('training_sessions')
          .upsert(sessionsWithUserId, {
            onConflict: 'strava_activity_id',
            ignoreDuplicates: false
          })
          .select();

        if (error) {
          logger.error('[SUPABASE] Bulk upsert error:', error);
          return { data: null, error };
        }

        return { data, error: null };
      } catch (fetchError: any) {
        logger.error('[SUPABASE] Bulk upsert exception:', fetchError);
        return { data: null, error: fetchError };
      }
    },

    // Delete training session
    delete: async (sessionId: string) => {
      const { error } = await supabase
        .from('training_sessions')
        .delete()
        .eq('id', sessionId);
      return { error };
    },

    // Delete sessions by Strava activity ID
    deleteByStravaId: async (stravaActivityId: string) => {
      const { error } = await supabase
        .from('training_sessions')
        .delete()
        .eq('strava_activity_id', stravaActivityId);
      return { error };
    },
    // Delete all user's training sessions
    deleteAll: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };
      const { error } = await supabase
        .from('training_sessions')
        .delete()
        .eq('user_id', user.id);
      return { error };
    },
  },
};
