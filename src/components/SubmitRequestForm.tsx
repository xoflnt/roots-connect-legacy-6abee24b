import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Send, Loader2, UserCheck } from "lucide-react";
import type { FamilyMember } from "@/data/familyData";
import { searchMembers } from "@/services/familyService";
import { submitRequest } from "@/services/dataService";
import { getLineageLabel, getMemberSubtitle } from "@/utils/memberLabel";
import { toast } from "sonner";
import { useKeyboardSafeDropdown } from "@/hooks/useKeyboardSafeDropdown";

interface SubmitRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetMember?: FamilyMember | null;
}

export function SubmitRequestForm({ open, onOpenChange, targetMember }: SubmitRequestFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<FamilyMember | null>(targetMember || null);
  const [showSearch, setShowSearch] = useState(!targetMember);
  const [textContent, setTextContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const kbd = useKeyboardSafeDropdown();

  const filtered = useMemo(() => {
    return searchMembers(searchQuery, 10);
  }, [searchQuery]);

  const handleSubmit = async () => {
    if (!selectedTarget || !textContent.trim()) return;
    setSubmitting(true);

    await submitRequest({
      type: "other",
      targetMemberId: selectedTarget.id,
      data: { text_content: textContent.trim() },
      submittedBy: selectedTarget.name,
    });

    toast.success("تم إرسال الطلب بنجاح! سيتم مراجعته من الإدارة.");
    setSubmitting(false);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setSearchQuery("");
    if (!targetMember) setSelectedTarget(null);
    setShowSearch(!targetMember);
    setTextContent("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] rounded-2xl border-border/50 bg-card" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground text-center">
            <Send className="inline h-5 w-5 ml-1 text-primary" />
            إرسال طلب تعديل
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Target Member Selection */}
          {showSearch && !selectedTarget ? (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">الشخص المعني</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  ref={kbd.inputRef}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); kbd.recalc(); }}
                  onFocus={kbd.recalc}
                  placeholder="ابحث عن الشخص..."
                  className="pr-9 rounded-xl"
                />
              </div>
              {searchQuery.trim() && (
                <div ref={kbd.dropdownRef} className="border border-border/50 rounded-xl overflow-hidden overflow-y-auto bg-background" style={{ maxHeight: kbd.maxHeight ?? 160 }}>
                  {filtered.length === 0 ? (
                    <p className="p-3 text-center text-sm text-muted-foreground">لم يتم العثور على نتائج</p>
                  ) : (
                    filtered.map((m) => {
                      const subtitle = getMemberSubtitle(m);
                      return (
                        <button
                          key={m.id}
                          onClick={() => { setSelectedTarget(m); setSearchQuery(""); }}
                          className="w-full text-right px-3 py-2.5 flex items-center gap-2 hover:bg-muted/60 transition-colors border-b border-border/20 last:border-0"
                        >
                          <UserCheck className="h-4 w-4 text-primary shrink-0" />
                          <div className="text-right">
                            <span className="text-sm font-medium block">{getLineageLabel(m)}</span>
                            {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ) : selectedTarget ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">{getLineageLabel(selectedTarget)}</span>
              </div>
              {!targetMember && (
                <Button variant="ghost" size="sm" onClick={() => { setSelectedTarget(null); setShowSearch(true); }} className="text-xs h-7 px-2">
                  تغيير
                </Button>
              )}
            </div>
          ) : null}

          {/* Free-text content */}
          {selectedTarget && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">تفاصيل التعديل أو الإضافة</label>
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="مثال: رزقت بمولود جديد اسمه فهد، أو أود تعديل تاريخ ميلادي إلى..."
                className="rounded-xl min-h-[120px] resize-none text-sm leading-relaxed"
              />
            </div>
          )}

          {/* Submit */}
          {selectedTarget && (
            <Button
              onClick={handleSubmit}
              disabled={submitting || !textContent.trim()}
              className="w-full min-h-[48px] rounded-xl font-bold text-base"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "إرسال الطلب"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
