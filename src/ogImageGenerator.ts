import sharp from 'sharp';
import type { SarkariItem } from './data/sarkariData';
import type { ServiceItem } from './servicesData';
import {
  buildThumbnailRenderData,
  sanitizeImageText,
  type ThumbnailRenderData,
} from './utils/postThumbnailMeta';
import {
  measureVectorTextWidth,
  renderVectorText,
  type VectorFontWeight,
} from './utils/vectorText';

export const OG_SOCIAL_WIDTH = 1200;
export const OG_SOCIAL_HEIGHT = 630;
export const CARD_THUMB_WIDTH = 600;
export const CARD_THUMB_HEIGHT = 315;

export interface OgRenderOptions {
  size?: 'social' | 'card';
  format?: 'png' | 'webp';
}

/**
 * Wraps text into at most `maxLines` lines based on exact Inter glyph advance width.
 */
function wrapTextByPixelWidth(
  rawText: string,
  fontSize: number,
  maxWidthPx: number,
  maxLines: number,
  weight: VectorFontWeight = 'extrabold'
): string[] {
  const clean = sanitizeImageText(rawText)
    .replace(/\s*\(Concluded\)/i, '')
    .replace(/\s*-\s*CSC DOST.*/i, '')
    .trim();

  if (!clean) return ['Official Notification'];

  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    const candidateWidth = measureVectorTextWidth(candidate, fontSize, { weight });

    if (candidateWidth <= maxWidthPx || !currentLine) {
      currentLine = candidate;
    } else {
      lines.push(currentLine);
      currentLine = word;

      if (lines.length === maxLines - 1) {
        // Fill last line cleanly with remaining words or ellipsis
        let remaining = word;
        let truncated = false;
        for (let j = i + 1; j < words.length; j++) {
          const next = `${remaining} ${words[j]}`;
          if (measureVectorTextWidth(`${next}...`, fontSize, { weight }) <= maxWidthPx) {
            remaining = next;
          } else {
            truncated = true;
            break;
          }
        }
        remaining = remaining.replace(/[,:;/-]+$/, '');
        if (truncated) {
          remaining = `${remaining}...`;
        } else if (measureVectorTextWidth(remaining, fontSize, { weight }) > maxWidthPx) {
          while (
            remaining.length > 4 &&
            measureVectorTextWidth(`${remaining}...`, fontSize, { weight }) > maxWidthPx
          ) {
            remaining = remaining.slice(0, -1).trim();
          }
          remaining = `${remaining}...`;
        }
        lines.push(remaining);
        return lines;
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.slice(0, maxLines);
}

/**
 * Fits single-line key highlight text at >= 40px by choosing the largest crisp size within maxWidthPx.
 */
function fitHighlightFontSize(
  text: string,
  preferredSize: number,
  minSize: number,
  maxWidthPx: number,
  weight: VectorFontWeight = 'extrabold'
): number {
  for (let size = preferredSize; size >= minSize; size -= 2) {
    if (measureVectorTextWidth(text, size, { weight }) <= maxWidthPx) {
      return size;
    }
  }
  return minSize;
}

function renderPillSvg(
  text: string,
  x: number,
  y: number,
  options: {
    height?: number;
    fontSize?: number;
    bgHex: string;
    textHex: string;
    borderHex: string;
    borderWidth?: number;
    radius?: number;
    paddingX?: number;
    weight?: VectorFontWeight;
    letterSpacing?: number;
  }
): { svg: string; width: number } {
  const height = options.height ?? 44;
  const fontSize = options.fontSize ?? 20;
  const paddingX = options.paddingX ?? 20;
  const radius = options.radius ?? 10;
  const weight = options.weight ?? 'extrabold';
  const letterSpacing = options.letterSpacing ?? 0.4;
  const borderWidth = options.borderWidth ?? 2;

  const textWidth = measureVectorTextWidth(text, fontSize, { weight, letterSpacing });
  const width = Math.ceil(textWidth + paddingX * 2);
  const textY = Math.round(y + height / 2 + fontSize * 0.35);

  const svg = `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${options.bgHex}" stroke="${options.borderHex}" stroke-width="${borderWidth}" />
      ${renderVectorText(text, x + paddingX, textY, fontSize, options.textHex, {
        anchor: 'start',
        weight,
        letterSpacing,
      })}
    </g>
  `;

  return { svg, width };
}

function renderChipsRowSvg(
  chips: string[],
  startX: number,
  y: number,
  maxEndX: number,
  accentHex: string
): string {
  if (!chips.length) return '';
  let curX = startX;
  const parts: string[] = [];

  for (let i = 0; i < chips.length; i++) {
    const label = sanitizeImageText(chips[i]);
    if (!label) continue;
    const isJk = label.toLowerCase().includes('j&k');
    const pill = renderPillSvg(label, curX, y, {
      height: 44,
      fontSize: 21,
      paddingX: 18,
      radius: 10,
      bgHex: isJk ? '#ECFDF5' : '#F1F5F9',
      textHex: isJk ? '#065F46' : '#1E293B',
      borderHex: isJk ? '#10B981' : '#CBD5E1',
      borderWidth: 2,
      weight: 'bold',
      letterSpacing: 0.1,
    });
    if (curX + pill.width > maxEndX) break;
    parts.push(pill.svg);
    curX += pill.width + 14;
  }

  return parts.join('\n');
}

/**
 * Generates crisp, dynamic 1200x630 SVG for any SarkariItem using bundled Inter vector paths.
 * Features:
 * - Status colour left stripe (green=open, amber=closing soon, blue=exam/admit/DV, purple=result/answer key, teal=upcoming, grey=closed)
 * - Organisation-specific accent colour & badge (text only, zero official emblems)
 * - 3 distinct automatic layout variants (number / date / title)
 * - Key highlight rendered at >= 40px Inter ExtraBold
 * - Strictly English text, real data chips only, zero filler text
 */
export function generatePostOgSvg(item: SarkariItem, customNow?: Date): string {
  const data: ThumbnailRenderData = buildThumbnailRenderData(item, customNow);

  const LEFT_STRIPE_W = 24;
  const PAD_X = 64;
  const RIGHT_BOUND = 1136;

  // Top Header Row: Org Badge (accented dark pill) + Status Pill
  const orgBadge = renderPillSvg(data.org.orgShort, PAD_X, 46, {
    height: 48,
    fontSize: 22,
    paddingX: 22,
    radius: 10,
    bgHex: data.org.badgeBgHex,
    textHex: data.org.badgeTextHex,
    borderHex: data.org.accentHex,
    borderWidth: 2,
    weight: 'extrabold',
    letterSpacing: 0.7,
  });

  const statusPill = renderPillSvg(data.statusLabel, PAD_X + orgBadge.width + 16, 46, {
    height: 48,
    fontSize: 21,
    paddingX: 20,
    radius: 24,
    bgHex: data.statusPillBgHex,
    textHex: data.statusPillTextHex,
    borderHex: data.statusPillBorderHex,
    borderWidth: 2,
    weight: 'extrabold',
    letterSpacing: 0.6,
  });

  let bodySvg = '';

  if (data.variant === 'number' && data.heroNumber) {
    // VARIANT 1: NUMBER-FOCUSED (e.g. 1,033 POSTS | 458 POSTS | 90 POSTS)
    const leftMaxW = 685;
    const titleFontSize = 38;
    const titleLines = wrapTextByPixelWidth(item.title, titleFontSize, leftMaxW, 2, 'extrabold');

    const titleStartY = 166;
    const titleLineHeight = 52;
    const titleSvg = titleLines
      .map((line, idx) =>
        renderVectorText(line, PAD_X, titleStartY + idx * titleLineHeight, titleFontSize, '#0F172A', {
          anchor: 'start',
          weight: 'extrabold',
          letterSpacing: -0.5,
        })
      )
      .join('\n');

    // Key highlight bar (>= 40px)
    const hlBoxY = titleLines.length > 1 ? 276 : 244;
    const hlFontSize = fitHighlightFontSize(data.keyHighlight, 44, 40, leftMaxW - 36, 'extrabold');
    const hlBoxSvg = `
      <rect x="${PAD_X}" y="${hlBoxY}" width="${leftMaxW}" height="82" rx="14" fill="${data.org.accentSoftHex}" stroke="${data.statusStripeHex}" stroke-width="2.5" />
      <rect x="${PAD_X}" y="${hlBoxY}" width="12" height="82" rx="4" fill="${data.statusStripeHex}" />
      ${renderVectorText(data.keyHighlight, PAD_X + 28, hlBoxY + 55, hlFontSize, '#0F172A', {
        anchor: 'start',
        weight: 'extrabold',
        letterSpacing: -0.4,
      })}
    `;

    // Real data chips below highlight bar
    const chipsY = hlBoxY + 106;
    const chipsSvg = renderChipsRowSvg(data.chips, PAD_X, chipsY, PAD_X + leftMaxW, data.org.accentHex);

    // Right Hero Stat Card
    const cardX = 786;
    const cardY = 128;
    const cardW = 350;
    const cardH = 382;
    const numLen = data.heroNumber.length;
    const numFontSize = numLen <= 3 ? 104 : numLen <= 5 ? 88 : 72;
    const numCenterX = cardX + cardW / 2;

    const heroCardSvg = `
      <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="20" fill="${data.org.badgeBgHex}" />
      <rect x="${cardX}" y="${cardY}" width="${cardW}" height="12" rx="6" fill="${data.statusStripeHex}" />
      ${renderVectorText(data.heroNumber, numCenterX, cardY + 175, numFontSize, '#FFFFFF', {
        anchor: 'middle',
        weight: 'extrabold',
        letterSpacing: -1.5,
      })}
      ${renderVectorText(data.heroNumberLabel || 'POSTS', numCenterX, cardY + 236, 32, '#E2E8F0', {
        anchor: 'middle',
        weight: 'bold',
        letterSpacing: 3,
      })}
      <line x1="${cardX + 36}" y1="${cardY + 276}" x2="${cardX + cardW - 36}" y2="${cardY + 276}" stroke="${data.org.accentHex}" stroke-opacity="0.55" stroke-width="2" />
      ${renderVectorText(data.org.orgShort, numCenterX, cardY + 328, 22, '#F8FAFC', {
        anchor: 'middle',
        weight: 'bold',
        letterSpacing: 1.2,
      })}
    `;

    bodySvg = `${titleSvg}\n${hlBoxSvg}\n${chipsSvg}\n${heroCardSvg}`;
  } else if (data.variant === 'date') {
    // VARIANT 2: DATE-FOCUSED (DV, Admit Card, Exam, Result, Answer Key, Exam/Re-eval forms)
    const maxW = RIGHT_BOUND - PAD_X;
    const titleFontSize = 40;
    const titleLines = wrapTextByPixelWidth(item.title, titleFontSize, maxW, 2, 'extrabold');

    const titleStartY = 166;
    const titleLineHeight = 54;
    const titleSvg = titleLines
      .map((line, idx) =>
        renderVectorText(line, PAD_X, titleStartY + idx * titleLineHeight, titleFontSize, '#0F172A', {
          anchor: 'start',
          weight: 'extrabold',
          letterSpacing: -0.6,
        })
      )
      .join('\n');

    // Prominent High-Contrast Highlight Callout (>= 42px)
    const hlBoxY = titleLines.length > 1 ? 286 : 252;
    const hlFontSize = fitHighlightFontSize(data.keyHighlight, 48, 40, maxW - 60, 'extrabold');
    const hlBoxSvg = `
      <rect x="${PAD_X}" y="${hlBoxY}" width="${maxW}" height="104" rx="16" fill="${data.org.accentSoftHex}" stroke="${data.statusStripeHex}" stroke-width="3" />
      <rect x="${PAD_X}" y="${hlBoxY}" width="16" height="104" rx="6" fill="${data.statusStripeHex}" />
      ${renderVectorText(data.keyHighlight, PAD_X + 38, hlBoxY + 68, hlFontSize, '#0F172A', {
        anchor: 'start',
        weight: 'extrabold',
        letterSpacing: -0.5,
      })}
    `;

    const chipsY = hlBoxY + 132;
    const chipsSvg = renderChipsRowSvg(data.chips, PAD_X, chipsY, RIGHT_BOUND, data.org.accentHex);

    bodySvg = `${titleSvg}\n${hlBoxSvg}\n${chipsSvg}`;
  } else {
    // VARIANT 3: TITLE-FOCUSED (when neither vacancy count nor dated window exists)
    const maxW = RIGHT_BOUND - PAD_X;
    const titleFontSize = 44;
    const titleLines = wrapTextByPixelWidth(item.title, titleFontSize, maxW, 2, 'extrabold');

    const titleStartY = 178;
    const titleLineHeight = 60;
    const titleSvg = titleLines
      .map((line, idx) =>
        renderVectorText(line, PAD_X, titleStartY + idx * titleLineHeight, titleFontSize, '#0F172A', {
          anchor: 'start',
          weight: 'extrabold',
          letterSpacing: -0.7,
        })
      )
      .join('\n');

    const hlBoxY = titleLines.length > 1 ? 310 : 272;
    const hlFontSize = fitHighlightFontSize(data.keyHighlight, 42, 40, maxW - 56, 'extrabold');
    const hlBoxSvg = `
      <rect x="${PAD_X}" y="${hlBoxY}" width="${maxW}" height="92" rx="14" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2.5" />
      <rect x="${PAD_X}" y="${hlBoxY}" width="14" height="92" rx="5" fill="${data.org.accentHex}" />
      ${renderVectorText(data.keyHighlight, PAD_X + 36, hlBoxY + 60, hlFontSize, '#0F172A', {
        anchor: 'start',
        weight: 'extrabold',
        letterSpacing: -0.4,
      })}
    `;

    const chipsY = hlBoxY + 120;
    const chipsSvg = renderChipsRowSvg(data.chips, PAD_X, chipsY, RIGHT_BOUND, data.org.accentHex);

    bodySvg = `${titleSvg}\n${hlBoxSvg}\n${chipsSvg}`;
  }

  // Footer strip: strictly cscdost.com + subtle org accent bar (no official claims, no Ashoka emblem)
  const footerSvg = `
    <line x1="${PAD_X}" y1="544" x2="${RIGHT_BOUND}" y2="544" stroke="#E2E8F0" stroke-width="2" />
    <rect x="${PAD_X}" y="572" width="14" height="24" rx="4" fill="${data.org.accentHex}" />
    ${renderVectorText('cscdost.com', PAD_X + 26, 593, 25, '#0F172A', {
      anchor: 'start',
      weight: 'extrabold',
      letterSpacing: -0.3,
    })}
    ${renderVectorText('Citizen Notice & Form Desk', RIGHT_BOUND, 592, 20, '#475569', {
      anchor: 'end',
      weight: 'semibold',
    })}
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${OG_SOCIAL_WIDTH} ${OG_SOCIAL_HEIGHT}" width="${OG_SOCIAL_WIDTH}" height="${OG_SOCIAL_HEIGHT}">
  <rect width="${OG_SOCIAL_WIDTH}" height="${OG_SOCIAL_HEIGHT}" fill="#FFFFFF" />
  <!-- Top Status Bar Hairline -->
  <rect x="0" y="0" width="${OG_SOCIAL_WIDTH}" height="8" fill="${data.statusStripeHex}" />
  <!-- Left Status Colour Stripe -->
  <rect x="0" y="0" width="${LEFT_STRIPE_W}" height="${OG_SOCIAL_HEIGHT}" fill="${data.statusStripeHex}" />
  <!-- Subtle Org Accent Corner Accent -->
  <rect x="${LEFT_STRIPE_W}" y="0" width="120" height="8" fill="${data.org.accentHex}" />

  ${orgBadge.svg}
  ${statusPill.svg}
  ${bodySvg}
  ${footerSvg}
</svg>`;
}

/**
 * Clean fallback banner (1200x630 SVG) using pure Inter vector paths — zero emojis, zero missing font tofu.
 */
export function generatePortalOgBannerSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="#0F172A" />
  <rect x="0" y="0" width="24" height="630" fill="#16A34A" />
  <rect x="0" y="0" width="1200" height="8" fill="#16A34A" />

  <rect x="72" y="64" width="230" height="48" rx="10" fill="#1E293B" stroke="#3B82F6" stroke-width="2" />
  ${renderVectorText('CSC DOST', 187, 96, 24, '#FFFFFF', { anchor: 'middle', weight: 'extrabold', letterSpacing: 1 })}

  ${renderVectorText('J&K Jobs, Admissions &', 72, 224, 56, '#FFFFFF', { anchor: 'start', weight: 'extrabold', letterSpacing: -1 })}
  ${renderVectorText('Citizen E-Services Desk', 72, 294, 56, '#F59E0B', { anchor: 'start', weight: 'extrabold', letterSpacing: -1 })}

  <rect x="72" y="346" width="1056" height="92" rx="16" fill="#1E293B" stroke="#334155" stroke-width="2" />
  ${renderVectorText('JKSSB • SSC • RRB • Army • Universities • Schemes', 104, 405, 34, '#E2E8F0', {
    anchor: 'start',
    weight: 'bold',
  })}

  <line x1="72" y1="538" x2="1128" y2="538" stroke="#334155" stroke-width="2" />
  <rect x="72" y="566" width="14" height="24" rx="4" fill="#16A34A" />
  ${renderVectorText('cscdost.com', 98, 587, 26, '#FFFFFF', { anchor: 'start', weight: 'extrabold' })}
  ${renderVectorText('Independent Citizen Notice Desk', 1128, 586, 20, '#94A3B8', { anchor: 'end', weight: 'semibold' })}
</svg>`;
}

export function generateOgSvg(item?: Partial<SarkariItem> | null, customNow?: Date): string {
  if (!item || !item.id || !item.title) {
    return generatePortalOgBannerSvg();
  }
  return generatePostOgSvg(item as SarkariItem, customNow);
}

/**
 * Generates an image buffer for a SarkariItem or generic fallback.
 * Supports 1200x630 social PNG or 600x315 list-card WebP/PNG.
 */
export async function generatePostThumbnailBuffer(
  item: SarkariItem | null,
  options: OgRenderOptions = {}
): Promise<Buffer> {
  const size = options.size === 'card' ? 'card' : 'social';
  const format = options.format === 'webp' ? 'webp' : 'png';

  const targetW = size === 'card' ? CARD_THUMB_WIDTH : OG_SOCIAL_WIDTH;
  const targetH = size === 'card' ? CARD_THUMB_HEIGHT : OG_SOCIAL_HEIGHT;

  let svg: string;
  try {
    svg = item ? generatePostOgSvg(item) : generatePortalOgBannerSvg();
  } catch (err) {
    console.warn('[OG Generator] Falling back to portal banner SVG:', err);
    svg = generatePortalOgBannerSvg();
  }

  try {
    let pipeline = sharp(Buffer.from(svg));
    if (size === 'card') {
      pipeline = pipeline.resize(targetW, targetH, { kernel: sharp.kernel.lanczos3 });
    }
    if (format === 'webp') {
      return await pipeline.webp({ quality: 88, effort: 4 }).toBuffer();
    }
    return await pipeline.png({ compressionLevel: 8 }).toBuffer();
  } catch (err) {
    console.warn('[OG Generator] Sharp raster fallback:', err);
    const fallbackSvg = generatePortalOgBannerSvg();
    let fallbackPipeline = sharp(Buffer.from(fallbackSvg));
    if (size === 'card') {
      fallbackPipeline = fallbackPipeline.resize(targetW, targetH, { kernel: sharp.kernel.lanczos3 });
    }
    return format === 'webp'
      ? await fallbackPipeline.webp({ quality: 85 }).toBuffer()
      : await fallbackPipeline.png({ compressionLevel: 8 }).toBuffer();
  }
}

export async function generateSocialPreviewPng(item: Partial<SarkariItem> | null): Promise<Buffer> {
  if (!item || !item.id || !item.title) {
    return generatePostThumbnailBuffer(null, { size: 'social', format: 'png' });
  }
  return generatePostThumbnailBuffer(item as SarkariItem, { size: 'social', format: 'png' });
}

export async function generateOgPng(item?: Partial<SarkariItem> | null): Promise<Buffer> {
  return generateSocialPreviewPng(item || null);
}

/**
 * Generates clean 1200x630 Service OG SVG (pure Inter vector paths, zero missing emoji tofu).
 */
export function generateServiceOgSvg(service: ServiceItem): string {
  const titleLines = wrapTextByPixelWidth(service.name, 42, 1050, 2, 'extrabold');
  const priceText = sanitizeImageText(service.price || 'Ask us');
  const timeText = sanitizeImageText(service.estimatedTime || 'Same day / As applicable');

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#FFFFFF" />
  <rect x="0" y="0" width="24" height="630" fill="#101A36" />
  <rect x="0" y="0" width="1200" height="8" fill="#F5A623" />

  <rect x="64" y="48" width="246" height="48" rx="10" fill="#101A36" />
  ${renderVectorText('CSC E-SERVICE', 187, 80, 21, '#FFFFFF', { anchor: 'middle', weight: 'extrabold', letterSpacing: 0.8 })}

  ${titleLines
    .map((l, idx) =>
      renderVectorText(l, 64, 168 + idx * 54, 42, '#0F172A', { anchor: 'start', weight: 'extrabold', letterSpacing: -0.6 })
    )
    .join('\n  ')}

  <rect x="64" y="302" width="516" height="148" rx="16" fill="#F0FDF4" stroke="#16A34A" stroke-width="2" />
  ${renderVectorText('CHARGES / FEE', 92, 346, 18, '#166534', { weight: 'bold', letterSpacing: 1 })}
  ${renderVectorText(priceText.slice(0, 32), 92, 410, 34, '#0F172A', { weight: 'extrabold' })}

  <rect x="608" y="302" width="528" height="148" rx="16" fill="#EFF6FF" stroke="#2563EB" stroke-width="2" />
  ${renderVectorText('TYPICAL TIME', 636, 346, 18, '#1E40AF', { weight: 'bold', letterSpacing: 1 })}
  ${renderVectorText(timeText.slice(0, 32), 636, 410, 34, '#0F172A', { weight: 'extrabold' })}

  <line x1="64" y1="544" x2="1136" y2="544" stroke="#E2E8F0" stroke-width="2" />
  <rect x="64" y="572" width="14" height="24" rx="4" fill="#F5A623" />
  ${renderVectorText('cscdost.com', 90, 593, 25, '#0F172A', { weight: 'extrabold' })}
  ${renderVectorText('Citizen E-Governance Assistance', 1136, 592, 20, '#475569', { anchor: 'end', weight: 'semibold' })}
</svg>`;
}

export async function generateServiceOgPng(
  service: ServiceItem,
  options: OgRenderOptions = {}
): Promise<Buffer> {
  const svgString = generateServiceOgSvg(service);
  const size = options.size === 'card' ? 'card' : 'social';
  const format = options.format === 'webp' ? 'webp' : 'png';

  let pipeline = sharp(Buffer.from(svgString));
  if (size === 'card') {
    pipeline = pipeline.resize(CARD_THUMB_WIDTH, CARD_THUMB_HEIGHT, { kernel: sharp.kernel.lanczos3 });
  }
  return format === 'webp'
    ? await pipeline.webp({ quality: 88 }).toBuffer()
    : await pipeline.png({ compressionLevel: 8 }).toBuffer();
}
