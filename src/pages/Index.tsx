import { useRef } from "react";
import { AppHeader } from "@/components/AppHeader";
import { FamilyTree, type FamilyTreeRef } from "@/components/FamilyTree";

const Index = () => {
  const treeRef = useRef<FamilyTreeRef>(null);

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader
        onSearch={(id) => treeRef.current?.search(id)}
        onReset={() => treeRef.current?.reset()}
      />
      <main className="flex-1 overflow-hidden p-2 md:p-5">
        <div className="w-full h-full rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-border/50 bg-[hsl(var(--canvas-bg))]">
          <FamilyTree ref={treeRef} />
        </div>
      </main>
    </div>
  );
};

export default Index;
