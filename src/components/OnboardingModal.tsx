import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Progress } from "@/components/ui/progress";
import { TreePine, Search, UserCheck, Phone, CalendarDays, ChevronLeft, Loader2, QrCode, ExternalLink } from "lucide-react";
import { familyMembers, type FamilyMember } from "@/data/familyData";
import { sendOTP, checkOTPStatus, verifyOTP, type SendOTPResult } from "@/services/wasageSms";
import { useAuth } from "@/contexts/AuthContext";
import { HijriDatePicker } from "@/components/HijriDatePicker";
import { registerVerifiedUser } from "@/services/dataService";

const ONBOARDING_KEY = "hasSeenOnboarding";
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
  const { isLoggedIn, login } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

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

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      return;
    }
    if (!isLoggedIn && localStorage.getItem(ONBOARDING_KEY) !== "true") {
      setOpen(true);
    }
  }, [isLoggedIn, forceOpen]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim();
    return familyMembers.filter((m) => m.name.includes(q) || getDisplayLabel(m).includes(q)).slice(0, 15);
  }, [searchQuery]);

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOpen(false);
  };

  const handleSendOTP = async () => {
    if (phone.length < 9) return;
    setLoading(true);
    setOtpError("");
    await sendOTP(`+966${phone}`);
    setOtpSent(true);
    setLoading(false);
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

    // Build hijri date string
    const dateStr = hijriDate.year
      ? `${hijriDate.year}/${hijriDate.month || "1"}/${hijriDate.day || "1"}`
      : undefined;

    // Register verified user + auto-update birth date
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

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md w-[95vw] p-0 gap-0 rounded-2xl overflow-hidden border-border/50 bg-card [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
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
                <h2 className="text-xl font-bold text-foreground mb-2">مرحباً بك في بوابة تراث آل الخنيني</h2>
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
                  { icon: TreePine, title: "تصفح الشجرة", desc: "استكشف فروع العائلة بشكل تفاعلي" },
                  { icon: Search, title: "ابحث عن اسمك", desc: "استخدم البحث للوصول السريع لأي فرد" },
                  { icon: UserCheck, title: "سجّل بياناتك", desc: "طالب بملفك الشخصي وأثرِ بيانات العائلة" },
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
                                <span className="text-sm font-medium text-foreground">{getDisplayLabel(m)}</span>
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

          {/* ─── Step 4: Phone + OTP ─── */}
          {step === 4 && (
            <div className="flex-1 flex flex-col gap-4 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground text-center">
                <Phone className="inline h-5 w-5 ml-1" />
                تأكيد رقم الجوال
              </h2>

              {!otpSent ? (
                <>
                  <p className="text-sm text-muted-foreground text-center">أدخل رقم جوالك السعودي للتحقق</p>
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
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "إرسال رمز التحقق"}
                  </Button>
                  <Button variant="outline" onClick={() => setStep(3)} className="min-h-[52px] w-full rounded-xl">
                    <ChevronLeft className="h-4 w-4 ml-1" /> السابق
                  </Button>
                </>
              ) : !otpVerified ? (
                <>
                  <p className="text-sm text-muted-foreground text-center">
                    أدخل رمز التحقق المرسل إلى <span dir="ltr" className="font-medium">+966{phone}</span>
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
                  <Button
                    variant="ghost"
                    onClick={() => { setOtpSent(false); setOtpCode(""); setOtpError(""); }}
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
