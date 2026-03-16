import { useMemo, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { isDeceased, inferMotherName } from "@/services/familyService";
import { HeritageBadge } from "@/components/HeritageBadge";
import type { KinshipViewProps } from "./types";
import { useAuth } from "@/contexts/AuthContext";
import { canSeeSpouses, PRIVATE_LABEL } from "@/utils/privacyUtils";

export function KinshipTreeView({ result, person1, person2, onPersonTap }: KinshipViewProps) {
  const { currentUser } = useAuth();
  const isLoggedIn = !!currentUser;
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    setShowPulse(true);
    const t = setTimeout(() => setShowPulse(false), 3000);
    return () => clearTimeout(t);
  }, [result.lca?.id]);

  const { leftCol, rightCol } = useMemo(() => {
    const desc1 = [...result.path1].reverse();
    const desc2 = [...result.path2].reverse();
    return {
      rightCol: desc1.slice(1),
      leftCol: desc2.slice(1),
    };
  }, [result]);

  const lcaName = result.lca?.name.split(" ")[0] ?? "";
  const lcaLabel = result.lca?.gender === "F" ? "الجدة المشتركة" : "الجد المشترك";
  const maxLen = Math.max(rightCol.length, leftCol.length);

  const nodeClass = (m: typeof person1, isPerson1End: boolean, isPerson2End: boolean) => {
    const gender = m.gender === "F" ? "border-r-2 border-[hsl(var(--female))]" : "border-r-2 border-[hsl(var(--male))]";
    const deceased = isDeceased(m) ? "opacity-70" : "";
    const endRing = isPerson1End
      ? "ring-2 ring-primary/40"
      : isPerson2End
        ? "ring-2 ring-accent/40"
        : "";
    return `${gender} ${deceased} ${endRing}`;
  };

  return (
    <div className="py-4 space-y-4">
      {/* LCA Apex */}
      <div className="flex justify-center">
        <button
          onClick={() => result.lca && onPersonTap?.(result.lca)}
          className={`px-5 py-2.5 rounded-xl bg-accent/15 ring-2 ring-accent/40 text-center transition-all ${showPulse ? "animate-pulse" : ""}`}
        >
          <p className="text-[10px] text-muted-foreground mb-0.5">{lcaLabel}</p>
          <p className="text-sm font-extrabold text-accent-foreground">{lcaName}</p>
          {result.lca && isDeceased(result.lca) && (
            <div className="mt-1 flex justify-center">
              <HeritageBadge type="deceased" gender={result.lca.gender} />
            </div>
          )}
        </button>
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
          {rightCol.map((m, i) => {
            const isEnd = i === rightCol.length - 1;
            const motherName = isEnd ? inferMotherName(m) : null;
            return (
              <div key={m.id} className="flex flex-col items-center">
                {i > 0 && <div className="w-px h-3 bg-border" />}
                <button
                  onClick={() => onPersonTap?.(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs text-center transition-colors hover:bg-primary/15 ${
                    isEnd
                      ? "bg-primary/10 text-primary font-bold"
                      : "bg-muted text-muted-foreground"
                  } ${nodeClass(m, isEnd, false)}`}
                >
                  <span>{m.name.split(" ")[0]}</span>
                  {isDeceased(m) && (
                    <span className="block mt-0.5">
                      <HeritageBadge type="deceased" gender={m.gender} />
                    </span>
                  )}
                  {isEnd && motherName && canSeeSpouses(m.id, isLoggedIn) && (
                    <span className="block text-[10px] text-muted-foreground italic mt-0.5">
                      {m.gender === "M" ? "والدته" : "والدتها"}: {motherName}
                    </span>
                  )}
                  {isEnd && motherName && !canSeeSpouses(m.id, isLoggedIn) && (
                    <span className="block text-[10px] italic text-muted-foreground mt-0.5">{PRIVATE_LABEL}</span>
                  )}
                </button>
              </div>
            );
          })}
          {rightCol.length === 0 && (
            <button
              onClick={() => onPersonTap?.(person1)}
              className={`px-3 py-1.5 rounded-lg text-xs bg-primary/10 text-primary font-bold ring-2 ring-primary/40 border-r-2 ${person1.gender === "F" ? "border-[hsl(var(--female))]" : "border-[hsl(var(--male))]"}`}
            >
              {person1.name.split(" ")[0]}
            </button>
          )}
        </div>

        {/* Left column → Person 2 path */}
        <div className="flex flex-col items-center gap-0">
          {leftCol.map((m, i) => {
            const isEnd = i === leftCol.length - 1;
            const motherName = isEnd ? inferMotherName(m) : null;
            return (
              <div key={m.id} className="flex flex-col items-center">
                {i > 0 && <div className="w-px h-3 bg-border" />}
                <button
                  onClick={() => onPersonTap?.(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs text-center transition-colors hover:bg-accent/15 ${
                    isEnd
                      ? "bg-primary/10 text-primary font-bold"
                      : "bg-muted text-muted-foreground"
                  } ${nodeClass(m, false, isEnd)}`}
                >
                  <span>{m.name.split(" ")[0]}</span>
                  {isDeceased(m) && (
                    <span className="block mt-0.5">
                      <HeritageBadge type="deceased" gender={m.gender} />
                    </span>
                  )}
                  {isEnd && motherName && (
                    <span className="block text-[10px] text-muted-foreground italic mt-0.5">
                      {m.gender === "M" ? "والدته" : "والدتها"}: {motherName}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
          {leftCol.length === 0 && (
            <button
              onClick={() => onPersonTap?.(person2)}
              className={`px-3 py-1.5 rounded-lg text-xs bg-primary/10 text-primary font-bold ring-2 ring-accent/40 border-r-2 ${person2.gender === "F" ? "border-[hsl(var(--female))]" : "border-[hsl(var(--male))]"}`}
            >
              {person2.name.split(" ")[0]}
            </button>
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
