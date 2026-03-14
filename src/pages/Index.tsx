import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppHeader, type ViewMode } from "@/components/AppHeader";
import { FamilyTree, type FamilyTreeRef } from "@/components/FamilyTree";
import { LandingPage } from "@/components/LandingPage";
import { KinshipCalculator } from "@/components/KinshipCalculator";
import { SmartNavigateView } from "@/components/tree/SmartNavigateView";
import { BranchesView } from "@/components/tree/BranchesView";
import { ListView } from "@/components/ListView";
import { loadMembers, searchMembers, getMemberById } from "@/services/familyService";
import { useAuth } from "@/contexts/AuthContext";
import { getLineageLabel, getMemberSubtitle } from "@/utils/memberLabel";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Search, User, ChevronLeft, Map, Compass, GitFork, BookOpen, Users, AlignJustify } from "lucide-react";
import { springConfig } from "@/lib/animations";

export type AppTab = "map" | "navigate" | "branches" | "nasab" | "kinship" | "list";

const TAB_STORAGE_KEY = "khunaini-active-tab";
const OLD_TREE_MODE_KEY = "khunaini-tree-mode";

const TAB_ITEMS: { value: AppTab; label: string; icon: typeof Map }[] = [
  { value: "map", label: "خريطة", icon: Map },
  { value: "navigate", label: "تنقل", icon: Compass },
  { value: "branches", label: "فروع", icon: GitFork },
  { value: "nasab", label: "نسب", icon: BookOpen },
  { value: "kinship", label: "قرابة", icon: Users },
  { value: "list", label: "قائمة", icon: AlignJustify },
];

const VALID_TABS: AppTab[] = ["map", "navigate", "branches", "kinship", "list"];

function migrateOldKey(): AppTab | null {
  try {
    const old = localStorage.getItem(OLD_TREE_MODE_KEY);
    if (old) {
      localStorage.removeItem(OLD_TREE_MODE_KEY);
      const mapping: Record<string, AppTab> = { map: "map", navigate: "navigate", branches: "branches", list: "list" };
      if (mapping[old]) return mapping[old];
    }
  } catch {}
  return null;
}

function getInitialTab(viewParam: string | null): AppTab {
  if (viewParam && VALID_TABS.includes(viewParam as AppTab)) return viewParam as AppTab;
  try {
    const migrated = migrateOldKey();
    if (migrated) {
      localStorage.setItem(TAB_STORAGE_KEY, migrated);
      return migrated;
    }
    const stored = localStorage.getItem(TAB_STORAGE_KEY) as AppTab | null;
    if (stored && VALID_TABS.includes(stored)) return stored;
  } catch {}
  return "map";
}

// Map AppTab to AppHeader's ViewMode for desktop
function tabToViewMode(tab: AppTab): ViewMode {
  if (tab === "nasab") return "map"; // nasab is sheet-only, fallback
  return tab as ViewMode;
}

const Index = () => {
  const treeRef = useRef<FamilyTreeRef>(null);
  const [searchParams] = useSearchParams();
  const [ready, setReady] = useState(false);
  const { currentUser, isLoggedIn } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [showLanding, setShowLanding] = useState(() => {
    const viewParam = searchParams.get("view");
    return !viewParam;
  });

  const [activeTab, setActiveTab] = useState<AppTab>(() =>
    getInitialTab(searchParams.get("view"))
  );
  const [focusBranch, setFocusBranch] = useState<string | undefined>();

  // Nasab sheet state
  const [showLineageSearch, setShowLineageSearch] = useState(false);
  const [lineageQuery, setLineageQuery] = useState("");

  const isNarrow = typeof window !== "undefined" && window.innerWidth < 360;

  useEffect(() => {
    loadMembers().finally(() => setReady(true));
  }, []);

  const persistTab = useCallback((tab: AppTab) => {
    try { localStorage.setItem(TAB_STORAGE_KEY, tab); } catch {}
  }, []);

  // Listen for tab-switch events from LandingPage quick actions
  useEffect(() => {
    const onKinship = () => { setActiveTab('kinship'); persistTab('kinship'); };
    const onList = () => { setActiveTab('list'); persistTab('list'); };
    const onNavigate = () => { setActiveTab('navigate'); persistTab('navigate'); };
    const onBranches = () => { setActiveTab('branches'); persistTab('branches'); };
    window.addEventListener('switch-to-kinship', onKinship);
    window.addEventListener('switch-to-list', onList);
    window.addEventListener('switch-to-navigate', onNavigate);
    window.addEventListener('switch-to-branches', onBranches);
    return () => {
      window.removeEventListener('switch-to-kinship', onKinship);
      window.removeEventListener('switch-to-list', onList);
      window.removeEventListener('switch-to-navigate', onNavigate);
      window.removeEventListener('switch-to-branches', onBranches);
    };
  }, [persistTab]);

  const handleTabChange = useCallback((tab: AppTab) => {
    if (tab === "nasab") {
      setShowLineageSearch(true);
      return;
    }
    setActiveTab(tab);
    persistTab(tab);
  }, [persistTab]);

  const handleSearchSelect = useCallback((memberId: string) => {
    if (activeTab === "map") {
      treeRef.current?.search(memberId);
    } else {
      navigate(`/person/${memberId}`);
    }
  }, [activeTab, navigate]);

  const handleGoHome = useCallback(() => {
    setShowLanding(true);
    setFocusBranch(undefined);
  }, []);

  const handleBrowseBranch = useCallback((pillarId: string) => {
    setFocusBranch(pillarId);
    setActiveTab("map");
    persistTab("map");
    setShowLanding(false);
  }, [persistTab]);

  const handleBrowseTree = useCallback(() => {
    setFocusBranch(undefined);
    setActiveTab("map");
    persistTab("map");
    setShowLanding(false);
  }, [persistTab]);

  // Desktop view change from AppHeader
  const handleDesktopViewChange = useCallback((v: ViewMode) => {
    if (v === "nasab" as any) {
      setShowLineageSearch(true);
      return;
    }
    setActiveTab(v as AppTab);
    persistTab(v as AppTab);
  }, [persistTab]);

  if (showLanding) {
    return (
      <LandingPage
        onSearchSelect={(id) => navigate(`/person/${id}`)}
        onBrowseTree={handleBrowseTree}
        onBrowseBranch={handleBrowseBranch}
      />
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-x-hidden">
      <AppHeader
        activeView={tabToViewMode(activeTab)}
        isLineageActive={false}
        onViewChange={handleDesktopViewChange}
        onSearch={handleSearchSelect}
        onReset={() => { setFocusBranch(undefined); treeRef.current?.reset(); }}
        onGoHome={handleGoHome}
      />

      <main className="flex-1 overflow-hidden p-2 md:p-5 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-5">
        {/* Map tab — always mounted, visibility toggled */}
        <div
          className="w-full h-full rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-border/50 bg-[hsl(var(--canvas-bg))] relative"
          style={{
            visibility: activeTab === "map" ? "visible" : "hidden",
            position: activeTab === "map" ? "relative" : "absolute",
            inset: activeTab === "map" ? undefined : 0,
            zIndex: activeTab === "map" ? undefined : -1,
          }}
        >
          <FamilyTree ref={treeRef} focusBranch={focusBranch} />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "navigate" && (
            <motion.div
              key="navigate"
              className="w-full h-full"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
            >
              <SmartNavigateView />
            </motion.div>
          )}
          {activeTab === "branches" && (
            <motion.div
              key="branches"
              className="w-full h-full"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
            >
              <BranchesView />
            </motion.div>
          )}
          {activeTab === "kinship" && (
            <motion.div
              key="kinship"
              className="w-full h-full rounded-2xl md:rounded-3xl shadow-xl overflow-auto border border-border/50 bg-card"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
            >
              <KinshipCalculator />
            </motion.div>
          )}
          {activeTab === "list" && (
            <motion.div
              key="list"
              className="w-full h-full rounded-2xl md:rounded-3xl shadow-xl overflow-auto border border-border/50 bg-card"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
            >
              <ListView onSelectMember={(id) => navigate(`/person/${id}`)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile bottom navigation — 6 items */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around border-t border-border/40 bg-background/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.08)]"
          style={{ paddingBottom: `env(safe-area-inset-bottom)` }}
          role="navigation"
          aria-label="التنقل الرئيسي"
          dir="rtl"
        >
          {TAB_ITEMS.map((item) => {
            const isActive = item.value === "nasab" ? false : activeTab === item.value;
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                onClick={() => handleTabChange(item.value)}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[56px] min-w-[44px] py-1.5 transition-all ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={springConfig}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                </motion.div>
                {!isNarrow && (
                  <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
                    {item.label}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute top-0 h-0.5 w-8 bg-accent rounded-b-full"
                    transition={springConfig}
                  />
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* Lineage search sheet */}
      <Sheet open={showLineageSearch} onOpenChange={setShowLineageSearch}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70dvh]" dir="rtl">
          <SheetHeader>
            <SheetTitle className="text-base font-bold text-right">نسب من؟</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {isLoggedIn && currentUser?.memberId && (() => {
              const member = getMemberById(currentUser.memberId);
              if (!member) return null;
              const isMale = member.gender === "M";
              return (
                <>
                  <button
                    onClick={() => {
                      setShowLineageSearch(false);
                      setLineageQuery("");
                      navigate(`/person/${currentUser.memberId}`);
                    }}
                    className="w-full rounded-xl border bg-primary/5 border-primary/20 p-3 flex items-center gap-3"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isMale ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400'}`}>
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{currentUser.memberName}</div>
                      <div className="text-xs text-primary">عرض نسبي أنا</div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                  <p className="text-xs text-muted-foreground text-center my-3">أو ابحث عن شخص آخر</p>
                </>
              );
            })()}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن اسم..."
                value={lineageQuery}
                onChange={(e) => setLineageQuery(e.target.value)}
                className="pr-10 h-12 rounded-xl text-base"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-[45dvh] space-y-1">
              {lineageQuery.trim().length > 0 && searchMembers(lineageQuery).map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setShowLineageSearch(false);
                    setLineageQuery("");
                    navigate(`/person/${m.id}`);
                  }}
                  className="w-full text-right px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="font-medium text-sm text-foreground">{getLineageLabel(m)}</div>
                  {getMemberSubtitle(m) && (
                    <div className="text-xs text-muted-foreground mt-0.5">{getMemberSubtitle(m)}</div>
                  )}
                </button>
              ))}
              {lineageQuery.trim().length > 0 && searchMembers(lineageQuery).length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-6">لا توجد نتائج</p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
