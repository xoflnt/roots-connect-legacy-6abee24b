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
import Index from "./Index";

export default function DemoPage() {
  const { slug, demoFamilyName, demoFirstName, familyName } = useFamilyContext();
  const { login, currentUser } = useAuth();
  const [contactOpen, setContactOpen] = useState(false);

  const surname: string = demoFamilyName || familyName || slug || "العائلة";
  const firstName: string = demoFirstName || "زائر";

  // CRITICAL: Inject demo data SYNCHRONOUSLY before any child renders.
  // useState initializer runs once, synchronously, before first render.
  const [demoReady] = useState(() => {
    try {
      const baseMembers = getDemoMembers(surname);
      const { members, visitorId } = insertVisitorMember(
        baseMembers as FamilyMember[], firstName, surname
      );
      injectDemoData(members);

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

      return { visitorId, visitorName: members.find(m => m.id === visitorId)?.name || firstName };
    } catch (e) {
      console.error("Demo data injection failed:", e);
      return { visitorId: "D_VISITOR", visitorName: firstName };
    }
  });

  // Login the visitor — ALWAYS override any existing user for demo
  useEffect(() => {
    login({
      memberId: demoReady.visitorId,
      memberName: demoReady.visitorName,
      phone: "0500000000",
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <DemoBanner familyName={surname} onContact={() => setContactOpen(true)} />
      <div style={{ paddingTop: "44px" }}>
        <Index />
      </div>
      <DemoContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        familyName={surname}
        subdomain={slug || "demo"}
      />
    </>
  );
}
