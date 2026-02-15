-- Supabase Migration - MELHORIAS DE SEGURANÇA ADICIONAIS
-- Execute esta migração após aplicar as versões anteriores

-- 1. Adicionar índices para performance e segurança
CREATE INDEX idx_links_user_id ON public.links(user_id);
CREATE INDEX idx_links_created_at ON public.links(created_at DESC);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);

-- 2. Adicionar triggers para auditoria (optional but recommended)
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id UUID REFERENCES auth.users(id),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Adicionar função para registrar mudanças
CREATE OR REPLACE FUNCTION log_audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, action, user_id, new_values)
    VALUES (TG_TABLE_NAME, 'INSERT', auth.uid(), row_to_json(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, action, user_id, old_values, new_values)
    VALUES (TG_TABLE_NAME, 'UPDATE', auth.uid(), row_to_json(OLD), row_to_json(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, action, user_id, old_values)
    VALUES (TG_TABLE_NAME, 'DELETE', auth.uid(), row_to_json(OLD));
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar triggers para auditoria
CREATE TRIGGER audit_links_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.links
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER audit_categories_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

-- 5. Adicionar índice para TTL (Time To Live) se necessário
-- Deletar links/categorias órfãs automaticamente
ALTER TABLE public.links
  ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.categories
  ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- 6. Função para soft delete com segurança
CREATE OR REPLACE FUNCTION soft_delete_link(link_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.links
  SET deleted_at = now()
  WHERE id = link_id AND auth.uid() = user_id;
$$;

-- 7. Atualizar RLS policies para ignorar registros deletados
DROP POLICY IF EXISTS "Users can view their own links" ON public.links;

CREATE POLICY "Users can view their own links"
  ON public.links FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- 8. Adicionar função para limpar dados antigos (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INT DEFAULT 90)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.audit_log
  WHERE created_at < now() - (days_to_keep || ' days')::INTERVAL;
$$;

-- 9. Enable realtime para notificações de mudanças
ALTER PUBLICATION supabase_realtime ADD TABLE public.links;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;

-- Comentários documentando o schema
COMMENT ON TABLE public.links IS 'Tabela de links do usuário com validações de segurança';
COMMENT ON TABLE public.categories IS 'Categorias de organização de links';
COMMENT ON TABLE public.audit_log IS 'Log de auditoria de todas as mudanças';
COMMENT ON COLUMN public.links.user_id IS 'ID do usuário proprietário do link (relationship com auth.users)';
