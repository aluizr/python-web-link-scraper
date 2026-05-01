import { useEffect, useRef, useState, useCallback } from "react";
import { X, Check, Move, RefreshCw, Square, ArrowUpRight, Droplets, Type, Palette, MousePointer2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ensureProxied } from "@/lib/image-utils";


interface Rect { x: number; y: number; w: number; h: number; }

type HandleId = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface ScreenCropSelectorProps {
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

const HANDLE_DEFS: { id: HandleId; style: React.CSSProperties; cursor: string }[] = [
  { id: "nw", style: { top: -8, left: -8 },                                      cursor: "nw-resize" },
  { id: "n",  style: { top: -8, left: "50%", transform: "translateX(-50%)" },    cursor: "n-resize"  },
  { id: "ne", style: { top: -8, right: -8 },                                     cursor: "ne-resize" },
  { id: "e",  style: { top: "50%", right: -8, transform: "translateY(-50%)" },   cursor: "e-resize"  },
  { id: "se", style: { bottom: -8, right: -8 },                                  cursor: "se-resize" },
  { id: "s",  style: { bottom: -8, left: "50%", transform: "translateX(-50%)" }, cursor: "s-resize"  },
  { id: "sw", style: { bottom: -8, left: -8 },                                   cursor: "sw-resize" },
  { id: "w",  style: { top: "50%", left: -8, transform: "translateY(-50%)" },    cursor: "w-resize"  },
];

const MIN = 12; // px mínimo da seleção

function ToolButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <Button
      size="sm"
      variant="ghost"
      title={label}
      onClick={onClick}
      className={`h-8 w-10 p-0 ${active ? "bg-primary text-primary-foreground hover:bg-primary" : "text-white/60 hover:bg-white/10"}`}
    >
      {icon}
    </Button>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${active ? "bg-white/20 text-white" : "text-white/40 hover:text-white/70"}`}
    >
      {label}
    </button>
  );
}

export function ScreenCropSelector({ imageSrc, onConfirm, onCancel }: ScreenCropSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const imgRef       = useRef<HTMLImageElement | null>(null);

  const [rect, setRect]               = useState<Rect | null>(null);
  const [activeHandle, setActiveHandle] = useState<HandleId | null>(null);
  const [tool, setTool] = useState<"crop" | "arrow" | "rect" | "blur" | "text">("crop");
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [imageFilter, setImageFilter] = useState<string>("none");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // "draw" = criando nova seleção arrastando o fundo; null = idle
  const mode       = useRef<"draw" | null>(null);
  const dragStart  = useRef<{ mx: number; my: number; rect: Rect }>({ mx: 0, my: 0, rect: { x: 0, y: 0, w: 0, h: 0 } });

  const hasValid = !!(rect && rect.w >= MIN && rect.h >= MIN);

  // ── Helpers de coordenadas CSS relativas ao container ────────────────────
  const toCss = useCallback((clientX: number, clientY: number): { x: number; y: number } => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const b = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(clientX - b.left, b.width)),
      y: Math.max(0, Math.min(clientY - b.top,  b.height)),
    };
  }, []);

  const clampRect = useCallback((r: Rect): Rect => {
    const el = containerRef.current;
    if (!el) return r;
    const { width: cw, height: ch } = el.getBoundingClientRect();
    let { x, y, w, h } = r;
    w = Math.max(MIN, w);
    h = Math.max(MIN, h);
    x = Math.max(0, Math.min(x, cw - MIN));
    y = Math.max(0, Math.min(y, ch - MIN));
    w = Math.min(w, cw - x);
    h = Math.min(h, ch - y);
    return { x, y, w, h };
  }, []);

  // ── Carrega imagem no canvas ─────────────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      // Iniciar com uma seleção padrão (80% da área visível)
      const cw = containerRef.current?.clientWidth || 800;
      const ch = containerRef.current?.clientHeight || 600;
      const w = Math.min(cw * 0.8, 800);
      const h = Math.min(ch * 0.8, 600);
      setRect({
        x: (cw - w) / 2,
        y: (ch - h) / 2,
        w: w,
        h: h
      });
      setIsLoading(false);
    };
    img.onerror = () => {
      setError("Não foi possível carregar a imagem para edição. Tente usar a captura de tela ou verifique a URL.");
      setIsLoading(false);
    };
    img.src = ensureProxied(imageSrc);
  }, [imageSrc]);

  // ── Início do arrasto sobre o fundo (criar nova seleção) ─────────────────
  const onBgMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const pos = toCss(e.clientX, e.clientY);
    
    if (tool !== "crop") {
      setAnnotations([...annotations, {
        type: tool,
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
        isDrawing: true
      }]);
      return;
    }

    mode.current = "draw";
    dragStart.current = { mx: e.clientX, my: e.clientY, rect: { x: pos.x, y: pos.y, w: 0, h: 0 } };
    setRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
    setActiveHandle(null);
  }, [toCss, tool, annotations]);

  // ── Início do arrasto de uma alça ────────────────────────────────────────
  const onHandleDown = useCallback((e: React.MouseEvent | React.TouchEvent, handle: HandleId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!rect) return;
    
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    mode.current = null;
    setActiveHandle(handle);
    dragStart.current = { mx: clientX, my: clientY, rect: { ...rect } };
  }, [rect]);

  // ── mousemove global ─────────────────────────────────────────────────────
  const onMouseMove = useCallback((e: MouseEvent) => {
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    const b  = dragStart.current.rect;

    if (tool !== "crop") {
      const pos = toCss(e.clientX, e.clientY);
      const activeAnn = annotations[annotations.length - 1];
      if (!activeAnn || !activeAnn.isDrawing) return;
      
      const newAnns = [...annotations];
      newAnns[newAnns.length - 1] = {
        ...activeAnn,
        x2: pos.x,
        y2: pos.y
      };
      setAnnotations(newAnns);
      return;
    }

    if (mode.current === "draw") {
      const pos = toCss(e.clientX, e.clientY);
      setRect(clampRect({
        x: Math.min(dragStart.current.rect.x, pos.x),
        y: Math.min(dragStart.current.rect.y, pos.y),
        w: Math.abs(pos.x - dragStart.current.rect.x),
        h: Math.abs(pos.y - dragStart.current.rect.y),
      }));
      return;
    }

    if (!activeHandle) return;

    const next: Rect = { ...b };
    if (activeHandle === "move") {
      next.x = b.x + dx;
      next.y = b.y + dy;
    } else {
      if (activeHandle.includes("e")) next.w = b.w + dx;
      if (activeHandle.includes("s")) next.h = b.h + dy;
      if (activeHandle.includes("w")) { next.x = b.x + dx; next.w = b.w - dx; }
      if (activeHandle.includes("n")) { next.y = b.y + dy; next.h = b.h - dy; }
    }
    setRect(clampRect(next));
  }, [activeHandle, toCss, clampRect, tool, annotations]);

  const onMouseUp = useCallback(() => {
    if (tool !== "crop" && annotations.length > 0) {
      const newAnns = [...annotations];
      const last = newAnns[newAnns.length - 1];
      if (last.isDrawing) {
        last.isDrawing = false;
        // Remover se for apenas um clique (sem arrasto significativo)
        if (Math.abs(last.x1 - last.x2) < 3 && Math.abs(last.y1 - last.y2) < 3) {
          newAnns.pop();
        }
        setAnnotations(newAnns);
      }
    }
    mode.current = null;
    setActiveHandle(null);
  }, [tool, annotations]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // ── Touch ────────────────────────────────────────────────────────────────
  const onBgTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const pos = toCss(touch.clientX, touch.clientY);
    
    if (tool !== "crop") {
      setAnnotations([...annotations, {
        type: tool,
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
        isDrawing: true
      }]);
      return;
    }

    mode.current = "draw";
    dragStart.current = { mx: touch.clientX, my: touch.clientY, rect: { x: pos.x, y: pos.y, w: 0, h: 0 } };
    setRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
  }, [toCss, tool, annotations]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.current.mx;
    const dy = touch.clientY - dragStart.current.my;
    const b  = dragStart.current.rect;

    if (tool !== "crop") {
      const pos = toCss(touch.clientX, touch.clientY);
      const activeAnn = annotations[annotations.length - 1];
      if (!activeAnn || !activeAnn.isDrawing) return;
      
      const newAnns = [...annotations];
      newAnns[newAnns.length - 1] = {
        ...activeAnn,
        x2: pos.x,
        y2: pos.y
      };
      setAnnotations(newAnns);
      return;
    }

    if (mode.current === "draw") {
      const pos = toCss(touch.clientX, touch.clientY);
      setRect(clampRect({
        x: Math.min(b.x, pos.x),
        y: Math.min(b.y, pos.y),
        w: Math.abs(pos.x - b.x),
        h: Math.abs(pos.y - b.y),
      }));
      return;
    }
    if (!activeHandle) return;
    const next: Rect = { ...b };
    if (activeHandle === "move") { next.x = b.x + dx; next.y = b.y + dy; }
    else {
      if (activeHandle.includes("e")) next.w = b.w + dx;
      if (activeHandle.includes("s")) next.h = b.h + dy;
      if (activeHandle.includes("w")) { next.x = b.x + dx; next.w = b.w - dx; }
      if (activeHandle.includes("n")) { next.y = b.y + dy; next.h = b.h - dy; }
    }
    setRect(clampRect(next));
  }, [activeHandle, toCss, clampRect, tool, annotations]);

  const onTouchEnd = useCallback(() => { 
    if (tool !== "crop" && annotations.length > 0) {
      const newAnns = [...annotations];
      const last = newAnns[newAnns.length - 1];
      if (last.isDrawing) {
        last.isDrawing = false;
        if (Math.abs(last.x1 - last.x2) < 3 && Math.abs(last.y1 - last.y2) < 3) {
          newAnns.pop();
        }
        setAnnotations(newAnns);
      }
    }
    mode.current = null; 
    setActiveHandle(null); 
  }, [tool, annotations]);

  useEffect(() => {
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend",  onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onTouchEnd);
    };
  }, [onTouchMove, onTouchEnd]);

  // ── Confirmar ────────────────────────────────────────────────────────────
  const handleConfirm = useCallback(async () => {
    if (!rect || rect.w < MIN || rect.h >= 10000) return; // Segurança contra valores absurdos
    
    console.log("[ScreenCrop] Iniciando processamento do recorte...", { rect, annotations: annotations.length, filter: imageFilter });
    setIsSaving(true);

    try {
      const canvas = canvasRef.current;
      const el     = containerRef.current;
      if (!canvas || !el) throw new Error("Referências do Canvas ou Container não encontradas.");

      const containerWidth = el.clientWidth;
      const containerHeight = el.clientHeight;
      const imageWidth = canvas.width;
      const imageHeight = canvas.height;

      const scale = Math.min(containerWidth / imageWidth, containerHeight / imageHeight);
      const displayedWidth = imageWidth * scale;
      const displayedHeight = imageHeight * scale;
      
      const offsetX = (containerWidth - displayedWidth) / 2;
      const offsetY = (containerHeight - displayedHeight) / 2;

      // Mapear e CLAMP (limitar) as coordenadas para dentro da imagem real
      const sx = Math.max(0, (rect.x - offsetX) * (1 / scale));
      const sy = Math.max(0, (rect.y - offsetY) * (1 / scale));
      const sw = Math.min(imageWidth - sx, rect.w * (1 / scale));
      const sh = Math.min(imageHeight - sy, rect.h * (1 / scale));

      console.log("[ScreenCrop] Coordenadas mapeadas para o original:", { sx, sy, sw, sh });

      if (sw <= 0 || sh <= 0) throw new Error("Área de seleção inválida (fora dos limites da imagem).");

      const crop = document.createElement("canvas");
      crop.width  = Math.round(sw);
      crop.height = Math.round(sh);
      const ctx = crop.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Não foi possível obter o contexto 2D do Canvas de recorte.");
      
      if (imageFilter !== "none") ctx.filter = imageFilter;
      
      ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, crop.width, crop.height);
      
      // Desenhar anotações
      annotations.forEach((ann, idx) => {
        ctx.save();
        const ax1 = (ann.x1 - offsetX) * (1 / scale) - sx;
        const ay1 = (ann.y1 - offsetY) * (1 / scale) - sy;
        const ax2 = (ann.x2 - offsetX) * (1 / scale) - sx;
        const ay2 = (ann.y2 - offsetY) * (1 / scale) - sy;
        
        if (ann.type === "rect") {
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 3 * (1 / scale);
          ctx.strokeRect(Math.min(ax1, ax2), Math.min(ay1, ay2), Math.abs(ax2 - ax1), Math.abs(ay2 - ay1));
        } else if (ann.type === "arrow") {
          const headlen = 15 * (1 / scale);
          const angle = Math.atan2(ay2 - ay1, ax2 - ax1);
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 3 * (1 / scale);
          ctx.beginPath(); ctx.moveTo(ax1, ay1); ctx.lineTo(ax2, ay2); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(ax2, ay2);
          ctx.lineTo(ax2 - headlen * Math.cos(angle - Math.PI / 6), ay2 - headlen * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(ax2 - headlen * Math.cos(angle + Math.PI / 6), ay2 - headlen * Math.sin(angle + Math.PI / 6));
          ctx.closePath(); ctx.fillStyle = "#ef4444"; ctx.fill();
        } else if (ann.type === "blur") {
          ctx.filter = "blur(12px)";
          ctx.drawImage(canvas, (ann.x1 - offsetX) * (1 / scale), (ann.y1 - offsetY) * (1 / scale), (ann.x2 - ann.x1) * (1 / scale), (ann.y2 - ann.y1) * (1 / scale), ax1, ay1, ax2 - ax1, ay2 - ay1);
        }
        ctx.restore();
      });
      
      console.log("[ScreenCrop] Gerando Blob final...");
      crop.toBlob((blob) => { 
        if (blob) {
          console.log("[ScreenCrop] Recorte concluído com sucesso. Enviando para o componente pai.");
          onConfirm(blob); 
        } else {
          throw new Error("Falha ao converter Canvas para Blob.");
        }
      }, "image/png", 0.9);

    } catch (err) {
      console.error("[ScreenCrop] Erro crítico no handleConfirm:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido ao processar imagem.");
      setIsSaving(false);
    }
  }, [rect, annotations, imageFilter, onConfirm]);

  // ── Atalhos de Teclado ──────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case "c": setTool("crop"); break;
        case "a": setTool("arrow"); break;
        case "r": setTool("rect"); break;
        case "b": setTool("blur"); break;
        case "enter": 
          if (hasValid) handleConfirm(); 
          break;
        case "escape": 
          onCancel(); 
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) {
            setAnnotations(prev => prev.slice(0, -1));
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tool, hasValid, annotations, onCancel, handleConfirm]);

  const cursorStyle = activeHandle === "move" ? "grabbing" : mode.current === "draw" ? "crosshair" : "crosshair";

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/90 animate-in fade-in duration-150">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/80 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <Move className="h-4 w-4 shrink-0" />
          <span>
            {hasValid
              ? "Ajuste os cantos ou arraste o interior · Clique fora para redesenhar"
              : "Arraste para selecionar a área"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Seletor de Ferramentas */}
          <div className="flex items-center bg-white/5 rounded-md p-0.5 mr-2 border border-white/10">
            <ToolButton active={tool === "crop"} onClick={() => setTool("crop")} icon={<MousePointer2 className="h-4 w-4" />} label="Mover / Recortar (C)" />
            <ToolButton active={tool === "arrow"} onClick={() => setTool("arrow")} icon={<ArrowUpRight className="h-4 w-4" />} label="Seta (A)" />
            <ToolButton active={tool === "rect"} onClick={() => setTool("rect")} icon={<Square className="h-4 w-4" />} label="Retângulo (R)" />
            <ToolButton active={tool === "blur"} onClick={() => setTool("blur")} icon={<Droplets className="h-4 w-4" />} label="Desfoque (B)" />
          </div>

          <div className="h-6 w-px bg-white/10 mx-1" />

          {/* Seletor de Filtros */}
          <div className="flex items-center bg-white/5 rounded-md p-0.5 mr-4 border border-white/10">
            <FilterButton active={imageFilter === "none"} onClick={() => setImageFilter("none")} label="Original" />
            <FilterButton active={imageFilter === "grayscale(100%)"} onClick={() => setImageFilter("grayscale(100%)")} label="P&B" />
            <FilterButton active={imageFilter === "contrast(150%)"} onClick={() => setImageFilter("contrast(150%)")} label="Contraste" />
          </div>

          {annotations.length > 0 && (
            <Button size="sm" variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10 h-8 mr-2"
              onClick={() => setAnnotations([])}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Limpar Edições
            </Button>
          )}

          {hasValid && (
            <span className="text-white/35 text-xs font-mono hidden sm:block">
              {Math.round(rect!.w)} × {Math.round(rect!.h)}
            </span>
          )}
          {rect && (
            <Button size="sm" variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10 h-8"
              onClick={() => setRect(null)}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Redesenhar
            </Button>
          )}
          <Button size="sm" variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10 h-8"
            onClick={onCancel}>
            <X className="h-4 w-4 mr-1" /> Cancelar
          </Button>
          <Button size="sm"
            disabled={!hasValid || isSaving}
            className="h-8 bg-primary hover:bg-primary/90 disabled:opacity-40 min-w-[120px]"
            onClick={handleConfirm}>
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" /> Confirmar seleção
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Área de captura ── */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden flex items-center justify-center select-none"
        style={{ cursor: cursorStyle }}
        onMouseDown={onBgMouseDown}
        onTouchStart={onBgTouchStart}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <p className="text-white/60 text-sm animate-pulse">Carregando imagem...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-[60]">
            <div className="max-w-md w-full bg-destructive/10 border border-destructive/20 p-6 rounded-2xl text-center space-y-4 mx-4">
              <div className="h-12 w-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-white font-semibold">Erro no Carregamento</h3>
              <p className="text-white/70 text-sm leading-relaxed">{error}</p>
              <div className="flex justify-center gap-3">
                <Button variant="ghost" onClick={onCancel} className="text-white hover:bg-white/10">
                  Cancelar
                </Button>
                <Button onClick={() => window.location.reload()} className="bg-destructive hover:bg-destructive/90">
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Imagem de fundo (canvas) com filtro */}
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain pointer-events-none transition-all duration-300"
          style={{ filter: imageFilter }}
        />

        {/* Camada de Anotações (SVG) */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-20">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
            </marker>
          </defs>
          {annotations.map((ann, i) => {
            if (ann.type === "rect") {
              return <rect key={i} x={Math.min(ann.x1, ann.x2)} y={Math.min(ann.y1, ann.y2)} width={Math.abs(ann.x2 - ann.x1)} height={Math.abs(ann.y2 - ann.y1)} fill="none" stroke="#ef4444" strokeWidth="3" rx="2" />;
            }
            if (ann.type === "arrow") {
              return <line key={i} x1={ann.x1} y1={ann.y1} x2={ann.x2} y2={ann.y2} stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowhead)" />;
            }
            if (ann.type === "blur") {
              return (
                <foreignObject key={i} x={Math.min(ann.x1, ann.x2)} y={Math.min(ann.y1, ann.y2)} width={Math.abs(ann.x2 - ann.x1)} height={Math.abs(ann.y2 - ann.y1)}>
                  <div className="w-full h-full backdrop-blur-md bg-white/10 border border-white/20 rounded" />
                </foreignObject>
              );
            }
            return null;
          })}
        </svg>

        {/* Overlay escuro fora da seleção */}
        {rect && rect.w > 0 && rect.h > 0 && (
          <>
            {/* Topo */}
            <div className="absolute inset-0 bg-black/55 pointer-events-none"
              style={{ bottom: `calc(100% - ${rect.y}px)` }} />
            {/* Baixo */}
            <div className="absolute inset-0 bg-black/55 pointer-events-none"
              style={{ top: `${rect.y + rect.h}px` }} />
            {/* Esquerda */}
            <div className="absolute bg-black/55 pointer-events-none"
              style={{ top: rect.y, left: 0, width: rect.x, height: rect.h }} />
            {/* Direita */}
            <div className="absolute bg-black/55 pointer-events-none"
              style={{ top: rect.y, left: rect.x + rect.w, right: 0, height: rect.h }} />

            {/* Frame da seleção + grade de terços */}
            <div
              className="absolute border-2 border-primary shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
              style={{ top: rect.y, left: rect.x, width: rect.w, height: rect.h, cursor: "move" }}
              onMouseDown={(e) => onHandleDown(e, "move")}
              onTouchStart={(e) => onHandleDown(e, "move")}
            >
              {/* Grade de terços */}
              <div className="absolute inset-0 pointer-events-none">
                {["33.33%", "66.66%"].map((p) => (
                  <div key={p}>
                    <div className="absolute border-t border-white/15" style={{ top: p, left: 0, right: 0 }} />
                    <div className="absolute border-l border-white/15" style={{ left: p, top: 0, bottom: 0 }} />
                  </div>
                ))}
              </div>

              {/* 8 alças de redimensionamento com área de toque expandida */}
              {HANDLE_DEFS.map(({ id, style, cursor }) => (
                <div
                  key={id}
                  className="absolute z-10 flex items-center justify-center"
                  style={{ 
                    ...style, 
                    cursor, 
                    width: 24, 
                    height: 24,
                    // Compensar a posição para que o centro da área de toque seja o ponto da alça
                    marginLeft: style.left === "50%" ? -12 : (style.left === -8 ? -8 : -16),
                    marginTop: style.top === "50%" ? -12 : (style.top === -8 ? -8 : -16)
                  }}
                  onMouseDown={(e) => onHandleDown(e, id)}
                  onTouchStart={(e) => onHandleDown(e, id)}
                >
                  <div className="w-3.5 h-3.5 bg-white border-2 border-primary rounded-sm shadow-md hover:scale-125 transition-transform" />
                </div>
              ))}
            </div>

            {/* Badge de dimensões */}
            {hasValid && (
              <div
                className="absolute bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded font-mono pointer-events-none"
                style={{ top: Math.max(0, rect.y - 22), left: rect.x }}
              >
                {Math.round(rect.w)} × {Math.round(rect.h)}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Info bar inferior ── */}
      <div className="px-4 py-1.5 bg-black/80 border-t border-white/10 shrink-0 text-white/30 text-xs text-center">
        Arraste o interior para mover · Arraste as alças para ajustar os cantos e bordas
      </div>
    </div>
  );
}
