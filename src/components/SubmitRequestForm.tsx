import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Send, Loader2, UserCheck, Baby, Heart, MessageSquare, CheckCircle2, ArrowRight } from "lucide-react";
import type { FamilyMember } from "@/data/familyData";
import { searchMembers } from "@/services/familyService";
import { submitRequest } from "@/services/dataService";
import { getLineageLabel, getMemberSubtitle } from "@/utils/memberLabel";
import { toast } from "sonner";

type RequestType = "add_child" | "add_spouse" | "other";

interface SubmitRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetMember?: FamilyMember | null;
}

const typeOptions: { type: RequestType; icon: typeof Baby; label: string; desc: string }[] = [
  { type: "add_child", icon: Baby, label: "إضافة مولود جديد", desc: "إضافة ابن أو ابنة جديد للشجرة" },
  { type: "add_spouse", icon: Heart, label: "إضافة زواج", desc: "تسجيل زوجة أو زوج جديد" },
  { type: "other", icon: MessageSquare, label: "ملاحظة أخرى", desc: "أي تعديل أو ملاحظة أخرى" },
];

const typeLabels: Record<RequestType, string> = {
  add_child: "إضافة مولود",
  add_spouse: "إضافة زواج",
  other: "ملاحظة",
};

export function SubmitRequestForm({ open, onOpenChange, targetMember }: SubmitRequestFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [requestType, setRequestType] = useState<RequestType | null>(null);

  // Fields
  const [childName, setChildName] = useState("");
  const [childGender, setChildGender] = useState<"M" | "F">("M");
  const [selectedMother, setSelectedMother] = useState("");
  const [spouseName, setSpouseName] = useState("");
  const [textContent, setTextContent] = useState("");
  const [notes, setNotes] = useState("");

  // Target member
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<FamilyMember | null>(targetMember || null);
  const [showSearch, setShowSearch] = useState(!targetMember);

  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => searchMembers(searchQuery, 10), [searchQuery]);

  const resetForm = () => {
    setStep(1);
    setRequestType(null);
    setChildName("");
    setChildGender("M");
    setSpouseName("");
    setTextContent("");
    setNotes("");
    setSearchQuery("");
    if (!targetMember) setSelectedTarget(null);
    setShowSearch(!targetMember);
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) resetForm();
    onOpenChange(val);
  };

  const getSummary = (): string => {
    if (requestType === "add_child") return `${childGender === "F" ? "ابنة" : "ابن"} باسم ${childName}`;
    if (requestType === "add_spouse") return `زوجة باسم ${spouseName}`;
    return textContent.slice(0, 80);
  };

  const canSubmit = (): boolean => {
    if (!selectedTarget) return false;
    if (requestType === "add_child") return childName.trim().length > 0;
    if (requestType === "add_spouse") return spouseName.trim().length > 0;
    if (requestType === "other") return textContent.trim().length > 0;
    return false;
  };

  const handleSubmit = async () => {
    if (!selectedTarget || !requestType || !canSubmit()) return;
    setSubmitting(true);

    const data: Record<string, string> = {};
    if (requestType === "add_child") {
      data.child_name = childName.trim();
      data.child_gender = childGender;
    } else if (requestType === "add_spouse") {
      data.spouse_name = spouseName.trim();
    } else {
      data.text_content = textContent.trim();
    }

    try {
      await submitRequest({
        type: requestType as any,
        targetMemberId: selectedTarget.id,
        data,
        notes: notes.trim() || undefined,
        submittedBy: selectedTarget.name,
      });

      // Save to localStorage for user tracking
      const pending = JSON.parse(localStorage.getItem("my_requests") || "[]");
      pending.unshift({
        id: Date.now(),
        type: requestType,
        memberName: selectedTarget.name,
        summary: getSummary(),
        submittedAt: new Date().toISOString(),
        status: "pending",
      });
      localStorage.setItem("my_requests", JSON.stringify(pending.slice(0, 20)));

      setStep(3);
    } catch {
      toast.error("حدث خطأ أثناء الإرسال");
    }
    setSubmitting(false);
  };

  // ─── Target Member Selector ───
  const renderTargetSelector = (label: string) => (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {showSearch && !selectedTarget ? (
        <>
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
                filtered.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedTarget(m); setSearchQuery(""); }}
                    className="w-full text-right px-3 py-2.5 flex items-center gap-2 hover:bg-muted/60 transition-colors border-b border-border/20 last:border-0"
                  >
                    <UserCheck className="h-4 w-4 text-primary shrink-0" />
                    <div className="text-right">
                      <span className="text-sm font-medium block">{getLineageLabel(m)}</span>
                      {getMemberSubtitle(m) && <span className="text-xs text-muted-foreground">{getMemberSubtitle(m)}</span>}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </>
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
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md w-[95vw] rounded-2xl border-border/50 bg-card" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground text-center">
            <Send className="inline h-5 w-5 ml-1 text-primary" />
            {step === 3 ? "تم الإرسال" : "إرسال طلب تعديل"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* ═══ Step 1: Type Selection ═══ */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">اختر نوع الطلب</p>
              {typeOptions.map(({ type, icon: Icon, label, desc }) => (
                <button
                  key={type}
                  onClick={() => { setRequestType(type); setStep(2); }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-right ${
                    requestType === type
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ═══ Step 2: Type-specific Fields ═══ */}
          {step === 2 && requestType && (
            <div className="space-y-4">
              {/* Back button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStep(1); setRequestType(null); }}
                className="text-sm h-8 px-2 gap-1"
              >
                <ArrowRight className="h-4 w-4" />
                رجوع
              </Button>

              {/* add_child fields */}
              {requestType === "add_child" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">اسم المولود *</label>
                    <Input
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="الاسم الأول فقط"
                      className="rounded-xl text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">الجنس *</label>
                    <div className="flex gap-2">
                      {(["M", "F"] as const).map((g) => (
                        <button
                          key={g}
                          onClick={() => setChildGender(g)}
                          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${
                            childGender === g
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/50 text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          {g === "M" ? "ذكر" : "أنثى"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {renderTargetSelector("أب المولود")}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">ملاحظات (اختياري)</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أي ملاحظات إضافية..."
                      className="rounded-xl min-h-[80px] resize-none text-sm"
                    />
                  </div>
                </>
              )}

              {/* add_spouse fields */}
              {requestType === "add_spouse" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">اسم الزوجة / الزوج *</label>
                    <Input
                      value={spouseName}
                      onChange={(e) => setSpouseName(e.target.value)}
                      placeholder="الاسم الكامل"
                      className="rounded-xl text-base"
                    />
                  </div>
                  {renderTargetSelector("العضو المعني")}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">ملاحظات (اختياري)</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أي ملاحظات إضافية..."
                      className="rounded-xl min-h-[80px] resize-none text-sm"
                    />
                  </div>
                </>
              )}

              {/* other fields */}
              {requestType === "other" && (
                <>
                  {renderTargetSelector("العضو المعني")}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">تفاصيل الطلب *</label>
                    <Textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="اشرح التعديل المطلوب..."
                      className="rounded-xl min-h-[120px] resize-none text-sm leading-relaxed"
                    />
                  </div>
                </>
              )}

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={submitting || !canSubmit()}
                className="w-full min-h-[48px] rounded-xl font-bold text-base"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "إرسال الطلب"}
              </Button>
            </div>
          )}

          {/* ═══ Step 3: Confirmation ═══ */}
          {step === 3 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-1.5">
                <p className="text-lg font-bold text-foreground">تم إرسال طلبك بنجاح</p>
                <p className="text-sm text-muted-foreground">سيتم مراجعة طلبك من قِبل الإدارة</p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-2 text-right">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">النوع</span>
                  <span className="font-medium">{requestType ? typeLabels[requestType] : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">العضو</span>
                  <span className="font-medium">{selectedTarget?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">التفاصيل</span>
                  <span className="font-medium truncate max-w-[180px]">{getSummary()}</span>
                </div>
              </div>

              <Button
                onClick={() => handleOpenChange(false)}
                variant="outline"
                className="w-full min-h-[48px] rounded-xl font-bold"
              >
                إغلاق
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
