import { useState, useMemo } from "react";
import { ArrowLeftRight, Search, User, Users, ChevronDown } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { familyMembers, type FamilyMember } from "@/data/familyData";
import { findKinship, kinshipToArabic } from "@/services/familyService";

interface KinshipCalculatorProps {
  initialMemberId?: string;
}

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
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    return familyMembers.filter((m) => m.name.includes(query.trim())).slice(0, 8);
  }, [query]);

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
          <button
            onClick={() => { onSelect(null); setQuery(""); }}
            className="w-full text-right group"
          >
            <p className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
              {selected.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">اضغط لتغيير الشخص</p>
          </button>
        ) : (
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="ابحث باسم الشخص..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => query.trim() && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              className="pr-10 h-11 rounded-xl text-sm border-border/50"
            />
            {open && filtered.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                {filtered.map((m) => (
                  <button
                    key={m.id}
                    className="w-full text-right px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 transition-colors border-b border-border/20 last:border-b-0 min-h-[44px]"
                    onMouseDown={() => { onSelect(m); setQuery(m.name); setOpen(false); }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function KinshipCalculator({ initialMemberId }: KinshipCalculatorProps) {
  const [person1, setPerson1] = useState<FamilyMember | null>(
    initialMemberId ? familyMembers.find((m) => m.id === initialMemberId) || null : null
  );
  const [person2, setPerson2] = useState<FamilyMember | null>(null);
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    if (!person1 || !person2) return null;
    return findKinship(person1.id, person2.id);
  }, [person1, person2]);

  const relationText = result ? kinshipToArabic(result.dist1, result.dist2) : null;

  const handleCalculate = () => {
    setShowResult(true);
  };

  const handleSwap = () => {
    const temp = person1;
    setPerson1(person2);
    setPerson2(temp);
    setShowResult(false);
  };

  const handleReset = () => {
    setPerson1(null);
    setPerson2(null);
    setShowResult(false);
  };

  // Build vertical path description
  const pathNodes = useMemo(() => {
    if (!result || !showResult) return [];
    const nodes: { name: string; relation: string }[] = [];

    // Path from person1 up to LCA
    for (let i = 0; i < result.path1.length; i++) {
      const m = result.path1[i];
      nodes.push({
        name: m.name.split(" ")[0],
        relation: i === 0 ? "الشخص الأول" : "والده",
      });
    }

    // Path from LCA down to person2 (skip LCA since it's already included)
    if (result.path2.length > 1) {
      const downPath = [...result.path2].reverse();
      // Skip first element (LCA, already in path1)
      for (let i = 1; i < downPath.length; i++) {
        const m = downPath[i];
        nodes.push({
          name: m.name.split(" ")[0],
          relation: i === downPath.length - 1 ? "الشخص الثاني" : "ابنه",
        });
      }
    }

    return nodes;
  }, [result, showResult]);

  return (
    <div className="py-6 md:py-10 px-4 md:px-6 overflow-auto" dir="rtl">
      <div className="max-w-md mx-auto space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
            <span className="font-bold text-sm">حاسبة القرابة</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
            من أنا لك؟
          </h2>
        </div>

        {/* Pickers */}
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
          <Button
            onClick={handleCalculate}
            className="w-full h-12 rounded-xl text-base font-bold"
            size="lg"
          >
            <Users className="h-5 w-5 ml-2" />
            احسب القرابة
          </Button>
        )}

        {/* Result */}
        {showResult && result && relationText && (
          <div
            className="rounded-2xl border border-primary/20 bg-card shadow-lg overflow-hidden animate-fade-in"
          >
            {/* Gold top accent + Relation badge */}
            <div className="h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
            <div className="bg-primary/10 p-5 text-center border-b border-primary/10">
              <p className="text-xs text-muted-foreground mb-2">صلة القرابة</p>
              <p className="text-2xl md:text-3xl font-extrabold text-primary leading-tight">
                {relationText}
              </p>
            </div>

            {/* Names */}
            <div className="p-4 flex items-center justify-between text-sm">
              <div className="text-center flex-1">
                <p className="font-bold text-foreground">{person1!.name.split(" ")[0]}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg]" />
              <div className="text-center flex-1">
                <p className="font-bold text-foreground">{person2!.name.split(" ")[0]}</p>
              </div>
            </div>

            {/* Vertical path */}
            {pathNodes.length > 0 && (
              <div className="px-5 pb-5 border-t border-border/30 pt-4">
                <p className="text-xs font-bold text-muted-foreground mb-3 text-center">
                  المسار عبر الجد المشترك: {result.lca?.name.split(" ")[0]}
                </p>
                <div className="flex flex-col items-center gap-0">
                  {pathNodes.map((node, i) => (
                    <div key={i} className="flex flex-col items-center">
                      {i > 0 && (
                        <div className="w-px h-4 bg-border" />
                      )}
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                        i === 0 || i === pathNodes.length - 1
                          ? "bg-primary/10 text-primary font-bold"
                          : node.name === result.lca?.name.split(" ")[0]
                            ? "bg-accent/10 text-accent-foreground font-bold ring-1 ring-accent/30"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        <span>{node.name}</span>
                        <span className="text-[10px] opacity-70">({node.relation})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reset */}
            <div className="px-5 pb-4">
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full rounded-xl text-sm"
                size="sm"
              >
                بحث جديد
              </Button>
            </div>
          </div>
        )}

        {/* No relation found */}
        {showResult && person1 && person2 && !result && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-center space-y-3">
            <p className="text-destructive font-bold">لم يتم العثور على صلة قرابة</p>
            <Button variant="outline" onClick={handleReset} size="sm" className="rounded-xl">
              بحث جديد
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
