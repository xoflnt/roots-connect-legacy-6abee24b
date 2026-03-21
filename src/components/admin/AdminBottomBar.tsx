import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  MoreHorizontal,
  UserCheck,
  Activity,
  BookOpen,
  BarChart2,
  Settings,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AdminSection } from "@/types/admin";

interface BottomTab {
  id: AdminSection;
  label: string;
  icon: React.ElementType;
}

const MAIN_TABS: BottomTab[] = [
  { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'members',   label: 'الأعضاء',  icon: Users },
  { id: 'requests',  label: 'الطلبات',  icon: FileText },
  { id: 'users',     label: 'المستخدمون', icon: UserCheck },
];

// Hidden until implemented:
// const MORE_ITEMS: BottomTab[] = [
//   { id: 'data-health', label: 'صحة البيانات', icon: Activity },
//   { id: 'content',     label: 'المحتوى',      icon: BookOpen },
//   { id: 'analytics',   label: 'الإحصائيات',   icon: BarChart2 },
//   { id: 'settings',    label: 'الإعدادات',    icon: Settings },
// ];

interface AdminBottomBarProps {
  currentSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
}

export function AdminBottomBar({ currentSection, onNavigate }: AdminBottomBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = MORE_ITEMS.some((item) => item.id === currentSection);

  return (
    <>
      <div
        className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-card border-t border-border flex items-stretch"
        dir="rtl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {MAIN_TABS.map((tab) => {
          const isActive = currentSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center min-h-14 gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          );
        })}

        {/* More tab */}
        <button
          onClick={() => setMoreOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center min-h-14 gap-1 transition-colors ${
            isMoreActive ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[11px] font-medium">المزيد</span>
        </button>
      </div>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl" dir="rtl">
          <SheetHeader>
            <SheetTitle className="text-right text-base">المزيد</SheetTitle>
          </SheetHeader>
          <div className="py-2 space-y-1">
            {MORE_ITEMS.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMoreOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 min-h-12 rounded-lg text-base font-medium text-right transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
