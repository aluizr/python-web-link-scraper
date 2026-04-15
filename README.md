# Python Web Link Scraper

API REST em Python para **captura e gerenciamento de links**.  
Usa **FastAPI** + **BeautifulSoup4** para extração de metadados e **Supabase** como banco de dados.

## Funcionalidades

- 🔍 **Scraping de metadados** — título, descrição, og:image e favicon via BeautifulSoup4
- 🔗 **CRUD completo de links** — criar, listar, atualizar, excluir (soft delete), restaurar
- ⭐ **Favoritos** — toggle por endpoint
- 🗑️ **Lixeira** — soft delete com restauração
- 🏷️ **Tags e categorias** hierárquicas
- 📊 **Status e prioridade** — backlog / in_progress / done · low / medium / high
- 🔍 **Busca** por título, URL e descrição
- ✅ **Verificador de links quebrados**
- 📤 **Exportação** em JSON, CSV e HTML Bookmarks
- 📈 **Estatísticas** da coleção

## Tecnologias

| Camada | Tecnologia |
|---|---|
| API | FastAPI + Uvicorn |
| Scraping | BeautifulSoup4 + lxml + httpx |
| Banco de dados | Supabase (PostgreSQL) |
| Validação | Pydantic v2 |

## Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/aluizr/python-web-link-scraper.git
cd python-web-link-scraper

# 2. Crie e ative o ambiente virtual
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/Mac

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase
```

## Configuração do `.env`

```env
SUPABASE_URL=https://seu_projeto.supabase.co
SUPABASE_KEY=sua_anon_key_aqui
APP_HOST=0.0.0.0
APP_PORT=8000
CORS_ORIGINS=*
```

> Obtenha `SUPABASE_URL` e `SUPABASE_KEY` em:  
> https://app.supabase.com/project/SEU_PROJETO/settings/api

## Executar

```bash
# Opção 1: Script Python (Recomendado)
python start_server.py

# Opção 2: Arquivo Batch (Windows)
run.bat

# Opção 3: Comando direto
python -m app.main

# Opção 4: Uvicorn direto
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

A API estará disponível em: **http://localhost:8080**  
Documentação interativa: **http://localhost:8080/docs**

## ✅ Servidor Funcionando

O servidor está configurado e testado! Basta executar um dos comandos acima e acessar:

- 🌐 **Interface**: http://localhost:8080
- 📚 **API Docs**: http://localhost:8080/docs
- ❤️ **Health**: http://localhost:8080/health

## 🔧 Scripts Úteis

```bash
# Verificar se o servidor está rodando
python verificar_servidor.py

# Diagnosticar problemas com links
python diagnostico_links.py

# Importar links de CSV/JSON
python importar_links.py links_backup.csv

# Exportar links para backup
python exportar_links.py --formato csv

# Atualizar metadados (thumbnails e descrições)
python atualizar_metadados.py

# Testar banco de dados
python corrigir_banco.py
```

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/scrape` | Extrair metadados de uma URL |
| `GET` | `/api/links` | Listar links (com filtros) |
| `POST` | `/api/links` | Criar link manualmente |
| `PUT` | `/api/links/{id}` | Atualizar link |
| `DELETE` | `/api/links/{id}` | Mover para lixeira |
| `PATCH` | `/api/links/{id}/favorite` | Toggle favorito |
| `GET` | `/api/links/broken` | Verificar links quebrados |
| `GET` | `/api/export/json` | Exportar como JSON |
| `GET` | `/api/export/csv` | Exportar como CSV |
| `GET` | `/api/export/html` | Exportar como HTML Bookmarks |
| `GET` | `/api/stats` | Estatísticas gerais |

### Exemplo — Scrape de metadados

```bash
curl -X POST http://localhost:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://fastapi.tiangolo.com", "save": true}'
```

**Resposta:**
```json
{
  "url": "https://fastapi.tiangolo.com",
  "title": "FastAPI",
  "description": "FastAPI framework, high performance...",
  "og_image": "https://fastapi.tiangolo.com/img/og-image.png",
  "favicon": "https://fastapi.tiangolo.com/img/favicon.png",
  "saved": true,
  "link_id": "uuid-gerado"
}
```

## Banco de dados (Supabase)

O schema já está definido em `supabase/migrations/`.  
Aplique as migrations no seu projeto Supabase via **SQL Editor** ou **Supabase CLI**.

Tabelas principais:
- **`links`** — links com metadados, tags, status, prioridade, soft delete
- **`categories`** — categorias hierárquicas com cor e ícone

## Docker

```bash
# Build
docker build -t python-web-link-scraper:latest .

# Run
docker run -p 8000:8000 --env-file .env python-web-link-scraper:latest
```
