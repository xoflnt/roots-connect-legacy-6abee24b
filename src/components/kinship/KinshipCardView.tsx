import { useState, useMemo, useCallback } from "react";
import { Users, ChevronLeft, Loader2, Link2, User, Download, ExternalLink } from "lucide-react";
import { generateKinshipImage } from "./KinshipShareCard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { FamilyMember } from "@/data/familyData";
import type { KinshipViewProps } from "./types";
import type { DirectionalKinship } from "@/services/familyService";
import { getBranch, getBranchStyle } from "@/utils/branchUtils";
import { toArabicNum } from "@/utils/ageCalculator";
import { inferMotherName } from "@/services/familyService";
import { useAuth } from "@/contexts/AuthContext";
import { canSeeSpouses, PRIVATE_LABEL } from "@/utils/privacyUtils";

interface KinshipCardViewProps extends KinshipViewProps {
  relationText: string;
  directional: DirectionalKinship | null;
}

export function KinshipCardView({
  result,
  person1,
  person2,
  onPersonTap,
  relationText,
  directional,
}: KinshipCardViewProps) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const isLoggedIn = !!currentUser;
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const name1 = person1.name.split(" ")[0];
  const name2 = person2.name.split(" ")[0];
  const lcaName = result.lca?.name.split(" ")[0] ?? "";
  const lcaLabel = (() => {
    const isFemale = result.lca?.gender === "F";
    if (result.dist1 === 1 && result.dist2 === 1) return isFemale ? "الأم المشتركة" : "الأب المشترك";
    if (result.dist1 === 1 || result.dist2 === 1) return isFemale ? "الجدة/الأم المشتركة" : "الجد/الأب المشترك";
    return isFemale ? "الجدة المشتركة" : "الجد المشترك";
  })();
  const genLabel = (d: number) => d === 1 ? "جيل" : d === 2 ? "جيلان" : "أجيال";

  const branch1 = getBranch(person1.id);
  const branch2 = getBranch(person2.id);
  const branchStyle1 = branch1 ? getBranchStyle(branch1.pillarId) : null;
  const branchStyle2 = branch2 ? getBranchStyle(branch2.pillarId) : null;

  // Build full path: person1 → ... → LCA → ... → person2
  const pathChain = useMemo(() => {
    const p1 = [...result.path1]; // person1 → LCA
    const p2Rev = [...result.path2].slice(0, -1).reverse(); // skip LCA, reverse to get LCA+1 → person2
    return [...p1, ...p2Rev];
  }, [result]);

  const shareUrl = `${window.location.origin}/?view=kinship&p1=${person1.id}&p2=${person2.id}`;
  const shareText = `${name1} و ${name2} — ${relationText}\nاكتشف قرابتك: ${shareUrl}`;

  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      const canvas = await generateKinshipImage(
        result, person1, person2, relationText, directional, pathChain
      );
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob) { setSharing(false); return; }

      const file = new File([blob], "kinship-card.png", { type: "image/png" });

      // Try native share with file
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "صلة القرابة",
            text: `${name1} و ${name2} — ${relationText}`,
          });
          setSharing(false);
          return;
        } catch { /* user cancelled or failed */ }
      }

      // Fallback: show options sheet
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      setShowFallback(true);
      setSharing(false);
    } catch (err) {
      console.error("Share error:", err);
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
      setSharing(false);
    }
  }, [result, person1, person2, relationText, directional, pathChain, name1, name2, shareText]);

  const handleDownloadPng = useCallback(async () => {
    let url = blobUrl;
    if (!url) {
      const canvas = await generateKinshipImage(
        result, person1, person2, relationText, directional, pathChain
      );
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob) return;
      url = URL.createObjectURL(blob);
      setBlobUrl(url);
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = `قرابة-${name1}-${name2}.png`;
    a.click();
  }, [blobUrl, name1, name2, result, person1, person2, relationText, directional, pathChain]);

  const handleWhatsAppText = useCallback(() => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  }, [shareText]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const closeFallback = useCallback(() => {
    setShowFallback(false);
    if (blobUrl) { URL.revokeObjectURL(blobUrl); setBlobUrl(null); }
  }, [blobUrl]);

  return (
    <div className="py-4 space-y-4">
      {/* ── Shareable card (captured by screenshot) ── */}
      <div
        dir="rtl"
        className="rounded-2xl shadow-lg p-6 space-y-5 border border-[hsl(38,25%,82%)]"
        style={{
          background: "linear-gradient(to bottom, hsl(38,30%,97%), hsl(38,20%,93%))",
        }}
      >
        {/* Top gold line */}
        <div className="h-1 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent -mt-3" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 text-accent-foreground">
            <Users className="h-4 w-4" />
            <span className="font-bold text-sm">صلة القرابة</span>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{relationText}</p>
          {directional && !directional.symmetric && (directional.title1to2 || directional.title2to1) && (
            <div className="space-y-1">
              {directional.title1to2 && (
                <p className="text-sm text-muted-foreground" style={{ direction: 'rtl', unicodeBidi: 'plaintext' }}>
                  {name1 + " " + (person1.gender === "F" ? "هي" : "هو") + " "}
                  <strong className="text-foreground">{directional.title1to2}</strong>
                  {" " + name2}
                </p>
              )}
              {directional.title2to1 && (
                <p className="text-sm text-muted-foreground" style={{ direction: 'rtl', unicodeBidi: 'plaintext' }}>
                  {name2 + " " + (person2.gender === "F" ? "هي" : "هو") + " "}
                  <strong className="text-foreground">{directional.title2to1}</strong>
                  {" " + name1}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Two person chips */}
        <div className="flex flex-row-reverse gap-3">
          <PersonChip
            member={person1}
            branch={branch1}
            branchStyle={branchStyle1}
            borderClass="border-primary/30"
            onTap={onPersonTap}
          />
          <PersonChip
            member={person2}
            branch={branch2}
            branchStyle={branchStyle2}
            borderClass="border-accent/50"
            onTap={onPersonTap}
          />
        </div>

        {/* Common ancestor */}
        <div className="border border-dashed border-accent/30 rounded-xl px-4 py-3 text-center space-y-1">
          <p className="text-xs text-muted-foreground">يجتمعان في</p>
          <button
            onClick={() => result.lca && onPersonTap?.(result.lca)}
            className="text-base font-extrabold text-accent-foreground hover:underline"
          >
            {lcaName}
          </button>
          <p className="text-xs text-muted-foreground">{lcaLabel}</p>
        </div>

        {/* Distance badges */}
        <div className="flex flex-row-reverse gap-3">
          <div className="flex-1 rounded-xl bg-muted/50 border border-border/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">{name1}</p>
            <p className="text-3xl font-extrabold text-primary">{toArabicNum(result.dist1)}</p>
            <p className="text-xs text-muted-foreground">{genLabel(result.dist1)}</p>
          </div>
          <div className="flex-1 rounded-xl bg-muted/50 border border-border/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">{name2}</p>
            <p className="text-3xl font-extrabold text-primary">{toArabicNum(result.dist2)}</p>
            <p className="text-xs text-muted-foreground">{genLabel(result.dist2)}</p>
          </div>
        </div>

        {/* Path chain */}
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="flex flex-row items-center gap-1 min-w-max" dir="rtl">
            {pathChain.map((m, i) => {
              const isP1 = m.id === person1.id;
              const isP2 = m.id === person2.id;
              const isLCA = m.id === result.lca?.id;
              const pillClass = isP1 || isP2
                ? "bg-primary/15 text-primary font-bold"
                : isLCA
                  ? "bg-accent/15 text-accent-foreground font-bold ring-1 ring-accent/30"
                  : "bg-muted text-muted-foreground";
              return (
                <div key={m.id + "-" + i} className="flex items-center gap-1">
                  {i > 0 && <ChevronLeft className="h-3 w-3 text-muted-foreground shrink-0" />}
                  <button
                    onClick={() => onPersonTap?.(m)}
                    className={`rounded-full px-3 py-1 text-xs whitespace-nowrap transition-colors hover:opacity-80 ${pillClass}`}
                  >
                    {m.name.split(" ")[0]}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          بوابة تراث الخنيني — فرع الزلفي
        </p>

        {/* Bottom gold line */}
        <div className="h-1 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent -mb-3" />
      </div>

      {/* ── Share buttons (outside cardRef) ── */}
      <Button
        onClick={handleShare}
        disabled={sharing}
        className="w-full min-h-[52px] rounded-2xl font-bold text-base bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {sharing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin ml-2" />
            جاري التحضير...
          </>
        ) : (
          <>📤 شارك النتيجة</>
        )}
      </Button>

      <Button
        onClick={handleCopyLink}
        variant="outline"
        className="w-full min-h-[44px] rounded-2xl"
      >
        {copied ? "تم النسخ ✓" : (
          <>
            <Link2 className="h-4 w-4 ml-2" />
            🔗 نسخ الرابط
          </>
        )}
      </Button>

      {/* Fallback share options sheet */}
      <Sheet open={showFallback} onOpenChange={(open) => !open && closeFallback()}>
        <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-8 pt-4" dir="rtl">
          <SheetHeader className="pb-3">
            <SheetTitle className="text-base font-bold text-center">شارك النتيجة</SheetTitle>
          </SheetHeader>
          <div className="space-y-3">
            <Button onClick={handleDownloadPng} variant="outline" className="w-full min-h-[48px] rounded-xl gap-2">
              <Download className="h-4 w-4" />
              💾 حفظ الصورة
            </Button>
            <Button onClick={handleWhatsAppText} className="w-full min-h-[48px] rounded-xl gap-2 bg-[#25D366] hover:bg-[#22bf5c] text-white">
              <ExternalLink className="h-4 w-4" />
              📱 مشاركة الرابط عبر واتساب
            </Button>
            <Button onClick={() => { handleCopyLink(); closeFallback(); }} variant="outline" className="w-full min-h-[48px] rounded-xl gap-2">
              <Link2 className="h-4 w-4" />
              📋 نسخ الرابط
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ── PersonChip sub-component ── */
function PersonChip({
  member,
  branch,
  branchStyle,
  borderClass,
  onTap,
}: {
  member: FamilyMember;
  branch: { pillarId: string; label: string } | null;
  branchStyle: { bg: string; text: string } | null;
  borderClass: string;
  onTap?: (m: FamilyMember) => void;
}) {
  const isMale = member.gender === "M";
  const genderBg = isMale ? "bg-[hsl(var(--male))]/15" : "bg-[hsl(var(--female))]/15";
  const genderText = isMale ? "text-[hsl(var(--male))]" : "text-[hsl(var(--female))]";
  const motherName = inferMotherName(member);

  return (
    <button
      onClick={() => onTap?.(member)}
      className={`flex-1 rounded-xl border bg-card/80 p-3 text-center space-y-2 transition-colors hover:bg-card ${borderClass}`}
    >
      <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center ${genderBg}`}>
        <User className={`h-5 w-5 ${genderText}`} />
      </div>
      <p className="text-sm font-bold text-foreground line-clamp-2">{member.name}</p>
      {branch && branchStyle && (
        <span
          className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: branchStyle.bg, color: branchStyle.text }}
        >
          {branch.label}
        </span>
      )}
      {motherName && (
        <span className="inline-block text-[10px] text-muted-foreground bg-muted/40 rounded px-2 py-0.5">
          {isMale ? "والدته" : "والدتها"}: {motherName}
        </span>
      )}
    </button>
  );
}
