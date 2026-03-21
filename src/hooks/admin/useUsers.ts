import { useState, useEffect, useCallback, useMemo } from "react";
import { getAdminToken } from "@/components/AdminProtect";
import { getVerifiedUsers, type VerifiedUser } from "@/services/dataService";
import { supabase } from "@/integrations/supabase/client";

export function useUsers() {
  const [users, setUsers] = useState<VerifiedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = getAdminToken();
    if (token) {
      const data = await getVerifiedUsers(token);
      setUsers(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.trim();
    return users.filter(
      (u) => u.memberName.includes(q) || u.phone.includes(q)
    );
  }, [users, search]);

  const deleteUser = useCallback(async (memberId: string) => {
    const token = getAdminToken();
    if (!token) return false;
    try {
      const res = await supabase.functions.invoke("family-api/delete-verified-user", {
        body: { userId: memberId },
        headers: { "x-admin-token": token },
      });
      if (res.error) return false;
      await load();
      return true;
    } catch {
      return false;
    }
  }, [load]);

  return {
    users: filtered,
    total: users.length,
    isLoading,
    search,
    setSearch,
    deleteUser,
    refetch: load,
  };
}
