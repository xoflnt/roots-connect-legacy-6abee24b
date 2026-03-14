import React from "react";
import type { NodeProps } from "@xyflow/react";

function GenerationBandComponent({ data }: NodeProps) {
  const d = data as any;
  return (
    <div
      className="w-full h-full pointer-events-none"
      style={{
        background: d.isEven ? 'hsl(var(--muted) / 0.08)' : 'transparent',
        width: '100%',
        height: '100%',
      }}
    >
      <span
        className="absolute top-1/2 -translate-y-1/2 text-xs font-medium whitespace-nowrap"
        style={{
          right: `${50020}px`,
          color: 'hsl(var(--muted-foreground) / 0.3)',
        }}
      >
        الجيل {d.genLabel}
      </span>
    </div>
  );
}

export const GenerationBandNode = React.memo(GenerationBandComponent);
