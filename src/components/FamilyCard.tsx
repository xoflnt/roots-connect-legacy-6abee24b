import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Plus, Minus } from "lucide-react";
import type { FamilyMember } from "@/data/familyData";
import { BRANCH_COLORS } from "@/hooks/useTreeLayout";

export function FamilyCard({ data, selected }: NodeProps) {
  const member = data as unknown as FamilyMember & {
    branchColorIndex: number;
    hasChildren: boolean;
    isExpanded: boolean;
  };
  const isMale = member.gender === "M";
  const branchColor = member.branchColorIndex >= 0 ? BRANCH_COLORS[member.branchColorIndex % BRANCH_COLORS.length] : null;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    (window as any).__toggleExpandNode?.(member.id);
  };

  return (
    <div
      className={`
        relative w-[220px] h-[90px] overflow-visible flex flex-col justify-center items-center text-center
        rounded-2xl border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 antialiased
        ${selected ? "ring-2 ring-ring ring-offset-4 ring-offset-[hsl(var(--canvas-bg))]" : ""}
        ${isMale
          ? "border-[hsl(var(--male)/0.3)] bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--male-light))]"
          : "border-[hsl(var(--female)/0.3)] bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--female-light))]"
        }
      `}
      style={{ fontFamily: "'Tajawal', sans-serif" }}
    >
      {/* Branch color indicator */}
      {branchColor && (
        <div
          className="absolute right-0 top-2 bottom-2 w-1 rounded-full"
          style={{ backgroundColor: branchColor.stroke }}
        />
      )}

      <Handle type="target" position={Position.Top} className="!bg-muted-foreground/50 !w-2 !h-2 !border-none" />

      <h3 className="text-base font-bold text-foreground leading-tight px-3 truncate w-full">{member.name}</h3>

      {(member.birth_year || member.death_year) && (
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-center">
          {member.birth_year && `${member.birth_year} هـ`}
          {member.birth_year && member.death_year && " — "}
          {member.death_year && (
            <>
              {member.death_year} هـ
              <span className="text-[10px] opacity-60">✦</span>
            </>
          )}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground/50 !w-2 !h-2 !border-none" />

      {/* Expand/Collapse toggle */}
      {member.hasChildren && (
        <button
          onClick={handleToggle}
          className={`
            absolute -bottom-4 left-1/2 -translate-x-1/2 z-20
            w-7 h-7 rounded-full border-2 flex items-center justify-center
            transition-all duration-200 hover:scale-110 shadow-md
            ${member.isExpanded
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-card border-accent text-accent hover:bg-accent/10"
            }
          `}
          title={member.isExpanded ? "طي الفرع" : "توسيع الفرع"}
        >
          {member.isExpanded ? (
            <Minus className="h-3.5 w-3.5" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </div>
  );
}
