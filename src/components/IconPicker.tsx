import * as React from "react";
import { ICON_MAP, ICON_NAMES, ICON_CATEGORIES, ICON_CATEGORY_NAMES } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface IconPickerProps {
  value: string;
  onSelect: (icon: string) => void;
}

const POPULAR_ICONS = [
  "Folder", "Star", "Heart", "Bookmark", "Tag", "Home",
  "Code", "Globe", "Music", "Image", "Video", "Camera",
  "Book", "BookOpen", "GraduationCap", "Briefcase",
  "ShoppingCart", "Coffee", "Gamepad2", "Palette",
  "Rocket", "Zap", "Lightbulb", "Brain", "Sparkles",
  "Shield", "Lock", "Key", "Settings", "Wrench",
  "MapPin", "Flag", "Calendar", "Clock",
  "Mail", "MessageCircle", "Users", "Phone",
  "DollarSign", "CreditCard", "TrendingUp",
  "Sun", "Moon", "Flame", "Leaf",
  "Trophy", "Award", "Gift", "Crown",
];

export function IconPicker({ value, onSelect }: IconPickerProps) {
  const CurrentIcon = ICON_MAP[value] || ICON_MAP.Folder;
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const displayedIcons = React.useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return ICON_NAMES.filter((name) => name.toLowerCase().includes(q)).slice(0, 120);
    }
    if (activeCategory) {
      const catIcons = ICON_CATEGORIES[activeCategory] || [];
      return catIcons.filter((name) => name in ICON_MAP);
    }
    return POPULAR_ICONS.filter((name) => name in ICON_MAP);
  }, [search, activeCategory]);

  const handleSelect = (iconName: string) => {
    onSelect(iconName);
    setSearch("");
    setActiveCategory(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          title={`Ícone atual: ${value}`}
        >
          <CurrentIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start" side="right">
        <div className="space-y-2">
          <p className="text-sm font-medium">Escolha um ícone <span className="text-muted-foreground font-normal">({ICON_NAMES.length} disponíveis)</span></p>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar ícone... (ex: heart, folder, star)"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); }}
              className="h-8 text-xs pl-7"
            />
          </div>

          {/* Category pills */}
          {!search.trim() && (
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              <button
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors",
                  !activeCategory
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                )}
                onClick={() => setActiveCategory(null)}
              >
                ⭐ Populares
              </button>
              {ICON_CATEGORY_NAMES.map((cat) => (
                <button
                  key={cat}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors",
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Icon grid */}
          <div className="grid grid-cols-8 gap-1 max-h-52 overflow-y-auto">
            {displayedIcons.map((iconName) => {
              const IconComponent = ICON_MAP[iconName];
              if (!IconComponent) return null;
              const isSelected = value === iconName;
              return (
                <Button
                  key={iconName}
                  variant={isSelected ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    isSelected && "ring-2 ring-offset-1 ring-primary"
                  )}
                  onClick={() => handleSelect(iconName)}
                  title={iconName}
                >
                  <IconComponent className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
          {displayedIcons.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Nenhum ícone encontrado
            </p>
          )}
          {search.trim() && displayedIcons.length >= 120 && (
            <p className="text-[10px] text-muted-foreground text-center">
              Mostrando 120 de {ICON_NAMES.filter((n) => n.toLowerCase().includes(search.toLowerCase())).length} resultados. Refine a busca.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
