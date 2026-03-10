import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type ReactFlowInstance,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTreeLayout } from "@/hooks/useTreeLayout";
import { FamilyCard } from "./FamilyCard";
import { SearchBar } from "./SearchBar";
import { ResetViewButton } from "./ResetViewButton";
import { PersonDetails } from "./PersonDetails";
import type { FamilyMember } from "@/data/familyData";

const nodeTypes = { familyCard: FamilyCard };

export function FamilyTree() {
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

  useEffect(() => {
    // Auto fit on mount
    setTimeout(() => rfInstance.current?.fitView({ padding: 0.2 }), 100);
  }, []);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 right-4 left-4 z-10 flex items-center gap-3">
        <SearchBar onSelect={handleSearch} />
        <ResetViewButton onReset={handleReset} />
      </div>

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
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-background"
      >
        <Background color="hsl(var(--border))" gap={24} size={1} />
        <Controls
          position="bottom-left"
          showInteractive={false}
          className="!bg-card !border-border !shadow-md [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
        />
      </ReactFlow>

      <PersonDetails
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
