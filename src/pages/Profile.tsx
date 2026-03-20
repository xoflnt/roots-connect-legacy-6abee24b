import { useNavigate } from "react-router-dom";
import { getFirstName } from "@/utils/nameUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TreePine, Phone, CalendarDays, Users, LogOut, GitBranch, Home, Save, Loader2, MessageSquarePlus, ShieldCheck, User, Heart, Baby, MessageSquare, Clock } from "lucide-react";
import { getAncestorChain, getDescendantCount, getMemberById, getChildrenOf, refreshMembers, inferMotherName } from "@/services/familyService";
import { updateMember, getVerifiedMemberIds } from "@/services/dataService";
import { useMemo, useState, useEffect } from "react";
import { HijriDatePicker } from "@/components/HijriDatePicker";
import { SubmitRequestForm } from "@/components/SubmitRequestForm";
import { toast } from "sonner";
import { formatAge } from "@/utils/ageCalculator";
import { getBranch, getBranchStyle } from "@/utils/branchUtils";
import { toArabicNum } from "@/utils/arabicUtils";
import { relativeArabicTime } from "@/utils/relativeArabicTime";
import { Badge } from "@/components/ui/badge";
import type { FamilyMember } from "@/data/familyData";

type HijriDate = { day?: string; month?: string; year?: string };

function parseHijriDate(dateStr: string | null | undefined): HijriDate {
  if (!dateStr) return {};
  const parts = dateStr.split("/");
  if (parts.length === 3) return { year: parts[0], month: parts[1], day: parts[2] };
  if (parts.length === 2) return { year: parts[0], month: parts[1] };
  return { year: parts[0] };
}

function formatHijriDate(d: HijriDate): string | undefined {
  if (!d.year) return undefined;
  return `${d.year}${d.month ? `/${d.month}` : ""}${d.day ? `/${d.day}` : ""}`;
}

const Profile = () => {
  const { currentUser, logout, isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [requestOpen, setRequestOpen] = useState(false);

  // Editable fields
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState<HijriDate>({});
  const [childBirthYears, setChildBirthYears] = useState<Record<string, HijriDate>>({});

  useEffect(() => {
    const handler = async () => {
      await refreshMembers();
      setRefreshKey(k => k + 1);
    };
    window.addEventListener("family-data-updated", handler);
    return () => window.removeEventListener("family-data-updated", handler);
  }, []);

  const member = useMemo(() => {
    if (!currentUser) return null;
    return getMemberById(currentUser.memberId) ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, refreshKey]);

  const father = useMemo(() => {
    if (!member?.father_id) return null;
    return getMemberById(member.father_id) ?? null;
  }, [member]);

  const motherName = useMemo(() => {
    if (!member) return null;
    return inferMotherName(member);
  }, [member]);

  const children = useMemo(() => {
    if (!member) return [];
    return getChildrenOf(member.id);
  }, [member]);

  const chain = useMemo(() => {
    if (!member) return [];
    return getAncestorChain(member.id);
  }, [member]);

  const descendantCount = useMemo(() => {
    if (!member) return 0;
    return getDescendantCount(member.id);
  }, [member]);

  const branch = useMemo(() => {
    if (!member) return null;
    return getBranch(member.id);
  }, [member]);

  const verifiedIds = useMemo(() => getVerifiedMemberIds(), [refreshKey]);

  const spousesList = useMemo(() => {
    if (!member?.spouses) return [];
    return member.spouses.split("،").map(s => s.trim()).filter(Boolean);
  }, [member]);

  // Initialize editable state when member loads
  useEffect(() => {
    if (!member) return;
    setPhone(member.phone || currentUser?.phone || "");
    setBirthDate(parseHijriDate(member.birth_year));

    const initial: Record<string, HijriDate> = {};
    for (const child of getChildrenOf(member.id)) {
      if (!verifiedIds.has(child.id)) {
        initial[child.id] = parseHijriDate(child.birth_year);
      }
    }
    setChildBirthYears(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]);

  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center gap-4 p-4" dir="rtl">
        <TreePine className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">يرجى تسجيل الدخول أولاً</p>
        <Button onClick={() => navigate("/")} className="rounded-xl">
          <Home className="h-4 w-4 ml-2" />
          العودة للرئيسية
        </Button>
      </div>
    );
  }

  const ageText = member ? formatAge(member.birth_year, member.death_year) : null;
  const branchStyle = branch ? getBranchStyle(branch.pillarId) : null;

  const handleSave = async () => {
    if (!member || saving) return;
    setSaving(true);
    try {
      const dateStr = formatHijriDate(birthDate);

      // 1. Update own phone + birth_year
      await updateMember(member.id, {
        phone: phone.trim() || member.phone,
        birth_year: dateStr || member.birth_year,
      });

      // 2. Update unverified children's birth years
      for (const [childId, date] of Object.entries(childBirthYears)) {
        if (!verifiedIds.has(childId)) {
          const childDateStr = formatHijriDate(date);
          if (childDateStr) {
            await updateMember(childId, { birth_year: childDateStr });
          }
        }
      }

      // 3. Update auth context
      login({
        ...currentUser,
        phone: phone.trim() || currentUser.phone,
        hijriBirthDate: dateStr || currentUser.hijriBirthDate,
      });

      // 4. Refresh
      await refreshMembers();
      setRefreshKey(k => k + 1);
      window.dispatchEvent(new Event("family-data-updated"));
      toast.success("تم حفظ التعديلات بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background" dir="rtl">
      {/* Header */}
      <header className="shrink-0 z-50 flex items-center justify-between gap-2 px-4 md:px-6 py-3 border-b border-border/40 bg-card/60 backdrop-blur-xl" style={{ paddingTop: `max(0.75rem, env(safe-area-inset-top))` }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <TreePine className="h-4.5 w-4.5 text-primary" />
          </div>
          <h1 className="text-base md:text-lg font-extrabold text-foreground">البطاقة الشخصية</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} className="h-11 w-11 rounded-xl">
          <Home className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-5">

        {/* ═══════ 1. User Identity Card ═══════ */}
        <section className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <TreePine className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-foreground">{currentUser.memberName}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {member?.gender === "F" ? "أنثى" : "ذكر"}
                </Badge>
                {ageText && <span className="text-xs text-accent font-semibold">{ageText}</span>}
                {branch && branchStyle && (
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: branchStyle.bg, color: branchStyle.text }}
                  >
                    {branch.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/30">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">الأبناء</p>
                <p className="text-sm font-semibold text-foreground">{toArabicNum(children.length)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/30">
              <GitBranch className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">إجمالي الذرية</p>
                <p className="text-sm font-semibold text-foreground">{descendantCount}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ 2. Editable: Phone ═══════ */}
        <section className="bg-card border border-border/50 rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">رقم الجوال</h3>
          </div>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05xxxxxxxx"
            className="rounded-xl text-base"
            dir="ltr"
          />
        </section>

        {/* ═══════ 3. Editable: Birth Date ═══════ */}
        <section className="bg-card border border-border/50 rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">تاريخ الميلاد (هجري)</h3>
          </div>
          <HijriDatePicker value={birthDate} onChange={setBirthDate} />
        </section>

        {/* ═══════ 4. Family Info (Read-Only) ═══════ */}
        <section className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">معلومات العائلة</h3>
          </div>

          <div className="space-y-3">
            {/* Father */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/30">
              <span className="text-xs text-muted-foreground w-16 shrink-0">الأب</span>
              <span className="text-sm font-semibold text-foreground">
                {father ? father.name : "—"}
              </span>
            </div>

            {/* Mother */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/30">
              <span className="text-xs text-muted-foreground w-16 shrink-0">الأم</span>
              <span className="text-sm font-semibold text-foreground">
                {motherName || "—"}
              </span>
            </div>

            {/* Spouses */}
            {spousesList.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/30">
                <Heart className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1.5">
                  {spousesList.map((s, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-medium">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ═══════ 5. Children Section ═══════ */}
        {children.length > 0 && (
          <section className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">الأبناء ({toArabicNum(children.length)})</h3>
            </div>

            <div className="space-y-3">
              {children.map((child) => {
                const isVerified = verifiedIds.has(child.id);
                return (
                  <div key={child.id} className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Badge variant={child.gender === "M" ? "default" : "secondary"} className="text-xs shrink-0">
                        {child.gender === "M" ? "ذكر" : "أنثى"}
                      </Badge>
                      <span className="text-sm font-bold text-foreground flex-1">{getFirstName(child.name)}</span>
                    </div>

                    {isVerified ? (
                      <div className="space-y-1.5">
                        {child.birth_year && (
                          <p className="text-sm text-foreground">{child.birth_year} هـ</p>
                        )}
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent/10 border border-accent/20 w-fit">
                          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                          <span className="text-xs font-semibold text-accent-foreground">
                            تم توثيق البيانات بواسطة {child.name} ✅
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">تاريخ الميلاد (هجري)</p>
                        <HijriDatePicker
                          value={childBirthYears[child.id] || {}}
                          onChange={(val) =>
                            setChildBirthYears(prev => ({ ...prev, [child.id]: val }))
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════ 6. Lineage Chain ═══════ */}
        {chain.length > 0 && (
          <section className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-bold text-foreground">سلسلة النسب</h3>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {chain.map((ancestor, i) => (
                <span key={ancestor.id} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => navigate(`/person/${ancestor.id}`)}
                    className={`text-sm font-medium px-2.5 py-1 rounded-lg transition-colors ${
                      ancestor.id === currentUser.memberId
                        ? "bg-primary/15 text-primary font-bold"
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    }`}
                  >
                    {ancestor.name}
                  </button>
                  {i < chain.length - 1 && <span className="text-muted-foreground text-xs">←</span>}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ═══════ 7. Save Button ═══════ */}
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full min-h-[52px] rounded-xl font-bold text-base"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <Save className="h-5 w-5 ml-2" />}
          حفظ التعديلات
        </Button>

        {/* ═══════ 8. Request Change Portal ═══════ */}
        <div className="bg-muted/30 border border-border/40 rounded-2xl p-5 text-center space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            هل تود إضافة فرد جديد أو تعديل بيانات أخرى؟
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setRequestOpen(true)}
            className="rounded-xl min-h-[48px] font-bold w-full"
          >
            <MessageSquarePlus className="h-5 w-5 ml-2" />
            إرسال طلب تعديل
          </Button>
        </div>

        {/* ═══════ 9. View in tree + Logout ═══════ */}
        <div className="flex flex-col sm:flex-row gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/person/${currentUser.memberId}`)}
            className="flex-1 min-h-[48px] rounded-xl"
          >
            <TreePine className="h-4 w-4 ml-2" />
            عرض في الشجرة
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => { logout(); navigate("/"); }}
            className="flex-1 min-h-[48px] rounded-xl text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل خروج
          </Button>
        </div>
      </div>
      </main>

      {/* Request Change Dialog */}
      <SubmitRequestForm
        open={requestOpen}
        onOpenChange={setRequestOpen}
        targetMember={member}
      />
    </div>
  );
};

export default Profile;
