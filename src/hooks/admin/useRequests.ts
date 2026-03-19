import { useState, useEffect, useCallback, useMemo } from "react";
import { getAdminToken } from "@/components/AdminProtect";
import { supabase } from "@/integrations/supabase/client";
import { getAllMembers } from "@/services/familyService";

export type RequestStatus = "pending" | "completed" | "approved";
export type RequestType = "add_spouse" | "add_child" | "other";

export interface AdminRequest {
  id: string;
  type: RequestType;
  target_member_id: string;
  target_member_name?: string;
  data: {
    spouse_name?: string;
    child_name?: string;
    child_gender?: "M" | "F";
    text_content?: string;
  };
  notes: string | null;
  status: RequestStatus;
  submitted_by: string | null;
  created_at: string;
}

export type RequestTab = "pending" | "done" | "all";

export function useRequests() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [activeTab, setActiveTab] = useState<RequestTab>("pending");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAdminToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("family-api/get-requests", {
        body: {},
        headers: { "x-admin-token": token },
      });

      if (error || !data?.requests) {
        setIsLoading(false);
        return;
      }

      const members = getAllMembers();
      const memberMap = new Map(members.map((m) => [m.id, m]));

      const enriched: AdminRequest[] = (data.requests as any[]).map((r) => ({
        id: r.id,
        type: r.type as RequestType,
        target_member_id: r.target_member_id,
        target_member_name:
          memberMap.get(r.target_member_id)?.name ?? r.target_member_id,
        data: r.data ?? {},
        notes: r.notes,
        status: r.status as RequestStatus,
        submitted_by: r.submitted_by,
        created_at: r.created_at,
      }));

      setRequests(enriched);
    } catch (e) {
      console.error("[useRequests] load error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (activeTab === "pending")
      return requests.filter((r) => r.status === "pending");
    if (activeTab === "done")
      return requests.filter((r) => r.status !== "pending");
    return requests;
  }, [requests, activeTab]);

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === "pending").length,
    [requests]
  );

  return {
    requests: filtered,
    allRequests: requests,
    pendingCount,
    activeTab,
    setActiveTab,
    isLoading,
    refetch: load,
  };
}
