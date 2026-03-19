import { useState, useEffect, useMemo, useCallback } from "react";
import { getAllMembers, getDepth } from "@/services/familyService";
import { getBranch } from "@/utils/branchUtils";
import { arabicMatch } from "@/utils/normalizeArabic";
import type { FamilyMember } from "@/data/familyData";

const PAGE_SIZE = 30;

export interface MemberFilters {
  search: string;
  branch: string | null;
  status: "alive" | "deceased" | null;
  gender: "M" | "F" | null;
  generation: number | null;
}

export interface EnrichedMember extends FamilyMember {
  branch: string | null;
  branchLabel: string | null;
  generation: number;
  isDeceased: boolean;
  spousesArray: string[];
  fatherName: string | null;
}

export function useMembers() {
  const [allMembers, setAllMembers] = useState<EnrichedMember[]>([]);
  const [filters, setFilters] = useState<MemberFilters>({
    search: "",
    branch: null,
    status: null,
    gender: null,
    generation: null,
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = getAllMembers();
    const memberMap = new Map(raw.map((m) => [m.id, m]));

    const enriched: EnrichedMember[] = raw.map((m) => {
      const branchInfo = getBranch(m.id);
      return {
        ...m,
        branch: branchInfo?.pillarId ?? null,
        branchLabel: branchInfo?.label ?? null,
        generation: getDepth(m.id),
        isDeceased: !!m.death_year,
        spousesArray: m.spouses
          ? m.spouses.split("،").map((s) => s.trim()).filter(Boolean)
          : [],
        fatherName: m.father_id
          ? memberMap.get(m.father_id)?.name ?? null
          : null,
      };
    });

    setAllMembers(enriched);
    setIsLoading(false);
  }, []);

  const filtered = useMemo(() => {
    return allMembers.filter((m) => {
      if (
        filters.search &&
        !arabicMatch(filters.search, m.name) &&
        !m.id.includes(filters.search)
      )
        return false;
      if (filters.branch && m.branch !== filters.branch) return false;
      if (filters.status === "alive" && m.isDeceased) return false;
      if (filters.status === "deceased" && !m.isDeceased) return false;
      if (filters.gender && m.gender !== filters.gender) return false;
      if (filters.generation != null && m.generation !== filters.generation)
        return false;
      return true;
    });
  }, [allMembers, filters]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageMembers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateFilters = useCallback((f: Partial<MemberFilters>) => {
    setFilters((prev) => ({ ...prev, ...f }));
    setPage(1);
  }, []);

  return {
    members: pageMembers,
    allMembers,
    filtered,
    total: filtered.length,
    page,
    totalPages,
    setPage,
    filters,
    updateFilters,
    isLoading,
  };
}
