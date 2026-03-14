import { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppHeader, type ViewMode } from "@/components/AppHeader";
import { FamilyTree, type FamilyTreeRef } from "@/components/FamilyTree";
import { LandingPage } from "@/components/LandingPage";
import { KinshipCalculator } from "@/components/KinshipCalculator";
import { TreeExplorer } from "@/components/tree/TreeExplorer";
import { loadMembers, searchMembers } from "@/services/familyService";
import { useAuth } from "@/contexts/AuthContext";
import { getLineageLabel, getMemberSubtitle } from "@/utils/memberLabel";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
        onViewChange={(v) => {
          if (v === "lineage") return;
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
    </div>
  );
};

export default Index;
