import { useMemo } from "react";
import { generationText, lcaContextWord } from "@/services/familyService";
import type { KinshipViewProps } from "./types";

export function KinshipDocumentView({ result, person1, person2, motherName1, motherName2, onPersonTap }: KinshipViewProps) {
  const name1 = person1.name.split(" ")[0];
  const name2 = person2.name.split(" ")[0];
  const lcaName = result.lca?.name.split(" ")[0] ?? "";
  const contextWord = lcaContextWord(result.dist1, result.dist2);

  const chain1 = useMemo(() => {
    return [...result.path1].reverse().map((m) => m.name.split(" ")[0]);
  }, [result.path1]);

  const chain2 = useMemo(() => {
    return [...result.path2].reverse().map((m) => m.name.split(" ")[0]);
  }, [result.path2]);

  const hasMothers = motherName1 || motherName2;

  return (
    <div className="py-5 space-y-5">
      {/* Document card */}
      <div className="rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 p-5 space-y-3 text-center">
        <p className="text-sm leading-relaxed text-foreground">
          يجتمع{" "}
          <button onClick={() => onPersonTap?.(person1)} className="font-bold text-primary hover:underline">{name1}</button>
          {" "}و{" "}
          <button onClick={() => onPersonTap?.(person2)} className="font-bold text-primary hover:underline">{name2}</button>
          {" "}في {contextWord}{" "}
          <button onClick={() => result.lca && onPersonTap?.(result.lca)} className="font-bold text-accent-foreground hover:underline">{lcaName}</button>.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          حيث يبعد <strong>{name1}</strong> عنه {generationText(result.dist1)}، ويبعد{" "}
          <strong>{name2}</strong> عنه {generationText(result.dist2)}.
        </p>
        {hasMothers && (
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            {motherName1 && motherName2
              ? `(والدة ${name1} هي ${motherName1}، ووالدة ${name2} هي ${motherName2}).`
              : motherName1
                ? `(والدة ${name1} هي ${motherName1}).`
                : `(والدة ${name2} هي ${motherName2}).`
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
