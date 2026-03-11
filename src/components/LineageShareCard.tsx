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

  // Background gradient
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

  // Title at top
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(196, 164, 95, 0.5)";
  ctx.font = "bold 28px 'Tajawal', 'Arial', sans-serif";
  ctx.fillText("بوابة الخنيني", W / 2, 110);

  // Separator
  ctx.strokeStyle = "rgba(196, 164, 95, 0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 120, 135);
  ctx.lineTo(W / 2 + 120, 135);
  ctx.stroke();

  // Build vertical lines: full name first, then "ابن FirstName" for each ancestor, last line "الخنيني"
  const lines: { text: string; isFirst: boolean; isLast: boolean }[] = [];
  
  // First line: first name only (to avoid duplication with next "ابن" line)
  lines.push({ text: chain[0].name.split(" ")[0], isFirst: true, isLast: false });
  
  // Middle lines: "ابن [first name]"
  for (let i = 1; i < chain.length; i++) {
    const firstName = chain[i].name.split(" ")[0];
    lines.push({ text: `ابن ${firstName}`, isFirst: false, isLast: false });
  }
  
  // Last line: family name
  lines.push({ text: "الخنيني", isFirst: false, isLast: true });

  // Calculate font size dynamically to fill the available space
  const topMargin = 160;
  const bottomMargin = 180;
  const availableHeight = H - topMargin - bottomMargin;
  
  // Calculate line height based on number of lines
  const maxLineHeight = 72;
  const minLineHeight = 32;
  const lineHeight = Math.max(minLineHeight, Math.min(maxLineHeight, availableHeight / lines.length));
  
  // Font sizes
  const totalContentHeight = lines.length * lineHeight;
  const startY = topMargin + (availableHeight - totalContentHeight) / 2 + lineHeight * 0.7;
  
  const baseFontSize = Math.max(22, Math.min(42, lineHeight * 0.7));
  const firstFontSize = Math.min(52, baseFontSize * 1.4);
  const lastFontSize = Math.min(58, baseFontSize * 1.5);

  ctx.textAlign = "center";
  ctx.direction = "rtl";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const y = startY + i * lineHeight;

    if (line.isFirst) {
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${firstFontSize}px 'Tajawal', 'Arial', sans-serif`;
    } else if (line.isLast) {
      ctx.fillStyle = "#c4a45f";
      ctx.font = `bold ${lastFontSize}px 'Tajawal', 'Arial', sans-serif`;
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = `${baseFontSize}px 'Tajawal', 'Arial', sans-serif`;
    }

    ctx.fillText(line.text, W / 2, y);
  }

  // Generation count
  const genY = H - 150;
  ctx.fillStyle = "rgba(196, 164, 95, 0.7)";
  ctx.font = "bold 26px 'Tajawal', 'Arial', sans-serif";
  const genNum = chain.length.toLocaleString("ar-SA");
  ctx.fillText(`${genNum} أجيال`, W / 2, genY);

  // Bottom separator
  ctx.strokeStyle = "rgba(196, 164, 95, 0.3)";
  ctx.beginPath();
  ctx.moveTo(W / 2 - 120, H - 120);
  ctx.lineTo(W / 2 + 120, H - 120);
  ctx.stroke();

  // URL
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "20px 'Tajawal', 'Arial', sans-serif";
  ctx.fillText(url, W / 2, H - 90);

  // Branding
  ctx.fillStyle = "rgba(196, 164, 95, 0.5)";
  ctx.font = "bold 22px 'Tajawal', 'Arial', sans-serif";
  ctx.fillText("شجرة الخنيني — حفظ الإرث للأجيال", W / 2, H - 60);

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
