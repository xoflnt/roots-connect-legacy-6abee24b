import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  type ReactFlowInstance,
  type Node,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { refreshMembers, getAllMembers, isDeceased as checkDeceased } from "@/services/familyService";
import { Plus, Minus, Maximize2, RotateCcw, LocateFixed, Eye, EyeOff, Layers, Filter } from "lucide-react";
import { useTreeLayout, getDefaultExpandedIds, type TreeFilters } from "@/hooks/useTreeLayout";
import { FamilyCard } from "./FamilyCard";
import { GenerationBandNode } from "./GenerationBandNode";
import { PersonDetails } from "./PersonDetails";
import type { FamilyMember } from "@/data/familyData";
import { getBranch, PILLARS, getPillars } from "@/utils/branchUtils";
import { getChildrenOf } from "@/services/familyService";
import { useAuth } from "@/contexts/AuthContext";
import { springConfig, gentleSpring } from "@/lib/animations";

const nodeTypes = { familyCard: FamilyCard, generationBand: GenerationBandNode };

export interface FamilyTreeRef {
  search: (memberId: string) => void;
  reset: () => void;
  expandAll: () => void;
  getRfInstance: () => any;
}

interface FamilyTreeProps {
  focusBranch?: string;
}

export const FamilyTree = forwardRef<FamilyTreeRef, FamilyTreeProps>(function FamilyTree({ focusBranch }, ref) {
  const { currentUser } = useAuth();
  const myMemberId = currentUser?.memberId || "100";

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (focusBranch) {
      return getBranchExpandedIds(focusBranch);
    }
    return getDefaultExpandedIds();
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showExpandMenu, setShowExpandMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filters, setFilters] = useState<TreeFilters>({ branch: 'all', gender: 'all', living: 'all' });

  const activeFilterCount = [
    filters.branch !== 'all',
    filters.gender !== 'all',
    filters.living !== 'all',
  ].filter(Boolean).length;

  const isLoggedIn = !!currentUser;
  const { nodes: layoutNodes, edges: layoutEdges, totalCount, filteredCount } = useTreeLayout(expandedIds, refreshKey, filters, isLoggedIn);

  // Compute generation band nodes
  const allNodes = useMemo(() => {
    if (!layoutNodes.length) return layoutNodes;

    const genMap = new Map<number, { yMin: number; yMax: number; gen: number }>();
    layoutNodes.forEach(node => {
      const gen = (node.data as any)?.generation as number;
      const y = node.position.y;
      if (!gen && gen !== 0) return;

      if (!genMap.has(gen)) {
        genMap.set(gen, { yMin: y - 10, yMax: y + 110, gen });
      } else {
        const entry = genMap.get(gen)!;
        entry.yMin = Math.min(entry.yMin, y - 10);
        entry.yMax = Math.max(entry.yMax, y + 110);
      }
    });

    const bands: Node[] = Array.from(genMap.values())
      .sort((a, b) => a.gen - b.gen)
      .map((band) => ({
        id: `gen-band-${band.gen}`,
        type: 'generationBand',
        position: { x: -50000, y: band.yMin },
        data: {
          isEven: band.gen % 2 === 0,
          genLabel: band.gen.toLocaleString("ar-SA"),
        },
        selectable: false,
        draggable: false,
        style: { width: 99999, height: band.yMax - band.yMin, zIndex: -1 },
      }));

    return [...bands, ...layoutNodes];
  }, [layoutNodes]);

  // Listen for data updates
  useEffect(() => {
    const handler = async () => {
      await refreshMembers();
      setRefreshKey((k) => k + 1);
    };
    window.addEventListener("family-data-updated", handler);
    return () => window.removeEventListener("family-data-updated", handler);
  }, []);

  // Recompute layout on resize (orientation change, etc.)
  useEffect(() => {
    const handleResize = () => setRefreshKey((k) => k + 1);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // React to focusBranch changes
  useEffect(() => {
    if (focusBranch) {
      setExpandedIds(getBranchExpandedIds(focusBranch));
      setTimeout(() => {
        rfInstance.current?.fitView({ nodes: [{ id: focusBranch }], duration: 600, padding: 0.3 });
      }, 300);
    }
  }, [focusBranch]);

  const [nodes, setNodes, onNodesChange] = useNodesState(allNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  // Sync layout — NO auto fitView
  useEffect(() => {
    setNodes(allNodes);
    setEdges(layoutEdges);
  }, [allNodes, layoutEdges, setNodes, setEdges]);

  const handleToggleExpand = useCallback((memberId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'generationBand') return;
    const data = node.data as any;
    if (data.gender) setSelectedMember(data as unknown as FamilyMember);
  }, []);

  const onPaneClick = useCallback(() => setSelectedMember(null), []);

  const handleSearch = useCallback(
    (memberId: string) => {
      if (!rfInstance.current) return;
      const allMembers = getAllMembers();
      const memberMap = new Map<string, FamilyMember>(allMembers.map((m) => [m.id, m]));
      const ancestorIds = new Set<string>();
      let current = memberMap.get(memberId);
      while (current?.father_id) {
        ancestorIds.add(current.father_id);
        current = memberMap.get(current.father_id);
      }
      setExpandedIds((prev) => {
        const next = new Set(prev);
        ancestorIds.forEach((id) => next.add(id));
        return next;
      });
      setTimeout(() => {
        rfInstance.current?.fitView({ nodes: [{ id: memberId }], duration: 600, padding: 0.5 });
        setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === memberId })));
        const member = memberMap.get(memberId);
        if (member) setSelectedMember(member);
      }, 300);
    },
    [setNodes]
  );

  const handleReset = useCallback(() => {
    setExpandedIds(getDefaultExpandedIds());
    setSelectedMember(null);
    setFilters({ branch: 'all', gender: 'all', living: 'all' });
    setTimeout(() => rfInstance.current?.fitView({ duration: 500, padding: 0.2 }), 100);
  }, []);

  const handleLocateMe = useCallback(() => {
    if (!rfInstance.current) return;
    const allMembers = getAllMembers();
    const memberMap = new Map<string, FamilyMember>(allMembers.map((m) => [m.id, m]));
    const ancestorIds = new Set<string>();
    let current = memberMap.get(myMemberId);
    while (current?.father_id) {
      ancestorIds.add(current.father_id);
      current = memberMap.get(current.father_id);
    }
    setExpandedIds((prev) => {
      const next = new Set(prev);
      ancestorIds.forEach((id) => next.add(id));
      return next;
    });
    setTimeout(() => {
      rfInstance.current?.fitView({ nodes: [{ id: myMemberId }], duration: 600, padding: 0.5 });
    }, 300);
  }, [myMemberId]);

  const expandLevels = useCallback((n: number) => {
    if (n === 999) {
      const confirmed = window.confirm(
        'سيتم عرض جميع الأفراد. قد يبطؤ الجهاز. هل تريد المتابعة؟'
      );
      if (!confirmed) return;
      const allIds = new Set(getAllMembers().map((m) => m.id));
      setExpandedIds(allIds);
    } else {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        let frontier = new Set(prev);
        for (let i = 0; i < n; i++) {
          const newFrontier = new Set<string>();
          for (const id of frontier) {
            const children = getChildrenOf(id);
            children.forEach((c) => {
              next.add(id);
              newFrontier.add(c.id);
            });
          }
          frontier = newFrontier;
        }
        return next;
      });
    }
    setTimeout(() => {
      rfInstance.current?.fitView({ duration: 600, padding: 0.15 });
    }, 400);
  }, []);

  const expandAll = useCallback(() => {
    const allIds = new Set(getAllMembers().map(m => m.id));
    setExpandedIds(allIds);
  }, []);

  useImperativeHandle(ref, () => ({
    search: handleSearch,
    reset: handleReset,
    expandAll,
    getRfInstance: () => rfInstance.current,
  }), [handleSearch, handleReset, expandAll]);

  useEffect(() => {
    (window as any).__toggleExpandNode = handleToggleExpand;
    return () => { delete (window as any).__toggleExpandNode; };
  }, [handleToggleExpand]);

  const filtersActive = activeFilterCount > 0;

  return (
    <div className="relative w-full h-full canvas-dots">
      {/* Filter banner */}
      {filtersActive && (
        <div className="absolute top-0 left-0 right-0 z-10 text-xs text-center py-1 bg-muted/50 text-muted-foreground">
          يتم عرض {filteredCount.toLocaleString("ar-SA")} من أصل {totalCount.toLocaleString("ar-SA")} فرد
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        onInit={(instance) => { rfInstance.current = instance; }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        minZoom={0.15}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        {showMiniMap && (
          <MiniMap
            nodeStrokeWidth={3}
            pannable
            zoomable
            className="!bg-card/80 !border-border !rounded-xl !shadow-lg !backdrop-blur-sm"
            maskColor="hsl(var(--muted) / 0.5)"
            nodeColor={(node) => {
              if (node.type === 'generationBand') return 'transparent';
              const data = node.data as any;
              if (node.type === 'spouseCard') return 'hsl(var(--accent))';
              return data?.gender === 'M' ? 'hsl(var(--male))' : 'hsl(var(--female))';
            }}
            style={{ width: 160, height: 100 }}
          />
        )}
      </ReactFlow>

      {/* Zoom + utility controls */}
      <div className="absolute bottom-5 left-5 flex flex-col bg-card/90 backdrop-blur-md rounded-2xl border border-border shadow-xl overflow-visible z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => rfInstance.current?.zoomIn({ duration: 200 })}
          className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-accent/15 hover:text-accent transition-colors"
          title="تكبير"
        >
          <Plus className="h-4 w-4" />
        </motion.button>
        <div className="h-px bg-border mx-2" />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => rfInstance.current?.zoomOut({ duration: 200 })}
          className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-accent/15 hover:text-accent transition-colors"
          title="تصغير"
        >
          <Minus className="h-4 w-4" />
        </motion.button>
        <div className="h-px bg-border mx-2" />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => rfInstance.current?.fitView({ duration: 400, padding: 0.2 })}
          className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-accent/15 hover:text-accent transition-colors"
          title="ملائمة العرض"
        >
          <Maximize2 className="h-4 w-4" />
        </motion.button>
        <div className="h-px bg-border mx-2" />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLocateMe}
          className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-accent/15 hover:text-accent transition-colors"
          title="أين أنا؟"
        >
          <LocateFixed className="h-4 w-4" />
        </motion.button>
        <div className="h-px bg-border mx-2" />

        {/* Multi-level expand */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowExpandMenu((v) => !v)}
            className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-accent/15 hover:text-accent transition-colors"
            title="توسيع الشجرة"
          >
            <Layers className="h-4 w-4" />
          </motion.button>
          <AnimatePresence>
            {showExpandMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowExpandMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={gentleSpring}
                  className="absolute bottom-0 left-full ml-2 bg-card border border-border rounded-xl shadow-xl z-30 min-w-[160px] py-1"
                  dir="rtl"
                >
                  <button
                    onClick={() => { expandLevels(1); setShowExpandMenu(false); }}
                    className="w-full text-right px-3 py-2 text-sm text-foreground hover:bg-accent/15 transition-colors"
                  >
                    توسيع جيل واحد
                  </button>
                  <button
                    onClick={() => { expandLevels(2); setShowExpandMenu(false); }}
                    className="w-full text-right px-3 py-2 text-sm text-foreground hover:bg-accent/15 transition-colors"
                  >
                    توسيع جيلين
                  </button>
                  <button
                    onClick={() => { expandLevels(3); setShowExpandMenu(false); }}
                    className="w-full text-right px-3 py-2 text-sm text-foreground hover:bg-accent/15 transition-colors"
                  >
                    توسيع ٣ أجيال
                  </button>
                  <div className="h-px bg-border mx-2 my-1" />
                  <button
                    onClick={() => { expandLevels(999); setShowExpandMenu(false); }}
                    className="w-full text-right px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    توسيع الكل ⚠️
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="h-px bg-border mx-2" />

        {/* Filter button */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFilterMenu((v) => !v)}
            className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-accent/15 hover:text-accent transition-colors relative"
            title="تصفية"
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </motion.button>
          <AnimatePresence>
            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowFilterMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={gentleSpring}
                  className="absolute bottom-0 left-full ml-2 bg-card border border-border rounded-2xl shadow-xl z-30 w-64 p-4"
                  dir="rtl"
                >
                  {/* Branch filter */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-foreground mb-1.5">الفرع:</p>
                    <div className="flex flex-wrap gap-1.5">
                      <FilterPill active={filters.branch === 'all'} onClick={() => setFilters(f => ({ ...f, branch: 'all' }))}>الكل</FilterPill>
                      {getPillars().map(p => (
                        <FilterPill
                          key={p.id}
                          active={filters.branch === p.id}
                          onClick={() => setFilters(f => ({ ...f, branch: p.id }))}
                          style={filters.branch === p.id ? {
                            backgroundColor: p.id === '200' ? 'hsl(45 70% 92%)' : p.id === '300' ? 'hsl(155 40% 90%)' : 'hsl(25 50% 90%)',
                            color: p.id === '200' ? 'hsl(45 60% 35%)' : p.id === '300' ? 'hsl(155 45% 30%)' : 'hsl(25 55% 35%)',
                            borderColor: 'transparent',
                          } : undefined}
                        >
                          {p.label}
                        </FilterPill>
                      ))}
                    </div>
                  </div>

                  {/* Gender filter */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-foreground mb-1.5">الجنس:</p>
                    <div className="flex flex-wrap gap-1.5">
                      <FilterPill active={filters.gender === 'all'} onClick={() => setFilters(f => ({ ...f, gender: 'all' }))}>الكل</FilterPill>
                      <FilterPill active={filters.gender === 'M'} onClick={() => setFilters(f => ({ ...f, gender: 'M' }))}>ذكور 🔵</FilterPill>
                      <FilterPill active={filters.gender === 'F'} onClick={() => setFilters(f => ({ ...f, gender: 'F' }))}>إناث 🩷</FilterPill>
                    </div>
                  </div>

                  {/* Living filter */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-foreground mb-1.5">الحالة:</p>
                    <div className="flex flex-wrap gap-1.5">
                      <FilterPill active={filters.living === 'all'} onClick={() => setFilters(f => ({ ...f, living: 'all' }))}>الكل</FilterPill>
                      <FilterPill active={filters.living === 'living'} onClick={() => setFilters(f => ({ ...f, living: 'living' }))}>أحياء</FilterPill>
                      <FilterPill active={filters.living === 'deceased'} onClick={() => setFilters(f => ({ ...f, living: 'deceased' }))}>متوفون</FilterPill>
                    </div>
                  </div>

                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => setFilters({ branch: 'all', gender: 'all', living: 'all' })}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      إعادة تعيين
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="h-px bg-border mx-2" />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowMiniMap((v) => !v)}
          className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-accent/15 hover:text-accent transition-colors"
          title={showMiniMap ? "إخفاء الخريطة المصغرة" : "إظهار الخريطة المصغرة"}
        >
          {showMiniMap ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </motion.button>
        <div className="h-px bg-border mx-2" />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setExpandedIds(getDefaultExpandedIds());
            setSelectedMember(null);
            setFilters({ branch: 'all', gender: 'all', living: 'all' });
            setTimeout(() => rfInstance.current?.fitView({ duration: 500, padding: 0.2 }), 100);
          }}
          className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-accent/15 hover:text-accent transition-colors"
          title="إعادة الضبط"
        >
          <RotateCcw className="h-4 w-4" />
        </motion.button>
      </div>

      <PersonDetails
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
});

function FilterPill({ active, onClick, children, style }: { active: boolean; onClick: () => void; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors font-medium ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-transparent text-muted-foreground border-border hover:bg-accent/10'
      }`}
      style={active ? style : undefined}
    >
      {children}
    </button>
  );
}

function getBranchExpandedIds(pillarId: string): Set<string> {
  const ids = new Set<string>();
  const allMembers = getAllMembers();
  const memberMap = new Map(allMembers.map((m) => [m.id, m]));
  let current = memberMap.get(pillarId);
  while (current) {
    ids.add(current.id);
    if (current.father_id) {
      current = memberMap.get(current.father_id);
    } else {
      break;
    }
  }
  const children = getChildrenOf(pillarId);
  children.forEach((c) => ids.add(c.id));
  return ids;
}
