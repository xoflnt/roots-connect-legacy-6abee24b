import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { FamilyMember } from "@/data/familyData";

export function FamilyCard({ data, selected }: NodeProps) {
  const member = data as unknown as FamilyMember;
  const isMale = member.gender === "M";

  return (
    <div
      className={`
        w-[220px] h-[90px] overflow-hidden flex flex-col justify-center items-center text-center
        rounded-xl border-2 shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg
        ${selected ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : ""}
        ${isMale
          ? "border-[hsl(var(--male))] bg-[hsl(var(--male-light))]"
          : "border-[hsl(var(--female))] bg-[hsl(var(--female-light))]"
        }
      `}
      style={{ fontFamily: "'Tajawal', sans-serif" }}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />

      <h3 className="text-base font-bold text-foreground leading-tight">{member.name}</h3>

      {(member.birth_year || member.death_year) && (
        <p className="text-xs text-muted-foreground mt-1">
          {member.birth_year && `${member.birth_year} هـ`}
          {member.birth_year && member.death_year && " — "}
          {member.death_year && `${member.death_year} هـ`}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
    </div>
  );
}
