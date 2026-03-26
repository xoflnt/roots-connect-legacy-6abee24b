import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NotificationHistoryItem {
  title: string;
  body: string;
  type: string;
  created_at: string;
}

export function useAdminNotifications() {
  const [isSending, setIsSending] = useState(false);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select("title, body, type, created_at")
      .in("type", ["broadcast", "info", "new_member"])
      .order("created_at", { ascending: false })
      .limit(50);

    const seen = new Set<string>();
    const unique = (data || []).filter((n) => {
      const key = n.title + (n.created_at || "").slice(0, 19);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setHistory(unique);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const sendNotification = async ({
    title,
    body,
    type = "broadcast",
    user_ids = [],
  }: {
    title: string;
    body: string;
    type?: string;
    user_ids?: string[];
  }) => {
    setIsSending(true);
    try {
      const token = sessionStorage.getItem("khunaini-admin-token");
      const { data, error } = await supabase.functions.invoke("family-api/send-notification", {
        headers: { "x-admin-token": token || "" },
        body: { title, body, type, user_ids },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await loadHistory();
      return data;
    } finally {
      setIsSending(false);
    }
  };

  return { sendNotification, isSending, history, isLoading };
}
