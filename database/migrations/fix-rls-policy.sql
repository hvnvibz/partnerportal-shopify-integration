-- Fix RLS Policy für User, um ihren eigenen Status und Rolle zu lesen
-- Diese Policy erlaubt es authentifizierten Usern, ihren eigenen role und status zu lesen

-- Entferne die Policy falls sie bereits existiert (mit anderem Namen)
DROP POLICY IF EXISTS "Users can view own role and status" ON profiles;

-- Erstelle die Policy neu - erlaubt SELECT auf alle Spalten für den eigenen User
CREATE POLICY "Users can view own role and status" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- WICHTIG: Diese Policy muss aktiviert sein!
-- In Supabase Dashboard: 
-- 1. Table Editor → profiles → Policies
-- 2. Suche nach "Users can view own role and status"
-- 3. Stelle sicher, dass sie aktiviert ist (Toggle sollte ON sein)

-- Prüfe, ob die Policy existiert und aktiv ist:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own role and status';

