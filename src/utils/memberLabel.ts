import { familyMembers, type FamilyMember } from "@/data/familyData";

const memberMap = new Map(familyMembers.map((m) => [m.id, m]));

/**
 * Build a lineage breadcrumb for disambiguation: "الشخص ← أبوه ← جده"
 * Shows up to `depth` ancestors after the person's own name.
 */
export function getLineageLabel(member: FamilyMember, depth = 2): string {
  const parts: string[] = [member.name];
  let current = member;
  for (let i = 0; i < depth; i++) {
    if (!current.father_id) break;
    const father = memberMap.get(current.father_id);
    if (!father) break;
    // Use first name only for ancestors to keep it short
    parts.push(father.name.split(" ")[0]);
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
