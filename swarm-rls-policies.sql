-- RLS Policies for Swarm Database user_profiles table
-- Run these SQL commands in your Swarm Supabase SQL editor

-- 1. Allow public read access for email lookup (for account linking)
CREATE POLICY "Allow public email lookup for linking" 
ON public.user_profiles 
FOR SELECT 
USING (true);

-- 2. Allow users to read their own profile
CREATE POLICY "Users can read own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 3. Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- 4. Allow service role to insert new profiles (for account creation)
CREATE POLICY "Service role can insert profiles" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (true);

-- 5. Alternative: More restrictive email lookup policy (if you don't want full public read)
-- DROP POLICY "Allow public email lookup for linking" ON public.user_profiles;
-- CREATE POLICY "Allow authenticated email lookup" 
-- ON public.user_profiles 
-- FOR SELECT 
-- USING (auth.role() = 'authenticated');

-- 6. Enable RLS on user_profiles table (if not already enabled)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- View current policies (for verification)
-- SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
