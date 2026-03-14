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
  // Phase 1: Prepare
  expandAllFn();
  await sleep(800);

  rfInstance?.fitView({ duration: 0, padding: 0.05 });
  await sleep(300);

  // Phase 2: Capture
  const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (!viewport) throw new Error('React Flow viewport not found');

  const png = await toPng(viewport, {
    pixelRatio: 2,
    backgroundColor: '#F6F4F0',
  });

  // Phase 3: Build PDF
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
  await loadTajawal();

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a2',
  });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  // ── PAGE 1: COVER ──
  pdf.setFillColor(247, 243, 238);
  pdf.rect(0, 0, W, H, 'F');

  // Top gold line
  pdf.setDrawColor(201, 168, 76);
  pdf.setLineWidth(1.5);
  pdf.line(20, 8, W - 20, 8);

  // Bottom gold line
  pdf.line(20, H - 8, W - 20, H - 8);

  // Border frame
  pdf.setDrawColor(201, 168, 76);
  pdf.setLineWidth(0.5);
  pdf.rect(10, 10, W - 20, H - 20);

  // Title
  pdf.setFontSize(36);
  pdf.setTextColor(26, 58, 42);
  pdf.text('بوابة تراث الخنيني', W / 2, H * 0.35, { align: 'center' });

  // Subtitle
  pdf.setFontSize(22);
  pdf.setTextColor(201, 168, 76);
  pdf.text('فرع الزلفي', W / 2, H * 0.42, { align: 'center' });

  // Branch label
  if (options.mode === 'branch' && options.branchLabel) {
    pdf.setFontSize(18);
    pdf.text(options.branchLabel, W / 2, H * 0.48, { align: 'center' });
  }

  // Gold separator
  pdf.setDrawColor(201, 168, 76);
  pdf.setLineWidth(0.8);
  pdf.line(W / 2 - 40, H * 0.52, W / 2 + 40, H * 0.52);

  // Statistics
  const allMembers = getAllMembers();
  const displayMembers =
    options.mode === 'branch' && options.branchId
      ? allMembers.filter(m => {
          const b = getBranch(m.id);
          return b?.pillarId === options.branchId;
        })
      : allMembers;

  const stats = [
    { label: 'إجمالي الأفراد', value: displayMembers.length.toLocaleString('ar-SA') },
    { label: 'الأجيال', value: '٧' },
    { label: 'الفروع', value: options.mode === 'full' ? '٣' : '١' },
  ];

  const statsY = H * 0.6;
  const statsSpacing = W / (stats.length + 1);

  stats.forEach((stat, i) => {
    const x = statsSpacing * (i + 1);
    pdf.setFontSize(28);
    pdf.setTextColor(26, 58, 42);
    pdf.text(stat.value, x, statsY, { align: 'center' });

    pdf.setFontSize(14);
    pdf.setTextColor(100, 120, 100);
    pdf.text(stat.label, x, statsY + 10, { align: 'center' });
  });

  // Hijri date
  const dateStr = new Date().toLocaleDateString('ar-SA-u-ca-islamic', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  pdf.setFontSize(12);
  pdf.setTextColor(150, 150, 140);
  pdf.text(`تاريخ الإصدار: ${dateStr}`, W / 2, H * 0.8, { align: 'center' });

  // Branding
  pdf.setFontSize(14);
  pdf.setTextColor(201, 168, 76);
  pdf.text('شجرة عائلة الخنيني — حفظ الإرث للأجيال القادمة', W / 2, H * 0.88, {
    align: 'center',
  });

  // ── PAGE 2: TREE IMAGE ──
  pdf.addPage([594, 420], 'landscape');

  const page2W = pdf.internal.pageSize.getWidth();
  const page2H = pdf.internal.pageSize.getHeight();

  // Background
  pdf.setFillColor(246, 244, 240);
  pdf.rect(0, 0, page2W, page2H, 'F');

  // Page title
  pdf.setFontSize(16);
  pdf.setTextColor(26, 58, 42);
  const pageTitle =
    options.mode === 'branch' && options.branchLabel
      ? `شجرة ${options.branchLabel}`
      : 'شجرة عائلة الخنيني — الشجرة الكاملة';
  pdf.text(pageTitle, page2W / 2, 12, { align: 'center' });

  // Gold line below title
  pdf.setDrawColor(201, 168, 76);
  pdf.setLineWidth(0.5);
  pdf.line(20, 16, page2W - 20, 16);

  // Tree image
  const imgMargin = 20;
  const imgX = imgMargin;
  const imgY = 20;
  const imgW = page2W - imgMargin * 2;
  const imgH = page2H - 28;

  pdf.addImage(treeImageDataUrl, 'PNG', imgX, imgY, imgW, imgH, undefined, 'FAST');

  // Border around tree image
  pdf.setDrawColor(201, 168, 76);
  pdf.setLineWidth(0.3);
  pdf.rect(imgX, imgY, imgW, imgH);

  // Save
  const filename =
    options.mode === 'branch' && options.branchLabel
      ? `شجرة-${options.branchLabel}.pdf`
      : 'شجرة-الخنيني-الكاملة.pdf';

  pdf.save(filename);
}
