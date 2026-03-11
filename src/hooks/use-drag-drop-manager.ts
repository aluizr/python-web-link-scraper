import { useEffect, useRef, useState, useCallback } from "react";
import type { LinkItem, Category } from "@/types/link";

export interface DragDropState {
  draggedLink: LinkItem | null;
  dropZoneId: string | null; // ID do link/categoria onde será inserido
  dragPreviewPosition: { x: number; y: number };
  isDraggingOverCategory: boolean;
  dragDirection?: "above" | "below"; // Direção onde o link será inserido
}

export interface DragDropHistory {
  links: LinkItem[];
  timestamp: number;
}

/**
 * Hook aprimorado para Drag & Drop com:
 * - Histórico (Undo/Redo)
 * - Auto-scroll
 * - Drag entre categorias
 * - Drop zones visuais
 * - Suporte a teclado (Ctrl+Z, Ctrl+Y)
 */
export function useDragDropManager(initialLinks: LinkItem[], categories: Category[], onReorder?: (links: LinkItem[]) => void) {
  const [dragState, setDragState] = useState<DragDropState>({
    draggedLink: null,
    dropZoneId: null,
    dragPreviewPosition: { x: 0, y: 0 },
    isDraggingOverCategory: false,
    dragDirection: undefined,
  });

  const [history, setHistory] = useState<DragDropHistory[]>(() => [
    { links: initialLinks, timestamp: Date.now() }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const autoScrollRef = useRef<NodeJS.Timeout>();
  const dragImageRef = useRef<HTMLDivElement>(null);
  const lastLinksRef = useRef<LinkItem[]>(initialLinks);
  const lastDragOverRef = useRef<{ targetId: string | null; direction: "above" | "below" | undefined }>({
    targetId: null,
    direction: undefined,
  });
  // Guardar a última direção e target conhecidos para fallback no drop
  const lastKnownDropRef = useRef<{ targetId: string | null; direction: "above" | "below" | undefined }>({
    targetId: null,
    direction: undefined,
  });
  const dragLeaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Sincronizar histórico quando links mudam externamente (de use-links)
  useEffect(() => {
    // Se links mudaram e estamos no final do histórico
    if (historyIndex === history.length - 1) {
      const lastState = history[historyIndex];
      const linksChanged = 
        lastState?.links.length !== initialLinks.length ||
        lastState?.links.some((l, i) => l.id !== initialLinks[i]?.id);
      
      if (linksChanged) {
        setHistory((prev) => [
          ...prev,
          { links: initialLinks, timestamp: Date.now() }
        ]);
        setHistoryIndex((prev) => prev + 1);
      }
    }
    lastLinksRef.current = initialLinks;
  }, [initialLinks, historyIndex, history]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousIndex = historyIndex - 1;
      setHistoryIndex(previousIndex);
      const previousLinks = history[previousIndex].links;
      if (onReorder) {
        onReorder(previousLinks);
      }
    }
  }, [historyIndex, history, onReorder]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextLinks = history[nextIndex].links;
      if (onReorder) {
        onReorder(nextLinks);
      }
    }
  }, [historyIndex, history, onReorder]);

  // Compat helper for tests and callers that need deterministic in-memory reorder.
  const reorderLinks = useCallback((draggedId: string, targetId: string): LinkItem[] | null => {
    if (draggedId === targetId) return null;

    const sourceIndex = initialLinks.findIndex((link) => link.id === draggedId);
    const targetIndex = initialLinks.findIndex((link) => link.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return null;

    const reordered = [...initialLinks];
    const [movedLink] = reordered.splice(sourceIndex, 1);
    const insertionIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    reordered.splice(insertionIndex, 0, movedLink);

    return reordered.map((link, position) => ({
      ...link,
      position,
    }));
  }, [initialLinks]);

  // Auto-scroll ao arrastar perto das bordas
  const handleAutoScroll = useCallback((clientY: number) => {
    const scrollContainer = document.querySelector("main") || window;
    const container = scrollContainer === window ? document.documentElement : (scrollContainer as HTMLElement);
    
    const threshold = 100; // pixels from top/bottom
    const scrollSpeed = 5;

    if (clientY < threshold) {
      container.scrollTop -= scrollSpeed;
    } else if (clientY > window.innerHeight - threshold) {
      container.scrollTop += scrollSpeed;
    }
  }, []);

  // Drag start
  const handleDragStart = useCallback(
    (e: React.DragEvent, link: LinkItem) => {
      setDragState((prev) => ({
        ...prev,
        draggedLink: link,
      }));

      // Criar drag image customizado (respeita dark/light mode)
      const isDark = document.documentElement.classList.contains("dark");
      const dragPreview = document.createElement("div");
      dragPreview.style.position = "absolute";
      dragPreview.style.top = "-9999px";
      dragPreview.style.left = "-9999px";
      dragPreview.innerHTML = `
        <div style="
          background: ${isDark ? "hsl(222.2, 84%, 8%)" : "white"};
          border: 1px solid ${isDark ? "hsl(217.2, 32.6%, 25%)" : "hsl(214.3, 31.8%, 85%)"};
          border-radius: 10px;
          padding: 10px 14px;
          box-shadow: 0 8px 24px ${isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.15)"}, 
                      0 0 0 1px ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
          font-size: 13px;
          font-weight: 600;
          color: ${isDark ? "hsl(210, 40%, 92%)" : "#333"};
          max-width: 220px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transform: rotate(2deg);
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <span style="font-size: 16px;">🔗</span>
          <span>${link.title || link.url}</span>
        </div>
      `;
      document.body.appendChild(dragPreview);
      e.dataTransfer!.setDragImage(dragPreview, 110, 20);

      requestAnimationFrame(() => document.body.removeChild(dragPreview));

      e.dataTransfer!.effectAllowed = "move";
      e.dataTransfer!.setData("text/plain", link.id);
    },
    []
  );

  // Drag over - detecta direção do arrasto com cache
  const handleDragOver = useCallback(
    (e: React.DragEvent, targetId?: string, isCategory?: boolean) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = "move";

      // Calcular direção visual baseada na posição do mouse no card
      let dragDirection: "above" | "below" | undefined = undefined;
      const element = e.currentTarget as HTMLElement;
      if (element && targetId) {
        const rect = element.getBoundingClientRect();
        const relY = (e.clientY - rect.top) / rect.height; // 0 a 1
        // Direcao vertical deixa o drop mais previsivel em cards/list.
        dragDirection = relY < 0.5 ? "above" : "below";
      }

      // Comparar com os últimos valores - só atualizar se realmente mudou
      const lastOver = lastDragOverRef.current;
      const hasChanged = 
        lastOver.targetId !== targetId || 
        lastOver.direction !== dragDirection;

      if (hasChanged) {
        lastDragOverRef.current = { targetId: targetId || null, direction: dragDirection };
        // Salvar última posição válida para fallback
        if (targetId) {
          lastKnownDropRef.current = { targetId, direction: dragDirection };
        }
        // Cancelar qualquer dragLeave pendente
        if (dragLeaveTimeoutRef.current) {
          clearTimeout(dragLeaveTimeoutRef.current);
          dragLeaveTimeoutRef.current = undefined;
        }
        setDragState((prev) => ({
          ...prev,
          dropZoneId: targetId || null,
          isDraggingOverCategory: isCategory || false,
          dragDirection,
        }));
      }

      // Auto-scroll
      if (autoScrollRef.current) clearTimeout(autoScrollRef.current);
      autoScrollRef.current = setTimeout(() => {
        handleAutoScroll(e.clientY);
      }, 50);
    },
    [handleAutoScroll]
  );

  // Drag leave - debounced para evitar flicker ao transitar entre cards
  const handleDragLeave = useCallback(() => {
    if (dragLeaveTimeoutRef.current) {
      clearTimeout(dragLeaveTimeoutRef.current);
    }
    dragLeaveTimeoutRef.current = setTimeout(() => {
      lastDragOverRef.current = { targetId: null, direction: undefined };
      setDragState((prev) => ({
        ...prev,
        dropZoneId: null,
        isDraggingOverCategory: false,
        dragDirection: undefined,
      }));
    }, 50); // Pequeno delay para dar tempo do dragOver do próximo card disparar
  }, []);

  // Drag end
  const handleDragEnd = useCallback(() => {
    if (dragLeaveTimeoutRef.current) {
      clearTimeout(dragLeaveTimeoutRef.current);
      dragLeaveTimeoutRef.current = undefined;
    }
    lastDragOverRef.current = { targetId: null, direction: undefined };
    lastKnownDropRef.current = { targetId: null, direction: undefined };
    setDragState({
      draggedLink: null,
      dropZoneId: null,
      dragPreviewPosition: { x: 0, y: 0 },
      isDraggingOverCategory: false,
      dragDirection: undefined,
    });

    if (autoScrollRef.current) {
      clearTimeout(autoScrollRef.current);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z ou Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y, Ctrl+Shift+Z ou Cmd+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return {
    dragState,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    lastKnownDrop: lastKnownDropRef,
    reorderLinks,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    undo,
    redo,
  };
}
