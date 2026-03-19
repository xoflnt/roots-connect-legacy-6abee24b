import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toArabicNum } from "@/utils/arabicUtils";
import type { EnrichedMember } from "@/hooks/admin/useMembers";

interface MemberCardProps {
  member: EnrichedMember;
  isEven: boolean;
  onTap?: (member: EnrichedMember) => void;
}

const BRANCH_DOT_COLORS: Record<string, string> = {
  "300": "bg-green-500",
  "200": "bg-yellow-500",
  "400": "bg-orange-500",
};

export function MemberCard({ member, isEven }: MemberCardProps) {
  return (
    <div
      className={`flex items-center justify-between min-h-16 px-4 py-3 ${
        isEven ? "bg-muted/30" : ""
      }`}
      dir="rtl"
    >
      {/* Right side */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            member.branch ? BRANCH_DOT_COLORS[member.branch] || "bg-muted-foreground" : "bg-muted-foreground"
          }`}
        />
        <div className="min-w-0">
          <p className="font-semibold text-base text-foreground truncate">
            {member.name}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {member.fatherName && (
              <span className="text-sm text-muted-foreground">
                بن {member.fatherName}
              </span>
            )}
            <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
              ج{toArabicNum(member.generation)}
            </span>
          </div>
        </div>
      </div>

      {/* Left side */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-left">
          {member.birth_year && (
            <p className="text-sm text-muted-foreground">{member.birth_year}</p>
          )}
          {member.isDeceased && (
            <p className="text-xs text-muted-foreground">
              {member.gender === "M" ? "رحمه الله" : "رحمها الله"}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="min-h-12 min-w-12">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
