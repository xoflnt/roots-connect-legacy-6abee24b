import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppHeader, type ViewMode } from "@/components/AppHeader";
import { LineageView } from "@/components/LineageView";
import { getAllMembers, getMemberById } from "@/services/familyService";

const PersonPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [memberId, setMemberId] = useState<string>(id || "");

  useEffect(() => {
    if (id) setMemberId(id);
  }, [id]);

  const member = getMemberById(memberId);

  const handleSearchSelect = (newId: string) => {
    navigate(`/person/${newId}`, { replace: true });
    setMemberId(newId);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  if (!member) {
    return (
      <div className="flex flex-col h-[100dvh] bg-background" dir="rtl">
        <AppHeader
          activeView="lineage"
          onViewChange={() => navigate("/")}
          onSearch={handleSearchSelect}
          onReset={() => {}}
          onGoHome={handleGoHome}
        />
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-lg">
          لم يتم العثور على هذا الشخص
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-x-hidden">
      <AppHeader
        activeView="lineage"
        onViewChange={(v) => {
          if (v === "lineage") return;
          navigate(`/?view=${v}`);
        }}
        onSearch={handleSearchSelect}
        onReset={() => {}}
        onGoHome={handleGoHome}
      />
      <main className="flex-1 overflow-hidden p-2 md:p-5 pb-16 md:pb-5">
        <div className="w-full h-full rounded-2xl md:rounded-3xl shadow-xl overflow-auto border border-border/50 bg-card animate-fade-in">
          <LineageView memberId={memberId} onSelectMember={handleSearchSelect} />
        </div>
      </main>
    </div>
  );
};

export default PersonPage;
