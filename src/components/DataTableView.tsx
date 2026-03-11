import { familyMembers } from "@/data/familyData";
import { Badge } from "@/components/ui/badge";
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

export function DataTableView() {
  return (
    <div className="h-full w-full overflow-auto" dir="rtl">
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
              <TableHead className="text-right">الأبناء</TableHead>
              <TableHead className="text-right">ملاحظات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {familyMembers.map((m, i) => (
              <TableRow
                key={m.id}
                className={
                  i % 2 === 0
                    ? "bg-background"
                    : "bg-muted/30"
                }
              >
                <TableCell className="font-mono text-muted-foreground text-xs">
                  {m.id}
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {m.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={m.gender === "M" ? "default" : "secondary"}
                    className="text-xs"
                  >
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
                  {m.mother || <span className="text-muted-foreground text-xs">—</span>}
                </TableCell>
                <TableCell className="text-sm">{m.birth_year || "—"}</TableCell>
                <TableCell className="text-sm">{m.death_year || "—"}</TableCell>
                <TableCell className="text-sm">
                  {m.spouses || <span className="text-muted-foreground text-xs">—</span>}
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
                <TableCell className="text-sm text-muted-foreground">
                  {m.notes || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
