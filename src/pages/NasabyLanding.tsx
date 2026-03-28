import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TreePine, Lock, Smartphone, Trees, Check, ExternalLink, MessageCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";

const FEATURES = [
  {
    icon: Trees,
    title: "شجرة تفاعلية",
    desc: "تصفح شجرة عائلتك بصرياً واكتشف صلات القرابة بين أي فردين",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  {
    icon: Lock,
    title: "خاصة وآمنة",
    desc: "منصتك الخاصة برابط مخصص، بياناتك لعائلتك فقط",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/40",
  },
  {
    icon: Smartphone,
    title: "تعمل على الجوال",
    desc: "تطبيق ويب متكامل يعمل على كل الأجهزة بدون تحميل",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/40",
  },
];

const PRICING_FEATURES = [
  "رابط خاص بعائلتك (yourfamily.nasaby.app)",
  "عدد غير محدود من أعضاء العائلة",
  "شجرة تفاعلية كاملة",
  "حاسبة القرابة",
  "لوحة إدارة للمسؤول",
  "تعمل على الجوال",
];

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

function DemoInput() {
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

  return (
    <div className="max-w-md mx-auto space-y-3">
      <Input
        value={firstName}
        onChange={e => setFirstName(e.target.value)}
        placeholder="اسمك الأول... مثال: سعود"
        className="h-14 rounded-2xl text-base text-center"
      />
      <Input
        value={familyInput}
        onChange={e => setFamilyInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && go()}
        placeholder="اسم عائلتك... مثال: العتيبي"
        className="h-14 rounded-2xl text-base text-center"
      />
      {familyInput.trim() && (
        <p className="text-xs text-muted-foreground" dir="ltr">
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
    </div>
  );
}

export default function NasabyLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-background overflow-x-hidden" dir="rtl">

      {/* ═══════ HERO ═══════ */}
      <div className="relative">
        {/* Background */}
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
          <div className="absolute inset-0 dark:bg-black/40 bg-black/20" />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, transparent 40%, hsl(var(--background)) 100%)',
            }}
          />
        </div>

        {/* Header */}
        <header className="relative z-20 flex items-center justify-between px-4 md:px-8" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
          <div className="flex items-center gap-2">
            <TreePine className="h-6 w-6 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
            <span className="text-lg font-extrabold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>نسبي</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Hero content */}
        <section className="relative z-20 flex flex-col items-center justify-center px-4 text-center pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/25">
              <TreePine className="h-10 w-10 text-white" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }} />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              وثّق تراث عائلتك
              <br />
              واحفظه للأجيال القادمة
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-lg mx-auto leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              منصة عربية متخصصة في شجرة العائلة، لكل عائلة منصتها الخاصة
            </p>
            <Button
              onClick={() => navigate("/register")}
              size="lg"
              className="min-h-[56px] rounded-2xl font-bold text-lg px-8 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <TreePine className="h-5 w-5 ml-2" />
              ابدأ الآن — أنشئ منصة عائلتك
            </Button>
          </div>
        </section>
      </div>

      {/* ═══════ FEATURES ═══════ */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground text-center mb-12">
            لماذا نسبي؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 shadow-sm text-center">
                <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mx-auto`}>
                  <f.icon className={`h-7 w-7 ${f.color}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ LIVE EXAMPLE ═══════ */}
      <section className="py-16 md:py-24 px-4 bg-muted/50">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
              شاهد المنصة مباشرة
            </h2>
            <p className="text-muted-foreground">
              عائلة الخنيني — أول عائلة على منصة نسبي
            </p>
          </div>

          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-lg max-w-md mx-auto space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <TreePine className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-extrabold text-foreground">عائلة الخنيني</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/50 rounded-xl p-3 border border-border/30">
                <p className="text-muted-foreground text-xs">الأعضاء</p>
                <p className="font-bold text-foreground text-lg">+٤١٠</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 border border-border/30">
                <p className="text-muted-foreground text-xs">الفروع</p>
                <p className="font-bold text-foreground text-lg">٣</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-mono" dir="ltr">khunaini.nasaby.app</p>
            <a
              href="https://khunaini.nasaby.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold rounded-xl px-6 py-3 min-h-[48px] hover:bg-primary/90 transition-colors"
            >
              زر منصة الخنيني
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══════ DEMO CTA ═══════ */}
      <section className="py-16 md:py-24 px-4 bg-primary/5">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
            شوف منصة عائلتك في ثواني
          </h2>
          <p className="text-muted-foreground text-sm">
            اكتب اسم عائلتك وشاهد كيف ستبدو منصتك التجريبية
          </p>
          <DemoInput />
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
              باقة واحدة، بدون تعقيد
            </h2>
          </div>

          <div className="bg-card border-2 border-accent/30 rounded-3xl p-8 shadow-lg max-w-sm mx-auto space-y-6">
            <div className="space-y-1">
              <p className="text-4xl font-extrabold text-foreground">٩٩ <span className="text-lg font-bold text-muted-foreground">ريال / سنوياً</span></p>
            </div>
            <ul className="space-y-3 text-right">
              {PRICING_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                  <Check className="h-5 w-5 text-accent shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => navigate("/register")}
              className="w-full min-h-[52px] rounded-xl font-bold text-base bg-accent text-accent-foreground hover:bg-accent/90"
            >
              ابدأ الآن مجاناً — ثم ٩٩ ريال/سنة
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="py-8 px-4 border-t border-border/30 bg-muted/30">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <TreePine className="h-4 w-4 text-primary" />
            <span className="font-bold text-foreground">نسبي</span>
            <span>— جميع الحقوق محفوظة</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/966500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              تواصل معنا
            </a>
            <span className="text-border">|</span>
            <button className="hover:text-foreground transition-colors">سياسة الخصوصية</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
