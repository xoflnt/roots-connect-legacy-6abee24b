import type { FamilyMember } from "@/data/familyData";

export interface KinshipResult {
  lca: FamilyMember | null;
  dist1: number;
  dist2: number;
  path1: FamilyMember[];
  path2: FamilyMember[];
}

export interface KinshipViewProps {
  result: KinshipResult;
  person1: FamilyMember;
  person2: FamilyMember;
  motherName1?: string | null;
  motherName2?: string | null;
}
