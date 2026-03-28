import { GitBranch } from "lucide-react";

interface BranchInfo {
  id: string;
  name: string;
  count: number;
}

const BRANCH_COLORS = [
  { bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },
  { bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400" },
  { bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
  { bg: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-400" },
];

function toAr(n: number): string {
  return n.toLocaleString("ar-SA");
}

interface DemoBranchesProps {
  familyName: string;
  branches: BranchInfo[];
}

export function DemoBranches({ familyName, branches }: DemoBranchesProps) {
  return (
    <section className="py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-extrabold text-foreground text-center mb-6">
          فروع عائلة {familyName}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {branches.map((branch, i) => {
            const color = BRANCH_COLORS[i % BRANCH_COLORS.length];
            return (
              <div
                key={branch.id}
                className={`${color.bg} border ${color.border} rounded-2xl p-4 text-center space-y-2 hover:-translate-y-0.5 transition-transform`}
              >
                <GitBranch className={`h-6 w-6 mx-auto ${color.text}`} />
                <h3 className={`text-base font-bold ${color.text}`}>
                  فرع {branch.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {toAr(branch.count)} فرد
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
