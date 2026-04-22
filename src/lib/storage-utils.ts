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
