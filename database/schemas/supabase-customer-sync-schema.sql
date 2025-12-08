-- Shopify-Supabase Customer Sync Schema
-- Extends the profiles table with Shopify customer data and sync functionality

-- Add Shopify-related columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS shopify_customer_id BIGINT UNIQUE,
ADD COLUMN IF NOT EXISTS shopify_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address JSONB,
ADD COLUMN IF NOT EXISTS shopify_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS shopify_accepts_marketing BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS shopify_tags TEXT,
ADD COLUMN IF NOT EXISTS shopify_note TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_shopify_customer_id ON profiles(shopify_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_shopify_synced_at ON profiles(shopify_synced_at);

-- Create function to update sync timestamp
CREATE OR REPLACE FUNCTION update_shopify_sync_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.shopify_synced_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic sync timestamp updates
DROP TRIGGER IF EXISTS trigger_update_shopify_sync_timestamp ON profiles;
CREATE TRIGGER trigger_update_shopify_sync_timestamp
  BEFORE UPDATE OF shopify_customer_id, phone, address, shopify_verified, shopify_accepts_marketing, shopify_tags, shopify_note
  ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_shopify_sync_timestamp();

-- Create function to sync customer data from Shopify
CREATE OR REPLACE FUNCTION sync_customer_from_shopify(
  p_user_id UUID,
  p_shopify_customer_id BIGINT,
  p_phone TEXT DEFAULT NULL,
  p_address JSONB DEFAULT NULL,
  p_verified BOOLEAN DEFAULT FALSE,
  p_accepts_marketing BOOLEAN DEFAULT FALSE,
  p_tags TEXT DEFAULT NULL,
  p_note TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles 
  SET 
    shopify_customer_id = p_shopify_customer_id,
    phone = COALESCE(p_phone, phone),
    address = COALESCE(p_address, address),
    shopify_verified = p_verified,
    shopify_accepts_marketing = p_accepts_marketing,
    shopify_tags = p_tags,
    shopify_note = p_note,
    shopify_synced_at = NOW()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to get customer sync status
-- SECURITY: Only allows users to check their own status or service role to check any
CREATE OR REPLACE FUNCTION get_customer_sync_status(p_user_id UUID)
RETURNS TABLE(
  is_synced BOOLEAN,
  shopify_customer_id BIGINT,
  last_synced TIMESTAMP WITH TIME ZONE,
  sync_age_hours NUMERIC
) AS $$
BEGIN
  -- Only allow users to check their own status or service role to check any
  IF auth.uid() != p_user_id AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: You can only check your own sync status';
  END IF;

  RETURN QUERY
  SELECT 
    (p.shopify_customer_id IS NOT NULL) as is_synced,
    p.shopify_customer_id,
    p.shopify_synced_at,
    EXTRACT(EPOCH FROM (NOW() - p.shopify_synced_at)) / 3600 as sync_age_hours
  FROM profiles p
  WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to find users by Shopify customer ID
CREATE OR REPLACE FUNCTION find_user_by_shopify_id(p_shopify_customer_id BIGINT)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  display_name TEXT,
  shopify_synced_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    au.email,
    p.display_name,
    p.shopify_synced_at
  FROM profiles p
  JOIN auth.users au ON p.id = au.id
  WHERE p.shopify_customer_id = p_shopify_customer_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get customers needing sync (older than specified hours)
CREATE OR REPLACE FUNCTION get_customers_needing_sync(p_hours_threshold NUMERIC DEFAULT 24)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  shopify_customer_id BIGINT,
  last_synced TIMESTAMP WITH TIME ZONE,
  sync_age_hours NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    au.email,
    p.shopify_customer_id,
    p.shopify_synced_at as last_synced,
    EXTRACT(EPOCH FROM (NOW() - p.shopify_synced_at)) / 3600 as sync_age_hours
  FROM profiles p
  JOIN auth.users au ON p.id = au.id
  WHERE p.shopify_customer_id IS NOT NULL
    AND (p.shopify_synced_at IS NULL OR 
         EXTRACT(EPOCH FROM (NOW() - p.shopify_synced_at)) / 3600 > p_hours_threshold)
  ORDER BY p.shopify_synced_at ASC NULLS FIRST;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up orphaned Shopify references
CREATE OR REPLACE FUNCTION cleanup_orphaned_shopify_refs()
RETURNS INTEGER AS $$
DECLARE
  cleaned_count INTEGER := 0;
BEGIN
  -- Reset shopify_customer_id for users that no longer exist in auth.users
  UPDATE profiles 
  SET 
    shopify_customer_id = NULL,
    shopify_synced_at = NULL,
    shopify_verified = FALSE,
    shopify_accepts_marketing = FALSE,
    shopify_tags = NULL,
    shopify_note = NULL
  WHERE id NOT IN (SELECT id FROM auth.users)
    AND shopify_customer_id IS NOT NULL;
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;

-- SECURITY WARNING: The customer_sync_dashboard view has been removed due to security issues.
-- It exposed auth.users data to authenticated users and used SECURITY DEFINER.
-- Use the secure functions instead:
--   - get_admin_sync_dashboard() - for admin access (service role only)
--   - get_my_sync_status() - for users to check their own status
--   - get_customer_sync_status(p_user_id UUID) - for checking specific user status
-- See fix-security-issues.sql for the secure implementation.

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION sync_customer_from_shopify TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_sync_status TO authenticated;
GRANT EXECUTE ON FUNCTION find_user_by_shopify_id TO authenticated;
GRANT EXECUTE ON FUNCTION get_customers_needing_sync TO authenticated;

-- Create RLS policies for the new columns
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own shopify data" ON profiles;
DROP POLICY IF EXISTS "Users can update own shopify data" ON profiles;
DROP POLICY IF EXISTS "Service role can manage shopify data" ON profiles;

-- Policy to allow users to read their own Shopify data
CREATE POLICY "Users can view own shopify data" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy to allow users to update their own Shopify data
CREATE POLICY "Users can update own shopify data" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy to allow service role to manage all Shopify data
CREATE POLICY "Service role can manage shopify data" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON COLUMN profiles.shopify_customer_id IS 'Shopify customer ID for synchronization';
COMMENT ON COLUMN profiles.shopify_synced_at IS 'Timestamp of last Shopify synchronization';
COMMENT ON COLUMN profiles.phone IS 'Customer phone number from Shopify';
COMMENT ON COLUMN profiles.address IS 'Customer address data from Shopify as JSON';
COMMENT ON COLUMN profiles.shopify_verified IS 'Email verification status from Shopify';
COMMENT ON COLUMN profiles.shopify_accepts_marketing IS 'Marketing consent status from Shopify';
COMMENT ON COLUMN profiles.shopify_tags IS 'Customer tags from Shopify';
COMMENT ON COLUMN profiles.shopify_note IS 'Customer notes from Shopify';

COMMENT ON FUNCTION sync_customer_from_shopify IS 'Syncs customer data from Shopify to Supabase profile';
COMMENT ON FUNCTION get_customer_sync_status IS 'Returns sync status and age for a customer';
COMMENT ON FUNCTION find_user_by_shopify_id IS 'Finds Supabase user by Shopify customer ID';
COMMENT ON FUNCTION get_customers_needing_sync IS 'Returns customers that need synchronization';
COMMENT ON FUNCTION cleanup_orphaned_shopify_refs IS 'Cleans up orphaned Shopify references';
