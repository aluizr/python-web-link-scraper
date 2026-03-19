// Função para buscar a imagem OG diretamente do HTML de um site
// NOTE: Direct fetch to external URLs will be blocked by CORS/CORP in browsers.
// Use a proxy or metadata API (like Microlink) instead.
export async function fetchOgImageFromSite(_url: string): Promise<string | null> {
  // Direct fetch to cross-origin sites is blocked by browser security policies.
  // Metadata fetching is handled via Microlink API in use-metadata.ts
  return null;
}
