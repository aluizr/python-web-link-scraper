import { lazy, Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { LinkCard } from "@/components/LinkCard";
import { LinkNotionView } from "@/components/LinkNotionView";
import { useIndexPageController } from "./useIndexPageController";

const LinkTableView = lazy(() => import("@/components/LinkTableView").then((m) => ({ default: m.LinkTableView })));
const LinkBoardView = lazy(() => import("@/components/LinkBoardView").then((m) => ({ default: m.LinkBoardView })));
const LinkCardsView = lazy(() => import("@/components/LinkCardsView").then((m) => ({ default: m.LinkCardsView })));
const LinkGalleryView = lazy(() => import("@/components/LinkGalleryView").then((m) => ({ default: m.LinkGalleryView })));

type Controller = ReturnType<typeof useIndexPageController>;

interface IndexModeRendererProps {
  controller: Controller;
}

function IndexEmptyState({ onAddLink, isEmpty }: { onAddLink: () => void; isEmpty: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-lg text-muted-foreground">
        {isEmpty ? "Nenhum link salvo ainda. Adicione o primeiro!" : "Nenhum link encontrado para este filtro."}
      </p>
      {isEmpty && (
        <Button className="mt-4" onClick={onAddLink}>
          <Plus className="mr-1.5 h-4 w-4" />
          Adicionar Link
        </Button>
      )}
    </div>
  );
}

function IndexGridView({
  links,
  categories,
  gridColumns,
  selectedIds,
  canManualDrag,
  dragState,
  handleToggleFavorite,
  handleEdit,
  handleDelete,
  handleToggleSelect,
  handleDragStart,
  handleDragOver,
  handleDrop,
  dragLeave,
  dragEnd,
  linkCheckResults,
}: Pick<Controller,
  | "links"
  | "categories"
  | "gridColumns"
  | "selectedIds"
  | "canManualDrag"
  | "dragState"
  | "handleToggleFavorite"
  | "handleEdit"
  | "handleDelete"
  | "handleToggleSelect"
  | "handleDragStart"
  | "handleDragOver"
  | "handleDrop"
  | "dragLeave"
  | "dragEnd"
  | "linkCheckResults"
>) {
  return (
    <div className={
      gridColumns === 1 ? "flex flex-col gap-2 md:gap-3" :
      `grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 ${
        gridColumns === 2 ? "lg:grid-cols-2" :
        gridColumns === 4 ? "lg:grid-cols-4" :
        gridColumns === 5 ? "lg:grid-cols-4 xl:grid-cols-5" :
        "lg:grid-cols-3"
      }`
    }>
      {links.map((link) => (
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
  );
}

function IndexCardsMode(props: Pick<Controller, "filteredLinks" | "cardSize" | "handleToggleFavorite" | "handleEdit" | "handleDelete" | "canManualDrag" | "handleDragStart" | "handleDragOver" | "dragLeave" | "dragEnd" | "handleDrop" | "dragState" | "selectedIds" | "handleToggleSelect">) {
  const {
    filteredLinks,
    cardSize,
    handleToggleFavorite,
    handleEdit,
    handleDelete,
    canManualDrag,
    handleDragStart,
    handleDragOver,
    dragLeave,
    dragEnd,
    handleDrop,
    dragState,
    selectedIds,
    handleToggleSelect,
  } = props;

  return (
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
  );
}

function IndexTableMode(props: Pick<Controller, "filteredLinks" | "handleToggleFavorite" | "handleEdit" | "handleDelete" | "selectedIds" | "handleToggleSelect" | "handleSelectAll" | "updateLink">) {
  const { filteredLinks, handleToggleFavorite, handleEdit, handleDelete, selectedIds, handleToggleSelect, handleSelectAll, updateLink } = props;
  return <LinkTableView links={filteredLinks} onToggleFavorite={handleToggleFavorite} onUpdateLink={updateLink} onEdit={handleEdit} onDelete={handleDelete} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} onSelectAll={handleSelectAll} />;
}

function IndexListMode(props: Pick<Controller, "filteredLinks" | "handleToggleFavorite" | "handleEdit" | "handleDelete" | "canManualDrag" | "handleDragStart" | "handleDragOver" | "dragLeave" | "dragEnd" | "handleDrop" | "dragState" | "selectedIds" | "handleToggleSelect" | "linkCheckResults">) {
  const { filteredLinks, handleToggleFavorite, handleEdit, handleDelete, canManualDrag, handleDragStart, handleDragOver, dragLeave, dragEnd, handleDrop, dragState, selectedIds, handleToggleSelect, linkCheckResults } = props;
  return (
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
  );
}

function IndexBoardMode(props: Pick<Controller, "filteredLinks" | "handleToggleFavorite" | "handleEdit" | "handleDelete" | "handleMoveToStatus" | "handleReorderWithinStatus" | "selectedIds" | "handleToggleSelect" | "updateLink">) {
  const { filteredLinks, handleToggleFavorite, handleEdit, handleDelete, handleMoveToStatus, handleReorderWithinStatus, selectedIds, handleToggleSelect, updateLink } = props;
  return <LinkBoardView links={filteredLinks} onToggleFavorite={handleToggleFavorite} onUpdateLink={updateLink} onEdit={handleEdit} onDelete={handleDelete} onMoveToStatus={handleMoveToStatus} onReorderWithinStatus={handleReorderWithinStatus} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} />;
}

function IndexGalleryMode(props: Pick<Controller, "filteredLinks" | "categories" | "handleToggleFavorite" | "handleEdit" | "handleDelete" | "selectedIds" | "handleToggleSelect">) {
  const { filteredLinks, categories, handleToggleFavorite, handleEdit, handleDelete, selectedIds, handleToggleSelect } = props;
  return <LinkGalleryView links={filteredLinks} categories={categories} onToggleFavorite={handleToggleFavorite} onEdit={handleEdit} onDelete={handleDelete} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} />;
}

export function IndexModeRenderer({ controller }: IndexModeRendererProps) {
  const {
    links,
    categories,
    filteredLinks,
    viewMode,
    gridColumns,
    cardSize,
    selectedIds,
    dragState,
    canManualDrag,
    linkCheckResults,
    handleToggleFavorite,
    handleEdit,
    handleDelete,
    handleToggleSelect,
    handleSelectAll,
    handleMoveToStatus,
    handleReorderWithinStatus,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleSidebarFilter,
    openNewLinkForm,
    updateLink,
    dragLeave,
    dragEnd,
  } = controller;

  const isEmpty = links.length === 0;

  return (
    <>
      <BreadcrumbNav categoryFilter={controller.searchFilters.category} categories={categories} onNavigate={(cat) => handleSidebarFilter({ type: cat ? "category" : "all", value: cat ?? undefined })} />

      <div className={viewMode === "list" ? "mt-4" : "mt-6"}>
        <Suspense fallback={<div className="py-6 text-sm text-muted-foreground">Carregando visualizacao...</div>}>
          {filteredLinks.length === 0 ? (
            <IndexEmptyState onAddLink={openNewLinkForm} isEmpty={isEmpty} />
          ) : viewMode === "cards" ? (
            <IndexCardsMode
              filteredLinks={filteredLinks}
              cardSize={cardSize}
              handleToggleFavorite={handleToggleFavorite}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              canManualDrag={canManualDrag}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              dragLeave={dragLeave}
              dragEnd={dragEnd}
              handleDrop={handleDrop}
              dragState={dragState}
              selectedIds={selectedIds}
              handleToggleSelect={handleToggleSelect}
            />
          ) : viewMode === "table" ? (
            <IndexTableMode filteredLinks={filteredLinks} handleToggleFavorite={handleToggleFavorite} handleEdit={handleEdit} handleDelete={handleDelete} selectedIds={selectedIds} handleToggleSelect={handleToggleSelect} handleSelectAll={handleSelectAll} updateLink={updateLink} />
          ) : viewMode === "list" ? (
            <IndexListMode filteredLinks={filteredLinks} handleToggleFavorite={handleToggleFavorite} handleEdit={handleEdit} handleDelete={handleDelete} canManualDrag={canManualDrag} handleDragStart={handleDragStart} handleDragOver={handleDragOver} dragLeave={dragLeave} dragEnd={dragEnd} handleDrop={handleDrop} dragState={dragState} selectedIds={selectedIds} handleToggleSelect={handleToggleSelect} linkCheckResults={linkCheckResults} />
          ) : viewMode === "board" ? (
            <IndexBoardMode filteredLinks={filteredLinks} handleToggleFavorite={handleToggleFavorite} handleEdit={handleEdit} handleDelete={handleDelete} handleMoveToStatus={handleMoveToStatus} handleReorderWithinStatus={handleReorderWithinStatus} selectedIds={selectedIds} handleToggleSelect={handleToggleSelect} updateLink={updateLink} />
          ) : viewMode === "gallery" ? (
            <IndexGalleryMode filteredLinks={filteredLinks} categories={categories} handleToggleFavorite={handleToggleFavorite} handleEdit={handleEdit} handleDelete={handleDelete} selectedIds={selectedIds} handleToggleSelect={handleToggleSelect} />
          ) : (
            <IndexGridView
              links={filteredLinks}
              categories={categories}
              gridColumns={gridColumns}
              selectedIds={selectedIds}
              canManualDrag={canManualDrag}
              dragState={dragState}
              handleToggleFavorite={handleToggleFavorite}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleToggleSelect={handleToggleSelect}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              dragLeave={dragLeave}
              dragEnd={dragEnd}
              linkCheckResults={linkCheckResults}
            />
          )}
        </Suspense>
      </div>
    </>
  );
}