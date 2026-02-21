-- ============================================================================
-- Full-Text Search (FTS) para links — WebNest
-- ============================================================================
-- Adiciona coluna tsvector + índice GIN + trigger de atualização automática
-- + função RPC para busca server-side com ranking de relevância.
-- ============================================================================

-- 1. Coluna tsvector para busca full-text
ALTER TABLE public.links
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Índice GIN para performance
CREATE INDEX IF NOT EXISTS idx_links_search_vector
ON public.links USING GIN (search_vector);

-- 3. Função para gerar o tsvector a partir dos campos do link
CREATE OR REPLACE FUNCTION public.links_search_vector_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('portuguese', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.url, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.category, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.notes, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger para atualizar search_vector automaticamente em INSERT/UPDATE
DROP TRIGGER IF EXISTS trigger_links_search_vector ON public.links;
CREATE TRIGGER trigger_links_search_vector
  BEFORE INSERT OR UPDATE OF title, url, description, category, notes, tags
  ON public.links
  FOR EACH ROW
  EXECUTE FUNCTION public.links_search_vector_update();

-- 5. Popular search_vector para links existentes
UPDATE public.links SET search_vector =
  setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('portuguese', coalesce(url, '')), 'B') ||
  setweight(to_tsvector('portuguese', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('portuguese', coalesce(category, '')), 'C') ||
  setweight(to_tsvector('portuguese', coalesce(notes, '')), 'C') ||
  setweight(to_tsvector('portuguese', coalesce(array_to_string(tags, ' '), '')), 'C');

-- 6. Função RPC para busca full-text com ranking
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
  -- Converte a query do usuário para tsquery
  -- plainto_tsquery lida com espaços e caracteres especiais
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
    l.created_at,
    l."position",
    ts_rank_cd(l.search_vector, tsquery_val) AS rank
  FROM public.links l
  WHERE l.user_id = user_id_param
    AND l.search_vector @@ tsquery_val
  ORDER BY rank DESC;
END;
$$;

-- 7. Grant para authenticated users
GRANT EXECUTE ON FUNCTION public.search_links(TEXT, UUID) TO authenticated;
