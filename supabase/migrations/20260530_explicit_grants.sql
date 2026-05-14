-- ============================================================================
-- Migration: GRANTs Explícitos para Data API (Supabase breaking change)
-- ============================================================================
-- Contexto:
--   A partir de 30/05/2026, novos projetos Supabase não expõem tabelas do
--   schema `public` à Data API (supabase-js / PostgREST / GraphQL) sem um
--   GRANT explícito. A partir de 30/10/2026, isso será aplicado a todos os
--   projetos existentes.
--
--   Esta migration torna explícito o acesso que hoje é concedido
--   implicitamente, garantindo que o app continue funcionando após o rollout.
--
-- Roles relevantes:
--   - authenticated : usuários logados via supabase-js (uso principal do app)
--   - service_role  : edge functions e tarefas administrativas
--   - anon          : NÃO recebe acesso (app exige autenticação obrigatória)
--
-- Referência: https://supabase.com/docs/guides/database/postgres/grants
-- ============================================================================

-- ----------------------------------------
-- Tabela: public.links
-- ----------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.links
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.links
  TO service_role;

-- ----------------------------------------
-- Tabela: public.categories
-- ----------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.categories
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.categories
  TO service_role;

-- ----------------------------------------
-- Verificação: RLS continua ativo
-- ----------------------------------------
-- As políticas RLS user-scoped existentes (definidas em 20260215...)
-- continuam em vigor e controlam quais linhas cada usuário pode ver/editar.
-- Os GRANTs acima apenas permitem que o role alcance a tabela;
-- as políticas decidem quais linhas são visíveis.
--
-- Resumo das políticas ativas (não alteradas por esta migration):
--   links      → SELECT/INSERT/UPDATE/DELETE WHERE auth.uid() = user_id
--   categories → SELECT/INSERT/UPDATE/DELETE WHERE auth.uid() = user_id
-- ============================================================================
