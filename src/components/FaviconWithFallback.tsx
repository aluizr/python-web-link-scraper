import { useState } from "react";
import { ensureProxied } from "@/lib/image-utils";
import { getKnownFaviconFallback } from "@/hooks/use-metadata";

/**
 * Paleta de cores consistente para avatares de fallback.
 * Cada domínio sempre recebe a mesma cor (hash determinístico).
 */
const AVATAR_COLORS = [
  { bg: "#ef4444", text: "#ffffff" }, // red
  { bg: "#f97316", text: "#ffffff" }, // orange
  { bg: "#f59e0b", text: "#ffffff" }, // amber
  { bg: "#84cc16", text: "#ffffff" }, // lime
  { bg: "#22c55e", text: "#ffffff" }, // green
  { bg: "#14b8a6", text: "#ffffff" }, // teal
  { bg: "#06b6d4", text: "#ffffff" }, // cyan
  { bg: "#3b82f6", text: "#ffffff" }, // blue
  { bg: "#6366f1", text: "#ffffff" }, // indigo
  { bg: "#8b5cf6", text: "#ffffff" }, // violet
  { bg: "#a855f7", text: "#ffffff" }, // purple
  { bg: "#ec4899", text: "#ffffff" }, // pink
  { bg: "#f43f5e", text: "#ffffff" }, // rose
  { bg: "#0ea5e9", text: "#ffffff" }, // sky
  { bg: "#10b981", text: "#ffffff" }, // emerald
  { bg: "#d946ef", text: "#ffffff" }, // fuchsia
];

/**
 * Hash simples para gerar índice determinístico a partir de uma string.
 * O mesmo hostname sempre retorna a mesma cor.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit int
  }
  return Math.abs(hash);
}

/**
 * Extrai a letra e cor para um domínio.
 */
function getAvatarData(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    // Usar a primeira letra do domínio (sem TLD)
    const domainName = hostname.split(".")[0] || hostname;
    const letter = domainName.charAt(0).toUpperCase();
    const colorIndex = hashString(hostname) % AVATAR_COLORS.length;
    const color = AVATAR_COLORS[colorIndex];
    return { letter, color, hostname };
  } catch {
    return {
      letter: "?",
      color: AVATAR_COLORS[0],
      hostname: "",
    };
  }
}

interface FaviconWithFallbackProps {
  url: string;
  favicon?: string;
  size?: number;
  className?: string;
}

/**
 * Componente que exibe o favicon de um site.
 * Quando o favicon falha ao carregar, mostra um avatar colorido
 * com a primeira letra do domínio.
 *
 * A cor é determinística: o mesmo domínio sempre recebe a mesma cor.
 */
export function FaviconWithFallback({
  url,
  favicon,
  size = 24,
  className = "",
}: FaviconWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  const [useSecondaryFallback, setUseSecondaryFallback] = useState(false);
  const avatarData = getAvatarData(url);

  // Determinar URL do favicon
  const faviconUrl = (() => {
    if (useSecondaryFallback) {
      try {
        const hostname = new URL(url).hostname;
        return `https://icon.horse/icon/${hostname}`;
      } catch {
        return null;
      }
    }

    // If custom favicon provided, use proxy for external URLs
    if (favicon && favicon.startsWith("http")) {
      // Don't proxy Google or Icon Horse
      if (favicon.includes('google.com/s2/favicons') || favicon.includes('icon.horse')) {
        return favicon;
      }
      
      // Clean up proxy if it's wikimedia (to avoid 429 rate limits)
      let finalFavicon = favicon;
      try {
        if (finalFavicon.includes('/og-proxy?url=')) {
          const params = new URL(finalFavicon, "http://localhost").searchParams;
          const urlParam = params.get('url');
          if (urlParam) finalFavicon = urlParam;
        }
        
        const hostname = new URL(finalFavicon).hostname;
        if (hostname.includes('wikimedia.org')) {
           return finalFavicon; // Nunca proxear wikimedia
        }
      } catch {}

      return ensureProxied(finalFavicon);
    }
    
    // Otherwise use Google favicon service (more permissive with CORP)
    try {
      const hostname = new URL(url).hostname;
      if (!hostname) return null;
      
      const knownFallback = getKnownFaviconFallback(url);
      if (knownFallback) {
        return ensureProxied(knownFallback) + "&silent=true";
      }
      
      // Proxy Google service to SILENCE 404s
      return ensureProxied(`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`) + "&silent=true";
    } catch {
      return null;
    }
  })();

  // Se não tem URL de favicon válida ou falhou permanentemente, mostrar avatar
  if (!faviconUrl || (failed && useSecondaryFallback)) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded shrink-0 select-none ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: avatarData.color.bg,
          color: avatarData.color.text,
          fontSize: size * 0.5,
          fontWeight: 700,
          lineHeight: 1,
        }}
        title={avatarData.hostname}
        aria-hidden="true"
      >
        {avatarData.letter}
      </div>
    );
  }

  return (
    <img
      src={faviconUrl}
      alt=""
      key={faviconUrl} // Recriar imagem ao mudar para o fallback
      className={`shrink-0 rounded ${className}`}
      style={{ width: size, height: size }}
      onError={() => {
        if (!useSecondaryFallback) {
          setUseSecondaryFallback(true);
        } else {
          setFailed(true);
        }
      }}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

/**
 * Utilitário para obter a cor do avatar de um domínio.
 * Útil quando precisa da cor sem renderizar o componente.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function getDomainColor(url: string) {
  return getAvatarData(url).color;
}
