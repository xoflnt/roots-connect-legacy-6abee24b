import { generateDemoFamily, getDemoBranches, type DemoMember } from "./demoDataGenerator";

// Cache per surname so regeneration is avoided on re-render
const cache = new Map<string, DemoMember[]>();

export function getDemoMembers(familySurname: string): DemoMember[] {
  if (cache.has(familySurname)) return cache.get(familySurname)!;
  const members = generateDemoFamily(familySurname);
  cache.set(familySurname, members);
  return members;
}

export { getDemoBranches };
export type { DemoMember };
