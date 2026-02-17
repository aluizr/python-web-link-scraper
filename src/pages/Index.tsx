import { useState, useRef, useCallback } from "react";
import { Plus, LayoutGrid, List, Download, Upload, LogOut, BarChart3 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LinkCard } from "@/components/LinkCard";
import { LinkForm } from "@/components/LinkForm";
import { SearchBar } from "@/components/SearchBar";
import { DragDropOverlay } from "@/components/DragDropOverlay";
import { StatsDashboard } from "@/components/StatsDashboard";
import { ExportFormatDialog } from "@/components/ExportFormatDialog";
import { ImportFormatDialog } from "@/components/ImportFormatDialog";
import { Button } from "@/components/ui/button";
import { useLinks } from "@/hooks/use-links";
import { useDragDropManager } from "@/hooks/use-drag-drop-manager";
import { toast } from "sonner";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import type { LinkItem, SearchFilters } from "@/types/link";
import type { User } from "@supabase/supabase-js";

interface IndexProps {
  user: User;
  onSignOut: () => void;
}

const Index = ({ user, onSignOut }: IndexProps) => {
  const {
    links,
    categories,
    allTags,
    searchFilters,
    setSearchFilters,
    getFilteredLinks,
    addLink,
    updateLink,
    deleteLink,
    toggleFavorite,
    addCategory,
    deleteCategory,
    renameCategory,
    reorderLinks,
  } = useLinks(user.id);

  const {
    dragState,
    canUndo,
    canRedo,
    lastKnownDrop,
    handleDragStart: dragStart,
    handleDragOver: dragOver,
    handleDragLeave: dragLeave,
    handleDragEnd: dragEnd,
    reorderLinks: dragReorderLinks,
    undo,
    redo,
    getCurrentLinks,
  } = useDragDropManager(links, categories);

  const [formOpen, setFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statsOpen, setStatsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredLinks = getFilteredLinks();

  // ✅ Atalhos de teclado globais
  useKeyboardShortcuts({
    onNewLink: useCallback(() => { setEditingLink(null); setFormOpen(true); }, []),
    onFocusSearch: useCallback(() => searchInputRef.current?.focus(), []),
    onToggleView: useCallback(() => setViewMode((v) => (v === "grid" ? "list" : "grid")), []),
    onOpenStats: useCallback(() => setStatsOpen(true), []),
    onOpenExport: useCallback(() => setExportOpen(true), []),
    onOpenImport: useCallback(() => setImportOpen(true), []),
  });

  const handleSubmit = (data: Omit<LinkItem, "id" | "createdAt" | "position">) => {
    if (editingLink) {
      updateLink(editingLink.id, data);
    } else {
      addLink(data);
    }
    setEditingLink(null);
  };

  const handleEdit = (link: LinkItem) => {
    setEditingLink(link);
    setFormOpen(true);
  };

  // ✅ Handlers para Drag & Drop com validação
  const handleDragStart = (e: React.DragEvent, link: LinkItem) => {
    if (searchFilters.sort !== "manual") {
      toast.error("Ative 'Manual' para reordenar links");
      e.preventDefault();
      return;
    }
    dragStart(e, link);
  };

  const handleDragOver = (e: React.DragEvent, linkId: string) => {
    if (searchFilters.sort !== "manual") return;
    dragOver(e, linkId);
  };

  const handleDrop = (e: React.DragEvent, targetLink: LinkItem) => {
    if (searchFilters.sort !== "manual") {
      toast.error("Ative 'Manual' para reordenar links");
      return;
    }

    const dragId = dragState.draggedLink?.id || e.dataTransfer.getData("text/plain");
    if (!dragId || dragId === targetLink.id) {
      dragEnd();
      return;
    }

    // Usar filteredLinks (ordem visual) como fonte de verdade
    const dragIndex = filteredLinks.findIndex((l) => l.id === dragId);
    const targetIndex = filteredLinks.findIndex((l) => l.id === targetLink.id);

    if (dragIndex === -1 || targetIndex === -1) {
      dragEnd();
      return;
    }

    // Criar nova ordem: remover item arrastado e inserir na posição do alvo
    const newOrder = filteredLinks.filter((_, i) => i !== dragIndex);
    const draggedItem = filteredLinks[dragIndex];
    const insertIndex = dragIndex < targetIndex ? targetIndex - 1 : targetIndex;
    newOrder.splice(insertIndex, 0, draggedItem);

    // Atualizar positions
    const reordered = newOrder.map((link, index) => ({
      ...link,
      position: index,
    }));

    reorderLinks(reordered);
    toast.success("Links reordenados!");
    dragEnd();
  };

  const handleImportLinks = async (
    importedLinks: Omit<LinkItem, "id" | "createdAt" | "position">[]
  ) => {
    let successCount = 0;
    let errorCount = 0;

    for (const linkData of importedLinks) {
      try {
        await addLink(linkData);
        successCount++;
      } catch {
        errorCount++;
      }
    }

    if (errorCount > 0) {
      toast.warning(`⚠️ ${errorCount} link(s) falharam`);
    }
  };

  const filterLabel = searchFilters.query
    ? `Resultados para "${searchFilters.query}"`
    : searchFilters.category
      ? searchFilters.category
      : searchFilters.favoritesOnly
        ? "Favoritos"
        : "Todos os Links";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          categories={categories}
          allTags={allTags}
          activeFilter={{ type: "all" }}
          onFilterChange={() => {}}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
          onRenameCategory={renameCategory}
        />

        <main className="flex-1 p-6">
          {/* Header */}
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold tracking-tight">{filterLabel}</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                title={`Alternar visualização (G)`}
              >
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={() => setStatsOpen(true)} title="Estatísticas (S)">
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setExportOpen(true)} title="Exportar (E)">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setImportOpen(true)} title="Importar (I)">
                <Upload className="h-4 w-4" />
              </Button>
              <Button onClick={() => { setEditingLink(null); setFormOpen(true); }} title="Novo link (N)">
                <Plus className="mr-1.5 h-4 w-4" />
                Novo Link
              </Button>
              <Button variant="ghost" size="icon" onClick={onSignOut} title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Advanced Search Bar */}
          <SearchBar
            ref={searchInputRef}
            filters={searchFilters}
            onFiltersChange={setSearchFilters}
            categories={categories}
            allTags={allTags}
          />

          {/* Links Grid/List */}
          <div className="mt-6">
          {filteredLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg text-muted-foreground">
                {links.length === 0
                  ? "Nenhum link salvo ainda. Adicione o primeiro!"
                  : "Nenhum link encontrado para este filtro."}
              </p>
              {links.length === 0 && (
                <Button className="mt-4" onClick={() => setFormOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Adicionar Link
                </Button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col gap-3"
              }
            >
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onToggleFavorite={toggleFavorite}
                  onEdit={handleEdit}
                  onDelete={deleteLink}
                  onDragStart={searchFilters.sort === "manual" ? handleDragStart : undefined}
                  onDragOver={searchFilters.sort === "manual" ? handleDragOver : undefined}
                  onDragLeave={searchFilters.sort === "manual" ? dragLeave : undefined}
                  onDragEnd={searchFilters.sort === "manual" ? dragEnd : undefined}
                  onDrop={searchFilters.sort === "manual" ? handleDrop : undefined}
                  isDragging={dragState.draggedLink?.id === link.id}
                  isDropZone={dragState.dropZoneId === link.id && dragState.draggedLink !== null}
                  dragDirection={dragState.dragDirection}
                />
              ))}
            </div>
          )}
          </div>
        </main>

        {/* Drag & Drop Overlay com Undo/Redo */}
        <DragDropOverlay
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          isDragging={dragState.draggedLink !== null}
        />
      </div>

      <LinkForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingLink(null);
        }}
        categories={categories}
        links={links}
        editingLink={editingLink}
        onSubmit={handleSubmit}
        onEditDuplicate={(link) => {
          setEditingLink(link);
          setFormOpen(true);
        }}
      />

      <StatsDashboard isOpen={statsOpen} onClose={() => setStatsOpen(false)} links={links} />

      <ExportFormatDialog isOpen={exportOpen} onClose={() => setExportOpen(false)} links={links} categories={categories} />

      <ImportFormatDialog isOpen={importOpen} onClose={() => setImportOpen(false)} onImport={handleImportLinks} />
    </SidebarProvider>
  );
};

export default Index;
