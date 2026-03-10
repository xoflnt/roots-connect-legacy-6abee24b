import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { FamilyMember } from "@/data/familyData";

export function FamilyCard({ data, selected }: NodeProps) {
  const member = data as unknown as FamilyMember;
  const isMale = member.gender === "M";

  return (
    <div
      className={`
        w-[220px] h-[90px] overflow-hidden flex flex-col justify-center items-center text-center
        rounded-2xl border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg antialiased
        ${selected ? "ring-2 ring-ring ring-offset-4 ring-offset-[hsl(var(--canvas-bg))]" : ""}
        ${isMale
          ? "border-[hsl(var(--male)/0.3)] bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--male-light))]"
          : "border-[hsl(var(--female)/0.3)] bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--female-light))]"
        }
      `}
      style={{ fontFamily: "'Tajawal', sans-serif" }}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground/50 !w-2 !h-2 !border-none" />

      <h3 className="text-base font-bold text-foreground leading-tight px-3 truncate w-full">{member.name}</h3>

      {(member.birth_year || member.death_year) && (
        <p className="text-xs text-muted-foreground mt-1">
          {member.birth_year && `${member.birth_year} هـ`}
          {member.birth_year && member.death_year && " — "}
          {member.death_year && `${member.death_year} هـ`}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground/50 !w-2 !h-2 !border-none" />
    </div>
  );
}
