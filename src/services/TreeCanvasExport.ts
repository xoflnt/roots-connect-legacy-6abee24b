import dagre from 'dagre';
import { getAllMembers, getChildrenOf, isDeceased } from './familyService';
import { getBranch } from '../utils/branchUtils';

const CARD_W = 200;
const CARD_H = 90;
const NODE_SEP = 80;
const RANK_SEP = 140;
const PADDING = 60;
const SCALE = 2;

const COLORS = {
  background: '#F6F4F0',
  cardBg: '#FFFFFF',
  cardBgDeceased: '#F5F5F0',
  borderMale: 'rgba(59,130,246,0.35)',
  borderFemale: 'rgba(236,72,153,0.35)',
  textDark: '#1a3a2a',
  textMuted: '#6b7280',
  textLight: '#9ca3af',
  gold: '#C9A84C',
  male: '#3b82f6',
  female: '#ec4899',
  branchNasser: '#16a34a',
  branchMohammad: '#C9A84C',
  branchAbdulaziz: '#ea580c',
  edgeDefault: 'rgba(100,100,100,0.25)',
};

async function loadTajawal(): Promise<void> {
  try {
    const font = new FontFace(
      'Tajawal',
      'url(https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1nzSBC45I.woff2)'
    );
    await font.load();
    document.fonts.add(font);
  } catch { /* fallback */ }
}

function getBranchColor(memberId: string): string {
  const branch = getBranch(memberId);
  if (!branch) return COLORS.edgeDefault;
  if (branch.pillarId === '300') return COLORS.branchNasser;
  if (branch.pillarId === '200') return COLORS.branchMohammad;
  if (branch.pillarId === '400') return COLORS.branchAbdulaziz;
  return COLORS.gold;
}

function roundedRect(
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

function drawCard(
  ctx: CanvasRenderingContext2D,
  member: any,
  x: number,
  y: number
): void {
  const isMale = member.gender === 'M';
  const deceased = isDeceased(member);
  const branchColor = getBranchColor(member.id);
  const children = getChildrenOf(member.id);

  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.08)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;

  // Card background
  roundedRect(ctx, x, y, CARD_W, CARD_H, 10);
  ctx.fillStyle = deceased ? COLORS.cardBgDeceased : COLORS.cardBg;
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Card border
  roundedRect(ctx, x, y, CARD_W, CARD_H, 10);
  ctx.strokeStyle = isMale ? COLORS.borderMale : COLORS.borderFemale;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Branch color stripe (right edge for RTL)
  ctx.fillStyle = branchColor;
  ctx.globalAlpha = 0.7;
  roundedRect(ctx, x + CARD_W - 4, y + 8, 4, CARD_H - 16, 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Gender dot
  ctx.fillStyle = isMale ? COLORS.male : COLORS.female;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(x + 12, y + 12, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Name
  ctx.font = 'bold 13px Tajawal, Arial';
  ctx.fillStyle = deceased ? COLORS.textMuted : COLORS.textDark;
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';

  const maxW = CARD_W - 24;
  let name = member.name;
  while (ctx.measureText(name).width > maxW && name.length > 4) {
    name = name.slice(0, -1);
  }
  if (name !== member.name) name += '...';
  ctx.fillText(name, x + CARD_W / 2, y + 30);

  // Birth/death year
  if (member.birth_year) {
    ctx.font = '10px Tajawal, Arial';
    ctx.fillStyle = COLORS.textMuted;
    const deathYear = member.death_year || member.Death_year;
    const yearText = deathYear
      ? `${member.birth_year} - ${deathYear} هـ`
      : `${member.birth_year} هـ`;
    ctx.fillText(yearText, x + CARD_W / 2, y + 48);
  }

  // Children count
  if (children.length > 0) {
    ctx.font = '10px Tajawal, Arial';
    ctx.fillStyle = COLORS.textLight;
    ctx.fillText(
      `${children.length.toLocaleString('ar-SA')} أبناء`,
      x + CARD_W / 2,
      y + 64
    );
  }

  // Deceased label
  if (deceased) {
    ctx.font = '9px Tajawal, Arial';
    ctx.fillStyle = COLORS.textLight;
    ctx.fillText('رحمه الله', x + CARD_W / 2, y + 80);
  }
}

function drawEdge(
  ctx: CanvasRenderingContext2D,
  fromX: number, fromY: number,
  toX: number, toY: number,
  color: string
): void {
  const midY = (fromY + toY) / 2;
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.bezierCurveTo(fromX, midY, toX, midY, toX, toY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.45;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export async function generateTreeCanvas(
  filterBranchId?: string
): Promise<Blob> {
  await loadTajawal();

  const allMembers = getAllMembers();
  const memberMap = new Map(allMembers.map(m => [m.id, m]));

  const members = filterBranchId
    ? allMembers.filter(m => getBranch(m.id)?.pillarId === filterBranchId)
    : allMembers;

  const memberIds = new Set(members.map(m => m.id));

  // Build dagre graph
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'TB',
    nodesep: NODE_SEP,
    ranksep: RANK_SEP,
    marginx: PADDING,
    marginy: PADDING,
  });

  members.forEach(m => {
    g.setNode(m.id, { width: CARD_W, height: CARD_H });
  });

  members.forEach(m => {
    if (m.father_id && memberIds.has(m.father_id)) {
      g.setEdge(m.father_id, m.id);
    }
  });

  dagre.layout(g);

  // Calculate bounds
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  g.nodes().forEach(id => {
    const node = g.node(id);
    if (!node) return;
    minX = Math.min(minX, node.x - CARD_W / 2);
    minY = Math.min(minY, node.y - CARD_H / 2);
    maxX = Math.max(maxX, node.x + CARD_W / 2);
    maxY = Math.max(maxY, node.y + CARD_H / 2);
  });

  const canvasW = maxX - minX + PADDING * 2;
  const canvasH = maxY - minY + PADDING * 2;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = canvasW * SCALE;
  canvas.height = canvasH * SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);

  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Dot pattern
  ctx.fillStyle = 'rgba(201,168,76,0.04)';
  for (let x = 30; x < canvasW; x += 30) {
    for (let y = 30; y < canvasH; y += 30) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw edges
  g.edges().forEach(edge => {
    const fromNode = g.node(edge.v);
    const toNode = g.node(edge.w);
    if (!fromNode || !toNode) return;

    const fromMember = memberMap.get(edge.v);
    const color = fromMember
      ? getBranchColor(fromMember.id)
      : COLORS.edgeDefault;

    drawEdge(
      ctx,
      fromNode.x - minX + PADDING,
      fromNode.y - minY + PADDING + CARD_H / 2,
      toNode.x - minX + PADDING,
      toNode.y - minY + PADDING - CARD_H / 2,
      color
    );
  });

  // Draw nodes
  g.nodes().forEach(id => {
    const node = g.node(id);
    const member = memberMap.get(id);
    if (!node || !member) return;

    drawCard(
      ctx,
      member,
      node.x - minX + PADDING - CARD_W / 2,
      node.y - minY + PADDING - CARD_H / 2
    );
  });

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob!), 'image/png');
  });
}
