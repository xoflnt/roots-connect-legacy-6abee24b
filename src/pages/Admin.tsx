import { useState } from "react";
import { AdminProtect } from "@/components/AdminProtect";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DashboardPage } from "@/components/admin/dashboard/DashboardPage";
import { MemberListPage } from "@/components/admin/members/MemberListPage";
import { RequestsPage } from "@/components/admin/requests/RequestsPage";
import { UsersPage } from "@/components/admin/users/UsersPage";
import { DataHealthPage } from "@/components/admin/data-health/DataHealthPage";
import { useRequests } from "@/hooks/admin/useRequests";
import { usePWABadge } from "@/hooks/usePWABadge";
import type { AdminSection } from "@/types/admin";

function AdminContent() {
  const [section, setSection] = useState<AdminSection>("dashboard");
  const { pendingCount } = useRequests();
  usePWABadge(pendingCount);

  const handleLogout = () => {
    sessionStorage.removeItem("khunaini-admin-token");
    sessionStorage.removeItem("khunaini-admin-expiry");
    window.location.reload();
  };

  return (
    <AdminLayout
      currentSection={section}
      onNavigate={setSection}
      adminName=""
      onLogout={handleLogout}
    >
      {section === "dashboard" && <DashboardPage onNavigate={setSection} />}
      {section === "members" && <MemberListPage />}
      {section === "requests" && <RequestsPage />}
      {section === "users" && <UsersPage />}
      {section === "data-health" && <DataHealthPage />}
      {!["dashboard", "members", "requests", "users", "data-health"].includes(section) && (
        <div className="p-6 text-center text-muted-foreground" dir="rtl">
          <p className="text-lg">{section}</p>
          <p className="text-sm mt-2">قيد التطوير</p>
        </div>
      )}
    </AdminLayout>
  );
}

export default function Admin() {
  return (
    <AdminProtect>
      <AdminContent />
    </AdminProtect>
  );
}
