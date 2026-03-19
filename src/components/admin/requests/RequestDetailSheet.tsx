import { useState } from "react";
import { UserPlus, Heart, MessageSquare, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getAdminToken } from "@/components/AdminProtect";
import { useIsMobile } from "@/hooks/use-mobile";
import type { AdminRequest } from "@/hooks/admin/useRequests";

interface RequestDetailSheetProps {
  request: AdminRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RequestDetailSheet({
  request,
  isOpen,
  onClose,
  onSuccess,
}: RequestDetailSheetProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [editedName, setEditedName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!request) return null;

  const typeIcon = {
    add_child: <UserPlus className="h-5 w-5 text-emerald-600" />,
    add_spouse: <Heart className="h-5 w-5 text-pink-600" />,
    other: <MessageSquare className="h-5 w-5 text-blue-600" />,
  };

  const typeLabel = {
    add_child: `طلب إضافة ${request.data.child_gender === "F" ? "ابنة" : "ابن"}`,
    add_spouse: "طلب إضافة زوجة",
    other: "ملاحظة",
  };

  const handleApprove = async () => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        requestId: request.id,
        decision: "approved",
        type: request.type,
        targetMemberId: request.target_member_id,
        targetMemberName: request.target_member_name,
      };

      if (request.type === "add_spouse") {
        body.spouseName = editedName.trim() || request.data.spouse_name;
      } else if (request.type === "add_child") {
        body.childName = editedName.trim() || request.data.child_name;
        body.childGender = request.data.child_gender || "M";
      }

      const { data, error } = await supabase.functions.invoke(
        "family-api/resolve-request",
        { body, headers: { "x-admin-token": token } }
      );

      if (error || data?.error) {
        toast({
          title: "خطأ",
          description: data?.error || "حدث خطأ أثناء المعالجة",
          variant: "destructive",
        });
      } else {
        toast({ title: "تم القبول بنجاح ✓" });
        onSuccess();
        onClose();
      }
    } catch {
      toast({
        title: "خطأ",
        description: "حدث خطأ في الاتصال",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke(
        "family-api/mark-done",
        {
          body: { requestId: request.id },
          headers: { "x-admin-token": token },
        }
      );

      if (error) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء الرفض",
          variant: "destructive",
        });
      } else {
        toast({ title: "تم الرفض" });
        onSuccess();
        onClose();
      }
    } catch {
      toast({
        title: "خطأ",
        description: "حدث خطأ في الاتصال",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="overflow-y-auto"
        dir="rtl"
      >
        <SheetHeader className="text-right">
          <div className="flex items-center gap-2">
            {typeIcon[request.type]}
            <SheetTitle className="text-lg">
              {typeLabel[request.type]}
            </SheetTitle>
          </div>
          <SheetDescription className="text-right">
            بخصوص: {request.target_member_name}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Request info */}
          <div className="space-y-3 rounded-xl bg-muted/50 p-4">
            {request.type === "add_child" && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الاسم المقترح</span>
                  <span className="font-medium">{request.data.child_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الجنس</span>
                  <Badge variant="secondary">
                    {request.data.child_gender === "F" ? "أنثى" : "ذكر"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">سيُضاف كابن لـ</span>
                  <span className="font-medium">
                    {request.target_member_name}
                  </span>
                </div>
              </>
            )}
            {request.type === "add_spouse" && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الزوجة المقترحة</span>
                  <span className="font-medium">
                    {request.data.spouse_name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">لـ</span>
                  <span className="font-medium">
                    {request.target_member_name}
                  </span>
                </div>
              </>
            )}
            {request.type === "other" && (
              <p className="text-sm leading-relaxed">
                {request.data.text_content}
              </p>
            )}

            {request.submitted_by && (
              <div className="flex justify-between text-sm pt-2 border-t border-border/30">
                <span className="text-muted-foreground">مقدم الطلب</span>
                <span>{request.submitted_by}</span>
              </div>
            )}
          </div>

          {/* Modification section */}
          {(request.type === "add_child" ||
            request.type === "add_spouse") && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                {request.type === "add_child"
                  ? "تعديل الاسم قبل القبول (اختياري)"
                  : "تعديل اسم الزوجة قبل القبول (اختياري)"}
              </Label>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder={
                  request.type === "add_child"
                    ? request.data.child_name
                    : request.data.spouse_name
                }
                className="min-h-[48px]"
              />
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleApprove}
              disabled={loading}
              className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              ) : null}
              قبول وتطبيق
            </Button>
            <Button
              onClick={handleReject}
              disabled={loading}
              variant="outline"
              className="w-full min-h-[48px] border-destructive text-destructive hover:bg-destructive/10 text-base"
            >
              رفض
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
