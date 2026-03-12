import { useMemo } from "react";
import type { KinshipViewProps } from "./types";

export function KinshipInteractiveView({ result, person1, person2 }: KinshipViewProps) {
  // Build rows bottom-up: row 0 = persons, row N = LCA
  const rows = useMemo(() => {
    const desc1 = [...result.path1].reverse(); // LCA → person1
    const desc2 = [...result.path2].reverse(); // LCA → person2
    const maxDepth = Math.max(desc1.length, desc2.length);
    const built: { left: string | null; right: string | null; isLCA: boolean }[] = [];

    for (let i = 0; i < maxDepth; i++) {
      const r = desc1.length - 1 - (maxDepth - 1 - i);
      const l = desc2.length - 1 - (maxDepth - 1 - i);
      const rName = r >= 0 && r < desc1.length ? desc1[r].name.split(" ")[0] : null;
      const lName = l >= 0 && l < desc2.length ? desc2[l].name.split(" ")[0] : null;

      // Check if this row is the LCA (both sides show LCA)
      const isLCA = i === 0 && rName === lName;
      if (isLCA) {
        built.push({ left: null, right: null, isLCA: true });
      } else {
        built.push({ right: rName, left: lName, isLCA: false });
      }
    }

    // If LCA wasn't merged into first row, add it
    if (built.length === 0 || !built[0].isLCA) {
      built.unshift({ left: null, right: null, isLCA: true });
    }

    return built;
  }, [result]);

  const lcaName = result.lca?.name.split(" ")[0] ?? "";
  const totalRows = rows.length;

  return (
    <div className="py-4 space-y-0 flex flex-col items-center">
      {rows.map((row, i) => {
        // Animation delay: top (LCA) comes last visually but we render top-down
        // Reverse stagger: LCA has longest delay
        const delay = (totalRows - 1 - i) * 150;
        const style = { animationDelay: `${delay}ms`, animationFillMode: "both" as const };

        if (row.isLCA) {
          return (
            <div key="lca" className="animate-scale-in mb-2" style={style}>
              <div className="px-5 py-2.5 rounded-xl bg-accent/15 ring-2 ring-accent/50 text-center shadow-md">
                <p className="text-[10px] text-muted-foreground mb-0.5">نقطة الالتقاء</p>
                <p className="text-sm font-extrabold text-accent-foreground">{lcaName}</p>
              </div>
            </div>
          );
        }

        return (
          <div key={i} className="animate-fade-in w-full" style={style}>
            {/* Connector */}
            <div className="flex justify-center">
              <div className="w-px h-3 bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex justify-center">
                {row.right ? (
                  <div className={`px-3 py-1.5 rounded-lg text-xs text-center ${
                    i === totalRows - 1 ? "bg-primary/10 text-primary font-bold" : "bg-muted text-muted-foreground"
                  }`}>
                    {row.right}
                  </div>
                ) : <div />}
              </div>
              <div className="flex justify-center">
                {row.left ? (
                  <div className={`px-3 py-1.5 rounded-lg text-xs text-center ${
                    i === totalRows - 1 ? "bg-primary/10 text-primary font-bold" : "bg-muted text-muted-foreground"
                  }`}>
                    {row.left}
                  </div>
                ) : <div />}
              </div>
            </div>
          </div>
        );
      })}

      {/* Bottom labels */}
      <div className="grid grid-cols-2 gap-3 w-full mt-2 text-center">
        <p className="text-[10px] text-muted-foreground font-bold">{person1.name.split(" ")[0]}</p>
        <p className="text-[10px] text-muted-foreground font-bold">{person2.name.split(" ")[0]}</p>
      </div>
    </div>
  );
}
