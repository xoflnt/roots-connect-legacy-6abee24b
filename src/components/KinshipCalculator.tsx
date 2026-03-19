import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, Search, User, Users, TreePine, FileText, Share2, GitBranch, X } from "lucide-react";
import { applyTatweel } from "@/utils/tatweelUtils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import type { FamilyMember } from "@/data/familyData";
import {
  getAllMembers,
  searchMembers,
  findKinship,
  kinshipToArabic,
  kinshipDirectional,
  inferMotherName,
  getMemberById,
  getDepth,
} from "@/services/familyService";
import { getLineageLabel, getMemberSubtitle } from "@/utils/memberLabel";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { getBranch, getBranchStyle } from "@/utils/branchUtils";
import { HeritageBadge } from "./HeritageBadge";
import { PersonDetails } from "./PersonDetails";
import { KinshipTreeView } from "./kinship/KinshipTreeView";
import { KinshipDocumentView } from "./kinship/KinshipDocumentView";
import { KinshipCardView } from "./kinship/KinshipCardView";
import { scaleIn, gentleSpring } from "@/lib/animations";

interface KinshipCalculatorProps {
  initialMemberId?: string;
}

/* ── Visual viewport height for mobile keyboard ── */
function useVisualViewportHeight(): number | null {
  const [h, setH] = useState<number | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const update = () => setH(window.visualViewport!.height);
    update();
    window.visualViewport.addEventListener("resize", update);
    return () => window.visualViewport?.removeEventListener("resize", update);
  }, []);
  return h;
}

/* ── Search result row ── */
function PersonResultRow({ m, onSelect }: { m: FamilyMember; onSelect: (m: FamilyMember) => void }) {
  const subtitle = getMemberSubtitle(m);
  return (
    <button
      className="w-full text-right px-4 py-3 text-sm text-foreground hover:bg-primary/10 active:bg-primary/15 transition-colors border-b border-border/20 last:border-b-0 min-h-[48px]"
      onClick={() => onSelect(m)}
      onMouseDown={(e) => e.preventDefault()}
    >
      <span className="block font-medium leading-snug truncate">{getLineageLabel(m)}</span>
      {subtitle && <span className="block text-xs text-muted-foreground truncate">{subtitle}</span>}
    </button>
  );
}

/* ── Selected person display ── */
function SelectedPersonDisplay({ member, onClear }: { member: FamilyMember; onClear: () => void }) {
  const isMale = member.gender === "M";
  const branch = getBranch(member.id);
  const branchStyle = branch ? getBranchStyle(branch.pillarId) : null;
  const depth = getDepth(member.id);
  const genderBg = isMale ? "bg-[hsl(var(--male))]/10" : "bg-[hsl(var(--female))]/10";
  const genderIconBg = isMale ? "bg-[hsl(var(--male))]/15" : "bg-[hsl(var(--female))]/15";
  const genderIconText = isMale ? "text-[hsl(var(--male))]" : "text-[hsl(var(--female))]";

  return (
    <div className={`rounded-xl p-3 ${genderBg} space-y-2`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${genderIconBg}`}>
          <User className={`h-5 w-5 ${genderIconText}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-foreground truncate">{member.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {branch && branchStyle && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: branchStyle.bg, color: branchStyle.text }}
              >
                {branch.label}
              </span>
            )}
            {depth > 0 && <HeritageBadge type="generation" generationNum={depth} />}
          </div>
        </div>
      </div>
      <button
        onClick={onClear}
        className="text-xs text-primary hover:underline font-medium"
      >
        تغيير
      </button>
    </div>
  );
}

/* ── PersonPicker ── */
function PersonPicker({
  label,
  selected,
  onSelect,
  accentClass,
}: {
  label: string;
  selected: FamilyMember | null;
  onSelect: (m: FamilyMember | null) => void;
  accentClass: string;
}) {
  const [query, setQuery] = useState("");
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const vpHeight = useVisualViewportHeight();

  const filtered = useMemo(() => searchMembers(query, 12), [query]);

  const handleSelect = useCallback((m: FamilyMember) => {
    onSelect(m);
    setQuery("");
    setDesktopOpen(false);
    setDialogOpen(false);
  }, [onSelect]);

  const handleClear = useCallback(() => {
    onSelect(null);
    setQuery("");
  }, [onSelect]);

  return (
    <div className="flex-1 min-w-0">
      <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-4 shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${accentClass}`}>
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-muted-foreground">{label}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={scaleIn.initial}
              animate={scaleIn.animate}
              exit={scaleIn.exit}
              transition={scaleIn.transition}
            >
              <SelectedPersonDisplay member={selected} onClear={handleClear} />
            </motion.div>
          ) : isMobile ? (
            <motion.div key="mobile-search" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button
                onClick={() => setDialogOpen(true)}
                className="w-full flex items-center gap-2 h-11 px-3 rounded-xl border border-dashed border-border/50 bg-background text-sm text-muted-foreground"
              >
                <Search className="h-4 w-4 shrink-0" />
                <span>ابحث عن شخص...</span>
              </button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent
                  className="p-0 gap-0 fixed bottom-0 top-auto translate-y-0 max-w-full w-full rounded-t-2xl rounded-b-none border-0 border-t border-border/40 shadow-2xl [&>button]:hidden data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom"
                  style={{ maxHeight: vpHeight ? vpHeight * 0.7 : '70dvh' }}
                >
                  <DialogTitle className="sr-only">{label}</DialogTitle>
                  <div className="flex flex-col h-full" dir="rtl">
                    <div className="flex justify-center py-2">
                      <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                    </div>
                    <div className="shrink-0 flex items-center gap-2 px-4 pb-3">
                      <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          autoFocus
                          placeholder="ابحث باسم الشخص..."
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="pr-10 h-12 rounded-xl text-sm border-border/50"
                        />
                      </div>
                      <button
                        onClick={() => setDialogOpen(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground shrink-0"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto overscroll-contain border-t border-border/20">
                      {filtered.length > 0 ? (
                        filtered.map((m) => (
                          <PersonResultRow key={m.id} m={m} onSelect={handleSelect} />
                        ))
                      ) : query.trim() ? (
                        <p className="text-center text-muted-foreground text-sm py-8">لا توجد نتائج</p>
                      ) : (
                        <p className="text-center text-muted-foreground text-sm py-8">اكتب اسم الشخص للبحث</p>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          ) : (
            <motion.div key="desktop-search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="ابحث عن شخص..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setDesktopOpen(true); }}
                onFocus={() => query.trim() && setDesktopOpen(true)}
                onBlur={() => setTimeout(() => setDesktopOpen(false), 200)}
                className="pr-10 h-11 rounded-xl text-sm border-dashed border-border/50"
              />
              {desktopOpen && filtered.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                  {filtered.map((m) => (
                    <PersonResultRow key={m.id} m={m} onSelect={handleSelect} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── KinshipCalculator ── */
export function KinshipCalculator({ initialMemberId }: KinshipCalculatorProps) {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [detailMember, setDetailMember] = useState<FamilyMember | null>(null);

  const resolveInitialPerson = (): FamilyMember | null => {
    if (initialMemberId) return getAllMembers().find((m) => m.id === initialMemberId) || null;
    if (currentUser?.memberId) return getAllMembers().find((m) => m.id === currentUser.memberId) || null;
    return null;
  };

  // Deep linking: read p1/p2 from URL
  const deepP1 = searchParams.get("p1");
  const deepP2 = searchParams.get("p2");

  const [person1, setPerson1] = useState<FamilyMember | null>(() => {
    if (deepP1) {
      const m = getMemberById(deepP1);
      if (m) return m;
    }
    return resolveInitialPerson();
  });
  const [person2, setPerson2] = useState<FamilyMember | null>(() => {
    if (deepP2) {
      const m = getMemberById(deepP2);
      if (m) return m ?? null;
    }
    return null;
  });
  const [showResult, setShowResult] = useState(() => !!(deepP1 && deepP2 && getMemberById(deepP1) && getMemberById(deepP2)));

  // Update URL when result is shown
  useEffect(() => {
    if (showResult && person1 && person2) {
      const url = new URL(window.location.href);
      url.searchParams.set("view", "kinship");
      url.searchParams.set("p1", person1.id);
      url.searchParams.set("p2", person2.id);
      window.history.replaceState(null, "", url.toString());
    }
  }, [showResult, person1, person2]);

  const result = useMemo(() => {
    if (!person1 || !person2) return null;
    return findKinship(person1.id, person2.id);
  }, [person1, person2]);

  const relationText = result ? kinshipToArabic(result.dist1, result.dist2, person1!, person2!) : null;
  const directional = result ? kinshipDirectional(result.dist1, result.dist2, person1!, person2!) : null;
  const motherName1 = person1 ? inferMotherName(person1) : null;
  const motherName2 = person2 ? inferMotherName(person2) : null;
  const name1Short = person1?.name.split(" ")[0] ?? "";
  const name2Short = person2?.name.split(" ")[0] ?? "";

  const handleSwap = () => {
    setPerson1(person2);
    setPerson2(person1);
    setShowResult(false);
  };

  const handleReset = () => {
    setPerson1(resolveInitialPerson());
    setPerson2(null);
    setShowResult(false);
    // Clean URL
    const url = new URL(window.location.href);
    url.searchParams.delete("p1");
    url.searchParams.delete("p2");
    window.history.replaceState(null, "", url.toString());
  };

  const bothSelected = !!person1 && !!person2;

  return (
    <div className="py-6 md:py-10 px-4 md:px-6 overflow-auto" dir="rtl">
      <div className="max-w-lg mx-auto space-y-5">
        {/* ── Page Header ── */}
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary">
            <GitBranch className="h-4 w-4" />
            <span className="font-bold text-sm">{applyTatweel("حاسبة القرابة")}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            اكتشف صلة القرابة بين أي فردين في العائلة
          </p>
        </motion.div>

        {/* ── Pickers ── */}
        <div className="space-y-3">
          <PersonPicker
            label="الشخص الأول"
            selected={person1}
            onSelect={(m) => { setPerson1(m); setShowResult(false); }}
            accentClass="bg-primary/15 text-primary"
          />

          {/* Swap button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              disabled={!person1 && !person2}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span>تبديل</span>
            </button>
          </div>

          <PersonPicker
            label="الشخص الثاني"
            selected={person2}
            onSelect={(m) => { setPerson2(m); setShowResult(false); }}
            accentClass="bg-accent/15 text-accent-foreground"
          />
        </div>

        {/* ── Calculate button ── */}
        {!showResult && (
          <div className="sticky bottom-4 z-10">
            <Button
              onClick={() => bothSelected && setShowResult(true)}
              disabled={!bothSelected}
              className={`w-full min-h-[52px] rounded-2xl text-base font-bold transition-all duration-300 ${
                bothSelected
                  ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              size="lg"
            >
              <GitBranch className="h-5 w-5 ml-2" />
              احسب القرابة
            </Button>
          </div>
        )}

        {/* ── Result ── */}
        {showResult && result && relationText && (
          <motion.div
            className="rounded-2xl border border-primary/20 bg-card shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={gentleSpring}
          >
            {/* Gold top line */}
            <div className="h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

            {/* Result header */}
            <div className="p-5 text-center border-b border-border/30 space-y-2">
              <motion.p
                className="text-xl font-extrabold text-foreground"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...gentleSpring, delay: 0.1 }}
              >
                {relationText}
              </motion.p>
              <p className="text-sm text-muted-foreground">
                <motion.span
                  className="text-primary font-bold"
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ ...gentleSpring, delay: 0.15 }}
                >
                  {name1Short}
                </motion.span>
                {" "}←→{" "}
                <motion.span
                  className="text-accent-foreground font-bold"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ ...gentleSpring, delay: 0.15 }}
                >
                  {name2Short}
                </motion.span>
              </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="card" className="w-full">
              <div className="px-4 pt-4">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1 rounded-2xl bg-muted">
                  <TabsTrigger
                    value="tree"
                    className="text-xs py-2 gap-1 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=active]:font-bold"
                  >
                    <TreePine className="h-3.5 w-3.5" />
                    المخطط
                  </TabsTrigger>
                  <TabsTrigger
                    value="document"
                    className="text-xs py-2 gap-1 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=active]:font-bold"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    الوثيقة
                  </TabsTrigger>
                  <TabsTrigger
                    value="card"
                    className="text-xs py-2 gap-1 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=active]:font-bold"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    البطاقة
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="tree" className="px-4 pb-2 mt-0">
                <KinshipTreeView
                  result={result}
                  person1={person1!}
                  person2={person2!}
                  motherName1={motherName1}
                  motherName2={motherName2}
                  onPersonTap={setDetailMember}
                />
              </TabsContent>
              <TabsContent value="document" className="px-4 pb-2 mt-0">
                <KinshipDocumentView
                  result={result}
                  person1={person1!}
                  person2={person2!}
                  motherName1={motherName1}
                  motherName2={motherName2}
                  onPersonTap={setDetailMember}
                />
              </TabsContent>
              <TabsContent value="card" className="px-4 pb-2 mt-0">
                <KinshipCardView
                  result={result}
                  person1={person1!}
                  person2={person2!}
                  motherName1={motherName1}
                  motherName2={motherName2}
                  onPersonTap={setDetailMember}
                  relationText={relationText}
                  directional={directional}
                />
              </TabsContent>
            </Tabs>

            <div className="px-5 pb-4">
              <Button variant="outline" onClick={handleReset} className="w-full rounded-2xl text-sm" size="sm">
                بحث جديد
              </Button>
            </div>
          </motion.div>
        )}

        {/* No relation found */}
        {showResult && person1 && person2 && !result && (
          <motion.div
            className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-center space-y-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-destructive font-bold">لم يتم العثور على صلة قرابة</p>
            <Button variant="outline" onClick={handleReset} size="sm" className="rounded-2xl">بحث جديد</Button>
          </motion.div>
        )}
      </div>

      {/* PersonDetails drawer */}
      <PersonDetails member={detailMember} onClose={() => setDetailMember(null)} />
    </div>
  );
}
