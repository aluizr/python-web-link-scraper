// src/lib/validation.ts - VERSÃO SEGURA COM PROTEÇÃO CONTRA URLs MALICIOSAS
// Use este arquivo para substituir o atual

import { z } from "zod";

// ✅ Lista branca de protocolos permitidos
const ALLOWED_PROTOCOLS = [
  'http://',
  'https://',
  'ftp://',
  'ftps://',
  'mailto:',
];

// ✅ Lista negra de padrões maliciosos
const MALICIOUS_PATTERNS = [
  /javascript:/i,
  /data:/i,
  /vbscript:/i,
  /file:/i,
  /about:/i,
  /blob:/i,
  /view-source:/i,
];

// Validador customizado para URLs seguras
const validateSafeUrl = (url: string): boolean => {
  try {
    // Verificar se iniciava com protocolo permitido
    const hasAllowedProtocol = ALLOWED_PROTOCOLS.some(
      proto => url.toLowerCase().startsWith(proto)
    );

    if (!hasAllowedProtocol) {
      return false;
    }

    // Verificar padrões maliciosos
    const hasMaliciousPattern = MALICIOUS_PATTERNS.some(
      pattern => pattern.test(url)
    );

    if (hasMaliciousPattern) {
      return false;
    }

    // Validar como URL se for http/https
    if (url.startsWith('http://') || url.startsWith('https://')) {
      new URL(url); // Vai lançar erro se inválido
    }

    return true;
  } catch {
    return false;
  }
};

export const linkSchema = z.object({
  url: z
    .string()
    .min(1, "URL é obrigatória")
    .max(2048, "URL muito longa")
    .refine(validateSafeUrl, "URL inválida ou protocolo não permitido")
    .transform(url => url.trim()),
    
  title: z
    .string()
    .max(255, "Título muito longo")
    .transform(title => title.trim()),
    
  description: z
    .string()
    .max(1000, "Descrição muito longa")
    .transform(desc => desc.trim()),
    
  category: z
    .string()
    .max(100, "Categoria muito longa")
    .transform(cat => cat.trim()),
    
  tags: z
    .array(
      z
        .string()
        .max(30, "Tag muito longa")
        .transform(tag => tag.trim().toLowerCase())
    )
    .max(20, "Máximo de 20 tags")
    .refine(
      tags => tags.length === new Set(tags).size,
      "Tags duplicadas não permitidas"
    ),
    
  isFavorite: z.boolean(),
  
  favicon: z
    .string()
    .max(2048, "Favicon URL muito longa")
    .optional()
    .default("")
    .refine(
      favicon => !favicon || favicon.startsWith('http'),
      "Favicon deve ser uma URL válida"
    ),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Nome obrigatório")
    .max(100, "Nome muito longo")
    .transform(name => name.trim())
    .refine(
      name => !/[<>'"]/i.test(name),
      "Caracteres especiais não permitidos no nome"
    ),
});

export type LinkInput = z.infer<typeof linkSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
