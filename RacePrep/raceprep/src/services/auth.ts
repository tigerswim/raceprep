import { supabase, authHelpers, dbHelpers } from './supabase';
import { User } from '../types';

interface AuthResponse {
  user: User | null;
  error: string | null;
  loading: boolean;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  ageGroup?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  location?: string;
}

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Sign up new user
  async signUp(userData: SignUpData): Promise<AuthResponse> {
    try {
      const { data, error } = await authHelpers.signUp(
        userData.email,
        userData.password,
        {
          name: userData.name,
          age_group: userData.ageGroup,
          experience_level: userData.experienceLevel,
          location: userData.location,
        }
      );

      if (error) {
        return { user: null, error: error.message, loading: false };
      }

      if (data.user) {
        // Create user profile in users table
        const profileData = {
          id: data.user.id,
          email: userData.email,
          name: userData.name,
          age_group: userData.ageGroup || null,
          experience_level: userData.experienceLevel || null,
          location: userData.location || null,
        };

        const { error: profileError } = await dbHelpers.users.createProfile(profileData);
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Note: User auth account was created, but profile creation failed
          // This should be handled gracefully in production
        }

        const user: User = {
          id: data.user.id,
          email: userData.email,
          name: userData.name,
          ageGroup: userData.ageGroup,
          experienceLevel: userData.experienceLevel,
          location: userData.location,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return { user, error: null, loading: false };
      }

      return { user: null, error: 'Unknown error occurred', loading: false };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        loading: false 
      };
    }
  }

  // Sign in existing user
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await authHelpers.signIn(email, password);

      if (error) {
        return { user: null, error: error.message, loading: false };
      }

      if (data.user) {
        // Get user profile from database
        const { data: profileData, error: profileError } = await dbHelpers.users.getProfile(data.user.id);
        
        if (profileError || !profileData) {
          return { 
            user: null, 
            error: 'Unable to load user profile', 
            loading: false 
          };
        }

        const user: User = {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          ageGroup: profileData.age_group || undefined,
          gender: profileData.gender || undefined,
          experienceLevel: profileData.experience_level || undefined,
          location: profileData.location || undefined,
          usatId: profileData.usat_id || undefined,
          premiumExpiresAt: profileData.premium_expires_at ? new Date(profileData.premium_expires_at) : undefined,
          createdAt: new Date(profileData.created_at),
          updatedAt: new Date(profileData.updated_at),
        };

        return { user, error: null, loading: false };
      }

      return { user: null, error: 'Unknown error occurred', loading: false };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        loading: false 
      };
    }
  }

  // Sign out user
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await authHelpers.signOut();
      return { error: error?.message || null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const { user: authUser, error } = await authHelpers.getCurrentUser();

      if (error) {
        return { user: null, error: error.message, loading: false };
      }

      if (!authUser) {
        return { user: null, error: null, loading: false };
      }

      // Get user profile from database
      const { data: profileData, error: profileError } = await dbHelpers.users.getProfile(authUser.id);
      
      if (profileError || !profileData) {
        return { 
          user: null, 
          error: 'Unable to load user profile', 
          loading: false 
        };
      }

      const user: User = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        ageGroup: profileData.age_group || undefined,
        gender: profileData.gender || undefined,
        experienceLevel: profileData.experience_level || undefined,
        location: profileData.location || undefined,
        usatId: profileData.usat_id || undefined,
        premiumExpiresAt: profileData.premium_expires_at ? new Date(profileData.premium_expires_at) : undefined,
        createdAt: new Date(profileData.created_at),
        updatedAt: new Date(profileData.updated_at),
      };

      return { user, error: null, loading: false };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        loading: false 
      };
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<{ user: User | null; error: string | null }> {
    try {
      const updateData = {
        name: updates.name,
        age_group: updates.ageGroup,
        gender: updates.gender,
        experience_level: updates.experienceLevel,
        location: updates.location,
        usat_id: updates.usatId,
      };

      const { data, error } = await dbHelpers.users.updateProfile(userId, updateData);

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data) {
        return { user: null, error: 'No data returned from update' };
      }

      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        ageGroup: data.age_group || undefined,
        gender: data.gender || undefined,
        experienceLevel: data.experience_level || undefined,
        location: data.location || undefined,
        usatId: data.usat_id || undefined,
        premiumExpiresAt: data.premium_expires_at ? new Date(data.premium_expires_at) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      return { user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await authHelpers.resetPassword(email);
      return { error: error?.message || null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { user } = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  // Check if user has premium access
  isPremiumUser(user: User | null): boolean {
    if (!user?.premiumExpiresAt) return false;
    return user.premiumExpiresAt > new Date();
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();