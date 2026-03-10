import { useMemo } from "react";
import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";
import { familyMembers } from "@/data/familyData";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 90;
const SPOUSE_WIDTH = 160;
const SPOUSE_HEIGHT = 50;

export const BRANCH_COLORS = [
  { stroke: "hsl(340, 60%, 55%)", bg: "hsl(340, 50%, 94%)", bgDark: "hsl(340, 40%, 25%)" },
  { stroke: "hsl(35, 70%, 50%)",  bg: "hsl(35, 60%, 93%)",  bgDark: "hsl(35, 50%, 25%)" },
  { stroke: "hsl(175, 50%, 40%)", bg: "hsl(175, 40%, 92%)", bgDark: "hsl(175, 35%, 22%)" },
  { stroke: "hsl(270, 45%, 55%)", bg: "hsl(270, 35%, 93%)", bgDark: "hsl(270, 30%, 25%)" },
  { stroke: "hsl(150, 50%, 40%)", bg: "hsl(150, 40%, 92%)", bgDark: "hsl(150, 35%, 22%)" },
];

export function useTreeLayout() {
  return useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", nodesep: 100, ranksep: 180 });
    g.setDefaultEdgeLabel(() => ({}));

    // Build map: father -> mother -> children
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

    // Add all family member nodes
    familyMembers.forEach((member) => {
      g.setNode(member.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    // Track spouse nodes, color assignments, and child->color mapping
    const spouseNodes: { id: string; name: string; colorIndex: number }[] = [];
    const childColorMap = new Map<string, number>(); // memberId -> colorIndex
    const edgeColorMap = new Map<string, number>(); // edgeKey -> colorIndex
    let colorCounter = 0;

    // Create spouse nodes for ALL mothers with known names (even single wife)
    childrenByFatherAndMother.forEach((motherMap, fatherId) => {
      motherMap.forEach((childIds, motherName) => {
        if (motherName === "__unknown__") {
          // No mother known — connect directly
          childIds.forEach((childId) => {
            g.setEdge(fatherId, childId);
          });
          return;
        }

        const spouseId = `spouse-${fatherId}-${motherName}`;
        const ci = colorCounter % BRANCH_COLORS.length;
        colorCounter++;

        g.setNode(spouseId, { width: SPOUSE_WIDTH, height: SPOUSE_HEIGHT });
        g.setEdge(fatherId, spouseId);
        edgeColorMap.set(`e-${fatherId}-${spouseId}`, ci);

        spouseNodes.push({ id: spouseId, name: motherName, colorIndex: ci });

        childIds.forEach((childId) => {
          g.setEdge(spouseId, childId);
          childColorMap.set(childId, ci);
          edgeColorMap.set(`e-${spouseId}-${childId}`, ci);
        });
      });
    });

    // Add spouse nodes for members with spouses but no registered children
    familyMembers.forEach((member) => {
      if (!member.spouses) return;
      const spouseNames = member.spouses.split("،").map((s) => s.trim()).filter(Boolean);
      spouseNames.forEach((spouseName) => {
        const spouseId = `spouse-${member.id}-${spouseName}`;
        if (g.hasNode(spouseId)) return; // already added via children
        const ci = colorCounter % BRANCH_COLORS.length;
        colorCounter++;
        g.setNode(spouseId, { width: SPOUSE_WIDTH, height: SPOUSE_HEIGHT });
        g.setEdge(member.id, spouseId);
        edgeColorMap.set(`e-${member.id}-${spouseId}`, ci);
        spouseNodes.push({ id: spouseId, name: spouseName, colorIndex: ci });
      });
    });

    dagre.layout(g);

    const nodes: Node[] = [
      ...familyMembers.map((member) => {
        const pos = g.node(member.id);
        return {
          id: member.id,
          type: "familyCard",
          position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
          data: { ...member, branchColorIndex: childColorMap.get(member.id) ?? -1 },
        };
      }),
      ...spouseNodes.map((spouse) => {
        const pos = g.node(spouse.id);
        return {
          id: spouse.id,
          type: "spouseCard",
          position: { x: pos.x - SPOUSE_WIDTH / 2, y: pos.y - SPOUSE_HEIGHT / 2 },
          data: { name: spouse.name, colorIndex: spouse.colorIndex },
        };
      }),
    ];

    const edges: Edge[] = g.edges().map((e) => {
      const edgeKey = `e-${e.v}-${e.w}`;
      const ci = edgeColorMap.get(edgeKey);
      const isToSpouse = e.w.startsWith("spouse-");
      const color = ci !== undefined ? BRANCH_COLORS[ci].stroke : "hsl(200, 40%, 50%)";

      return {
        id: edgeKey,
        source: e.v,
        target: e.w,
        type: "smoothstep",
        style: {
          stroke: color,
          strokeWidth: 2,
          strokeDasharray: isToSpouse ? "6 3" : undefined,
        },
        animated: false,
      };
    });

    return { nodes, edges };
  }, []);
}
