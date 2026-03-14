import { useMemo } from "react";
import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";
import { getAllMembers, inferMotherName, sortByBirth } from "@/services/familyService";
import { getVerifiedMemberIds } from "@/services/dataService";

// Warm heritage-aligned branch colors
export const BRANCH_COLORS = [
  { stroke: "hsl(25, 55%, 45%)",   bg: "hsl(25, 40%, 93%)",   bgDark: "hsl(25, 35%, 20%)" },
  { stroke: "hsl(155, 40%, 35%)",  bg: "hsl(155, 30%, 92%)",  bgDark: "hsl(155, 28%, 18%)" },
  { stroke: "hsl(350, 40%, 48%)",  bg: "hsl(350, 30%, 94%)",  bgDark: "hsl(350, 25%, 20%)" },
  { stroke: "hsl(42, 55%, 42%)",   bg: "hsl(42, 40%, 92%)",   bgDark: "hsl(42, 35%, 20%)" },
  { stroke: "hsl(200, 35%, 42%)",  bg: "hsl(200, 25%, 92%)",  bgDark: "hsl(200, 25%, 18%)" },
];

function buildChildrenOfMap(members: ReturnType<typeof getAllMembers>) {
  const map = new Map<string, string[]>();
  members.forEach((m) => {
    if (m.father_id) {
      if (!map.has(m.father_id)) map.set(m.father_id, []);
      map.get(m.father_id)!.push(m.id);
    }
  });
  return map;
}

export function getChildrenOf(id: string): string[] {
  const members = getAllMembers();
  return members.filter((m) => m.father_id === id).map((m) => m.id);
}

export function hasChildrenInData(id: string): boolean {
  const members = getAllMembers();
  return members.some((m) => m.father_id === id);
}

export function getMotherOf(id: string): string | null {
  const members = getAllMembers();
  const member = members.find((m) => m.id === id);
  if (!member) return null;
  return inferMotherName(member);
}

export function getDefaultExpandedIds(): Set<string> {
  const expanded = new Set<string>();
  const members = getAllMembers();
  members.filter((m) => !m.father_id).forEach((r) => expanded.add(r.id));
  return expanded;
}

export function useTreeLayout(expandedIds: Set<string>, _refreshKey?: number) {
  return useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const CARD_WIDTH = isMobile ? 155 : 220;
    const CARD_HEIGHT = isMobile ? 75 : 100;
    const NODE_SEP = isMobile ? 55 : 100;
    const RANK_SEP = isMobile ? 110 : 180;

    const currentMembers = getAllMembers();
    const memberById = new Map(currentMembers.map((m) => [m.id, m]));
    const childrenOfMap = buildChildrenOfMap(currentMembers);
    const verifiedIds = getVerifiedMemberIds();

    const visibleIds = new Set<string>();

    currentMembers.forEach((m) => {
      if (!m.father_id) visibleIds.add(m.id);
    });

    let changed = true;
    while (changed) {
      changed = false;
      currentMembers.forEach((m) => {
        if (visibleIds.has(m.id)) return;
        if (m.father_id && visibleIds.has(m.father_id) && expandedIds.has(m.father_id)) {
          visibleIds.add(m.id);
          changed = true;
        }
      });
    }

    const visibleMembers = currentMembers.filter((m) => visibleIds.has(m.id));

    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", nodesep: NODE_SEP, ranksep: RANK_SEP });
    g.setDefaultEdgeLabel(() => ({}));

    // Group children by father AND mother
    const childrenByFatherAndMother = new Map<string, Map<string, string[]>>();
    visibleMembers.forEach((member) => {
      if (!member.father_id) return;
      if (!visibleIds.has(member.father_id)) return;
      if (!childrenByFatherAndMother.has(member.father_id))
        childrenByFatherAndMother.set(member.father_id, new Map());
      const motherMap = childrenByFatherAndMother.get(member.father_id)!;
      const motherName = inferMotherName(member) || "__unknown__";
      if (!motherMap.has(motherName)) motherMap.set(motherName, []);
      motherMap.get(motherName)!.push(member.id);
    });

    visibleMembers.forEach((member) => {
      g.setNode(member.id, { width: CARD_WIDTH, height: CARD_HEIGHT });
    });

    const childColorMap = new Map<string, number>();
    const childMotherMap = new Map<string, string>();
    const edgeColorMap = new Map<string, number>();
    let colorCounter = 0;

    // Collect spouse names per father
    const fatherSpouseNames = new Map<string, string[]>();

    childrenByFatherAndMother.forEach((motherMap, fatherId) => {
      const names: string[] = [];
      motherMap.forEach((childIds, motherName) => {
        // Sort children within each mother group by birth
        const sortedChildIds = sortByBirth(childIds.map((id) => memberById.get(id)!)).map((m) => m.id);
        const ci = colorCounter % BRANCH_COLORS.length;
        colorCounter++;
        if (motherName !== "__unknown__") {
          names.push(motherName);
        }
        sortedChildIds.forEach((childId) => {
          g.setEdge(fatherId, childId);
          if (motherName !== "__unknown__") {
            childColorMap.set(childId, ci);
            childMotherMap.set(childId, motherName);
          }
          edgeColorMap.set(`e-${fatherId}-${childId}`, ci);
        });
      });
      if (names.length > 0) {
        fatherSpouseNames.set(fatherId, names);
      }
    });

    // Add spouses from spouses field that weren't captured via mother grouping
    visibleMembers.forEach((member) => {
      if (!member.spouses) return;
      const spouseNames = member.spouses.split("،").map((s) => s.trim()).filter(Boolean);
      const existing = fatherSpouseNames.get(member.id) || [];
      const merged = [...new Set([...existing, ...spouseNames])];
      if (merged.length > 0) {
        fatherSpouseNames.set(member.id, merged);
      }
    });

    dagre.layout(g);

    const nodes: Node[] = visibleMembers.map((member) => {
      const pos = g.node(member.id);
      return {
        id: member.id,
        type: "familyCard",
        position: { x: pos.x - CARD_WIDTH / 2, y: pos.y - CARD_HEIGHT / 2 },
        data: {
          ...member,
          branchColorIndex: childColorMap.get(member.id) ?? -1,
          motherName: childMotherMap.get(member.id) ?? inferMotherName(member),
          spouseNames: fatherSpouseNames.get(member.id) ?? [],
          hasChildren: hasChildrenInData(member.id),
          isExpanded: expandedIds.has(member.id),
          isVerified: verifiedIds.has(member.id),
          isMobile,
        },
      };
    });

    const edges: Edge[] = g.edges().map((e) => {
      const edgeKey = `e-${e.v}-${e.w}`;
      const ci = edgeColorMap.get(edgeKey);
      const color = ci !== undefined ? BRANCH_COLORS[ci].stroke : "hsl(var(--muted-foreground) / 0.4)";

      return {
        id: edgeKey,
        source: e.v,
        target: e.w,
        type: "smoothstep",
        style: {
          stroke: color,
          strokeWidth: 2.5,
        },
        animated: false,
      };
    });

    return { nodes, edges };
  }, [expandedIds, _refreshKey]);
}
