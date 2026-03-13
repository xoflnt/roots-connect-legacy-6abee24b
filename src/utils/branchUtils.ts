import { getMemberById } from "@/services/familyService";

export const DOCUMENTER_ID = "209";
export const ADMIN_MEMBER_IDS = ["209", "M209_3"];

export const PILLARS = [
  { id: "300", label: "فرع ناصر", name: "ناصر بن زيد" },
  { id: "400", label: "فرع عبدالعزيز", name: "عبدالعزيز بن زيد" },
  { id: "200", label: "فرع محمد", name: "محمد بن زيد" },
] as const;

const PILLAR_IDS = new Set<string>(PILLARS.map((p) => p.id));

export function getBranch(personId: string): { pillarId: string; label: string } | null {
  let currentId: string | null = personId;
  while (currentId) {
    if (PILLAR_IDS.has(currentId)) {
      const pillar = PILLARS.find((p) => p.id === currentId)!;
      return { pillarId: pillar.id, label: pillar.label };
    }
    const member = getMemberById(currentId);
    if (!member) return null;
    currentId = member.father_id;
  }
  return null;
}

const BRANCH_STYLES: Record<string, { bg: string; text: string }> = {
  "200": { bg: "hsl(45 70% 92%)", text: "hsl(45 60% 35%)" },
  "300": { bg: "hsl(155 40% 90%)", text: "hsl(155 45% 30%)" },
  "400": { bg: "hsl(25 50% 90%)", text: "hsl(25 55% 35%)" },
};

export function getBranchStyle(pillarId: string) {
  return BRANCH_STYLES[pillarId] || { bg: "hsl(var(--muted))", text: "hsl(var(--muted-foreground))" };
}
