CREATE TABLE template_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,          -- e.g. 'hero', 'about'
  element_key TEXT NOT NULL,          -- e.g. 'title', 'image_url'
  value TEXT NOT NULL,                -- Custom value
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, section_key, element_key)
);

ALTER TABLE template_customizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customization_owner" ON template_customizations FOR ALL
  USING (store_id IN (
    SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "customization_public" ON template_customizations FOR SELECT
  USING (true);
