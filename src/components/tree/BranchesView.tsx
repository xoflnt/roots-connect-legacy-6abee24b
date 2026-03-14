import React, { useState, useCallback, useMemo } from "react";
import {
  getChildrenOf,
  sortByBirth,
  getDescendantCount,
  getDepth,
  isDeceased,
} from "@/services/familyService";
import { PILLARS, getBranchStyle } from "@/utils/branchUtils";
import { formatAge } from "@/utils/ageCalculator";
import { HeritageBadge } from "@/components/HeritageBadge";
import { PersonDetails } from "@/components/PersonDetails";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronLeft, Users } from "lucide-react";
import { getVerifiedMemberIds } from "@/services/dataService";
import { cn } from "@/lib/utils";
import type { FamilyMember } from "@/data/familyData";

// ── Recursive node ──
const BranchNode = React.memo(function BranchNode({
  member,
  depth,
  pillarId,
  expandedIds,
  onToggle,
  onSelect,
}: {
  member: FamilyMember;
  depth: number;
  pillarId: string;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (m: FamilyMember) => void;
}) {
  const children = useMemo(() => sortByBirth(getChildrenOf(member.id)), [member.id]);
  const isExpanded = expandedIds.has(member.id);
  const hasChildren = children.length > 0;
  const style = getBranchStyle(pillarId);
  const deceased = isDeceased(member);
  const verified = isVerifiedMember(member.id);
  const generation = getDepth(member.id);
  const indent = Math.min(depth, 4) * 16;

  // Convert generation to Arabic ordinal
  const genLabel = `الجيل ${generation.toLocaleString("ar-SA")}`;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 border-b border-border/20 transition-colors hover:bg-muted/50 min-h-[44px]",
          deceased && "opacity-70"
        )}
        style={{ paddingRight: `${indent + 12}px`, borderRightWidth: "3px", borderRightColor: style.text + "55" }}
        dir="rtl"
      >
        {/* Expand/collapse */}
        {hasChildren ? (
          <button
            onClick={() => onToggle(member.id)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-muted shrink-0"
            aria-label={isExpanded ? "طي" : "توسيع"}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </button>
        ) : (
          <div className="w-[44px] shrink-0" />
        )}

        {/* Person info */}
        <button
          onClick={() => onSelect(member)}
          className="flex-1 min-w-0 text-right flex items-center gap-2"
        >
          <span className="font-bold text-sm text-foreground truncate">{member.name}</span>
          {verified && <span className="text-green-500 text-xs">✅</span>}
          {deceased && <HeritageBadge type="deceased" size="sm" />}
        </button>

        {/* Meta */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {genLabel}
          </Badge>
          {member.birth_year && (
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {formatAge(member.birth_year, member.death_year)}
            </span>
          )}
          {hasChildren && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
              <Users className="h-3 w-3" />
              {children.length.toLocaleString("ar-SA")}
            </Badge>
          )}
        </div>
      </div>

      {/* Children (lazy) */}
      {isExpanded && hasChildren && (
        <div className="animate-accordion-down">
          {children.map((child) => (
            <BranchNode
              key={child.id}
              member={child}
              depth={depth + 1}
              pillarId={pillarId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// ── Main Component ──
export function BranchesView() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const toggleBranch = useCallback((pillarId: string) => {
    setExpandedBranches((prev) => {
      const next = new Set(prev);
      if (next.has(pillarId)) next.delete(pillarId);
      else next.add(pillarId);
      return next;
    });
  }, []);

  const toggleNode = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const branchData = useMemo(
    () =>
      PILLARS.map((pillar) => ({
        ...pillar,
        count: getDescendantCount(pillar.id),
        style: getBranchStyle(pillar.id),
        children: sortByBirth(getChildrenOf(pillar.id)),
      })),
    []
  );

  return (
    <div className="w-full h-full overflow-y-auto bg-background" dir="rtl">
      {/* Branch header cards */}
      <div className="p-3 space-y-2">
        {branchData.map((branch) => {
          const isOpen = expandedBranches.has(branch.id);
          return (
            <div key={branch.id} className="rounded-2xl border overflow-hidden bg-card shadow-sm">
              {/* Header */}
              <button
                onClick={() => toggleBranch(branch.id)}
                className="w-full flex items-center gap-3 p-4 min-h-[56px] transition-colors hover:bg-muted/50"
                style={{ borderRightWidth: "4px", borderRightColor: branch.style.text }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: branch.style.bg, color: branch.style.text }}
                >
                  {branch.name.charAt(0)}
                </div>
                <div className="flex-1 text-right">
                  <h3 className="font-extrabold text-foreground">{branch.label}</h3>
                  <span className="text-xs text-muted-foreground">
                    {branch.count.toLocaleString("ar-SA")} فرداً
                  </span>
                </div>
                <ChevronLeft
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-200",
                    isOpen && "-rotate-90"
                  )}
                />
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="border-t border-border/30 animate-accordion-down">
                  {branch.children.map((child) => (
                    <BranchNode
                      key={child.id}
                      member={child}
                      depth={0}
                      pillarId={branch.id}
                      expandedIds={expandedIds}
                      onToggle={toggleNode}
                      onSelect={setSelectedMember}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <PersonDetails member={selectedMember} onClose={() => setSelectedMember(null)} />
    </div>
  );
}
