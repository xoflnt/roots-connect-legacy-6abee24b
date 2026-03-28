import { motion } from "framer-motion";
import { Trees, Search, Users, GitBranch, AlignJustify, BookOpen } from "lucide-react";
import { staggerContainer, staggerItem, springConfig } from "@/lib/animations";

export type DemoTab = "home" | "tree" | "search" | "kinship" | "list";

interface DemoQuickActionsProps {
  onTabChange: (tab: DemoTab) => void;
}

const ACTIONS: { label: string; icon: typeof Trees; tab: DemoTab; color: string; bg: string }[] = [
  { label: "الشجرة", icon: Trees, tab: "tree", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
  { label: "البحث", icon: Search, tab: "search", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/40" },
  { label: "القرابة", icon: Users, tab: "kinship", color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/40" },
  { label: "الفروع", icon: GitBranch, tab: "tree", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/40" },
  { label: "القائمة", icon: AlignJustify, tab: "list", color: "text-slate-700 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800/60" },
  { label: "عن العائلة", icon: BookOpen, tab: "home", color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-900/40" },
];

export function DemoQuickActions({ onTabChange }: DemoQuickActionsProps) {
  return (
    <section className="py-8 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent font-bold text-sm">
            استكشف المنصة
          </span>
        </div>
        <motion.div
          className="grid grid-cols-3 gap-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {ACTIONS.map((a) => (
            <motion.button
              key={a.label}
              variants={staggerItem}
              whileHover={{ scale: 1.03, transition: springConfig }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onTabChange(a.tab)}
              className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center`}>
                <a.icon className={`h-5 w-5 ${a.color}`} />
              </div>
              <span className="text-xs font-bold text-foreground">{a.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
