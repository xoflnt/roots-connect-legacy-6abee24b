import { useMemo } from "react";
import { generationText, lcaContextWord } from "@/services/familyService";
import type { KinshipViewProps } from "./types";
import { useAuth } from "@/contexts/AuthContext";
import { canSeeSpouses, PRIVATE_LABEL } from "@/utils/privacyUtils";

export function KinshipDocumentView({ result, person1, person2, motherName1, motherName2, onPersonTap }: KinshipViewProps) {
  const name1 = person1.name.split(" ")[0];
  const name2 = person2.name.split(" ")[0];
  const lcaName = result.lca?.name.split(" ")[0] ?? "";
  const contextWord = lcaContextWord(result.dist1, result.dist2, result.lca?.gender);
  const lcaPronoun = result.lca?.gender === "F" ? "عنها" : "عنه";

  const chain1 = useMemo(() => {
    return [...result.path1].reverse().map((m) => m.name.split(" ")[0]);
  }, [result.path1]);

  const chain2 = useMemo(() => {
    return [...result.path2].reverse().map((m) => m.name.split(" ")[0]);
  }, [result.path2]);

  const hasMothers = motherName1 || motherName2;
  const motherLabel1 = person1.gender === "M" ? "والدته" : "والدتها";
  const motherLabel2 = person2.gender === "M" ? "والدته" : "والدتها";

  return (
    <div className="py-5 space-y-5">
      {/* Document card */}
      <div className="rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 p-5 space-y-3 text-center" dir="rtl">
        <p className="text-sm leading-relaxed text-foreground" style={{ direction: 'rtl', unicodeBidi: 'plaintext' }}>
          {"يجتمع "}
          <span role="button" tabIndex={0} onClick={() => onPersonTap?.(person1)} className="font-bold text-primary hover:underline cursor-pointer">{name1}</span>
          {" و "}
          <span role="button" tabIndex={0} onClick={() => onPersonTap?.(person2)} className="font-bold text-primary hover:underline cursor-pointer">{name2}</span>
          {" في " + contextWord + " "}
          <span role="button" tabIndex={0} onClick={() => result.lca && onPersonTap?.(result.lca)} className="font-bold text-accent-foreground hover:underline cursor-pointer">{lcaName}</span>
          {"\u200F."}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed" style={{ direction: 'rtl', unicodeBidi: 'plaintext' }}>
          {"حيث يبعد "}
          <strong>{name1}</strong>
          {" " + lcaPronoun + " " + generationText(result.dist1) + "، ويبعد "}
          <strong>{name2}</strong>
          {" " + lcaPronoun + " " + generationText(result.dist2) + "\u200F."}
        </p>
        {hasMothers && (
          <p className="text-xs text-muted-foreground leading-relaxed mt-2" style={{ direction: 'rtl', unicodeBidi: 'plaintext' }}>
            {motherName1 && motherName2
              ? `(${motherLabel1} ${name1} هي ${motherName1}، و${motherLabel2} ${name2} هي ${motherName2})\u200F.`
              : motherName1
                ? `(${motherLabel1} ${name1} هي ${motherName1})\u200F.`
                : `(${motherLabel2} ${name2} هي ${motherName2})\u200F.`
            }
          </p>
        )}
      </div>

      {/* Chain flows */}
      <div className="space-y-3">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-[10px] text-muted-foreground font-bold mb-1.5">مسار {name1}</p>
          <p className="text-xs text-foreground font-medium">{chain1.join(" ← ")}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-[10px] text-muted-foreground font-bold mb-1.5">مسار {name2}</p>
          <p className="text-xs text-foreground font-medium">{chain2.join(" ← ")}</p>
        </div>
      </div>
    </div>
  );
}
