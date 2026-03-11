import { useMemo } from "react";
import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";
import { familyMembers } from "@/data/familyData";
import { extractMotherName } from "@/services/familyService";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 100;
const SPOUSE_WIDTH = 160;
const SPOUSE_HEIGHT = 50;

// Warm heritage-aligned branch colors
export const BRANCH_COLORS = [
  { stroke: "hsl(25, 55%, 45%)",   bg: "hsl(25, 40%, 93%)",   bgDark: "hsl(25, 35%, 20%)" },
  { stroke: "hsl(155, 40%, 35%)",  bg: "hsl(155, 30%, 92%)",  bgDark: "hsl(155, 28%, 18%)" },
  { stroke: "hsl(350, 40%, 48%)",  bg: "hsl(350, 30%, 94%)",  bgDark: "hsl(350, 25%, 20%)" },
  { stroke: "hsl(42, 55%, 42%)",   bg: "hsl(42, 40%, 92%)",   bgDark: "hsl(42, 35%, 20%)" },
  { stroke: "hsl(200, 35%, 42%)",  bg: "hsl(200, 25%, 92%)",  bgDark: "hsl(200, 25%, 18%)" },
];

// Build children map once
const childrenOfMap = new Map<string, string[]>();
familyMembers.forEach((m) => {
  if (m.father_id) {
    if (!childrenOfMap.has(m.father_id)) childrenOfMap.set(m.father_id, []);
    childrenOfMap.get(m.father_id)!.push(m.id);
  }
});

// Build mother map once
const motherOfMap = new Map<string, string>();
const memberById = new Map(familyMembers.map((m) => [m.id, m]));
familyMembers.forEach((m) => {
  const mother = extractMotherName(m);
  if (mother) motherOfMap.set(m.id, mother);
});

export function getChildrenOf(id: string): string[] {
  return childrenOfMap.get(id) || [];
}

export function hasChildrenInData(id: string): boolean {
  return (childrenOfMap.get(id)?.length ?? 0) > 0;
}

export function getMotherOf(id: string): string | null {
  return motherOfMap.get(id) || null;
}

export function getDefaultExpandedIds(): Set<string> {
  const expanded = new Set<string>();
  const roots = familyMembers.filter((m) => !m.father_id);
  roots.forEach((r) => expanded.add(r.id));
  return expanded;
}

export function useTreeLayout(expandedIds: Set<string>) {
  return useMemo(() => {
    const visibleIds = new Set<string>();

    familyMembers.forEach((m) => {
      if (!m.father_id) visibleIds.add(m.id);
    });

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

    // Group children by father AND mother
    const childrenByFatherAndMother = new Map<string, Map<string, string[]>>();
    visibleMembers.forEach((member) => {
      if (!member.father_id) return;
      if (!visibleIds.has(member.father_id)) return;
      if (!childrenByFatherAndMother.has(member.father_id))
        childrenByFatherAndMother.set(member.father_id, new Map());
      const motherMap = childrenByFatherAndMother.get(member.father_id)!;
      const motherName = extractMotherName(member) || "__unknown__";
      if (!motherMap.has(motherName)) motherMap.set(motherName, []);
      motherMap.get(motherName)!.push(member.id);
    });

    visibleMembers.forEach((member) => {
      g.setNode(member.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    const spouseNodes: { id: string; name: string; colorIndex: number }[] = [];
    const childColorMap = new Map<string, number>();
    const childMotherMap = new Map<string, string>();
    const edgeColorMap = new Map<string, number>();
    let colorCounter = 0;

    childrenByFatherAndMother.forEach((motherMap, fatherId) => {
      motherMap.forEach((childIds, motherName) => {
        if (motherName === "__unknown__") {
          childIds.forEach((childId) => g.setEdge(fatherId, childId));
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
          childMotherMap.set(childId, motherName);
          edgeColorMap.set(`e-${spouseId}-${childId}`, ci);
        });
      });
    });

    // Add spouse nodes from spouses field that weren't already added via mother grouping
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
            motherName: childMotherMap.get(member.id) ?? null,
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
      const color = ci !== undefined ? BRANCH_COLORS[ci].stroke : "hsl(var(--muted-foreground) / 0.4)";

      return {
        id: edgeKey,
        source: e.v,
        target: e.w,
        type: "smoothstep",
        style: {
          stroke: color,
          strokeWidth: 2.5,
          strokeDasharray: isToSpouse ? "6 3" : undefined,
        },
        animated: false,
      };
    });

    return { nodes, edges };
  }, [expandedIds]);
}
