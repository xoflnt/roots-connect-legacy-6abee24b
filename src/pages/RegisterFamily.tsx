import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TreePine, Loader2, Eye, EyeOff, Globe, Lock, Users, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/** Basic Arabic-to-Latin transliteration for slug generation */
function transliterate(arabic: string): string {
  const map: Record<string, string> = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th',
    'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
    'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
    'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ة': 'h', 'ى': 'a', 'ئ': 'y', 'ؤ': 'w',
  };
  return arabic
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u0640]/g, '') // remove diacritics + tatweel
    .split('')
    .map(ch => map[ch] || (ch === ' ' ? '-' : /[a-z0-9-]/.test(ch) ? ch : ''))
    .join('')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const SLUG_RE = /^[a-z][a-z0-9-]{2,29}$/;

export default function RegisterFamily() {
  const navigate = useNavigate();

  const [familyName, setFamilyName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Auto-generate slug from family name (only if user hasn't manually edited)
  useEffect(() => {
    if (!slugTouched && familyName.trim()) {
      // Strip common prefixes like "عائلة" / "آل" for a cleaner slug
      const cleaned = familyName.replace(/^(عائلة|آل|بنو|بني)\s*/g, '').trim();
      setSlug(transliterate(cleaned) || '');
    }
  }, [familyName, slugTouched]);

  const handleSlugChange = useCallback((val: string) => {
    setSlugTouched(true);
    setSlug(sanitizeSlug(val));
  }, []);

  const slugValid = SLUG_RE.test(slug);
  const passcodeValid = /^\d{6}$/.test(passcode);
  const canSubmit = familyName.trim().length >= 2
    && slugValid
    && adminPassword.length >= 6
    && passcodeValid
    && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("family-api/create-family", {
        body: {
          name: familyName.trim(),
          slug,
          adminPassword,
          passcode,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("تم إنشاء منصة العائلة بنجاح");
      navigate(`/?family=${slug}`);
    } catch (err: any) {
      const msg = err?.message || "حدث خطأ أثناء إنشاء المنصة";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background" dir="rtl">
      {/* Header */}
      <header
        className="shrink-0 z-50 flex items-center justify-center gap-2 px-4 md:px-6 py-4 border-b border-border/40 bg-card/60 backdrop-blur-xl"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <TreePine className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-lg font-extrabold text-foreground">نسابي</h1>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto p-4 md:p-8 space-y-6">

          {/* Hero */}
          <div className="text-center space-y-3 pt-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
              <TreePine className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">
              أنشئ منصة عائلتك
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              وثّق شجرة العائلة واحفظ تراثها في منصة خاصة لأفراد عائلتك
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">

            {/* 1. Family Name */}
            <section className="bg-card border border-border/50 rounded-2xl p-5 space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <label className="text-base font-bold text-foreground">اسم العائلة</label>
              </div>
              <Input
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="مثال: عائلة الخنيني"
                className="rounded-xl h-12 text-base"
                maxLength={50}
              />
            </section>

            {/* 2. Slug */}
            <section className="bg-card border border-border/50 rounded-2xl p-5 space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <label className="text-base font-bold text-foreground">الاسم المختصر</label>
              </div>
              <Input
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="khunaini"
                className="rounded-xl h-12 text-base font-mono"
                dir="ltr"
                maxLength={30}
              />
              {slug && (
                <div className={`text-sm rounded-xl px-3 py-2 ${
                  slugValid
                    ? "bg-primary/5 text-primary border border-primary/20"
                    : "bg-destructive/5 text-destructive border border-destructive/20"
                }`} dir="ltr">
                  {slugValid
                    ? <span>{slug}.nasaby.app</span>
                    : <span>الاسم المختصر يجب أن يبدأ بحرف، ٣ أحرف على الأقل، إنجليزي صغير وأرقام فقط</span>
                  }
                </div>
              )}
            </section>

            {/* 3. Admin Password */}
            <section className="bg-card border border-border/50 rounded-2xl p-5 space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <label className="text-base font-bold text-foreground">كلمة مرور الأدمن</label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="٦ أحرف على الأقل"
                  className="rounded-xl h-12 text-base pl-12"
                  dir="ltr"
                  maxLength={64}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {adminPassword && adminPassword.length < 6 && (
                <p className="text-xs text-destructive">يجب ٦ أحرف على الأقل</p>
              )}
            </section>

            {/* 4. Family Passcode */}
            <section className="bg-card border border-border/50 rounded-2xl p-5 space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                <label className="text-base font-bold text-foreground">رمز دخول أفراد العائلة</label>
              </div>
              <Input
                type="text"
                inputMode="numeric"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="٦ أرقام"
                className="rounded-xl h-12 text-base font-mono tracking-[0.3em] text-center"
                dir="ltr"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                هذا الرمز يُعطى لأفراد العائلة ليتمكنوا من التسجيل في المنصة
              </p>
            </section>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full min-h-[52px] rounded-xl font-bold text-base"
            >
              {submitting
                ? <Loader2 className="h-5 w-5 animate-spin ml-2" />
                : <TreePine className="h-5 w-5 ml-2" />
              }
              أنشئ منصة عائلتك
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
