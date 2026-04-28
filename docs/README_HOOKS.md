# Proteção contra Corrupção de Arquivos

## Problema

O arquivo `LinkCard.tsx` teve problemas de corrupção quando funções eram adicionadas entre imports, causando erros de sintaxe.

## Solução

### 1. Hook Pre-Commit

Instalado automaticamente, valida o arquivo antes de commitar:

```powershell
# Instalar o hook
.\install-hooks.ps1
```

O hook verifica:
- ✅ Não há funções entre imports
- ✅ O build compila sem erros

### 2. Guia de Desenvolvimento

Consulte [REGRAS_DESENVOLVIMENTO_LINKCARD.md](REGRAS_DESENVOLVIMENTO_LINKCARD.md) para diretrizes sobre:
- Estrutura correta do arquivo
- Tipagem estrita e performance (memo/useMemo)
- Prevenção de conflitos de eventos (stopPropagation)
- Uso de favicons e thumbnails

### 3. Estrutura Correta

```typescript
// ✅ CORRETO
import { A } from "a";
import { B } from "b";

const CONSTANT = "value";

function helper() {}

export function Component() {}
```

```typescript
// ❌ ERRADO
import { A } from "a";

function helper() {} // ❌ Entre imports!

import { B } from "b";
```

## Uso

Ao editar `LinkCard.tsx`:
1. As regras de steering são carregadas automaticamente
2. Ao commitar, o hook valida o arquivo
3. Se houver erro, o commit é bloqueado

## Desabilitar

Se precisar desabilitar temporariamente:

```powershell
# Desabilitar hook
git commit --no-verify -m "mensagem"
```

Mas isso não é recomendado!
