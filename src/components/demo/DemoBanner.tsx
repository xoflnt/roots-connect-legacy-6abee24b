import { useState } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";

interface DemoBannerProps {
  familyName: string;
  onContact: () => void;
}

export function DemoBanner({ familyName, onContact }: DemoBannerProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-bold shadow-lg"
      style={{
        background: "linear-gradient(135deg, hsl(42 65% 50%), hsl(35 70% 45%), hsl(42 65% 50%))",
        color: "white",
        paddingTop: "max(0.625rem, env(safe-area-inset-top))",
      }}
      dir="rtl"
    >
      <span className="flex items-center gap-1.5 flex-1 justify-center">
        <Sparkles className="h-4 w-4 shrink-0" />
        هذا عرض تجريبي لمنصة عائلة {familyName}
      </span>
      <button
        onClick={onContact}
        className="shrink-0 bg-black/20 hover:bg-black/30 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
      >
        <MessageCircle className="h-3.5 w-3.5 inline ml-1" />
        تواصل معنا
      </button>
      <button
        onClick={() => setVisible(false)}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
        aria-label="إغلاق"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
