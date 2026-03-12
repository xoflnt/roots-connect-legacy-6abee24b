import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import type { KinshipViewProps } from "./types";

export function KinshipTreeView({ result, person1, person2 }: KinshipViewProps) {
  // path1: person1 → ... → LCA (ascending), path2: person2 → ... → LCA (ascending)
  // We want descending from LCA: reverse both, skip LCA duplicate
  const { leftCol, rightCol } = useMemo(() => {
    const desc1 = [...result.path1].reverse(); // LCA first → person1 last
    const desc2 = [...result.path2].reverse(); // LCA first → person2 last
    return {
      rightCol: desc1.slice(1), // skip LCA (shown at apex)
      leftCol: desc2.slice(1),
    };
  }, [result]);

  const lcaName = result.lca?.name.split(" ")[0] ?? "";
  const maxLen = Math.max(rightCol.length, leftCol.length);

  return (
    <div className="py-4 space-y-4">
      {/* LCA Apex */}
      <div className="flex justify-center">
        <div className="px-5 py-2.5 rounded-xl bg-accent/15 ring-2 ring-accent/40 text-center">
          <p className="text-[10px] text-muted-foreground mb-0.5">الجد المشترك</p>
          <p className="text-sm font-extrabold text-accent-foreground">{lcaName}</p>
        </div>
      </div>

      {/* Connector from apex */}
      {maxLen > 0 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-6">
            <div className="w-16 h-px bg-border" />
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
            <div className="w-16 h-px bg-border" />
          </div>
        </div>
      )}

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-3">
        {/* Right column → Person 1 path */}
        <div className="flex flex-col items-center gap-0">
          {rightCol.map((m, i) => (
            <div key={m.id} className="flex flex-col items-center">
              {i > 0 && <div className="w-px h-3 bg-border" />}
              <div className={`px-3 py-1.5 rounded-lg text-xs text-center ${
                i === rightCol.length - 1
                  ? "bg-primary/10 text-primary font-bold"
                  : "bg-muted text-muted-foreground"
              }`}>
                {m.name.split(" ")[0]}
              </div>
            </div>
          ))}
          {rightCol.length === 0 && (
            <div className="px-3 py-1.5 rounded-lg text-xs bg-primary/10 text-primary font-bold">
              {person1.name.split(" ")[0]}
            </div>
          )}
        </div>

        {/* Left column → Person 2 path */}
        <div className="flex flex-col items-center gap-0">
          {leftCol.map((m, i) => (
            <div key={m.id} className="flex flex-col items-center">
              {i > 0 && <div className="w-px h-3 bg-border" />}
              <div className={`px-3 py-1.5 rounded-lg text-xs text-center ${
                i === leftCol.length - 1
                  ? "bg-primary/10 text-primary font-bold"
                  : "bg-muted text-muted-foreground"
              }`}>
                {m.name.split(" ")[0]}
              </div>
            </div>
          ))}
          {leftCol.length === 0 && (
            <div className="px-3 py-1.5 rounded-lg text-xs bg-primary/10 text-primary font-bold">
              {person2.name.split(" ")[0]}
            </div>
          )}
        </div>
      </div>

      {/* Labels */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <p className="text-[10px] text-muted-foreground font-bold">{person1.name.split(" ")[0]}</p>
        <p className="text-[10px] text-muted-foreground font-bold">{person2.name.split(" ")[0]}</p>
      </div>
    </div>
  );
}
