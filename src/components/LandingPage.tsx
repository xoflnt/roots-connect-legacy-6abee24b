import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Search, TreePine, ChevronDown, Users, Layers, Crown, User, UserRound, Heart, Quote, Send, BookOpen, UserCheck, Calculator, Shield, ScrollText, UserCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getLineageLabel, getMemberSubtitle } from "@/utils/memberLabel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FontSizeToggle } from "@/components/FontSizeToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FamilyMember } from "@/data/familyData";
import { OnboardingModal } from "@/components/OnboardingModal";
import { SubmitRequestForm } from "@/components/SubmitRequestForm";
import { trackVisit } from "@/services/dataService";
import { getAllMembers, getDescendantCount } from "@/services/familyService";
import { PILLARS, DOCUMENTER_ID } from "@/utils/branchUtils";
import { useAuth } from "@/contexts/AuthContext";

interface LandingPageProps {
  onSearchSelect: (memberId: string) => void;
  onBrowseTree: () => void;
  onBrowseBranch?: (pillarId: string) => void;
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
  const allMembers = getAllMembers();
  const total = allMembers.length;
  const roots = allMembers.filter((m) => !m.father_id);
  const childrenMap = new Map<string | null, string[]>();
  for (const m of allMembers) {
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
  const males = allMembers.filter((m) => m.gender === "M").length;
  const females = allMembers.filter((m) => m.gender === "F").length;
  const maleNameCounts = new Map<string, number>();
  const femaleNameCounts = new Map<string, number>();
  for (const m of allMembers) {
    const firstName = m.name.split(" ")[0];
    if (m.gender === "M") maleNameCounts.set(firstName, (maleNameCounts.get(firstName) || 0) + 1);
    else femaleNameCounts.set(firstName, (femaleNameCounts.get(firstName) || 0) + 1);
  }
  let topMaleName = "", topMaleCount = 0;
  for (const [name, count] of maleNameCounts) {
    if (count > topMaleCount) { topMaleName = name; topMaleCount = count; }
  }
  let topFemaleName = "", topFemaleCount = 0;
  for (const [name, count] of femaleNameCounts) {
    if (count > topFemaleCount) { topFemaleName = name; topFemaleCount = count; }
  }
  return { total, generations: maxDepth, males, females, topMaleName, topMaleCount, topFemaleName, topFemaleCount };
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

const PILLAR_COLORS = [
  { bg: "bg-[hsl(155,40%,90%)]", border: "border-[hsl(155,45%,70%)]", icon: "text-[hsl(155,45%,30%)]" },
  { bg: "bg-[hsl(25,50%,90%)]", border: "border-[hsl(25,55%,70%)]", icon: "text-[hsl(25,55%,35%)]" },
  { bg: "bg-[hsl(45,70%,92%)]", border: "border-[hsl(45,60%,70%)]", icon: "text-[hsl(45,60%,35%)]" },
];

export function LandingPage({ onSearchSelect, onBrowseTree, onBrowseBranch }: LandingPageProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const stats = useMemo(computeStats, []);

  const pillarStats = useMemo(() => PILLARS.map((p) => ({ ...p, descendants: getDescendantCount(p.id) })), []);

  useEffect(() => { trackVisit(); }, []);

  const allMembers = getAllMembers();
  const filtered = query.trim() ? allMembers.filter((m) => m.name.includes(query.trim())).slice(0, 10) : [];
  const showingResults = open && filtered.length > 0;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
      <OnboardingModal />

      {/* ─── 1. Hero Title (compact) ─── */}
      <section className="relative flex flex-col items-center justify-center px-4 text-center pt-16 pb-10 md:pt-24 md:pb-14">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5">
          <FontSizeToggle />
          <ThemeToggle />
        </div>

        <div className="max-w-3xl mx-auto space-y-4 w-full">
          <div className="mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <TreePine className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-6xl font-extrabold text-primary leading-tight opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            بوابة تراث الخنيني - فرع الزلفي
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in px-2" style={{ animationDelay: "0.4s" }}>
            توثيق للأصالة، وامتداد للجذور... منصة رقمية تجمع أجيال العائلة وتحفظ إرثها.
          </p>
        </div>
      </section>

      {/* ─── 2. كلمة الموثّق ─── */}
      <section className="py-8 md:py-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[hsl(35,70%,92%)] text-[hsl(35,55%,30%)] font-bold text-sm">
            <ScrollText className="h-4 w-4" />
            كلمة الموثّق
          </div>

          <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-10 text-right border-r-4 border-r-[hsl(35,60%,45%)]">
            <Quote className="absolute top-4 right-4 h-8 w-8 text-[hsl(35,60%,45%)]/20" />
            <blockquote className="text-base md:text-lg text-muted-foreground leading-loose italic pr-8">
              "الهدف من هذه الشجرة التوثيق مثل تواريخ الميلاد، الوفاة، المصاهرة وترتيب الاخوة نسأل الله سبحانه وتعالى لأبائنا وامهاتنا وابائهم وامهاتهم ومن له حق علينا بالرحمة والمغفرة وان يجمعنا جميعاً معهم بجنات النعيم"
            </blockquote>
            <div className="mt-6 text-sm text-muted-foreground">
              <span className="font-bold">— جمع وتوثيق </span>
              <Link
                to={`/person/${DOCUMENTER_ID}`}
                className="font-extrabold text-[hsl(35,55%,30%)] hover:text-[hsl(35,60%,40%)] underline underline-offset-4 decoration-[hsl(35,60%,45%)]/40 transition-colors"
              >
                علي المحمد
              </Link>
              <br />
              <span>٢/١٢/١٤٤١</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Search Bar ─── */}
      <section className="py-6 md:py-8 px-4">
        <div className="max-w-lg mx-auto relative z-20">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="ابحث عن اسمك لمعرفة نسبك"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => query.trim() && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              className="pr-12 pl-4 h-14 text-base md:text-lg rounded-2xl bg-card border-border shadow-lg focus:ring-2 focus:ring-accent placeholder:text-muted-foreground"
            />
          </div>
          {showingResults && (
            <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
              {filtered.map((m) => {
                const subtitle = getMemberSubtitle(m);
                return (
                  <button
                    key={m.id}
                    className="w-full text-right px-5 py-3 text-foreground hover:bg-muted transition-colors border-b border-border/30 last:border-b-0"
                    style={{ minHeight: 48 }}
                    onMouseDown={() => { onSearchSelect(m.id); setQuery(m.name); setOpen(false); }}
                  >
                    <span className="font-bold block">{getLineageLabel(m)}</span>
                    {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── 4. Three Pillars ─── */}
      <section className="py-12 md:py-20 px-4 border-t border-border/30">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
          <div className="inline-block px-5 py-2 rounded-full bg-accent/15 text-accent font-bold text-sm">
            ركائز العائلة
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">
            أبناء زيد الثلاثة — أعمدة الفرع
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            يقوم فرع الزلفي على ثلاثة أعمام هم أبناء زيد، ومنهم تفرّعت جميع عائلات الخنيني في الزلفي
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-4">
            {pillarStats.map((pillar, i) => {
              const colors = PILLAR_COLORS[i];
              return (
                <div
                  key={pillar.id}
                  className={`relative rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 md:p-8 flex flex-col items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer group`}
                  onClick={() => onBrowseBranch?.(pillar.id)}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-background/60 flex items-center justify-center ${colors.icon}`}>
                    <Shield className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-foreground">{pillar.name}</h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-bold">
                    <Users className="h-4 w-4" />
                    <span>{pillar.descendants} فرد</span>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-2 rounded-xl font-bold group-hover:bg-background/80 transition-colors"
                    onClick={(e) => { e.stopPropagation(); onBrowseBranch?.(pillar.id); }}
                  >
                    <TreePine className="h-4 w-4 ml-1.5" />
                    تصفح الفرع
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. Browse Full Tree CTA ─── */}
      <section className="py-6 md:py-10 px-4">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={onBrowseTree}
            size="lg"
            className="h-16 w-full text-lg md:text-xl rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl hover:shadow-2xl transition-all font-extrabold"
          >
            <TreePine className="h-6 w-6 ml-3" />
            تصفح كامل الشجرة
          </Button>
        </div>
      </section>

      {/* ─── 6. Statistics ─── */}
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
          </div>
        </div>
      </section>

      {/* ─── 7. How to Use ─── */}
      <section className="py-12 md:py-20 px-4 border-t border-border/30">
        <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-accent/15 text-accent font-bold text-sm">
            كيف تستخدم المنصة
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: TreePine, title: "تصفح الشجرة", desc: "استكشف الفروع بالنقر والتوسّع" },
              { icon: Search, title: "البحث السريع", desc: "ابحث عن أي فرد بالاسم" },
              { icon: UserCheck, title: "سجّل بياناتك", desc: "طالب بملفك وحدّث معلوماتك" },
              { icon: Calculator, title: "حاسبة القرابة", desc: "اكتشف صلتك بأي فرد" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-bold text-sm text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground leading-snug text-center">{desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.href = "/guide"}
              className="rounded-2xl h-12 px-8 text-base font-bold border-primary/30 text-primary hover:bg-primary/10"
            >
              <BookOpen className="h-4 w-4 ml-2" />
              دليل الاستخدام الكامل
            </Button>
            <Button
              variant="outline"
              onClick={() => setRequestOpen(true)}
              className="rounded-2xl h-12 px-8 text-base font-bold border-accent/30 text-accent hover:bg-accent/10"
            >
              <Send className="h-4 w-4 ml-2" />
              أرسل طلب تعديل
            </Button>
          </div>
        </div>
      </section>

      {/* ─── 8. About ─── */}
      <section className="py-12 md:py-20 px-4 bg-card/50 border-t border-border/30">
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
              <strong className="text-foreground">حميد</strong> من الحماضا من حماد من{" "}
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

      {/* ─── 9. Footer ─── */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/30">
        <p>شجرة عائلة الخنيني — حفظ الإرث للأجيال القادمة</p>
      </footer>

      <SubmitRequestForm open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
}
