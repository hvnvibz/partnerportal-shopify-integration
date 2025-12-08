-- Add last_activity_at column to profiles table for tracking user activity
-- This tracks the last time a user accessed the portal (not just login)

-- Add last_activity_at column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity_at ON profiles(last_activity_at);

-- RLS Policy: Users can update their own last_activity_at
-- Note: The API uses service role, so this policy is mainly for direct client updates
-- This allows users to update only their own last_activity_at field
-- Since we can't use OLD in WITH CHECK, we just ensure the user can only update their own record
DROP POLICY IF EXISTS "Users can update own last_activity_at" ON profiles;
CREATE POLICY "Users can update own last_activity_at" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Comment for documentation
COMMENT ON COLUMN profiles.last_activity_at IS 'Timestamp of last user activity/access to the portal';

