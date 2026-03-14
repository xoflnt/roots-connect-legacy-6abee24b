import { Compass, GitFork, Map, List } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export type TreeMode = "navigate" | "branches" | "map" | "list";

const modes: { value: TreeMode; label: string; icon: typeof Compass }[] = [
  { value: "navigate", label: "تنقل", icon: Compass },
  { value: "branches", label: "فروع", icon: GitFork },
  { value: "map", label: "خريطة", icon: Map },
  { value: "list", label: "قائمة", icon: List },
];

interface TreeModeSwitcherProps {
  active: TreeMode;
  onChange: (mode: TreeMode) => void;
}

export function TreeModeSwitcher({ active, onChange }: TreeModeSwitcherProps) {
  const isMobile = useIsMobile();
  const isNarrow = typeof window !== "undefined" && window.innerWidth < 380;

  return (
    <div
      dir="rtl"
      className="flex items-center justify-center gap-1 p-1 bg-card/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm mx-auto w-fit"
    >
      {modes.map((mode) => {
        const isActive = active === mode.value;
        const Icon = mode.icon;
        return (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] min-w-[44px] justify-center",
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-label={mode.label}
            aria-pressed={isActive}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!(isMobile && isNarrow) && <span>{mode.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
