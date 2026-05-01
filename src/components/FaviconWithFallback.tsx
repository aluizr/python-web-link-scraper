import { useState, useEffect } from "react";
import { ensureProxied } from "@/lib/image-utils";

/**
 * Cache simples para evitar múltiplas checagens de rede para o mesmo ícone.
 */
const checkCache: Record<string, boolean> = {};

/**
 * Paleta de cores consistente para avatares de fallback.
 */
const AVATAR_COLORS = [
  { bg: "#ef4444", text: "#ffffff" }, { bg: "#f97316", text: "#ffffff" },
  { bg: "#f59e0b", text: "#ffffff" }, { bg: "#84cc16", text: "#ffffff" },
  { bg: "#22c55e", text: "#ffffff" }, { bg: "#14b8a6", text: "#ffffff" },
  { bg: "#06b6d4", text: "#ffffff" }, { bg: "#3b82f6", text: "#ffffff" },
  { bg: "#6366f1", text: "#ffffff" }, { bg: "#8b5cf6", text: "#ffffff" },
  { bg: "#a855f7", text: "#ffffff" }, { bg: "#ec4899", text: "#ffffff" },
  { bg: "#f43f5e", text: "#ffffff" }, { bg: "#0ea5e9", text: "#ffffff" },
  { bg: "#10b981", text: "#ffffff" }, { bg: "#d946ef", text: "#ffffff" },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getAvatarData(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    const domainName = hostname.split(".")[0] || hostname;
    const letter = domainName.charAt(0).toUpperCase();
    const colorIndex = hashString(hostname) % AVATAR_COLORS.length;
    const color = AVATAR_COLORS[colorIndex];
    return { letter, color, hostname };
  } catch {
    return { letter: "?", color: AVATAR_COLORS[0], hostname: "" };
  }
}

interface FaviconWithFallbackProps {
  url: string;
  favicon?: string;
  size?: number;
  className?: string;
}

export function FaviconWithFallback({
  url,
  favicon,
  size = 24,
  className = "",
}: FaviconWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  const [fallbackLevel, setFallbackLevel] = useState(0); 
  const [isChecking, setIsChecking] = useState(false);
  const [verifiedUrl, setVerifiedUrl] = useState<string | null>(null);
  const avatarData = getAvatarData(url);

  useEffect(() => {
    let active = true;
    
    async function checkUrl(targetUrl: string | null) {
      if (!targetUrl) return false;
      if (checkCache[targetUrl] !== undefined) return checkCache[targetUrl];
      
      let urlToCheck = targetUrl;
      if (targetUrl.startsWith('/og-proxy?url=')) {
        try {
          const params = new URL(targetUrl, window.location.origin).searchParams;
          urlToCheck = params.get('url') || targetUrl;
        } catch { /* ignore */ }
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        
        const checkRes = await fetch(`/check-image?url=${encodeURIComponent(urlToCheck)}`, { signal: controller.signal });
        const data = await checkRes.json();
        clearTimeout(timeoutId);
        
        checkCache[targetUrl] = data.ok;
        return data.ok;
      } catch {
        // Se houver erro na checagem ou timeout, assumimos OK para evitar supressão indevida
        return true; 
      }
    }

    async function runCheck() {
      if (failed) return;
      const currentUrl = getFaviconUrl(fallbackLevel);
      
      if (!currentUrl) {
        if (active) setFailed(true);
        return;
      }

      // Se já passou do nível 3, não precisa checar mais (backups estáveis)
      if (fallbackLevel >= 3) {
        if (active) {
          setVerifiedUrl(currentUrl);
          setIsChecking(false);
        }
        return;
      }

      if (active) setIsChecking(true);
      const ok = await checkUrl(currentUrl);
      
      if (active) {
        if (ok) {
          setVerifiedUrl(currentUrl);
          setIsChecking(false);
        } else {
          if (fallbackLevel < 5) {
            setFallbackLevel(prev => prev + 1);
          } else {
            setFailed(true);
          }
          setIsChecking(false);
        }
      }
    }

    runCheck();
    return () => { active = false; };
  }, [url, favicon, fallbackLevel, failed]);

  function getFaviconUrl(level: number) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const cleanHostname = hostname.replace(/^www\./, "");

      // Nível 0: O ORIGINAL absoluto (Salvo no banco)
      if (level === 0 && favicon && typeof favicon === "string" && favicon.length > 5) {
        return ensureProxied(favicon);
      }
      
      // Nível 1: Unavatar (Mestre em originais de alta qualidade)
      if (level === 1) return `https://unavatar.io/${cleanHostname}?fallback=false`;
      
      // Nível 2: Nativo direto do site
      if (level === 2) return `${urlObj.origin}/favicon.ico`;
      
      // Nível 3: Google HD (Muito confiável para os "comuns")
      if (level === 3) return `https://www.google.com/s2/favicons?domain=${cleanHostname}&sz=64`;
      
      // Nível 4: DuckDuckGo
      if (level === 4) return `https://icons.duckduckgo.com/ip3/${cleanHostname}.ico`;
      
      // Nível 5: Clearbit
      if (level === 5) return `https://logo.clearbit.com/${cleanHostname}`;
      
      return null;
    } catch {
      return null;
    }
  }

  if (isChecking || failed || !verifiedUrl) {
    const isActuallyFailed = failed || (!isChecking && fallbackLevel >= 5);
    return (
      <div
        className={`inline-flex items-center justify-center rounded shrink-0 select-none ${className} transition-opacity duration-200 ${isChecking ? "opacity-50" : "opacity-100"}`}
        style={{
          width: size, height: size,
          backgroundColor: avatarData.color.bg, color: avatarData.color.text,
          fontSize: Math.max(9, size * 0.55), fontWeight: 700,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
        }}
        title={avatarData.hostname}
      >
        {avatarData.letter}
      </div>
    );
  }

  return (
    <img
      src={verifiedUrl}
      alt=""
      key={verifiedUrl}
      className={`shrink-0 rounded ${className} object-contain animate-in fade-in duration-300`}
      style={{ width: size, height: size }}
      onError={() => {
        setVerifiedUrl(null);
        if (fallbackLevel < 5) {
          setFallbackLevel(prev => prev + 1);
        } else {
          setFailed(true);
        }
      }}
      loading="lazy"
    />
  );
}

export function getDomainColor(url: string) {
  return getAvatarData(url).color;
}
