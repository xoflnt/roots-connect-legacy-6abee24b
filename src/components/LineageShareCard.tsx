import type { FamilyMember } from "@/data/familyData";

export async function generateLineageImage(
  chain: FamilyMember[],
  url: string
): Promise<Blob> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background gradient (sandy/green heritage)
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#1a3a2a");
  grad.addColorStop(0.4, "#1e4d35");
  grad.addColorStop(1, "#0f2a1e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative border
  ctx.strokeStyle = "rgba(196, 164, 95, 0.4)";
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeRect(50, 50, W - 100, H - 100);

  // Corner ornaments
  const ornSize = 30;
  ctx.strokeStyle = "rgba(196, 164, 95, 0.6)";
  ctx.lineWidth = 2;
  for (const [x, y] of [[50, 50], [W - 50, 50], [50, H - 50], [W - 50, H - 50]]) {
    ctx.beginPath();
    ctx.arc(x, y, ornSize, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Top decoration line
  const topLineY = 120;
  ctx.strokeStyle = "rgba(196, 164, 95, 0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, topLineY);
  ctx.lineTo(W - 100, topLineY);
  ctx.stroke();

  // Title
  ctx.textAlign = "center";
  ctx.fillStyle = "#c4a45f";
  ctx.font = "bold 42px 'Tajawal', 'Arial', sans-serif";
  ctx.fillText("بوابة آل الخنيني", W / 2, 180);

  // Subtitle
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "28px 'Tajawal', 'Arial', sans-serif";
  ctx.fillText("سلسلة النسب", W / 2, 230);

  // Decorative separator
  ctx.strokeStyle = "rgba(196, 164, 95, 0.4)";
  ctx.beginPath();
  ctx.moveTo(W / 2 - 150, 260);
  ctx.lineTo(W / 2 + 150, 260);
  ctx.stroke();

  // Build lineage text
  const lineageText = chain.map((m) => m.name.split(" ")[0]).join(" بن ");
  
  // Full name at top
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px 'Tajawal', 'Arial', sans-serif";
  ctx.textAlign = "center";
  ctx.direction = "rtl";
  
  // Wrap the person's full name
  ctx.fillText(chain[0].name, W / 2, 330);

  // Lineage chain
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "32px 'Tajawal', 'Arial', sans-serif";
  
  // Word wrap the lineage
  const maxWidth = W - 160;
  const words = lineageText.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const lineHeight = 52;
  const startY = 420;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], W / 2, startY + i * lineHeight);
  }

  // Generation count
  const genY = startY + lines.length * lineHeight + 60;
  ctx.fillStyle = "#c4a45f";
  ctx.font = "bold 34px 'Tajawal', 'Arial', sans-serif";
  const genNum = chain.length.toLocaleString("ar-SA");
  ctx.fillText(`${genNum} أجيال`, W / 2, genY);

  // Bottom separator
  ctx.strokeStyle = "rgba(196, 164, 95, 0.4)";
  ctx.beginPath();
  ctx.moveTo(W / 2 - 150, H - 180);
  ctx.lineTo(W / 2 + 150, H - 180);
  ctx.stroke();

  // URL at bottom
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "22px 'Tajawal', 'Arial', sans-serif";
  ctx.fillText(url, W / 2, H - 130);

  // Branding
  ctx.fillStyle = "rgba(196, 164, 95, 0.6)";
  ctx.font = "bold 24px 'Tajawal', 'Arial', sans-serif";
  ctx.fillText("شجرة عائلة الخنيني — حفظ الإرث للأجيال", W / 2, H - 85);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

export async function downloadLineageCard(chain: FamilyMember[], memberId: string) {
  const url = `${window.location.origin}/person/${memberId}`;
  const blob = await generateLineageImage(chain, url);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `نسب-${chain[0].name}.png`;
  a.click();
  URL.revokeObjectURL(a.href);
}
