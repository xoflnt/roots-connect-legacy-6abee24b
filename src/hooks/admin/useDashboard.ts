import { useState, useEffect, useCallback } from "react";
import { getAllMembers } from "@/services/familyService";
import { getRequests, getVerifiedUsers, getVisitCount } from "@/services/dataService";
import { getAdminToken } from "@/components/AdminProtect";
import type { DashboardStats } from "@/types/admin";

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    livingMembers: 0,
    activeUsers: 0,
    totalVisits: 0,
    pendingRequests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const token = getAdminToken();
    const members = getAllMembers();
    const [requests, users, visits] = await Promise.all([
      getRequests(token || ""),
      getVerifiedUsers(token || ""),
      getVisitCount(),
    ]);
    setStats({
      totalMembers: members.length,
      livingMembers: members.filter((m) => !m.death_year).length,
      activeUsers: users.length,
      totalVisits: visits,
      pendingRequests: requests.filter((r) => r.status === "pending").length,
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, isLoading, refetch: load };
}
