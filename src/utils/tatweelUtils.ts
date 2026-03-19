/**
 * Apply Arabic tatweel (ـ) to text for display headings.
 * NEVER applies tatweel to sacred words or very short words.
 */
export function applyTatweel(text: string): string {
  const EXEMPT = ['الله', 'الرحمن', 'الرحيم'];

  return text
    .split(' ')
    .map((word) => {
      if (EXEMPT.includes(word)) return word;
      if (word.length <= 2) return word;
      // Insert ـ between consecutive Arabic letter pairs
      return word.replace(
        /([\u0600-\u06FF])([\u0600-\u06FF])/g,
        '$1ـ$2'
      );
    })
    .join(' ');
}
