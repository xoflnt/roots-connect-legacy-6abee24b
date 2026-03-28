import { Edit3 } from "lucide-react";

interface DemoAboutFamilyProps {
  familyName: string;
}

export function DemoAboutFamily({ familyName }: DemoAboutFamilyProps) {
  return (
    <section className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-foreground">عن عائلة {familyName}</h2>
          </div>
          <p className="text-sm text-muted-foreground/60 leading-relaxed italic">
            هنا يمكنكم كتابة نسب عائلة {familyName} وتاريخها وأصلها ومنطقتها.
            يمكن إضافة أصل العائلة، المنطقة التي تنتمي إليها، وأبرز المحطات التاريخية في مسيرة العائلة.
            هذا القسم قابل للتعديل بالكامل من لوحة الإدارة.
          </p>
        </div>
      </div>
    </section>
  );
}
