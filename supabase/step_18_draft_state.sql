-- Step 18: Draft vs Published State for Customizations
ALTER TABLE template_customizations 
ADD COLUMN is_draft BOOLEAN DEFAULT true;

-- Update existing data to be published (optional, but safer for existing stores)
-- UPDATE template_customizations SET is_draft = false;

-- Update Primary Key to include is_draft to allow side-by-side versions
ALTER TABLE template_customizations DROP CONSTRAINT template_customizations_pkey;
ALTER TABLE template_customizations ADD PRIMARY KEY (store_id, section_key, element_key, is_draft);

-- Update RLS if needed (already handled by store_id logic usually)
