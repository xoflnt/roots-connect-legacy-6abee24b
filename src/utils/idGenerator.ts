export function generateMemberId(
  fatherId: string | null,
  allIds: string[]
): string {
  if (!fatherId) {
    // No father — generate next numeric ID
    const numericIds = allIds
      .filter((id) => /^\d+$/.test(id))
      .map(Number);
    const max = Math.max(0, ...numericIds);
    return String(max + 1);
  }

  const prefixMatch = fatherId.match(/^([A-Za-z])/);

  if (prefixMatch) {
    // Father has a letter prefix — child inherits prefix tree
    const childrenOfFather = allIds.filter(
      (id) =>
        id.startsWith(fatherId + "_") &&
        !id.slice(fatherId.length + 1).includes("_")
    );
    const nextSeq = childrenOfFather.length + 1;
    return `${fatherId}_${nextSeq}`;
  } else {
    // Father is numeric — generate next numeric ID
    const numericIds = allIds
      .filter((id) => /^\d+$/.test(id))
      .map(Number);
    const max = Math.max(0, ...numericIds);
    return String(max + 1);
  }
}

export function ensureUniqueId(
  candidateId: string,
  allIds: string[]
): string {
  if (!allIds.includes(candidateId)) return candidateId;
  let suffix = 1;
  while (allIds.includes(`${candidateId}_${suffix}`)) suffix++;
  return `${candidateId}_${suffix}`;
}
