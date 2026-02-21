import { Star, ExternalLink, Pencil, Trash2, StickyNote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FaviconWithFallback } from "@/components/FaviconWithFallback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { LinkItem } from "@/types/link";

interface LinkCardsViewProps {
  links: LinkItem[];
  onToggleFavorite: (id: string) => void;
  onEdit: (link: LinkItem) => void;
  onDelete: (id: string) => void;
}

export function LinkCardsView({ links, onToggleFavorite, onEdit, onDelete }: LinkCardsViewProps) {
  return (
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {links.map((link) => (
        <div
          key={link.id}
          className="group relative rounded-xl border bg-card p-3 hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col gap-2"
        >
          {/* Top row: favicon + favorite */}
          <div className="flex items-center justify-between gap-2">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 min-w-0 flex-1"
            >
              <FaviconWithFallback url={link.url} favicon={link.favicon} size={28} className="shrink-0" />
              <span className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                {link.title || new URL(link.url).hostname}
              </span>
            </a>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onToggleFavorite(link.id)}
            >
              <Star
                className={`h-3.5 w-3.5 ${
                  link.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                }`}
              />
            </Button>
          </div>

          {/* Description (truncated to 1 line) */}
          {link.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{link.description}</p>
          )}

          {/* Category + tags */}
          <div className="flex flex-wrap gap-1 min-h-[20px]">
            {link.category && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {link.category}
              </Badge>
            )}
            {link.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
            {link.tags.length > 2 && (
              <span className="text-[10px] text-muted-foreground">+{link.tags.length - 2}</span>
            )}
            {link.notes && (
              <span className="inline-flex items-center text-muted-foreground" title="Tem notas">
                <StickyNote className="h-2.5 w-2.5" />
              </span>
            )}
          </div>

          {/* Hover actions */}
          <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(link)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir link?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O link será removido permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => onDelete(link.id)}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}
