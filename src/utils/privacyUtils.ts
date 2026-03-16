// Single source of truth for guest privacy restrictions.
// UI-only — never filter data at the service level.

const AGE_EXEMPT_IDS = ['200', '300', '400', '500', '600'];
const SPOUSE_EXEMPT_IDS = ['101', '200', '300', '400'];

export function canSeeAge(memberId: string, isLoggedIn: boolean): boolean {
  if (isLoggedIn) return true;
  return AGE_EXEMPT_IDS.includes(memberId);
}

export function canSeeSpouses(memberId: string, isLoggedIn: boolean): boolean {
  if (isLoggedIn) return true;
  return SPOUSE_EXEMPT_IDS.includes(memberId);
}

export function canSeeMotherName(memberId: string, isLoggedIn: boolean): boolean {
  if (isLoggedIn) return true;
  return AGE_EXEMPT_IDS.includes(memberId);
}

export function privateLabel(fieldName: string): string {
  return `🔒 ${fieldName} — خاص بأفراد العائلة`;
}

/**
 * Get spouse label for grouped children.
 * If guest: returns "زوجة ١", "زوجة ٢" etc.
 * If logged in: returns the actual spouse name.
 */
export function getSpouseLabel(
  spouseName: string,
  index: number,
  isLoggedIn: boolean
): string {
  if (isLoggedIn) return spouseName;
  const nums = ['١', '٢', '٣', '٤', '٥'];
  return `زوجة ${nums[index] || index + 1}`;
}
