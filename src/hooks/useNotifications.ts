import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getMyUserId } from "@/services/dataService";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: "approval" | "rejection" | "broadcast" | "new_member" | "info";
  is_read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
  read_at: string | null;
}

export function useNotifications() {
  const { currentUser, isLoggedIn, login } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(currentUser?.verifiedUserId || null);

  // Resolve userId
  useEffect(() => {
    if (!isLoggedIn || !currentUser) {
      setIsLoading(false);
      return;
    }
    if (userId) return;

    const resolve = async () => {
      if (currentUser.verifiedUserId) {
        setUserId(currentUser.verifiedUserId);
        console.log("[Notifications] userId from cache:", currentUser.verifiedUserId);
        return;
      }
      if (currentUser.phone) {
        const id = await getMyUserId(currentUser.phone);
        if (id) {
          setUserId(id);
          login({ ...currentUser, verifiedUserId: id });
          console.log("[Notifications] userId resolved:", id);
        } else {
          console.log("[Notifications] userId resolution failed");
          setIsLoading(false);
        }
      }
    };
    resolve();
  }, [isLoggedIn, currentUser, userId, login]);

  // Fetch notifications
  useEffect(() => {
    if (!userId) return;

    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) {
          const typed = data as unknown as AppNotification[];
          setNotifications(typed);
          setUnreadCount(typed.filter((n) => !n.is_read).length);
        }
        setIsLoading(false);
      });
  }, [userId]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as unknown as AppNotification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
          toast(newNotif.title, {
            description: newNotif.body,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = useCallback(async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id);

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [userId]);

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead };
}
