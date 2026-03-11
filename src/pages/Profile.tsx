import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TreePine, Phone, CalendarDays, Users, LogOut, GitBranch, Home, Edit } from "lucide-react";
import { getAncestorChain, getDescendantCount, getMemberById } from "@/services/familyService";
import { useMemo, useState } from "react";
import { SubmitRequestForm } from "@/components/SubmitRequestForm";

const Profile = () => {
  const { currentUser, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [requestOpen, setRequestOpen] = useState(false);

  const member = useMemo(() => {
    if (!currentUser) return null;
    return getMemberById(currentUser.memberId) ?? null;
  }, [currentUser]);

  const chain = useMemo(() => {
    if (!member) return [];
    return getAncestorChain(member.id);
  }, [member]);

  const descendantCount = useMemo(() => {
    if (!member) return 0;
    return getDescendantCount(member.id);
  }, [member]);

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
              <Badge variant="secondary" className="mt-1">
                {member?.gender === "F" ? "أنثى" : "ذكر"}
              </Badge>
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
            {currentUser.hijriBirthDate && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/30">
                <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">تاريخ الميلاد (هجري)</p>
                  <p className="text-sm font-semibold text-foreground">{currentUser.hijriBirthDate}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/30">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">عدد الذرية</p>
                <p className="text-sm font-semibold text-foreground">{descendantCount} فرد</p>
              </div>
            </div>
          </div>
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate(`/person/${currentUser.memberId}`)}
            className="flex-1 min-h-[48px] rounded-xl font-bold"
          >
            <TreePine className="h-4 w-4 ml-2" />
            عرض في الشجرة
          </Button>
          <Button
            variant="outline"
            onClick={() => setRequestOpen(true)}
            className="flex-1 min-h-[48px] rounded-xl"
          >
            <Edit className="h-4 w-4 ml-2" />
            طلب تعديل بياناتي
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

      <SubmitRequestForm
        open={requestOpen}
        onOpenChange={setRequestOpen}
        targetMember={member ?? undefined}
      />
    </div>
  );
};

export default Profile;
