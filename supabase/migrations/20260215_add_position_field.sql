-- Add position field to links for drag & drop ordering
ALTER TABLE public.links ADD COLUMN position INTEGER DEFAULT 0;

-- Create an index for better performance when ordering by position
CREATE INDEX idx_links_position ON public.links(user_id, position);

-- Update existing links to have sequential positions based on created_at
WITH ranked_links AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as new_position
  FROM public.links
)
UPDATE public.links
SET position = ranked_links.new_position - 1
FROM ranked_links
WHERE public.links.id = ranked_links.id;
