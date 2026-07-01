import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { NotionSettingsDialog } from "@/components/NotionSettingsDialog";
import { LinkDiagnostics } from "@/components/LinkDiagnostics";
import { CommandPalette } from "@/components/CommandPalette";
import { BatchActionBar } from "@/components/BatchActionBar";
import { useIndexPageController } from "./useIndexPageController";

const LinkForm = lazy(() => import("@/components/LinkForm").then((m) => ({ default: m.LinkForm })));
const StatsDashboard = lazy(() => import("@/components/StatsDashboard").then((m) => ({ default: m.StatsDashboard })));
const ExportFormatDialog = lazy(() => import("@/components/ExportFormatDialog").then((m) => ({ default: m.ExportFormatDialog })));
const ImportFormatDialog = lazy(() => import("@/components/ImportFormatDialog").then((m) => ({ default: m.ImportFormatDialog })));
const ActivityPanel = lazy(() => import("@/components/ActivityPanel").then((m) => ({ default: m.ActivityPanel })));
const TrashView = lazy(() => import("@/components/TrashView").then((m) => ({ default: m.TrashView })));
const LinkCheckerPanel = lazy(() => import("@/components/LinkCheckerPanel").then((m) => ({ default: m.LinkCheckerPanel })));

type Controller = ReturnType<typeof useIndexPageController>;

interface IndexDialogsProps {
  controller: Controller;
}

export function IndexDialogs({ controller }: IndexDialogsProps) {
  const {
    formOpen,
    setFormOpen,
    categories,
    links,
    editingLink,
    handleSubmit,
    handleImportLinks,
    statsOpen,
    setStatsOpen,
    exportOpen,
    setExportOpen,
    importOpen,
    setImportOpen,
    historyOpen,
    setHistoryOpen,
    activityEntries,
    clearLog,
    trashOpen,
    setTrashOpen,
    trashedLinks,
    restoreLink,
    permanentDeleteLink,
    emptyTrash,
    commandOpen,
    setCommandOpen,
    commands,
    selectedIds,
    handleClearSelection,
    handleBatchDelete,
    handleBatchFavorite,
    handleBatchUnfavorite,
    handleBatchMove,
    handleBatchStatus,
    handleBatchPriority,
    handleBatchTag,
    handleBatchRemoveTag,
    handleSelectAll,
    selectedTags,
    linkCheckerOpen,
    setLinkCheckerOpen,
    linkCheckResults,
    linkChecking,
    linkCheckProgress,
    checkLinks,
    cancelLinkCheck,
    clearLinkCheckResults,
    notionSettingsOpen,
    setNotionSettingsOpen,
    diagnosticsOpen,
    setDiagnosticsOpen,
    updateLink,
  } = controller;

  return (
    <>
      <Suspense fallback={null}>
        <LinkForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) controller.setEditingLink(null);
          }}
          categories={categories}
          links={links}
          editingLink={editingLink}
          onSubmit={handleSubmit}
          onEditDuplicate={(link) => {
            controller.setEditingLink(link);
            setFormOpen(true);
          }}
        />

        <StatsDashboard isOpen={statsOpen} onClose={() => setStatsOpen(false)} links={links} />
        <ExportFormatDialog isOpen={exportOpen} onClose={() => setExportOpen(false)} links={links} categories={categories} />
        <ImportFormatDialog isOpen={importOpen} onClose={() => setImportOpen(false)} onImport={handleImportLinks} />
        <ActivityPanel isOpen={historyOpen} onClose={() => setHistoryOpen(false)} entries={activityEntries} onClear={clearLog} />
        <TrashView
          isOpen={trashOpen}
          onClose={() => setTrashOpen(false)}
          trashedLinks={trashedLinks}
          onRestore={(id) => {
            const link = links.find((l) => l.id === id) ?? trashedLinks.find((l) => l.id === id);
            restoreLink(id);
            controller.logActivity("link:restored", link?.title || "Link restaurado", link?.url);
          }}
          onPermanentDelete={(id) => {
            const link = trashedLinks.find((l) => l.id === id);
            permanentDeleteLink(id);
            controller.logActivity("link:deleted", link?.title || "Link excluído", link?.url);
          }}
          onEmptyTrash={() => {
            emptyTrash();
            controller.logActivity("link:deleted", `${trashedLinks.length} links excluídos permanentemente`);
          }}
        />
      </Suspense>

      <CommandPalette isOpen={commandOpen} onOpenChange={setCommandOpen} actions={commands} />

      <BatchActionBar
        selectedCount={selectedIds.size}
        categories={categories}
        onClearSelection={handleClearSelection}
        onBatchDelete={handleBatchDelete}
        onBatchFavorite={handleBatchFavorite}
        onBatchUnfavorite={handleBatchUnfavorite}
        onBatchMove={handleBatchMove}
        onBatchStatus={handleBatchStatus}
        onBatchPriority={handleBatchPriority}
        onBatchTag={handleBatchTag}
        onBatchRemoveTag={handleBatchRemoveTag}
        onSelectAll={handleSelectAll}
        selectedTags={selectedTags}
      />

      <Suspense fallback={null}>
        <LinkCheckerPanel
          isOpen={linkCheckerOpen}
          onClose={() => setLinkCheckerOpen(false)}
          links={links}
          results={linkCheckResults}
          checking={linkChecking}
          progress={linkCheckProgress}
          onCheckAll={() => checkLinks(links.map((l) => ({ id: l.id, url: l.url }))) }
          onCancel={cancelLinkCheck}
          onClear={clearLinkCheckResults}
        />

        <NotionSettingsDialog open={notionSettingsOpen} onOpenChange={setNotionSettingsOpen} />

        {diagnosticsOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-4 z-50 overflow-auto">
              <div className="container mx-auto max-w-4xl py-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Diagnóstico de Links</h2>
                  <Button variant="outline" onClick={() => setDiagnosticsOpen(false)}>
                    Fechar
                  </Button>
                </div>
                <LinkDiagnostics links={links} onUpdateLink={updateLink} />
              </div>
            </div>
          </div>
        )}
      </Suspense>
    </>
  );
}