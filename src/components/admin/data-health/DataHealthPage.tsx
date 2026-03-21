import { useState } from "react";
import { AlertCircle, AlertTriangle, Info, ChevronDown, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { toArabicNum } from "@/utils/arabicUtils";
import { useDataHealth, type HealthCategory } from "@/hooks/admin/useDataHealth";
import { HealthScoreRing } from "./HealthScoreRing";

const SEVERITY_CONFIG = {
  critical: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
} as const;

const MAX_VISIBLE = 20;

function CategoryCard({ category }: { category: HealthCategory }) {
  const [open, setOpen] = useState(false);
  const config = SEVERITY_CONFIG[category.severity];
  const Icon = config.icon;
  const isEmpty = category.count === 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={`w-full flex items-center gap-3 px-4 min-h-16 rounded-xl border border-border bg-card text-start transition-colors hover:bg-muted/50 ${
            open ? "rounded-b-none border-b-0" : ""
          }`}
        >
          <div className={`p-2 rounded-lg ${config.bg}`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
          <span className="flex-1 text-base font-medium text-foreground">
            {category.label}
          </span>
          {isEmpty ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Badge variant="secondary" className="text-sm">
              {toArabicNum(category.count)} عضو
            </Badge>
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border border-t-0 border-border rounded-b-xl bg-card px-4 py-3 space-y-2">
          {isEmpty ? (
            <p className="text-sm text-green-600">✓ لا توجد مشاكل</p>
          ) : (
            <>
              {category.members.slice(0, MAX_VISIBLE).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
                >
                  <span className="text-sm font-medium text-foreground">{m.name}</span>
                  {m.branch && (
                    <Badge variant="outline" className="text-xs">
                      {m.branch}
                    </Badge>
                  )}
                </div>
              ))}
              {category.count > MAX_VISIBLE && (
                <p className="text-xs text-muted-foreground pt-1">
                  و{toArabicNum(category.count - MAX_VISIBLE)} عضو آخر...
                </p>
              )}
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function DataHealthPage() {
  const { health, isLoading, refresh } = useDataHealth();

  if (isLoading || !health) {
    return (
      <div className="p-4 md:p-6 space-y-6" dir="rtl">
        <Skeleton className="h-8 w-40" />
        <div className="flex justify-center">
          <Skeleton className="h-[120px] w-[120px] rounded-full" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">صحة البيانات</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          className="gap-2 min-h-12 text-base"
        >
          <RefreshCw className="h-4 w-4" />
          إعادة الفحص
        </Button>
      </div>

      {/* Score Ring */}
      <div className="flex justify-center relative">
        <HealthScoreRing score={health.score} totalMembers={health.totalMembers} />
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {health.categories.map((cat) => (
          <CategoryCard key={cat.key} category={cat} />
        ))}
      </div>
    </div>
  );
}
