import { lazy, Suspense } from "react";
import { MicrolinkRateLimitWarning } from "@/components/MicrolinkRateLimitWarning";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LinkCard } from "@/components/LinkCard";
import { LinkNotionView } from "@/components/LinkNotionView";
import { SearchBar } from "@/components/SearchBar";
import { DragDropOverlay } from "@/components/DragDropOverlay";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { useIndexPageController } from "./useIndexPageController";
const LinkTableView = lazy(() => import("@/components/LinkTableView").then((m) => ({ default: m.LinkTableView })));
const LinkBoardView = lazy(() => import("@/components/LinkBoardView").then((m) => ({ default: m.LinkBoardView })));
const LinkCardsView = lazy(() => import("@/components/LinkCardsView").then((m) => ({ default: m.LinkCardsView })));
const LinkGalleryView = lazy(() => import("@/components/LinkGalleryView").then((m) => ({ default: m.LinkGalleryView })));
import { IndexHeader } from "./IndexHeader";
import { IndexDialogs } from "./IndexDialogs";

type Controller = ReturnType<typeof useIndexPageController>;

interface IndexViewProps {
  controller: Controller;
}

export function IndexView({ controller }: IndexViewProps) {
  const {
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
    handleToggleSelect,
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
    handleSidebarFilter,
    openNewLinkForm,
    updateLink,
    logActivity,
    addCategory,
    deleteCategory,
    renameCategory,
    reorderCategories,
    updateCategoryColor,
    updateCategoryIcon,
    dragLeave,
    dragEnd,
  } = controller;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          categories={categories}
          allTags={allTags}
          activeFilter={activeFilter}
          onFilterChange={handleSidebarFilter}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
          onRenameCategory={renameCategory}
          onReorderCategories={reorderCategories}
          onUpdateCategoryColor={updateCategoryColor}
          onUpdateCategoryIcon={updateCategoryIcon}
          onDropLinkToCategory={(linkId, categoryName) => {
            updateLink(linkId, { category: categoryName });
            const link = links.find((l) => l.id === linkId);
            logActivity("link:updated", link?.title || "Link", `Movido para "${categoryName}"`);
            toast.success(`Link movido para "${categoryName}"`);
            dragEnd();
          }}
        />

        <main className="flex-1 p-3 md:p-6">
          <IndexHeader controller={controller} />

          <SearchBar ref={searchInputRef} filters={searchFilters} onFiltersChange={setSearchFilters} categories={categories} allTags={allTags} searching={searching} />

          <BreadcrumbNav
            categoryFilter={searchFilters.category}
            categories={categories}
            onNavigate={(cat) => handleSidebarFilter({ type: cat ? "category" : "all", value: cat ?? undefined })}
          />

          {isRateLimited && <MicrolinkRateLimitWarning onDismiss={dismissRateLimit} timeRemaining={timeRemaining} />}

          {showManualReorderHint && (
            <div className="mt-3 rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Reordenacao manual ativa. Mostre pelo menos 2 links para arrastar e reordenar.
            </div>
          )}

          <div className={viewMode === "list" ? "mt-4" : "mt-6"}>
            <Suspense fallback={<div className="py-6 text-sm text-muted-foreground">Carregando visualizacao...</div>}>
              {filteredLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-lg text-muted-foreground">
                    {links.length === 0 ? "Nenhum link salvo ainda. Adicione o primeiro!" : "Nenhum link encontrado para este filtro."}
                  </p>
                  {links.length === 0 && (
                    <Button className="mt-4" onClick={openNewLinkForm}>
                      <Plus className="mr-1.5 h-4 w-4" />
                      Adicionar Link
                    </Button>
                  )}
                </div>
              ) : viewMode === "cards" ? (
                <LinkCardsView
                  links={filteredLinks}
                  cardSize={cardSize}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDragStart={canManualDrag ? handleDragStart : undefined}
                  onDragOver={canManualDrag ? handleDragOver : undefined}
                  onDragLeave={canManualDrag ? dragLeave : undefined}
                  onDragEnd={canManualDrag ? dragEnd : undefined}
                  onDrop={canManualDrag ? handleDrop : undefined}
                  draggedLinkId={dragState.draggedLink?.id ?? null}
                  dropZoneId={dragState.dropZoneId}
                  dragDirection={dragState.dragDirection}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                />
              ) : viewMode === "table" ? (
                <LinkTableView links={filteredLinks} onToggleFavorite={handleToggleFavorite} onUpdateLink={updateLink} onEdit={handleEdit} onDelete={handleDelete} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} onSelectAll={handleSelectAll} />
              ) : viewMode === "list" ? (
                <LinkNotionView
                  links={filteredLinks}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDragStart={canManualDrag ? handleDragStart : undefined}
                  onDragOver={canManualDrag ? handleDragOver : undefined}
                  onDragLeave={canManualDrag ? dragLeave : undefined}
                  onDragEnd={canManualDrag ? dragEnd : undefined}
                  onDrop={canManualDrag ? handleDrop : undefined}
                  draggedLinkId={dragState.draggedLink?.id ?? null}
                  dropZoneId={dragState.dropZoneId}
                  dragDirection={dragState.dragDirection}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  linkStatusById={linkCheckResults}
                />
              ) : viewMode === "board" ? (
                <LinkBoardView links={filteredLinks} onToggleFavorite={handleToggleFavorite} onUpdateLink={updateLink} onEdit={handleEdit} onDelete={handleDelete} onMoveToStatus={handleMoveToStatus} onReorderWithinStatus={handleReorderWithinStatus} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} />
              ) : viewMode === "gallery" ? (
                <LinkGalleryView links={filteredLinks} categories={categories} onToggleFavorite={handleToggleFavorite} onEdit={handleEdit} onDelete={handleDelete} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} />
              ) : (
                <div className={viewMode === "grid" ? `grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 ${gridColumns === 2 ? "lg:grid-cols-2" : gridColumns === 4 ? "lg:grid-cols-4" : gridColumns === 5 ? "lg:grid-cols-4 xl:grid-cols-5" : "lg:grid-cols-3"}` : "flex flex-col gap-2 md:gap-3"}>
                  {filteredLinks.map((link) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      categories={categories}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onDragStart={canManualDrag ? handleDragStart : undefined}
                      onDragOver={canManualDrag ? handleDragOver : undefined}
                      onDragLeave={canManualDrag ? dragLeave : undefined}
                      onDragEnd={canManualDrag ? dragEnd : undefined}
                      onDrop={canManualDrag ? handleDrop : undefined}
                      isDragging={dragState.draggedLink?.id === link.id}
                      isDropZone={dragState.dropZoneId === link.id && dragState.draggedLink !== null}
                      dragDirection={dragState.dragDirection}
                      isSelected={selectedIds.has(link.id)}
                      onToggleSelect={handleToggleSelect}
                      linkStatus={linkCheckResults[link.id]?.status}
                    />
                  ))}
                </div>
              )}
            </Suspense>
          </div>
        </main>

        <DragDropOverlay canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo} isDragging={dragState.draggedLink !== null} />
      </div>

      <IndexDialogs controller={controller} />
    </SidebarProvider>
  );
}