-- Custom domains for tenant storefronts.
-- Example: stores.slug = 'rina' serves rina.webtokoku.id, and custom_domain = 'rina.id' serves rina.id.

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS custom_domain TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS stores_custom_domain_unique
  ON stores (custom_domain)
  WHERE custom_domain IS NOT NULL;

COMMENT ON COLUMN stores.custom_domain IS
  'Optional seller-owned domain mapped to this store, normalized without protocol or leading www.';
