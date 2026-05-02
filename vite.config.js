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
          // Proxy Unificado para Metadados (HTML + Microlink + Jina)
          // Sempre retorna 200 para evitar erros vermelhos no console do navegador
          // PROXY DE METADADOS UNIFICADO (V4 - ULTRA STABLE)
          server.middlewares.use(async (req, res, next) => {
            const parsedUrl = new URL(req.url || "", "http://localhost:8080");
            if (parsedUrl.pathname !== "/api/metadata") return next();

            const targetUrl = parsedUrl.searchParams.get("url");
            if (!targetUrl) {
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "No URL provided" }));
              return;
            }

            // Função auxiliar para fetch com Timeout e UA
            const fetchPage = (u) => new Promise((resolve) => {
              try {
                const t = new URL(u);
                const client = t.protocol === "https:" ? https : http;
                client.get({
                  hostname: t.hostname,
                  path: t.pathname + t.search,
                  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36" },
                  timeout: 5000
                }, (r) => {
                  if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location) {
                    return resolve(fetchPage(new URL(r.headers.location, t.origin).href));
                  }
                  const chunks = [];
                  r.on("data", c => chunks.push(c));
                  r.on("end", () => resolve({ body: Buffer.concat(chunks).toString("utf8"), url: t.href }));
                }).on("error", () => resolve(null));
              } catch { resolve(null); }
            });

            try {
              let meta = { title: null, description: null, image: null, favicon: null, source: "local" };
              
              // 1. Tenta Scraper Local
              const local = await fetchPage(targetUrl);
              if (local && local.body) {
                const h = local.body;
                const titleM = h.match(/<title[^>]*>([^<]+)<\/title>/i);
                const ogTitleM = h.match(/<meta[^>]+(?:property|name)=["'](?:og|twitter):title["'][^>]+content=["']([^"']+)["']/i) ||
                                 h.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og|twitter):title["']/i);
                const ogImgM = h.match(/<meta[^>]+(?:property|name)=["'](?:og|twitter):image["'][^>]+content=["']([^"']+)["']/i) ||
                               h.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og|twitter):image["']/i);
                const ogDescM = h.match(/<meta[^>]+(?:property|name)=["'](?:og|twitter):description["'][^>]+content=["']([^"']+)["']/i) ||
                                h.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og|twitter):description["']/i);
                
                const linkTags = h.match(/<link[^>]+>/gi) || [];
                for (const tag of linkTags) {
                  if (/rel=["']?(?:(?:shortcut )?icon|apple-touch-icon(?:-precomposed)?)["']?/i.test(tag)) {
                    const hrefM = tag.match(/href=["']([^"']+)["']/i);
                    if (hrefM) {
                      meta.favicon = hrefM[1];
                      if (!meta.favicon.includes(".ico")) break; 
                    }
                  }
                }

                meta.title = (ogTitleM ? ogTitleM[1] : (titleM ? titleM[1] : null))?.trim();
                meta.description = (ogDescM ? ogDescM[1] : null)?.trim();
                meta.image = (ogImgM ? ogImgM[1] : null);
                
                if (meta.image && !meta.image.startsWith("http")) {
                  meta.image = new URL(meta.image, new URL(local.url).origin).href;
                }
                
                if (meta.favicon && !meta.favicon.startsWith("http")) {
                  meta.favicon = new URL(meta.favicon, new URL(local.url).origin).href;
                }
              }

              // 2. Se falhar imagem ou título for ruim, tenta Microlink
              const isBadTitle = !meta.title || meta.title.length < 5 || meta.title.toLowerCase().includes(new URL(targetUrl).hostname.toLowerCase());
              if (!meta.image || isBadTitle) {
                const ml = await new Promise(resML => {
                  https.get(`https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&screenshot=true&image=true&meta=true`, (rML) => {
                    let d = "";
                    rML.on("data", c => d += c);
                    rML.on("end", () => { try { resML(JSON.parse(d)); } catch { resML(null); } });
                  }).on("error", () => resML(null));
                });

                if (ml && ml.status === "success") {
                  meta.title = (meta.title && meta.title.length > 15) ? meta.title : ml.data.title;
                  meta.description = meta.description || ml.data.description;
                  meta.image = meta.image || ml.data.image?.url || ml.data.screenshot?.url;
                  meta.favicon = meta.favicon || ml.data.logo?.url; // Preserva o local se já existir
                  meta.source = "microlink";
                }
              }

              // 3. Fallback absoluto para /favicon.ico
              if (!meta.favicon) {
                try {
                  meta.favicon = new URL("/favicon.ico", new URL(targetUrl).origin).href;
                } catch {}
              }

              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify({
                title: meta.title || new URL(targetUrl).hostname,
                description: meta.description,
                image: meta.image,
                favicon: meta.favicon,
                source: meta.source
              }));

            } catch (err) {
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: err.message, source: "error" }));
            }
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
                      
                      // Retornar o erro real para que o frontend possa acionar o fallback (onError)
                      console.log(`[og-proxy] ERROR ${upstream.statusCode} for ${hostname}. Propagating to client.`);
                      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
                      res.setHeader("Pragma", "no-cache");
                      res.setHeader("Expires", "0");
                      res.statusCode = upstream.statusCode;
                      res.end(`Proxy error: Upstream returned ${upstream.statusCode}`);
                      return;
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
          
          // Endpoint de verificação silenciosa (sem erro no console)
          server.middlewares.use("/check-image", async (req, res) => {
            const rawUrl = new URL(req.url, "http://localhost:8080").searchParams.get("url");
            if (!rawUrl) {
              res.statusCode = 400;
              res.end(JSON.stringify({ ok: false }));
              return;
            }

            try {
              const target = new URL(rawUrl);
              const client = target.protocol === "https:" ? https : http;
              const reqCheck = client.request({
                hostname: target.hostname,
                path: target.pathname + target.search,
                method: "GET", // GET é mais compatível que HEAD para muitos servidores
                timeout: 3000,
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
                }
              }, (checkRes) => {
                const ok = checkRes.statusCode >= 200 && checkRes.statusCode < 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ ok }));
                checkRes.destroy(); // Fecha a conexão imediatamente após receber o cabeçalho
              });
              reqCheck.on("error", () => {
                res.end(JSON.stringify({ ok: false }));
              });
              reqCheck.end();
            } catch {
              res.end(JSON.stringify({ ok: false }));
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