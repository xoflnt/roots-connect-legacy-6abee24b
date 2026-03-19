import type { FamilyMember } from "@/data/familyData";
import type { KinshipResult } from "./types";
import type { DirectionalKinship } from "@/services/familyService";
import { getBranch } from "@/utils/branchUtils";
import { inferMotherName } from "@/services/familyService";
import { canSeeMotherName, privateLabel } from "@/utils/privacyUtils";
import { applyTatweelCanvas } from "@/utils/tatweelUtils";

/* ── Hardcoded palette (always light, no CSS vars) ── */
const C = {
  bg: "#F7F3EE",
  gold: "#C9A84C",
  textPrimary: "#1a3a2a",
  textSecondary: "#6b7280",
  muted: "#9ca3af",
  mutedBg: "#f3f4f6",
  mutedBorder: "#e5e7eb",
  white: "#FFFFFF",
  male: "#3b82f6",
  female: "#ec4899",
};

const BRANCH_COLORS: Record<string, { bg: string; text: string }> = {
  "200": { bg: "#C9A84C30", text: "#C9A84C" },
  "300": { bg: "#16a34a30", text: "#16a34a" },
  "400": { bg: "#ea580c30", text: "#ea580c" },
};

const SCALE = 3;
const W = 390;
const PAD = 15;

function toArabicDigits(n: number): string {
  return n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);
}

async function loadFont() {
  try {
    const font = new FontFace(
      'YearOfHandicrafts',
      'url(/fonts/TheYearofHandicrafts-Regular.otf)',
      { weight: '400' }
    );
    const boldFont = new FontFace(
      'YearOfHandicrafts',
      'url(/fonts/TheYearofHandicrafts-Bold.otf)',
      { weight: '700' }
    );
    await Promise.all([font.load(), boldFont.load()]);
    document.fonts.add(font);
    document.fonts.add(boldFont);
  } catch {
    /* fallback to system font */
  }
}

function setFont(ctx: CanvasRenderingContext2D, style: string) {
  ctx.font = style.replace(/Tajawal/g, "'YearOfHandicrafts', 'Tajawal', 'Arial', sans-serif");
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number, fill?: string, stroke?: string, lineWidth = 1, dash?: number[]
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    if (dash) ctx.setLineDash(dash);
    ctx.stroke();
    if (dash) ctx.setLineDash([]);
  }
}

function drawPersonIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  // Head
  ctx.beginPath();
  ctx.arc(cx, cy - 5, 5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  // Body
  ctx.beginPath();
  ctx.arc(cx, cy + 8, 8, Math.PI, 0);
  ctx.fillStyle = color;
  ctx.fill();
}

function measureTextWidth(ctx: CanvasRenderingContext2D, text: string, font: string): number {
  setFont(ctx, font);
  return ctx.measureText(text).width;
}

export async function generateKinshipImage(
  result: KinshipResult,
  person1: FamilyMember,
  person2: FamilyMember,
  relationText: string,
  directional: DirectionalKinship | null,
  pathChain: FamilyMember[],
  isLoggedIn: boolean = false
): Promise<HTMLCanvasElement> {
  await loadFont();

  const name1 = applyTatweelCanvas(person1.name.split(" ")[0]);
  const name2 = applyTatweelCanvas(person2.name.split(" ")[0]);
  const lcaName = result.lca?.name.split(" ")[0] ?? "";
  const lcaLabel = result.lca?.gender === "F" ? "الجدة المشتركة" : "الجد المشترك";
  const branch1 = getBranch(person1.id);
  const branch2 = getBranch(person2.id);
  const mother1 = inferMotherName(person1);
  const mother2 = inferMotherName(person2);

  // --- Pre-calculate dynamic sections height ---
  // We'll do a two-pass: first calculate height, then draw.

  // Build directional lines
  const dirLines: string[] = [];
  if (directional && !directional.symmetric) {
    if (directional.title1to2) {
      dirLines.push(`${name1} ${person1.gender === "F" ? "هي" : "هو"} ${directional.title1to2} ${name2}`);
    }
    if (directional.title2to1) {
      dirLines.push(`${name2} ${person2.gender === "F" ? "هي" : "هو"} ${directional.title2to1} ${name1}`);
    }
  }

  // Temp canvas for measurements
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = 1;
  tmpCanvas.height = 1;
  const tmpCtx = tmpCanvas.getContext("2d")!;

  // Measure path chain wrapping
  const pillFont = "bold 11px Tajawal";
  const pillPadX = 12;
  const pillH = 22;
  const pillGap = 4;
  const arrowW = 10;
  const pathMaxW = W - PAD * 2;

  let pathRows = 1;
  let pathX = pathMaxW; // start from right (RTL)
  for (let i = 0; i < pathChain.length; i++) {
    const label = pathChain[i].name.split(" ")[0];
    const tw = measureTextWidth(tmpCtx, label, pillFont) + pillPadX * 2;
    const needed = tw + (i > 0 ? arrowW + pillGap : 0);
    if (pathX - needed < 0 && i > 0) {
      pathRows++;
      pathX = pathMaxW;
    }
    pathX -= needed;
  }
  const pathSectionH = 20 + pathRows * (pillH + pillGap) + 10;

  // Mother name lines add height to chips
  const chipBaseH = 80;
  const chipExtraH1 = mother1 ? 16 : 0;
  const chipExtraH2 = mother2 ? 16 : 0;
  const chipH = chipBaseH + Math.max(chipExtraH1, chipExtraH2);

  // Calculate total height
  let totalH = 0;
  totalH += 20; // top padding + gold line
  totalH += 5;  // gold line height
  totalH += 15; // gap
  totalH += 30; // badge
  totalH += 10; // gap
  totalH += 35; // relation text
  totalH += dirLines.length * 20; // directional lines
  totalH += 15; // gap
  totalH += chipH; // person chips
  totalH += 15; // gap
  totalH += 65; // LCA section
  totalH += 15; // gap
  totalH += 75; // distance badges
  totalH += 15; // gap
  totalH += pathSectionH; // path chain
  totalH += 15; // gap
  totalH += 40; // footer
  totalH += 10; // bottom gold line + padding

  const H = totalH;

  // --- Create real canvas ---
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  // 1. BACKGROUND
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // Top gold line
  const topLineGrad = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
  topLineGrad.addColorStop(0, "transparent");
  topLineGrad.addColorStop(0.5, C.gold);
  topLineGrad.addColorStop(1, "transparent");
  ctx.fillStyle = topLineGrad;
  ctx.fillRect(PAD, 8, W - PAD * 2, 3);

  let y = 25;

  // 2. HEADER — badge pill
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const badgeText = "صلة القرابة";
  setFont(ctx, "bold 13px Tajawal");
  const badgeW = ctx.measureText(badgeText).width + 40;
  const badgeX = (W - badgeW) / 2;
  roundRect(ctx, badgeX, y, badgeW, 26, 13, C.gold + "20", C.gold, 1);
  ctx.fillStyle = C.gold;
  ctx.fillText(badgeText, W / 2, y + 13);
  y += 36;

  // Relation text
  const relFontSize = relationText.length > 20 ? 22 : 28;
  setFont(ctx, `bold ${relFontSize}px Tajawal`);
  ctx.fillStyle = C.textPrimary;
  ctx.fillText(relationText, W / 2, y + relFontSize / 2);
  y += relFontSize + 10;

  // Directional lines
  if (dirLines.length > 0) {
    setFont(ctx, "13px Tajawal");
    for (const line of dirLines) {
      ctx.fillStyle = C.textSecondary;
      ctx.fillText(line, W / 2, y + 7);
      y += 20;
    }
    y += 5;
  }

  // 3. TWO PERSON CHIPS
  const chipW = (W - PAD * 2 - 10) / 2;
  const chip1X = W - PAD - chipW; // right side (person1)
  const chip2X = PAD; // left side (person2)

  function drawChip(
    x: number, chipY: number, member: FamilyMember,
    borderColor: string,
    branch: ReturnType<typeof getBranch>,
    motherName: string | null
  ) {
    const isMale = member.gender === "M";
    const genderColor = isMale ? C.male : C.female;

    // Chip background
    roundRect(ctx, x, chipY, chipW, chipH, 10, C.white + "CC", borderColor, 1.5);

    // Gender circle
    const iconCx = x + chipW / 2;
    const iconCy = chipY + 22;
    ctx.beginPath();
    ctx.arc(iconCx, iconCy, 16, 0, Math.PI * 2);
    ctx.fillStyle = genderColor + "20";
    ctx.fill();
    drawPersonIcon(ctx, iconCx, iconCy, genderColor);

    // Name
    setFont(ctx, "bold 13px Tajawal");
    ctx.fillStyle = C.textPrimary;
    ctx.textAlign = "center";
    const firstName = applyTatweelCanvas(member.name.split(" ")[0]);
    ctx.fillText(firstName, x + chipW / 2, chipY + 48);

    // Branch pill
    let nextY = chipY + 58;
    if (branch) {
      const bColors = BRANCH_COLORS[branch.pillarId] || { bg: C.mutedBg, text: C.textSecondary };
      setFont(ctx, "bold 10px Tajawal");
      const bw = ctx.measureText(branch.label).width + 14;
      roundRect(ctx, x + (chipW - bw) / 2, nextY, bw, 16, 8, bColors.bg, undefined);
      ctx.fillStyle = bColors.text;
      ctx.fillText(branch.label, x + chipW / 2, nextY + 8);
      nextY += 18;
    }

    // Mother name
    if (motherName) {
      if (canSeeMotherName(member.id, isLoggedIn)) {
        const mLabel = `${isMale ? "والدته" : "والدتها"}: ${motherName}`;
        setFont(ctx, "10px Tajawal");
        const mw = ctx.measureText(mLabel).width + 10;
        roundRect(ctx, x + (chipW - mw) / 2, nextY, mw, 14, 4, C.mutedBg, undefined);
        ctx.fillStyle = C.textSecondary;
        ctx.fillText(mLabel, x + chipW / 2, nextY + 7);
      } else {
        setFont(ctx, "11px Tajawal");
        ctx.fillStyle = "rgba(87,122,102,0.6)";
        ctx.fillText(privateLabel('الوالدة'), x + chipW / 2, nextY + 7);
      }
    }
  }

  drawChip(chip1X, y, person1, C.textPrimary + "40", branch1, mother1);
  drawChip(chip2X, y, person2, C.gold + "80", branch2, mother2);
  y += chipH + 15;

  // 4. COMMON ANCESTOR (dashed box)
  const lcaBoxH = 55;
  roundRect(ctx, PAD, y, W - PAD * 2, lcaBoxH, 10, undefined, C.gold + "50", 1.5, [4, 4]);
  ctx.textAlign = "center";
  setFont(ctx, "11px Tajawal");
  ctx.fillStyle = C.textSecondary;
  ctx.fillText("يجتمعان في", W / 2, y + 14);
  setFont(ctx, "bold 16px Tajawal");
  ctx.fillStyle = C.gold;
  ctx.fillText(lcaName, W / 2, y + 32);
  setFont(ctx, "11px Tajawal");
  ctx.fillStyle = C.textSecondary;
  ctx.fillText(lcaLabel, W / 2, y + 48);
  y += lcaBoxH + 15;

  // 5. DISTANCE BADGES
  const distH = 65;
  const distW = chipW;
  const dist1X = W - PAD - distW; // right
  const dist2X = PAD; // left

  function drawDistBadge(x: number, dy: number, name: string, dist: number) {
    roundRect(ctx, x, dy, distW, distH, 10, C.mutedBg, C.mutedBorder, 1);
    ctx.textAlign = "center";
    setFont(ctx, "11px Tajawal");
    ctx.fillStyle = C.textSecondary;
    ctx.fillText(name, x + distW / 2, dy + 14);
    setFont(ctx, "bold 32px Tajawal");
    ctx.fillStyle = C.textPrimary;
    ctx.fillText(toArabicDigits(dist), x + distW / 2, dy + 40);
    setFont(ctx, "11px Tajawal");
    ctx.fillStyle = C.textSecondary;
    ctx.fillText("أجيال", x + distW / 2, dy + 58);
  }

  drawDistBadge(dist1X, y, name1, result.dist1);
  drawDistBadge(dist2X, y, name2, result.dist2);
  y += distH + 15;

  // 6. PATH CHAIN
  setFont(ctx, "11px Tajawal");
  ctx.textAlign = "right";
  ctx.fillStyle = C.textSecondary;
  ctx.fillText("المسار", W - PAD, y + 10);
  y += 20;

  // Draw pills RTL with wrapping
  setFont(ctx, "bold 11px Tajawal");
  let px = W - PAD;
  const pillY = y;
  let currentRow = 0;

  for (let i = 0; i < pathChain.length; i++) {
    const m = pathChain[i];
    const label = m.name.split(" ")[0];
    setFont(ctx, "bold 11px Tajawal");
    const tw = ctx.measureText(label).width + pillPadX * 2;
    const totalNeeded = tw + (i > 0 ? arrowW + pillGap : 0);

    if (px - totalNeeded < PAD && i > 0) {
      currentRow++;
      px = W - PAD;
    }

    const rowY = pillY + currentRow * (pillH + pillGap);

    // Arrow before pill (except first)
    if (i > 0) {
      px -= arrowW;
      setFont(ctx, "11px Tajawal");
      ctx.fillStyle = C.muted;
      ctx.textAlign = "center";
      ctx.fillText("‹", px + arrowW / 2, rowY + pillH / 2 + 1);
      px -= pillGap;
    }

    // Pill
    px -= tw;
    const isP1 = m.id === person1.id;
    const isP2 = m.id === person2.id;
    const isLCA = m.id === result.lca?.id;

    let pillBg = C.mutedBg;
    let pillText = C.textSecondary;
    let pillStroke: string | undefined;

    if (isP1 || isP2) {
      pillBg = C.textPrimary + "20";
      pillText = C.textPrimary;
    } else if (isLCA) {
      pillBg = C.gold + "20";
      pillText = C.gold;
      pillStroke = C.gold;
    }

    roundRect(ctx, px, rowY, tw, pillH, pillH / 2, pillBg, pillStroke, 1);
    setFont(ctx, "bold 11px Tajawal");
    ctx.fillStyle = pillText;
    ctx.textAlign = "center";
    ctx.fillText(label, px + tw / 2, rowY + pillH / 2 + 1);
  }
  y += pathRows * (pillH + pillGap) + 15;

  // 7. FOOTER
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.strokeStyle = C.mutedBorder;
  ctx.lineWidth = 1;
  ctx.stroke();
  y += 10;

  setFont(ctx, "11px Tajawal");
  ctx.fillStyle = C.muted;
  ctx.textAlign = "center";
  ctx.fillText("بوابة تراث الخنيني — فرع الزلفي", W / 2, y + 8);
  y += 20;

  // Bottom gold line
  const botLineGrad = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
  botLineGrad.addColorStop(0, "transparent");
  botLineGrad.addColorStop(0.5, C.gold);
  botLineGrad.addColorStop(1, "transparent");
  ctx.fillStyle = botLineGrad;
  ctx.fillRect(PAD, y, W - PAD * 2, 3);

  return canvas;
}
