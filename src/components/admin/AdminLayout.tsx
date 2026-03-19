import type { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminSidebar } from "./AdminSidebar";
import { AdminBottomBar } from "./AdminBottomBar";
import type { AdminSection } from "@/types/admin";

interface AdminLayoutProps {
  currentSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  adminName: string;
  onLogout: () => void;
  children: ReactNode;
}

export function AdminLayout({
  currentSection,
  onNavigate,
  adminName,
  onLogout,
  children,
}: AdminLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-[100dvh] bg-background" dir="rtl">
      {/* Desktop sidebar */}
      <AdminSidebar
        currentSection={currentSection}
        onNavigate={onNavigate}
        adminName={adminName}
        onLogout={onLogout}
      />

      {/* Main content */}
      <main className={`flex-1 overflow-y-auto overflow-x-hidden ${isMobile ? 'pb-24' : ''}`}>
        {children}
      </main>

      {/* Mobile bottom bar */}
      <AdminBottomBar
        currentSection={currentSection}
        onNavigate={onNavigate}
      />
    </div>
  );
}
