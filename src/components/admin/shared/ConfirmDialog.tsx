import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent dir="rtl" className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-right text-lg">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-right text-base text-muted-foreground">
              {children}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={`min-h-12 text-base ${
              variant === "danger"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }`}
          >
            {isLoading ? "جاري..." : confirmText}
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onClose}
            className="min-h-12 text-base"
          >
            {cancelText}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
