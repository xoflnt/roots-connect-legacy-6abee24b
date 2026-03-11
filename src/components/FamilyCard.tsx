import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Plus, Minus, UserPlus } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { downloadVCard } from "@/utils/vcard";
import type { FamilyMember } from "@/data/familyData";
import { BRANCH_COLORS } from "@/hooks/useTreeLayout";
import { HeritageBadge } from "./HeritageBadge";
import { isFounder, isDeceased, getChildrenOf } from "@/services/familyService";
import { formatAge } from "@/utils/ageCalculator";
import { getBranch, getBranchStyle } from "@/utils/branchUtils";

export function FamilyCard({ data, selected }: NodeProps) {
  const member = data as unknown as FamilyMember & {
    branchColorIndex: number;
    motherName: string | null;
    hasChildren: boolean;
    isExpanded: boolean;
  };
  const isMale = member.gender === "M";
  const branchColor = member.branchColorIndex >= 0 ? BRANCH_COLORS[member.branchColorIndex % BRANCH_COLORS.length] : null;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    (window as any).__toggleExpandNode?.(member.id);
  };

  const founder = isFounder(member);
  const deceased = isDeceased(member);
  const ageText = formatAge(member.birth_year, member.death_year);
  const childrenCount = getChildrenOf(member.id).length;
  const phone = member.phone as string | undefined;
  const branch = getBranch(member.id);
  const branchStyle = branch ? getBranchStyle(branch.pillarId) : null;

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
      style={{ fontFamily: "'Tajawal', sans-serif" }}
    >
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

      <h3
        className="text-base font-bold text-foreground leading-tight px-3 w-full line-clamp-2"
        dir="rtl"
      >
        {member.name}
      </h3>

      {/* Mother name with color */}
      {member.motherName && branchColor && (
        <p
          className="text-[10px] mt-0.5 px-2 py-0.5 rounded-full font-medium"
          style={{ color: branchColor.stroke, backgroundColor: `${branchColor.stroke}15` }}
          dir="rtl"
        >
          أم: {member.motherName}
        </p>
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
      {ageText && (
        <p className="text-[10px] text-accent font-semibold mt-0.5">{ageText}</p>
      )}

      {/* Children count + WhatsApp row */}
      <div className="flex items-center gap-1.5 mt-1 px-2">
        {childrenCount > 0 && (
          <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">
            {childrenCount} أبناء
          </span>
        )}
        {phone && (
          <>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
              title="تواصل عبر واتساب"
            >
              <WhatsAppIcon className="h-2.5 w-2.5" />
              واتساب
            </button>
            <button
              onClick={handleSaveContact}
              className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="حفظ جهة اتصال"
            >
              <UserPlus className="h-2.5 w-2.5" />
            </button>
          </>
        )}
      </div>

      {/* Heritage badges */}
      <div className="flex flex-wrap gap-0.5 justify-center mt-1 px-2">
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
