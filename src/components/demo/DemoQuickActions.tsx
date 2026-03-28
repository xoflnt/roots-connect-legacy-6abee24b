import { Trees, Search, Users, AlignJustify } from "lucide-react";

export type DemoTab = "home" | "tree" | "search" | "kinship" | "list";

interface DemoQuickActionsProps {
  onTabChange: (tab: DemoTab) => void;
}

const ACTIONS: { label: string; icon: typeof Trees; tab: DemoTab }[] = [
  { label: "شجرة العائلة", icon: Trees, tab: "tree" },
  { label: "البحث في العائلة", icon: Search, tab: "search" },
  { label: "حاسبة القرابة", icon: Users, tab: "kinship" },
  { label: "قائمة الأفراد", icon: AlignJustify, tab: "list" },
];

export function DemoQuickActions({ onTabChange }: DemoQuickActionsProps) {
  return (
    <section className="py-6 px-4">
      <div className="max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
        {ACTIONS.map((a) => (
          <button
            key={a.tab}
            onClick={() => onTabChange(a.tab)}
            className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all text-center"
          >
            <a.icon className="h-6 w-6 text-primary" />
            <span className="text-sm font-bold text-foreground">{a.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
