-- Notion-like ordering: keep explicit order per status column in board view

ALTER TABLE public.links
ADD COLUMN IF NOT EXISTS position_in_status INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_links_status_position
ON public.links(status, position_in_status);

-- Backfill initial order using current global position, partitioned by status
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY status
      ORDER BY position ASC, created_at ASC
    ) - 1 AS new_pos
  FROM public.links
)
UPDATE public.links l
SET position_in_status = r.new_pos
FROM ranked r
WHERE l.id = r.id;

-- search_links return type changed, so drop/recreate safely
DROP FUNCTION IF EXISTS public.search_links(TEXT, UUID);

CREATE OR REPLACE FUNCTION public.search_links(
  search_query TEXT,
  user_id_param UUID
)
RETURNS TABLE (
  id UUID,
  url TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  tags TEXT[],
  is_favorite BOOLEAN,
  favicon TEXT,
  og_image TEXT,
  notes TEXT,
  status TEXT,
  priority TEXT,
  due_date DATE,
  position_in_status INTEGER,
  created_at TIMESTAMPTZ,
  "position" INTEGER,
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tsquery_val tsquery;
BEGIN
  tsquery_val := plainto_tsquery('portuguese', search_query);

  RETURN QUERY
  SELECT
    l.id,
    l.url,
    l.title,
    l.description,
    l.category,
    l.tags,
    l.is_favorite,
    l.favicon,
    l.og_image,
    l.notes,
    l.status,
    l.priority,
    l.due_date,
    l.position_in_status,
    l.created_at,
    l."position",
    ts_rank_cd(l.search_vector, tsquery_val) AS rank
  FROM public.links l
  WHERE l.user_id = user_id_param
    AND l.search_vector @@ tsquery_val
  ORDER BY rank DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_links(TEXT, UUID) TO authenticated;
