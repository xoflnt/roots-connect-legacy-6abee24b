import { useState, useCallback } from "react";
import { useDemoFamily } from "@/hooks/useDemoFamily";
import { useFamilyContext } from "@/contexts/FamilyContext";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { DemoHero } from "@/components/demo/DemoHero";
import { DemoBranches } from "@/components/demo/DemoBranches";
import { DemoAboutFamily } from "@/components/demo/DemoAboutFamily";
import { DemoQuickActions, type DemoTab } from "@/components/demo/DemoQuickActions";
import { DemoFamilyTree } from "@/components/demo/DemoFamilyTree";
import { DemoSearch } from "@/components/demo/DemoSearch";
import { DemoKinship } from "@/components/demo/DemoKinship";
import { DemoMemberList } from "@/components/demo/DemoMemberList";
import { DemoFooter } from "@/components/demo/DemoFooter";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { User, ChevronLeft } from "lucide-react";
import { getDemoAncestorChain, getDemoChildren, getDemoDepth } from "@/services/demoService";
import type { DemoMember } from "@/data/demoFamilyData";

/** Extract a readable Arabic family surname from the slug */
function slugToArabic(slug: string): string {
  // If slug looks Arabic already (from subdomain that was Arabic-transliterated), use as-is
  // For Latin slugs, just capitalize and return — the user typed this
  return slug;
}

export default function DemoPage() {
  const { slug, demoFamilyName } = useFamilyContext() as any;
  const familyName: string = demoFamilyName || slug || "العائلة";
  const subdomain: string = slug || "demo";
  const { members, branches, totalCount } = useDemoFamily(familyName);

  const [activeTab, setActiveTab] = useState<DemoTab>("home");
  const [selectedMember, setSelectedMember] = useState<DemoMember | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const handleSelectMember = useCallback((id: string) => {
    const m = members.find(x => x.id === id);
    if (m) setSelectedMember(m);
  }, [members]);

  const handleTabChange = useCallback((tab: DemoTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <DemoLayout familyName={familyName} subdomain={subdomain}>
      {activeTab === "home" && (
        <>
          <DemoHero
            familyName={familyName}
            members={members}
            totalCount={totalCount}
            onSelectMember={handleSelectMember}
          />
          <DemoBranches familyName={familyName} branches={branches} />
          <DemoAboutFamily familyName={familyName} />
          <DemoQuickActions onTabChange={handleTabChange} />
          <DemoFooter onContact={() => setContactOpen(true)} />
        </>
      )}

      {activeTab === "tree" && (
        <div className="p-2 md:p-4" style={{ height: "calc(100dvh - 120px)" }}>
          <DemoFamilyTree members={members} onSelectMember={handleSelectMember} />
        </div>
      )}

      {activeTab === "search" && (
        <div className="p-2 md:p-4" style={{ height: "calc(100dvh - 120px)" }}>
          <DemoSearch members={members} familyName={familyName} onSelectMember={handleSelectMember} />
        </div>
      )}

      {activeTab === "kinship" && (
        <div className="p-2 md:p-4" style={{ height: "calc(100dvh - 120px)" }}>
          <DemoKinship members={members} familyName={familyName} />
        </div>
      )}

      {activeTab === "list" && (
        <div className="p-2 md:p-4" style={{ height: "calc(100dvh - 120px)" }}>
          <DemoMemberList members={members} familyName={familyName} branches={branches} onSelectMember={handleSelectMember} />
        </div>
      )}

      {/* Bottom nav for tabs */}
      {activeTab !== "home" && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2.5 border-t border-border/40 bg-card/95 backdrop-blur-md"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={() => handleTabChange("home")}
            className="px-4 py-2 rounded-xl text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
          >
            الرئيسية
          </button>
          {(["tree", "search", "kinship", "list"] as DemoTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {{ tree: "الشجرة", search: "بحث", kinship: "قرابة", list: "قائمة" }[tab]}
            </button>
          ))}
        </nav>
      )}

      {/* Member detail sheet */}
      <Sheet open={!!selectedMember} onOpenChange={(o) => !o && setSelectedMember(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70dvh]" dir="rtl">
          {selectedMember && (
            <MemberDetail member={selectedMember} members={members} onSelect={handleSelectMember} />
          )}
        </SheetContent>
      </Sheet>
    </DemoLayout>
  );
}

function MemberDetail({ member, members, onSelect }: { member: DemoMember; members: DemoMember[]; onSelect: (id: string) => void }) {
  const chain = getDemoAncestorChain(members, member.id);
  const children = getDemoChildren(members, member.id);
  const depth = getDemoDepth(members, member.id);
  const isMale = member.gender === "M";

  function toAr(n: number): string {
    return n.toLocaleString("ar-SA");
  }

  return (
    <div className="space-y-4 pb-4">
      <SheetHeader>
        <SheetTitle className="text-right">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMale ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400" : "bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400"}`}>
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold">{member.name}</p>
              <p className="text-sm text-muted-foreground font-normal">
                {isMale ? "ذكر" : "أنثى"} — الجيل {toAr(depth)}
              </p>
            </div>
          </div>
        </SheetTitle>
      </SheetHeader>

      <div className="grid grid-cols-2 gap-3">
        {member.birth_year && (
          <div className="bg-muted/50 rounded-xl p-3 border border-border/30">
            <p className="text-xs text-muted-foreground">سنة الميلاد</p>
            <p className="text-sm font-bold text-foreground">{member.birth_year} هـ</p>
          </div>
        )}
        {member.death_year && (
          <div className="bg-muted/50 rounded-xl p-3 border border-border/30">
            <p className="text-xs text-muted-foreground">سنة الوفاة</p>
            <p className="text-sm font-bold text-foreground">{member.death_year} هـ</p>
          </div>
        )}
        {member.spouses && (
          <div className="bg-muted/50 rounded-xl p-3 border border-border/30 col-span-2">
            <p className="text-xs text-muted-foreground">الزوجة</p>
            <p className="text-sm font-bold text-foreground">{member.spouses}</p>
          </div>
        )}
      </div>

      {/* Ancestor chain */}
      {chain.length > 1 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2">سلسلة النسب</p>
          <div className="flex flex-wrap items-center gap-1">
            {chain.map((m, i) => (
              <span key={m.id} className="flex items-center gap-1">
                <button
                  onClick={() => onSelect(m.id)}
                  className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                    m.id === member.id ? "bg-primary/15 text-primary font-bold" : "bg-muted/50 text-foreground hover:bg-muted"
                  }`}
                >
                  {m.name.split(" ")[0]}
                </button>
                {i < chain.length - 1 && <ChevronLeft className="h-3 w-3 text-muted-foreground" />}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Children */}
      {children.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2">الأبناء ({toAr(children.length)})</p>
          <div className="flex flex-wrap gap-1.5">
            {children.map(c => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className="text-xs bg-muted/50 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                {c.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
