import { Crown, GitBranch, Star, Layers, ScrollText } from "lucide-react";
import { Badge } from "./ui/badge";

interface HeritageBadgeProps {
  type: "founder" | "branchHead" | "deceased" | "generation" | "documenter";
  generationNum?: number;
  gender?: "M" | "F";
}

const CONFIG = {
  founder: {
    label: "المؤسس",
    icon: Crown,
    className: "bg-accent/20 text-accent border-accent/30",
  },
  branchHead: {
    label: "أب فرع",
    icon: GitBranch,
    className: "bg-primary/15 text-primary border-primary/30",
  },
  deceased: {
    label: "رحمه الله",
    icon: Star,
    className: "bg-muted text-muted-foreground border-border/50",
  },
  generation: {
    label: "الجيل",
    icon: Layers,
    className: "bg-secondary text-secondary-foreground border-border/50",
  },
  documenter: {
    label: "موثق الشجرة",
    icon: ScrollText,
    className: "bg-documenter text-documenter-foreground border-documenter-border/40",
  },
};

function toArabicNum(n: number): string {
  return n.toLocaleString("ar-SA");
}

export function HeritageBadge({ type, generationNum, gender }: HeritageBadgeProps) {
  const config = CONFIG[type];
  const Icon = config.icon;
  let label = config.label;
  if (type === "generation" && generationNum) {
    label = `الجيل ${toArabicNum(generationNum)}`;
  } else if (type === "deceased" && gender === "F") {
    label = "رحمها الله";
  }

  return (
    <Badge
      variant="outline"
      className={`font-scale-exempt gap-1 text-[10px] px-2 py-0.5 font-bold ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
