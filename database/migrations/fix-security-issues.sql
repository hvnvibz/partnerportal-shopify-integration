-- Fix Supabase Security Issues
-- Remove problematic customer_sync_dashboard view and replace with secure functions

-- Drop the problematic view
DROP VIEW IF EXISTS customer_sync_dashboard;

-- Create secure function for admin dashboard (only accessible by service role)
CREATE OR REPLACE FUNCTION get_admin_sync_dashboard()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  display_name TEXT,
  shopify_customer_id BIGINT,
  shopify_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT,
  sync_age_hours NUMERIC,
  phone TEXT,
  shopify_verified BOOLEAN,
  shopify_accepts_marketing BOOLEAN,
  shopify_tags TEXT,
  user_created_at TIMESTAMP WITH TIME ZONE
) 
SECURITY DEFINER -- Only allow service role to execute
AS $$
BEGIN
  -- Only allow service role to access this function
  IF auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: This function requires service role';
  END IF;

  RETURN QUERY
  SELECT 
    p.id as user_id,
    au.email,
    p.display_name,
    p.shopify_customer_id,
    p.shopify_synced_at,
    CASE 
      WHEN p.shopify_customer_id IS NULL THEN 'Not Synced'
      WHEN p.shopify_synced_at IS NULL THEN 'Never Synced'
      WHEN EXTRACT(EPOCH FROM (NOW() - p.shopify_synced_at)) / 3600 < 1 THEN 'Recently Synced'
      WHEN EXTRACT(EPOCH FROM (NOW() - p.shopify_synced_at)) / 3600 < 24 THEN 'Synced Today'
      WHEN EXTRACT(EPOCH FROM (NOW() - p.shopify_synced_at)) / 3600 < 168 THEN 'Synced This Week'
      ELSE 'Needs Sync'
    END as sync_status,
    EXTRACT(EPOCH FROM (NOW() - p.shopify_synced_at)) / 3600 as sync_age_hours,
    p.phone,
    p.shopify_verified,
    p.shopify_accepts_marketing,
    p.shopify_tags,
    au.created_at as user_created_at
  FROM profiles p
  JOIN auth.users au ON p.id = au.id
  ORDER BY p.shopify_synced_at ASC NULLS FIRST;
END;
$$ LANGUAGE plpgsql;

-- Create secure function for user's own sync status
CREATE OR REPLACE FUNCTION get_my_sync_status()
RETURNS TABLE(
  is_synced BOOLEAN,
  shopify_customer_id BIGINT,
  last_synced TIMESTAMP WITH TIME ZONE,
  sync_age_hours NUMERIC,
  sync_status TEXT
) 
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (p.shopify_customer_id IS NOT NULL) as is_synced,
    p.shopify_customer_id,
    p.shopify_synced_at as last_synced,
    EXTRACT(EPOCH FROM (NOW() - p.shopify_synced_at)) / 3600 as sync_age_hours,
    CASE 
      WHEN p.shopify_customer_id IS NULL THEN 'Not Synced'
      WHEN p.shopify_synced_at IS NULL THEN 'Never Synced'
      WHEN EXTRACT(EPOCH FROM (NOW() - p.shopify_synced_at)) / 3600 < 1 THEN 'Recently Synced'
      WHEN EXTRACT(EPOCH FROM (NOW() - p.shopify_synced_at)) / 3600 < 24 THEN 'Synced Today'
      WHEN EXTRACT(EPOCH FROM (NOW() - p.shopify_synced_at)) / 3600 < 168 THEN 'Synced This Week'
      ELSE 'Needs Sync'
    END as sync_status
  FROM profiles p
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_my_sync_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_sync_dashboard TO service_role;

-- Update existing function to be more secure
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

-- Comments
COMMENT ON FUNCTION get_admin_sync_dashboard IS 'Admin dashboard for customer sync status (service role only)';
COMMENT ON FUNCTION get_my_sync_status IS 'User can check their own sync status';
COMMENT ON FUNCTION get_customer_sync_status IS 'Check sync status for specific user (own data or service role)';
