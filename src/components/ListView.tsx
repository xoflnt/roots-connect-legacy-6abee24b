import { useMemo, useState, useCallback } from "react";
import { User, ChevronDown, ChevronLeft, Users, UserPlus } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { downloadVCard } from "@/utils/vcard";
import { type FamilyMember } from "@/data/familyData";
import { getAllMembers, inferMotherName, sortByBirth } from "@/services/familyService";
import { BRANCH_COLORS } from "@/hooks/useTreeLayout";
import { formatAge } from "@/utils/ageCalculator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PILLARS, getBranch, getBranchStyle } from "@/utils/branchUtils";

interface ListViewProps {
  onSelectMember?: (memberId: string) => void;
}

const DEPTH_ACCENTS = [
  "hsl(var(--accent))",
  "hsl(var(--primary))",
  "hsl(25, 55%, 45%)",
  "hsl(155, 40%, 35%)",
  "hsl(350, 40%, 48%)",
  "hsl(200, 35%, 42%)",
];

export function ListView({ onSelectMember }: ListViewProps) {
  const members = useMemo(() => getAllMembers(), []);
  const [activeBranch, setActiveBranch] = useState("all");

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const roots = members.filter((m) => !m.father_id);
    return new Set(roots.map((r) => r.id));
  });

  const childrenMap = useMemo(() => {
    const map = new Map<string, FamilyMember[]>();
    members.forEach((m) => {
      if (m.father_id) {
        if (!map.has(m.father_id)) map.set(m.father_id, []);
        map.get(m.father_id)!.push(m);
      }
    });
    // Sort children in each group by birth
    map.forEach((children, key) => map.set(key, sortByBirth(children)));
    return map;
  }, [members]);

  const roots = useMemo(
    () => members.filter((m) => !m.father_id),
    [members]
  );

  const filteredRoots = useMemo(() => {
    if (activeBranch === "all") return roots;
    // Show only the selected pillar as root
    const pillar = members.find((m) => m.id === activeBranch);
    return pillar ? [pillar] : roots;
  }, [roots, members, activeBranch]);

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

        {/* Branch Tabs */}
        <Tabs value={activeBranch} onValueChange={setActiveBranch} className="mb-4">
          <TabsList className="w-full flex justify-center bg-muted/50 rounded-xl p-1 h-auto flex-wrap gap-1">
            <TabsTrigger value="all" className="rounded-lg text-xs px-3 py-2 font-bold">
              الكل
            </TabsTrigger>
            {PILLARS.map((p) => (
              <TabsTrigger key={p.id} value={p.id} className="rounded-lg text-xs px-3 py-2 font-bold">
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          {filteredRoots.map((root) => (
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
  const ageText = formatAge(member.birth_year, member.death_year);
  const motherName = extractMotherName(member);
  const phone = member.phone as string | undefined;
  const branch = getBranch(member.id);
  const branchStyle = branch ? getBranchStyle(branch.pillarId) : null;

  // Group children by mother for coloring
  const groupedChildren = useMemo(() => {
    if (!hasChildren) return [];
    const groups = new Map<string, { children: FamilyMember[]; colorIndex: number }>();
    let ci = 0;
    children.forEach((child) => {
      const mn = extractMotherName(child) || "__unknown__";
      if (!groups.has(mn)) {
        groups.set(mn, { children: [], colorIndex: mn !== "__unknown__" ? ci++ : -1 });
      }
      groups.get(mn)!.children.push(child);
    });
    return Array.from(groups.entries());
  }, [children, hasChildren]);

  // Get this member's mother color
  const motherColor = useMemo(() => {
    if (!motherName || !member.father_id) return null;
    const siblings = childrenMap.get(member.father_id) || [];
    const motherGroups = new Map<string, number>();
    let ci = 0;
    siblings.forEach((s) => {
      const mn = extractMotherName(s) || "__unknown__";
      if (mn !== "__unknown__" && !motherGroups.has(mn)) {
        motherGroups.set(mn, ci++);
      }
    });
    const idx = motherGroups.get(motherName);
    return idx !== undefined ? BRANCH_COLORS[idx % BRANCH_COLORS.length] : null;
  }, [motherName, member.father_id, childrenMap]);

  return (
    <div>
      <div
        className={`
          relative rounded-xl border transition-all duration-200 overflow-hidden
          ${isExpanded && hasChildren
            ? "bg-muted/30 border-border shadow-sm"
            : "bg-card border-border/50 hover:border-primary/30 hover:shadow-sm"
          }
        `}
      >
        <div
          className="absolute right-0 top-0 bottom-0 w-1 rounded-r-xl"
          style={{ backgroundColor: motherColor?.stroke || accentColor }}
        />

        <button
          onClick={() => hasChildren ? onToggle(member.id) : onSelect?.(member.id)}
          className="w-full flex items-center gap-3 px-4 pr-5 py-3.5 md:py-4 text-right transition-colors active:bg-muted/40"
          style={{ minHeight: 60 }}
        >
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

          <div className="flex-1 min-w-0">
            <span className="font-bold text-foreground text-sm md:text-base block leading-snug">
              {member.name}
            </span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {branch && branchStyle && (
                <span
                  className="text-[9px] mt-0.5 px-1.5 py-0.5 rounded-full font-bold"
                  style={{ color: branchStyle.text, backgroundColor: branchStyle.bg }}
                >
                  {branch.label}
                </span>
              )}
              {motherName && motherColor && (
                <span
                  className="text-[10px] mt-0.5 px-1.5 py-0.5 rounded-full font-medium"
                  style={{ color: motherColor.stroke, backgroundColor: `${motherColor.stroke}15` }}
                >
                  والدته: {motherName}
                </span>
              )}
              {(member.birth_year || member.death_year) && (
                <span className="text-xs text-muted-foreground mt-0.5 block">
                  {member.birth_year && `${member.birth_year} هـ`}
                  {member.birth_year && member.death_year && " — "}
                  {member.death_year && `${member.death_year} هـ`}
                </span>
              )}
              {ageText && (
                <span className="text-xs text-accent font-semibold mt-0.5">{ageText}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {phone && (
              <>
                <a
                  href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                  title="تواصل عبر واتساب"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={(e) => { e.stopPropagation(); downloadVCard(member.name, phone); }}
                  className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                  title="حفظ جهة اتصال"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            {hasChildren && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                <Users className="h-3 w-3" />
                {children.length}
              </div>
            )}
          </div>

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

      {isExpanded && hasChildren && (
        <div
          className="space-y-1.5 pt-1.5 pb-1 animate-accordion-down"
          style={{ paddingRight: `${Math.min(depth + 1, 3) * 0.75}rem` }}
        >
          {groupedChildren.map(([motherKey, group]) => (
            <div key={motherKey}>
              {motherKey !== "__unknown__" && group.colorIndex >= 0 && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1 mb-1"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: BRANCH_COLORS[group.colorIndex % BRANCH_COLORS.length].stroke }}
                  />
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: BRANCH_COLORS[group.colorIndex % BRANCH_COLORS.length].stroke }}
                  >
                    أبناء {motherKey}
                  </span>
                </div>
              )}
              {group.children.map((child) => (
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
          ))}
        </div>
      )}
    </div>
  );
}
