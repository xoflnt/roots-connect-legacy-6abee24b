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
  const f1 = person1?.gender === "F";
  const f2 = person2?.gender === "F";

  if (dist1 === 0 && dist2 === 0) return "نفس الشخص";

  // Direct line down: person1 is ancestor of person2
  if (dist1 === 0 && dist2 === 1) return f2 ? "أبوها" : "أبوه";
  if (dist1 === 0 && dist2 === 2) return f2 ? "جدها" : "جده";
  if (dist1 === 0 && dist2 === 3) return f2 ? "جد جدها" : "جد جده";
  if (dist1 === 0 && dist2 === 4) return f2 ? "جد جد جدها" : "جد جد جده";
  if (dist1 === 0 && dist2 === 5) return f2 ? "جد جد جد جدها" : "جد جد جد جده";
  if (dist1 === 0 && dist2 >= 6) return f2 ? "جدها الأعلى" : "جده الأعلى";

  // Direct line up: person1 is descendant of person2
  if (dist1 === 1 && dist2 === 0) return f1 ? "ابنته" : "ابنه";
  if (dist1 === 2 && dist2 === 0) return f1 ? "حفيدته" : "حفيده";
  if (dist1 === 3 && dist2 === 0) return f1 ? "حفيدة ابنه" : "حفيد ابنه";
  if (dist1 === 4 && dist2 === 0) return f1 ? "حفيدة حفيده" : "حفيد حفيده";
  if (dist1 === 5 && dist2 === 0) return f1 ? "حفيدة حفيد حفيده" : "حفيد حفيد حفيده";
  if (dist1 >= 6 && dist2 === 0) return f1 ? "حفيدته البعيدة" : "حفيده البعيد";

  // Siblings (1,1)
  if (dist1 === 1 && dist2 === 1) {
    const mother1 = person1 ? extractMotherName(person1) : null;
    const mother2 = person2 ? extractMotherName(person2) : null;
    const isFull = mother1 && mother2 && mother1 === mother2;
    if (f1) return isFull ? "أخته الشقيقة" : "أخته من الأب";
    if (f2) return isFull ? "أخت شقيقة" : "أخت من الأب";
    return isFull ? "أخوه الشقيق" : "أخوه من الأب";
  }

  // Uncle line (1, n)
  if (dist1 === 1 && dist2 === 2) return f1 ? "عمته" : "عمه";
  if (dist1 === 1 && dist2 === 3) return f1 ? "عمة أبيه" : "عم أبيه";
  if (dist1 === 1 && dist2 === 4) return f1 ? "عمة جده" : "عم جده";
  if (dist1 === 1 && dist2 === 5) return f1 ? "عمة جد جده" : "عم جد جده";

  // Nephew line (n, 1)
  if (dist1 === 2 && dist2 === 1) return f1 ? "بنت أخيه" : "ابن أخيه";
  if (dist1 === 3 && dist2 === 1) return f1 ? "بنت ابن أخيه" : "ابن ابن أخيه";
  if (dist1 === 4 && dist2 === 1) return f1 ? "بنت ابن ابن أخيه" : "ابن ابن ابن أخيه";
  if (dist1 === 5 && dist2 === 1) return f1 ? "حفيدة ابن أخيه" : "حفيد ابن أخيه";

  // Cousins (n, n)
  if (dist1 === 2 && dist2 === 2) return f1 ? "بنت عمه" : "ابن عمه";
  if (dist1 === 3 && dist2 === 3) return f1 ? "بنت عم أبيه" : "ابن عم أبيه";
  if (dist1 === 4 && dist2 === 4) return f1 ? "بنت عم جده" : "ابن عم جده";
  if (dist1 === 5 && dist2 === 5) return f1 ? "بنت عم جد جده" : "ابن عم جد جده";

  // Cross combinations
  if (dist1 === 2 && dist2 === 3) return f1 ? "بنت عم أبيه" : "ابن عم أبيه";
  if (dist1 === 3 && dist2 === 2) return f1 ? "بنت ابن عمه" : "ابن ابن عمه";
  if (dist1 === 2 && dist2 === 4) return f1 ? "بنت عم جده" : "ابن عم جده";
  if (dist1 === 4 && dist2 === 2) return f1 ? "بنت ابن عم أبيه" : "ابن ابن عم أبيه";
  if (dist1 === 3 && dist2 === 4) return f1 ? "بنت عم جد أبيه" : "ابن عم جد أبيه";
  if (dist1 === 4 && dist2 === 3) return f1 ? "بنت ابن عم جده" : "ابن ابن عم جده";
  if (dist1 === 2 && dist2 === 5) return f1 ? "بنت عم جد جده" : "ابن عم جد جده";
  if (dist1 === 5 && dist2 === 2) return f1 ? "قريبته" : "قريبه";
  if (dist1 === 3 && dist2 === 5) return f1 ? "قريبته" : "قريبه";
  if (dist1 === 5 && dist2 === 3) return f1 ? "قريبته" : "قريبه";
  if (dist1 === 4 && dist2 === 5) return f1 ? "قريبته" : "قريبه";
  if (dist1 === 5 && dist2 === 4) return f1 ? "قريبته" : "قريبه";

  // Deep fallback
  if (dist1 > 5 || dist2 > 5) return "قريب بعيد";
  return f1 ? "قريبته" : "قريبه";
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
  const g1 = person1?.gender;
  const g2 = person2?.gender;
  const t1 = asymTitle(d1, d2, g1);
  const t2 = asymTitle(d2, d1, g2);
  return { symmetric: false, symmetricTitle: "", title1to2: t1, title2to1: t2 };
}

function asymTitle(myDist: number, otherDist: number, gender?: string): string {
  const f = gender === "F";
  // Direct lineage
  if (myDist === 0 && otherDist === 1) return "أب";
  if (myDist === 1 && otherDist === 0) return f ? "ابنة" : "ابن";
  if (myDist === 0 && otherDist === 2) return "جد";
  if (myDist === 2 && otherDist === 0) return f ? "حفيدة" : "حفيد";
  if (myDist === 0 && otherDist >= 3) return `جد ${toOrdinal(otherDist - 1) || toArabicNum(otherDist - 1)}`;
  if (myDist >= 3 && otherDist === 0) return `${f ? "حفيدة" : "حفيد"} ${toOrdinal(myDist - 1) || toArabicNum(myDist - 1)}`;

  // Uncle / nephew
  if (myDist === 1 && otherDist === 2) return f ? "عمة" : "عم";
  if (myDist === 2 && otherDist === 1) return f ? "ابنة أخ" : "ابن أخ";
  if (myDist === 1 && otherDist === 3) return f ? "عمة الأب" : "عم الأب";
  if (myDist === 3 && otherDist === 1) return f ? "ابنة ابن أخ" : "ابن ابن أخ";
  if (myDist === 1 && otherDist > 3) return `${f ? "عمة" : "عم"} من الدرجة ${toArabicNum(otherDist - 1)}`;

  // Cousin-based
  if (myDist === 2 && otherDist === 3) return `${f ? "ابنة" : "ابن"} عم الأب`;
  if (myDist === 3 && otherDist === 2) return `${f ? "ابنة" : "ابن"} ابن عم`;

  // Deep fallback
  return "";
}

export function generationText(n: number): string {
  if (n === 1) return "بجيل واحد";
  if (n === 2) return "بجيلين";
  if (n >= 3 && n <= 10) return `بـ ${toArabicNum(n)} أجيال`;
  return `بـ ${toArabicNum(n)} جيلاً`;
}

export function lcaContextWord(dist1: number, dist2: number, lcaGender?: string): string {
  if (dist1 === 1 && dist2 === 1) return "والدهما";
  return lcaGender === "F" ? "جدتهما المشتركة" : "جدهما المشترك";
}

function toArabicNum(n: number): string {
  return n.toLocaleString("ar-SA");
}

function toOrdinal(n: number): string {
  const ordinals = ["", "", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع"];
  return ordinals[n] || `رقم ${toArabicNum(n)}`;
}
