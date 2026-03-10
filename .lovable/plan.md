

# Simplify FamilyCard & Fix Layout

## 1. `src/components/FamilyCard.tsx`
- Remove spouses rendering (lines 34-38)
- Replace outer div classes with fixed size: `w-[220px] h-[90px] overflow-hidden flex flex-col justify-center items-center text-center rounded-xl border-2 shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg`
- Remove inline `minHeight` style, keep font-family
- Keep name + life years only

## 2. `src/hooks/useTreeLayout.ts`
- `NODE_WIDTH = 220`, `NODE_HEIGHT = 90`
- `nodesep: 100`, `ranksep: 180`

