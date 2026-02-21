import * as React from "react";
import { ICON_MAP, ICON_NAMES } from "@/lib/icons";
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

export function IconPicker({ value, onSelect }: IconPickerProps) {
  const CurrentIcon = ICON_MAP[value] || ICON_MAP.Folder;
  const [search, setSearch] = React.useState("");

  const filteredIcons = search.trim()
    ? ICON_NAMES.filter((name) => name.toLowerCase().includes(search.toLowerCase()))
    : ICON_NAMES;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          title={`Ícone atual: ${value}`}
        >
          <CurrentIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-2">
          <p className="text-sm font-medium">Escolha um ícone</p>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar ícone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs pl-7"
            />
          </div>
          <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto">
            {filteredIcons.map((iconName) => {
              const IconComponent = ICON_MAP[iconName];
              const isSelected = value === iconName;
              return (
                <Button
                  key={iconName}
                  variant={isSelected ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    isSelected && "ring-2 ring-offset-2"
                  )}
                  onClick={() => {
                    onSelect(iconName);
                    setSearch("");
                  }}
                  title={iconName}
                >
                  <IconComponent className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Nenhum ícone encontrado
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
