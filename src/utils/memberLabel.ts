import { type FamilyMember } from "@/data/familyData";
import { getAllMembers } from "@/services/familyService";

function getMemberMap() {
  return new Map(getAllMembers().map((m) => [m.id, m]));
}

/** Extract first name only (before بن or بنت) */
function firstName(name: string): string {
  const parts = name.split(/\s+/);
  if (parts.length <= 1) return name;
  // If second word is بن or بنت, return only first word
  if (parts[1] === "بن" || parts[1] === "بنت") return parts[0];
  return name;
}

/**
 * Build a lineage breadcrumb: "الاسم_الأول ← أبوه ← جده"
 * Uses first name only to avoid duplication like "عبدالله بن محمد ← محمد"
 */
export function getLineageLabel(member: FamilyMember, depth = 2): string {
  const memberMap = getMemberMap();
  const parts: string[] = [firstName(member.name)];
  let current = member;
  for (let i = 0; i < depth; i++) {
    if (!current.father_id) break;
    const father = memberMap.get(current.father_id);
    if (!father) break;
    parts.push(firstName(father.name));
    current = father;
  }
  if (parts.length === 1) return member.name;
  return parts.join(" ← ");
}

/**
 * Subtitle info (birth/death) for search results
 */
export function getMemberSubtitle(member: FamilyMember): string | null {
  const bits: string[] = [];
  if (member.birth_year) bits.push(`م ${member.birth_year}`);
  if (member.death_year) bits.push(`ت ${member.death_year}`);
  return bits.length > 0 ? bits.join(" — ") : null;
}
