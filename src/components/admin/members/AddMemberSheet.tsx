import { useState, useMemo, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { HijriDatePicker } from "@/components/HijriDatePicker";
import { useIsMobile } from "@/hooks/use-mobile";
import { toArabicNum } from "@/utils/arabicUtils";
import { arabicMatch } from "@/utils/normalizeArabic";
import {
  toEasternNumerals,
  toWesternNumerals,
  isValidHijriYear,
  hijriToGregorian,
} from "@/utils/hijriUtils";
import { generateMemberId, ensureUniqueId } from "@/utils/idGenerator";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { addMember } from "@/services/dataService";
import { getAdminToken } from "@/components/AdminProtect";
import { toast } from "@/hooks/use-toast";
import { X, Plus, ChevronDown } from "lucide-react";
import type { EnrichedMember } from "@/hooks/admin/useMembers";
import type { FamilyMember } from "@/data/familyData";

interface HijriDate {
  day?: string;
  month?: string;
  year?: string;
}

interface AddMemberSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMember: FamilyMember) => void;
  allMembers: EnrichedMember[];
  preselectedFatherId?: string;
}

export function AddMemberSheet({
  isOpen,
  onClose,
  onSuccess,
  allMembers,
  preselectedFatherId,
}: AddMemberSheetProps) {
  const isMobile = useIsMobile();

  // Form state
  const [name, setName] = useState("");
  const [selectedFather, setSelectedFather] = useState<EnrichedMember | null>(
    () =>
      preselectedFatherId
        ? allMembers.find((m) => m.id === preselectedFatherId) ?? null
        : null
  );
  const [noFather, setNoFather] = useState(false);
  const [gender, setGender] = useState<"M" | "F" | "">("");
  const [birthDate, setBirthDate] = useState<HijriDate>({});
  const [isDeceased, setIsDeceased] = useState(false);
  const [deathDate, setDeathDate] = useState<HijriDate>({});
  const [spouses, setSpouses] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [selectedMother, setSelectedMother] = useState("");
  const [fatherSearchOpen, setFatherSearchOpen] = useState(false);
  const [fatherQuery, setFatherQuery] = useState("");

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const allIds = useMemo(() => allMembers.map((m) => m.id), [allMembers]);

  const generatedId = useMemo(() => {
    const fatherId = noFather ? null : selectedFather?.id ?? null;
    if (!fatherId && !noFather) return null;
    const candidate = generateMemberId(fatherId, allIds);
    return ensureUniqueId(candidate, allIds);
  }, [selectedFather, noFather, allIds]);

  const fatherChildren = useMemo(() => {
    if (!selectedFather) return 0;
    return allMembers.filter((m) => m.father_id === selectedFather.id).length;
  }, [selectedFather, allMembers]);


  // Father search results
  const males = useMemo(
    () => allMembers.filter((m) => m.gender === "M"),
    [allMembers]
  );

  const fatherResults = useMemo(() => {
    if (!fatherQuery.trim()) {
      return [...males].sort((a, b) => a.name.localeCompare(b.name, "ar")).slice(0, 20);
    }
    return males.filter((m) => arabicMatch(fatherQuery, m.name));
  }, [males, fatherQuery]);

  const composeHijriString = (d: HijriDate): string => {
    if (!d.year) return "";
    const yearEastern = toEasternNumerals(toWesternNumerals(d.year));
    if (d.day && d.month) {
      return `${toEasternNumerals(d.day)}/${toEasternNumerals(d.month)}/${yearEastern}`;
    }
    return yearEastern;
  };

  const addSpouse = () => {
    if (spouses.length < 4) setSpouses([...spouses, ""]);
  };

  const removeSpouse = (index: number) => {
    setSpouses(spouses.filter((_, i) => i !== index));
  };

  const updateSpouse = (index: number, val: string) => {
    const updated = [...spouses];
    updated[index] = val;
    setSpouses(updated);
  };

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2)
      errs.name = "الاسم مطلوب (حرفان على الأقل)";
    if (!selectedFather && !noFather)
      errs.father = "اختر الأب أو حدد «غير معروف»";
    if (!gender) errs.gender = "حدد الجنس";
    if (birthDate.year && !isValidHijriYear(birthDate.year))
      errs.birthYear = "سنة ميلاد غير صالحة";
    if (isDeceased && deathDate.year && !isValidHijriYear(deathDate.year))
      errs.deathYear = "سنة وفاة غير صالحة";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [name, selectedFather, noFather, gender, birthDate, isDeceased, deathDate]);

  const handleSaveClick = () => {
    if (validate()) setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!generatedId || !gender) return;
    setIsSaving(true);
    try {
      const spousesText = spouses
        .filter((s) => s.trim())
        .join("، ");

      const birthYearStr = composeHijriString(birthDate);
      const deathYearStr = isDeceased ? composeHijriString(deathDate) : undefined;

      let finalNotes = notes.trim() || "";
      if (selectedMother && selectedMother !== "غير معروفة") {
        const prefix = gender === "M"
          ? `والدته: ${selectedMother}`
          : `والدتها: ${selectedMother}`;
        finalNotes = finalNotes ? `${prefix}\n${finalNotes}` : prefix;
      }

      const member: FamilyMember = {
        id: generatedId,
        name: name.trim(),
        gender: gender as "M" | "F",
        father_id: noFather ? null : selectedFather?.id ?? null,
        birth_year: birthYearStr || undefined,
        death_year: deathYearStr || undefined,
        spouses: spousesText || undefined,
        notes: finalNotes || undefined,
      };

      const token = getAdminToken();
      await addMember(member, token || undefined);

      toast({
        title: `تمت إضافة ${member.name} بنجاح`,
      });

      onSuccess(member);
      resetForm();
      onClose();
    } catch (err) {
      toast({
        title: "حدث خطأ",
        description: err instanceof Error ? err.message : "فشل الحفظ",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setConfirmOpen(false);
    }
  };

  const resetForm = () => {
    setName("");
    setSelectedFather(null);
    setNoFather(false);
    setGender("");
    setBirthDate({});
    setIsDeceased(false);
    setDeathDate({});
    setSpouses([]);
    setNotes("");
    setSelectedMother("");
    setErrors({});
    setFatherQuery("");
  };

  const lineagePreview = useMemo(() => {
    if (!name.trim()) return "";
    let chain = name.trim();
    if (selectedFather) {
      chain += ` بن ${selectedFather.name}`;
    }
    return chain;
  }, [name, selectedFather]);

  const birthYearStr = composeHijriString(birthDate);

  return (
    <>
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
            onClose();
          }
        }}
      >
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          dir="rtl"
          className={`flex flex-col ${
            isMobile
              ? "h-[90dvh] rounded-t-2xl"
              : "w-full sm:max-w-md"
          } p-0`}
        >
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/50">
            <SheetTitle className="text-right text-xl font-bold">
              إضافة عضو جديد
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Field 1: Name */}
            <div className="space-y-1.5">
              <label className="text-base font-medium text-foreground">
                الاسم <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="الاسم الأول فقط"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-12 text-base rounded-xl"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Field 2: Father */}
            <div className="space-y-1.5">
              <label className="text-base font-medium text-foreground">
                الأب <span className="text-destructive">*</span>
              </label>

              {selectedFather ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-xl min-h-12">
                  <span className="flex-1 text-base font-semibold">
                    {selectedFather.name}
                  </span>
                  <button
                    onClick={() => { setSelectedFather(null); setSelectedMother(""); }}
                    className="p-1.5 rounded-lg hover:bg-background min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : noFather ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-xl min-h-12">
                  <span className="flex-1 text-base text-muted-foreground">
                    الأب غير معروف
                  </span>
                  <button
                    onClick={() => setNoFather(false)}
                    className="p-1.5 rounded-lg hover:bg-background min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Popover
                  open={fatherSearchOpen}
                  onOpenChange={(open) => {
                    setFatherSearchOpen(open);
                    if (!open) setFatherQuery("");
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full min-h-12 text-base rounded-xl justify-between text-muted-foreground"
                    >
                      ابحث عن الأب...
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                  >
                    <Command dir="rtl" shouldFilter={false}>
                      <CommandInput
                        placeholder="ابحث بالاسم..."
                        className="text-base"
                        value={fatherQuery}
                        onValueChange={setFatherQuery}
                      />
                      <CommandList className="max-h-60">
                        <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                          لا توجد نتائج
                        </CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setNoFather(true);
                              setSelectedFather(null);
                              setFatherSearchOpen(false);
                              setFatherQuery("");
                            }}
                            className="min-h-12 text-base text-muted-foreground"
                          >
                            الأب غير معروف
                          </CommandItem>
                          {fatherResults.map((m) => {
                            const children = allMembers.filter(
                              (c) => c.father_id === m.id
                            ).length;
                            return (
                              <CommandItem
                                key={m.id}
                                value={m.id}
                                keywords={[m.name, m.fatherName ?? ""]}
                                onSelect={() => {
                                  setSelectedFather(m);
                                  setNoFather(false);
                                  setSelectedMother("");
                                  setFatherSearchOpen(false);
                                  setFatherQuery("");
                                }}
                                className="min-h-12 flex flex-col items-start gap-0.5 py-2"
                              >
                                <span className="text-base font-bold">
                                  {m.name}
                                </span>
                                <span className="text-xs text-muted-foreground flex flex-wrap items-center gap-1">
                                  {m.fatherName && <span>بن {m.fatherName}</span>}
                                  {m.branchLabel && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                      {m.branchLabel}
                                    </Badge>
                                  )}
                                  <span>ج{toArabicNum(m.generation)}</span>
                                  {children > 0 && (
                                    <span>({toArabicNum(children)} أبناء)</span>
                                  )}
                                </span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}

              {errors.father && (
                <p className="text-sm text-destructive">{errors.father}</p>
              )}

              {/* Auto-generated info */}
              {(selectedFather || noFather) && generatedId && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-sm font-mono">
                    {generatedId}
                  </Badge>
                  {selectedFather?.branchLabel && (
                    <Badge variant="secondary" className="text-sm">
                      {selectedFather.branchLabel}
                    </Badge>
                  )}
                  {selectedFather && (
                    <Badge variant="secondary" className="text-sm">
                      الجيل {toArabicNum(selectedFather.generation + 1)}
                    </Badge>
                  )}
                  {selectedFather && (
                    <span className="text-sm text-muted-foreground">
                      ({toArabicNum(fatherChildren)} أبناء)
                    </span>
                  )}
                </div>
              )}

              {/* Mother selection from father's spouses */}
              {selectedFather && selectedFather.spousesArray.length > 0 && (
                <div className="mt-2 space-y-2">
                  <span className="text-sm font-medium text-foreground">اختر أم الطفل:</span>
                  <div className="space-y-1.5">
                    {selectedFather.spousesArray.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedMother(s)}
                        className={`min-h-12 w-full rounded-xl text-right px-4 text-base border transition-colors ${
                          selectedMother === s
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-card border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedMother("غير معروفة")}
                      className={`min-h-12 w-full rounded-xl text-right px-4 text-base border transition-colors ${
                        selectedMother === "غير معروفة"
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-card border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      غير معروفة
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Field 3: Gender */}
            <div className="space-y-1.5">
              <label className="text-base font-medium text-foreground">
                الجنس <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={gender === "M" ? "default" : "outline"}
                  className="min-h-12 text-base rounded-xl"
                  onClick={() => setGender("M")}
                >
                  ذكر
                </Button>
                <Button
                  type="button"
                  variant={gender === "F" ? "default" : "outline"}
                  className="min-h-12 text-base rounded-xl"
                  onClick={() => setGender("F")}
                >
                  أنثى
                </Button>
              </div>
              {errors.gender && (
                <p className="text-sm text-destructive">{errors.gender}</p>
              )}
            </div>

            {/* Field 4: Birth Date (Hijri) */}
            <div className="space-y-1.5">
              <label className="text-base font-medium text-foreground">
                تاريخ الميلاد
              </label>
              <HijriDatePicker value={birthDate} onChange={setBirthDate} />
              {birthYearStr && birthDate.year && isValidHijriYear(birthDate.year) && (
                <p className="text-sm text-muted-foreground">
                  ≈ {hijriToGregorian(birthDate.year)}م
                </p>
              )}
              {errors.birthYear && (
                <p className="text-sm text-destructive">{errors.birthYear}</p>
              )}
            </div>

            {/* Field 5: Status */}
            <div className="space-y-1.5">
              <label className="text-base font-medium text-foreground">
                الحالة
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={!isDeceased ? "default" : "outline"}
                  className="min-h-12 text-base rounded-xl"
                  onClick={() => setIsDeceased(false)}
                >
                  حي
                </Button>
                <Button
                  type="button"
                  variant={isDeceased ? "default" : "outline"}
                  className="min-h-12 text-base rounded-xl"
                  onClick={() => setIsDeceased(true)}
                >
                  متوفى
                </Button>
              </div>
            </div>

            {/* Field 5a: Death Date */}
            {isDeceased && (
              <div className="space-y-1.5">
                <label className="text-base font-medium text-foreground">
                  تاريخ الوفاة
                </label>
                <HijriDatePicker value={deathDate} onChange={setDeathDate} />
                {deathDate.year && isValidHijriYear(deathDate.year) && (
                  <p className="text-sm text-muted-foreground">
                    ≈ {hijriToGregorian(deathDate.year)}م
                  </p>
                )}
                {errors.deathYear && (
                  <p className="text-sm text-destructive">
                    {errors.deathYear}
                  </p>
                )}
              </div>
            )}

            {/* Field 6: Spouses */}
            <div className="space-y-1.5">
              <label className="text-base font-medium text-foreground">
                {gender === "F" ? "الأزواج" : "الزوجات"}
              </label>
              <div className="space-y-2">
                {spouses.map((spouse, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={
                        gender === "F" ? "اسم الزوج" : "اسم الزوجة"
                      }
                      value={spouse}
                      onChange={(e) => updateSpouse(i, e.target.value)}
                      className="min-h-12 text-base rounded-xl flex-1 w-full min-w-0"
                    />
                    <button
                      onClick={() => removeSpouse(i)}
                      className="p-2 rounded-xl hover:bg-muted min-w-[48px] min-h-[48px] flex items-center justify-center text-muted-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
              {spouses.length < 4 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={addSpouse}
                  className="min-h-12 text-base gap-1"
                >
                  <Plus className="h-4 w-4" />
                  {gender === "F" ? "إضافة زوج" : "إضافة زوجة"}
                </Button>
              )}
            </div>

            {/* Field 7: Notes */}
            <div className="space-y-1.5">
              <label className="text-base font-medium text-foreground">
                ملاحظات
              </label>
              <Textarea
                placeholder="ملاحظات إضافية..."
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value.slice(0, 500))
                }
                className="min-h-[100px] text-base rounded-xl resize-none w-full"
              />
              <p className="text-sm text-muted-foreground text-left" dir="ltr">
                {toArabicNum(notes.length)}/٥٠٠
              </p>
            </div>

            {/* Preview */}
            {generatedId && name.trim() && (
              <div className="bg-muted/50 border border-border/50 rounded-xl p-4 space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  معاينة
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">المعرّف:</span>{" "}
                  <span className="font-mono">{generatedId}</span>
                </p>
                {selectedFather?.branchLabel && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">الفرع:</span>{" "}
                    {selectedFather.branchLabel}
                  </p>
                )}
                {selectedFather && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">الجيل:</span>{" "}
                    {toArabicNum(selectedFather.generation + 1)}
                  </p>
                )}
                {lineagePreview && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">النسب:</span>{" "}
                    {lineagePreview}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Save button */}
          <div className="px-5 py-4 border-t border-border/50">
            <Button
              onClick={handleSaveClick}
              disabled={isSaving}
              className="w-full min-h-14 text-base rounded-xl"
            >
              حفظ العضو
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="تأكيد الإضافة"
        confirmText="حفظ العضو"
        isLoading={isSaving}
      >
        <div className="space-y-1 text-right">
          <p>
            هل تريد إضافة <strong>{name.trim()}</strong>؟
          </p>
          {lineagePreview && (
            <p className="text-sm">{lineagePreview}</p>
          )}
          {generatedId && (
            <p className="text-sm font-mono">المعرّف: {generatedId}</p>
          )}
        </div>
      </ConfirmDialog>
    </>
  );
}
