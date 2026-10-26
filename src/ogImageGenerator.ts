import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { SarkariItem, SARKARI_CATEGORIES } from './data/sarkariData';
import { ServiceItem } from './servicesData';
import {
  renderMasterThumbnailBuffer,
  buildDeterministicThumbnailSpec
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

// Helper to wrap long text into lines
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

// Get category human label & color theme
function getCategoryInfo(category: string) {
  switch (category) {
    case 'army_jobs':
      return { label: 'INDIAN ARMY RECRUITMENT', bg1: '#0B2027', bg2: '#204051', accent: '#D4AF37', tagBg: '#B91C1C' };
    case 'rrb_jobs':
      return { label: 'RAILWAY RECRUITMENT (RRB)', bg1: '#1A2A3A', bg2: '#0F4C81', accent: '#F59E0B', tagBg: '#1E40AF' };
    case 'ssc_jobs':
      return { label: 'STAFF SELECTION COMMISSION (SSC)', bg1: '#0F172A', bg2: '#1E293B', accent: '#38BDF8', tagBg: '#0369A1' };
    case 'jkssb':
      return { label: 'J&K SERVICES SELECTION BOARD (JKSSB)', bg1: '#0F2C59', bg2: '#1E3E62', accent: '#E0C097', tagBg: '#991B1B' };
    case 'exam_forms':
      return { label: 'UNIVERSITY OF KASHMIR (EXAM FORMS)', bg1: '#1E1B4B', bg2: '#312E81', accent: '#A78BFA', tagBg: '#6D28D9' };
    case 'admissions':
      return { label: 'UNIVERSITY ADMISSIONS NOTIFICATION', bg1: '#064E3B', bg2: '#047857', accent: '#6EE7B7', tagBg: '#059669' };
    case 'cluster_univ':
      return { label: 'CLUSTER UNIVERSITY SRINAGAR (CUS)', bg1: '#1E1B4B', bg2: '#4338CA', accent: '#FDE047', tagBg: '#4F46E5' };
    default:
      return { label: 'OFFICIAL CITIZEN NOTICE & UPDATE', bg1: '#0F172A', bg2: '#1E293B', accent: '#F59E0B', tagBg: '#155EEF' };
  }
}

/**
 * Generate a high-contrast, visually compelling SVG banner for CSC DOST social previews
 */
export function generateOgSvg(item?: Partial<SarkariItem> | null): string {
  const isDefault = !item || !item.title;
  const title = item?.title || 'CSC DOST - Official Recruitment Updates, Exam Forms & Admissions';
  const category = item?.category || 'jobs';
  const catInfo = getCategoryInfo(category);
  const lastDate = item?.lastDate || 'Check Official Notice';
  const totalPosts = item?.totalPosts ? String(item.totalPosts) : 'Open for eligible candidates';
  const eligibility = item?.eligibility ? item.eligibility.slice(0, 75) + (item.eligibility.length > 75 ? '...' : '') : '10th / 12th / Graduate / Diploma / Degree';
  const advtNo = item?.advertisementNo || 'Official Notification';

  const titleLines = wrapText(title, 42, 3);
  const escapedTitleLines = titleLines.map(l => escapeXml(l));
  const escapedCategory = escapeXml(catInfo.label);
  const escapedLastDate = escapeXml(lastDate);
  const escapedPosts = escapeXml(totalPosts);
  const escapedEligibility = escapeXml(eligibility);
  const escapedAdvtNo = escapeXml(advtNo);

  // SVG dimensions: 1200 x 630 (Standard Open Graph Banner)
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#101A36" />
      <stop offset="50%" stop-color="#0B132B" />
      <stop offset="100%" stop-color="#070C1A" />
    </linearGradient>

    <!-- Outer Border Clean Accent Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#243356" />
      <stop offset="50%" stop-color="#155EEF" />
      <stop offset="100%" stop-color="#243356" />
    </linearGradient>

    <!-- Header Brand Pill Gradient -->
    <linearGradient id="brandPillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#101A36" />
      <stop offset="50%" stop-color="#142145" />
      <stop offset="100%" stop-color="#101A36" />
    </linearGradient>

    <!-- Yellow Gold Pill Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>

    <!-- Card Inner Gradient -->
    <linearGradient id="innerCardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.3" />
    </linearGradient>

    <!-- Drop Shadow Filter -->
    <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.6"/>
    </filter>

    <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#F59E0B" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Base Canvas Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />

  <!-- Outer Frame -->
  <rect x="18" y="18" width="1164" height="594" rx="28" fill="none" stroke="url(#borderGrad)" stroke-width="3" />
  <rect x="28" y="28" width="1144" height="574" rx="20" fill="none" stroke="#243356" stroke-width="1.5" stroke-opacity="0.6" />

  <!-- TOP HEADER SECTION -->
  <!-- CSC DOST Circular Seal Logo on Top Left -->
  <g transform="translate(65, 50)">
    <!-- Outer Circle -->
    <circle cx="55" cy="55" r="50" fill="#101A36" stroke="#155EEF" stroke-width="3" filter="url(#dropShadow)" />
    <circle cx="55" cy="55" r="44" fill="#142145" stroke="#243356" stroke-width="1.5" />
    
    <!-- Text inside Seal -->
    <text x="55" y="44" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#F4B400" text-anchor="middle" letter-spacing="1">CSC DOST</text>
    <text x="55" y="62" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" text-anchor="middle">★ VLE ★</text>
    <text x="55" y="80" font-family="Arial, sans-serif" font-weight="700" font-size="10" fill="#B8C2D6" text-anchor="middle">AUTHORIZED</text>
  </g>

  <!-- Header Brand Pill (Top Center) -->
  <g transform="translate(195, 48)" filter="url(#dropShadow)">
    <rect x="0" y="0" width="620" height="62" rx="14" fill="url(#brandPillGrad)" stroke="#243356" stroke-width="2" />
    <text x="310" y="40" font-family="Arial, sans-serif" font-weight="900" font-size="26" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
      CSC DOST • CITIZEN NOTICE DESK
    </text>
  </g>

  <!-- Top Right Category Badge Pill -->
  <g transform="translate(835, 48)" filter="url(#dropShadow)">
    <rect x="0" y="0" width="300" height="62" rx="14" fill="#182649" stroke="#2B3E6E" stroke-width="2" />
    <text x="150" y="38" font-family="Arial, sans-serif" font-weight="800" font-size="16" fill="#93B4FF" text-anchor="middle">
      ${escapeXml(isDefault ? 'ONLINE CITIZEN DESK' : catInfo.label.slice(0, 24))}
    </text>
  </g>

  <!-- CENTER CONTENT CARD -->
  <g transform="translate(65, 135)">
    <!-- Main Info Box Backdrop -->
    <rect x="0" y="0" width="1070" height="375" rx="20" fill="url(#innerCardGrad)" stroke="#334155" stroke-width="2" filter="url(#dropShadow)" />
    
    <!-- Gold Top Inner Line -->
    <rect x="20" y="1" width="1030" height="3" fill="url(#goldGrad)" rx="1.5" />

    <!-- Sub-Heading / Advt Badge -->
    <rect x="35" y="24" width="${Math.min(advtNo.length * 11 + 35, 550)}" height="32" rx="8" fill="#1E293B" stroke="#F59E0B" stroke-width="1.5" />
    <text x="50" y="46" font-family="Arial, sans-serif" font-weight="800" font-size="14" fill="#FDE047">
      📌 ${escapedAdvtNo}
    </text>

    <!-- Main Title Heading (Multi-line bold text) -->
    <g transform="translate(35, 95)">
      ${escapedTitleLines.map((line, idx) => `
        <text x="0" y="${idx * 46}" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="${escapedTitleLines.length > 2 ? '32' : '36'}" fill="#FFFFFF" filter="url(#dropShadow)">
          ${line}
        </text>
      `).join('')}
    </g>

    <!-- KEY DETAILS TILES / PILLS (Bottom inside card) -->
    <g transform="translate(35, 260)">
      <!-- Tile 1: Last Date -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="310" height="85" rx="12" fill="#7F1D1D" stroke="#EF4444" stroke-width="2" />
        <text x="20" y="30" font-family="Arial, sans-serif" font-weight="700" font-size="13" fill="#FECACA">⏰ LAST DATE TO APPLY</text>
        <text x="20" y="62" font-family="Arial, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF">${escapedLastDate.slice(0, 24)}</text>
      </g>

      <!-- Tile 2: Total Posts / Vacancies -->
      <g transform="translate(330, 0)">
        <rect x="0" y="0" width="310" height="85" rx="12" fill="#14532D" stroke="#22C55E" stroke-width="2" />
        <text x="20" y="30" font-family="Arial, sans-serif" font-weight="700" font-size="13" fill="#BBF7D0">👥 TOTAL POSTS / VACANCIES</text>
        <text x="20" y="62" font-family="Arial, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF">${escapedPosts.slice(0, 22)}</text>
      </g>

      <!-- Tile 3: Eligibility / Qualifications -->
      <g transform="translate(660, 0)">
        <rect x="0" y="0" width="340" height="85" rx="12" fill="#1E3A8A" stroke="#3B82F6" stroke-width="2" />
        <text x="20" y="30" font-family="Arial, sans-serif" font-weight="700" font-size="13" fill="#BFDBFE">🎓 ELIGIBILITY CRITERIA</text>
        <text x="20" y="60" font-family="Arial, sans-serif" font-weight="800" font-size="15" fill="#FFFFFF">${escapedEligibility.slice(0, 32)}</text>
      </g>
    </g>
  </g>

  <!-- BOTTOM FOOTER BRANDING BAR -->
  <g transform="translate(65, 525)">
    <!-- Black / Gold pill bar -->
    <rect x="0" y="0" width="1070" height="60" rx="12" fill="#020617" stroke="#F59E0B" stroke-width="2.5" filter="url(#dropShadow)" />
    
    <text x="35" y="37" font-family="Arial, sans-serif" font-weight="900" font-size="22" fill="#FDE047" letter-spacing="1">
      cscdost.com (Since 2018)
    </text>

    <text x="1035" y="37" font-family="Arial, sans-serif" font-weight="800" font-size="18" fill="#FFFFFF" text-anchor="end">
      👉 Apply Online &amp; Download Notice at www.cscdost.com
    </text>
  </g>
</svg>`;
}

/**
 * Render PNG Buffer from SVG using Sharp with sharp resolution
 */
export async function generateOgPng(item?: Partial<SarkariItem> | null): Promise<Buffer> {
  const svgString = generateOgSvg(item);
  return sharp(Buffer.from(svgString))
    .png({ quality: 90, compressionLevel: 8 })
    .toBuffer();
}

/**
 * Generates a 1200x630 social preview variant incorporating the approved
 * post thumbnail (2048x677) within a standard Open Graph frame.
 * Preserves the original 2048x677 website thumbnail while ensuring social platforms
 * (WhatsApp, Facebook, Twitter, LinkedIn) display the card without clipping.
 */
export async function generateSocialPreviewPng(
  item?: Partial<SarkariItem> | null
): Promise<Buffer> {
  // If no post exists, return the default CSC DOST 1200x630 artwork
  if (!item || !item.id) {
    const defaultBannerPath = path.join(process.cwd(), 'public', 'og-banner.png');
    if (fs.existsSync(defaultBannerPath)) {
      try {
        return fs.readFileSync(defaultBannerPath);
      } catch (e) {}
    }
    return generateOgPng(null);
  }

  try {
    let thumbBuffer: Buffer | null = null;

    // 1. Check if a pre-generated local 2048x677 thumbnail exists
    const candidates = [
      path.join(process.cwd(), 'public', 'thumbnails', `${item.id}.png`),
      path.join(process.cwd(), 'public', 'thumbnails', `${item.id}.webp`),
      item.id === 'jkssb-class-iv-recruitment-2026' || item.id === 'preset-jkssb-class-iv'
        ? path.join(process.cwd(), 'public', 'thumbnails', 'test-jkssb-class-iv.png')
        : null,
      item.id === 'ignou-admission-2026-july-session'
        ? path.join(process.cwd(), 'public', 'thumbnails', 'test-ignou-admission.png')
        : null,
      item.id === 'jkbose-class-10-result-2026'
        ? path.join(process.cwd(), 'public', 'thumbnails', 'test-jkbose-class-10-result.png')
        : null
    ].filter(Boolean) as string[];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        try {
          thumbBuffer = fs.readFileSync(p);
          break;
        } catch (e) {}
      }
    }

    // 2. If no thumbnail file is cached on disk, render it from the master template engine
    if (!thumbBuffer) {
      const spec = buildDeterministicThumbnailSpec({
        id: item.id,
        title: item.title || 'CSC DOST Citizen Update',
        category: item.category,
        department: item.department,
        postType: item.postType,
        shortInfo: item.shortInfo,
        startDate: item.startDate,
        lastDate: item.lastDate,
        status: item.status
      });
      thumbBuffer = await renderMasterThumbnailBuffer(spec, 'png');
    }

    // 3. Resize 2048x677 thumbnail to fit standard 1200x630 canvas (1160 x 383 px)
    const resizedThumb = await sharp(thumbBuffer)
      .resize(1160, 383, { fit: 'fill' })
      .png()
      .toBuffer();

    const categoryLabel = (
      (item.category && SARKARI_CATEGORIES[item.category as any]?.label) ||
      'OFFICIAL NOTIFICATION'
    ).toUpperCase();

    const bgSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="socialBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#071533" />
          <stop offset="50%" stop-color="#092556" />
          <stop offset="100%" stop-color="#051026" />
        </linearGradient>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.5"/>
        </filter>
      </defs>

      <!-- Background Canvas (1200 x 630) -->
      <rect width="1200" height="630" fill="url(#socialBg)" />
      <rect x="8" y="8" width="1184" height="614" rx="20" fill="none" stroke="#1E3A8A" stroke-width="2" />

      <!-- Top Header Branding Bar -->
      <g filter="url(#shadow)">
        <rect x="20" y="20" width="1160" height="82" rx="14" fill="#0D1F47" stroke="#2563EB" stroke-width="1.5" />
        
        <!-- CSC DOST Logo Circle -->
        <circle cx="68" cy="61" r="28" fill="#2563EB" />
        <text x="68" y="67" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="15" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">CSC</text>
        
        <text x="110" y="55" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF" letter-spacing="0.5">CSC DOST</text>
        <text x="110" y="77" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="600" font-size="13" fill="#93C5FD">Official Citizen Notice Desk • cscdost.com</text>
        
        <!-- Category Badge Pill -->
        <rect x="880" y="38" width="280" height="46" rx="10" fill="#1E3A8A" stroke="#60A5FA" stroke-width="1" />
        <text x="1020" y="66" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="800" font-size="13" fill="#FDE047" text-anchor="middle" letter-spacing="0.5">${escapeXml(categoryLabel.slice(0, 26))}</text>
      </g>

      <!-- Bottom Supporting Action Bar -->
      <g filter="url(#shadow)">
        <rect x="20" y="528" width="1160" height="82" rx="14" fill="#0D1F47" stroke="#1E3A8A" stroke-width="1.5" />
        <text x="45" y="575" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="800" font-size="17" fill="#FDE047">⚡ Easy and Reliable Online Application Assistance</text>
        <text x="1155" y="575" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="800" font-size="17" fill="#FFFFFF" text-anchor="end">Apply Online at www.cscdost.com 👉</text>
      </g>
    </svg>`;

    return await sharp(Buffer.from(bgSvg))
      .composite([
        {
          input: resizedThumb,
          left: 20,
          top: 124
        }
      ])
      .png({ quality: 94, compressionLevel: 7 })
      .toBuffer();
  } catch (err) {
    console.warn('[OG] Error generating composite 1200x630 social variant, falling back:', err);
    return generateOgPng(item);
  }
}

/**
 * Generate Service Item SVG
 */
export function generateServiceOgSvg(service: ServiceItem): string {
  const escapedName = escapeXml(service.name);
  const escapedPrice = escapeXml(service.price);
  const escapedTime = escapeXml(service.estimatedTime);
  const escapedCategory = escapeXml(service.category);
  const escapedDesc = escapeXml(service.description);
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
    <text x="55" y="44" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#FDE047" text-anchor="middle">CSC DOST</text>
    <text x="55" y="64" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" text-anchor="middle">SERVICES</text>
  </g>

  <g transform="translate(195, 48)" filter="url(#dropShadow)">
    <rect x="0" y="0" width="620" height="62" rx="14" fill="#0284C7" stroke="#38BDF8" stroke-width="2" />
    <text x="310" y="40" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle">
      ONLINE CITIZEN E-SERVICES
    </text>
  </g>

  <!-- CONTENT -->
  <g transform="translate(65, 140)">
    <rect x="0" y="0" width="1070" height="370" rx="20" fill="#FFFFFF" fill-opacity="0.05" stroke="#334155" stroke-width="2" />
    
    <text x="40" y="70" font-family="Arial, sans-serif" font-weight="900" font-size="42" fill="#FFFFFF" filter="url(#dropShadow)">
      ${escapedName}
    </text>

    ${descLines.map((l, idx) => `
      <text x="40" y="${130 + idx * 35}" font-family="Arial, sans-serif" font-weight="500" font-size="22" fill="#94A3B8">
        ${l}
      </text>
    `).join('')}

    <g transform="translate(40, 240)">
      <rect x="0" y="0" width="300" height="90" rx="12" fill="#14532D" stroke="#22C55E" stroke-width="2" />
      <text x="20" y="32" font-family="Arial, sans-serif" font-weight="700" font-size="14" fill="#BBF7D0">ESTIMATED FEE</text>
      <text x="20" y="68" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF">${escapedPrice}</text>
    </g>

    <g transform="translate(370, 240)">
      <rect x="0" y="0" width="300" height="90" rx="12" fill="#1E3A8A" stroke="#3B82F6" stroke-width="2" />
      <text x="20" y="32" font-family="Arial, sans-serif" font-weight="700" font-size="14" fill="#BFDBFE">PROCESSING TIME</text>
      <text x="20" y="68" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF">${escapedTime}</text>
    </g>
  </g>

  <!-- FOOTER -->
  <g transform="translate(65, 530)">
    <rect x="0" y="0" width="1070" height="55" rx="12" fill="#020617" stroke="#F59E0B" stroke-width="2" />
    <text x="30" y="35" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="#FDE047">
      cscdost.com • Authorized Common Service Center
    </text>
    <text x="1040" y="35" font-family="Arial, sans-serif" font-weight="800" font-size="18" fill="#FFFFFF" text-anchor="end">
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
