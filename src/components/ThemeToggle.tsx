import { Moon, Sun, Waves, Sunset, TreePine, Flower2, Sparkles, Eclipse, Palette, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const themes = [
  {
    id: "light",
    label: "Claro",
    icon: Sun,
    preview: "bg-white border-gray-200",
    color: "text-amber-500",
  },
  {
    id: "dark",
    label: "Escuro",
    icon: Moon,
    preview: "bg-gray-900 border-gray-700",
    color: "text-blue-400",
  },
  {
    id: "ocean",
    label: "Oceano",
    icon: Waves,
    preview: "bg-sky-50 border-sky-300",
    color: "text-sky-500",
  },
  {
    id: "sunset",
    label: "Pôr do Sol",
    icon: Sunset,
    preview: "bg-orange-50 border-orange-300",
    color: "text-orange-500",
  },
  {
    id: "forest",
    label: "Floresta",
    icon: TreePine,
    preview: "bg-green-50 border-green-300",
    color: "text-green-600",
  },
  {
    id: "rose",
    label: "Rosé",
    icon: Flower2,
    preview: "bg-pink-50 border-pink-300",
    color: "text-pink-500",
  },
  {
    id: "lavender",
    label: "Lavanda",
    icon: Sparkles,
    preview: "bg-purple-50 border-purple-300",
    color: "text-purple-500",
  },
  {
    id: "midnight",
    label: "Meia-Noite",
    icon: Eclipse,
    preview: "bg-indigo-950 border-indigo-800",
    color: "text-indigo-400",
  },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const currentTheme = themes.find((t) => t.id === theme) ?? themes[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title="Alterar tema"
        >
          <Palette className="h-4 w-4" />
          <span className="sr-only">Alterar tema</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-56 p-2" align="end">
        <div className="grid gap-1">
          <p className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
            Tema
          </p>
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2",
                    t.preview
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", t.color)} />
                </div>
                <span className="flex-1 text-left">{t.label}</span>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
