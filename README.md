# WebNest — Gerenciador de Links

[![CI/CD](https://github.com/aluizr/python-web-link-scraper/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/aluizr/python-web-link-scraper/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/aluizr/python-web-link-scraper/actions/workflows/deploy-pages.yml/badge.svg?branch=main)](https://github.com/aluizr/python-web-link-scraper/actions/workflows/deploy-pages.yml)

Organize seus links favoritos com estilo e segurança.

## Últimas versões

| Versão | Data | Link |
| --- | --- | --- |
| 0.15.1 | 2026-05-14 | [Ver changelog](CHANGELOG.md#0151--2026-05-14) |
| 0.15.0 | 2026-05-01 | [Ver changelog](CHANGELOG.md#0150--2026-05-01) |
| 0.14.5 | 2026-04-28 | [Ver changelog](CHANGELOG.md#0145--2026-04-28) |

## What's new — 0.15.1 (2026-05-14)

Detalhes completos da release: [CHANGELOG 0.15.1](CHANGELOG.md#0151--2026-05-14)

- **Hardening de Segurança (Supabase Data API):** nova migration com GRANTs explícitos para `authenticated` e `service_role` em `public.links` e `public.categories`, compatível com a mudança de política do Supabase.
- **RLS preservado:** as políticas user-scoped existentes seguem ativas; o ajuste formaliza permissões sem ampliar acesso indevido.
- **Sem acesso para `anon`:** o comportamento de autenticação obrigatória permanece inalterado.

## Atualizações internas recentes

- **Index page refatorada** em camadas menores: controller, view principal, header, dialogs, content e renderer por modo.
- **Renderização por modo separada** para Grid, Lista, Cartões, Tabela, Board e Galeria, reduzindo a complexidade do fluxo principal.
- **Fallback de favicon e preview simplificado**: imagens passam direto pelo browser por padrão; proxy é usado apenas quando necessário para domínios com restrição CORS/CORP.
- **Validação recente mantida**: as últimas alterações foram verificadas com `npm run lint` e `npm run build`.

## Funcionalidades

### Core

- **CRUD completo** de links com favicon, preview OG, tags e notas
- **Categorias hierárquicas** (3 níveis) com cores, ícones personalizados e drag & drop
- **1541 ícones** do Lucide + upload de ícones customizados (SVG, PNG, JPG)
- **Busca avançada** com filtros por categoria, tags, período e favoritos
- **Auto-fetch de metadados** (título, descrição, OG image) ao inserir URL
- **Detecção de URLs duplicadas** com normalização inteligente
- **Auto-save de rascunho** no formulário de criação

### Visualização

- **6 modos de visualização**: Grid, Lista, Cartões, Tabela, Board (Kanban), Galeria
- **Galeria com Covers** — Layout masonry com imagens OG como capas grandes
- **Tamanho dinâmico** nos cartões (P/M/G)
- **Colunas ajustáveis** no grid (2-5 colunas)
- **Breadcrumb Navigation** — Navegação por migalhas na hierarquia de categorias

### Organização

- **Drag & Drop** para reordenar links com Undo/Redo (Ctrl+Z/Y)
- **Operações em Lote (Batch)** — Seleção com checkboxes em todas as views, Shift+Click para intervalo, ações: favoritar, mover, tag (+/-), excluir
- **Lixeira / Soft Delete** — Links deletados ficam na lixeira por 30 dias
- **Notas em Rich Text (Tiptap)** — Editor WYSIWYG com toolbar completa: formatação, listas, task lists, links, blocos de código, citações
- **8 temas** visuais (Light, Dark, Ocean, Sunset, Forest, Rose, Lavender, Midnight)

### Ferramentas

- **Broken Link Checker** — Verificador de links com status HTTP e cache 24h
- **Dashboard de estatísticas** com gráficos interativos (Recharts)
- **Importar/Exportar** em 4 formatos: JSON, CSV, HTML, Bookmarks
- **Histórico de atividades** com log completo de ações
- **Command Palette** (Ctrl+K) e 10+ atalhos de teclado

### Infraestrutura

- **PWA + Offline** com cache local e fila de sincronização
- **Segurança**: RLS, PKCE auth, rate limiting, API key rotation, CSP headers
- **Error Boundary** + logging centralizado (com Sentry/LogRocket opcionais)

## Tecnologias

- **Framework:** React 18 + TypeScript 5
- **Build:** Vite 7 (SWC)
- **UI:** Shadcn/UI + Radix UI + Tailwind CSS
- **Rich Text:** Tiptap (ProseMirror)
- **Banco de Dados:** Supabase (PostgreSQL)
- **Gráficos:** Recharts
- **Validação:** Zod
- **Testes:** Vitest + React Testing Library

## Como rodar

```sh
# Clonar o repositório
git clone <YOUR_GIT_URL>
cd webnest

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais Supabase

# Iniciar servidor de desenvolvimento
npm run dev
```

## Scripts disponíveis

| Comando | Descrição |
| --------- | ---------- |
| `npm run dev` | Servidor de desenvolvimento (porta 8080) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Linting com ESLint |
| `npm test` | Testes com Vitest |

O projeto é hospedado como uma Single Page Application (SPA) estática. Pode ser implantado facilmente em Vercel, Netlify, Cloudflare Pages ou GitHub Pages.

## Deploy no GitHub Pages

O repositório já possui workflow para deploy automático em GitHub Pages:

- Workflow: `.github/workflows/deploy-pages.yml`
- Gatilho: `push` na `main`/`master` ou execução manual (`workflow_dispatch`)
- Etapas: `lint` + `test` + `build` + publicação do `dist/` na branch `gh-pages`

### Ativação no GitHub

1. Abra o repositório no GitHub.
2. Vá em `Settings > Pages`.
3. Em **Source**, selecione **Deploy from a branch**.
4. Selecione a branch `gh-pages` e pasta `/ (root)`.
5. Faça merge das mudanças na branch principal.

O workflow ajusta automaticamente o `base path` do Vite para `/${repo-name}/` durante o build e publica fallback `404.html` para SPA.

Para uma visão de futuro envolvendo um backend dedicado em Python, consulte o [ROADMAP_BACKEND_PYTHON.md](docs/ROADMAP_BACKEND_PYTHON.md).

## Domínio customizado

Configure o domínio no seu provedor de hospedagem apontando para o build estático gerado em `dist/`.
