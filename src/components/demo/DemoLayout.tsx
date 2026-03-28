import { useState, useCallback } from "react";
import { TreePine, Home, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { applyTatweel } from "@/utils/tatweelUtils";
import { DemoBanner } from "./DemoBanner";
import { DemoContactModal } from "./DemoContactModal";

interface DemoLayoutProps {
  familyName: string;
  subdomain: string;
  children: React.ReactNode;
}

export function DemoLayout({ familyName, subdomain, children }: DemoLayoutProps) {
  const [contactOpen, setContactOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const openContact = useCallback(() => setContactOpen(true), []);

  return (
    <div className="min-h-[100dvh] bg-background" dir="rtl">
      <DemoBanner familyName={familyName} onContact={openContact} />

      {/* Header with glass effect */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between gap-2 px-4 py-3 border-b border-border/40 bg-card/80 backdrop-blur-xl shadow-sm"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <TreePine className="h-4.5 w-4.5 text-primary" />
          </div>
          <span className="text-base font-extrabold text-foreground">
            {applyTatweel(`بوابة تراث ${familyName}`)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a
            href="https://nasaby.app"
            className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
            title="الرئيسية"
          >
            <Home className="h-4 w-4" />
          </a>
        </div>
      </header>

      {children}

      <DemoContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        familyName={familyName}
        subdomain={subdomain}
      />
    </div>
  );
}
