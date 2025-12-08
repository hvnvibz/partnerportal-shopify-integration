-- Bulk Link Customers: Manuelle Verknüpfung von Shopify-Kunden mit Partnerportal-Usern
-- 
-- Dieses Script zeigt, wie Sie einzelne User manuell mit Shopify-Kunden verknüpfen können.
-- 
-- WICHTIG: Dieses Script erstellt KEINE neuen User. Es verknüpft nur bestehende User.
-- 
-- Verwendung:
-- 1. Ersetzen Sie die Platzhalter (USER_EMAIL, SHOPIFY_CUSTOMER_ID) mit echten Werten
-- 2. Führen Sie die UPDATE-Statements im Supabase SQL Editor aus
-- 3. Oder nutzen Sie die API-Route /api/admin/bulk-link-customers für automatische Verknüpfung

-- Beispiel 1: Einzelnen User verknüpfen (per E-Mail)
-- Ersetzen Sie 'user@example.com' mit der E-Mail des Partners und 123456789 mit der Shopify Customer ID
UPDATE profiles
SET 
  shopify_customer_id = 123456789,
  shopify_synced_at = NOW()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);

-- Beispiel 2: Mehrere User auf einmal verknüpfen (mit CASE-Statement)
-- Ersetzen Sie die E-Mail-Adressen und Shopify Customer IDs
UPDATE profiles
SET 
  shopify_customer_id = CASE
    WHEN id = (SELECT id FROM auth.users WHERE email = 'user1@example.com') THEN 111111111
    WHEN id = (SELECT id FROM auth.users WHERE email = 'user2@example.com') THEN 222222222
    WHEN id = (SELECT id FROM auth.users WHERE email = 'user3@example.com') THEN 333333333
    ELSE shopify_customer_id
  END,
  shopify_synced_at = CASE
    WHEN id IN (
      (SELECT id FROM auth.users WHERE email = 'user1@example.com'),
      (SELECT id FROM auth.users WHERE email = 'user2@example.com'),
      (SELECT id FROM auth.users WHERE email = 'user3@example.com')
    ) THEN NOW()
    ELSE shopify_synced_at
  END
WHERE id IN (
  (SELECT id FROM auth.users WHERE email = 'user1@example.com'),
  (SELECT id FROM auth.users WHERE email = 'user2@example.com'),
  (SELECT id FROM auth.users WHERE email = 'user3@example.com')
);

-- Beispiel 3: Prüfen, welche User bereits verknüpft sind
SELECT 
  au.email,
  p.display_name,
  p.shopify_customer_id,
  p.shopify_synced_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.shopify_customer_id IS NOT NULL
ORDER BY p.shopify_synced_at DESC;

-- Beispiel 4: Prüfen, welche User noch NICHT verknüpft sind
SELECT 
  au.email,
  p.display_name,
  p.created_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.shopify_customer_id IS NULL
ORDER BY p.created_at DESC;

-- Beispiel 5: Verknüpfung rückgängig machen (für einen User)
UPDATE profiles
SET 
  shopify_customer_id = NULL,
  shopify_synced_at = NULL
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);

-- HINWEIS: Für automatische Massen-Verknüpfung nutzen Sie bitte die API-Route:
-- POST /api/admin/bulk-link-customers
-- Diese Route:
-- - Holt alle Shopify-Kunden automatisch
-- - Sucht nach passenden Partnerportal-Usern per E-Mail
-- - Verknüpft automatisch und füllt alle Spalten
-- - Gibt eine detaillierte Statistik zurück

