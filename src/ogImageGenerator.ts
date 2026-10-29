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
import { renderVectorText } from './utils/vectorText';

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
 * Generate official, high-resolution 1200x630 SVG for the CSC DOST Portal Homepage
 * Designed with a centered 1:1 safe zone so WhatsApp, Facebook, Twitter, and LinkedIn
 * render a pristine, beautifully branded thumbnail preview without awkward cropping.
 */
export function generatePortalOgBannerSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#071328"/>
      <stop offset="50%" stop-color="#0b1b38"/>
      <stop offset="100%" stop-color="#08142b"/>
    </linearGradient>

    <!-- Card Background Gradient -->
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#142447" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#0d1830" stop-opacity="0.95"/>
    </linearGradient>

    <!-- Tricolor Gradients -->
    <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF9933"/>
      <stop offset="100%" stop-color="#E65100"/>
    </linearGradient>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#15803D"/>
    </linearGradient>

    <!-- Soft Drop Shadows -->
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>

  <!-- Subtle Ambient Glow Orbs -->
  <circle cx="600" cy="240" r="320" fill="#2563eb" opacity="0.12"/>
  <circle cx="150" cy="450" r="220" fill="#f59e0b" opacity="0.08"/>
  <circle cx="1050" cy="450" r="220" fill="#10b981" opacity="0.08"/>

  <!-- Top Tricolor Accent Bar -->
  <rect x="0" y="0" width="400" height="6" fill="#FF9933"/>
  <rect x="400" y="0" width="400" height="6" fill="#FFFFFF"/>
  <rect x="800" y="0" width="400" height="6" fill="#138808"/>

  <!-- Geometric Grid Accent Lines -->
  <g stroke="#3b82f6" stroke-opacity="0.08" stroke-width="1">
    <line x1="0" y1="100" x2="1200" y2="100"/>
    <line x1="0" y1="200" x2="1200" y2="200"/>
    <line x1="0" y1="300" x2="1200" y2="300"/>
    <line x1="0" y1="400" x2="1200" y2="400"/>
    <line x1="0" y1="500" x2="1200" y2="500"/>
    <line x1="200" y1="0" x2="200" y2="630"/>
    <line x1="400" y1="0" x2="400" y2="630"/>
    <line x1="600" y1="0" x2="600" y2="630"/>
    <line x1="800" y1="0" x2="800" y2="630"/>
    <line x1="1000" y1="0" x2="1000" y2="630"/>
  </g>

  <!-- TOP HEADER BADGE (Centered) -->
  <g transform="translate(600, 48)">
    <rect x="-290" y="-18" width="580" height="36" rx="18" fill="#172554" stroke="#3b82f6" stroke-width="1.2" opacity="0.95"/>
    <circle cx="-264" cy="0" r="5" fill="#22c55e"/>
    ${renderVectorText('AUTHORIZED DIGITAL PORTAL • CSC VLE ID: 212515670018', -248, 5, 13, '#93c5fd', { anchor: 'start', weight: 'bold', letterSpacing: 1 })}
  </g>

  <!-- CENTER HERO BRAND BLOCK (WhatsApp Square Crop Safe Zone) -->
  <g transform="translate(600, 160)">
    <!-- CSC Digital India Emblem Vector -->
    <g transform="translate(0, 0)">
      <circle cx="0" cy="0" r="56" fill="#1e3a8a" opacity="0.4"/>
      <circle cx="0" cy="0" r="52" fill="#ffffff"/>
      <!-- Saffron Swash -->
      <path d="M -22 -32 A 40 40 0 0 1 42 -22" fill="none" stroke="url(#saffronGrad)" stroke-width="7" stroke-linecap="round"/>
      <!-- Green Swash -->
      <path d="M 40 22 A 40 40 0 0 1 -24 32" fill="none" stroke="url(#greenGrad)" stroke-width="7" stroke-linecap="round"/>
      <!-- Inner Globe Grid -->
      <circle cx="0" cy="0" r="24" fill="none" stroke="#000080" stroke-width="2.5"/>
      <ellipse cx="0" cy="0" rx="24" ry="11" fill="none" stroke="#000080" stroke-width="1.8"/>
      <ellipse cx="0" cy="0" rx="11" ry="24" fill="none" stroke="#000080" stroke-width="1.8"/>
      <!-- Golden Verified Badge -->
      <circle cx="36" cy="36" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="2.5"/>
      <path d="M 31 36 L 35 40 L 42 32" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Main Brand Title as Pure Vector Path -->
    ${renderVectorText('CSC DOST', 0, 105, 78, '#ffffff', { anchor: 'middle', weight: 'bold', letterSpacing: -1 })}

    <!-- Subtitle / Tagline as Pure Vector Path -->
    ${renderVectorText('Government Services, Schemes & Recruitment Simplified', 0, 145, 22, '#93c5fd', { anchor: 'middle', weight: 'bold', letterSpacing: 0.5 })}

    <!-- Web URL Pill with Pure Vector Path -->
    <g transform="translate(0, 185)">
      <rect x="-170" y="-18" width="340" height="36" rx="18" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5"/>
      ${renderVectorText('WWW.CSCDOST.COM', 0, 5, 17, '#fbbf24', { anchor: 'middle', weight: 'bold', letterSpacing: 1.5 })}
    </g>
  </g>

  <!-- 3 FEATURE CARDS (Recruitment, Services, University) -->
  <g transform="translate(70, 425)" filter="url(#cardShadow)">
    <rect x="0" y="0" width="320" height="125" rx="16" fill="url(#cardGrad)" stroke="#1e40af" stroke-width="1.5"/>
    <rect x="18" y="16" width="38" height="38" rx="10" fill="#1e3a8a"/>
    <text x="37" y="42" text-anchor="middle" font-size="20">📋</text>
    ${renderVectorText('Sarkari Jobs & Exams', 68, 34, 15, '#ffffff', { weight: 'bold' })}
    ${renderVectorText('Daily Verified Gazettes', 68, 50, 12, '#60a5fa', { weight: 'bold' })}
    <line x1="18" y1="68" x2="302" y2="68" stroke="#1e3a8a" stroke-width="1"/>
    ${renderVectorText('JKSSB • Indian Army • SSC • RRB', 18, 90, 13, '#e2e8f0', { weight: 'bold' })}
    ${renderVectorText('Admit Cards • Syllabi • Answer Keys', 18, 108, 11, '#94a3b8', { weight: 'regular' })}
  </g>

  <g transform="translate(440, 425)" filter="url(#cardShadow)">
    <rect x="0" y="0" width="320" height="125" rx="16" fill="url(#cardGrad)" stroke="#059669" stroke-width="1.5"/>
    <rect x="18" y="16" width="38" height="38" rx="10" fill="#065f46"/>
    <text x="37" y="42" text-anchor="middle" font-size="20">🏛️</text>
    ${renderVectorText('Citizen Digital Services', 68, 34, 15, '#ffffff', { weight: 'bold' })}
    ${renderVectorText('Online Counter Assistance', 68, 50, 12, '#34d399', { weight: 'bold' })}
    <line x1="18" y1="68" x2="302" y2="68" stroke="#047857" stroke-width="1"/>
    ${renderVectorText('Aadhaar • PAN • Ayushman • KISAN', 18, 90, 13, '#e2e8f0', { weight: 'bold' })}
    ${renderVectorText('Domicile • E-Tickets • Certificates', 18, 108, 11, '#94a3b8', { weight: 'regular' })}
  </g>

  <g transform="translate(810, 425)" filter="url(#cardShadow)">
    <rect x="0" y="0" width="320" height="125" rx="16" fill="url(#cardGrad)" stroke="#d97706" stroke-width="1.5"/>
    <rect x="18" y="16" width="38" height="38" rx="10" fill="#92400e"/>
    <text x="37" y="42" text-anchor="middle" font-size="20">🎓</text>
    ${renderVectorText('University Desk', 68, 34, 15, '#ffffff', { weight: 'bold' })}
    ${renderVectorText('KU & Cluster Univ Srinagar', 68, 50, 12, '#fbbf24', { weight: 'bold' })}
    <line x1="18" y1="68" x2="302" y2="68" stroke="#b45309" stroke-width="1"/>
    ${renderVectorText('Admissions • Exam Forms • Results', 18, 90, 13, '#e2e8f0', { weight: 'bold' })}
    ${renderVectorText('Direct Link Portals & Step Guides', 18, 108, 11, '#94a3b8', { weight: 'regular' })}
  </g>

  <!-- BOTTOM ACCREDITATION BAR -->
  <g transform="translate(600, 595)">
    ${renderVectorText('Operated by Wasim Ahmad Khanday (CSC VLE) • Sangran Qazigund, Anantnag, J&K 192221 • Official Helpline: +91 70068 33767', 0, 0, 12, '#64748b', { anchor: 'middle', weight: 'bold', letterSpacing: 0.5 })}
  </g>
</svg>`;
}

/**
 * Generate high-fidelity 1200x630 SVG matching approved reference images
 */
export function generateOgSvg(item?: Partial<SarkariItem> | null): string {
  if (!item || !item.id) {
    return generatePortalOgBannerSvg();
  }

  const spec = buildDeterministicThumbnailSpec({
    id: item.id,
    title: item.title || 'CSC DOST – Citizen Recruitment & Government Services Portal',
    category: item.category,
    department: item.department,
    postType: item.postType,
    shortInfo: item.shortInfo,
    startDate: item.startDate,
    lastDate: item.lastDate,
    eligibility: item.eligibility,
    status: item.status
  });

  return renderStandaloneMasterThumbnailSvg(spec);
}

/**
 * Generate 1200x630 Social Preview PNG for Open Graph (Facebook / WhatsApp / Twitter)
 */
export async function generateSocialPreviewPng(item: Partial<SarkariItem> | null): Promise<Buffer> {
  if (!item || !item.id) {
    const svg = generatePortalOgBannerSvg();
    return sharp(Buffer.from(svg))
      .png({ quality: 95, compressionLevel: 9 })
      .toBuffer();
  }

  try {
    const spec = buildDeterministicThumbnailSpec({
      id: item.id,
      title: item.title || 'CSC DOST – Citizen Recruitment & Government Services Portal',
      category: item.category,
      department: item.department,
      postType: item.postType,
      shortInfo: item.shortInfo,
      startDate: item.startDate,
      lastDate: item.lastDate,
      eligibility: item.eligibility,
      status: item.status
    });

    return await renderMasterThumbnailBuffer(spec, 'png');
  } catch (err) {
    console.warn('[SocialPreview] Falling back to portal banner PNG:', err);
    const fallbackSvg = generatePortalOgBannerSvg();
    return sharp(Buffer.from(fallbackSvg))
      .png({ quality: 95, compressionLevel: 9 })
      .toBuffer();
  }
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
    ${renderVectorText('CSC DOST', 55, 44, 16, '#FDE047', { anchor: 'middle', weight: 'bold' })}
    ${renderVectorText('SERVICES', 55, 64, 20, '#FFFFFF', { anchor: 'middle', weight: 'bold' })}
  </g>

  <g transform="translate(195, 48)" filter="url(#dropShadow)">
    <rect x="0" y="0" width="620" height="62" rx="14" fill="#0284C7" stroke="#38BDF8" stroke-width="2" />
    ${renderVectorText('ONLINE CITIZEN E-SERVICES', 310, 40, 28, '#FFFFFF', { anchor: 'middle', weight: 'bold' })}
  </g>

  <!-- CONTENT -->
  <g transform="translate(65, 140)">
    <rect x="0" y="0" width="1070" height="370" rx="20" fill="#FFFFFF" fill-opacity="0.05" stroke="#334155" stroke-width="2" />
    
    ${renderVectorText(service.name.slice(0, 42), 40, 70, 40, '#FFFFFF', { weight: 'bold' })}

    ${descLines.map((l, idx) => renderVectorText(l, 40, 130 + idx * 35, 22, '#94A3B8', { weight: 'regular' })).join('\n    ')}

    <g transform="translate(40, 240)">
      <rect x="0" y="0" width="300" height="90" rx="12" fill="#14532D" stroke="#22C55E" stroke-width="2" />
      ${renderVectorText('ESTIMATED FEE', 20, 32, 14, '#BBF7D0', { weight: 'bold' })}
      ${renderVectorText(service.price, 20, 68, 28, '#FFFFFF', { weight: 'bold' })}
    </g>

    <g transform="translate(370, 240)">
      <rect x="0" y="0" width="300" height="90" rx="12" fill="#1E3A8A" stroke="#3B82F6" stroke-width="2" />
      ${renderVectorText('PROCESSING TIME', 20, 32, 14, '#BFDBFE', { weight: 'bold' })}
      ${renderVectorText(service.estimatedTime, 20, 68, 28, '#FFFFFF', { weight: 'bold' })}
    </g>
  </g>

  <!-- FOOTER -->
  <g transform="translate(65, 530)">
    <rect x="0" y="0" width="1070" height="55" rx="12" fill="#020617" stroke="#F59E0B" stroke-width="2" />
    ${renderVectorText('cscdost.com • Authorized Common Service Center', 30, 35, 20, '#FDE047', { weight: 'bold' })}
    ${renderVectorText('Apply & Upload Documents Online', 1040, 35, 18, '#FFFFFF', { anchor: 'end', weight: 'bold' })}
  </g>
</svg>`;
}

export async function generateServiceOgPng(service: ServiceItem): Promise<Buffer> {
  const svgString = generateServiceOgSvg(service);
  return sharp(Buffer.from(svgString))
    .png({ quality: 90, compressionLevel: 8 })
    .toBuffer();
}
