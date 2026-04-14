import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let _supabase: SupabaseClient | null = null;
let _isConnected: boolean | null = null;

function getClient(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[supabase] Credentials missing — using local store fallback.');
    }
    _supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
  }
  return _supabase;
}

/**
 * Check if Supabase is reachable (cached after first check).
 * Returns true if a simple query succeeds, false otherwise.
 */
export async function isSupabaseAvailable(): Promise<boolean> {
  if (_isConnected !== null) return _isConnected;

  if (!supabaseUrl || !supabaseAnonKey) {
    _isConnected = false;
    return false;
  }

  try {
    const client = getClient();
    // Quick connectivity test — just try to hit the REST API
    const { error } = await client.from('products').select('id').limit(1);
    _isConnected = !error;
    if (error) {
      console.warn('[supabase] Connection test failed:', error.message, '— falling back to local store.');
    } else {
      console.log('[supabase] Connected successfully.');
    }
  } catch {
    console.warn('[supabase] Connection failed — using local store fallback.');
    _isConnected = false;
  }

  return _isConnected;
}

export const supabase = getClient();
