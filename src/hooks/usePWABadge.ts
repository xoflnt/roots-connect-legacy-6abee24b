import { useEffect } from "react";

export function usePWABadge(count: number) {
  useEffect(() => {
    if (!("setAppBadge" in navigator)) return;

    if (count > 0) {
      (navigator as any).setAppBadge(count).catch(() => {});
    } else {
      (navigator as any).clearAppBadge?.().catch(() => {});
    }

    return () => {
      (navigator as any).clearAppBadge?.().catch(() => {});
    };
  }, [count]);
}
