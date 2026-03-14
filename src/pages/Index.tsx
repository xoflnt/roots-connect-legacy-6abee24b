import { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppHeader, type ViewMode } from "@/components/AppHeader";
import { FamilyTree, type FamilyTreeRef } from "@/components/FamilyTree";
import { LandingPage } from "@/components/LandingPage";
import { KinshipCalculator } from "@/components/KinshipCalculator";
import { TreeExplorer } from "@/components/tree/TreeExplorer";
import { loadMembers, searchMembers, getMemberById } from "@/services/familyService";
import { useAuth } from "@/contexts/AuthContext";
import { getLineageLabel, getMemberSubtitle } from "@/utils/memberLabel";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Search, User, ChevronLeft } from "lucide-react";

export type AppView = "landing" | ViewMode;

const VALID_VIEWS: ViewMode[] = ["tree", "list", "kinship", "lineage"];

const Index = () => {
  const treeRef = useRef<FamilyTreeRef>(null);
  const [searchParams] = useSearchParams();
  const [ready, setReady] = useState(false);
  const { currentUser, isLoggedIn } = useAuth();
  const [showLineageSearch, setShowLineageSearch] = useState(false);
  const [lineageQuery, setLineageQuery] = useState("");

  useEffect(() => {
    loadMembers().finally(() => setReady(true));
  }, []);
  const initialView = searchParams.get("view");
  const [activeView, setActiveView] = useState<AppView>(
    initialView && VALID_VIEWS.includes(initialView as ViewMode) ? (initialView as AppView) : "landing"
  );
  const [focusBranch, setFocusBranch] = useState<string | undefined>();
  const navigate = useNavigate();

  const handleSearchSelect = (memberId: string) => {
    navigate(`/person/${memberId}`);
  };

  const handleGoHome = () => {
    setActiveView("landing");
    setFocusBranch(undefined);
  };

  const handleBrowseBranch = (pillarId: string) => {
    setFocusBranch(pillarId);
    setActiveView("tree");
  };

  if (activeView === "landing") {
    return (
      <LandingPage
        onSearchSelect={handleSearchSelect}
        onBrowseTree={() => { setFocusBranch(undefined); setActiveView("tree"); }}
        onBrowseBranch={handleBrowseBranch}
      />
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-x-hidden">
      <AppHeader
        activeView={activeView as ViewMode}
        isLineageActive={false}
        onViewChange={(v) => {
          if (v === "lineage") {
            if (isLoggedIn && currentUser?.memberId) {
              navigate(`/person/${currentUser.memberId}`);
            } else {
              setShowLineageSearch(true);
            }
            return;
          }
          setActiveView(v);
        }}
        onSearch={(id) => {
          if (activeView === "tree") {
            treeRef.current?.search(id);
          } else {
            handleSearchSelect(id);
          }
        }}
        onReset={() => { setFocusBranch(undefined); treeRef.current?.reset(); }}
        onGoHome={handleGoHome}
      />
      <main className="flex-1 overflow-hidden p-2 md:p-5 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-5">
        <div key={activeView} className="w-full h-full animate-slide-up">
          {(activeView === "tree" || activeView === "list") && (
            <TreeExplorer focusBranch={focusBranch} treeRef={treeRef} />
          )}
          {activeView === "kinship" && (
            <div className="w-full h-full rounded-2xl md:rounded-3xl shadow-xl overflow-auto border border-border/50 bg-card">
              <KinshipCalculator />
            </div>
          )}
        </div>
      </main>
      {/* Lineage search sheet for guests */}
      <Sheet open={showLineageSearch} onOpenChange={setShowLineageSearch}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70dvh]" dir="rtl">
          <SheetHeader>
            <SheetTitle className="text-center">ابحث عن شخص لعرض نسبه</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="اكتب اسم الشخص..."
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
