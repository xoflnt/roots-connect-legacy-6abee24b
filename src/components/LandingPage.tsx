import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Search, TreePine, ChevronDown, Users, Layers, Crown, User, UserRound, Heart, Quote } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { familyMembers } from "@/data/familyData";

interface LandingPageProps {
  onSearchSelect: (memberId: string) => void;
  onBrowseTree: () => void;
}

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

function computeStats() {
  const total = familyMembers.length;
  const roots = familyMembers.filter((m) => !m.father_id);

  // Max depth
  const childrenMap = new Map<string | null, string[]>();
  for (const m of familyMembers) {
    const list = childrenMap.get(m.father_id) || [];
    list.push(m.id);
    childrenMap.set(m.father_id, list);
  }
  let maxDepth = 0;
  const stack: Array<{ id: string; depth: number }> = roots.map((r) => ({ id: r.id, depth: 1 }));
  while (stack.length) {
    const { id, depth } = stack.pop()!;
    if (depth > maxDepth) maxDepth = depth;
    for (const childId of childrenMap.get(id) || []) {
      stack.push({ id: childId, depth: depth + 1 });
    }
  }

  // Gender counts
  const males = familyMembers.filter((m) => m.gender === "M").length;
  const females = familyMembers.filter((m) => m.gender === "F").length;

  // Most common male first name
  const maleNameCounts = new Map<string, number>();
  const femaleNameCounts = new Map<string, number>();
  for (const m of familyMembers) {
    const firstName = m.name.split(" ")[0];
    if (m.gender === "M") {
      maleNameCounts.set(firstName, (maleNameCounts.get(firstName) || 0) + 1);
    } else {
      femaleNameCounts.set(firstName, (femaleNameCounts.get(firstName) || 0) + 1);
    }
  }

  let topMaleName = "", topMaleCount = 0;
  for (const [name, count] of maleNameCounts) {
    if (count > topMaleCount) { topMaleName = name; topMaleCount = count; }
  }
  let topFemaleName = "", topFemaleCount = 0;
  for (const [name, count] of femaleNameCounts) {
    if (count > topFemaleCount) { topFemaleName = name; topFemaleCount = count; }
  }

  return {
    total, generations: maxDepth, males, females,
    topMaleName, topMaleCount,
    topFemaleName, topFemaleCount,
  };
}




function StatCard({ icon: Icon, label, value, suffix, highlight }: { icon: React.ElementType; label: string; value: number; suffix?: string; highlight?: string }) {
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
    <div ref={ref} className="flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
      <Icon className="h-5 w-5 text-accent shrink-0" />
      <span className="text-2xl md:text-3xl font-extrabold text-foreground">
        {highlight && <span className="text-primary">{highlight} </span>}
        {counter.value}{suffix}
      </span>
      <span className="text-xs md:text-sm text-muted-foreground font-bold text-center break-words leading-snug">{label}</span>
    </div>
  );
}

export function LandingPage({ onSearchSelect, onBrowseTree }: LandingPageProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const stats = useMemo(computeStats, []);

  const filtered = query.trim()
    ? familyMembers.filter((m) => m.name.includes(query.trim())).slice(0, 10)
    : [];

  const showingResults = open && filtered.length > 0;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="absolute top-4 left-4 z-30">
          <ThemeToggle />
        </div>

        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 w-full pb-24">
          <div
            className="mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center opacity-0 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <TreePine className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </div>

          <h1
            className="text-3xl md:text-6xl font-extrabold text-primary leading-tight opacity-0 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            شجرة عائلة الخنيني
          </h1>

          <p
            className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in px-2"
            style={{ animationDelay: "0.4s" }}
          >
            توثيق للأصالة، وامتداد للجذور... منصة رقمية تجمع أجيال العائلة وتحفظ إرثها.
          </p>

          {/* Search Bar */}
          <div
            className="relative max-w-lg mx-auto opacity-0 animate-fade-in w-full px-2 z-20"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="ابحث عن اسمك لمعرفة نسبك"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => query.trim() && setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
                className="pr-12 pl-4 h-14 text-base md:text-lg rounded-2xl bg-card border-border shadow-lg focus:ring-2 focus:ring-accent placeholder:text-muted-foreground"
              />
            </div>

            {showingResults && (
              <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
                {filtered.map((m) => (
                  <button
                    key={m.id}
                    className="w-full text-right px-5 py-3.5 text-foreground hover:bg-muted transition-colors border-b border-border/30 last:border-b-0"
                    style={{ minHeight: 48 }}
                    onMouseDown={() => {
                      onSearchSelect(m.id);
                      setQuery(m.name);
                      setOpen(false);
                    }}
                  >
                    <span className="font-bold">{m.name}</span>
                    {m.death_year && (
                      <span className="text-sm text-muted-foreground mr-2">
                        (ت {m.death_year} هـ)
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA Button */}
          {!showingResults && (
            <div
              className="opacity-0 animate-fade-in px-2"
              style={{ animationDelay: "0.8s" }}
            >
              <Button
                onClick={onBrowseTree}
                size="lg"
                className="h-14 px-10 text-base md:text-lg rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover-scale font-bold w-full md:w-auto"
              >
                <TreePine className="h-5 w-5 ml-2" />
                تصفح الشجرة الكاملة
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={() => aboutRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground animate-bounce min-w-[44px] min-h-[44px] flex items-center justify-center z-10"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </section>

      {/* Fun Stats Section */}
      <section className="py-12 md:py-20 px-4 border-t border-border/30">
        <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm">
            العائلة بالأرقام
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <StatCard icon={Users} label="إجمالي الأفراد" value={stats.total} />
            <StatCard icon={Layers} label="عدد الأجيال" value={stats.generations} />
            <StatCard icon={User} label="عدد الأبناء (ذكور)" value={stats.males} />
            <StatCard icon={UserRound} label="عدد البنات (إناث)" value={stats.females} />
            <StatCard icon={Crown} label={`أكثر اسم للذكور: ${stats.topMaleName}`} value={stats.topMaleCount} suffix=" مرة" />
            <StatCard icon={Heart} label={`أكثر اسم للإناث: ${stats.topFemaleName}`} value={stats.topFemaleCount} suffix=" مرة" />
            <div className="col-span-2 md:col-span-3">
              <StatCard icon={Baby} label={`أكثر أب إنجاباً: ${stats.topFatherName}`} value={stats.topFatherChildCount} suffix=" أبناء" />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        ref={aboutRef}
        className="py-12 md:py-20 px-4 bg-card/50 border-t border-border/30"
      >
        <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-accent/15 text-accent font-bold text-sm">
            عن العائلة
          </div>

          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">
            جذور ممتدة عبر الأجيال
          </h2>

          <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-loose text-right">
            <p>
              تنحدر عائلة <strong className="text-foreground">الخنيني</strong> من{" "}
              <strong className="text-foreground">آل حميد</strong> من الحماضا من آل حماد من{" "}
              <strong className="text-foreground">بني العنبر بن عمرو بن تميم</strong>، إحدى أعرق القبائل العربية.
              ويُعدّ <strong className="text-foreground">محمد بن سلامة</strong> أول من حمل لقب
              الخنيني، ليُصبح هذا الاسم رمزًا للعائلة عبر الأجيال.
            </p>
            <p>
              تضرب جذور العائلة في نجد، وقد توارثت قيم الكرم والشجاعة والتماسك الأسري جيلاً بعد جيل.
              هذه المنصة الرقمية هي خطوة لحفظ هذا الإرث العريق وتسهيل التواصل بين أبناء العائلة.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="h-px w-16 bg-accent/30" />
            <div className="w-2 h-2 rounded-full bg-accent/50" />
            <div className="h-px w-16 bg-accent/30" />
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/30">
        <p>شجرة عائلة الخنيني — حفظ الإرث للأجيال القادمة</p>
      </footer>
    </div>
  );
}

