import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';
import { logger } from '../../utils/logger';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Debug environment variables in production
logger.debug('[SUPABASE] Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined',
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'unknown'
});

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('[SUPABASE] Missing environment variables!', {
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
