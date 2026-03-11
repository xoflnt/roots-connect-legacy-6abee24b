import { useState, useMemo, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getAllMembers, getMemberById } from "@/services/familyService";
import { sendOTP, verifyOTP } from "@/services/wasageSms";
import { TreePine, Search, Phone, ShieldCheck, CalendarDays, ChevronLeft, ChevronRight, Check, Loader2, UserCheck, ArrowRight } from "lucide-react";
import type { FamilyMember } from "@/data/familyData";

type Step = "welcome" | "guide" | "claim" | "confirm" | "phone" | "otp" | "birthdate" | "done";

export function OnboardingModal() {
  const { currentUser, login, hasSeenOnboarding, markOnboardingSeen } = useAuth();
  const [open, setOpen] = useState(!currentUser && !hasSeenOnboarding);
  const [step, setStep] = useState<Step>("welcome");

  // Claim state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Phone & OTP state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Birth date state
  const [hijriBirthDate, setHijriBirthDate] = useState("");

  const allMembers = useMemo(() => getAllMembers(), []);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return allMembers
      .filter((m) => m.name.toLowerCase().includes(q))
      .slice(0, 30);
  }, [searchQuery, allMembers]);

  const getFatherName = (member: FamilyMember): string => {
    if (!member.father_id) return "";
    const father = getMemberById(member.father_id);
    return father ? father.name.split(" ")[0] : "";
  };

  const handleSkip = () => {
    markOnboardingSeen();
    setOpen(false);
  };

  const handleSelectMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setSearchQuery(member.name);
    setShowDropdown(false);
    setStep("confirm");
  };

  const handlePhoneSubmit = async () => {
    const cleaned = phoneNumber.replace(/\s/g, "");
    if (!/^(05\d{8}|5\d{8}|\+9665\d{8}|009665\d{8})$/.test(cleaned)) {
      setError("يرجى إدخال رقم جوال سعودي صحيح");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await sendOTP(cleaned);
      if (result.success) {
        setStep("otp");
      } else {
        setError(result.message);
      }
    } catch {
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    const code = otpCode.join("");
    if (code.length < 4) {
      setError("يرجى إدخال رمز التحقق كاملاً");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await verifyOTP(phoneNumber, code);
      if (result.success) {
        setStep("birthdate");
      } else {
        setError(result.message);
        setOtpCode(["", "", "", ""]);
        otpRefs.current[0]?.focus();
      }
    } catch {
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (!selectedMember) return;
    login({
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      phoneNumber,
      hijriBirthDate: hijriBirthDate || undefined,
    });
    setStep("done");
    setTimeout(() => setOpen(false), 1500);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!open) return null;

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-6">
      {["welcome", "guide", "claim"].map((s, i) => {
        const stepsOrder: Step[] = ["welcome", "guide", "claim"];
        const currentIdx = stepsOrder.indexOf(step as any);
        const isActive = i <= (currentIdx >= 0 ? currentIdx : 2);
        return (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              isActive ? "w-8 bg-primary" : "w-4 bg-muted-foreground/20"
            }`}
          />
        );
      })}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleSkip(); }}>
      <DialogContent
        className="max-w-md mx-auto p-0 gap-0 overflow-hidden border-accent/20 bg-card rounded-2xl"
        style={{ fontFamily: "'Tajawal', sans-serif" }}
        dir="rtl"
      >
        <div className="p-6 md:p-8">
          {/* ===== WELCOME ===== */}
          {step === "welcome" && (
            <div className="text-center space-y-5 animate-in fade-in duration-300">
              {stepIndicator}
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <TreePine className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">مرحباً بك في بوابة تراث آل الخنيني</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                منصة رقمية لتوثيق وحفظ نسب وتراث عائلة الخنيني. استكشف شجرة العائلة، وسجّل اسمك لتكون جزءاً من التوثيق.
              </p>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setStep("guide")} className="flex-1 h-12 text-base rounded-xl gap-2">
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={handleSkip} className="h-12 text-sm text-muted-foreground rounded-xl">
                  تخطي
                </Button>
              </div>
            </div>
          )}

          {/* ===== GUIDE ===== */}
          {step === "guide" && (
            <div className="text-center space-y-5 animate-in fade-in duration-300">
              {stepIndicator}
              <div className="space-y-4 text-right">
                {[
                  { icon: TreePine, text: "تصفّح الشجرة بالسحب والتكبير، واضغط على أي شخص لعرض تفاصيله" },
                  { icon: Search, text: "استخدم البحث في الأعلى للوصول السريع لأي فرد في العائلة" },
                  { icon: UserCheck, text: "سجّل اسمك لتوثيق حضورك وإثراء بيانات العائلة" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="w-10 h-10 min-w-[40px] rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-foreground leading-relaxed pt-1.5">{item.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setStep("claim")} className="flex-1 h-12 text-base rounded-xl gap-2">
                  سجّل اسمك
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setStep("welcome")} className="h-12 rounded-xl">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <button onClick={handleSkip} className="text-xs text-muted-foreground hover:underline">
                تخطي التسجيل
              </button>
            </div>
          )}

          {/* ===== CLAIM (Search & Select) ===== */}
          {step === "claim" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {stepIndicator}
              <h2 className="text-lg font-bold text-foreground text-center">ابحث عن اسمك في الشجرة</h2>
              <p className="text-sm text-muted-foreground text-center">ابدأ بكتابة اسمك وسيظهر لك قائمة بالأسماء المطابقة</p>

              <div className="relative">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                      setSelectedMember(null);
                    }}
                    onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                    placeholder="اكتب اسمك هنا..."
                    className="h-14 text-base pr-11 rounded-xl border-2 border-border focus:border-primary"
                    autoComplete="off"
                  />
                </div>

                {showDropdown && filteredMembers.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 max-h-[240px] overflow-y-auto rounded-xl border-2 border-border bg-card shadow-xl z-50"
                  >
                    {filteredMembers.map((m) => {
                      const fatherName = getFatherName(m);
                      return (
                        <button
                          key={m.id}
                          onClick={() => handleSelectMember(m)}
                          className="w-full flex items-center gap-3 px-4 py-3 min-h-[52px] text-right hover:bg-muted/60 transition-colors border-b border-border/30 last:border-b-0"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            m.gender === "M" ? "bg-[hsl(var(--male)/0.15)] text-[hsl(var(--male))]" : "bg-[hsl(var(--female)/0.15)] text-[hsl(var(--female))]"
                          }`}>
                            {m.gender === "M" ? "♂" : "♀"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-foreground block truncate">{m.name}</span>
                            {fatherName && (
                              <span className="text-xs text-muted-foreground">ابن {fatherName}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {showDropdown && searchQuery.trim() && filteredMembers.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-4 rounded-xl border border-border bg-card shadow-lg text-center text-sm text-muted-foreground">
                    لم يتم العثور على نتائج. تأكد من كتابة الاسم بشكل صحيح.
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep("guide")} className="h-12 rounded-xl">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <button onClick={handleSkip} className="text-xs text-muted-foreground hover:underline mr-auto pt-3">
                  تخطي
                </button>
              </div>
            </div>
          )}

          {/* ===== CONFIRM ===== */}
          {step === "confirm" && selectedMember && (
            <div className="text-center space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">هل أنت {selectedMember.name}؟</h2>
              {selectedMember.father_id && (
                <p className="text-sm text-muted-foreground">
                  ابن {getFatherName(selectedMember) || "—"}
                  {selectedMember.birth_year && ` • مواليد ${selectedMember.birth_year}`}
                </p>
              )}
              <div className="flex flex-col gap-3 pt-2">
                <Button onClick={() => { setError(""); setStep("phone"); }} className="h-14 text-base rounded-xl gap-2">
                  <Check className="h-5 w-5" />
                  نعم، هذا أنا
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setSelectedMember(null); setSearchQuery(""); setStep("claim"); }}
                  className="h-14 text-base rounded-xl"
                >
                  لا، عودة للبحث
                </Button>
              </div>
            </div>
          )}

          {/* ===== PHONE ===== */}
          {step === "phone" && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">أدخل رقم جوالك</h2>
                <p className="text-sm text-muted-foreground mt-1">سنرسل لك رمز تحقق للتأكد من هويتك</p>
              </div>

              <div className="relative" dir="ltr">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base font-medium">🇸🇦 +966</span>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => { setPhoneNumber(e.target.value); setError(""); }}
                  placeholder="05XXXXXXXX"
                  className="h-14 text-lg pl-24 rounded-xl border-2 border-border focus:border-primary text-left"
                  maxLength={15}
                />
              </div>

              {error && <p className="text-destructive text-sm text-center font-medium">{error}</p>}

              <Button onClick={handlePhoneSubmit} disabled={loading} className="w-full h-14 text-base rounded-xl gap-2">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
              </Button>
            </div>
          )}

          {/* ===== OTP ===== */}
          {step === "otp" && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <ShieldCheck className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">رمز التحقق</h2>
                <p className="text-sm text-muted-foreground mt-1">أدخل الرمز المكوّن من 4 أرقام</p>
              </div>

              <div className="flex justify-center gap-3" dir="ltr">
                {otpCode.map((digit, i) => (
                  <Input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 border-border focus:border-primary"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {error && <p className="text-destructive text-sm text-center font-medium">{error}</p>}

              <Button onClick={handleOtpSubmit} disabled={loading} className="w-full h-14 text-base rounded-xl gap-2">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                {loading ? "جاري التحقق..." : "تأكيد"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                للتجربة: استخدم الرمز <span className="font-mono font-bold text-foreground">1234</span>
              </p>
            </div>
          )}

          {/* ===== BIRTH DATE ===== */}
          {step === "birthdate" && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-accent/15 flex items-center justify-center mb-3">
                  <CalendarDays className="h-7 w-7 text-accent" />
                </div>
                <h2 className="text-lg font-bold text-foreground">تاريخ ميلادك بالهجري</h2>
                <p className="text-sm text-muted-foreground mt-1">اختياري — يُساعد في إثراء بيانات العائلة</p>
              </div>

              <Input
                value={hijriBirthDate}
                onChange={(e) => setHijriBirthDate(e.target.value)}
                placeholder="مثال: ١٤٠٥/٦/١٥"
                className="h-14 text-base text-center rounded-xl border-2 border-border focus:border-primary"
                dir="rtl"
              />

              <div className="flex flex-col gap-3">
                <Button onClick={handleComplete} className="h-14 text-base rounded-xl gap-2">
                  <Check className="h-5 w-5" />
                  إتمام التسجيل
                </Button>
                <Button variant="ghost" onClick={handleComplete} className="h-12 text-sm text-muted-foreground rounded-xl">
                  تخطي هذه الخطوة
                </Button>
              </div>
            </div>
          )}

          {/* ===== DONE ===== */}
          {step === "done" && (
            <div className="text-center space-y-4 animate-in fade-in duration-300 py-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground">تم التسجيل بنجاح!</h2>
              <p className="text-sm text-muted-foreground">مرحباً بك، {selectedMember?.name}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
