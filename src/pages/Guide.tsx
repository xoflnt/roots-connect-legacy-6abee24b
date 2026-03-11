import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TreePine, Search, UserCheck, Phone, GitBranch, Users, TableProperties, List, Home, ChevronLeft, BookOpen, Edit, Shield } from "lucide-react";

const sections = [
  {
    icon: TreePine,
    title: "تصفح الشجرة",
    desc: "الواجهة الرئيسية تعرض شجرة العائلة بشكل تفاعلي. كل بطاقة تمثل فرداً من العائلة مع اسمه وتواريخه.",
    tips: [
      "اضغط على زر (+) أسفل البطاقة لعرض الأبناء",
      "اضغط على زر (−) لطي الفرع",
      "البطاقات ملونة حسب الأم لتمييز الفروع",
      "استخدم التكبير والتصغير لاستكشاف الشجرة",
    ],
    mockup: (
      <div className="flex flex-col items-center gap-3 p-4">
        <div className="w-40 h-16 rounded-xl border-2 border-primary/30 bg-card flex flex-col items-center justify-center shadow-sm">
          <span className="text-xs font-bold text-foreground">ناصر سعدون الخنيني</span>
          <span className="text-[9px] text-muted-foreground">الجد المؤسس</span>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex gap-4">
          <div className="w-28 h-12 rounded-lg border border-border bg-card flex items-center justify-center shadow-sm">
            <span className="text-[10px] font-semibold text-foreground">زيد بن ناصر</span>
          </div>
          <div className="w-28 h-12 rounded-lg border border-border bg-card flex items-center justify-center shadow-sm">
            <span className="text-[10px] font-semibold text-foreground">لطيفة بنت ناصر</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Search,
    title: "البحث عن الأفراد",
    desc: "استخدم شريط البحث في أعلى الصفحة للعثور على أي فرد. النتائج تعرض سلسلة النسب للتمييز بين الأسماء المتشابهة.",
    tips: [
      "اكتب الاسم الأول أو جزء منه",
      "النتائج تظهر بصيغة: الاسم ← الأب ← الجد",
      "تظهر تواريخ الميلاد والوفاة للتمييز",
    ],
    mockup: (
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">محمد...</span>
        </div>
        <div className="rounded-xl border border-border/50 bg-background overflow-hidden">
          <div className="px-3 py-2 border-b border-border/20 flex items-center gap-2">
            <UserCheck className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-medium">محمد ← زيد ← ناصر</span>
          </div>
          <div className="px-3 py-2 flex items-center gap-2">
            <UserCheck className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-medium">محمد ← فهد ← محمد</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: UserCheck,
    title: "التسجيل والتحقق",
    desc: "سجّل حسابك عبر البحث عن اسمك في الشجرة ثم التحقق من هويتك برقم جوال سعودي عبر واتساب.",
    tips: [
      "ابحث عن اسمك واختره من النتائج",
      "أدخل رقم جوالك السعودي",
      "تحقق عبر واتساب (رابط أو رمز QR)",
      "اختيارياً: أدخل تاريخ ميلادك الهجري",
    ],
    mockup: (
      <div className="p-4 flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${s <= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {s}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-muted-foreground text-center">
          ترحيب → دليل → بحث الاسم → تحقق الجوال → تاريخ الميلاد
        </div>
      </div>
    ),
  },
  {
    icon: Edit,
    title: "الملف الشخصي والتعديل",
    desc: "بعد التسجيل يمكنك إدارة ملفك الشخصي مباشرة: تعديل الزوجات، إضافة أبناء، تحديث التواريخ — بدون الحاجة لموافقة المشرف.",
    tips: [
      "عدّل تاريخ ميلادك عبر منتقي التاريخ الهجري",
      "أضف أو احذف زوجات",
      "أضف أبناء مع تحديد الأم من القائمة",
      "جميع التعديلات تُحفظ فوراً",
    ],
    mockup: null,
  },
  {
    icon: GitBranch,
    title: "عرض النسب",
    desc: "عرض سلسلة نسب أي شخص من الجد المؤسس حتى الشخص نفسه، مع إمكانية التنقل بين الأفراد.",
    tips: [],
    mockup: null,
  },
  {
    icon: Users,
    title: "حاسبة القرابة",
    desc: "اختر أي شخصين من العائلة واحسب درجة القرابة بينهما. تعرض النتيجة العلاقة بالعربية مع المسار من كل شخص للجد المشترك.",
    tips: [],
    mockup: null,
  },
  {
    icon: List,
    title: "عرض القوائم",
    desc: "تصفح العائلة على شكل قوائم متداخلة قابلة للطي والتوسيع، مع ألوان حسب العمق.",
    tips: [],
    mockup: null,
  },
  {
    icon: TableProperties,
    title: "جدول البيانات",
    desc: "عرض جميع بيانات العائلة في جدول شامل مع أعمدة: الاسم، الأب، الأم، الميلاد، الوفاة، العمر، الزوجات، الأبناء. يدعم البحث والفلترة.",
    tips: [],
    mockup: null,
  },
];

export default function Guide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-50 flex items-center justify-between gap-2 px-4 md:px-6 py-3 border-b border-border/40 bg-card/60 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-4.5 w-4.5 text-primary" />
          </div>
          <h1 className="text-base md:text-lg font-extrabold text-foreground">دليل الاستخدام</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-11 w-11 rounded-xl">
          <Home className="h-5 w-5" />
        </Button>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm">
            تعرّف على المنصة
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
            كيف تستخدم بوابة تراث آل الخنيني
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            دليل شامل لجميع خصائص المنصة مع شروحات مبسطة
          </p>
        </div>

        {sections.map((section, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{section.title}</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.desc}</p>

              {section.tips.length > 0 && (
                <ul className="space-y-1.5">
                  {section.tips.map((tip, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                      <ChevronLeft className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.mockup && (
                <div className="rounded-xl border border-border/30 bg-muted/20 overflow-hidden">
                  {section.mockup}
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="text-center pb-8">
          <Button onClick={() => navigate("/")} className="min-h-[48px] rounded-xl font-bold text-base">
            <TreePine className="h-5 w-5 ml-2" />
            ابدأ تصفح الشجرة
          </Button>
        </div>
      </main>
    </div>
  );
}
