import type { PostComputedStatus, PostStructuredType, SarkariItem } from '../data/sarkariData';
import { isIgnouItem } from '../data/sarkariData';
import { resolvePostOrg, resolvePostStructuredType } from '../data/sarkariMigration';
import { computeSarkariStatus, type ComputedSarkariStatus } from './sarkariStatus';

export type OrgPaletteGroup =
  | 'jkssb'
  | 'ssc'
  | 'rrb'
  | 'army'
  | 'banks'
  | 'universities'
  | 'other';

export interface OrgVisualStyle {
  group: OrgPaletteGroup;
  orgShort: string;
  initials: string;
  accentHex: string;
  accentDarkHex: string;
  accentSoftHex: string;
  badgeBgHex: string;
  badgeTextHex: string;
  badgeBorderHex: string;
}

export type ThumbnailLayoutVariant = 'number' | 'date' | 'title';

export interface ThumbnailRenderData {
  slug: string;
  versionHash: string;
  variant: ThumbnailLayoutVariant;
  effectiveType: PostStructuredType;
  org: OrgVisualStyle;
  statusTone: PostComputedStatus;
  statusStripeHex: string;
  statusPillBgHex: string;
  statusPillTextHex: string;
  statusPillBorderHex: string;
  statusLabel: string;
  shortTitleLines: [string] | [string, string];
  truncatedTitle: string;
  keyHighlight: string;
  heroNumber?: string;
  heroNumberLabel?: string;
  chips: string[];
  footerLabel: 'cscdost.com';
  thinReasons: string[];
}

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const PLACEHOLDER_REGEX =
  /^(as per (official )?(notice|notification|rules|guidelines|circular|university norms|ignou norms)|refer (to )?(official )?(notice|notification)|check (official )?(notice|circular|website)|see (official )?notice|not specified|various posts|n\/a|none|null|undefined|-)$/i;

/**
 * Ensures English/ASCII-safe typography on generated thumbnail images (no curly quotes, ₹ -> Rs., etc.).
 */
export function sanitizeImageText(input?: string | null): string {
  if (!input) return '';
  return String(input)
    .replace(/₹\s*/g, 'Rs. ')
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministic compact FNV-1a hash from slug + status + key dates + updated timestamp.
 * Changes automatically whenever computed status transitions (e.g. open -> closing_soon -> closed)
 * or whenever post metadata is updated.
 */
export function computeThumbnailVersionHash(item: SarkariItem, customNow?: Date): string {
  const computed = computeSarkariStatus(item, customNow);
  const raw = [
    'v4',
    item.id,
    computed.computedStatus,
    computed.applicationStatus,
    computed.stage,
    computed.dateValue,
    item.updatedAt || item.postDate || '',
    item.totalPosts || item.posts || '',
    item.qualification || '',
    item.jkDomicile ? 'jk' : 'all',
  ].join('|');

  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function getPostOgImageUrl(item: SarkariItem, baseOrigin = ''): string {
  const v = computeThumbnailVersionHash(item);
  return `${baseOrigin}/api/og-image/${encodeURIComponent(item.id)}.png?v=${v}`;
}

export function getPostListThumbnailUrl(item: SarkariItem, format: 'webp' | 'png' = 'webp'): string {
  const v = computeThumbnailVersionHash(item);
  return `/api/og-image/${encodeURIComponent(item.id)}.${format}?size=card&v=${v}`;
}

export function resolveOrgVisualStyle(item: SarkariItem): OrgVisualStyle {
  const cat = item.category;
  const rawOrg = sanitizeImageText(item.org || resolvePostOrg(item));
  const combined = `${rawOrg} ${item.department || ''} ${item.title || ''}`.toUpperCase();

  if (cat === 'jkssb' || combined.includes('JKSSB')) {
    return {
      group: 'jkssb',
      orgShort: 'JKSSB',
      initials: 'JKSSB',
      accentHex: '#1D4ED8',
      accentDarkHex: '#1E3A8A',
      accentSoftHex: '#EFF6FF',
      badgeBgHex: '#172554',
      badgeTextHex: '#FFFFFF',
      badgeBorderHex: '#3B82F6',
    };
  }

  if (cat === 'army_jobs' || combined.includes('INDIAN ARMY') || combined.includes('AGNIVEER') || combined.includes('COAST GUARD')) {
    const isCoastGuard = combined.includes('COAST GUARD') || combined.includes('CGEPT');
    if (isCoastGuard && cat === 'ssc_jobs') {
      return {
        group: 'ssc',
        orgShort: 'SSC / ICG',
        initials: 'SSC',
        accentHex: '#0284C7',
        accentDarkHex: '#075985',
        accentSoftHex: '#F0F9FF',
        badgeBgHex: '#082F49',
        badgeTextHex: '#FFFFFF',
        badgeBorderHex: '#38BDF8',
      };
    }
    return {
      group: 'army',
      orgShort: 'INDIAN ARMY',
      initials: 'ARMY',
      accentHex: '#15803D',
      accentDarkHex: '#14532D',
      accentSoftHex: '#F0FDF4',
      badgeBgHex: '#14331A',
      badgeTextHex: '#FFFFFF',
      badgeBorderHex: '#22C55E',
    };
  }

  if (cat === 'ssc_jobs' || combined.includes('SSC') || combined.includes('STAFF SELECTION')) {
    return {
      group: 'ssc',
      orgShort: 'SSC',
      initials: 'SSC',
      accentHex: '#0284C7',
      accentDarkHex: '#0369A1',
      accentSoftHex: '#F0F9FF',
      badgeBgHex: '#0C4A6E',
      badgeTextHex: '#FFFFFF',
      badgeBorderHex: '#38BDF8',
    };
  }

  if (cat === 'rrb_jobs' || combined.includes('RRB') || combined.includes('RAILWAY')) {
    return {
      group: 'rrb',
      orgShort: 'RAILWAY / RRB',
      initials: 'RRB',
      accentHex: '#EA580C',
      accentDarkHex: '#9A3412',
      accentSoftHex: '#FFF7ED',
      badgeBgHex: '#431407',
      badgeTextHex: '#FFFFFF',
      badgeBorderHex: '#FB923C',
    };
  }

  if (
    cat === 'banking_jobs' ||
    combined.includes('J&K BANK') ||
    combined.includes('JAMMU & KASHMIR BANK') ||
    combined.includes('IBPS') ||
    combined.includes('SBI') ||
    combined.includes('RBI')
  ) {
    const isJkBank = combined.includes('J&K BANK') || combined.includes('JAMMU & KASHMIR BANK');
    return {
      group: 'banks',
      orgShort: isJkBank ? 'J&K BANK' : combined.includes('SBI') ? 'SBI' : 'IBPS / BANK',
      initials: isJkBank ? 'JKB' : combined.includes('SBI') ? 'SBI' : 'IBPS',
      accentHex: '#B45309',
      accentDarkHex: '#78350F',
      accentSoftHex: '#FFFBEB',
      badgeBgHex: '#3B1E08',
      badgeTextHex: '#FFFFFF',
      badgeBorderHex: '#F59E0B',
    };
  }

  if (
    isIgnouItem(item) ||
    cat === 'cluster_univ' ||
    cat === 'exam_forms' ||
    cat === 'admissions' ||
    cat === 'nta' ||
    combined.includes('IGNOU') ||
    combined.includes('CLUSTER UNIVERSITY') ||
    combined.includes('KASHMIR UNIVERSITY') ||
    combined.includes('UNIVERSITY OF KASHMIR') ||
    combined.includes('NTA')
  ) {
    if (isIgnouItem(item) || combined.includes('IGNOU')) {
      return {
        group: 'universities',
        orgShort: 'IGNOU',
        initials: 'IGNOU',
        accentHex: '#0F766E',
        accentDarkHex: '#134E4A',
        accentSoftHex: '#F0FDFA',
        badgeBgHex: '#134E4A',
        badgeTextHex: '#FFFFFF',
        badgeBorderHex: '#2DD4BF',
      };
    }
    if (cat === 'cluster_univ' || combined.includes('CLUSTER UNIVERSITY')) {
      return {
        group: 'universities',
        orgShort: 'CLUSTER UNIV',
        initials: 'CUS',
        accentHex: '#0E7490',
        accentDarkHex: '#164E63',
        accentSoftHex: '#ECFEFF',
        badgeBgHex: '#164E63',
        badgeTextHex: '#FFFFFF',
        badgeBorderHex: '#22D3EE',
      };
    }
    if (cat === 'nta' || combined.includes('NTA')) {
      return {
        group: 'universities',
        orgShort: 'NTA',
        initials: 'NTA',
        accentHex: '#6D28D9',
        accentDarkHex: '#4C1D95',
        accentSoftHex: '#F5F3FF',
        badgeBgHex: '#3B0764',
        badgeTextHex: '#FFFFFF',
        badgeBorderHex: '#A78BFA',
      };
    }
    return {
      group: 'universities',
      orgShort: 'KASHMIR UNIV',
      initials: 'KU',
      accentHex: '#4338CA',
      accentDarkHex: '#312E81',
      accentSoftHex: '#EEF2FF',
      badgeBgHex: '#1E1B4B',
      badgeTextHex: '#FFFFFF',
      badgeBorderHex: '#818CF8',
    };
  }

  if (combined.includes('JKPSC')) {
    return {
      group: 'other',
      orgShort: 'JKPSC',
      initials: 'JKPSC',
      accentHex: '#334155',
      accentDarkHex: '#0F172A',
      accentSoftHex: '#F8FAFC',
      badgeBgHex: '#1E293B',
      badgeTextHex: '#FFFFFF',
      badgeBorderHex: '#64748B',
    };
  }

  if (combined.includes('JKBOSE')) {
    return {
      group: 'other',
      orgShort: 'JKBOSE',
      initials: 'JKBOSE',
      accentHex: '#334155',
      accentDarkHex: '#0F172A',
      accentSoftHex: '#F8FAFC',
      badgeBgHex: '#1E293B',
      badgeTextHex: '#FFFFFF',
      badgeBorderHex: '#64748B',
    };
  }

  if (combined.includes('UPSC')) {
    return {
      group: 'other',
      orgShort: 'UPSC',
      initials: 'UPSC',
      accentHex: '#334155',
      accentDarkHex: '#0F172A',
      accentSoftHex: '#F8FAFC',
      badgeBgHex: '#1E293B',
      badgeTextHex: '#FFFFFF',
      badgeBorderHex: '#64748B',
    };
  }

  const cleanUpper = rawOrg.toUpperCase();
  const initials =
    cleanUpper
      .split(/\s+/)
      .filter((w) => w.length > 1 && !['OF', 'AND', 'THE', 'FOR'].includes(w))
      .slice(0, 2)
      .map((w) => w[0])
      .join('') || 'GOV';

  return {
    group: 'other',
    orgShort: rawOrg ? rawOrg.slice(0, 16).toUpperCase() : 'NOTICE',
    initials: initials.slice(0, 5),
    accentHex: '#334155',
    accentDarkHex: '#0F172A',
    accentSoftHex: '#F8FAFC',
    badgeBgHex: '#1E293B',
    badgeTextHex: '#FFFFFF',
    badgeBorderHex: '#64748B',
  };
}

/**
 * Formats DD/MM/YYYY or "DD/MM/YYYY – DD/MM/YYYY" cleanly to "26 Nov" or "18-20 Nov" / "30 Nov - 2 Dec".
 */
export function formatShortThumbnailDate(raw?: string | null): string {
  if (!raw) return '';
  const str = sanitizeImageText(raw);
  if (!str || PLACEHOLDER_REGEX.test(str)) return '';

  const matches = Array.from(str.matchAll(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g));
  if (matches.length === 0) return '';

  const parseMatch = (m: RegExpMatchArray) => {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return { day, month, mon: MONTHS_SHORT[month - 1] };
  };

  const first = parseMatch(matches[0]);
  if (!first) return '';

  if (matches.length >= 2) {
    const second = parseMatch(matches[1]);
    if (second && (second.day !== first.day || second.month !== first.month)) {
      if (second.month === first.month) {
        return `${first.day}-${second.day} ${first.mon}`;
      }
      return `${first.day} ${first.mon} - ${second.day} ${second.mon}`;
    }
  }

  return `${first.day} ${first.mon}`;
}

function getEffectiveTemplateType(item: SarkariItem, computed: ComputedSarkariStatus): PostStructuredType {
  const baseType = item.type || resolvePostStructuredType(item);
  if ((baseType === 'application' || baseType === 'admission') && computed.isUpcoming) {
    return 'upcoming';
  }
  return baseType;
}

function extractNumericPostsCount(item: SarkariItem, effectiveType: PostStructuredType): string | undefined {
  // Only show post/vacancy count highlight for recruitment/admission/upcoming/closed-application notices,
  // never mislabel an answer key/result/exam-form notice's description as open vacancies.
  if (
    effectiveType === 'dv' ||
    effectiveType === 'admit_card' ||
    effectiveType === 'exam' ||
    effectiveType === 'result' ||
    effectiveType === 'answer_key'
  ) {
    return undefined;
  }

  const candidates = [item.totalPosts, item.posts]
    .map((v) => sanitizeImageText(v !== undefined && v !== null ? String(v) : ''))
    .filter((v) => v && !PLACEHOLDER_REGEX.test(v));

  for (const val of candidates) {
    // Reject semester/batch numbers (e.g. "5th Sem", "Batch 2026", "Advt 07")
    const stripped = val
      .replace(/\b20\d{2}\b/g, '')
      .replace(/\b(1st|2nd|3rd|\d+th)\s*(sem|semester|year|tier|stage|phase|batch)\b/gi, '');

    const postMatch = stripped.match(/(\d[\d,]*)\s*\+?\s*(?:posts?|vacanc(?:y|ies)|seats?)\b/i);
    if (postMatch) {
      const num = parseInt(postMatch[1].replace(/,/g, ''), 10);
      if (num > 0 && num < 500000) {
        return num.toLocaleString('en-IN');
      }
    }

    const pureNum = stripped.trim().match(/^(\d[\d,]*)\+?$/);
    if (pureNum) {
      const num = parseInt(pureNum[1].replace(/,/g, ''), 10);
      if (num > 0 && num < 500000) {
        return num.toLocaleString('en-IN');
      }
    }
  }
  return undefined;
}

function extractConciseQualificationChip(
  item: SarkariItem,
  effectiveType: PostStructuredType
): string | undefined {
  // Omit vague/non-academic eligibility notes on DV/Result/AnswerKey notices unless explicit qualification exists
  const rawQual = sanitizeImageText(item.qualification);
  const rawElig =
    effectiveType === 'application' || effectiveType === 'admission' || effectiveType === 'upcoming'
      ? sanitizeImageText(item.eligibility)
      : '';

  const source = rawQual && !PLACEHOLDER_REGEX.test(rawQual)
    ? rawQual
    : rawElig && !PLACEHOLDER_REGEX.test(rawElig)
    ? rawElig
    : '';

  if (!source) return undefined;

  const lower = source.toLowerCase();
  // Detect real qualification tiers cleanly without inventing data
  const tags: string[] = [];
  if (/\b10th\b|matric|sslc/i.test(lower)) tags.push('10th');
  if (/\b12th\b|10\+2|higher secondary|intermediate/i.test(lower)) tags.push('10+2');
  if (/\bdiploma\b|\biti\b|polytechnic/i.test(lower)) tags.push('Diploma');
  if (/\bgraduate\b|\bgraduation\b|\bbachelor|\bb\.?tech\b|\bb\.?e\b|\bb\.?sc\b|\bb\.?com\b|\bb\.?a\b|\bb\.?ed\b|\bdegree\b/i.test(lower)) {
    if (/\bb\.?tech\b|\bb\.?e\b|engineering/i.test(lower)) tags.push('B.E / B.Tech');
    else if (/\bb\.?ed\b/i.test(lower)) tags.push('B.Ed');
    else tags.push('Graduate');
  }
  if (/post\s*graduate|\bmaster|\bm\.?tech\b|\bm\.?sc\b|\bm\.?ed\b|\bphd\b/i.test(lower)) {
    tags.push('PG / Master');
  }

  if (tags.length > 0) {
    return tags.slice(0, 2).join(' / ');
  }

  // If explicit short qualification text already <= 26 chars and isn't a long sentence
  if (source.length <= 26 && !source.endsWith('.')) {
    return source;
  }

  return undefined;
}

/**
 * Splits a post title into at most 2 crisp lines (<= ~36 chars each), preserving whole words and truncating with "...".
 */
export function shortenTitleToTwoLines(rawTitle: string, maxCharsPerLine = 35): [string] | [string, string] {
  const clean = sanitizeImageText(rawTitle)
    .replace(/\s*\(Concluded\)/i, '')
    .replace(/\s*-\s*CSC DOST.*/i, '')
    .trim();

  if (!clean) return ['Official Notification'];

  const words = clean.split(' ');
  const line1Words: string[] = [];
  let idx = 0;

  while (idx < words.length) {
    const candidate = [...line1Words, words[idx]].join(' ');
    if (candidate.length <= maxCharsPerLine || line1Words.length === 0) {
      line1Words.push(words[idx]);
      idx++;
    } else {
      break;
    }
  }

  const line1 = line1Words.join(' ');
  if (idx >= words.length) {
    return [line1];
  }

  const line2Words: string[] = [];
  let truncated = false;
  while (idx < words.length) {
    const candidate = [...line2Words, words[idx]].join(' ');
    if (candidate.length <= maxCharsPerLine - 3) {
      line2Words.push(words[idx]);
      idx++;
    } else {
      truncated = true;
      break;
    }
  }

  if (line2Words.length === 0 && idx < words.length) {
    line2Words.push(words[idx].slice(0, maxCharsPerLine - 3));
    truncated = true;
  }

  let line2 = line2Words.join(' ').replace(/[,:;/-]+$/, '');
  if (truncated || idx < words.length) {
    line2 = `${line2}...`;
  }

  return [line1, line2];
}

function resolveStatusVisuals(
  computed: ComputedSarkariStatus,
  effectiveType: PostStructuredType
): {
  stripeHex: string;
  pillBgHex: string;
  pillTextHex: string;
  pillBorderHex: string;
  statusLabel: string;
} {
  if (computed.isCancelled) {
    return {
      stripeHex: '#64748B',
      pillBgHex: '#F1F5F9',
      pillTextHex: '#334155',
      pillBorderHex: '#CBD5E1',
      statusLabel: 'CANCELLED',
    };
  }

  if (computed.computedStatus === 'closed') {
    return {
      stripeHex: '#64748B',
      pillBgHex: '#F1F5F9',
      pillTextHex: '#334155',
      pillBorderHex: '#CBD5E1',
      statusLabel:
        effectiveType === 'dv'
          ? 'DV CONCLUDED'
          : effectiveType === 'admit_card' || effectiveType === 'exam'
          ? 'CONCLUDED'
          : computed.applicationStatus === 'unknown'
          ? 'CHECK NOTICE'
          : 'CLOSED',
    };
  }

  if (computed.computedStatus === 'closing_soon') {
    const days = computed.daysRemaining;
    const isAnswerKey = effectiveType === 'answer_key';
    const label = isAnswerKey
      ? 'OBJECTION WINDOW'
      : days === 0
      ? 'CLOSES TODAY'
      : days !== null
      ? `CLOSING IN ${days}D`
      : 'CLOSING SOON';
    return {
      stripeHex: '#D97706',
      pillBgHex: '#FEF3C7',
      pillTextHex: '#92400E',
      pillBorderHex: '#F59E0B',
      statusLabel: label,
    };
  }

  if (computed.computedStatus === 'open') {
    return {
      stripeHex: '#16A34A',
      pillBgHex: '#DCFCE7',
      pillTextHex: '#166534',
      pillBorderHex: '#22C55E',
      statusLabel: 'OPEN NOW',
    };
  }

  if (computed.computedStatus === 'upcoming') {
    return {
      stripeHex: '#0D9488',
      pillBgHex: '#CCFBF1',
      pillTextHex: '#115E59',
      pillBorderHex: '#14B8A6',
      statusLabel: 'UPCOMING',
    };
  }

  if (computed.computedStatus === 'exam') {
    const label =
      effectiveType === 'dv'
        ? 'DV SCHEDULE'
        : effectiveType === 'admit_card'
        ? 'ADMIT CARD OUT'
        : 'EXAM SCHEDULE';
    return {
      stripeHex: '#2563EB',
      pillBgHex: '#DBEAFE',
      pillTextHex: '#1E40AF',
      pillBorderHex: '#3B82F6',
      statusLabel: label,
    };
  }

  // result / answer_key
  const label =
    effectiveType === 'answer_key'
      ? 'ANSWER KEY'
      : computed.stage === 'grade_card'
      ? 'GRADE CARD OUT'
      : 'RESULT OUT';
  return {
    stripeHex: '#7C3AED',
    pillBgHex: '#EDE9FE',
    pillTextHex: '#5B21B6',
    pillBorderHex: '#8B5CF6',
    statusLabel: label,
  };
}

function buildKeyHighlight(
  item: SarkariItem,
  computed: ComputedSarkariStatus,
  effectiveType: PostStructuredType
): string {
  if (computed.isCancelled) return 'Notice cancelled';

  if (computed.computedStatus === 'closed') {
    if (computed.applicationStatus === 'unknown') {
      const postD = formatShortThumbnailDate(item.postDate);
      return postD ? `Notice ${postD}` : 'Check official notice';
    }
    if (effectiveType === 'dv') return 'DV concluded';
    if (effectiveType === 'admit_card' || effectiveType === 'exam') return 'Exam concluded';
    return 'Applications closed';
  }

  if (effectiveType === 'upcoming' || computed.computedStatus === 'upcoming') {
    const d = formatShortThumbnailDate(item.applyStart || item.startDate || computed.dateValue);
    return d ? `Opens ${d}` : 'Opening soon';
  }

  if (effectiveType === 'dv') {
    const d = formatShortThumbnailDate(computed.dateValue);
    return d ? `DV ${d}` : 'DV schedule';
  }

  if (effectiveType === 'admit_card' || effectiveType === 'exam') {
    const d = formatShortThumbnailDate(item.eventDate || computed.dateValue);
    if (d) return `Exam on ${d}`;
    return effectiveType === 'admit_card' ? 'Admit card out' : 'Exam schedule';
  }

  if (effectiveType === 'result') {
    const d = formatShortThumbnailDate(computed.dateValue);
    return d ? `Result out ${d}` : 'Result published';
  }

  if (effectiveType === 'answer_key') {
    if (computed.isClosingSoon) {
      const d = formatShortThumbnailDate(item.lastDate || computed.dateValue);
      if (d) return `Objections till ${d}`;
    }
    const d = formatShortThumbnailDate(computed.dateValue);
    return d ? `Answer key ${d}` : 'Answer key out';
  }

  // Open / closing_soon application, admission, exam_form, correction
  const d = formatShortThumbnailDate(item.applyEnd || item.lastDate || computed.dateValue);
  if (computed.stage === 'correction') {
    return d ? `Edit till ${d}` : 'Correction open';
  }
  return d ? `Apply by ${d}` : 'Open now';
}

export function buildThumbnailRenderData(
  item: SarkariItem,
  customNow?: Date
): ThumbnailRenderData {
  const computed = computeSarkariStatus(item, customNow);
  const effectiveType = getEffectiveTemplateType(item, computed);
  const org = resolveOrgVisualStyle(item);
  const statusVis = resolveStatusVisuals(computed, effectiveType);
  const heroNumber = extractNumericPostsCount(item, effectiveType);
  const keyHighlight = buildKeyHighlight(item, computed, effectiveType);
  const shortTitleLines = shortenTitleToTwoLines(item.title, heroNumber ? 31 : 36);
  const truncatedTitle = shortTitleLines.join(' ');

  const chips: string[] = [];
  const qualChip = extractConciseQualificationChip(item, effectiveType);
  if (qualChip) chips.push(qualChip);
  if (item.jkDomicile) chips.push('J&K domicile');

  // Determine layout variant:
  // 1) 'number' when a verified numeric post count exists on recruitment/admission/upcoming/closed-app posts
  // 2) 'date' when there is an explicit actionable event/deadline date (not generic 'Check official notice')
  // 3) 'title' when neither a vacancy number nor an explicit dated window exists
  const hasSpecificDate =
    computed.applicationStatus !== 'unknown' &&
    Boolean(formatShortThumbnailDate(computed.dateValue) || formatShortThumbnailDate(item.lastDate) || formatShortThumbnailDate(item.eventDate));

  let variant: ThumbnailLayoutVariant = 'title';
  if (heroNumber) {
    variant = 'number';
  } else if (hasSpecificDate) {
    variant = 'date';
  }

  // Identify thin-data reasons for Part C manual review audit
  const thinReasons: string[] = [];
  if (
    (effectiveType === 'application' || effectiveType === 'upcoming') &&
    !heroNumber &&
    !isIgnouItem(item)
  ) {
    thinReasons.push('Missing numeric posts count');
  }
  if (!qualChip && (effectiveType === 'application' || effectiveType === 'admission' || effectiveType === 'upcoming')) {
    thinReasons.push('Missing or generic qualification');
  }
  if (!hasSpecificDate) {
    thinReasons.push('Missing parseable event/deadline date');
  }
  if (!item.shortInfo || item.shortInfo.trim().length < 25) {
    thinReasons.push('Short or missing summary');
  }

  return {
    slug: item.id,
    versionHash: computeThumbnailVersionHash(item, customNow),
    variant,
    effectiveType,
    org,
    statusTone: computed.computedStatus,
    statusStripeHex: statusVis.stripeHex,
    statusPillBgHex: statusVis.pillBgHex,
    statusPillTextHex: statusVis.pillTextHex,
    statusPillBorderHex: statusVis.pillBorderHex,
    statusLabel: statusVis.statusLabel,
    shortTitleLines,
    truncatedTitle,
    keyHighlight,
    heroNumber,
    heroNumberLabel: heroNumber ? 'POSTS' : undefined,
    chips,
    footerLabel: 'cscdost.com',
    thinReasons,
  };
}
