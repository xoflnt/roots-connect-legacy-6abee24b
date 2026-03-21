import { useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { relativeArabicTime } from "@/utils/relativeArabicTime";
import type { VerifiedUser } from "@/services/dataService";

interface UserCardProps {
  user: VerifiedUser;
  isEven: boolean;
  onDelete: () => void;
}

export function UserCard({ user, isEven, onDelete }: UserCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div
        dir="rtl"
        className={`flex items-center justify-between px-4 min-h-16 gap-3 ${
          isEven ? "bg-muted/40" : ""
        }`}
      >
        {/* Right: info */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-base font-bold text-foreground truncate">
            {user.memberName}
          </p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <a href={`tel:${user.phone}`} className="hover:text-primary">
              {user.phone}
            </a>
            {user.hijriBirthDate && (
              <span>· {user.hijriBirthDate}</span>
            )}
          </div>
        </div>

        {/* Left: time + menu */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {relativeArabicTime(user.verifiedAt)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" dir="rtl">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive gap-2"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                حذف التوثيق
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="حذف التوثيق"
        description={`هل تريد حذف توثيق ${user.memberName}؟ سيفقد الوصول إلى المنصة.`}
        confirmLabel="حذف"
        variant="destructive"
        onConfirm={onDelete}
      />
    </>
  );
}
