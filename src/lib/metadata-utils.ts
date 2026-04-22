/**
 * Utilities for URL normalization and metadata extraction
 */

/** Normalize URL for consistent cache keys and clean fetch */
export function normalizeUrl(url: string): string {
  try {
    let cleanUrl = url.trim();
    
    // Remove browser text fragments (#:~:text=...)
    if (cleanUrl.includes("#:~:text=")) {
      cleanUrl = cleanUrl.split("#:~:text=")[0];
    }
    
    const u = new URL(cleanUrl);
    // Remove trailing slash, lowercase host, strip hash
    return u.origin.toLowerCase() + u.pathname.replace(/\/+$/, "") + u.search;
  } catch {
    return url.trim().toLowerCase();
  }
}

/** 
 * Clean title by removing common site suffixes 
 * e.g. "Title | Site Name" -> "Title"
 */
export function cleanMetadataTitle(title: string | null): string | null {
  if (!title) return null;
  
  let cleaned = title.trim();
  
  // Common separators: " | ", " - ", " – ", " — "
  const separators = [" | ", " - ", " – ", " — "];
  
  for (const sep of separators) {
    if (cleaned.includes(sep)) {
      const parts = cleaned.split(sep);
      // If the last part looks like a site name (single word or common domain part)
      const lastPart = parts[parts.length - 1].trim();
      if (lastPart.length > 0 && lastPart.length < 20) {
        cleaned = parts.slice(0, -1).join(sep).trim();
      }
    }
  }
  
  return cleaned || title;
}

const VALID_IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i;

export function isValidImageUrl(url: string): boolean {
  try {
    const { pathname } = new URL(url);
    return VALID_IMAGE_EXTENSIONS.test(pathname) || !pathname.includes('.');
  } catch {
    return false;
  }
}

/**
 * Extract original image URL from proxy services (Next.js, Vercel, etc)
 */
export function extractOriginalImageUrl(imageUrl: string): string {
  if (!imageUrl) return imageUrl;
  
  try {
    const url = new URL(imageUrl);
    
    // Next.js Image Optimization: /_next/image?url=...
    if (url.pathname.includes('/_next/image')) {
      const originalUrl = url.searchParams.get('url');
      if (originalUrl) {
        if (originalUrl.startsWith('http')) {
          return originalUrl;
        } else if (originalUrl.startsWith('/')) {
          return `${url.origin}${originalUrl}`;
        }
      }
    }
    
    // Vercel Image Optimization
    if (url.pathname.includes('/_vercel/image')) {
      const originalUrl = url.searchParams.get('url');
      if (originalUrl) {
        return originalUrl.startsWith('http') ? originalUrl : imageUrl;
      }
    }
    
    // Cloudflare Image Resizing
    if (url.pathname.includes('/cdn-cgi/image/')) {
      const parts = url.pathname.split('/cdn-cgi/image/');
      if (parts[1]) {
        const afterParams = parts[1].split('/').slice(1).join('/');
        if (afterParams.startsWith('http')) {
          return afterParams;
        }
      }
    }
    
    // Imgix, Unsplash
    if (url.hostname.includes('imgix.net') || url.hostname === 'images.unsplash.com') {
      const original = new URL(imageUrl);
      original.search = '';
      return original.toString();
    }
    
    return imageUrl;
  } catch {
    return imageUrl;
  }
}

/**
 * Known fallback images for sites that block scraping
 */
const DEFAULT_KNOWN_FALLBACKS: Record<string, string> = {
  'kaggle.com': 'https://www.kaggle.com/static/images/site-logo.svg',
  'joblib.readthedocs.io': 'https://joblib.readthedocs.io/en/stable/_static/joblib_logo.svg',
  'nanobananaimg.com': 'https://nanobananaimg.com/favicon.ico',
  'salesforce.com': 'https://www.salesforce.com/content/dam/sfdc-docs/www/logos/logo-salesforce.svg',
  'github.com': 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
  'linkedin.com': 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
  'twitter.com': 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
  'x.com': 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
  'youtube.com': 'https://www.youtube.com/img/desktop/yt_1200.png',
  'medium.com': 'https://miro.medium.com/v2/1*m-R_BkNf1Qjr1YbyOIJY2w.png',
  'greenhouse.io': 'https://mma.prnewswire.com/media/1802066/Greenhouse_Logo.jpg',
  'uol.com.br': 'https://conteudo.imguol.com.br/c/home/interacao/facebook/compartilhe.png',
  'globo.com': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Globo.com_logo.svg/512px-Globo.com_logo.svg.png',
};

const DEFAULT_FAVICON_FALLBACKS: Record<string, string> = {
  'uol.com.br': 'https://www.uol.com.br/favicon.ico',
  'globo.com': 'https://www.globo.com/favicon.ico',
};

export const KNOWN_FALLBACKS: Record<string, string> = (() => {
  const dict = { ...DEFAULT_KNOWN_FALLBACKS };
  if (typeof window === "undefined") return dict;
  try {
    const stored = localStorage.getItem("webnest:known_fallbacks");
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.assign(dict, parsed);
      
      // Self-heal known broken cached domains
      if (dict['claude.ai'] && (dict['claude.ai'].includes('claude.ai/images') || dict['claude.ai'].includes('wikimedia.org'))) {
        delete dict['claude.ai'];
      }
    }
  } catch (err) {
    console.debug("[metadata-utils] Error loading known_fallbacks:", err);
  }
  return dict;
})();

export const KNOWN_FAVICON_FALLBACKS: Record<string, string> = (() => {
  const dict = { ...DEFAULT_FAVICON_FALLBACKS };
  if (typeof window === "undefined") return dict;
  try {
    const stored = localStorage.getItem("webnest:known_favicon_fallbacks");
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.assign(dict, parsed);
    }
  } catch (err) {
    console.debug("[metadata-utils] Error loading known_favicon_fallbacks:", err);
  }
  return dict;
})();

export function getKnownFallback(url: string): string | null {
  try {
    const hostname = new URL(url).hostname;
    if (KNOWN_FALLBACKS[hostname]) return KNOWN_FALLBACKS[hostname];
    for (const [domain, fallback] of Object.entries(KNOWN_FALLBACKS)) {
      if (hostname.includes(domain)) return fallback;
    }
    return null;
  } catch {
    return null;
  }
}

export function getKnownFaviconFallback(url: string): string | null {
  try {
    const hostname = new URL(url).hostname;
    if (KNOWN_FAVICON_FALLBACKS[hostname]) return KNOWN_FAVICON_FALLBACKS[hostname];
    for (const [domain, fallback] of Object.entries(KNOWN_FAVICON_FALLBACKS)) {
      if (hostname.includes(domain)) return fallback;
    }
    return null;
  } catch {
    return null;
  }
}
