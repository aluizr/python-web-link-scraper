import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import https from "https";
import http from "http";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
    cors: {
      origin: process.env.VITE_APP_URL || "http://localhost:8080",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    },
    headers: {
      "Content-Security-Policy": `default-src 'self'; script-src 'self' 'wasm-unsafe-eval' ${mode === "development" ? "'unsafe-inline'" : "'sha256-Z2/iFzh9VMlVkEOar1f/oSHWwQk3ve1qk/C2WdsC4Xk='"}; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://noembed.com https://api.microlink.io https://*.microlink.io https://api.notion.com https://r.jina.ai; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`,
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
    plugins: [
      react(),
      {
        name: "og-image-proxy",
        configureServer(server) {
          // Proxy para buscar HTML e extrair metadados
          server.middlewares.use("/html-proxy", async (req, res) => {
            const rawUrl = new URL(req.url, "http://localhost:8080").searchParams.get("url");
            
            if (!rawUrl) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Missing url parameter" }));
              return;
            }

            try {
              new URL(rawUrl);
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Invalid URL format" }));
              return;
            }

            const fetchUrl = (urlStr) => {
              let target;
              try {
                target = new URL(urlStr);
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: "Invalid url" }));
                return;
              }

              const client = target.protocol === "https:" ? https : http;
              const options = {
                hostname: target.hostname,
                path: target.pathname + target.search,
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                  "Accept-Language": "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7",
                  "Cache-Control": "max-age=0",
                  "Sec-Ch-Ua": '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                  "Sec-Ch-Ua-Mobile": "?0",
                  "Sec-Ch-Ua-Platform": '"Windows"',
                  "Sec-Fetch-Dest": "document",
                  "Sec-Fetch-Mode": "navigate",
                  "Sec-Fetch-Site": "none",
                  "Sec-Fetch-User": "?1",
                  "Upgrade-Insecure-Requests": "1"
                },
              };

              client.get(options, (upstream) => {
                if (upstream.statusCode === 301 || upstream.statusCode === 302) {
                   const location = upstream.headers.location;
                   if (location) {
                     const nextUrl = location.startsWith('http') ? location : new URL(location, target.origin).href;
                     return fetchUrl(nextUrl);
                   }
                }

                if (upstream.statusCode >= 400) {
                  res.statusCode = upstream.statusCode;
                  res.end(JSON.stringify({ error: `Upstream error: ${upstream.statusCode}` }));
                  return;
                }

                let html = "";
                upstream.on("data", (chunk) => {
                  html += chunk.toString();
                });

                upstream.on("end", () => {
                  // Advanced Title Extraction
                  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                  const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["'](?:og|twitter):title["']\s+content=["']([^"']+)["']/i);
                  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
                  
                  let title = (ogTitleMatch ? ogTitleMatch[1] : (titleMatch ? titleMatch[1] : (h1Match ? h1Match[1] : null)));
                  
                  // Advanced Image Extraction
                  const ogImageMatch = html.match(/<meta\s+(?:property|name)=["'](?:og|twitter):image["']\s+content=["']([^"']+)["']/i);
                  const relImageMatch = html.match(/<link\s+rel=["'](?:image_src|apple-touch-icon)["']\s+href=["']([^"']+)["']/i);
                  const thumbnailMatch = html.match(/<meta\s+name=["']thumbnail["']\s+content=["']([^"']+)["']/i);
                  
                  let ogImage = ogImageMatch ? ogImageMatch[1] : (relImageMatch ? relImageMatch[1] : (thumbnailMatch ? thumbnailMatch[1] : null));

                  // Convert relative image URLs
                  if (ogImage && !ogImage.startsWith('http')) {
                    try {
                      ogImage = new URL(ogImage, target.origin).href;
                    } catch {
                      ogImage = null;
                    }
                  }

                  // Advanced Description Extraction
                  const ogDescMatch = html.match(/<meta\s+(?:property|name)=["'](?:og|twitter):description["']\s+content=["']([^"']+)["']/i);
                  const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
                  let description = ogDescMatch ? ogDescMatch[1] : (metaDescMatch ? metaDescMatch[1] : null);

                  // Extract Favicon
                  const favMatch = html.match(/<link\s+rel=["'](?:shortcut )?icon["']\s+href=["']([^"']+)["']/i);
                  let favicon = favMatch ? favMatch[1] : null;
                  if (favicon && !favicon.startsWith('http')) {
                    try {
                      favicon = new URL(favicon, target.origin).href;
                    } catch {
                      favicon = null;
                    }
                  }

                  res.setHeader("Content-Type", "application/json");
                  res.setHeader("Access-Control-Allow-Origin", "*");
                  res.statusCode = 200;
                  res.end(JSON.stringify({ 
                    title: title ? title.trim().substring(0, 200) : null,
                    description: description ? description.trim().substring(0, 400) : null,
                    ogImage: ogImage ? ogImage.trim() : null,
                    favicon: favicon ? favicon.trim() : null
                  }));
                });
              }).on("error", (err) => {
                res.statusCode = 502;
                res.end(JSON.stringify({ error: err.message }));
              });
            };

            fetchUrl(rawUrl);
          });

          // Cache do proxy para evitar bloqueios de taxa (429) e economizar banda no Dev Server
          const ogProxyCache = new Map();
          const inFlightOgRequests = new Map();
          const OG_CACHE_TTL = 1000 * 60 * 60; // 1 hora
          
          const domainLastFetch = new Map();
          const DOMAIN_MIN_INTERVAL = 1000; // Aumentado para 1.0s para evitar 429 (Too Many Requests)

          // Proxy para a API do Notion (evitar CORS no frontend)
          server.middlewares.use("/notion-api", async (req, res) => {
            const url = new URL(req.url, "http://localhost:8080");
            const targetPath = url.pathname.replace("/notion-api", "");
            
            const options = {
              hostname: "api.notion.com",
              path: targetPath + url.search,
              method: req.method,
              headers: {
                ...req.headers,
                host: "api.notion.com",
              },
            };

            const proxyReq = https.request(options, (proxyRes) => {
              res.writeHead(proxyRes.statusCode, proxyRes.headers);
              proxyRes.pipe(res);
            });

            req.pipe(proxyReq);

            proxyReq.on("error", (err) => {
              res.statusCode = 502;
              res.end(JSON.stringify({ error: err.message }));
            });
          });

          // Proxy para imagens
          server.middlewares.use("/og-proxy", async (req, res) => {
            const params = new URL(req.url, "http://localhost:8080").searchParams;
            const rawUrl = params.get("url");
            const isSilent = params.get("silent") === "true";
            
            console.log("[og-proxy] ========================================");
            console.log("[og-proxy] Request received:", rawUrl);
            
            if (!rawUrl) { 
              console.error("[og-proxy] ERROR: Missing url parameter");
              res.statusCode = 400; 
              res.end("Missing url parameter"); 
              return; 
            }

            // Validate URL format
            try {
              new URL(rawUrl);
            } catch (e) {
              console.error("[og-proxy] ERROR: Invalid URL format:", rawUrl, e.message);
              res.statusCode = 400;
              res.end("Invalid URL format");
              return;
            }

            // Verifica cache antes de buscar
            const cached = ogProxyCache.get(rawUrl);
            if (cached && Date.now() - cached.timestamp < OG_CACHE_TTL) {
               console.log("[og-proxy] SUCCESS: Serving from CACHE:", rawUrl);
               res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
               res.setHeader("Access-Control-Allow-Origin", "*");
               res.setHeader("Content-Type", cached.contentType);
               res.setHeader("Cache-Control", "public, max-age=86400");
               res.statusCode = 200;
               res.end(cached.buffer);
               return;
            }

            // Deduplica chamadas simultâneas (In-Flight limit)
            if (!inFlightOgRequests.has(rawUrl)) {
              console.log("[og-proxy] Fetching upstream (first request):", rawUrl);
              const fetchPromise = new Promise((resolve, reject) => {
                const fetchUrl = async (urlStr, redirectCount = 0) => {
                  if (redirectCount > 5) { 
                    reject({ statusCode: 502, message: "Too many redirects" });
                    return; 
                  }
                  
                  let target;
                  try { 
                    target = new URL(urlStr); 
                  } catch (e) { 
                    reject({ statusCode: 400, message: "Invalid url" });
                    return; 
                  }
                  
                  // Rate limit seguro por domínio (enfileiramento / throttling linear)
                  const hostname = target.hostname;
                  const now = Date.now();
                  const lastFetch = domainLastFetch.get(hostname) ?? 0;
                  const plannedExecution = Math.max(now, lastFetch + DOMAIN_MIN_INTERVAL);
                  domainLastFetch.set(hostname, plannedExecution);
                  
                  const waitTime = plannedExecution - now;
                  if (waitTime > 0) {
                    await new Promise(r => setTimeout(r, waitTime));
                  }
                  
                  const client = target.protocol === "https:" ? https : http;
                  const options = {
                    hostname: target.hostname,
                    path: target.pathname + target.search,
                    headers: {
                      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                      "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                      "Accept-Language": "en-US,en;q=0.9",
                      "Accept-Encoding": "gzip, deflate, br",
                      "Referer": target.origin + "/",
                      "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                      "sec-ch-ua-mobile": "?0",
                      "sec-ch-ua-platform": '"Windows"',
                      "sec-fetch-dest": "image",
                      "sec-fetch-mode": "no-cors",
                      "sec-fetch-site": "same-origin",
                      "DNT": "1",
                    },
                  };
                  
                  client.get(options, (upstream) => {
                    // Follow redirects
                    if ([301, 302, 303, 307, 308].includes(upstream.statusCode) && upstream.headers.location) {
                      upstream.resume();
                      const next = upstream.headers.location.startsWith("http")
                        ? upstream.headers.location
                        : `${target.origin}${upstream.headers.location}`;
                      return fetchUrl(next, redirectCount + 1);
                    }
                    
                    // Handle error status codes
                    if (upstream.statusCode >= 400) {
                      // Exponential backoff retry for 429 (Too Many Requests)
                      if (upstream.statusCode === 429 && redirectCount < 2) {
                        upstream.resume();
                        const delay = 2000 + Math.random() * 2000;
                        console.log(`[og-proxy] 429 Detected for ${hostname}. Retrying in ${Math.round(delay)}ms...`);
                        return setTimeout(() => fetchUrl(urlStr, redirectCount + 1), delay);
                      }

                      // Try fallback for known sites with broken OG images
                      if (upstream.statusCode === 404) {
                        const hostname = target.hostname;
                        if (hostname.includes('kaggle.com')) {
                          upstream.resume();
                          return fetchUrl("https://www.kaggle.com/static/images/site-logo.svg", redirectCount);
                        }
                        if (hostname.includes('joblib.readthedocs.io')) {
                          upstream.resume();
                          return fetchUrl("https://joblib.readthedocs.io/en/stable/_static/joblib_logo.svg", redirectCount);
                        }
                        if (hostname.includes('nanobananaimg.com')) {
                          upstream.resume();
                          return fetchUrl("https://nanobananaimg.com/favicon.ico", redirectCount);
                        }
                      }
                      
                      // Final fallback: return a 1x1 transparent PNG with index 200 OK to SILENCE browser console errors
                      console.log(`[og-proxy] SILENCING error ${upstream.statusCode} for ${hostname}. Returning transparent pixel.`);
                      const transparentPixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
                      res.setHeader("Content-Type", "image/png");
                      res.setHeader("Cache-Control", "public, max-age=86400");
                      res.statusCode = 200;
                      res.end(transparentPixel);
                      return;
                    }
                    
                    const contentType = upstream.headers["content-type"] || "image/jpeg";
                    
                    // Coletar dados da imagem para montar o buffer
                    const chunks = [];
                    upstream.on("data", (chunk) => chunks.push(chunk));
                    
                    upstream.on("end", () => {
                      const buffer = Buffer.concat(chunks);
                      const cachedData = { buffer, contentType, timestamp: Date.now() };
                      ogProxyCache.set(rawUrl, cachedData);
                      resolve(cachedData);
                    });
                  }).on("error", (err) => {
                    reject({ statusCode: 502, message: err.message });
                  });
                };

                fetchUrl(rawUrl);
              });

              inFlightOgRequests.set(rawUrl, fetchPromise.finally(() => inFlightOgRequests.delete(rawUrl)));
            } else {
              console.log("[og-proxy] Deduplicating identical request (awaiting existing IN-FLIGHT):", rawUrl);
            }

            try {
              const result = await inFlightOgRequests.get(rawUrl);
              res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.setHeader("Content-Type", result.contentType);
              res.setHeader("Cache-Control", "public, max-age=86400");
              res.statusCode = 200;
              res.end(result.buffer);
              console.log("[og-proxy] SUCCESS: Served:", rawUrl);
              console.log("[og-proxy] ========================================");
            } catch (err) {
              console.error("[og-proxy] ERROR:", err.message, "for URL:", rawUrl);
              res.statusCode = err.statusCode || 502;
              res.end(`Proxy error: ${err.message}`);
            }
          });
        },
      },
    ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: mode !== "production",
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react-router") || id.includes("/react/")) {
              return "vendor-react";
            }
            if (id.includes("lucide-react") || id.includes("clsx") || id.includes("class-variance-authority") || id.includes("tailwind-merge")) {
              return "vendor-ui-utils";
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
            if (id.includes("@radix-ui")) {
              return "vendor-ui";
            }
            // Keep charts attached to lazy stats chunks instead of forcing a shared global chunk.
            if (id.includes("@tiptap") || id.includes("prosemirror")) {
              return "vendor-editor";
            }
            if (id.includes("zod") || id.includes("date-fns")) {
              return "vendor-utils";
            }
          }
        },
      },
    },
  },
}));