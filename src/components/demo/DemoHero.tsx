import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { TreePine, Search, Users, Trees, Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchDemoMembers } from "@/services/demoService";
import { applyTatweel } from "@/utils/tatweelUtils";
import { gentleSpring, staggerContainer, staggerItem } from "@/lib/animations";
import type { DemoMember } from "@/data/demoFamilyData";
import type { DemoTab } from "./DemoQuickActions";

interface DemoHeroProps {
  familyName: string;
  members: DemoMember[];
  totalCount: number;
  onSelectMember: (id: string) => void;
  onTabChange: (tab: DemoTab) => void;
}

function toAr(n: number): string {
  return n.toLocaleString("ar-SA");
}

export function DemoHero({ familyName, members, totalCount, onSelectMember, onTabChange }: DemoHeroProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = searchDemoMembers(members, query);
  const showResults = open && results.length > 0;

  return (
    <div className="relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <picture>
          <source media="(max-width: 768px)" srcSet="/images/hero-bg-mobile.webp" type="image/webp" />
          <source srcSet="/images/hero-bg.webp" type="image/webp" />
          <img src="/images/hero-bg.jpg" alt="" fetchPriority="high" decoding="async" className="absolute inset-0 w-full h-full object-cover object-top select-none" />
        </picture>
        <div className="absolute inset-0 dark:bg-black/40 bg-black/20" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(15,42,30,0.25) 0%, transparent 35%, rgba(246,243,238,0.85) 80%, rgba(246,243,238,1) 100%)" }} />
      </div>

      {/* Content */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 text-center pt-12 pb-28 md:pt-20 md:pb-36">
        <motion.div
          className="max-w-lg mx-auto space-y-3 w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <TreePine className="h-10 w-10 text-white mx-auto" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.8))" }} />
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight" style={{ textShadow: "0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.8)" }}>
            {applyTatweel(`بوابة تراث ${familyName}`)}
          </h1>
          <p className="text-sm text-white/90" style={{ textShadow: "0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.8)" }}>
            المنصة الرقمية لحفظ تراث وأنساب عائلة {familyName}
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent max-w-xs mx-auto" />

          {/* Member count badge */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5">
              <Users className="h-4 w-4 text-white/80" />
              <span className="text-sm font-bold text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                {toAr(totalCount)} فرد في الشجرة
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative" style={{ zIndex: 99 }}>
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none" />
              <Input
                placeholder={`ابحث عن أي فرد في عائلة ${familyName}...`}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => query.trim() && setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
                className="pr-12 pl-4 h-14 text-base rounded-2xl hero-search"
                style={{
                  backgroundColor: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1.5px solid rgba(255,255,255,0.5)",
                  color: "white",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                }}
              />
            </div>
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl overflow-hidden shadow-xl max-h-[300px] overflow-y-auto" style={{ zIndex: 999 }}>
                {results.map(m => (
                  <button
                    key={m.id}
                    className="w-full text-right px-4 py-3 hover:bg-muted border-b border-border/30 last:border-0 transition-colors"
                    onMouseDown={() => { onSelectMember(m.id); setQuery(""); setOpen(false); }}
                  >
                    <span className="font-bold text-foreground text-sm block">{m.name}</span>
                    {m.birth_year && <span className="text-xs text-muted-foreground">{m.birth_year} هـ</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick action buttons */}
          <motion.div
            className="flex gap-3 mt-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div
              variants={staggerItem}
              onClick={() => onTabChange("tree")}
              className="flex-1 min-h-[48px] flex items-center justify-center font-bold text-base gap-2 text-white cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/20 transition-colors"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              <Trees className="h-5 w-5" />
              تصفح الشجرة
            </motion.div>
            <motion.div
              variants={staggerItem}
              onClick={() => onTabChange("kinship")}
              className="flex-1 min-h-[48px] flex items-center justify-center font-bold text-base gap-2 text-white/90 cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/20 transition-colors"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              <Scale className="h-5 w-5" />
              حاسبة القرابة
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Gradient fade + wave */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-[5] pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent 0%, hsl(var(--background) / 0.6) 50%, hsl(var(--background)) 100%)" }}
      />
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden z-[5] pointer-events-none">
        <svg viewBox="0 0 1440 60" className="w-full h-10 fill-background" preserveAspectRatio="none">
          <path d="M0,0 C240,60 480,60 720,30 C960,0 1200,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </div>
  );
}
