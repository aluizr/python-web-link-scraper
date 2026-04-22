import { ensureProxiedIfCorp } from './image-utils';

const resolvedCache = new Map<string, string>();

export function getCachedThumbSrc(
  linkId: string,
  ogImage: string | null | undefined,
  proxyFailed: boolean
): string | null {
  if (!ogImage) return null;

  const cacheKey = `${linkId}:${proxyFailed}`;
  if (resolvedCache.has(cacheKey)) return resolvedCache.get(cacheKey)!;

  let raw = ogImage;
  if (raw.includes('/og-proxy?url=')) {
    try {
      raw = new URL(raw, 'http://localhost').searchParams.get('url') ?? raw;
    } catch (err) {
      console.debug("[image-cache] URL extraction error:", err);
    }
  }

  const resolved = proxyFailed ? raw : (ensureProxiedIfCorp(raw) ?? raw);
  resolvedCache.set(cacheKey, resolved);
  return resolved;
}
