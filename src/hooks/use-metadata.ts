import { useState, useCallback } from "react";
import { fetchNotionPageMetadata } from "@/lib/notion-api";
import { isNotionUrl } from "@/lib/notion-utils";
import { LRUCache } from "@/lib/lru-cache";
import { 
  normalizeUrl, 
  cleanMetadataTitle, 
  extractOriginalImageUrl, 
  getKnownFallback, 
  getKnownFaviconFallback,
  KNOWN_FALLBACKS,
  KNOWN_FAVICON_FALLBACKS
} from "@/lib/metadata-utils";

export interface LinkMetadata {
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
  loading: boolean;
  error: string | null;
  source: "notion" | "microlink" | "noembed" | "local" | null;
}

// Cache de metadados com versão para evitar dados corrompidos de versões anteriores
const CACHE_VERSION = "v5";
const metadataCache = new LRUCache<string, LinkMetadata>(100, 24 * 60 * 60 * 1000, `webnest:metadata_cache_${CACHE_VERSION}`);

const FETCH_TIMEOUT_MS = 12000;

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function invalidateThumbnailCache(url: string) {
  const normalizedUrl = normalizeUrl(url);
  metadataCache.delete(normalizedUrl);
  metadataCache.delete(url.trim());
}

function buildLocalFallback(url: string): LinkMetadata {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, "");
    return {
      title: host,
      description: null,
      image: null,
      favicon: `https://icon.horse/icon/${parsed.hostname}`,
      loading: false,
      error: null,
      source: "local",
    };
  } catch (err) {
    console.debug("[useMetadata] Fallback creation error:", err);
    return {
      title: null,
      description: null,
      image: null,
      favicon: null,
      loading: false,
      error: null,
      source: null,
    };
  }
}

async function fetchFromNotion(url: string): Promise<LinkMetadata | null> {
  const notionApiKey = localStorage.getItem("webnest:notion_api_key");
  if (!notionApiKey || !isNotionUrl(url)) {
    return null;
  }

  try {
    const notionMetadata = await fetchNotionPageMetadata(url, notionApiKey);
    if (!notionMetadata) return null;

    let image = notionMetadata.image;
    if (image) {
      image = extractOriginalImageUrl(image);
    }

    const favicon = notionMetadata.favicon || "https://www.notion.so/images/favicon.ico";

    return {
      ...notionMetadata,
      title: cleanMetadataTitle(notionMetadata.title),
      image,
      favicon,
      loading: false,
      error: null,
      source: "notion",
    };
  } catch (err) {
    console.debug("[useMetadata] Notion API error:", err);
    // Re-throw if it's a specific Notion error we want to show
    if (err instanceof Error && (err.message.includes("Notion") || err.message.includes("compartilhada"))) {
      throw err;
    }
    return null;
  }
}

export function saveKnownFallbacks(fallbacks: Record<string, string>) {
  Object.assign(KNOWN_FALLBACKS, fallbacks);
  localStorage.setItem("webnest:known_fallbacks", JSON.stringify(KNOWN_FALLBACKS));
}

export function saveKnownFaviconFallbacks(fallbacks: Record<string, string>) {
  Object.assign(KNOWN_FAVICON_FALLBACKS, fallbacks);
  localStorage.setItem("webnest:known_favicon_fallbacks", JSON.stringify(KNOWN_FAVICON_FALLBACKS));
}


async function fetchFromNoembed(url: string): Promise<LinkMetadata | null> {
  try {
    const noembedUrl = new URL("https://noembed.com/embed");
    noembedUrl.searchParams.set("url", url);

    const response = await fetchWithTimeout(noembedUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.error) return null;

    const title = data.title || data.author_name || data.provider_name || null;
    let image = data.thumbnail_url || null;
    
    if (image) {
      image = extractOriginalImageUrl(image);
    }

    if (!title && !image) return null;

    return {
      title: cleanMetadataTitle(title),
      description: data.provider_name || null,
      image,
      favicon: null,
      loading: false,
      error: null,
      source: "noembed",
    };
  } catch (err) {
    console.debug("[useMetadata] Noembed error:", err);
    return null;
  }
}

async function fetchFromUnifiedProxy(url: string): Promise<LinkMetadata | null> {
  try {
    const proxyUrl = `/api/metadata?url=${encodeURIComponent(url)}`;
    const response = await fetchWithTimeout(proxyUrl);

    if (!response.ok) return null;

    const data = await response.json();
    if (data.error) {
      console.debug("[useMetadata] Proxy returned error:", data.error);
      return null;
    }

    return {
      title: cleanMetadataTitle(data.title),
      description: data.description || null,
      // ✅ Não aplica extractOriginalImageUrl aqui:
      // O vite.config.js já interceptou URLs de domínios bloqueados (ex: thum.io)
      // e as substituiu por /og-proxy?url=... antes de retornar o JSON.
      // Chamar extractOriginalImageUrl desfaría esse proxy, devolvendo a URL
      // bloqueada diretamente ao browser e causando erro 403 no console.
      image: data.image
        ? (data.image.startsWith('/og-proxy') ? data.image : extractOriginalImageUrl(data.image))
        : null,
      favicon: data.favicon || getKnownFaviconFallback(url),
      loading: false,
      error: null,
      source: data.source || "local",
    };
  } catch (err) {
    console.debug("[useMetadata] Unified proxy error:", err);
    return null;
  }
}

export function useMetadata() {
  const [metadata, setMetadata] = useState<LinkMetadata>({
    title: null,
    description: null,
    image: null,
    favicon: null,
    loading: false,
    error: null,
    source: null,
  });

  const fetchMetadata = useCallback(async (url: string): Promise<LinkMetadata> => {
    if (!url || !url.trim()) {
      const empty: LinkMetadata = { title: null, description: null, image: null, favicon: null, loading: false, error: null, source: null };
      setMetadata(empty);
      return empty;
    }

    setMetadata((prev) => ({ 
      ...prev, 
      loading: true, 
      error: null,
      title: null,
      description: null,
      image: null,
      favicon: null
    }));

    try {
      // 🖼️ Detecção de Links Diretos de Imagem (PNG, SVG, JPG, etc.) - Antes de tudo
      const isDirectImage = /\.(png|svg|jpg|jpeg|webp|gif|avif|ico)(\?.*)?$/i.test(url.trim());
      if (isDirectImage) {
        const fileName = url.split('/').pop()?.split('?')[0] || "Imagem";
        const result: LinkMetadata = {
          title: `Imagem: ${fileName}`,
          description: "Link direto para arquivo de imagem.",
          image: url.trim(),
          favicon: getKnownFaviconFallback(url),
          loading: false,
          error: null,
          source: "local",
        };
        metadataCache.set(url.trim(), result);
        setMetadata(result);
        return result;
      }

      const normalizedUrl = normalizeUrl(url);

      const cached = metadataCache.get(normalizedUrl);
      if (cached) {
        setMetadata(cached);
        return cached;
      }

      let result = await fetchFromNotion(normalizedUrl);
      
      if (!result) {
        result = await fetchFromUnifiedProxy(normalizedUrl);
      }

      if (!result) {
        result = await fetchFromNoembed(normalizedUrl);
      }

      if (!result) {
        result = buildLocalFallback(normalizedUrl);
      }

      metadataCache.set(normalizedUrl, result);
      setMetadata(result);
      return result;
    } catch (err) {
      const errorResult: LinkMetadata = {
        title: null,
        description: null,
        image: null,
        favicon: null,
        loading: false,
        error: err instanceof Error ? err.message : "Erro desconhecido",
        source: null,
      };
      setMetadata(errorResult);
      return errorResult;
    }
  }, []);

  return { metadata, fetchMetadata };
}
