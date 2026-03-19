/**
 * Apply Arabic tatweel (ـ) to text for display headings.
 * Respects Arabic letter connectivity rules — never inserts
 * tatweel after non-connecting letters (ا أ إ آ ى د ذ ر ز و ة).
 * NEVER applies tatweel to sacred words.
 */

const NON_CONNECTING = new Set([
  '\u0627', // ا
  '\u0623', // أ
  '\u0625', // إ
  '\u0622', // آ
  '\u0649', // ى
  '\u062F', // د
  '\u0630', // ذ
  '\u0631', // ر
  '\u0632', // ز
  '\u0648', // و
  '\u0629', // ة
]);

const SACRED_EXEMPT = ['الله', 'الرحمن', 'الرحيم'];

function isArabicLetter(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x0600 && code <= 0x06FF;
}

function tatweelWord(word: string): string {
  let result = '';
  for (let i = 0; i < word.length; i++) {
    result += word[i];
    const current = word[i];
    const next = word[i + 1];
    if (
      next &&
      isArabicLetter(current) &&
      isArabicLetter(next) &&
      !NON_CONNECTING.has(current)
    ) {
      result += 'ـ';
    }
  }
  return result;
}

/** Apply tatweel to a multi-word string (for headings). */
export function applyTatweel(text: string): string {
  return text
    .split(' ')
    .map((word) => {
      if (SACRED_EXEMPT.includes(word)) return word;
      if (word.length < 3) return word;
      return tatweelWord(word);
    })
    .join(' ');
}

/** Apply tatweel to a single name (for canvas rendering). */
export function applyTatweelCanvas(name: string): string {
  if (SACRED_EXEMPT.includes(name)) return name;
  if (name.length < 3) return name;
  return tatweelWord(name);
}
