import { supabase } from './client';

export const discoverHelpers = {
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
};
