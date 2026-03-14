import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
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

type SlideDirection = "up" | "down" | "left" | "right" | "none";

const directionClass: Record<SlideDirection, string> = {
  up: "animate-slide-up",
  down: "animate-slide-down",
  left: "animate-slide-left",
  right: "animate-slide-right",
  none: "",
};

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
    <button
      onClick={() => onTap(member.id)}
      className={cn(
        "flex-shrink-0 w-[160px] rounded-xl border bg-card p-3 text-right transition-all hover:shadow-md hover:scale-[1.02] min-h-[44px] relative animate-fade-in",
        deceased && "opacity-70"
      )}
      style={{
        borderColor: `hsl(var(--${member.gender === "M" ? "male" : "female"}) / 0.3)`,
        animationDelay: `${Math.min(index * 0.05, 0.3)}s`,
        animationFillMode: "both",
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
    </button>
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
    <button
      onClick={() => onTap(member.id)}
      className="w-full rounded-xl border bg-card/80 backdrop-blur-sm p-3 text-right transition-all hover:shadow-md min-h-[44px] flex items-center gap-3 relative overflow-hidden animate-fade-in"
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
    </button>
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
      // Show only current + father
      return ancestors.filter((a) => a.id === currentId || a.id === ancestors[ancestors.length - 2]?.id);
    }
    if (ancestors.length <= 4) return ancestors;
    // root + ... + last 2 before current + current
    const root = ancestors[0];
    const tail = ancestors.slice(-3); // last 2 + current
    return [root, null as any, ...tail]; // null = ellipsis
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
            <button
              onClick={() => anc.id !== currentId && onNavigate(anc.id)}
              className={cn(
                "shrink-0 px-2 py-1 rounded-md text-xs whitespace-nowrap min-h-[32px] transition-colors",
                anc.id === currentId
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {anc.name}
            </button>
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
  const [slideDir, setSlideDir] = useState<SlideDirection>("none");
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Swipe state
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const isSwiping = useRef(false);
  const swipeLocked = useRef<"horizontal" | "vertical" | null>(null);
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
    (id: string, direction: SlideDirection) => {
      setHistory((prev) => [...prev, currentId]);
      setSlideDir(direction);
      setCurrentId(id);
    },
    [currentId]
  );

  const goBack = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setSlideDir("none");
    setCurrentId(prev);
  }, [history]);

  const goToSibling = useCallback(
    (delta: number) => {
      const newIndex = siblingIndex + delta;
      if (newIndex < 0 || newIndex >= siblings.length) return;
      navigateTo(siblings[newIndex].id, delta > 0 ? "left" : "right");
    },
    [siblingIndex, siblings, navigateTo]
  );

  // Reset animation class after it plays
  useEffect(() => {
    if (slideDir === "none") return;
    const timer = setTimeout(() => setSlideDir("none"), 350);
    return () => clearTimeout(timer);
  }, [currentId, slideDir]);

  // Touch handlers with live feedback
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (sonsScrollRef.current?.contains(e.target as Node)) {
      swipeLocked.current = 'vertical';
      isSwiping.current = false;
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
    swipeLocked.current = null;
    setSwipeOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Lock direction after 10px movement
    if (!swipeLocked.current && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      if (Math.abs(dy) > Math.abs(dx) * 1.5) {
        swipeLocked.current = "vertical";
        return;
      }
      swipeLocked.current = "horizontal";
    }

    if (swipeLocked.current === "vertical") return;
    if (swipeLocked.current === "horizontal") {
      isSwiping.current = true;
      // Dampen the offset slightly for a natural feel
      setSwipeOffset(dx * 0.6);
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isSwiping.current || swipeLocked.current !== "horizontal") {
        setSwipeOffset(0);
        return;
      }
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      // Snap back first
      setSwipeOffset(0);
      isSwiping.current = false;

      if (Math.abs(dx) < 30) return;
      // RTL: swipe right = previous, swipe left = next
      if (dx > 0) goToSibling(-1);
      else goToSibling(1);
    },
    [goToSibling]
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

      {/* Main content with slide animation */}
      <div
        key={currentId}
        className={cn(
          "flex-1 overflow-y-auto px-3 py-4 space-y-4",
          !isSwiping.current && directionClass[slideDir]
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          willChange: "transform, opacity",
          transform: swipeOffset !== 0 ? `translateX(${swipeOffset}px)` : undefined,
          transition: swipeOffset !== 0 ? "none" : "transform 0.3s ease",
        }}
      >
        {/* Father card */}
        {father && <FatherCard member={father} onTap={(id) => navigateTo(id, "down")} />}

        {/* Center card */}
        <div
          className="rounded-2xl border-2 bg-card/95 backdrop-blur-sm p-4 shadow-xl relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-0.5 animate-fade-in"
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
            <div ref={sonsScrollRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide overscroll-x-contain" style={{ touchAction: 'pan-x', overscrollBehavior: 'contain' }}>
              {children.map((child, i) => (
                <SonCard key={child.id} member={child} onTap={(id) => navigateTo(id, "up")} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

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
