-- RLS-Policies Diagnose für profiles-Tabelle
-- Führe diese Queries im Supabase SQL Editor aus, um RLS-Probleme zu identifizieren

-- 1. Zeige alle RLS-Policies auf der profiles-Tabelle
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- 2. Prüfe ob RLS aktiviert ist
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 3. Zeige alle INSERT-Policies (wichtig für upsert)
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'INSERT';

-- 4. Zeige alle UPDATE-Policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'UPDATE';

-- 5. Test-Query: Prüfe ob Service Role Policy existiert
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND (qual LIKE '%service_role%' OR with_check LIKE '%service_role%');

-- 6. Zeige alle Policies die ALL erlauben (für Service Role)
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'ALL';


