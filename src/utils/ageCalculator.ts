const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const WESTERN_DIGITS = "0123456789";

/** Convert Arabic/Eastern numeral string to number. "١٣٨٩" → 1389 */
export function parseArabicYear(str: string | undefined): number | null {
  if (!str) return null;
  let cleaned = "";
  for (const ch of str) {
    const idx = ARABIC_DIGITS.indexOf(ch);
    if (idx !== -1) cleaned += WESTERN_DIGITS[idx];
    else if (/\d/.test(ch)) cleaned += ch;
  }
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? null : n;
}

/** Convert number to Arabic numeral string. 58 → "٥٨" */
export function toArabicNum(n: number): string {
  return String(n)
    .split("")
    .map((d) => ARABIC_DIGITS[parseInt(d)] ?? d)
    .join("");
}

const CURRENT_HIJRI_YEAR = 1447;

/** Calculate age from Hijri birth/death years */
export function calculateAge(
  birthYear: string | undefined,
  deathYear: string | undefined
): number | null {
  const birth = parseArabicYear(birthYear);
  if (!birth) return null;

  const death = parseArabicYear(deathYear);
  const endYear = death ?? CURRENT_HIJRI_YEAR;
  const age = endYear - birth;
  return age > 0 ? age : null;
}

/** Format age with Arabic text */
export function formatAge(
  birthYear: string | undefined,
  deathYear: string | undefined
): string | null {
  const age = calculateAge(birthYear, deathYear);
  if (age === null) return null;

  const arabicAge = toArabicNum(age);
  if (deathYear) {
    return `توفي عن عمر يناهز ${arabicAge} سنة`;
  }
  return `العمر: ${arabicAge} سنة`;
}
