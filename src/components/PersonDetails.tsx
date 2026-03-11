import { useState, useMemo } from "react";
import { User, Calendar, Heart, FileText, X, ExternalLink, Clock, Send, Users2 } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { FamilyMember } from "@/data/familyData";
import { useNavigate } from "react-router-dom";
import { formatAge } from "@/utils/ageCalculator";
import { extractMotherName, getChildrenOf } from "@/services/familyService";
import { BRANCH_COLORS } from "@/hooks/useTreeLayout";
import { SubmitRequestForm } from "@/components/SubmitRequestForm";

interface PersonDetailsProps {
  member: FamilyMember | null;
  onClose: () => void;
}

function DetailContent({ member }: { member: FamilyMember }) {
  const navigate = useNavigate();
  const isMale = member.gender === "M";
  const [requestOpen, setRequestOpen] = useState(false);

  const ageText = formatAge(member.birth_year, member.death_year);
  const motherName = extractMotherName(member);
  const phone = member.phone as string | undefined;
  const children = getChildrenOf(member.id);

  // Group children by mother with colors
  const groupedChildren = useMemo(() => {
    if (children.length === 0) return [];
    const groups = new Map<string, { children: FamilyMember[]; colorIndex: number }>();
    let ci = 0;
    children.forEach((child) => {
      const mn = extractMotherName(child) || "__unknown__";
      if (!groups.has(mn)) {
        groups.set(mn, { children: [], colorIndex: mn !== "__unknown__" ? ci++ : -1 });
      }
      groups.get(mn)!.children.push(child);
    });
    return Array.from(groups.entries());
  }, [children]);

  // Parse spouses with colors
  const spouseList = useMemo(() => {
    if (!member.spouses) return [];
    return member.spouses.split("،").map((s) => s.trim()).filter(Boolean);
  }, [member.spouses]);

  return (
    <div className="space-y-5 p-1" dir="rtl">
      <div className="h-1 w-16 mx-auto rounded-full bg-accent/50" />

      {/* Avatar and name */}
      <div className="text-center space-y-3">
        <div
          className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-md ${
            isMale ? "bg-[hsl(var(--male-light))]" : "bg-[hsl(var(--female-light))]"
          }`}
        >
          <User className={`h-7 w-7 ${isMale ? "text-[hsl(var(--male))]" : "text-[hsl(var(--female))]"}`} />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-foreground">{member.name}</h3>
          <span
            className={`inline-block mt-1.5 text-xs font-bold px-3 py-1 rounded-full ${
              isMale
                ? "bg-[hsl(var(--male-light))] text-[hsl(var(--male))]"
                : "bg-[hsl(var(--female-light))] text-[hsl(var(--female))]"
            }`}
          >
            {isMale ? "ذكر" : "أنثى"}
          </span>
        </div>
      </div>

      {/* Info cards */}
      <div className="space-y-2.5">
        {ageText && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20">
            <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">العمر</p>
              <p className="text-sm font-bold text-foreground">{ageText}</p>
            </div>
          </div>
        )}

        {motherName && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border/30">
            <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
              <Users2 className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">الأم</p>
              <p className="text-sm font-bold text-foreground">{motherName}</p>
            </div>
          </div>
        )}

        {member.birth_year && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border/30">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">سنة الميلاد</p>
              <p className="text-sm font-bold text-foreground">{member.birth_year} هـ</p>
            </div>
          </div>
        )}

        {member.death_year && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border/30">
            <div className="w-9 h-9 rounded-lg bg-muted-foreground/10 flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">سنة الوفاة</p>
              <p className="text-sm font-bold text-foreground">{member.death_year} هـ</p>
            </div>
          </div>
        )}

        {/* Phone + WhatsApp */}
        {phone && (
          <a
            href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/15 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-[#25D366]/15 flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4 text-[#25D366]" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">تواصل عبر واتساب</p>
              <p className="text-sm font-bold text-foreground" dir="ltr">{phone}</p>
            </div>
          </a>
        )}

        {/* Spouses with colors */}
        {spouseList.length > 0 && (
          <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border/30 space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-accent shrink-0" />
              <p className="text-[11px] text-muted-foreground font-medium">الزوجات</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {spouseList.map((spouse, i) => {
                const color = BRANCH_COLORS[i % BRANCH_COLORS.length];
                return (
                  <span
                    key={i}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ color: color.stroke, backgroundColor: `${color.stroke}15` }}
                  >
                    {spouse}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Children grouped by mother */}
        {groupedChildren.length > 0 && (
          <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border/30 space-y-2">
            <p className="text-[11px] text-muted-foreground font-medium">الأبناء ({children.length})</p>
            {groupedChildren.map(([motherKey, group]) => {
              const color = group.colorIndex >= 0 ? BRANCH_COLORS[group.colorIndex % BRANCH_COLORS.length] : null;
              return (
                <div key={motherKey}>
                  {motherKey !== "__unknown__" && color && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color.stroke }} />
                      <span className="text-[10px] font-semibold" style={{ color: color.stroke }}>
                        أبناء {motherKey}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {group.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => navigate(`/person/${child.id}`)}
                        className="text-xs font-medium px-2.5 py-1 rounded-full transition-colors min-h-[28px] bg-muted text-foreground hover:bg-muted/80"
                        style={color ? { borderLeft: `3px solid ${color.stroke}` } : undefined}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {member.notes && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border/30">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">ملاحظات</p>
              <p className="text-sm text-foreground leading-relaxed">{member.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          onClick={() => navigate(`/person/${member.id}`)}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold"
        >
          <ExternalLink className="h-4 w-4" />
          عرض صفحة النسب
        </Button>
        <Button
          variant="outline"
          onClick={() => setRequestOpen(true)}
          className="w-full gap-2 font-bold border-accent/30 text-accent hover:bg-accent/10"
        >
          <Send className="h-4 w-4" />
          طلب تعديل
        </Button>
      </div>

      <SubmitRequestForm open={requestOpen} onOpenChange={setRequestOpen} targetMember={member} />
    </div>
  );
}

export function PersonDetails({ member, onClose }: PersonDetailsProps) {
  const isMobile = useIsMobile();

  if (!member) return null;

  if (isMobile) {
    return (
      <Drawer open={!!member} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="px-5 pb-8 pt-2 max-h-[85vh]">
          <DrawerHeader className="p-0 mb-2">
            <DrawerTitle className="sr-only">{member.name}</DrawerTitle>
          </DrawerHeader>
          <DetailContent member={member} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={!!member} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[360px] sm:w-[400px] overflow-y-auto border-r-0 shadow-2xl">
        <SheetHeader className="pb-0">
          <SheetTitle className="sr-only">{member.name}</SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 left-4 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        <div className="mt-4">
          <DetailContent member={member} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
