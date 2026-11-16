import { isPublishedSarkariItem, type PostStructuredType, type SarkariItem } from '../../data/sarkariData';
import { KNOWN_DUPLICATE_MAP } from '../../data/sarkariMigration';
import type { ComputedSarkariStatus } from '../../utils/sarkariStatus';
import { formatLongDate } from './postBulletinHelpers';
import { hasRealDataValue, isGenericNoticePlaceholder } from './postHelpers';

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
  const hasFee = hasRealDataValue(genFee) || hasRealDataValue(scFee);

  const isEdu =
    item.section === 'education' ||
    item.category === 'ignou' ||
    item.category === 'admissions' ||
    item.category === 'exam_forms' ||
    item.category === 'cluster_univ' ||
    item.category === 'nta';

  // 1. Quick summary (3-5 concise factual lines from existing fields)
  const quickSummary: string[] = [];
  const leadText = (item.summary || item.shortInfo || '').trim();
  if (leadText) {
    quickSummary.push(leadText);
  }
  quickSummary.push(
    `Issued by ${orgName}${
      hasRealDataValue(item.advertisementNo) ? ` (${item.advertisementNo})` : ''
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
      `${hasVacancies ? `Reported count / scope: ${vacanciesStr}. ` : ''}${
        endLong
          ? statusInfo.isClosed
            ? `Submission deadline closed on ${endLong}.`
            : `Application / form window ${startLong ? `from ${startLong} ` : ''}closes on ${endLong}.`
          : `Check ${sourceDomain} for exact schedule details.`
      }`
    );
    if (hasFee) {
      quickSummary.push(
        `Fee noted in notice: ${genFee || 'As per notice'}${
          scFee && scFee !== genFee ? ` (Reserved/SC/ST: ${scFee})` : ''
        }.`
      );
    }
  }

  // 2. Who should apply / proceed
  const whoShouldApply: string[] = [];
  if (effectiveType === 'result' || effectiveType === 'admit_card' || effectiveType === 'dv' || effectiveType === 'exam' || effectiveType === 'answer_key') {
    whoShouldApply.push(
      `Registered candidates / enrolled students of ${orgName} covered under ${
        hasRealDataValue(item.learnerGroup) ? item.learnerGroup : qualStr
      }.`
    );
    whoShouldApply.push(
      effectiveType === 'answer_key'
        ? `Candidates who appeared in the examination and need to verify responses${
            statusInfo.isClosingSoon && endLong ? ` or submit objections before ${endLong}` : ''
          }.`
        : effectiveType === 'dv'
        ? 'Shortlisted applicants listed in the notice who hold original academic, identity, and category/domicile certificates.'
        : `Applicants holding a valid registration, enrolment, or roll number issued by ${orgName}.`
    );
    if (item.jkDomicile) {
      whoShouldApply.push(
        'Domicile residents of Jammu & Kashmir eligible under the notified cadre or regional schedule.'
      );
    }
  } else {
    whoShouldApply.push(
      `Eligible candidates meeting the stated educational criteria (${qualStr}) as detailed in the ${orgName} notice.`
    );
    if (hasRealDataValue(item.ageLimit) && !isGenericNoticePlaceholder(item.ageLimit)) {
      whoShouldApply.push(
        `Applicants falling within the notified age limit (${item.ageLimit}) on the cutoff date specified in the official advertisement.`
      );
    }
    if (item.jkDomicile) {
      whoShouldApply.push(
        'Permanent residents holding a valid Jammu & Kashmir Domicile Certificate issued by a competent authority.'
      );
    }
    whoShouldApply.push(
      statusInfo.isClosed
        ? 'Note: New registrations are closed — this bulletin remains available only for record reference.'
        : `Applicants with active mobile number, email ID, and scanned documents ready before ${endLong || 'the closing date'}.`
    );
  }

  // 3. Who should not apply
  const whoShouldNotApply: string[] = [];
  if (statusInfo.isClosed || statusInfo.isCancelled) {
    whoShouldNotApply.push(
      statusInfo.isCancelled
        ? `All applicants — this ${orgName} notice has been cancelled or withdrawn.`
        : `New applicants — the closing deadline${endLong ? ` (${endLong})` : ''} has already passed and fresh submissions are not accepted.`
    );
  }
  if (effectiveType === 'result' || effectiveType === 'admit_card' || effectiveType === 'dv' || effectiveType === 'answer_key' || effectiveType === 'exam') {
    whoShouldNotApply.push(
      `Candidates who did not register or appear for the relevant ${orgName} cycle cannot submit new applications through this notice.`
    );
  } else {
    whoShouldNotApply.push(
      `Candidates whose final qualification, mark sheet result, or required certificate is awaited beyond the cutoff date specified by ${orgName} (unless explicitly permitted in the notification).`
    );
    if (item.jkDomicile) {
      whoShouldNotApply.push(
        'Applicants without a valid J&K Domicile Certificate where Jammu & Kashmir domicile is mandatory under the advertisement rules.'
      );
    }
    if (hasRealDataValue(item.ageLimit) && !isGenericNoticePlaceholder(item.ageLimit)) {
      whoShouldNotApply.push(
        `Candidates outside the notified age range (${item.ageLimit}) who do not qualify for an official category relaxation.`
      );
    }
  }

  // 4. Common mistakes to avoid
  const commonMistakes: string[] = [
    `Relying on third-party summaries without opening the official ${sourceDomain} notification PDF or portal circular.`,
    effectiveType === 'application' || effectiveType === 'admission' || effectiveType === 'upcoming'
      ? 'Uploading blurred passport photographs, dark-background signatures, or files exceeding the portal pixel/KB limits — resize documents accurately before login.'
      : 'Missing roll number, registration ID, or date-of-birth formatting while checking status or downloading PDFs.',
    'Entering mismatched spelling of candidate name, parent name, or date of birth that differs from the 10th/Matriculation certificate.',
    hasFee
      ? 'Immediately paying the application fee twice if a bank receipt shows pending — check portal transaction status or wait before retrying.'
      : 'Submitting forms in the final few hours before closing when portal traffic and server timeouts increase.',
  ];
  if (item.jkDomicile || !isEdu) {
    commonMistakes.push(
      'Selecting an incorrect reservation category (RBA, EWS, SC, ST, OBC) without holding a valid certificate dated on or before the closing deadline.'
    );
  }

  // 5. What to do next (dated action steps)
  const whatToDoNext: string[] = [
    `Step 1 — Verify source notice (${postLong}): Open ${sourceDomain} and confirm all official eligibility lines and annexures.`,
    statusInfo.isClosed
      ? `Step 2 — Check post-closing updates: Since ${endLong || 'the deadline'} has passed, watch ${sourceDomain} only for shortlist, edit-window, or exam date circulars.`
      : statusInfo.isUpcoming
      ? `Step 2 — Keep documents ready for ${startLong || 'opening date'}: Verify certificate validity and scan photograph and signature in required dimensions.`
      : effectiveType === 'result' || effectiveType === 'admit_card' || effectiveType === 'answer_key'
      ? `Step 2 — Keep login details ready: Use your registration number and date of birth on ${sourceDomain}${endLong ? ` before ${endLong}` : ''}.`
      : `Step 2 — Complete online submission before ${endLong || 'closing'}: Fill details carefully${startLong ? ` (window opened ${startLong})` : ''} and preview every field prior to final lock.`,
    `Step 3 — Save official proof: Download and print the confirmation PDF, payment receipt, or hall ticket for future verification stages.`,
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
