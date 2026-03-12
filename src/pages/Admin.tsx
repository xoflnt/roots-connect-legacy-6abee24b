import { useState, useEffect, useRef } from "react";
import { AdminProtect } from "@/components/AdminProtect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, ShieldCheck, TreePine, Check, Loader2, ArrowRight, Bell, Download, Search, X } from "lucide-react";
import { getRequests, markRequestDone, getVerifiedUsers, getVisitCount, type FamilyRequest } from "@/services/dataService";
import { getAllMembers, searchMembers, getMemberById } from "@/services/familyService";
import type { FamilyMember } from "@/data/familyData";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTableView } from "@/components/DataTableView";

// --- Smart Export Helpers ---

function getDescendants(rootId: string, allMembers: FamilyMember[], gen = 1): (FamilyMember & { generation: number })[] {
  const children = allMembers.filter(m => m.father_id === rootId);
  return children.reduce<(FamilyMember & { generation: number })[]>((acc, child) => [
    ...acc,
    { ...child, generation: gen },
    ...getDescendants(child.id, allMembers, gen + 1),
  ], []);
}

function buildCSV(members: (FamilyMember & { generation?: number })[], memberMap: Map<string, FamilyMember>, isSubtree: boolean): string {
  const headers = [
    "مستوى الجيل",
    "الاسم",
    "اسم الأب",
    "الجنس",
    "سنة الميلاد",
    "رقم الجوال",
    "الزوجات",
    "ملاحظات وتفاصيل الأم",
  ];
  const rows = members.map(m => {
    const father = m.father_id ? memberMap.get(m.father_id) : null;
    return [
      isSubtree && m.generation != null ? String(m.generation) : "",
      m.name,
      father?.name || "",
      m.gender === "M" ? "ذكر" : "أنثى",
      m.birth_year || "",
      m.phone || "",
      m.spouses?.replace(/،/g, "، ") || "",
      m.notes || "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });
  return "\uFEFF" + [headers.join(","), ...rows].join("\n");
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
      </div>
    </div>
  );
}

function RequestCard({ req, onAction }: { req: FamilyRequest; onAction: () => void }) {
  const [loading, setLoading] = useState(false);
  const members = getAllMembers();
  const member = members.find((m) => m.id === req.targetMemberId);

  const textContent = req.data?.text_content || req.notes || "";
  // Legacy support: show old structured data if no text_content
  const legacyDetails = !req.data?.text_content
    ? Object.entries(req.data || {}).map(([k, v]) => `${k}: ${v}`).join("، ")
    : "";

  const handleMarkDone = async () => {
    setLoading(true);
    await markRequestDone(req.id);
    onAction();
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground">
          {req.submittedBy || member?.name || req.targetMemberId}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(req.createdAt).toLocaleDateString("ar-SA")}
        </span>
      </div>

      <div className="text-sm space-y-2">
        <p className="font-bold text-foreground">
          الشخص: <span className="text-primary">{member?.name || req.targetMemberId}</span>
        </p>
        {textContent && (
          <p className="text-foreground bg-muted/50 rounded-xl p-3 leading-relaxed whitespace-pre-wrap">
            {textContent}
          </p>
        )}
        {legacyDetails && !textContent && (
          <p className="text-muted-foreground text-xs">{legacyDetails}</p>
        )}
        {req.notes && req.data?.text_content && (
          <p className="text-muted-foreground italic text-xs">ملاحظات: {req.notes}</p>
        )}
      </div>

      {req.status === "pending" && (
        <Button
          onClick={handleMarkDone}
          disabled={loading}
          className="w-full min-h-[44px] rounded-xl font-bold gap-1.5"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          تم التنفيذ
        </Button>
      )}

      {req.status !== "pending" && (
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          تم التنفيذ ✓
        </span>
      )}
    </div>
  );
}

function AdminContent() {
  const [requests, setRequests] = useState<FamilyRequest[]>([]);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [visitCount, setVisitCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [hasNew, setHasNew] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    const reqs = await getRequests();
    setRequests(reqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    const users = await getVerifiedUsers();
    setVerifiedCount(users.length);
    const vc = await getVisitCount();
    setVisitCount(vc);
    setMemberCount(getAllMembers().length);
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('admin-requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'family_requests' },
        () => {
          setHasNew(true);
          loadData();
          setTimeout(() => setHasNew(false), 3000);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const pending = requests.filter((r) => r.status === "pending");
  const handled = requests.filter((r) => r.status !== "pending");

  const handleExportCSV = () => {
    const members = getAllMembers();
    const headers = ["المعرّف", "الاسم", "الجنس", "معرّف الأب", "سنة الميلاد", "سنة الوفاة", "الأزواج", "الهاتف", "ملاحظات"];
    const rows = members.map(m => [
      m.id,
      m.name,
      m.gender === "M" ? "ذكر" : "أنثى",
      m.father_id || "",
      m.birth_year || "",
      m.Death_year || "",
      m.spouses || "",
      m.phone || "",
      m.notes || "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `سجل_الخنيني_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-sm border-b border-border/30 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">لوحة الإدارة</h1>
            {hasNew && (
              <span className="flex items-center gap-1 text-xs font-bold text-accent animate-pulse">
                <Bell className="h-3.5 w-3.5" />
                طلب جديد
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1">
            <ArrowRight className="h-4 w-4" />
            الرئيسية
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Eye} label="عدد الزيارات" value={visitCount} />
          <StatCard icon={Users} label="الحسابات الموثقة" value={verifiedCount} />
          <StatCard icon={TreePine} label="إجمالي الأفراد" value={memberCount} />
        </section>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="w-full justify-start rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="requests" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
              الطلبات ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="registry" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
              السجل الكامل
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6 mt-4">
            {/* Pending Requests */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                طلبات معلقة ({pending.length})
              </h2>
              {pending.length === 0 ? (
                <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
                  <p className="text-muted-foreground">لا توجد طلبات معلقة</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pending.map((r) => (
                    <RequestCard key={r.id} req={r} onAction={loadData} />
                  ))}
                </div>
              )}
            </section>

            {/* Handled Requests */}
            {handled.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">الطلبات المنجزة ({handled.length})</h2>
                <div className="grid gap-4">
                  {handled.map((r) => (
                    <RequestCard key={r.id} req={r} onAction={loadData} />
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          <TabsContent value="registry" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleExportCSV} className="rounded-xl font-bold gap-2">
                <Download className="h-4 w-4" />
                تصدير السجل الكامل (CSV)
              </Button>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden" style={{ height: "calc(100vh - 320px)" }}>
              <DataTableView />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <AdminProtect>
      <AdminContent />
    </AdminProtect>
  );
}
