import { useState, useMemo } from "react";
import { Users, ArrowLeftRight, Search, User } from "lucide-react";
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
}: {
  label: string;
  selected: FamilyMember | null;
  onSelect: (m: FamilyMember) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    return familyMembers.filter((m) => m.name.includes(query.trim())).slice(0, 8);
  }, [query]);

  return (
    <div className="relative flex-1 min-w-0">
      <label className="text-xs font-bold text-muted-foreground mb-1 block">{label}</label>
      {selected ? (
        <button
          onClick={() => { onSelect(null as any); setQuery(""); }}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-foreground text-sm font-bold text-right min-h-[44px]"
        >
          <User className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate">{selected.name}</span>
          <span className="text-xs text-muted-foreground mr-auto">✕</span>
        </button>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="ابحث باسم الشخص..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => query.trim() && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              className="pr-10 h-11 rounded-xl text-sm"
            />
          </div>
          {open && filtered.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  className="w-full text-right px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors border-b border-border/30 last:border-b-0 min-h-[44px]"
                  onMouseDown={() => { onSelect(m); setQuery(m.name); setOpen(false); }}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function KinshipCalculator({ initialMemberId }: KinshipCalculatorProps) {
  const [person1, setPerson1] = useState<FamilyMember | null>(
    initialMemberId ? familyMembers.find((m) => m.id === initialMemberId) || null : null
  );
  const [person2, setPerson2] = useState<FamilyMember | null>(null);

  const result = useMemo(() => {
    if (!person1 || !person2) return null;
    return findKinship(person1.id, person2.id);
  }, [person1, person2]);

  const relationText = result ? kinshipToArabic(result.dist1, result.dist2) : null;

  return (
    <div className="py-6 md:py-10 px-4 md:px-6 overflow-auto" dir="rtl">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block px-5 py-2 rounded-full bg-primary/15 text-primary font-bold text-sm">
            حاسبة القرابة
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
            من أنا لك؟
          </h2>
          <p className="text-muted-foreground text-sm">
            اختر شخصين لمعرفة صلة القرابة بينهما
          </p>
        </div>

        {/* Pickers */}
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <PersonPicker label="الشخص الأول" selected={person1} onSelect={setPerson1} />
          <div className="flex items-center justify-center shrink-0 pb-1">
            <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <PersonPicker label="الشخص الثاني" selected={person2} onSelect={setPerson2} />
        </div>

        {/* Result */}
        {result && relationText && (
          <div
            className="rounded-2xl border border-accent/30 bg-accent/10 p-6 text-center space-y-4"
            style={{ animation: "fade-in 0.4s ease-out" }}
          >
            <div className="text-lg font-bold text-foreground">
              {person1!.name}
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-primary">
              {relationText}
            </div>
            <div className="text-lg font-bold text-foreground">
              {person2!.name}
            </div>

            {/* Visual path */}
            <div className="pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground mb-3">المسار عبر الجد المشترك: {result.lca?.name}</p>
              <div className="flex items-center justify-center gap-1 flex-wrap">
                {result.path1.map((m, i) => (
                  <span key={`p1-${m.id}`} className="flex items-center gap-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${i === 0 ? "bg-primary/20 text-primary font-bold" : "bg-muted text-muted-foreground"}`}>
                      {m.name.split(" ")[0]}
                    </span>
                    {i < result.path1.length - 1 && <span className="text-muted-foreground text-xs">←</span>}
                  </span>
                ))}
                {result.path2.length > 1 && (
                  <>
                    <span className="text-accent font-bold text-xs mx-1">⟷</span>
                    {result.path2.slice(0, -1).reverse().map((m, i) => (
                      <span key={`p2-${m.id}`} className="flex items-center gap-1">
                        {i > 0 && <span className="text-muted-foreground text-xs">→</span>}
                        <span className={`text-xs px-2 py-1 rounded-full ${i === result.path2.length - 2 ? "bg-primary/20 text-primary font-bold" : "bg-muted text-muted-foreground"}`}>
                          {m.name.split(" ")[0]}
                        </span>
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {person1 && person2 && !result && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
            <p className="text-destructive font-bold">لم يتم العثور على صلة قرابة مشتركة</p>
          </div>
        )}
      </div>
    </div>
  );
}
