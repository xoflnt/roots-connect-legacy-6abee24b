import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Progress } from "@/components/ui/progress";
import { TreePine, Search, UserCheck, Phone, CalendarDays, ChevronLeft, Loader2, QrCode, ExternalLink, UserCircle, MessageCircle } from "lucide-react";
import { familyMembers, type FamilyMember } from "@/data/familyData";
import { sendOTP, checkOTPStatus, verifyOTP, type SendOTPResult } from "@/services/wasageSms";
import { useAuth } from "@/contexts/AuthContext";
import { HijriDatePicker } from "@/components/HijriDatePicker";
import { registerVerifiedUser } from "@/services/dataService";
import { getLineageLabel } from "@/utils/memberLabel";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const TOTAL_STEPS = 5;

const memberMap = new Map(familyMembers.map((m) => [m.id, m]));

function getFatherName(member: FamilyMember): string | null {
  if (!member.father_id) return null;
  return memberMap.get(member.father_id)?.name ?? null;
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

  // Phase B+C — Wasage WhatsApp OTP
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpResult, setOtpResult] = useState<SendOTPResult | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Phase D — Hijri Date Picker
  const [hijriDate, setHijriDate] = useState<{ day?: string; month?: string; year?: string }>({});

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Show every visit — logged-in users see welcome, others see registration
  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      return;
    }
    setOpen(true);
  }, [forceOpen]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim();
    return familyMembers.filter((m) => m.name.includes(q) || getDisplayLabel(m).includes(q)).slice(0, 15);
  }, [searchQuery]);

  const handleSkip = () => {
    setOpen(false);
  };

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const startPolling = useCallback((reference: string) => {
    setPolling(true);
    pollingRef.current = setInterval(async () => {
      const result = await checkOTPStatus(reference);
      if (result.verified) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setPolling(false);
        setOtpVerified(true);
        setStep(5);
      }
    }, 3000);
    setTimeout(() => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      setPolling(false);
    }, 300000);
  }, []);

  const handleSendOTP = async () => {
    if (phone.length < 9) return;
    setLoading(true);
    setOtpError("");
    const result = await sendOTP(`+966${phone}`);
    setOtpResult(result);
    setOtpSent(true);
    setLoading(false);
    if (result.success && result.reference && result.clickable) {
      startPolling(result.reference);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length < 4) return;
    setLoading(true);
    setOtpError("");
    const ok = await verifyOTP(`+966${phone}`, otpCode);
    if (ok) {
      setOtpVerified(true);
      setStep(5);
    } else {
      setOtpError("الرمز غير صحيح، حاول مرة أخرى");
    }
    setLoading(false);
  };

  const handleComplete = async () => {
    if (!selectedMember) return;

    const dateStr = hijriDate.year
      ? `${hijriDate.year}/${hijriDate.month || "1"}/${hijriDate.day || "1"}`
      : undefined;

    const { updateMember } = await import("@/services/dataService");
    await updateMember(selectedMember.id, { phone: `+966${phone}` });
    await registerVerifiedUser({
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      phone: `+966${phone}`,
      hijriBirthDate: dateStr,
    });

    login({
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      phone: `+966${phone}`,
      hijriBirthDate: dateStr,
    });
    setOpen(false);
  };

  const progressValue = (step / TOTAL_STEPS) * 100;

  // ─── Logged-in user: Welcome back view with quick guide ───
  if (isLoggedIn && currentUser) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-md w-[95vw] p-0 gap-0 rounded-2xl overflow-hidden border-border/50 bg-card"
        >
          <DialogTitle className="sr-only">مرحباً بعودتك</DialogTitle>
          <DialogDescription className="sr-only">نافذة الترحيب بالمستخدم المسجل</DialogDescription>
          <div className="px-5 py-8 flex flex-col items-center text-center gap-5 max-h-[85vh] overflow-y-auto" dir="rtl">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <TreePine className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                أهلاً بعودتك، {currentUser.memberName}
              </h2>
              <p className="text-sm text-muted-foreground">
                سعداء برجوعك لبوابة تراث الخنيني
              </p>
            </div>

            {/* Quick Guide */}
            <div className="w-full space-y-2">
              <p className="text-xs font-bold text-muted-foreground">دليل سريع</p>
              {[
                { icon: TreePine, title: "تصفح الشجرة", desc: "استكشف فروع العائلة وتوسّع بالنقر على البطاقات" },
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setOpen(false); navigate("/guide"); }}
                className="w-full text-xs text-primary"
              >
                دليل الاستخدام الكامل ←
              </Button>
            </div>

            <div className="flex flex-col w-full gap-2">
              <Button
                onClick={() => { setOpen(false); }}
                className="min-h-[52px] w-full text-base font-semibold rounded-xl"
              >
                <TreePine className="h-5 w-5 ml-2" />
                تصفح الشجرة
              </Button>
              <Button
                variant="outline"
                onClick={() => { setOpen(false); navigate("/profile"); }}
                className="min-h-[52px] w-full text-base rounded-xl"
              >
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
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md w-[95vw] p-0 gap-0 rounded-2xl overflow-hidden border-border/50 bg-card [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">التسجيل في بوابة الخنيني</DialogTitle>
        <DialogDescription className="sr-only">نموذج تسجيل الدخول عبر التحقق من رقم الجوال</DialogDescription>
        {/* Progress */}
        <div className="px-5 pt-4 pb-2">
          <Progress value={progressValue} className="h-1.5 rounded-full" />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">{step} / {TOTAL_STEPS}</span>
            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-xs text-muted-foreground h-8 px-2">
              تخطي
            </Button>
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
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedMember(null);
                          }}
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
                                onClick={() => {
                                  setSelectedMember(m);
                                  setSearchQuery("");
                                }}
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
                        <Button
                          onClick={() => {
                            setConfirmed(true);
                            setStep(4);
                          }}
                          className="min-h-[52px] flex-1 text-base font-semibold rounded-xl"
                        >
                          نعم، هذا أنا
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedMember(null);
                            setSearchQuery("");
                            setTimeout(() => searchInputRef.current?.focus(), 100);
                          }}
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

          {/* ─── Step 4: Phone + WhatsApp OTP ─── */}
          {step === 4 && (
            <div className="flex-1 flex flex-col gap-4 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground text-center">
                <Phone className="inline h-5 w-5 ml-1" />
                تأكيد رقم الجوال
              </h2>

              {!otpSent ? (
                <>
                  <p className="text-sm text-muted-foreground text-center">أدخل رقم جوالك السعودي للتحقق عبر واتساب</p>
                  <div className="relative" dir="ltr">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base font-medium">+966</span>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                      placeholder="5XXXXXXXX"
                      className="min-h-[52px] pl-16 text-base rounded-xl text-left tracking-wider"
                      autoFocus
                    />
                  </div>
                  <Button
                    onClick={handleSendOTP}
                    disabled={phone.length < 9 || loading}
                    className="min-h-[52px] w-full text-base font-semibold rounded-xl"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "تحقق عبر واتساب"}
                  </Button>
                  <Button variant="outline" onClick={() => setStep(3)} className="min-h-[52px] w-full rounded-xl">
                    <ChevronLeft className="h-4 w-4 ml-1" /> السابق
                  </Button>
                </>
              ) : !otpVerified ? (
                <>
                  {otpResult?.clickable ? (
                    <div className="flex flex-col items-center gap-4">
                      {/* Desktop: QR Code */}
                      {!isMobile && otpResult.qr && (
                        <div className="p-4 bg-background rounded-xl border border-border shadow-sm">
                          <img src={otpResult.qr} alt="QR Code" className="w-44 h-44 mx-auto" />
                          <p className="text-sm text-muted-foreground text-center mt-3 leading-relaxed">
                            امسح الرمز بكاميرا جوالك لإرسال رسالة التوثيق عبر الواتساب
                          </p>
                        </div>
                      )}

                      {/* Mobile: WhatsApp deep-link button */}
                      {isMobile && (
                        <div className="w-full flex flex-col items-center gap-3">
                          <p className="text-sm text-muted-foreground text-center leading-relaxed">
                            اضغط على الزر أدناه لإرسال رسالة التوثيق. بمجرد استلامك لرسالة التأكيد، عد إلى هذه الصفحة.
                          </p>
                          <a
                            href={otpResult.clickable}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 min-h-[56px] w-full text-lg font-bold rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white transition-colors shadow-md"
                          >
                            <MessageCircle className="h-6 w-6" />
                            فتح الواتساب لإرسال الرسالة
                          </a>
                        </div>
                      )}

                      {/* Desktop: smaller link button fallback */}
                      {!isMobile && (
                        <a
                          href={otpResult.clickable}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 min-h-[44px] w-full text-sm font-medium rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          أو افتح الرابط مباشرة
                        </a>
                      )}

                      {/* Waiting state */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>في انتظار رسالة التوثيق الخاصة بك...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground text-center">
                        أدخل رمز التحقق (في وضع التجربة استخدم 1234)
                      </p>
                      <div className="flex justify-center" dir="ltr">
                        <InputOTP maxLength={4} value={otpCode} onChange={setOtpCode}>
                          <InputOTPGroup className="gap-2">
                            {[0, 1, 2, 3].map((i) => (
                              <InputOTPSlot key={i} index={i} className="w-14 h-14 text-xl rounded-xl border-border" />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      {otpError && <p className="text-destructive text-sm text-center font-medium">{otpError}</p>}
                      <Button
                        onClick={handleVerifyOTP}
                        disabled={otpCode.length < 4 || loading}
                        className="min-h-[52px] w-full text-base font-semibold rounded-xl"
                      >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "تحقق"}
                      </Button>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (pollingRef.current) clearInterval(pollingRef.current);
                      setPolling(false);
                      setOtpSent(false);
                      setOtpResult(null);
                      setOtpCode("");
                      setOtpError("");
                    }}
                    className="text-sm text-muted-foreground"
                  >
                    تغيير الرقم
                  </Button>
                </>
              ) : null}
            </div>
          )}

          {/* ─── Step 5: Hijri Birth Date (Dropdowns) ─── */}
          {step === 5 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">تاريخ الميلاد بالهجري</h2>
              <p className="text-sm text-muted-foreground text-center">(اختياري) اختر تاريخ ميلادك بالهجري لإثراء بيانات العائلة</p>
              <HijriDatePicker value={hijriDate} onChange={setHijriDate} />
              <Button onClick={handleComplete} className="min-h-[52px] w-full text-base font-semibold rounded-xl">
                إكمال التسجيل
              </Button>
              <Button variant="ghost" onClick={handleComplete} className="text-sm text-muted-foreground">
                تخطي هذه الخطوة
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
