import type { FamilyMember } from "@/data/familyData";
import { getBranch } from "@/utils/branchUtils";
import { applyTatweelCanvas } from "@/utils/tatweelUtils";

/* ── COLORS ── */
const C = {
  greenDeep: '#0F2A1E',
  greenPrimary: '#1B5438',
  gold: '#C9A84C',
  goldMid: 'rgba(201,168,76,0.45)',
  goldLight: 'rgba(201,168,76,0.15)',
  cream: '#F7F3EE',
  creamDark: '#EDE5D8',
  textDark: '#1a3a2a',
  textMuted: 'rgba(26,58,42,0.55)',
  textLight: 'rgba(26,58,42,0.3)',
  white: 'rgba(255,255,255,0.9)',
  branchNasser: '#16a34a',
  branchMohammad: '#C9A84C',
  branchAbdulaziz: '#ea580c',
};

const FONT = "YearOfHandicrafts, Tajawal, Arial";
const SCALE = 2;
const W = 1080;
const CHAIN_SPACING = 110;
const HEADER_H = 220;
const CARD_H = 180;
const HERITAGE_H = 180;
const FOOTER_H = 160;

/* ── HELPERS ── */

function getBranchColor(pillarId: string | undefined): string {
  if (pillarId === '300') return C.branchNasser;
  if (pillarId === '200') return C.branchMohammad;
  if (pillarId === '400') return C.branchAbdulaziz;
  return C.gold;
}

function toArabic(n: number): string {
  return n.toLocaleString('ar-SA');
}


async function loadFont(): Promise<void> {
  try {
    const regular = new FontFace('YearOfHandicrafts', 'url(/fonts/TheYearofHandicrafts-Regular.otf)', { weight: '400' });
    const bold = new FontFace('YearOfHandicrafts', 'url(/fonts/TheYearofHandicrafts-Bold.otf)', { weight: '700' });
    await Promise.all([regular.load(), bold.load()]);
    document.fonts.add(regular);
    document.fonts.add(bold);
  } catch { /* fallback */ }
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawGoldSeparator(ctx: CanvasRenderingContext2D, y: number, w: number, sepW: number) {
  const grad = ctx.createLinearGradient(w / 2 - sepW / 2, 0, w / 2 + sepW / 2, 0);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.5, C.goldMid);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(w / 2 - sepW / 2, y, sepW, 2);
}

function drawTreeIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save();
  ctx.fillStyle = C.goldMid;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size / 2);
  ctx.lineTo(cx - size * 0.64, cy + size * 0.27);
  ctx.lineTo(cx + size * 0.64, cy + size * 0.27);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(cx - size * 0.14, cy + size * 0.27, size * 0.28, size * 0.45);
  ctx.restore();
}

function drawDotPattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = C.gold;
  const spacing = 28;
  for (let py = y; py < y + h; py += spacing) {
    for (let px = x; px < x + w; px += spacing) {
      ctx.beginPath();
      ctx.arc(px, py, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/* ── Ancestor layout info ── */
interface AncestorLayout {
  y: number;        // baseline Y for text
  fontSize: number;
  opacity: number;
  displayName: string;
  dotY: number;     // Y for the connecting dot above this ancestor
}

function getAncestorFontSize(index: number): { fontSize: number; opacity: number } {
  if (index === 1) return { fontSize: 60, opacity: 1.0 };
  if (index === 2) return { fontSize: 52, opacity: 0.82 };
  if (index === 3) return { fontSize: 44, opacity: 0.68 };
  if (index === 4) return { fontSize: 36, opacity: 0.56 };
  return { fontSize: 30, opacity: 0.45 };
}

/* ── MAIN EXPORT ── */

export async function generateLineageImage(
  chain: FamilyMember[],
  _url: string,
  _isLoggedIn: boolean = false
): Promise<Blob> {
  await loadFont();

  const branch = getBranch(chain[0]?.id ?? '');
  const branchColor = getBranchColor(branch?.pillarId);
  const branchLabel = branch?.label || '';
  const depth = chain.length;

  // ══════════════════════════════════════
  // PASS 1: Pre-compute all Y positions
  // ══════════════════════════════════════

  const cardY = 230;
  const cardH = 155;
  const chainStartY = cardY + cardH + 40;

  // Compute ancestor layouts
  const ancestors: AncestorLayout[] = [];
  let prevBottomY = chainStartY; // bottom of previous element (card bottom initially)

  for (let i = 1; i < chain.length; i++) {
    const { fontSize, opacity } = getAncestorFontSize(i);
    const name = chain[i].name.split(' ')[0];
    const displayName = applyTatweelCanvas(name);

    // Position: each ancestor spaced by CHAIN_SPACING from previous
    const baseY = chainStartY + (i - 1) * CHAIN_SPACING;
    const textY = baseY + 42; // text baseline
    const textTopY = textY - fontSize * 0.7; // approximate ascent
    const textBottomY = textY + fontSize * 0.2; // approximate descent

    // Dot at midpoint between previous bottom and current top
    const dotY = prevBottomY + (textTopY - prevBottomY) / 2;

    ancestors.push({ y: textY, fontSize, opacity, displayName, dotY });
    prevBottomY = textBottomY;
  }

  // Family name Y: after last ancestor with safe margin
  const lastAncestorBottomY = ancestors.length > 0
    ? ancestors[ancestors.length - 1].y + ancestors[ancestors.length - 1].fontSize * 0.3
    : chainStartY;
  const familyNameY = lastAncestorBottomY + 60;

  // Heritage block
  const heritageY = familyNameY + 52;
  const heritageBottom = heritageY + HERITAGE_H;

  // Dynamic canvas height
  const H = heritageBottom + 40 + FOOTER_H;

  // ══════════════════════════════════════
  // PASS 2: Create canvas and draw
  // ══════════════════════════════════════

  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);
  ctx.direction = 'rtl';

  // ── CREAM BACKGROUND ──
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, C.cream);
  bgGrad.addColorStop(1, C.creamDark);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ══════════════════════════════════════
  // SECTION 1: HEADER (0 → 220)
  // ══════════════════════════════════════
  ctx.fillStyle = C.greenDeep;
  ctx.fillRect(0, 0, W, HEADER_H);

  ctx.fillStyle = C.gold;
  ctx.fillRect(0, 0, W, 5);

  drawDotPattern(ctx, 0, 5, W, HEADER_H - 5);
  drawTreeIcon(ctx, W / 2, 55, 44);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = C.white;
  ctx.font = `bold 52px ${FONT}`;
  ctx.fillText('بـوابـة تـراث الخـنـيـنـي', W / 2, 115);

  ctx.fillStyle = C.goldMid;
  ctx.font = `28px ${FONT}`;
  ctx.fillText('فـرع الزلـفـي', W / 2, 152);

  drawGoldSeparator(ctx, 178, W, 200);

  const fadeGrad = ctx.createLinearGradient(0, 180, 0, 220);
  fadeGrad.addColorStop(0, C.greenDeep);
  fadeGrad.addColorStop(1, C.cream);
  ctx.fillStyle = fadeGrad;
  ctx.fillRect(0, 180, W, 40);

  // ══════════════════════════════════════
  // SECTION 2: PERSON CARD
  // ══════════════════════════════════════
  const cardW = 760;
  const cardX = (W - cardW) / 2;

  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.08)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  roundedRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Border
  roundedRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.strokeStyle = branchColor + '99';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Name — Bug 5 fix: auto-shrink to fit
  const firstName = chain[0].name.split(' ')[0];
  const displayName = applyTatweelCanvas(firstName);
  let subjectFontSize = 72;
  ctx.font = `bold ${subjectFontSize}px ${FONT}`;
  while (ctx.measureText(displayName).width > 680 && subjectFontSize > 40) {
    subjectFontSize -= 4;
    ctx.font = `bold ${subjectFontSize}px ${FONT}`;
  }
  ctx.fillStyle = C.textDark;
  ctx.fillText(displayName, W / 2, cardY + 70);

  // Branch pill
  if (branchLabel) {
    ctx.font = `bold 22px ${FONT}`;
    const tw = ctx.measureText(branchLabel).width;
    const pillW = tw + 56;
    const pillH = 36;
    const pillX = (W - pillW) / 2;
    const pillY = cardY + 105;

    roundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fillStyle = branchColor + '20';
    ctx.fill();

    ctx.fillStyle = branchColor;
    ctx.fillText(branchLabel, W / 2, pillY + pillH / 2);
  }

  // Generation badge
  ctx.font = `18px ${FONT}`;
  ctx.fillStyle = C.textMuted;
  ctx.textAlign = 'right';
  ctx.fillText(`الجيل ${toArabic(depth)}`, cardX + cardW - 28, cardY + 28);
  ctx.textAlign = 'center';

  // ══════════════════════════════════════
  // SECTION 3: CHAIN
  // ══════════════════════════════════════

  // Vertical dashed line
  if (ancestors.length > 0) {
    const lineEndY = ancestors[ancestors.length - 1].y + 10;
    ctx.save();
    ctx.strokeStyle = C.goldMid;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 12]);
    ctx.beginPath();
    ctx.moveTo(W / 2, chainStartY - 15);
    ctx.lineTo(W / 2, lineEndY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Draw ancestors with pre-computed positions
  for (const anc of ancestors) {
    // Gold dot at computed midpoint
    ctx.beginPath();
    ctx.arc(W / 2, anc.dotY, 8, 0, Math.PI * 2);
    ctx.fillStyle = C.gold;
    ctx.fill();

    // Name
    ctx.font = `bold ${anc.fontSize}px ${FONT}`;
    ctx.fillStyle = `rgba(26,58,42,${anc.opacity})`;
    ctx.textAlign = 'center';
    ctx.fillText(anc.displayName, W / 2, anc.y);
  }

  // ══════════════════════════════════════
  // SECTION 4: FAMILY NAME
  // ══════════════════════════════════════
  ctx.fillStyle = C.gold;
  ctx.font = `bold 76px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('◆ الخـنـيـنـي ◆', W / 2, familyNameY);

  drawGoldSeparator(ctx, familyNameY + 30, W, 260);

  // ══════════════════════════════════════
  // SECTION 5: HERITAGE BLOCK
  // ══════════════════════════════════════
  ctx.fillStyle = 'rgba(201,168,76,0.07)';
  ctx.fillRect(0, heritageY, W, HERITAGE_H);

  ctx.fillStyle = C.goldLight;
  ctx.fillRect(0, heritageY, W, 1);
  ctx.fillRect(0, heritageY + HERITAGE_H - 1, W, 1);

  roundedRect(ctx, 72, heritageY + 45, 5, 90, 2.5);
  ctx.fillStyle = C.goldMid;
  ctx.fill();

  roundedRect(ctx, W - 77, heritageY + 45, 5, 90, 2.5);
  ctx.fillStyle = C.goldMid;
  ctx.fill();

  ctx.textAlign = 'center';

  ctx.fillStyle = C.textDark;
  ctx.font = `bold 26px ${FONT}`;
  ctx.fillText('مـن بـنـي العنبر بن عمرو بن تميم', W / 2, heritageY + 58);

  ctx.fillStyle = C.textMuted;
  ctx.font = `24px ${FONT}`;
  ctx.fillText('ومـحمد بن سلامة أول من حمل اللقب', W / 2, heritageY + 102);

  ctx.fillStyle = C.textLight;
  ctx.font = `italic 22px ${FONT}`;
  ctx.fillText('جـذورها في نجد — إرث ممتد عبر الأجيال', W / 2, heritageY + 146);

  // ══════════════════════════════════════
  // SECTION 6: FOOTER
  // ══════════════════════════════════════
  const footerY = H - FOOTER_H;

  const footGrad = ctx.createLinearGradient(0, footerY, 0, H);
  footGrad.addColorStop(0, 'transparent');
  footGrad.addColorStop(0.4, C.greenDeep);
  footGrad.addColorStop(1, C.greenDeep);
  ctx.fillStyle = footGrad;
  ctx.fillRect(0, footerY, W, FOOTER_H);

  ctx.textAlign = 'center';
  ctx.fillStyle = C.goldMid;
  ctx.font = `26px ${FONT}`;
  ctx.fillText(`سلسلة نسب من ${toArabic(chain.length)} أجيال`, W / 2, H - 90);

  ctx.fillStyle = C.goldMid;
  ctx.font = `bold 24px ${FONT}`;
  ctx.fillText('بـوابـة تـراث الخـنـيـنـي — حـفـظ الإرث للأجـيـال', W / 2, H - 50);

  ctx.fillStyle = C.gold;
  ctx.fillRect(0, H - 5, W, 5);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

export async function downloadLineageCard(chain: FamilyMember[], memberId: string) {
  const url = `${window.location.origin}/person/${memberId}`;
  const blob = await generateLineageImage(chain, url);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `نسب-${chain[0].name.split(' ')[0]}.png`;
  a.click();
  URL.revokeObjectURL(a.href);
}
