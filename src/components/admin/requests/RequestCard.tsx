import { UserPlus, Heart, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { relativeArabicTime } from "@/utils/relativeArabicTime";
import type { AdminRequest } from "@/hooks/admin/useRequests";

const typeConfig = {
  add_child: {
    icon: UserPlus,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    label: (data: AdminRequest["data"]) =>
      `طلب إضافة ${data.child_gender === "F" ? "ابنة" : "ابن"}`,
  },
  add_spouse: {
    icon: Heart,
    color: "text-pink-600",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    label: () => "طلب إضافة زوجة",
  },
  other: {
    icon: MessageSquare,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    label: () => "ملاحظة",
  },
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "بانتظار المراجعة", variant: "outline" },
  approved: { label: "مقبول", variant: "default" },
  completed: { label: "منجز", variant: "secondary" },
};

interface RequestCardProps {
  request: AdminRequest;
  onViewDetails: () => void;
}

export function RequestCard({ request, onViewDetails }: RequestCardProps) {
  const config = typeConfig[request.type] || typeConfig.other;
  const Icon = config.icon;
  const status = statusConfig[request.status] || statusConfig.completed;

  return (
    <Card className="border-border/50" dir="rtl">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground leading-tight">
                {config.label(request.data)}
              </p>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {request.target_member_name}
              </p>
            </div>
          </div>
          <Badge
            variant={status.variant}
            className={`shrink-0 text-xs ${
              request.status === "pending"
                ? "border-amber-400 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30"
                : request.status === "approved"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-300"
                : ""
            }`}
          >
            {status.label}
          </Badge>
        </div>

        {/* Body */}
        <div className="text-sm text-muted-foreground space-y-1 pr-11">
          {request.type === "add_child" && request.data.child_name && (
            <>
              <p>الاسم: {request.data.child_name}</p>
              <p>
                الجنس:{" "}
                <Badge variant="secondary" className="text-xs mr-1">
                  {request.data.child_gender === "F" ? "أنثى" : "ذكر"}
                </Badge>
              </p>
            </>
          )}
          {request.type === "add_spouse" && request.data.spouse_name && (
            <p>الاسم: {request.data.spouse_name}</p>
          )}
          {request.type === "other" && request.data.text_content && (
            <p className="line-clamp-2">{request.data.text_content}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {request.submitted_by && (
              <span>من: {request.submitted_by}</span>
            )}
            <span>{relativeArabicTime(request.created_at)}</span>
          </div>
          {request.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              className="min-h-[44px] text-sm"
              onClick={onViewDetails}
            >
              عرض التفاصيل
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
