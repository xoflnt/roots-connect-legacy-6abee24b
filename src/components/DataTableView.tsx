import { useState, useMemo } from "react";
import { familyMembers } from "@/data/familyData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
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

const memberMap = new Map(familyMembers.map((m) => [m.id, m.name]));

const childrenMap = new Map<string, string[]>();
familyMembers.forEach((m) => {
  if (m.father_id) {
    const list = childrenMap.get(m.father_id) || [];
    list.push(m.name);
    childrenMap.set(m.father_id, list);
  }
});

// Build ancestors list (people who have children)
const ancestors = familyMembers.filter((m) => childrenMap.has(m.id));

function getDescendantIds(id: string): Set<string> {
  const result = new Set<string>();
  const queue = [id];
  while (queue.length > 0) {
    const current = queue.pop()!;
    familyMembers.forEach((m) => {
      if (m.father_id === current && !result.has(m.id)) {
        result.add(m.id);
        queue.push(m.id);
      }
    });
  }
  return result;
}

export function DataTableView() {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("all");
  const [ancestorId, setAncestorId] = useState("all");

  const hasFilters = search.trim() !== "" || gender !== "all" || ancestorId !== "all";

  const filtered = useMemo(() => {
    let list = familyMembers;

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
  }, [search, gender, ancestorId]);

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
        <div className="min-w-[1200px]">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-muted shadow-sm">
                <TableHead className="text-right w-[70px]">المعرف</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right w-[60px]">الجنس</TableHead>
                <TableHead className="text-right">الأب</TableHead>
                <TableHead className="text-right w-[80px]">الميلاد</TableHead>
                <TableHead className="text-right w-[80px]">الوفاة</TableHead>
                <TableHead className="text-right">الزوجات</TableHead>
                <TableHead className="text-right w-[120px]">الجوال</TableHead>
                <TableHead className="text-right">الأبناء</TableHead>
                <TableHead className="text-right">ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m, i) => (
                <TableRow
                  key={m.id}
                  className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}
                >
                  <TableCell className="font-mono text-muted-foreground text-xs">{m.id}</TableCell>
                  <TableCell className="font-semibold text-foreground">{m.name}</TableCell>
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
                  <TableCell className="text-sm">{m.birth_year || "—"}</TableCell>
                  <TableCell className="text-sm">{m.death_year || "—"}</TableCell>
                  <TableCell className="text-sm">
                    {m.spouses || <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-sm font-mono" dir="ltr">
                    {m.phone || <span className="text-muted-foreground text-xs">—</span>}
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
