# 🛡️ Sistema de Favicons WebNest

Este documento detalha o motor de renderização de ícones do WebNest, projetado para ser ultra-resiliente, rápido e fiel à identidade visual original dos sites.

## 🏗️ Arquitetura de Fallback

O componente `FaviconWithFallback` utiliza uma hierarquia de **6 níveis** para garantir que nenhum link fique sem representação visual, priorizando sempre a fonte original.

| Nível | Fonte | Descrição |
| :--- | :--- | :--- |
| **0** | **Original (DB)** | A URL detectada pelo scraper durante a adição do link. |
| **1** | **Unavatar** | Serviço de alta fidelidade especializado em extrair logos originais e HD. |
| **2** | **Google HD** | Cache de alta resolução (64x64) do Google Favicon Service. |
| **3** | **Nativo** | Tentativa direta de carregar o arquivo `/favicon.ico` da raiz do domínio. |
| **4** | **DuckDuckGo** | Proxy de ícones rápido e amplamente compatível. |
| **5** | **Icon Horse** | Serviço de fallback final para garantir cobertura total. |
| **6** | **Avatar** | **Inicial do domínio com cor gerada por hash determinístico.** |

## 🔗 Endpoints dos Serviços

Para referência, estes são os padrões de URL utilizados para cada serviço externo:

- **Unavatar**: `https://unavatar.io/{domain}?fallback=false`
- **Google HD**: `https://www.google.com/s2/favicons?domain={domain}&sz=64`
- **DuckDuckGo**: `https://icons.duckduckgo.com/ip3/{domain}.ico`
- **Icon Horse**: `https://icon.horse/icon/{domain}`

## 🚀 Lógica de Resiliência e Timeouts

O sistema utiliza duas camadas de proteção para evitar que a interface fique travada ou com ícones ausentes:

1.  **Evento `onError`**: O navegador detecta falhas imediatas (404, 403) e dispara o próximo nível instantaneamente.
2.  **Timeout de Segurança (5s)**: Se um ícone demorar mais de 5 segundos para carregar (estado "pending"), o componente força a mudança para o próximo nível.
3.  **Verificação de Integridade**: No evento `onLoad`, o sistema verifica se a imagem tem largura real (`naturalWidth > 1`). Se o serviço retornar uma imagem vazia ou transparente de 1x1, o fallback é acionado.

## 🔒 Proxy de Imagens

Para contornar restrições de CORS e políticas de segurança (CORP/CORB), utilizamos um proxy interno montado no servidor de desenvolvimento:

- **Caminho**: `/og-proxy?url={encoded_url}`
- **Implementação**: Localizada no middleware `server.middlewares` dentro do arquivo `vite.config.js`.

## 💻 Exemplo de Uso

Para utilizar o componente em qualquer parte da aplicação:

```tsx
import { FaviconWithFallback } from "@/components/FaviconWithFallback";

// Exemplo básico
<FaviconWithFallback 
  url="https://github.com" 
  size={32} 
  className="shadow-lg"
/>

// Com favicon já conhecido do banco de dados
<FaviconWithFallback 
  url={link.url} 
  favicon={link.favicon_url} 
  size={24} 
/>
```

---
*Última atualização: Maio de 2026*
