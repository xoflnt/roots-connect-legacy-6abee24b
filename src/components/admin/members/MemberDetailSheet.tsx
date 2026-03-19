import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Archive, Share2 } from "lucide-react";
import { toArabicNum } from "@/utils/arabicUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { EnrichedMember } from "@/hooks/admin/useMembers";

interface MemberDetailSheetProps {
  member: EnrichedMember | null;
  allMembers: EnrichedMember[];
  isOpen: boolean;
  onClose: () => void;
}

const BRANCH_COLORS: Record<string, { bg: string; text: string }> = {
  "300": { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  "200": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  "400": { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
};

function extractMother(notes: string | null): string | null {
  if (!notes) return null;
  const match = notes.match(/(?:والدته|والدتها)[:\s]+([^\n,،]+)/);
  return match ? match[1].trim() : null;
}

export function MemberDetailSheet({ member, allMembers, isOpen, onClose }: MemberDetailSheetProps) {
  const isMobile = useIsMobile();
  const [viewingMember, setViewingMember] = useState<EnrichedMember | null>(null);

  useEffect(() => {
    setViewingMember(member);
  }, [member]);

  const current = viewingMember;

  const father = useMemo(
    () => (current?.father_id ? allMembers.find((m) => m.id === current.father_id) ?? null : null),
    [current, allMembers]
  );

  const grandfather = useMemo(
    () => (father?.father_id ? allMembers.find((m) => m.id === father.father_id) ?? null : null),
    [father, allMembers]
  );

  const children = useMemo(() => {
    if (!current) return { sons: [] as EnrichedMember[], daughters: [] as EnrichedMember[] };
    const kids = allMembers.filter((m) => m.father_id === current.id);
    return {
      sons: kids.filter((c) => c.gender === "M"),
      daughters: kids.filter((c) => c.gender === "F"),
    };
  }, [current, allMembers]);

  const motherName = useMemo(() => extractMother(current?.notes ?? null), [current]);

  if (!current) return null;

  const branchStyle = current.branch ? BRANCH_COLORS[current.branch] : null;

  const lineage = [father?.name, grandfather?.name].filter(Boolean).join(" بن ");

  const handleShare = () => {
    const text = `${current.name}${current.fatherName ? ` بن ${current.fatherName}` : ""}\n${current.branchLabel ?? ""} — الجيل ${toArabicNum(current.generation)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const navigateTo = (m: EnrichedMember) => setViewingMember(m);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={`flex flex-col ${isMobile ? "max-h-[92dvh] rounded-t-2xl" : "w-[400px]"} p-0`}
        dir="rtl"
      >
        <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-5">
          {/* Header */}
          <SheetHeader className="space-y-2 text-right">
            <SheetTitle className="text-[22px] font-bold text-foreground leading-tight">
              {current.name}
            </SheetTitle>
            {lineage && (
              <p className="text-base text-muted-foreground">بن {lineage}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {branchStyle && current.branchLabel && (
                <span className={`text-sm px-2.5 py-1 rounded-full ${branchStyle.bg} ${branchStyle.text}`}>
                  {current.branchLabel}
                </span>
              )}
              <span className="text-sm bg-muted text-muted-foreground rounded-full px-2.5 py-1">
                الجيل {toArabicNum(current.generation)}
              </span>
            </div>
            {current.isDeceased && (
              <p className="text-sm text-muted-foreground">
                {current.gender === "M" ? "رحمه الله" : "رحمها الله"}
              </p>
            )}
          </SheetHeader>

          {/* Info Section */}
          <Section title="المعلومات الأساسية">
            <InfoRow label="المعرّف" value={current.id} mono />
            <InfoRow label="الجنس" value={current.gender === "M" ? "ذكر" : "أنثى"} />
            <InfoRow label="سنة الميلاد" value={current.birth_year ? `${current.birth_year} هـ` : "غير معروف"} />
            {current.isDeceased && (
              <InfoRow label="سنة الوفاة" value={`${current.death_year} هـ`} />
            )}
            {current.notes && <InfoRow label="الملاحظات" value={current.notes} />}
          </Section>

          {/* Family Section */}
          <Section title="العائلة">
            <InfoRow
              label="الأب"
              value={father?.name ?? "غير معروف"}
              onTap={father ? () => navigateTo(father) : undefined}
            />
            <InfoRow label="الأم" value={motherName ?? "غير معروفة"} />
            <InfoRow
              label="الزوجات"
              value={current.spousesArray.length > 0 ? current.spousesArray.join("، ") : "غير مسجلة"}
            />
          </Section>

          {/* Children Section */}
          <Section title="الأبناء">
            <p className="text-sm text-muted-foreground mb-2">
              الأبناء ({toArabicNum(children.sons.length)}) — البنات ({toArabicNum(children.daughters.length)})
            </p>
            {children.sons.length + children.daughters.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا يوجد أبناء مسجلون</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[...children.sons, ...children.daughters].map((child) => (
                  <button
                    key={child.id}
                    onClick={() => navigateTo(child)}
                    className="min-h-[48px] px-3 py-2 rounded-xl bg-muted text-foreground text-sm hover:bg-accent transition-colors"
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Sticky Actions Bar */}
        <div className="absolute bottom-0 inset-x-0 border-t border-border bg-background/95 backdrop-blur p-4 flex gap-2">
          <Button className="flex-1 min-h-[48px] text-base" disabled>
            <Pencil className="h-4 w-4 me-2" />
            تعديل
          </Button>
          <Button variant="outline" className="flex-1 min-h-[48px] text-base text-amber-600" disabled>
            <Archive className="h-4 w-4 me-2" />
            أرشفة
          </Button>
          <Button variant="outline" className="flex-1 min-h-[48px] text-base" onClick={handleShare}>
            <Share2 className="h-4 w-4 me-2" />
            مشاركة
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-3">
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono, onTap }: { label: string; value: string; mono?: boolean; onTap?: () => void }) {
  return (
    <div className="flex justify-between items-start gap-4 py-1.5 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      {onTap ? (
        <button onClick={onTap} className="text-sm text-primary underline text-left min-h-[48px] flex items-center">
          {value}
        </button>
      ) : (
        <span className={`text-sm text-foreground text-left ${mono ? "font-mono" : ""}`}>{value}</span>
      )}
    </div>
  );
}
