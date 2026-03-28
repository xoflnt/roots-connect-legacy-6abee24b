import { useState, useMemo } from "react";
import { AlignJustify, User, Filter } from "lucide-react";
import { getDemoDepth, getDemoBranch } from "@/services/demoService";
import type { DemoMember } from "@/data/demoFamilyData";

interface DemoMemberListProps {
  members: DemoMember[];
  familyName: string;
  branches: { id: string; name: string }[];
  onSelectMember: (id: string) => void;
}

function toAr(n: number): string {
  return n.toLocaleString("ar-SA");
}

type SortMode = "alpha" | "generation";
type GenderFilter = "all" | "M" | "F";

export function DemoMemberList({ members, familyName, branches, onSelectMember }: DemoMemberListProps) {
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("generation");

  const filtered = useMemo(() => {
    let result = [...members];
    if (branchFilter !== "all") {
      result = result.filter(m => getDemoBranch(members, m.id) === branchFilter);
    }
    if (genderFilter !== "all") {
      result = result.filter(m => m.gender === genderFilter);
    }
    if (sortMode === "alpha") {
      result.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    } else {
      result.sort((a, b) => getDemoDepth(members, a.id) - getDemoDepth(members, b.id));
    }
    return result;
  }, [members, branchFilter, genderFilter, sortMode]);

  return (
    <div className="w-full h-full bg-card rounded-2xl border border-border/50 overflow-hidden flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-border/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlignJustify className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">قائمة أفراد عائلة {familyName}</h2>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{toAr(filtered.length)}</span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={branchFilter}
            onChange={e => setBranchFilter(e.target.value)}
            className="text-xs rounded-lg border border-border bg-background px-2.5 py-1.5"
          >
            <option value="all">كل الفروع</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>فرع {b.name}</option>
            ))}
          </select>
          <select
            value={genderFilter}
            onChange={e => setGenderFilter(e.target.value as GenderFilter)}
            className="text-xs rounded-lg border border-border bg-background px-2.5 py-1.5"
          >
            <option value="all">الكل</option>
            <option value="M">ذكور</option>
            <option value="F">إناث</option>
          </select>
          <select
            value={sortMode}
            onChange={e => setSortMode(e.target.value as SortMode)}
            className="text-xs rounded-lg border border-border bg-background px-2.5 py-1.5"
          >
            <option value="generation">حسب الجيل</option>
            <option value="alpha">أبجدي</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/20">
        {filtered.map(m => {
          const depth = getDemoDepth(members, m.id);
          const isMale = m.gender === "M";
          return (
            <button
              key={m.id}
              onClick={() => onSelectMember(m.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-right"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isMale ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400" : "bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400"}`}>
                <User className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{m.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                  {m.birth_year && <span>{m.birth_year} هـ</span>}
                  {m.death_year && <span>— ت {m.death_year} هـ</span>}
                  <span className="bg-muted/60 px-1.5 py-0.5 rounded-full">ج{toAr(depth)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
