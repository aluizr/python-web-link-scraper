import { useState } from "react";
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
  const [fallbackLevel, setFallbackLevel] = useState(0); // 0: custom, 1: iconhorse, 2: google
  const avatarData = getAvatarData(url);

  // Determinar URL do favicon baseado no nível de fallback atual
  const faviconUrl = (() => {
    try {
      const hostname = new URL(url).hostname;
      if (!hostname) return null;

      // Nível 0: Favicon customizado vindo dos metadados
      if (fallbackLevel === 0 && favicon && typeof favicon === "string" && favicon.startsWith("http")) {
        // Se for um serviço de favicon do Google/Gstatic, eles são instáveis e 
        // frequentemente retornam pixels transparentes. Pulamos para o Icon Horse.
        const isUnreliableService = favicon.includes('google.com/s2/favicons') || 
                                    favicon.includes('gstatic.com/faviconV2');
                               
        if (isUnreliableService) {
           return ensureProxied(`https://icon.horse/icon/${hostname}`);
        }
        
        // Evitar proxear wikimedia para não estourar rate limits
        if (favicon.includes('wikimedia.org')) return favicon;
        
        return ensureProxied(favicon);
      }

      // Nível 1: Icon Horse (Serviço resiliente e de alta qualidade)
      // Se chegamos aqui, ou o nível 0 falhou ou foi pulado.
      if (fallbackLevel <= 1) {
        const knownFallback = getKnownFaviconFallback(url);
        if (knownFallback) return ensureProxied(knownFallback);
        
        return ensureProxied(`https://icon.horse/icon/${hostname}`);
      }
      
      return null;
    } catch {
      return null;
    }
  })();

  // Se atingiu o nível máximo de falha ou não tem URL válida, mostra avatar
  // (Removemos o nível 2/Google para evitar pixels transparentes invisíveis)
  if (!faviconUrl || fallbackLevel > 1 || failed) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded shrink-0 select-none ${className}`}
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
      src={faviconUrl}
      alt=""
      key={`${faviconUrl}-${fallbackLevel}`} // Forçar re-render ao mudar nível
      className={`shrink-0 rounded ${className}`}
      style={{ width: size, height: size }}
      onError={() => {
        if (fallbackLevel < 1) {
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
