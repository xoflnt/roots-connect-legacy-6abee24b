import type { FamilyMember } from "@/data/familyData";
import { getBranch } from "@/utils/branchUtils";

const COLORS = {
  bg1: "#F7F3EE",
  bg2: "#EDE5D8",
  gold: "#C9A84C",
  goldLight: "rgba(201,168,76,0.15)",
  goldMid: "rgba(201,168,76,0.4)",
  textDark: "#1a3a2a",
  textMuted: "rgba(26,58,42,0.5)",
  textLight: "rgba(26,58,42,0.28)",
  branchNasser: "#16a34a",
  branchMohammad: "#C9A84C",
  branchAbdulaziz: "#ea580c",
};

function getBranchColor(pillarId: string | undefined): string {
  if (pillarId === "300") return COLORS.branchNasser;
  if (pillarId === "200") return COLORS.branchMohammad;
  if (pillarId === "400") return COLORS.branchAbdulaziz;
  return COLORS.gold;
}

async function loadFont() {
  try {
    const font = new FontFace(
      "Tajawal",
      "url(https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1nzSBC45I.woff2)"
    );
    await font.load();
    document.fonts.add(font);
  } catch {
    /* fallback */
  }
}

function drawGoldLine(ctx: CanvasRenderingContext2D, y: number, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.15, COLORS.gold);
  grad.addColorStop(0.85, COLORS.gold);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, y, w, h);
}

function drawCenteredSeparator(ctx: CanvasRenderingContext2D, y: number, w: number, sepW: number) {
  const grad = ctx.createLinearGradient(w / 2 - sepW / 2, 0, w / 2 + sepW / 2, 0);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.5, COLORS.goldMid);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(w / 2 - sepW / 2, y, sepW, 1);
}

function drawTreeIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.fillStyle = "rgba(201,168,76,0.6)";
  // Triangle
  ctx.beginPath();
  ctx.moveTo(cx, cy - 18);
  ctx.lineTo(cx - 14, cy + 6);
  ctx.lineTo(cx + 14, cy + 6);
  ctx.closePath();
  ctx.fill();
  // Trunk
  ctx.fillRect(cx - 3, cy + 6, 6, 10);
  ctx.restore();
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
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

function toArabic(n: number): string {
  return n.toLocaleString("ar-SA");
}

export async function generateLineageImage(
  chain: FamilyMember[],
  _url: string,
  isLoggedIn: boolean = false
): Promise<Blob> {
  await loadFont();

  const W = 1080;
  const H = 1440;
  const SCALE = 2;
  const FONT = "Tajawal, Arial";

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  ctx.direction = "rtl";

  // ── BACKGROUND ──
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, COLORS.bg1);
  bgGrad.addColorStop(1, COLORS.bg2);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── HEADER (0 → 160) ──
  drawGoldLine(ctx, 0, W, 4);
  drawTreeIcon(ctx, W / 2, 55);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = COLORS.textDark;
  ctx.font = `bold 28px ${FONT}`;
  ctx.fillText("بوابة تراث الخنيني", W / 2, 100);

  ctx.fillStyle = COLORS.textMuted;
  ctx.font = `18px ${FONT}`;
  ctx.fillText("فرع الزلفي", W / 2, 128);

  drawCenteredSeparator(ctx, 155, W, 200);

  // ── PERSON CARD (175 → 310) ──
  const branch = getBranch(chain[0]?.id ?? "");
  const branchColor = getBranchColor(branch?.pillarId);
  const branchLabel = branch?.label || "";
  const depth = chain.length;

  const cardW = 560;
  const cardH = 115;
  const cardX = (W - cardW) / 2;
  const cardY = 175;

  // Card shadow
  ctx.shadowColor = "rgba(0,0,0,0.06)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  roundedRect(ctx, cardX, cardY, cardW, cardH, 16);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Card border
  roundedRect(ctx, cardX, cardY, cardW, cardH, 16);
  ctx.strokeStyle = branchColor + "66"; // 40%
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Subject name
  const firstName = chain[0].name.split(" ")[0];
  ctx.fillStyle = COLORS.textDark;
  ctx.font = `bold 42px ${FONT}`;
  ctx.fillText(firstName, W / 2, cardY + 48);

  // Branch pill
  if (branchLabel) {
    ctx.font = `bold 14px ${FONT}`;
    const tw = ctx.measureText(branchLabel).width;
    const pillW = tw + 40;
    const pillH = 28;
    const pillX = (W - pillW) / 2;
    const pillY = cardY + 72;

    roundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fillStyle = branchColor + "18";
    ctx.fill();

    ctx.fillStyle = branchColor;
    ctx.fillText(branchLabel, W / 2, pillY + pillH / 2);
  }

  // Generation badge (top-left of card)
  ctx.font = `12px ${FONT}`;
  ctx.fillStyle = COLORS.textMuted;
  ctx.textAlign = "right";
  ctx.fillText(`الجيل ${toArabic(depth)}`, cardX + cardW - 16, cardY + 18);
  ctx.textAlign = "center";

  // ── CHAIN (310 → dynamic) ──
  const chainStartY = cardY + cardH + 20; // 310
  const familyNameY_max = H - 260; // leave room for heritage + footer
  const ancestorCount = chain.length - 1; // chain[1..n-1]
  const availableH = familyNameY_max - chainStartY - 60;

  const lineHeight = Math.max(70, Math.min(110, ancestorCount > 0 ? availableH / ancestorCount : 110));
  const chainContentH = ancestorCount * lineHeight;
  const chainCenterStartY = chainStartY + (availableH - chainContentH) / 2;

  // ── VERTICAL DASHED LINE ──
  const dashStartY = cardY + cardH + 5;
  const familyNameY = chainCenterStartY + chainContentH + 30;
  const dashEndY = familyNameY - 30;

  if (dashEndY > dashStartY) {
    ctx.save();
    ctx.strokeStyle = COLORS.goldMid;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.moveTo(W / 2, dashStartY);
    ctx.lineTo(W / 2, dashEndY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ── DRAW ANCESTORS ──
  for (let i = 1; i < chain.length; i++) {
    const y = chainCenterStartY + (i - 1) * lineHeight;
    const member = chain[i];
    const name = member.name.split(" ")[0];

    // Connector dot
    ctx.beginPath();
    ctx.arc(W / 2, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.goldMid;
    ctx.fill();

    // Connector text
    const connectorText = member.gender === "F" ? "بنت" : "ابن";
    ctx.fillStyle = COLORS.goldMid;
    ctx.font = `italic 14px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(connectorText, W / 2, y + 16);

    // Name with decreasing size and opacity
    let fontSize: number;
    let opacity: number;
    if (i === 1) { fontSize = 32; opacity = 0.85; }
    else if (i === 2) { fontSize = 28; opacity = 0.72; }
    else if (i === 3) { fontSize = 24; opacity = 0.60; }
    else { fontSize = 20; opacity = 0.50; }

    ctx.font = `bold ${fontSize}px ${FONT}`;
    ctx.fillStyle = `rgba(26,58,42,${opacity})`;
    ctx.textAlign = "center";
    ctx.fillText(name, W / 2, y + 38);

    // Generation label to the right of name
    const nameW = ctx.measureText(name).width;
    const genLabel = `ج${toArabic(depth - i)}`;
    ctx.font = `11px ${FONT}`;
    ctx.fillStyle = COLORS.textLight;
    ctx.textAlign = "right";
    ctx.fillText(genLabel, W / 2 - nameW / 2 - 12, y + 38);
    ctx.textAlign = "center";
  }

  // ── FAMILY NAME ──
  ctx.fillStyle = COLORS.gold;
  ctx.font = `bold 46px ${FONT}`;
  ctx.fillText("◆ الخنيني ◆", W / 2, familyNameY);

  // ── SEPARATOR ──
  drawCenteredSeparator(ctx, familyNameY + 35, W, 200);

  // ── HERITAGE TEXT BLOCK (bottom-right) ──
  const heritageX = W - 80;
  const heritageBaseY = familyNameY + 70;

  // Gold vertical bar (quote indicator)
  ctx.fillStyle = COLORS.goldMid;
  ctx.fillRect(W - 60, heritageBaseY - 5, 3, 55);

  ctx.textAlign = "right";

  ctx.fillStyle = COLORS.textMuted;
  ctx.font = `13px ${FONT}`;
  ctx.fillText("من بني العنبر بن عمرو بن تميم", heritageX, heritageBaseY);
  ctx.fillText("ومحمد بن سلامة أول من حمل اللقب", heritageX, heritageBaseY + 22);

  ctx.fillStyle = COLORS.textLight;
  ctx.font = `italic 12px ${FONT}`;
  ctx.fillText("جذورها في نجد — إرث ممتد عبر الأجيال", heritageX, heritageBaseY + 46);

  ctx.textAlign = "center";

  // ── FOOTER (last ~120px) ──
  const footerY = H - 100;
  drawCenteredSeparator(ctx, footerY - 20, W, 200);

  // Generation count
  const genNum = toArabic(chain.length);
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = `16px ${FONT}`;
  ctx.fillText(`سلسلة نسب من ${genNum} أجيال`, W / 2, footerY + 10);

  // Branding
  ctx.fillStyle = COLORS.goldMid;
  ctx.font = `bold 15px ${FONT}`;
  ctx.fillText("بوابة تراث الخنيني — حفظ الإرث للأجيال", W / 2, footerY + 40);

  // Bottom gold line
  drawGoldLine(ctx, H - 4, W, 4);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

export async function downloadLineageCard(chain: FamilyMember[], memberId: string) {
  const url = `${window.location.origin}/person/${memberId}`;
  const blob = await generateLineageImage(chain, url);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `نسب-${chain[0].name.split(" ")[0]}.png`;
  a.click();
  URL.revokeObjectURL(a.href);
}
