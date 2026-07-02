import { useState, useEffect, useMemo } from "react";
import { ensureProxied, ensureProxiedIfCorp } from "@/lib/image-utils";
import { getKnownFaviconFallback } from "@/lib/metadata-utils";
import { getAvatarData } from "@/lib/domain-avatar";

interface FaviconWithFallbackProps {
  url: string;
  favicon?: string | null;
  size?: number;
  className?: string;
}

function shouldSkipStoredFavicon(candidate: string): boolean {
  const value = candidate.toLowerCase();
  // Favicons antigos do Google/gstatic costumam ficar obsoletos e gerar 404.
  return value.includes("google.com/s2/favicons") || value.includes("gstatic.com/favicon");
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
    const seq: string[] = [];

    // Nível 0: Original do banco de dados
    if (
      favicon &&
      typeof favicon === "string" &&
      favicon.length > 5 &&
      !shouldSkipStoredFavicon(favicon)
    ) {
      const proxiedFavicon = ensureProxied(favicon);
      if (proxiedFavicon) seq.push(proxiedFavicon);
    }

    try {
      const urlObj = new URL(url);
      const cleanHostname = urlObj.hostname.replace(/^www\./, "");
      const known = getKnownFaviconFallback(url);

      // Nível 0.5: Favicon de domínio conhecido (GitHub, Google, Twitter, etc.)
      if (known) {
        seq.push(ensureProxiedIfCorp(known) ?? known);
      }

      // Níveis seguintes: serviços externos
      // ✅ unavatar.io: serviço de alta fidelidade, suporta fallback=false para não
      //    retornar placeholder quando não encontrado (dispara onError corretamente).
      seq.push(
        `https://unavatar.io/${cleanHostname}?fallback=false`,
        `https://icons.duckduckgo.com/ip3/${cleanHostname}.ico`
      );

      seq.push(`${urlObj.origin}/favicon.ico`);

      seq.push(`https://icon.horse/icon/${cleanHostname}`);
    } catch {
      // Sem URL válida: mantém apenas favicon explícito (se houver).
    }

    return Array.from(new Set(seq.filter(Boolean)));
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
