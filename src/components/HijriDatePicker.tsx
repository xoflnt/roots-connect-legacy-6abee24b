import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toArabicNum } from "@/utils/arabicUtils";

const HIJRI_MONTHS = [
  { num: '١', name: 'محرم' },
  { num: '٢', name: 'صفر' },
  { num: '٣', name: 'ربيع الأول' },
  { num: '٤', name: 'ربيع الآخر' },
  { num: '٥', name: 'جمادى الأولى' },
  { num: '٦', name: 'جمادى الآخرة' },
  { num: '٧', name: 'رجب' },
  { num: '٨', name: 'شعبان' },
  { num: '٩', name: 'رمضان' },
  { num: '١٠', name: 'شوال' },
  { num: '١١', name: 'ذو القعدة' },
  { num: '١٢', name: 'ذو الحجة' },
];

interface HijriDatePickerProps {
  value?: { day?: string; month?: string; year?: string };
  onChange: (val: { day?: string; month?: string; year?: string }) => void;
}

export function HijriDatePicker({ value = {}, onChange }: HijriDatePickerProps) {
  const years: string[] = [];
  for (let y = 1447; y >= 1300; y--) years.push(String(y));

  const days: string[] = [];
  for (let d = 1; d <= 30; d++) days.push(String(d));

  return (
    <div className="flex gap-2 w-full" dir="rtl">
      {/* Day */}
      <Select value={value.day || ""} onValueChange={(d) => onChange({ ...value, day: d })}>
        <SelectTrigger className="flex-1 min-h-[48px] rounded-xl">
          <SelectValue placeholder="اليوم" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={d}>{toArabicNum(d)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month */}
      <Select value={value.month || ""} onValueChange={(m) => onChange({ ...value, month: m })}>
        <SelectTrigger className="flex-[1.5] min-h-[48px] rounded-xl">
          <SelectValue placeholder="الشهر" />
        </SelectTrigger>
        <SelectContent>
          {HIJRI_MONTHS.map((m, i) => (
            <SelectItem key={i} value={String(i + 1)}>{m.num} — {m.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year */}
      <Select value={value.year || ""} onValueChange={(y) => onChange({ ...value, year: y })}>
        <SelectTrigger className="flex-1 min-h-[48px] rounded-xl">
          <SelectValue placeholder="السنة" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>{toArabicNum(y)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
