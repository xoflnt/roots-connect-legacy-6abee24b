import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toArabicNum } from "@/utils/arabicUtils";
import { deleteMember } from "@/services/dataService";
import { getAdminToken } from "@/components/AdminProtect";
import { toast } from "@/hooks/use-toast";
import { Archive, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { EnrichedMember } from "@/hooks/admin/useMembers";

interface ArchiveDeleteDialogProps {
  member: EnrichedMember;
  allMembers: EnrichedMember[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ArchiveDeleteDialog({
  member,
  allMembers,
  isOpen,
  onClose,
  onSuccess,
}: ArchiveDeleteDialogProps) {
  const [countdown, setCountdown] = useState(5);
  const [counting, setCounting] = useState(false);
  const [readyToDelete, setReadyToDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const childrenCount = allMembers.filter(
    (m) => m.father_id === member.id
  ).length;

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCounting(false);
      setReadyToDelete(false);
      setIsDeleting(false);
      setArchiving(false);
    }
  }, [isOpen]);

  // Countdown timer using setTimeout
  useEffect(() => {
    if (!counting) return;
    if (countdown <= 0) {
      setReadyToDelete(true);
      setCounting(false);
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [counting, countdown]);

  const handleStartCountdown = () => {
    setCounting(true);
  };

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      const token = getAdminToken();
      if (!token) throw new Error("غير مصرّح");
      await deleteMember(member.id, token);
      toast({ title: "تم حذف العضو نهائياً" });
      onSuccess();
    } catch (err) {
      toast({
        title: "فشل الحذف",
        description: err instanceof Error ? err.message : "حدث خطأ",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [member.id, onSuccess]);

  const handleArchive = useCallback(async () => {
    setArchiving(true);
    try {
      const token = getAdminToken();
      if (!token) throw new Error("غير مصرّح");
      const { error } = await supabase.functions.invoke("family-api/archive-member", {
        body: { memberId: member.id },
        headers: { "x-admin-token": token },
      });
      if (error) throw error;
      toast({ title: "تم أرشفة العضو" });
      onSuccess();
      onClose();
    } catch (err) {
      toast({
        title: "فشلت الأرشفة",
        description: err instanceof Error ? err.message : "حدث خطأ",
        variant: "destructive",
      });
    } finally {
      setArchiving(false);
    }
  }, [member.id, onSuccess, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right text-xl font-bold">
            إدارة العضو
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Archive Section */}
          <div className="border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-base font-bold text-amber-700 dark:text-amber-300">
                أرشفة العضو
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              سيتم إخفاء العضو من الشجرة العامة.
              يمكن استعادته لاحقاً.
            </p>
            <Button
              onClick={handleArchive}
              disabled={archiving}
              className="w-full min-h-[48px] text-base rounded-xl"
              variant="outline"
            >
              {archiving ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  جاري الأرشفة...
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 me-2" />
                  أرشفة
                </>
              )}
            </Button>
          </div>

          {/* Delete Section */}
          <div className="border-2 border-destructive/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <h3 className="text-base font-bold text-destructive">
                حذف نهائي
              </h3>
            </div>

            {childrenCount > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  لا يمكن الحذف — يوجد {toArabicNum(childrenCount)} أبناء مسجلون
                </p>
                <Button
                  disabled
                  variant="destructive"
                  className="w-full min-h-[48px] text-base rounded-xl opacity-50"
                >
                  <Trash2 className="h-4 w-4 me-2" />
                  حذف نهائي
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-destructive/80">
                  ⚠️ لا يمكن التراجع عن هذا الإجراء
                </p>
                {!counting && !readyToDelete ? (
                  <Button
                    variant="outline"
                    onClick={handleStartCountdown}
                    className="w-full min-h-[48px] text-base rounded-xl border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 me-2" />
                    ابدأ الحذف
                  </Button>
                ) : counting ? (
                  <Button
                    disabled
                    className="w-full min-h-[48px] text-base rounded-xl bg-muted text-muted-foreground"
                  >
                    <Trash2 className="h-4 w-4 me-2" />
                    حذف نهائي ({toArabicNum(countdown)})
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full min-h-[48px] text-base rounded-xl"
                  >
                    <Trash2 className="h-4 w-4 me-2" />
                    {isDeleting ? "جاري الحذف..." : "تأكيد الحذف النهائي"}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
