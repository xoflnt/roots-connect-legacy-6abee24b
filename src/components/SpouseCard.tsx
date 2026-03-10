import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Heart } from "lucide-react";

export function SpouseCard({ data }: NodeProps) {
  const name = (data as any).name as string;

  return (
    <div
      className="w-[160px] h-[50px] flex items-center justify-center gap-1.5 rounded-xl border border-[hsl(var(--female)/0.3)] bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--female-light))] shadow-sm"
      style={{ fontFamily: "'Tajawal', sans-serif" }}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground/50 !w-2 !h-2 !border-none" />

      <Heart className="h-3 w-3 text-[hsl(var(--female))] shrink-0" fill="hsl(var(--female))" />
      <span className="text-sm font-semibold text-foreground truncate">{name}</span>

      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground/50 !w-2 !h-2 !border-none" />
    </div>
  );
}
