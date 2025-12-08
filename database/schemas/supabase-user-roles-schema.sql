-- User Rollen und Status System
-- Erweitert die profiles Tabelle um role und status Spalten

-- Add role and status columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'partner' CHECK (role IN ('partner', 'admin')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked'));

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, status);

-- Update existing users to have active status (migration)
UPDATE profiles 
SET role = 'partner', status = 'active' 
WHERE role IS NULL OR status IS NULL;

-- RLS Policies for role and status

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own role and status" ON profiles;
DROP POLICY IF EXISTS "Admins can view all user data" ON profiles;
DROP POLICY IF EXISTS "Admins can update user role and status" ON profiles;

-- Policy: Users can read their own role and status
-- Note: This might conflict with existing SELECT policies
-- If you already have a SELECT policy for own profile, you can skip this one
-- or combine it with your existing policy
-- CREATE POLICY "Users can view own role and status" ON profiles
--   FOR SELECT USING (auth.uid() = id);

-- Policy: Admin users can read all user data
CREATE POLICY "Admins can view all user data" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Users can update their own profile (but not role/status)
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Users cannot change their own role or status
    (OLD.role = NEW.role OR NEW.role IS NULL) AND
    (OLD.status = NEW.status OR NEW.status IS NULL)
  );

-- Policy: Admin users can update role and status of other users
CREATE POLICY "Admins can update user role and status" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Service role can manage all user data
CREATE POLICY "Service role can manage all user data" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON COLUMN profiles.role IS 'User role: partner (default) or admin';
COMMENT ON COLUMN profiles.status IS 'User status: pending (default), active, or blocked';

