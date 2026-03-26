import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = "REPLACE_WITH_VAPID_PUBLIC_KEY";

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

export function usePushNotifications(userId: string | null) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  const subscribe = useCallback(async () => {
    if (!isSupported || !userId) return;

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      console.log("[Push] Permission:", perm);

      if (perm !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        console.log("[Push] New subscription created");
      }

      const subJson = subscription.toJSON();
      const endpoint = subJson.endpoint!;
      const p256dh = subJson.keys!.p256dh!;
      const auth = subJson.keys!.auth!;

      // Upsert subscription
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
  }, [isSupported, userId]);

  // Auto-subscribe when userId becomes available
  useEffect(() => {
    if (userId && isSupported && permission === "default") {
      subscribe();
    }
  }, [userId, isSupported, permission, subscribe]);

  return { isSupported, permission, subscribe };
}
