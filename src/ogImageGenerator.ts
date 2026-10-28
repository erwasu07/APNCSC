import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { SarkariItem, SARKARI_CATEGORIES } from './data/sarkariData';
import { ServiceItem } from './servicesData';
import {
  renderMasterThumbnailBuffer,
  renderStandaloneMasterThumbnailSvg,
  buildDeterministicThumbnailSpec,
  ThumbnailSpec
} from './thumbnailGenerator';

// Helper to escape XML special characters
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text: string, maxCharsPerLine = 48, maxLines = 3): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Generate high-fidelity 1200x630 SVG matching approved reference images
 */
export function generateOgSvg(item?: Partial<SarkariItem> | null): string {
  const spec = buildDeterministicThumbnailSpec({
    id: item?.id,
    title: item?.title || 'CSC DOST – Citizen Recruitment & Government Services Portal',
    category: item?.category,
    department: item?.department,
    postType: item?.postType,
    shortInfo: item?.shortInfo,
    startDate: item?.startDate,
    lastDate: item?.lastDate,
    eligibility: item?.eligibility,
    status: item?.status
  });

  return renderStandaloneMasterThumbnailSvg(spec);
}

/**
 * Generate 1200x630 Social Preview PNG for Open Graph (Facebook / WhatsApp / Twitter)
 */
export async function generateSocialPreviewPng(item: Partial<SarkariItem> | null): Promise<Buffer> {
  const spec = buildDeterministicThumbnailSpec({
    id: item?.id,
    title: item?.title || 'CSC DOST – Citizen Recruitment & Government Services Portal',
    category: item?.category,
    department: item?.department,
    postType: item?.postType,
    shortInfo: item?.shortInfo,
    startDate: item?.startDate,
    lastDate: item?.lastDate,
    eligibility: item?.eligibility,
    status: item?.status
  });

  return renderMasterThumbnailBuffer(spec, 'png');
}

/**
 * Generate high-contrast PNG from SVG
 */
export async function generateOgPng(item?: Partial<SarkariItem> | null): Promise<Buffer> {
  return generateSocialPreviewPng(item || null);
}

/**
 * Generate Service Item SVG
 */
export function generateServiceOgSvg(service: ServiceItem): string {
  const escapedName = escapeXml(service.name);
  const escapedPrice = escapeXml(service.price);
  const escapedTime = escapeXml(service.estimatedTime);
  const descLines = wrapText(service.description, 50, 2).map(l => escapeXml(l));

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="50%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#EAB308" />
    </linearGradient>

    <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bgGrad)" />
  <rect x="18" y="18" width="1164" height="594" rx="28" fill="none" stroke="url(#goldGrad)" stroke-width="8" />

  <!-- TOP HEADER -->
  <g transform="translate(65, 50)">
    <circle cx="55" cy="55" r="50" fill="#0F172A" stroke="#F59E0B" stroke-width="4" filter="url(#dropShadow)" />
    <text x="55" y="44" font-family="'Liberation Sans', Arial, sans-serif" font-weight="900" font-size="16" fill="#FDE047" text-anchor="middle">CSC DOST</text>
    <text x="55" y="64" font-family="'Liberation Sans', Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" text-anchor="middle">SERVICES</text>
  </g>

  <g transform="translate(195, 48)" filter="url(#dropShadow)">
    <rect x="0" y="0" width="620" height="62" rx="14" fill="#0284C7" stroke="#38BDF8" stroke-width="2" />
    <text x="310" y="40" font-family="'Liberation Sans', Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle">
      ONLINE CITIZEN E-SERVICES
    </text>
  </g>

  <!-- CONTENT -->
  <g transform="translate(65, 140)">
    <rect x="0" y="0" width="1070" height="370" rx="20" fill="#FFFFFF" fill-opacity="0.05" stroke="#334155" stroke-width="2" />
    
    <text x="40" y="70" font-family="'Liberation Sans', Arial, sans-serif" font-weight="900" font-size="42" fill="#FFFFFF" filter="url(#dropShadow)">
      ${escapedName}
    </text>

    ${descLines.map((l, idx) => `
      <text x="40" y="${130 + idx * 35}" font-family="'Liberation Sans', Arial, sans-serif" font-weight="500" font-size="22" fill="#94A3B8">
        ${l}
      </text>
    `).join('')}

    <g transform="translate(40, 240)">
      <rect x="0" y="0" width="300" height="90" rx="12" fill="#14532D" stroke="#22C55E" stroke-width="2" />
      <text x="20" y="32" font-family="'Liberation Sans', Arial, sans-serif" font-weight="700" font-size="14" fill="#BBF7D0">ESTIMATED FEE</text>
      <text x="20" y="68" font-family="'Liberation Sans', Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF">${escapedPrice}</text>
    </g>

    <g transform="translate(370, 240)">
      <rect x="0" y="0" width="300" height="90" rx="12" fill="#1E3A8A" stroke="#3B82F6" stroke-width="2" />
      <text x="20" y="32" font-family="'Liberation Sans', Arial, sans-serif" font-weight="700" font-size="14" fill="#BFDBFE">PROCESSING TIME</text>
      <text x="20" y="68" font-family="'Liberation Sans', Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF">${escapedTime}</text>
    </g>
  </g>

  <!-- FOOTER -->
  <g transform="translate(65, 530)">
    <rect x="0" y="0" width="1070" height="55" rx="12" fill="#020617" stroke="#F59E0B" stroke-width="2" />
    <text x="30" y="35" font-family="'Liberation Sans', Arial, sans-serif" font-weight="900" font-size="20" fill="#FDE047">
      cscdost.com • Authorized Common Service Center
    </text>
    <text x="1040" y="35" font-family="'Liberation Sans', Arial, sans-serif" font-weight="800" font-size="18" fill="#FFFFFF" text-anchor="end">
      Apply &amp; Upload Documents Online
    </text>
  </g>
</svg>`;
}

export async function generateServiceOgPng(service: ServiceItem): Promise<Buffer> {
  const svgString = generateServiceOgSvg(service);
  return sharp(Buffer.from(svgString))
    .png({ quality: 90, compressionLevel: 8 })
    .toBuffer();
}
