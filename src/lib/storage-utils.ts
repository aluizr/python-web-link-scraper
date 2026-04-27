import { supabase } from "@/integrations/supabase/client";
import { logger } from "./logger";

const BUCKET_NAME = "link-thumbnails";

/**
 * Faz o upload de uma imagem para o Supabase Storage
 */
export async function uploadLinkThumbnail(file: File): Promise<string | null> {
  try {
    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Tipo de arquivo não suportado. Use PNG, JPG, SVG ou WEBP.");
    }

    // Validar tamanho (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("O arquivo é muito grande. O limite é 2MB.");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    logger.error("Erro no upload para Supabase Storage:", err);
    throw err;
  }
}

/**
 * Remove uma imagem do Supabase Storage baseada na URL
 */
export async function deleteLinkThumbnail(url: string): Promise<void> {
  if (!url || !url.includes(BUCKET_NAME)) return;

  try {
    // Extrair o caminho do arquivo da URL
    const pathParts = url.split(`${BUCKET_NAME}/`)[1];
    if (!pathParts) return;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([pathParts]);

    if (error) {
      throw error;
    }
  } catch (err) {
    logger.error("Erro ao deletar imagem do Supabase Storage:", err);
  }
}

/**
 * Baixa uma imagem e retorna um objectURL local (seguro para uso em canvas).
 * - URLs do Supabase Storage: usa o client JS autenticado (bypassa CORS)
 * - URLs externas: tenta fetch com mode=cors
 * Em ambos os casos, o objectURL criado deve ser revogado com URL.revokeObjectURL() pelo chamador.
 */
export async function getLocalBlobUrl(url: string): Promise<string> {
  if (!url) throw new Error("URL vazia");

  // Blob/data URL já é local — retorna direto
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;

  // URL do Supabase Storage — usa client autenticado para evitar CORS
  if (url.includes(BUCKET_NAME)) {
    try {
      // Extrai o path relativo ao bucket (tudo após "/link-thumbnails/")
      const marker = `/${BUCKET_NAME}/`;
      const idx = url.indexOf(marker);
      if (idx !== -1) {
        const filePath = url.slice(idx + marker.length);
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .download(filePath);
        if (!error && data) return URL.createObjectURL(data);
      }
    } catch (err) {
      logger.warn("[storage-utils] fallback ao fetch direto:", err);
    }
  }

  // URL externa — busca via /og-proxy (que já está no connect-src da CSP)
  // Fetch direto para CDNs externas seria bloqueado pela CSP
  const proxied = `/og-proxy?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxied);
  if (!res.ok) throw new Error(`Proxy retornou HTTP ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
