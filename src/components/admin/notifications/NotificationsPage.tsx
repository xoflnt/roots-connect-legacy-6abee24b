import { useState } from "react";
import { Bell, Loader2, Send, Megaphone, Info, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAdminNotifications } from "@/hooks/admin/useAdminNotifications";
import { relativeArabicTime } from "@/utils/relativeArabicTime";

const TYPE_OPTIONS = [
  { value: "broadcast", label: "إشعار عام", icon: Megaphone },
  { value: "info", label: "معلومة", icon: Info },
  { value: "new_member", label: "عضو جديد", icon: UserPlus },
] as const;

const TYPE_BADGE_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  broadcast: { label: "عام", variant: "default" },
  info: { label: "معلومة", variant: "secondary" },
  new_member: { label: "عضو جديد", variant: "outline" },
};

export function NotificationsPage() {
  const { sendNotification, isSending, history, isLoading } = useAdminNotifications();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("broadcast");

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("يرجى تعبئة العنوان والرسالة");
      return;
    }

    try {
      const result = await sendNotification({ title: title.trim(), body: body.trim(), type });
      toast.success(`تم الإرسال بنجاح ✓ (${result?.sent || 0} مستخدم)`);
      setTitle("");
      setBody("");
      setType("broadcast");
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ أثناء الإرسال");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">الإشعارات</h1>
      </div>

      {/* Send Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">إرسال إشعار جديد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">العنوان</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان الإشعار..."
              maxLength={100}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">الرسالة</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="نص الرسالة..."
              rows={3}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">النوع</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-base min-h-12">
                    <span className="flex items-center gap-2">
                      <opt.icon className="h-4 w-4" />
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSend}
            disabled={isSending || !title.trim() || !body.trim()}
            className="w-full min-h-12 text-base gap-2"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            إرسال للجميع
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">الإشعارات السابقة</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              لم يتم إرسال أي إشعارات بعد
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {history.map((item, idx) => {
              const badge = TYPE_BADGE_MAP[item.type] || TYPE_BADGE_MAP.info;
              return (
                <Card key={idx} className="overflow-hidden">
                  <CardContent className="p-4 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm text-foreground line-clamp-1">
                        {item.title}
                      </p>
                      <Badge variant={badge.variant} className="shrink-0 text-xs">
                        {badge.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.body}</p>
                    <p className="text-xs text-muted-foreground/70">
                      {relativeArabicTime(item.created_at)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
