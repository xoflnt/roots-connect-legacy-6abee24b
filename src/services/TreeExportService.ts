import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { getAllMembers } from './familyService';
import { getBranch } from '../utils/branchUtils';

export interface ExportOptions {
  mode: 'full' | 'branch';
  branchId?: string;
  branchLabel?: string;
}

export async function exportTreeAsPDF(
  rfInstance: any,
  expandAllFn: () => void,
  options: ExportOptions
): Promise<void> {
  // Phase 1: Expand all nodes
  expandAllFn();
  await sleep(5000);

  // Phase 2: Fit view for full coverage
  rfInstance?.fitView({ duration: 0, padding: 0.05 });
  await sleep(2000);

  // Phase 3: Capture the tree viewport
  const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (!viewport) throw new Error('React Flow viewport not found');

  // Extra settle time before capture
  await sleep(2000);

  let png: string;
  try {
    png = await toPng(viewport, {
      pixelRatio: 3,
      backgroundColor: '#F6F4F0',
      skipFonts: true,
      filter: (node: Element) => {
        if (node.tagName === 'LINK') return false;
        if (node.tagName === 'STYLE' &&
            node.textContent?.includes('fonts.googleapis')) {
          return false;
        }
        return true;
      },
    });
  } catch (err) {
    console.warn('toPng attempt 1 failed, retrying with lower quality:', err);
    png = await toPng(viewport, {
      pixelRatio: 2,
      backgroundColor: '#F6F4F0',
      skipFonts: true,
    });
  }

  // Phase 4: Build PDF
  await buildPDF(png, options);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadTajawal(): Promise<void> {
  try {
    const font = new FontFace(
      'Tajawal',
      'url(https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1nzSBC45I.woff2)'
    );
    await font.load();
    document.fonts.add(font);
  } catch {
    /* fallback to system font */
  }
}

async function buildPDF(
  treeImageDataUrl: string,
  options: ExportOptions
): Promise<void> {
  const coverCanvas = await drawCoverCanvas(options);
  const coverDataUrl = coverCanvas.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a2',
  });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  // Page 1: Cover (Canvas image — Arabic renders correctly)
  pdf.addImage(coverDataUrl, 'PNG', 0, 0, W, H, undefined, 'SLOW');

  // Page 2: Tree image
  pdf.addPage([594, 420], 'landscape');
  const p2W = pdf.internal.pageSize.getWidth();
  const p2H = pdf.internal.pageSize.getHeight();

  pdf.addImage(treeImageDataUrl, 'PNG', 5, 5,
               p2W - 10, p2H - 10, undefined, 'SLOW');

  const filename = options.mode === 'branch' && options.branchLabel
    ? `شجرة-${options.branchLabel}.pdf`
    : 'شجرة-الخنيني-الكاملة.pdf';
  pdf.save(filename);
}

async function drawCoverCanvas(
  options: ExportOptions
): Promise<HTMLCanvasElement> {
  await loadTajawal();

  const SCALE = 3;
  const W = 1587;
  const H = 1123;

  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#F7F3EE');
  grad.addColorStop(1, '#EDE5D8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Top + bottom gold lines
  const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
  lineGrad.addColorStop(0, 'transparent');
  lineGrad.addColorStop(0.5, '#C9A84C');
  lineGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = lineGrad;
  ctx.fillRect(0, 0, W, 5);
  ctx.fillRect(0, H - 5, W, 5);

  // Outer border frame
  ctx.strokeStyle = 'rgba(201,168,76,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // Inner border frame (double border effect)
  ctx.strokeStyle = 'rgba(201,168,76,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(26, 26, W - 52, H - 52);

  // Subtle dot background pattern
  ctx.fillStyle = 'rgba(201,168,76,0.05)';
  for (let x = 40; x < W; x += 40) {
    for (let y = 40; y < H; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Simple tree icon (top center)
  ctx.fillStyle = 'rgba(26,58,42,0.12)';
  ctx.beginPath();
  ctx.moveTo(W / 2, H * 0.07);
  ctx.lineTo(W / 2 - 30, H * 0.15);
  ctx.lineTo(W / 2 + 30, H * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(W / 2, H * 0.11);
  ctx.lineTo(W / 2 - 44, H * 0.21);
  ctx.lineTo(W / 2 + 44, H * 0.21);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(W / 2, H * 0.15);
  ctx.lineTo(W / 2 - 56, H * 0.27);
  ctx.lineTo(W / 2 + 56, H * 0.27);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(W / 2 - 9, H * 0.27, 18, 22);

  // Main title
  ctx.font = 'bold 58px Tajawal, Arial';
  ctx.fillStyle = '#1a3a2a';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillText('بوابة تراث الخنيني', W / 2, H * 0.40);

  // Subtitle
  ctx.font = '34px Tajawal, Arial';
  ctx.fillStyle = '#C9A84C';
  ctx.fillText('فرع الزلفي', W / 2, H * 0.47);

  // Branch label (if specific branch export)
  if (options.mode === 'branch' && options.branchLabel) {
    const branchColor =
      options.branchId === '300' ? '#16a34a' :
      options.branchId === '200' ? '#C9A84C' :
      options.branchId === '400' ? '#ea580c' : '#C9A84C';

    const pillW = 220;
    const pillH = 44;
    const pillX = W / 2 - pillW / 2;
    const pillY = H * 0.505;
    ctx.fillStyle = branchColor + '18';
    coverRoundRect(ctx, pillX, pillY, pillW, pillH, 22);
    ctx.fill();
    ctx.strokeStyle = branchColor + '60';
    ctx.lineWidth = 1.5;
    coverRoundRect(ctx, pillX, pillY, pillW, pillH, 22);
    ctx.stroke();

    ctx.font = 'bold 24px Tajawal, Arial';
    ctx.fillStyle = branchColor;
    ctx.fillText(options.branchLabel, W / 2, pillY + 30);
  }

  // Gold separator line
  const sepGrad = ctx.createLinearGradient(W / 2 - 180, 0, W / 2 + 180, 0);
  sepGrad.addColorStop(0, 'transparent');
  sepGrad.addColorStop(0.3, '#C9A84C');
  sepGrad.addColorStop(0.7, '#C9A84C');
  sepGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = sepGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const sepY = options.mode === 'branch' ? H * 0.60 : H * 0.55;
  ctx.moveTo(W / 2 - 180, sepY);
  ctx.lineTo(W / 2 + 180, sepY);
  ctx.stroke();

  // Statistics boxes
  const allMembers = getAllMembers();
  const displayMembers = options.mode === 'branch' && options.branchId
    ? allMembers.filter(m => getBranch(m.id)?.pillarId === options.branchId)
    : allMembers;

  const stats = [
    { label: 'إجمالي الأفراد', value: displayMembers.length.toLocaleString('ar-SA') },
    { label: 'عدد الأجيال', value: '٧' },
    { label: 'الفروع الرئيسية', value: options.mode === 'full' ? '٣' : '١' },
  ];

  const statsBaseY = H * 0.68;
  const spacing = W / (stats.length + 1);

  stats.forEach((stat, i) => {
    const x = spacing * (i + 1);
    const boxW = 180;
    const boxH = 100;

    ctx.fillStyle = 'rgba(201,168,76,0.07)';
    coverRoundRect(ctx, x - boxW / 2, statsBaseY - 55, boxW, boxH, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,168,76,0.35)';
    ctx.lineWidth = 1.5;
    coverRoundRect(ctx, x - boxW / 2, statsBaseY - 55, boxW, boxH, 16);
    ctx.stroke();

    ctx.font = 'bold 40px Tajawal, Arial';
    ctx.fillStyle = '#1a3a2a';
    ctx.textAlign = 'center';
    ctx.fillText(stat.value, x, statsBaseY - 10);

    ctx.font = '18px Tajawal, Arial';
    ctx.fillStyle = 'rgba(26,58,42,0.55)';
    ctx.fillText(stat.label, x, statsBaseY + 22);
  });

  // Hijri date
  const dateStr = new Date().toLocaleDateString('ar-SA-u-ca-islamic', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  ctx.font = '20px Tajawal, Arial';
  ctx.fillStyle = 'rgba(26,58,42,0.35)';
  ctx.textAlign = 'center';
  ctx.fillText(`تاريخ الإصدار: ${dateStr}`, W / 2, H * 0.83);

  // Branding tagline
  ctx.font = 'bold 22px Tajawal, Arial';
  ctx.fillStyle = 'rgba(201,168,76,0.75)';
  ctx.fillText(
    'شجرة عائلة الخنيني — حفظ الإرث للأجيال القادمة',
    W / 2, H * 0.90
  );

  return canvas;
}

function coverRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
): void {
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
