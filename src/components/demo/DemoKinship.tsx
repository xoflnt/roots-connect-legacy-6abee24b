import { useState } from "react";
import { Scale, Search, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchDemoMembers, computeDemoKinship } from "@/services/demoService";
import type { DemoMember } from "@/data/demoFamilyData";

interface DemoKinshipProps {
  members: DemoMember[];
  familyName: string;
}

function PersonPicker({ members, label, selected, onSelect }: {
  members: DemoMember[];
  label: string;
  selected: DemoMember | null;
  onSelect: (m: DemoMember) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = searchDemoMembers(members, query, 8);

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-foreground">{label}</p>
      {selected ? (
        <div className="flex items-center gap-2 bg-muted/50 border border-border/30 rounded-xl p-3">
          <span className="text-sm font-bold text-foreground flex-1">{selected.name}</span>
          <button onClick={() => onSelect(null!)} className="text-xs text-muted-foreground hover:text-foreground">تغيير</button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => query.trim() && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder="ابحث عن اسم..."
            className="pr-10 rounded-xl"
          />
          {open && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl overflow-hidden shadow-lg max-h-[200px] overflow-y-auto z-50">
              {results.map(m => (
                <button
                  key={m.id}
                  className="w-full text-right px-3 py-2 hover:bg-muted text-sm border-b border-border/20 last:border-0"
                  onMouseDown={() => { onSelect(m); setQuery(""); setOpen(false); }}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DemoKinship({ members, familyName }: DemoKinshipProps) {
  const [person1, setPerson1] = useState<DemoMember | null>(null);
  const [person2, setPerson2] = useState<DemoMember | null>(null);
  const [result, setResult] = useState<ReturnType<typeof computeDemoKinship>>(null);

  const calculate = () => {
    if (!person1 || !person2) return;
    setResult(computeDemoKinship(members, person1.id, person2.id));
  };

  return (
    <div className="w-full h-full bg-card rounded-2xl border border-border/50 overflow-auto p-5 space-y-5" dir="rtl">
      <div className="flex items-center gap-2">
        <Scale className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">حاسبة القرابة</h2>
      </div>

      <PersonPicker members={members} label="الشخص الأول" selected={person1} onSelect={setPerson1} />
      <PersonPicker members={members} label="الشخص الثاني" selected={person2} onSelect={setPerson2} />

      <Button
        onClick={calculate}
        disabled={!person1 || !person2}
        className="w-full min-h-[48px] rounded-xl font-bold"
      >
        احسب القرابة
      </Button>

      {result && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-4">
          <div className="text-center">
            <p className="text-lg font-extrabold text-primary">{result.label}</p>
            {result.lca && (
              <p className="text-sm text-muted-foreground mt-1">
                الجد المشترك: {result.lca.name}
              </p>
            )}
          </div>

          {/* Path visualization */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground text-center">سلسلة {person1?.name.split(" ")[0]}</p>
              {result.path1.map((m, i) => (
                <div key={m.id} className="flex items-center gap-1">
                  {i > 0 && <ChevronLeft className="h-3 w-3 text-muted-foreground shrink-0" />}
                  <span className={`text-xs ${m.id === result.lca?.id ? "font-bold text-primary" : "text-foreground"}`}>
                    {m.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground text-center">سلسلة {person2?.name.split(" ")[0]}</p>
              {result.path2.map((m, i) => (
                <div key={m.id} className="flex items-center gap-1">
                  {i > 0 && <ChevronLeft className="h-3 w-3 text-muted-foreground shrink-0" />}
                  <span className={`text-xs ${m.id === result.lca?.id ? "font-bold text-primary" : "text-foreground"}`}>
                    {m.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
