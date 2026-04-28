# 🚀 Roadmap: Migração para Backend Python (FastAPI)

Este documento serve como guia para uma futura evolução do WebNest de uma arquitetura 100% Serverless para um modelo híbrido com backend dedicado em Python.

## 🎯 Por que um Backend em Python?

Embora o modelo atual (React + Supabase) seja extremamente eficiente e escalável, a introdução de um backend FastAPI traria vantagens específicas:

1.  **Scraping Avançado**: Uso de bibliotecas como `BeautifulSoup4` ou `Playwright` para extrair metadados de sites que bloqueiam scrapers simples ou que requerem execução de JavaScript.
2.  **Processamento de Imagens**: Manipulação de thumbnails e geração de screenshots no servidor usando `Pillow` ou `OpenCV`.
3.  **Integrações Complexas**: Maior facilidade para integrar APIs que requerem segredos de servidor ou fluxos OAuth complexos (Notion, Pocket, etc).

## 🐳 Estrutura Docker Sugerida

Para gerenciar essa complexidade, recomenda-se o uso de Docker Compose:

### 1. `Dockerfile` (Frontend)
```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. `Dockerfile` (Backend)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3. `docker-compose.yml`
```yaml
services:
  frontend:
    build: .
    ports:
      - "8080:80"
    depends_on:
      - backend

  backend:
    build: ./api
    ports:
      - "8000:8000"
    env_file:
      - .env
```

## 🛠️ Próximos Passos Técnicos

1.  **Criar pasta `api/`**: Contendo o `main.py` e `requirements.txt`.
2.  **Mapear Endpoints**:
    - `POST /api/scrape`: Para extração de metadados.
    - `POST /api/export`: Para processamento de grandes volumes de dados.
3.  **Proxy no Vite**: Configurar `vite.config.ts` para redirecionar chamadas `/api/*` para o container do backend durante o desenvolvimento.

---
*Este documento é uma referência futura e não reflete a arquitetura atual de produção (Serverless).*
