-- ============================================================
-- MIGRATION COMPLETA - Python Web Link Scraper
-- Execute este SQL no Supabase Dashboard do projeto novo
-- ============================================================

-- 1. Criar tabelas base (se não existirem)
CREATE TABLE IF NOT EXISTS public.links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  favicon TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL
);

-- 2. Adicionar colunas que podem estar faltando
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS og_image TEXT DEFAULT '';
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'backlog';
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS position INTEGER;
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#7c3aed';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📁';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- 3. Remover políticas antigas
DROP POLICY IF EXISTS "Allow all access to links" ON public.links;
DROP POLICY IF EXISTS "Allow all access to categories" ON public.categories;

-- 4. Desabilitar RLS (para app pessoal sem autenticação)
ALTER TABLE public.links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- 5. Inserir categorias padrão (se não existirem)
INSERT INTO public.categories (name, color, icon, position)
VALUES 
  ('Trabalho', '#3b82f6', '💼', 1),
  ('Estudos', '#10b981', '📚', 2),
  ('Lazer', '#f59e0b', '🎮', 3)
ON CONFLICT DO NOTHING;

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_links_category ON public.links(category);
CREATE INDEX IF NOT EXISTS idx_links_is_favorite ON public.links(is_favorite);
CREATE INDEX IF NOT EXISTS idx_links_is_deleted ON public.links(is_deleted);
CREATE INDEX IF NOT EXISTS idx_links_status ON public.links(status);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON public.links(created_at DESC);

-- Confirmar
SELECT 'Migration aplicada com sucesso! ✅' as status;
