import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Image, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import type { LinkItem } from "@/types/link";

interface LinkDiagnosticsProps {
  links: LinkItem[];
}

interface DiagnosticResult {
  link: LinkItem;
  hasOgImage: boolean;
  hasFavicon: boolean;
  ogImageStatus: "loading" | "success" | "error" | "empty";
  faviconStatus: "loading" | "success" | "error" | "empty";
  ogImageError?: string;
  faviconError?: string;
}

export function LinkDiagnostics({ links }: LinkDiagnosticsProps) {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [checking, setChecking] = useState(false);
  const [filter, setFilter] = useState<"all" | "missing-thumb" | "missing-favicon">("all");

  const checkImage = async (url: string): Promise<{ status: "success" | "error"; error?: string }> => {
    if (!url) return { status: "error", error: "URL vazia" };

    return new Promise((resolve) => {
      const img = document.createElement("img");
      const timeout = setTimeout(() => {
        img.src = "";
        resolve({ status: "error", error: "Timeout (5s)" });
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve({ status: "success" });
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve({ status: "error", error: "Falha ao carregar" });
      };

      img.src = url;
    });
  };

  const runDiagnostics = async () => {
    setChecking(true);
    const diagnostics: DiagnosticResult[] = [];

    for (const link of links) {
      const hasOgImage = Boolean(link.ogImage && link.ogImage.trim());
      const hasFavicon = Boolean(link.favicon && link.favicon.trim());

      let ogImageStatus: DiagnosticResult["ogImageStatus"] = "empty";
      let faviconStatus: DiagnosticResult["faviconStatus"] = "empty";
      let ogImageError: string | undefined;
      let faviconError: string | undefined;

      if (hasOgImage) {
        ogImageStatus = "loading";
        const result = await checkImage(link.ogImage);
        ogImageStatus = result.status;
        ogImageError = result.error;
      }

      if (hasFavicon) {
        faviconStatus = "loading";
        const result = await checkImage(link.favicon);
        faviconStatus = result.status;
        faviconError = result.error;
      }

      diagnostics.push({
        link,
        hasOgImage,
        hasFavicon,
        ogImageStatus,
        faviconStatus,
        ogImageError,
        faviconError,
      });
    }

    setResults(diagnostics);
    setChecking(false);
  };

  const filteredResults = results.filter((r) => {
    if (filter === "missing-thumb") return !r.hasOgImage || r.ogImageStatus === "error";
    if (filter === "missing-favicon") return !r.hasFavicon || r.faviconStatus === "error";
    return true;
  });

  const stats = {
    total: results.length,
    missingThumb: results.filter((r) => !r.hasOgImage || r.ogImageStatus === "error").length,
    missingFavicon: results.filter((r) => !r.hasFavicon || r.faviconStatus === "error").length,
    allGood: results.filter((r) => r.hasOgImage && r.ogImageStatus === "success" && r.hasFavicon && r.faviconStatus === "success").length,
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Links</CardTitle>
          <CardDescription>
            Verifica quais links têm thumbnails e favicons funcionando
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runDiagnostics} disabled={checking || links.length === 0}>
            {checking ? "Verificando..." : "Iniciar Diagnóstico"}
          </Button>

          {results.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">Total de links</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">{stats.allGood}</div>
                    <div className="text-xs text-muted-foreground">Tudo OK</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-amber-600">{stats.missingThumb}</div>
                    <div className="text-xs text-muted-foreground">Sem thumbnail</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">{stats.missingFavicon}</div>
                    <div className="text-xs text-muted-foreground">Sem favicon</div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  Todos ({results.length})
                </Button>
                <Button
                  variant={filter === "missing-thumb" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("missing-thumb")}
                >
                  Sem Thumb ({stats.missingThumb})
                </Button>
                <Button
                  variant={filter === "missing-favicon" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("missing-favicon")}
                >
                  Sem Favicon ({stats.missingFavicon})
                </Button>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredResults.map((result) => (
                  <Card key={result.link.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <a
                              href={result.link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:underline truncate"
                            >
                              {result.link.title || result.link.url}
                            </a>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </div>
                          <div className="text-xs text-muted-foreground truncate mb-2">
                            {result.link.url}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant={result.ogImageStatus === "success" ? "default" : result.ogImageStatus === "error" ? "destructive" : "secondary"}>
                              <Image className="h-3 w-3 mr-1" />
                              Thumb: {result.hasOgImage ? (result.ogImageStatus === "success" ? "OK" : result.ogImageError || "Erro") : "Vazio"}
                            </Badge>
                            <Badge variant={result.faviconStatus === "success" ? "default" : result.faviconStatus === "error" ? "destructive" : "secondary"}>
                              {result.faviconStatus === "success" ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                              Favicon: {result.hasFavicon ? (result.faviconStatus === "success" ? "OK" : result.faviconError || "Erro") : "Vazio"}
                            </Badge>
                          </div>
                          {result.hasOgImage && (
                            <div className="text-xs text-muted-foreground mt-2 truncate">
                              OG Image: {result.link.ogImage}
                            </div>
                          )}
                        </div>
                        {result.hasOgImage && result.ogImageStatus === "success" && (
                          <img
                            src={result.link.ogImage}
                            alt=""
                            className="w-20 h-20 object-cover rounded flex-shrink-0"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
