import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SWARM_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SWARM_SUPABASE_ANON_KEY || '';

// Check if environment variables are set
if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables for Swarm database');
}

// Create Supabase client
const swarmSupabase = createClient(supabaseUrl, supabaseKey);

// Function to get Supabase client
const getSwarmSupabase = (): SupabaseClient => {
    return swarmSupabase;
};

export default getSwarmSupabase;
