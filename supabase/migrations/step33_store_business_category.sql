-- Step 33: Store business category for onboarding and SEO.

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS business_category TEXT;

CREATE INDEX IF NOT EXISTS idx_stores_business_category
  ON stores(business_category);
