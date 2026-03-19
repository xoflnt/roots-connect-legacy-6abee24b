import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  Activity,
  BookOpen,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminSection } from "@/types/admin";

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',   label: 'الرئيسية',      icon: LayoutDashboard },
  { id: 'members',     label: 'الأعضاء',        icon: Users },
  { id: 'requests',    label: 'الطلبات',        icon: FileText },
  { id: 'users',       label: 'المستخدمون',     icon: UserCheck },
  { id: 'data-health', label: 'صحة البيانات',   icon: Activity },
  { id: 'content',     label: 'المحتوى',        icon: BookOpen },
  { id: 'analytics',   label: 'الإحصائيات',     icon: BarChart2 },
  { id: 'settings',    label: 'الإعدادات',      icon: Settings },
];

interface AdminSidebarProps {
  currentSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  adminName: string;
  onLogout: () => void;
}

export function AdminSidebar({ currentSection, onNavigate, adminName, onLogout }: AdminSidebarProps) {
  return (
    <aside
      className="hidden md:flex flex-col w-60 shrink-0 border-s border-border bg-card h-[100dvh] sticky top-0"
      dir="rtl"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <h1 className="text-lg font-bold text-foreground">لوحة الإدارة</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">بوابة تراث الخنيني</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 min-h-12 rounded-lg text-base font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 space-y-2">
        {adminName && (
          <p className="text-sm text-muted-foreground px-3 truncate">{adminName}</p>
        )}
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full min-h-12 justify-start gap-3 text-base font-medium text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          تسجيل الخروج
        </Button>
      </div>
    </aside>
  );
}
