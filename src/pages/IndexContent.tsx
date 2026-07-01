import { DragDropOverlay } from "@/components/DragDropOverlay";
import { MicrolinkRateLimitWarning } from "@/components/MicrolinkRateLimitWarning";
import { SearchBar } from "@/components/SearchBar";
import { useIndexPageController } from "./useIndexPageController";
import { IndexModeRenderer } from "./IndexModeRenderer";

type Controller = ReturnType<typeof useIndexPageController>;

interface IndexContentProps {
  controller: Controller;
}

export function IndexContent({ controller }: IndexContentProps) {
  const {
    isRateLimited,
    dismissRateLimit,
    timeRemaining,
    categories,
    allTags,
    searching,
    searchFilters,
    setSearchFilters,
    searchInputRef,
    canUndo,
    canRedo,
    undo,
    redo,
    dragState,
    showManualReorderHint,
  } = controller;

  return (
    <>
      <SearchBar ref={searchInputRef} filters={searchFilters} onFiltersChange={setSearchFilters} categories={categories} allTags={allTags} searching={searching} />

      {isRateLimited && <MicrolinkRateLimitWarning onDismiss={dismissRateLimit} timeRemaining={timeRemaining} />}

      {showManualReorderHint && (
        <div className="mt-3 rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Reordenacao manual ativa. Mostre pelo menos 2 links para arrastar e reordenar.
        </div>
      )}

      <IndexModeRenderer controller={controller} />

      <DragDropOverlay canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo} isDragging={dragState.draggedLink !== null} />
    </>
  );
}