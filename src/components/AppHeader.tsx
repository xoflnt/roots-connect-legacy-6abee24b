import { TreePine, TableProperties, Home, List, GitBranch, Users, UserCircle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { FontSizeToggle } from "./FontSizeToggle";
import { SearchBar } from "./SearchBar";
import { ResetViewButton } from "./ResetViewButton";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

export type ViewMode = "tree" | "lineage" | "list" | "table" | "kinship";

interface AppHeaderProps {
  onSearch?: (memberId: string) => void;
  onReset?: () => void;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onGoHome?: () => void;
}

const navItems: { value: ViewMode; label: string; icon: typeof TreePine }[] = [
  { value: "tree", label: "الشجرة", icon: TreePine },
  { value: "lineage", label: "النسب", icon: GitBranch },
  { value: "kinship", label: "القرابة", icon: Users },
  { value: "list", label: "القوائم", icon: List },
];

export function AppHeader({ onSearch, onReset, activeView, onViewChange, onGoHome }: AppHeaderProps) {
  const isMobile = useIsMobile();
  const { currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* Top bar */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between gap-2 px-3 md:px-6 py-2 md:py-2.5 border-b border-border/40 bg-card/60 backdrop-blur-xl shadow-sm"
        style={{ paddingTop: `max(0.5rem, env(safe-area-inset-top))` }}
        role="banner"
      >
        <div className="flex items-center gap-2 shrink-0">
          {onGoHome && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onGoHome}
              className="h-11 w-11 min-w-[44px] min-h-[44px] rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="الرئيسية"
            >
              <Home className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10" aria-hidden="true">
            <TreePine className="h-4.5 w-4.5 text-primary" />
          </div>
          <h1 className="text-base md:text-lg font-extrabold text-foreground tracking-tight hidden sm:block">
            الخنيني
          </h1>
        </div>

        {/* Desktop segmented control */}
        {!isMobile && (
          <div className="flex items-center gap-2 flex-1 justify-center">
            <ToggleGroup
              type="single"
              value={activeView}
              onValueChange={(v) => v && onViewChange(v as ViewMode)}
              className="border border-accent/20 rounded-xl p-0.5 bg-muted/40"
            >
              {navItems.map((item) => (
                <ToggleGroupItem
                  key={item.value}
                  value={item.value}
                  aria-label={item.label}
                  className="text-xs px-3 py-1.5 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-md data-[state=on]:border data-[state=on]:border-accent/20 gap-1"
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          {isLoggedIn && currentUser ? (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 text-sm text-foreground hover:bg-muted transition-colors min-h-[44px]"
                aria-label="الملف الشخصي"
              >
                <UserCircle className="h-4 w-4 text-primary" />
                <span className="font-medium">مرحباً بك، {currentUser.memberName}</span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
                className="sm:hidden h-11 w-11 min-w-[44px] min-h-[44px] rounded-xl"
                aria-label="الملف الشخصي"
              >
                <UserCircle className="h-5 w-5 text-primary" />
              </Button>
            </>
          ) : (
            <span className="hidden sm:block text-xs text-muted-foreground font-medium px-2">
              مرحباً بك في بوابة تراث الخنيني
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/guide")}
            className="h-11 w-11 min-w-[44px] min-h-[44px] rounded-xl text-muted-foreground hover:text-foreground"
            aria-label="دليل الاستخدام"
          >
            <BookOpen className="h-5 w-5" />
          </Button>
          {onSearch && <SearchBar onSelect={onSearch} />}
          {!isMobile && activeView === "tree" && onReset && <ResetViewButton onReset={onReset} />}
          <FontSizeToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile bottom navigation bar */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around border-t border-border/40 bg-card/80 backdrop-blur-xl shadow-[0_-2px_10px_rgba(0,0,0,0.08)]"
          style={{ paddingBottom: `env(safe-area-inset-bottom)` }}
          role="navigation"
          aria-label="التنقل الرئيسي"
        >
          {navItems.map((item) => {
            const isActive = activeView === item.value;
            return (
              <button
                key={item.value}
                onClick={() => onViewChange(item.value)}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[56px] py-1.5 transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 transition-transform ${isActive ? "text-primary scale-110" : ""}`} />
                <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 h-0.5 w-8 bg-accent rounded-b-full" />
                )}
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}
