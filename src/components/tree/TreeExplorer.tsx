import { useState, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TreeModeSwitcher, type TreeMode } from "./TreeModeSwitcher";
import { SmartNavigateView } from "./SmartNavigateView";
import { BranchesView } from "./BranchesView";
import { FamilyTree, type FamilyTreeRef } from "@/components/FamilyTree";
import { ListView } from "@/components/ListView";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "khunaini-tree-mode";

function getInitialMode(isMobile: boolean): TreeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as TreeMode | null;
    if (stored && ["navigate", "branches", "map", "list"].includes(stored)) return stored;
  } catch {}
  return isMobile ? "navigate" : "map";
}

interface TreeExplorerProps {
  focusBranch?: string;
  treeRef?: React.RefObject<FamilyTreeRef | null>;
  onSearchFromHeader?: (id: string) => void;
}

export function TreeExplorer({ focusBranch, treeRef: externalTreeRef, onSearchFromHeader }: TreeExplorerProps) {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<TreeMode>(() => getInitialMode(isMobile));
  const internalTreeRef = useRef<FamilyTreeRef>(null);
  const activeTreeRef = externalTreeRef || internalTreeRef;
  const navigate = useNavigate();

  const handleModeChange = useCallback((newMode: TreeMode) => {
    setMode(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {}
  }, []);

  const handleSelectMember = useCallback(
    (id: string) => {
      navigate(`/person/${id}`);
    },
    [navigate]
  );

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Mode switcher */}
      <div className="shrink-0 py-2 px-2" style={{ paddingTop: `max(0.5rem, env(safe-area-inset-top, 0px))` }}>
        <TreeModeSwitcher active={mode} onChange={handleModeChange} />
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden relative">
        <div key={mode} className={cn("w-full h-full", "animate-fade-in")}>
          {mode === "navigate" && <SmartNavigateView />}
          {mode === "branches" && <BranchesView />}
          {mode === "map" && (
            <div className="w-full h-full rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-border/50 bg-[hsl(var(--canvas-bg))] relative">
              <FamilyTree ref={activeTreeRef} focusBranch={focusBranch} />
            </div>
          )}
          {mode === "list" && (
            <div className="w-full h-full rounded-2xl md:rounded-3xl shadow-xl overflow-auto border border-border/50 bg-card">
              <ListView onSelectMember={handleSelectMember} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
