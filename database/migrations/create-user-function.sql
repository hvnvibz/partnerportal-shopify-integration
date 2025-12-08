-- SQL-Funktion für sichere Benutzer-Erstellung mit Profil
-- Diese Funktion umgeht die Admin API-Probleme und erstellt Benutzer direkt

CREATE OR REPLACE FUNCTION create_user_with_profile(
  user_email TEXT,
  user_password TEXT,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  company TEXT DEFAULT '',
  customer_number TEXT DEFAULT '',
  shopify_customer_id BIGINT DEFAULT NULL,
  phone TEXT DEFAULT NULL,
  address JSONB DEFAULT NULL,
  shopify_verified BOOLEAN DEFAULT FALSE,
  shopify_accepts_marketing BOOLEAN DEFAULT FALSE,
  shopify_tags TEXT DEFAULT NULL,
  shopify_note TEXT DEFAULT NULL
)
RETURNS TABLE(
  user_id UUID,
  success BOOLEAN,
  message TEXT
)
SECURITY DEFINER -- Nur Service Role kann ausführen
LANGUAGE plpgsql
AS $$
DECLARE
  new_user_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Nur Service Role kann diese Funktion ausführen
  IF auth.role() != 'service_role' THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Access denied: Service role required'::TEXT;
    RETURN;
  END IF;

  -- Prüfe, ob Benutzer bereits existiert
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = user_email) INTO profile_exists;
  
  IF profile_exists THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'User already exists'::TEXT;
    RETURN;
  END IF;

  -- Erstelle neuen Benutzer in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::UUID,
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Erstelle Profil
  INSERT INTO public.profiles (
    id,
    display_name,
    company,
    customer_number,
    shopify_customer_id,
    phone,
    address,
    shopify_verified,
    shopify_accepts_marketing,
    shopify_tags,
    shopify_note,
    shopify_synced_at,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    COALESCE(first_name || ' ' || last_name, ''),
    company,
    customer_number,
    shopify_customer_id,
    phone,
    address,
    shopify_verified,
    shopify_accepts_marketing,
    shopify_tags,
    shopify_note,
    NOW(),
    NOW(),
    NOW()
  );

  RETURN QUERY SELECT new_user_id, TRUE, 'User created successfully'::TEXT;
END;
$$;

-- Berechtigungen setzen
GRANT EXECUTE ON FUNCTION create_user_with_profile TO service_role;

-- Kommentar hinzufügen
COMMENT ON FUNCTION create_user_with_profile IS 'Creates a new user with profile data (service role only)';
