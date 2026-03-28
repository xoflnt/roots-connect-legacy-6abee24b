import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { applyTatweel } from "@/utils/tatweelUtils";
import { staggerContainer, staggerItem, springConfig } from "@/lib/animations";
import { toArabicNum } from "@/utils/arabicUtils";

interface BranchInfo {
  id: string;
  name: string;
  count: number;
}

const BRANCH_STYLES = [
  { bg: "hsl(155 40% 90%)", border: "hsl(155 45% 70%)", text: "hsl(155 45% 30%)", bgDark: "hsl(155 30% 15%)", borderDark: "hsl(155 35% 35%)", textDark: "hsl(155 40% 70%)" },
  { bg: "hsl(25 50% 90%)", border: "hsl(25 55% 70%)", text: "hsl(25 55% 35%)", bgDark: "hsl(25 30% 15%)", borderDark: "hsl(25 35% 35%)", textDark: "hsl(25 45% 70%)" },
  { bg: "hsl(45 70% 92%)", border: "hsl(45 60% 70%)", text: "hsl(45 60% 35%)", bgDark: "hsl(45 30% 15%)", borderDark: "hsl(45 35% 35%)", textDark: "hsl(45 50% 70%)" },
  { bg: "hsl(200 40% 90%)", border: "hsl(200 45% 70%)", text: "hsl(200 45% 30%)", bgDark: "hsl(200 30% 15%)", borderDark: "hsl(200 35% 35%)", textDark: "hsl(200 40% 70%)" },
];

interface DemoBranchesProps {
  familyName: string;
  branches: BranchInfo[];
}

export function DemoBranches({ familyName, branches }: DemoBranchesProps) {
  return (
    <section className="py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 space-y-2">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent font-bold text-sm">
            {applyTatweel("ركائز العائلة")}
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
            الفروع الرئيسية لعائلة {familyName}
          </h2>
        </div>
        <motion.div
          className="grid grid-cols-2 gap-3 md:gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {branches.map((branch, i) => {
            const style = BRANCH_STYLES[i % BRANCH_STYLES.length];
            return (
              <motion.div
                key={branch.id}
                variants={staggerItem}
                whileHover={{ scale: 1.03, transition: springConfig }}
                whileTap={{ scale: 0.97 }}
                className="rounded-2xl p-4 text-center space-y-2 cursor-default border shadow-sm"
                style={{
                  backgroundColor: style.bg,
                  borderColor: style.border,
                }}
              >
                <Crown className="h-6 w-6 mx-auto" style={{ color: style.text }} />
                <h3 className="text-base font-bold" style={{ color: style.text }}>
                  فرع {branch.name}
                </h3>
                <p className="text-sm" style={{ color: style.text, opacity: 0.7 }}>
                  {toArabicNum(branch.count)} فرد
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
