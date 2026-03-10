import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Heart } from "lucide-react";
import { BRANCH_COLORS } from "@/hooks/useTreeLayout";

export function SpouseCard({ data }: NodeProps) {
  const name = (data as any).name as string;
  const colorIndex = (data as any).colorIndex as number;
  const color = BRANCH_COLORS[colorIndex % BRANCH_COLORS.length];

  return (
    <div
      className="w-[160px] h-[50px] flex items-center justify-center gap-1.5 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
      style={{
        fontFamily: "'Tajawal', sans-serif",
        borderColor: color.stroke,
        background: `linear-gradient(to bottom, hsl(var(--card)), ${color.bg})`,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground/50 !w-2 !h-2 !border-none" />

      <Heart className="h-3 w-3 shrink-0" style={{ color: color.stroke }} fill={color.stroke} />
      <span className="text-sm font-semibold text-foreground truncate">{name}</span>

      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground/50 !w-2 !h-2 !border-none" />
    </div>
  );
}
