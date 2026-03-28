import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TreePine, Trees, Link2, ScrollText, Search, Shield, Smartphone,
  PenLine, Database, Rocket, MessageCircle, Check, ChevronDown, Eye,
  Loader2, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ThemeToggle } from "@/components/ThemeToggle";
import { applyTatweel } from "@/utils/tatweelUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Constants ──────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = "966544033920";

const FEATURES = [
  {
    icon: Trees,
    title: "شجرة تفاعلية",
    desc: "تصفح شجرة العائلة بصرياً — كبّر، صغّر، تنقّل بين الأجيال",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  {
    icon: Link2,
    title: "حاسبة القرابة",
    desc: "اعرف صلة القرابة بين أي شخصين في العائلة بالعربي",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/40",
  },
  {
    icon: ScrollText,
    title: "سلسلة النسب",
    desc: "شوف نسب أي فرد من الشخص لجده الأكبر",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/40",
  },
  {
    icon: Search,
    title: "بحث ذكي",
    desc: "ابحث عن أي فرد بالاسم — يتعامل مع الأخطاء الإملائية",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/40",
  },
  {
    icon: Shield,
    title: "خاصة وآمنة",
    desc: "منصتك على رابط خاص — بياناتك لعائلتك فقط",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/40",
  },
  {
    icon: Smartphone,
    title: "تعمل على كل جهاز",
    desc: "جوال، تابلت، كمبيوتر — بدون تحميل أي تطبيق",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-100 dark:bg-teal-900/40",
  },
];

const STEPS = [
  { icon: PenLine, num: "١", title: "تواصل معنا", desc: "أرسل لنا اسم عائلتك وعدد الأفراد التقريبي" },
  { icon: Database, num: "٢", title: "ندخّل بياناتك", desc: "نساعدك تدخل بيانات الشجرة أو ندخلها لك" },
  { icon: Rocket, num: "٣", title: "أطلق منصتك", desc: "منصة جاهزة باسم عائلتك يقدر كل فرد يدخلها" },
];

const TESTIMONIALS = [
  { text: "المنصة سهّلت علينا نعرف أقاربنا البعيدين", author: "أبو محمد" },
  { text: "حاسبة القرابة أفضل ميزة — ما أحد يقدر يسويها يدوي", author: "سارة" },
  { text: "أخيراً شجرتنا العائلية بشكل رقمي ومنظم", author: "عبدالرحمن" },
];

const PRICING_FEATURES = [
  "رابط خاص بعائلتك (yourfamily.nasaby.app)",
  "عدد غير محدود من أعضاء العائلة",
  "شجرة تفاعلية كاملة",
  "حاسبة القرابة",
  "لوحة إدارة للمسؤول",
  "تعمل على الجوال",
];

const FAQ = [
  {
    q: "هل بيانات عائلتي آمنة؟",
    a: "نعم — كل عائلة لها منصة خاصة مستقلة لا يراها أحد غير أفراد العائلة. البيانات مشفرة ومحمية.",
  },
  {
    q: "كيف أدخل بيانات العائلة؟",
    a: "نساعدك! يمكنك إرسال البيانات بأي شكل (ملف Excel، صور، أو حتى رسالة واتساب) ونحن ندخلها لك.",
  },
  {
    q: "كم شخص تستوعب المنصة؟",
    a: "عدد غير محدود — عندنا عائلة فيها أكثر من ٤٠٠ عضو وتشتغل بسلاسة.",
  },
  {
    q: "هل تحتاج تحميل تطبيق؟",
    a: "لا — المنصة تعمل من المتصفح مباشرة على الجوال والكمبيوتر. وتقدر تضيفها كتطبيق على الشاشة الرئيسية.",
  },
  {
    q: "هل تدعم الزوجات المتعددة والفروع المعقدة؟",
    a: "نعم بالكامل — المنصة مبنية خصيصاً للعوائل السعودية بكل تعقيداتها: زوجات متعددة، فروع، أجيال متعددة.",
  },
];

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 } as any,
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease: "easeOut" },
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } } as any,
  viewport: { once: true },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 } as any,
  transition: { duration: 0.4, ease: "easeOut" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Transliterate Arabic family name to a slug for subdomain */
function arabicToSlug(name: string): string {
  const map: Record<string, string> = {
    'ا':'a','أ':'a','إ':'i','آ':'a','ب':'b','ت':'t','ث':'th','ج':'j','ح':'h','خ':'kh',
    'د':'d','ذ':'dh','ر':'r','ز':'z','س':'s','ش':'sh','ص':'s','ض':'d','ط':'t','ظ':'z',
    'ع':'a','غ':'gh','ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w',
    'ي':'y','ة':'h','ى':'a','ئ':'y','ؤ':'w',
  };
  return name
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/^(ال|عائلة|آل|بنو|بني)\s*/g, '')
    .trim()
    .split('')
    .map(ch => map[ch] || (ch === ' ' ? '-' : /[a-z0-9-]/.test(ch) ? ch : ''))
    .join('')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'demo';
}

// ─── DemoInputs component (reused in hero and second CTA) ────────────────────

interface DemoInputsProps {
  glass?: boolean;
}

function DemoInputs({ glass = false }: DemoInputsProps) {
  const [firstName, setFirstName] = useState("");
  const [familyInput, setFamilyInput] = useState("");
  const slug = arabicToSlug(familyInput);
  const canGo = firstName.trim().length >= 2 && familyInput.trim().length >= 2;

  const go = () => {
    if (!canGo) return;
    const name = familyInput.trim().replace(/^(عائلة|آل)\s*/, '');
    const first = firstName.trim();
    window.location.href = `https://${slug}.nasaby.app?name=${encodeURIComponent(name)}&firstName=${encodeURIComponent(first)}`;
  };

  const inputClass = glass
    ? "h-14 rounded-2xl text-base text-center bg-white/15 backdrop-blur-md border border-white/25 text-white placeholder:text-white/60 focus-visible:ring-white/30"
    : "h-14 rounded-2xl text-base text-center";

  return (
    <div className="max-w-md mx-auto space-y-3 w-full">
      <Input
        value={firstName}
        onChange={e => setFirstName(e.target.value)}
        placeholder="اسمك الأول — مثال: سعود"
        className={inputClass}
      />
      <Input
        value={familyInput}
        onChange={e => setFamilyInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && go()}
        placeholder="اسم عائلتك — مثال: العتيبي"
        className={inputClass}
      />
      {familyInput.trim() && (
        <p className={`text-xs ${glass ? "text-white/70" : "text-muted-foreground"}`} dir="ltr">
          {slug}.nasaby.app
        </p>
      )}
      <Button
        onClick={go}
        disabled={!canGo}
        size="lg"
        className="w-full min-h-[52px] rounded-2xl font-bold text-base bg-accent text-accent-foreground hover:bg-accent/90"
      >
        <Eye className="h-5 w-5 ml-2" />
        شوف منصة عائلتك
      </Button>
      <p className={`text-xs ${glass ? "text-white/60" : "text-muted-foreground"}`}>
        مجاني — شوف كيف بتطلع منصتك في ثواني
      </p>
    </div>
  );
}

// ─── Gold Divider ─────────────────────────────────────────────────────────────

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <div className="h-px w-16 bg-accent/40" />
      <div className="w-2 h-2 rounded-full bg-accent/60" />
      <div className="h-px w-16 bg-accent/40" />
    </div>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full text-right flex items-center justify-between gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors">
        <span className="font-bold text-foreground text-sm md:text-base">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [members, setMembers] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim().length >= 2 && /^05\d{8}$/.test(phone) && familyName.trim().length >= 2 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await supabase.from("demo_leads").insert({
        family_name: familyName.trim(),
        contact_name: name.trim(),
        phone: phone.trim(),
        estimated_members: members.trim() || null,
        subdomain: null,
      });

      try {
        await supabase.functions.invoke("notify-demo-lead", {
          body: {
            family_name: familyName.trim(),
            contact_name: name.trim(),
            phone: phone.trim(),
            estimated_members: members.trim() || null,
            subdomain: "landing-page",
          },
        });
      } catch {}

      setSubmitted(true);
    } catch {
      toast.error("حدث خطأ، حاول مرة ثانية");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-xl font-extrabold text-foreground">شكراً لتواصلك!</h3>
        <p className="text-sm text-muted-foreground">سنتواصل معك خلال ٢٤ ساعة</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm max-w-md mx-auto space-y-4">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-extrabold text-foreground">أرسل طلبك</h3>
        <p className="text-xs text-muted-foreground">نرد خلال ٢٤ ساعة</p>
      </div>

      <div className="space-y-3">
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="الاسم الكامل *"
          className="rounded-xl h-12"
        />
        <Input
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
          placeholder="رقم الجوال (05xxxxxxxx) *"
          className="rounded-xl h-12"
          dir="ltr"
          inputMode="tel"
        />
        <Input
          value={familyName}
          onChange={e => setFamilyName(e.target.value)}
          placeholder="اسم العائلة *"
          className="rounded-xl h-12"
        />
        <Input
          value={members}
          onChange={e => setMembers(e.target.value)}
          placeholder="عدد أفراد العائلة التقريبي (اختياري)"
          className="rounded-xl h-12"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full min-h-[48px] rounded-xl font-bold text-base"
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <Send className="h-5 w-5 ml-2" />}
        أرسل طلبك
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NasabyLanding() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const scrollToDemo = () => {
    document.getElementById("demo-cta")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-[100dvh] bg-background overflow-x-hidden" dir="rtl">

      {/* ══════════════════════════════════════════════
          ١. STICKY HEADER
      ══════════════════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm"
            : "bg-transparent"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
          <div className="flex items-center gap-2">
            <TreePine
              className="h-6 w-6"
              style={{
                color: scrolled ? "hsl(var(--primary))" : "white",
                filter: scrolled ? "none" : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
              }}
            />
            <span
              className="text-lg font-extrabold transition-colors duration-300"
              style={{
                color: scrolled ? "hsl(var(--foreground))" : "white",
                textShadow: scrolled ? "none" : "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              نسبي
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          ٢. HERO — الديمو داخل الهيرو
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-[90dvh] flex flex-col items-center justify-center -mt-[56px] pt-[56px]">
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <picture>
            <source media="(max-width: 768px)" srcSet="/images/hero-bg-mobile.webp" type="image/webp" />
            <source srcSet="/images/hero-bg.webp" type="image/webp" />
            <img
              src="/images/hero-bg.jpg"
              alt=""
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-top select-none"
            />
          </picture>
          <div className="absolute inset-0 dark:bg-black/50 bg-black/30" />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, transparent 30%, hsl(var(--background)) 100%)",
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 py-20 md:py-28 w-full max-w-2xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/25"
          >
            <TreePine className="h-10 w-10 text-white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-white leading-tight"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
          >
            {applyTatweel("منصة عائلتك الرقمية")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm md:text-lg text-white/90 max-w-lg mx-auto leading-relaxed"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
          >
            وثّق شجرة عائلتك، اكتشف صلات القرابة، واحفظ تراثكم للأجيال — في منصة خاصة باسم عائلتك
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full"
          >
            <GoldDivider />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full"
          >
            <DemoInputs glass />
          </motion.div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: 60 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ٣. FEATURES — ٦ مميزات
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 bg-background">
        <div className="max-w-5xl mx-auto space-y-12">
          <motion.div {...fadeInUp} className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              {applyTatweel("كل اللي تحتاجه عائلتك في مكان واحد")}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              منصة متكاملة مبنية خصيصاً للعوائل العربية
            </p>
          </motion.div>

          <motion.div
            {...staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                {...staggerItem}
                className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center`}>
                  <f.icon className={`h-7 w-7 ${f.color}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ٤. HOW IT WORKS — ٣ خطوات
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div {...fadeInUp} className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              {applyTatweel("٣ خطوات وعائلتك على المنصة")}
            </h2>
          </motion.div>

          <motion.div
            {...staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-10 right-[16.67%] left-[16.67%] h-px bg-accent/30" />

            {STEPS.map((s) => (
              <motion.div
                key={s.num}
                {...staggerItem}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-card border-2 border-accent/40 flex items-center justify-center shadow-sm z-10 relative">
                    <span className="text-3xl font-extrabold text-accent leading-none">{s.num}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground flex items-center justify-center gap-2">
                    <s.icon className="h-5 w-5 text-accent" />
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ٥. TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 bg-background">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div {...fadeInUp} className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              عوائل سعودية تثق بنسبي
            </h2>
            <p className="text-muted-foreground text-sm">
              أكثر من ٤٠٠ عضو في أول عائلة — ٦ أجيال موثّقة — ٣ فروع رئيسية
            </p>
          </motion.div>

          <motion.div
            {...staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.author}
                {...staggerItem}
                className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-extrabold text-lg">"</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed font-medium">
                  {t.text}
                </p>
                <p className="text-xs text-muted-foreground">— {t.author}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...fadeInUp} className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-2xl px-6 py-3">
              <TreePine className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-foreground">عائلتك ممكن تكون التالية</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ٦. SECOND DEMO CTA
      ══════════════════════════════════════════════ */}
      <section id="demo-cta" className="py-16 md:py-24 px-4 bg-primary/5">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <motion.div {...fadeInUp} className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              {applyTatweel("جرّب الحين — مجاناً")}
            </h2>
            <p className="text-muted-foreground text-sm">
              شوف شكل منصة عائلتك في ثواني بدون تسجيل
            </p>
          </motion.div>
          <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
            <DemoInputs />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ٧. PRICING + CONTACT FORM
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 bg-background">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div {...fadeInUp} className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              {applyTatweel("كل عائلة لها احتياج مختلف")}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              نحدد لك السعر المناسب حسب حجم عائلتك واحتياجاتك
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-3xl mx-auto">
            {/* بطاقة المميزات */}
            <motion.div
              {...fadeInUp}
              className="bg-card border-2 border-accent/30 rounded-2xl p-6 shadow-sm space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
                <TreePine className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-lg font-extrabold text-foreground text-center">باقة مخصصة لعائلتك</h3>
              <ul className="space-y-2.5 text-right">
                {PRICING_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank")}
                variant="outline"
                className="w-full min-h-[48px] rounded-xl font-bold text-sm border-emerald-400/50 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <MessageCircle className="h-4 w-4 ml-2" />
                أو تواصل عبر واتساب
              </Button>
            </motion.div>

            {/* فورم التواصل */}
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ٨. FAQ
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto space-y-8">
          <motion.div {...fadeInUp} className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              أسئلة شائعة
            </h2>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border/50 rounded-2xl shadow-sm divide-y divide-border/30 overflow-hidden"
          >
            {FAQ.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ٩. FINAL CTA
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 bg-primary/5">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <motion.div {...fadeInUp} className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mx-auto">
              <TreePine className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-foreground leading-tight">
              {applyTatweel("ابدأ اليوم — منصة عائلتك تنتظرك")}
            </h2>
          </motion.div>
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <Button
              onClick={scrollToDemo}
              size="lg"
              className="min-h-[52px] rounded-2xl font-bold text-base px-8 bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto"
            >
              <TreePine className="h-5 w-5 ml-2" />
              جرّب الديمو مجاناً
            </Button>
            <Button
              onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank")}
              size="lg"
              variant="outline"
              className="min-h-[52px] rounded-2xl font-bold text-base px-8 w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5 ml-2" />
              تواصل معنا
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ١٠. FOOTER
      ══════════════════════════════════════════════ */}
      <footer
        className="py-8 px-4 border-t border-border/30 bg-muted/30"
        style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <TreePine className="h-4 w-4 text-primary" />
              <span className="font-bold text-foreground">نسبي</span>
              <span>— منصة شجرة العائلة العربية</span>
            </div>
            <span className="text-xs">© ٢٠٢٦ جميع الحقوق محفوظة</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              تواصل معنا
            </a>
            <span className="text-border">|</span>
            <button className="hover:text-foreground transition-colors">
              سياسة الخصوصية
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
