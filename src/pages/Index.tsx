import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader, type ViewMode } from "@/components/AppHeader";
import { FamilyTree, type FamilyTreeRef } from "@/components/FamilyTree";
import { DataTableView } from "@/components/DataTableView";
import { LandingPage } from "@/components/LandingPage";
import { LineageView } from "@/components/LineageView";
import { ListView } from "@/components/ListView";

export type AppView = "landing" | ViewMode;

const Index = () => {
  const treeRef = useRef<FamilyTreeRef>(null);
  const [activeView, setActiveView] = useState<AppView>("landing");
  const navigate = useNavigate();

  const handleSearchSelect = (memberId: string) => {
    navigate(`/person/${memberId}`);
  };

  const handleGoHome = () => {
    setActiveView("landing");
    setLineageTargetId(null);
  };

  if (activeView === "landing") {
    return (
      <LandingPage
        onSearchSelect={handleSearchSelect}
        onBrowseTree={() => setActiveView("tree")}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-x-hidden">
      <AppHeader
        activeView={activeView as ViewMode}
        onViewChange={(v) => setActiveView(v)}
        onSearch={(id) => {
          if (activeView === "tree") {
            treeRef.current?.search(id);
          } else {
            handleSearchSelect(id);
          }
        }}
        onReset={() => treeRef.current?.reset()}
        onGoHome={handleGoHome}
      />
      <main className="flex-1 overflow-hidden p-2 md:p-5 pb-16 md:pb-5" key={activeView}>
        {activeView === "tree" && (
          <div className="w-full h-full rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-border/50 bg-[hsl(var(--canvas-bg))] animate-fade-in">
            <FamilyTree ref={treeRef} />
          </div>
        )}
        {activeView === "lineage" && lineageTargetId && (
          <div className="w-full h-full rounded-2xl md:rounded-3xl shadow-xl overflow-auto border border-border/50 bg-card animate-fade-in">
            <LineageView memberId={lineageTargetId} onSelectMember={handleSearchSelect} />
          </div>
        )}
        {activeView === "list" && (
          <div className="w-full h-full rounded-2xl md:rounded-3xl shadow-xl overflow-auto border border-border/50 bg-card animate-fade-in">
            <ListView onSelectMember={handleSearchSelect} />
          </div>
        )}
        {activeView === "table" && (
          <div className="w-full h-full rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-border/50 bg-card animate-fade-in">
            <DataTableView />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
