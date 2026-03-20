import { toArabicNum } from "@/utils/arabicUtils";

export function relativeArabicTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${toArabicNum(mins)} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${toArabicNum(hours)} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `منذ ${toArabicNum(days)} يوم`;
  const months = Math.floor(days / 30);
  return `منذ ${toArabicNum(months)} شهر`;
}
