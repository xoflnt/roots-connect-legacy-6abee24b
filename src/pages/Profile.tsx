import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TreePine, Phone, CalendarDays, Users, LogOut, GitBranch, Home, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { getAncestorChain, getDescendantCount, getMemberById, getChildrenOf, refreshMembers } from "@/services/familyService";
import { updateMember, addMember } from "@/services/dataService";
import { useMemo, useState } from "react";
import { HijriDatePicker } from "@/components/HijriDatePicker";
import { toast } from "sonner";
import { formatAge } from "@/utils/ageCalculator";
import type { FamilyMember } from "@/data/familyData";

const Profile = () => {
  const { currentUser, logout, isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const member = useMemo(() => {
    if (!currentUser) return null;
    return getMemberById(currentUser.memberId) ?? null;
  }, [currentUser]);

  const chain = useMemo(() => {
    if (!member) return [];
    return getAncestorChain(member.id);
  }, [member]);

  const children = useMemo(() => {
    if (!member) return [];
    return getChildrenOf(member.id);
  }, [member]);

  const descendantCount = useMemo(() => {
    if (!member) return 0;
    return getDescendantCount(member.id);
  }, [member]);

  // Editable state
  const [editSpouses, setEditSpouses] = useState<string[]>(() => {
    if (!member?.spouses) return [];
    return member.spouses.split("،").map(s => s.trim()).filter(Boolean);
  });
  const [newSpouse, setNewSpouse] = useState("");
  const [birthDate, setBirthDate] = useState<{ day?: string; month?: string; year?: string }>(() => {
    if (!member?.birth_year) return {};
    const parts = (member.birth_year as string).split("/");
    if (parts.length === 3) return { year: parts[0], month: parts[1], day: parts[2] };
    return { year: member.birth_year as string };
  });

  // Add child state
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildGender, setNewChildGender] = useState<"M" | "F">("M");
  const [newChildMother, setNewChildMother] = useState("");

  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4" dir="rtl">
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

  const handleAddSpouse = () => {
    if (!newSpouse.trim()) return;
    setEditSpouses(prev => [...prev, newSpouse.trim()]);
    setNewSpouse("");
  };

  const handleRemoveSpouse = (index: number) => {
    setEditSpouses(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!member) return;
    setSaving(true);
    try {
      const dateStr = birthDate.year
        ? `${birthDate.year}${birthDate.month ? `/${birthDate.month}` : ""}${birthDate.day ? `/${birthDate.day}` : ""}`
        : undefined;

      await updateMember(member.id, {
        spouses: editSpouses.join("، ") || undefined,
        birth_year: dateStr || member.birth_year,
      });

      if (dateStr) {
        login({ ...currentUser, hijriBirthDate: dateStr });
      }

      refreshMembers();
      toast.success("تم حفظ التعديلات بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    }
    setSaving(false);
  };

  const handleAddChild = async () => {
    if (!member || !newChildName.trim()) return;
    setSaving(true);
    try {
      const childId = `USR-${Date.now().toString(36)}`;
      const notes = newChildMother ? `${newChildGender === "F" ? "والدتها" : "والدته"}: ${newChildMother}` : undefined;
      await addMember({
        id: childId,
        name: newChildName.trim(),
        gender: newChildGender,
        father_id: member.id,
        notes,
      });
      toast.success("تمت إضافة الابن/البنت بنجاح");
      setNewChildName("");
      setNewChildGender("M");
      setNewChildMother("");
      setShowAddChild(false);
    } catch {
      toast.error("حدث خطأ أثناء الإضافة");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between gap-2 px-4 md:px-6 py-3 border-b border-border/40 bg-card/60 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <TreePine className="h-4.5 w-4.5 text-primary" />
          </div>
          <h1 className="text-base md:text-lg font-extrabold text-foreground">الملف الشخصي</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-11 w-11 rounded-xl">
          <Home className="h-5 w-5" />
        </Button>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        {/* User Card */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <TreePine className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{currentUser.memberName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">
                  {member?.gender === "F" ? "أنثى" : "ذكر"}
                </Badge>
                {ageText && <span className="text-xs text-accent font-semibold">{ageText}</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/30">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">رقم الجوال</p>
                <p className="text-sm font-semibold text-foreground" dir="ltr">{currentUser.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/30">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">عدد الذرية</p>
                <p className="text-sm font-semibold text-foreground">{descendantCount} فرد</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Birth Date */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">تاريخ الميلاد (هجري)</h3>
          </div>
          <HijriDatePicker value={birthDate} onChange={setBirthDate} />
        </div>

        {/* Edit Spouses */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-foreground">الزوجات</h3>
          {editSpouses.length > 0 ? (
            <div className="space-y-2">
              {editSpouses.map((spouse, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/30">
                  <span className="flex-1 text-sm font-medium text-foreground">{spouse}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveSpouse(i)} className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لا توجد زوجات مسجلة</p>
          )}
          <div className="flex gap-2">
            <Input
              value={newSpouse}
              onChange={(e) => setNewSpouse(e.target.value)}
              placeholder="اسم الزوجة الجديدة..."
              className="rounded-xl flex-1"
            />
            <Button variant="outline" onClick={handleAddSpouse} className="rounded-xl shrink-0">
              <Plus className="h-4 w-4 ml-1" /> إضافة
            </Button>
          </div>
        </div>

        {/* Children */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">الأبناء ({children.length})</h3>
            <Button variant="outline" size="sm" onClick={() => setShowAddChild(!showAddChild)} className="rounded-xl text-xs">
              <Plus className="h-3.5 w-3.5 ml-1" /> إضافة
            </Button>
          </div>

          {children.length > 0 && (
            <div className="space-y-2">
              {children.map((child) => (
                <div key={child.id} className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/30">
                  <Badge variant={child.gender === "M" ? "default" : "secondary"} className="text-xs shrink-0">
                    {child.gender === "M" ? "ذكر" : "أنثى"}
                  </Badge>
                  <span className="flex-1 text-sm font-medium text-foreground">{child.name}</span>
                  {child.birth_year && <span className="text-xs text-muted-foreground">{child.birth_year} هـ</span>}
                </div>
              ))}
            </div>
          )}

          {showAddChild && (
            <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/30">
              <Input
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                placeholder="اسم الابن/البنت..."
                className="rounded-xl"
              />
              <Select value={newChildGender} onValueChange={(v) => setNewChildGender(v as "M" | "F")}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">ذكر</SelectItem>
                  <SelectItem value="F">أنثى</SelectItem>
                </SelectContent>
              </Select>
              {editSpouses.length > 0 && (
                <Select value={newChildMother} onValueChange={setNewChildMother}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="اختر الأم..." />
                  </SelectTrigger>
                  <SelectContent>
                    {editSpouses.map((s, i) => (
                      <SelectItem key={i} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button onClick={handleAddChild} disabled={!newChildName.trim() || saving} className="w-full rounded-xl">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة"}
              </Button>
            </div>
          )}
        </div>

        {/* Lineage Chain */}
        {chain.length > 0 && (
          <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-bold text-foreground">سلسلة النسب</h3>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {chain.map((ancestor, i) => (
                <span key={ancestor.id} className="flex items-center gap-1.5">
                  <button
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
          </div>
        )}

        {/* Save + Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 min-h-[48px] rounded-xl font-bold"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
            حفظ التعديلات
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/person/${currentUser.memberId}`)}
            className="flex-1 min-h-[48px] rounded-xl"
          >
            <TreePine className="h-4 w-4 ml-2" />
            عرض في الشجرة
          </Button>
          <Button
            variant="ghost"
            onClick={() => { logout(); navigate("/"); }}
            className="flex-1 min-h-[48px] rounded-xl text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل خروج
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
