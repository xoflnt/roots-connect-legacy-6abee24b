import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Maximize2 } from "lucide-react";
import type { DemoMember } from "@/data/demoFamilyData";
import { getDemoChildren, getDemoBranch } from "@/services/demoService";
import { springConfig } from "@/lib/animations";

interface DemoFamilyTreeProps {
  members: DemoMember[];
  onSelectMember: (id: string) => void;
}

const BRANCH_COLORS: Record<string, { stroke: string; bg: string }> = {
  D200: { stroke: "hsl(155, 40%, 35%)", bg: "hsl(155, 30%, 92%)" },
  D300: { stroke: "hsl(25, 55%, 45%)", bg: "hsl(25, 40%, 93%)" },
  D400: { stroke: "hsl(45, 55%, 42%)", bg: "hsl(45, 40%, 92%)" },
  D500: { stroke: "hsl(200, 35%, 42%)", bg: "hsl(200, 25%, 92%)" },
};

function toAr(n: number): string {
  return String(n).replace(/[0-9]/g, d => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
}

export function DemoFamilyTree({ members, onSelectMember }: DemoFamilyTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(["D100", "D200", "D300", "D400", "D500"]));
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
    const branchId = getDemoBranch(members, member.id);
    const branchColor = branchId ? BRANCH_COLORS[branchId] : null;

    return (
      <div key={member.id} className="flex flex-col items-center" style={{ minWidth: 120 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className={`
            relative rounded-xl border-2 px-3 py-2 text-center cursor-pointer
            transition-all hover:shadow-lg hover:-translate-y-0.5
            backdrop-blur-sm bg-card/95
            ${isMale ? "border-[hsl(var(--male)/0.3)]" : "border-[hsl(var(--female)/0.3)]"}
          `}
          style={{ minWidth: 110, maxWidth: 150 }}
          onClick={() => onSelectMember(member.id)}
        >
          {/* Branch color indicator */}
          {branchColor && (
            <div className="absolute right-0 top-2 bottom-2 w-1 rounded-full" style={{ backgroundColor: branchColor.stroke }} />
          )}
          <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">{member.name.split(" ")[0]}</p>
          {member.birth_year && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{member.birth_year} هـ</p>
          )}
          {member.death_year && <span className="text-[9px] text-muted-foreground">✦</span>}
          {depth > 0 && (
            <span className="absolute -top-0.5 left-1 text-[8px] text-muted-foreground/50">ج{toAr(depth)}</span>
          )}
        </motion.div>

        {hasChildren && (
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); toggle(member.id); }}
            className={`
              mt-1 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shadow-md
              ${isExpanded
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-card border-accent text-accent hover:bg-accent/10"
              }
            `}
            transition={springConfig}
          >
            {isExpanded ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </motion.button>
        )}

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="w-px h-4 bg-border mx-auto" style={branchColor ? { backgroundColor: branchColor.stroke + "60" } : undefined} />
              <div className="flex gap-3 relative">
                {children.length > 1 && (
                  <div className="absolute top-0 left-4 right-4 h-px" style={{ backgroundColor: branchColor ? branchColor.stroke + "40" : "hsl(var(--border))" }} />
                )}
                {children.map(child => (
                  <div key={child.id} className="flex flex-col items-center">
                    <div className="w-px h-4" style={{ backgroundColor: branchColor ? branchColor.stroke + "60" : "hsl(var(--border))" }} />
                    {renderNode(child, depth + 1)}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const root = members.find(m => m.id === "D100");
  if (!root) return null;

  return (
    <div className="w-full h-full bg-[hsl(var(--canvas-bg))] canvas-dots rounded-2xl border border-border/50 overflow-hidden relative" dir="rtl">
      {/* Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-col bg-card/90 backdrop-blur-md rounded-2xl border border-border shadow-xl">
        <button onClick={() => setScale(s => Math.min(2, s + 0.2))} className="w-10 h-10 flex items-center justify-center hover:bg-accent/15 hover:text-accent transition-colors"><Plus className="h-4 w-4" /></button>
        <div className="h-px bg-border mx-2" />
        <button onClick={() => setScale(s => Math.max(0.3, s - 0.2))} className="w-10 h-10 flex items-center justify-center hover:bg-accent/15 hover:text-accent transition-colors"><Minus className="h-4 w-4" /></button>
        <div className="h-px bg-border mx-2" />
        <button onClick={resetView} className="w-10 h-10 flex items-center justify-center hover:bg-accent/15 hover:text-accent transition-colors"><Maximize2 className="h-4 w-4" /></button>
      </div>

      <div className="absolute top-3 right-3 z-10 flex gap-1.5">
        <button onClick={expandAll} className="text-[11px] bg-card/90 backdrop-blur-sm border border-border rounded-xl px-2.5 py-1.5 hover:bg-muted transition-colors font-medium shadow-sm">عرض الكل</button>
        <button onClick={collapseAll} className="text-[11px] bg-card/90 backdrop-blur-sm border border-border rounded-xl px-2.5 py-1.5 hover:bg-muted transition-colors font-medium shadow-sm">طي الكل</button>
      </div>

      <div
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
