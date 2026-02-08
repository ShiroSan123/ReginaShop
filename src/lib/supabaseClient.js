import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

export const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
