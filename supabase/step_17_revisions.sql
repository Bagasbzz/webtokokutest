-- Step 17: Revision History System
CREATE TABLE template_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  is_published BOOLEAN DEFAULT false,
  -- Ensure unique revision number per store
  UNIQUE(store_id, revision_number)
);

-- RLS
ALTER TABLE template_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "revisions_owner" ON template_revisions FOR ALL USING (
  store_id IN (
    SELECT id FROM stores WHERE seller_id IN (
      SELECT id FROM sellers WHERE user_id = auth.uid()
    )
  )
);

-- Index for performance
CREATE INDEX idx_revisions_store_id ON template_revisions(store_id);
CREATE INDEX idx_revisions_number ON template_revisions(revision_number DESC);
