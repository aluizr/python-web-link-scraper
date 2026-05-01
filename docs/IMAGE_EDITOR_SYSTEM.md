# Sistema de Edição e Captura de Imagens (v2.0)

Este documento detalha o funcionamento técnico e as funcionalidades do componente `ScreenCropSelector`, responsável por toda a experiência de manipulação de capas e thumbnails no WebNest.

## 🚀 Visão Geral

O sistema evoluiu de um simples seletor de recorte para um editor de imagens robusto, capaz de realizar capturas de tela, anotações vetoriais e aplicação de filtros, tudo integrado ao fluxo de armazenamento do Supabase.

## 🛠️ Funcionalidades Principais

### 1. Modos de Operação
*   **Captura de Tela Cheia**: Captura o monitor/janela selecionado via `getDisplayMedia`.
*   **Seleção de Área**: Permite capturar a tela e selecionar imediatamente um recorte específico.
*   **Recorte de Imagem Existente**: Substitui o antigo `ImageCropTool`, permitindo editar imagens já salvas nos links.

### 2. Ferramentas de Anotação (Vetoriais)
O editor utiliza uma camada SVG sincronizada para permitir desenhos em tempo real:
*   **Seta (A)**: Para apontar elementos importantes.
*   **Retângulo (R)**: Para destacar áreas da imagem.
*   **Desfoque / Blur (B)**: Para ocultar informações sensíveis (senhas, nomes, etc).
*   **Mover / Recortar (C)**: Modo padrão para ajuste de área.

### 3. Filtros de Imagem
Processamento direto via Canvas para ajustes rápidos:
*   **Original**: Sem alterações.
*   **P&B**: Filtro de escala de cinza para um visual minimalista.
*   **Contraste**: Aumento de 150% no contraste para melhorar a legibilidade.

## ⌨️ Atalhos de Teclado (Produtividade Pro)

| Tecla | Ação |
|-------|------|
| `C` | Ferramenta de Movimentação / Recorte |
| `A` | Ferramenta de Seta |
| `R` | Ferramenta de Retângulo |
| `B` | Ferramenta de Desfoque (Blur) |
| `Z` + `Ctrl/Cmd` | Desfazer última anotação |
| `Enter` | Confirmar e Salvar |
| `Esc` | Cancelar e Sair |

## 📐 Detalhes Técnicos e Resiliência

### Mapeamento de Coordenadas
O componente resolve o problema clássico de desvio de pixels em telas de alta densidade (Retina/4K) e no uso de `object-contain` através de:
1.  **Cálculo de Offset**: Detecta as barras pretas geradas pelo CSS e ajusta a origem do recorte.
2.  **Escalonamento**: Converte as coordenadas visuais (CSS) para os pixels reais da imagem original (Natural Size).
3.  **Clamping**: Garante que o recorte nunca tente acessar pixels fora dos limites da imagem, evitando erros de execução.

### Segurança e CORS (Proxy)
Para permitir que imagens de sites externos (como GitHub, Google, LinkedIn) sejam manipuladas em um Canvas (que é uma operação sensível), utilizamos:
*   **`ensureProxied`**: Todas as imagens externas são roteadas via `/og-proxy`.
*   **`Access-Control-Allow-Origin: *`**: O proxy limpa os headers restritivos, permitindo que o navegador exporte o Blob final sem "sujar" o canvas.

## 🔧 Manutenção e Logs

Para depuração em tempo real, o sistema emite logs no console com o prefixo `[ScreenCrop]` e `[LinkForm]`. 

Principais arquivos envolvidos:
*   [`src/components/ScreenCropSelector.tsx`](file:///c:/Repositorio/python-web-link-scraper/src/components/ScreenCropSelector.tsx): Lógica do editor.
*   [`src/components/LinkForm.tsx`](file:///c:/Repositorio/python-web-link-scraper/src/components/LinkForm.tsx): Integração e fluxo de upload.
*   [`src/lib/image-utils.ts`](file:///c:/Repositorio/python-web-link-scraper/src/lib/image-utils.ts): Lógica do proxy e tratamento de URLs.
