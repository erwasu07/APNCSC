import { GUIDE_ARTICLES, GuideArticle } from '../data/guidesData';
import type { GuideVerificationState } from '../dbServer';
import { countWords, isValidHttpUrl } from './contentQualityValidator';

export interface GuideVerifyMarker {
  field: string;
  markerText: string;
  context: string;
}

export function extractGuideVerifyMarkers(guide: GuideArticle): GuideVerifyMarker[] {
  const found: GuideVerifyMarker[] = [];
  const regex = /\[VERIFY[^\]]*\]/gi;

  const scanString = (field: string, value?: string) => {
    if (!value) return;
    const matches = value.match(regex);
    if (matches) {
      matches.forEach((m) => {
        found.push({
          field,
          markerText: m,
          context: value.length > 220 ? `${value.slice(0, 220)}...` : value,
        });
      });
    }
  };

  scanString('title', guide.title);
  scanString('summary', guide.summary);
  scanString('officialPortal', guide.officialPortal);
  scanString('officialUrl', guide.officialUrl);
  scanString('benefitSummary', guide.benefitSummary);
  scanString('responsibleDepartment', guide.responsibleDepartment);
  scanString('intendedBeneficiaries', guide.intendedBeneficiaries);
  scanString('applicableRegion', guide.applicableRegion);

  (guide.verifyNotes || []).forEach((n, idx) => scanString(`verifyNotes[${idx}]`, n));
  (guide.sections || []).forEach((sec, idx) => {
    scanString(`sections[${idx}].heading`, sec.heading);
    scanString(`sections[${idx}].content`, sec.content);
    scanString(`sections[${idx}].tips`, sec.tips);
    (sec.bulletPoints || []).forEach((bp, bIdx) =>
      scanString(`sections[${idx}].bulletPoints[${bIdx}]`, bp)
    );
  });
  (guide.eligibility || []).forEach((item, idx) => scanString(`eligibility[${idx}]`, item));
  (guide.documentsRequired || []).forEach((item, idx) =>
    scanString(`documentsRequired[${idx}]`, item)
  );
  (guide.stepByStep || []).forEach((item, idx) => scanString(`stepByStep[${idx}]`, item));
  (guide.faqs || []).forEach((faq, idx) => {
    scanString(`faqs[${idx}].question`, faq.question);
    scanString(`faqs[${idx}].answer`, faq.answer);
  });

  return found;
}

export function collectGuideFullText(guide: GuideArticle): string {
  const parts: string[] = [
    guide.title,
    guide.summary,
    guide.responsibleDepartment || '',
    guide.intendedBeneficiaries || '',
    guide.benefitSummary || '',
    guide.applicableRegion || '',
  ];
  (guide.sections || []).forEach((sec) => {
    parts.push(sec.heading, sec.content);
    if (sec.tips) parts.push(sec.tips);
    if (sec.bulletPoints) parts.push(...sec.bulletPoints);
  });
  if (guide.eligibility) parts.push(...guide.eligibility);
  if (guide.documentsRequired) parts.push(...guide.documentsRequired);
  if (guide.stepByStep) parts.push(...guide.stepByStep);
  if (guide.faqs) {
    guide.faqs.forEach((f) => parts.push(f.question, f.answer));
  }
  return parts.filter(Boolean).join(' ');
}

export function countGuideWords(guide: GuideArticle): number {
  return countWords(collectGuideFullText(guide));
}

export function mergeSingleGuideWithState(
  base: GuideArticle,
  state?: GuideVerificationState
): GuideArticle {
  if (!state) return base;
  const ov = state.overrides || {};
  return {
    ...base,
    title: ov.title || base.title,
    summary: ov.summary || base.summary,
    officialPortal: ov.officialPortal || state.officialPortal || base.officialPortal,
    officialUrl: ov.officialUrl || state.officialUrl || base.officialUrl,
    benefitSummary: ov.benefitSummary !== undefined ? ov.benefitSummary : base.benefitSummary,
    responsibleDepartment:
      ov.responsibleDepartment !== undefined
        ? ov.responsibleDepartment
        : base.responsibleDepartment,
    intendedBeneficiaries:
      ov.intendedBeneficiaries !== undefined
        ? ov.intendedBeneficiaries
        : base.intendedBeneficiaries,
    applicableRegion:
      ov.applicableRegion !== undefined ? ov.applicableRegion : base.applicableRegion,
    sections: Array.isArray(ov.sections) && ov.sections.length > 0 ? ov.sections : base.sections,
    eligibility:
      Array.isArray(ov.eligibility) && ov.eligibility.length > 0
        ? ov.eligibility
        : base.eligibility,
    documentsRequired:
      Array.isArray(ov.documentsRequired) && ov.documentsRequired.length > 0
        ? ov.documentsRequired
        : base.documentsRequired,
    stepByStep:
      Array.isArray(ov.stepByStep) && ov.stepByStep.length > 0 ? ov.stepByStep : base.stepByStep,
    faqs: Array.isArray(ov.faqs) && ov.faqs.length > 0 ? ov.faqs : base.faqs,
    status: state.status || base.status || 'published',
    lastUpdated: state.lastUpdated || base.lastUpdated,
    reviewedBy: state.reviewedBy || state.verifierName || base.reviewedBy,
    reviewedAt: state.reviewedAt || state.verifiedDate || base.reviewedAt,
    verifierName: state.verifierName || base.verifierName,
    verifiedDate: state.verifiedDate || base.verifiedDate,
  };
}

export function mergeAllGuidesWithStates(
  guideStates: Record<string, GuideVerificationState> = {},
  baseGuides: GuideArticle[] = GUIDE_ARTICLES
): GuideArticle[] {
  return baseGuides.map((guide) => mergeSingleGuideWithState(guide, guideStates[guide.id]));
}

export function getPublishedMergedGuides(
  guideStates: Record<string, GuideVerificationState> = {},
  baseGuides: GuideArticle[] = GUIDE_ARTICLES
): GuideArticle[] {
  return mergeAllGuidesWithStates(guideStates, baseGuides).filter(
    (g) => g.status !== 'draft'
  );
}

export function validateGuideReadyForPublish(
  guide: GuideArticle,
  options: { confirmChecked?: boolean; verifierName?: string } = {}
): { ok: boolean; errors: string[]; remainingMarkers: GuideVerifyMarker[]; wordCount: number } {
  const errors: string[] = [];
  const remainingMarkers = extractGuideVerifyMarkers(guide).filter(
    (m) => !m.field.startsWith('verifyNotes[')
  );
  const wordCount = countGuideWords(guide);

  if (remainingMarkers.length > 0) {
    errors.push(
      `${remainingMarkers.length} unverified [VERIFY] placeholder(s) remain in guide content (${remainingMarkers
        .slice(0, 3)
        .map((m) => m.field)
        .join(', ')}). Replace or clear them before publishing.`
    );
  }
  if (!isValidHttpUrl(guide.officialUrl)) {
    errors.push('A valid https:// or http:// Official URL is required.');
  }
  if (wordCount < 400) {
    errors.push(`Guide content is ${wordCount} words (minimum 400 words required to publish).`);
  }
  if (options.confirmChecked === false) {
    errors.push('Staff verification confirmation checkbox must be ticked.');
  }
  if (options.verifierName !== undefined && !options.verifierName.trim()) {
    errors.push('Verifier Name is required before publishing.');
  }

  return {
    ok: errors.length === 0,
    errors,
    remainingMarkers,
    wordCount,
  };
}
