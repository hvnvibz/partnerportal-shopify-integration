-- Fix: Infinite Recursion in RLS Policies
-- Das Problem: Die Policy "Admins can view all user data" prüft die Rolle in der profiles Tabelle,
-- während sie selbst auf die profiles Tabelle angewendet wird, was zu einer Endlosschleife führt.

-- Lösung: Entferne die zirkuläre Admin-Policy
-- Wir nutzen sowieso supabaseAdmin (service role) für alle Admin-Operationen über API-Routes,
-- daher brauchen wir diese Policy nicht für Client-Zugriffe.

-- Entferne die zirkuläre Admin-Policy
DROP POLICY IF EXISTS "Admins can view all user data" ON profiles;

-- Die Policy "Users can view own role and status" bleibt aktiv
-- Sie erlaubt es Usern, ihr eigenes Profil (inkl. role und status) zu lesen
-- Diese Policy ist nicht zirkulär, da sie nur auth.uid() verwendet

-- Prüfe, ob die Policy "Users can view own role and status" existiert und aktiv ist
-- Falls nicht, erstelle sie:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view own role and status'
  ) THEN
    CREATE POLICY "Users can view own role and status" ON profiles
      FOR SELECT 
      USING (auth.uid() = id);
  END IF;
END $$;

-- Prüfe alle verbleibenden Policies
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

