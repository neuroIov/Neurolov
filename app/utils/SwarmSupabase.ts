import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SWARM_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SWARM_SUPABASE_ANON_KEY || '';

// Check if environment variables are set
let swarmSupabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  // Create Supabase client only if environment variables are available
  swarmSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  });
} else {
  console.warn('Swarm Supabase environment variables not configured - auto-linking will be disabled');
}

// Function to get Supabase client
const getSwarmSupabase = (): SupabaseClient | null => {
  return swarmSupabase;
};

export default getSwarmSupabase;
