import { useEffect, useState } from "react";
import { useFamilyContext } from "@/contexts/FamilyContext";
import { useAuth } from "@/contexts/AuthContext";
import { injectDemoData } from "@/services/familyService";
import { setDemoPillars } from "@/utils/branchUtils";
import { insertVisitorMember, getDemoPillars } from "@/data/demoDataGenerator";
import { getDemoMembers } from "@/data/demoFamilyData";
import { DemoBanner } from "@/components/demo/DemoBanner";
import { DemoContactModal } from "@/components/demo/DemoContactModal";
import type { FamilyMember } from "@/data/familyData";

// Import the real Index page directly (not lazy — it's already loaded in this context)
import Index from "./Index";

export default function DemoPage() {
  const { slug, demoFamilyName, demoFirstName, familyName } = useFamilyContext();
  const { login, currentUser } = useAuth();
  const [ready, setReady] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const surname: string = demoFamilyName || familyName || slug || "العائلة";
  const firstName: string = demoFirstName || "زائر";

  useEffect(() => {
    // 1. Generate demo family data
    const baseMembers = getDemoMembers(surname);

    // 2. Insert the visitor as a member
    const { members, visitorId } = insertVisitorMember(
      baseMembers as FamilyMember[],
      firstName,
      surname
    );

    // 3. Inject into familyService (all real components will now use this data)
    injectDemoData(members);

    // 4. Set demo pillars for branchUtils
    const pillars = getDemoPillars(members);
    const stylePresets = [
      { bg: "hsl(155 40% 90%)", text: "hsl(155 45% 30%)" },
      { bg: "hsl(45 70% 92%)", text: "hsl(45 60% 35%)" },
      { bg: "hsl(25 50% 90%)", text: "hsl(25 55% 35%)" },
      { bg: "hsl(210 50% 90%)", text: "hsl(210 45% 30%)" },
    ];
    const pillarStyles: Record<string, { bg: string; text: string }> = {};
    pillars.forEach((p, i) => {
      pillarStyles[p.id] = stylePresets[i % stylePresets.length];
    });
    setDemoPillars(pillars, pillarStyles);

    // 5. Auto-login the visitor
    const visitorMember = members.find(m => m.id === visitorId);
    if (visitorMember && !currentUser) {
      login({
        memberId: visitorId,
        memberName: visitorMember.name,
        phone: "0500000000",
      });
    }

    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surname, firstName]);

  if (!ready) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">جاري تحميل منصة عائلة {surname}...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Demo banner overlay */}
      <DemoBanner familyName={surname} onContact={() => setContactOpen(true)} />

      {/* Push content below the fixed banner */}
      <div style={{ paddingTop: "44px" }}>
        {/* The REAL Index page — identical to khunaini.nasaby.app */}
        <Index />
      </div>

      {/* Contact modal */}
      <DemoContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        familyName={surname}
        subdomain={slug || "demo"}
      />
    </>
  );
}
