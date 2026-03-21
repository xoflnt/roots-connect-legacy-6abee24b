import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
} from "lucide-react";
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
  return (
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
    </div>
  );
}
