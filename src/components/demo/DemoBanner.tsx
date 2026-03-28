import { useState } from "react";
import { X, MessageCircle } from "lucide-react";

interface DemoBannerProps {
  familyName: string;
  onContact: () => void;
}

export function DemoBanner({ familyName, onContact }: DemoBannerProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div
      className="sticky top-0 z-[100] flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium"
      style={{
        background: "linear-gradient(135deg, hsl(42 65% 50%), hsl(35 70% 45%))",
        color: "white",
        textShadow: "0 1px 2px rgba(0,0,0,0.2)",
      }}
      dir="rtl"
    >
      <p className="flex-1 text-center">
        هذا عرض تجريبي لمنصة عائلة {familyName} — تواصل معنا لتفعيل منصتك
      </p>
      <button
        onClick={onContact}
        className="shrink-0 flex items-center gap-1 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 text-xs font-bold transition-colors"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        تواصل معنا
      </button>
      <button
        onClick={() => setVisible(false)}
        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
        aria-label="إغلاق"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
