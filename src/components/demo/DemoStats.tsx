import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Layers, User, UserRound, Crown, Heart } from "lucide-react";
import { toArabicNum } from "@/utils/arabicUtils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { DemoMember } from "@/data/demoFamilyData";

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const start = useCallback(() => setStarted(true), []);
  useEffect(() => {
    if (!started || target === 0) return;
    let raf: number;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);
  return { value: started ? value : 0, start };
}

function StatCard({ icon: Icon, label, value, suffix }: { icon: React.ElementType; label: string; value: number; suffix?: string }) {
  const counter = useCountUp(value);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { counter.start(); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <motion.div ref={ref} variants={staggerItem} className="flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
      <Icon className="h-5 w-5 text-accent shrink-0" />
      <span className="text-2xl md:text-3xl font-extrabold text-foreground">
        {toArabicNum(counter.value)}{suffix}
      </span>
      <span className="text-xs md:text-sm text-muted-foreground font-bold text-center leading-snug">{label}</span>
    </motion.div>
  );
}

interface DemoStatsProps {
  members: DemoMember[];
}

export function DemoStats({ members }: DemoStatsProps) {
  const stats = useMemo(() => {
    const total = members.length;
    const males = members.filter(m => m.gender === "M").length;
    const females = members.filter(m => m.gender === "F").length;
    // Compute max depth
    const memberMap = new Map(members.map(m => [m.id, m]));
    let maxDepth = 0;
    for (const m of members) {
      let depth = 0;
      let current = m;
      while (current?.father_id) {
        depth++;
        current = memberMap.get(current.father_id)!;
      }
      if (depth > maxDepth) maxDepth = depth;
    }
    return { total, generations: maxDepth + 1, males, females };
  }, [members]);

  return (
    <section className="py-8 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent font-bold text-sm mb-3">
            إحصائيات العائلة
          </span>
        </div>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <StatCard icon={Users} label="إجمالي الأفراد" value={stats.total} />
          <StatCard icon={Layers} label="عدد الأجيال" value={stats.generations} />
          <StatCard icon={User} label="الذكور" value={stats.males} />
          <StatCard icon={UserRound} label="الإناث" value={stats.females} />
        </motion.div>
      </div>
    </section>
  );
}
