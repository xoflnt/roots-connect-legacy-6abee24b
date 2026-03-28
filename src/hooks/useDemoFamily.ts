import { useMemo } from "react";
import { getDemoMembers, getDemoBranches, type DemoMember } from "@/data/demoFamilyData";

export function useDemoFamily(surname: string) {
  const members = useMemo(() => getDemoMembers(surname), [surname]);
  const branches = useMemo(() => getDemoBranches(members), [members]);
  const totalCount = members.length;

  return { members, branches, totalCount };
}

export type { DemoMember };
