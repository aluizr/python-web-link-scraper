import { useState } from "react";
import { Plus, LayoutGrid, List, Download, Upload, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LinkCard } from "@/components/LinkCard";
import { LinkForm } from "@/components/LinkForm";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { useLinks } from "@/hooks/use-links";
import { toast } from "sonner";
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

  const [formOpen, setFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [draggedLink, setDraggedLink] = useState<LinkItem | null>(null);

  const filteredLinks = getFilteredLinks();

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

  // ✅ Handlers para Drag & Drop
  const handleDragStart = (e: React.DragEvent, link: LinkItem) => {
    setDraggedLink(link);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetLink: LinkItem) => {
    e.preventDefault();
    
    if (!draggedLink || draggedLink.id === targetLink.id) {
      setDraggedLink(null);
      return;
    }

    // Encontrar índices dos links na lista filtrada
    const draggedIndex = filteredLinks.findIndex(l => l.id === draggedLink.id);
    const targetIndex = filteredLinks.findIndex(l => l.id === targetLink.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedLink(null);
      return;
    }

    // Criar nova lista com os links reordenados
    const newFilteredLinks = [...filteredLinks];
    const [movedLink] = newFilteredLinks.splice(draggedIndex, 1);
    newFilteredLinks.splice(targetIndex, 0, movedLink);

    // Reordenar TODOS os links (não apenas os filtrados)
    const reorderedAllLinks = links.map(link => {
      const newPosition = newFilteredLinks.findIndex(fl => fl.id === link.id);
      return newPosition !== -1 ? { ...link, position: newPosition } : link;
    });

    // Chamar função para salvar no banco
    reorderLinks(reorderedAllLinks);
    setDraggedLink(null);
    toast.success("Links reordenados!");
  };

  const handleExport = () => {
    const data = JSON.stringify(links, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `links-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportado com sucesso!");
  };

  const handleImport = () => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_LINKS_PER_IMPORT = 1000;
    
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        // ✅ Validação 1: Tamanho do arquivo
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`Arquivo muito grande (máx ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
          return;
        }
        
        // ✅ Validação 2: Tipo MIME
        if (file.type && file.type !== 'application/json') {
          toast.error("Apenas arquivos JSON são permitidos");
          return;
        }
        
        // ✅ Validação 3: Leitura segura
        let fileContent: string;
        try {
          fileContent = await file.text();
        } catch {
          toast.error("Erro ao ler o arquivo");
          return;
        }
        
        // ✅ Validação 4: Parsing JSON
        let imported: any;
        try {
          imported = JSON.parse(fileContent);
        } catch {
          toast.error("Formato JSON inválido");
          return;
        }
        
        // ✅ Validação 5: Verificar se é array
        if (!Array.isArray(imported)) {
          toast.error("Arquivo deve conter um array de links");
          return;
        }
        
        // ✅ Validação 6: Limitar quantidade
        if (imported.length > MAX_LINKS_PER_IMPORT) {
          toast.error(`Máximo de ${MAX_LINKS_PER_IMPORT} links por importação`);
          return;
        }
        
        // ✅ Validação 7: Array vazio
        if (imported.length === 0) {
          toast.error("Nenhum link encontrado no arquivo");
          return;
        }
        
        // ✅ Processamento com validação individual
        let successCount = 0;
        let errorCount = 0;
        
        for (let index = 0; index < imported.length; index++) {
          const item = imported[index];
          
          if (!item.url) {
            errorCount++;
            continue;
          }
          
          try {
            await addLink({
              url: item.url,
              title: item.title || item.url,
              description: item.description || "",
              category: item.category || "",
              tags: Array.isArray(item.tags) ? item.tags : [],
              isFavorite: Boolean(item.isFavorite),
              favicon: item.favicon || "",
            });
            successCount++;
          } catch {
            errorCount++;
          }
        }
        
        // ✅ Feedback detalhado
        if (successCount > 0) {
          toast.success(`✅ ${successCount} link(s) importado(s) com sucesso!`);
        }
        
        if (errorCount > 0) {
          toast.error(`⚠️ ${errorCount} link(s) com erro`);
        }
        
      } catch {
        toast.error("Erro inesperado ao importar arquivo");
      }
    };
    input.click();
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
              >
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={handleExport} title="Exportar links">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleImport} title="Importar links">
                <Upload className="h-4 w-4" />
              </Button>
              <Button onClick={() => { setEditingLink(null); setFormOpen(true); }}>
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
                  onDragStart={handleDragStart} // ✅ Adicionar drag handlers
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isDragging={draggedLink?.id === link.id}
                />
              ))}
            </div>
          )}
          </div>
        </main>
      </div>

      <LinkForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingLink(null);
        }}
        categories={categories}
        editingLink={editingLink}
        onSubmit={handleSubmit}
      />
    </SidebarProvider>
  );
};

export default Index;
