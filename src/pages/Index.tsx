import { useRef, useState } from "react";
import { AppHeader, type ViewMode } from "@/components/AppHeader";
import { FamilyTree, type FamilyTreeRef } from "@/components/FamilyTree";
import { DataTableView } from "@/components/DataTableView";

const Index = () => {
  const treeRef = useRef<FamilyTreeRef>(null);
  const [activeView, setActiveView] = useState<ViewMode>("tree");

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader
        activeView={activeView}
        onViewChange={setActiveView}
        onSearch={(id) => treeRef.current?.search(id)}
        onReset={() => treeRef.current?.reset()}
      />
      <main className="flex-1 overflow-hidden p-2 md:p-5">
        {activeView === "tree" ? (
          <div className="w-full h-full rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-border/50 bg-[hsl(var(--canvas-bg))]">
            <FamilyTree ref={treeRef} />
          </div>
        ) : (
          <div className="w-full h-full rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-border/50 bg-card">
            <DataTableView />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
