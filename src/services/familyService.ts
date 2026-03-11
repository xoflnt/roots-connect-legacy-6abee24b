import { familyMembers, type FamilyMember } from "@/data/familyData";
import { parseArabicYear } from "@/utils/ageCalculator";

// Mutable merged data — call refreshMembers() after any localStorage update
let mergedMembers: FamilyMember[] = [];
let memberMap = new Map<string, FamilyMember>();
let childrenMap = new Map<string, FamilyMember[]>();

function loadOverrides(): { overrides: Record<string, Partial<FamilyMember>>; additions: FamilyMember[] } {
  try {
    const o = localStorage.getItem("khunaini-member-overrides");
    const a = localStorage.getItem("khunaini-member-additions");
    return {
      overrides: o ? JSON.parse(o) : {},
      additions: a ? JSON.parse(a) : [],
    };
  } catch {
    return { overrides: {}, additions: [] };
  }
}

function buildMaps() {
  const { overrides, additions } = loadOverrides();
  mergedMembers = familyMembers.map((m) => {
    const ov = overrides[m.id];
    return ov ? { ...m, ...ov } : m;
  });
  for (const a of additions) {
    if (!mergedMembers.find((m) => m.id === a.id)) {
      mergedMembers.push(a);
    }
  }
  memberMap = new Map(mergedMembers.map((m) => [m.id, m]));
  childrenMap = new Map();
  for (const m of mergedMembers) {
    if (m.father_id) {
      const arr = childrenMap.get(m.father_id) || [];
      arr.push(m);
      childrenMap.set(m.father_id, arr);
    }
  }
}

// Initial build
buildMaps();

/** Call after updateMember / addMember to refresh all maps */
export function refreshMembers() {
  buildMaps();
}

export function getAllMembers(): FamilyMember[] {
  return mergedMembers;
}

export function getMemberById(id: string): FamilyMember | undefined {
  return memberMap.get(id);
}

export function getChildrenOf(id: string): FamilyMember[] {
  return childrenMap.get(id) || [];
}

export function getAncestorChain(id: string): FamilyMember[] {
  const chain: FamilyMember[] = [];
  let current = memberMap.get(id);
  while (current) {
    chain.push(current);
    current = current.father_id ? memberMap.get(current.father_id) : undefined;
  }
  return chain;
}

export function searchMembers(query: string, limit = 10): FamilyMember[] {
  if (!query.trim()) return [];
  const q = query.trim();
  return mergedMembers.filter((m) => m.name.includes(q)).slice(0, limit);
}

export function getDescendantCount(id: string): number {
  let count = 0;
  const stack = [id];
  while (stack.length) {
    const current = stack.pop()!;
    const children = childrenMap.get(current) || [];
    count += children.length;
    for (const child of children) stack.push(child.id);
  }
  return count;
}

export function getDepth(id: string): number {
  let depth = 0;
  let current = memberMap.get(id);
  while (current?.father_id) {
    depth++;
    current = memberMap.get(current.father_id);
  }
  return depth;
}

export function isFounder(member: FamilyMember): boolean {
  return !member.father_id;
}

export function isBranchHead(id: string): boolean {
  return (childrenMap.get(id)?.length || 0) >= 5;
}

export function isDeceased(member: FamilyMember): boolean {
  return !!member.death_year;
}

/**
 * Extract mother name from member's notes field.
 * Looks for patterns like "والدته: X" or "والدتها: X"
 */
export function extractMotherName(member: FamilyMember): string | null {
  if (!member.notes) return null;
  const match = member.notes.match(/والدت[هها]+:\s*([^-–—,،]+)/);
  if (match) return match[1].trim();
  return null;
}

/**
 * Infer mother name for a member using multiple strategies:
 * 1. Direct extraction from the member's own notes
 * 2. From siblings (same father) who have mother info — if father has only one wife
 * 3. From father's spouses field if only one spouse
 */
export function inferMotherName(member: FamilyMember): string | null {
  // Strategy 1: own notes
  const direct = extractMotherName(member);
  if (direct) return direct;

  if (!member.father_id) return null;
  const father = memberMap.get(member.father_id);
  if (!father) return null;

  // Strategy 2: check siblings
  const siblings = childrenMap.get(member.father_id) || [];
  const motherNames = new Set<string>();
  for (const sib of siblings) {
    const mn = extractMotherName(sib);
    if (mn) motherNames.add(mn);
  }
  // If all siblings with mother info share the same mother, use it
  if (motherNames.size === 1) return [...motherNames][0];

  // Strategy 3: father has exactly one spouse
  if (father.spouses) {
    const spouseList = father.spouses.split("،").map((s) => s.trim()).filter(Boolean);
    if (spouseList.length === 1) return spouseList[0];
  }

  return null;
}

/** Sort members by birth year (oldest first). Members without birth year go last. */
export function sortByBirth(members: FamilyMember[]): FamilyMember[] {
  return [...members].sort((a, b) => {
    const ya = parseArabicYear(a.birth_year);
    const yb = parseArabicYear(b.birth_year);
    if (ya === null && yb === null) return 0;
    if (ya === null) return 1;
    if (yb === null) return -1;
    return ya - yb;
  });
}

/** Find Lowest Common Ancestor and return distances */
export function findKinship(id1: string, id2: string): { 
  lca: FamilyMember | null; 
  dist1: number; 
  dist2: number; 
  path1: FamilyMember[]; 
  path2: FamilyMember[];
} | null {
  const chain1 = getAncestorChain(id1);
  const chain2 = getAncestorChain(id2);
  
  const set2 = new Map(chain2.map((m, i) => [m.id, i]));
  
  for (let i = 0; i < chain1.length; i++) {
    const j = set2.get(chain1[i].id);
    if (j !== undefined) {
      return {
        lca: chain1[i],
        dist1: i,
        dist2: j,
        path1: chain1.slice(0, i + 1),
        path2: chain2.slice(0, j + 1),
      };
    }
  }
  return null;
}

/** Translate kinship distances to Arabic */
export function kinshipToArabic(dist1: number, dist2: number): string {
  if (dist1 === 0 && dist2 === 0) return "نفس الشخص";
  if (dist1 === 0 && dist2 === 1) return "أبوه";
  if (dist1 === 1 && dist2 === 0) return "ابنه";
  if (dist1 === 0 && dist2 === 2) return "جده";
  if (dist1 === 2 && dist2 === 0) return "حفيده";
  if (dist1 === 0 && dist2 >= 3) return `جده ${toOrdinal(dist2 - 1)}`;
  if (dist1 >= 3 && dist2 === 0) return `حفيده ${toOrdinal(dist1 - 1)}`;
  if (dist1 === 1 && dist2 === 1) return "أخوه";
  if (dist1 === 1 && dist2 === 2) return "عمه";
  if (dist1 === 2 && dist2 === 1) return "ابن أخيه";
  if (dist1 === 2 && dist2 === 2) return "ابن عمه";
  if (dist1 === 1 && dist2 === 3) return "عم أبيه";
  if (dist1 === 3 && dist2 === 1) return "ابن ابن أخيه";
  if (dist1 === 2 && dist2 === 3) return "ابن عم أبيه";
  if (dist1 === 3 && dist2 === 2) return "ابن ابن عمه";
  if (dist1 === 3 && dist2 === 3) return "ابن عم أبيه (الدرجة الثانية)";
  
  if (dist1 === 1 && dist2 > 1) return `عمه من الدرجة ${toArabicNum(dist2 - 1)}`;
  if (dist1 > 1 && dist2 === 1) return `ابن أخيه من الدرجة ${toArabicNum(dist1 - 1)}`;
  return `قريبه (${toArabicNum(dist1)} أجيال / ${toArabicNum(dist2)} أجيال من الجد المشترك)`;
}

function toArabicNum(n: number): string {
  return n.toLocaleString("ar-SA");
}

function toOrdinal(n: number): string {
  const ordinals = ["", "", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع"];
  return ordinals[n] || `رقم ${toArabicNum(n)}`;
}
