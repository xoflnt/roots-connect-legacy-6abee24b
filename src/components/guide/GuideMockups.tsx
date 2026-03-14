import {
  Search, UserCheck, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Plus, Minus, Heart, MessageSquare, Send,
} from "lucide-react";

/* ── Shared wrapper ─────────────────────────────── */
const MockupShell = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-3 rounded-xl border border-border/30 bg-muted/20 overflow-hidden p-3" dir="rtl">
    {children}
  </div>
);

/* ── Mini family card ──────────────────────────── */
const MiniCard = ({
  name,
  sub,
  accent,
  size = "md",
}: {
  name: string;
  sub?: string;
  accent?: string;
  size?: "sm" | "md";
}) => (
  <div
    className={`rounded-xl border bg-card shadow-sm flex flex-col items-center justify-center ${
      size === "sm" ? "px-2 py-1.5" : "px-3 py-2"
    } ${accent ? `border-${accent}/30` : "border-border"}`}
  >
    <span className={`font-bold text-foreground ${size === "sm" ? "text-[9px]" : "text-[10px]"}`}>
      {name}
    </span>
    {sub && <span className="text-[8px] text-muted-foreground">{sub}</span>}
  </div>
);

/* ── 1. Registration mockup — stepper ──────────── */
export const RegistrationMockup = () => (
  <MockupShell>
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        {["بحث الاسم", "رمز العائلة", "رقم الجوال", "تاريخ الميلاد"].map((label, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold ${
                i <= 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            {i < 3 && <div className="w-4 h-px bg-border" />}
          </div>
        ))}
      </div>
      <div className="text-[9px] text-muted-foreground flex gap-3 mt-1">
        <span className="font-medium text-primary">بحث الاسم</span>
        <span>→</span>
        <span>رمز العائلة</span>
        <span>→</span>
        <span>الجوال</span>
        <span>→</span>
        <span>الميلاد</span>
      </div>
    </div>
  </MockupShell>
);

/* ── 2. Search mockup ──────────────────────────── */
export const SearchMockup = () => (
  <MockupShell>
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">محمد...</span>
      </div>
      <div className="rounded-xl border border-border/50 bg-background overflow-hidden divide-y divide-border/20">
        {[
          { name: "محمد ← زيد ← ناصر", year: "١٤٠٥ هـ" },
          { name: "محمد ← فهد ← محمد", year: "١٤٢٠ هـ" },
          { name: "محمد ← عبدالعزيز ← ناصر", year: "١٣٩٠ هـ" },
        ].map((r, i) => (
          <div key={i} className="px-3 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium text-foreground">{r.name}</span>
            </div>
            <span className="text-[8px] text-muted-foreground">{r.year}</span>
          </div>
        ))}
      </div>
    </div>
  </MockupShell>
);

/* ── 3. Profile mockup ─────────────────────────── */
export const ProfileMockup = () => (
  <MockupShell>
    <div className="space-y-2">
      <div className="flex items-center gap-3 p-2 rounded-xl bg-background border border-border/40">
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary">م</span>
        </div>
        <div>
          <p className="text-[10px] font-bold text-foreground">محمد بن زيد</p>
          <p className="text-[8px] text-muted-foreground">٠٥٥ •••• ١٢٣٤</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {["تاريخ الميلاد", "الزوجات", "الأبناء"].map((f) => (
          <div key={f} className="rounded-lg bg-background border border-border/30 p-1.5 text-center">
            <span className="text-[8px] text-muted-foreground">{f}</span>
            <div className="mt-0.5 h-2.5 rounded bg-muted/50" />
          </div>
        ))}
      </div>
    </div>
  </MockupShell>
);

/* ── 4. Map mode mockup — tree with nodes ──────── */
export const MapModeMockup = () => (
  <MockupShell>
    <div className="flex flex-col items-center gap-2">
      <MiniCard name="ناصر سعدون الخنيني" sub="الجد المؤسس" />
      <div className="w-px h-4 bg-border" />
      <div className="flex gap-6 items-start">
        <div className="flex flex-col items-center gap-1">
          <MiniCard name="محمد" accent="amber" size="sm" />
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center">
              <Plus className="h-2.5 w-2.5 text-primary" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <MiniCard name="ناصر" accent="emerald" size="sm" />
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
              <Minus className="h-2.5 w-2.5 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <MiniCard name="عبدالعزيز" accent="orange" size="sm" />
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center">
              <Plus className="h-2.5 w-2.5 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </MockupShell>
);

/* ── 5. Navigate mode mockup ───────────────────── */
export const NavigateModeMockup = () => (
  <MockupShell>
    <div className="flex flex-col items-center gap-2">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
        <span>ناصر</span>
        <ChevronLeft className="h-2.5 w-2.5" />
        <span>زيد</span>
        <ChevronLeft className="h-2.5 w-2.5" />
        <span className="text-primary font-bold">محمد</span>
      </div>
      {/* Father */}
      <div className="flex items-center gap-1">
        <ChevronUp className="h-3 w-3 text-muted-foreground" />
        <span className="text-[8px] text-muted-foreground">الأب</span>
      </div>
      <MiniCard name="زيد بن ناصر" sub="اضغط للصعود" />
      {/* Current */}
      <div className="relative w-full flex justify-center">
        <ChevronRight className="h-4 w-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2" />
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 px-4 py-2 text-center">
          <span className="text-[11px] font-bold text-primary">محمد بن زيد</span>
          <p className="text-[8px] text-muted-foreground">الشخص الحالي</p>
        </div>
        <ChevronLeft className="h-4 w-4 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
      </div>
      {/* Children */}
      <div className="flex items-center gap-1">
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
        <span className="text-[8px] text-muted-foreground">الأبناء</span>
      </div>
      <div className="flex gap-2">
        <MiniCard name="فهد" size="sm" />
        <MiniCard name="سعد" size="sm" />
        <MiniCard name="نورة" size="sm" />
      </div>
    </div>
  </MockupShell>
);

/* ── 6. Branches mode mockup ───────────────────── */
export const BranchesModeMockup = () => (
  <MockupShell>
    <div className="flex gap-2 justify-center">
      {[
        { name: "محمد", color: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800", emoji: "🟡" },
        { name: "ناصر", color: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", emoji: "🟢" },
        { name: "عبدالعزيز", color: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800", emoji: "🟠" },
      ].map((b) => (
        <div key={b.name} className={`rounded-xl border px-3 py-2 text-center ${b.color}`}>
          <span className="text-sm">{b.emoji}</span>
          <p className="text-[10px] font-bold mt-0.5">{b.name}</p>
          <p className="text-[8px] opacity-70">فرع</p>
        </div>
      ))}
    </div>
  </MockupShell>
);

/* ── 7. List mode mockup ───────────────────────── */
export const ListModeMockup = () => (
  <MockupShell>
    <div className="space-y-1">
      {[
        { name: "ناصر سعدون", depth: 0 },
        { name: "محمد بن ناصر", depth: 1 },
        { name: "زيد بن محمد", depth: 2 },
        { name: "فهد بن زيد", depth: 3 },
        { name: "ناصر بن ناصر", depth: 1 },
      ].map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 rounded-lg bg-background border border-border/30 py-1 px-2"
          style={{ marginRight: `${item.depth * 14}px` }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: `hsl(${120 + item.depth * 40}, 50%, 50%)`,
            }}
          />
          <span className="text-[10px] font-medium text-foreground">{item.name}</span>
        </div>
      ))}
    </div>
  </MockupShell>
);

/* ── 8. Lineage mockup ─────────────────────────── */
export const LineageMockup = () => (
  <MockupShell>
    <div className="flex flex-col items-center gap-0">
      {["ناصر سعدون", "محمد بن ناصر", "زيد بن محمد", "فهد بن زيد"].map((name, i, arr) => (
        <div key={i} className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary/60" />
            <span className={`text-[10px] font-medium ${i === arr.length - 1 ? "text-primary font-bold" : "text-foreground"}`}>
              {name}
            </span>
          </div>
          {i < arr.length - 1 && <div className="w-px h-3 bg-border" />}
        </div>
      ))}
    </div>
  </MockupShell>
);

/* ── 9. Kinship mockup ─────────────────────────── */
export const KinshipMockup = () => (
  <MockupShell>
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-4 w-full justify-center">
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-1.5 text-center">
          <p className="text-[9px] font-bold text-primary">فهد بن زيد</p>
          <p className="text-[7px] text-muted-foreground">الشخص ١</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px]">⚖️</span>
        </div>
        <div className="rounded-xl border border-accent/30 bg-accent/5 px-3 py-1.5 text-center">
          <p className="text-[9px] font-bold text-accent">سعد بن محمد</p>
          <p className="text-[7px] text-muted-foreground">الشخص ٢</p>
        </div>
      </div>
      <div className="rounded-lg bg-primary/10 px-4 py-1.5">
        <span className="text-[10px] font-bold text-primary">ابن عمه</span>
      </div>
    </div>
  </MockupShell>
);

/* ── 10. Documents mockup ──────────────────────── */
export const DocumentsMockup = () => (
  <MockupShell>
    <div className="flex gap-2">
      <div className="flex-1 rounded-lg border border-border/40 bg-background p-2">
        <div className="w-full h-12 rounded bg-muted/40 flex items-center justify-center">
          <span className="text-[9px] text-muted-foreground">📜 وثيقة ١</span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1">
            <Heart className="h-2.5 w-2.5 text-rose-400" />
            <span className="text-[8px] text-muted-foreground">١٢</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[8px] text-muted-foreground">٣</span>
          </div>
        </div>
      </div>
      <div className="flex-1 rounded-lg border border-border/40 bg-background p-2">
        <div className="w-full h-12 rounded bg-muted/40 flex items-center justify-center">
          <span className="text-[9px] text-muted-foreground">📋 وثيقة ٢</span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1">
            <Heart className="h-2.5 w-2.5 text-rose-400" />
            <span className="text-[8px] text-muted-foreground">٨</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[8px] text-muted-foreground">٥</span>
          </div>
        </div>
      </div>
    </div>
  </MockupShell>
);

/* ── 12. Submit request mockup ─────────────────── */
export const SubmitRequestMockup = () => (
  <MockupShell>
    <div className="space-y-2">
      <div className="rounded-lg border border-border/40 bg-background p-2">
        <p className="text-[8px] text-muted-foreground mb-1">نوع التعديل</p>
        <div className="h-5 rounded bg-muted/30 border border-border/20 flex items-center px-2">
          <span className="text-[8px] text-muted-foreground">تعديل معلومات...</span>
        </div>
      </div>
      <div className="rounded-lg border border-border/40 bg-background p-2">
        <p className="text-[8px] text-muted-foreground mb-1">التفاصيل</p>
        <div className="h-8 rounded bg-muted/30 border border-border/20" />
      </div>
      <div className="flex justify-start">
        <div className="flex items-center gap-1 rounded-lg bg-primary/15 px-3 py-1">
          <Send className="h-2.5 w-2.5 text-primary" />
          <span className="text-[8px] font-medium text-primary">إرسال</span>
        </div>
      </div>
    </div>
  </MockupShell>
);

/** Map of card titles → mockup components */
export const guideMockups: Record<string, React.ReactNode> = {
  "التسجيل والتحقق": <RegistrationMockup />,
  "البحث عن الأفراد": <SearchMockup />,
  "الملف الشخصي": <ProfileMockup />,
  "وضع الخريطة 🗺️": <MapModeMockup />,
  "وضع التنقل 🧭": <NavigateModeMockup />,
  "وضع الفروع 🌿": <BranchesModeMockup />,
  "وضع القائمة ☰": <ListModeMockup />,
  "عرض النسب 📜": <LineageMockup />,
  "حاسبة القرابة ⚖️": <KinshipMockup />,
  "المستندات التاريخية 📋": <DocumentsMockup />,
  "إرسال طلب تعديل ✏️": <SubmitRequestMockup />,
};
