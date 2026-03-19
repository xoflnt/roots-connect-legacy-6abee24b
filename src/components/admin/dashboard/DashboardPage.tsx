import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TreePine, Heart, Users, Eye, FileText, RefreshCw, Loader2, Database } from "lucide-react";
import { toArabicNum } from "@/utils/arabicUtils";
import { useDashboard } from "@/hooks/admin/useDashboard";
import { getAllMembers } from "@/services/familyService";
import { getBranch, PILLARS } from "@/utils/branchUtils";
import { supabase } from "@/integrations/supabase/client";
import { familyMembers } from "@/data/familyData";
import type { AdminSection } from "@/types/admin";

const STATIC_COUNT = familyMembers.length;

interface DashboardPageProps {
  onNavigate: (section: AdminSection) => void;
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <p className="text-3xl font-bold text-primary">{toArabicNum(value)}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { stats, isLoading, refetch } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState("");

  // Branch counts
  const branchCounts = (() => {
    const members = getAllMembers();
    const counts: Record<string, number> = { "200": 0, "300": 0, "400": 0 };
    members.forEach((m) => {
      const b = getBranch(m.id);
      if (b && counts[b.pillarId] !== undefined) counts[b.pillarId]++;
    });
    return counts;
  })();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult("جاري المزامنة...");
    try {
      const { data, error } = await supabase.functions.invoke("seed-family-data", {
        body: { members: familyMembers },
      });
      if (error) {
        setSyncResult(`فشل: ${error.message}`);
        return;
      }
      const d = data as any;
      const lines = [
        `المُرسل: ${familyMembers.length}`,
        `المُدرج: ${d?.inserted ?? "؟"}`,
        `الأيتام المُصلحة: ${d?.orphans_cleaned ?? "؟"}`,
        `نجح: ${d?.success ? "نعم" : "لا"}`,
        d?.errors?.length > 0
          ? `أخطاء (${d.errors.length}): ${d.errors[0]?.id} — ${d.errors[0]?.error}`
          : "لا أخطاء",
        d?.diagnostics?.fathers_outside_set?.length > 0
          ? `آباء ناقصون: ${d.diagnostics.fathers_outside_set.join("، ")}`
          : "لا آباء ناقصون",
      ]
        .filter(Boolean)
        .join("\n");
      setSyncResult(lines);
      await refetch();
    } catch (err: any) {
      setSyncResult(`استثناء: ${err.message ?? String(err)}`);
    } finally {
      setSyncing(false);
    }
  };

  const branchColors: Record<string, string> = {
    "300": "border-green-500",
    "200": "border-yellow-500",
    "400": "border-orange-500",
  };

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">الرئيسية</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
          className="min-h-12 min-w-12"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Action banner */}
      {stats.pendingRequests > 0 && (
        <button
          onClick={() => onNavigate("requests")}
          className="w-full bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-2xl p-4 text-base font-bold text-right"
        >
          يوجد {toArabicNum(stats.pendingRequests)} طلب بانتظار المراجعة ←
        </button>
      )}

      {/* Stats grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={TreePine} label="إجمالي الأعضاء" value={stats.totalMembers} />
        <StatCard icon={Heart} label="الأحياء" value={stats.livingMembers} />
        <StatCard icon={Users} label="المستخدمون" value={stats.activeUsers} />
        <StatCard icon={Eye} label="الزيارات" value={stats.totalVisits} />
        <StatCard icon={FileText} label="الطلبات المعلقة" value={stats.pendingRequests} />
      </section>

      {/* Branch overview */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-foreground">الفروع</h3>
        <div className="grid gap-3">
          {PILLARS.map((p) => (
            <div
              key={p.id}
              className={`bg-card border border-border/50 rounded-2xl p-4 border-r-4 ${branchColors[p.id] || ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-foreground">{p.label}</span>
                <span className="text-2xl font-bold text-primary">
                  {toArabicNum(branchCounts[p.id] || 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sync */}
      <section className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <Button
          onClick={handleSync}
          disabled={syncing}
          className="bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl gap-2 min-h-12"
        >
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
          {syncing ? "جاري المزامنة..." : "مزامنة البيانات"}
        </Button>
        <span className="text-xs font-semibold bg-white/20 rounded-lg px-2 py-1">
          ({toArabicNum(STATIC_COUNT)} عضو في الملف)
        </span>
        <span className="text-sm font-medium whitespace-pre-wrap">
          {syncResult || "مزامنة جميع الأفراد من الملف المحلي إلى قاعدة البيانات"}
        </span>
      </section>
    </div>
  );
}
