import type {
  PostFaqItem,
  PostStructuredType,
  SarkariItem,
  TimelineStep,
} from '../../data/sarkariData';
import { SARKARI_CATEGORIES, isIgnouItem } from '../../data/sarkariData';
import {
  resolvePostOrg,
  resolvePostSection,
  resolvePostStructuredType,
} from '../../data/sarkariMigration';
import {
  extractDatePattern,
  type ComputedSarkariStatus,
} from '../../utils/sarkariStatus';

export function resolveEffectiveTemplateType(
  item: SarkariItem,
  statusInfo: ComputedSarkariStatus
): PostStructuredType {
  const baseType = item.type || resolvePostStructuredType(item);
  if (
    (baseType === 'application' || baseType === 'admission') &&
    statusInfo.isUpcoming
  ) {
    return 'upcoming';
  }
  return baseType;
}

export function isNonApplicationTemplateType(type: PostStructuredType): boolean {
  return (
    type === 'dv' ||
    type === 'admit_card' ||
    type === 'exam' ||
    type === 'result' ||
    type === 'answer_key'
  );
}

export function isEducationNotice(item: SarkariItem): boolean {
  return resolvePostSection(item) === 'education' || isIgnouItem(item);
}

export function isAssignmentNotice(item: SarkariItem): boolean {
  return item.stage === 'assignment' || item.noticeType === 'assignment';
}

export function isDatesheetNotice(item: SarkariItem): boolean {
  return item.stage === 'date_sheet' || item.noticeType === 'date_sheet';
}

export function isCounsellingNotice(item: SarkariItem): boolean {
  return /counsell?ing|spot round/i.test(item.title || '');
}

export function hasRealDataValue(val?: string | number | null): boolean {
  if (val === undefined || val === null) return false;
  const trimmed = String(val).trim();
  if (!trimmed) return false;
  if (/^(n\/a|none|null|undefined|-)$/i.test(trimmed)) return false;
  return true;
}

export function isGenericNoticePlaceholder(val?: string | number | null): boolean {
  if (!hasRealDataValue(val)) return true;
  const trimmed = String(val).trim();
  return /^(as per (official )?(notice|notification|rules)|refer (to )?(official )?(notice|notification)|check (official )?notice|not\s+stated\s+in\s+(the\s+)?(official\s+)?notice|not\s+mentioned(\s+in\s+(the\s+)?notice)?|not\s+applicable)$/i.test(
    trimmed
  );
}

export type ResolvedApplicationMode = 'online' | 'offline' | 'hybrid';

export function resolveApplicationMode(item: SarkariItem): ResolvedApplicationMode {
  if (item.applicationMode === 'online' || item.applicationMode === 'offline' || item.applicationMode === 'hybrid') {
    return item.applicationMode;
  }
  if (isAssignmentNotice(item)) {
    return 'hybrid';
  }
  const combined = `${item.title || ''} ${item.shortInfo || ''} ${item.summary || ''} ${(item.howToApply || []).join(' ')}`.toLowerCase();
  const hasOfflineSignals =
    Boolean(item.postalAddress) ||
    /\b(offline\s+application|offline\s+mode|offline\s+submission|by\s+post|speed\s+post|physical\s+submission|study\s+centre\s+only|in\s+hard\s+copy|hard\s+copy\s+only)\b/i.test(combined);
  const hasOnlineSignals =
    /\b(apply\s+online|online\s+application|online\s+registration|online\s+portal|online\s+cee|online\s+form|otr)\b/i.test(combined);
  const hasRallySignal = /\b(rally\s+ground|aro\s+rally|recruitment\s+rally)\b/i.test(combined);

  if (hasRallySignal && hasOnlineSignals) return 'hybrid';
  if (hasOfflineSignals && hasOnlineSignals) return 'hybrid';
  if (hasOfflineSignals) return 'offline';
  return 'online';
}

export function resolveApplicationModeLabel(item: SarkariItem): string {
  const mode = resolveApplicationMode(item);
  if (isAssignmentNotice(item)) return 'Online / Centre';
  if (mode === 'offline') {
    return item.postalAddress || /\bby\s+post|postal|envelope\b/i.test(`${item.shortInfo || ''} ${item.summary || ''}`)
      ? 'Offline (By Post)'
      : 'Offline';
  }
  if (mode === 'hybrid') {
    const combined = `${item.title || ''} ${item.shortInfo || ''} ${item.summary || ''}`;
    if (/\brally\b/i.test(combined)) return 'Online + Rally';
    return 'Online + Offline';
  }
  return 'Online';
}

export function isZeroOrExemptFee(item: SarkariItem): boolean {
  const gen = String(item.fee?.genObc || item.fees?.genObc || '').trim();
  const sc = String(item.fee?.scSt || item.fees?.scSt || '').trim();
  if (!gen && !sc) return false;
  const zeroRegex = /₹\s*0\b|rs\.?\s*0\b|\bnil\b|no\s*(application\s*)?fee|exempt|free\b/i;
  return Boolean(gen && zeroRegex.test(gen) && (!sc || zeroRegex.test(sc)));
}

export function hasExplicitFee(item: SarkariItem): boolean {
  const gen = String(item.fee?.genObc || item.fees?.genObc || '').trim();
  const sc = String(item.fee?.scSt || item.fees?.scSt || '').trim();
  const genValid = hasRealDataValue(gen) && !isGenericNoticePlaceholder(gen);
  const scValid = hasRealDataValue(sc) && !isGenericNoticePlaceholder(sc);
  return genValid || scValid;
}

export function resolvePostPortalUrl(item: SarkariItem): string {
  const candidate =
    item.officialUrl ||
    item.verification?.officialApplicationUrl ||
    item.officialApplicationUrl ||
    item.officialLink;
  if (candidate && candidate.trim()) return candidate.trim();
  if (isIgnouItem(item)) return 'https://www.ignou.ac.in';
  if (item.category === 'banking_jobs') return 'https://jkb.bank.in/';
  if (item.category === 'army_jobs') return 'https://joinindianarmy.nic.in';
  if (item.category === 'rrb_jobs') return 'https://www.rrbapply.gov.in';
  if (item.category === 'ssc_jobs') return 'https://ssc.gov.in';
  if (item.category === 'cluster_univ') return 'https://cusrinagar.edu.in';
  if (item.category === 'jkssb') return 'https://jkssb.nic.in';
  if (item.category === 'exam_forms' || item.category === 'admissions') {
    return 'https://kashmiruniversity.net';
  }
  return 'https://www.india.gov.in';
}

export function resolvePostPdfUrl(item: SarkariItem, portalUrl: string): string | undefined {
  const candidate =
    item.notificationPdfUrl ||
    item.verification?.officialNotificationUrl ||
    item.officialNotificationUrl ||
    (/\.pdf($|\?)/i.test(item.officialLink || '') ? item.officialLink : undefined);
  if (!candidate || !candidate.trim()) return undefined;
  const trimmed = candidate.trim();
  return trimmed !== portalUrl ? trimmed : undefined;
}

export function getOfficialActionLabel(
  item: SarkariItem,
  type: PostStructuredType,
  isDirectPdfPortal: boolean,
  labels: {
    viewResultBtn: string;
    viewAnswerKeyBtn: string;
    downloadDatesheetBtn: string;
    viewCounsellingBtn: string;
    officialPdfBtn: string;
    officialPortalBtn: string;
  }
): string {
  if (type === 'result') return labels.viewResultBtn;
  if (type === 'answer_key') return labels.viewAnswerKeyBtn;
  if (isDatesheetNotice(item)) return labels.downloadDatesheetBtn;
  if (isCounsellingNotice(item)) return labels.viewCounsellingBtn;
  if (isDirectPdfPortal) return labels.officialPdfBtn;
  return labels.officialPortalBtn;
}

export function splitSummaryParagraphs(summary?: string): {
  intro: string;
  remainder: string;
} {
  if (!summary || !summary.trim()) {
    return { intro: '', remainder: '' };
  }
  const clean = summary.replace(/\s+/g, ' ').trim();
  if (clean.length <= 240) {
    return { intro: clean, remainder: '' };
  }
  const sentences = clean.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length >= 2) {
    const firstTwo = sentences.slice(0, 2).join(' ').trim();
    const rest = sentences.slice(2).join(' ').trim();
    if (firstTwo.length <= 280) {
      return { intro: firstTwo, remainder: rest };
    }
  }
  return { intro: clean, remainder: '' };
}

export function toIsoDate(raw?: string): string | undefined {
  const parsed = extractDatePattern(raw);
  if (!parsed) return undefined;
  const mm = String(parsed.month).padStart(2, '0');
  const dd = String(parsed.day).padStart(2, '0');
  return `${parsed.year}-${mm}-${dd}`;
}

export function getChecklistTitleForType(type: PostStructuredType): string {
  switch (type) {
    case 'dv':
      return 'Original Documents for DV Day';
    case 'admit_card':
      return 'Exam-Day Mandatory Checklist';
    case 'exam':
      return 'Exam / Event Day Checklist';
    case 'admission':
      return 'Documents Required for Admission';
    case 'upcoming':
      return 'Documents to Keep Ready';
    default:
      return 'Documents Required to Apply';
  }
}

export function getDocumentsForPost(
  item: SarkariItem,
  type: PostStructuredType
): string[] {
  const explicitDocs = item.documents || item.documentsRequired;
  if (explicitDocs && explicitDocs.length > 0) {
    return explicitDocs;
  }

  // Strictly never invent documents for assignments, exam forms, re-registration,
  // practicals, correction windows, counselling notices, datesheets, results, or answer keys
  if (
    isAssignmentNotice(item) ||
    isDatesheetNotice(item) ||
    isCounsellingNotice(item) ||
    item.stage === 'exam_form' ||
    item.stage === 're_registration' ||
    item.stage === 'project_practical' ||
    item.stage === 'correction' ||
    item.noticeType === 'exam_form' ||
    item.noticeType === 're_registration' ||
    item.noticeType === 'project_practical' ||
    item.noticeType === 'correction'
  ) {
    return [];
  }

  if (type === 'dv') {
    return [
      'Application printout & DV call letter',
      'Original marksheets & degree/diploma certificates',
      'Class 10th DOB proof certificate',
      'Domicile & Category certificate (if applicable)',
      'Valid Government Photo ID (Aadhaar / Voter ID)',
      'Self-attested photocopy sets & passport photos',
    ];
  }

  if (type === 'admit_card') {
    return [
      `Downloaded Admit Card for ${item.title}`,
      'Valid original Government Photo ID',
      'Recent passport-size colour photographs',
      'Permitted stationery per hall ticket rules',
    ];
  }

  if (type === 'exam') {
    if (item.stage === 'rc_update') {
      return [
        'Printed CV / Resume copies',
        'IGNOU ID card & marksheet copies',
        'Valid Government Photo ID',
      ];
    }
    return [
      'Official Hall Ticket / Admit Card printout',
      'Government Photo ID & Student ID Card',
      'Verified centre address & shift timing slip',
    ];
  }

  if (type === 'admission') {
    return [
      '10th, 12th & qualifying marksheets',
      'Migration / Provisional / Character certificate',
      'Aadhaar or valid Photo ID',
      'Domicile & Category certificate (if applicable)',
      'Passport photo & scanned signature',
    ];
  }

  if (type === 'application' && !isEducationNotice(item)) {
    const mode = resolveApplicationMode(item);
    if (mode === 'offline') {
      // Never invent document checklists for offline notices when not explicitly verified
      return [];
    }
    return [
      'Aadhaar or valid Photo ID',
      'Class 10th certificate for DOB',
      'Qualifying academic marksheets',
      'Domicile / Category / Experience certificate (if applicable)',
      'Passport photo & signature as per official portal rules',
    ];
  }

  return [];
}

export interface ProcessStep {
  title: string;
  description: string;
}

export function getProcessSectionConfig(
  item: SarkariItem,
  type: PostStructuredType,
  statusInfo: ComputedSarkariStatus,
  portalUrl: string
): {
  id: string;
  title: string;
  subtitle: string;
  steps: ProcessStep[];
} | null {
  const orgName = item.org || resolvePostOrg(item);
  const isEdu = isEducationNotice(item);

  if (isAssignmentNotice(item)) {
    if (!statusInfo.canApplyOnline) {
      return null;
    }
    return {
      id: 'submission-procedure',
      title: 'Submission procedure',
      subtitle: `Follow official ${orgName} assignment submission guidelines${item.session ? ` for ${item.session}` : ''}.`,
      steps: [
        {
          title: 'Prepare Course-Wise Assignment Responses',
          description: `Prepare your course-wise assignment responses according to the official ${orgName} question paper and programme instructions${item.learnerGroup ? ` (${item.learnerGroup})` : ''}.`,
        },
        {
          title: 'Sign In on the Official Submission Portal',
          description: `Log in at ${portalUrl} with your active student credentials to access the online assignment submission dashboard.`,
        },
        {
          title: `Upload Assignments Before ${statusInfo.dateValue}`,
          description:
            'Upload legible course-wise PDF files once before the closing deadline. Learners who have already submitted assignments offline at their Study Centre or Regional Centre do not need to re-upload.',
        },
        {
          title: 'Save Submission Acknowledgment',
          description:
            'Verify uploaded file status and keep a downloaded/printed copy of the submission confirmation slip.',
        },
      ],
    };
  }

  switch (type) {
    case 'dv': {
      const hasRealVenue =
        hasRealDataValue(item.venue) && !isGenericNoticePlaceholder(item.venue);
      return {
        id: 'dv-instructions',
        title: `Document Verification — ${orgName}`,
        subtitle: `DV guidance for ${item.title}.`,
        steps: [
          {
            title: `Check ${orgName} DV Schedule`,
            description: `Confirm your roll number and verification date (${statusInfo.dateValue}) in ${item.title}.`,
          },
          {
            title: 'Carry Originals & Copies',
            description:
              'Organize academic, DOB, domicile, and category originals with photocopy sets.',
          },
          {
            title: 'Attend Prescribed Venue',
            description: hasRealVenue
              ? `Report at ${item.venue} on your scheduled DV date.`
              : `Report at the ${orgName} venue notified in the circular.`,
          },
        ],
      };
    }

    case 'admit_card':
      return {
        id: 'how-to-download-admit-card',
        title: `Download ${orgName} Admit Card`,
        subtitle: `Steps for ${item.title}.`,
        steps: [
          {
            title: `Open ${orgName} Portal`,
            description: `Visit ${portalUrl} and open the ${item.title} download link.`,
          },
          {
            title: 'Enter Candidate Login',
            description:
              'Sign in with your Application/Roll Number and Date of Birth.',
          },
          {
            title: 'Verify & Print Hall Ticket',
            description:
              `Confirm your exam shift (${statusInfo.dateValue}), centre address, and instructions on the PDF.`,
          },
        ],
      };

    case 'exam': {
      const hasVenue =
        hasRealDataValue(item.venue) && !isGenericNoticePlaceholder(item.venue);
      const hasTime =
        hasRealDataValue(item.reportingTime) &&
        !isGenericNoticePlaceholder(item.reportingTime);
      const steps: ProcessStep[] = [
        {
          title: `Verify ${orgName} Exam Schedule`,
          description: `Check dates (${statusInfo.dateValue}) published under ${item.title}.`,
        },
      ];
      if (hasVenue || hasTime) {
        const parts: string[] = [];
        if (hasVenue) parts.push(`Venue: ${item.venue}`);
        if (hasTime) parts.push(`Timing: ${item.reportingTime}`);
        steps.push({
          title: 'Confirm Venue & Timing',
          description: `${parts.join('. ')}.`,
        });
      }
      steps.push({
        title:
          item.stage === 'rc_update'
            ? 'Carry ID & Resume Copies'
            : 'Carry Hall Ticket & ID',
        description:
          item.stage === 'rc_update'
            ? `Carry your IGNOU ID card and CV copies to the ${orgName} venue.`
            : `Bring your printed ${orgName} admit card and valid photo ID to the centre.`,
      });

      return {
        id: 'exam-day-instructions',
        title:
          item.stage === 'rc_update'
            ? `Reporting Steps — ${item.title}`
            : isDatesheetNotice(item)
            ? `Date Sheet Check — ${item.title}`
            : `Schedule Guidance — ${item.title}`,
        subtitle: `Key instructions for ${orgName} candidates.`,
        steps,
      };
    }

    case 'result':
      return {
        id: 'whats-next-result',
        title: `Check ${orgName} Result & Next Steps`,
        subtitle: `Summary for ${item.title}.`,
        steps: [
          {
            title: `Open ${orgName} Result Portal`,
            description: `Visit ${portalUrl} and verify your roll number or marks in ${item.title}.`,
          },
          {
            title: 'Download Result PDF / Scorecard',
            description:
              `Save the official ${orgName} selection list or marksheet (${statusInfo.dateValue}) for verification.`,
          },
          {
            title: isCounsellingNotice(item)
              ? 'Complete Counselling Schedule'
              : 'Track Further Notices',
            description: `Follow subsequent ${orgName} DV, counselling, or joining circulars.`,
          },
        ],
      };

    case 'answer_key':
      return {
        id: 'check-answer-key',
        title: `Check ${orgName} Answer Key & Objections`,
        subtitle:
          statusInfo.computedStatus === 'closing_soon'
            ? `Objection window for ${item.title} runs until ${statusInfo.dateValue}.`
            : `Key verification steps for ${item.title}.`,
        steps: [
          {
            title: `Open ${orgName} Key Link`,
            description: `Log in at ${portalUrl} to view ${item.title} provisional responses.`,
          },
          {
            title: 'Compare Question Responses',
            description:
              `Match your Question/Option IDs carefully against the ${orgName} key.`,
          },
          ...(statusInfo.computedStatus === 'closing_soon'
            ? [
                {
                  title: `Raise Objection by ${statusInfo.dateValue}`,
                  description:
                    `Submit challenges with reference proof on ${portalUrl} before closing.`,
                },
              ]
            : [
                {
                  title: 'Monitor Final Key & Result',
                  description:
                    `${orgName} issues final results after reviewing candidate challenges.`,
                },
              ]),
        ],
      };

    case 'upcoming':
      return {
        id: 'prepare-before-opening',
        title: `Preparation Steps — ${item.title}`,
        subtitle: `Expected opening: ${item.applyStart || item.startDate || statusInfo.dateValue}.`,
        steps: [
          {
            title: `Review ${orgName} Eligibility`,
            description:
              `Check qualification cut-off dates and eligibility criteria in ${item.title}.`,
          },
          {
            title:
              resolveApplicationMode(item) === 'offline'
                ? 'Prepare Application & Enclosures'
                : isEdu
                ? 'Keep Enrolment Records Ready'
                : 'Keep Qualifying Certificates Ready',
            description:
              resolveApplicationMode(item) === 'offline'
                ? 'Keep self-attested copies of required certificates and passport photographs ready per the official notice.'
                : isEdu
                ? 'Keep enrollment number, marksheets, and valid ID ready.'
                : 'Keep qualifying marksheets, Class 10th certificate, photo ID, and category/domicile certificates ready if applicable.',
          },
          {
            title:
              resolveApplicationMode(item) === 'offline'
                ? `Submit Offline as Per ${orgName} Notice`
                : `Apply on ${orgName} Activation`,
            description:
              resolveApplicationMode(item) === 'offline'
                ? `Download the prescribed format from ${portalUrl} and submit as instructed once applications open.`
                : `Submit via ${portalUrl} once registration activates.`,
          },
        ],
      };

    case 'admission':
    case 'application':
    default: {
      if (!statusInfo.canApplyOnline) {
        return null;
      }

      const mode = resolveApplicationMode(item);
      const modeLabel = resolveApplicationModeLabel(item);
      const explicitFee = hasExplicitFee(item);
      const zeroFee = isZeroOrExemptFee(item);

      // Prefer verified notice-specific howToApply steps whenever provided
      if (Array.isArray(item.howToApply) && item.howToApply.length > 0) {
        const cleanedSteps = item.howToApply
          .map((raw) => String(raw || '').trim())
          .filter(Boolean)
          .map((raw, idx) => {
            const colonIdx = raw.indexOf(':');
            if (colonIdx > 3 && colonIdx < 48 && !/^https?:/i.test(raw.slice(0, colonIdx + 1))) {
              return {
                title: raw.slice(0, colonIdx).trim(),
                description: raw.slice(colonIdx + 1).trim(),
              };
            }
            return {
              title: `Step ${idx + 1}`,
              description: raw,
            };
          });
        if (cleanedSteps.length > 0) {
          return {
            id: 'how-to-apply',
            title: `How to Apply (${modeLabel}) — ${item.title}`,
            subtitle:
              mode === 'offline'
                ? `Verified offline application instructions from the official ${orgName} notice.`
                : mode === 'hybrid'
                ? `Verified online and offline submission steps from the official ${orgName} notice.`
                : `Verified application steps for ${orgName}.`,
            steps: cleanedSteps,
          };
        }
      }

      if (mode === 'offline') {
        const offlineSteps: ProcessStep[] = [
          {
            title: `Download Official ${orgName} Notice & Format`,
            description: `Open ${portalUrl} to download the official notification and prescribed application form.`,
          },
          {
            title: 'Complete Application Form & Self-Attested Enclosures',
            description:
              'Fill every required detail accurately, affix a recent passport-size photograph if required, sign the declaration, and attach self-attested copies of all documents listed in the official notice.',
          },
        ];
        if (item.envelopeSuperscription) {
          offlineSteps.push({
            title: 'Superscribe the Envelope',
            description: `Write "${item.envelopeSuperscription}" clearly on top of the envelope as directed in the official notice.`,
          });
        }
        offlineSteps.push({
          title: `Send Offline Application Before ${statusInfo.dateValue}`,
          description: item.postalAddress
            ? `Dispatch by post or submit physically to: ${item.postalAddress} so it reaches on or before ${statusInfo.dateValue}.`
            : `Send or submit the completed offline application to the official address specified in the ${orgName} notice on or before ${statusInfo.dateValue}.`,
        });
        return {
          id: 'how-to-apply',
          title: `How to Apply (${modeLabel}) — ${item.title}`,
          subtitle: `Offline application process as stated in the official ${orgName} notice.`,
          steps: offlineSteps,
        };
      }

      if (isEdu) {
        return {
          id: 'submission-procedure',
          title: `Submission Procedure — ${item.title}`,
          subtitle: `${modeLabel} submission guide for ${orgName}.`,
          steps: [
            {
              title: `Open ${orgName} Portal`,
              description: `Visit ${portalUrl} and open "${item.title}".`,
            },
            {
              title: 'Student Sign-In',
              description:
                `Log in with your ${orgName} registration or enrolment number.`,
            },
            {
              title: 'Verify Courses & Details',
              description:
                'Confirm selected semester/courses against academic records.',
            },
            {
              title:
                !explicitFee || zeroFee
                  ? 'Submit & Save Slip'
                  : 'Pay Fee & Save Receipt',
              description:
                `Review preview before locking and save your ${orgName} confirmation slip.`,
            },
          ],
        };
      }

      const usesOtr = /\b(SSC|JKSSB|UPSC|RRB)\b/i.test(`${orgName} ${item.category || ''}`);
      return {
        id: 'how-to-apply',
        title: `How to Apply (${modeLabel}) — ${item.title}`,
        subtitle:
          mode === 'hybrid'
            ? `Online registration and physical/offline stage overview for ${orgName}.`
            : `Online application overview for ${orgName}.`,
        steps: [
          {
            title: `Open Official ${orgName} Portal`,
            description: `Go to ${portalUrl} and read "${item.title}" carefully.`,
          },
          {
            title: usesOtr ? 'Candidate Registration / OTR' : 'Candidate Registration',
            description: usesOtr
              ? `Sign in with your ${orgName} OTR/Candidate ID or complete one-time registration.`
              : `Register or sign in on the official ${orgName} portal as instructed in the notification.`,
          },
          {
            title: 'Enter Details & Upload Prescribed Files',
            description:
              'Enter personal and educational details matching official certificates and upload only the files specified in the notice.',
          },
          {
            title:
              !explicitFee || zeroFee
                ? 'Submit & Save Confirmation'
                : 'Pay Prescribed Fee & Save Receipt',
            description:
              mode === 'hybrid'
                ? `Review preview prior to submission, retain the ${orgName} confirmation printout, and follow any offline/physical stage instructions in the notice.`
                : `Verify preview prior to submission and retain the ${orgName} confirmation PDF.`,
          },
        ],
      };
    }
  }
}

export function buildPostFaqs(
  item: SarkariItem,
  type: PostStructuredType,
  orgName: string,
  portalUrl: string,
  statusInfo: ComputedSarkariStatus
): PostFaqItem[] {
  const customFaqs = item.faq ? [...item.faq] : [];
  const faqs: PostFaqItem[] = [...customFaqs];
  const mode = resolveApplicationMode(item);
  const explicitFee = hasExplicitFee(item);
  const zeroFee = isZeroOrExemptFee(item);

  faqs.push({
    question: `Where is the official source for ${item.title}?`,
    answer: `Official dates and rules for ${item.title} are published by ${orgName} at ${portalUrl}.`,
  });

  if (
    mode !== 'offline' &&
    !isAssignmentNotice(item) &&
    (type === 'application' || type === 'admission' || type === 'upcoming') &&
    explicitFee &&
    !zeroFee
  ) {
    faqs.push({
      question: `What if ${orgName} fee payment shows pending for ${item.title}?`,
      answer:
        `Wait 24–48 hours for bank reconciliation before retrying on ${portalUrl}.`,
    });
  }

  if (isAssignmentNotice(item)) {
    faqs.push({
      question: `Must offline Study Centre learners re-upload ${item.title}?`,
      answer:
        `No. Learners who already submitted offline at their ${orgName} centre need not re-upload.`,
    });
  } else if (type === 'dv') {
    faqs.push({
      question: `Is a fresh form needed for ${item.title}?`,
      answer:
        `No. Only candidates shortlisted by ${orgName} attend with original certificates.`,
    });
  } else if (type === 'answer_key') {
    faqs.push({
      question: `Who can access ${item.title}?`,
      answer:
        statusInfo.computedStatus === 'closing_soon'
          ? `Only candidates who appeared in this ${orgName} exam can check keys or object until ${statusInfo.dateValue}.`
          : `Candidates who appeared in this ${orgName} exam can verify their responses.`,
    });
  } else if (type === 'result') {
    faqs.push({
      question: `Does ${item.title} open new registration?`,
      answer:
        `No. ${item.title} covers result/merit updates from ${orgName}. Follow next-stage DV or counselling instructions.`,
    });
  } else if (type === 'admit_card' || type === 'exam') {
    faqs.push({
      question: `Who can download or appear under ${item.title}?`,
      answer:
        `Registered candidates of this ${orgName} examination cycle (${statusInfo.dateValue}).`,
    });
  }

  return faqs;
}

export function deriveTimelineForPost(
  item: SarkariItem,
  type: PostStructuredType,
  statusInfo: ComputedSarkariStatus
): TimelineStep[] {
  if (item.timelineSteps && item.timelineSteps.length > 0) {
    return item.timelineSteps;
  }
  const steps: TimelineStep[] = [];
  if (item.postDate) {
    steps.push({ label: 'Notification Published', date: item.postDate, status: 'done' });
  }
  if (type === 'application' || type === 'admission' || type === 'upcoming') {
    if (item.applyStart || item.startDate) {
      steps.push({
        label: 'Window Opens',
        date: item.applyStart || item.startDate,
        status: statusInfo.isUpcoming ? 'upcoming' : 'done',
      });
    }
    if (item.applyEnd || item.lastDate) {
      steps.push({
        label: isEducationNotice(item) ? 'Submission deadline' : 'Last Date',
        date: item.applyEnd || item.lastDate,
        status: statusInfo.isClosed ? 'done' : statusInfo.isOpen ? 'active' : 'upcoming',
      });
    }
  } else {
    steps.push({
      label: statusInfo.dateLabel,
      date: statusInfo.dateValue,
      status: statusInfo.isArchiveBucket ? 'done' : 'active',
    });
  }
  return steps;
}

export function getCategoryBreadcrumb(
  item: SarkariItem
): { sectionLabel: string; sectionPath: string; categoryLabel: string } {
  const isEdu = isEducationNotice(item);
  return {
    sectionLabel: isEdu ? 'Education & Admissions' : 'Jobs & Recruitment',
    sectionPath: isEdu ? '/education' : '/jobs',
    categoryLabel: isIgnouItem(item)
      ? 'IGNOU'
      : SARKARI_CATEGORIES[item.category]?.label || item.org || resolvePostOrg(item),
  };
}
