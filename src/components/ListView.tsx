import { useMemo, useState, useCallback } from "react";
import { User, ChevronDown, ChevronLeft, Users } from "lucide-react";
import { familyMembers, type FamilyMember } from "@/data/familyData";

interface ListViewProps {
  onSelectMember?: (memberId: string) => void;
}

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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <div className="py-6 md:py-8 px-3 md:px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 space-y-2">
          <div className="inline-block px-4 py-1.5 rounded-full bg-accent/15 text-accent font-bold text-sm">
            عرض القوائم
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
            تصفح العائلة
          </h2>
          <p className="text-muted-foreground text-sm">
            اضغط على أي شخص لعرض أبنائه
          </p>
        </div>

        {/* Tree as nested list */}
        <div className="space-y-1">
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

  return (
    <div>
      <button
        onClick={() => hasChildren ? onToggle(member.id) : onSelect?.(member.id)}
        className={`
          w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl text-right transition-all duration-200
          hover:bg-muted/60 active:scale-[0.99]
          ${isExpanded && hasChildren ? "bg-muted/40" : ""}
        `}
        style={{ paddingRight: `${depth * 1.25 + 0.75}rem`, minHeight: 52 }}
      >
        {/* Expand icon — 44px touch target */}
        <div className="min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 -m-2">
          {hasChildren ? (
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                isExpanded ? "rotate-0" : "-rotate-90"
              }`}
            />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-border" />
          )}
        </div>

        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isMale
              ? "bg-[hsl(var(--male-light))]"
              : "bg-[hsl(var(--female-light))]"
          }`}
        >
          <User
            className={`h-4 w-4 ${
              isMale ? "text-[hsl(var(--male))]" : "text-[hsl(var(--female))]"
            }`}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <span className="font-bold text-foreground text-sm truncate block">
            {member.name}
          </span>
          {(member.birth_year || member.death_year) && (
            <span className="text-xs text-muted-foreground">
              {member.birth_year && `${member.birth_year} هـ`}
              {member.birth_year && member.death_year && " — "}
              {member.death_year && `${member.death_year} هـ`}
            </span>
          )}
        </div>

        {/* Children count badge */}
        {hasChildren && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
            <Users className="h-3 w-3" />
            {children.length}
          </div>
        )}

        {/* Navigate to lineage */}
        {!hasChildren && onSelect && (
          <div
            className="min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 -m-2"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(member.id);
            }}
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground/40" />
          </div>
        )}
      </button>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div
          className="border-r-2 border-border/40 animate-accordion-down"
          style={{ marginRight: `${depth * 1.25 + 2}rem` }}
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
