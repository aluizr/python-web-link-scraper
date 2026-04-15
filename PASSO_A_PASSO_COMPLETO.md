# 🚀 Passo a Passo Completo - Migração de Links

## 📋 Resumo

Você tem links salvos em outro projeto Supabase e quer transferi-los para o projeto atual.

---

## ✅ PASSO 1: Exportar Links do Projeto Antigo

### Opção A: Via Supabase Dashboard (Mais Fácil)

1. **Acesse**: https://app.supabase.com
2. **Selecione** o projeto onde seus links estão
3. **Vá para**: Table Editor (menu lateral)
4. **Selecione**: tabela `links`
5. **Clique**: botão "..." (três pontos) → "Download as CSV"
6. **Salve**: como `links_backup.csv` na pasta do projeto

### Opção B: Via SQL Editor

1. **Acesse**: SQL Editor no projeto antigo
2. **Execute**:

```sql
SELECT 
  url, title, description, category, tags, 
  is_favorite, favicon, og_image, notes,
  status, priority, due_date, created_at
FROM public.links
WHERE is_deleted = false OR is_deleted IS NULL
ORDER BY created_at DESC;
```

3. **Copie** os resultados
4. **Salve** em formato CSV ou JSON

---

## ✅ PASSO 2: Preparar o Projeto Novo

### 2.1 - Aplicar Migrations no Supabase

1. **Acesse**: https://app.supabase.com
2. **Selecione**: projeto novo (qanlbsstfxwicultliiq)
3. **Vá para**: SQL Editor
4. **Clique**: + New Query
5. **Cole e Execute** este SQL:

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
SELECT 'Migration aplicada com sucesso!' as status;
```

6. **Aguarde** a execução (deve retornar: "Migration aplicada com sucesso!")

### 2.2 - Verificar se Funcionou

No terminal do projeto, execute:

```bash
python corrigir_banco.py
```

**Resultado esperado**: ✅ BANCO DE DADOS OK!

---

## ✅ PASSO 3: Importar os Links

### 3.1 - Colocar o Arquivo na Pasta

Copie o arquivo `links_backup.csv` (ou `.json`) para a pasta do projeto:

```
python-web-link-scraper/
├── links_backup.csv  ← Aqui!
├── importar_links.py
└── ...
```

### 3.2 - Executar a Importação

No terminal:

```bash
# Para CSV
python importar_links.py links_backup.csv

# Para JSON
python importar_links.py links_backup.json

# Ignorar duplicatas (se já importou antes)
python importar_links.py links_backup.csv --skip-duplicates
```

### 3.3 - Acompanhar o Progresso

O script vai mostrar:
- ✅ Quantos links foram encontrados
- ✅ Quantos são válidos
- ✅ Progresso da importação em lotes
- ✅ Resumo final

**Exemplo de saída**:
```
======================================================================
  📦 Importação de Links
======================================================================

📄 Arquivo: links_backup.csv
📋 Formato: .csv

🔍 Lendo arquivo...
   ✅ 150 links encontrados

🔧 Normalizando dados...
   ✅ 150 links válidos

📡 Conectando ao Supabase...
   ✅ Conectado

📥 Importando links...
   ✅ Lote 1/3: 50 links importados
   ✅ Lote 2/3: 50 links importados
   ✅ Lote 3/3: 50 links importados

======================================================================
  📊 RESUMO DA IMPORTAÇÃO
======================================================================
  Total no arquivo: 150
  Links válidos: 150
  ✅ Importados com sucesso: 150
======================================================================

✅ Importação concluída!

🌐 Acesse: http://localhost:8080
```

---

## ✅ PASSO 4: Verificar os Links

### 4.1 - Executar Diagnóstico

```bash
python diagnostico_links.py
```

**Deve mostrar**:
- Total de links
- Links ativos
- Categorias

### 4.2 - Acessar a Interface

1. **Certifique-se** de que o servidor está rodando:
```bash
python start_server.py
```

2. **Abra** o navegador em: http://localhost:8080

3. **Verifique**:
   - ✅ Links aparecem na tela
   - ✅ Categorias estão corretas
   - ✅ Tags estão preservadas
   - ✅ Favoritos marcados

---

## 🆘 Problemas e Soluções

### ❌ Erro: "Row-level security"

**Causa**: RLS não foi desabilitado

**Solução**: Execute no SQL Editor do Supabase:
```sql
ALTER TABLE public.links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
```

### ❌ Erro: "Column does not exist"

**Causa**: Migrations não foram aplicadas

**Solução**: Execute o SQL completo do Passo 2.1

### ❌ Erro: "Duplicate key value"

**Causa**: Alguns links já existem no banco

**Solução**: Use a flag `--skip-duplicates`:
```bash
python importar_links.py links_backup.csv --skip-duplicates
```

### ❌ Links não aparecem na interface

**Causa**: Servidor não foi reiniciado ou há erro no frontend

**Solução**:
1. Pare o servidor (CTRL+C)
2. Reinicie: `python start_server.py`
3. Limpe o cache do navegador (CTRL+SHIFT+R)
4. Acesse: http://localhost:8080

### ❌ Tags não importaram corretamente

**Causa**: Formato incorreto no CSV

**Solução**: No CSV, tags devem estar entre aspas e separadas por vírgula:
```csv
url,title,tags
https://exemplo.com,Título,"tag1,tag2,tag3"
```

---

## 📊 Comandos Úteis

```bash
# Verificar quantos links foram importados
python -c "from app.database import get_supabase; db = get_supabase(); result = db.table('links').select('id').execute(); print(f'Total: {len(result.data)}')"

# Exportar links do projeto atual (backup)
python exportar_links.py --formato csv

# Diagnóstico completo
python diagnostico_links.py

# Verificar servidor
python verificar_servidor.py

# Adicionar link de teste
python adicionar_link_teste.py
```

---

## ✅ Checklist Final

- [ ] Exportei os links do projeto antigo
- [ ] Apliquei as migrations no projeto novo
- [ ] Executei `python corrigir_banco.py` (retornou OK)
- [ ] Coloquei o arquivo CSV/JSON na pasta do projeto
- [ ] Executei `python importar_links.py arquivo.csv`
- [ ] Importação foi concluída com sucesso
- [ ] Executei `python diagnostico_links.py`
- [ ] Servidor está rodando (`python start_server.py`)
- [ ] Acessei http://localhost:8080
- [ ] Links aparecem na interface ✅

---

## 🎉 Pronto!

Seus links foram migrados com sucesso! 

Agora você pode:
- ✅ Visualizar todos os seus links
- ✅ Adicionar novos links
- ✅ Organizar por categorias
- ✅ Usar o scraper para capturar metadados
- ✅ Exportar para backup

---

**Última atualização**: 15 de Abril de 2026
**Versão**: 0.14.4
