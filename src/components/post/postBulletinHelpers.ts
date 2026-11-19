import type { DepartmentBreakdown, PostStructuredType, SarkariItem } from '../../data/sarkariData';
import {
  extractDatePattern,
  getNowInAsiaKolkata,
  type ComputedSarkariStatus,
} from '../../utils/sarkariStatus';
import {
  hasExplicitFee,
  hasRealDataValue,
  isAssignmentNotice,
  isEducationNotice,
  isGenericNoticePlaceholder,
  isNonApplicationTemplateType,
  isZeroOrExemptFee,
  resolveApplicationModeLabel,
} from './postHelpers';

const FULL_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SHORT_MONTHS = [
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

export function formatLongDate(raw?: string): string {
  if (!raw) return '';
  const parsed = extractDatePattern(raw);
  if (!parsed) return String(raw).trim();
  return `${parsed.day} ${FULL_MONTHS[parsed.month - 1]} ${parsed.year}`;
}

export function formatShortDate(raw?: string): string {
  if (!raw) return '';
  const parsed = extractDatePattern(raw);
  if (!parsed) return String(raw).trim();
  return `${parsed.day} ${SHORT_MONTHS[parsed.month - 1]} ${parsed.year}`;
}

export function formatDayMonth(raw?: string): string {
  if (!raw) return '';
  const parsed = extractDatePattern(raw);
  if (!parsed) return String(raw).trim();
  return `${parsed.day} ${SHORT_MONTHS[parsed.month - 1]}`;
}

/**
 * Computes whole-calendar-day difference in Asia/Kolkata (target - today).
 */
export function computeCalendarDaysUntil(rawDate?: string): number | null {
  const parsed = extractDatePattern(rawDate);
  if (!parsed) return null;
  const now = getNowInAsiaKolkata();
  const todayUtc = Date.UTC(now.year, now.month - 1, now.day);
  const targetUtc = Date.UTC(parsed.year, parsed.month - 1, parsed.day);
  return Math.round((targetUtc - todayUtc) / (24 * 60 * 60 * 1000));
}

export function formatCountdownLabel(days: number): string {
  if (days < 0) return 'Closed';
  if (days === 0) return 'Last day';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export interface BulletinSealData {
  kicker: string;
  main: string;
  sub: string;
  compactMain: boolean;
  isClosed: boolean;
  hasDeadline: boolean;
  bottomDaysText: string;
  bottomDateText: string;
}

export function computeBulletinSeal(
  item: SarkariItem,
  effectiveType: PostStructuredType,
  statusInfo: ComputedSarkariStatus
): BulletinSealData {
  const deadlineRaw = item.applyEnd || item.lastDate;
  const hasRealDeadlineDate = Boolean(extractDatePattern(deadlineRaw));
  const isNonApp = isNonApplicationTemplateType(effectiveType);
  const isAnswerKeyObjection =
    effectiveType === 'answer_key' && statusInfo.computedStatus === 'closing_soon';

  if (statusInfo.isCancelled) {
    return {
      kicker: 'Official status',
      main: 'Cancelled',
      sub: 'Withdrawn',
      compactMain: true,
      isClosed: true,
      hasDeadline: false,
      bottomDaysText: '',
      bottomDateText: '',
    };
  }

  // Upcoming registration window
  if (effectiveType === 'upcoming') {
    const startRaw = item.applyStart || item.startDate;
    const daysToOpen = computeCalendarDaysUntil(startRaw);
    const startShort = formatDayMonth(startRaw) || 'Upcoming';
    const startLong = formatShortDate(startRaw) || statusInfo.dateValue;
    return {
      kicker: 'Window opens',
      main: startShort,
      sub:
        daysToOpen !== null && daysToOpen > 0
          ? `Opens in ${daysToOpen}d`
          : statusInfo.badgeLabel || 'Upcoming',
      compactMain: startShort.length > 8,
      isClosed: false,
      hasDeadline: Boolean(extractDatePattern(startRaw)),
      bottomDaysText: 'Upcoming',
      bottomDateText: startLong ? `Opens ${startLong}` : '',
    };
  }

  // Active or Closed Deadline Post (Application / Admission / Assignment / Answer-Key Objection)
  if ((!isNonApp || isAnswerKeyObjection) && hasRealDeadlineDate && deadlineRaw) {
    const daysLeft = computeCalendarDaysUntil(deadlineRaw);
    const isClosed = statusInfo.isClosed || (daysLeft !== null && daysLeft < 0);
    const countdown =
      isClosed ? 'Closed' : daysLeft !== null ? formatCountdownLabel(daysLeft) : statusInfo.badgeLabel;
    const dayMonth = formatDayMonth(deadlineRaw);
    const shortFull = formatShortDate(deadlineRaw);

    return {
      kicker: isClosed
        ? 'Applications closed'
        : isAnswerKeyObjection
        ? 'Objections open until'
        : isEducationNotice(item)
        ? 'Submit before'
        : 'Applications open until',
      main: dayMonth,
      sub: countdown,
      compactMain: dayMonth.length > 8,
      isClosed,
      hasDeadline: true,
      bottomDaysText: countdown,
      bottomDateText: isClosed ? `Closed ${shortFull}` : `Last date ${shortFull}`,
    };
  }

  // Non-deadline post (Results, Guides, General Notices, Admit Cards, Exams, DV)
  const fallbackDate = formatDayMonth(statusInfo.dateValue);
  const hasDate = Boolean(extractDatePattern(statusInfo.dateValue));
  const statusTag =
    effectiveType === 'result'
      ? 'Result Out'
      : effectiveType === 'admit_card'
      ? 'Admit Card'
      : effectiveType === 'dv'
      ? 'DV Notice'
      : effectiveType === 'exam'
      ? 'Schedule'
      : effectiveType === 'answer_key'
      ? 'Answer Key'
      : 'Notice';

  return {
    kicker: statusTag,
    main: hasDate ? fallbackDate : statusTag,
    sub: hasDate ? statusInfo.badgeLabel || 'Notice' : 'Official Update',
    compactMain: (hasDate ? fallbackDate : statusTag).length > 7,
    isClosed: statusInfo.isClosed,
    hasDeadline: false,
    bottomDaysText: '',
    bottomDateText: '',
  };
}

export function getShortOrgName(orgName: string): string {
  const clean = orgName.trim();
  if (!clean) return 'Official';
  if (/jkssb/i.test(clean)) return 'JKSSB';
  if (/ssc/i.test(clean)) return 'SSC';
  if (/rrb|railway/i.test(clean)) return 'RRB';
  if (/ignou/i.test(clean)) return 'IGNOU';
  if (/kashmir university|university of kashmir/i.test(clean)) return 'Kashmir Univ';
  if (/cluster university/i.test(clean)) return 'CUS';
  if (/army/i.test(clean)) return 'Indian Army';
  if (/j&k bank|jkb/i.test(clean)) return 'J&K Bank';
  if (/nta/i.test(clean)) return 'NTA';
  return clean.length > 18 ? clean.split(/\s+/).slice(0, 2).join(' ') : clean;
}

export interface BulletinFactItem {
  label: string;
  value: string;
}

function compactPostsValue(item: SarkariItem, isEdu: boolean): string {
  const raw = item.totalPosts ?? item.posts;
  if (!hasRealDataValue(raw) || isGenericNoticePlaceholder(raw)) {
    return isEdu ? 'As per notice' : 'As per notice';
  }
  const str = String(raw).trim();
  const leadNum = str.match(/^([\d,]+)\+?\s*(?:vacancies|posts)?/i);
  if (leadNum && str.length > 26) {
    return leadNum[1];
  }
  return str;
}

function compactFeeValue(item: SarkariItem): string {
  const gen = item.fee?.genObc || item.fees?.genObc || '';
  const sc = item.fee?.scSt || item.fees?.scSt || '';
  const combined = `${gen} ${sc}`.trim();

  if (isZeroOrExemptFee(item)) {
    return '₹0';
  }

  const gAmount = gen.match(/(?:₹|rs\.?)\s*[\d,]+/i)?.[0]?.replace(/^rs\.?\s*/i, '₹').replace(/\s+/g, '');
  const sAmount = sc.match(/(?:₹|rs\.?)\s*[\d,]+/i)?.[0]?.replace(/^rs\.?\s*/i, '₹').replace(/\s+/g, '');
  const hasPlusGst = /\+\s*gst|excluding\s+gst|extra\s+gst/i.test(combined);
  const gstSuffix = hasPlusGst ? ' + GST' : '';

  if (gAmount && sAmount && gAmount !== sAmount) {
    return `${gAmount} / ${sAmount}${gstSuffix}`;
  }
  if (gAmount) return `${gAmount}${gstSuffix}`;
  if (hasRealDataValue(item.feePerSubject)) return String(item.feePerSubject).trim();
  if (!hasExplicitFee(item)) {
    const rawGen = String(item.fee?.genObc || item.fees?.genObc || '').trim();
    if (/not\s+stated|not\s+mentioned/i.test(rawGen)) return 'Not stated';
    return 'As per notice';
  }
  if (hasRealDataValue(gen)) return gen.length > 28 ? `${gen.slice(0, 26).trim()}…` : gen;
  return 'As per notice';
}

export function buildBulletinKeyFacts(
  item: SarkariItem,
  effectiveType: PostStructuredType,
  statusInfo: ComputedSarkariStatus,
  orgName: string
): BulletinFactItem[] {
  const isEdu = isEducationNotice(item);
  const isNonApp = isNonApplicationTemplateType(effectiveType);
  const isJkPost =
    Boolean(item.jkDomicile) ||
    item.category === 'jkssb' ||
    item.category === 'exam_forms' ||
    item.category === 'admissions' ||
    item.category === 'cluster_univ' ||
    /j&k\s*domicile|jammu\s*(?:and|&)\s*kashmir/i.test(
      `${item.eligibility || ''} ${item.shortInfo || ''}`
    );
  const domicile = isJkPost ? 'J&K UT' : 'All India';

  if (isNonApp) {
    const secondFact =
      effectiveType === 'result'
        ? { label: 'Result date', value: formatShortDate(statusInfo.dateValue) || statusInfo.dateValue }
        : { label: statusInfo.dateLabel || 'Notice date', value: formatShortDate(statusInfo.dateValue) || statusInfo.dateValue };

    const hasRealPostsScope =
      hasRealDataValue(item.posts) &&
      !isGenericNoticePlaceholder(item.posts) &&
      !/^not\s+applicable\b/i.test(String(item.posts).trim());

    const thirdFact = hasRealPostsScope
      ? { label: isEdu ? 'Programme' : 'Posts / Scope', value: compactPostsValue(item, isEdu) }
      : hasRealDataValue(item.session)
      ? { label: 'Session', value: String(item.session) }
      : { label: 'Category', value: effectiveType === 'result' ? 'Result Notice' : effectiveType === 'admit_card' ? 'Admit Card' : effectiveType === 'dv' ? 'Doc Verification' : 'Official Schedule' };

    const fourthFact =
      hasRealDataValue(item.venue) && !isGenericNoticePlaceholder(item.venue)
        ? { label: 'Venue', value: String(item.venue) }
        : { label: 'Region', value: domicile };

    return [
      { label: isEdu ? 'Institution' : 'Organisation', value: getShortOrgName(orgName) },
      secondFact,
      thirdFact,
      fourthFact,
    ];
  }

  const mode = resolveApplicationModeLabel(item);

  return [
    {
      label: isEdu ? 'Programmes / Seats' : 'Total posts',
      value: compactPostsValue(item, isEdu),
    },
    {
      label: 'Application fee',
      value: compactFeeValue(item),
    },
    {
      label: 'Mode',
      value: mode,
    },
    {
      label: 'Domicile',
      value: domicile,
    },
  ];
}

export interface ImportantDateRow {
  event: string;
  date: string;
  highlight?: boolean;
}

export function buildImportantDateRows(
  item: SarkariItem,
  effectiveType: PostStructuredType,
  statusInfo: ComputedSarkariStatus
): ImportantDateRow[] {
  const rows: ImportantDateRow[] = [];
  const isNonApp = isNonApplicationTemplateType(effectiveType);
  const startRaw = item.applyStart || item.startDate;
  const endRaw = item.applyEnd || item.lastDate;

  if (hasRealDataValue(item.postDate)) {
    rows.push({
      event: isNonApp ? 'Notice published' : 'Advertisement published',
      date: formatLongDate(item.postDate),
    });
  }

  if (
    hasRealDataValue(item.documentDate) &&
    formatLongDate(item.documentDate) !== formatLongDate(item.postDate)
  ) {
    rows.push({
      event: 'Official circular date',
      date: formatLongDate(item.documentDate),
    });
  }

  if (!isNonApp && hasRealDataValue(startRaw)) {
    rows.push({
      event: statusInfo.isUpcoming ? 'Application window opens' : 'Application window opened',
      date: formatLongDate(startRaw),
      highlight: statusInfo.isUpcoming,
    });
  }

  // Detect extension history ("extended from DD/MM/YYYY to DD/MM/YYYY") cleanly from real metadata
  const combinedNotes = [
    ...(item.verification?.correctionHistory || []),
    item.shortInfo || '',
    item.summary || '',
  ].join(' ');
  const extMatch = combinedNotes.match(
    /extended[^.]*?\bfrom\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\s+to\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
  );

  if (extMatch && hasRealDataValue(endRaw)) {
    const origFormatted = formatLongDate(extMatch[1]);
    const currentEndFormatted = formatLongDate(endRaw);
    if (origFormatted && origFormatted !== currentEndFormatted) {
      rows.push({
        event: 'Original last date',
        date: origFormatted,
      });
      rows.push({
        event: 'Extended last date',
        date: `${currentEndFormatted}${item.closingTime ? ` (${item.closingTime})` : ''}`,
        highlight: !statusInfo.isClosed,
      });
    } else {
      rows.push({
        event: isEducationNotice(item) ? 'Submission deadline' : 'Last date to apply',
        date: `${currentEndFormatted}${item.closingTime ? ` (${item.closingTime})` : ''}`,
        highlight: !statusInfo.isClosed,
      });
    }
  } else if (!isNonApp && hasRealDataValue(endRaw)) {
    rows.push({
      event: isEducationNotice(item) ? 'Submission deadline' : 'Last date to apply',
      date: `${formatLongDate(endRaw)}${item.closingTime ? ` (${item.closingTime})` : ''}`,
      highlight: !statusInfo.isClosed,
    });
  } else if (effectiveType === 'answer_key' && hasRealDataValue(endRaw)) {
    rows.push({
      event: 'Objection deadline',
      date: `${formatLongDate(endRaw)}${item.closingTime ? ` (${item.closingTime})` : ''}`,
      highlight: statusInfo.computedStatus === 'closing_soon',
    });
  } else if (isNonApp && hasRealDataValue(statusInfo.dateValue)) {
    const noticeDateFormatted = formatLongDate(statusInfo.dateValue);
    if (noticeDateFormatted && noticeDateFormatted !== formatLongDate(item.postDate)) {
      rows.push({
        event: statusInfo.dateLabel || 'Notified date',
        date: noticeDateFormatted,
        highlight: !statusInfo.isClosed && !statusInfo.isArchiveBucket,
      });
    }
    if (
      hasRealDataValue(endRaw) &&
      formatLongDate(endRaw) !== noticeDateFormatted &&
      formatLongDate(endRaw) !== formatLongDate(item.postDate)
    ) {
      rows.push({
        event: effectiveType === 'exam' || effectiveType === 'admit_card' ? 'Exam window ends' : 'Schedule / Valid until',
        date: `${formatLongDate(endRaw)}${item.closingTime ? ` (${item.closingTime})` : ''}`,
        highlight: false,
      });
    }
  }

  const feeDeadline = item.feeDeadline || item.verification?.feePaymentDeadline;
  if (hasRealDataValue(feeDeadline)) {
    rows.push({
      event: 'Fee payment deadline',
      date: formatLongDate(feeDeadline),
    });
  }

  const corrWindow = item.correctionWindow || item.verification?.correctionWindow;
  if (hasRealDataValue(corrWindow)) {
    rows.push({
      event: 'Correction / edit window',
      date: String(corrWindow).trim(),
    });
  }

  if (hasRealDataValue(item.reportingTime) && !isGenericNoticePlaceholder(item.reportingTime)) {
    rows.push({
      event: 'Reporting time',
      date: String(item.reportingTime).trim(),
    });
  }

  if (hasRealDataValue(item.venue) && !isGenericNoticePlaceholder(item.venue)) {
    rows.push({
      event: 'Venue / Centre',
      date: String(item.venue).trim(),
    });
  }

  return rows;
}

export interface FeeNoticeBox {
  variant: 'info' | 'warn';
  strongPrefix: string;
  body: string;
}

export function buildFeeNoticeBox(item: SarkariItem, effectiveType: PostStructuredType): FeeNoticeBox | null {
  if (isNonApplicationTemplateType(effectiveType)) return null;

  const gen = item.fee?.genObc || item.fees?.genObc || '';
  const sc = item.fee?.scSt || item.fees?.scSt || '';
  const note = item.fee?.note || item.paymentInstructions || item.feePerSubject || '';

  const explicitFee = hasExplicitFee(item);
  const zeroFee = isZeroOrExemptFee(item);

  if (!explicitFee && !hasRealDataValue(note)) {
    return null;
  }

  if (!explicitFee && hasRealDataValue(note)) {
    return {
      variant: 'info',
      strongPrefix: 'Fee note.',
      body: note,
    };
  }

  if (zeroFee) {
    return {
      variant: 'info',
      strongPrefix: 'No fee.',
      body: 'Candidates of every category are exempt. No payment is required to apply.',
    };
  }

  const parts: string[] = [];
  if (hasRealDataValue(gen) && !isGenericNoticePlaceholder(gen)) {
    parts.push(/\bfor\b/i.test(gen) ? gen : `General / OBC / OM: ${gen}`);
  }
  if (hasRealDataValue(sc) && !isGenericNoticePlaceholder(sc) && sc !== gen) {
    parts.push(/\bfor\b/i.test(sc) ? sc : `SC / ST / Reserved / PwD: ${sc}`);
  }
  if (hasRealDataValue(note)) parts.push(note);

  if (parts.length === 0) return null;

  return {
    variant: 'info',
    strongPrefix: 'Application fee.',
    body: parts.join(' · '),
  };
}

export function extractVacancyTotalLabel(
  item: SarkariItem,
  rows: DepartmentBreakdown[]
): string | null {
  const totalRaw = item.totalPosts ?? item.posts;
  if (hasRealDataValue(totalRaw) && !isGenericNoticePlaceholder(totalRaw)) {
    const str = String(totalRaw).trim();
    const leadMatch = str.match(/^([\d,]+)\+?\s*(Vacancies|Posts|Seats)?/i);
    if (leadMatch) {
      return leadMatch[1];
    }
  }
  if (rows.length > 1) {
    let sum = 0;
    let allExactNumeric = true;
    for (const r of rows) {
      const val = String(r.posts).trim();
      if (/\+/.test(val)) {
        allExactNumeric = false;
        break;
      }
      const numMatch = val.match(/([\d,]+)/);
      if (!numMatch) {
        allExactNumeric = false;
        break;
      }
      sum += parseInt(numMatch[1].replace(/,/g, ''), 10);
    }
    if (allExactNumeric && sum > 0) {
      return sum.toLocaleString('en-IN');
    }
  }
  return null;
}

export interface EligibilityCard {
  title?: string;
  lines: string[];
  ref?: string;
}

export interface ParsedEligibility {
  cards: EligibilityCard[];
  note?: string;
}

export function parseEligibilityBlocks(
  eligibility?: string,
  qualification?: string
): ParsedEligibility | null {
  const raw =
    eligibility && !isGenericNoticePlaceholder(eligibility)
      ? eligibility
      : qualification && !isGenericNoticePlaceholder(qualification)
      ? qualification
      : '';

  if (!raw.trim()) return null;

  let text = raw.replace(/\s+/g, ' ').trim();
  const extraNotes: string[] = [];

  // Pull out known standalone trailing requirements/notes cleanly
  const parentheticalMatches = text.match(/\(([^)]*(?:eligible|not eligible|mandatory|required)[^)]*)\)\.?/gi);
  if (parentheticalMatches) {
    for (const pm of parentheticalMatches) {
      extraNotes.push(pm.replace(/^\(|\)\.?$/g, '').trim());
      text = text.replace(pm, ' ').replace(/\s+/g, ' ').trim();
    }
  }

  const domicileSuffix = text.match(/((?:Valid\s+)?J&K\s+Domicile\s+Certificate[^.]*\.?)$/i);
  if (domicileSuffix && text.length > domicileSuffix[1].length + 12) {
    extraNotes.push(domicileSuffix[1].trim());
    text = text.slice(0, text.length - domicileSuffix[1].length).trim();
  }

  // Split multi-post definitions by "; " or ". PostTitle: "
  const segments = text
    .split(/;\s+|\.\s+(?=[A-Z0-9][^:.]{2,42}:)/)
    .map((s) => s.replace(/\.$/, '').trim())
    .filter(Boolean);

  const cards: EligibilityCard[] = [];

  for (const seg of segments) {
    const colonIdx = seg.indexOf(':');
    if (colonIdx > 1 && colonIdx < 48) {
      const title = seg.slice(0, colonIdx).trim();
      let detail = seg.slice(colonIdx + 1).trim();
      let ref: string | undefined;

      const asPerIdx = detail.search(/\bas per\b/i);
      if (asPerIdx > 0) {
        ref = detail.slice(asPerIdx + 6).trim().replace(/\.$/, '');
        detail = detail.slice(0, asPerIdx).trim().replace(/[,.]$/, '');
      }

      const lines = detail
        .split(/\s*&\s+(?=Maximum|Minimum|Appeared|Passed)/i)
        .map((l) => l.trim())
        .filter(Boolean);

      cards.push({
        title,
        lines: lines.length > 0 ? lines : [detail],
        ref,
      });
    } else {
      cards.push({
        title: segments.length === 1 ? 'Qualification Requirement' : undefined,
        lines: [seg],
      });
    }
  }

  if (cards.length === 0) return null;

  return {
    cards,
    note:
      extraNotes.length > 0
        ? extraNotes
            .map((n) => (n.endsWith('.') ? n : `${n}.`))
            .join(' ')
        : undefined,
  };
}

export interface AgeLimitRow {
  category: string;
  limit: string;
}

export function parseAgeLimitRows(
  ageLimit?: string,
  ageRelaxationDetails?: string
): AgeLimitRow[] {
  const rows: AgeLimitRow[] = [];

  if (hasRealDataValue(ageLimit) && !isGenericNoticePlaceholder(ageLimit)) {
    const raw = String(ageLimit).trim();
    if (raw.includes('|')) {
      const parts = raw
        .split('|')
        .map((p) => p.trim())
        .filter(Boolean);
      for (const part of parts) {
        const idx = part.indexOf(':');
        if (idx > 0) {
          rows.push({
            category: part.slice(0, idx).trim(),
            limit: part.slice(idx + 1).trim(),
          });
        } else {
          rows.push({
            category: 'Category / Rule',
            limit: part,
          });
        }
      }
    } else {
      rows.push({
        category: 'Prescribed age limit',
        limit: raw,
      });
    }
  }

  if (hasRealDataValue(ageRelaxationDetails) && !isGenericNoticePlaceholder(ageRelaxationDetails)) {
    rows.push({
      category: 'Age relaxation',
      limit: String(ageRelaxationDetails).trim(),
    });
  }

  return rows;
}
