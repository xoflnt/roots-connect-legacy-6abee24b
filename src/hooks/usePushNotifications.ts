import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function fetchVapidKey(): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke("family-api/get-vapid-key");
    if (error || !data?.vapidPublicKey) {
      console.warn("[Push] Failed to fetch VAPID key:", error);
      return null;
    }
    console.log("[Push] VAPID key fetched successfully");
    return data.vapidPublicKey;
  } catch {
    return null;
  }
}

export function usePushNotifications(userId: string | null) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [vapidKey, setVapidKey] = useState<string | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  // Fetch VAPID key once
  useEffect(() => {
    if (isSupported) {
      fetchVapidKey().then((key) => {
        if (key) setVapidKey(key);
      });
    }
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    console.log("[Push] subscribe() called", { userId, permission, isSupported, hasVapidKey: !!vapidKey });

    if (!isSupported || !userId || !vapidKey) return;

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      console.log("[Push] Permission result:", perm);

      if (perm !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const appServerKey = urlBase64ToUint8Array(vapidKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: appServerKey as unknown as BufferSource,
        });
        console.log("[Push] New subscription created:", subscription.endpoint?.slice(0, 60));
      } else {
        console.log("[Push] Existing subscription found:", subscription.endpoint?.slice(0, 60));
      }

      const subJson = subscription.toJSON();
      const endpoint = subJson.endpoint!;
      const p256dh = subJson.keys!.p256dh!;
      const auth = subJson.keys!.auth!;

      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: userId,
          endpoint,
          p256dh,
          auth,
          user_agent: navigator.userAgent,
        },
        { onConflict: "endpoint" }
      );

      if (error) {
        console.error("[Push] Failed to save subscription:", error.message);
      } else {
        console.log("[Push] Subscription saved for user:", userId);
      }
    } catch (err) {
      console.error("[Push] Subscribe error:", err);
    }
  }, [isSupported, userId, vapidKey, permission]);

  // Auto-subscribe when userId and vapidKey are available
  useEffect(() => {
    console.log("[Push] Auto-subscribe check:", {
      userId: !!userId,
      hasVapidKey: !!vapidKey,
      isSupported,
      permission,
    });

    if (!userId || !vapidKey || !isSupported) return;
    if (permission === "denied") return;

    // Small delay to ensure SW is ready
    const timer = setTimeout(() => {
      subscribe();
    }, 2000);

    return () => clearTimeout(timer);
  }, [userId, vapidKey, isSupported]);

  return { isSupported, permission, subscribe };
}
