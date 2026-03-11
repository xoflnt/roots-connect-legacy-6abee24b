import { useMemo } from "react";
import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";
import { familyMembers } from "@/data/familyData";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 100;
const SPOUSE_WIDTH = 160;
const SPOUSE_HEIGHT = 50;

export const BRANCH_COLORS = [
  { stroke: "hsl(340, 60%, 55%)", bg: "hsl(340, 50%, 94%)", bgDark: "hsl(340, 40%, 25%)" },
  { stroke: "hsl(35, 70%, 50%)",  bg: "hsl(35, 60%, 93%)",  bgDark: "hsl(35, 50%, 25%)" },
  { stroke: "hsl(175, 50%, 40%)", bg: "hsl(175, 40%, 92%)", bgDark: "hsl(175, 35%, 22%)" },
  { stroke: "hsl(270, 45%, 55%)", bg: "hsl(270, 35%, 93%)", bgDark: "hsl(270, 30%, 25%)" },
  { stroke: "hsl(150, 50%, 40%)", bg: "hsl(150, 40%, 92%)", bgDark: "hsl(150, 35%, 22%)" },
];

// Build children map once
const childrenOfMap = new Map<string, string[]>();
familyMembers.forEach((m) => {
  if (m.father_id) {
    if (!childrenOfMap.has(m.father_id)) childrenOfMap.set(m.father_id, []);
    childrenOfMap.get(m.father_id)!.push(m.id);
  }
});

export function getChildrenOf(id: string): string[] {
  return childrenOfMap.get(id) || [];
}

export function hasChildrenInData(id: string): boolean {
  return (childrenOfMap.get(id)?.length ?? 0) > 0;
}

export function getDefaultExpandedIds(): Set<string> {
  // Show root + generation 2 (children of root members)
  const expanded = new Set<string>();
  const roots = familyMembers.filter((m) => !m.father_id);
  roots.forEach((r) => expanded.add(r.id));
  // Also expand gen1 members that have father_id pointing to roots
  // Actually: roots are gen1, their children are gen2 — we want gen2 visible but not expanded
  // So we expand roots only, which shows their children (gen2)
  return expanded;
}

export function useTreeLayout(expandedIds: Set<string>) {
  return useMemo(() => {
    const memberMap = new Map(familyMembers.map((m) => [m.id, m]));

    // Determine visible members: a member is visible if all ancestors up to root are expanded
    const visibleIds = new Set<string>();
    
    // Root members are always visible
    familyMembers.forEach((m) => {
      if (!m.father_id) visibleIds.add(m.id);
    });

    // A member is visible if their father is visible AND expanded
    // We need to process in order (parents before children)
    // Simple approach: iterate until stable
    let changed = true;
    while (changed) {
      changed = false;
      familyMembers.forEach((m) => {
        if (visibleIds.has(m.id)) return;
        if (m.father_id && visibleIds.has(m.father_id) && expandedIds.has(m.father_id)) {
          visibleIds.add(m.id);
          changed = true;
        }
      });
    }

    const visibleMembers = familyMembers.filter((m) => visibleIds.has(m.id));

    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", nodesep: 100, ranksep: 180 });
    g.setDefaultEdgeLabel(() => ({}));

    // Build map: father -> mother -> children (only for visible members)
    const childrenByFatherAndMother = new Map<string, Map<string, string[]>>();
    visibleMembers.forEach((member) => {
      if (!member.father_id) return;
      if (!visibleIds.has(member.father_id)) return;
      if (!childrenByFatherAndMother.has(member.father_id)) {
        childrenByFatherAndMother.set(member.father_id, new Map());
      }
      const motherMap = childrenByFatherAndMother.get(member.father_id)!;
      const motherName = "__unknown__";
      if (!motherMap.has(motherName)) {
        motherMap.set(motherName, []);
      }
      motherMap.get(motherName)!.push(member.id);
    });

    // Add visible family member nodes
    visibleMembers.forEach((member) => {
      g.setNode(member.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    const spouseNodes: { id: string; name: string; colorIndex: number }[] = [];
    const childColorMap = new Map<string, number>();
    const edgeColorMap = new Map<string, number>();
    let colorCounter = 0;

    childrenByFatherAndMother.forEach((motherMap, fatherId) => {
      motherMap.forEach((childIds, motherName) => {
        if (motherName === "__unknown__") {
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

    // Add spouse nodes for visible members with spouses but no registered children
    visibleMembers.forEach((member) => {
      if (!member.spouses) return;
      const spouseNames = member.spouses.split("،").map((s) => s.trim()).filter(Boolean);
      spouseNames.forEach((spouseName) => {
        const spouseId = `spouse-${member.id}-${spouseName}`;
        if (g.hasNode(spouseId)) return;
        const ci = colorCounter % BRANCH_COLORS.length;
        colorCounter++;
        g.setNode(spouseId, { width: SPOUSE_WIDTH, height: SPOUSE_HEIGHT });
        g.setEdge(member.id, spouseId);
        edgeColorMap.set(`e-${member.id}-${spouseId}`, ci);
        spouseNodes.push({ id: spouseId, name: spouseName, colorIndex: ci });
      });
    });

    dagre.layout(g);

    // hasChildren map for visible members
    const hasChildrenMap = new Map<string, boolean>();
    visibleMembers.forEach((m) => {
      hasChildrenMap.set(m.id, hasChildrenInData(m.id));
    });

    const nodes: Node[] = [
      ...visibleMembers.map((member) => {
        const pos = g.node(member.id);
        return {
          id: member.id,
          type: "familyCard",
          position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
          data: {
            ...member,
            branchColorIndex: childColorMap.get(member.id) ?? -1,
            hasChildren: hasChildrenMap.get(member.id) ?? false,
            isExpanded: expandedIds.has(member.id),
          },
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
  }, [expandedIds]);
}
