import { TreePine, Home, Map, Compass, GitFork, AlignJustify, Users, UserCircle, BookOpen, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { FontSizeToggle } from "./FontSizeToggle";
import { SearchBar } from "./SearchBar";
import { ResetViewButton } from "./ResetViewButton";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_MEMBER_IDS } from "@/utils/branchUtils";

export type ViewMode = "map" | "navigate" | "branches" | "list" | "kinship";

interface AppHeaderProps {
  onSearch?: (memberId: string) => void;
  onReset?: () => void;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onGoHome?: () => void;
  isLineageActive?: boolean;
}

const navItems: { value: ViewMode; label: string; icon: typeof Map }[] = [
  { value: "map", label: "خريطة", icon: Map },
  { value: "navigate", label: "تنقل", icon: Compass },
  { value: "branches", label: "فروع", icon: GitFork },
  { value: "list", label: "قائمة", icon: AlignJustify },
  { value: "kinship", label: "قرابة", icon: Users },
];

export function AppHeader({ onSearch, onReset, activeView, onViewChange, onGoHome, isLineageActive }: AppHeaderProps) {
  const isMobile = useIsMobile();
  const { currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const isAdmin = isLoggedIn && currentUser && ADMIN_MEMBER_IDS.includes(currentUser.memberId);

  return (
    <header
      className="shrink-0 z-50 flex items-center justify-between gap-2 px-3 md:px-6 py-2 md:py-2.5 border-b border-border/40 bg-card/80 backdrop-blur-xl shadow-sm"
      style={{ paddingTop: `max(0.75rem, env(safe-area-inset-top))` }}
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
            value={isLineageActive ? "" : activeView}
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
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
            className="h-11 w-11 min-w-[44px] min-h-[44px] rounded-xl text-primary hover:bg-primary/10"
            aria-label="لوحة الإدارة"
          >
            <Shield className="h-5 w-5" />
          </Button>
        )}
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
        {!isMobile && activeView === "map" && onReset && <ResetViewButton onReset={onReset} />}
        <FontSizeToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
