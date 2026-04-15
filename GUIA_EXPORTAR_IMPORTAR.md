# 📦 Guia: Exportar e Importar Links Entre Projetos Supabase

## 🎯 Objetivo

Transferir seus links do projeto Supabase antigo para o novo projeto.

---

## 📤 PARTE 1: Exportar do Projeto Antigo

### Método 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o projeto antigo**:
   - Vá para: https://app.supabase.com
   - Selecione o projeto onde seus links estão salvos

2. **Abra o Table Editor**:
   - Menu lateral → **Table Editor**
   - Selecione a tabela **`links`**

3. **Exporte os dados**:
   - Clique no botão **"..."** (três pontos) no canto superior direito
   - Selecione **"Download as CSV"**
   - Salve o arquivo como `links_backup.csv`

4. **Repita para categorias** (opcional):
   - Selecione a tabela **`categories`**
   - Download as CSV
   - Salve como `categories_backup.csv`

### Método 2: Via SQL (Alternativo)

1. **Acesse SQL Editor** no projeto antigo
2. **Execute este comando**:

```sql
-- Exportar links como JSON
SELECT json_agg(row_to_json(t))
FROM (
  SELECT 
    url, title, description, category, tags, 
    is_favorite, favicon, og_image, notes,
    status, priority, due_date, created_at
  FROM public.links
  WHERE is_deleted = false OR is_deleted IS NULL
  ORDER BY created_at DESC
) t;
```

3. **Copie o resultado** e salve em um arquivo `links_backup.json`

---

## 📥 PARTE 2: Preparar o Projeto Novo

### Passo 1: Aplicar Migrations

1. **Acesse o projeto novo**: https://app.supabase.com
2. **Vá para SQL Editor**
3. **Execute o SQL de migração** (do arquivo `SOLUCAO_LINKS_NAO_APARECEM.md`)

### Passo 2: Verificar Estrutura

Execute no terminal:

```bash
python corrigir_banco.py
```

Deve retornar: ✅ BANCO DE DADOS OK!

---

## 🔄 PARTE 3: Importar os Dados

### Opção A: Importação via Script Python (Recomendado)

Vou criar um script para você! Coloque o arquivo `links_backup.csv` ou `links_backup.json` na pasta do projeto e execute:

```bash
# Para CSV
python importar_links.py links_backup.csv

# Para JSON
python importar_links.py links_backup.json
```

### Opção B: Importação via Supabase Dashboard

1. **Acesse o projeto novo**
2. **Vá para Table Editor** → **links**
3. **Clique em "Insert"** → **"Import data"**
4. **Selecione o arquivo CSV**
5. **Mapeie as colunas** (se necessário)
6. **Clique em "Import"**

### Opção C: Importação via SQL

1. **Prepare os dados** no formato SQL
2. **Vá para SQL Editor**
3. **Execute**:

```sql
-- Exemplo de inserção
INSERT INTO public.links (url, title, description, category, tags, is_favorite, favicon)
VALUES 
  ('https://exemplo1.com', 'Título 1', 'Descrição 1', 'Trabalho', ARRAY['tag1', 'tag2'], true, 'https://...'),
  ('https://exemplo2.com', 'Título 2', 'Descrição 2', 'Estudos', ARRAY['tag3'], false, 'https://...');
```

---

## 🛠️ Script de Importação Automática

Vou criar um script Python que:
- ✅ Lê CSV ou JSON
- ✅ Valida os dados
- ✅ Remove duplicatas
- ✅ Importa em lotes
- ✅ Mostra progresso
- ✅ Gera relatório

Execute:

```bash
python importar_links.py seu_arquivo.csv
```

---

## 📊 Formato dos Arquivos

### CSV (Colunas esperadas):

```csv
url,title,description,category,tags,is_favorite,favicon,og_image,notes,status,priority,due_date
https://exemplo.com,Título,Descrição,Trabalho,"tag1,tag2",true,https://...,https://...,Notas,backlog,medium,2026-12-31
```

### JSON (Estrutura esperada):

```json
[
  {
    "url": "https://exemplo.com",
    "title": "Título",
    "description": "Descrição",
    "category": "Trabalho",
    "tags": ["tag1", "tag2"],
    "is_favorite": true,
    "favicon": "https://...",
    "og_image": "https://...",
    "notes": "Notas",
    "status": "backlog",
    "priority": "medium",
    "due_date": "2026-12-31"
  }
]
```

---

## ✅ Verificação Pós-Importação

1. **Execute o diagnóstico**:
```bash
python diagnostico_links.py
```

2. **Acesse a interface**:
```
http://localhost:8080
```

3. **Verifique**:
   - Total de links importados
   - Categorias criadas
   - Links aparecem na interface

---

## 🆘 Problemas Comuns

### Erro: "Duplicate key value"
**Solução**: Alguns links já existem. Use a opção `--skip-duplicates` no script.

### Erro: "Column does not exist"
**Solução**: Aplique as migrations primeiro (Parte 2, Passo 1).

### Erro: "Row-level security"
**Solução**: Execute no SQL Editor:
```sql
ALTER TABLE public.links DISABLE ROW LEVEL SECURITY;
```

### Tags não importam corretamente
**Solução**: No CSV, separe tags com vírgula: `"tag1,tag2,tag3"`

---

## 📞 Próximos Passos

1. ✅ Exporte os dados do projeto antigo
2. ✅ Coloque o arquivo na pasta do projeto
3. ✅ Execute: `python importar_links.py seu_arquivo.csv`
4. ✅ Acesse: http://localhost:8080

---

**Última atualização**: 15 de Abril de 2026
