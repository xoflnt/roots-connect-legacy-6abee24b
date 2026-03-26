import { useMemo, useCallback } from "react";
import { getFirstName } from "@/utils/nameUtils";
import { motion } from "framer-motion";
import { User, Calendar, Heart, ArrowUp, Users, Share2, Check, Download, UserPlus, Link as LinkIcon, ImageIcon, Loader2 } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { downloadVCard } from "@/utils/vcard";
import { useState } from "react";
import { type FamilyMember } from "@/data/familyData";
import { getAllMembers, inferMotherName, sortByBirth } from "@/services/familyService";
import { BRANCH_COLORS } from "@/hooks/useTreeLayout";
import { HeritageBadge } from "./HeritageBadge";
import { isFounder, isBranchHead, isDeceased } from "@/services/familyService";
import { generateLineageImage } from "./LineageShareCard";
import { formatAge } from "@/utils/ageCalculator";
import { getBranch, getBranchStyle, DOCUMENTER_ID } from "@/utils/branchUtils";
import { springConfig } from "@/lib/animations";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { canSeeAge, canSeeSpouses, canSeeMotherName, getSpouseLabel, privateLabel } from "@/utils/privacyUtils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface LineageViewProps {
  memberId: string;
  onSelectMember?: (memberId: string) => void;
}

const DEPTH_COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--primary))",
  "hsl(340, 60%, 55%)",
  "hsl(35, 70%, 50%)",
  "hsl(175, 50%, 45%)",
  "hsl(270, 50%, 60%)",
];

function toArabicNum(n: number): string {
  return n.toLocaleString("ar-SA");
}

export function LineageView({ memberId, onSelectMember }: LineageViewProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const isMobile = useIsMobile();
  const { currentUser } = useAuth();
  const isLoggedIn = !!currentUser;

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
    cMap.forEach((children, key) => cMap.set(key, sortByBirth(children)));

    return { chain: result, childrenMap: cMap };
  }, [memberId]);

  const shareUrl = `${window.location.origin}/person/${memberId}`;

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({ title: `نسب ${chain[0]?.name} — بوابة الخنيني`, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [shareUrl, chain]);

  const handleDownloadCard = useCallback(async () => {
    if (chain.length === 0) return;
    setDownloading(true);
    try {
      const blob = await generateLineageImage(chain, shareUrl, isLoggedIn);
      const firstName = chain[0].name.split(" ")[0];
      const file = new File([blob], `نسب-${firstName}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `نسب ${firstName}`,
          text: `سلسلة نسب ${chain[0].name} — بوابة تراث الخنيني`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `نسب-${firstName}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Share error:", err);
    } finally {
      setDownloading(false);
    }
  }, [chain, shareUrl]);

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
            نـسـب {chain[0].name}
          </h2>
          <p className="text-muted-foreground text-sm">
            من {chain[0].name} إلى الجد الأعلى — {toArabicNum(chain.length)} أجيال
          </p>
          {/* Share button */}
          <div className="relative flex items-center justify-center mt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowShareOptions(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-bold min-h-[44px]"
            >
              <Share2 className="h-4 w-4" />
              شارك النسب
            </motion.button>

            {/* Desktop dropdown */}
            {!isMobile && showShareOptions && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowShareOptions(false)} />
                <div className="absolute top-full mt-2 z-50 w-72 rounded-2xl border border-border bg-popover shadow-xl p-3 space-y-2" dir="rtl">
                  <p className="text-xs text-muted-foreground font-medium px-1">كيف تبي تشارك؟</p>
                  <button
                    onClick={() => { handleShare(); setShowShareOptions(false); }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-muted transition-colors text-right w-full"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <LinkIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">شارك كرابط 🔗</p>
                      <p className="text-xs text-muted-foreground">انسخ الرابط أو شاركه مباشرة</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { handleDownloadCard(); setShowShareOptions(false); }}
                    disabled={downloading}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-muted transition-colors text-right w-full disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      {downloading ? <Loader2 className="h-5 w-5 text-accent animate-spin" /> : <ImageIcon className="h-5 w-5 text-accent" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">شارك كصورة 🖼️</p>
                      <p className="text-xs text-muted-foreground">ولّد بطاقة جميلة وشاركها</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile bottom sheet */}
          <Sheet open={isMobile && showShareOptions} onOpenChange={setShowShareOptions}>
            <SheetContent side="bottom" className="rounded-t-2xl" dir="rtl">
              <SheetHeader>
                <SheetTitle className="text-sm text-muted-foreground font-medium">كيف تبي تشارك؟</SheetTitle>
              </SheetHeader>
              <div className="space-y-2 py-4">
                <button
                  onClick={() => { handleShare(); setShowShareOptions(false); }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-muted transition-colors text-right w-full"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <LinkIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">شارك كرابط 🔗</p>
                    <p className="text-xs text-muted-foreground">انسخ الرابط أو شاركه مباشرة</p>
                  </div>
                </button>
                <button
                  onClick={() => { handleDownloadCard(); setShowShareOptions(false); }}
                  disabled={downloading}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-muted transition-colors text-right w-full disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    {downloading ? <Loader2 className="h-5 w-5 text-accent animate-spin" /> : <ImageIcon className="h-5 w-5 text-accent" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">شارك كصورة 🖼️</p>
                    <p className="text-xs text-muted-foreground">ولّد بطاقة جميلة وشاركها</p>
                  </div>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Timeline */}
        <div className="relative">
          {chain.map((member, index) => {
            const isFirst = index === 0;
            const isLast = index === chain.length - 1;
            const isMale = member.gender === "M";
            const genNum = index + 1;
            const dotColor = DEPTH_COLORS[index % DEPTH_COLORS.length];
            const motherName = inferMotherName(member);
            const ageText = formatAge(member.birth_year, member.death_year);
            const phone = member.phone as string | undefined;

            // Determine mother color
            let motherColor: typeof BRANCH_COLORS[0] | null = null;
            if (motherName && member.father_id) {
              const siblings = childrenMap.get(member.father_id) || [];
              const motherGroups = new Map<string, number>();
              let ci = 0;
              siblings.forEach((s) => {
                const mn = inferMotherName(s) || "__unknown__";
                if (mn !== "__unknown__" && !motherGroups.has(mn)) {
                  motherGroups.set(mn, ci++);
                }
              });
              const idx = motherGroups.get(motherName);
              if (idx !== undefined) motherColor = BRANCH_COLORS[idx % BRANCH_COLORS.length];
            }

            return (
              <motion.div
                key={member.id}
                className="relative flex gap-4 md:gap-5 items-stretch"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3, ease: "easeOut" }}
              >
                {/* Timeline rail */}
                <div className="flex flex-col items-center shrink-0 w-8 md:w-10">
                  <motion.div
                    className="w-5 h-5 md:w-6 md:h-6 rounded-full z-10 flex items-center justify-center shadow-lg ring-4 ring-background"
                    style={{ backgroundColor: dotColor }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...springConfig, delay: index * 0.08 }}
                  >
                    {isFirst && (
                      <div className="w-2 h-2 rounded-full bg-background" />
                    )}
                  </motion.div>
                  {!isLast && (
                    <motion.div
                      className="w-0.5 flex-1 min-h-[1.5rem]"
                      style={{
                        background: `linear-gradient(to bottom, ${dotColor}, ${DEPTH_COLORS[(index + 1) % DEPTH_COLORS.length]})`,
                      }}
                      initial={{ scaleY: 0, originY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.08 + 0.1 }}
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
                            canSeeMotherName(member.id, isLoggedIn) ? (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                                style={{ color: motherColor.stroke, backgroundColor: `${motherColor.stroke}15` }}
                              >
                                {isMale ? "والدته" : "والدتها"}: {motherName}
                              </span>
                            ) : (
                              <span className="text-[10px] italic text-muted-foreground">{privateLabel('الوالدة')}</span>
                            )
                          )}
                        </div>
                        {/* Heritage badges */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(() => {
                            const br = getBranch(member.id);
                            const bs = br ? getBranchStyle(br.pillarId) : null;
                            return br && bs ? (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: bs.bg, color: bs.text }}>
                                {br.label}
                              </span>
                            ) : null;
                          })()}
                          {isFounder(member) && <HeritageBadge type="founder" />}
                          {isBranchHead(member.id) && <HeritageBadge type="branchHead" />}
                          {isDeceased(member) && <HeritageBadge type="deceased" gender={member.gender as "M" | "F"} />}
                          <HeritageBadge type="generation" generationNum={genNum} />
                          {member.id === DOCUMENTER_ID && <HeritageBadge type="documenter" />}
                        </div>
                      </div>

                      {/* WhatsApp + Save contact */}
                      {phone && (
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-9 h-9 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                            title="تواصل عبر واتساب"
                          >
                            <WhatsAppIcon className="h-4 w-4" />
                          </a>
                          <button
                            onClick={(e) => { e.stopPropagation(); downloadVCard(member.name, phone); }}
                            className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                            title="حفظ جهة اتصال"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {ageText && (
                        canSeeAge(member.id, isLoggedIn) ? (
                          <span className="text-xs text-accent font-semibold">{ageText}</span>
                        ) : (
                          <span className="text-[10px] italic text-muted-foreground">{privateLabel('العمر')}</span>
                        )
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
                        {canSeeSpouses(member.id, isLoggedIn) ? (
                          <span className="break-words line-clamp-2">
                            {isMale
                              ? (member.spouses!.includes("،") ? "الزوجات: " : "الزوجة: ")
                              : "الزوج: "
                            }
                            {member.spouses}
                          </span>
                        ) : (
                          <span className="text-xs italic text-muted-foreground">{privateLabel('الزوجة')}</span>
                        )}
                      </div>
                    )}

                    {(() => {
                      const children = childrenMap.get(member.id);
                      if (!children || children.length === 0) return null;
                      const chainChildId = index > 0 ? chain[index - 1].id : null;

                      // Group children by mother
                      const groups = new Map<string, { children: FamilyMember[]; colorIndex: number }>();
                      let ci = 0;
                      children.forEach((child) => {
                        const mn = inferMotherName(child) || "__unknown__";
                        if (!groups.has(mn)) {
                          groups.set(mn, { children: [], colorIndex: mn !== "__unknown__" ? ci++ : -1 });
                        }
                        groups.get(mn)!.children.push(child);
                      });

                      return (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5 shrink-0 mt-1" />
                          <div className="space-y-1.5 flex-1">
                            {Array.from(groups.entries()).map(([motherKey, group]) => {
                              const color = group.colorIndex >= 0 ? BRANCH_COLORS[group.colorIndex % BRANCH_COLORS.length] : null;
                              return (
                                <div key={motherKey}>
                                {motherKey !== "__unknown__" && color && (
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color.stroke }} />
                                      <span className="text-[10px] font-semibold" style={{ color: color.stroke }}>
                                        أبناء {isLoggedIn ? motherKey : getSpouseLabel(motherKey, Array.from(groups.keys()).filter(k => k !== "__unknown__").indexOf(motherKey), isLoggedIn)}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex flex-wrap gap-1.5">
                                    {group.children.map((child) => {
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
                                          style={color && !isInChain ? { borderLeft: `3px solid ${color.stroke}` } : undefined}
                                        >
                                          {getFirstName(child.name)}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
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
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
