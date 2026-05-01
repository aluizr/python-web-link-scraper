import { useState, useRef, useEffect, useCallback } from "react";
import { X, Check, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ensureProxied } from "@/lib/image-utils";


type HandleId = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface Rect { x: number; y: number; w: number; h: number; }

interface ImageCropToolProps {
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

const ASPECT_RATIOS: { label: string; value: number | null }[] = [
  { label: "Livre",  value: null },
  { label: "16:9",   value: 16 / 9 },
  { label: "4:3",    value: 4 / 3 },
  { label: "1:1",    value: 1 },
  { label: "9:16",   value: 9 / 16 },
  { label: "3:2",    value: 3 / 2 },
];

const MIN_CROP = 24;

const HANDLES: { id: HandleId; style: React.CSSProperties; cursor: string }[] = [
  { id: "nw", style: { top: -6, left: -6 },                                      cursor: "nw-resize" },
  { id: "n",  style: { top: -6, left: "50%", transform: "translateX(-50%)" },    cursor: "n-resize"  },
  { id: "ne", style: { top: -6, right: -6 },                                     cursor: "ne-resize" },
  { id: "e",  style: { top: "50%", right: -6, transform: "translateY(-50%)" },   cursor: "e-resize"  },
  { id: "se", style: { bottom: -6, right: -6 },                                  cursor: "se-resize" },
  { id: "s",  style: { bottom: -6, left: "50%", transform: "translateX(-50%)" }, cursor: "s-resize"  },
  { id: "sw", style: { bottom: -6, left: -6 },                                   cursor: "sw-resize" },
  { id: "w",  style: { top: "50%", left: -6, transform: "translateY(-50%)" },    cursor: "w-resize"  },
];

export function ImageCropTool({ imageSrc, onConfirm, onCancel }: ImageCropToolProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const imgRef        = useRef<HTMLImageElement>(null);

  const [imageLoaded, setImageLoaded]   = useState(false);
  const [imgObjectUrl, setImgObjectUrl] = useState<string | null>(null);
  const [displayRect, setDisplayRect]   = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [crop, setCrop]                 = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [aspectRatio, setAspectRatio]   = useState<number | null>(null);
  const [activeHandle, setActiveHandle] = useState<HandleId | null>(null);
  const [naturalSize, setNaturalSize]   = useState({ w: 0, h: 0 });
  const [error, setError]               = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const dragStart = useRef<{ mx: number; my: number; crop: Rect } | null>(null);

  useEffect(() => {
    setImageLoaded(false);
    setError(null);
    setImgObjectUrl(imageSrc ? ensureProxied(imageSrc) : null);
  }, [imageSrc]);

  useEffect(() => { return () => {}; }, [imgObjectUrl]);

  const computeDisplayRect = useCallback(() => {
    const container = containerRef.current;
    const img       = imgRef.current;
    if (!container || !img || !img.naturalWidth) return;

    const { width: cw, height: ch } = container.getBoundingClientRect();
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const ctnAspect = cw / ch;

    let dw: number, dh: number;
    if (imgAspect > ctnAspect) { dw = cw; dh = cw / imgAspect; }
    else                        { dh = ch; dw = ch * imgAspect; }

    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    const r: Rect = { x: dx, y: dy, w: dw, h: dh };
    setDisplayRect(r);
    setCrop(r);
  }, []);

  useEffect(() => {
    if (!imageLoaded) return;
    computeDisplayRect();
    const ro = new ResizeObserver(computeDisplayRect);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [imageLoaded, computeDisplayRect]);

  const clamp = useCallback((c: Rect): Rect => {
    const { x: ix, y: iy, w: iw, h: ih } = displayRect;
    let { x, y, w, h } = c;
    w = Math.max(MIN_CROP, w);
    h = Math.max(MIN_CROP, h);
    x = Math.max(ix, Math.min(x, ix + iw - MIN_CROP));
    y = Math.max(iy, Math.min(y, iy + ih - MIN_CROP));
    w = Math.min(w, ix + iw - x);
    h = Math.min(h, iy + ih - y);
    return { x, y, w, h };
  }, [displayRect]);

  const applyAR = useCallback((c: Rect, handle: HandleId): Rect => {
    if (!aspectRatio) return c;
    if (handle === "n" || handle === "s") return { ...c, w: c.h * aspectRatio };
    return { ...c, h: c.w / aspectRatio };
  }, [aspectRatio]);

  // ── Drag Handlers (Mouse & Touch) ───────────────────────────────────────
  const onStart = useCallback((clientX: number, clientY: number, handle: HandleId) => {
    setActiveHandle(handle);
    dragStart.current = { mx: clientX, my: clientY, crop: { ...crop } };
  }, [crop]);

  const onMove = useCallback((clientX: number, clientY: number) => {
    if (!activeHandle || !dragStart.current) return;
    const dx = clientX - dragStart.current.mx;
    const dy = clientY - dragStart.current.my;
    const b  = dragStart.current.crop;
    let next: Rect = { ...b };

    if (activeHandle === "move") {
      next.x = b.x + dx;
      next.y = b.y + dy;
    } else {
      if (activeHandle.includes("e")) next.w = b.w + dx;
      if (activeHandle.includes("s")) next.h = b.h + dy;
      if (activeHandle.includes("w")) { next.x = b.x + dx; next.w = b.w - dx; }
      if (activeHandle.includes("n")) { next.y = b.y + dy; next.h = b.h - dy; }
      next = applyAR(next, activeHandle);
    }
    setCrop(clamp(next));
  }, [activeHandle, clamp, applyAR]);

  const onEnd = useCallback(() => {
    setActiveHandle(null);
    dragStart.current = null;
  }, []);

  // Global events
  useEffect(() => {
    if (!activeHandle) return;
    const mouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const touchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup",   onEnd);
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("touchend",  onEnd);
    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup",   onEnd);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend",  onEnd);
    };
  }, [activeHandle, onMove, onEnd]);

  // ── Confirmar Recorte (Otimizado WebP) ──────────────────────────────────
  const handleConfirm = async () => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;
    setIsProcessing(true);

    const scaleX = img.naturalWidth  / displayRect.w;
    const scaleY = img.naturalHeight / displayRect.h;
    const sx = (crop.x - displayRect.x) * scaleX;
    const sy = (crop.y - displayRect.y) * scaleY;
    const sw = Math.max(1, crop.w * scaleX);
    const sh = Math.max(1, crop.h * scaleY);

    const canvas = document.createElement("canvas");
    canvas.width  = Math.round(sw);
    canvas.height = Math.round(sh);
    
    try {
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      
      // OPTIMIZATION: Salva como WebP (80% qualidade)
      // Fallback para image/png se o browser não suportar webp (raro hoje)
      canvas.toBlob(
        (blob) => {
          setIsProcessing(false);
          if (blob) onConfirm(blob);
          else setError("Falha ao gerar imagem.");
        },
        "image/webp",
        0.8
      );
    } catch (err) {
      setIsProcessing(false);
      console.error("[ImageCropTool] canvas error:", err);
      setError("Erro ao processar imagem.");
    }
  };

  const handleReset = () => setCrop({ ...displayRect });
  const changeAR = (value: number | null) => {
    setAspectRatio(value);
    if (value) setCrop(prev => clamp(applyAR(prev, "se")));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/95 animate-in fade-in duration-150 select-none">
      
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/80 border-b border-white/10 shrink-0 gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-white font-semibold text-sm">✂️ Recortar Capa</span>
          <div className="flex items-center gap-1">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.label}
                onClick={() => changeAR(ar.value)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  aspectRatio === ar.value ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {imageLoaded && (
            <span className="text-white/40 text-[10px] font-mono hidden sm:block">
              {Math.round(crop.w)} × {Math.round(crop.h)} px
            </span>
          )}
          <Button size="sm" variant="ghost" className="text-white/60 h-8" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
          <Button size="sm" variant="ghost" className="text-white/60 h-8" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" /> Sair
          </Button>
          <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 min-w-[120px]" onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
            {isProcessing ? "Processando..." : "Confirmar"}
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden flex items-center justify-center bg-[#0a0a0a]"
        style={{ cursor: activeHandle === "move" ? "grabbing" : "default" }}
      >
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "repeating-conic-gradient(#333 0% 25%, transparent 0% 50%)", backgroundSize: "20px 20px" }} />

        <img
          ref={imgRef}
          src={imgObjectUrl ?? ""}
          alt="Para recorte"
          className="relative max-w-[95%] max-h-[95%] object-contain pointer-events-none"
          style={{ display: imageLoaded ? "block" : "none" }}
          crossOrigin="anonymous"
          onLoad={() => {
            setNaturalSize({ w: imgRef.current!.naturalWidth, h: imgRef.current!.naturalHeight });
            setImageLoaded(true);
          }}
          onError={() => setError("Não foi possível carregar a imagem.")}
        />

        {imageLoaded && (
          <>
            <div className="absolute pointer-events-none bg-black/60"
              style={{ top: displayRect.y, left: displayRect.x, width: displayRect.w, height: Math.max(0, crop.y - displayRect.y) }} />
            <div className="absolute pointer-events-none bg-black/60"
              style={{ top: crop.y + crop.h, left: displayRect.x, width: displayRect.w, height: Math.max(0, (displayRect.y + displayRect.h) - (crop.y + crop.h)) }} />
            <div className="absolute pointer-events-none bg-black/60"
              style={{ top: crop.y, left: displayRect.x, width: Math.max(0, crop.x - displayRect.x), height: crop.h }} />
            <div className="absolute pointer-events-none bg-black/60"
              style={{ top: crop.y, left: crop.x + crop.w, width: Math.max(0, (displayRect.x + displayRect.w) - (crop.x + crop.w)), height: crop.h }} />

            <div
              className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
              style={{ top: crop.y, left: crop.x, width: crop.w, height: crop.h, cursor: "move", touchAction: "none" }}
              onMouseDown={(e) => onStart(e.clientX, e.clientY, "move")}
              onTouchStart={(e) => onStart(e.touches[0].clientX, e.touches[0].clientY, "move")}
            >
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
                {[...Array(4)].map((_, i) => <div key={i} className="border-r border-b border-white" />)}
              </div>

              {HANDLES.map(({ id, style, cursor }) => (
                <div
                  key={id}
                  className="absolute w-5 h-5 flex items-center justify-center z-10"
                  style={{ ...style, cursor, touchAction: "none" }}
                  onMouseDown={(e) => onStart(e.clientX, e.clientY, id)}
                  onTouchStart={(e) => onStart(e.touches[0].clientX, e.touches[0].clientY, id)}
                >
                  <div className="w-2.5 h-2.5 bg-white border border-primary rounded-full shadow-lg transition-transform hover:scale-150" />
                </div>
              ))}
            </div>
          </>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-8 z-50">
            <div className="bg-destructive text-white px-6 py-4 rounded-2xl max-w-sm text-center shadow-2xl animate-in zoom-in-95">
              <AlertCircle className="h-8 w-8 mx-auto mb-3" />
              <p className="text-sm font-medium">{error}</p>
              <Button variant="outline" className="mt-4 bg-white/10 border-white/20 hover:bg-white/20 text-white" onClick={() => setError(null)}>Fechar</Button>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-black/80 border-t border-white/10 text-white/40 text-[10px] text-center">
        Arraste o centro para mover · Use as alças nos cantos para ajustar o tamanho
      </div>
    </div>
  );
}
