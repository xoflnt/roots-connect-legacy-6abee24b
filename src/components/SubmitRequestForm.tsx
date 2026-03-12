import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Send, Loader2, UserCheck } from "lucide-react";
import type { FamilyMember } from "@/data/familyData";
import { getAllMembers } from "@/services/familyService";
import { submitRequest, type RequestType } from "@/services/dataService";
import { getLineageLabel, getMemberSubtitle } from "@/utils/memberLabel";
import { toast } from "sonner";

interface SubmitRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetMember?: FamilyMember | null;
}

const REQUEST_TYPES: { value: RequestType; label: string }[] = [
  { value: "add_child", label: "إضافة ابن / بنت" },
  { value: "add_spouse", label: "إضافة زوج / زوجة" },
  { value: "update_info", label: "تحديث بيانات" },
  { value: "correction", label: "تصحيح معلومة" },
  { value: "other", label: "أخرى" },
];

export function SubmitRequestForm({ open, onOpenChange, targetMember }: SubmitRequestFormProps) {
  const [requestType, setRequestType] = useState<RequestType | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<FamilyMember | null>(targetMember || null);
  const [showSearch, setShowSearch] = useState(!targetMember);

  const [childName, setChildName] = useState("");
  const [childGender, setChildGender] = useState<"M" | "F">("M");
  const [motherName, setMotherName] = useState("");
  const [spouseName, setSpouseName] = useState("");
  const [updateField, setUpdateField] = useState("");
  const [updateValue, setUpdateValue] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return getAllMembers().filter((m) => m.name.includes(searchQuery.trim())).slice(0, 10);
  }, [searchQuery]);

  const handleSubmit = async () => {
    if (!selectedTarget || !requestType) return;
    setSubmitting(true);

    const data: Record<string, string> = {};
    if (requestType === "add_child") {
      data.childName = childName;
      data.gender = childGender;
    } else if (requestType === "add_spouse") {
      data.spouseName = spouseName;
    } else if (requestType === "update_info" || requestType === "correction") {
      data[updateField || "info"] = updateValue;
    }

    await submitRequest({
      type: requestType,
      targetMemberId: selectedTarget.id,
      data,
      notes: notes || undefined,
    });

    toast.success("تم إرسال الطلب بنجاح! سيتم مراجعته من الإدارة.");
    setSubmitting(false);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setRequestType("");
    setSearchQuery("");
    if (!targetMember) setSelectedTarget(null);
    setShowSearch(!targetMember);
    setChildName("");
    setChildGender("M");
    setSpouseName("");
    setUpdateField("");
    setUpdateValue("");
    setNotes("");
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن الشخص..."
                  className="pr-9 rounded-xl"
                />
              </div>
              {searchQuery.trim() && (
                <div className="border border-border/50 rounded-xl overflow-hidden max-h-[160px] overflow-y-auto bg-background">
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

          {/* Request Type */}
          {selectedTarget && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">نوع الطلب</label>
              <Select value={requestType} onValueChange={(v) => setRequestType(v as RequestType)}>
                <SelectTrigger className="rounded-xl min-h-[44px]">
                  <SelectValue placeholder="اختر نوع الطلب" />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Dynamic Fields */}
          {requestType === "add_child" && (
            <div className="space-y-3">
              <Input value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="اسم الابن / البنت" className="rounded-xl min-h-[44px]" />
              <Select value={childGender} onValueChange={(v) => setChildGender(v as "M" | "F")}>
                <SelectTrigger className="rounded-xl min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">ذكر</SelectItem>
                  <SelectItem value="F">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {requestType === "add_spouse" && (
            <Input value={spouseName} onChange={(e) => setSpouseName(e.target.value)} placeholder="اسم الزوج / الزوجة" className="rounded-xl min-h-[44px]" />
          )}

          {(requestType === "update_info" || requestType === "correction") && (
            <div className="space-y-3">
              <Select value={updateField} onValueChange={setUpdateField}>
                <SelectTrigger className="rounded-xl min-h-[44px]">
                  <SelectValue placeholder="الحقل المراد تعديله" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birth_year">سنة الميلاد</SelectItem>
                  <SelectItem value="death_year">سنة الوفاة</SelectItem>
                  <SelectItem value="name">الاسم</SelectItem>
                  <SelectItem value="notes">ملاحظات</SelectItem>
                </SelectContent>
              </Select>
              <Input value={updateValue} onChange={(e) => setUpdateValue(e.target.value)} placeholder="القيمة الجديدة" className="rounded-xl min-h-[44px]" />
            </div>
          )}

          {/* Notes */}
          {requestType && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">ملاحظات إضافية (اختياري)</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي تفاصيل إضافية..." className="rounded-xl min-h-[80px] resize-none" />
            </div>
          )}

          {/* Submit */}
          {requestType && selectedTarget && (
            <Button onClick={handleSubmit} disabled={submitting} className="w-full min-h-[48px] rounded-xl font-bold text-base">
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "إرسال الطلب"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
