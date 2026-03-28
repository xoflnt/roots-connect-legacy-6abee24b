import { useState, useCallback, useRef, useEffect } from "react";
import { Plus, Minus, Maximize2, ChevronDown } from "lucide-react";
import type { DemoMember } from "@/data/demoFamilyData";
import { getDemoChildren } from "@/services/demoService";

interface DemoFamilyTreeProps {
  members: DemoMember[];
  onSelectMember: (id: string) => void;
}

function toAr(n: number): string {
  return String(n).replace(/[0-9]/g, d => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
}

export function DemoFamilyTree({ members, onSelectMember }: DemoFamilyTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(["D100", "D200", "D300", "D400", "D500"]));
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = () => setExpandedIds(new Set(members.map(m => m.id)));
  const collapseAll = () => setExpandedIds(new Set(["D100"]));
  const resetView = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale(s => Math.max(0.3, Math.min(2, s - e.deltaY * 0.001)));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  }, [translate]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    setTranslate({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handlePointerUp = useCallback(() => setDragging(false), []);

  function renderNode(member: DemoMember, depth: number): React.ReactNode {
    const children = getDemoChildren(members, member.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(member.id);
    const isMale = member.gender === "M";

    return (
      <div key={member.id} className="flex flex-col items-center" style={{ minWidth: 120 }}>
        {/* Node card */}
        <div
          className={`
            relative rounded-xl border-2 px-3 py-2 text-center cursor-pointer
            transition-all hover:shadow-md hover:-translate-y-0.5
            ${isMale
              ? "border-[hsl(var(--male)/0.3)] bg-card"
              : "border-[hsl(var(--female)/0.3)] bg-card"
            }
          `}
          style={{ minWidth: 110, maxWidth: 150 }}
          onClick={() => onSelectMember(member.id)}
        >
          <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">{member.name.split(" ")[0]}</p>
          {member.birth_year && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{member.birth_year} هـ</p>
          )}
          {member.death_year && (
            <span className="text-[9px] text-muted-foreground">✦</span>
          )}
          {depth > 0 && (
            <span className="absolute -top-0.5 left-1 text-[8px] text-muted-foreground/50">
              ج{toAr(depth)}
            </span>
          )}
        </div>

        {/* Expand/collapse button */}
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); toggle(member.id); }}
            className={`
              mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
              ${isExpanded
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-card border-accent text-accent"
              }
            `}
          >
            {isExpanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          </button>
        )}

        {/* Children */}
        {hasChildren && isExpanded && (
          <>
            <div className="w-px h-4 bg-border" />
            <div className="flex gap-3 relative">
              {children.length > 1 && (
                <div className="absolute top-0 left-4 right-4 h-px bg-border" />
              )}
              {children.map(child => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-px h-4 bg-border" />
                  {renderNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  const root = members.find(m => m.id === "D100");
  if (!root) return null;

  return (
    <div className="w-full h-full bg-[hsl(var(--canvas-bg))] rounded-2xl border border-border/50 overflow-hidden relative" dir="rtl">
      {/* Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 bg-card/90 backdrop-blur-sm rounded-xl border border-border shadow-lg">
        <button onClick={() => setScale(s => Math.min(2, s + 0.2))} className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors" title="تكبير">
          <Plus className="h-4 w-4" />
        </button>
        <div className="h-px bg-border mx-1.5" />
        <button onClick={() => setScale(s => Math.max(0.3, s - 0.2))} className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors" title="تصغير">
          <Minus className="h-4 w-4" />
        </button>
        <div className="h-px bg-border mx-1.5" />
        <button onClick={resetView} className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors" title="ملائمة العرض">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Expand/collapse all */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5">
        <button onClick={expandAll} className="text-[11px] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted transition-colors font-medium">
          عرض الكل
        </button>
        <button onClick={collapseAll} className="text-[11px] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted transition-colors font-medium">
          طي الكل
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: "none" }}
      >
        <div
          className="inline-flex p-12 min-w-full min-h-full items-start justify-center"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "center top",
            transition: dragging ? "none" : "transform 0.2s ease",
          }}
        >
          {renderNode(root, 0)}
        </div>
      </div>
    </div>
  );
}
