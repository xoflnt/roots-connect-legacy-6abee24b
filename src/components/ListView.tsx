import { useMemo, useState, useCallback } from "react";
import { User, ChevronDown, ChevronLeft, Users } from "lucide-react";
import { familyMembers, type FamilyMember } from "@/data/familyData";

interface ListViewProps {
  onSelectMember?: (memberId: string) => void;
}

const DEPTH_ACCENTS = [
  "hsl(var(--accent))",
  "hsl(var(--primary))",
  "hsl(340, 60%, 55%)",
  "hsl(35, 70%, 50%)",
  "hsl(175, 50%, 40%)",
  "hsl(270, 45%, 55%)",
];

export function ListView({ onSelectMember }: ListViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const roots = familyMembers.filter((m) => !m.father_id);
    return new Set(roots.map((r) => r.id));
  });

  const childrenMap = useMemo(() => {
    const map = new Map<string, FamilyMember[]>();
    familyMembers.forEach((m) => {
      if (m.father_id) {
        if (!map.has(m.father_id)) map.set(m.father_id, []);
        map.get(m.father_id)!.push(m);
      }
    });
    return map;
  }, []);

  const roots = useMemo(
    () => familyMembers.filter((m) => !m.father_id),
    []
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="py-6 md:py-8 px-3 md:px-4 overflow-x-hidden" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 space-y-3">
          <div className="inline-block px-5 py-2 rounded-full bg-accent/15 text-accent font-bold text-sm">
            عرض القوائم
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
            تصفح العائلة
          </h2>
          <p className="text-muted-foreground text-sm">
            اضغط على أي شخص لعرض أبنائه
          </p>
        </div>

        {/* Tree as nested cards */}
        <div className="space-y-2">
          {roots.map((root) => (
            <ListNode
              key={root.id}
              member={root}
              depth={0}
              childrenMap={childrenMap}
              expandedIds={expandedIds}
              onToggle={toggleExpand}
              onSelect={onSelectMember}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ListNodeProps {
  member: FamilyMember;
  depth: number;
  childrenMap: Map<string, FamilyMember[]>;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect?: (id: string) => void;
}

function ListNode({ member, depth, childrenMap, expandedIds, onToggle, onSelect }: ListNodeProps) {
  const children = childrenMap.get(member.id) || [];
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(member.id);
  const isMale = member.gender === "M";
  const accentColor = DEPTH_ACCENTS[depth % DEPTH_ACCENTS.length];

  return (
    <div>
      {/* Card-style item */}
      <div
        className={`
          relative rounded-xl border transition-all duration-200 overflow-hidden
          ${isExpanded && hasChildren
            ? "bg-muted/30 border-border shadow-sm"
            : "bg-card border-border/50 hover:border-primary/30 hover:shadow-sm"
          }
        `}
      >
        {/* Depth color bar */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1 rounded-r-xl"
          style={{ backgroundColor: accentColor }}
        />

        <button
          onClick={() => hasChildren ? onToggle(member.id) : onSelect?.(member.id)}
          className="w-full flex items-center gap-3 px-4 pr-5 py-3.5 md:py-4 text-right transition-colors active:bg-muted/40"
          style={{ minHeight: 60 }}
        >
          {/* Expand icon */}
          <div className="min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0 -mr-1">
            {hasChildren ? (
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isExpanded
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isExpanded ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </div>
            ) : (
              <div className="w-2 h-2 rounded-full bg-border" />
            )}
          </div>

          {/* Avatar */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isMale
                ? "bg-[hsl(var(--male-light))]"
                : "bg-[hsl(var(--female-light))]"
            }`}
          >
            <User
              className={`h-4.5 w-4.5 ${
                isMale ? "text-[hsl(var(--male))]" : "text-[hsl(var(--female))]"
              }`}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <span className="font-bold text-foreground text-sm md:text-base block leading-snug">
              {member.name}
            </span>
            {(member.birth_year || member.death_year) && (
              <span className="text-xs text-muted-foreground mt-0.5 block">
                {member.birth_year && `${member.birth_year} هـ`}
                {member.birth_year && member.death_year && " — "}
                {member.death_year && `${member.death_year} هـ`}
              </span>
            )}
          </div>

          {/* Children count badge */}
          {hasChildren && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0"
              style={{
                backgroundColor: `${accentColor}15`,
                color: accentColor,
              }}
            >
              <Users className="h-3 w-3" />
              {children.length}
            </div>
          )}

          {/* Navigate to details for leaf nodes */}
          {!hasChildren && onSelect && (
            <div
              className="min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(member.id);
              }}
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground/40" />
            </div>
          )}
        </button>

        {/* Inline lineage link for nodes with children */}
        {hasChildren && onSelect && (
          <div className="border-t border-border/30 px-5 pr-6">
            <button
              onClick={() => onSelect(member.id)}
              className="flex items-center gap-1.5 text-xs text-primary font-medium hover:text-primary/80 transition-colors py-2.5 min-h-[36px]"
            >
              <ChevronLeft className="h-3 w-3" />
              عرض التفاصيل
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div
          className="space-y-1.5 pt-1.5 pb-1 animate-accordion-down"
          style={{ paddingRight: `${Math.min(depth + 1, 3) * 0.75}rem` }}
        >
          {children.map((child) => (
            <ListNode
              key={child.id}
              member={child}
              depth={depth + 1}
              childrenMap={childrenMap}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
