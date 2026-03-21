import { useState, useEffect, useCallback } from "react";
import { getAllMembers, getDepth } from "@/services/familyService";
import { getBranch } from "@/utils/branchUtils";
import type { FamilyMember } from "@/data/familyData";

export interface HealthMember {
  id: string;
  name: string;
  branch: string | null;
}

export interface HealthCategory {
  key: string;
  label: string;
  count: number;
  severity: "critical" | "warning" | "info";
  members: HealthMember[];
}

export interface DataHealthResult {
  score: number;
  totalMembers: number;
  categories: HealthCategory[];
}

function toHealthMember(m: FamilyMember): HealthMember {
  return {
    id: m.id,
    name: m.name,
    branch: getBranch(m.id)?.label ?? null,
  };
}

function computeHealth(): DataHealthResult {
  const members = getAllMembers();
  const active = members.filter((m) => !m.is_archived);
  const memberMap = new Map(active.map((m) => [m.id, m]));

  // 1. Missing birth year
  const missingBirthYear = active.filter((m) => !m.birth_year);

  // 2. No spouse (living males, depth >= 3)
  const noSpouse = active.filter(
    (m) =>
      m.gender === "M" &&
      !m.death_year &&
      getDepth(m.id) >= 3 &&
      (!m.spouses || m.spouses.trim() === "" || m.spouses.trim() === "غير معروف")
  );

  // 3. Orphaned father_id
  const orphaned = active.filter(
    (m) => m.father_id && !memberMap.has(m.father_id)
  );

  // 4. Duplicate names (same name + father_id)
  const seen = new Map<string, string>();
  const duplicates: FamilyMember[] = [];
  active.forEach((m) => {
    const key = `${m.name}_${m.father_id || "root"}`;
    if (seen.has(key)) {
      duplicates.push(m);
    } else {
      seen.set(key, m.id);
    }
  });

  // 5. Missing mother name
  const missingMother = active.filter(
    (m) => m.father_id !== null && !m.notes?.match(/والدت[هها]/)
  );

  // Score (weighted)
  const totalChecks = active.length * 4;
  const totalIssues =
    missingBirthYear.length +
    noSpouse.length +
    orphaned.length * 3 +
    duplicates.length * 2;
  const score = Math.max(
    0,
    Math.round(((totalChecks - totalIssues) / totalChecks) * 100)
  );

  return {
    score,
    totalMembers: active.length,
    categories: [
      {
        key: "orphaned",
        label: "معرّف الأب غير موجود",
        count: orphaned.length,
        severity: "critical",
        members: orphaned.map(toHealthMember),
      },
      {
        key: "missing_birth_year",
        label: "بدون سنة ميلاد",
        count: missingBirthYear.length,
        severity: "warning",
        members: missingBirthYear.map(toHealthMember),
      },
      {
        key: "duplicates",
        label: "أسماء مكررة محتملة",
        count: duplicates.length,
        severity: "warning",
        members: duplicates.map(toHealthMember),
      },
      {
        key: "no_spouse",
        label: "بدون زوجة مسجّلة",
        count: noSpouse.length,
        severity: "info",
        members: noSpouse.map(toHealthMember),
      },
      {
        key: "missing_mother",
        label: "بدون اسم الأم",
        count: missingMother.length,
        severity: "info",
        members: missingMother.map(toHealthMember),
      },
    ],
  };
}

export function useDataHealth() {
  const [health, setHealth] = useState<DataHealthResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const run = useCallback(() => {
    setIsLoading(true);
    // defer to next tick so UI shows loading
    setTimeout(() => {
      setHealth(computeHealth());
      setIsLoading(false);
    }, 50);
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  return { health, isLoading, refresh: run };
}
