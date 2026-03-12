import { useState, useEffect, useRef } from "react";
import { AdminProtect } from "@/components/AdminProtect";
import { Button } from "@/components/ui/button";
import { Users, Eye, ShieldCheck, TreePine, Check, X, Loader2, ArrowRight, Bell } from "lucide-react";
import { getRequests, approveRequest, rejectRequest, getVerifiedUsers, getVisitCount, type FamilyRequest } from "@/services/dataService";
import { getAllMembers } from "@/services/familyService";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const REQUEST_TYPE_LABELS: Record<string, string> = {
  add_child: "إضافة ابن / بنت",
  add_spouse: "إضافة زوج / زوجة",
  update_info: "تحديث بيانات",
  correction: "تصحيح معلومة",
  other: "أخرى",
};

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
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const members = getAllMembers();
  const member = members.find((m) => m.id === req.targetMemberId);

  const handleApprove = async () => {
    setLoading("approve");
    await approveRequest(req.id);
    onAction();
  };

  const handleReject = async () => {
    setLoading("reject");
    await rejectRequest(req.id);
    onAction();
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent/15 text-accent">
          {REQUEST_TYPE_LABELS[req.type] || req.type}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(req.createdAt).toLocaleDateString("ar-SA")}
        </span>
      </div>

      <div className="text-sm space-y-1">
        <p className="font-bold text-foreground">
          الشخص: <span className="text-primary">{member?.name || req.targetMemberId}</span>
        </p>
        {Object.entries(req.data).map(([k, v]) => (
          <p key={k} className="text-muted-foreground">
            <span className="font-medium">{k}:</span> {v}
          </p>
        ))}
        {req.notes && (
          <p className="text-muted-foreground italic">ملاحظات: {req.notes}</p>
        )}
      </div>

      {req.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <Button
            onClick={handleApprove}
            disabled={!!loading}
            className="flex-1 min-h-[44px] rounded-xl font-bold gap-1.5"
          >
            {loading === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            موافقة وتحديث تلقائي
          </Button>
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={!!loading}
            className="min-h-[44px] rounded-xl px-4"
          >
            {loading === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {req.status !== "pending" && (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${req.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
          {req.status === "approved" ? "تمت الموافقة" : "مرفوض"}
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

  useEffect(() => { loadData(); }, []);

  const pending = requests.filter((r) => r.status === "pending");
  const handled = requests.filter((r) => r.status !== "pending");

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-sm border-b border-border/30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">لوحة الإدارة</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1">
            <ArrowRight className="h-4 w-4" />
            الرئيسية
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Eye} label="عدد الزيارات" value={visitCount} />
          <StatCard icon={Users} label="الحسابات الموثقة" value={verifiedCount} />
          <StatCard icon={TreePine} label="إجمالي الأفراد" value={memberCount} />
        </section>

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
            <h2 className="text-lg font-bold text-foreground">الطلبات السابقة ({handled.length})</h2>
            <div className="grid gap-4">
              {handled.map((r) => (
                <RequestCard key={r.id} req={r} onAction={loadData} />
              ))}
            </div>
          </section>
        )}
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
