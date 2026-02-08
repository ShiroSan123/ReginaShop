import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_STORAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'regina-storage';

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseAnonKey);

const supabaseClient = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    throw new Error(
      'Supabase env is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }

  return supabaseClient;
};

export const getSupabaseClientOrNull = () => supabaseClient;
