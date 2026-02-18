import { supabase } from './client';

export const usersHelpers = {
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
};
