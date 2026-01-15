-- Favoriten-Listen Feature
-- Migration: Erstellt Tabellen für Favoriten-Listen und Favoriten-Items

-- ============================================
-- TABELLEN
-- ============================================

-- Favoriten-Listen (z.B. "Wartungsprodukte", "Standard-Bestellung")
CREATE TABLE IF NOT EXISTS favorite_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Favoriten-Einträge (Produkte in Listen)
CREATE TABLE IF NOT EXISTS favorite_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES favorite_lists(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- Shopify Product ID (z.B. "gid://shopify/Product/123")
  product_handle TEXT NOT NULL, -- für URL-Verlinkung
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, product_id)
);

-- ============================================
-- INDIZES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_favorite_lists_user_id ON favorite_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_items_list_id ON favorite_items(list_id);
CREATE INDEX IF NOT EXISTS idx_favorite_items_product_id ON favorite_items(product_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE favorite_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view own lists" ON favorite_lists;
DROP POLICY IF EXISTS "Users can insert own lists" ON favorite_lists;
DROP POLICY IF EXISTS "Users can update own lists" ON favorite_lists;
DROP POLICY IF EXISTS "Users can delete own lists" ON favorite_lists;
DROP POLICY IF EXISTS "Users can view items in own lists" ON favorite_items;
DROP POLICY IF EXISTS "Users can insert items in own lists" ON favorite_items;
DROP POLICY IF EXISTS "Users can delete items in own lists" ON favorite_items;

-- Policies für favorite_lists
CREATE POLICY "Users can view own lists" ON favorite_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lists" ON favorite_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists" ON favorite_lists
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists" ON favorite_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Policies für favorite_items
CREATE POLICY "Users can view items in own lists" ON favorite_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM favorite_lists WHERE id = list_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert items in own lists" ON favorite_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM favorite_lists WHERE id = list_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete items in own lists" ON favorite_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM favorite_lists WHERE id = list_id AND user_id = auth.uid())
  );

-- ============================================
-- TRIGGER für updated_at
-- ============================================

-- Funktion zum Aktualisieren von updated_at
CREATE OR REPLACE FUNCTION update_favorite_lists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für favorite_lists
DROP TRIGGER IF EXISTS trigger_update_favorite_lists_updated_at ON favorite_lists;
CREATE TRIGGER trigger_update_favorite_lists_updated_at
  BEFORE UPDATE ON favorite_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_favorite_lists_updated_at();

-- ============================================
-- KOMMENTARE
-- ============================================

COMMENT ON TABLE favorite_lists IS 'Favoriten-Listen der Benutzer (z.B. Wartungsprodukte, Standard-Bestellung)';
COMMENT ON TABLE favorite_items IS 'Produkte in Favoriten-Listen';
COMMENT ON COLUMN favorite_lists.user_id IS 'Benutzer-ID (auth.users)';
COMMENT ON COLUMN favorite_lists.name IS 'Name der Liste';
COMMENT ON COLUMN favorite_items.product_id IS 'Shopify Product ID';
COMMENT ON COLUMN favorite_items.product_handle IS 'Shopify Product Handle für URL-Verlinkung';
