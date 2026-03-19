import { useState } from "react";
import { Inbox, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRequests, type AdminRequest, type RequestTab } from "@/hooks/admin/useRequests";
import { RequestCard } from "./RequestCard";
import { RequestDetailSheet } from "./RequestDetailSheet";
import { toArabicNum } from "@/utils/arabicUtils";

const tabs: { id: RequestTab; label: string }[] = [
  { id: "pending", label: "بانتظار المراجعة" },
  { id: "done", label: "تمت المعالجة" },
  { id: "all", label: "الكل" },
];

export function RequestsPage() {
  const { requests, pendingCount, activeTab, setActiveTab, isLoading, refetch } =
    useRequests();
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);

  return (
    <div className="p-4 md:p-6 space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-foreground">الطلبات</h1>
        {pendingCount > 0 && (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-300 text-sm">
            {toArabicNum(pendingCount)}
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.id === "pending" && pendingCount > 0 && (
              <span className="mr-1 text-amber-600 dark:text-amber-400">
                ({toArabicNum(pendingCount)})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground space-y-3">
          <Inbox className="h-12 w-12 opacity-30" />
          <p className="text-base">
            {activeTab === "pending"
              ? "لا توجد طلبات بانتظار المراجعة"
              : activeTab === "done"
              ? "لا توجد طلبات تمت معالجتها"
              : "لا توجد طلبات"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onViewDetails={() => setSelectedRequest(req)}
            />
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <RequestDetailSheet
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onSuccess={refetch}
      />
    </div>
  );
}
