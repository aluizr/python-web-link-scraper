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

const metadataCache = new LRUCache<string, LinkMetadata>(100, 24 * 60 * 60 * 1000, "webnest:metadata_cache");

const FETCH_TIMEOUT_MS = 8000;

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
      favicon: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`,
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

async function fetchOgImageFromHtml(url: string): Promise<string | null> {
  try {
    const proxyUrl = `/html-proxy?url=${encodeURIComponent(url)}`;
    const response = await fetchWithTimeout(proxyUrl);

    if (!response.ok) return null;

    const data = await response.json();
    if (data.ogImage) {
      try {
        new URL(data.ogImage);
        return data.ogImage;
      } catch {
        try {
          const baseUrl = new URL(url);
          return new URL(data.ogImage, baseUrl.origin).href;
        } catch (err) {
          console.debug("[useMetadata] HTML proxy relative URL conversion error:", err);
          return null;
        }
      }
    }
    return null;
  } catch (err) {
    console.debug("[useMetadata] HTML proxy error:", err);
    return null;
  }
}

async function fetchFromMicrolink(url: string): Promise<LinkMetadata | null> {
  try {
    const microlinkUrl = new URL("https://api.microlink.io");
    microlinkUrl.searchParams.set("url", url);
    microlinkUrl.searchParams.set("screenshot", "true");

    const response = await fetchWithTimeout(microlinkUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      if (response.status === 429) {
        localStorage.setItem("webnest:microlink_rate_limit", Date.now().toString());
      }
      
      const fallback = getKnownFallback(url);
      if (fallback) {
        let title = null;
        try {
          const urlObj = new URL(url);
          const hostname = urlObj.hostname.replace(/^www\./i, "");
          title = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
        } catch (err) {
          console.debug("[useMetadata] Title derivation error:", err);
        }
        return {
          title,
          description: null,
          image: fallback,
          favicon: getKnownFaviconFallback(url),
          loading: false,
          error: null,
          source: "microlink",
        };
      }

      const htmlMetadata = await fetchOgImageFromHtml(url);
      if (htmlMetadata) {
        return {
          title: null,
          description: null,
          image: htmlMetadata,
          favicon: getKnownFaviconFallback(url),
          loading: false,
          error: null,
          source: "local",
        };
      }
      
      return null;
    }

    const data = await response.json();
    if (!data.data) return null;

    const rawTitle = data.data.title || null;
    const isBlockedPage = rawTitle && (
      /^error:/i.test(rawTitle.trim()) ||
      /Attention Required!/i.test(rawTitle.trim()) ||
      /Just a moment\.\.\./i.test(rawTitle.trim()) ||
      /Cloudflare/i.test(rawTitle.trim()) ||
      /Access Denied/i.test(rawTitle.trim()) ||
      /403 Forbidden/i.test(rawTitle.trim())
    );

    if (isBlockedPage) {
      const fallback = getKnownFallback(url);
      let derivedTitle = null;
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace(/^www\./i, "");
        derivedTitle = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
      } catch (err) {
        console.debug("[useMetadata] Blocked page title derivation error:", err);
      }

      return {
        title: derivedTitle,
        description: null,
        image: fallback || null,
        favicon: getKnownFaviconFallback(url),
        loading: false,
        error: null,
        source: "microlink",
      };
    }

    let title = rawTitle;
    if (!title) {
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace(/^www\./i, "");
        title = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
      } catch (err) {
        console.debug("[useMetadata] Microlink empty title derivation error:", err);
        title = null;
      }
    }

    let image = getKnownFallback(url) || data.data.image?.url || null;
    
    if (!image) {
      image = await fetchOgImageFromHtml(url);
    }
    
    const screenshotUrl = data.data.screenshot?.url || null;
    const titleLower = (rawTitle || "").toLowerCase();
    const looksLikeErrorPage = /\b(403|404|429|500|502|503)\b/.test(titleLower) ||
      /(access denied|forbidden|not found|too many requests|rate limit)/i.test(titleLower);

    if (!image && screenshotUrl && !looksLikeErrorPage) {
      image = screenshotUrl;
    }
    
    if (image) {
      image = extractOriginalImageUrl(image);
    }

    const favicon = data.data.logo?.url || getKnownFaviconFallback(url);

    return {
      title: cleanMetadataTitle(title),
      description: data.data.description || null,
      image,
      favicon,
      loading: false,
      error: null,
      source: "microlink",
    };
  } catch (err) {
    console.debug("[useMetadata] Microlink fetch error:", err);
    return null;
  }
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

    setMetadata((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const normalizedUrl = normalizeUrl(url);
      const cached = metadataCache.get(normalizedUrl);
      if (cached) {
        setMetadata(cached);
        return cached;
      }

      let result = await fetchFromNotion(normalizedUrl);
      if (!result) result = await fetchFromMicrolink(normalizedUrl);
      if (!result) result = await fetchFromNoembed(normalizedUrl);
      if (!result) result = buildLocalFallback(normalizedUrl);

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
