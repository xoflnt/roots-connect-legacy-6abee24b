import { useState, useMemo } from "react";
import { getAllMembers, inferMotherName, sortByBirth } from "@/services/familyService";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, UserPlus } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { downloadVCard } from "@/utils/vcard";
import { BRANCH_COLORS } from "@/hooks/useTreeLayout";
import { BRANCH_COLORS } from "@/hooks/useTreeLayout";
import { calculateAge } from "@/utils/ageCalculator";
import { toArabicNum } from "@/utils/ageCalculator";
import { getBranch, getBranchStyle } from "@/utils/branchUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTableView() {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("all");
  const [ancestorId, setAncestorId] = useState("all");

  const members = useMemo(() => getAllMembers(), []);

  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m.name])), [members]);

  const childrenMap = useMemo(() => {
    const map = new Map<string, string[]>();
    members.forEach((m) => {
      if (m.father_id) {
        const list = map.get(m.father_id) || [];
        list.push(m.name);
        map.set(m.father_id, list);
      }
    });
    return map;
  }, [members]);

  const ancestors = useMemo(() => members.filter((m) => childrenMap.has(m.id)), [members, childrenMap]);

  // Build mother color map: for each father, map mother name -> color index
  const motherColorMap = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    members.forEach((m) => {
      if (!m.father_id) return;
      const mn = inferMotherName(m);
      if (!mn) return;
      if (!map.has(m.father_id)) map.set(m.father_id, new Map());
      const fatherMap = map.get(m.father_id)!;
      if (!fatherMap.has(mn)) {
        fatherMap.set(mn, fatherMap.size);
      }
    });
    return map;
  }, [members]);

  function getDescendantIds(id: string): Set<string> {
    const result = new Set<string>();
    const queue = [id];
    while (queue.length > 0) {
      const current = queue.pop()!;
      members.forEach((m) => {
        if (m.father_id === current && !result.has(m.id)) {
          result.add(m.id);
          queue.push(m.id);
        }
      });
    }
    return result;
  }

  const hasFilters = search.trim() !== "" || gender !== "all" || ancestorId !== "all";

  const filtered = useMemo(() => {
    let list = members;

    if (ancestorId !== "all") {
      const descIds = getDescendantIds(ancestorId);
      descIds.add(ancestorId);
      list = list.filter((m) => descIds.has(m.id));
    }

    if (gender !== "all") {
      list = list.filter((m) => m.gender === gender);
    }

    if (search.trim()) {
      list = list.filter((m) => m.name.includes(search.trim()));
    }

    return list;
  }, [search, gender, ancestorId, members]);

  const clearFilters = () => {
    setSearch("");
    setGender("all");
    setAncestorId("all");
  };

  return (
    <div className="h-full w-full flex flex-col overflow-x-hidden" dir="rtl">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-card border-b border-border p-3 flex flex-wrap items-center gap-2 md:gap-3">
        <div className="relative w-full md:flex-1 md:max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="بحث بالاسم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9 bg-background"
          />
        </div>

        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger className="w-full md:w-[120px] bg-background flex-1 md:flex-none">
            <SelectValue placeholder="الجنس" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="M">ذكر</SelectItem>
            <SelectItem value="F">أنثى</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ancestorId} onValueChange={setAncestorId}>
          <SelectTrigger className="w-full md:w-[200px] bg-background flex-1 md:flex-none">
            <SelectValue placeholder="عرض ذرية..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأفراد</SelectItem>
            {ancestors.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Badge variant="secondary" className="text-xs shrink-0">
          {filtered.length} فرد
        </Badge>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0 gap-1">
            <X className="h-4 w-4" />
            مسح
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[1400px]">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-muted shadow-sm">
                <TableHead className="text-right w-[70px]">المعرف</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right w-[90px]">الفرع</TableHead>
                <TableHead className="text-right w-[60px]">الجنس</TableHead>
                <TableHead className="text-right">الأب</TableHead>
                <TableHead className="text-right">الوالدة</TableHead>
                <TableHead className="text-right w-[80px]">الميلاد</TableHead>
                <TableHead className="text-right w-[80px]">الوفاة</TableHead>
                <TableHead className="text-right w-[70px]">العمر</TableHead>
                <TableHead className="text-right">الزوجات</TableHead>
                <TableHead className="text-right w-[120px]">الجوال</TableHead>
                <TableHead className="text-right">الأبناء</TableHead>
                <TableHead className="text-right">ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m, i) => {
                const motherName = extractMotherName(m);
                const age = calculateAge(m.birth_year, m.death_year);
                const phone = m.phone as string | undefined;

                // Get mother color
                let motherColor: typeof BRANCH_COLORS[0] | null = null;
                if (motherName && m.father_id) {
                  const fatherMothers = motherColorMap.get(m.father_id);
                  if (fatherMothers) {
                    const idx = fatherMothers.get(motherName);
                    if (idx !== undefined) motherColor = BRANCH_COLORS[idx % BRANCH_COLORS.length];
                  }
                }

                return (
                  <TableRow
                    key={m.id}
                    className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}
                  >
                    <TableCell className="font-mono text-muted-foreground text-xs">{m.id}</TableCell>
                    <TableCell className="font-semibold text-foreground">{m.name}</TableCell>
                    <TableCell>
                      {(() => {
                        const br = getBranch(m.id);
                        const bs = br ? getBranchStyle(br.pillarId) : null;
                        return br && bs ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: bs.bg, color: bs.text }}>
                            {br.label}
                          </span>
                        ) : <span className="text-muted-foreground text-xs">—</span>;
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.gender === "M" ? "default" : "secondary"} className="text-xs">
                        {m.gender === "M" ? "ذكر" : "أنثى"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {m.father_id ? (
                        <Badge variant="outline" className="text-xs font-normal gap-1">
                          <span className="text-muted-foreground">{m.father_id}</span>
                          <span>—</span>
                          <span>{memberMap.get(m.father_id) ?? "غير موجود"}</span>
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {motherName ? (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={motherColor ? {
                            color: motherColor.stroke,
                            backgroundColor: `${motherColor.stroke}15`,
                          } : undefined}
                        >
                          {motherName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{m.birth_year || "—"}</TableCell>
                    <TableCell className="text-sm">{m.death_year || "—"}</TableCell>
                    <TableCell className="text-sm">
                      {age ? (
                        <span className="font-semibold text-accent">{toArabicNum(age)}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {m.spouses || <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-sm" dir="ltr">
                      {phone ? (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#25D366] hover:underline"
                          >
                            <WhatsAppIcon className="h-3 w-3" />
                            {phone}
                          </a>
                          <button
                            onClick={() => downloadVCard(m.name, phone)}
                            className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                            title="حفظ جهة اتصال"
                          >
                            <UserPlus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {childrenMap.has(m.id) ? (
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge variant="outline" className="text-xs shrink-0">
                            {childrenMap.get(m.id)!.length}
                          </Badge>
                          <span>{childrenMap.get(m.id)!.join("، ")}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.notes || "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
