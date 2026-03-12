import { familyMembers as staticMembers, type FamilyMember } from "@/data/familyData";
import { parseArabicYear } from "@/utils/ageCalculator";
import { getMembers, loadVerifiedMemberIds } from "./dataService";

// Mutable merged data — call refreshMembers() after any cloud update
let mergedMembers: FamilyMember[] = [...staticMembers];
let memberMap = new Map<string, FamilyMember>();
let childrenMap = new Map<string, FamilyMember[]>();
let initialized = false;

function buildMaps(members: FamilyMember[]) {
  mergedMembers = members;
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

// Initial build with static data (synchronous fallback)
buildMaps([...staticMembers]);

/** Load members from cloud and rebuild maps */
export async function loadMembers(): Promise<void> {
  try {
    const [cloudMembers] = await Promise.all([
      getMembers(),
      loadVerifiedMemberIds(),
    ]);
    if (cloudMembers.length > 0) {
      buildMaps(cloudMembers);
      initialized = true;
    } else if (!initialized) {
      buildMaps([...staticMembers]);
    }
  } catch (e) {
    console.error("[familyService] loadMembers error, using static fallback:", e);
    if (!initialized) {
      buildMaps([...staticMembers]);
    }
  }
}

/** Call after updateMember / addMember to refresh all maps from cloud */
export async function refreshMembers(): Promise<void> {
  await loadMembers();
}

export function isInitialized(): boolean {
  return initialized;
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

/** Normalize Arabic text for fuzzy search */
export function normalizeForSearch(text: string): string {
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/(^|\s)(بن|بنت|ابن)(\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchMembers(query: string, limit = 10): FamilyMember[] {
  if (!query.trim()) return [];
  const q = normalizeForSearch(query);
  const tokens = q.split(" ").filter(Boolean);
  if (tokens.length === 0) return [];
  return mergedMembers
    .filter((m) => {
      const normalized = normalizeForSearch(m.name);
      return tokens.every((t) => normalized.includes(t));
    })
    .slice(0, limit);
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

export function extractMotherName(member: FamilyMember): string | null {
  if (!member.notes) return null;
  const match = member.notes.match(/والدت[هها]+:\s*([^-–—,،]+)/);
  if (match) return match[1].trim();
  return null;
}

export function inferMotherName(member: FamilyMember): string | null {
  const direct = extractMotherName(member);
  if (direct) return direct;

  if (!member.father_id) return null;
  const father = memberMap.get(member.father_id);
  if (!father) return null;

  const siblings = childrenMap.get(member.father_id) || [];
  const motherNames = new Set<string>();
  for (const sib of siblings) {
    const mn = extractMotherName(sib);
    if (mn) motherNames.add(mn);
  }
  if (motherNames.size === 1) return [...motherNames][0];

  if (father.spouses) {
    const spouseList = father.spouses.split("،").map((s) => s.trim()).filter(Boolean);
    if (spouseList.length === 1) return spouseList[0];
  }

  return null;
}

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

export function kinshipToArabic(dist1: number, dist2: number, person1?: FamilyMember, person2?: FamilyMember): string {
  if (dist1 === 0 && dist2 === 0) return "نفس الشخص";
  if (dist1 === 0 && dist2 === 1) return "أبوه";
  if (dist1 === 1 && dist2 === 0) return "ابنه";
  if (dist1 === 0 && dist2 === 2) return "جده";
  if (dist1 === 2 && dist2 === 0) return "حفيده";
  if (dist1 === 0 && dist2 >= 3) return `جده ${toOrdinal(dist2 - 1)}`;
  if (dist1 >= 3 && dist2 === 0) return `حفيده ${toOrdinal(dist1 - 1)}`;

  // Siblings: differentiate full vs half
  if (dist1 === 1 && dist2 === 1) {
    const mother1 = person1 ? extractMotherName(person1) : null;
    const mother2 = person2 ? extractMotherName(person2) : null;
    const isFull = mother1 && mother2 && mother1 === mother2;
    const isFemale2 = person2?.gender === "F";
    if (isFull) return isFemale2 ? "أخت شقيقة" : "أخ شقيق";
    return isFemale2 ? "أخت من الأب" : "أخ من الأب";
  }

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

export interface DirectionalKinship {
  symmetric: boolean;
  symmetricTitle: string;
  title1to2: string;
  title2to1: string;
}

export function kinshipDirectional(
  d1: number,
  d2: number,
  person1?: FamilyMember,
  person2?: FamilyMember
): DirectionalKinship {
  // Symmetric cases
  if (d1 === d2) {
    if (d1 === 0) return { symmetric: true, symmetricTitle: "نفس الشخص", title1to2: "", title2to1: "" };
    if (d1 === 1) {
      const mother1 = person1 ? extractMotherName(person1) : null;
      const mother2 = person2 ? extractMotherName(person2) : null;
      const isFull = mother1 && mother2 && mother1 === mother2;
      const title = isFull ? "أخوان شقيقان" : "أخوان من الأب";
      return { symmetric: true, symmetricTitle: title, title1to2: "", title2to1: "" };
    }
    if (d1 === 2) return { symmetric: true, symmetricTitle: "أبناء عم", title1to2: "", title2to1: "" };
    if (d1 === 3) return { symmetric: true, symmetricTitle: "أبناء عمومة من الدرجة الثانية", title1to2: "", title2to1: "" };
    return { symmetric: true, symmetricTitle: `أبناء عمومة من الدرجة ${toOrdinal(d1 - 1) || toArabicNum(d1 - 1)}`, title1to2: "", title2to1: "" };
  }

  // Asymmetric — compute both directions
  const t1 = asymTitle(d1, d2);
  const t2 = asymTitle(d2, d1);
  return { symmetric: false, symmetricTitle: "", title1to2: t1, title2to1: t2 };
}

function asymTitle(myDist: number, otherDist: number): string {
  // Direct lineage
  if (myDist === 0 && otherDist === 1) return "أب";
  if (myDist === 1 && otherDist === 0) return "ابن";
  if (myDist === 0 && otherDist === 2) return "جد";
  if (myDist === 2 && otherDist === 0) return "حفيد";
  if (myDist === 0 && otherDist >= 3) return `جد ${toOrdinal(otherDist - 1) || toArabicNum(otherDist - 1)}`;
  if (myDist >= 3 && otherDist === 0) return `حفيد ${toOrdinal(myDist - 1) || toArabicNum(myDist - 1)}`;

  // Uncle / nephew
  if (myDist === 1 && otherDist === 2) return "عم";
  if (myDist === 2 && otherDist === 1) return "ابن أخ";
  if (myDist === 1 && otherDist === 3) return "عم الأب";
  if (myDist === 3 && otherDist === 1) return "ابن ابن أخ";
  if (myDist === 1 && otherDist > 3) return `عم من الدرجة ${toArabicNum(otherDist - 1)}`;

  // Cousin-based
  if (myDist === 2 && otherDist === 3) return "ابن عم الأب";
  if (myDist === 3 && otherDist === 2) return "ابن ابن عم";

  // Deep fallback
  return "";
}
}

export function generationText(n: number): string {
  if (n === 1) return "بجيل واحد";
  if (n === 2) return "بجيلين";
  if (n >= 3 && n <= 10) return `بـ ${toArabicNum(n)} أجيال`;
  return `بـ ${toArabicNum(n)} جيلاً`;
}

export function lcaContextWord(dist1: number, dist2: number): string {
  if (dist1 === 1 && dist2 === 1) return "والدهما";
  return "جدهما المشترك";
}

function toArabicNum(n: number): string {
  return n.toLocaleString("ar-SA");
}

function toOrdinal(n: number): string {
  const ordinals = ["", "", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع"];
  return ordinals[n] || `رقم ${toArabicNum(n)}`;
}
