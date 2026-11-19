import { isPublishedSarkariItem, type PostStructuredType, type SarkariItem } from '../../data/sarkariData';
import { KNOWN_DUPLICATE_MAP } from '../../data/sarkariMigration';
import type { ComputedSarkariStatus } from '../../utils/sarkariStatus';
import { formatLongDate } from './postBulletinHelpers';
import {
  hasExplicitFee,
  hasRealDataValue,
  isGenericNoticePlaceholder,
  isZeroOrExemptFee,
  resolveApplicationMode,
  resolveApplicationModeLabel,
} from './postHelpers';

export const EDITORIAL_AUTHOR_TEXT =
  'Written and reviewed by CSC DOST editorial desk, Authorized CSC VLE Wasim Ahmad Khanday';

export interface PostEnrichmentData {
  quickSummary: string[];
  whoShouldApply: string[];
  whoShouldNotApply: string[];
  commonMistakes: string[];
  whatToDoNext: string[];
  sourceDomain: string;
  portalUrl: string;
  verifiedDateText: string;
}

export interface RelatedNoticeLink {
  id: string;
  title: string;
  relationLabel: string;
  dateText?: string;
}

const CURATED_RELATED_CLUSTERS: Array<{
  ids: string[];
  labels: Record<string, string>;
}> = [
  {
    // JKSSB Advt 06/2026 Application + Document Verification + Edit Option stages
    ids: [
      'jkssb-advt-06-2026',
      'jkssb-dv-notice-advt06-2026-works-supervisor',
      'jkssb-edit-option-advt-06-07-08-of-2026',
    ],
    labels: {
      'jkssb-advt-06-2026': 'Recruitment Application · Advt 06/2026',
      'jkssb-dv-notice-advt06-2026-works-supervisor': 'Document Verification Stage · Advt 06/2026',
      'jkssb-edit-option-advt-06-07-08-of-2026': 'Edit Option Notice · Advt 06/2026',
    },
  },
  {
    // Army 10+2 TES Course batches
    ids: [
      'indian-army-tes-57-course-closing-today',
      'army-tes-55-course-july-2027',
      'army-tes-54-course-jan-2027',
    ],
    labels: {
      'indian-army-tes-57-course-closing-today': 'Batch TES-57 · July 2027 Course',
      'army-tes-55-course-july-2027': 'Batch TES-55 · July 2027 Course',
      'army-tes-54-course-jan-2027': 'Batch TES-54 · Jan 2027 Course',
    },
  },
  {
    // Army Technical Graduate Course (TGC) batches
    ids: ['army-tgc-145-course-2026', 'army-tgc-143-course-jul-2027'],
    labels: {
      'army-tgc-145-course-2026': 'Batch TGC-145 · July 2027 Course',
      'army-tgc-143-course-jul-2027': 'Batch TGC-143 · July 2027 Course',
    },
  },
  {
    // RRB Ministerial & Isolated Categories CEN cycles
    ids: [
      'rrb-isolated-ministerial-cen-09-2026',
      'rrb-ministerial-isolated-cen08-2026',
      'rrb-ministerial-isolated-2026',
    ],
    labels: {
      'rrb-isolated-ministerial-cen-09-2026': 'CEN 09/2026 · 191 Vacancies',
      'rrb-ministerial-isolated-cen08-2026': 'CEN 08/2026 · 1,280 Vacancies',
      'rrb-ministerial-isolated-2026': 'CEN 06/2026 · 1,038 Vacancies',
    },
  },
  {
    // JKSSB Advt 08/2025 Junior Assistant stages
    ids: ['jkssb-jr-assistant-2025', 'jkssb-junior-assistant-dv-schedule-nov-2026'],
    labels: {
      'jkssb-jr-assistant-2025': 'Recruitment Notice · Advt 08/2025',
      'jkssb-junior-assistant-dv-schedule-nov-2026': 'Document Verification · Advt 08/2025',
    },
  },
  {
    // JKSSB Health Educator Advt 07/2025 stages
    ids: [
      'jkssb-health-educator-provisional-answer-key-exam-01-nov-2026',
      'jkssb-health-educator-result-final-key-nov-2026',
    ],
    labels: {
      'jkssb-health-educator-provisional-answer-key-exam-01-nov-2026': 'Provisional Answer Key Stage',
      'jkssb-health-educator-result-final-key-nov-2026': 'Final Answer Key & Result',
    },
  },
  {
    // JKSSB Advt 07 & 08/2026 edit window
    ids: ['jkssb-advt-08-2026', 'jkssb-school-teacher-2026', 'jkssb-edit-option-advt-06-07-08-of-2026'],
    labels: {
      'jkssb-advt-08-2026': 'Advt 08/2026 Recruitment',
      'jkssb-school-teacher-2026': 'Advt 07/2026 Teacher Recruitment',
      'jkssb-edit-option-advt-06-07-08-of-2026': 'Edit Option Window (16–20 Nov 2026)',
    },
  },
  {
    // SSC CGL 2026 stages
    ids: [
      'ssc-cgl-tier-1-tentative-answer-key-objection-notice-2026',
      'ssc-cgl-2026',
    ],
    labels: {
      'ssc-cgl-tier-1-tentative-answer-key-objection-notice-2026': 'SSC CGL 2026 Tier-1 Answer Key',
      'ssc-cgl-2026': 'SSC CGL 2026 Main Recruitment',
    },
  },
  {
    // JKSSB Accounts Assistant (Finance) Advt 10/2025 Item 271 stages
    ids: [
      'jkssb-accounts-assistant-finance-answer-key-2026',
      'jkssb-accounts-assistant-finance-exam-date-admit-card-2026',
    ],
    labels: {
      'jkssb-accounts-assistant-finance-answer-key-2026': 'Provisional Answer Key & Objections (16–18 Nov)',
      'jkssb-accounts-assistant-finance-exam-date-admit-card-2026': 'OMR Exam & E-Admit Card (15 Nov 2026)',
    },
  },
  {
    // SSC SI Delhi Police & CAPFs Exam 2026 stages
    ids: [
      'ssc-cpo-si-2026-paper1-city-admit-card',
      'ssc-cpo-si-delhi-police-capf-2026',
    ],
    labels: {
      'ssc-cpo-si-2026-paper1-city-admit-card': 'Paper-I City Intimation & Admit Card (23–28 Nov)',
      'ssc-cpo-si-delhi-police-capf-2026': 'Main Recruitment Notice · 4,187 Vacancies',
    },
  },
];

export function getRelatedNoticesForPost(
  item: SarkariItem,
  allPosts: SarkariItem[],
  maxItems = 4
): RelatedNoticeLink[] {
  const pool = allPosts.filter(
    (p) =>
      p.id !== item.id &&
      isPublishedSarkariItem(p) &&
      !p.duplicateOfId &&
      !KNOWN_DUPLICATE_MAP[p.id]
  );
  const byId = new Map(pool.map((p) => [p.id, p]));
  const results: RelatedNoticeLink[] = [];
  const seen = new Set<string>();

  for (const cluster of CURATED_RELATED_CLUSTERS) {
    if (!cluster.ids.includes(item.id)) continue;
    for (const targetId of cluster.ids) {
      if (targetId === item.id || seen.has(targetId)) continue;
      const target = byId.get(targetId);
      if (!target) continue;
      seen.add(targetId);
      results.push({
        id: target.id,
        title: target.title,
        relationLabel: cluster.labels[targetId] || target.advertisementNo || 'Related Notice',
        dateText: target.lastDate || target.postDate,
      });
    }
  }

  // Fallback to same category / org updates if under 2 items so every notice stays connected
  if (results.length < 2) {
    for (const candidate of pool) {
      if (results.length >= Math.min(maxItems, 3)) break;
      if (seen.has(candidate.id)) continue;
      if (candidate.category === item.category) {
        seen.add(candidate.id);
        results.push({
          id: candidate.id,
          title: candidate.title,
          relationLabel: candidate.advertisementNo || 'Related Category Notice',
          dateText: candidate.lastDate || candidate.postDate,
        });
      }
    }
  }

  return results.slice(0, maxItems);
}

function getDomainFromUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    return parsed.hostname.replace(/^www\./i, '');
  } catch {
    return rawUrl;
  }
}

export function buildPostEnrichmentData(
  item: SarkariItem,
  effectiveType: PostStructuredType,
  statusInfo: ComputedSarkariStatus,
  orgName: string,
  portalUrl: string
): PostEnrichmentData {
  const sourceDomain = getDomainFromUrl(portalUrl);
  const startRaw = item.applyStart || item.startDate;
  const endRaw = item.applyEnd || item.lastDate;
  const startLong = startRaw ? formatLongDate(startRaw) || startRaw : '';
  const endLong = endRaw ? formatLongDate(endRaw) || endRaw : '';
  const postLong = formatLongDate(item.postDate || item.documentDate) || item.postDate || 'recent circular';
  const verifiedDateText =
    formatLongDate(
      item.updatedAt || item.verification?.lastVerified || item.postDate || item.documentDate
    ) ||
    item.postDate ||
    'As per official notice';

  const hasVacancies =
    hasRealDataValue(item.totalPosts || item.posts) &&
    !isGenericNoticePlaceholder(item.totalPosts || item.posts);
  const vacanciesStr = String(item.totalPosts || item.posts || '').trim();
  const qualStr =
    hasRealDataValue(item.eligibility || item.qualification) &&
    !isGenericNoticePlaceholder(item.eligibility || item.qualification)
      ? String(item.eligibility || item.qualification).trim()
      : 'the prescribed criteria in the official notification';

  const genFee = item.fee?.genObc || item.fees?.genObc;
  const scFee = item.fee?.scSt || item.fees?.scSt;
  const hasFee = hasExplicitFee(item);
  const zeroFee = isZeroOrExemptFee(item);
  const appMode = resolveApplicationMode(item);
  const appModeLabel = resolveApplicationModeLabel(item);

  const isEdu =
    item.section === 'education' ||
    item.category === 'ignou' ||
    item.category === 'admissions' ||
    item.category === 'exam_forms' ||
    item.category === 'cluster_univ' ||
    item.category === 'nta';

  // 1. Quick summary (concise factual highlights without duplicating the lead summary above)
  const quickSummary: string[] = [];
  quickSummary.push(
    `Issued by ${orgName}${
      hasRealDataValue(item.advertisementNo) && !isGenericNoticePlaceholder(item.advertisementNo)
        ? ` (${item.advertisementNo})`
        : ''
    }${postLong ? ` and published on ${postLong}` : ''}.`
  );
  if (effectiveType === 'result' || effectiveType === 'answer_key') {
    quickSummary.push(
      statusInfo.isClosingSoon && endLong
        ? `Window / objection period runs until ${endLong} via ${sourceDomain}.`
        : `Official update published on ${sourceDomain}. Review roll numbers, marks, or PDF details directly on the portal.`
    );
  } else if (effectiveType === 'admit_card' || effectiveType === 'exam' || effectiveType === 'dv') {
    quickSummary.push(
      `Current status: ${statusInfo.badgeLabel}${
        statusInfo.dateValue ? ` (${statusInfo.dateValue})` : ''
      }. Official details are hosted on ${sourceDomain}.`
    );
  } else {
    quickSummary.push(
      `${hasVacancies ? `Reported count / scope: ${vacanciesStr}. ` : ''}Application mode: ${appModeLabel}. ${
        endLong
          ? statusInfo.isClosed
            ? `Submission deadline closed on ${endLong}.`
            : appMode === 'offline'
            ? `Offline applications must reach the notified address on or before ${endLong}.`
            : `Application / form window ${startLong ? `from ${startLong} ` : ''}closes on ${endLong}.`
          : `Check ${sourceDomain} for exact schedule details.`
      }`
    );
    if (hasFee) {
      const feeSummaryLine = zeroFee
        ? 'Application fee: Exempted / No fee required as stated in the official notice.'
        : scFee && scFee !== genFee
        ? /\bfor\b/i.test(scFee)
          ? `Fee noted in notice: ${genFee || 'As per notice'}; ${scFee}.`
          : `Fee noted in notice: ${genFee || 'As per notice'} (Reserved / SC / ST: ${scFee}).`
        : `Fee noted in notice: ${genFee || 'As per notice'}.`;
      quickSummary.push(feeSummaryLine);
    } else if (hasRealDataValue(item.paymentInstructions)) {
      quickSummary.push(String(item.paymentInstructions).trim());
    }
  }

  // 2. Who should apply / proceed
  const whoShouldApply: string[] = [];
  if (effectiveType === 'result' || effectiveType === 'admit_card' || effectiveType === 'dv' || effectiveType === 'exam' || effectiveType === 'answer_key') {
    whoShouldApply.push(
      `Candidates registered under this ${orgName} cycle (${hasRealDataValue(item.learnerGroup) ? item.learnerGroup : qualStr}).`
    );
    whoShouldApply.push(
      effectiveType === 'answer_key'
        ? `Appeared examinees reviewing ${orgName} responses${statusInfo.isClosingSoon && endLong ? ` before ${endLong}` : ''}.`
        : effectiveType === 'dv'
        ? `Shortlisted applicants carrying original certificates required by ${orgName}.`
        : `Holders of valid ${orgName} roll or registration numbers covered under this notice.`
    );
    if (item.jkDomicile) {
      whoShouldApply.push('Eligible Jammu & Kashmir domicile candidates covered under this notice.');
    }
  } else {
    whoShouldApply.push(
      `Applicants fulfilling ${qualStr} as notified by ${orgName}.`
    );
    if (hasRealDataValue(item.ageLimit) && !isGenericNoticePlaceholder(item.ageLimit)) {
      whoShouldApply.push(
        `Candidates within the prescribed age limit (${item.ageLimit}).`
      );
    }
    if (item.jkDomicile) {
      whoShouldApply.push('Holders of a valid Jammu & Kashmir Domicile Certificate.');
    }
    whoShouldApply.push(
      statusInfo.isClosed
        ? `Window closed (${endLong || statusInfo.dateValue}); retained for reference.`
        : appMode === 'offline'
        ? `Candidates able to prepare self-attested testimonials and deliver the offline application on or before ${endLong || 'the deadline'}.`
        : `Candidates with active mobile/email credentials ready before ${endLong || 'the deadline'} on ${sourceDomain}.`
    );
  }

  // 3. Who should not apply
  const whoShouldNotApply: string[] = [];
  if (statusInfo.isClosed || statusInfo.isCancelled) {
    whoShouldNotApply.push(
      statusInfo.isCancelled
        ? `All applicants — ${orgName} cancelled or withdrew this notice.`
        : `New applicants — the submission window closed on ${endLong || statusInfo.dateValue}.`
    );
  }
  if (effectiveType === 'result' || effectiveType === 'admit_card' || effectiveType === 'dv' || effectiveType === 'answer_key' || effectiveType === 'exam') {
    whoShouldNotApply.push(
      `Unregistered applicants — this update applies to existing ${orgName} candidates only.`
    );
  } else {
    whoShouldNotApply.push(
      `Candidates who do not meet the prescribed educational qualification or experience criteria stated in the official ${orgName} notice.`
    );
    if (item.jkDomicile) {
      whoShouldNotApply.push(`Non-domicile applicants where ${orgName} mandates J&K domicile.`);
    }
    if (hasRealDataValue(item.ageLimit) && !isGenericNoticePlaceholder(item.ageLimit)) {
      whoShouldNotApply.push(
        hasRealDataValue(item.ageRelaxationDetails)
          ? `Candidates outside ${item.ageLimit} unless eligible under notified relaxation (${item.ageRelaxationDetails}).`
          : `Candidates outside the stated age / tenure criteria (${item.ageLimit}) in the official notice.`
      );
    }
  }

  // 4. Common mistakes to avoid
  const commonMistakes: string[] = [
    `Skipping the original ${orgName} notification PDF on ${sourceDomain} before acting.`,
  ];
  if (appMode === 'offline' && (effectiveType === 'application' || effectiveType === 'admission' || effectiveType === 'upcoming')) {
    commonMistakes.push(
      'Sending an incomplete or unsigned application form, or omitting self-attested copies of required enclosures.'
    );
    if (item.envelopeSuperscription) {
      commonMistakes.push(
        `Forgetting to superscribe the envelope exactly as directed ("${item.envelopeSuperscription}").`
      );
    }
    commonMistakes.push(
      `Dispatching too close to ${endLong || 'the closing date'} without accounting for postal delivery time.`
    );
  } else {
    commonMistakes.push(
      effectiveType === 'application' || effectiveType === 'admission' || effectiveType === 'upcoming'
        ? `Uploading unclear or non-compliant document files on ${sourceDomain} without checking the official notice specifications.`
        : `Entering a mismatched roll number or date of birth when checking this ${orgName} update on ${sourceDomain}.`
    );
    commonMistakes.push(
      `Spelling or date-of-birth mismatches compared with Class 10th / academic records during ${orgName} verification.`
    );
    if (hasFee && !zeroFee) {
      commonMistakes.push(
        `Double-paying the ${orgName} application fee before checking portal or bank reconciliation status.`
      );
    } else {
      commonMistakes.push(
        `Waiting until closing hours on ${sourceDomain} when portal traffic peaks.`
      );
    }
  }
  if (item.jkDomicile) {
    commonMistakes.push(
      'Claiming J&K domicile or reserved categories without valid certificates dated within the official cutoff.'
    );
  }

  // 5. What to do next (rendered inside <ol>; no hardcoded numeric prefixes)
  const whatToDoNext: string[] = [
    `Confirm the official ${orgName} notice${postLong ? ` (published ${postLong})` : ''} directly on ${sourceDomain}.`,
    statusInfo.isClosed
      ? `Follow post-closing ${orgName} updates (${endLong || 'closed'}) on ${sourceDomain}.`
      : statusInfo.isUpcoming
      ? `Prepare required certificates and scanned files ahead of ${startLong || 'opening'}.`
      : effectiveType === 'result' || effectiveType === 'admit_card' || effectiveType === 'answer_key'
      ? `Sign in on ${sourceDomain} with your registration ID${endLong ? ` before ${endLong}` : ''} to check or download the official document.`
      : appMode === 'offline'
      ? `Download the prescribed offline application format from ${sourceDomain}, attach required self-attested enclosures, and send to the notified ${orgName} address on or before ${endLong || 'closing'}.`
      : `Complete and submit your application on ${sourceDomain} before ${endLong || 'closing'}${startLong ? ` (window opened ${startLong})` : ''}.`,
    appMode === 'offline'
      ? 'Keep a photocopy of your signed application form, enclosures, and postal/submission receipt for reference.'
      : `Save the official ${orgName} PDF and final confirmation receipt for future reference.`,
  ];

  return {
    quickSummary,
    whoShouldApply,
    whoShouldNotApply,
    commonMistakes,
    whatToDoNext,
    sourceDomain,
    portalUrl,
    verifiedDateText,
  };
}
