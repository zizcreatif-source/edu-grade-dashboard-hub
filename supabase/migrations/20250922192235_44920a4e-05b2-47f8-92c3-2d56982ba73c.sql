-- Fix security vulnerability: Restrict profile access to authenticated users only
-- Drop the overly permissive policy that allows everyone to view profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a more secure policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Optionally, create an even more restrictive policy (uncomment if needed):
-- This would only allow users to view their own profile
-- CREATE POLICY "Users can view their own profile" 
-- ON public.profiles 
-- FOR SELECT 
-- TO authenticated
-- USING (auth.uid() = user_id);