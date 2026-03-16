import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Heart, FileText, X, ExternalLink, Clock, Send, Users2, UserPlus, BadgeCheck } from "lucide-react";
import { downloadVCard } from "@/utils/vcard";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { FamilyMember } from "@/data/familyData";
import { useNavigate } from "react-router-dom";
import { formatAge } from "@/utils/ageCalculator";
import { inferMotherName, getChildrenOf, sortByBirth } from "@/services/familyService";
import { BRANCH_COLORS } from "@/hooks/useTreeLayout";
import { SubmitRequestForm } from "@/components/SubmitRequestForm";
import { getBranch, getBranchStyle, DOCUMENTER_ID } from "@/utils/branchUtils";
import { HeritageBadge } from "@/components/HeritageBadge";
import { getVerifiedMemberIds } from "@/services/dataService";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { staggerContainer, staggerItem, springConfig } from "@/lib/animations";
import { useAuth } from "@/contexts/AuthContext";
import { canSeeAge, canSeeSpouses, canSeeMotherName, getSpouseLabel, privateLabel } from "@/utils/privacyUtils";

interface PersonDetailsProps {
  member: FamilyMember | null;
  onClose: () => void;
}

function DetailContent({ member }: { member: FamilyMember }) {
  const navigate = useNavigate();
  const isMale = member.gender === "M";
  const [requestOpen, setRequestOpen] = useState(false);
  const { currentUser } = useAuth();
  const isLoggedIn = !!currentUser;

  const ageText = formatAge(member.birth_year, member.death_year);
  const showAge = canSeeAge(member.id, isLoggedIn);
  const showSpouses = canSeeSpouses(member.id, isLoggedIn);
  const motherName = inferMotherName(member);
  const phone = member.phone as string | undefined;
  const isVerified = getVerifiedMemberIds().has(member.id);
  const children = sortByBirth(getChildrenOf(member.id));

  // Group children by mother with colors
  const groupedChildren = useMemo(() => {
    if (children.length === 0) return [];
    const groups = new Map<string, { children: FamilyMember[]; colorIndex: number }>();
    let ci = 0;
    children.forEach((child) => {
      const mn = inferMotherName(child) || "__unknown__";
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

  const ageLabelEl = (
    <span className="text-xs italic text-muted-foreground">{privateLabel('العمر')}</span>
  );
  const motherLabelEl = (
    <span className="text-xs italic text-muted-foreground">{privateLabel('الوالدة')}</span>
  );
  const spouseLabelEl = (
    <span className="text-xs italic text-muted-foreground">{privateLabel('الزوجة')}</span>
  );

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
          <div className="flex items-center justify-center gap-1.5">
            <h3 className="text-xl font-extrabold text-foreground">{member.name}</h3>
            {isVerified && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <BadgeCheck className="h-5 w-5 shrink-0 text-[#22c55e]" />
                  </TooltipTrigger>
                  <TooltipContent side="top"><span>حساب موثق</span></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <span
            className={`inline-block mt-1.5 text-xs font-bold px-3 py-1 rounded-full ${
              isMale
                ? "bg-[hsl(var(--male-light))] text-[hsl(var(--male))]"
                : "bg-[hsl(var(--female-light))] text-[hsl(var(--female))]"
            }`}
          >
           {isMale ? "ذكر" : "أنثى"}
          </span>
          {member.id === DOCUMENTER_ID && (
            <div className="mt-1.5"><HeritageBadge type="documenter" /></div>
          )}
          {(() => {
            const br = getBranch(member.id);
            const bs = br ? getBranchStyle(br.pillarId) : null;
            return br && bs ? (
              <span className="inline-block mt-1.5 text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: bs.bg, color: bs.text }}>
                {br.label}
              </span>
            ) : null;
          })()}
        </div>
      </div>

      {/* Info cards */}
      <motion.div
        className="space-y-2.5"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {ageText && (
          <motion.div variants={staggerItem} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20">
            <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">العمر</p>
              {showAge ? (
                <p className="text-sm font-bold text-foreground">{ageText}</p>
              ) : (
                privateLabelEl
              )}
            </div>
          </motion.div>
        )}

        {motherName && (
          <motion.div variants={staggerItem} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border/30">
            <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
              <Users2 className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">الوالدة</p>
              {canSeeMotherName(member.id, isLoggedIn) ? (
                <p className="text-sm font-bold text-foreground">{motherName}</p>
              ) : (
                privateLabelEl
              )}
            </div>
          </motion.div>
        )}

        {member.birth_year && (
          <motion.div variants={staggerItem} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border/30">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">سنة الميلاد</p>
              <p className="text-sm font-bold text-foreground">{member.birth_year} هـ</p>
            </div>
          </motion.div>
        )}

        {member.death_year && (
          <motion.div variants={staggerItem} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border/30">
            <div className="w-9 h-9 rounded-lg bg-muted-foreground/10 flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">سنة الوفاة</p>
              <p className="text-sm font-bold text-foreground">{member.death_year} هـ</p>
            </div>
          </motion.div>
        )}

        {/* Phone + WhatsApp */}
        {phone && (
          <motion.a
            variants={staggerItem}
            href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/15 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-[#25D366]/15 flex items-center justify-center shrink-0">
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">تواصل عبر واتساب</p>
              <p className="text-sm font-bold text-foreground" dir="ltr">{phone}</p>
            </div>
          </motion.a>
        )}

        {/* Save contact button */}
        {phone && (
          <motion.button
            variants={staggerItem}
            onClick={() => downloadVCard(member.name, phone)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors w-full text-right"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <UserPlus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">حفظ في جهات الاتصال</p>
              <p className="text-sm font-bold text-foreground">{member.name}</p>
            </div>
          </motion.button>
        )}

        {/* Spouses with colors */}
        {spouseList.length > 0 && (
          <motion.div variants={staggerItem} className="px-4 py-3 rounded-xl bg-muted/50 border border-border/30 space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-accent shrink-0" />
              <p className="text-[11px] text-muted-foreground font-medium">
                {isMale ? (spouseList.length > 1 ? "الزوجات" : "الزوجة") : "الزوج"}
              </p>
            </div>
            {showSpouses ? (
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
            ) : (
              privateLabelEl
            )}
          </motion.div>
        )}

        {/* Children grouped by mother */}
        {groupedChildren.length > 0 && (
          <motion.div variants={staggerItem} className="px-4 py-3 rounded-xl bg-muted/50 border border-border/30 space-y-2">
            <p className="text-[11px] text-muted-foreground font-medium">الأبناء ({children.length})</p>
            {groupedChildren.map(([motherKey, group], groupIndex) => {
              const color = group.colorIndex >= 0 ? BRANCH_COLORS[group.colorIndex % BRANCH_COLORS.length] : null;
              const showMotherName = motherKey !== "__unknown__" && color;
              // Determine the header label
              let headerLabel: string | null = null;
              if (showMotherName) {
                if (groupedChildren.length === 1 && !isLoggedIn) {
                  // Single wife, guest → just "الأبناء" (already shown above)
                  headerLabel = null;
                } else {
                  const displayName = isLoggedIn ? motherKey : getSpouseLabel(motherKey, groupIndex, isLoggedIn);
                  headerLabel = `أبناء ${displayName}`;
                }
              }
              return (
                <div key={motherKey}>
                  {headerLabel && color && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color.stroke }} />
                      <span className="text-[10px] font-semibold" style={{ color: color.stroke }}>
                        {headerLabel}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {group.children.map((child, i) => (
                      <motion.button
                        key={child.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ ...springConfig, delay: i * 0.03 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/person/${child.id}`)}
                        className="text-xs font-medium px-2.5 py-1 rounded-full transition-colors min-h-[28px] bg-muted text-foreground hover:bg-muted/80"
                        style={color ? { borderLeft: `3px solid ${color.stroke}` } : undefined}
                      >
                        {child.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {member.notes && (
          <motion.div variants={staggerItem} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border/30">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">ملاحظات</p>
              <p className="text-sm text-foreground leading-relaxed">{member.notes}</p>
            </div>
          </motion.div>
        )}
      </motion.div>

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
        <DrawerContent className="px-5 pt-2 flex flex-col" style={{ maxHeight: '92dvh' }}>
          <DrawerHeader className="p-0 mb-2">
            <DrawerTitle className="sr-only">{member.name}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto flex-1 pb-[calc(env(safe-area-inset-bottom)+24px)]">
            <DetailContent member={member} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={!!member} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[360px] sm:w-[400px] max-h-[92dvh] border-r-0 shadow-2xl overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <SheetHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pt-4 pb-2 -mx-6 px-6">
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
        <DetailContent member={member} />
      </SheetContent>
    </Sheet>
  );
}
