/**
 * Domains that should NEVER be proxied.
 * These usually serve public images without CORP restrictions, and may block/rate-limit proxy requests.
 */
const SKIP_PROXY_DOMAINS = new Set<string>([
  'supabase.co',
  'amazonaws.com',
  'ytimg.com',
  'icon.horse'
]);

/**
 * Domains known to send `Cross-Origin-Resource-Policy: same-origin`,
 * which blocks browsers from loading their images cross-origin.
 * Also includes domains that block hotlinking (like wikimedia)
 * Only add domains here when confirmed to produce ERR_BLOCKED_BY_RESPONSE.NotSameOrigin or Hotlink 403s.
 */
const CORP_BLOCKED_DOMAINS = new Set([
  'claude.ai',
  'anthropic.com',
  'wikimedia.org',
  'upload.wikimedia.org',
  'readthedocs.io'
]);

const IMAGE_PROXY_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_IMAGE_PROXY === 'true';

function getPlaceholderImage(): string {
  const basePath = import.meta.env.BASE_URL || '/';
  return basePath.endsWith('/') 
    ? `${basePath}placeholder.svg` 
    : `${basePath}/placeholder.svg`;
}

function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function isCorpBlockedUrl(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return false;
  if (!(imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) return false;

  const hostname = getHostname(imageUrl);
  if (!hostname) return false;

  return [...CORP_BLOCKED_DOMAINS].some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );
}

/**
 * Resolves an image URL for rendering.
 * In development we keep the proxy available; in production we avoid /og-proxy
 * because GitHub Pages is static and cannot serve it.
 */
export function resolveImageSource(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;

  // Already proxied path: keep it only in dev, otherwise fall back to a safe local placeholder.
  if (imageUrl.startsWith('/og-proxy')) {
    return IMAGE_PROXY_ENABLED ? imageUrl : getPlaceholderImage();
  }

  if (imageUrl.startsWith('/') || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    return imageUrl;
  }

  if (IMAGE_PROXY_ENABLED && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    try {
      const hostname = new URL(imageUrl).hostname.replace(/^www\./, '');
      const shouldSkip = [...SKIP_PROXY_DOMAINS].some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      );
      if (shouldSkip) {
        return imageUrl;
      }
    } catch {
      // Invalid URL: fall back to the original value.
      return imageUrl;
    }

    return `/og-proxy?url=${encodeURIComponent(imageUrl)}`;
  }

  if (isCorpBlockedUrl(imageUrl) || imageUrl.startsWith('/og-proxy')) {
    return getPlaceholderImage();
  }

  return imageUrl;
}

/**
 * Ensures an image URL goes through the /og-proxy to bypass CORS restrictions
 * If the URL is already proxied, returns it as-is
 * If the URL is null/undefined, returns null
 */
export function ensureProxied(imageUrl: string | null | undefined): string | null {
  return resolveImageSource(imageUrl);
}

/**
 * Extracts the original URL from a proxied URL
 * If not proxied, returns the URL as-is
 */
export function extractFromProxy(proxiedUrl: string | null | undefined): string | null {
  if (!proxiedUrl) return null;

  if (proxiedUrl.startsWith('/og-proxy?url=')) {
    try {
      const url = new URL(proxiedUrl, 'http://localhost');
      const originalUrl = url.searchParams.get('url');
      return originalUrl || proxiedUrl;
    } catch {
      return proxiedUrl;
    }
  }

  return proxiedUrl;
}

/**
 * Checks if a URL is already proxied
 */
export function isProxied(url: string | null | undefined): boolean {
  return !!url && url.startsWith('/og-proxy');
}

/**
 * Like ensureProxied(), but ONLY proxies images from known CORP-restricted domains.
 * For all other URLs the original value is returned unchanged.
 *
 * Use this at render time (img src) — never store the proxied path in the database.
 */
export function ensureProxiedIfCorp(imageUrl: string | null | undefined): string | null {
  return resolveImageSource(imageUrl);
}

