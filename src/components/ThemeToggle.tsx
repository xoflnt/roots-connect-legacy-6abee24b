import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      onClick={toggleTheme}
      className="bg-card border-border text-foreground hover:bg-muted gap-2 min-h-[44px] min-w-[44px] px-2.5 md:px-4"
    >
      {theme === "light" ? (
        <>
          <Moon className="h-5 w-5" />
          <span className="hidden md:inline">الوضع الداكن</span>
        </>
      ) : (
        <>
          <Sun className="h-5 w-5" />
          <span className="hidden md:inline">الوضع الفاتح</span>
        </>
      )}
    </Button>
  );
}
