import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { toast } from "sonner";
import { useIndexPageController } from "./useIndexPageController";
import { IndexHeader } from "./IndexHeader";
import { IndexContent } from "./IndexContent";
import { IndexDialogs } from "./IndexDialogs";

type Controller = ReturnType<typeof useIndexPageController>;

interface IndexViewProps {
  controller: Controller;
}

export function IndexView({ controller }: IndexViewProps) {
  const {
    links,
    categories,
    allTags,
    activeFilter,
    handleSidebarFilter,
    addCategory,
    deleteCategory,
    renameCategory,
    reorderCategories,
    updateCategoryColor,
    updateCategoryIcon,
    updateLink,
    logActivity,
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
          <IndexContent controller={controller} />
        </main>
      </div>

      <IndexDialogs controller={controller} />
    </SidebarProvider>
  );
}