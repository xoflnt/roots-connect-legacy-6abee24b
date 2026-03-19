import { useState } from "react";
import { AdminProtect } from "@/components/AdminProtect";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DashboardPage } from "@/components/admin/dashboard/DashboardPage";
import { MemberListPage } from "@/components/admin/members/MemberListPage";
import { RequestsPage } from "@/components/admin/requests/RequestsPage";
import type { AdminSection } from "@/types/admin";

function AdminContent() {
  const [section, setSection] = useState<AdminSection>("dashboard");

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
      {!["dashboard", "members", "requests"].includes(section) && (
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
