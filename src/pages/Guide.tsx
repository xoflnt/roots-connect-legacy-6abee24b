import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { guideMockups } from "@/components/guide/GuideMockups";
import {
  TreePine, Search, UserCheck, UserCog, Map, Compass, GitBranch,
  AlignJustify, ScrollText, Scale, BookOpen, Smartphone, Send,
  Rocket, Zap, ChevronLeft, Home,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface GuideCard {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
  desc: string;
  steps: string[];
  actionLabel: string;
  action: () => void;
  /** Custom content rendered after steps (e.g. PWA sub-sections) */
  extra?: React.ReactNode;
}

interface GuideGroup {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  headerBg: string;
  headerColor: string;
  btnClass: string;
  cards: Omit<GuideCard, "action" | "actionLabel">[];
}

/* ── PWA install extra content ─────────────────── */
const PwaExtra = () => (
  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div className="rounded-xl border border-border/40 bg-muted/30 p-3 space-y-1.5">
      <p className="text-sm font-bold text-foreground">Android</p>
      <ul className="space-y-1">
        {["افتح القائمة في Chrome", "اختر \"إضافة للشاشة الرئيسية\"", "أو اضغط زر التثبيت المباشر"].map((t, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <ChevronLeft className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className="rounded-xl border border-border/40 bg-muted/30 p-3 space-y-1.5">
      <p className="text-sm font-bold text-foreground">iPhone</p>
      <ul className="space-y-1">
        {["افتح الصفحة في Safari (مهم)", "اضغط زر المشاركة ⬆️", "اختر \"إضافة إلى الشاشة الرئيسية\"", "اضغط \"إضافة\""].map((t, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <ChevronLeft className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-start gap-2 rounded-lg bg-amber-100/60 dark:bg-amber-900/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
        <span>⚠️</span>
        <span>على iPhone استخدم Safari فقط</span>
      </div>
    </div>
  </div>
);

/* ── Group definitions (static data) ──────────── */
const groups: GuideGroup[] = [
  {
    icon: Rocket,
    title: "ابدأ من هنا",
    subtitle: "للمستخدم الجديد — ابدأ بهذه الخطوات",
    headerBg: "bg-primary/10",
    headerColor: "text-primary",
    btnClass: "bg-primary/10 text-primary hover:bg-primary/20",
    cards: [
      {
        icon: UserCheck,
        iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
        iconColor: "text-emerald-700 dark:text-emerald-400",
        title: "التسجيل والتحقق",
        desc: "سجّل حسابك في الشجرة وأثبت هويتك كفرد من العائلة",
        steps: [
          "ابحث عن اسمك في الشجرة واختره من القائمة",
          "أدخل رمز العائلة السري",
          "أدخل رقم جوالك السعودي",
          "أضف تاريخ ميلادك الهجري (اختياري)",
        ],
      },
      {
        icon: Search,
        iconBg: "bg-blue-100 dark:bg-blue-900/40",
        iconColor: "text-blue-700 dark:text-blue-400",
        title: "البحث عن الأفراد",
        desc: "ابحث عن أي فرد في العائلة بالاسم أو جزء منه",
        steps: [
          "اكتب الاسم الأول أو جزءاً منه",
          "النتائج تظهر بصيغة: الاسم ← الأب ← الجد",
          "اضغط على النتيجة لعرض بطاقة الشخص الكاملة",
          "تظهر تواريخ الميلاد والوفاة للتمييز بين الأسماء المتشابهة",
        ],
      },
      {
        icon: UserCog,
        iconBg: "bg-purple-100 dark:bg-purple-900/40",
        iconColor: "text-purple-700 dark:text-purple-400",
        title: "الملف الشخصي",
        desc: "بعد التسجيل يمكنك إدارة ملفك الشخصي مباشرة",
        steps: [
          "عدّل تاريخ ميلادك عبر منتقي التاريخ الهجري",
          "أضف أو احذف زوجات",
          "أضف أبناءك مع تحديد الوالدة من القائمة",
          "جميع التعديلات تُحفظ فوراً",
        ],
      },
    ],
  },
  {
    icon: Map,
    title: "استكشف الشجرة",
    subtitle: "٤ طرق مختلفة لتصفح شجرة العائلة",
    headerBg: "bg-accent/15",
    headerColor: "text-accent",
    btnClass: "bg-accent/10 text-accent hover:bg-accent/20",
    cards: [
      {
        icon: Map,
        iconBg: "bg-amber-100 dark:bg-amber-900/40",
        iconColor: "text-amber-700 dark:text-amber-400",
        title: "وضع الخريطة 🗺️",
        badge: "الافتراضي",
        badgeBg: "bg-amber-100 dark:bg-amber-900/40",
        badgeColor: "text-amber-700 dark:text-amber-400",
        desc: "الشجرة الكاملة بشكل تفاعلي — كبّر وصغّر وتنقل بحرية",
        steps: [
          "اضغط (+) أسفل البطاقة لعرض الأبناء",
          "اضغط (−) لطي الفرع",
          "البطاقات ملونة حسب الوالدة لتمييز الفروع",
          "استخدم التكبير والتصغير لاستكشاف الشجرة",
          "زر \"أين أنا؟\" يعيدك لموقعك في الشجرة",
        ],
      },
      {
        icon: Compass,
        iconBg: "bg-green-100 dark:bg-green-900/40",
        iconColor: "text-green-700 dark:text-green-400",
        title: "وضع التنقل 🧭",
        badge: "الأسهل للموبايل",
        badgeBg: "bg-green-100 dark:bg-green-900/40",
        badgeColor: "text-green-700 dark:text-green-400",
        desc: "تنقل في الشجرة بطريقة بسيطة — شخص واحد في كل مرة",
        steps: [
          "يبدأ من ملفك الشخصي تلقائياً",
          "اضغط على بطاقة الأب للصعود",
          "اضغط على أي ابن للنزول",
          "اسحب يميناً أو يساراً للتنقل بين الأشقاء",
          "شريط المسار يوضح موقعك دائماً",
        ],
      },
      {
        icon: GitBranch,
        iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
        iconColor: "text-emerald-700 dark:text-emerald-400",
        title: "وضع الفروع 🌿",
        desc: "استعرض العائلة مقسمة حسب الفروع الثلاثة",
        steps: [
          "اختر الفرع: محمد 🟡 أو ناصر 🟢 أو عبدالعزيز 🟠",
          "على الجوال: اعرض الأجيال بشكل جميل ومرتب",
          "على الحاسوب: قائمة قابلة للطي والتوسيع",
          "اضغط على أي شخص لعرض بطاقته الكاملة",
        ],
      },
      {
        icon: AlignJustify,
        iconBg: "bg-slate-100 dark:bg-slate-800/60",
        iconColor: "text-slate-700 dark:text-slate-400",
        title: "وضع القائمة ☰",
        desc: "تصفح جميع أفراد العائلة في قائمة منظمة قابلة للطي",
        steps: [
          "صفّ الأفراد مع إمكانية التوسيع والطي",
          "ألوان حسب الفرع والعمق",
          "اضغط على أي شخص لعرض بطاقته",
        ],
      },
    ],
  },
  {
    icon: Zap,
    title: "ميزات متقدمة",
    subtitle: "اكتشف كل ما تقدمه المنصة",
    headerBg: "bg-purple-100/50 dark:bg-purple-900/30",
    headerColor: "text-purple-700 dark:text-purple-400",
    btnClass: "bg-muted hover:bg-muted/80 text-foreground",
    cards: [
      {
        icon: ScrollText,
        iconBg: "bg-amber-100 dark:bg-amber-900/40",
        iconColor: "text-amber-700 dark:text-amber-400",
        title: "عرض النسب 📜",
        desc: "اعرض سلسلة نسب أي شخص من الجد المؤسس حتى اليوم",
        steps: [
          "ابحث عن الشخص واضغط على اسمه",
          "تظهر السلسلة الكاملة: الجد ← الأب ← الشخص",
          "شارك النسب كصورة أو عبر واتساب",
          "حمّل بطاقة النسب كملف",
        ],
      },
      {
        icon: Scale,
        iconBg: "bg-blue-100 dark:bg-blue-900/40",
        iconColor: "text-blue-700 dark:text-blue-400",
        title: "حاسبة القرابة ⚖️",
        desc: "احسب درجة القرابة بين أي فردين من العائلة بدقة",
        steps: [
          "اختر الشخص الأول (يُملأ بك تلقائياً إن كنت مسجلاً)",
          "اختر الشخص الثاني من البحث",
          "اضغط \"احسب القرابة\"",
          "تظهر النتيجة: \"ابن عمه\" أو \"أخوه الشقيق\" إلخ",
          "شارك النتيجة كبطاقة جميلة عبر واتساب",
        ],
      },
      {
        icon: BookOpen,
        iconBg: "bg-orange-100 dark:bg-orange-900/40",
        iconColor: "text-orange-700 dark:text-orange-400",
        title: "المستندات التاريخية 📋",
        desc: "أرشيف للوثائق والمستندات التاريخية للعائلة",
        steps: [
          "استعرض الوثائق المرفوعة",
          "كبّر الوثيقة وتنقل فيها بإصبعين",
          "أضف إعجابك أو تعليقك",
          "حمّل نسخة من الوثيقة",
        ],
      },
      {
        icon: Smartphone,
        iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
        iconColor: "text-indigo-700 dark:text-indigo-400",
        title: "تثبيت التطبيق 📱",
        badge: "موصى به",
        badgeBg: "bg-indigo-100 dark:bg-indigo-900/40",
        badgeColor: "text-indigo-700 dark:text-indigo-400",
        desc: "أضف البوابة لشاشتك الرئيسية لتجربة أفضل بدون متصفح",
        steps: [],
        extra: <PwaExtra />,
      },
      {
        icon: Send,
        iconBg: "bg-rose-100 dark:bg-rose-900/40",
        iconColor: "text-rose-700 dark:text-rose-400",
        title: "إرسال طلب تعديل ✏️",
        desc: "إذا وجدت معلومة خاطئة أو ناقصة يمكنك إرسال طلب تعديل",
        steps: [
          "من ملفك الشخصي اضغط \"إرسال طلب تعديل\"",
          "أو من أي مكان عبر زر \"أرسل طلب تعديل\" في الأسفل",
          "اكتب التعديل المطلوب بوضوح",
          "يصل الطلب للمشرف مباشرة للمراجعة",
        ],
      },
    ],
  },
];

/* ── Action labels & handlers per card (by title) ── */
function useCardActions() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const dispatch = (event: string) => {
    navigate("/");
    // Small delay so Index mounts before event fires
    setTimeout(() => window.dispatchEvent(new CustomEvent(event)), 80);
  };

  const actionMap: Record<string, { label: string; action: () => void }> = {
    "التسجيل والتحقق": {
      label: "سجّل الآن ←",
      action: () => { navigate("/"); setTimeout(() => window.dispatchEvent(new CustomEvent("open-onboarding")), 80); },
    },
    "البحث عن الأفراد": { label: "ابحث الآن ←", action: () => navigate("/") },
    "الملف الشخصي": { label: "ملفي الشخصي ←", action: () => navigate("/profile") },
    "وضع الخريطة 🗺️": { label: "افتح الخريطة ←", action: () => dispatch("switch-to-map") },
    "وضع التنقل 🧭": { label: "جرّب التنقل ←", action: () => dispatch("switch-to-navigate") },
    "وضع الفروع 🌿": { label: "استعرض الفروع ←", action: () => dispatch("switch-to-branches") },
    "وضع القائمة ☰": { label: "افتح القائمة ←", action: () => dispatch("switch-to-list") },
    "عرض النسب 📜": { label: "اعرض نسبك ←", action: () => navigate(`/person/${currentUser?.memberId || "100"}`) },
    "حاسبة القرابة ⚖️": { label: "احسب القرابة ←", action: () => dispatch("switch-to-kinship") },
    "المستندات التاريخية 📋": { label: "استعرض المستندات ←", action: () => navigate("/documents") },
    "تثبيت التطبيق 📱": { label: "تعرّف على التثبيت ↑", action: () => {} },
    "إرسال طلب تعديل ✏️": {
      label: "أرسل طلب تعديل ←",
      action: () => window.dispatchEvent(new CustomEvent("open-request-form")),
    },
  };

  return actionMap;
}

/* ── Main component ──────────────────────────────── */
export default function Guide() {
  const navigate = useNavigate();
  const actionMap = useCardActions();

  return (
    <motion.div
      className="flex flex-col h-[100dvh] bg-background"
      dir="rtl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header
        className="shrink-0 z-50 flex items-center justify-between gap-2 px-4 md:px-6 py-3 border-b border-border/40 bg-card/60 backdrop-blur-xl"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-4.5 w-4.5 text-primary" />
          </div>
          <h1 className="text-base md:text-lg font-extrabold text-foreground">دليل الاستخدام</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} className="h-11 w-11 rounded-xl">
          <Home className="h-5 w-5" />
        </Button>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-2">
        {/* Hero */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm">
            تعرّف على المنصة
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
            كيف تستخدم بوابة تراث الخنيني
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            دليل شامل لجميع خصائص المنصة مع شروحات مبسطة
          </p>
        </div>

        {/* Groups */}
        {groups.map((group, gi) => (
          <div key={gi}>
            {/* Section header */}
            <motion.div
              className="mt-8 mb-4 flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: gi * 0.1, duration: 0.3 }}
            >
              <div className={`w-9 h-9 rounded-xl ${group.headerBg} flex items-center justify-center`}>
                <group.icon className={`h-5 w-5 ${group.headerColor}`} />
              </div>
              <div>
                <h3 className={`text-lg font-extrabold ${group.headerColor}`}>{group.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{group.subtitle}</p>
              </div>
            </motion.div>

            {/* Cards */}
            <motion.div
              className="space-y-3"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {group.cards.map((card, ci) => {
                const actions = actionMap[card.title];
                return (
                  <motion.div
                    key={ci}
                    variants={staggerItem}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 shadow-sm"
                  >
                    {/* Card header */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                        <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                      </div>
                      <h4 className="text-base font-bold text-foreground">{card.title}</h4>
                      {card.badge && (
                        <span className={`mr-auto rounded-full text-xs px-2 py-0.5 ${card.badgeBg} ${card.badgeColor}`}>
                          {card.badge}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{card.desc}</p>

                    {/* Steps */}
                    {card.steps.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {card.steps.map((step, si) => (
                          <li key={si} className="flex items-start gap-2 text-sm text-foreground">
                            <ChevronLeft className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Extra (PWA) */}
                    {card.extra}

                    {/* Mockup preview */}
                    {guideMockups[card.title] && guideMockups[card.title]}
                    {actions && actions.label !== "تعرّف على التثبيت ↑" && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={actions.action}
                        className={`mt-4 w-full rounded-xl min-h-[44px] text-sm font-medium px-4 py-2 transition-colors ${group.btnClass}`}
                      >
                        {actions.label}
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        ))}

        {/* Footer CTA */}
        <motion.div
          className="mt-10 mb-8 rounded-2xl bg-primary text-primary-foreground p-6 text-center space-y-3"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <TreePine className="h-8 w-8 mx-auto opacity-90" />
          <h3 className="text-lg font-bold">جاهز؟ ابدأ الاستكشاف</h3>
          <p className="text-sm opacity-80">شجرة عائلة الخنيني في انتظارك</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-white/20 hover:bg-white/30 text-primary-foreground rounded-xl px-6 py-3 min-h-[44px] font-medium"
          >
            <TreePine className="h-5 w-5 ml-2" />
            ابدأ تصفح الشجرة ←
          </Button>
        </motion.div>
      </div>
      </main>
    </motion.div>
  );
}
