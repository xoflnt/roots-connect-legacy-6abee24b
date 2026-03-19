import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toArabicNum } from "@/utils/arabicUtils";
import { useMembers } from "@/hooks/admin/useMembers";
import { useIsMobile } from "@/hooks/use-mobile";
import { PILLARS } from "@/utils/branchUtils";
import { MemberCard } from "./MemberCard";
import { MemberDetailSheet } from "./MemberDetailSheet";
import { AddMemberSheet } from "./AddMemberSheet";
import { Pagination } from "../shared/Pagination";
import type { EnrichedMember } from "@/hooks/admin/useMembers";

export function MemberListPage() {
  const {
    members,
    allMembers,
    total,
    page,
    totalPages,
    setPage,
    filters,
    updateFilters,
    isLoading,
  } = useMembers();

  const isMobile = useIsMobile();
  const [selectedMember, setSelectedMember] = useState<EnrichedMember | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search: searchInput });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, updateFilters]);

  const handleAddSuccess = () => {
    // Force re-render by resetting page
    setPage(1);
    setAddOpen(false);
  };

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-foreground">الأعضاء</h2>
        <Badge variant="secondary" className="text-base">
          {toArabicNum(total)}
        </Badge>
        {!isMobile && (
          <Button
            onClick={() => setAddOpen(true)}
            className="mr-auto min-h-12 text-base rounded-xl gap-1.5"
          >
            <Plus className="h-4 w-4" />
            إضافة عضو
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="ابحث بالاسم أو المعرف..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pr-9 min-h-12 text-base rounded-xl"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Select
          value={filters.branch || "all"}
          onValueChange={(v) => updateFilters({ branch: v === "all" ? null : v })}
        >
          <SelectTrigger className="min-h-12 min-w-0 text-base rounded-xl">
            <SelectValue placeholder="الفرع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {PILLARS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || "all"}
          onValueChange={(v) =>
            updateFilters({
              status: v === "all" ? null : (v as "alive" | "deceased"),
            })
          }
        >
          <SelectTrigger className="min-h-12 min-w-0 text-base rounded-xl">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="alive">أحياء</SelectItem>
            <SelectItem value="deceased">متوفون</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.gender || "all"}
          onValueChange={(v) =>
            updateFilters({
              gender: v === "all" ? null : (v as "M" | "F"),
            })
          }
        >
          <SelectTrigger className="min-h-12 min-w-0 text-base rounded-xl">
            <SelectValue placeholder="الجنس" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="M">ذكور</SelectItem>
            <SelectItem value="F">إناث</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.generation != null ? String(filters.generation) : "all"}
          onValueChange={(v) =>
            updateFilters({
              generation: v === "all" ? null : Number(v),
            })
          }
        >
          <SelectTrigger className="min-h-12 min-w-0 text-base rounded-xl">
            <SelectValue placeholder="الجيل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {Array.from({ length: 9 }, (_, i) => i + 1).map((g) => (
              <SelectItem key={g} value={String(g)}>
                {toArabicNum(g)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Member list */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-base">
            جاري التحميل...
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-base">
            لا توجد نتائج
          </div>
        ) : (
          members.map((m, i) => (
            <MemberCard key={m.id} member={m} isEven={i % 2 === 0} onTap={setSelectedMember} />
          ))
        )}
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Mobile FAB */}
      {isMobile && (
        <button
          onClick={() => setAddOpen(true)}
          className="fixed bottom-20 left-4 z-40 min-w-14 min-h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <MemberDetailSheet
        member={selectedMember}
        allMembers={allMembers}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />

      <AddMemberSheet
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={handleAddSuccess}
        allMembers={allMembers}
      />
    </div>
  );
}
