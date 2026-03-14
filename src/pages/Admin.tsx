import { useState, useEffect, useRef } from "react";
import { AdminProtect, getAdminToken } from "@/components/AdminProtect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, ShieldCheck, TreePine, Check, Loader2, ArrowRight, Bell, Download, Search, X, RefreshCw, FileDown } from "lucide-react";
import { getRequests, markRequestDone, getVerifiedUsers, getVisitCount, type FamilyRequest } from "@/services/dataService";
import { getAllMembers, searchMembers } from "@/services/familyService";
import type { FamilyMember } from "@/data/familyData";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTableView } from "@/components/DataTableView";
import { PILLARS } from "@/utils/branchUtils";
import { Progress } from "@/components/ui/progress";

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
  const legacyDetails = !req.data?.text_content
    ? Object.entries(req.data || {}).map(([k, v]) => `${k}: ${v}`).join("، ")
    : "";

  const handleMarkDone = async () => {
    setLoading(true);
    const token = getAdminToken();
    if (token) {
      await markRequestDone(req.id, token);
    }
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
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Export state
  const [exportMode, setExportMode] = useState<'full' | 'branch'>('full');
  const [exportBranchId, setExportBranchId] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  const loadData = async () => {
    const token = getAdminToken();
    if (!token) return;
    
    const reqs = await getRequests(token);
    setRequests(reqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    const users = await getVerifiedUsers(token);
    setVerifiedCount(users.length);
    const vc = await getVisitCount();
    setVisitCount(vc);
    setMemberCount(getAllMembers().length);
  };

  useEffect(() => {
    loadData();
    // Poll every 30s instead of realtime (RLS blocks SELECT for realtime)
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const pending = requests.filter((r) => r.status === "pending");
  const handled = requests.filter((r) => r.status !== "pending");

  // --- Export state ---
  const [exportSearch, setExportSearch] = useState("");
  const [selectedExportMember, setSelectedExportMember] = useState<FamilyMember | null>(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const exportResults = exportSearch.trim() ? searchMembers(exportSearch, 8) : [];

  const membersAll = getAllMembers();
  const memberMapExport = new Map(membersAll.map(m => [m.id, m]));

  const handleExportFull = () => {
    const csv = buildCSV(membersAll, memberMapExport, false);
    downloadCSV(csv, "khunaini_registry_full.csv");
  };

  const handleExportDescendants = () => {
    if (!selectedExportMember) return;
    const descendants = getDescendants(selectedExportMember.id, membersAll);
    const csv = buildCSV(descendants, memberMapExport, true);
    const safeName = selectedExportMember.name.replace(/\s+/g, "_");
    downloadCSV(csv, `khunaini_descendants_of_${safeName}.csv`);
  };

  const handleTreeExport = async () => {
    setExporting(true);

    const token = getAdminToken();
    if (!token) {
      setExportProgress('خطأ: انتهت صلاحية الجلسة');
      setExporting(false);
      return;
    }

    try {
      setExportProgress('جاري الاتصال بالخادم...');

      const { exportTreeAsPDF } = await import('@/services/TreeExportService');

      setExportProgress('جاري فتح الشجرة وتوسيعها... (قد يستغرق ١-٢ دقيقة)');

      await exportTreeAsPDF(
        null,
        () => {},
        {
          mode: exportMode,
          branchId: exportBranchId || undefined,
          branchLabel: exportBranchId
            ? PILLARS.find(p => p.id === exportBranchId)?.label
            : undefined,
        },
        token,
        window.location.origin
      );

      setExportProgress('تم التصدير بنجاح ✓');
    } catch (err) {
      console.error('Tree export error:', err);
      setExportProgress('حدث خطأ في التصدير، حاول مرة أخرى');
    } finally {
      setExporting(false);
      setTimeout(() => setExportProgress(''), 4000);
    }
  };
  return (
    <div className="flex flex-col h-[100dvh] bg-background" dir="rtl">
      <header className="shrink-0 z-50 bg-card/90 backdrop-blur-sm border-b border-border/30 px-4 py-3" style={{ paddingTop: `max(0.75rem, env(safe-area-inset-top))` }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">لوحة الإدارة</h1>
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshing} className="h-11 w-11 min-w-[44px] min-h-[44px]">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")} className="gap-1">
            <ArrowRight className="h-4 w-4" />
            الرئيسية
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-[calc(2rem+env(safe-area-inset-bottom))]">
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
            <TabsTrigger value="tree-export" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5">
              <TreePine className="h-3.5 w-3.5" />
              تصدير الشجرة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6 mt-4">
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
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-card border border-border/50 rounded-2xl p-4">
              <Button onClick={handleExportFull} className="rounded-xl font-bold gap-2 shrink-0">
                <Download className="h-4 w-4" />
                تصدير السجل الكامل
              </Button>

              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-1 sm:justify-end">
                {selectedExportMember ? (
                  <Badge className="gap-1.5 py-1.5 px-3 text-sm">
                    {selectedExportMember.name}
                    <button onClick={() => setSelectedExportMember(null)} className="hover:opacity-70">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ) : (
                  <div className="relative w-full sm:w-64" ref={exportRef}>
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="ابحث لتصدير ذرية شخص..."
                        value={exportSearch}
                        onChange={e => { setExportSearch(e.target.value); setExportDropdownOpen(true); }}
                        onFocus={() => setExportDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setExportDropdownOpen(false), 200)}
                        className="pr-9 rounded-xl"
                      />
                    </div>
                    {exportDropdownOpen && exportResults.length > 0 && (
                      <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {exportResults.map(m => (
                          <button
                            key={m.id}
                            className="w-full text-right px-3 py-2 text-sm hover:bg-accent/50 transition-colors"
                            onMouseDown={() => {
                              setSelectedExportMember(m);
                              setExportSearch("");
                              setExportDropdownOpen(false);
                            }}
                          >
                            {m.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <Button
                  onClick={handleExportDescendants}
                  disabled={!selectedExportMember}
                  variant="secondary"
                  className="rounded-xl font-bold gap-2 shrink-0"
                >
                  <TreePine className="h-4 w-4" />
                  تصدير ذرية المختار
                </Button>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden" style={{ height: "calc(100dvh - 400px)" }}>
              <DataTableView />
            </div>
          </TabsContent>

          <TabsContent value="tree-export" className="mt-4">
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TreePine className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">تصدير شجرة العائلة</h2>
                  <p className="text-sm text-muted-foreground">صدّر الشجرة كملف PDF احترافي</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-foreground">اختر نطاق التصدير:</p>
                <div className="grid gap-2">
                  <button
                    onClick={() => { setExportMode('full'); setExportBranchId(''); }}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition-colors text-right ${
                      exportMode === 'full' ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border-2 border-current flex items-center justify-center">
                      {exportMode === 'full' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </span>
                    الشجرة كاملة
                  </button>
                  {PILLARS.map(p => {
                    const dotColors: Record<string, string> = {
                      '300': 'bg-green-500',
                      '200': 'bg-yellow-500',
                      '400': 'bg-orange-500',
                    };
                    const isSelected = exportMode === 'branch' && exportBranchId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => { setExportMode('branch'); setExportBranchId(p.id); }}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition-colors text-right ${
                          isSelected ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border-2 border-current flex items-center justify-center">
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </span>
                        <span className={`w-2.5 h-2.5 rounded-full ${dotColors[p.id] || ''}`} />
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-xl p-3 text-sm">
                ⚠️ قد يستغرق التصدير ١٠-٣٠ ثانية حسب حجم الشجرة. يرجى الانتظار.
              </div>

              {exportProgress && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">{exportProgress}</p>
                  {exporting && <Progress value={undefined} className="h-1.5" />}
                </div>
              )}

              <Button
                onClick={handleTreeExport}
                disabled={exporting}
                className="w-full min-h-[52px] rounded-2xl font-bold gap-2 text-base"
              >
                {exporting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <FileDown className="h-5 w-5" />
                )}
                {exporting ? exportProgress || 'جاري التصدير...' : 'تصدير PDF'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

      </div>
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
