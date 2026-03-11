import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResetViewButtonProps {
  onReset: () => void;
}

export function ResetViewButton({ onReset }: ResetViewButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onReset}
      className="bg-card border-border text-foreground hover:bg-muted gap-2 shrink-0 min-h-[44px] min-w-[44px] px-2.5 md:px-4"
    >
      <Maximize2 className="h-4 w-4" />
      <span className="hidden md:inline">إعادة الضبط</span>
    </Button>
  );
}
