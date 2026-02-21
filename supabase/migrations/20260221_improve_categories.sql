-- ============================================================
-- Migration: Category Improvements
-- 1. Add `position` column for drag & drop ordering
-- 2. Add `color` column for visual differentiation
-- 3. Add unique constraint on (user_id, name, parent_id)
-- ============================================================

-- 1. Position column for category ordering
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- 2. Color column (hex, e.g. "#3B82F6")
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT NULL;

-- 3. Unique constraint: no duplicate names under same parent for same user
-- (NULL parent_id is treated as distinct, so top-level categories are unique separately)
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_unique_name
  ON categories (user_id, name, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'));
