import { useMemo } from "react";
import { hierarchy, tree as d3tree } from "d3-hierarchy";
import type { Node, Edge } from "@xyflow/react";
import { getAllMembers, getDepth, inferMotherName, isDeceased, sortByBirth } from "@/services/familyService";
import { getVerifiedMemberIds } from "@/services/dataService";
import { getBranch } from "@/utils/branchUtils";

// Warm heritage-aligned branch colors
export const BRANCH_COLORS = [
  { stroke: "hsl(25, 55%, 45%)",   bg: "hsl(25, 40%, 93%)",   bgDark: "hsl(25, 35%, 20%)" },
  { stroke: "hsl(155, 40%, 35%)",  bg: "hsl(155, 30%, 92%)",  bgDark: "hsl(155, 28%, 18%)" },
  { stroke: "hsl(350, 40%, 48%)",  bg: "hsl(350, 30%, 94%)",  bgDark: "hsl(350, 25%, 20%)" },
  { stroke: "hsl(42, 55%, 42%)",   bg: "hsl(42, 40%, 92%)",   bgDark: "hsl(42, 35%, 20%)" },
  { stroke: "hsl(200, 35%, 42%)",  bg: "hsl(200, 25%, 92%)",  bgDark: "hsl(200, 25%, 18%)" },
];

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

export interface TreeFilters {
  branch: string;
  gender: string;
  living: string;
}

interface HierarchyMember {
  id: string;
  _virtual?: boolean;
  [key: string]: unknown;
}

export function useTreeLayout(expandedIds: Set<string>, _refreshKey?: number, filters?: TreeFilters, isLoggedIn: boolean = false) {
  return useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const CARD_WIDTH = isMobile ? 155 : 220;
    const CARD_HEIGHT = isMobile ? 75 : 100;
    const NODE_SEP = isMobile ? 55 : 100;
    const RANK_SEP = isMobile ? 110 : 180;

    const currentMembers = getAllMembers();
    const totalCount = currentMembers.length;
    const memberById = new Map(currentMembers.map((m) => [m.id, m]));
    const verifiedIds = getVerifiedMemberIds();

    // --- Visibility expansion (unchanged) ---
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

    // --- Apply filters (unchanged) ---
    if (filters && (filters.branch !== 'all' || filters.gender !== 'all' || filters.living !== 'all')) {
      const matchingIds = new Set<string>();
      for (const id of visibleIds) {
        const member = memberById.get(id);
        if (!member) continue;
        let matches = true;
        if (filters.branch !== 'all') {
          const b = getBranch(member.id);
          if (!b || b.pillarId !== filters.branch) matches = false;
        }
        if (filters.gender !== 'all' && member.gender !== filters.gender) matches = false;
        if (filters.living !== 'all') {
          const dead = isDeceased(member);
          if (filters.living === 'living' && dead) matches = false;
          if (filters.living === 'deceased' && !dead) matches = false;
        }
        if (matches) matchingIds.add(id);
      }
      const withAncestors = new Set(matchingIds);
      for (const id of matchingIds) {
        let current = memberById.get(id);
        while (current?.father_id) {
          withAncestors.add(current.father_id);
          current = memberById.get(current.father_id);
        }
      }
      for (const id of visibleIds) {
        if (!withAncestors.has(id)) visibleIds.delete(id);
      }
    }

    const visibleMembers = currentMembers.filter((m) => visibleIds.has(m.id));
    const filteredCount = visibleMembers.length;

    // --- Mother grouping & color assignment (preserved) ---
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

    const childColorMap = new Map<string, number>();
    const childMotherMap = new Map<string, string>();
    const edgeColorMap = new Map<string, number>();
    let colorCounter = 0;
    const fatherSpouseNames = new Map<string, string[]>();

    childrenByFatherAndMother.forEach((motherMap, fatherId) => {
      const names: string[] = [];
      motherMap.forEach((childIds, motherName) => {
        const sortedChildIds = sortByBirth(childIds.map((id) => memberById.get(id)!)).map((m) => m.id);
        const ci = colorCounter % BRANCH_COLORS.length;
        colorCounter++;
        if (motherName !== "__unknown__") {
          names.push(motherName);
        }
        sortedChildIds.forEach((childId) => {
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

    // Add spouses from spouses field
    visibleMembers.forEach((member) => {
      if (!member.spouses) return;
      const spouseNames = member.spouses.split("،").map((s) => s.trim()).filter(Boolean);
      const existing = fatherSpouseNames.get(member.id) || [];
      const merged = [...new Set([...existing, ...spouseNames])];
      if (merged.length > 0) {
        fatherSpouseNames.set(member.id, merged);
      }
    });

    // --- d3-hierarchy layout ---
    const visibleSet = visibleIds;
    const visibleMemberById = new Map(visibleMembers.map((m) => [m.id, m]));

    // Build children lookup for visible members, sorted by birth
    const getVisibleChildren = (parentId: string): HierarchyMember[] => {
      const children = visibleMembers.filter((m) => m.father_id === parentId);
      return sortByBirth(children) as unknown as HierarchyMember[];
    };

    // Find roots (no father_id or father not visible)
    const roots = visibleMembers.filter((m) => !m.father_id || !visibleSet.has(m.father_id));

    let rootNode: ReturnType<typeof hierarchy<HierarchyMember>>;

    if (roots.length === 1) {
      rootNode = hierarchy<HierarchyMember>(roots[0] as unknown as HierarchyMember, (d) =>
        d._virtual ? [] : getVisibleChildren(d.id)
      );
    } else {
      // Virtual root wrapping multiple roots
      const virtualRoot: HierarchyMember = { id: '__virtual_root__', _virtual: true };
      rootNode = hierarchy<HierarchyMember>(virtualRoot, (d) => {
        if (d.id === '__virtual_root__') return roots as unknown as HierarchyMember[];
        return getVisibleChildren(d.id);
      });
    }

    const treeLayout = d3tree<HierarchyMember>()
      .nodeSize([CARD_WIDTH + NODE_SEP, CARD_HEIGHT + RANK_SEP])
      .separation((a, b) => a.parent === b.parent ? 1 : 1.5);

    treeLayout(rootNode);

    // Build position map (exclude virtual root)
    const posMap = new Map<string, { x: number; y: number }>();
    rootNode.descendants().forEach((d) => {
      if (d.data.id !== '__virtual_root__') {
        posMap.set(d.data.id, { x: d.x, y: d.y });
      }
    });

    // --- Build nodes (same data payload as before) ---
    const nodes: Node[] = visibleMembers.map((member) => {
      const pos = posMap.get(member.id) || { x: 0, y: 0 };
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
          generation: getDepth(member.id),
          isLoggedIn,
        },
      };
    });

    // --- Build edges from d3 links ---
    const edges: Edge[] = rootNode.links()
      .filter((link) => link.source.data.id !== '__virtual_root__')
      .map((link) => {
        const edgeKey = `e-${link.source.data.id}-${link.target.data.id}`;
        const ci = edgeColorMap.get(edgeKey);
        const color = ci !== undefined ? BRANCH_COLORS[ci].stroke : "hsl(var(--muted-foreground) / 0.4)";
        return {
          id: edgeKey,
          source: link.source.data.id,
          target: link.target.data.id,
          type: "default",
          style: {
            stroke: color,
            strokeWidth: 2,
          },
          animated: false,
        };
      });

    return { nodes, edges, totalCount, filteredCount };
  }, [expandedIds, _refreshKey, filters, isLoggedIn]);
}
