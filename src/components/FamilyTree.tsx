import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  type ReactFlowInstance,
  type Node,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { refreshMembers, getAllMembers } from "@/services/familyService";
import { Plus, Minus, Maximize2, RotateCcw, LocateFixed, Eye, EyeOff } from "lucide-react";
import { useTreeLayout, getDefaultExpandedIds } from "@/hooks/useTreeLayout";
import { FamilyCard } from "./FamilyCard";
import { PersonDetails } from "./PersonDetails";
import type { FamilyMember } from "@/data/familyData";
import { getBranch } from "@/utils/branchUtils";
import { getChildrenOf } from "@/services/familyService";
import { useAuth } from "@/contexts/AuthContext";

const nodeTypes = { familyCard: FamilyCard };

export interface FamilyTreeRef {
  search: (memberId: string) => void;
  reset: () => void;
}

interface FamilyTreeProps {
  focusBranch?: string;
}

export const FamilyTree = forwardRef<FamilyTreeRef, FamilyTreeProps>(function FamilyTree({ focusBranch }, ref) {
  const { currentUser } = useAuth();
  const myMemberId = currentUser?.memberId || "100";

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (focusBranch) {
      return getBranchExpandedIds(focusBranch);
    }
    return getDefaultExpandedIds();
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const { nodes: layoutNodes, edges: layoutEdges } = useTreeLayout(expandedIds, refreshKey);

  // Listen for data updates
  useEffect(() => {
    const handler = async () => {
      await refreshMembers();
      setRefreshKey((k) => k + 1);
    };
    window.addEventListener("family-data-updated", handler);
    return () => window.removeEventListener("family-data-updated", handler);
  }, []);

  // React to focusBranch changes
  useEffect(() => {
    if (focusBranch) {
      setExpandedIds(getBranchExpandedIds(focusBranch));
      setTimeout(() => {
        rfInstance.current?.fitView({ nodes: [{ id: focusBranch }], duration: 600, padding: 0.3 });
      }, 300);
    }
  }, [focusBranch]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
    setTimeout(() => rfInstance.current?.fitView({ duration: 400, padding: 0.2 }), 50);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  const handleToggleExpand = useCallback((memberId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const data = node.data as any;
    if (data.gender) setSelectedMember(data as unknown as FamilyMember);
  }, []);

  const onPaneClick = useCallback(() => setSelectedMember(null), []);

  const handleSearch = useCallback(
    (memberId: string) => {
      if (!rfInstance.current) return;
      const allMembers = getAllMembers();
      const memberMap = new Map<string, FamilyMember>(allMembers.map((m) => [m.id, m]));
      const ancestorIds = new Set<string>();
      let current = memberMap.get(memberId);
      while (current?.father_id) {
        ancestorIds.add(current.father_id);
        current = memberMap.get(current.father_id);
      }
      setExpandedIds((prev) => {
        const next = new Set(prev);
        ancestorIds.forEach((id) => next.add(id));
        return next;
      });
      setTimeout(() => {
        rfInstance.current?.fitView({ nodes: [{ id: memberId }], duration: 600, padding: 0.5 });
        setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === memberId })));
        const member = memberMap.get(memberId);
        if (member) setSelectedMember(member);
      }, 300);
    },
    [setNodes]
  );

  const handleReset = useCallback(() => {
    setExpandedIds(getDefaultExpandedIds());
    setSelectedMember(null);
    setTimeout(() => rfInstance.current?.fitView({ duration: 500, padding: 0.2 }), 100);
  }, []);

  const handleLocateMe = useCallback(() => {
    if (!rfInstance.current) return;
    // Expand ancestors to make the node visible
    const allMembers = getAllMembers();
    const memberMap = new Map<string, FamilyMember>(allMembers.map((m) => [m.id, m]));
    const ancestorIds = new Set<string>();
    let current = memberMap.get(myMemberId);
    while (current?.father_id) {
      ancestorIds.add(current.father_id);
      current = memberMap.get(current.father_id);
    }
    setExpandedIds((prev) => {
      const next = new Set(prev);
      ancestorIds.forEach((id) => next.add(id));
      return next;
    });
    setTimeout(() => {
      rfInstance.current?.fitView({ nodes: [{ id: myMemberId }], duration: 600, padding: 0.5 });
    }, 300);
  }, [myMemberId]);

  useImperativeHandle(ref, () => ({ search: handleSearch, reset: handleReset }), [handleSearch, handleReset]);

  useEffect(() => {
    (window as any).__toggleExpandNode = handleToggleExpand;
    return () => { delete (window as any).__toggleExpandNode; };
  }, [handleToggleExpand]);

  return (
    <div className="relative w-full h-full canvas-dots">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        onInit={(instance) => { rfInstance.current = instance; }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        minZoom={0.15}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        {showMiniMap && (
          <MiniMap
            nodeStrokeWidth={3}
            pannable
            zoomable
            className="!bg-card/80 !border-border !rounded-xl !shadow-lg !backdrop-blur-sm"
            maskColor="hsl(var(--muted) / 0.5)"
            nodeColor={(node) => {
              const data = node.data as any;
              if (node.type === 'spouseCard') return 'hsl(var(--accent))';
              return data?.gender === 'M' ? 'hsl(var(--male))' : 'hsl(var(--female))';
            }}
            style={{ width: 160, height: 100 }}
          />
        )}
      </ReactFlow>

      {/* Zoom + utility controls */}
      <div className="absolute bottom-5 left-5 flex flex-col bg-card/90 backdrop-blur-md rounded-2xl border border-border shadow-xl overflow-hidden z-10">
        <button
          onClick={() => rfInstance.current?.zoomIn({ duration: 200 })}
          className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-accent/15 hover:text-accent transition-colors"
          title="تكبير"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="h-px bg-border mx-2" />
        <button
          onClick={() => rfInstance.current?.zoomOut({ duration: 200 })}
          className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-accent/15 hover:text-accent transition-colors"
          title="تصغير"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="h-px bg-border mx-2" />
        <button
          onClick={() => rfInstance.current?.fitView({ duration: 400, padding: 0.2 })}
          className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-accent/15 hover:text-accent transition-colors"
          title="ملائمة العرض"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <div className="h-px bg-border mx-2" />
        <button
          onClick={handleLocateMe}
          className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-accent/15 hover:text-accent transition-colors"
          title="أين أنا؟"
        >
          <LocateFixed className="h-4 w-4" />
        </button>
        <div className="h-px bg-border mx-2" />
        <button
          onClick={() => setShowMiniMap((v) => !v)}
          className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-accent/15 hover:text-accent transition-colors"
          title={showMiniMap ? "إخفاء الخريطة المصغرة" : "إظهار الخريطة المصغرة"}
        >
          {showMiniMap ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <div className="h-px bg-border mx-2" />
        <button
          onClick={() => {
            setExpandedIds(getDefaultExpandedIds());
            setSelectedMember(null);
            setTimeout(() => rfInstance.current?.fitView({ duration: 500, padding: 0.2 }), 100);
          }}
          className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-accent/15 hover:text-accent transition-colors"
          title="إعادة الضبط"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <PersonDetails
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
});

function getBranchExpandedIds(pillarId: string): Set<string> {
  const ids = new Set<string>();
  const allMembers = getAllMembers();
  const memberMap = new Map(allMembers.map((m) => [m.id, m]));
  let current = memberMap.get(pillarId);
  while (current) {
    ids.add(current.id);
    if (current.father_id) {
      current = memberMap.get(current.father_id);
    } else {
      break;
    }
  }
  const children = getChildrenOf(pillarId);
  children.forEach((c) => ids.add(c.id));
  return ids;
}
