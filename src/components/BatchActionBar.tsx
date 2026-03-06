import { useState } from "react";
import { Trash2, Star, FolderInput, Tag, Tags, X, CheckSquare, ListTodo, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ICON_BTN_MD_CLASS } from "@/lib/utils";
import type { Category, LinkPriority, LinkStatus } from "@/types/link";

interface BatchActionBarProps {
  selectedCount: number;
  categories: Category[];
  onClearSelection: () => void;
  onBatchDelete: () => void;
  onBatchFavorite: () => void;
  onBatchUnfavorite: () => void;
  onBatchMove: (categoryFullName: string) => void;
  onBatchStatus: (status: LinkStatus) => void;
  onBatchPriority: (priority: LinkPriority) => void;
  onBatchTag: (tag: string) => void;
  onBatchRemoveTag: (tag: string) => void;
  onSelectAll: () => void;
  selectedTags: string[];
}

function buildFullName(cat: Category, categories: Category[]): string {
  const parts: string[] = [cat.name];
  let current = cat;
  while (current.parentId) {
    const parent = categories.find((c) => c.id === current.parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    current = parent;
  }
  return parts.join(" / ");
}

export function BatchActionBar({
  selectedCount,
  categories,
  onClearSelection,
  onBatchDelete,
  onBatchFavorite,
  onBatchUnfavorite,
  onBatchMove,
  onBatchStatus,
  onBatchPriority,
  onBatchTag,
  onBatchRemoveTag,
  onSelectAll,
  selectedTags,
}: BatchActionBarProps) {
  const [tagInput, setTagInput] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (selectedCount === 0) return null;

  // Build flat category list for move popover
  const buildCategoryOptions = () => {
    const options: { fullName: string; label: string; depth: number }[] = [];
    const addChildren = (parentId: string | null, depth: number) => {
      const children = categories
        .filter((c) => (parentId ? c.parentId === parentId : !c.parentId))
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      for (const child of children) {
        options.push({
          fullName: buildFullName(child, categories),
          label: "\u00A0\u00A0".repeat(depth) + child.name,
          depth,
        });
        addChildren(child.id, depth + 1);
      }
    };
    addChildren(null, 0);
    return options;
  };

  const categoryOptions = buildCategoryOptions();

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl border bg-background/95 backdrop-blur-md shadow-xl px-4 py-2.5 animate-in slide-in-from-bottom-4">
        {/* Count */}
        <Badge variant="default" className="font-semibold">
          {selectedCount} selecionado(s)
        </Badge>

        <div className="h-5 w-px bg-border mx-1" />

        {/* Select All */}
        <Button variant="ghost" size="sm" onClick={onSelectAll} title="Selecionar todos">
          <CheckSquare className="h-4 w-4 mr-1" />
          Todos
        </Button>

        {/* Favorite */}
        <Button variant="ghost" size="sm" onClick={onBatchFavorite} title="Favoritar selecionados">
          <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
          Favoritar
        </Button>

        {/* Unfavorite */}
        <Button variant="ghost" size="sm" onClick={onBatchUnfavorite} title="Desfavoritar selecionados">
          <Star className="h-4 w-4 mr-1" />
          Desfavoritar
        </Button>

        {/* Move to category */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" title="Mover para categoria">
              <FolderInput className="h-4 w-4 mr-1" />
              Mover
            </Button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-56 p-1 max-h-64 overflow-y-auto">
            <button
              onClick={() => onBatchMove("")}
              className="flex items-center w-full px-3 py-2 rounded-md text-sm hover:bg-muted text-muted-foreground"
            >
              Sem categoria
            </button>
            {categoryOptions.map((opt) => (
              <button
                key={opt.fullName}
                onClick={() => onBatchMove(opt.fullName)}
                className="flex items-center w-full px-3 py-2 rounded-md text-sm hover:bg-muted text-left"
              >
                {opt.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Update status */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" title="Alterar status">
              <ListTodo className="h-4 w-4 mr-1" />
              Status
            </Button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-56 p-1">
            <button
              onClick={() => onBatchStatus("backlog")}
              className="flex items-center w-full px-3 py-2 rounded-md text-sm hover:bg-muted text-left"
            >
              Backlog
            </button>
            <button
              onClick={() => onBatchStatus("in_progress")}
              className="flex items-center w-full px-3 py-2 rounded-md text-sm hover:bg-muted text-left"
            >
              Em progresso
            </button>
            <button
              onClick={() => onBatchStatus("done")}
              className="flex items-center w-full px-3 py-2 rounded-md text-sm hover:bg-muted text-left"
            >
              Concluído
            </button>
          </PopoverContent>
        </Popover>

        {/* Update priority */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" title="Alterar prioridade">
              <Flag className="h-4 w-4 mr-1" />
              Prioridade
            </Button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-56 p-1">
            <button
              onClick={() => onBatchPriority("low")}
              className="flex items-center w-full px-3 py-2 rounded-md text-sm hover:bg-muted text-left"
            >
              Baixa
            </button>
            <button
              onClick={() => onBatchPriority("medium")}
              className="flex items-center w-full px-3 py-2 rounded-md text-sm hover:bg-muted text-left"
            >
              Média
            </button>
            <button
              onClick={() => onBatchPriority("high")}
              className="flex items-center w-full px-3 py-2 rounded-md text-sm hover:bg-muted text-left"
            >
              Alta
            </button>
          </PopoverContent>
        </Popover>

        {/* Add tag */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" title="Adicionar tag">
              <Tag className="h-4 w-4 mr-1" />
              +Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-56 p-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nome da tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    onBatchTag(tagInput.trim().toLowerCase());
                    setTagInput("");
                  }
                }}
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                className="h-8"
                onClick={() => {
                  if (tagInput.trim()) {
                    onBatchTag(tagInput.trim().toLowerCase());
                    setTagInput("");
                  }
                }}
              >
                +
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Remove tag */}
        {selectedTags.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" title="Remover tag">
                <Tags className="h-4 w-4 mr-1" />
                -Tag
              </Button>
            </PopoverTrigger>
            <PopoverContent align="center" className="w-56 p-1 max-h-48 overflow-y-auto">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onBatchRemoveTag(tag)}
                  className="flex items-center w-full px-3 py-2 rounded-md text-sm hover:bg-destructive/10 hover:text-destructive text-left gap-2"
                >
                  <X className="h-3.5 w-3.5 shrink-0" />
                  {tag}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        )}

        {/* Delete */}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setShowDeleteConfirm(true)}
          title="Excluir selecionados"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Excluir
        </Button>

        <div className="h-5 w-px bg-border mx-1" />

        {/* Close */}
        <Button variant="ghost" size="icon" className={ICON_BTN_MD_CLASS} onClick={onClearSelection}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {selectedCount} link(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Os links selecionados serão movidos para a lixeira.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onBatchDelete();
                setShowDeleteConfirm(false);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
