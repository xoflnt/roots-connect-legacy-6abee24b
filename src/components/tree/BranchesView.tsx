import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getChildrenOf,
  sortByBirth,
  getDescendantCount,
  getDepth,
  isDeceased,
  isFounder,
  isBranchHead,
  inferMotherName,
  getAllMembers,
  getMemberById,
} from "@/services/familyService";
import { PILLARS, getBranchStyle, getBranch, DOCUMENTER_ID } from "@/utils/branchUtils";
import { formatAge, parseArabicYear } from "@/utils/ageCalculator";
import { HeritageBadge } from "@/components/HeritageBadge";
import { PersonDetails } from "@/components/PersonDetails";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronDown, ChevronLeft, Users, BadgeCheck, GitBranch as GitBranchIcon, Layers, Crown, Baby, Trophy, Star } from "lucide-react";
import { getVerifiedMemberIds } from "@/services/dataService";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { FamilyMember } from "@/data/familyData";
import { staggerContainer, staggerItem, gentleSpring } from "@/lib/animations";
import { useAuth } from "@/contexts/AuthContext";
import { canSeeAge, canSeeMotherName, privateLabel } from "@/utils/privacyUtils";

const FOUNDER_IDS = new Set(["100", "200", "300", "400"]);

function borderOpacity(depth: number): number {
  if (depth <= 1) return 0.8;
  if (depth === 2) return 0.65;
  if (depth === 3) return 0.5;
  return 0.35;
}

// ══════════════════════════════════════════
// Stats hook (unchanged)
// ══════════════════════════════════════════

interface BranchStats {
  members: FamilyMember[];
  totalCount: number;
  generationCount: number;
  subBranchCount: number;
  maleCount: number;
  femaleCount: number;
  generations: { depth: number; members: FamilyMember[] }[];
  notableMembers: {
    founder: FamilyMember | undefined;
    oldest: FamilyMember | undefined;
    mostChildren: FamilyMember | undefined;
    youngest: FamilyMember | undefined;
  };
  commonNames: { name: string; count: number }[];
}

function useBranchStats(selectedBranch: string): BranchStats {
  return useMemo(() => {
    const all = getAllMembers();
    const members = all.filter((m) => getBranch(m.id)?.pillarId === selectedBranch);
    const maleCount = members.filter((m) => m.gender === "M").length;
    const femaleCount = members.filter((m) => m.gender === "F").length;
    const grouped = new Map<number, FamilyMember[]>();
    for (const m of members) {
      const d = getDepth(m.id);
      if (!grouped.has(d)) grouped.set(d, []);
      grouped.get(d)!.push(m);
    }
    const generations: { depth: number; members: FamilyMember[] }[] = [];
    for (const [depth, g] of grouped) {
      generations.push({ depth, members: sortByBirth(g) });
    }
    generations.sort((a, b) => a.depth - b.depth);
    let subBranchCount = 0;
    for (const m of members) {
      if (isBranchHead(m.id)) subBranchCount++;
    }
    const founder = getMemberById(selectedBranch);
    let oldest: FamilyMember | undefined;
    let youngest: FamilyMember | undefined;
    let mostChildren: FamilyMember | undefined;
    let mostChildrenCount = 0;
    let oldestYear = Infinity;
    let youngestYear = -Infinity;
    for (const m of members) {
      const y = parseArabicYear(m.birth_year);
      if (y !== null) {
        if (!m.death_year && y < oldestYear) { oldestYear = y; oldest = m; }
        if (y > youngestYear) { youngestYear = y; youngest = m; }
      }
      const cc = getChildrenOf(m.id).length;
      if (cc > mostChildrenCount) { mostChildrenCount = cc; mostChildren = m; }
    }
    const nameFreq = new Map<string, number>();
    for (const m of members) {
      const firstName = m.name.split(" ")[0];
      if (firstName) nameFreq.set(firstName, (nameFreq.get(firstName) || 0) + 1);
    }
    const commonNames = [...nameFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    return {
      members, totalCount: members.length, generationCount: generations.length,
      subBranchCount: Math.max(subBranchCount, 1), maleCount, femaleCount, generations,
      notableMembers: { founder, oldest, mostChildren, youngest }, commonNames,
    };
  }, [selectedBranch]);
}

// Generation members sheet row
const GenMemberRow = React.memo(function GenMemberRow({
  member, onSelect, isLoggedIn,
}: { member: FamilyMember; onSelect: (m: FamilyMember) => void; isLoggedIn: boolean; }) {
  const verified = getVerifiedMemberIds().has(member.id);
  const deceased = isDeceased(member);
  const showAge = canSeeAge(member.id, isLoggedIn);
  return (
    <button
      onClick={() => onSelect(member)}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors min-h-[44px] text-right",
        deceased && "opacity-70"
      )}
      dir="rtl"
    >
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: `hsl(var(--${member.gender === "M" ? "male" : "female"}))` }} />
      <span className="font-bold text-sm text-foreground truncate flex-1">{member.name}</span>
      {verified && <BadgeCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />}
      {member.birth_year && (
        showAge ? (
          <span className="text-xs text-muted-foreground shrink-0">{formatAge(member.birth_year, member.death_year)}</span>
        ) : (
          <span className="text-[10px] italic text-muted-foreground shrink-0">{privateLabel('العمر')}</span>
        )
      )}
    </button>
  );
});

// Notable member card
const NotableCard = React.memo(function NotableCard({
  label, icon: Icon, member, detail, branchStyle, index, onSelect,
}: {
  label: string; icon: React.ElementType; member: FamilyMember | undefined; detail: string;
  branchStyle: { bg: string; text: string }; index: number; onSelect: (m: FamilyMember) => void;
}) {
  if (!member) return null;
  return (
    <motion.button
      variants={staggerItem}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(member)}
      className="w-[140px] flex-shrink-0 rounded-2xl border bg-card p-3 text-right hover:shadow-md transition-all min-h-[44px]"
      style={{ borderColor: branchStyle.text, borderWidth: "1px", borderRightWidth: "3px" }}
      dir="rtl"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="h-3.5 w-3.5" style={{ color: branchStyle.text }} />
        <span className="text-[10px] font-bold" style={{ color: branchStyle.text }}>{label}</span>
      </div>
      <p className="font-bold text-sm text-foreground line-clamp-2 leading-tight mb-1">{member.name}</p>
      <span className="text-[10px] text-muted-foreground">{detail}</span>
    </motion.button>
  );
});

function MobileBranchesView() {
  const [selectedBranch, setSelectedBranch] = useState<string>("200");
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [genSheet, setGenSheet] = useState<{ depth: number; members: FamilyMember[] } | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const { currentUser } = useAuth();
  const isLoggedIn = !!currentUser;

  const stats = useBranchStats(selectedBranch);
  const branchStyle = getBranchStyle(selectedBranch);
  const pillar = PILLARS.find((p) => p.id === selectedBranch);

  const handleBranchSwitch = useCallback((id: string) => {
    setSelectedBranch(id);
    setAnimKey((k) => k + 1);
  }, []);

  const maxGenCount = useMemo(() => Math.max(...stats.generations.map((g) => g.members.length), 1), [stats.generations]);
  const maxNameCount = useMemo(() => Math.max(...stats.commonNames.map((n) => n.count), 1), [stats.commonNames]);

  const malePercent = stats.totalCount > 0 ? Math.round((stats.maleCount / stats.totalCount) * 100) : 0;
  const femalePercent = 100 - malePercent;

  return (
    <div className="w-full h-full overflow-y-auto bg-background" dir="rtl">
      {/* ── BRANCH TABS ── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30 p-2">
        <div className="flex gap-1.5">
          {PILLARS.map((p) => {
            const style = getBranchStyle(p.id);
            const isActive = selectedBranch === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleBranchSwitch(p.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 min-h-[44px] text-sm font-bold transition-all duration-200",
                  isActive ? "text-white shadow-md" : "hover:bg-muted/50"
                )}
                style={isActive ? { backgroundColor: style.text, color: "white" } : { color: style.text }}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: isActive ? "white" : style.text }} />
                <span>{p.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        key={animKey}
        className="p-3 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* ── HERO CARD ── */}
        <div
          className="rounded-2xl p-4"
          style={{
            borderRightWidth: "4px", borderRightColor: branchStyle.text,
            background: `linear-gradient(135deg, ${branchStyle.text}12 0%, transparent 60%)`,
          }}
        >
          <h2 className="font-extrabold text-lg text-foreground mb-1">{pillar?.label}</h2>
          <button
            onClick={() => stats.notableMembers.founder && setSelectedMember(stats.notableMembers.founder)}
            className="text-sm text-muted-foreground hover:underline min-h-[44px] flex items-center"
          >
            المؤسس: {pillar?.name}
          </button>
          <motion.div
            className="grid grid-cols-3 gap-2 mt-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              { icon: Users, value: stats.totalCount, label: "فرداً" },
              { icon: Layers, value: stats.generationCount, label: "أجيال" },
              { icon: GitBranchIcon, value: stats.subBranchCount, label: "أفرع" },
            ].map((s, i) => (
              <motion.div key={i} variants={staggerItem} className="flex flex-col items-center gap-1 bg-muted/30 rounded-xl py-2.5 px-1">
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-extrabold text-foreground">{s.value.toLocaleString("ar-SA")}</span>
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── GENDER DISTRIBUTION ── */}
        <div className="rounded-2xl border border-border/40 bg-card p-4">
          <h3 className="font-bold text-sm text-foreground mb-3">توزيع الجنس</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-12 shrink-0">ذكور</span>
              <div className="flex-1 h-5 rounded-full bg-muted/40 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${malePercent}%`, backgroundColor: "hsl(var(--male))", transition: "width 600ms ease" }} />
              </div>
              <span className="text-xs font-bold text-foreground w-10 text-left">{malePercent.toLocaleString("ar-SA")}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-12 shrink-0">إناث</span>
              <div className="flex-1 h-5 rounded-full bg-muted/40 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${femalePercent}%`, backgroundColor: "hsl(var(--female))", transition: "width 600ms ease" }} />
              </div>
              <span className="text-xs font-bold text-foreground w-10 text-left">{femalePercent.toLocaleString("ar-SA")}%</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            {stats.maleCount.toLocaleString("ar-SA")} ذكراً • {stats.femaleCount.toLocaleString("ar-SA")} أنثى
          </p>
        </div>

        {/* ── GENERATION PYRAMID ── */}
        <div className="rounded-2xl border border-border/40 bg-card p-4">
          <h3 className="font-bold text-sm text-foreground mb-3">الأجيال</h3>
          <div className="space-y-2">
            {stats.generations.map((gen, i) => (
              <motion.button
                key={gen.depth}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setGenSheet(gen)}
                className="w-full flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted/40 transition-colors min-h-[36px]"
                dir="rtl"
              >
                <span className="text-[11px] text-muted-foreground w-14 shrink-0 font-medium">الجيل {gen.depth.toLocaleString("ar-SA")}</span>
                <div className="flex-1 h-4 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(gen.members.length / maxGenCount) * 100}%`,
                      backgroundColor: branchStyle.text,
                      opacity: 0.5 + (i / (stats.generations.length || 1)) * 0.4,
                      transition: "width 500ms ease", transitionDelay: `${i * 80}ms`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground w-8 text-left">{gen.members.length.toLocaleString("ar-SA")}</span>
                <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── NOTABLE MEMBERS ── */}
        <div>
          <h3 className="font-bold text-sm text-foreground mb-2 px-1">أبرز الأفراد</h3>
          <motion.div
            className="flex flex-row-reverse gap-3 overflow-x-auto pb-2 pr-1"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <NotableCard label="المؤسس" icon={Crown} member={stats.notableMembers.founder} detail={pillar?.name || ""} branchStyle={branchStyle} index={0} onSelect={setSelectedMember} />
            <NotableCard label="أكبر عمراً" icon={Star} member={stats.notableMembers.oldest} detail={stats.notableMembers.oldest?.birth_year ? formatAge(stats.notableMembers.oldest.birth_year, stats.notableMembers.oldest.death_year) : ""} branchStyle={branchStyle} index={1} onSelect={setSelectedMember} />
            <NotableCard label="أكثر أبناء" icon={Trophy} member={stats.notableMembers.mostChildren} detail={stats.notableMembers.mostChildren ? `${getChildrenOf(stats.notableMembers.mostChildren.id).length.toLocaleString("ar-SA")} أبناء` : ""} branchStyle={branchStyle} index={2} onSelect={setSelectedMember} />
            <NotableCard label="أحدث مولود" icon={Baby} member={stats.notableMembers.youngest} detail={stats.notableMembers.youngest?.birth_year || ""} branchStyle={branchStyle} index={3} onSelect={setSelectedMember} />
          </motion.div>
        </div>

        {/* ── COMMON NAMES ── */}
        <div className="rounded-2xl border border-border/40 bg-card p-4">
          <h3 className="font-bold text-sm text-foreground mb-3">أكثر الأسماء شيوعاً</h3>
          <div className="space-y-2">
            {stats.commonNames.map((n, i) => (
              <div key={n.name} className="flex items-center gap-2" dir="rtl">
                <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">{(i + 1).toLocaleString("ar-SA")}.</span>
                <span className="text-sm font-bold text-foreground w-16 shrink-0 truncate">{n.name}</span>
                <div className="flex-1 h-3.5 rounded-full bg-muted/30 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(n.count / maxNameCount) * 100}%`, backgroundColor: branchStyle.text, opacity: 0.7, transition: "width 500ms ease", transitionDelay: `${i * 60}ms` }} />
                </div>
                <span className="text-xs font-bold text-foreground w-6 text-left">{n.count.toLocaleString("ar-SA")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-16" />
      </motion.div>

      {/* Generation members sheet */}
      <Sheet open={!!genSheet} onOpenChange={(open) => !open && setGenSheet(null)}>
        <SheetContent side="bottom" className="max-h-[70vh] rounded-t-2xl" dir="rtl">
          <SheetHeader className="text-right">
            <SheetTitle>الجيل {genSheet?.depth.toLocaleString("ar-SA")} • {genSheet?.members.length.toLocaleString("ar-SA")} شخصاً</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto mt-2 space-y-0.5 max-h-[50vh]">
            {genSheet?.members.map((m) => (
              <GenMemberRow key={m.id} member={m} isLoggedIn={isLoggedIn} onSelect={(member) => { setGenSheet(null); setTimeout(() => setSelectedMember(member), 200); }} />
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <PersonDetails member={selectedMember} onClose={() => setSelectedMember(null)} />
    </div>
  );
}

// ══════════════════════════════════════════
// DESKTOP: Recursive BranchNode
// ══════════════════════════════════════════
const BranchNode = React.memo(function BranchNode({
  member, depth, pillarId, expandedIds, onToggle, onSelect, isLoggedIn,
}: {
  member: FamilyMember; depth: number; pillarId: string; expandedIds: Set<string>; onToggle: (id: string) => void; onSelect: (m: FamilyMember) => void; isLoggedIn: boolean;
}) {
  const children = useMemo(() => sortByBirth(getChildrenOf(member.id)), [member.id]);
  const isExpanded = expandedIds.has(member.id);
  const hasChildren = children.length > 0;
  const style = getBranchStyle(pillarId);
  const deceased = isDeceased(member);
  const verified = getVerifiedMemberIds().has(member.id);
  const generation = getDepth(member.id);
  const indent = Math.min(depth, 4) * 16;
  const motherName = inferMotherName(member);
  const isFounderMember = FOUNDER_IDS.has(member.id) || isFounder(member);
  const isBH = isBranchHead(member.id);
  const isDoc = member.id === DOCUMENTER_ID;
  const opacity = borderOpacity(depth);
  const isDashed = depth > 4;
  const childLabel = member.gender === "F" ? "لها" : "له";
  const genLabel = `الجيل ${generation.toLocaleString("ar-SA")}`;

  return (
    <div>
      <div
        className={cn("flex items-center gap-2 py-2 px-3 border-b border-border/20 transition-colors hover:bg-muted/50 min-h-[44px]", deceased && "opacity-70")}
        style={{
          paddingRight: `${indent + 12}px`, borderRightWidth: isDashed ? "2px" : "3px",
          borderRightColor: style.text, borderRightStyle: isDashed ? "dashed" : "solid",
          opacity: deceased ? 0.7 : 1, ["--branch-border-opacity" as any]: opacity,
        }}
        dir="rtl"
      >
        {hasChildren ? (
          <button onClick={() => onToggle(member.id)} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-muted shrink-0" aria-label={isExpanded ? "طي" : "توسيع"}>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
          </button>
        ) : (
          <div className="w-[44px] shrink-0" />
        )}
        <button onClick={() => onSelect(member)} className="flex-1 min-w-0 text-right flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: `hsl(var(--${member.gender === "M" ? "male" : "female"}))` }} />
          <span className="font-bold text-sm text-foreground truncate">{member.name}</span>
          {verified && <BadgeCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />}
          {isFounderMember && <HeritageBadge type="founder" />}
          {isBH && <HeritageBadge type="branchHead" />}
          {deceased && <HeritageBadge type="deceased" gender={member.gender as "M" | "F"} />}
          {isDoc && <HeritageBadge type="documenter" />}
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          {motherName && (canSeeMotherName(member.id, isLoggedIn) ? (<span className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground truncate max-w-[60px]">{motherName}</span>) : (<span className="text-[9px] italic text-muted-foreground">{privateLabel('الوالدة')}</span>))}
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{genLabel}</Badge>
          {member.birth_year && (
            canSeeAge(member.id, isLoggedIn) ? (
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatAge(member.birth_year, member.death_year)}</span>
            ) : (
              <span className="text-[10px] italic text-muted-foreground">{privateLabel('العمر')}</span>
            )
          )}
          {hasChildren && (<Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5"><Users className="h-3 w-3" />{childLabel} {children.length.toLocaleString("ar-SA")}</Badge>)}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {children.map((child) => (
              <BranchNode key={child.id} member={child} depth={depth + 1} pillarId={pillarId} expandedIds={expandedIds} onToggle={onToggle} onSelect={onSelect} isLoggedIn={isLoggedIn} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ══════════════════════════════════════════
// MAIN: BranchesView (responsive switch)
// ══════════════════════════════════════════
export function BranchesView() {
  const isMobile = useIsMobile();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const { currentUser } = useAuth();
  const isLoggedIn = !!currentUser;

  const toggleBranch = useCallback((pillarId: string) => {
    setExpandedBranches((prev) => { const next = new Set(prev); if (next.has(pillarId)) next.delete(pillarId); else next.add(pillarId); return next; });
  }, []);

  const toggleNode = useCallback((id: string) => {
    setExpandedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }, []);

  const branchData = useMemo(
    () => PILLARS.map((pillar) => ({ ...pillar, count: getDescendantCount(pillar.id), style: getBranchStyle(pillar.id), children: sortByBirth(getChildrenOf(pillar.id)) })),
    []
  );

  if (isMobile) return <MobileBranchesView />;

  return (
    <div className="w-full h-full overflow-y-auto bg-background" dir="rtl">
      <motion.div
        className="p-3 space-y-2"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {branchData.map((branch) => {
          const isOpen = expandedBranches.has(branch.id);
          return (
            <motion.div key={branch.id} variants={staggerItem} className="rounded-2xl border overflow-hidden bg-card shadow-sm">
              <button
                onClick={() => toggleBranch(branch.id)}
                className="w-full flex items-center gap-3 p-4 min-h-[56px] transition-colors hover:bg-muted/50"
                style={{ borderRightWidth: "4px", borderRightColor: branch.style.text }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: branch.style.bg, color: branch.style.text }}>
                  {branch.name.charAt(0)}
                </div>
                <div className="flex-1 text-right">
                  <h3 className="font-extrabold text-foreground">{branch.label}</h3>
                  <span className="text-xs text-muted-foreground">{branch.count.toLocaleString("ar-SA")} فرداً</span>
                </div>
                <ChevronLeft className={cn("h-5 w-5 text-muted-foreground transition-transform duration-200", isOpen && "-rotate-90")} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                    className="border-t border-border/30"
                  >
                    {branch.children.map((child) => (
                      <BranchNode key={child.id} member={child} depth={0} pillarId={branch.id} expandedIds={expandedIds} onToggle={toggleNode} onSelect={setSelectedMember} isLoggedIn={isLoggedIn} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      <PersonDetails member={selectedMember} onClose={() => setSelectedMember(null)} />
    </div>
  );
}
