import { useFontSize } from "@/contexts/FontSizeContext";
import { Button } from "./ui/button";
import { AArrowUp } from "lucide-react";

const LABELS: Record<string, string> = {
  normal: "أ",
  large: "أأ",
  xlarge: "أأأ",
};

export function FontSizeToggle() {
  const { level, cycle } = useFontSize();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      className="h-10 w-10 min-w-[44px] min-h-[44px] rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted relative"
      title={`حجم الخط: ${LABELS[level]}`}
    >
      <AArrowUp className="h-5 w-5" />
      <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
        {LABELS[level]}
      </span>
    </Button>
  );
}
