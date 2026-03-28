import { useState } from "react";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchDemoMembers, getDemoDepth, getDemoBranch } from "@/services/demoService";
import type { DemoMember } from "@/data/demoFamilyData";

interface DemoSearchProps {
  members: DemoMember[];
  familyName: string;
  onSelectMember: (id: string) => void;
}

function toAr(n: number): string {
  return n.toLocaleString("ar-SA");
}

const BRANCH_LABELS: Record<string, string> = {
  D200: "الفرع الأول",
  D300: "الفرع الثاني",
  D400: "الفرع الثالث",
  D500: "الفرع الرابع",
};

export function DemoSearch({ members, familyName, onSelectMember }: DemoSearchProps) {
  const [query, setQuery] = useState("");
  const results = searchDemoMembers(members, query, 20);

  return (
    <div className="w-full h-full bg-card rounded-2xl border border-border/50 overflow-hidden" dir="rtl">
      <div className="p-4 border-b border-border/30 space-y-3">
        <h2 className="text-lg font-bold text-foreground">البحث في عائلة {familyName}</h2>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب الاسم أو جزء منه..."
            className="pr-10 rounded-xl h-12 text-base"
          />
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(100%-120px)] p-2">
        {query.trim() && results.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">لا توجد نتائج</p>
        )}
        {results.map((m) => {
          const depth = getDemoDepth(members, m.id);
          const branchId = getDemoBranch(members, m.id);
          const isMale = m.gender === "M";
          return (
            <button
              key={m.id}
              onClick={() => onSelectMember(m.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-right"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isMale ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400" : "bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400"}`}>
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{m.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  {m.birth_year && <span>{m.birth_year} هـ</span>}
                  {branchId && BRANCH_LABELS[branchId] && (
                    <span className="bg-muted px-1.5 py-0.5 rounded-full">{BRANCH_LABELS[branchId]}</span>
                  )}
                  <span>الجيل {toAr(depth)}</span>
                </div>
              </div>
            </button>
          );
        })}
        {!query.trim() && (
          <p className="text-center text-muted-foreground text-sm py-8">ابدأ بكتابة الاسم للبحث</p>
        )}
      </div>
    </div>
  );
}
