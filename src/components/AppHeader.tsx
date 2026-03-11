import { TreePine, TableProperties, Home, List, GitBranch } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchBar } from "./SearchBar";
import { ResetViewButton } from "./ResetViewButton";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Button } from "./ui/button";

export type ViewMode = "tree" | "lineage" | "list" | "table";

interface AppHeaderProps {
  onSearch?: (memberId: string) => void;
  onReset?: () => void;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onGoHome?: () => void;
}

export function AppHeader({ onSearch, onReset, activeView, onViewChange, onGoHome }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-3 px-3 md:px-6 py-2.5 border-b border-border/40 bg-card/60 backdrop-blur-xl shadow-sm">
      <div className="flex items-center gap-2 shrink-0">
        {onGoHome && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onGoHome}
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            title="الرئيسية"
          >
            <Home className="h-4.5 w-4.5" />
          </Button>
        )}
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10">
          <TreePine className="h-4.5 w-4.5 text-primary" />
        </div>
        <h1 className="text-base md:text-lg font-extrabold text-foreground tracking-tight hidden sm:block">
          آل الخنيني
        </h1>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-center">
        <ToggleGroup
          type="single"
          value={activeView}
          onValueChange={(v) => v && onViewChange(v as ViewMode)}
          className="border border-border rounded-xl p-0.5 bg-muted/40"
        >
          <ToggleGroupItem value="tree" aria-label="الشجرة التفاعلية" className="text-xs px-2.5 md:px-3 py-1.5 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm gap-1">
            <TreePine className="h-3.5 w-3.5" />
            <span className="hidden md:inline">الشجرة</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="lineage" aria-label="سلسلة النسب" className="text-xs px-2.5 md:px-3 py-1.5 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm gap-1">
            <GitBranch className="h-3.5 w-3.5" />
            <span className="hidden md:inline">النسب</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="عرض القوائم" className="text-xs px-2.5 md:px-3 py-1.5 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm gap-1">
            <List className="h-3.5 w-3.5" />
            <span className="hidden md:inline">القوائم</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="جدول البيانات" className="text-xs px-2.5 md:px-3 py-1.5 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm gap-1">
            <TableProperties className="h-3.5 w-3.5" />
            <span className="hidden md:inline">البيانات</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {onSearch && <SearchBar onSelect={onSearch} />}
        {activeView === "tree" && onReset && <ResetViewButton onReset={onReset} />}
        <ThemeToggle />
      </div>
    </header>
  );
}
