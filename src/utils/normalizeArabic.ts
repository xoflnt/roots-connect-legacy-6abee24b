export function normalizeArabic(text: string): string {
  return text
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '')
    .replace(/\u0640/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function arabicMatch(
  query: string,
  target: string
): boolean {
  return normalizeArabic(target)
    .includes(normalizeArabic(query));
}
