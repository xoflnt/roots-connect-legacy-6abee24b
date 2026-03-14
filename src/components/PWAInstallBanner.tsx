import { useState, useEffect } from "react";
import { Smartphone, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useIsMobile } from "@/hooks/use-mobile";

const AUTO_HIDE_MS = 15000;

export function PWAInstallBanner() {
  const { canInstall, isIOS, triggerInstall } = usePWAInstall();
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (canInstall && isMobile) {
      setVisible(true);
    }
  }, [canInstall, isMobile]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  const handleDismiss = () => setVisible(false);

  if (!visible) return null;

  return (
    <div
      className="fixed z-50 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/40 shadow-lg p-4 animate-slide-up"
      style={{ bottom: `calc(4rem + env(safe-area-inset-bottom))` }}
      dir="rtl"
    >
      <button
        onClick={handleDismiss}
        className="absolute left-3 top-3 rounded-lg p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="إغلاق"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-start gap-3 pr-1 pl-10">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mt-0.5">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-bold text-foreground">أضف التطبيق لشاشتك الرئيسية</p>
          {isIOS ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              اضغط على زر المشاركة <Share className="inline h-3.5 w-3.5 align-text-bottom mx-0.5" /> ثم اختر «إضافة إلى الشاشة الرئيسية»
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">تجربة أفضل بدون شريط المتصفح</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pr-[3.25rem]">
        {!isIOS && (
          <Button
            onClick={triggerInstall}
            className="rounded-xl px-4 py-2 min-h-[44px] text-sm font-bold"
          >
            تثبيت الآن
          </Button>
        )}
        <button
          onClick={handleDismiss}
          className="text-muted-foreground text-sm px-3 py-2 min-h-[44px] hover:text-foreground transition-colors"
        >
          لاحقاً
        </button>
      </div>
    </div>
  );
}
