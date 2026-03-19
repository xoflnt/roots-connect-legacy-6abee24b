export function getFirstName(fullName: string): string {
  return fullName.split(/\s+بن[تة]?\s+/)[0].trim();
}
