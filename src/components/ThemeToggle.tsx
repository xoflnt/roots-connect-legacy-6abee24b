import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      onClick={toggleTheme}
      className="bg-card border-border text-foreground hover:bg-muted gap-2"
      style={{ minHeight: 44 }}
    >
      {theme === "light" ? (
        <>
          <Moon className="h-5 w-5" />
          <span>الوضع الداكن</span>
        </>
      ) : (
        <>
          <Sun className="h-5 w-5" />
          <span>الوضع الفاتح</span>
        </>
      )}
    </Button>
  );
}
