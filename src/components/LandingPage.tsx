import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Search, TreePine, ChevronDown, Users, Layers, Crown, User, UserRound, Heart, Quote, Send, BookOpen, Shield, ScrollText, Smartphone, Share, BadgeCheck, Scale, BookOpenText, Map as MapIcon, BookMarked, AlignJustify, ChevronLeft } from "lucide-react";
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
import { getAllMembers, getDescendantCount, searchMembers, loadMembers, getMemberById, getChildrenOf, getAncestorChain, getDepth } from "@/services/familyService";
import { PILLARS, DOCUMENTER_ID, ADMIN_MEMBER_IDS, getBranch, getBranchStyle } from "@/utils/branchUtils";
import { useAuth } from "@/contexts/AuthContext";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { HeritageBadge } from "@/components/HeritageBadge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input as SheetInput } from "@/components/ui/input";

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
  const [forceOnboarding, setForceOnboarding] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [showInstallSection, setShowInstallSection] = useState(() => localStorage.getItem('khunaini-pwa-installed-ios') !== 'true');
  const [aboutOpen, setAboutOpen] = useState(false);
  const [showNasabSheet, setShowNasabSheet] = useState(false);
  const [nasabQuery, setNasabQuery] = useState("");
  const stats = useMemo(computeStats, [dataReady]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const pwa = usePWAInstall();

  const isAdmin = currentUser && ADMIN_MEMBER_IDS.includes(currentUser.memberId);

  const pillarStats = useMemo(() => PILLARS.map((p) => ({ ...p, descendants: getDescendantCount(p.id) })), [dataReady]);

  // Dashboard data for logged-in user
  const dashboardData = useMemo(() => {
    if (!currentUser) return null;
    const member = getMemberById(currentUser.memberId);
    if (!member) return null;
    const branch = getBranch(currentUser.memberId);
    const branchStyle = branch ? getBranchStyle(branch.pillarId) : null;
    const depth = getDepth(currentUser.memberId);
    const children = getChildrenOf(currentUser.memberId);
    const ancestors = getAncestorChain(currentUser.memberId);
    const siblings = member.father_id
      ? getChildrenOf(member.father_id).filter((s) => s.id !== member.id)
      : [];
    return { member, branch, branchStyle, depth, children, ancestors, siblings };
  }, [currentUser, dataReady]);

  useEffect(() => { trackVisit(); }, []);
  useEffect(() => { loadMembers().finally(() => setDataReady(true)); }, []);
  const filtered = searchMembers(query);
  const showingResults = open && filtered.length > 0;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
      <OnboardingModal forceOpen={forceOnboarding} />

      {/* ─── 1. Hero (compact) ─── */}
      <section className="relative flex flex-col items-center justify-center px-4 text-center pt-12 pb-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

        {/* Top-left: Theme + Font */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5">
          <FontSizeToggle />
          <ThemeToggle />
        </div>

        {/* Top-right: Admin shield */}
        {isAdmin && (
          <div className="absolute top-4 right-4 z-30">
            <button
              onClick={() => navigate("/admin")}
              className="h-9 w-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors"
              aria-label="لوحة الإدارة"
            >
              <Shield className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="max-w-lg mx-auto space-y-2 w-full">
          <TreePine className="h-10 w-10 text-primary mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }} />
          <h1 className="text-2xl font-extrabold text-primary leading-tight opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            بوابة تراث الخنيني
          </h1>
          <p className="text-sm text-muted-foreground opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            فرع الزلفي
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent max-w-xs mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }} />
        </div>
      </section>

      {/* ─── 2A. Personal Dashboard (logged-in) ─── */}
      {currentUser && dashboardData && (
        <section className="py-4 px-4 animate-fade-in">
          <div
            className="max-w-lg mx-auto rounded-2xl border bg-card/80 backdrop-blur-sm p-4 space-y-4"
            style={{ borderColor: dashboardData.branchStyle ? dashboardData.branchStyle.text + "40" : undefined }}
          >
            {/* Top row: avatar + name + badges */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: dashboardData.member.gender === "F" ? "hsl(330, 50%, 92%)" : "hsl(210, 50%, 92%)",
                  color: dashboardData.member.gender === "F" ? "hsl(330, 50%, 35%)" : "hsl(210, 50%, 35%)",
                }}
              >
                {dashboardData.member.gender === "F" ? <UserRound className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-base font-bold text-foreground truncate">{currentUser.memberName}</span>
                  <BadgeCheck className="h-4 w-4 text-green-500 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {dashboardData.branch && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: dashboardData.branchStyle?.bg,
                        color: dashboardData.branchStyle?.text,
                      }}
                    >
                      {dashboardData.branch.label}
                    </span>
                  )}
                  <HeritageBadge type="generation" generationNum={dashboardData.depth} />
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "الأبناء", value: dashboardData.children.length },
                { label: "الأجداد", value: dashboardData.ancestors.length - 1 },
                { label: "الأشقاء", value: dashboardData.siblings.length },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-muted/50 border border-border/40 py-2 px-1">
                  <div className="text-lg font-extrabold text-primary">{s.value.toLocaleString("ar-SA")}</div>
                  <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "نسبي", icon: ScrollText, onClick: () => navigate(`/person/${currentUser.memberId}`) },
                { label: "قرابة", icon: Scale, onClick: () => onBrowseTree() },
                { label: "ملفي", icon: User, onClick: () => navigate("/profile") },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 border border-border/40 p-2.5 min-h-[56px] text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <action.icon className="h-5 w-5 text-primary" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 2B. Guest CTA (guest only) ─── */}
      {!currentUser && (
        <section className="py-4 px-4">
          <div className="max-w-lg mx-auto space-y-4 text-center">
            <h2 className="text-lg font-bold text-foreground opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              اكتشف موقعك في شجرة العائلة
            </h2>

            {/* Guest search */}
            <div className="relative z-20">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="ابحث عن اسمك لمعرفة نسبك"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                  onFocus={() => query.trim() && setOpen(true)}
                  onBlur={() => setTimeout(() => setOpen(false), 200)}
                  className="pr-12 pl-4 h-14 text-base rounded-2xl bg-card border-border shadow-lg focus:ring-2 focus:ring-accent placeholder:text-muted-foreground"
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

            {/* Guest action buttons */}
            <div className="flex gap-3">
              <Button
                onClick={onBrowseTree}
                className="flex-1 min-h-[48px] rounded-xl font-bold text-base gap-2"
              >
                <TreePine className="h-5 w-5" />
                تصفح الشجرة
              </Button>
              <Button
                onClick={() => setForceOnboarding(true)}
                variant="outline"
                className="flex-1 min-h-[48px] rounded-xl font-bold text-base gap-2 border-accent/30 text-accent hover:bg-accent/10"
              >
                <User className="h-5 w-5" />
                سجّل دخولك
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ─── Quick Actions Grid (all users) ─── */}
      <section className="py-3 px-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-2.5">
          {[
            { label: "الشجرة", icon: MapIcon, color: "text-primary", onClick: () => onBrowseTree() },
            { label: "النسب", icon: ScrollText, color: "text-accent", onClick: () => currentUser ? navigate(`/person/${currentUser.memberId}`) : onBrowseTree() },
            { label: "القرابة", icon: Scale, color: "text-primary", onClick: () => onBrowseTree() },
            { label: "الوثائق", icon: BookOpen, color: "text-amber-600", onClick: () => navigate("/documents") },
            { label: "الدليل", icon: BookMarked, color: "text-muted-foreground", onClick: () => navigate("/guide") },
            { label: "طلب تعديل", icon: Send, color: "text-accent", onClick: () => setRequestOpen(true) },
          ].map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex flex-col items-center gap-1.5 rounded-xl border bg-card/60 p-3 min-h-[72px] text-center hover:bg-card hover:shadow-sm transition-all"
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── 3. Search (logged-in only, below dashboard) ─── */}
      {currentUser && (
        <section className="py-4 px-4">
          <div className="max-w-lg mx-auto relative z-20">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="ابحث عن أي فرد في العائلة..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => query.trim() && setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
                className="pr-12 pl-4 h-12 text-base rounded-2xl bg-card border-border shadow-sm focus:ring-2 focus:ring-accent placeholder:text-muted-foreground"
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
      )}

      {/* ─── 4. كلمة الموثّق ─── */}
      <section className="py-6 px-4">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[hsl(35,70%,92%)] text-[hsl(35,55%,30%)] font-bold text-sm">
            <ScrollText className="h-4 w-4" />
            كلمة الموثّق
          </div>

          <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 text-right border-r-4 border-r-[hsl(35,60%,45%)]">
            <Quote className="absolute top-4 right-4 h-8 w-8 text-[hsl(35,60%,45%)]/20" />
            <blockquote className="text-base text-muted-foreground leading-loose italic pr-8">
              "الهدف من هذه الشجرة التوثيق مثل تواريخ الميلاد، الوفاة، المصاهرة وترتيب الاخوة نسأل الله سبحانه وتعالى لأبائنا وامهاتنا وابائهم وامهاتهم ومن له حق علينا بالرحمة والمغفرة وان يجمعنا جميعاً معهم بجنات النعيم"
            </blockquote>
            <div className="mt-4 text-sm text-muted-foreground">
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

      {/* ─── 5. Three Pillars ─── */}
      <section className="py-8 px-4 border-t border-border/30">
        <div className="max-w-4xl mx-auto text-center space-y-6">
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

      {/* ─── 6. Browse Full Tree CTA ─── */}
      <section className="py-4 px-4">
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

      {/* ─── 7. Statistics ─── */}
      <section className="py-8 px-4 border-t border-border/30">
        <div className="max-w-3xl mx-auto text-center space-y-6">
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

      {/* ─── 8. Historical Documents ─── */}
      <section className="py-8 px-4 border-t border-border/30">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent/15 text-accent font-bold text-sm">
            <ScrollText className="h-4 w-4" />
            مستندات تاريخية
          </div>
          <h2 className="text-xl md:text-3xl font-extrabold text-foreground">
            أرشيف العائلة الموثّق
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            وثائق ومستندات تاريخية تحفظ جزءاً من إرث العائلة عبر الزمن
          </p>
          <Button
            onClick={() => navigate("/documents")}
            variant="outline"
            size="lg"
            className="rounded-2xl h-14 px-8 text-base font-extrabold border-accent/30 text-accent hover:bg-accent/10 gap-2"
          >
            <ScrollText className="h-5 w-5" />
            استعرض المستندات
          </Button>
        </div>
      </section>

      {/* ─── 9. PWA Install (compact, no tabs) ─── */}
      {showInstallSection && !window.matchMedia('(display-mode: standalone)').matches && !(window.navigator as any).standalone && (
        <section className="py-4 px-4">
          <div className="max-w-lg mx-auto rounded-2xl border bg-card/80 backdrop-blur-sm p-4 space-y-3">
            <div className="flex flex-col items-center text-center gap-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                <Smartphone className="h-3.5 w-3.5" />
                حمّل التطبيق
              </div>
              <p className="text-sm font-bold text-foreground">أضفه لشاشتك الرئيسية</p>
            </div>

            {/* Android */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground">أندرويد 🤖</p>
              {pwa.canInstall && !pwa.isIOS ? (
                <Button onClick={pwa.triggerInstall} className="w-full min-h-[44px] rounded-xl text-sm font-bold">
                  ⬇️ تثبيت التطبيق الآن
                </Button>
              ) : pwa.isInstalled ? (
                <div className="text-center py-2 text-xs font-bold text-primary">
                  ✅ التطبيق مثبّت بالفعل
                </div>
              ) : (
                <div className="space-y-1.5">
                  {[
                    { num: "1️⃣", text: "افتح القائمة ⋮ في المتصفح" },
                    { num: "2️⃣", text: 'اختر "إضافة إلى الشاشة الرئيسية"' },
                    { num: "3️⃣", text: 'اضغط "إضافة"' },
                  ].map((step, i) => (
                    <div key={i} className="rounded-lg bg-muted/50 border border-border/40 p-2 flex items-center gap-2 text-xs">
                      <span>{step.num}</span>
                      <span className="text-foreground">{step.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border/50" />

            {/* iOS */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground">آيفون 🍎</p>
              <div className="space-y-1.5">
                {[
                  { num: "1️⃣", text: "افتح الصفحة في Safari" },
                  { num: "2️⃣", text: "اضغط زر المشاركة ⬆️" },
                  { num: "3️⃣", text: 'اختر "إضافة إلى الشاشة الرئيسية" 📲' },
                  { num: "4️⃣", text: 'اضغط "إضافة" ✓' },
                ].map((step, i) => (
                  <div key={i} className="rounded-lg bg-muted/50 border border-border/40 p-2 flex items-center gap-2 text-xs">
                    <span>{step.num}</span>
                    <span className="text-foreground">{step.text}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 rounded-lg px-3 py-1.5 text-center">
                ⚠️ تأكد من استخدام Safari
              </div>
              <Button
                variant="ghost"
                className="w-full text-xs text-muted-foreground underline py-1"
                onClick={() => {
                  localStorage.setItem('khunaini-pwa-installed-ios', 'true');
                  setShowInstallSection(false);
                }}
              >
                ✓ ثبّتت التطبيق — إخفاء
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ─── 10. About (collapsible) ─── */}
      <section className="py-4 px-4 bg-card/50 border-t border-border/30">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-accent/15 text-accent font-bold text-sm">
            عن العائلة
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
            جذور ممتدة عبر الأجيال
          </h2>
          <Collapsible open={aboutOpen} onOpenChange={setAboutOpen}>
            <div className="space-y-4 text-base text-muted-foreground leading-loose text-right">
              <p>
                تنحدر عائلة <strong className="text-foreground">الخنيني</strong> من{" "}
                <strong className="text-foreground">حميد</strong> من الحماضا من حماد من{" "}
                <strong className="text-foreground">بني العنبر بن عمرو بن تميم</strong>، إحدى أعرق القبائل العربية.
                ويُعدّ <strong className="text-foreground">محمد بن سلامة</strong> أول من حمل لقب
                الخنيني، ليُصبح هذا الاسم رمزًا للعائلة عبر الأجيال.
              </p>
              <CollapsibleContent>
                <p>
                  تضرب جذور العائلة في نجد، وقد توارثت قيم الكرم والشجاعة والتماسك الأسري جيلاً بعد جيل.
                  هذه المنصة الرقمية هي خطوة لحفظ هذا الإرث العريق وتسهيل التواصل بين أبناء العائلة.
                </p>
              </CollapsibleContent>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="text-xs text-muted-foreground mt-2">
                {aboutOpen ? "إخفاء ↑" : "اقرأ المزيد ↓"}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="h-px w-16 bg-accent/30" />
            <div className="w-2 h-2 rounded-full bg-accent/50" />
            <div className="h-px w-16 bg-accent/30" />
          </div>
        </div>
      </section>

      {/* ─── 11. Footer ─── */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/30 space-y-3">
        <p>شجرة عائلة الخنيني — حفظ الإرث للأجيال القادمة</p>
        <div className="flex justify-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRequestOpen(true)}
            className="text-xs text-accent hover:text-accent gap-1"
          >
            <Send className="h-3.5 w-3.5" />
            أرسل طلب تعديل
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/guide")}
            className="text-xs text-muted-foreground gap-1"
          >
            <BookOpen className="h-3.5 w-3.5" />
            دليل الاستخدام
          </Button>
        </div>
      </footer>

      <SubmitRequestForm open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
}
