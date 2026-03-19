export function toWesternNumerals(text: string): string {
  return text.replace(/[٠-٩]/g, (d) =>
    String("٠١٢٣٤٥٦٧٨٩".indexOf(d))
  );
}

export function toEasternNumerals(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) =>
    "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]
  );
}

export function isValidHijriYear(text: string): boolean {
  if (!text.trim()) return false;
  const western = toWesternNumerals(text);
  const num = parseInt(western, 10);
  return !isNaN(num) && num >= 1300 && num <= 1500;
}

export function hijriToGregorian(hijriText: string): string {
  const western = toWesternNumerals(hijriText);
  const num = parseInt(western, 10);
  if (isNaN(num)) return "";
  const gregorian = Math.round(num * (32 / 33) + 622);
  return String(gregorian);
}
