import { useState, useRef, useCallback, useMemo, useEffect, type DragEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMicrolinkRateLimit } from "@/hooks/use-microlink-rate-limit";
import { useLinks } from "@/hooks/use-links";
import { useActivityLog } from "@/hooks/use-activity-log";
import { useDragDropManager } from "@/hooks/use-drag-drop-manager";
import { useLinkChecker } from "@/hooks/use-link-checker";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useThumbnailBatchFetch } from "@/hooks/use-thumbnail-batch-fetch";
import { buildDefaultCommands } from "@/components/CommandPalette";
import type { GridColumns, CardSize } from "@/components/ViewSwitcher";
import type { LinkItem, ViewMode } from "@/types/link";

interface UseIndexPageControllerArgs {
  user: User;
  onSignOut: () => void;
}

export function useIndexPageController({ user, onSignOut }: UseIndexPageControllerArgs) {
  const isMobile = useIsMobile();
  const { isRateLimited, dismiss: dismissRateLimit, timeRemaining } = useMicrolinkRateLimit();
  const {
    links,
    categories,
    allTags,
    searching,
    searchFilters,
    setSearchFilters,
    getFilteredLinks,
    addLink,
    updateLink,
    deleteLink,
    restoreLink,
    permanentDeleteLink,
    emptyTrash,
    trashedLinks,
    toggleFavorite,
    addCategory,
    deleteCategory,
    renameCategory,
    reorderLinks,
    reorderLinksInStatus,
    reorderCategories,
    updateCategoryColor,
    updateCategoryIcon,
  } = useLinks(user.id);

  const { startBatchThumbnailFetch } = useThumbnailBatchFetch();
  const {
    dragState,
    canUndo,
    canRedo,
    lastKnownDrop,
    handleDragStart: dragStart,
    handleDragOver: dragOver,
    handleDragLeave: dragLeave,
    handleDragEnd: dragEnd,
    undo,
    redo,
  } = useDragDropManager(links, categories);

  const { entries: activityEntries, logActivity, clearLog } = useActivityLog();
  const {
    results: linkCheckResults,
    checking: linkChecking,
    progress: linkCheckProgress,
    checkLinks,
    cancelCheck: cancelLinkCheck,
    clearResults: clearLinkCheckResults,
  } = useLinkChecker();

  const [formOpen, setFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "list";
    const saved = window.localStorage.getItem("view-mode");
    const modes: ViewMode[] = ["grid", "list", "cards", "table", "board", "gallery"];
    return modes.includes(saved as ViewMode) ? (saved as ViewMode) : "list";
  });
  const [gridColumns, setGridColumns] = useState<GridColumns>(3);
  const [cardSize, setCardSize] = useState<CardSize>("md");
  const [statsOpen, setStatsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [linkCheckerOpen, setLinkCheckerOpen] = useState(false);
  const [notionSettingsOpen, setNotionSettingsOpen] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastSelectedRef = useRef<string | null>(null);

  const filteredLinks = getFilteredLinks();
  const isDragView = viewMode === "grid" || viewMode === "list" || viewMode === "cards";
  const canManualDrag = searchFilters.sort === "manual" && isDragView;
  const showManualReorderHint = searchFilters.sort === "manual" && isDragView && filteredLinks.length < 2;

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("view-mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== "cards") return;
    if (searchFilters.sort === "manual") return;
    setSearchFilters((prev) => ({ ...prev, sort: "manual" }));
  }, [viewMode, searchFilters.sort, setSearchFilters]);

  const openNewLinkForm = useCallback(() => {
    setEditingLink(null);
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (data: Omit<LinkItem, "id" | "createdAt" | "position">) => {
      if (editingLink) {
        updateLink(editingLink.id, data);
        logActivity("link:updated", data.title || data.url, `URL: ${data.url}`);
      } else {
        addLink(data);
        logActivity("link:created", data.title || data.url, `URL: ${data.url}`);
      }
      setEditingLink(null);
    },
    [addLink, editingLink, logActivity, updateLink]
  );

  const handleEdit = useCallback((link: LinkItem) => {
    setEditingLink(link);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const link = links.find((l) => l.id === id);
      deleteLink(id);
      logActivity("link:trashed", link?.title || "Link removido", link?.url);
    },
    [deleteLink, links, logActivity]
  );

  const handleToggleFavorite = useCallback(
    (id: string) => {
      const link = links.find((l) => l.id === id);
      toggleFavorite(id);
      if (link) {
        logActivity(link.isFavorite ? "link:unfavorited" : "link:favorited", link.title || link.url);
      }
    },
    [links, logActivity, toggleFavorite]
  );

  const handleToggleSelect = useCallback(
    (id: string, shiftKey?: boolean) => {
      if (shiftKey && lastSelectedRef.current && lastSelectedRef.current !== id) {
        const startIdx = filteredLinks.findIndex((l) => l.id === lastSelectedRef.current);
        const endIdx = filteredLinks.findIndex((l) => l.id === id);
        if (startIdx !== -1 && endIdx !== -1) {
          const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
          setSelectedIds((prev) => {
            const next = new Set(prev);
            for (let i = from; i <= to; i++) next.add(filteredLinks[i].id);
            return next;
          });
          lastSelectedRef.current = id;
          return;
        }
      }

      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      lastSelectedRef.current = id;
    },
    [filteredLinks]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
    lastSelectedRef.current = null;
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(filteredLinks.map((l) => l.id)));
  }, [filteredLinks]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedIds.size > 0) {
        e.preventDefault();
        handleClearSelection();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClearSelection, selectedIds.size]);

  const clearSelectionAndToast = useCallback((message: string) => {
    setSelectedIds(new Set());
    toast.success(message);
  }, []);

  const handleBatchDelete = useCallback(() => {
    const count = selectedIds.size;
    selectedIds.forEach((id) => deleteLink(id));
    logActivity("link:trashed", `${count} links movidos para lixeira`);
    clearSelectionAndToast(`${count} link(s) movido(s) para a lixeira`);
  }, [clearSelectionAndToast, deleteLink, logActivity, selectedIds]);

  const handleBatchFavorite = useCallback(() => {
    let count = 0;
    selectedIds.forEach((id) => {
      const link = links.find((l) => l.id === id);
      if (link && !link.isFavorite) {
        toggleFavorite(id);
        count++;
      }
    });
    clearSelectionAndToast(`${count} link(s) favoritado(s)`);
  }, [clearSelectionAndToast, links, selectedIds, toggleFavorite]);

  const handleBatchUnfavorite = useCallback(() => {
    let count = 0;
    selectedIds.forEach((id) => {
      const link = links.find((l) => l.id === id);
      if (link && link.isFavorite) {
        toggleFavorite(id);
        count++;
      }
    });
    clearSelectionAndToast(`${count} link(s) desfavoritado(s)`);
  }, [clearSelectionAndToast, links, selectedIds, toggleFavorite]);

  const handleBatchMove = useCallback(
    (categoryName: string) => {
      const count = selectedIds.size;
      selectedIds.forEach((id) => updateLink(id, { category: categoryName }));
      logActivity("link:updated", `${count} links movidos`, `Para: ${categoryName || "Sem categoria"}`);
      clearSelectionAndToast(`${count} link(s) movido(s) para "${categoryName || "Sem categoria"}"`);
    },
    [clearSelectionAndToast, logActivity, selectedIds, updateLink]
  );

  const handleBatchStatus = useCallback(
    (status: LinkItem["status"]) => {
      const count = selectedIds.size;
      selectedIds.forEach((id) => updateLink(id, { status }));
      logActivity("link:updated", `${count} links com status atualizado`, `Status: ${status}`);
      clearSelectionAndToast(`Status atualizado para ${count} link(s)`);
    },
    [clearSelectionAndToast, logActivity, selectedIds, updateLink]
  );

  const handleBatchPriority = useCallback(
    (priority: LinkItem["priority"]) => {
      const count = selectedIds.size;
      selectedIds.forEach((id) => updateLink(id, { priority }));
      logActivity("link:updated", `${count} links com prioridade atualizada`, `Prioridade: ${priority}`);
      clearSelectionAndToast(`Prioridade atualizada para ${count} link(s)`);
    },
    [clearSelectionAndToast, logActivity, selectedIds, updateLink]
  );

  const handleMoveToStatus = useCallback(
    (id: string, status: LinkItem["status"]) => {
      const link = links.find((l) => l.id === id);
      if (!link) return;

      const nextPositionInStatus =
        Math.max(
          ...links
            .filter((l) => l.status === status)
            .map((l) => l.positionInStatus ?? l.position ?? 0),
          -1
        ) + 1;

      reorderLinksInStatus([
        {
          id,
          status,
          positionInStatus: nextPositionInStatus,
        },
      ]);
      logActivity("link:updated", link.title || "Link", `Status alterado para ${status}`);
      toast.success(`Status atualizado para ${status === "backlog" ? "Backlog" : status === "in_progress" ? "Em progresso" : "Concluído"}`);
    },
    [links, logActivity, reorderLinksInStatus]
  );

  const handleReorderWithinStatus = useCallback(
    (draggedId: string, targetId: string) => {
      if (draggedId === targetId) return;

      const draggedLink = links.find((l) => l.id === draggedId);
      const targetLink = links.find((l) => l.id === targetId);
      if (!draggedLink || !targetLink || draggedLink.status !== targetLink.status) return;

      const statusGroup = links
        .filter((l) => l.status === draggedLink.status)
        .sort((a, b) => (a.positionInStatus ?? a.position ?? 0) - (b.positionInStatus ?? b.position ?? 0));

      const draggedIndex = statusGroup.findIndex((l) => l.id === draggedId);
      const targetIndex = statusGroup.findIndex((l) => l.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return;

      const next = statusGroup.filter((l) => l.id !== draggedId);
      next.splice(targetIndex, 0, draggedLink);

      const updates = next.map((link, index) => ({
        id: link.id,
        status: link.status,
        positionInStatus: index,
      }));

      reorderLinksInStatus(updates);
      logActivity("link:reordered", "Links reordenados no board", `Status: ${draggedLink.status}`);
    },
    [links, logActivity, reorderLinksInStatus]
  );

  const handleBatchTag = useCallback(
    (tag: string) => {
      let count = 0;
      selectedIds.forEach((id) => {
        const link = links.find((l) => l.id === id);
        if (link && !link.tags.includes(tag)) {
          updateLink(id, { tags: [...link.tags, tag] });
          count++;
        }
      });
      logActivity("link:updated", `Tag "${tag}" adicionada a ${count} links`);
      toast.success(`Tag "${tag}" adicionada a ${count} link(s)`);
    },
    [links, logActivity, selectedIds, updateLink]
  );

  const handleBatchRemoveTag = useCallback(
    (tag: string) => {
      let count = 0;
      selectedIds.forEach((id) => {
        const link = links.find((l) => l.id === id);
        if (link && link.tags.includes(tag)) {
          updateLink(id, { tags: link.tags.filter((t) => t !== tag) });
          count++;
        }
      });
      logActivity("link:updated", `Tag "${tag}" removida de ${count} links`);
      toast.success(`Tag "${tag}" removida de ${count} link(s)`);
    },
    [links, logActivity, selectedIds, updateLink]
  );

  const commands = useMemo(
    () =>
      buildDefaultCommands({
        onNewLink: openNewLinkForm,
        onFocusSearch: () => searchInputRef.current?.focus(),
        onSetView: setViewMode,
        onOpenStats: () => setStatsOpen(true),
        onOpenExport: () => setExportOpen(true),
        onOpenImport: () => setImportOpen(true),
        onOpenHistory: () => setHistoryOpen(true),
        onToggleFavorites: () =>
          setSearchFilters((prev) => ({
            ...prev,
            favoritesOnly: !prev.favoritesOnly,
            category: null,
            tags: [],
          })),
        onSignOut,
      }),
    [onSignOut, openNewLinkForm, setSearchFilters]
  );

  useKeyboardShortcuts({
    onNewLink: openNewLinkForm,
    onFocusSearch: () => searchInputRef.current?.focus(),
    onToggleView: () =>
      setViewMode((v) => {
        const modes: ViewMode[] = ["grid", "list", "cards", "table", "board", "gallery"];
        const i = modes.indexOf(v);
        return modes[(i + 1) % modes.length];
      }),
    onOpenStats: () => setStatsOpen(true),
    onOpenExport: () => setExportOpen(true),
    onOpenImport: () => setImportOpen(true),
    onOpenCommandPalette: () => setCommandOpen(true),
  });

  const handleDragStart = useCallback(
    (e: DragEvent, link: LinkItem) => {
      if (!canManualDrag) {
        toast.error("Ative 'Manual' para reordenar links");
        e.preventDefault();
        return;
      }
      if (filteredLinks.length < 2) {
        toast.info("Mostre pelo menos 2 links para reordenar");
        e.preventDefault();
        return;
      }
      dragStart(e, link);
    },
    [canManualDrag, dragStart, filteredLinks.length]
  );

  const handleDragOver = useCallback(
    (e: DragEvent, linkId: string) => {
      if (!canManualDrag) return;
      dragOver(e, linkId);
    },
    [canManualDrag, dragOver]
  );

  const handleDrop = useCallback(
    (e: DragEvent, targetLink: LinkItem) => {
      if (!canManualDrag) {
        toast.error("Ative 'Manual' para reordenar links");
        return;
      }

      const dragId = dragState.draggedLink?.id || e.dataTransfer.getData("text/plain");
      const eventTargetId = (e.currentTarget as HTMLElement | null)?.dataset?.cardId;
      const trackedTargetId = lastKnownDrop.current.targetId;
      const resolvedTargetId =
        (eventTargetId && eventTargetId !== dragId ? eventTargetId : null) ||
        (trackedTargetId && trackedTargetId !== dragId ? trackedTargetId : null) ||
        targetLink.id;

      if (!dragId || dragId === resolvedTargetId) {
        dragEnd();
        return;
      }

      const ordered = [...links].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      const dragIndex = ordered.findIndex((item) => item.id === dragId);
      const targetIndex = ordered.findIndex((item) => item.id === resolvedTargetId);

      if (dragIndex === -1 || targetIndex === -1 || dragIndex === targetIndex) {
        dragEnd();
        return;
      }

      const dragged = ordered[dragIndex];
      const withoutDragged = ordered.filter((item) => item.id !== dragId);
      const targetIndexAfterRemoval = withoutDragged.findIndex((item) => item.id === resolvedTargetId);

      const insertIndex =
        dragIndex < targetIndex
          ? Math.min(withoutDragged.length, targetIndexAfterRemoval + 1)
          : Math.max(0, targetIndexAfterRemoval);

      withoutDragged.splice(insertIndex, 0, dragged);

      const reordered = withoutDragged.map((item, index) => ({
        ...item,
        position: index,
      }));

      reorderLinks(reordered);
      logActivity("link:reordered", "Links reordenados", `${reordered.length} links`);
      toast.success("Links reordenados!");
      dragEnd();
    },
    [canManualDrag, dragEnd, dragState.draggedLink?.id, lastKnownDrop, links, logActivity, reorderLinks]
  );

  const handleImportLinks = useCallback(
    async (importedLinks: Omit<LinkItem, "id" | "createdAt" | "position">[]) => {
      const MAX_LINKS_PER_IMPORT = 1000;
      if (importedLinks.length > MAX_LINKS_PER_IMPORT) {
        toast.error(`Máximo de ${MAX_LINKS_PER_IMPORT} links por importação (seu arquivo tem ${importedLinks.length})`);
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      const urlsBefore = new Set(links.map((l) => l.url));

      for (let index = 0; index < importedLinks.length; index++) {
        const linkData = importedLinks[index];
        try {
          await addLink(linkData);
          successCount++;
        } catch {
          errorCount++;
          errors.push(`Link ${index + 1}: Erro ao adicionar link`);
        }
      }

      if (successCount > 0) {
        toast.success(`✅ ${successCount} link(s) importado(s) com sucesso!`);
        logActivity("import:completed", `${successCount} links importados`, errorCount > 0 ? `${errorCount} falharam` : undefined);
      }
      if (errorCount > 0) {
        toast.error(`⚠️ ${errorCount} erro(s) encontrado(s)`);
        if (errors.length <= 5) {
          console.error("Erros de importação:", errors.join("\n"));
        }
      }

      if (successCount > 0) {
        setTimeout(() => {
          const needsThumbs = importedLinks.filter((l) => !l.ogImage && !urlsBefore.has(l.url));

          if (needsThumbs.length === 0) return;

          setTimeout(() => {
            const newUrlSet = new Set(needsThumbs.map((l) => l.url));
            const pending = links
              .filter((l) => newUrlSet.has(l.url) && !l.ogImage)
              .map((l) => ({ id: l.id, url: l.url }));

            if (pending.length > 0) {
              startBatchThumbnailFetch(pending, (id, data) => updateLink(id, data));
            }
          }, 1500);
        }, 200);
      }
    },
    [addLink, links, logActivity, startBatchThumbnailFetch, updateLink]
  );

  const handleSidebarFilter = useCallback(
    (filter: { type: "all" | "favorites" | "category" | "tag"; value?: string }) => {
      setSearchFilters((prev) => {
        switch (filter.type) {
          case "all":
            return { ...prev, category: null, tags: [], favoritesOnly: false };
          case "favorites":
            return { ...prev, category: null, tags: [], favoritesOnly: true };
          case "category":
            return { ...prev, category: filter.value ?? null, tags: [], favoritesOnly: false };
          case "tag":
            return {
              ...prev,
              category: null,
              favoritesOnly: false,
              tags: filter.value ? [filter.value] : [],
            };
          default:
            return prev;
        }
      });
    },
    [setSearchFilters]
  );

  const activeFilter = searchFilters.favoritesOnly
    ? { type: "favorites" as const }
    : searchFilters.category
      ? { type: "category" as const, value: searchFilters.category }
      : searchFilters.tags.length === 1
        ? { type: "tag" as const, value: searchFilters.tags[0] }
        : { type: "all" as const };

  const filterLabel = searchFilters.query
    ? `Resultados para "${searchFilters.query}"`
    : searchFilters.category
      ? searchFilters.category
      : searchFilters.favoritesOnly
        ? "Favoritos"
        : "Todos os Links";

  const selectedTags = useMemo(() => {
    const tagSet = new Set<string>();
    selectedIds.forEach((id) => {
      const link = links.find((l) => l.id === id);
      link?.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [links, selectedIds]);

  return {
    isMobile,
    isRateLimited,
    dismissRateLimit,
    timeRemaining,
    links,
    categories,
    allTags,
    searching,
    searchFilters,
    setSearchFilters,
    filteredLinks,
    viewMode,
    setViewMode,
    gridColumns,
    setGridColumns,
    cardSize,
    setCardSize,
    statsOpen,
    setStatsOpen,
    exportOpen,
    setExportOpen,
    importOpen,
    setImportOpen,
    historyOpen,
    setHistoryOpen,
    commandOpen,
    setCommandOpen,
    trashOpen,
    setTrashOpen,
    linkCheckerOpen,
    setLinkCheckerOpen,
    notionSettingsOpen,
    setNotionSettingsOpen,
    diagnosticsOpen,
    setDiagnosticsOpen,
    selectedIds,
    selectedTags,
    searchInputRef,
    dragState,
    canUndo,
    canRedo,
    undo,
    redo,
    linkCheckResults,
    linkChecking,
    linkCheckProgress,
    checkLinks,
    cancelLinkCheck,
    clearLinkCheckResults,
    activityEntries,
    clearLog,
    trashedLinks,
    canManualDrag,
    showManualReorderHint,
    activeFilter,
    filterLabel,
    commands,
    formOpen,
    setFormOpen,
    editingLink,
    setEditingLink,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleToggleFavorite,
    handleToggleSelect,
    handleClearSelection,
    handleSelectAll,
    handleBatchDelete,
    handleBatchFavorite,
    handleBatchUnfavorite,
    handleBatchMove,
    handleBatchStatus,
    handleBatchPriority,
    handleBatchTag,
    handleBatchRemoveTag,
    handleMoveToStatus,
    handleReorderWithinStatus,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleImportLinks,
    handleSidebarFilter,
    openNewLinkForm,
    restoreLink,
    permanentDeleteLink,
    emptyTrash,
    updateLink,
    logActivity,
    onSignOut,
    addCategory,
    deleteCategory,
    renameCategory,
    reorderCategories,
    updateCategoryColor,
    updateCategoryIcon,
    dragLeave,
    dragEnd,
  };
}