import fs from 'fs';
import path from 'path';
import opentype from 'opentype.js';
import { LIBERATION_SANS_BOLD_BASE64, LIBERATION_SANS_REGULAR_BASE64 } from '../assets/embeddedFonts';
import {
  INTER_REGULAR_WOFF_BASE64,
  INTER_SEMIBOLD_WOFF_BASE64,
  INTER_BOLD_WOFF_BASE64,
  INTER_EXTRABOLD_WOFF_BASE64,
} from '../assets/embeddedInterFonts';

export type VectorFontWeight = 'regular' | 'semibold' | 'bold' | 'extrabold';

interface LoadedFonts {
  inter: Partial<Record<VectorFontWeight, opentype.Font>>;
  fallbackBold: opentype.Font | null;
  fallbackRegular: opentype.Font | null;
  initialized: boolean;
}

const fontsState: LoadedFonts = {
  inter: {},
  fallbackBold: null,
  fallbackRegular: null,
  initialized: false,
};

function parseFontBuffer(buf: Buffer): opentype.Font | null {
  try {
    return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  } catch {
    return null;
  }
}

function loadInterWeight(
  weight: VectorFontWeight,
  embeddedBase64: string,
  fileName: string
): opentype.Font | null {
  if (embeddedBase64) {
    const parsed = parseFontBuffer(Buffer.from(embeddedBase64, 'base64'));
    if (parsed) return parsed;
  }
  const candidates = [
    path.join(process.cwd(), 'src', 'assets', 'fonts', fileName),
    path.join(process.cwd(), 'node_modules', '@fontsource', 'inter', 'files', fileName),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const parsed = parseFontBuffer(fs.readFileSync(p));
        if (parsed) return parsed;
      }
    } catch {
      // ignore missing path
    }
  }
  return null;
}

function initFonts() {
  if (fontsState.initialized) return;
  fontsState.initialized = true;

  fontsState.inter.regular =
    loadInterWeight('regular', INTER_REGULAR_WOFF_BASE64, 'inter-latin-400-normal.woff') || undefined;
  fontsState.inter.semibold =
    loadInterWeight('semibold', INTER_SEMIBOLD_WOFF_BASE64, 'inter-latin-600-normal.woff') || undefined;
  fontsState.inter.bold =
    loadInterWeight('bold', INTER_BOLD_WOFF_BASE64, 'inter-latin-700-normal.woff') || undefined;
  fontsState.inter.extrabold =
    loadInterWeight('extrabold', INTER_EXTRABOLD_WOFF_BASE64, 'inter-latin-800-normal.woff') || undefined;

  if (LIBERATION_SANS_BOLD_BASE64) {
    fontsState.fallbackBold = parseFontBuffer(Buffer.from(LIBERATION_SANS_BOLD_BASE64, 'base64'));
  }
  if (LIBERATION_SANS_REGULAR_BASE64) {
    fontsState.fallbackRegular = parseFontBuffer(Buffer.from(LIBERATION_SANS_REGULAR_BASE64, 'base64'));
  }
}

function resolveFont(weight: VectorFontWeight = 'bold'): opentype.Font | null {
  initFonts();
  if (weight === 'regular') {
    return (
      fontsState.inter.regular ||
      fontsState.inter.semibold ||
      fontsState.fallbackRegular ||
      fontsState.fallbackBold
    );
  }
  if (weight === 'semibold') {
    return (
      fontsState.inter.semibold ||
      fontsState.inter.bold ||
      fontsState.inter.regular ||
      fontsState.fallbackBold
    );
  }
  if (weight === 'extrabold') {
    return (
      fontsState.inter.extrabold ||
      fontsState.inter.bold ||
      fontsState.fallbackBold ||
      fontsState.fallbackRegular
    );
  }
  return (
    fontsState.inter.bold ||
    fontsState.inter.extrabold ||
    fontsState.inter.semibold ||
    fontsState.fallbackBold ||
    fontsState.fallbackRegular
  );
}

export interface VectorTextOptions {
  anchor?: 'start' | 'middle' | 'end';
  weight?: VectorFontWeight;
  letterSpacing?: number;
}

function getSafeGlyph(font: opentype.Font, fallbackFont: opentype.Font | null, ch: string): {
  glyph: opentype.Glyph;
  fontUsed: opentype.Font;
} {
  const g = font.charToGlyph(ch);
  if (g && g.index !== 0) {
    return { glyph: g, fontUsed: font };
  }
  if (fallbackFont) {
    const fg = fallbackFont.charToGlyph(ch);
    if (fg && fg.index !== 0) {
      return { glyph: fg, fontUsed: fallbackFont };
    }
  }
  return { glyph: g, fontUsed: font };
}

/**
 * Computes exact width using opentype charToGlyph + kerning (bypasses opentype.js GSUB substFormat 2 issue on Inter).
 */
export function measureVectorTextWidth(
  text: string,
  fontSize: number,
  options: { weight?: VectorFontWeight; letterSpacing?: number } = {}
): number {
  if (!text) return 0;
  const weight = options.weight || 'bold';
  const font = resolveFont(weight);
  if (!font) return text.length * fontSize * 0.56;

  const fallbackFont = weight === 'regular' ? fontsState.fallbackRegular : fontsState.fallbackBold;
  const letterSpacing = options.letterSpacing || 0;
  const chars = Array.from(text);
  let totalWidth = 0;
  let prevGlyph: opentype.Glyph | null = null;
  let prevFont: opentype.Font | null = null;

  for (let i = 0; i < chars.length; i++) {
    const { glyph, fontUsed } = getSafeGlyph(font, fallbackFont, chars[i]);
    const scale = fontSize / (fontUsed.unitsPerEm || 1000);
    if (prevGlyph && prevFont === fontUsed) {
      totalWidth += fontUsed.getKerningValue(prevGlyph, glyph) * scale;
    }
    totalWidth += (glyph.advanceWidth || fontUsed.unitsPerEm * 0.5) * scale;
    if (i < chars.length - 1) totalWidth += letterSpacing;
    prevGlyph = glyph;
    prevFont = fontUsed;
  }
  return totalWidth;
}

/**
 * Converts a text string directly into SVG <path d="..." fill="..." /> using bundled Inter WOFF fonts.
 * Guaranteed zero OS font dependency and crisp pixel-perfect rendering in Sharp on all Linux/Vercel runtimes.
 */
export function renderVectorText(
  text: string,
  x: number,
  y: number,
  fontSize: number,
  fill: string,
  options: VectorTextOptions = {}
): string {
  if (!text) return '';
  const weight = options.weight || 'bold';
  const font = resolveFont(weight);
  const anchor = options.anchor || 'start';
  const letterSpacing = options.letterSpacing || 0;

  if (!font) {
    const esc = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<text x="${x}" y="${y}" font-family="Inter, sans-serif" font-weight="${weight === 'regular' ? 'normal' : 'bold'}" font-size="${fontSize}" fill="${fill}" text-anchor="${anchor}">${esc}</text>`;
  }

  try {
    const fallbackFont = weight === 'regular' ? fontsState.fallbackRegular : fontsState.fallbackBold;
    const totalWidth = measureVectorTextWidth(text, fontSize, { weight, letterSpacing });

    let curX = x;
    if (anchor === 'middle') {
      curX = x - totalWidth / 2;
    } else if (anchor === 'end') {
      curX = x - totalWidth;
    }

    const chars = Array.from(text);
    const pathDataList: string[] = [];
    let prevGlyph: opentype.Glyph | null = null;
    let prevFont: opentype.Font | null = null;

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const { glyph, fontUsed } = getSafeGlyph(font, fallbackFont, ch);
      const scale = fontSize / (fontUsed.unitsPerEm || 1000);

      if (prevGlyph && prevFont === fontUsed) {
        curX += fontUsed.getKerningValue(prevGlyph, glyph) * scale;
      }

      if (ch !== ' ' && ch !== '\u00A0') {
        const glyphPath = glyph.getPath(curX, y, fontSize);
        const data = glyphPath.toPathData(2);
        if (data && data.length > 0) {
          pathDataList.push(data);
        }
      }

      curX += (glyph.advanceWidth || fontUsed.unitsPerEm * 0.5) * scale + letterSpacing;
      prevGlyph = glyph;
      prevFont = fontUsed;
    }

    if (pathDataList.length === 0) {
      return '';
    }

    return `<path d="${pathDataList.join(' ')}" fill="${fill}" />`;
  } catch (err) {
    console.warn('[VectorText] Glyph path rendering fallback:', err);
    const esc = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<text x="${x}" y="${y}" font-family="Inter, sans-serif" font-weight="${weight === 'regular' ? 'normal' : 'bold'}" font-size="${fontSize}" fill="${fill}" text-anchor="${anchor}">${esc}</text>`;
  }
}
