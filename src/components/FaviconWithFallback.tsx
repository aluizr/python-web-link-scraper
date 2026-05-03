import { useState, useEffect, useMemo } from "react";
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
 * Componente de Favicon Ultra-Resiliente.
 *
 * Estratégia de fallback em sequência dinâmica:
 *   0. Favicon original do banco de dados (se existir)
 *   1. Favicon conhecido via getKnownFaviconFallback (se existir)
 *   2. unavatar.io (alta fidelidade)
 *   3. DuckDuckGo Icons (melhor cobertura para domínios .br que o Google)
 *   4. Google Favicons HD (sz=64)
 *   5. /favicon.ico nativo do domínio (via proxy)
 *   6. Icon Horse
 *
 * Se todos falharem → avatar colorido com a inicial do domínio.
 *
 * Melhorias principais:
 *   - useMemo garante que a sequência só é recalculada quando url/favicon mudam
 *   - Limite de fallback dinâmico baseado no tamanho real da sequência
 *   - Progressive loading: avatar sempre visível no fundo, sem flicker
 *   - isLoaded resetado ao trocar de fallback para evitar imagem invisível
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

  // Sequência de fallbacks calculada uma única vez por url/favicon.
  // O useMemo evita recriação a cada render e garante consistência
  // entre faviconUrl e o limite usado em handleNextLevel.
  const sequence = useMemo(() => {
    try {
      const urlObj = new URL(url);
      const cleanHostname = urlObj.hostname.replace(/^www\./, "");
      const known = getKnownFaviconFallback(url);
      const seq: string[] = [];

      // Nível 0: Original do banco de dados
      if (favicon && typeof favicon === "string" && favicon.length > 5) {
        seq.push(ensureProxied(favicon));
      }

      // Nível 0.5: Favicon de domínio conhecido (GitHub, Google, Twitter, etc.)
      if (known) {
        seq.push(known);
      }

      // Níveis seguintes: serviços externos
      // ✅ DuckDuckGo antes do Google: melhor cobertura para domínios .br/.gov.br
      // que retornam 404 no gstatic.com, reduzindo erros desnecessários no console.
      seq.push(
        `https://unavatar.io/${cleanHostname}?fallback=false`,
        `https://icons.duckduckgo.com/ip3/${cleanHostname}.ico`,
        `https://www.google.com/s2/favicons?domain=${cleanHostname}&sz=64`,
        ensureProxied(`${urlObj.origin}/favicon.ico`),
        `https://icon.horse/icon/${cleanHostname}`
      );

      return seq;
    } catch {
      return [];
    }
  }, [url, favicon]);

  // Reseta os estados quando a URL ou favicon mudam
  useEffect(() => {
    setFallbackLevel(0);
    setFailed(false);
    setIsLoaded(false);
  }, [url, favicon]);

  const handleNextLevel = () => {
    // Oculta a imagem atual enquanto testa o próximo nível
    setIsLoaded(false);

    if (fallbackLevel < sequence.length - 1) {
      // Limite dinâmico: baseado no tamanho real da sequência
      setFallbackLevel((prev) => prev + 1);
    } else {
      // Todos os níveis esgotados → exibe avatar com inicial
      setFailed(true);
    }
  };

  const handleLoad = () => setIsLoaded(true);

  const faviconUrl = sequence[fallbackLevel] ?? null;

  return (
    <div
      className={`relative inline-flex shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/*
        Avatar com inicial do domínio (Progressive Loading):
        Sempre visível no fundo — some suavemente quando a imagem real carrega.
        Evita flicker e tela em branco durante as tentativas de fallback.
      */}
      <div
        className={`absolute inset-0 flex items-center justify-center rounded select-none transition-opacity duration-300 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
        style={{
          backgroundColor: avatarData.color.bg,
          color: avatarData.color.text,
          fontSize: Math.max(9, size * 0.55),
          fontWeight: 700,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
        }}
        title={avatarData.hostname}
      >
        {avatarData.letter}
      </div>

      {/*
        Imagem real do favicon:
        Renderiza invisível (opacity-0) e só aparece ao disparar onLoad.
        A key={faviconUrl} força re-mount a cada novo fallback,
        garantindo que onLoad/onError disparam corretamente.
      */}
      {!failed && faviconUrl && (
        <img
          src={faviconUrl}
          alt=""
          key={faviconUrl}
          className={`absolute inset-0 rounded object-contain transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
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
