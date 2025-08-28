import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SWARM_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SWARM_SUPABASE_ANON_KEY || '';

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for Swarm database');
}

// Create Supabase client with proper RLS policy support
const swarmSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true
    }
});

// Function to get Supabase client
const getSwarmSupabase = (): SupabaseClient => {
    return swarmSupabase;
};

export default getSwarmSupabase;
