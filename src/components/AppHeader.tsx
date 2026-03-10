import { TreePine } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchBar } from "./SearchBar";
import { ResetViewButton } from "./ResetViewButton";

interface AppHeaderProps {
  onSearch?: (memberId: string) => void;
  onReset?: () => void;
}

export function AppHeader({ onSearch, onReset }: AppHeaderProps) {
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
        {onSearch && <SearchBar onSelect={onSearch} />}
        {onReset && <ResetViewButton onReset={onReset} />}
        <ThemeToggle />
      </div>
    </header>
  );
}
