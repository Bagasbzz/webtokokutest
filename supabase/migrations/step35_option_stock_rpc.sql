-- Atomic stock update for product stock and option stock stored in products.option_groups.
-- This keeps the existing JSONB option model while preventing option stock oversell.

CREATE OR REPLACE FUNCTION decrement_product_stock_with_options(
  p_product_id UUID,
  p_quantity INT,
  p_selected_option_ids TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INT;
  current_option_groups JSONB;
  next_option_groups JSONB := '[]'::JSONB;
  option_group JSONB;
  option_value JSONB;
  next_values JSONB;
  option_key TEXT;
  selected_count INT := 0;
  expected_count INT := 0;
  option_stock INT;
  is_owner BOOLEAN;
BEGIN
  IF p_quantity <= 0 THEN
    RETURN FALSE;
  END IF;

  IF auth.role() = 'service_role' THEN
    is_owner := TRUE;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      JOIN sellers sel ON sel.id = s.seller_id
      WHERE p.id = p_product_id AND sel.user_id = auth.uid()
    ) INTO is_owner;
  END IF;

  IF NOT is_owner THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT stok, COALESCE(option_groups, '[]'::JSONB)
  INTO current_stock, current_option_groups
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF current_stock IS NULL OR current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;

  SELECT COUNT(DISTINCT option_id)
  INTO expected_count
  FROM unnest(COALESCE(p_selected_option_ids, ARRAY[]::TEXT[])) AS selected_options(option_id)
  WHERE option_id IS NOT NULL AND option_id <> '';

  FOR option_group IN SELECT * FROM jsonb_array_elements(current_option_groups)
  LOOP
    next_values := '[]'::JSONB;

    FOR option_value IN SELECT * FROM jsonb_array_elements(COALESCE(option_group->'values', '[]'::JSONB))
    LOOP
      option_key := COALESCE(option_group->>'id', option_group->>'name', '') || '-' ||
                    COALESCE(option_value->>'id', option_value->>'label', '');

      IF option_key = ANY(COALESCE(p_selected_option_ids, ARRAY[]::TEXT[])) THEN
        selected_count := selected_count + 1;

        IF option_value ? 'stock' AND jsonb_typeof(option_value->'stock') = 'number' THEN
          option_stock := (option_value->>'stock')::INT;
          IF option_stock < p_quantity THEN
            RETURN FALSE;
          END IF;

          option_value := jsonb_set(option_value, '{stock}', to_jsonb(option_stock - p_quantity), TRUE);
        END IF;
      END IF;

      next_values := next_values || jsonb_build_array(option_value);
    END LOOP;

    next_option_groups := next_option_groups || jsonb_build_array(
      jsonb_set(option_group, '{values}', next_values, TRUE)
    );
  END LOOP;

  IF selected_count < expected_count THEN
    RETURN FALSE;
  END IF;

  UPDATE products
  SET
    stok = current_stock - p_quantity,
    option_groups = next_option_groups
  WHERE id = p_product_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_product_stock_with_options(
  p_product_id UUID,
  p_quantity INT,
  p_selected_option_ids TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
  current_option_groups JSONB;
  next_option_groups JSONB := '[]'::JSONB;
  option_group JSONB;
  option_value JSONB;
  next_values JSONB;
  option_key TEXT;
  option_stock INT;
  is_owner BOOLEAN;
BEGIN
  IF p_quantity <= 0 THEN
    RETURN FALSE;
  END IF;

  IF auth.role() = 'service_role' THEN
    is_owner := TRUE;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      JOIN sellers sel ON sel.id = s.seller_id
      WHERE p.id = p_product_id AND sel.user_id = auth.uid()
    ) INTO is_owner;
  END IF;

  IF NOT is_owner THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT COALESCE(option_groups, '[]'::JSONB)
  INTO current_option_groups
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF current_option_groups IS NULL THEN
    RETURN FALSE;
  END IF;

  FOR option_group IN SELECT * FROM jsonb_array_elements(current_option_groups)
  LOOP
    next_values := '[]'::JSONB;

    FOR option_value IN SELECT * FROM jsonb_array_elements(COALESCE(option_group->'values', '[]'::JSONB))
    LOOP
      option_key := COALESCE(option_group->>'id', option_group->>'name', '') || '-' ||
                    COALESCE(option_value->>'id', option_value->>'label', '');

      IF option_key = ANY(COALESCE(p_selected_option_ids, ARRAY[]::TEXT[])) THEN
        IF option_value ? 'stock' AND jsonb_typeof(option_value->'stock') = 'number' THEN
          option_stock := (option_value->>'stock')::INT;
          option_value := jsonb_set(option_value, '{stock}', to_jsonb(option_stock + p_quantity), TRUE);
        END IF;
      END IF;

      next_values := next_values || jsonb_build_array(option_value);
    END LOOP;

    next_option_groups := next_option_groups || jsonb_build_array(
      jsonb_set(option_group, '{values}', next_values, TRUE)
    );
  END LOOP;

  UPDATE products
  SET
    stok = stok + p_quantity,
    option_groups = next_option_groups
  WHERE id = p_product_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION decrement_product_stock_with_options(UUID, INT, TEXT[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_product_stock_with_options(UUID, INT, TEXT[]) TO anon, authenticated, service_role;
