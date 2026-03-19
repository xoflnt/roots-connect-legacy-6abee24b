import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toArabicNum } from "@/utils/arabicUtils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 py-4" dir="rtl">
      <Button
        variant="outline"
        size="icon"
        className="min-h-12 min-w-12"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
      <span className="text-base font-medium text-muted-foreground">
        صفحة {toArabicNum(page)} من {toArabicNum(totalPages)}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="min-h-12 min-w-12"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
    </div>
  );
}
