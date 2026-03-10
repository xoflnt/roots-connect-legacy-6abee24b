import { useMemo } from "react";
import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";
import { familyMembers } from "@/data/familyData";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 90;

export function useTreeLayout() {
  return useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", nodesep: 200, ranksep: 300 });
    g.setDefaultEdgeLabel(() => ({}));

    familyMembers.forEach((member) => {
      g.setNode(member.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    familyMembers.forEach((member) => {
      if (member.father_id) {
        g.setEdge(member.father_id, member.id);
      }
    });

    dagre.layout(g);

    const nodes: Node[] = familyMembers.map((member) => {
      const pos = g.node(member.id);
      return {
        id: member.id,
        type: "familyCard",
        position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
        data: member,
      };
    });

    const edges: Edge[] = familyMembers
      .filter((m) => m.father_id)
      .map((m) => ({
        id: `e-${m.father_id}-${m.id}`,
        source: m.father_id!,
        target: m.id,
        type: "smoothstep",
        style: { stroke: "hsl(200, 40%, 50%)", strokeWidth: 2 },
        animated: false,
      }));

    return { nodes, edges };
  }, []);
}
