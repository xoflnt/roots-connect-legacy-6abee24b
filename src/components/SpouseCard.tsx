import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Heart } from "lucide-react";
import { BRANCH_COLORS } from "@/hooks/useTreeLayout";

export function SpouseCard({ data }: NodeProps) {
  const name = (data as any).name as string;
  const colorIndex = (data as any).colorIndex as number;
  const color = BRANCH_COLORS[colorIndex % BRANCH_COLORS.length];

  return (
    <div
      className="relative w-[160px] min-h-[48px] flex items-center justify-center gap-1.5 rounded-xl border backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md px-3 py-2"
      style={{
        fontFamily: "'Tajawal', sans-serif",
        borderColor: `${color.stroke}40`,
        background: `linear-gradient(135deg, hsl(var(--card) / 0.9), ${color.bg})`,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground/30 !w-2 !h-2 !border-none" />

      <Heart
        className="h-3 w-3 shrink-0 opacity-60"
        style={{ color: color.stroke }}
        fill={color.stroke}
      />
      <span
        className="text-xs font-semibold text-foreground/80 leading-snug text-center line-clamp-2"
        dir="rtl"
      >
        {name}
      </span>

      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground/30 !w-2 !h-2 !border-none" />
    </div>
  );
}
