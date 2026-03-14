import type { FamilyMember } from "@/data/familyData";
import { getBranch } from "@/utils/branchUtils";

const COLORS = {
  background: "#F7F3EE",
  backgroundDark: "#EDE5D8",
  gold: "#C9A84C",
  goldLight: "rgba(201,168,76,0.15)",
  goldMid: "rgba(201,168,76,0.4)",
  textDark: "#1a3a2a",
  textMuted: "rgba(26,58,42,0.5)",
  textLight: "rgba(26,58,42,0.3)",
  white: "#FFFFFF",
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

function font(style: string): string {
  return style.replace(/Tajawal/g, "'Tajawal', 'Arial', sans-serif");
}

function drawGoldLine(ctx: CanvasRenderingContext2D, y: number, w: number, pad: number, h: number) {
  const grad = ctx.createLinearGradient(pad, 0, w - pad, 0);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.5, COLORS.gold);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(pad, y, w - pad * 2, h);
}

function drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.restore();
}

export async function generateLineageImage(
  chain: FamilyMember[],
  _url: string
): Promise<Blob> {
  await loadFont();

  const W = 1080;
  const H = 1350;
  const SCALE = 2;
  const PAD = 40;

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, COLORS.background);
  bgGrad.addColorStop(1, COLORS.backgroundDark);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle border frame
  ctx.strokeStyle = COLORS.goldMid;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // Top gold line
  drawGoldLine(ctx, 18, W, PAD, 4);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // ── HEADER ──
  ctx.fillStyle = COLORS.textDark;
  ctx.font = font("bold 26px Tajawal");
  ctx.fillText("بوابة تراث الخنيني", W / 2, 80);

  ctx.fillStyle = COLORS.textMuted;
  ctx.font = font("18px Tajawal");
  ctx.fillText("فرع الزلفي", W / 2, 110);

  // Branch pill
  const branch = getBranch(chain[0]?.id ?? "");
  const branchColor = getBranchColor(branch?.pillarId);
  const branchLabel = branch?.label || "";

  if (branchLabel) {
    ctx.font = font("bold 16px Tajawal");
    const tw = ctx.measureText(branchLabel).width;
    const pillW = tw + 40;
    const pillH = 36;
    const pillX = (W - pillW) / 2;
    const pillY = 130;

    // Pill background
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fillStyle = branchColor + "26"; // ~15% opacity
    ctx.fill();
    ctx.strokeStyle = branchColor + "99"; // ~60% opacity
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = branchColor;
    ctx.fillText(branchLabel, W / 2, pillY + pillH / 2);
  }

  // Gold separator
  drawGoldLine(ctx, 175, W, W / 2 - 100, 1);
  // Fix: draw centered 200px line
  const sepGrad = ctx.createLinearGradient(W / 2 - 100, 0, W / 2 + 100, 0);
  sepGrad.addColorStop(0, "transparent");
  sepGrad.addColorStop(0.5, COLORS.goldMid);
  sepGrad.addColorStop(1, "transparent");
  ctx.fillStyle = sepGrad;
  ctx.fillRect(W / 2 - 100, 175, 200, 1);

  // ── MAIN CONTENT: NAME CHAIN ──
  const topY = 210;
  const bottomY = 1100;
  const availableH = bottomY - topY;

  // Build lines: first name, then "ابن/بنت Name" for ancestors, then "الخنيني"
  const totalLines = chain.length + 1; // +1 for الخنيني
  const lineSpacing = Math.min(120, availableH / (totalLines * 1.3));
  const totalContentH = (totalLines - 1) * lineSpacing;
  const startY = topY + (availableH - totalContentH) / 2;

  // Vertical dashed line coordinates
  const lineStartY = startY + 30;
  const lineEndY = startY + totalContentH - 30;

  // Draw vertical dashed center line
  ctx.save();
  ctx.strokeStyle = COLORS.goldMid;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 10]);
  ctx.beginPath();
  ctx.moveTo(W / 2, lineStartY);
  ctx.lineTo(W / 2, lineEndY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Draw names
  for (let i = 0; i < chain.length; i++) {
    const y = startY + i * lineSpacing;
    const member = chain[i];
    const firstName = member.name.split(" ")[0];

    if (i === 0) {
      // First person — large, prominent
      ctx.beginPath();
      ctx.arc(W / 2, y + 28, 8, 0, Math.PI * 2);
      ctx.fillStyle = branchColor;
      ctx.fill();

      ctx.fillStyle = COLORS.textDark;
      ctx.font = font("bold 44px Tajawal");
      ctx.fillText(firstName, W / 2, y);
    } else {
      // Ancestor — connector text + name
      const connectorY = y - lineSpacing * 0.35;
      const connectorText = chain[i].gender === "F" ? "بنت" : "ابن";

      // Small gold dot
      ctx.beginPath();
      ctx.arc(W / 2, connectorY, 5, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.gold + "80";
      ctx.fill();

      // Connector text
      ctx.fillStyle = COLORS.gold + "99";
      ctx.font = font("italic 16px Tajawal");
      ctx.fillText(connectorText, W / 2, connectorY + 18);

      // Ancestor name with fading opacity
      const opacity = Math.max(0.5, 0.9 - i * 0.08);
      ctx.fillStyle = `rgba(26,58,42,${opacity})`;
      ctx.font = font("bold 30px Tajawal");
      ctx.fillText(firstName, W / 2, y);
    }
  }

  // Last line: "الخنيني" with diamonds
  const lastY = startY + chain.length * lineSpacing;
  ctx.fillStyle = COLORS.gold;
  ctx.font = font("bold 48px Tajawal");
  const familyName = "الخنيني";
  ctx.fillText(familyName, W / 2, lastY);

  // Diamonds flanking
  const nameW = ctx.measureText(familyName).width;
  drawDiamond(ctx, W / 2 - nameW / 2 - 20, lastY, 8);
  drawDiamond(ctx, W / 2 + nameW / 2 + 20, lastY, 8);

  // ── FOOTER ──
  // Gold separator
  drawGoldLine(ctx, 1110, W, W / 2 - 100, 1);
  ctx.fillStyle = sepGrad;
  ctx.fillRect(W / 2 - 100, 1110, 200, 1);

  // Generation count
  const genNum = chain.length.toLocaleString("ar-SA");
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = font("20px Tajawal");
  ctx.fillText(`سلسلة نسب من ${genNum} أجيال`, W / 2, 1160);

  // Branding
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = font("bold 18px Tajawal");
  ctx.fillText("بوابة تراث الخنيني — حفظ الإرث للأجيال", W / 2, 1200);

  // Bottom gold line
  drawGoldLine(ctx, H - 22, W, PAD, 4);

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
