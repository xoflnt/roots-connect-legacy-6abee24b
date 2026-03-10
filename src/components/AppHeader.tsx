import { TreePine, TableProperties } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchBar } from "./SearchBar";
import { ResetViewButton } from "./ResetViewButton";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export type ViewMode = "tree" | "table";

interface AppHeaderProps {
  onSearch?: (memberId: string) => void;
  onReset?: () => void;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function AppHeader({ onSearch, onReset, activeView, onViewChange }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 md:px-6 py-3 border-b border-border/40 bg-card/70 backdrop-blur-xl shadow-sm">
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-secondary/10">
          <TreePine className="h-5 w-5 text-secondary" />
        </div>
        <h1 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight">
          شجرة عائلة آل الخنيني
        </h1>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-end max-w-md">
        <ToggleGroup
          type="single"
          value={activeView}
          onValueChange={(v) => v && onViewChange(v as ViewMode)}
          className="border border-border rounded-lg p-0.5 bg-muted/40"
        >
          <ToggleGroupItem value="tree" aria-label="عرض الشجرة" className="text-xs px-3 py-1.5 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm">
            <TreePine className="h-3.5 w-3.5 ml-1" />
            الشجرة
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="جدول البيانات" className="text-xs px-3 py-1.5 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm">
            <TableProperties className="h-3.5 w-3.5 ml-1" />
            البيانات
          </ToggleGroupItem>
        </ToggleGroup>
        {activeView === "tree" && onSearch && <SearchBar onSelect={onSearch} />}
        {activeView === "tree" && onReset && <ResetViewButton onReset={onReset} />}
        <ThemeToggle />
      </div>
    </header>
  );
}
