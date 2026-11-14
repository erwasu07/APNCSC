import type {
  SarkariItem,
  PostSection,
  PostStructuredType,
  PostFeeInfo,
  TimelineStep,
  PostFaqItem,
} from './sarkariData';
import {
  computeSarkariStatus,
  inferNoticeStage,
  formatCleanDateStr,
} from '../utils/sarkariStatus';

export interface MigrationReviewEntry {
  id: string;
  title: string;
  category: string;
  type: PostStructuredType;
  section: PostSection;
  reasons: string[];
  oldStatus?: string;
  computedStatus: string;
  duplicateOfId?: string;
}

/**
 * Known overlapping/duplicate notices preserved for URL continuity (/post/<slug>)
 * while collapsed/deduplicated in list views via getDeduplicatedSarkariPosts().
 */
export const KNOWN_DUPLICATE_MAP: Record<string, { canonicalId: string; note: string }> = {
  'army-tes-57-course-2026': {
    canonicalId: 'indian-army-tes-57-course-closing-today',
    note: 'Duplicate of Indian Army 10+2 TES-57 Course 2026 notification.',
  },
  'ssc-cgl-2026-tier-1-answer-key': {
    canonicalId: 'ssc-cgl-tier-1-tentative-answer-key-objection-notice-2026',
    note: 'Duplicate SSC CGL 2026 Tier-1 Answer Key notice pointing to same writeup_04112026.pdf.',
  },
  'ssc-stenographer-grade-cd-exam-2026': {
    canonicalId: 'ssc-stenographer-grade-c-d-exam-2026',
    note: 'Overlapping duplicate for SSC Stenographer Grade C & D 2026.',
  },
  'ssc-steno-2026': {
    canonicalId: 'ssc-stenographer-grade-c-d-exam-2026',
    note: 'Overlapping duplicate for SSC Stenographer Grade C & D 2026.',
  },
  'ssc-jht-examination-2026': {
    canonicalId: 'ssc-junior-hindi-translator-jht-exam-2026',
    note: 'Overlapping duplicate for SSC JHT / Combined Hindi Translators 2026.',
  },
  'army-tes-54-course-2026': {
    canonicalId: 'army-tes-54-course-jan-2027',
    note: 'Overlapping duplicate for Indian Army 10+2 TES-54 Course (Jan 2027).',
  },
  'cus-bed-supplementary-4th-sem-exam-dyd-2026': {
    canonicalId: 'cus-bed-4th-sem-supplementary-exam-2026',
    note: 'Overlapping CUS B.Ed 4th Sem Supplementary Batch 2024 notice.',
  },
};

const KNOWN_VENUE_TIME: Record<string, { venue?: string; reportingTime?: string }> = {
  'ignou-rc-srinagar-campus-placement-drive-nov-2026': {
    venue: 'Bibi Halima College of Nursing & Medical Technology, Rainawari, Srinagar',
    reportingTime: '10:00 AM onwards',
  },
  'jkssb-forest-supplementary-dv-notice-nov-2026': {
    reportingTime: '11:00 AM to 4:00 PM',
  },
  'ignou-dec-2026-tee-revised-tentative-datesheet-odl-online': {
    reportingTime: 'Morning 10:00 AM–1:00 PM · Evening 2:00 PM–5:00 PM',
  },
  'ignou-dec-2026-tee-tentative-datesheet-goal': {
    reportingTime: '6:00 PM–9:00 PM IST (8:30 AM–11:30 AM GYT)',
  },
  'ignou-dec-2026-tee-tentative-datesheet-evab': {
    reportingTime: 'Morning 12:30 PM–3:30 PM IST · Evening 4:30 PM–7:30 PM IST',
  },
};

export function resolvePostSection(item: SarkariItem): PostSection {
  if (item.section === 'jobs' || item.section === 'education') {
    return item.section;
  }

  if (item.category === 'ignou' || item.institution === 'IGNOU') {
    return 'education';
  }
  if (['admissions', 'cluster_univ', 'exam_forms', 'nta'].includes(item.category)) {
    return 'education';
  }
  if (['jkssb', 'army_jobs', 'ssc_jobs', 'rrb_jobs', 'banking_jobs', 'jobs'].includes(item.category)) {
    return 'jobs';
  }

  // Secondary classification for legacy cross-cutting buckets (admit_cards, results, answer_keys, syllabus)
  const hay = `${item.title} ${item.department || ''} ${item.institution || ''}`.toUpperCase();
  if (
    hay.includes('NEET') ||
    hay.includes('JEE') ||
    hay.includes('CUET') ||
    hay.includes('CTET') ||
    hay.includes('UGC NET') ||
    hay.includes('JKBOSE') ||
    hay.includes('CBSE') ||
    hay.includes('IGNOU') ||
    hay.includes('KASHMIR UNIVERSITY') ||
    hay.includes('CLUSTER UNIVERSITY')
  ) {
    return 'education';
  }

  return 'jobs';
}

export function resolvePostOrg(item: SarkariItem): string {
  if (item.org && item.org.trim()) return item.org.trim();
  if (item.category === 'ignou' || item.institution === 'IGNOU') return 'IGNOU';
  if (item.category === 'jkssb') return 'JKSSB';
  if (item.category === 'army_jobs') return 'Indian Army';
  if (item.category === 'ssc_jobs') return 'SSC';
  if (item.category === 'rrb_jobs') return 'RRB';
  if (item.category === 'cluster_univ') return 'Cluster University Srinagar';
  if (item.category === 'admissions' || item.category === 'exam_forms') {
    return 'University of Kashmir';
  }
  if (item.category === 'nta') return 'NTA';
  if (item.category === 'banking_jobs') return 'IBPS / Banking';

  const t = item.title.toUpperCase();
  if (t.includes('JKSSB')) return 'JKSSB';
  if (t.includes('IGNOU')) return 'IGNOU';
  if (t.includes('CLUSTER UNIVERSITY')) return 'Cluster University Srinagar';
  if (t.includes('KASHMIR UNIVERSITY') || t.includes('UNIVERSITY OF KASHMIR')) {
    return 'University of Kashmir';
  }
  if (t.includes('SSC')) return 'SSC';
  if (t.includes('RRB') || t.includes('RPF') || t.includes('RAILWAY')) return 'RRB';
  if (t.includes('ARMY') || t.includes('TES-')) return 'Indian Army';
  if (t.includes('NTA') || t.includes('NEET') || t.includes('JEE') || t.includes('CUET') || t.includes('UGC NET')) {
    return 'NTA / IIT';
  }
  if (t.includes('JKBOSE')) return 'JKBOSE';
  if (t.includes('CBSE') || t.includes('CTET')) return 'CBSE';
  if (t.includes('UPSC')) return 'UPSC';
  if (t.includes('UP POLICE')) return 'UP Police';
  return item.department || 'Official Authority';
}

export function resolvePostStructuredType(
  item: SarkariItem,
  customNow?: Date
): PostStructuredType {
  if (item.type) return item.type;

  const computed = computeSarkariStatus(item, customNow);
  const stage = computed.stage;

  if (stage === 'document_verification') return 'dv';
  if (stage === 'admit_card') return 'admit_card';
  if (stage === 'date_sheet' || stage === 'examination' || stage === 'rc_update') return 'exam';
  if (stage === 'result' || stage === 'grade_card') return 'result';
  if (stage === 'answer_key' || stage === 'objection_window') return 'answer_key';

  if (computed.applicationStatus === 'upcoming') return 'upcoming';

  if (
    stage === 'admission' ||
    stage === 're_registration' ||
    (resolvePostSection(item) === 'education' &&
      ['admission', 're_registration', 'exam_form', 'assignment', 'project_practical'].includes(stage))
  ) {
    return stage === 'admission' || stage === 're_registration' ? 'admission' : 'application';
  }

  return 'application';
}

function isJkDomicileRelevant(item: SarkariItem, org: string): boolean {
  if (typeof item.jkDomicile === 'boolean') return item.jkDomicile;
  if (['JKSSB', 'University of Kashmir', 'Cluster University Srinagar', 'JKBOSE'].includes(org)) {
    return true;
  }
  const hay = `${item.title} ${item.shortInfo} ${item.eligibility || ''} ${item.learnerGroup || ''}`.toLowerCase();
  return (
    hay.includes('jammu & kashmir') ||
    hay.includes('jammu and kashmir') ||
    hay.includes('j&k domicile') ||
    hay.includes('domicile of ut of j&k') ||
    hay.includes('rc srinagar')
  );
}

function deriveTimelineSteps(
  item: SarkariItem,
  type: PostStructuredType,
  computed: ReturnType<typeof computeSarkariStatus>
): TimelineStep[] {
  const steps: TimelineStep[] = [];
  const postDate = formatCleanDateStr(item.postDate);
  const docDate = formatCleanDateStr(item.documentDate);
  const start = formatCleanDateStr(item.startDate);
  const end = formatCleanDateStr(item.lastDate);

  if (docDate && docDate !== postDate) {
    steps.push({ label: 'Official Circular Signed', date: docDate, status: 'done' });
  }
  if (postDate) {
    steps.push({ label: 'Notification Published', date: postDate, status: 'done' });
  }

  if (type === 'application' || type === 'admission' || type === 'upcoming') {
    if (start) {
      steps.push({
        label: 'Window Opens',
        date: start,
        status: computed.isUpcoming ? 'upcoming' : 'done',
      });
    }
    if (end) {
      steps.push({
        label: 'Closing Deadline',
        date: item.closingTime ? `${end} (${item.closingTime})` : end,
        status: computed.isClosed ? 'done' : computed.isOpen ? 'active' : 'upcoming',
      });
    }
  } else if (type === 'dv') {
    steps.push({
      label: 'Document Verification',
      date: start && end && start !== end ? `${start} – ${end}` : start || end || postDate,
      status: computed.computedStatus === 'closed' ? 'done' : 'active',
    });
  } else if (type === 'exam') {
    steps.push({
      label: 'Scheduled Event / Exam Window',
      date: start && end && start !== end ? `${start} – ${end}` : start || end || postDate,
      status: computed.computedStatus === 'closed' ? 'done' : 'active',
    });
  } else if (type === 'admit_card') {
    steps.push({
      label: 'Admit Card Download',
      date: start && end && start !== end ? `${start} – ${end}` : postDate,
      status: computed.computedStatus === 'closed' ? 'done' : 'active',
    });
  } else if (type === 'answer_key') {
    if (start && end && end !== postDate) {
      steps.push({
        label: 'Objection / Query Window',
        date: `${start} – ${end}`,
        status: computed.computedStatus === 'closing_soon' ? 'active' : 'done',
      });
    } else {
      steps.push({ label: 'Answer Key Released', date: postDate, status: 'done' });
    }
  } else if (type === 'result') {
    steps.push({ label: 'Result / Selection List Out', date: postDate, status: 'done' });
  }

  return steps;
}

function buildAuditReasons(
  raw: SarkariItem,
  type: PostStructuredType,
  computed: ReturnType<typeof computeSarkariStatus>,
  dupInfo?: { canonicalId: string; note: string }
): string[] {
  const reasons: string[] = [];

  if (dupInfo) {
    reasons.push(`Duplicate/overlapping notice (canonical: ${dupInfo.canonicalId}): ${dupInfo.note}`);
  }

  // Non-application notice carrying application template fields
  const isNonApplication = ['result', 'dv', 'admit_card', 'exam', 'answer_key'].includes(type);
  if (isNonApplication) {
    if (raw.fees && (raw.fees.genObc || raw.fees.scSt)) {
      const feeText = `${raw.fees.genObc || ''} ${raw.fees.scSt || ''}`.trim();
      const isZeroOrNa = /^(₹0|0|not applicable|n\/a)/i.test(feeText);
      reasons.push(
        isZeroOrNa
          ? `Non-application notice (${type}) still carries placeholder fee object ("${raw.fees.genObc}"). Stripped in structured schema.`
          : `Non-application notice (${type}) carries non-zero application fee ("${raw.fees.genObc}"). Stripped in structured schema — verify whether challenge/re-exam fee belongs in summary.`
      );
    }
    if (raw.startDate && raw.lastDate && raw.startDate === raw.postDate && raw.lastDate === raw.postDate) {
      reasons.push(
        `Non-application notice (${type}) mirrors postDate into startDate/lastDate application template fields.`
      );
    }
  }

  // Old status vs computed status mismatch
  const old = (raw.status || '').trim().toLowerCase();
  if (old) {
    if (old === 'open' && computed.verificationStatus === 'needs_verification') {
      reasons.push(`Old status was "Open" while verificationStatus is "needs_verification" (portal unreachable/unverified).`);
    } else if (old === 'open' && computed.applicationStatus === 'upcoming') {
      reasons.push(`Old status was "Open" but startDate (${raw.startDate}) is in the future relative to today -> computed as "upcoming".`);
    } else if (old === 'open' && computed.applicationStatus === 'closed') {
      reasons.push(`Old status was "Open" but lastDate (${raw.lastDate}) has passed -> computed as "closed" (Archive).`);
    } else if (old === 'closed' && computed.applicationStatus === 'open') {
      reasons.push(`Old status was "Closed" while dates (${raw.startDate}–${raw.lastDate}) are still active.`);
    }
  }

  if (computed.verificationStatus === 'needs_verification') {
    reasons.push(
      raw.verification?.verificationReason || 'Flagged needs_verification (portal verification pending).'
    );
  }

  if (!raw.startDate && !raw.lastDate && (type === 'application' || type === 'admission' || type === 'admit_card' || type === 'result' || type === 'answer_key')) {
    reasons.push('Legacy undated post without startDate/lastDate; uses postDate fallback.');
  }

  return reasons;
}

/**
 * Enriches any SarkariItem with the clean Phase 2 structured schema
 * while preserving every existing raw field and URL untouched.
 */
export function normalizeSarkariItem(raw: SarkariItem, customNow?: Date): SarkariItem {
  const section = resolvePostSection(raw);
  const org = resolvePostOrg(raw);
  const computed = computeSarkariStatus(raw, customNow);
  const type = resolvePostStructuredType(raw, customNow);
  const dupInfo = KNOWN_DUPLICATE_MAP[raw.id];

  const isSubmissionWindow =
    type === 'application' ||
    type === 'admission' ||
    type === 'upcoming' ||
    computed.stage === 'correction';

  const cleanApplyStart = isSubmissionWindow ? formatCleanDateStr(raw.startDate) || undefined : undefined;
  const cleanApplyEnd = isSubmissionWindow ? formatCleanDateStr(raw.lastDate) || undefined : undefined;

  // Strictly omit application `fee` from Result, DV, Admit Card, and Exam notices
  const normalizedFee: PostFeeInfo | undefined =
    type === 'application' || type === 'admission' || type === 'upcoming'
      ? raw.fees
        ? {
            genObc: raw.fees.genObc,
            scSt: raw.fees.scSt,
            note: raw.paymentInstructions || raw.feePerSubject,
          }
        : undefined
      : undefined;

  const venueTime = KNOWN_VENUE_TIME[raw.id];
  const officialUrl =
    raw.officialUrl ||
    raw.verification?.officialApplicationUrl ||
    raw.officialApplicationUrl ||
    raw.officialLink;
  const notificationPdfUrl =
    raw.notificationPdfUrl ||
    raw.verification?.officialNotificationUrl ||
    raw.officialNotificationUrl ||
    (raw.officialLink && /\.pdf($|\?)/i.test(raw.officialLink) ? raw.officialLink : undefined);

  const rawTotalPosts =
    raw.totalPosts !== undefined && raw.totalPosts !== null ? String(raw.totalPosts).trim() : '';

  const timelineSteps =
    raw.timelineSteps && raw.timelineSteps.length > 0
      ? raw.timelineSteps
      : deriveTimelineSteps(raw, type, computed);

  const faq: PostFaqItem[] | undefined = raw.faq;

  const auditReasons = buildAuditReasons(raw, type, computed, dupInfo);

  return {
    ...raw,
    slug: raw.slug || raw.id,
    section,
    org,
    type,
    summary: raw.summary || raw.shortInfo,
    posts: raw.posts || rawTotalPosts || 'As per official notice',
    qualification: raw.qualification || raw.eligibility || 'As per official notice',
    jkDomicile: isJkDomicileRelevant(raw, org),
    applyStart: raw.applyStart ?? cleanApplyStart,
    applyEnd: raw.applyEnd ?? cleanApplyEnd,
    eventDate: raw.eventDate || computed.dateValue,
    eventLabel: raw.eventLabel || computed.dateLabel,
    venue: raw.venue || venueTime?.venue,
    reportingTime: raw.reportingTime || venueTime?.reportingTime,
    fee: raw.fee ?? normalizedFee,
    ageLimit:
      type === 'application' || type === 'admission' || type === 'upcoming'
        ? raw.ageLimit || 'As per official notice'
        : undefined,
    vacancyTable: raw.vacancyTable || raw.departmentBreakdown,
    officialUrl,
    notificationPdfUrl,
    documents: raw.documents || raw.documentsRequired,
    faq,
    timelineSteps,
    postedAt: raw.postedAt || raw.postDate,
    updatedAt: raw.updatedAt || raw.verification?.lastVerified || raw.documentDate || raw.postDate,
    duplicateOfId: raw.duplicateOfId || dupInfo?.canonicalId,
    duplicateNote: raw.duplicateNote || dupInfo?.note,
    migrationReviewReasons: auditReasons.length > 0 ? auditReasons : undefined,
  };
}

/**
 * Returns non-duplicate canonical items for list/category pages
 * (duplicate slugs remain intact in SARKARI_DATA so /post/<slug> never 404s).
 */
export function getDeduplicatedSarkariPosts(items: SarkariItem[]): SarkariItem[] {
  return items.filter((item) => !item.duplicateOfId && !KNOWN_DUPLICATE_MAP[item.id]);
}

/**
 * Generates the Phase 2 migration audit list of every post needing manual review.
 */
export function getMigrationReviewReport(
  items: SarkariItem[],
  customNow?: Date
): MigrationReviewEntry[] {
  const report: MigrationReviewEntry[] = [];
  for (const item of items) {
    const normalized = normalizeSarkariItem(item, customNow);
    const computed = computeSarkariStatus(normalized, customNow);
    const reasons = normalized.migrationReviewReasons || [];
    if (reasons.length > 0) {
      report.push({
        id: normalized.id,
        title: normalized.title,
        category: normalized.category,
        type: normalized.type || 'application',
        section: normalized.section || 'jobs',
        reasons,
        oldStatus: item.status,
        computedStatus: computed.computedStatus,
        duplicateOfId: normalized.duplicateOfId,
      });
    }
  }
  return report;
}
