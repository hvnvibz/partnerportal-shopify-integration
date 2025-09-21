-- Supabase Schema für Produkthandbücher
-- Diese Tabelle kann für zukünftige Synchronisation mit Notion verwendet werden

-- Tabelle für Produkthandbücher
CREATE TABLE IF NOT EXISTS handbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Notion-Referenz
  notion_id TEXT UNIQUE NOT NULL,
  
  -- Grunddaten
  title TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  product_category TEXT,
  
  -- URLs und Medien
  video_url TEXT,
  video_id TEXT, -- Automatisch extrahiert aus video_url
  handbook_url TEXT,
  datasheet_url TEXT,
  maintenance_url TEXT,
  
  -- Notion-spezifische Felder
  collection_id TEXT,
  locale_id TEXT,
  item_id TEXT,
  
  -- Status
  archived BOOLEAN DEFAULT FALSE,
  draft BOOLEAN DEFAULT FALSE,
  
  -- Metadaten
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_handbooks_slug ON handbooks(slug);
CREATE INDEX IF NOT EXISTS idx_handbooks_notion_id ON handbooks(notion_id);
CREATE INDEX IF NOT EXISTS idx_handbooks_archived_draft ON handbooks(archived, draft);
CREATE INDEX IF NOT EXISTS idx_handbooks_product_category ON handbooks(product_category);

-- Funktion für automatische updated_at Aktualisierung
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für updated_at
DROP TRIGGER IF EXISTS update_handbooks_updated_at ON handbooks;
CREATE TRIGGER update_handbooks_updated_at
    BEFORE UPDATE ON handbooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) aktivieren
ALTER TABLE handbooks ENABLE ROW LEVEL SECURITY;

-- Policy: Alle authentifizierten Benutzer können lesen
CREATE POLICY "Authenticated users can read handbooks" ON handbooks
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Nur Service-Role kann schreiben (für Synchronisation)
CREATE POLICY "Service role can write handbooks" ON handbooks
    FOR ALL USING (auth.role() = 'service_role');

-- Beispiel-Daten (optional)
INSERT INTO handbooks (
  notion_id, title, slug, description, product_category, archived, draft
) VALUES 
  ('example-1', 'KAWK Enthärtungsanlage', 'kawk-enthaertungsanlage', 'Professionelle Enthärtungsanlage', 'Enthärtungsanlagen', false, false),
  ('example-2', 'KAWN Nitratreduzierung', 'nitratreduzierungsanlage-kawn', 'Spezialanlage zur Nitratreduzierung', 'Nitratreduzierung', false, false)
ON CONFLICT (slug) DO NOTHING;

-- View für aktive Handbücher (ohne Archivierte und Entwürfe)
CREATE OR REPLACE VIEW active_handbooks AS
SELECT 
  id,
  notion_id,
  title,
  slug,
  description,
  product_category,
  video_url,
  video_id,
  handbook_url,
  datasheet_url,
  maintenance_url,
  collection_id,
  locale_id,
  item_id,
  created_at,
  updated_at,
  last_synced_at
FROM handbooks 
WHERE archived = false AND draft = false;

-- Funktion für Synchronisation
CREATE OR REPLACE FUNCTION sync_handbook_from_notion(
  p_notion_id TEXT,
  p_title TEXT,
  p_slug TEXT,
  p_description TEXT DEFAULT NULL,
  p_product_category TEXT DEFAULT NULL,
  p_video_url TEXT DEFAULT NULL,
  p_handbook_url TEXT DEFAULT NULL,
  p_datasheet_url TEXT DEFAULT NULL,
  p_maintenance_url TEXT DEFAULT NULL,
  p_collection_id TEXT DEFAULT NULL,
  p_locale_id TEXT DEFAULT NULL,
  p_item_id TEXT DEFAULT NULL,
  p_archived BOOLEAN DEFAULT FALSE,
  p_draft BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
  handbook_id UUID;
  extracted_video_id TEXT;
BEGIN
  -- YouTube-ID extrahieren
  IF p_video_url IS NOT NULL THEN
    extracted_video_id := (
      SELECT (regexp_matches(p_video_url, '(?:youtu\.be\/|v=)([\w-]{11})'))[1]
    );
  END IF;
  
  -- Upsert (Insert oder Update)
  INSERT INTO handbooks (
    notion_id, title, slug, description, product_category,
    video_url, video_id, handbook_url, datasheet_url, maintenance_url,
    collection_id, locale_id, item_id, archived, draft,
    last_synced_at
  ) VALUES (
    p_notion_id, p_title, p_slug, p_description, p_product_category,
    p_video_url, extracted_video_id, p_handbook_url, p_datasheet_url, p_maintenance_url,
    p_collection_id, p_locale_id, p_item_id, p_archived, p_draft,
    NOW()
  )
  ON CONFLICT (notion_id) DO UPDATE SET
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    product_category = EXCLUDED.product_category,
    video_url = EXCLUDED.video_url,
    video_id = EXCLUDED.video_id,
    handbook_url = EXCLUDED.handbook_url,
    datasheet_url = EXCLUDED.datasheet_url,
    maintenance_url = EXCLUDED.maintenance_url,
    collection_id = EXCLUDED.collection_id,
    locale_id = EXCLUDED.locale_id,
    item_id = EXCLUDED.item_id,
    archived = EXCLUDED.archived,
    draft = EXCLUDED.draft,
    last_synced_at = NOW()
  RETURNING id INTO handbook_id;
  
  RETURN handbook_id;
END;
$$ LANGUAGE plpgsql;

-- Kommentare für Dokumentation
COMMENT ON TABLE handbooks IS 'Produkthandbücher synchronisiert aus Notion';
COMMENT ON COLUMN handbooks.notion_id IS 'Eindeutige ID aus Notion';
COMMENT ON COLUMN handbooks.slug IS 'URL-freundlicher Name für Routing';
COMMENT ON COLUMN handbooks.video_id IS 'Automatisch extrahierte YouTube-ID';
COMMENT ON COLUMN handbooks.last_synced_at IS 'Zeitpunkt der letzten Synchronisation mit Notion';
