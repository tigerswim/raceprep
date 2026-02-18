import { supabase } from './client';

export const locationsHelpers = {
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
};
