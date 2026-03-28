import { TreePine, MessageCircle } from "lucide-react";

interface DemoFooterProps {
  onContact: () => void;
}

export function DemoFooter({ onContact }: DemoFooterProps) {
  return (
    <footer className="py-8 px-4 border-t border-border/30 bg-muted/30" dir="rtl">
      {/* Gold divider */}
      <div className="flex items-center justify-center gap-4 pb-6">
        <div className="h-px w-12 bg-accent/30" />
        <div className="w-2 h-2 rounded-full bg-accent/40" />
        <div className="h-px w-12 bg-accent/30" />
      </div>

      <div className="max-w-2xl mx-auto text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <TreePine className="h-4 w-4 text-primary" />
          <span className="font-bold text-foreground">نسبي</span>
          <span className="text-sm text-muted-foreground">— nasaby.app</span>
        </div>
        <button
          onClick={onContact}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          تواصل معنا لتفعيل منصة عائلتك
        </button>
        <p className="text-xs text-muted-foreground">جميع الحقوق محفوظة — نسبي</p>
      </div>
    </footer>
  );
}
