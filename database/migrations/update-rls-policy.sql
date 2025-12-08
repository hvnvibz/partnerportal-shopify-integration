-- Update RLS Policy für User, um ihren eigenen Status und Rolle zu lesen
-- Diese Policy sollte bereits existieren, aber wir stellen sicher, dass sie korrekt ist

-- Entferne die Policy falls sie bereits existiert
DROP POLICY IF EXISTS "Users can view own role and status" ON profiles;

-- Erstelle die Policy neu mit korrekter USING-Klausel
-- WICHTIG: Diese Policy erlaubt es authentifizierten Usern, ihr eigenes Profil (inkl. role und status) zu lesen
CREATE POLICY "Users can view own role and status" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Prüfe, ob die Policy korrekt erstellt wurde
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND policyname = 'Users can view own role and status';







