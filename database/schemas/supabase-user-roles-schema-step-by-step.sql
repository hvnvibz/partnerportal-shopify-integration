-- User Rollen und Status System - Schrittweise Ausführung
-- Führe jeden Abschnitt einzeln aus, falls es Fehler gibt

-- SCHRITT 1: Spalten hinzufügen
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'partner' CHECK (role IN ('partner', 'admin')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked'));

-- SCHRITT 2: Indizes erstellen
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, status);

-- SCHRITT 3: Bestehende User migrieren
UPDATE profiles 
SET role = 'partner', status = 'active' 
WHERE role IS NULL OR status IS NULL;

-- SCHRITT 4: Admin-Policy für SELECT (kann mit bestehenden Policies kollidieren)
-- Prüfe zuerst, ob bereits eine SELECT Policy existiert:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles' AND policyname LIKE '%view%';

-- Falls keine Konflikte, dann ausführen:
CREATE POLICY IF NOT EXISTS "Admins can view all user data" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- SCHRITT 5: Admin-Policy für UPDATE
CREATE POLICY IF NOT EXISTS "Admins can update user role and status" ON profiles
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

-- SCHRITT 6: Kommentare hinzufügen
COMMENT ON COLUMN profiles.role IS 'User role: partner (default) or admin';
COMMENT ON COLUMN profiles.status IS 'User status: pending (default), active, or blocked';

