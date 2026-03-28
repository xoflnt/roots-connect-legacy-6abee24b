import React, { useState, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Plus, Minus, UserPlus, Heart, BadgeCheck, Phone } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { downloadVCard } from "@/utils/vcard";
import type { FamilyMember } from "@/data/familyData";
import { BRANCH_COLORS } from "@/hooks/useTreeLayout";
import { HeritageBadge } from "./HeritageBadge";
import { isFounder, isDeceased, getChildrenOf } from "@/services/familyService";
import { formatAge } from "@/utils/ageCalculator";
import { getBranch, getBranchStyle, DOCUMENTER_ID } from "@/utils/branchUtils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { canSeeAge, canSeeSpouses, canSeeMotherName, privateLabel } from "@/utils/privacyUtils";
import { applyTatweel } from "@/utils/tatweelUtils";

type FamilyCardData = FamilyMember & {
  branchColorIndex: number;
  motherName: string | null;
  spouseNames: string[];
  hasChildren: boolean;
  isExpanded: boolean;
  isVerified: boolean;
  isMobile: boolean;
  generation: number;
  isLoggedIn: boolean;
};

function toArabicDigit(n: number): string {
  return n.toLocaleString("ar-SA");
}

function ContactMenu({ phone, name, onWhatsApp, onSaveContact }: {
  phone: string;
  name: string;
  onWhatsApp: (e: React.MouseEvent) => void;
  onSaveContact: (e: React.MouseEvent) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center justify-center w-6 h-6 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
        title="تواصل"
      >
        <Phone className="h-3 w-3" />
      </button>
      {open && (
        <div
          className="absolute top-full mt-1 right-0 z-50 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden min-w-[140px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => { onWhatsApp(e); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
            واتساب
          </button>
          <div className="h-px bg-border/30" />
          <button
            onClick={(e) => { onSaveContact(e); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5 text-primary" />
            حفظ جهة اتصال
          </button>
        </div>
      )}
    </div>
  );
}

function FamilyCardComponent({ data, selected }: NodeProps) {
  const member = data as unknown as FamilyCardData;
  const isMale = member.gender === "M";
  const mobile = member.isMobile;
  const isLoggedIn = member.isLoggedIn ?? false;
  const branchColor = member.branchColorIndex >= 0 ? BRANCH_COLORS[member.branchColorIndex % BRANCH_COLORS.length] : null;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    (window as any).__toggleExpandNode?.(member.id);
  };

  const founder = isFounder(member);
  const deceased = isDeceased(member);
  const ageText = formatAge(member.birth_year, member.death_year);
  const showAge = canSeeAge(member.id, isLoggedIn);
  const showSpouses = canSeeSpouses(member.id, isLoggedIn);
  const childrenCount = getChildrenOf(member.id).length;
  const phone = member.phone as string | undefined;
  const branch = getBranch(member.id);
  const branchStyle = branch ? getBranchStyle(branch.pillarId) : null;
  const spouseNames = member.spouseNames || [];

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!phone) return;
    const cleaned = phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleaned}`, "_blank");
  };

  const handleSaveContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!phone) return;
    downloadVCard(member.name, phone);
  };

  const generationBadge = member.generation > 0 && (
    <span className="absolute top-1.5 left-1.5 text-[9px] font-bold" style={{ color: 'hsl(var(--muted-foreground) / 0.6)' }}>
      ج{toArabicDigit(member.generation)}
    </span>
  );

  const ageLabelEl = (
    <span className="text-[10px] italic text-muted-foreground">{privateLabel('العمر')}</span>
  );
  const motherLabelEl = (
    <span className="text-[10px] italic text-muted-foreground">{privateLabel('الوالدة')}</span>
  );

  // ── MOBILE COMPACT CARD ──
  if (mobile) {
    return (
      <div
        className={`
          relative w-[155px] min-h-[75px] overflow-visible flex flex-col justify-center items-center text-center
          rounded-2xl border-2 cursor-pointer transition-all duration-300 antialiased
          backdrop-blur-sm
          hover:shadow-xl hover:-translate-y-1
          ${selected
            ? "ring-2 ring-accent ring-offset-4 ring-offset-[hsl(var(--canvas-bg))] shadow-xl"
            : "shadow-md"
          }
          ${isMale
             ? "border-[hsl(var(--male)/0.25)] bg-card/95"
             : "border-[hsl(var(--female)/0.25)] bg-card/95"
          }
        `}
        style={{ fontFamily: "'YearOfHandicrafts', 'Tajawal', sans-serif" }}
      >
        {generationBadge}

        {/* Branch color indicator */}
        {branchColor && (
          <div
            className="absolute right-0 top-3 bottom-3 w-1 rounded-full"
            style={{ backgroundColor: branchColor.stroke }}
          />
        )}

        <Handle type="target" position={Position.Top} className="!bg-muted-foreground/40 !w-2.5 !h-2.5 !border-2 !border-card" />

        <div className="flex items-center justify-center gap-1 px-2 w-full" dir="rtl">
          <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-1">
            {(() => { const p = member.name.split(' '); p[0] = applyTatweel(p[0]); return p.join(' '); })()}
          </h3>
          {member.isVerified && (
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#22c55e]" />
          )}
        </div>

        {/* Age */}
        {ageText && showAge ? (
          <p className="text-[9px] text-accent font-semibold mt-0.5">{ageText}</p>
        ) : ageText && !showAge ? (
          <div className="mt-0.5">{ageLabelEl}</div>
        ) : null}

        {/* Children count */}
        <div className="flex items-center gap-1 mt-0.5 px-2">
          {childrenCount > 0 && (
            <span className="text-[9px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">
              {childrenCount} أبناء
            </span>
          )}
        </div>

        {/* Only deceased badge on mobile */}
        {deceased && (
          <div className="flex justify-center mt-0.5 px-2">
            <HeritageBadge type="deceased" gender={member.gender as "M" | "F"} />
          </div>
        )}

        <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground/40 !w-2.5 !h-2.5 !border-2 !border-card" />

        {member.hasChildren && (
          <button
            onClick={handleToggle}
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={member.isExpanded ? "طي الفرع" : "توسيع الفرع"}
          >
            <span
              className={`
                w-7 h-7 rounded-full border-2 flex items-center justify-center
                transition-all duration-200 hover:scale-110 shadow-lg
                ${member.isExpanded
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-card border-accent text-accent hover:bg-accent/10"
                }
              `}
            >
              {member.isExpanded ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </span>
          </button>
        )}
      </div>
    );
  }

  // ── DESKTOP FULL CARD ──
  return (
    <div
      className={`
        relative w-[220px] min-h-[90px] overflow-visible flex flex-col justify-center items-center text-center
        rounded-2xl border-2 cursor-pointer transition-all duration-300 antialiased
        backdrop-blur-sm
        hover:shadow-xl hover:-translate-y-1
        ${selected
          ? "ring-2 ring-accent ring-offset-4 ring-offset-[hsl(var(--canvas-bg))] shadow-xl"
          : "shadow-md"
        }
        ${isMale
           ? "border-[hsl(var(--male)/0.25)] bg-card/95"
           : "border-[hsl(var(--female)/0.25)] bg-card/95"
        }
      `}
      style={{ fontFamily: "'YearOfHandicrafts', 'Tajawal', sans-serif" }}
    >
      {generationBadge}

      {/* Branch color indicator */}
      {branchColor && (
        <div
          className="absolute right-0 top-3 bottom-3 w-1 rounded-full"
          style={{ backgroundColor: branchColor.stroke }}
        />
      )}

      {/* Founder gold top border */}
      {founder && (
        <div className="absolute top-0 left-4 right-4 h-0.5 rounded-full bg-accent/60" />
      )}

      <Handle type="target" position={Position.Top} className="!bg-muted-foreground/40 !w-2.5 !h-2.5 !border-2 !border-card" />

      <div className="flex items-center justify-center gap-1 px-3 w-full" dir="rtl">
        <h3 className="text-base font-bold text-foreground leading-tight line-clamp-2">
          {(() => { const p = member.name.split(' '); p[0] = applyTatweel(p[0]); return p.join(' '); })()}
        </h3>
        {member.isVerified && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <BadgeCheck className="h-4 w-4 shrink-0 text-[#22c55e]" />
              </TooltipTrigger>
              <TooltipContent side="top"><span>حساب موثق</span></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Spouse names inside card */}
      {spouseNames.length > 0 && (
        showSpouses ? (
          <div className="flex flex-wrap gap-1 justify-center mt-0.5 px-2" dir="rtl">
            {spouseNames.map((name, i) => (
              <span
                key={i}
                className="flex items-center gap-0.5 text-[10px] text-muted-foreground"
              >
                <Heart className="h-2 w-2 shrink-0 fill-accent/50 text-accent/50" />
                {name}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-0.5 px-2">{motherLabelEl}</div>
        )
      )}

      {/* Mother name */}
      {member.motherName && (
        canSeeMotherName(member.id, isLoggedIn) ? (
          <p
            className="text-[10px] mt-0.5 px-2 py-0.5 rounded-full font-medium"
            style={branchColor
              ? { color: branchColor.stroke, backgroundColor: `${branchColor.stroke}15` }
              : undefined
            }
            dir="rtl"
          >
            <span className={!branchColor ? "text-muted-foreground" : undefined}>
              {member.gender === "F" ? "والدتها" : "والدته"}: {member.motherName}
            </span>
          </p>
        ) : (
          <div className="mt-0.5 px-2">{motherLabelEl}</div>
        )
      )}

      {(member.birth_year || member.death_year) && (
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-center tabular-nums">
          {member.birth_year && `${member.birth_year} هـ`}
          {member.birth_year && member.death_year && " — "}
          {member.death_year && (
            <>
              {member.death_year} هـ
              <span className="text-[10px] opacity-50">✦</span>
            </>
          )}
        </p>
      )}

      {/* Age */}
      {ageText && showAge ? (
        <p className="text-[10px] text-accent font-semibold mt-0.5">{ageText}</p>
      ) : ageText && !showAge ? (
        <div className="mt-0.5">{ageLabelEl}</div>
      ) : null}

      {/* Children count + WhatsApp row */}
      <div className="flex items-center gap-1.5 mt-1 px-2">
        {childrenCount > 0 && (
          <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">
            {childrenCount} أبناء
          </span>
        )}
        {phone && <ContactMenu phone={phone} name={member.name} onWhatsApp={handleWhatsApp} onSaveContact={handleSaveContact} />}
      </div>

      {/* Heritage badges */}
      <div className="flex flex-wrap gap-0.5 justify-center mt-1 px-2">
        {branch && branchStyle && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: branchStyle.bg, color: branchStyle.text }}
          >
            {branch.label}
          </span>
        )}
        {member.id === DOCUMENTER_ID && <HeritageBadge type="documenter" />}
        {founder && <HeritageBadge type="founder" />}
        {deceased && <HeritageBadge type="deceased" gender={member.gender as "M" | "F"} />}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground/40 !w-2.5 !h-2.5 !border-2 !border-card" />

      {member.hasChildren && (
        <button
          onClick={handleToggle}
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center"
          title={member.isExpanded ? "طي الفرع" : "توسيع الفرع"}
        >
          <span
            className={`
              w-7 h-7 rounded-full border-2 flex items-center justify-center
              transition-all duration-200 hover:scale-110 shadow-lg
              ${member.isExpanded
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-card border-accent text-accent hover:bg-accent/10"
              }
            `}
          >
            {member.isExpanded ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </span>
        </button>
      )}
    </div>
  );
}

export const FamilyCard = React.memo(FamilyCardComponent, (prev, next) => {
  const p = prev.data as unknown as FamilyCardData;
  const n = next.data as unknown as FamilyCardData;
  return (
    p.id === n.id &&
    p.isExpanded === n.isExpanded &&
    p.hasChildren === n.hasChildren &&
    prev.selected === next.selected &&
    p.isMobile === n.isMobile &&
    p.isVerified === n.isVerified &&
    p.generation === n.generation &&
    p.isLoggedIn === n.isLoggedIn
  );
});
