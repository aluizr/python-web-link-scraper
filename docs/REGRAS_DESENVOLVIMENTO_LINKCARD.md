---
inclusion: fileMatch
fileMatchPattern: "src/components/LinkCard.tsx"
---

# Regras para LinkCard.tsx

## ⚠️ IMPORTANTE: Evitar Corrupção do Arquivo

Este arquivo teve problemas de corrupção no passado. Siga estas regras:

### ❌ NUNCA FAÇA ISSO:

```typescript
import { Something } from "somewhere";

// ❌ ERRO: Função entre imports
function myFunction() {
  // ...
}

import { OtherThing } from "elsewhere";
```

### ✅ SEMPRE FAÇA ASSIM:

```typescript
// Todos os imports primeiro
import { Something } from "somewhere";
import { OtherThing } from "elsewhere";

// Depois constantes e funções
function myFunction() {
  // ...
}

// Depois o componente
export function LinkCard() {
  // ...
}
```

## Estrutura Correta do Arquivo

1. **Imports** (linhas 1-20)
   - Ícones do lucide-react
   - Componentes UI
   - Tipos e utilitários

2. **Constantes** (após imports)
   - `statusLabel`
   - `priorityLabel`

3. **Interface** (após constantes)
   - `LinkCardProps`

4. **Componente** (após interface)
   - `export function LinkCard()`

## Favicon

- Use `link.favicon` diretamente no `FaviconWithFallback`
- NÃO crie funções auxiliares para favicon
- O `FaviconWithFallback` já lida com todos os casos

## Thumbnails

- Use `link.ogImage` diretamente no `<img src={link.ogImage}>`
- NÃO use `ensureProxied()` - URLs diretas funcionam melhor
- Mantenha os logs de debug `onLoad` e `onError`

## Validação

Antes de commitar, o hook `.git/hooks/pre-commit` valida:
- Não há funções entre imports
- O build compila sem erros

Se o hook falhar, corrija o arquivo antes de commitar.
