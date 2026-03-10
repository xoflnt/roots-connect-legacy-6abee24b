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
      className="bg-card border-border text-foreground hover:bg-muted gap-2 shrink-0"
      style={{ minHeight: 44 }}
    >
      <Maximize2 className="h-4 w-4" />
      <span>إعادة الضبط</span>
    </Button>
  );
}
