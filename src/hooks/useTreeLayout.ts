import { useMemo } from "react";
import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";
import { familyMembers } from "@/data/familyData";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 90;
const SPOUSE_WIDTH = 160;
const SPOUSE_HEIGHT = 50;

export function useTreeLayout() {
  return useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", nodesep: 80, ranksep: 160 });
    g.setDefaultEdgeLabel(() => ({}));

    // Build a map of father -> children grouped by mother
    const childrenByFatherAndMother = new Map<string, Map<string, string[]>>();
    familyMembers.forEach((member) => {
      if (!member.father_id) return;
      if (!childrenByFatherAndMother.has(member.father_id)) {
        childrenByFatherAndMother.set(member.father_id, new Map());
      }
      const motherMap = childrenByFatherAndMother.get(member.father_id)!;
      const motherName = member.mother || "__unknown__";
      if (!motherMap.has(motherName)) {
        motherMap.set(motherName, []);
      }
      motherMap.get(motherName)!.push(member.id);
    });

    // Determine which fathers need spouse nodes (multiple mothers with children)
    const fathersWithMultipleWives = new Set<string>();
    childrenByFatherAndMother.forEach((motherMap, fatherId) => {
      const mothersWithChildren = [...motherMap.keys()].filter(k => k !== "__unknown__");
      if (mothersWithChildren.length > 1) {
        fathersWithMultipleWives.add(fatherId);
      }
    });

    // Add all family member nodes to dagre
    familyMembers.forEach((member) => {
      g.setNode(member.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    // Create spouse nodes and edges
    const spouseNodes: { id: string; name: string }[] = [];

    familyMembers.forEach((member) => {
      if (!member.father_id) return;

      if (fathersWithMultipleWives.has(member.father_id) && member.mother && member.mother !== "__unknown__") {
        const spouseId = `spouse-${member.father_id}-${member.mother}`;
        
        // Add spouse node if not already added
        if (!g.hasNode(spouseId)) {
          g.setNode(spouseId, { width: SPOUSE_WIDTH, height: SPOUSE_HEIGHT });
          g.setEdge(member.father_id, spouseId);
          spouseNodes.push({ id: spouseId, name: member.mother });
        }
        
        // Connect child to spouse node
        g.setEdge(spouseId, member.id);
      } else {
        // Single wife or unknown mother - connect directly to father
        g.setEdge(member.father_id, member.id);
      }
    });

    dagre.layout(g);

    const nodes: Node[] = [
      ...familyMembers.map((member) => {
        const pos = g.node(member.id);
        return {
          id: member.id,
          type: "familyCard",
          position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
          data: member,
        };
      }),
      ...spouseNodes.map((spouse) => {
        const pos = g.node(spouse.id);
        return {
          id: spouse.id,
          type: "spouseCard",
          position: { x: pos.x - SPOUSE_WIDTH / 2, y: pos.y - SPOUSE_HEIGHT / 2 },
          data: { name: spouse.name },
        };
      }),
    ];

    // Build edges from dagre
    const edges: Edge[] = g.edges().map((e) => {
      const isSpouseEdge = e.v.startsWith("spouse-") || e.w.startsWith("spouse-");
      const isToSpouse = e.w.startsWith("spouse-");
      
      return {
        id: `e-${e.v}-${e.w}`,
        source: e.v,
        target: e.w,
        type: "smoothstep",
        style: {
          stroke: isToSpouse ? "hsl(145, 30%, 50%)" : "hsl(200, 40%, 50%)",
          strokeWidth: 2,
          strokeDasharray: isToSpouse ? "6 3" : undefined,
        },
        animated: false,
      };
    });

    return { nodes, edges };
  }, []);
}
