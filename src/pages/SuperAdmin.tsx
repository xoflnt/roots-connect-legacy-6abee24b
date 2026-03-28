import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Lock, Loader2, TreePine, Users, ExternalLink,
  ToggleLeft, ToggleRight, RefreshCw, Home, FileText, Copy, MessageCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const TOKEN_KEY = "nasaby-super-token";
const EXPIRY_KEY = "nasaby-super-expiry";

interface FamilyRow {
  id: string;
  slug: string;
  name: string;
  subdomain: string | null;
  is_active: boolean;
  created_at: string;
  member_count: number;
  user_count: number;
}

interface DemoLead {
  id: string;
  family_name: string;
  contact_name: string;
  phone: string;
  estimated_members: string | null;
  subdomain: string | null;
  created_at: string;
}

type SuperAdminTab = "families" | "demo-leads";

function getSuperToken(): string | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiry = sessionStorage.getItem(EXPIRY_KEY);
  if (token && expiry && new Date(expiry) > new Date()) return token;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EXPIRY_KEY);
  return null;
}

export default function SuperAdmin() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(getSuperToken);
  const [pass, setPass] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState<SuperAdminTab>("families");

  // Data
  const [families, setFamilies] = useState<FamilyRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Demo leads
  const [demoLeads, setDemoLeads] = useState<DemoLead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  const handleLogin = async () => {
    if (!pass.trim()) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      const { data, error } = await supabase.functions.invoke("family-api/super-admin-login", {
        body: { password: pass },
      });
      if (error || !data?.token) {
        setLoginError("كلمة المرور غير صحيحة");
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, data.token);
      sessionStorage.setItem(EXPIRY_KEY, data.expiresAt);
      setToken(data.token);
    } catch {
      setLoginError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoginLoading(false);
    }
  };

  const loadFamilies = useCallback(async () => {
    const t = getSuperToken();
    if (!t) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("family-api/get-all-families", {
        body: {},
        headers: { "x-admin-token": t },
      });
      if (error) throw error;
      setFamilies(data?.families || []);
    } catch (e: any) {
      toast.error("فشل تحميل البيانات");
      if (e?.message?.includes("Unauthorized")) {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(EXPIRY_KEY);
        setToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDemoLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const { data, error } = await supabase
        .from("demo_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setDemoLeads(data || []);
    } catch {
      toast.error("فشل تحميل طلبات الديمو");
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadFamilies();
      loadDemoLeads();
    }
  }, [token, loadFamilies, loadDemoLeads]);

  const handleToggle = async (familyId: string, currentActive: boolean) => {
    const t = getSuperToken();
    if (!t) return;
    setTogglingId(familyId);
    try {
      const { error } = await supabase.functions.invoke("family-api/toggle-family-status", {
        body: { familyId, isActive: !currentActive },
        headers: { "x-admin-token": t },
      });
      if (error) throw error;
      setFamilies((prev) =>
        prev.map((f) => (f.id === familyId ? { ...f, is_active: !currentActive } : f))
      );
      toast.success(currentActive ? "تم تعطيل العائلة" : "تم تفعيل العائلة");
    } catch {
      toast.error("فشل تحديث الحالة");
    } finally {
      setTogglingId(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRY_KEY);
    setToken(null);
    setFamilies([]);
    setDemoLeads([]);
  };

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success("تم نسخ الرقم");
  };

  const openWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/^0/, "");
    window.open(`https://wa.me/966${cleaned}`, "_blank");
  };

  // Stats
  const totalFamilies = families.length;
  const totalMembers = families.reduce((sum, f) => sum + f.member_count, 0);
  const totalUsers = families.reduce((sum, f) => sum + f.user_count, 0);

  // ─── LOGIN SCREEN ───
  if (!token) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-sm w-full bg-card border border-border/50 rounded-2xl p-8 text-center space-y-6 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">لوحة تحكم نسبي</h1>
          <p className="text-sm text-muted-foreground">أدخل كلمة مرور المشرف العام</p>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              value={pass}
              onChange={(e) => { setPass(e.target.value); setLoginError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
              placeholder="كلمة المرور"
              className="pr-9 rounded-xl min-h-[48px]"
              disabled={loginLoading}
            />
          </div>
          {loginError && <p className="text-destructive text-sm font-medium">{loginError}</p>}
          <Button
            onClick={handleLogin}
            disabled={loginLoading}
            className="w-full min-h-[48px] rounded-xl font-bold"
          >
            {loginLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            دخول
          </Button>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ───
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background" dir="rtl">
      {/* Header */}
      <header
        className="shrink-0 z-50 flex items-center justify-between gap-2 px-4 md:px-6 py-3 border-b border-border/40 bg-card/60 backdrop-blur-xl"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-4.5 w-4.5 text-primary" />
          </div>
          <h1 className="text-base md:text-lg font-extrabold text-foreground">لوحة تحكم نسبي</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={loadFamilies} className="h-9 w-9 rounded-xl" title="تحديث">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-9 w-9 rounded-xl">
            <Home className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-xl text-destructive hover:text-destructive text-xs">
            خروج
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "العائلات", value: totalFamilies, icon: TreePine },
              { label: "الأعضاء", value: totalMembers, icon: Users },
              { label: "المسجلون", value: totalUsers, icon: Shield },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border/50 rounded-2xl p-4 text-center shadow-sm">
                <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-foreground">{s.value.toLocaleString("ar-SA")}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("families")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                activeTab === "families"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              العائلات المسجلة
              <Badge variant="secondary" className="text-[10px] mr-1.5 align-middle">{totalFamilies.toLocaleString("ar-SA")}</Badge>
            </button>
            <button
              onClick={() => setActiveTab("demo-leads")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                activeTab === "demo-leads"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              طلبات الديمو
              <Badge variant="secondary" className="text-[10px] mr-1.5 align-middle">{demoLeads.length.toLocaleString("ar-SA")}</Badge>
            </button>
          </div>

          {/* Families table */}
          {activeTab === "families" && (
            <section className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border/30 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">العائلات المسجلة</h2>
                <Badge variant="secondary" className="text-xs">{totalFamilies.toLocaleString("ar-SA")}</Badge>
              </div>

              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : families.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  لا توجد عائلات مسجلة
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {families.map((f) => (
                    <div key={f.id} className="p-4 flex items-center gap-4">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground">{f.name}</span>
                          <Badge variant={f.is_active ? "default" : "secondary"} className="text-[10px]">
                            {f.is_active ? "نشطة" : "معطلة"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-mono" dir="ltr">{f.slug}.nasaby.app</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span>{f.member_count.toLocaleString("ar-SA")} عضو</span>
                          <span>{f.user_count.toLocaleString("ar-SA")} مسجّل</span>
                          <span>{new Date(f.created_at).toLocaleDateString("ar-SA")}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`https://${f.slug}.nasaby.app`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 w-9 rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="زيارة المنصة"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleToggle(f.id, f.is_active)}
                          disabled={togglingId === f.id}
                          className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-colors ${
                            f.is_active
                              ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                              : "border-emerald-400/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          }`}
                          title={f.is_active ? "تعطيل" : "تفعيل"}
                        >
                          {togglingId === f.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : f.is_active ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Demo Leads */}
          {activeTab === "demo-leads" && (
            <section className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">طلبات الديمو</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={loadDemoLeads} className="h-8 w-8 rounded-xl" title="تحديث">
                    <RefreshCw className={`h-3.5 w-3.5 ${leadsLoading ? "animate-spin" : ""}`} />
                  </Button>
                  <Badge variant="secondary" className="text-xs">{demoLeads.length.toLocaleString("ar-SA")}</Badge>
                </div>
              </div>

              {leadsLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : demoLeads.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  لا توجد طلبات ديمو
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {demoLeads.map((lead) => (
                    <div key={lead.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-foreground">{lead.family_name}</span>
                            {lead.subdomain && (
                              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded" dir="ltr">
                                {lead.subdomain}.nasaby.app
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{lead.contact_name}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span dir="ltr">{lead.phone}</span>
                            {lead.estimated_members && <span>{lead.estimated_members} فرد تقريباً</span>}
                            <span>{new Date(lead.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => copyPhone(lead.phone)}
                            className="h-9 w-9 rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="نسخ الرقم"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openWhatsApp(lead.phone)}
                            className="h-9 w-9 rounded-xl border border-emerald-400/30 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                            title="واتساب"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
