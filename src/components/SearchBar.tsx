import { useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchMembers } from "@/services/familyService";
import { useIsMobile } from "@/hooks/use-mobile";
import { getLineageLabel, getMemberSubtitle } from "@/utils/memberLabel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SearchBarProps {
  onSelect: (memberId: string) => void;
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const filtered = searchMembers(query);

  const handleSelect = (id: string, name: string) => {
    onSelect(id);
    setQuery(name);
    setOpen(false);
    setDialogOpen(false);
  };

  // Mobile: icon button + full-screen dialog
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDialogOpen(true)}
          className="h-11 w-11 min-w-[44px] min-h-[44px] rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
          title="بحث"
        >
          <Search className="h-5 w-5" />
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="top-0 translate-y-0 max-w-full w-full h-full sm:rounded-none p-0 gap-0 border-0" dir="rtl">
            <DialogTitle className="sr-only">بحث</DialogTitle>
            <DialogDescription className="sr-only">ابحث عن فرد من العائلة</DialogDescription>
            <div className="flex items-center gap-2 p-3 border-b border-border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDialogOpen(false)}
                className="h-11 w-11 min-w-[44px] min-h-[44px] shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="ابحث عن اسمك..."
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pr-10 h-12 text-base bg-muted/40 border-border rounded-xl placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.length > 0 ? (
                 filtered.map((m) => {
                   const subtitle = getMemberSubtitle(m);
                   return (
                   <button
                     key={m.id}
                     className="w-full text-right px-5 py-3 text-foreground hover:bg-muted transition-colors border-b border-border/30 last:border-b-0"
                     style={{ minHeight: 52 }}
                     onClick={() => handleSelect(m.id, m.name)}
                   >
                     <span className="font-bold block">{getLineageLabel(m)}</span>
                     {subtitle && (
                       <span className="text-xs text-muted-foreground">{subtitle}</span>
                     )}
                   </button>
                   );
                 })
              ) : query.trim() ? (
                <div className="p-8 text-center text-muted-foreground">لا توجد نتائج</div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">اكتب اسمًا للبحث</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop: inline input
  return (
    <div ref={ref} className="relative flex-1 max-w-sm">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="بحث بالاسم..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          className="pr-10 bg-card text-foreground placeholder:text-muted-foreground border-border"
          style={{ minHeight: 44 }}
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {filtered.map((m) => {
            const subtitle = getMemberSubtitle(m);
            return (
            <button
              key={m.id}
              className="w-full text-right px-4 py-2.5 text-foreground hover:bg-muted transition-colors border-b border-border/20 last:border-b-0"
              style={{ minHeight: 44 }}
              onMouseDown={() => handleSelect(m.id, m.name)}
            >
              <span className="font-medium block text-sm">{getLineageLabel(m)}</span>
              {subtitle && (
                <span className="text-xs text-muted-foreground">{subtitle}</span>
              )}
            </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
