-- Basic Free/Pro plan fields for WebTokoku stores.
-- Payment is still manual via WhatsApp/admin confirmation.

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pro_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pro_notes TEXT;

ALTER TABLE stores
  DROP CONSTRAINT IF EXISTS stores_plan_check;

ALTER TABLE stores
  ADD CONSTRAINT stores_plan_check CHECK (plan IN ('free', 'pro'));

CREATE INDEX IF NOT EXISTS idx_stores_plan ON stores(plan);
CREATE INDEX IF NOT EXISTS idx_stores_plan_expires_at ON stores(plan_expires_at);
