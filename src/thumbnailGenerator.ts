import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { GoogleGenAI, Type } from '@google/genai';
import { SarkariItem, SARKARI_CATEGORIES } from './data/sarkariData';

export const THUMBNAIL_WIDTH = 1200;
export const THUMBNAIL_HEIGHT = 630;

export type SupportedCategoryStyle =
  | 'jkssb'
  | 'army_jobs'
  | 'rrb_jobs'
  | 'ssc_jobs'
  | 'exam_forms'
  | 'admissions'
  | 'cluster_univ'
  | 'default';

export interface ThumbnailSpec {
  // 1200x630 Approved Social Reference Fields
  category: SupportedCategoryStyle | string;
  orgTitle: string;            // e.g. "JKSSB", "INDIAN ARMY", "RAILWAY / RRB", "STAFF SELECTION COMM."
  postBadgeTitle: string;      // e.g. "CLASS IV", "TES-57 (10+2)", "JE CIVIL (PWD)", "NTPC (UG)"
  badgeLabel?: string;         // e.g. "JOB ALERT", "UNIVERSITY UPDATE"
  eligibilityLabel: string;    // default "Eligibility:"
  eligibilityValue: string;    // e.g. "10th / 12th Pass", "BE/B.Tech (Civil)", "See notification"
  lastDateLabel: string;       // default "Last date:"
  lastDateValue: string;       // e.g. "25/03/2026", "Check website"
  howToApplyLabel: string;     // default "How to apply:"
  howToApplyValue: string;     // default "Visit CSC DOST"
  logoOption?: 'preset' | 'custom' | 'placeholder';
  logoUrl?: string;            // Custom uploaded logo or data URL
  customThumbnailUrl?: string; // If admin uploaded a manual custom thumbnail

  // Backward-compatibility aliases for legacy code
  mainHeadingLeft?: string;
  redBadgeText?: string;
  secondHeading?: string;
  yellowBannerPrefix?: string;
  yellowBannerHighlight?: string;
  fourIcons?: [string, string, string, string];
  laptopTitle?: string;
  laptopSubtitle?: string;
  footerLine1?: string;
  footerLine2?: string;
  ctaButtonText?: 'APPLY NOW' | 'CHECK RESULT' | 'READ DETAILS';
}

export interface ThumbnailInputPayload {
  id?: string;
  title: string;
  category?: string;
  department?: string;
  postType?: 'Job' | 'Admission' | 'Result' | 'Scheme' | 'Service' | 'Guide' | string;
  shortInfo?: string;
  startDate?: string;
  lastDate?: string;
  eligibility?: string;
  totalPosts?: string;
  status?: 'Open' | 'Closed' | 'Result' | 'Informational' | string;
  customOverrides?: Partial<ThumbnailSpec>;
}

import { fileURLToPath } from 'url';

// Load and cache embedded TrueType fonts as Base64 for deterministic serverless rasterization (Sharp / librsvg)
let embeddedFontBase64Bold = '';
let embeddedFontBase64Regular = '';

try {
  let currentDir = process.cwd();
  try {
    currentDir = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));
  } catch {
    currentDir = process.cwd();
  }

  const boldCandidates = [
    path.join(currentDir, 'assets/fonts/LiberationSans-Bold.ttf'),
    path.join(process.cwd(), 'src/assets/fonts/LiberationSans-Bold.ttf'),
    '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
  ];
  for (const p of boldCandidates) {
    if (fs.existsSync(p)) {
      embeddedFontBase64Bold = fs.readFileSync(p).toString('base64');
      break;
    }
  }

  const regularCandidates = [
    path.join(currentDir, 'assets/fonts/LiberationSans-Regular.ttf'),
    path.join(process.cwd(), 'src/assets/fonts/LiberationSans-Regular.ttf'),
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
  ];
  for (const p of regularCandidates) {
    if (fs.existsSync(p)) {
      embeddedFontBase64Regular = fs.readFileSync(p).toString('base64');
      break;
    }
  }
} catch (e) {
  console.warn('Could not read font files for base64 embedding:', e);
}

export function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface CategoryThemeConfig {
  name: string;
  orgTitle: string;
  primaryColor: string;
  secondaryColor: string;
  pillBg: string;
  pillText: string;
  isPillGradient: boolean;
  card1Bg: string;
  card1Border: string;
  card2Bg: string;
  card2Border: string;
  card3Bg: string;
  card3Border: string;
  waveRibbon: string;
  waveFill: string;
  bottomPillBg: string;
  hasTicks: boolean;
  badgeLabel: string;
}

export const CATEGORY_THEMES: Record<string, CategoryThemeConfig> = {
  jkssb: {
    name: 'JKSSB (Royal Blue & Orange)',
    orgTitle: 'JKSSB',
    primaryColor: '#0047BA', // Royal Blue
    secondaryColor: '#FF6A00', // Vibrant Orange
    pillBg: '#FF6A00',
    pillText: '#FFFFFF',
    isPillGradient: false,
    card1Bg: '#F0F6FE',
    card1Border: '#D0E1FD',
    card2Bg: '#FFF8F1',
    card2Border: '#FCD9BD',
    card3Bg: '#F0F6FE',
    card3Border: '#D0E1FD',
    waveRibbon: '#FF6A00',
    waveFill: '#0047BA',
    bottomPillBg: '#00368F',
    hasTicks: true,
    badgeLabel: 'JOB ALERT'
  },
  army_jobs: {
    name: 'Indian Army (Olive Green & Gold)',
    orgTitle: 'INDIAN ARMY',
    primaryColor: '#1E4620', // Olive Green
    secondaryColor: '#C89B2B', // Metallic Gold
    pillBg: 'url(#goldMetallicGrad)',
    pillText: '#1E4620',
    isPillGradient: true,
    card1Bg: '#F3F7F2',
    card1Border: '#CFDEC9',
    card2Bg: '#FBF8EE',
    card2Border: '#EFE5C2',
    card3Bg: '#F3F7F2',
    card3Border: '#CFDEC9',
    waveRibbon: '#C89B2B',
    waveFill: '#1E4620',
    bottomPillBg: '#133015',
    hasTicks: false,
    badgeLabel: 'DEFENCE RECRUITMENT'
  },
  rrb_jobs: {
    name: 'Railways / RRB (Navy Blue & Orange)',
    orgTitle: 'RAILWAY / RRB',
    primaryColor: '#0B2545', // Deep Navy
    secondaryColor: '#FF6A00', // Vibrant Orange
    pillBg: '#FF6A00',
    pillText: '#FFFFFF',
    isPillGradient: false,
    card1Bg: '#F0F5FA',
    card1Border: '#C9D8E8',
    card2Bg: '#FFF8F1',
    card2Border: '#FCD9BD',
    card3Bg: '#F0F5FA',
    card3Border: '#C9D8E8',
    waveRibbon: '#FF6A00',
    waveFill: '#0B2545',
    bottomPillBg: '#081C35',
    hasTicks: true,
    badgeLabel: 'RAILWAY JOBS'
  },
  ssc_jobs: {
    name: 'SSC (Navy Blue & Teal)',
    orgTitle: 'STAFF SELECTION COMM.',
    primaryColor: '#0A2540', // Deep Navy
    secondaryColor: '#008080', // Teal
    pillBg: '#008080',
    pillText: '#FFFFFF',
    isPillGradient: false,
    card1Bg: '#F0F9F9',
    card1Border: '#BCE4E4',
    card2Bg: '#F0F5FA',
    card2Border: '#C9D8E8',
    card3Bg: '#F0F9F9',
    card3Border: '#BCE4E4',
    waveRibbon: '#008080',
    waveFill: '#0A2540',
    bottomPillBg: '#081D33',
    hasTicks: true,
    badgeLabel: 'SSC RECRUITMENT'
  },
  exam_forms: {
    name: 'Kashmir University (Navy & Teal)',
    orgTitle: 'KASHMIR UNIVERSITY',
    primaryColor: '#0B2545', // Deep Navy
    secondaryColor: '#028090', // Teal / Cyan
    pillBg: '#028090',
    pillText: '#FFFFFF',
    isPillGradient: false,
    card1Bg: '#F0F9F9',
    card1Border: '#BDE5E8',
    card2Bg: '#F0F5FA',
    card2Border: '#C9D8E8',
    card3Bg: '#F0F9F9',
    card3Border: '#BDE5E8',
    waveRibbon: '#028090',
    waveFill: '#0B2545',
    bottomPillBg: '#081C35',
    hasTicks: true,
    badgeLabel: 'UNIVERSITY UPDATE'
  },
  admissions: {
    name: 'Admissions / University Notice',
    orgTitle: 'KASHMIR UNIVERSITY',
    primaryColor: '#0B2545',
    secondaryColor: '#028090',
    pillBg: '#028090',
    pillText: '#FFFFFF',
    isPillGradient: false,
    card1Bg: '#F0F9F9',
    card1Border: '#BDE5E8',
    card2Bg: '#FFF8F1',
    card2Border: '#FCD9BD',
    card3Bg: '#F0F9F9',
    card3Border: '#BDE5E8',
    waveRibbon: '#028090',
    waveFill: '#0B2545',
    bottomPillBg: '#081C35',
    hasTicks: true,
    badgeLabel: 'ADMISSION NOTICE'
  },
  cluster_univ: {
    name: 'Cluster University (Royal Blue & Orange)',
    orgTitle: 'CLUSTER UNIVERSITY',
    primaryColor: '#0047BA', // Royal Blue
    secondaryColor: '#FF7900', // Orange
    pillBg: '#FF7900',
    pillText: '#FFFFFF',
    isPillGradient: false,
    card1Bg: '#F0F6FE',
    card1Border: '#D0E1FD',
    card2Bg: '#FFF8F1',
    card2Border: '#FCD9BD',
    card3Bg: '#F0F6FE',
    card3Border: '#D0E1FD',
    waveRibbon: '#FF7900',
    waveFill: '#0047BA',
    bottomPillBg: '#00368F',
    hasTicks: true,
    badgeLabel: 'UNIVERSITY UPDATE'
  },
  default: {
    name: 'CSC DOST Default (Royal Blue & Orange)',
    orgTitle: 'CSC DOST',
    primaryColor: '#0047BA',
    secondaryColor: '#FF6A00',
    pillBg: '#FF6A00',
    pillText: '#FFFFFF',
    isPillGradient: false,
    card1Bg: '#F0F6FE',
    card1Border: '#D0E1FD',
    card2Bg: '#FFF8F1',
    card2Border: '#FCD9BD',
    card3Bg: '#F0F6FE',
    card3Border: '#D0E1FD',
    waveRibbon: '#FF6A00',
    waveFill: '#0047BA',
    bottomPillBg: '#00368F',
    hasTicks: true,
    badgeLabel: 'JOB ALERT'
  }
};

/**
 * Extracts a punchy, specific post role/badge title from full notification title.
 * Examples:
 * - "JKSSB Advt 11 of 2026 JE Civil (PWD) Recruitment" -> "JE CIVIL (PWD)"
 * - "Indian Army 10+2 Technical Entry Scheme (TES-57 Course)" -> "TES-57 (10+2)"
 * - "JKSSB Class IV Recruitment 2026" -> "CLASS IV"
 * - "RRB NTPC Undergraduate (CEN 07/2026)" -> "NTPC (UG) CEN 07/2026"
 */
export function extractSpecificPostRole(title: string, category: string): string {
  const cleanTitle = (title || '').trim();
  const upper = cleanTitle.toUpperCase();

  // 1. Direct regex patterns for high-frequency terms
  if (upper.includes('TES-57')) return 'TES-57 (10+2)';
  if (upper.includes('TES-54')) return 'TES-54 (10+2)';
  if (upper.includes('TES-55')) return 'TES-55 (10+2)';
  if (upper.includes('CLASS IV') || upper.includes('CLASS-IV')) return 'CLASS IV';
  if (upper.includes('JE CIVIL')) return 'JE CIVIL (PWD)';
  if (upper.includes('JUNIOR ASSISTANT')) return 'JUNIOR ASSISTANT';
  if (upper.includes('FORESTER')) return 'FORESTER';
  if (upper.includes('SUB INSPECTOR') || upper.includes('SUB-INSPECTOR') || upper.includes('SI RECRUITMENT')) return 'SUB-INSPECTOR';
  if (upper.includes('PATWARI')) return 'PATWARI';
  if (upper.includes('AGNIVEER')) return 'AGNIVEER RALLY';
  if (upper.includes('CHSL')) return 'CHSL (10+2)';
  if (upper.includes('CGL')) return 'CGL EXAM';
  if (upper.includes('GD CONSTABLE') || (upper.includes('SSC') && upper.includes('CONSTABLE'))) return 'GD CONSTABLE';
  if (upper.includes('MTS')) return 'MTS / HAVALDAR';
  if (upper.includes('NTPC')) return 'NTPC (UG)';
  if (upper.includes('TECHNICIAN')) return 'TECHNICIAN';
  if (upper.includes('ALP')) return 'ASSISTANT LOCO PILOT';
  if (upper.includes('RPF')) return 'RPF CONSTABLE / SI';
  if (upper.includes('B.ED') && upper.includes('DYD')) return 'B.ED 4TH SEM (DYD)';
  if (upper.includes('B.TECH')) return 'B.TECH ENGG EXAM';
  if (upper.includes('BG 1ST') || upper.includes('BG 2ND') || upper.includes('1ST & 2ND SEM')) return 'BG 1ST & 2ND SEM';
  if (upper.includes('INTEGRATED PG') || upper.includes('SPOT ROUND')) return 'INTEGRATED PG ADMISSION';

  // 2. Extract parentheses content if meaningful (e.g. "JE Civil (PWD)", "NTPC (CEN 07/2026)")
  const parenMatch = cleanTitle.match(/\(([A-Za-z0-9+–—\s/]{3,24})\)/);
  if (parenMatch && !parenMatch[1].toLowerCase().includes('advt') && !parenMatch[1].toLowerCase().includes('notice')) {
    return parenMatch[1].trim().toUpperCase();
  }

  // 3. Clean common boilerplate words to find core role
  let stripped = cleanTitle
    .replace(/^JKSSB\s+/i, '')
    .replace(/^Indian Army\s+/i, '')
    .replace(/^RRB\s+/i, '')
    .replace(/^SSC\s+/i, '')
    .replace(/^Cluster University Srinagar\s+/i, '')
    .replace(/^University of Kashmir\s+/i, '')
    .replace(/^CUS\s+/i, '')
    .replace(/^KU\s+/i, '')
    .replace(/Online Form\s*\d*/gi, '')
    .replace(/Apply Online\s*\d*/gi, '')
    .replace(/Recruitment\s*\d*/gi, '')
    .replace(/Notification\s*\d*/gi, '')
    .replace(/Examination\s*\d*/gi, '')
    .replace(/Session\s*\d*[-–]?\d*/gi, '')
    .replace(/\b202[4-9]\b/g, '')
    .replace(/Advt\.?\s*No\.?\s*[\d/A-Z-]+/gi, '')
    .replace(/[-–—:]+/g, ' ')
    .trim();

  // Keep first 28 characters
  if (stripped.length > 28) {
    const words = stripped.split(/\s+/);
    stripped = words.slice(0, 3).join(' ');
  }

  return (stripped || (category === 'admissions' ? 'ADMISSION NOTICE' : 'RECRUITMENT NOTICE')).toUpperCase().slice(0, 32);
}

/**
 * Deterministic rule-based extractor that converts any CSC DOST post input
 * into the 1200x630 reference ThumbnailSpec.
 */
export function buildDeterministicThumbnailSpec(input: ThumbnailInputPayload): ThumbnailSpec {
  const rawTitle = (input.title || '').trim();
  const titleUpper = rawTitle.toUpperCase();
  const rawCategory = (input.category || '').toLowerCase();
  const statusLower = (input.status || '').toLowerCase();

  // Resolve matching category style
  let style: SupportedCategoryStyle = 'default';
  if (rawCategory === 'jkssb' || titleUpper.includes('JKSSB')) {
    style = 'jkssb';
  } else if (rawCategory === 'army_jobs' || titleUpper.includes('ARMY') || titleUpper.includes('AGNIVEER')) {
    style = 'army_jobs';
  } else if (rawCategory === 'rrb_jobs' || titleUpper.includes('RRB') || titleUpper.includes('RAILWAY')) {
    style = 'rrb_jobs';
  } else if (rawCategory === 'ssc_jobs' || titleUpper.includes('SSC')) {
    style = 'ssc_jobs';
  } else if (rawCategory === 'cluster_univ' || titleUpper.includes('CLUSTER UNIVERSITY') || titleUpper.includes('CUS')) {
    style = 'cluster_univ';
  } else if (
    rawCategory === 'exam_forms' ||
    titleUpper.includes('KASHMIR UNIVERSITY') ||
    titleUpper.includes('EXAM FORM') ||
    titleUpper.includes('DATE SHEET')
  ) {
    style = 'exam_forms';
  } else if (rawCategory === 'admissions' || titleUpper.includes('ADMISSION')) {
    style = titleUpper.includes('CLUSTER') ? 'cluster_univ' : 'admissions';
  }

  const theme = CATEGORY_THEMES[style] || CATEGORY_THEMES.default;

  // Org Title
  let orgTitle = theme.orgTitle;
  if (input.department && input.department.trim().length <= 26) {
    orgTitle = input.department.trim().toUpperCase();
  } else if (titleUpper.includes('INDIAN ARMY')) {
    orgTitle = 'INDIAN ARMY';
  } else if (titleUpper.includes('JKSSB')) {
    orgTitle = 'JKSSB';
  } else if (titleUpper.includes('RAILWAY') || titleUpper.includes('RRB')) {
    orgTitle = 'RAILWAY / RRB';
  } else if (titleUpper.includes('SSC')) {
    orgTitle = 'STAFF SELECTION COMM.';
  } else if (titleUpper.includes('KASHMIR UNIV') || titleUpper.includes('KU ')) {
    orgTitle = 'KASHMIR UNIVERSITY';
  } else if (titleUpper.includes('CLUSTER UNIV') || titleUpper.includes('CUS')) {
    orgTitle = 'CLUSTER UNIVERSITY';
  }

  // Specific post role pill title
  const postBadgeTitle = extractSpecificPostRole(rawTitle, style);

  // Extract clean, concise eligibility text
  let eligibilityValue = 'See notification';
  if (input.eligibility && input.eligibility.trim()) {
    const rawEl = input.eligibility.trim();
    if (rawEl.length <= 24) {
      eligibilityValue = rawEl;
    } else {
      // Pick key credentials: e.g. "10th", "12th", "Graduate", "Diploma", "BE/B.Tech", "PCM"
      const credMatches = rawEl.match(/\b(10th|12th|10\+2|Graduate|Post\s*Graduate|Diploma|BE\/B\.Tech|Degree|B\.Ed|B\.Tech|ITI)\b/gi);
      if (credMatches && credMatches.length > 0) {
        eligibilityValue = Array.from(new Set(credMatches.map(c => c.trim()))).slice(0, 2).join(' / ') + ' Pass';
      } else {
        eligibilityValue = rawEl.slice(0, 22).trim() + '...';
      }
    }
  }

  // Extract clean last date
  let lastDateValue = 'Check website';
  if (input.lastDate && input.lastDate.trim()) {
    lastDateValue = input.lastDate.trim();
  } else if (statusLower === 'closed') {
    lastDateValue = 'Closed / Archive';
  }

  const howToApplyValue = 'Visit CSC DOST';

  // Only preset verified logo if the category has an official verified vector emblem
  const hasVerifiedPreset = [
    'jkssb',
    'army_jobs',
    'rrb_jobs',
    'ssc_jobs',
    'exam_forms',
    'admissions',
    'cluster_univ'
  ].includes(style);

  const logoOption: 'preset' | 'custom' | 'placeholder' = input.customOverrides?.logoUrl
    ? 'custom'
    : hasVerifiedPreset
    ? 'preset'
    : 'placeholder';

  return {
    category: style,
    orgTitle,
    postBadgeTitle,
    badgeLabel: theme.badgeLabel,
    eligibilityLabel: 'Eligibility:',
    eligibilityValue,
    lastDateLabel: 'Last date:',
    lastDateValue,
    howToApplyLabel: 'How to apply:',
    howToApplyValue,
    logoOption,

    // Legacy fields for backward compatibility
    mainHeadingLeft: orgTitle,
    redBadgeText: postBadgeTitle,
    secondHeading: 'ONLINE APPLICATION',
    yellowBannerPrefix: 'Apply Through ',
    yellowBannerHighlight: 'CSC DOST',
    fourIcons: [
      'Form Assistance',
      'Document Upload',
      'Fee Verification',
      'Candidate Support'
    ],
    laptopTitle: orgTitle.slice(0, 10),
    laptopSubtitle: 'Online Service Portal',
    footerLine1: 'Get Easy and Reliable Online Assistance',
    footerLine2: `for ${orgTitle} ${postBadgeTitle}`,
    ctaButtonText: statusLower === 'closed' ? 'READ DETAILS' : 'APPLY NOW',

    ...input.customOverrides
  };
}

/**
 * Returns embedded vector SVG for verified organization logos
 */
function getVerifiedLogoVector(category: string, primaryColor: string): string {
  switch (category) {
    case 'army_jobs':
      // Indian Army crossed swords & emblem
      return `<g transform="translate(18, 15)">
        <circle cx="100" cy="95" r="75" fill="#1E4620" fill-opacity="0.08" stroke="#1E4620" stroke-width="2" />
        <!-- Crossed Swords -->
        <line x1="55" y1="50" x2="145" y2="140" stroke="#C89B2B" stroke-width="6" stroke-linecap="round" />
        <line x1="145" y1="50" x2="55" y2="140" stroke="#C89B2B" stroke-width="6" stroke-linecap="round" />
        <!-- Central Shield -->
        <path d="M 82 70 L 118 70 L 118 100 Q 118 122, 100 130 Q 82 122, 82 100 Z" fill="#1E4620" stroke="#C89B2B" stroke-width="2.5" />
        <circle cx="100" cy="90" r="10" fill="#F3DF79" />
        <text x="100" y="185" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="14" fill="#1E4620" text-anchor="middle" letter-spacing="1">INDIAN ARMY</text>
      </g>`;

    case 'jkssb':
      // JKSSB circular seal with scales of justice
      return `<g transform="translate(18, 15)">
        <circle cx="100" cy="95" r="75" fill="#0047BA" fill-opacity="0.06" stroke="#0047BA" stroke-width="2" />
        <circle cx="100" cy="95" r="65" fill="none" stroke="#FF6A00" stroke-width="1.5" stroke-dasharray="4,3" />
        <!-- Scales of justice -->
        <line x1="100" y1="58" x2="100" y2="128" stroke="#0047BA" stroke-width="4" stroke-linecap="round" />
        <line x1="70" y1="72" x2="130" y2="72" stroke="#0047BA" stroke-width="3.5" />
        <path d="M 60 92 L 80 92 L 70 72 Z" fill="#FF6A00" />
        <path d="M 120 92 L 140 92 L 130 72 Z" fill="#FF6A00" />
        <rect x="85" y="124" width="30" height="8" rx="2" fill="#0047BA" />
        <text x="100" y="185" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="16" fill="#0047BA" text-anchor="middle" letter-spacing="1">JKSSB</text>
      </g>`;

    case 'rrb_jobs':
      // Railways Locomotive emblem
      return `<g transform="translate(18, 15)">
        <circle cx="100" cy="95" r="75" fill="#0B2545" fill-opacity="0.06" stroke="#0B2545" stroke-width="2" />
        <!-- Train silhouette -->
        <rect x="74" y="62" width="52" height="58" rx="8" fill="#0B2545" stroke="#FF6A00" stroke-width="2.5" />
        <circle cx="100" cy="80" r="10" fill="#FF6A00" />
        <circle cx="85" cy="106" r="4" fill="#FFFFFF" />
        <circle cx="115" cy="106" r="4" fill="#FFFFFF" />
        <path d="M 68 126 L 132 126" stroke="#0B2545" stroke-width="4" stroke-linecap="round" />
        <line x1="80" y1="126" x2="72" y2="136" stroke="#0B2545" stroke-width="3" />
        <line x1="120" y1="126" x2="128" y2="136" stroke="#0B2545" stroke-width="3" />
        <text x="100" y="185" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="14" fill="#0B2545" text-anchor="middle" letter-spacing="1">INDIAN RAILWAYS</text>
      </g>`;

    case 'ssc_jobs':
      // Staff Selection Commission emblem
      return `<g transform="translate(18, 15)">
        <circle cx="100" cy="95" r="75" fill="#0A2540" fill-opacity="0.06" stroke="#0A2540" stroke-width="2" />
        <circle cx="100" cy="95" r="62" fill="none" stroke="#008080" stroke-width="2" />
        <!-- Ashoka pillar base & stars -->
        <rect x="90" y="65" width="20" height="42" rx="3" fill="#0A2540" />
        <polygon points="100,52 104,60 114,60 106,66 109,76 100,70 91,76 94,66 86,60 96,60" fill="#008080" />
        <rect x="80" y="112" width="40" height="8" rx="2" fill="#0A2540" />
        <text x="100" y="185" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="16" fill="#0A2540" text-anchor="middle" letter-spacing="1">SSC</text>
      </g>`;

    case 'exam_forms':
    case 'admissions':
      // University of Kashmir chinar crest
      return `<g transform="translate(18, 15)">
        <circle cx="100" cy="95" r="75" fill="#0B2545" fill-opacity="0.06" stroke="#0B2545" stroke-width="2" />
        <!-- Chinar leaf shape -->
        <path d="M 100 55 C 90 70, 70 75, 76 95 C 80 102, 88 98, 92 110 C 95 116, 98 128, 100 132 C 102 128, 105 116, 108 110 C 112 98, 120 102, 124 95 C 130 75, 110 70, 100 55 Z" fill="#028090" />
        <circle cx="100" cy="92" r="6" fill="#FFFFFF" />
        <text x="100" y="185" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="13" fill="#0B2545" text-anchor="middle" letter-spacing="0.5">KASHMIR UNIV</text>
      </g>`;

    case 'cluster_univ':
      // Cluster University Srinagar crest
      return `<g transform="translate(18, 15)">
        <circle cx="100" cy="95" r="75" fill="#0047BA" fill-opacity="0.06" stroke="#0047BA" stroke-width="2" />
        <!-- Open book + shikara -->
        <path d="M 72 85 Q 100 95, 100 115 Q 100 95, 128 85 L 128 108 Q 100 118, 100 132 Q 100 118, 72 108 Z" fill="#0047BA" />
        <path d="M 80 72 L 120 72 L 100 56 Z" fill="#FF7900" />
        <text x="100" y="185" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="14" fill="#0047BA" text-anchor="middle" letter-spacing="1">CUS SRINAGAR</text>
      </g>`;

    default:
      // Return empty - omit logo box if no verified logo is available
      return '';
  }
}

/**
 * Generates the 1200 x 630 Master Social Preview SVG strictly matching
 * the approved reference images provided by the user.
 */
export function renderStandaloneMasterThumbnailSvg(spec: ThumbnailSpec): string {
  const theme = CATEGORY_THEMES[spec.category] || CATEGORY_THEMES.default;
  const orgTitle = escapeXml(spec.orgTitle || theme.orgTitle);
  const postBadgeTitle = escapeXml(spec.postBadgeTitle || 'OFFICIAL NOTIFICATION');

  const elLabel = escapeXml(spec.eligibilityLabel || 'Eligibility:');
  const elValue = escapeXml(spec.eligibilityValue || 'See notification');

  const dateLabel = escapeXml(spec.lastDateLabel || 'Last date:');
  const dateValue = escapeXml(spec.lastDateValue || 'Check website');

  const applyLabel = escapeXml(spec.howToApplyLabel || 'How to apply:');
  const applyValue = escapeXml(spec.howToApplyValue || 'Visit CSC DOST');

  // Check if a genuine verified logo exists (or user uploaded custom logo)
  const isCustomLogo = Boolean(spec.logoUrl && spec.logoUrl.trim());
  const verifiedPresetSvg = getVerifiedLogoVector(spec.category, theme.primaryColor);
  const hasVerifiedPreset = spec.logoOption === 'preset' ? Boolean(verifiedPresetSvg) : Boolean(verifiedPresetSvg && spec.logoOption !== 'placeholder');
  const hasLogo = isCustomLogo || hasVerifiedPreset;

  let logoContentSvg = '';
  if (isCustomLogo && spec.logoUrl) {
    const safeLogoUrl = escapeXml(spec.logoUrl.trim());
    logoContentSvg = `<image href="${safeLogoUrl}" x="18" y="18" width="198" height="198" preserveAspectRatio="xMidYMid meet" />`;
  } else if (hasVerifiedPreset) {
    logoContentSvg = verifiedPresetSvg;
  }

  // Dynamic font sizing & centering based on whether logo is present
  const centerX = hasLogo ? 460 : 600;
  const orgFontSize = orgTitle.length > 22 ? 52 : orgTitle.length > 15 ? 60 : orgTitle.length > 10 ? 74 : 92;
  const badgeFontSize = postBadgeTitle.length > 24 ? 42 : postBadgeTitle.length > 16 ? 50 : 60;

  // Dynamic calculation of the central role pill banner width
  const approxTextWidth = postBadgeTitle.length * (badgeFontSize * 0.58);
  const maxPillWidth = hasLogo ? 820 : 980;
  const badgePillWidth = Math.min(maxPillWidth, Math.max(380, Math.round(approxTextWidth + 88)));
  const badgePillX = Math.round(centerX - badgePillWidth / 2);

  // Left & right burst ticks coordinates (only show when title is compact enough to avoid colliding)
  const showTicks = theme.hasTicks && orgTitle.length <= 12;
  const leftTickBaseX = hasLogo ? 85 : 120;
  const rightTickBaseX = hasLogo ? 835 : 1080;

  return `<svg width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" viewBox="0 0 ${THUMBNAIL_WIDTH} ${THUMBNAIL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Embedded TrueType Fonts for 100% Deterministic Serverless Pixel Rendering -->
    <style>
      @font-face {
        font-family: 'Liberation Sans';
        src: url('data:font/truetype;charset=utf-8;base64,${embeddedFontBase64Bold}') format('truetype');
        font-weight: 700 900;
        font-style: normal;
      }
      @font-face {
        font-family: 'Liberation Sans';
        src: url('data:font/truetype;charset=utf-8;base64,${embeddedFontBase64Regular || embeddedFontBase64Bold}') format('truetype');
        font-weight: 400 600;
        font-style: normal;
      }
      text {
        font-family: 'Liberation Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
      }
    </style>

    <!-- Metallic Gold Gradient for Indian Army -->
    <linearGradient id="goldMetallicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C59B27" />
      <stop offset="35%" stop-color="#F5DE7B" />
      <stop offset="70%" stop-color="#ECC657" />
      <stop offset="100%" stop-color="#B3861B" />
    </linearGradient>

    <!-- Subtle Clean Background Shadow -->
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.12" />
    </filter>

    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.06" />
    </filter>

    <filter id="brandPillShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Clean Pure White Background -->
  <rect width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" fill="#FFFFFF" />

  ${hasLogo && logoContentSvg ? `
  <!-- TOP RIGHT: VERIFIED OFFICIAL LOGO CONTAINER -->
  <g transform="translate(915, 45)">
    <rect x="0" y="0" width="235" height="235" rx="22" fill="#F8FAFC" stroke="${theme.primaryColor}" stroke-width="2.5" stroke-dasharray="7,7" />
    ${logoContentSvg}
  </g>
  ` : ''}

  <!-- TOP LEFT / CENTER: ORGANIZATION HEADING & POST TITLE PILL -->
  <g transform="translate(0, 0)">
    <!-- Radiating burst ticks for JKSSB / RRB / SSC / CUS -->
    ${showTicks ? `
    <!-- Left Burst Ticks -->
    <g stroke="${theme.secondaryColor}" stroke-width="7" stroke-linecap="round">
      <line x1="${leftTickBaseX}" y1="120" x2="${leftTickBaseX - 25}" y2="105" />
      <line x1="${leftTickBaseX - 5}" y1="145" x2="${leftTickBaseX - 35}" y2="145" />
      <line x1="${leftTickBaseX}" y1="170" x2="${leftTickBaseX - 25}" y2="185" />
    </g>
    <!-- Right Burst Ticks -->
    <g stroke="${theme.secondaryColor}" stroke-width="7" stroke-linecap="round">
      <line x1="${rightTickBaseX}" y1="120" x2="${rightTickBaseX + 25}" y2="105" />
      <line x1="${rightTickBaseX + 5}" y1="145" x2="${rightTickBaseX + 35}" y2="145" />
      <line x1="${rightTickBaseX}" y1="170" x2="${rightTickBaseX + 25}" y2="185" />
    </g>
    ` : ''}

    <!-- Organization Name -->
    <text x="${centerX}" y="145" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="${orgFontSize}" fill="${theme.primaryColor}" text-anchor="middle" letter-spacing="-0.5">
      ${orgTitle}
    </text>

    <!-- Post Title / Role Pill Banner -->
    <g transform="translate(${badgePillX}, 180)" filter="url(#softShadow)">
      <rect x="0" y="0" width="${badgePillWidth}" height="92" rx="26" fill="${theme.pillBg}" stroke="${theme.isPillGradient ? '#B3861B' : 'none'}" stroke-width="${theme.isPillGradient ? 1.5 : 0}" />
      <text x="${badgePillWidth / 2}" y="65" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="${badgeFontSize}" fill="${theme.pillText}" text-anchor="middle" letter-spacing="0.5">
        ${postBadgeTitle}
      </text>
    </g>
  </g>

  <!-- MIDDLE ROW: 3 INFORMATION BLOCKS -->
  <!-- CARD 1: ELIGIBILITY -->
  <g transform="translate(45, 335)" filter="url(#cardShadow)">
    <rect x="0" y="0" width="345" height="120" rx="18" fill="${theme.card1Bg}" stroke="${theme.card1Border}" stroke-width="1.5" />
    <!-- Circle Icon -->
    <circle cx="56" cy="60" r="30" fill="${theme.primaryColor}" />
    <!-- Document Icon inside Circle -->
    <g transform="translate(42, 45)" stroke="#FFFFFF" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5" y="3" width="18" height="24" rx="2" />
      <line x1="9" y1="9" x2="19" y2="9" />
      <line x1="9" y1="14" x2="19" y2="14" />
      <line x1="9" y1="19" x2="15" y2="19" />
    </g>
    <!-- Vertical Separator Line -->
    <line x1="102" y1="28" x2="102" y2="92" stroke="${theme.card1Border}" stroke-width="1.5" />
    <!-- Text Labels -->
    <text x="118" y="48" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="800" font-size="20" fill="${theme.primaryColor}">
      ${elLabel}
    </text>
    <text x="118" y="80" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="700" font-size="18" fill="#1E293B">
      ${elValue.length > 20 ? elValue.slice(0, 18) + '...' : elValue}
    </text>
  </g>

  <!-- CARD 2: LAST DATE -->
  <g transform="translate(425, 335)" filter="url(#cardShadow)">
    <rect x="0" y="0" width="350" height="120" rx="18" fill="${theme.card2Bg}" stroke="${theme.card2Border}" stroke-width="1.5" />
    <!-- Circle Icon -->
    <circle cx="56" cy="60" r="30" fill="${theme.secondaryColor}" />
    <!-- Calendar Icon inside Circle -->
    <g transform="translate(42, 45)" stroke="#FFFFFF" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="5" width="20" height="19" rx="2" />
      <line x1="4" y1="11" x2="24" y2="11" />
      <line x1="9" y1="2" x2="9" y2="6" />
      <line x1="19" y1="2" x2="19" y2="6" />
    </g>
    <!-- Vertical Separator Line -->
    <line x1="102" y1="28" x2="102" y2="92" stroke="${theme.card2Border}" stroke-width="1.5" />
    <!-- Text Labels -->
    <text x="118" y="48" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="800" font-size="20" fill="${theme.secondaryColor}">
      ${dateLabel}
    </text>
    <text x="118" y="80" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="700" font-size="18" fill="#1E293B">
      ${dateValue.length > 20 ? dateValue.slice(0, 18) + '...' : dateValue}
    </text>
  </g>

  <!-- CARD 3: HOW TO APPLY -->
  <g transform="translate(810, 335)" filter="url(#cardShadow)">
    <rect x="0" y="0" width="345" height="120" rx="18" fill="${theme.card3Bg}" stroke="${theme.card3Border}" stroke-width="1.5" />
    <!-- Circle Icon -->
    <circle cx="56" cy="60" r="30" fill="${theme.primaryColor}" />
    <!-- Cursor Pointer Icon inside Circle -->
    <g transform="translate(43, 46)">
      <path d="M 6 4 L 20 18 L 13 19 L 17 26 L 14 28 L 10 20 L 6 24 Z" fill="#FFFFFF" />
    </g>
    <!-- Vertical Separator Line -->
    <line x1="102" y1="28" x2="102" y2="92" stroke="${theme.card3Border}" stroke-width="1.5" />
    <!-- Text Labels -->
    <text x="118" y="48" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="800" font-size="20" fill="${theme.primaryColor}">
      ${applyLabel}
    </text>
    <text x="118" y="80" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="700" font-size="18" fill="#1E293B">
      ${applyValue.length > 20 ? applyValue.slice(0, 18) + '...' : applyValue}
    </text>
  </g>

  <!-- BOTTOM LAYER: DUAL WAVING RIBBONS -->
  <!-- 1. Secondary Ribbon Wave (Top Accent) -->
  <path d="M 0 520 Q 300 480, 600 525 T 1200 490 L 1200 528 Q 900 560, 600 545 T 0 538 Z" fill="${theme.waveRibbon}" />
  <!-- 2. Primary Wave (Bottom Solid Base) -->
  <path d="M 0 534 Q 300 495, 600 540 T 1200 504 L 1200 630 L 0 630 Z" fill="${theme.waveFill}" />

  <!-- CENTERED BOTTOM BRAND PILL -->
  <g transform="translate(375, 532)" filter="url(#brandPillShadow)">
    <rect x="0" y="0" width="450" height="58" rx="29" fill="${theme.bottomPillBg}" stroke="#FFFFFF" stroke-width="2" />
    
    <!-- Left Accent Dash -->
    <line x1="35" y1="29" x2="105" y2="29" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
    
    <!-- Centered Brand Domain -->
    <text x="225" y="39" font-family="'Liberation Sans', Arial, Helvetica, sans-serif" font-weight="900" font-size="26" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.8">
      cscdost.com
    </text>

    <!-- Right Accent Dash -->
    <line x1="345" y1="29" x2="415" y2="29" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
  </g>
</svg>`;
}

/**
 * Render Master Thumbnail Buffer (PNG or WebP)
 */
export async function renderMasterThumbnailBuffer(
  spec: ThumbnailSpec,
  format: 'png' | 'webp' = 'png'
): Promise<Buffer> {
  // If custom uploaded image is provided, use it directly (resize to exact 1200x630)
  if (spec.customThumbnailUrl && spec.customThumbnailUrl.startsWith('data:image')) {
    const base64Data = spec.customThumbnailUrl.split(',')[1] || spec.customThumbnailUrl;
    const buf = Buffer.from(base64Data, 'base64');
    let pipeline = sharp(buf).resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, { fit: 'cover' });
    return format === 'webp'
      ? pipeline.webp({ quality: 92 }).toBuffer()
      : pipeline.png({ quality: 94, compressionLevel: 7 }).toBuffer();
  }

  const svgString = renderStandaloneMasterThumbnailSvg(spec);
  let pipeline = sharp(Buffer.from(svgString));

  if (format === 'webp') {
    return pipeline.webp({ quality: 92 }).toBuffer();
  }
  return pipeline.png({ quality: 94, compressionLevel: 7 }).toBuffer();
}

/**
 * Helper to generate PNG directly from a SarkariItem
 */
export async function generatePostThumbnailPng(item: SarkariItem): Promise<Buffer> {
  const spec = buildDeterministicThumbnailSpec({
    id: item.id,
    title: item.title,
    category: item.category,
    department: item.department,
    postType: item.postType,
    shortInfo: item.shortInfo,
    startDate: item.startDate,
    lastDate: item.lastDate,
    eligibility: item.eligibility,
    totalPosts: item.totalPosts ? String(item.totalPosts) : undefined,
    status: item.status
  });

  return renderMasterThumbnailBuffer(spec, 'png');
}

/**
 * Helper to generate Social Preview PNG for Open Graph
 */
export async function generateSocialPreviewPng(item: SarkariItem | null): Promise<Buffer> {
  if (!item) {
    const defaultSpec = buildDeterministicThumbnailSpec({
      title: 'CSC DOST – Citizen Recruitment & Government Services Portal',
      category: 'jobs',
      eligibility: 'All Citizens',
      lastDate: 'Active Updates',
      status: 'Open'
    });
    return renderMasterThumbnailBuffer(defaultSpec, 'png');
  }

  return generatePostThumbnailPng(item);
}

/**
 * Gemini AI Extraction for structured thumbnail specs (Fallback to deterministic rules)
 */
export async function extractThumbnailSpecWithAI(input: ThumbnailInputPayload): Promise<ThumbnailSpec> {
  const baseSpec = buildDeterministicThumbnailSpec(input);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return baseSpec;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are generating structured copy for a 1200x630 CSC DOST portal social share thumbnail.
Summarize the following post into ultra-concise, high-impact text matching the approved visual layout:
Post Title: ${input.title}
Category: ${input.category || ''}
Department/Organization: ${input.department || ''}
Short Description: ${input.shortInfo || ''}
Last Date: ${input.lastDate || 'N/A'}
Eligibility: ${input.eligibility || 'N/A'}

Rules:
- orgTitle: Uppercase official organization acronym/name (e.g. "JKSSB", "INDIAN ARMY", "RAILWAY / RRB", "STAFF SELECTION COMM.", "KASHMIR UNIVERSITY", "CLUSTER UNIVERSITY").
- postBadgeTitle: Uppercase specific role or examination name (e.g. "CLASS IV", "TES-57 (10+2)", "JE CIVIL (PWD)", "NTPC (UG)", "CHSL (10+2)", "BG 1ST & 2ND SEM"). Max 26 chars.
- eligibilityValue: Ultra-short requirement (max 20 chars, e.g. "10th / 12th Pass", "BE/B.Tech Civil", "10+2 with PCM").
- lastDateValue: Clean date string (max 18 chars, e.g. "25/03/2026", "Check website").`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            orgTitle: { type: Type.STRING },
            postBadgeTitle: { type: Type.STRING },
            eligibilityValue: { type: Type.STRING },
            lastDateValue: { type: Type.STRING }
          },
          required: ['orgTitle', 'postBadgeTitle', 'eligibilityValue', 'lastDateValue']
        }
      }
    });

    if (response && response.text) {
      const parsed = JSON.parse(response.text.trim());
      return {
        ...baseSpec,
        orgTitle: (parsed.orgTitle || baseSpec.orgTitle).trim(),
        postBadgeTitle: (parsed.postBadgeTitle || baseSpec.postBadgeTitle).trim(),
        eligibilityValue: (parsed.eligibilityValue || baseSpec.eligibilityValue).trim(),
        lastDateValue: (parsed.lastDateValue || baseSpec.lastDateValue).trim()
      };
    }
    return baseSpec;
  } catch (err) {
    console.warn('[ThumbnailAI] Falling back to deterministic spec:', err);
    return baseSpec;
  }
}
