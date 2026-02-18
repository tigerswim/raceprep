import { supabase } from './client';

export const nutritionHelpers = {
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
};
