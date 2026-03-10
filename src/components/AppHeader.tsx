import { TreePine } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <TreePine className="h-7 w-7 text-secondary" />
        <h1 className="text-2xl font-extrabold text-foreground">شجرة عائلة آل الخنيني</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
