# 🛡️ Guia de Desenvolvimento: LinkCard.tsx

Este arquivo é o componente central da interface do WebNest. Por ser complexo e altamente interativo, siga rigorosamente estas diretrizes para evitar regressões de UI ou erros de build.

## ⚠️ 1. Integridade do Arquivo (Antigo .kiro)

Para evitar corrupção durante edições automáticas por IA:
- **Imports Primeiro:** NUNCA insira funções ou constantes entre blocos de `import`.
- **Ordem:** 1. Imports -> 2. Constantes auxiliares -> 3. Interfaces (Props) -> 4. Componente Principal.
- **Exportação:** Mantenha o componente como `export function LinkCard`.

## 🎨 2. Design System & Tokens

Mantenha a consistência visual usando os utilitários definidos em `@/lib/utils`:
- **Textos Pequenos:** Use `${TEXT_XS_CLASS}` em descrições, notas e labels secundários.
- **Badges:** Use `COMPACT_BADGE_CLASS` para status, prioridade e tags.
- **Botões de Ação:** Use `${ICON_BTN_MD_CLASS}` para botões de edição, favorito e lixeira.
- **Cores Dinâmicas:** Ao lidar com cores de categorias, sempre use o sistema de fallback:
  ```tsx
  style={{ backgroundColor: `${color}20`, color: color, borderColor: `${color}40` }}
  ```

## 🖼️ 3. Gestão de Imagens (Capa e Favicon)

- **Favicons:** Use SEMPRE o componente `<FaviconWithFallback />`. Ele centraliza a lógica de fallback e detecção de erros.
- **Capas (ogImage):** 
  - Imagens do **Supabase Storage** (contendo `supabase.co/storage`) devem ser carregadas diretamente.
  - Imagens externas devem passar pelo proxy `/og-proxy?url=...` se houver problemas de CORS.
  - SEMPRE implemente o `onError` para disparar `invalidateThumbnailCache(link.url)`.

## 🖱️ 4. Drag & Drop (Altamente Sensível)

O `LinkCard` é uma "peça" fundamental do sistema de reordenação. Não altere as props de drag sem testar o `Index.tsx`:
- **Atributos:** Mantenha `draggable={dragEnabled}` e `data-card-id={link.id}`.
- **Eventos:** Não remova ou altere o comportamento de `onDragStart`, `onDragOver` e `onDrop`. Eles são essenciais para a reordenação manual.
- **Feedback Visual:** Mantenha as classes condicionais para `${isDragging}` e `${isDropZone}`.

## ♿ 5. Acessibilidade & UX

- **Tooltips/Titles:** Ícones que indicam estado (ex: `ShieldAlert` para links quebrados) DEVEM ter um elemento `<title>` ou Tooltip explicativo.
- **Links Externos:** Use sempre `target="_blank"` e `rel="noopener noreferrer"`.
- **Truncamento:** Use `truncate` ou `line-clamp-X` para evitar que títulos longos quebrem o layout do card.

## 🚀 6. Performance

- O `LinkCard` é renderizado centenas de vezes. Evite cálculos pesados dentro do corpo do componente.
- Use `useMemo` para transformações de dados complexas se necessário.

## 🔒 7. Tipagem e Segurança de Tipos

- **Zero `any`**: NUNCA use `any`. Se uma prop ou variável for complexa, defina uma interface ou use os tipos de `@/types/link`.
- **Eventos**: Use tipos específicos para eventos (ex: `React.MouseEvent`, `React.DragEvent`) para garantir suporte total do IntelliSense.

## ⚡ 8. Propagação de Eventos

- **Botões Internos**: Todos os botões de ação (`Pencil`, `Trash`, `Star`) DEVEM usar `e.stopPropagation()` em seus handlers para não disparar eventos de clique ou drag do card pai.

## 🚀 9. Otimização de Re-render

- **React.memo**: O componente deve ser exportado envolto em `React.memo` se as props de callback forem estáveis (usando `useCallback` no componente pai).
- **Cálculos no Render**: Transformações de arrays ou buscas em `categories` devem ser feitas dentro de um `useMemo` ou fora do componente se forem estáticas.

---
*Este guia substitui as regras antigas localizadas em .kiro/steering e é atualizado conforme novas necessidades de integridade surgem.*
