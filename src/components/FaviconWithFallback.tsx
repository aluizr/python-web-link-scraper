import { useState, useEffect } from "react";
import { ensureProxied } from "@/lib/image-utils";
import { getKnownFaviconFallback } from "@/lib/metadata-utils";

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
  const [fallbackLevel, setFallbackLevel] = useState(0); 
  const [isChecking, setIsChecking] = useState(false);
  const [verifiedUrl, setVerifiedUrl] = useState<string | null>(null);
  const avatarData = getAvatarData(url);

  // Efeito para verificar silenciosamente se a URL funciona antes de renderizar
  useEffect(() => {
    let active = true;
    
    async function checkUrl(targetUrl: string | null) {
      if (!targetUrl) return false;
      
      try {
        const checkRes = await fetch(`/check-image?url=${encodeURIComponent(targetUrl)}`);
        const data = await checkRes.json();
        return data.ok;
      } catch {
        return false;
      }
    }

    async function runCheck() {
      // Se já falhou ou não tem URL no nível atual, não faz nada
      if (failed) return;

      const currentUrl = getFaviconUrl(fallbackLevel);
      if (!currentUrl) {
        if (active) setFailed(true);
        return;
      }

      if (active) setIsChecking(true);
      const ok = await checkUrl(currentUrl);
      
      if (active) {
        if (ok) {
          setVerifiedUrl(currentUrl);
          setIsChecking(false);
        } else {
          // Se falhou silenciosamente, move para o próximo nível
          if (fallbackLevel < 3) {
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

  // Função auxiliar para obter a URL baseada no nível (sem disparar o render da imagem)
  function getFaviconUrl(level: number) {
    try {
      const hostname = new URL(url).hostname;
      const cleanHostname = hostname.replace(/^www\./, "");

      if (level === 0 && favicon && typeof favicon === "string" && favicon.startsWith("http")) {
        // Agora tentamos QUALQUER favicon detectado, pois o sistema de check silencia erros
        return ensureProxied(favicon);
      }
      if (level === 1) return `https://icon.horse/icon/${cleanHostname}`;
      if (level === 2) return `https://icons.duckduckgo.com/ip3/${cleanHostname}.ico`;
      return null;
    } catch {
      return (level === 0 && favicon && typeof favicon === "string" && favicon.startsWith("http")) ? ensureProxied(favicon) : null;
    }
  }

  // Se está verificando ou falhou tudo, mostra avatar (ou um placeholder invisível enquanto checa)
  if (isChecking || failed || !verifiedUrl) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded shrink-0 select-none ${className} transition-opacity duration-200 ${isChecking ? "opacity-50" : "opacity-100"}`}
        style={{
          width: size,
          height: size,
          backgroundColor: avatarData.color.bg,
          color: avatarData.color.text,
          fontSize: Math.max(9, size * 0.55),
          fontWeight: 700,
          lineHeight: 1,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
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
      src={verifiedUrl}
      alt=""
      key={verifiedUrl}
      className={`shrink-0 rounded ${className} object-contain animate-in fade-in duration-300`}
      style={{ width: size, height: size }}
      onError={() => {
        // Backup: se o check passou mas a imagem falhou no render por algum motivo raro
        setVerifiedUrl(null);
        if (fallbackLevel < 3) {
          setFallbackLevel(prev => prev + 1);
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
