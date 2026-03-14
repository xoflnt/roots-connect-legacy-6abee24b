import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMemberById,
  getChildrenOf,
  getAncestorChain,
  sortByBirth,
  getDescendantCount,
  isDeceased,
  isFounder,
  isBranchHead,
  inferMotherName,
} from "@/services/familyService";
import { getBranch, getBranchStyle, DOCUMENTER_ID } from "@/utils/branchUtils";
import { formatAge } from "@/utils/ageCalculator";
import { HeritageBadge } from "@/components/HeritageBadge";
import { PersonDetails } from "@/components/PersonDetails";
import { SearchBar } from "@/components/SearchBar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Search,
  User,
  BadgeCheck,
  Heart,
} from "lucide-react";
import { getVerifiedMemberIds } from "@/services/dataService";
import { cn } from "@/lib/utils";
import type { FamilyMember } from "@/data/familyData";
import { staggerContainer, staggerItem, gentleSpring, springConfig } from "@/lib/animations";

const PILLAR_IDS = new Set(["200", "300", "400"]);
const FOUNDER_IDS = new Set(["100", "200", "300", "400"]);

function genderColor(gender: string) {
  return gender === "M"
    ? { bg: "hsl(var(--male) / 0.15)", text: "hsl(var(--male))" }
    : { bg: "hsl(var(--female) / 0.15)", text: "hsl(var(--female))" };
}

// ── Son Card ──
const SonCard = React.memo(function SonCard({
  member,
  onTap,
  index,
}: {
  member: FamilyMember;
  onTap: (id: string) => void;
  index: number;
}) {
  const children = getChildrenOf(member.id);
  const branch = getBranch(member.id);
  const style = branch ? getBranchStyle(branch.pillarId) : null;
  const deceased = isDeceased(member);
  const verified = getVerifiedMemberIds().has(member.id);
  const gc = genderColor(member.gender);
  const childLabel = member.gender === "F" ? "لها" : "له";

  return (
    <motion.button
      variants={staggerItem}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onTap(member.id)}
      className={cn(
        "flex-shrink-0 w-[160px] rounded-xl border bg-card p-3 text-right transition-all hover:shadow-md min-h-[44px] relative",
        deceased && "opacity-70"
      )}
      style={{
        borderColor: `hsl(var(--${member.gender === "M" ? "male" : "female"}) / 0.3)`,
      }}
      dir="rtl"
    >
      {/* Branch dot */}
      {style && (
        <div
          className="absolute top-2 left-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: style.text }}
        />
      )}

      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: gc.bg, color: gc.text }}
        >
          <User className="h-3.5 w-3.5" />
        </div>
        <span className="font-bold text-sm text-foreground truncate">{member.name}</span>
        {verified && <BadgeCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />}
      </div>

      {member.birth_year && (
        <div className="text-xs text-muted-foreground">{formatAge(member.birth_year, member.death_year)}</div>
      )}
      {children.length > 0 && (
        <div className="text-xs text-muted-foreground mt-1">
          {childLabel} {children.length.toLocaleString("ar-SA")} أبناء
        </div>
      )}
      {deceased && <HeritageBadge type="deceased" gender={member.gender as "M" | "F"} />}
    </motion.button>
  );
});

// ── Father Card ──
const FatherCard = React.memo(function FatherCard({
  member,
  onTap,
}: {
  member: FamilyMember;
  onTap: (id: string) => void;
}) {
  const branch = getBranch(member.id);
  const style = branch ? getBranchStyle(branch.pillarId) : null;
  const deceased = isDeceased(member);
  const gc = genderColor(member.gender);

  return (
    <motion.button
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={gentleSpring}
      onClick={() => onTap(member.id)}
      className="w-full rounded-xl border bg-card/80 backdrop-blur-sm p-3 text-right transition-all hover:shadow-md min-h-[44px] flex items-center gap-3 relative overflow-hidden"
      style={style ? { borderColor: style.text + "33" } : undefined}
      dir="rtl"
    >
      {/* Branch stripe */}
      {style && (
        <div
          className="absolute right-0 top-2 bottom-2 w-1 rounded-full"
          style={{ backgroundColor: style.text }}
        />
      )}

      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: gc.bg, color: gc.text }}
      >
        <ChevronUp className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-foreground truncate">{member.name}</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {branch && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-md"
              style={{ backgroundColor: style?.bg, color: style?.text }}
            >
              {branch.label}
            </span>
          )}
          {member.birth_year && (
            <span className="text-[10px] text-muted-foreground">
              {formatAge(member.birth_year, member.death_year)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {deceased && <HeritageBadge type="deceased" gender={member.gender as "M" | "F"} />}
        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
          <ChevronUp className="h-3 w-3" />
          الأب
        </span>
      </div>
    </motion.button>
  );
});

// ── Breadcrumb with truncation ──
function TruncatedBreadcrumb({
  ancestors,
  currentId,
  onNavigate,
}: {
  ancestors: FamilyMember[];
  currentId: string;
  onNavigate: (id: string) => void;
}) {
  const isNarrow = typeof window !== "undefined" && window.innerWidth < 380;

  const items = useMemo(() => {
    if (isNarrow) {
      return ancestors.filter((a) => a.id === currentId || a.id === ancestors[ancestors.length - 2]?.id);
    }
    if (ancestors.length <= 4) return ancestors;
    const root = ancestors[0];
    const tail = ancestors.slice(-3);
    return [root, null as any, ...tail];
  }, [ancestors, currentId, isNarrow]);

  return (
    <>
      {items.map((anc, i) => {
        if (!anc) {
          return (
            <React.Fragment key="ellipsis">
              <ChevronLeft className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="shrink-0 px-1.5 py-1 text-xs text-muted-foreground">…</span>
            </React.Fragment>
          );
        }
        return (
          <React.Fragment key={anc.id}>
            {i > 0 && items[i - 1] !== null && (
              <ChevronLeft className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
            <motion.button
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
              onClick={() => anc.id !== currentId && onNavigate(anc.id)}
              className={cn(
                "shrink-0 px-2 py-1 rounded-md text-xs whitespace-nowrap min-h-[32px] transition-colors",
                anc.id === currentId
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {anc.name}
            </motion.button>
          </React.Fragment>
        );
      })}
    </>
  );
}

// ── Main Component ──
export function SmartNavigateView() {
  const { currentUser } = useAuth();
  const startId = currentUser?.memberId || "100";

  const [currentId, setCurrentId] = useState<string>(startId);
  const [history, setHistory] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const controls = useAnimation();
  const sonsScrollRef = useRef<HTMLDivElement>(null);

  const member = getMemberById(currentId);
  const father = member?.father_id ? getMemberById(member.father_id) : null;
  const children = useMemo(() => (member ? sortByBirth(getChildrenOf(currentId)) : []), [currentId]);
  const siblings = useMemo(() => {
    if (!member?.father_id) return [];
    return sortByBirth(getChildrenOf(member.father_id));
  }, [member?.father_id, currentId]);
  const siblingIndex = siblings.findIndex((s) => s.id === currentId);
  const ancestorChain = useMemo(() => (member ? getAncestorChain(currentId).reverse() : []), [currentId]);
  const branch = member ? getBranch(member.id) : null;
  const branchStyle = branch ? getBranchStyle(branch.pillarId) : null;

  const navigateTo = useCallback(
    async (id: string, direction: "up" | "down" | "left" | "right" | "none") => {
      // Animate out
      const outX = direction === "left" ? -30 : direction === "right" ? 30 : 0;
      const outY = direction === "up" ? -20 : direction === "down" ? 20 : 0;
      await controls.start({
        opacity: 0,
        x: outX,
        y: outY,
        transition: { duration: 0.15 },
      });
      // Update state
      setHistory((prev) => [...prev, currentId]);
      setCurrentId(id);
      // Animate in
      controls.start({
        opacity: 1,
        x: 0,
        y: 0,
        transition: gentleSpring,
      });
    },
    [currentId, controls]
  );

  const goBack = useCallback(async () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    await controls.start({ opacity: 0, transition: { duration: 0.1 } });
    setHistory((h) => h.slice(0, -1));
    setCurrentId(prev);
    controls.start({ opacity: 1, x: 0, y: 0, transition: gentleSpring });
  }, [history, controls]);

  const goToSibling = useCallback(
    (delta: number) => {
      const newIndex = siblingIndex + delta;
      if (newIndex < 0 || newIndex >= siblings.length) return;
      navigateTo(siblings[newIndex].id, delta > 0 ? "left" : "right");
    },
    [siblingIndex, siblings, navigateTo]
  );

  const handleSearchSelect = useCallback(
    (id: string) => {
      navigateTo(id, "none");
      setShowSearch(false);
    },
    [navigateTo]
  );

  if (!member) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground" dir="rtl">
        لم يتم العثور على الشخص
      </div>
    );
  }

  const verified = getVerifiedMemberIds().has(member.id);
  const deceased = isDeceased(member);
  const motherName = inferMotherName(member);
  const gc = genderColor(member.gender);
  const isPillar = PILLAR_IDS.has(member.id);
  const isFounderMember = FOUNDER_IDS.has(member.id) || isFounder(member);
  const isBH = isBranchHead(member.id);
  const isDoc = member.id === DOCUMENTER_ID;
  const spouseList = member.spouses ? member.spouses.split(/[,،]/).map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-background" dir="rtl">
      {/* Breadcrumb */}
      <div className="shrink-0 flex items-center gap-1 px-3 py-2 overflow-x-auto border-b border-border/30 bg-card/50 backdrop-blur-sm scrollbar-hide">
        {history.length > 0 && (
          <button
            onClick={goBack}
            className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
            aria-label="رجوع"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
        <TruncatedBreadcrumb
          ancestors={ancestorChain}
          currentId={currentId}
          onNavigate={(id) => navigateTo(id, "down")}
        />
      </div>

      {/* Main content with Framer Motion animation */}
      <motion.div
        key={currentId}
        animate={controls}
        initial={{ opacity: 1, x: 0, y: 0 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_e, info) => {
          if (sonsScrollRef.current?.contains(document.activeElement)) return;
          if (info.offset.x < -50) goToSibling(1);
          else if (info.offset.x > 50) goToSibling(-1);
        }}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-4"
        style={{ willChange: "transform, opacity" }}
      >
        {/* Father card */}
        {father && <FatherCard member={father} onTap={(id) => navigateTo(id, "down")} />}

        {/* Center card */}
        <div
          className="rounded-2xl border-2 bg-card/95 backdrop-blur-sm p-4 shadow-xl relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-0.5"
          style={{
            borderColor: `hsl(var(--${member.gender === "M" ? "male" : "female"}) / 0.35)`,
          }}
        >
          {/* Branch vertical stripe */}
          {branchStyle && (
            <div
              className="absolute right-0 top-3 bottom-3 w-1.5 rounded-full"
              style={{ backgroundColor: branchStyle.text }}
            />
          )}

          {/* Pillar gold line */}
          {isPillar && (
            <div className="absolute top-0 left-4 right-4 h-0.5 bg-accent/60 rounded-full" />
          )}

          {/* Sibling arrows */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
            {siblingIndex < siblings.length - 1 && (
              <button
                onClick={() => goToSibling(1)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-muted/80 hover:bg-muted text-foreground"
                aria-label="الأخ التالي"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
            {siblingIndex > 0 && (
              <button
                onClick={() => goToSibling(-1)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-muted/80 hover:bg-muted text-foreground"
                aria-label="الأخ السابق"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Card content */}
          <button
            onClick={() => setSelectedMember(member)}
            className="w-full text-right"
          >
            <div className="flex items-start gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: gc.bg, color: gc.text }}
              >
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-extrabold text-foreground">{member.name}</h2>
                  {verified && <BadgeCheck className="h-4 w-4 text-green-500" />}
                </div>
                {branch && (
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded-md mt-1"
                    style={{ backgroundColor: branchStyle?.bg, color: branchStyle?.text }}
                  >
                    {branch.label}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {member.birth_year && <span>{formatAge(member.birth_year, member.death_year)}</span>}
              {motherName && branchStyle && (
                <span
                  className="px-1.5 py-0.5 rounded-md"
                  style={{
                    backgroundColor: branchStyle.text + "26",
                    color: branchStyle.text,
                  }}
                >
                  والدته: {motherName}
                </span>
              )}
              {!motherName && motherName === null && member.birth_year === null && null}
            </div>

            {/* Spouses */}
            {spouseList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5 text-xs text-muted-foreground">
                {spouseList.map((sp, i) => (
                  <span key={i} className="flex items-center gap-0.5">
                    <Heart className="h-3 w-3 text-pink-400" />
                    {sp}
                  </span>
                ))}
              </div>
            )}

            {/* Heritage badges */}
            <div className="flex flex-wrap gap-1 mt-2">
              {isFounderMember && <HeritageBadge type="founder" />}
              {isBH && <HeritageBadge type="branchHead" />}
              {deceased && <HeritageBadge type="deceased" gender={member.gender as "M" | "F"} />}
              {isDoc && <HeritageBadge type="documenter" />}
            </div>
          </button>

          {/* Sibling indicator */}
          {siblings.length > 1 && (
            <div className="flex items-center justify-center gap-1 mt-3 pt-2 border-t border-border/30">
              {siblings.map((s, i) => (
                <div
                  key={s.id}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === siblingIndex ? "bg-primary scale-125" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Arrow down indicator */}
        {children.length > 0 && (
          <div className="flex justify-center">
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </div>
        )}

        {/* Sons row */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-2">
            الأبناء{" "}
            {children.length > 0 && (
              <Badge variant="secondary" className="mr-1 text-xs">
                {children.length.toLocaleString("ar-SA")}
              </Badge>
            )}
          </h3>
          {children.length === 0 ? (
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-4 text-center">
              لا يوجد أبناء مسجلون
            </div>
          ) : (
            <motion.div
              ref={sonsScrollRef}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide overscroll-x-contain"
              style={{ touchAction: 'pan-x', overscrollBehavior: 'contain' }}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {children.map((child, i) => (
                <SonCard key={child.id} member={child} onTap={(id) => navigateTo(id, "up")} index={i} />
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Floating search button — opens bottom Sheet */}
      <button
        onClick={() => setShowSearch(true)}
        className="absolute bottom-4 left-4 z-30 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
        aria-label="بحث"
      >
        <Search className="h-5 w-5" />
      </button>

      <Sheet open={showSearch} onOpenChange={setShowSearch}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl p-4" dir="rtl">
          <SheetTitle className="text-right mb-4">ابحث في الشجرة</SheetTitle>
          <SearchBar onSelect={handleSearchSelect} />
        </SheetContent>
      </Sheet>

      {/* PersonDetails drawer */}
      <PersonDetails member={selectedMember} onClose={() => setSelectedMember(null)} />
    </div>
  );
}
