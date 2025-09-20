import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Debug environment variables in production
console.log('[SUPABASE] Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined',
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'unknown'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[SUPABASE] Missing environment variables!', {
    EXPO_PUBLIC_SUPABASE_URL: supabaseUrl,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '[PRESENT]' : '[MISSING]'
  });
}

// Create a simple client with proper auth configuration and timeout
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-client-info': 'raceprep-web@1.0.0',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper functions for common operations
export const authHelpers = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData, // Additional user metadata
      },
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },
};

// Database helper functions
export const dbHelpers = {
  // User operations
  users: {
    // Get user profile by ID
    getProfile: async (userId: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    },

    // Update user profile by ID
    updateProfile: async (userId: string, updates: any) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    },

    // Create user profile (usually called after signup)
    createProfile: async (userData: any) => {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      return { data, error };
    },

    // Get current user profile
    getCurrent: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      return { data, error };
    },

    // Update current user profile
    update: async (updates: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      return { data, error };
    },

    // Create current user profile (for first time setup)
    create: async (profileData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('users')
        .insert({ ...profileData, id: user.id, email: user.email })
        .select()
        .single();
      return { data, error };
    },
  },

  // Race operations
  races: {
    // Get all races
    getAll: async () => {
      const { data, error } = await supabase
        .from('races')
        .select(`
          *,
          courses (*)
        `)
        .order('date', { ascending: false });
      return { data, error };
    },

    // Get race by ID
    getById: async (raceId: string) => {
      const { data, error } = await supabase
        .from('races')
        .select(`
          *,
          courses (*)
        `)
        .eq('id', raceId)
        .single();
      return { data, error };
    },

    // Create new race
    create: async (raceData: any) => {
      const { data, error } = await supabase
        .from('races')
        .insert(raceData)
        .select()
        .single();
      return { data, error };
    },
  },

  // Race results operations
  raceResults: {
    // Get all race results
    getAll: async () => {
      const { data, error } = await supabase
        .from('race_results')
        .select(`
          *,
          races (
            *,
            courses (*)
          )
        `)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Get user's race results
    getUserResults: async (userId: string) => {
      const { data, error } = await supabase
        .from('race_results')
        .select(`
          *,
          races (
            *,
            courses (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Add new race result
    add: async (raceResult: any) => {
      const { data, error } = await supabase
        .from('race_results')
        .insert(raceResult)
        .select(`
          *,
          races (
            *,
            courses (*)
          )
        `)
        .single();
      return { data, error };
    },

    // Update race result
    update: async (resultId: string, updates: any) => {
      const { data, error } = await supabase
        .from('race_results')
        .update(updates)
        .eq('id', resultId)
        .select(`
          *,
          races (
            *,
            courses (*)
          )
        `)
        .single();
      return { data, error };
    },

    // Delete race result
    delete: async (resultId: string) => {
      const { error } = await supabase
        .from('race_results')
        .delete()
        .eq('id', resultId);
      return { error };
    },
  },

  // Course operations
  courses: {
    // Get all courses
    getAll: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name');
      return { data, error };
    },

    // Search courses by location or distance type
    search: async (filters: { location?: string; distanceType?: string }) => {
      let query = supabase.from('courses').select('*');
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.distanceType) {
        query = query.eq('distance_type', filters.distanceType);
      }
      
      const { data, error } = await query.order('name');
      return { data, error };
    },

    // Get course by ID with reviews
    getById: async (courseId: string) => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_reviews (
            *,
            users (name)
          )
        `)
        .eq('id', courseId)
        .single();
      return { data, error };
    },

    // Create new course
    create: async (courseData: any) => {
      const { data, error } = await supabase
        .from('courses')
        .insert(courseData)
        .select()
        .single();
      return { data, error };
    },

    // Update course
    update: async (courseId: string, updates: any) => {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId)
        .select()
        .single();
      return { data, error };
    },

    // Delete course
    delete: async (courseId: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
      return { error };
    },
  },

  // Nutrition plans
  nutritionPlans: {
    // Get user's nutrition plans
    getUserPlans: async (userId: string) => {
      // Temporary: Skip database calls until schema is fixed
      return { data: null, error: { code: 'FEATURE_DISABLED', message: 'Nutrition plans feature not yet initialized' } };
      
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select(`
          *,
          races (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Create nutrition plan
    create: async (nutritionPlan: any) => {
      // Temporary: Skip database calls until schema is fixed
      return { data: null, error: { code: 'FEATURE_DISABLED', message: 'Nutrition plans feature not yet initialized' } };
      
      const { data, error } = await supabase
        .from('nutrition_plans')
        .insert(nutritionPlan)
        .select()
        .single();
      return { data, error };
    },

    // Update nutrition plan
    update: async (planId: string, updates: any) => {
      // Temporary: Skip database calls until schema is fixed
      return { data: null, error: { code: 'FEATURE_DISABLED', message: 'Nutrition plans feature not yet initialized' } };
      
      const { data, error } = await supabase
        .from('nutrition_plans')
        .update(updates)
        .eq('id', planId)
        .select()
        .single();
      return { data, error };
    },
  },

  // Packing lists
  packingLists: {
    // Get user's packing lists
    getUserLists: async (userId: string) => {
      // Temporary: Skip database calls until schema is fixed
      return { data: null, error: { code: 'FEATURE_DISABLED', message: 'Packing lists feature not yet initialized' } };
      
      const { data, error } = await supabase
        .from('packing_lists')
        .select(`
          *,
          races (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    // Create packing list
    create: async (packingList: any) => {
      // Temporary: Skip database calls until schema is fixed
      return { data: null, error: { code: 'FEATURE_DISABLED', message: 'Packing lists feature not yet initialized' } };
      
      const { data, error } = await supabase
        .from('packing_lists')
        .insert(packingList)
        .select()
        .single();
      return { data, error };
    },
    // Update packing list
    update: async (listId: string, updates: any) => {
      // Temporary: Skip database calls until schema is fixed
      return { data: null, error: { code: 'FEATURE_DISABLED', message: 'Packing lists feature not yet initialized' } };
      
      const { data, error } = await supabase
        .from('packing_lists')
        .update(updates)
        .eq('id', listId)
        .select()
        .single();
      return { data, error };
    },
  },

  // Discover tab helpers
  externalRaces: {
    // Get all external races
    getAll: async () => {
      const { data, error } = await supabase
        .from('external_races')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      return { data, error };
    },

    // Get races by location
    getByLocation: async (city: string, state: string, radiusMiles: number = 50) => {
      const { data, error } = await supabase
        .from('external_races')
        .select('*')
        .or(`city.ilike.%${city}%,state.ilike.%${state}%`)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      return { data, error };
    },

    // Get races by distance type
    getByDistanceType: async (distanceType: string) => {
      const { data, error } = await supabase
        .from('external_races')
        .select('*')
        .eq('distance_type', distanceType)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
      return { data, error };
    },

    // Get featured races
    getFeatured: async () => {
      const { data, error } = await supabase
        .from('external_races')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(20);
      return { data, error };
    },

    // Create new external race
    create: async (race: any) => {
      const { data, error } = await supabase
        .from('external_races')
        .insert([race])
        .select()
        .single();
      return { data, error };
    },

    // Update external race
    update: async (id: string, race: any) => {
      const { data, error } = await supabase
        .from('external_races')
        .update(race)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

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

  // Gear products
  gearProducts: {
    // Get all gear products
    getAll: async () => {
      const { data, error } = await supabase
        .from('gear_products')
        .select('*')
        .order('rating', { ascending: false });
      return { data, error };
    },

    // Get products by category
    getByCategory: async (category: string) => {
      const { data, error } = await supabase
        .from('gear_products')
        .select('*')
        .eq('category', category)
        .order('rating', { ascending: false });
      return { data, error };
    },

    // Get featured products
    getFeatured: async () => {
      const { data, error } = await supabase
        .from('gear_products')
        .select('*')
        .eq('is_featured', true)
        .order('rating', { ascending: false });
      return { data, error };
    },

    // Get top rated products
    getTopRated: async () => {
      const { data, error } = await supabase
        .from('gear_products')
        .select('*')
        .gte('rating', 4.0)
        .order('rating', { ascending: false })
        .limit(12);
      return { data, error };
    },

    // Create new gear product
    create: async (productData: any) => {
      const { data, error } = await supabase
        .from('gear_products')
        .insert(productData)
        .select()
        .single();
      return { data, error };
    },
  },

  // Training articles
  trainingArticles: {
    // Get all articles
    getAll: async () => {
      const { data, error } = await supabase
        .from('training_articles')
        .select('*')
        .order('published_at', { ascending: false });
      return { data, error };
    },

    // Get articles by category
    getByCategory: async (category: string) => {
      const { data, error } = await supabase
        .from('training_articles')
        .select('*')
        .eq('category', category)
        .order('published_at', { ascending: false });
      return { data, error };
    },

    // Get featured articles
    getFeatured: async () => {
      const { data, error } = await supabase
        .from('training_articles')
        .select('*')
        .eq('is_featured', true)
        .order('published_at', { ascending: false });
      return { data, error };
    },

    // Get recent articles
    getRecent: async () => {
      const { data, error } = await supabase
        .from('training_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(20);
      return { data, error };
    },

    // Increment view count
    incrementViewCount: async (id: string) => {
      const { error } = await supabase.rpc('increment_article_views', { article_id: id });
      return { error };
    },

    // Create new training article
    create: async (articleData: any) => {
      const { data, error } = await supabase
        .from('training_articles')
        .insert(articleData)
        .select()
        .single();
      return { data, error };
    },
  },

  // User locations
  userLocations: {
    // Get user's locations
    getByUserId: async (userId: string) => {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', userId);
      return { data, error };
    },

    // Get primary location
    getPrimary: async (userId: string) => {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .single();
      return { data, error };
    },

    // Create location
    create: async (location: any) => {
      const { data, error } = await supabase
        .from('user_locations')
        .insert([location])
        .select()
        .single();
      return { data, error };
    },

    // Update location
    update: async (id: string, location: any) => {
      const { data, error } = await supabase
        .from('user_locations')
        .update(location)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  // User goals
  userGoals: {
    // Get user's goals
    getAll: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Create new goal
    create: async (goalData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_goals')
        .insert({ ...goalData, user_id: user.id })
        .select()
        .single();
      return { data, error };
    },

    // Update goal
    update: async (goalId: string, updates: any) => {
      const { data, error } = await supabase
        .from('user_goals')
        .update(updates)
        .eq('id', goalId)
        .select()
        .single();
      return { data, error };
    },

    // Delete goal
    delete: async (goalId: string) => {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);
      return { error };
    },
  },

  // User settings
  userSettings: {
    // Get user's settings
    get: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return { data, error };
    },

    // Create user settings (for first time)
    create: async (settingsData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_settings')
        .insert({ ...settingsData, user_id: user.id })
        .select()
        .single();
      return { data, error };
    },

    // Update user settings
    update: async (updates: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      return { data, error };
    },

    // Upsert settings (insert or update)
    upsert: async (settingsData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({ ...settingsData, user_id: user.id })
        .select()
        .single();
      return { data, error };
    },
  },

  // User planned races
  userPlannedRaces: {
    // Get user's planned races
    getAll: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      try {
        console.log('[SUPABASE] Querying user_planned_races for user:', user.id);

        // Query with external_races JOIN to get full race data
        const { data, error } = await supabase
          .from('user_planned_races')
          .select(`
            *,
            external_races (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        console.log('[SUPABASE] user_planned_races query result:', { data: data?.length || 0, error });
        
        // Handle 404 or table not found errors gracefully
        if (error) {
          console.warn('[SUPABASE] Error in user_planned_races query:', error);
          // Check for table not found errors (404, PGRST106, etc.)
          if (error.code === 'PGRST106' || error.code === 'PGRST205' ||
              error.message?.includes('404') || error.details?.includes('404') ||
              error.message?.includes('does not exist')) {
            return { data: null, error: { code: 'TABLE_NOT_FOUND', message: 'Tables not initialized' } };
          }
        }
        
        return { data, error };
      } catch (fetchError: any) {
        // Handle network/fetch errors that might result in 404
        if (fetchError.status === 404 || fetchError.message?.includes('404')) {
          return { data: null, error: { code: 'TABLE_NOT_FOUND', message: 'Tables not initialized' } };
        }
        return { data: null, error: fetchError };
      }
    },

    // Get races by status
    getByStatus: async (status: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_planned_races')
        .select(`
          *,
          external_races (*)
        `)
        .eq('user_id', user.id)
        .eq('status', status)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Create planned race
    create: async (raceData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_planned_races')
        .insert({ ...raceData, user_id: user.id })
        .select(`
          *,
          external_races (*)
        `)
        .single();
      return { data, error };
    },

    // Update planned race
    update: async (plannedRaceId: string, updates: any) => {
      const { data, error } = await supabase
        .from('user_planned_races')
        .update(updates)
        .eq('id', plannedRaceId)
        .select(`
          *,
          external_races (*)
        `)
        .single();
      return { data, error };
    },

    // Delete planned race
    delete: async (plannedRaceId: string) => {
      const { error } = await supabase
        .from('user_planned_races')
        .delete()
        .eq('id', plannedRaceId);
      return { error };
    },

    // Upsert planned race (for save/unsave functionality)
    upsert: async (raceData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_planned_races')
        .upsert({ ...raceData, user_id: user.id })
        .select(`
          *,
          external_races (*)
        `)
        .single();
      return { data, error };
    },

    // Update race status
    updateStatus: async (plannedRaceId: string, status: 'interested' | 'registered' | 'completed') => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('user_planned_races')
        .update({ status })
        .eq('id', plannedRaceId)
        .eq('user_id', user.id) // Ensure user can only update their own races
        .select(`
          *,
          external_races (*)
        `)
        .single();
      return { data, error };
    },
  },

  // RSS feeds
  rssFeeds: {
    // Get active RSS sources
    getActive: async () => {
      const { data, error } = await supabase
        .from('rss_sources')
        .select('*')
        .eq('is_active', true);
      return { data, error };
    },

    // Get all RSS sources
    getAll: async () => {
      const { data, error } = await supabase
        .from('rss_sources')
        .select('*');
      return { data, error };
    },
  },

  // Training sessions (Strava integration)
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

    // Get sessions by date range
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

    // Get user sessions by date range (for dashboard widgets)
    getUserSessions: async (userId: string, startDate: string, endDate: string) => {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      return { data, error };
    },

    // Get sessions by type
    getByType: async (type: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', type)
        .order('date', { ascending: false });
      return { data, error };
    },

    // Get weekly stats for current week
    getWeeklyStats: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      // Get start and end of current week (Monday to Sunday)
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
          .select('type, distance, moving_time')
          .eq('user_id', user.id)
          .gte('date', startOfWeek.toISOString().split('T')[0])
          .lte('date', endOfWeek.toISOString().split('T')[0])
          .order('date', { ascending: false });

        if (error) {
          console.error('[SUPABASE] Weekly stats query error:', error);
          return { data: null, error };
        }

        // Aggregate stats by type
        const stats = {
          swim: { distance: 0, sessions: 0, time: 0 },
          bike: { distance: 0, sessions: 0, time: 0 },
          run: { distance: 0, sessions: 0, time: 0 }
        };

        data?.forEach(session => {
          if (session.type && stats[session.type as keyof typeof stats]) {
            stats[session.type as keyof typeof stats].distance += session.distance || 0;
            stats[session.type as keyof typeof stats].sessions += 1;
            stats[session.type as keyof typeof stats].time += session.moving_time || 0;
          }
        });

        return { data: stats, error: null };
      } catch (fetchError: any) {
        console.error('[SUPABASE] Weekly stats exception:', fetchError);
        return { data: null, error: fetchError };
      }
    },

    // Get recent sessions for dashboard widgets
    getRecent: async (limit: number = 10) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      try {
        const { data, error } = await supabase
          .from('training_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('[SUPABASE] Recent sessions query error:', error);
          return { data: null, error };
        }

        return { data, error: null };
      } catch (fetchError: any) {
        console.error('[SUPABASE] Recent sessions exception:', fetchError);
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
          console.error('[SUPABASE] Bulk upsert error:', error);
          return { data: null, error };
        }

        return { data, error: null };
      } catch (fetchError: any) {
        console.error('[SUPABASE] Bulk upsert exception:', fetchError);
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

export default supabase;