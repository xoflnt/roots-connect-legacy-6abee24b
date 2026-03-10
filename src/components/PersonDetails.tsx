import { X, User, Calendar, Heart, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import type { FamilyMember } from "@/data/familyData";

interface PersonDetailsProps {
  member: FamilyMember | null;
  onClose: () => void;
}

function DetailContent({ member }: { member: FamilyMember }) {
  const isMale = member.gender === "M";

  return (
    <div className="space-y-5 p-1">
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isMale ? "bg-[hsl(var(--male-light))]" : "bg-[hsl(var(--female-light))]"
          }`}
        >
          <User
            className={`h-6 w-6 ${
              isMale ? "text-[hsl(var(--male))]" : "text-[hsl(var(--female))]"
            }`}
          />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
          <p className="text-sm text-muted-foreground">
            {isMale ? "ذكر" : "أنثى"}
          </p>
        </div>
      </div>

      {(member.birth_year || member.death_year) && (
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">الفترة الزمنية</p>
            <p className="text-foreground">
              {member.birth_year && `الميلاد: ${member.birth_year} هـ`}
              {member.birth_year && member.death_year && <br />}
              {member.death_year && `الوفاة: ${member.death_year} هـ`}
            </p>
          </div>
        </div>
      )}

      {member.spouses && (
        <div className="flex items-start gap-3">
          <Heart className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">الزوجات</p>
            <p className="text-foreground">{member.spouses}</p>
          </div>
        </div>
      )}

      {member.notes && (
        <div className="flex items-start gap-3">
          <StickyNote className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">ملاحظات</p>
            <p className="text-foreground">{member.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function PersonDetails({ member, onClose }: PersonDetailsProps) {
  const isMobile = useIsMobile();

  if (!member) return null;

  if (isMobile) {
    return (
      <Drawer open={!!member} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-right">{member.name}</DrawerTitle>
            <DrawerDescription className="text-right">تفاصيل الشخصية</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <DetailContent member={member} />
          </div>
          <DrawerClose asChild>
            <Button variant="outline" className="mx-4 mb-4">
              إغلاق
            </Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={!!member} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[380px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-right">{member.name}</SheetTitle>
          <SheetDescription className="text-right">تفاصيل الشخصية</SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <DetailContent member={member} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
