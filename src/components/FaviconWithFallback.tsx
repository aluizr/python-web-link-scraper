import { useState, useEffect } from "react";
import { ensureProxied } from "@/lib/image-utils";
import { getKnownFaviconFallback } from "@/lib/metadata-utils";

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

/**
 * Componente de Favicon Ultra-Resiliente (Versão Restaurada e Estável).
 */
export function FaviconWithFallback({
  url,
  favicon,
  size = 24,
  className = "",
}: FaviconWithFallbackProps) {
  const [fallbackLevel, setFallbackLevel] = useState(0); 
  const [failed, setFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const avatarData = getAvatarData(url);

  // Reseta os estados quando a URL muda para evitar carregar o favicon do link anterior
  useEffect(() => {
    setFallbackLevel(0);
    setFailed(false);
    setIsLoaded(false);
  }, [url, favicon]);

  const handleNextLevel = () => {
    if (fallbackLevel < 5) {
      setFallbackLevel(prev => prev + 1);
    } else {
      setFailed(true);
    }
  };

  const handleLoad = () => setIsLoaded(true);

  const faviconUrl = (() => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const cleanHostname = hostname.replace(/^www\./, "");

      // Nível 0: Original do Banco
      if (fallbackLevel === 0 && favicon && typeof favicon === "string" && favicon.length > 5) {
        return ensureProxied(favicon);
      }
      // Nível 1: Unavatar (Alta fidelidade)
      if (fallbackLevel === 1) return `https://unavatar.io/${cleanHostname}?fallback=false`;
      // Nível 2: Google HD
      if (fallbackLevel === 2) return `https://www.google.com/s2/favicons?domain=${cleanHostname}&sz=64`;
      // Nível 3: Nativo (/favicon.ico)
      if (fallbackLevel === 3) return ensureProxied(`${urlObj.origin}/favicon.ico`);
      // Nível 4: DuckDuckGo
      if (fallbackLevel === 4) return `https://icons.duckduckgo.com/ip3/${cleanHostname}.ico`;
      // Nível 5: Icon Horse
      if (fallbackLevel === 5) return `https://icon.horse/icon/${cleanHostname}`;
      
      return null;
    } catch {
      return null;
    }
  })();

  return (
    <div className={`relative inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      {/* 
        Fallback Letter Avatar (Progressive Loading):
        Fica sempre visível no fundo até a imagem real carregar com sucesso.
        Evita a tela branca (flicker) ou ícones quebrados enquanto os fallbacks estão sendo testados.
      */}
      <div
        className={`absolute inset-0 flex items-center justify-center rounded select-none transition-opacity duration-300 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundColor: avatarData.color.bg, color: avatarData.color.text,
          fontSize: Math.max(9, size * 0.55), fontWeight: 700,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
        }}
        title={avatarData.hostname}
      >
        {avatarData.letter}
      </div>

      {/* Imagem Real (Carrega invisível e só aparece quando tiver sucesso) */}
      {(!failed && faviconUrl && fallbackLevel <= 5) && (
        <img
          src={faviconUrl}
          alt=""
          key={faviconUrl}
          className={`absolute inset-0 rounded object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ width: size, height: size }}
          onLoad={handleLoad}
          onError={handleNextLevel}
          loading="lazy"
        />
      )}
    </div>
  );
}

export function getDomainColor(url: string) {
  return getAvatarData(url).color;
}
