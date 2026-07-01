import { Plus, Download, Upload, LogOut, BarChart3, Clock, Command, Trash2, ShieldCheck, Settings, Stethoscope } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ViewSwitcher } from "@/components/ViewSwitcher";
import { Button } from "@/components/ui/button";
import { useIndexPageController } from "./useIndexPageController";

type Controller = ReturnType<typeof useIndexPageController>;

interface IndexHeaderProps {
  controller: Controller;
}

export function IndexHeader({ controller }: IndexHeaderProps) {
  const {
    isMobile,
    trashedLinks,
    filterLabel,
    viewMode,
    setViewMode,
    gridColumns,
    setGridColumns,
    cardSize,
    setCardSize,
    setCommandOpen,
    setHistoryOpen,
    setStatsOpen,
    setTrashOpen,
    setLinkCheckerOpen,
    setDiagnosticsOpen,
    setNotionSettingsOpen,
    setExportOpen,
    setImportOpen,
    openNewLinkForm,
    onSignOut,
  } = controller;

  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-2 md:mb-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold tracking-tight">{filterLabel}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <ThemeToggle />
        <ViewSwitcher
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          gridColumns={gridColumns}
          onGridColumnsChange={setGridColumns}
          cardSize={cardSize}
          onCardSizeChange={setCardSize}
        />
        <Button variant="outline" size="icon" onClick={() => setCommandOpen(true)} title="Comandos (/ ou Ctrl+K)">
          <Command className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setHistoryOpen(true)} title="Histórico">
          <Clock className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setStatsOpen(true)} title="Estatísticas (S)">
          <BarChart3 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setTrashOpen(true)} title="Lixeira" className="relative">
          <Trash2 className="h-4 w-4" />
          {trashedLinks.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {trashedLinks.length}
            </span>
          )}
        </Button>
        <Button variant="outline" size="icon" onClick={() => setLinkCheckerOpen(true)} title="Verificar links">
          <ShieldCheck className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setDiagnosticsOpen(true)} title="Diagnóstico de Thumbnails">
          <Stethoscope className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setNotionSettingsOpen(true)} title="Configurações do Notion">
          <Settings className="h-4 w-4" />
        </Button>
        {!isMobile && (
          <>
            <Button variant="outline" size="icon" onClick={() => setExportOpen(true)} title="Exportar (E)">
              <Upload className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setImportOpen(true)} title="Importar (I)">
              <Download className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button onClick={openNewLinkForm} title="Novo link (N)" size={isMobile ? "icon" : "default"}>
          <Plus className={isMobile ? "h-4 w-4" : "mr-1.5 h-4 w-4"} />
          {!isMobile && "Novo Link"}
        </Button>
        <Button variant="ghost" size="icon" onClick={onSignOut} title="Sair">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}