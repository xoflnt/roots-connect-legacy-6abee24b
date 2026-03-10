import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  type ReactFlowInstance,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Plus, Minus, Maximize2 } from "lucide-react";
import { useTreeLayout } from "@/hooks/useTreeLayout";
import { FamilyCard } from "./FamilyCard";
import { SpouseCard } from "./SpouseCard";
import { PersonDetails } from "./PersonDetails";
import type { FamilyMember } from "@/data/familyData";

const nodeTypes = { familyCard: FamilyCard, spouseCard: SpouseCard };

export interface FamilyTreeRef {
  search: (memberId: string) => void;
  reset: () => void;
}

export const FamilyTree = forwardRef<FamilyTreeRef>(function FamilyTree(_, ref) {
  const { nodes: initialNodes, edges: initialEdges } = useTreeLayout();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedMember(node.data as unknown as FamilyMember);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedMember(null);
  }, []);

  const handleSearch = useCallback(
    (memberId: string) => {
      if (!rfInstance.current) return;
      const node = nodes.find((n) => n.id === memberId);
      if (!node) return;

      rfInstance.current.fitView({
        nodes: [{ id: memberId }],
        duration: 600,
        padding: 0.5,
      });

      setNodes((nds) =>
        nds.map((n) => ({ ...n, selected: n.id === memberId }))
      );
      const member = node.data as unknown as FamilyMember;
      setSelectedMember(member);
    },
    [nodes, setNodes]
  );

  const handleReset = useCallback(() => {
    rfInstance.current?.fitView({ duration: 500, padding: 0.2 });
    setSelectedMember(null);
  }, []);

  useImperativeHandle(ref, () => ({
    search: handleSearch,
    reset: handleReset,
  }), [handleSearch, handleReset]);

  useEffect(() => {
    setTimeout(() => rfInstance.current?.fitView({ padding: 0.2 }), 100);
  }, []);

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          rfInstance.current = instance;
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      />

      {/* Custom zoom controls */}
      <div className="absolute bottom-5 left-5 flex flex-col gap-2 z-10">
        <button
          onClick={() => rfInstance.current?.zoomIn({ duration: 200 })}
          className="w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-muted transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => rfInstance.current?.zoomOut({ duration: 200 })}
          className="w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-muted transition-colors"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => rfInstance.current?.fitView({ duration: 400, padding: 0.2 })}
          className="w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-muted transition-colors"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      <PersonDetails
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
});
