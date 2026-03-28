import { useState } from "react";
import { TreePine, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchDemoMembers } from "@/services/demoService";
import type { DemoMember } from "@/data/demoFamilyData";

interface DemoHeroProps {
  familyName: string;
  members: DemoMember[];
  totalCount: number;
  onSelectMember: (id: string) => void;
}

function toAr(n: number): string {
  return n.toLocaleString("ar-SA");
}

export function DemoHero({ familyName, members, totalCount, onSelectMember }: DemoHeroProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = searchDemoMembers(members, query);
  const showResults = open && results.length > 0;

  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <picture>
          <source media="(max-width: 768px)" srcSet="/images/hero-bg-mobile.webp" type="image/webp" />
          <source srcSet="/images/hero-bg.webp" type="image/webp" />
          <img src="/images/hero-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-top select-none" />
        </picture>
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, hsl(var(--background)) 100%)" }} />
      </div>

      <section className="relative z-10 flex flex-col items-center justify-center px-4 text-center pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-lg mx-auto space-y-5 w-full">
          <TreePine className="h-10 w-10 text-white mx-auto" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.8))" }} />
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight" style={{ textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>
            مرحباً بكم في بوابة تراث عائلة {familyName}
          </h1>
          <p className="text-sm text-white/85 leading-relaxed" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            المنصة الرقمية الأولى لحفظ تراث وأنساب عائلة {familyName}
          </p>

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
                  border: "1.5px solid rgba(255,255,255,0.5)",
                  color: "white",
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
        </div>
      </section>
    </div>
  );
}
