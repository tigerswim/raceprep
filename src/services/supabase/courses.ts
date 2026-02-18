import { supabase } from './client';

export const coursesHelpers = {
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
};
