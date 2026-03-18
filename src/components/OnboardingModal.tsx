import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  TreePine, Search, UserCheck, Phone, CalendarDays, ChevronLeft, ChevronDown,
  Loader2, UserCircle, Users2, Heart, UserPlus, GitBranch, Edit3, BadgeCheck,
  Info, Lock, Shield, Sparkles,
} from "lucide-react";
import type { FamilyMember } from "@/data/familyData";
import { getAllMembers, searchMembers, getChildrenOf } from "@/services/familyService";
import { useAuth } from "@/contexts/AuthContext";
import { HijriDatePicker } from "@/components/HijriDatePicker";
import { registerVerifiedUser, submitRequest, getVerifiedMemberIds, verifyFamilyPasscode } from "@/services/dataService";
import { getLineageLabel } from "@/utils/memberLabel";
import { getBranch } from "@/utils/branchUtils";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const TOTAL_STEPS = 5;

function getMemberMap() {
  return new Map(getAllMembers().map((m) => [m.id, m]));
}

function getFatherName(member: FamilyMember): string | null {
  if (!member.father_id) return null;
  return getMemberMap().get(member.father_id)?.name ?? null;
}

function getDisplayLabel(member: FamilyMember): string {
  const father = getFatherName(member);
  return father ? `${member.name} (ابن ${father})` : member.name;
}

/* ─── Progress Dots ─── */
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === current;
        return (
          <motion.div
            key={i}
            layout
            className={
              isActive
                ? "h-2.5 w-7 rounded-full bg-accent"
                : "h-2.5 w-2.5 rounded-full bg-muted-foreground/25"
            }
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        );
      })}
    </div>
  );
}

/* ─── Hero Card ─── */
function HeroCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-32 h-32 rounded-3xl bg-card shadow-lg flex items-center justify-center mx-auto ${className}`}>
      {children}
    </div>
  );
}

/* ─── Slide variants ─── */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

interface OnboardingModalProps {
  forceOpen?: boolean;
}

export function OnboardingModal({ forceOpen }: OnboardingModalProps) {
  const { isLoggedIn, currentUser, login } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();

  // Search & claim
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Phone
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [passcodeVerifying, setPasscodeVerifying] = useState(false);
  const [passcodeError, setPasscodeError] = useState(false);

  // Passcode
  const [familyPasscode, setFamilyPasscode] = useState("");

  // Hijri Date + Quick Update
  const [hijriDate, setHijriDate] = useState<{ day?: string; month?: string; year?: string }>({});
  const [quickUpdateOpen, setQuickUpdateOpen] = useState(false);
  const [quickUpdateText, setQuickUpdateText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preFilledBanner, setPreFilledBanner] = useState(false);

  // Children dates
  const [childrenDates, setChildrenDates] = useState<Record<string, { day?: string; month?: string; year?: string }>>({});

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (forceOpen) { setOpen(true); return; }
    if (!sessionStorage.getItem("onboarding-dismissed")) {
      setOpen(true);
    }
  }, [forceOpen]);

  const filtered = useMemo(() => {
    return searchMembers(searchQuery, 15);
  }, [searchQuery]);

  const handleSkip = () => {
    sessionStorage.setItem("onboarding-dismissed", "true");
    setOpen(false);
  };

  const goTo = (nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  // Pre-fill birth date (step 5 = old step 6)
  useEffect(() => {
    if (step === 5 && selectedMember) {
      const verifiedIds = getVerifiedMemberIds();
      const isAlreadyVerified = verifiedIds.has(selectedMember.id);
      if (!isAlreadyVerified && selectedMember.birth_year) {
        const parts = selectedMember.birth_year.split("/");
        const parsed: { day?: string; month?: string; year?: string } = { year: parts[0] };
        if (parts[1]) parsed.month = parts[1];
        if (parts[2]) parsed.day = parts[2];
        setHijriDate(parsed);
        setPreFilledBanner(true);
      }

      const children = getChildrenOf(selectedMember.id);
      const initial: Record<string, { day?: string; month?: string; year?: string }> = {};
      for (const child of children) {
        if (child.birth_year) {
          const p = child.birth_year.split("/");
          initial[child.id] = { year: p[0], month: p[1], day: p[2] };
        }
      }
      setChildrenDates(initial);
    }
  }, [step, selectedMember]);

  const handlePhoneContinue = () => {
    if (phone.length < 9) {
      toast.error("الرجاء إدخال رقم جوال صحيح");
      return;
    }
    goTo(5);
  };

  const handleComplete = async () => {
    if (!selectedMember || isSubmitting || !hijriDate.year) return;
    setIsSubmitting(true);
    try {
      const dateStr = hijriDate.year
        ? `${hijriDate.year}/${hijriDate.month || "1"}/${hijriDate.day || "1"}`
        : undefined;

      const { updateMember } = await import("@/services/dataService");
      const memberUpdates: Record<string, string> = { phone: `+966${phone}` };
      if (dateStr) {
        memberUpdates.birth_year = dateStr;
      }
      await updateMember(selectedMember.id, memberUpdates);
      await registerVerifiedUser({
        memberId: selectedMember.id,
        memberName: selectedMember.name,
        phone: `+966${phone}`,
        hijriBirthDate: dateStr,
      });

      const verifiedIds = getVerifiedMemberIds();
      for (const [childId, cDate] of Object.entries(childrenDates)) {
        if (cDate.year && !verifiedIds.has(childId)) {
          const childDateStr = `${cDate.year}/${cDate.month || "1"}/${cDate.day || "1"}`;
          await updateMember(childId, { birth_year: childDateStr });
        }
      }

      if (quickUpdateText.trim()) {
        await submitRequest({
          type: "other",
          targetMemberId: selectedMember.id,
          data: { text_content: quickUpdateText.trim() },
          submittedBy: selectedMember.name,
        });
        toast.success("تم إرسال طلب التحديث للمراجعة");
      }

      const { refreshMembers } = await import("@/services/familyService");
      await refreshMembers();
      window.dispatchEvent(new Event("family-data-updated"));

      login({
        memberId: selectedMember.id,
        memberName: selectedMember.name,
        phone: `+966${phone}`,
        hijriBirthDate: dateStr,
      });
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSubmitting(false);
    }
    setOpen(false);
  };

  // Family context data
  const familyContext = useMemo(() => {
    if (!selectedMember) return null;
    const allMembers = getAllMembers();
    const siblings = selectedMember.father_id
      ? allMembers.filter((m) => m.father_id === selectedMember.father_id && m.id !== selectedMember.id)
      : [];
    const spouses = selectedMember.spouses
      ? selectedMember.spouses.split("،").map((s) => s.trim()).filter(Boolean)
      : [];
    const children = getChildrenOf(selectedMember.id);
    const branch = getBranch(selectedMember.id);
    const fatherName = getFatherName(selectedMember);
    return { siblings, spouses, children, branch, fatherName };
  }, [selectedMember]);

  // ─── Logged-in user: Welcome back ───
  if (isLoggedIn && currentUser) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md w-[95vw] p-0 gap-0 rounded-3xl overflow-hidden border-border/50 bg-card">
          <DialogTitle className="sr-only">مرحباً بعودتك</DialogTitle>
          <DialogDescription className="sr-only">نافذة الترحيب بالمستخدم المسجل</DialogDescription>
          <div className="px-5 py-8 flex flex-col items-center text-center gap-5 max-h-[85vh] overflow-y-auto" dir="rtl">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
              <TreePine className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">أهلاً بعودتك، {currentUser.memberName}</h2>
              <p className="text-sm text-muted-foreground">سعداء برجوعك لبوابة تراث الخنيني</p>
            </div>
            <div className="w-full space-y-2">
              <p className="text-xs font-bold text-muted-foreground">دليل سريع</p>
              {[
                { icon: TreePine, title: "تصفح الشجرة", desc: "استكشف فروع العائلة بشكل تفاعلي وتوسّع في الفروع" },
                { icon: Search, title: "البحث السريع", desc: "ابحث عن أي فرد بالاسم واعرض نسبه الكامل" },
                { icon: UserCircle, title: "ملفك الشخصي", desc: "عدّل بياناتك وأضف الزوجات والأبناء مباشرة" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 p-3 rounded-2xl bg-muted/50 border border-border/30 text-right">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => { setOpen(false); navigate("/guide"); }} className="w-full text-xs text-primary">
                دليل الاستخدام الكامل ←
              </Button>
            </div>
            <div className="flex flex-col w-full gap-2">
              <Button onClick={() => setOpen(false)} className="min-h-[52px] w-full text-base font-semibold rounded-full">
                <TreePine className="h-5 w-5 ml-2" />
                تصفح الشجرة
              </Button>
              <Button variant="outline" onClick={() => { setOpen(false); navigate("/profile"); }} className="min-h-[52px] w-full text-base rounded-full">
                <UserCircle className="h-5 w-5 ml-2" />
                الملف الشخصي
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!open) return null;

  // ─── Non-logged-in: Full-screen registration flow ───
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      dir="rtl"
      style={{
        backgroundColor: "hsl(var(--background))",
        backgroundImage: "radial-gradient(rgba(118,90,0,0.08) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Skip button */}
      <div className="flex justify-between items-center px-5 pt-5 pb-2">
        {step > 1 ? (
          <button onClick={() => goTo(step - 1)} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 min-h-[44px]">
            <ChevronLeft className="h-4 w-4" /> رجوع
          </button>
        ) : <div />}
        <button onClick={handleSkip} className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
          تخطى ←
        </button>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-5">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center h-full"
          >
            {/* ═══ STEP 1: WELCOME ═══ */}
            {step === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 w-full max-w-md mx-auto relative">
                {/* Decorative sparkles */}
                <div className="absolute top-4 left-8 text-accent/60 text-lg">✦</div>
                <div className="absolute top-16 right-4 text-accent/40 text-sm">✦</div>
                <div className="absolute bottom-40 left-4 text-accent/50 text-base">✦</div>

                {/* Hero card */}
                <div className="relative">
                  <HeroCard className="w-48 h-48">
                    <TreePine className="h-20 w-20 text-primary" />
                  </HeroCard>
                  <div className="absolute -top-2 -right-2 text-accent/60 text-xl">✦</div>
                  <div className="absolute -bottom-1 -left-3 text-accent/40 text-base">✦</div>
                </div>

                <div className="mt-6 space-y-3">
                  <h1 className="text-[28px] font-[800] text-primary leading-tight">
                    أهلاً بك في بوابة تراث الخنيني
                  </h1>
                  <p className="text-base font-semibold text-accent">
                    فرع الزلفي — توثيق الإرث عبر الأجيال
                  </p>
                  <p className="text-sm text-muted-foreground leading-[1.8] max-w-[320px] mx-auto">
                    نرحب بك في المنصة الرقمية الرسمية لعائلة الخنيني، حيث يلتقي التراث بالتقنية لربط الأجيال وتوثيق شجرة العائلة
                  </p>
                </div>

                <div className="w-full space-y-3 mt-4">
                  <Button
                    onClick={() => goTo(2)}
                    className="min-h-[56px] w-full text-lg font-bold rounded-full shadow-[0_8px_24px_hsl(var(--primary)/0.3)]"
                  >
                    ابدأ رحلتك ←
                  </Button>
                  <button onClick={handleSkip} className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
                    تصفح كزائر 👁
                  </button>
                </div>

                {/* Background decorative tree */}
                <TreePine className="absolute bottom-0 left-0 h-40 w-40 text-primary/[0.08] -translate-x-1/4 translate-y-1/4" />
              </div>
            )}

            {/* ═══ STEP 2: SEARCH ═══ */}
            {step === 2 && (
              <div className="flex-1 flex flex-col gap-4 w-full max-w-md mx-auto py-4">
                {!confirmed ? (
                  <>
                    {!selectedMember ? (
                      <>
                        <div className="text-right space-y-2">
                          <h1 className="text-[32px] font-bold text-primary leading-[1.3]">
                            ابحث عن اسمك في الشجرة
                          </h1>
                          <p className="text-sm text-muted-foreground">
                            اكتب اسمك الأول للبحث في سجلات العائلة
                          </p>
                        </div>

                        {/* Search input */}
                        <div className="relative">
                          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                          <Input
                            ref={searchInputRef}
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setSelectedMember(null); }}
                            placeholder="مثلاً: عبدالله..."
                            className="min-h-[56px] pr-12 text-base rounded-2xl border-border bg-card shadow-md"
                            autoFocus
                          />
                        </div>

                        {/* Results */}
                        {searchQuery.trim() && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-accent">النتائج المحتملة</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold">
                                {filtered.length}
                              </span>
                            </div>
                            <div className="space-y-2 max-h-[240px] overflow-y-auto">
                              {filtered.length === 0 ? (
                                <p className="p-4 text-center text-sm text-muted-foreground">لم يتم العثور على نتائج</p>
                              ) : (
                                filtered.map((m) => {
                                  const branch = getBranch(m.id);
                                  return (
                                    <button
                                      key={m.id}
                                      onClick={() => { setSelectedMember(m); setSearchQuery(""); }}
                                      className="w-full text-right p-4 flex items-center gap-3 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 active:bg-muted transition-all min-h-[56px]"
                                    >
                                      <div className="flex-1">
                                        <span className="text-base font-bold text-foreground block">{getLineageLabel(m)}</span>
                                        {branch && (
                                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                          <span className="w-2 h-2 rounded-full bg-primary" />
                                            {branch.label}
                                          </span>
                                        )}
                                      </div>
                                      <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0" />
                                    </button>
                                  );
                                })
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground text-center italic">
                              هل لم تجد اسمك؟ تأكد من كتابة الاسم كما هو في الهوية الوطنية
                            </p>
                          </div>
                        )}

                        {!searchQuery.trim() && (
                          <div className="mt-auto pt-4">
                            <button onClick={handleSkip} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
                              تخطى هذه الخطوة
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Confirm identity */
                      <div className="flex-1 flex flex-col items-center justify-center gap-5">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCheck className="h-10 w-10 text-primary" />
                        </div>
                        <p className="text-lg font-semibold text-foreground text-center">
                          هل أنت <span className="text-primary font-bold">{getDisplayLabel(selectedMember)}</span>؟
                        </p>
                        <div className="flex gap-3 w-full">
                          <Button onClick={() => { setConfirmed(true); goTo(3); }} className="min-h-[56px] flex-1 text-base font-bold rounded-full">
                            نعم، هذا أنا
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => { setSelectedMember(null); setSearchQuery(""); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                            className="min-h-[56px] flex-1 text-base rounded-full"
                          >
                            لا، عودة للبحث
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}

            {/* ═══ STEP 3: FAMILY CODE ═══ */}
            {step === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 w-full max-w-md mx-auto">
                <HeroCard>
                  <Shield className="h-14 w-14 text-accent" />
                </HeroCard>

                <div className="space-y-3 mt-4">
                  <h1 className="text-[30px] font-bold text-primary">تحقق من هويتك</h1>
                  <p className="text-sm text-muted-foreground leading-[1.8] max-w-[300px] mx-auto">
                    أدخل رمز العائلة المكون من ٦ أرقام للتحقق من انتمائك وحماية خصوصية بيانات العائلة
                  </p>
                </div>

                <div className="flex justify-center" dir="ltr">
                  <InputOTP
                    maxLength={6}
                    value={familyPasscode}
                    onChange={(v) => { setFamilyPasscode(v); setPasscodeError(false); }}
                  >
                    <InputOTPGroup className="gap-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className={`w-[52px] h-[60px] text-xl font-bold rounded-xl border-border text-primary ${
                            passcodeError ? "border-destructive ring-destructive" : ""
                          }`}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {passcodeError && (
                  <p className="text-sm text-destructive font-medium">! رمز غير صحيح</p>
                )}

                <p className="text-xs text-muted-foreground italic">
                  الرمز متاح من مشرف العائلة (العميد)
                </p>

                <div className="w-full space-y-3">
                  <Button
                    onClick={async () => {
                      setPasscodeVerifying(true);
                      setPasscodeError(false);
                      const valid = await verifyFamilyPasscode(familyPasscode);
                      setPasscodeVerifying(false);
                      if (valid) {
                        goTo(4);
                      } else {
                        setPasscodeError(true);
                      }
                    }}
                    disabled={familyPasscode.length < 6 || passcodeVerifying}
                    className="min-h-[56px] w-full text-base font-bold rounded-full"
                  >
                    {passcodeVerifying ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <Shield className="h-5 w-5 ml-2" />}
                    تأكيد الرمز
                  </Button>
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
                    لم أحصل على الرمز؟ اتصل بالمسؤول
                  </button>
                </div>

                {/* Step indicator */}
                <div className="w-full flex items-center justify-between mt-4 text-xs text-muted-foreground">
                  <span>الخطوة ٣ من ٥</span>
                </div>
              </div>
            )}

            {/* ═══ STEP 4: PHONE ═══ */}
            {step === 4 && (
              <div className="flex-1 flex flex-col items-center gap-5 w-full max-w-md mx-auto py-4">
                {/* Hero */}
                <div className="relative">
                  <HeroCard>
                    <Phone className="h-14 w-14 text-primary" />
                  </HeroCard>
                  <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                </div>

                <div className="space-y-2 text-center mt-2">
                  <h1 className="text-[28px] font-bold text-primary">أضف رقم جوالك</h1>
                  <p className="text-sm text-muted-foreground leading-[1.8] max-w-[300px] mx-auto">
                    نحتاج لرقمك للتحقق من هويتك وتسهيل التواصل مع أبناء العمومة
                  </p>
                </div>

                {/* Phone input */}
                <div className="w-full flex gap-2" dir="ltr">
                  <div className="flex items-center justify-center px-3 min-h-[56px] rounded-xl border border-border bg-card text-sm font-medium text-foreground shrink-0">
                    +966 🇸🇦
                  </div>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    placeholder="5XXXXXXXX"
                    className="min-h-[56px] text-base rounded-xl text-left tracking-wider bg-card border-border flex-1"
                    autoFocus
                  />
                </div>

                {/* Privacy note */}
                <div className="w-full flex items-center gap-3 p-4 rounded-xl bg-muted/60">
                  <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    رقمك للتواصل الأسري فقط ولن يظهر للعامة
                  </p>
                </div>

                {/* WhatsApp toggle (visual only) */}
                <div className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[hsl(142,70%,45%)]/15 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-[hsl(142,70%,45%)]" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">التحقق عبر واتساب</p>
                      <p className="text-xs text-muted-foreground">أسرع وأكثر سهولة</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button
                  onClick={handlePhoneContinue}
                  disabled={phone.length < 9}
                  className="min-h-[56px] w-full text-base font-bold rounded-full mt-auto"
                >
                  إرسال رمز التحقق
                </Button>
              </div>
            )}

            {/* ═══ STEP 5: BIRTH DATE ═══ */}
            {step === 5 && selectedMember && familyContext && (
              <div className="flex-1 flex flex-col gap-4 w-full max-w-md mx-auto py-4 overflow-y-auto">
                {/* Hero */}
                <div className="flex flex-col items-center gap-1">
                  <HeroCard className="w-28 h-28">
                    <div className="flex flex-col items-center gap-1">
                      <CalendarDays className="h-10 w-10 text-accent" />
                      <span className="text-[10px] font-bold text-accent">التاريخ الهجري</span>
                    </div>
                  </HeroCard>
                </div>

                <div className="text-center space-y-2 mt-2">
                  <h1 className="text-[26px] font-bold text-primary">أضف تاريخ ميلادك الهجري</h1>
                  <p className="text-sm text-muted-foreground leading-[1.8] max-w-[300px] mx-auto">
                    اختياري — يساعد في التمييز بين الأسماء المتشابهة وتحديد الأجيال بدقة داخل شجرة العائلة
                  </p>
                </div>

                {/* Pre-filled Banner */}
                {preFilledBanner && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-accent/10 border border-accent/30">
                    <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-accent font-medium leading-relaxed">
                      تم إدخال تاريخ ميلادك مسبقاً. يمكنك تأكيده أو تعديله الآن لتكتمل عملية توثيق حسابك.
                    </p>
                  </div>
                )}

                {/* Hijri Date */}
                <div className="space-y-2">
                  <HijriDatePicker value={hijriDate} onChange={setHijriDate} />
                </div>

                {/* Family summary */}
                {(familyContext.siblings.length > 0 || familyContext.spouses.length > 0 || familyContext.children.length > 0) && (
                  <div className="rounded-2xl border border-border/50 bg-card p-3 space-y-3">
                    <p className="text-xs font-extrabold text-foreground">عائلتك حالياً</p>
                    {familyContext.siblings.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                          <Users2 className="h-3.5 w-3.5" /> الإخوة والأخوات ({familyContext.siblings.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {familyContext.siblings.slice(0, 10).map((s) => (
                            <span key={s.id} className="text-[11px] px-2 py-0.5 rounded-full bg-muted border border-border/40 text-foreground">{s.name.split(" ")[0]}</span>
                          ))}
                          {familyContext.siblings.length > 10 && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{familyContext.siblings.length - 10}</span>
                          )}
                        </div>
                      </div>
                    )}
                    {familyContext.spouses.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                          <Heart className="h-3.5 w-3.5" /> {selectedMember.gender === "M" ? "الزوجات" : "الزوج"}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {familyContext.spouses.map((sp, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">{sp}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {familyContext.children.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                          <UserPlus className="h-3.5 w-3.5" /> الأبناء ({familyContext.children.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {familyContext.children.slice(0, 10).map((c) => (
                            <span key={c.id} className="text-[11px] px-2 py-0.5 rounded-full bg-muted border border-border/40 text-foreground">{c.name.split(" ")[0]}</span>
                          ))}
                          {familyContext.children.length > 10 && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{familyContext.children.length - 10}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Children Dates */}
                {familyContext.children.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-card border border-border/50 hover:bg-muted/50 transition-colors text-right min-h-[48px]">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">تواريخ ميلاد الأبناء</span>
                        <span className="text-[10px] text-muted-foreground">(اختياري)</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-3 px-1">
                      {familyContext.children.map((child) => {
                        const isChildVerified = getVerifiedMemberIds().has(child.id);
                        return (
                          <div key={child.id} className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">{child.name.split(" ")[0]}</span>
                              {isChildVerified && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full bg-green-500/10">
                                  <BadgeCheck className="h-3 w-3" /> تم التوثيق ✅
                                </span>
                              )}
                            </div>
                            {isChildVerified ? (
                              <p className="text-[11px] text-muted-foreground pr-1">{child.birth_year || "—"}</p>
                            ) : (
                              <HijriDatePicker
                                value={childrenDates[child.id] || {}}
                                onChange={(val) => setChildrenDates((prev) => ({ ...prev, [child.id]: val }))}
                              />
                            )}
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Quick Update */}
                <Collapsible open={quickUpdateOpen} onOpenChange={setQuickUpdateOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-card border border-border/50 hover:bg-muted/50 transition-colors text-right min-h-[48px]">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4 text-accent" />
                      <span className="text-sm font-bold text-foreground">هل تود تحديث بياناتك الآن؟</span>
                      <span className="text-[10px] text-muted-foreground">(اختياري)</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${quickUpdateOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-3 px-1">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> تفاصيل التعديل أو الإضافة
                      </label>
                      <Textarea
                        value={quickUpdateText}
                        onChange={(e) => setQuickUpdateText(e.target.value)}
                        placeholder="مثال: رزقت بمولود جديد اسمه فهد، أو أود تعديل تاريخ ميلادي إلى..."
                        className="min-h-[100px] text-sm rounded-xl resize-none leading-relaxed"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Actions */}
                <div className="mt-auto space-y-3 pt-2 pb-4">
                  {!hijriDate.year && (
                    <p className="text-xs text-destructive text-center font-medium">يرجى اختيار سنة الميلاد على الأقل للمتابعة</p>
                  )}
                  <Button
                    type="button"
                    onClick={handleComplete}
                    disabled={isSubmitting || !hijriDate.year}
                    className="min-h-[56px] w-full text-base font-bold rounded-full"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : null}
                    أتم التسجيل ✓
                  </Button>
                  <button onClick={handleSkip} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
                    تخطى هذه الخطوة
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="px-5 pb-6 pt-3">
        <ProgressDots current={step} total={TOTAL_STEPS} />
      </div>
    </div>
  );
}
