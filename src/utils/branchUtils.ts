import { getMemberById } from "@/services/familyService";

export const DOCUMENTER_ID = "209";
export const ADMIN_MEMBER_IDS = ["209", "M209_3"];

export const DEFAULT_PILLARS = [
  { id: "300", label: "فرع ناصر", name: "ناصر بن زيد" },
  { id: "400", label: "فرع عبدالعزيز", name: "عبدالعزيز بن زيد" },
  { id: "200", label: "فرع محمد", name: "محمد بن زيد" },
] as const;

// Backward-compatible static export (used by FamilyTree filters, admin, etc.)
export const PILLARS = DEFAULT_PILLARS;

// Mutable pillars — overridden in demo mode
let _pillars: readonly { id: string; label: string; name: string }[] = DEFAULT_PILLARS;
let _pillarIds = new Set<string>(DEFAULT_PILLARS.map((p) => p.id));

let _branchStyles: Record<string, { bg: string; text: string }> = {
  "200": { bg: "hsl(45 70% 92%)", text: "hsl(45 60% 35%)" },
  "300": { bg: "hsl(155 40% 90%)", text: "hsl(155 45% 30%)" },
  "400": { bg: "hsl(25 50% 90%)", text: "hsl(25 55% 35%)" },
};

/** Get current pillars (respects demo override) */
export function getPillars() { return _pillars; }

/** Override pillars for demo mode */
export function setDemoPillars(
  pillars: { id: string; label: string; name: string }[],
  styles?: Record<string, { bg: string; text: string }>
) {
  _pillars = pillars;
  _pillarIds = new Set(pillars.map(p => p.id));
  if (styles) _branchStyles = { ..._branchStyles, ...styles };
}

export function getBranch(personId: string): { pillarId: string; label: string } | null {
  let currentId: string | null = personId;
  while (currentId) {
    if (_pillarIds.has(currentId)) {
      const pillar = _pillars.find((p) => p.id === currentId)!;
      return { pillarId: pillar.id, label: pillar.label };
    }
    const member = getMemberById(currentId);
    if (!member) return null;
    currentId = member.father_id;
  }
  return null;
}

export function getBranchStyle(pillarId: string) {
  return _branchStyles[pillarId] || { bg: "hsl(var(--muted))", text: "hsl(var(--muted-foreground))" };
}
