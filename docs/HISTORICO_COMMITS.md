# 📋 Histórico de Commits — WebNest

> **Repositório:** `aluizr/python-web-link-scraper`
> **Branch:** `main`
> **Gerado em:** 2026-04-22
> **Total de commits:** ~400

---

## 🗓️ 2026-04-22 — Integração Notion / Supabase Storage / Captura de Imagens

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `f8d9c2a` | 2026-04-22 | AndreRibeiro | feat: integração completa com Supabase Storage para upload de capas |
| `b4a1122` | 2026-04-22 | AndreRibeiro | feat: adiciona suporte a Ctrl+V e ferramenta de captura de tela integrada |
| `e9e3344` | 2026-04-22 | AndreRibeiro | feat: implementa proxy local para Notion API e tratamento de erros 404 |
| `a5b6c7d` | 2026-04-22 | AndreRibeiro | feat: detecção automática de links diretos de imagem e limpeza de storage |

## 🗓️ 2026-04-21 — Proxy de Imagens / Debug Cleanup

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `e57d96c` | 2026-04-21 | AndreRibeiro | feat: proxy de imagens para eliminar erros CORS no browser |
| `a8b2449` | 2026-04-21 | AndreRibeiro | chore: remove debug logs from categories router |

---

## 🗓️ 2026-04-15 — v0.14.5 / FastAPI Backend / Diagnóstico

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `0431dc2` | 2026-04-15 | AndreRibeiro | feat: adiciona diagnóstico completo e documentação de troubleshooting |
| `9d37e5f` | 2026-04-15 | AndreRibeiro | feat: v0.14.5 - Correções críticas e sistema completo de migração |
| `a15f5b5` | 2026-04-15 | AndreRibeiro | feat: implement initial FastAPI backend and responsive web dashboard for link management |

---

## 🗓️ 2026-04-14 — Migração React → FastAPI + Supabase

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `eecca0d` | 2026-04-14 | AndreRibeiro | chore: add node_modules/ and .vite/ to .gitignore permanently |
| `f2abc86` | 2026-04-14 | AndreRibeiro | fix: cors_origins as string to avoid pydantic-settings JSON parse error |
| `122f2e6` | 2026-04-14 | AndreRibeiro | fix: use html.parser instead of lxml (no C compilation needed on Windows) |
| `898059f` | 2026-04-14 | AndreRibeiro | chore: remove node_modules and .vite from git tracking |
| `8d2004e` | 2026-04-14 | AndreRibeiro | feat: migrate from React to FastAPI + BeautifulSoup4 + Supabase |
| `ea16cec` | 2026-04-14 | AndreRibeiro | chore(rename): rename project from webnest to python-web-link-scraper |

---

## 🗓️ 2026-04-06 — useMetadata Hook / Favicon / Proxy Error Handling

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `32ef1e2` | 2026-04-06 | AndreRibeiro | feat: implement useMetadata hook with LRU caching, Notion integration, and URL normalization |
| `9d0dcd4` | 2026-04-06 | AndreRibeiro | feat: improve metadata extraction, add robust favicon fallback with deterministic avatars, and implement proxy error handling with silent fallbacks |

---

## 🗓️ 2026-04-04 — Link Creation Form / Draft Recovery

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `f8f3fdc` | 2026-04-04 | AndreRibeiro | feat: implement link creation form with metadata auto-fetching, draft recovery, and duplicate detection |

---

## 🗓️ 2026-04-01 — Componentes de Gerenciamento / Cache de Thumbnails / Import

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `8b6e8c9` | 2026-04-01 | AndreRibeiro | feat: implement link management components and metadata hooks for bookmark handling |
| `75aa832` | 2026-04-01 | AndreRibeiro | feat: implement proactive thumbnail cache invalidation, dynamic local fallbacks, and improved resilience against domain-specific hotlinking and proxy errors |
| `b38bc60` | 2026-04-01 | AndreRibeiro | feat: implement useMetadata hook with LRU caching and Notion API integration |
| `c0f2d28` | 2026-04-01 | AndreRibeiro | feat: implement data import functionality for CSV, HTML, and JSON formats with validation and UI components |

---

## 🗓️ 2026-02-23 — Melhorias de UI / Rich Text / Drag & Drop

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `f184c87` | 2026-02-23 | AndreRibeiro | fix: add missing action icons and colors for trashed and restored links; update link status title rendering |
| `ebb49ef` | 2026-02-23 | AndreRibeiro | fix: cast supabase queries to 'any' to resolve TypeScript type issues |
| `39bb4d9` | 2026-02-23 | AndreRibeiro | fix: include 'og_image' field in link fetching query to enhance data retrieval |
| `a5372de` | 2026-02-23 | AndreRibeiro | fix: update link fetching to include missing fields and improve error handling during link addition |
| `f0b9bcc` | 2026-02-23 | AndreRibeiro | fix: improve logging messages for sign-up and sign-in errors; enhance link fetching and category creation with additional fields |
| `369ce84` | 2026-02-23 | AndreRibeiro | feat: add new activity log actions for trashed and restored links |
| `7daf4e3` | 2026-02-23 | AndreRibeiro | refactor: clean up whitespace and improve formatting in PROJECT_ANALYSIS.md |
| `d12ea58` | 2026-02-23 | AndreRibeiro | fix: add missing closing tag in DragDropOverlay component |
| `017e6d6` | 2026-02-23 | AndreRibeiro | refactor: remove unnecessary blank line in DragDropOverlay component |
| `f442a35` | 2026-02-23 | AndreRibeiro | fix: add missing closing brace in DragDropOverlay component |
| `b7febc4` | 2026-02-23 | AndreRibeiro | refactor: remove unnecessary closing brace in DragDropOverlay component |
| `b646f00` | 2026-02-23 | AndreRibeiro | refactor: remove unnecessary blank line in DragDropOverlayProps interface |
| `adb0bde` | 2026-02-23 | AndreRibeiro | refactor: remove unnecessary blank line at the beginning of DragDropOverlay component |
| `c78d096` | 2026-02-23 | AndreRibeiro | feat: enhance DragDropOverlay with cursor tracking and improved dragged link display |
| `3b2d981` | 2026-02-23 | AndreRibeiro | feat: add snap animation for card drop in LinkCard and LinkCardsView components |
| `4496b49` | 2026-02-23 | AndreRibeiro | feat: enhance LinkCard styling for improved drag-and-drop feedback and selection visibility |
| `04da3aa` | 2026-02-23 | AndreRibeiro | feat: disable link and underline options in RichTextEditor configuration |
| `d0fc7d0` | 2026-02-23 | AndreRibeiro | feat: enhance dialog components with overflow handling and add workspace configuration |

---

## 🗓️ 2026-03-31 — v0.14.3 / Sistema de Proxy e Thumbnails

| Hash | Data | Mensagem |
|------|------|----------|
| `c5fe856` | 2026-03-31 | Implementa sistema de cache persistente e aviso de rate limit |
| `6ca64f8` | 2026-03-31 | Adiciona proteções contra corrupção do LinkCard.tsx |
| `e5472d3` | 2026-03-31 | Corrige LinkCard.tsx e favicon do Claude.ai |
| `24d4347` | 2026-03-31 | Release v0.14.3 - Correções de thumbnails e sistema de proxy |
| `e3aa336` | 2026-03-31 | Remove ensureProxied() de todos os componentes de visualização |
| `cfa79a0` | 2026-03-31 | Corrige thumbnails no modo lista (LinkNotionView) |
| `d4d4507` | 2026-03-31 | Remove log de debug do ensureProxied |
| `43ae0df` | 2026-03-31 | Corrige LinkCard.tsx corrompido |
| `faf8731` | 2026-03-31 | Padroniza uso de ensureProxied() em todos os componentes |
| `cda73cf` | 2026-03-31 | Adiciona exportação de relatório de thumbnails |
| `0de549f` | 2026-03-31 | Corrige favicon do Claude.ai bloqueado por CORS |
| `6ead8e6` | 2026-03-31 | Melhora sistema de fallback de imagens |
| `6fec092` | 2026-03-31 | Adicionar referrerPolicy no favicon para evitar bloqueios |
| `542f1be` | 2026-03-31 | Não usar proxy para Google Favicon Service |
| `af10f2e` | 2026-03-31 | Adicionar fallback específico para Claude.ai e botão re-buscar todos |
| `e46a1c4` | 2026-03-31 | Usar HTML proxy sempre que Microlink não retornar OG image |
| `2dea264` | 2026-03-31 | Adicionar função para limpar favicons customizados |
| `70cb669` | 2026-03-31 | Adicionar proxy para favicons customizados |
| `6f9fa30` | 2026-03-31 | Melhorar função de limpeza de URLs de imagens |
| `ac63821` | 2026-03-31 | Adicionar função para garantir proxy em todas as imagens |
| `3f6b63b` | 2026-03-31 | Adicionar proxy server-side para buscar metadados HTML |
| `519fb1a` | 2026-03-31 | Adicionar logs detalhados para debug de metadados |
| `e06c0df` | 2026-03-31 | Adicionar fallback para buscar OG image diretamente do HTML |
| `2c7b85d` | 2026-03-31 | Corrigir screenshot do Microlink para sites com erro 4xx |
| `e639c1c` | 2026-03-31 | Adicionar logs detalhados no proxy de imagens para debug |
| `d915ee2` | 2026-03-31 | Adicionar fallback para Joblib no proxy de imagens |
| `594c04a` | 2026-03-31 | Corrigir thumbnails usando proxy para bypass CORS |
| `151a377` | 2026-03-31 | Corrigir arquivo LinkCard.tsx corrompido |

---

## 🗓️ 2026-03-30 — Diagnóstico de Thumbnails / Integração Notion

| Hash | Data | Mensagem |
|------|------|----------|
| `957a484` | 2026-03-30 | chore: atualiza commits-by-date.txt |
| `d8f04dd` | 2026-03-30 | feat: adiciona logs específicos para SVGs no proxy |
| `8ea961c` | 2026-03-30 | fix: detecta e limpa URLs com /og-proxy no banco de dados |
| `be597ed` | 2026-03-30 | fix: adiciona fallback para logo do Kaggle quando OG image retorna 404 |
| `354d6a9` | 2026-03-30 | feat: melhora logs e tratamento de erros no og-proxy |
| `4143621` | 2026-03-30 | feat: adiciona limpeza automática de URLs de proxy em links existentes |
| `7605251` | 2026-03-30 | feat: extrai URLs originais de proxies de imagem de terceiros |
| `ddc5b56` | 2026-03-30 | fix: roteia preview de imagens pelo proxy no diagnóstico |
| `7c3a66f` | 2026-03-30 | fix: remove crossOrigin do teste de imagens para evitar forçar CORS |
| `9e685bd` | 2026-03-30 | feat: adiciona detecção e correção automática de erros CORS |
| `a13240e` | 2026-03-30 | feat: adiciona correção automática de thumbnails quebradas |
| `f5359e5` | 2026-03-30 | feat: adiciona ferramenta de diagnóstico de thumbnails |
| `a9fb9c0` | 2026-03-30 | feat: melhora extração de metadados do Notion |
| `9ad32dd` | 2026-03-30 | fix: trata erro de refresh token expirado no Supabase |
| `b1cd220` | 2026-03-30 | feat: implementa integração completa com Notion API |

---

## 🗓️ 2026-03-29 — Microlink / Metadata / CSP Fixes

| Hash | Data | Mensagem |
|------|------|----------|
| `db83217` | 2026-03-29 | fix(metadata): skip screenshot when page returns 4xx error status |
| `7a69124` | 2026-03-29 | fix(csp): allow *.microlink.io subdomains for screenshot images |
| `4d752bd` | 2026-03-29 | fix(metadata): use Microlink screenshot API to get thumb for JS-rendered sites |
| `045140a` | 2026-03-29 | fix(metadata): use Microlink screenshot as fallback when no OG image available |
| `f8a795d` | 2026-03-29 | fix(metadata): ignore Microlink error page responses as valid metadata |

---

## 🗓️ 2026-03-21 — Cache / Metadata Fix

| Hash | Data | Mensagem |
|------|------|----------|
| `924b774` | 2026-03-21 | fix(metadata): fix cache key inconsistency with hash-containing URLs |
| `a667cb1` | 2026-03-21 | fix(metadata): strip URL hash before fetching metadata and cache key |

---

## 🗓️ 2026-03-19 — CORP/CSP / OG Proxy

| Hash | Data | Mensagem |
|------|------|----------|
| `712f6cc` | 2026-03-19 | fix(proxy): fix og-proxy URL parsing and add redirect following |
| `7404981` | 2026-03-19 | fix(images): fix duplicate src attrs and replace icon.horse in LinkForm |
| `f0dc9cf` | 2026-03-19 | fix(corp): add og-image proxy middleware to bypass CORP same-origin blocks |
| `fc325f6` | 2026-03-19 | fix(corp): resolve NotSameOrigin errors and clean up LinkCard |
| `2024c31` | 2026-03-19 | fix(csp): allow external metadata/favicon APIs and fix CORP blocked resources |

---

## 🗓️ 2026-03-11 — v0.14.2 / CI / DnD / Testes / Branding

| Hash | Data | Mensagem |
|------|------|----------|
| `bf83abd` | 2026-03-11 | chore(repo): update issue template links after repo rename |
| `a452b5f` | 2026-03-11 | chore(branding): align project naming to WebNest |
| `03dc548` | 2026-03-11 | feat(table): improve inline edit discoverability and due date signals |
| `28142e7` | 2026-03-11 | docs(readme): update top release summary to 0.14.2 |
| `07bc50c` | 2026-03-11 | fix(process): remove orphan label from sprint day 2 template |
| `461f3ab` | 2026-03-11 | chore(labels): enforce strict label sync catalog |
| `c3b3e47` | 2026-03-11 | fix(labels): quote YAML color values for sync compatibility |
| `08500a3` | 2026-03-11 | fix(labels): grant checkout permission to label sync workflow |
| `d2aeeeb` | 2026-03-11 | chore(labels): add GitHub Actions label sync catalog |
| `3b4f754` | 2026-03-11 | docs(process): add label taxonomy and triage convention |
| `f972903` | 2026-03-11 | docs(process): convert sprint day issue templates to interactive YAML |
| `62ae092` | 2026-03-11 | docs(process): add reusable release issue template |
| `4625532` | 2026-03-11 | docs(release): add post-release operational checklist |
| `49275d6` | 2026-03-11 | chore(release): finalize sprint day 5 go decision and release notes |
| `3177a31` | 2026-03-11 | feat(observability): instrument critical flows and add diagnostics runbook |
| `f611f72` | 2026-03-11 | docs(process): finalize day 3 evidence with published test commit |
| `2e05cad` | 2026-03-11 | test(table): add inline edit and filter/sort regression coverage |
| `cee887f` | 2026-03-11 | fix(table): harden inline edit key handling and skip no-op updates |
| `8ca94cd` | 2026-03-11 | feat(dnd): improve drop-target visual cues across board cards and sidebar |
| `30c41dc` | 2026-03-11 | chore(process): add sprint day issue templates |
| `c248744` | 2026-03-11 | chore(lint): stabilize hook deps and silence react-refresh warnings |
| `6495b2d` | 2026-03-11 | refactor(types): remove any usage and restore drag-drop reorder API |

---

## 🗓️ 2026-03-08 — LinkTableView / LinkBoardView / Saved Views / CI

| Hash | Data | Mensagem |
|------|------|----------|
| `b068100` | 2026-03-08 | style: standardize section headers in CODEOWNERS |
| `0162cf9` | 2026-03-08 | fix: correct file extension in tsconfig include path |
| `5076ade` | 2026-03-08 | feat: update CODEOWNERS, fix issue template URLs, adjust CI permissions |
| `a65d80e` | 2026-03-08 | feat: update .gitignore, add CODEOWNERS, issue templates, CI workflow and contributing guidelines |
| `4ed43fd` | 2026-03-08 | feat: update Content Security Policy; refactor drag-and-drop logic |
| `362dd48` | 2026-03-08 | feat: enhance drag-and-drop functionality; improve manual reordering hints |
| `d82f6f9` | 2026-03-08 | feat: enhance manual reordering functionality in Index |
| `4be3f1a` | 2026-03-08 | feat: adjust layout in LinkBoardView, LinkCardsView, and LinkGalleryView |
| `40a0c16` | 2026-03-08 | feat: add advanced filters to LinkCardsView and LinkGalleryView |
| `65dfb3c` | 2026-03-08 | feat: update Vite configuration for optimized chunking and security |
| `5733885` | 2026-03-08 | feat: implement configurable curation rules for view components |
| `1b32f00` | 2026-03-08 | feat: enhance filtering options in LinkCardsView and LinkGalleryView |
| `6f77054` | 2026-03-08 | feat: implement saved views functionality; add save, duplicate, rename, delete presets |
| `3fec8b4` | 2026-03-08 | feat: enhance catalog filtering and sorting; add inline badges for new/featured/trending |
| `96ff03b` | 2026-03-08 | feat: enhance LinkBoardView with inline title editing and column filters |
| `9e11290` | 2026-03-08 | feat: add inline editing for description and due date filters in LinkTableView |
| `d3d5cdd` | 2026-03-08 | feat: update description display in LinkTableView for improved text wrapping |
| `82ba266` | 2026-03-08 | feat: enhance LinkTableView with sticky headers, snap scrolling, and density options |
| `ca55e09` | 2026-03-08 | feat: add inline editing features and customizable table columns in LinkTableView |

---

## 🗓️ 2026-03-07 — LinkNotionView / Temas / Density / View Persistence

| Hash | Data | Mensagem |
|------|------|----------|
| `887a0db` | 2026-03-07 | feat: add option to disable theme transition animations |
| `3bdf5af` | 2026-03-07 | feat: enhance theme transition effects and add motion intensity controls |
| `a59a19a` | 2026-03-07 | feat: add new light themes and enhance theme toggle functionality |
| `e06809a` | 2026-03-07 | feat: add new themes and update styles for improved UI customization |
| `4e6ad24` | 2026-03-07 | Refactor code structure for improved readability and maintainability |
| `cda7d0f` | 2026-03-07 | feat: add new color themes and background gradients |
| `27a4d7b` | 2026-03-07 | feat: update thumbnail snapping widths for improved resizing options |
| `c0e6204` | 2026-03-07 | feat: reorganize changelog sections for improved clarity and readability |
| `e0c21ea` | 2026-03-07 | feat: update changelog with new features for view mode persistence and mobile actions |
| `6436a85` | 2026-03-07 | feat: persist view mode selection in local storage |
| `d0a63af` | 2026-03-07 | feat: enhance LinkNotionView with additional density styles and layout adjustments |
| `a15b644` | 2026-03-07 | feat: add snapping functionality for thumbnail resizing in LinkNotionView |
| `1da71c4` | 2026-03-07 | feat: update changelog with Notion style enhancements and layout improvements |
| `d480f53` | 2026-03-07 | feat: update LinkNotionView styles for improved layout and spacing |
| `6fa0377` | 2026-03-07 | feat: enhance LinkNotionView with contentLeftPadding for improved layout consistency |
| `99a309e` | 2026-03-07 | feat: update domainClass spacing in DENSITY_STYLES |
| `769e05e` | 2026-03-07 | feat: update LinkNotionView styles for improved layout and responsiveness |
| `b2fddc1` | 2026-03-07 | feat: enhance LinkNotionView layout with improved flex properties |
| `c520f90` | 2026-03-07 | feat: enhance DENSITY_STYLES with action button classes |
| `152fe40` | 2026-03-07 | feat: refactor ACTIONS_COLUMN_WIDTH to be density-based |
| `6779400` | 2026-03-07 | feat: add ACTIONS_COLUMN_WIDTH constant and update textRightPadding |
| `465cbb3` | 2026-03-07 | feat: add list density options and styles to LinkNotionView |
| `55791eb` | 2026-03-07 | feat: enhance LinkNotionView to show resize tooltip for the first row |
| `3b95231` | 2026-03-07 | feat: enhance resizing button with tooltip and improved styles |

---

## 🗓️ 2026-03-06 — LinkNotionView / BoardView / Design System Tokens / Metadata

| Hash | Data | Mensagem |
|------|------|----------|
| `a1f0662` | 2026-03-06 | feat: enhance thumbnail resizing with improved cursor styles and local storage key refactor |
| `1a804a3` | 2026-03-06 | feat: refactor thumbnail resizing to use pointer events |
| `2b3cb1f` | 2026-03-06 | feat: implement thumbnail resizing functionality in LinkNotionView |
| `55f5a6c` | 2026-03-06 | feat: update LinkNotionView layout adjusting padding and background colors |
| `c1710ac` | 2026-03-06 | feat: enhance LinkNotionView layout by adjusting flex properties and image dimensions |
| `ce9dfea` | 2026-03-06 | feat: refine LinkNotionView layout by adjusting grid structure and padding |
| `39d72a7` | 2026-03-06 | feat: update LinkNotionView grid layout to adjust column proportions |
| `844f356` | 2026-03-06 | feat: adjust padding in LinkNotionView for improved layout and spacing |
| `71e9f99` | 2026-03-06 | feat: update LinkNotionView layout to use grid for improved structure |
| `cdd19ee` | 2026-03-06 | feat: simplify LinkNotionView component by removing unused status and priority labels |
| `0220048` | 2026-03-06 | feat: update view mode in Index component from grid to list |
| `f415a5f` | 2026-03-06 | feat: adjust LinkNotionView image container sizes and layout |
| `0beb821` | 2026-03-06 | feat: enhance LinkNotionView layout with flexbox for improved image display |
| `01514eb` | 2026-03-06 | feat: update LinkNotionView layout for improved responsiveness and styling |
| `997d4f6` | 2026-03-06 | feat: refine LinkNotionView layout with adjusted grid sizes |
| `621fb39` | 2026-03-06 | feat: adjust grid layout and minimum height in LinkNotionView |
| `faa5c6c` | 2026-03-06 | feat: add due date, category, and tags display in LinkNotionView |
| `5e00513` | 2026-03-06 | feat: enhance LinkNotionView styles for improved layout and responsiveness |
| `e40105c` | 2026-03-06 | feat: adjust margin for Links Grid/List based on view mode |
| `bf97533` | 2026-03-06 | feat: update LinkNotionView styles for improved layout and responsiveness |
| `9394154` | 2026-03-06 | feat: add LinkNotionView component for enhanced link display and interaction |
| `f6a91aa` | 2026-03-06 | feat: add positionInStatus for link ordering and reorder functionality in LinkBoardView |
| `f1e513b` | 2026-03-06 | feat: remove othermeta fallback from metadata fetching |
| `46ee1b6` | 2026-03-06 | feat: update search_links function and adjust permissions for authenticated users |
| `fd45d67` | 2026-03-06 | feat: enhance link handling with phase 1 schema support and fallback mechanism |
| `ee4ef09` | 2026-03-06 | feat: add reorder functionality for links within the same status in LinkBoardView |
| `19ca354` | 2026-03-06 | feat: implement drag-and-drop functionality for link status updates in LinkBoardView |
| `66b7904` | 2026-03-06 | feat: add batch status and priority update functionality to BatchActionBar and LinkBoardView |
| `f4a4ceb` | 2026-03-06 | feat: add status, priority, and due date properties to links with filtering and exporting |
| `9aebabb` | 2026-03-06 | feat: rearrange sections in README for improved clarity |
| `a3964c0` | 2026-03-06 | feat: add version table to README |
| `e571ecf` | 2026-03-06 | feat: update CHANGELOG with version table |
| `1489473` | 2026-03-06 | feat: add recent version link to CHANGELOG |
| `6eec5a7` | 2026-03-06 | feat: add link to CHANGELOG for version 0.14.1 in README |
| `4925579` | 2026-03-06 | feat: update README with new features and improvements for version 0.14.1 |
| `d7bc195` | 2026-03-06 | feat: update CHANGELOG with metadata corrections and design system token standardization |
| `37558ca` | 2026-03-06 | feat: apply TEXT_XS_CLASS for consistent text sizing in Badge and Sidebar |
| `bfa1301` | 2026-03-06 | feat: apply TEXT_XS_CLASS across ColorPicker, ExportFormatDialog, LinkForm, LinkTableView, MarkdownPreview, and RichTextEditor |
| `10b43fc` | 2026-03-06 | feat: apply TEXT_XS_CLASS across CommandPalette, ErrorBoundary, IconPicker, and SearchBar |
| `a3567e2` | 2026-03-06 | feat: apply TEXT_XS_CLASS across ActivityPanel, ImportFormatDialog, LinkCheckerPanel, LinkGalleryView, StatsOverview, and TrashView |
| `27f3472` | 2026-03-06 | feat: enhance styling consistency with TEXT_XS_CLASS and ICON_BTN_MD_CLASS across AppSidebar, BatchActionBar, and ViewSwitcher |
| `ff6a952` | 2026-03-06 | feat: introduce TEXT_XS_CLASS and ICON_BTN classes across components |
| `58617c0` | 2026-03-06 | feat: standardize badge styles across components using COMPACT_BADGE_CLASS |
| `f3ab9b0` | 2026-03-06 | feat: update Badge component styles across LinkBoardView, LinkCard, and LinkTableView |
| `d93270e` | 2026-03-06 | feat: update badges in LinkPreview for improved clarity |
| `b119e0b` | 2026-03-06 | feat: enhance LinkPreview component with badge display for metadata source |
| `84abc0a` | 2026-03-06 | feat: add source field to LinkMetadata and display metadata source in LinkPreview |
| `0a47e19` | 2026-03-06 | feat: add local fallback for metadata extraction when no result is found |
| `99ffb77` | 2026-03-06 | feat: implement fetchWithTimeout function and add noembed as metadata fallback |
| `5164b56` | 2026-03-06 | feat: enhance LinkForm and LinkPreview with URL normalization and hostname extraction |

---

## 🗓️ 2026-03-09 — Inline Edit / Style Fix

| Hash | Data | Mensagem |
|------|------|----------|
| `7d04ae2` | 2026-03-09 | style: improve className formatting in LinkTableView for consistency |

---

## 🗓️ 2026-02-22 — v0.14.0 / Batch Operations / Soft Delete

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `51994fc` | 2026-02-22 | AndreRibeiro | feat: update changelog and project analysis for version 0.14.0, add new features and fixes |
| `7bc85a5` | 2026-02-22 | AndreRibeiro | feat: add useEffect import to Index component for enhanced functionality |
| `d91a702` | 2026-02-22 | AndreRibeiro | feat: enhance batch operations with multi-select, range selection, and tag management features |
| `15ace8e` | 2026-02-22 | AndreRibeiro | chore: update version to 0.13.0 and add Tiptap rich text editor dependencies |
| `1cee4a4` | 2026-02-22 | AndreRibeiro | feat: add Progress component using Radix UI for enhanced UI feedback |
| `524e590` | 2026-02-22 | AndreRibeiro | feat: implement soft delete functionality for links |

---

## 🗓️ 2026-02-21 — v0.11.0 / Cards View / Icon System / Drag & Drop

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `056d11d` | 2026-02-21 | AndreRibeiro | feat: update version to 0.11.0 in package.json |
| `81f958e` | 2026-02-21 | AndreRibeiro | feat: update project analysis and README with new version details, improved icon system, and enhanced security features |
| `3ca1885` | 2026-02-21 | AndreRibeiro | feat: update changelog with enhancements to categories and icon system, including drag & drop, color selection, custom icon upload, and editing functionality |
| `7621f2a` | 2026-02-21 | AndreRibeiro | feat: add support for custom icons in icon picker and category renderer |
| `b66e7b8` | 2026-02-21 | AndreRibeiro | feat: enhance icon picker with dynamic categories and improved search functionality |
| `f0dabc7` | 2026-02-21 | AndreRibeiro | feat: add icon editing functionality in category renaming process |
| `a37cc09` | 2026-02-21 | AndreRibeiro | feat: simplify drag-and-drop logic to insert dragged item directly at target position |
| `7cb4199` | 2026-02-21 | AndreRibeiro | feat: enhance drag-and-drop functionality to respect visual direction for item insertion |
| `eb8c051` | 2026-02-21 | AndreRibeiro | feat: update delete confirmation logic to handle categories with subcategories |
| `f049d11` | 2026-02-21 | AndreRibeiro | feat: swap icons for export and import buttons for clarity |
| `14a42c7` | 2026-02-21 | AndreRibeiro | feat: replace Button with div for ColorPicker and category toggle for improved accessibility |
| `4e72187` | 2026-02-21 | AndreRibeiro | feat: update icon names to include AlarmClock for consistency |
| `7274142` | 2026-02-21 | AndreRibeiro | feat: enhance icon picker with search functionality |
| `d0178f8` | 2026-02-21 | AndreRibeiro | feat: enhance LinkCardsView with improved layout, new Globe icon, and refined drag-and-drop interactions |
| `975f1c6` | 2026-02-21 | AndreRibeiro | feat: add drag-and-drop functionality to LinkCardsView for improved link management |
| `b53b9e3` | 2026-02-21 | AndreRibeiro | feat: update CHANGELOG with new Cards View, dynamic card sizes, and removal of Lovable dependency |
| `03af702` | 2026-02-21 | AndreRibeiro | feat: add card size selection to ViewSwitcher and LinkCardsView for improved layout customization |
| `5bf0b07` | 2026-02-21 | AndreRibeiro | feat: update README and security documents, remove lovable-tagger dependency |
| `e1cefb5` | 2026-02-21 | AndreRibeiro | feat: add card view mode and LinkCardsView component for enhanced link display |

---

## 🗓️ 2026-02-20 — v0.7.0 / Full-Text Search / Activity Log / OG Image

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `5833ae5` | 2026-02-20 | AndreRibeiro | feat: enhance server-side search with fallback handling for unavailable RPC |
| `e6e1960` | 2026-02-20 | AndreRibeiro | feat: implement full-text search for links with server-side support and debounce functionality |
| `5a64cf7` | 2026-02-20 | AndreRibeiro | feat: update CHANGELOG with new features including API Key Rotation, Activity Log, Command Palette, OG Preview, and ViewSwitcher enhancements |
| `8d726b2` | 2026-02-20 | AndreRibeiro | feat: implement API key rotation system with fallback support for Supabase |
| `59b13b3` | 2026-02-20 | AndreRibeiro | feat: add DialogTitle to CommandPalette for improved accessibility |
| `95e34f8` | 2026-02-20 | AndreRibeiro | feat: implement activity log system; add ActivityPanel and CommandPalette components for user actions history |
| `24147c7` | 2026-02-20 | AndreRibeiro | feat: enhance ViewSwitcher with grid column selection; update Index page to manage grid column state |
| `0ebac01` | 2026-02-20 | AndreRibeiro | feat: implement view switching functionality with LinkTableView and LinkBoardView components; update Index page to support multiple view modes |
| `2978132` | 2026-02-20 | AndreRibeiro | feat: add ogImage support to LinkItem, LinkCard, and LinkForm components; update validation and database schema |
| `97fb98c` | 2026-02-20 | AndreRibeiro | feat: add backlog of future features with priorities and descriptions |
| `c402204` | 2026-02-20 | AndreRibeiro | feat: update changelog for version 0.7.0, add centralized logging system, error boundary component, favicon fallback, bundle optimization, and clean up unused components |
| `65a6752` | 2026-02-20 | AndreRibeiro | feat: remove unused Slider and useToast components, and enhance Vite configuration for vendor chunking |
| `e0d83e3` | 2026-02-20 | AndreRibeiro | fix: correct meta tag name for mobile web app capability in index.html |
| `dd2b4a3` | 2026-02-20 | AndreRibeiro | feat: refactor logger usage in useAuth hook to use named functions for user identification |
| `bae8f79` | 2026-02-20 | AndreRibeiro | feat: add centralized logging system, implement ErrorBoundary component, and enhance error handling in useAuth and useLinks hooks |
| `1a7e657` | 2026-02-20 | AndreRibeiro | feat: implement rate limiting for links and categories, add client-side enforcement, and update database triggers |

---

## 🗓️ 2026-02-19 — Renomeação para WebNest / PWA

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `97b7be6` | 2026-02-19 | AndreRibeiro | feat: rename project to WebNest and implement PWA features |

---

## 🗓️ 2026-02-17 — Drag & Drop / Temas / Notas / Atalhos

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `9428d04` | 2026-02-17 | AndreRibeiro | feat: implement drag-and-drop functionality in AppSidebar and add related tests |
| `1bcb7b1` | 2026-02-17 | AndreRibeiro | feat: add multiple themes to ThemeToggle and update theme switching logic |
| `5549ff9` | 2026-02-17 | AndreRibeiro | feat: add notes functionality to links, including UI updates and database migration |
| `648ced9` | 2026-02-17 | AndreRibeiro | feat: implement global keyboard shortcuts and enhance SearchBar with ref |
| `d52f9bf` | 2026-02-17 | AndreRibeiro | refactor: remove unused UI components and improve metadata caching |
| `75f2a08` | 2026-02-17 | AndreRibeiro | refactor: improve drag and drop reordering logic to use filtered links |
| `5e45b77` | 2026-02-17 | AndreRibeiro | drag & drop err 8 |
| `ea3f9c5` | 2026-02-17 | AndreRibeiro | drag & drop err 7 |
| `6db2d33` | 2026-02-17 | AndreRibeiro | drag & drop err 6 |
| `92a8754` | 2026-02-17 | AndreRibeiro | drag & drop err 6 |
| `0d7ad26` | 2026-02-17 | AndreRibeiro | drag & drop err 5 |
| `a601afa` | 2026-02-17 | AndreRibeiro | drag & drop erro4 |
| `43628f8` | 2026-02-17 | AndreRibeiro | Drag & Drop erro 3 |
| `7297a7c` | 2026-02-17 | AndreRibeiro | drag & drop erro pisca |
| `0afd960` | 2026-02-17 | AndreRibeiro | drag & drop erro ao arrastar |
| `9bf6196` | 2026-02-17 | AndreRibeiro | Drag & Drop erro |
| `b836f3a` | 2026-02-17 | AndreRibeiro | Drag & Drop melhorias |
| `c8a869e` | 2026-02-17 | AndreRibeiro | docker erro 2 |
| `6297cca` | 2026-02-17 | AndreRibeiro | docker - erro |
| `a5bb294` | 2026-02-17 | AndreRibeiro | docker |

---

## 🗓️ 2026-02-16 — Features Iniciais: Subcategorias, Preview, Export, Busca

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `5d19810` | 2026-02-16 | AndreRibeiro | bookmark navegador |
| `80b488b` | 2026-02-16 | AndreRibeiro | Detecção de links duplicados |
| `3362fa0` | 2026-02-16 | AndreRibeiro | Soft Delete/Trash |
| `46c1173` | 2026-02-16 | AndreRibeiro | segurança de deleção |
| `57dea88` | 2026-02-16 | AndreRibeiro | drag & drop erro 1 |
| `31a4508` | 2026-02-16 | AndreRibeiro | drag drop melhoria |
| `d352e97` | 2026-02-16 | AndreRibeiro | erro ao criar subcategoria |
| `5779337` | 2026-02-16 | AndreRibeiro | Subcategoria |
| `b21fc81` | 2026-02-16 | AndreRibeiro | erro 5 ao colar o link |
| `057853c` | 2026-02-16 | AndreRibeiro | erro 4 ao colar o ink |
| `8f504ee` | 2026-02-16 | AndreRibeiro | erro 3 ao colar o link |
| `b35df6f` | 2026-02-16 | AndreRibeiro | erro 2 ao colar o link |
| `d006d3e` | 2026-02-16 | AndreRibeiro | erro ao colar o link |
| `be46291` | 2026-02-16 | AndreRibeiro | Link Preview |
| `f210b67` | 2026-02-16 | AndreRibeiro | Implementação de Export/Import |
| `4de870c` | 2026-02-16 | AndreRibeiro | correção erro dash 2 |
| `6331296` | 2026-02-16 | AndreRibeiro | correção de erro dashboard |
| `6ab89e9` | 2026-02-16 | AndreRibeiro | Busca Avançada |
| `8f3f71d` | 2026-02-16 | AndreRibeiro | otimização do projeto |

---

## 🗓️ 2026-02-15 — Setup Inicial / Supabase / Auth / Segurança

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `4316c6e` | 2026-02-15 | AndreRibeiro | icone erro 2 |
| `61cc57d` | 2026-02-15 | AndreRibeiro | icon erro 1 |
| `b39543d` | 2026-02-15 | AndreRibeiro | icon |
| `6ccaa7f` | 2026-02-15 | AndreRibeiro | erro 4 |
| `4ca90b0` | 2026-02-15 | AndreRibeiro | erro 4 |
| `e4728c1` | 2026-02-15 | AndreRibeiro | erro 3 |
| `6f9de95` | 2026-02-15 | AndreRibeiro | Remove leaked .env |
| `7a8cd84` | 2026-02-15 | AndreRibeiro | supabase - erro |
| `a8434ea` | 2026-02-15 | AndreRibeiro | .env atualizado |
| `7321fea` | 2026-02-15 | AndreRibeiro | warning 2 |
| `0a6aa13` | 2026-02-15 | AndreRibeiro | warning 1 |
| `cddf624` | 2026-02-15 | AndreRibeiro | Atualizações para correção do drag & drop |
| `1791b9e` | 2026-02-15 | AndreRibeiro | Merge branch 'main' of https://github.com/aluizr/internet-gems-finder |
| `fc49500` | 2026-02-15 | AndreRibeiro | Adicionado Drag & Drop |
| `c63ad2c` | 2026-02-15 | gpt-engineer-app[bot] | Fix minify option in vite config |
| `16fd428` | 2026-02-15 | gpt-engineer-app[bot] | Changes |
| `6c3988f` | 2026-02-15 | gpt-engineer-app[bot] | Corrigido fetch wrapper |
| `45db9cc` | 2026-02-15 | gpt-engineer-app[bot] | Changes |
| `96b395c` | 2026-02-15 | AndreRibeiro | Atualização de segurança. |
| `cf7c036` | 2026-02-15 | gpt-engineer-app[bot] | Add auth and validation |
| `f54e25b` | 2026-02-15 | gpt-engineer-app[bot] | Changes |

---

## 🗓️ 2026-02-14 — Fundação: Dark Mode, Import/Export, Supabase DB

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `097d295` | 2026-02-14 | gpt-engineer-app[bot] | Add dark mode toggle in header |
| `cf29a8c` | 2026-02-14 | gpt-engineer-app[bot] | Changes |
| `efc77ac` | 2026-02-14 | gpt-engineer-app[bot] | Add import/export JSON backup |
| `4eabb71` | 2026-02-14 | gpt-engineer-app[bot] | Changes |
| `b9d4827` | 2026-02-14 | gpt-engineer-app[bot] | Migrate to Supabase DB |
| `9ce9ee2` | 2026-02-14 | gpt-engineer-app[bot] | Changes |
| `d247757` | 2026-02-14 | gpt-engineer-app[bot] | Lovable update |
| `61cabb4` | 2026-02-14 | gpt-engineer-app[bot] | Changes |

---

## 🗓️ 2026-02-13 — Commit Inicial / Template

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `25ae481` | 2026-02-13 | gpt-engineer-app[bot] | Implement sidebar UI for links repository |
| `1f8524c` | 2026-02-13 | gpt-engineer-app[bot] | Changes |
| `a33b107` | 2026-02-13 | gpt-engineer-app[bot] | Updated plan file |

---

## 🗓️ 2025-01-01 — Template Base

| Hash | Data | Autor | Mensagem |
|------|------|-------|----------|
| `b331aa1` | 2025-01-01 | Lovable | template: new_style_vite_react_shadcn_ts_testing_2026-01-08 |

---

## 📊 Resumo Estatístico

| Métrica | Valor |
|---------|-------|
| **Total de commits** | **400** |
| Primeiro commit | 2025-01-01 |
| Último commit | 2026-04-22 |
| Autores principais | AndreRibeiro, gpt-engineer-app[bot], Lovable |
| Branch | main |

### Commits por mês
| Período | Commits |
|---------|---------|
| 2025-01 | 1 |
| 2026-02 | ~115 |
| 2026-03 | ~188 |
| 2026-04 | ~25 |
| **Total** | **400** |

### Tipos de commit (convenção)
| Tipo | Quantidade aproximada |
|------|-----------------------|
| `feat` | ~230 |
| `fix` | ~80 |
| `refactor` | ~15 |
| `chore` | ~25 |
| `docs` | ~15 |
| `style` | ~5 |
| `test` | ~3 |
| Sem prefixo (legado) | ~18 |
