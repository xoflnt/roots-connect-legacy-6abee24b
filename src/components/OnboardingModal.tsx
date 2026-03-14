import { useState, useEffect, useMemo, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TreePine, Search, UserCheck, Phone, CalendarDays, ChevronLeft, ChevronDown, Loader2, UserCircle, Users2, Heart, UserPlus, GitBranch, Edit3, BadgeCheck, Info, Lock } from "lucide-react";
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

const TOTAL_STEPS = 6;

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

export function OnboardingModal({ forceOpen }: OnboardingModalProps) {
  const { isLoggedIn, currentUser, login } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Phase A
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Phone number
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [passcodeVerifying, setPasscodeVerifying] = useState(false);

  // Phase D — Hijri Date + Quick Update
  const [familyPasscode, setFamilyPasscode] = useState("");

  // Phase D — Hijri Date + Quick Update
  const [hijriDate, setHijriDate] = useState<{ day?: string; month?: string; year?: string }>({});
  const [quickUpdateOpen, setQuickUpdateOpen] = useState(false);
  const [quickUpdateText, setQuickUpdateText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preFilledBanner, setPreFilledBanner] = useState(false);

  // Children dates (parent delegated entry)
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

  // Pre-fill birth date for "child logging in" scenario
  useEffect(() => {
    if (step === 6 && selectedMember) {
      const verifiedIds = getVerifiedMemberIds();
      const isAlreadyVerified = verifiedIds.has(selectedMember.id);
      if (!isAlreadyVerified && selectedMember.birth_year) {
        // Parse existing birth_year (format "YYYY/M/D" or just "YYYY")
        const parts = selectedMember.birth_year.split("/");
        const parsed: { day?: string; month?: string; year?: string } = { year: parts[0] };
        if (parts[1]) parsed.month = parts[1];
        if (parts[2]) parsed.day = parts[2];
        setHijriDate(parsed);
        setPreFilledBanner(true);
      }

      // Pre-fill children dates from existing birth_year
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
    setStep(6);
  };

  const handleComplete = async () => {
    if (!selectedMember || isSubmitting || !hijriDate.year) return;
    setIsSubmitting(true);
    try {

    const dateStr = hijriDate.year
      ? `${hijriDate.year}/${hijriDate.month || "1"}/${hijriDate.day || "1"}`
      : undefined;

    const { updateMember } = await import("@/services/dataService");
    // Update phone always
    const memberUpdates: Record<string, string> = { phone: `+966${phone}` };
    // Directly update birth_year for OTP-verified users (no admin queue)
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

    // Save children dates (parent delegated entry)
    const verifiedIds = getVerifiedMemberIds();
    for (const [childId, cDate] of Object.entries(childrenDates)) {
      if (cDate.year && !verifiedIds.has(childId)) {
        const childDateStr = `${cDate.year}/${cDate.month || "1"}/${cDate.day || "1"}`;
        await updateMember(childId, { birth_year: childDateStr });
      }
    }

    // Fire quick-update request as free text
    if (quickUpdateText.trim()) {
      await submitRequest({
        type: "other",
        targetMemberId: selectedMember.id,
        data: { text_content: quickUpdateText.trim() },
        submittedBy: selectedMember.name,
      });
      toast.success("تم إرسال طلب التحديث للمراجعة");
    }

    // Refresh data instantly so tree/cards reflect new birth date
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

  const progressValue = (step / TOTAL_STEPS) * 100;

  // ─── Family context data for Step 5 ───
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

  // ─── Non-logged-in: Full registration flow ───
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleSkip(); else setOpen(true); }}>
      <DialogContent
        className="max-w-md w-[95vw] p-0 gap-0 rounded-2xl overflow-hidden border-border/50 bg-card"
      >
        <DialogTitle className="sr-only">التسجيل في بوابة الخنيني</DialogTitle>
        <DialogDescription className="sr-only">نموذج تسجيل الدخول عبر التحقق من رقم الجوال</DialogDescription>
        <div className="px-5 pt-4 pb-2">
          <Progress value={progressValue} className="h-1.5 rounded-full" />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">{step} / {TOTAL_STEPS}</span>
          </div>
        </div>

        <div className="px-5 pb-6 min-h-[380px] flex flex-col" dir="rtl">
          {/* ─── Step 1: Welcome ─── */}
          {step === 1 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <TreePine className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">مرحباً بك في بوابة تراث الخنيني</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  منصة تفاعلية لتوثيق شجرة العائلة والحفاظ على تراثها. سجّل اسمك لتكون جزءاً من هذا التوثيق.
                </p>
              </div>
              <Button onClick={() => setStep(2)} className="min-h-[52px] w-full text-base font-semibold rounded-xl">
                التالي
              </Button>
              <Button variant="ghost" onClick={handleSkip} className="w-full text-sm text-muted-foreground hover:text-foreground">
                تصفح كزائر
              </Button>
            </div>
          )}

          {/* ─── Step 2: Guide ─── */}
          {step === 2 && (
            <div className="flex-1 flex flex-col gap-4 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground text-center mb-1">كيف تستخدم المنصة</h2>
              <div className="flex flex-col gap-3">
                {[
                  { icon: TreePine, title: "تصفح الشجرة", desc: "استكشف فروع العائلة بشكل تفاعلي وتوسّع في الفروع" },
                  { icon: Search, title: "ابحث عن اسمك", desc: "استخدم البحث للوصول السريع لأي فرد في الشجرة" },
                  { icon: UserCheck, title: "سجّل بياناتك", desc: "طالب بملفك الشخصي وأثرِ بيانات العائلة" },
                  { icon: UserCircle, title: "حاسبة القرابة", desc: "اكتشف صلة القرابة بين أي فردين في الشجرة" },
                  { icon: CalendarDays, title: "جدول البيانات", desc: "عرض جميع الأفراد في جدول مع أعمارهم وتفاصيلهم" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/30">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-auto flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="min-h-[52px] flex-1 rounded-xl">
                  <ChevronLeft className="h-4 w-4 ml-1" /> السابق
                </Button>
                <Button onClick={() => setStep(3)} className="min-h-[52px] flex-1 text-base font-semibold rounded-xl">
                  التالي
                </Button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Search & Claim ─── */}
          {step === 3 && (
            <div className="flex-1 flex flex-col gap-4 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground text-center">ابحث عن اسمك في الشجرة</h2>
              {!confirmed ? (
                <>
                  {!selectedMember ? (
                    <>
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                        <Input
                          ref={searchInputRef}
                          value={searchQuery}
                          onChange={(e) => { setSearchQuery(e.target.value); setSelectedMember(null); }}
                          placeholder="اكتب اسمك للبحث..."
                          className="min-h-[52px] pr-10 text-base rounded-xl border-border"
                          autoFocus
                        />
                      </div>
                      {searchQuery.trim() && (
                        <div className="border border-border/50 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto bg-background">
                          {filtered.length === 0 ? (
                            <p className="p-4 text-center text-sm text-muted-foreground">لم يتم العثور على نتائج</p>
                          ) : (
                            filtered.map((m) => (
                              <button
                                key={m.id}
                                onClick={() => { setSelectedMember(m); setSearchQuery(""); }}
                                className="w-full text-right px-4 min-h-[48px] flex items-center gap-2 hover:bg-muted/60 active:bg-muted transition-colors border-b border-border/20 last:border-0"
                              >
                                <UserCheck className="h-4 w-4 text-primary shrink-0" />
                                <div className="text-right">
                                  <span className="text-sm font-medium text-foreground block">{getLineageLabel(m)}</span>
                                  {m.birth_year && <span className="text-xs text-muted-foreground">م {m.birth_year}</span>}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
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
                        <Button onClick={() => { setConfirmed(true); setStep(4); }} className="min-h-[52px] flex-1 text-base font-semibold rounded-xl">
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
              {!selectedMember && !searchQuery.trim() && (
                <div className="mt-auto flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="min-h-[52px] flex-1 rounded-xl">
                    <ChevronLeft className="h-4 w-4 ml-1" /> السابق
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ─── Step 4: Family Passcode ─── */}
          {step === 4 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">رمز دخول العائلة</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  الرجاء إدخال الرمز السري الخاص بالعائلة للمتابعة
                </p>
              </div>
              <div className="flex justify-center" dir="ltr">
                <InputOTP maxLength={6} value={familyPasscode} onChange={setFamilyPasscode}>
                  <InputOTPGroup className="gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} className="w-12 h-14 text-xl rounded-xl border-border" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                onClick={async () => {
                  setPasscodeVerifying(true);
                  const valid = await verifyFamilyPasscode(familyPasscode);
                  setPasscodeVerifying(false);
                  if (valid) {
                    setStep(5);
                  } else {
                    toast.error("الرمز السري غير صحيح. الرجاء التأكد من الرمز الخاص بالعائلة.");
                  }
                }}
                disabled={familyPasscode.length < 6 || passcodeVerifying}
                className="min-h-[52px] w-full text-base font-semibold rounded-xl"
              >
                {passcodeVerifying ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                متابعة
              </Button>
              <Button variant="outline" onClick={() => { setStep(3); setFamilyPasscode(""); }} className="min-h-[52px] w-full rounded-xl">
                <ChevronLeft className="h-4 w-4 ml-1" /> السابق
              </Button>
            </div>
          )}

          {/* ─── Step 5: Phone Number ─── */}
          {step === 5 && (
            <div className="flex-1 flex flex-col gap-4 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground text-center">
                <Phone className="inline h-5 w-5 ml-1" />
                رقم الجوال
              </h2>
              <p className="text-sm text-muted-foreground text-center">أدخل رقم جوالك السعودي لحفظه في ملفك الشخصي</p>
              <div className="relative" dir="ltr">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base font-medium">+966</span>
                <Input
                  type="tel" inputMode="numeric" value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  placeholder="5XXXXXXXX"
                  className="min-h-[52px] pl-16 text-base rounded-xl text-left tracking-wider"
                  autoFocus
                />
              </div>
              <Button onClick={handlePhoneContinue} disabled={phone.length < 9} className="min-h-[52px] w-full text-base font-semibold rounded-xl">
                متابعة
              </Button>
              <Button variant="outline" onClick={() => setStep(4)} className="min-h-[52px] w-full rounded-xl">
                <ChevronLeft className="h-4 w-4 ml-1" /> السابق
              </Button>
            </div>
          )}

          {/* ─── Step 6: Mini-Dashboard ─── */}
          {step === 6 && selectedMember && familyContext && (
            <div className="flex-1 flex flex-col gap-4 animate-fade-in overflow-y-auto max-h-[60vh]">
              {/* Welcome header */}
              <div className="text-center space-y-2 py-2">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <UserCheck className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-lg font-extrabold text-foreground">مرحباً بك، {selectedMember.name}</h2>
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

              {/* ─── عائلتك حالياً ─── */}
              {(familyContext.siblings.length > 0 || familyContext.spouses.length > 0 || familyContext.children.length > 0) && (
                <div className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-3">
                  <p className="text-xs font-extrabold text-foreground">عائلتك حالياً</p>

                  {familyContext.siblings.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                        <Users2 className="h-3.5 w-3.5" />
                        الإخوة والأخوات ({familyContext.siblings.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {familyContext.siblings.slice(0, 10).map((s) => (
                          <span key={s.id} className="text-[11px] px-2 py-0.5 rounded-full bg-background border border-border/40 text-foreground">
                            {s.name.split(" ")[0]}
                          </span>
                        ))}
                        {familyContext.siblings.length > 10 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            +{familyContext.siblings.length - 10}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {familyContext.spouses.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                        <Heart className="h-3.5 w-3.5" />
                        {selectedMember.gender === "M" ? "الزوجات" : "الزوج"}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {familyContext.spouses.map((sp, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                            {sp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {familyContext.children.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                        <UserPlus className="h-3.5 w-3.5" />
                        الأبناء ({familyContext.children.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {familyContext.children.slice(0, 10).map((c) => (
                          <span key={c.id} className="text-[11px] px-2 py-0.5 rounded-full bg-background border border-border/40 text-foreground">
                            {c.name.split(" ")[0]}
                          </span>
                        ))}
                        {familyContext.children.length > 10 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            +{familyContext.children.length - 10}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Pre-filled Banner ─── */}
              {preFilledBanner && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-accent/10 border border-accent/30">
                  <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-xs text-accent font-medium leading-relaxed">
                    تم إدخال تاريخ ميلادك مسبقاً. يمكنك تأكيده أو تعديله الآن لتكتمل عملية توثيق حسابك.
                  </p>
                </div>
              )}

              {/* ─── Hijri Date ─── */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <p className="text-sm font-bold text-foreground">تاريخ الميلاد بالهجري</p>
                </div>
                <HijriDatePicker value={hijriDate} onChange={setHijriDate} />
              </div>

              {/* ─── Children Dates (Parent Delegated Entry) ─── */}
              {familyContext.children.length > 0 && (
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/30 hover:bg-muted/70 transition-colors text-right">
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
                                <BadgeCheck className="h-3 w-3" />
                                تم التوثيق بواسطة {child.name.split(" ")[0]} ✅
                              </span>
                            )}
                          </div>
                          {isChildVerified ? (
                            <p className="text-[11px] text-muted-foreground pr-1">
                              {child.birth_year || "—"}
                            </p>
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

              {/* ─── Optional Quick-Update ─── */}
              <Collapsible open={quickUpdateOpen} onOpenChange={setQuickUpdateOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/30 hover:bg-muted/70 transition-colors text-right">
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
                      className="min-h-[100px] text-sm rounded-lg resize-none leading-relaxed"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* ─── Actions ─── */}
              <div className="mt-auto space-y-2 pt-2">
                {!hijriDate.year && (
                  <p className="text-xs text-destructive text-center font-medium">يرجى اختيار سنة الميلاد على الأقل للمتابعة</p>
                )}
                <Button type="button" onClick={handleComplete} disabled={isSubmitting || !hijriDate.year} className="min-h-[52px] w-full text-base font-semibold rounded-xl">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : null}
                  حفظ والدخول للبوابة
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
