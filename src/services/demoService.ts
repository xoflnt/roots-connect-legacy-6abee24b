import type { DemoMember } from "@/data/demoFamilyData";

/** Normalize Arabic for fuzzy search */
function normalize(text: string): string {
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchDemoMembers(members: DemoMember[], query: string, limit = 15): DemoMember[] {
  if (!query.trim()) return [];
  const q = normalize(query);
  const tokens = q.split(" ").filter(Boolean);
  return members
    .filter(m => {
      const n = normalize(m.name);
      return tokens.every(t => n.includes(t));
    })
    .slice(0, limit);
}

export function getDemoChildren(members: DemoMember[], parentId: string): DemoMember[] {
  return members.filter(m => m.father_id === parentId);
}

export function getDemoAncestorChain(members: DemoMember[], id: string): DemoMember[] {
  const map = new Map(members.map(m => [m.id, m]));
  const chain: DemoMember[] = [];
  let current = map.get(id);
  while (current) {
    chain.push(current);
    current = current.father_id ? map.get(current.father_id) : undefined;
  }
  return chain;
}

export function getDemoDepth(members: DemoMember[], id: string): number {
  const map = new Map(members.map(m => [m.id, m]));
  let depth = 0;
  let current = map.get(id);
  while (current?.father_id) {
    depth++;
    current = map.get(current.father_id);
  }
  return depth;
}

/** Simple kinship: find LCA and compute relationship label */
export function computeDemoKinship(
  members: DemoMember[],
  id1: string,
  id2: string
): { label: string; lca: DemoMember | null; path1: DemoMember[]; path2: DemoMember[] } | null {
  const chain1 = getDemoAncestorChain(members, id1);
  const chain2 = getDemoAncestorChain(members, id2);
  const set2 = new Map(chain2.map((m, i) => [m.id, i]));

  for (let i = 0; i < chain1.length; i++) {
    const j = set2.get(chain1[i].id);
    if (j !== undefined) {
      const d1 = i;
      const d2 = j;
      const lca = chain1[i];
      const p1 = chain1.slice(0, i + 1);
      const p2 = chain2.slice(0, j + 1);
      const person1 = members.find(m => m.id === id1);
      const person2 = members.find(m => m.id === id2);
      const label = kinshipLabel(d1, d2, person1?.gender, person2?.gender);
      return { label, lca, path1: p1, path2: p2 };
    }
  }
  return null;
}

function kinshipLabel(d1: number, d2: number, g1?: string, g2?: string): string {
  const f1 = g1 === "F";
  if (d1 === 0 && d2 === 0) return "نفس الشخص";
  if (d1 === 0 && d2 === 1) return "أبوه";
  if (d1 === 1 && d2 === 0) return f1 ? "ابنته" : "ابنه";
  if (d1 === 0 && d2 === 2) return "جده";
  if (d1 === 2 && d2 === 0) return f1 ? "حفيدته" : "حفيده";
  if (d1 === 0 && d2 >= 3) return "جده الأعلى";
  if (d1 >= 3 && d2 === 0) return f1 ? "حفيدته البعيدة" : "حفيده البعيد";
  if (d1 === 1 && d2 === 1) return f1 ? "أخته" : "أخوه";
  if (d1 === 1 && d2 === 2) return f1 ? "عمته" : "عمه";
  if (d1 === 2 && d2 === 1) return f1 ? "بنت أخيه" : "ابن أخيه";
  if (d1 === 2 && d2 === 2) return f1 ? "بنت عمه" : "ابن عمه";
  if (d1 === 3 && d2 === 3) return f1 ? "بنت عم أبيه" : "ابن عم أبيه";
  if (d1 === 1 && d2 === 3) return f1 ? "عمة أبيه" : "عم أبيه";
  if (d1 === 3 && d2 === 1) return f1 ? "بنت ابن أخيه" : "ابن ابن أخيه";
  if (d1 === 2 && d2 === 3) return f1 ? "بنت عم أبيه" : "ابن عم أبيه";
  if (d1 === 3 && d2 === 2) return f1 ? "بنت ابن عمه" : "ابن ابن عمه";
  return f1 ? "قريبته" : "قريبه";
}

/** Get branch info for a member */
export function getDemoBranch(members: DemoMember[], id: string): string | null {
  const map = new Map(members.map(m => [m.id, m]));
  const branchIds = new Set(["D200", "D300", "D400", "D500"]);
  let current = id;
  while (current) {
    if (branchIds.has(current)) return current;
    const m = map.get(current);
    if (!m?.father_id) return null;
    current = m.father_id;
  }
  return null;
}
