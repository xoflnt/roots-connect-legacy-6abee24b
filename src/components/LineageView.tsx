import { useMemo, useCallback } from "react";
import { User, Calendar, Heart, ArrowUp, Users, Share2, Check, Download } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { useState } from "react";
import { type FamilyMember } from "@/data/familyData";
import { getAllMembers, extractMotherName } from "@/services/familyService";
import { BRANCH_COLORS } from "@/hooks/useTreeLayout";
import { HeritageBadge } from "./HeritageBadge";
import { isFounder, isBranchHead, isDeceased } from "@/services/familyService";
import { downloadLineageCard } from "./LineageShareCard";
import { formatAge } from "@/utils/ageCalculator";

interface LineageViewProps {
  memberId: string;
  onSelectMember?: (memberId: string) => void;
}

const DEPTH_COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--primary))",
  "hsl(340, 60%, 55%)",
  "hsl(35, 70%, 50%)",
  "hsl(175, 50%, 40%)",
  "hsl(270, 45%, 55%)",
];

function toArabicNum(n: number): string {
  return n.toLocaleString("ar-SA");
}

export function LineageView({ memberId, onSelectMember }: LineageViewProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { chain, childrenMap } = useMemo(() => {
    const members = getAllMembers();
    const memberMap = new Map(members.map((m) => [m.id, m]));
    const result: FamilyMember[] = [];
    let current = memberMap.get(memberId);
    while (current) {
      result.push(current);
      current = current.father_id ? memberMap.get(current.father_id) : undefined;
    }

    const cMap = new Map<string, FamilyMember[]>();
    for (const m of members) {
      if (m.father_id) {
        const arr = cMap.get(m.father_id) || [];
        arr.push(m);
        cMap.set(m.father_id, arr);
      }
    }

    return { chain: result, childrenMap: cMap };
  }, [memberId]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/person/${memberId}`;
    if (navigator.share) {
      navigator.share({ title: `نسب ${chain[0]?.name} — بوابة الخنيني`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [memberId, chain]);

  const handleDownloadCard = useCallback(async () => {
    if (chain.length === 0) return;
    setDownloading(true);
    try {
      await downloadLineageCard(chain, memberId);
    } finally {
      setDownloading(false);
    }
  }, [chain, memberId]);

  if (chain.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-lg">
        لم يتم العثور على الشخص
      </div>
    );
  }

  return (
    <div className="py-6 md:py-10 px-4 md:px-6 overflow-x-hidden" dir="rtl">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10 space-y-3">
          <div className="inline-block px-5 py-2 rounded-full bg-accent/15 text-accent font-bold text-sm">
            سلسلة النسب
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground break-words">
            نسب {chain[0].name}
          </h2>
          <p className="text-muted-foreground text-sm">
            من {chain[0].name} إلى الجد الأعلى — {toArabicNum(chain.length)} أجيال
          </p>
          {/* Action buttons */}
          <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium min-h-[44px]"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  تم النسخ!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  شارك النسب
                </>
              )}
            </button>
            <button
              onClick={handleDownloadCard}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 text-accent hover:bg-accent/25 transition-colors text-sm font-medium min-h-[44px] disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {downloading ? "جاري التحميل..." : "بطاقة واتساب"}
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {chain.map((member, index) => {
            const isFirst = index === 0;
            const isLast = index === chain.length - 1;
            const isMale = member.gender === "M";
            const genNum = index + 1;
            const dotColor = DEPTH_COLORS[index % DEPTH_COLORS.length];
            const motherName = extractMotherName(member);
            const ageText = formatAge(member.birth_year, member.death_year);
            const phone = member.phone as string | undefined;

            // Determine mother color
            let motherColor: typeof BRANCH_COLORS[0] | null = null;
            if (motherName && member.father_id) {
              const siblings = childrenMap.get(member.father_id) || [];
              const motherGroups = new Map<string, number>();
              let ci = 0;
              siblings.forEach((s) => {
                const mn = extractMotherName(s) || "__unknown__";
                if (mn !== "__unknown__" && !motherGroups.has(mn)) {
                  motherGroups.set(mn, ci++);
                }
              });
              const idx = motherGroups.get(motherName);
              if (idx !== undefined) motherColor = BRANCH_COLORS[idx % BRANCH_COLORS.length];
            }

            return (
              <div key={member.id} className="relative flex gap-4 md:gap-5 items-stretch">
                {/* Timeline rail */}
                <div className="flex flex-col items-center shrink-0 w-8 md:w-10">
                  <div
                    className="w-5 h-5 md:w-6 md:h-6 rounded-full z-10 flex items-center justify-center shadow-lg ring-4 ring-background"
                    style={{ backgroundColor: dotColor }}
                  >
                    {isFirst && (
                      <div className="w-2 h-2 rounded-full bg-background" />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className="w-0.5 flex-1 min-h-[1.5rem]"
                      style={{
                        background: `linear-gradient(to bottom, ${dotColor}, ${DEPTH_COLORS[(index + 1) % DEPTH_COLORS.length]})`,
                      }}
                    />
                  )}
                </div>

                {/* Card */}
                <div
                  className={`
                    flex-1 mb-5 md:mb-6 rounded-2xl border transition-all duration-300 cursor-pointer
                    backdrop-blur-sm active:scale-[0.98] overflow-hidden min-w-0
                    ${isFirst
                      ? "bg-accent/10 border-accent/30 shadow-lg"
                      : "bg-card/80 border-border/50 hover:border-primary/30 hover:shadow-md shadow-sm"
                    }
                  `}
                  onClick={() => onSelectMember?.(member.id)}
                  style={{
                    opacity: 0,
                    animation: `fade-in 0.5s ease-out ${index * 0.08}s forwards`,
                    borderRightWidth: isFirst ? "3px" : undefined,
                    borderRightColor: isFirst ? dotColor : undefined,
                  }}
                >
                  <div className="px-3 pt-3 md:px-5 md:pt-4">
                    <div className="flex items-start gap-2.5 md:gap-3">
                      <div
                        className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isMale ? "bg-male-light" : "bg-female-light"
                        }`}
                      >
                        <User
                          className={`h-4 w-4 md:h-5 md:w-5 ${
                            isMale ? "text-male" : "text-female"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm md:text-lg font-bold text-foreground leading-snug break-words">
                          {member.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${isMale ? "bg-male" : "bg-female"}`} />
                          <p className="text-xs text-muted-foreground">
                            {isMale ? "ذكر" : "أنثى"}
                            {isFirst && " — الشخص المطلوب"}
                            {isLast && " — الجد الأعلى"}
                          </p>
                          {motherName && motherColor && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{ color: motherColor.stroke, backgroundColor: `${motherColor.stroke}15` }}
                            >
                              أم: {motherName}
                            </span>
                          )}
                        </div>
                        {/* Heritage badges */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {isFounder(member) && <HeritageBadge type="founder" />}
                          {isBranchHead(member.id) && <HeritageBadge type="branchHead" />}
                          {isDeceased(member) && <HeritageBadge type="deceased" gender={member.gender as "M" | "F"} />}
                          <HeritageBadge type="generation" generationNum={genNum} />
                        </div>
                      </div>

                      {/* WhatsApp button */}
                      {phone && (
                        <a
                          href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-9 h-9 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/20 transition-colors shrink-0"
                          title="تواصل عبر واتساب"
                        >
                          <WhatsAppIcon className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <div
                        className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor: `${dotColor}20`,
                          color: dotColor,
                        }}
                      >
                        الجيل {toArabicNum(genNum)}
                      </div>
                      {ageText && (
                        <span className="text-xs text-accent font-semibold">{ageText}</span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="px-3 pb-3 pt-2 md:px-5 md:pb-4 space-y-1.5">
                    {(member.birth_year || member.death_year) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {member.birth_year && `${member.birth_year} هـ`}
                          {member.birth_year && member.death_year && " — "}
                          {member.death_year && `${member.death_year} هـ`}
                        </span>
                      </div>
                    )}

                    {member.spouses && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Heart className="h-3.5 w-3.5 shrink-0 mt-0.5 text-female fill-female/30" />
                        <span className="break-words line-clamp-2">الزوجة: {member.spouses}</span>
                      </div>
                    )}

                    {(() => {
                      const children = childrenMap.get(member.id);
                      if (!children || children.length === 0) return null;
                      const chainChildId = index > 0 ? chain[index - 1].id : null;
                      return (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5 shrink-0 mt-1" />
                          <div className="flex flex-wrap gap-1.5">
                            {children.map((child) => {
                              const isInChain = child.id === chainChildId;
                              return (
                                <button
                                  key={child.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectMember?.(child.id);
                                  }}
                                  className={`
                                    rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors min-h-[28px]
                                    ${isInChain
                                      ? "bg-primary/20 text-primary font-bold ring-1 ring-primary/30"
                                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }
                                  `}
                                >
                                  {child.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {!isFirst && onSelectMember && (
                    <div className="border-t border-border/30 px-3 py-2 md:px-5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMember(member.id);
                        }}
                        className="flex items-center gap-1.5 text-xs text-primary font-medium hover:text-primary/80 transition-colors min-h-[36px]"
                      >
                        <ArrowUp className="h-3 w-3" />
                        عرض نسب هذا الشخص
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
