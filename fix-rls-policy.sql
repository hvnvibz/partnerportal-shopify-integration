-- Fix RLS Policy für User, um ihren eigenen Status zu lesen
-- Diese Policy erlaubt es authentifizierten Usern, ihren eigenen role und status zu lesen

-- Entferne die Policy falls sie bereits existiert (mit anderem Namen)
DROP POLICY IF EXISTS "Users can view own role and status" ON profiles;

-- Erstelle die Policy neu
CREATE POLICY "Users can view own role and status" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Prüfe, ob die Policy aktiv ist
-- In Supabase Dashboard: Table Editor → profiles → Policies → "Users can view own role and status" sollte aktiviert sein

