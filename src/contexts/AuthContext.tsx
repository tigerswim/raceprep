import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, authHelpers, dbHelpers } from '../services/supabase';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Get initial session with improved error handling
    const getInitialSession = async () => {
      try {
        logger.debug('[AUTH] Initializing auth context...');

        // Add timeout protection for the getSession call
        const sessionTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth session timeout')), 3000);
        });

        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error } = await Promise.race([sessionPromise, sessionTimeoutPromise]) as any;

        if (!isMounted) return; // Component unmounted

        if (error) {
          logger.error('[AUTH] Session error:', error);
          setUser(null);
        } else {
          logger.debug('[AUTH] Session loaded:', session?.user ? 'User found' : 'No user');
          setUser(session?.user ?? null);
        }
      } catch (error) {
        logger.error('[AUTH] Failed to get session:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Set a more reasonable timeout
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        logger.warn('[AUTH] Session loading timeout - continuing without user');
        setLoading(false);
        setUser(null);
      }
    }, 8000); // Increased to 8 seconds

    getInitialSession().then(() => {
      clearTimeout(timeoutId);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.debug('[AUTH] Auth state changed:', event, session?.user ? 'User present' : 'No user');

        // Skip profile creation for now to avoid hanging
        // TODO: Re-enable profile creation once database issues are resolved

        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await authHelpers.signIn(email, password);
    setLoading(false);
    return result;
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    setLoading(true);
    const result = await authHelpers.signUp(email, password, userData);
    
    // If signup successful, create user profile
    if (result.data?.user && !result.error) {
      try {
        const profileData = {
          id: result.data.user.id,
          email: result.data.user.email || email,
          name: userData?.name || email.split('@')[0],
        };
        await dbHelpers.users.createProfile(profileData);
      } catch (error) {
        logger.error('[AUTH] Failed to create user profile:', error);
      }
    }
    
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await authHelpers.signOut();
    setLoading(false);
    return result;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};