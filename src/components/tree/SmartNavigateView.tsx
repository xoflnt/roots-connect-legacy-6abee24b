import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMemberById,
  getChildrenOf,
  getAncestorChain,
  sortByBirth,
  getDescendantCount,
  isDeceased,
  inferMotherName,
} from "@/services/familyService";
import { getBranch, getBranchStyle } from "@/utils/branchUtils";
import { formatAge } from "@/utils/ageCalculator";
import { HeritageBadge } from "@/components/HeritageBadge";
import { PersonDetails } from "@/components/PersonDetails";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, ChevronUp, ChevronDown, ArrowRight, Search, User } from "lucide-react";
import { isVerifiedMember } from "@/services/dataService";
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

// ── Son Card ──
const SonCard = React.memo(function SonCard({
  member,
  onTap,
}: {
  member: FamilyMember;
  onTap: (id: string) => void;
}) {
  const children = getChildrenOf(member.id);
  const branch = getBranch(member.id);
  const style = branch ? getBranchStyle(branch.pillarId) : null;
  const deceased = isDeceased(member);
  const verified = isVerifiedMember(member.id);

  return (
    <button
      onClick={() => onTap(member.id)}
      className={cn(
        "flex-shrink-0 w-[140px] rounded-xl border bg-card p-3 text-right transition-all hover:shadow-md min-h-[44px]",
        deceased && "opacity-70"
      )}
      style={style ? { borderColor: style.text + "33" } : undefined}
      dir="rtl"
    >
      <div className="flex items-center gap-1 mb-1">
        <span className="font-bold text-sm text-foreground truncate">{member.name}</span>
        {verified && <span className="text-green-500 text-xs">✅</span>}
      </div>
      {member.birth_year && (
        <div className="text-xs text-muted-foreground">{formatAge(member.birth_year, member.death_year)}</div>
      )}
      {children.length > 0 && (
        <div className="text-xs text-muted-foreground mt-1">
          له {children.length.toLocaleString("ar-SA")} أبناء
        </div>
      )}
      {deceased && <HeritageBadge type="deceased" size="sm" />}
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

  return (
    <button
      onClick={() => onTap(member.id)}
      className="w-full rounded-xl border bg-card/80 p-3 text-right transition-all hover:shadow-md min-h-[44px] flex items-center gap-3"
      style={style ? { borderColor: style.text + "33" } : undefined}
      dir="rtl"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <ChevronUp className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-foreground truncate">{member.name}</div>
        {branch && (
          <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ backgroundColor: style?.bg, color: style?.text }}>
            {branch.label}
          </span>
        )}
      </div>
      <span className="text-xs text-muted-foreground">الأب ↑</span>
    </button>
  );
});

// ── Main Component ──
export function SmartNavigateView() {
  const { currentUser } = useAuth();
  const startId = currentUser?.memberId || "100";

  const [currentId, setCurrentId] = useState<string>(startId);
  const [history, setHistory] = useState<string[]>([]);
  const [slideDir, setSlideDir] = useState<SlideDirection>("none");
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Touch swipe
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

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

  // Touch handlers for swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
      // RTL: swipe right = previous sibling, swipe left = next sibling
      if (dx > 0) goToSibling(-1);
      else goToSibling(1);
    },
    [goToSibling]
  );

  const handleSearchSelect = useCallback(
    (id: string) => {
      navigateTo(id, "up");
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

  const verified = isVerifiedMember(member.id);
  const deceased = isDeceased(member);
  const motherName = inferMotherName(member);

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
        {ancestorChain.map((anc, i) => (
          <React.Fragment key={anc.id}>
            {i > 0 && <ChevronLeft className="h-3 w-3 text-muted-foreground shrink-0" />}
            <button
              onClick={() => anc.id !== currentId && navigateTo(anc.id, "down")}
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
        ))}
      </div>

      {/* Main content with slide animation */}
      <div
        ref={contentRef}
        key={currentId}
        className={cn("flex-1 overflow-y-auto px-3 py-4 space-y-4", directionClass[slideDir])}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ willChange: "transform, opacity" }}
      >
        {/* Father card */}
        {father && <FatherCard member={father} onTap={(id) => navigateTo(id, "down")} />}

        {/* Center card */}
        <div
          className="rounded-2xl border-2 bg-card p-4 shadow-lg relative"
          style={branchStyle ? { borderColor: branchStyle.text + "55" } : undefined}
        >
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
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg shrink-0"
                style={branchStyle ? { backgroundColor: branchStyle.bg, color: branchStyle.text } : undefined}
              >
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-extrabold text-foreground">{member.name}</h2>
                  {verified && <span className="text-green-500">✅</span>}
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
              {motherName && <span>والدته: {motherName}</span>}
              {member.spouses && <span>الزوجات: {member.spouses}</span>}
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {deceased && <HeritageBadge type="deceased" size="sm" />}
              {!member.father_id && <HeritageBadge type="founder" size="sm" />}
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
            الأبناء {children.length > 0 && (
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
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {children.map((child) => (
                <SonCard key={child.id} member={child} onTap={(id) => navigateTo(id, "up")} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating search button */}
      {showSearch ? (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setShowSearch(false)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-muted text-foreground"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <span className="font-bold text-foreground">البحث في الشجرة</span>
          </div>
          <SearchBar onSelect={handleSearchSelect} />
        </div>
      ) : (
        <button
          onClick={() => setShowSearch(true)}
          className="absolute bottom-4 left-4 z-30 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
          aria-label="بحث"
        >
          <Search className="h-5 w-5" />
        </button>
      )}

      {/* PersonDetails drawer */}
      <PersonDetails member={selectedMember} onClose={() => setSelectedMember(null)} />
    </div>
  );
}
