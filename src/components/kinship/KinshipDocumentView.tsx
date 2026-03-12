import { useMemo } from "react";
import type { KinshipViewProps } from "./types";

function toArabicNum(n: number): string {
  return n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);
}

export function KinshipDocumentView({ result, person1, person2 }: KinshipViewProps) {
  const name1 = person1.name.split(" ")[0];
  const name2 = person2.name.split(" ")[0];
  const lcaName = result.lca?.name.split(" ")[0] ?? "";

  const chain1 = useMemo(() => {
    return [...result.path1].reverse().map((m) => m.name.split(" ")[0]);
  }, [result.path1]);

  const chain2 = useMemo(() => {
    return [...result.path2].reverse().map((m) => m.name.split(" ")[0]);
  }, [result.path2]);

  return (
    <div className="py-5 space-y-5">
      {/* Document card */}
      <div className="rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 p-5 space-y-3 text-center">
        <p className="text-sm leading-relaxed text-foreground">
          يجتمع <strong className="text-primary">{name1}</strong> و{" "}
          <strong className="text-primary">{name2}</strong> في جدهما المشترك{" "}
          <strong className="text-accent-foreground">{lcaName}</strong>.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          حيث يبعد <strong>{name1}</strong> عنه ({toArabicNum(result.dist1)}) أجيال، ويبعد{" "}
          <strong>{name2}</strong> عنه ({toArabicNum(result.dist2)}) أجيال.
        </p>
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
