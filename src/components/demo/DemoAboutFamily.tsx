import { motion } from "framer-motion";
import { Edit3 } from "lucide-react";
import { applyTatweel } from "@/utils/tatweelUtils";
import { slideUp } from "@/lib/animations";

interface DemoAboutFamilyProps {
  familyName: string;
}

export function DemoAboutFamily({ familyName }: DemoAboutFamilyProps) {
  return (
    <section className="py-8 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6 space-y-2">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent font-bold text-sm">
            {applyTatweel("عن العائلة")}
          </span>
          <h2 className="text-xl font-extrabold text-foreground">
            جذور ممتدة عبر الأجيال
          </h2>
        </div>
        <motion.div
          className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-3"
          initial={slideUp.initial}
          animate={slideUp.animate}
          transition={slideUp.transition}
        >
          <div className="flex items-center gap-2 mb-2">
            <Edit3 className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-bold text-foreground">قصة عائلة {familyName}</h3>
          </div>
          <p className="text-sm text-muted-foreground/50 leading-relaxed italic">
            هنا يمكنكم كتابة نسب عائلة {familyName} وتاريخها وأصلها ومنطقتها.
            يمكن إضافة أصل العائلة، المنطقة التي تنتمي إليها، وأبرز المحطات التاريخية في مسيرة العائلة.
            هذا القسم قابل للتعديل بالكامل من لوحة الإدارة.
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-4 pt-6">
          <div className="h-px w-16 bg-accent/30" />
          <div className="w-2 h-2 rounded-full bg-accent/50" />
          <div className="h-px w-16 bg-accent/30" />
        </div>
      </div>
    </section>
  );
}
