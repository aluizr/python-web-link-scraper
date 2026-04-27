import { useEffect, useRef, useState, useCallback } from "react";
import { X, Check, Move, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Rect { x: number; y: number; w: number; h: number; }

type HandleId = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface ScreenCropSelectorProps {
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

const HANDLE_DEFS: { id: HandleId; style: React.CSSProperties; cursor: string }[] = [
  { id: "nw", style: { top: -6, left: -6 },                                      cursor: "nw-resize" },
  { id: "n",  style: { top: -6, left: "50%", transform: "translateX(-50%)" },    cursor: "n-resize"  },
  { id: "ne", style: { top: -6, right: -6 },                                     cursor: "ne-resize" },
  { id: "e",  style: { top: "50%", right: -6, transform: "translateY(-50%)" },   cursor: "e-resize"  },
  { id: "se", style: { bottom: -6, right: -6 },                                  cursor: "se-resize" },
  { id: "s",  style: { bottom: -6, left: "50%", transform: "translateX(-50%)" }, cursor: "s-resize"  },
  { id: "sw", style: { bottom: -6, left: -6 },                                   cursor: "sw-resize" },
  { id: "w",  style: { top: "50%", left: -6, transform: "translateY(-50%)" },    cursor: "w-resize"  },
];

const MIN = 12; // px mínimo da seleção

export function ScreenCropSelector({ imageSrc, onConfirm, onCancel }: ScreenCropSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const imgRef       = useRef<HTMLImageElement | null>(null);

  const [rect, setRect]               = useState<Rect | null>(null);
  const [activeHandle, setActiveHandle] = useState<HandleId | null>(null);
  // "draw" = criando nova seleção arrastando o fundo; null = idle
  const mode       = useRef<"draw" | null>(null);
  const dragStart  = useRef<{ mx: number; my: number; rect: Rect }>({ mx: 0, my: 0, rect: { x: 0, y: 0, w: 0, h: 0 } });

  // ── Carrega imagem no canvas ─────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageSrc;
  }, [imageSrc]);

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

  // ── Início do arrasto sobre o fundo (criar nova seleção) ─────────────────
  const onBgMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const pos = toCss(e.clientX, e.clientY);
    mode.current = "draw";
    dragStart.current = { mx: e.clientX, my: e.clientY, rect: { x: pos.x, y: pos.y, w: 0, h: 0 } };
    setRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
    setActiveHandle(null);
  }, [toCss]);

  // ── Início do arrasto de uma alça ────────────────────────────────────────
  const onHandleDown = useCallback((e: React.MouseEvent, handle: HandleId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!rect) return;
    mode.current = null;
    setActiveHandle(handle);
    dragStart.current = { mx: e.clientX, my: e.clientY, rect: { ...rect } };
  }, [rect]);

  // ── mousemove global ─────────────────────────────────────────────────────
  const onMouseMove = useCallback((e: MouseEvent) => {
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    const b  = dragStart.current.rect;

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

    let next: Rect = { ...b };
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
  }, [activeHandle, toCss, clampRect]);

  const onMouseUp = useCallback(() => {
    mode.current = null;
    setActiveHandle(null);
  }, []);

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
    mode.current = "draw";
    dragStart.current = { mx: touch.clientX, my: touch.clientY, rect: { x: pos.x, y: pos.y, w: 0, h: 0 } };
    setRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
  }, [toCss]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.current.mx;
    const dy = touch.clientY - dragStart.current.my;
    const b  = dragStart.current.rect;

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
    let next: Rect = { ...b };
    if (activeHandle === "move") { next.x = b.x + dx; next.y = b.y + dy; }
    else {
      if (activeHandle.includes("e")) next.w = b.w + dx;
      if (activeHandle.includes("s")) next.h = b.h + dy;
      if (activeHandle.includes("w")) { next.x = b.x + dx; next.w = b.w - dx; }
      if (activeHandle.includes("n")) { next.y = b.y + dy; next.h = b.h - dy; }
    }
    setRect(clampRect(next));
  }, [activeHandle, toCss, clampRect]);

  const onTouchEnd = useCallback(() => { mode.current = null; setActiveHandle(null); }, []);

  useEffect(() => {
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend",  onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onTouchEnd);
    };
  }, [onTouchMove, onTouchEnd]);

  // ── Confirmar ────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!rect || rect.w < MIN || rect.h < MIN) return;
    const canvas = canvasRef.current;
    const el     = containerRef.current;
    if (!canvas || !el) return;

    const bounds = el.getBoundingClientRect();
    const scaleX = canvas.width  / bounds.width;
    const scaleY = canvas.height / bounds.height;
    const sx = rect.x * scaleX;
    const sy = rect.y * scaleY;
    const sw = Math.max(1, rect.w * scaleX);
    const sh = Math.max(1, rect.h * scaleY);

    const crop = document.createElement("canvas");
    crop.width  = Math.round(sw);
    crop.height = Math.round(sh);
    const ctx = crop.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, crop.width, crop.height);
    crop.toBlob((blob) => { if (blob) onConfirm(blob); }, "image/png");
  };

  const hasValid = rect && rect.w >= MIN && rect.h >= MIN;
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
            disabled={!hasValid}
            className="h-8 bg-primary hover:bg-primary/90 disabled:opacity-40"
            onClick={handleConfirm}>
            <Check className="h-4 w-4 mr-1" /> Confirmar seleção
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
        {/* Imagem de fundo (canvas) */}
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain pointer-events-none"
        />

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

              {/* 8 alças de redimensionamento */}
              {HANDLE_DEFS.map(({ id, style, cursor }) => (
                <div
                  key={id}
                  className="absolute w-3.5 h-3.5 bg-white border-2 border-primary rounded-sm shadow-md z-10 hover:scale-125 transition-transform"
                  style={{ ...style, cursor }}
                  onMouseDown={(e) => onHandleDown(e, id)}
                />
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
