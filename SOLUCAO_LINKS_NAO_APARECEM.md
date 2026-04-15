# 🔧 Solução: Links Não Aparecem

## 🎯 Problema Identificado

Os links não estão aparecendo porque:

1. ❌ **As migrations do banco de dados não foram aplicadas**
2. ❌ **As políticas RLS (Row Level Security) estão bloqueando o acesso**
3. ❌ **A estrutura da tabela está incompleta**

## ✅ Solução Passo a Passo

### Passo 1: Acessar o Supabase Dashboard

1. Abra seu navegador
2. Acesse: https://app.supabase.com
3. Faça login
4. Selecione seu projeto: **qanlbsstfxwicultliiq**

### Passo 2: Aplicar as Migrations

1. No menu lateral, clique em **SQL Editor**
2. Clique em **+ New Query**
3. Cole o SQL abaixo e clique em **Run**

```sql
-- ============================================================
-- MIGRATION COMPLETA - Python Web Link Scraper
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

-- 4. Desabilitar RLS temporariamente (para app pessoal sem autenticação)
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
SELECT 'Migration aplicada com sucesso!' as status;
```

### Passo 3: Verificar se Funcionou

1. Volte ao terminal
2. Execute:

```bash
python diagnostico_links.py
```

3. Você deve ver: ✅ "TUDO OK!"

### Passo 4: Adicionar Links de Teste

Execute:

```bash
python adicionar_link_teste.py
```

### Passo 5: Acessar a Interface

1. Abra seu navegador
2. Acesse: http://localhost:8080
3. Seus links devem aparecer!

## 🔄 Se Você Já Tem Links em Outro Projeto

Se você tem links salvos em outro projeto Supabase:

### Opção 1: Exportar e Importar

1. No projeto antigo:
   - Vá para **Table Editor** → **links**
   - Clique em **Export** → **CSV**
   
2. No projeto novo:
   - Use a interface em http://localhost:8080
   - Clique em **Importar** (quando implementado)
   - Ou use o SQL Editor para importar

### Opção 2: Mudar a Conexão

Edite o arquivo `.env` e mude para o projeto correto:

```env
SUPABASE_URL=https://seu-projeto-antigo.supabase.co
SUPABASE_KEY=sua_chave_antiga
```

## 📊 Verificar Dados no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **Table Editor**
3. Selecione a tabela **links**
4. Você deve ver seus links listados

## 🆘 Ainda Não Funciona?

Execute o diagnóstico completo:

```bash
python diagnostico_links.py
```

E me envie a saída para eu ajudar!

## 📝 Comandos Úteis

```bash
# Verificar estrutura do banco
python -c "from app.database import get_supabase; db = get_supabase(); result = db.table('links').select('*').limit(1).execute(); print(list(result.data[0].keys()) if result.data else 'Vazio')"

# Contar links
python -c "from app.database import get_supabase; db = get_supabase(); result = db.table('links').select('id').execute(); print(f'Total: {len(result.data)}')"

# Adicionar link de teste
python adicionar_link_teste.py

# Diagnóstico completo
python diagnostico_links.py

# Verificar servidor
python verificar_servidor.py
```

## 🎯 Resumo

1. ✅ Aplicar migration SQL no Supabase Dashboard
2. ✅ Desabilitar RLS (para app pessoal)
3. ✅ Adicionar link de teste
4. ✅ Acessar http://localhost:8080

---

**Última atualização**: 15 de Abril de 2026
