import { useState, useMemo, useCallback } from "react";
import { ArrowLeftRight, Search, User, Users, TreePine, FileText, Route, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import type { FamilyMember } from "@/data/familyData";
import { getAllMembers, searchMembers, findKinship, kinshipToArabic, kinshipDirectional, inferMotherName } from "@/services/familyService";
import { getLineageLabel, getMemberSubtitle } from "@/utils/memberLabel";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { KinshipTreeView } from "./kinship/KinshipTreeView";
import { KinshipDocumentView } from "./kinship/KinshipDocumentView";
import { KinshipInteractiveView } from "./kinship/KinshipInteractiveView";

interface KinshipCalculatorProps {
  initialMemberId?: string;
}

/* ── Visual viewport height for mobile keyboard ── */
function useVisualViewportHeight(): number | null {
  const [h, setH] = useState<number | null>(null);
  useState(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const update = () => setH(window.visualViewport!.height);
    update();
    window.visualViewport.addEventListener("resize", update);
    return () => window.visualViewport?.removeEventListener("resize", update);
  });
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
      <span className="block font-medium leading-snug">{getLineageLabel(m)}</span>
      {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
    </button>
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
      <div className={`rounded-2xl border-2 transition-all duration-200 ${selected ? "border-primary/40 bg-primary/5" : "border-border bg-card"} p-4`}>
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${accentClass}`}>
            <User className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-muted-foreground">{label}</span>
        </div>

        {selected ? (
          <button onClick={handleClear} className="w-full text-right group">
            <p className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
              {selected.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">اضغط لتغيير الشخص</p>
          </button>
        ) : isMobile ? (
          /* ── Mobile: tap to open fullscreen dialog ── */
          <>
            <button
              onClick={() => setDialogOpen(true)}
              className="w-full flex items-center gap-2 h-11 px-3 rounded-xl border border-border/50 bg-background text-sm text-muted-foreground"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span>ابحث باسم الشخص...</span>
            </button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent
                className="p-0 gap-0 max-w-full w-full h-full max-h-full rounded-none border-0 sm:rounded-none [&>button]:hidden"
                style={vpHeight ? { maxHeight: vpHeight } : undefined}
              >
                <DialogTitle className="sr-only">{label}</DialogTitle>
                <div className="flex flex-col h-full" dir="rtl">
                  {/* Search header */}
                  <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-card">
                    <button
                      onClick={() => setDialogOpen(false)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <div className="flex-1 relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        autoFocus
                        placeholder="ابحث باسم الشخص..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pr-10 h-11 rounded-xl text-sm border-border/50"
                      />
                    </div>
                  </div>
                  {/* Results */}
                  <div className="flex-1 overflow-y-auto overscroll-contain">
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
          </>
        ) : (
          /* ── Desktop: inline dropdown ── */
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="ابحث باسم الشخص..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setDesktopOpen(true); }}
              onFocus={() => query.trim() && setDesktopOpen(true)}
              onBlur={() => setTimeout(() => setDesktopOpen(false), 200)}
              className="pr-10 h-11 rounded-xl text-sm border-border/50"
            />
            {desktopOpen && filtered.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                {filtered.map((m) => (
                  <PersonResultRow key={m.id} m={m} onSelect={handleSelect} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── KinshipCalculator ── */
export function KinshipCalculator({ initialMemberId }: KinshipCalculatorProps) {
  const { currentUser } = useAuth();

  const resolveInitialPerson = (): FamilyMember | null => {
    if (initialMemberId) return getAllMembers().find((m) => m.id === initialMemberId) || null;
    if (currentUser?.memberId) return getAllMembers().find((m) => m.id === currentUser.memberId) || null;
    return null;
  };

  const [person1, setPerson1] = useState<FamilyMember | null>(resolveInitialPerson);
  const [person2, setPerson2] = useState<FamilyMember | null>(null);
  const [showResult, setShowResult] = useState(false);

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
  };

  return (
    <div className="py-6 md:py-10 px-4 md:px-6 overflow-auto" dir="rtl">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
            <span className="font-bold text-sm">حاسبة القرابة</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground">من أنا لك؟</h2>
        </div>

        {/* Pickers */}
        <div className="space-y-3">
          <PersonPicker
            label="الشخص الأول"
            selected={person1}
            onSelect={(m) => { setPerson1(m); setShowResult(false); }}
            accentClass="bg-primary/15 text-primary"
          />
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              disabled={!person1 && !person2}
              className="w-10 h-10 rounded-full border-2 border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all disabled:opacity-30"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>
          <PersonPicker
            label="الشخص الثاني"
            selected={person2}
            onSelect={(m) => { setPerson2(m); setShowResult(false); }}
            accentClass="bg-accent/15 text-accent-foreground"
          />
        </div>

        {/* Calculate button */}
        {person1 && person2 && !showResult && (
          <Button onClick={() => setShowResult(true)} className="w-full h-12 rounded-xl text-base font-bold" size="lg">
            <Users className="h-5 w-5 ml-2" />
            احسب القرابة
          </Button>
        )}

        {/* Tabbed Result */}
        {showResult && result && relationText && (
          <div className="rounded-2xl border border-primary/20 bg-card shadow-lg overflow-hidden animate-fade-in">
            <div className="h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
            <div className="bg-primary/10 p-5 text-center border-b border-primary/10 space-y-2">
              <p className="text-xs text-muted-foreground mb-2">صلة القرابة</p>
              {directional?.symmetric ? (
                <p className="text-xl md:text-2xl font-extrabold text-primary leading-relaxed">
                  <span className="text-foreground">{name1Short}</span> و <span className="text-foreground">{name2Short}</span> هما: {directional.symmetricTitle}
                </p>
              ) : directional && (directional.title1to2 || directional.title2to1) ? (
                <div className="space-y-3">
                  <div className="rounded-xl bg-primary/10 px-4 py-3">
                    <p className="text-base md:text-lg font-extrabold text-primary leading-relaxed">
                      <span className="text-foreground">{name1Short}</span> يعتبر: <span className="text-accent-foreground">{directional.title1to2}</span> لـ <span className="text-foreground">{name2Short}</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-accent/10 px-4 py-3">
                    <p className="text-base md:text-lg font-extrabold text-primary leading-relaxed">
                      <span className="text-foreground">{name2Short}</span> يعتبر: <span className="text-accent-foreground">{directional.title2to1}</span> لـ <span className="text-foreground">{name1Short}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-extrabold text-primary">{relationText}</p>
                  <p className="text-xs text-muted-foreground">
                    {name1Short} يرتفع عن {name2Short} بـ {result!.dist1} أجيال في شجرة النسب
                  </p>
                </div>
              )}
            </div>

            <Tabs defaultValue="tree" className="w-full">
              <div className="px-4 pt-4">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/60">
                  <TabsTrigger value="tree" className="text-xs py-2 gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <TreePine className="h-3.5 w-3.5" />
                    المخطط
                  </TabsTrigger>
                  <TabsTrigger value="document" className="text-xs py-2 gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    الوثيقة
                  </TabsTrigger>
                  <TabsTrigger value="path" className="text-xs py-2 gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Route className="h-3.5 w-3.5" />
                    المسار
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="tree" className="px-4 pb-2 mt-0">
                <KinshipTreeView result={result} person1={person1!} person2={person2!} motherName1={motherName1} motherName2={motherName2} />
              </TabsContent>
              <TabsContent value="document" className="px-4 pb-2 mt-0">
                <KinshipDocumentView result={result} person1={person1!} person2={person2!} motherName1={motherName1} motherName2={motherName2} />
              </TabsContent>
              <TabsContent value="path" className="px-4 pb-2 mt-0">
                <KinshipInteractiveView result={result} person1={person1!} person2={person2!} motherName1={motherName1} motherName2={motherName2} />
              </TabsContent>
            </Tabs>

            <div className="px-5 pb-4">
              <Button variant="outline" onClick={handleReset} className="w-full rounded-xl text-sm" size="sm">
                بحث جديد
              </Button>
            </div>
          </div>
        )}

        {/* No relation found */}
        {showResult && person1 && person2 && !result && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-center space-y-3">
            <p className="text-destructive font-bold">لم يتم العثور على صلة قرابة</p>
            <Button variant="outline" onClick={handleReset} size="sm" className="rounded-xl">بحث جديد</Button>
          </div>
        )}
      </div>
    </div>
  );
}
