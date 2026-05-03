import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let _supabase: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[supabase] Credentials missing — local store fallback will be used for reads.');
    }
    _supabase = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder'
    );
  }
  return _supabase;
}

/**
 * Returns true when Supabase credentials are present in the environment.
 * We no longer do a live network ping — that caused false negatives when
 * the health-check table was blocked by RLS or the project was briefly slow.
 * Real query errors are surfaced directly by each route handler.
 */
export function isSupabaseAvailable(): boolean {
  const configured = !!(supabaseUrl && supabaseAnonKey);
  if (!configured) {
    console.warn('[supabase] Credentials missing — local store fallback will be used for reads.');
  }
  return configured;
}

export const supabase = getClient();
