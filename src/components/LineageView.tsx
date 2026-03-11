import { useMemo } from "react";
import { User, Calendar, Heart, ChevronUp } from "lucide-react";
import { familyMembers, type FamilyMember } from "@/data/familyData";

interface LineageViewProps {
  memberId: string;
  onSelectMember?: (memberId: string) => void;
}

export function LineageView({ memberId, onSelectMember }: LineageViewProps) {
  const chain = useMemo(() => {
    const memberMap = new Map(familyMembers.map((m) => [m.id, m]));
    const result: FamilyMember[] = [];
    let current = memberMap.get(memberId);
    while (current) {
      result.push(current);
      current = current.father_id ? memberMap.get(current.father_id) : undefined;
    }
    return result;
  }, [memberId]);

  if (chain.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-lg">
        لم يتم العثور على الشخص
      </div>
    );
  }

  return (
    <div className="py-6 md:py-10 px-3 md:px-4" dir="rtl">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-10 space-y-2">
          <div className="inline-block px-4 py-1.5 rounded-full bg-accent/15 text-accent font-bold text-sm">
            سلسلة النسب
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
            نسب {chain[0].name}
          </h2>
          <p className="text-muted-foreground text-sm">
            من {chain[0].name} إلى الجد الأعلى — {chain.length} أجيال
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {chain.map((member, index) => {
            const isFirst = index === 0;
            const isLast = index === chain.length - 1;
            const isMale = member.gender === "M";

            return (
              <div key={member.id} className="relative flex gap-3 md:gap-4 items-start">
                {/* Vertical line + dot */}
                <div className="flex flex-col items-center shrink-0 w-6 md:w-8">
                  <div
                    className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-2 z-10 ${
                      isFirst
                        ? "bg-accent border-accent shadow-lg shadow-accent/30"
                        : "bg-card border-primary/40"
                    }`}
                  />
                  {!isLast && (
                    <div className="w-0.5 flex-1 min-h-[2rem] bg-border" />
                  )}
                </div>

                {/* Card */}
                <div
                  className={`flex-1 mb-4 md:mb-6 p-4 md:p-5 rounded-2xl border transition-all duration-300 cursor-pointer hover:shadow-md min-h-[44px] ${
                    isFirst
                      ? "bg-accent/10 border-accent/30 shadow-md"
                      : "bg-card border-border/50 hover:border-primary/30"
                  }`}
                  onClick={() => onSelectMember?.(member.id)}
                  style={{
                    opacity: 0,
                    animation: `fade-in 0.5s ease-out ${index * 0.1}s forwards`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                        isMale
                          ? "bg-[hsl(var(--male-light))]"
                          : "bg-[hsl(var(--female-light))]"
                      }`}
                    >
                      <User
                        className={`h-4.5 w-4.5 md:h-5 md:w-5 ${
                          isMale
                            ? "text-[hsl(var(--male))]"
                            : "text-[hsl(var(--female))]"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-foreground truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {isMale ? "ذكر" : "أنثى"}
                        {isFirst && " — الشخص المطلوب"}
                        {isLast && " — الجد الأعلى"}
                      </p>
                    </div>
                  </div>

                  {(member.birth_year || member.death_year) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {member.birth_year && `${member.birth_year} هـ`}
                        {member.birth_year && member.death_year && " — "}
                        {member.death_year && `${member.death_year} هـ`}
                      </span>
                    </div>
                  )}

                  {member.spouses && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1.5">
                      <Heart className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{member.spouses}</span>
                    </div>
                  )}
                </div>

                {/* Arrow up indicator between cards */}
                {!isLast && (
                  <div className="absolute right-3 md:right-4 -bottom-1 z-10">
                    <ChevronUp className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
