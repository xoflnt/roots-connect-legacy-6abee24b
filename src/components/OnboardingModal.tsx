import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";

import {
  TreePine, Search, UserCheck, Phone, CalendarDays, ChevronDown, Loader2,
  UserCircle, Users2, Heart, UserPlus, GitBranch, Edit3, BadgeCheck, Info,
  Lock, Shield,
} from "lucide-react";
import type { FamilyMember } from "@/data/familyData";
import { getAllMembers, searchMembers, getChildrenOf } from "@/services/familyService";
import { useAuth } from "@/contexts/AuthContext";
import { HijriDatePicker } from "@/components/HijriDatePicker";
import { registerVerifiedUser, submitRequest, getVerifiedMemberIds, verifyFamilyPasscode } from "@/services/dataService";
import { getLineageLabel } from "@/utils/memberLabel";
import { getBranch, getBranchStyle } from "@/utils/branchUtils";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

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

interface OnboardingModalProps {
  forceOpen?: boolean;
}

// Slide animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export function OnboardingModal({ forceOpen }: OnboardingModalProps) {
  const { isLoggedIn, currentUser, login } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();

  // Phase A
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Phone number
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [passcodeVerifying, setPasscodeVerifying] = useState(false);

  // Family passcode
  const [familyPasscode, setFamilyPasscode] = useState("");

  // Phase D — Hijri Date + Quick Update
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

  const goToStep = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  // Pre-fill birth date
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
    goToStep(5);
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
        <DialogContent className="max-w-md w-[95vw] p-0 gap-0 rounded-2xl overflow-hidden border-border/50 bg-card">
          <DialogTitle className="sr-only">مرحباً بعودتك</DialogTitle>
          <DialogDescription className="sr-only">نافذة الترحيب بالمستخدم المسجل</DialogDescription>
          <div className="px-5 py-8 flex flex-col items-center text-center gap-5 max-h-[85vh] overflow-y-auto" dir="rtl">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
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
                <div key={title} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/30 text-right">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
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
              <Button onClick={() => setOpen(false)} className="min-h-[52px] w-full text-base font-semibold rounded-xl">
                <TreePine className="h-5 w-5 ml-2" />
                تصفح الشجرة
              </Button>
              <Button variant="outline" onClick={() => { setOpen(false); navigate("/profile"); }} className="min-h-[52px] w-full text-base rounded-xl">
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

  // ─── Non-logged-in: Full registration flow (full-screen overlay) ───
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        backgroundColor: "#F6F3EE",
        backgroundImage: "radial-gradient(rgba(118,90,0,0.08) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }}
      dir="rtl"
    >
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24 relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col min-h-full"
          >
            {/* ─── Step 1: Welcome ─── */}
            {step === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 relative">
                {/* Skip button */}
                <button
                  onClick={handleSkip}
                  className="absolute top-0 left-0 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  تصفح كزائر
                </button>

                {/* Hero card with sparkles */}
                <div className="relative mt-8">
                  <div className="w-44 h-44 rounded-3xl bg-white shadow-lg flex items-center justify-center">
                    <TreePine className="h-16 w-16" style={{ color: "#1B5438" }} />
                  </div>
                  {/* Sparkle decorations */}
                  <span className="absolute -top-3 -right-3 text-xl opacity-60" style={{ color: "#D4A82B" }}>✦</span>
                  <span className="absolute -top-2 -left-4 text-xl opacity-60" style={{ color: "#D4A82B" }}>✦</span>
                  <span className="absolute -bottom-3 -right-4 text-xl opacity-60" style={{ color: "#D4A82B" }}>✦</span>
                  <span className="absolute -bottom-2 -left-3 text-xl opacity-60" style={{ color: "#D4A82B" }}>✦</span>
                </div>

                <h2 className="text-2xl font-extrabold mt-10" style={{ color: "#1B5438", fontFamily: "YearOfHandicrafts, sans-serif" }}>
                  أهلاً بك في بوابة تراث الخنيني
                </h2>
                <p className="text-base font-semibold" style={{ color: "#D4A82B" }}>
                  فرع الزلفي — توثيق الإرث عبر الأجيال
                </p>
                <p className="text-sm text-muted-foreground text-center max-w-xs mx-auto mt-1 leading-relaxed">
                  نرحب بك في المنصة الرقمية الرسمية لعائلة الخنيني،
                  حيث يلتقي التراث بالتقنية لربط الأجيال وتوثيق شجرة العائلة
                </p>

                <button
                  onClick={() => goToStep(2)}
                  className="w-full h-14 rounded-full text-lg font-bold text-white mt-8 transition-transform active:scale-[0.98]"
                  style={{
                    backgroundColor: "#1B5438",
                    boxShadow: "0 8px 24px rgba(27,84,56,0.3)",
                  }}
                >
                  ابدأ رحلتك ←
                </button>

                <button onClick={handleSkip} className="text-sm text-muted-foreground text-center mt-1">
                  تصفح كزائر 👁
                </button>

                {/* Large decorative tree */}
                <TreePine
                  className="absolute bottom-8 left-4 opacity-[0.06]"
                  style={{ color: "#1B5438", width: 96, height: 96 }}
                />
              </div>
            )}

            {/* ─── Step 2: Search ─── */}
            {step === 2 && (
              <div className="flex-1 flex flex-col gap-4">
                <h2 className="text-3xl font-extrabold text-right leading-tight mb-1" style={{ color: "#1B5438" }}>
                  ابحث عن اسمك في الشجرة
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  اكتب اسمك الأول للبحث في سجلات العائلة
                </p>

                {!confirmed ? (
                  <>
                    {!selectedMember ? (
                      <>
                        <div className="relative">
                          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                          <Input
                            ref={searchInputRef}
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setSelectedMember(null); }}
                            placeholder="اكتب اسمك للبحث..."
                            className="h-14 pr-12 text-base rounded-2xl shadow-sm border-border bg-white"
                            autoFocus
                          />
                        </div>
                        {searchQuery.trim() && (
                          <>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-bold" style={{ color: "#D4A82B" }}>النتائج المحتملة</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{filtered.length}</span>
                            </div>
                            <div className="space-y-2 max-h-[260px] overflow-y-auto">
                              {filtered.length === 0 ? (
                                <p className="p-4 text-center text-sm text-muted-foreground">لم يتم العثور على نتائج</p>
                              ) : (
                                filtered.map((m) => {
                                  const br = getBranch(m.id);
                                  const brStyle = br ? getBranchStyle(br.pillarId) : null;
                                  return (
                                    <button
                                      key={m.id}
                                      onClick={() => { setSelectedMember(m); setSearchQuery(""); }}
                                      className="w-full bg-white rounded-2xl border border-border shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow text-right"
                                    >
                                      <div>
                                        <span className="font-bold text-base text-foreground block">{getLineageLabel(m)}</span>
                                        <div className="flex items-center gap-1.5 mt-1">
                                          {br && brStyle && (
                                            <>
                                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: brStyle.text }} />
                                              <span className="text-sm text-muted-foreground">{br.label}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      <UserCheck className="h-5 w-5 text-primary shrink-0" />
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCheck className="h-7 w-7 text-primary" />
                        </div>
                        <p className="text-base font-semibold text-foreground text-center">
                          هل أنت <span className="text-primary">{getDisplayLabel(selectedMember)}</span>؟
                        </p>
                        <div className="flex gap-3 w-full">
                          <Button onClick={() => { setConfirmed(true); goToStep(3); }} className="min-h-[52px] flex-1 text-base font-semibold rounded-xl">
                            نعم، هذا أنا
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => { setSelectedMember(null); setSearchQuery(""); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                            className="min-h-[52px] flex-1 text-base rounded-xl"
                          >
                            لا، عودة للبحث
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}

                <div className="mt-auto space-y-2 pt-4">
                  {!selectedMember && !searchQuery.trim() && (
                    <button
                      onClick={() => goToStep(1)}
                      className="w-full h-14 rounded-full text-base font-semibold text-white"
                      style={{ backgroundColor: "#1B5438" }}
                    >
                      استمرار
                    </button>
                  )}
                  <button onClick={handleSkip} className="w-full text-sm text-muted-foreground text-center py-2">
                    تخطى هذه الخطوة
                  </button>
                </div>
              </div>
            )}

            {/* ─── Step 3: Family Passcode ─── */}
            {step === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
                {/* Hero card */}
                <div className="w-36 h-36 rounded-3xl bg-white shadow-lg flex items-center justify-center">
                  <Shield className="h-12 w-12" style={{ color: "#D4A82B" }} />
                </div>

                <h2 className="text-2xl font-extrabold" style={{ color: "#1B5438" }}>
                  تحقق من هويتك
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  أدخل رمز العائلة للتحقق من انتمائك
                  وحماية خصوصية بيانات العائلة
                </p>

                <div className="flex justify-center" dir="ltr">
                  <InputOTP maxLength={6} value={familyPasscode} onChange={setFamilyPasscode}>
                    <InputOTPGroup className="gap-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="w-12 h-14 text-xl rounded-xl border-border bg-white"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <button
                  onClick={async () => {
                    setPasscodeVerifying(true);
                    const valid = await verifyFamilyPasscode(familyPasscode);
                    setPasscodeVerifying(false);
                    if (valid) {
                      goToStep(4);
                    } else {
                      toast.error("رمز غير صحيح");
                    }
                  }}
                  disabled={familyPasscode.length < 6 || passcodeVerifying}
                  className="w-full h-14 rounded-full text-base font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: "#1B5438" }}
                >
                  {passcodeVerifying && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Shield className="h-4 w-4" />
                  تأكيد الرمز
                </button>

                <button onClick={() => { goToStep(2); setFamilyPasscode(""); }} className="text-sm text-muted-foreground">
                  لم أحصل على الرمز؟ اتصل بالمسؤول
                </button>

                <span className="absolute bottom-4 left-6 text-xs text-muted-foreground">
                  الخطوة ٣ من ٥
                </span>
              </div>
            )}

            {/* ─── Step 4: Phone Number ─── */}
            {step === 4 && (
              <div className="flex-1 flex flex-col items-center gap-5 pt-8">
                {/* Hero card */}
                <div className="relative">
                  <div className="w-36 h-36 rounded-3xl bg-white shadow-lg flex items-center justify-center">
                    <Phone className="h-12 w-12" style={{ color: "#1B5438" }} />
                  </div>
                  <div
                    className="absolute -bottom-2 -left-2 rounded-full p-1.5"
                    style={{ backgroundColor: "#D4A82B" }}
                  >
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                </div>

                <h2 className="text-2xl font-extrabold" style={{ color: "#1B5438" }}>
                  أضف رقم جوالك
                </h2>
                <p className="text-sm text-muted-foreground text-center">
                  نحتاج لرقمك للتحقق من هويتك وتسهيل التواصل
                </p>

                <div className="w-full flex gap-2" dir="ltr">
                  <div className="w-24 h-12 rounded-xl border border-border bg-white flex items-center justify-center text-base font-bold shrink-0">
                    +966 🇸🇦
                  </div>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    placeholder="5XXXXXXXX"
                    className="h-12 rounded-xl border-border bg-white text-base text-left tracking-wider flex-1"
                    autoFocus
                  />
                </div>

                {/* Privacy note */}
                <div className="w-full rounded-xl bg-muted/50 p-3 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    رقمك للتواصل الأسري فقط ولن يظهر للعامة
                  </p>
                </div>


                <button
                  onClick={handlePhoneContinue}
                  disabled={phone.length < 9}
                  className="w-full h-14 rounded-full text-base font-bold text-white disabled:opacity-50"
                  style={{ backgroundColor: "#1B5438" }}
                >
                  متابعة
                </button>

                <button onClick={() => goToStep(3)} className="text-sm text-muted-foreground">
                  السابق
                </button>
              </div>
            )}

            {/* ─── Step 5: Birth Date + Mini Dashboard ─── */}
            {step === 5 && selectedMember && familyContext && (
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                {/* Hero card */}
                <div className="flex flex-col items-center gap-2 pt-4">
                  <div className="w-36 h-36 rounded-3xl bg-white shadow-lg flex flex-col items-center justify-center gap-1">
                    <CalendarDays className="h-12 w-12" style={{ color: "#1B5438" }} />
                    <span className="text-[10px] text-muted-foreground">التاريخ الهجري</span>
                  </div>
                </div>

                <h2 className="text-2xl font-extrabold text-center" style={{ color: "#1B5438" }}>
                  أضف تاريخ ميلادك الهجري
                </h2>
                <p className="text-sm text-muted-foreground text-center">
                  اختياري — يساعد في التمييز بين الأسماء المتشابهة
                </p>

                {/* Welcome header */}
                <div className="text-center space-y-2 py-2">
                  <h3 className="text-lg font-extrabold text-foreground">مرحباً بك، {selectedMember.name}</h3>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                    {familyContext.fatherName && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 text-xs font-bold">
                        <Users2 className="h-3 w-3" /> ابن {familyContext.fatherName}
                      </span>
                    )}
                    {familyContext.branch && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-bold">
                        <GitBranch className="h-3 w-3" /> {familyContext.branch.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Family context */}
                {(familyContext.siblings.length > 0 || familyContext.spouses.length > 0 || familyContext.children.length > 0) && (
                  <div className="rounded-xl border border-border/50 bg-white/80 p-3 space-y-3">
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
                          {familyContext.siblings.length > 10 && <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{familyContext.siblings.length - 10}</span>}
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
                          {familyContext.children.length > 10 && <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{familyContext.children.length - 10}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <p className="text-sm font-bold text-foreground">تاريخ الميلاد بالهجري</p>
                  </div>
                  <HijriDatePicker value={hijriDate} onChange={setHijriDate} />
                </div>

                {/* Children Dates */}
                {familyContext.children.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white/80 border border-border/30 hover:bg-muted/70 transition-colors text-right">
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
                                  <BadgeCheck className="h-3 w-3" /> تم التوثيق بواسطة {child.name.split(" ")[0]} ✅
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
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white/80 border border-border/30 hover:bg-muted/70 transition-colors text-right">
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
                        className="min-h-[100px] text-sm rounded-lg resize-none leading-relaxed bg-white"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Actions */}
                <div className="mt-auto space-y-2 pt-2 pb-4">
                  {!hijriDate.year && (
                    <p className="text-xs text-destructive text-center font-medium">يرجى اختيار سنة الميلاد على الأقل للمتابعة</p>
                  )}
                  <button
                    onClick={handleComplete}
                    disabled={isSubmitting || !hijriDate.year}
                    className="w-full h-14 rounded-full text-base font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: "#1B5438" }}
                  >
                    {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                    أتم التسجيل ✓
                  </button>
                  <button onClick={handleSkip} className="w-full text-sm text-muted-foreground text-center py-2">
                    تخطى هذه الخطوة
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators at bottom */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-1.5">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className="rounded-full transition-all duration-300"
            style={{
              width: s === step ? 24 : 8,
              height: 8,
              backgroundColor: s === step ? "#D4A82B" : "rgba(118,90,0,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
