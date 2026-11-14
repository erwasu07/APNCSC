import type {
  PostFaqItem,
  PostStructuredType,
  SarkariItem,
  TimelineStep,
} from '../../data/sarkariData';
import { SARKARI_CATEGORIES, isIgnouItem } from '../../data/sarkariData';
import { resolvePostOrg, resolvePostStructuredType } from '../../data/sarkariMigration';
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
  return /^(as per (official )?(notice|notification|rules)|refer (to )?(official )?(notice|notification)|check (official )?notice)$/i.test(
    trimmed
  );
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

  if (type === 'dv') {
    return [
      'Printed copy of online application form & DV call letter / shortlist notice',
      'All original educational marksheets, degree / diploma, and provisional certificates',
      'Class 10th (Matriculation) certificate for Date of Birth verification',
      'J&K Domicile Certificate and Category Certificate (if applicable) in original',
      'Valid original Government Photo Identity Proof (Aadhaar / Voter ID / PAN / DL)',
      'Two sets of self-attested photocopies and recent passport-size photographs',
    ];
  }

  if (type === 'admit_card') {
    return [
      'Clear printout of downloaded Admit Card / Hall Ticket',
      'Original valid Government Photo ID (Aadhaar Card, Voter ID, Passport, or Driving Licence)',
      'Two recent passport-size colour photographs matching your application form',
      'Follow permitted stationery & prohibited items instructions printed on the hall ticket',
    ];
  }

  if (type === 'exam') {
    if (item.stage === 'rc_update') {
      return [
        'Printed Resume / CV (multiple copies for placement interviews)',
        'Original & photocopy set of IGNOU ID Card and academic marksheets',
        'Valid Government Photo Identity Proof (Aadhaar / Voter ID)',
      ];
    }
    return [
      'Official Examination Hall Ticket / Admit Card (when released on the portal)',
      'Original Government Photo Identity Card & University / Student ID Card',
      'Verify exact shift timing and examination centre address printed on the Hall Ticket',
    ];
  }

  if (type === 'admission') {
    return [
      'Class 10th & Class 12th / Qualifying Examination Marksheets',
      'Provisional / Migration / Character Certificate (if required by the university)',
      'Aadhaar Card or valid Government Photo Identity Proof',
      'Domicile Certificate & Reserved Category Certificate (if applicable)',
      'Recent passport-size colour photograph & scanned signature',
    ];
  }

  if (type === 'application') {
    return [
      'Aadhaar Card or valid Government Photo Identity Proof',
      'Class 10th Certificate & Marksheet (for Date of Birth verification)',
      'Qualifying Educational Marksheets & Certificates',
      'Domicile / Category / Experience Certificate (if applicable per notice)',
      'Recent passport-size photograph & scanned signature in official portal size',
    ];
  }

  // For result, answer_key, upcoming: do not fabricate a checklist if none was provided
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

  switch (type) {
    case 'dv':
      return {
        id: 'dv-instructions',
        title: 'Document Verification Instructions',
        subtitle: `Official verification guidance for ${orgName} shortlisted candidates.`,
        steps: [
          {
            title: 'Verify Your Roll No. & Reporting Schedule',
            description: `Check the official ${orgName} notice for your assigned verification date (${statusInfo.dateValue}), board/committee, and reporting window.`,
          },
          {
            title: 'Arrange Original Credentials & Photocopy Sets',
            description:
              'Arrange all original educational, DOB, domicile, and category certificates chronologically with at least two self-attested photocopy sets.',
          },
          {
            title: 'Report at the Prescribed Venue',
            description: `Attend at ${item.venue || 'the official venue notified in the circular'} as per your reporting schedule. Missing verification may forfeit candidature.`,
          },
        ],
      };

    case 'admit_card':
      return {
        id: 'how-to-download-admit-card',
        title: 'How to Download Admit Card / Hall Ticket',
        subtitle: 'Official steps for already-registered candidates.',
        steps: [
          {
            title: 'Open the Official Authority Portal',
            description: `Visit ${portalUrl} and open the Admit Card / Hall Ticket / City Intimation link for this examination.`,
          },
          {
            title: 'Sign In Using Registration Credentials',
            description:
              'Enter your Application / Registration Number, Roll Number, Enrollment Number, or Date of Birth / Password.',
          },
          {
            title: 'Check Details & Print Clear Copy',
            description:
              'Verify your name, photograph, exam date, shift reporting time, and centre address on the downloaded PDF before printing.',
          },
        ],
      };

    case 'exam':
      return {
        id: 'exam-day-instructions',
        title:
          item.stage === 'rc_update'
            ? 'Participation & Reporting Steps'
            : 'Exam Schedule & Reporting Instructions',
        subtitle: 'Key guidance for candidates covered under this notice.',
        steps: [
          {
            title: 'Verify Your Paper / Event Schedule',
            description: `Confirm your exact examination or event date (${statusInfo.dateValue}) from the official ${orgName} notice.`,
          },
          {
            title: 'Confirm Venue & Shift Reporting Time',
            description: `Venue: ${item.venue || 'As per official notice'}. Reporting Time: ${
              item.reportingTime || 'As per official notice'
            }.`,
          },
          {
            title: 'Download Hall Ticket Before Exam Day',
            description:
              'Carry your downloaded hall ticket / admit card and valid original photo ID to the centre prior to gate closure.',
          },
        ],
      };

    case 'result':
      return {
        id: 'whats-next-result',
        title: 'What Happens Next After Result',
        subtitle: 'Steps to verify your result and prepare for subsequent stages.',
        steps: [
          {
            title: 'Check Roll Number / Scorecard on Official Portal',
            description: `Open ${portalUrl} and verify your Roll Number, Registration No., or Scorecard in the official result notice.`,
          },
          {
            title: 'Save Official Result PDF for Record',
            description:
              'Download and save a copy of the selection list, grade card, or marksheet published by the authority.',
          },
          {
            title: 'Monitor Counselling / Document Verification Dates',
            description: `Shortlisted candidates should keep original certificates ready and watch ${orgName} notices for DV or counselling schedules.`,
          },
        ],
      };

    case 'answer_key':
      return {
        id: 'check-answer-key',
        title: 'How to Check Answer Key & Submit Objection',
        subtitle:
          statusInfo.computedStatus === 'closing_soon'
            ? `Objection window active until ${statusInfo.dateValue}.`
            : 'Official key verification process.',
        steps: [
          {
            title: 'Open Official Answer Key / Response Sheet Link',
            description: `Visit ${portalUrl} and sign in with your candidate credentials or open the published answer key PDF.`,
          },
          {
            title: 'Match Your Recorded Responses Carefully',
            description:
              'Compare each question ID and option ID against the official provisional or final key published by the authority.',
          },
          ...(statusInfo.computedStatus === 'closing_soon'
            ? [
                {
                  title: `Submit Online Challenge Before ${statusInfo.dateValue}`,
                  description:
                    'Upload clear academic/standard reference proof on the official objection portal within the stipulated objection window.',
                },
              ]
            : [
                {
                  title: 'Track Final Result Publication',
                  description:
                    'After reviewing candidate objections, the authority publishes final keys and results on the official website.',
                },
              ]),
        ],
      };

    case 'upcoming':
      return {
        id: 'prepare-before-opening',
        title: 'How to Prepare Before Registration Opens',
        subtitle: `Window is scheduled to open on ${item.applyStart || item.startDate || statusInfo.dateValue}.`,
        steps: [
          {
            title: 'Review Eligibility Criteria in Official Notification',
            description:
              'Check qualification cut-off dates, category certificate requirements, and age limits on the official circular.',
          },
          {
            title: 'Prepare Scanned Documents & OTR Profile',
            description:
              'Keep clear scans of your photograph, signature, Class 10th marksheet, qualification certificates, and domicile certificate ready.',
          },
          {
            title: 'Apply Once Official Portal Link Activates',
            description: `Visit ${portalUrl} or contact CSC DOST once the window opens to complete submission before the closing deadline.`,
          },
        ],
      };

    case 'admission':
    case 'application':
    default:
      if (!statusInfo.canApplyOnline) {
        return null;
      }
      return {
        id: 'how-to-apply',
        title: type === 'admission' ? 'How to Submit Online Form' : 'How to Apply Online',
        subtitle: 'Follow these steps on the official portal or request CSC DOST assistance.',
        steps: [
          {
            title: `Open Official ${orgName} Portal`,
            description: `Visit ${portalUrl} and locate the active link for "${item.title}".`,
          },
          {
            title: 'Complete Candidate Registration / Sign In',
            description:
              'Log in with your OTR / Student Enrollment ID or complete new registration using your active mobile number and email.',
          },
          {
            title: 'Fill Details & Upload Scanned Documents',
            description:
              'Enter personal and academic details matching your Class 10th / qualifying marksheets and upload properly sized scans.',
          },
          {
            title:
              item.fee?.genObc && /₹0|free|exempt|no application fee/i.test(item.fee.genObc)
                ? 'Submit Form & Download Confirmation'
                : 'Pay Prescribed Fee & Save Final Receipt',
            description:
              'Review your preview carefully before final submission and keep a printed/PDF copy of the acknowledgment receipt.',
          },
        ],
      };
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

  faqs.push({
    question: `Where can I verify the official notification for ${item.title}?`,
    answer: `You can confirm every official date, eligibility rule, and circular directly from ${orgName} at ${portalUrl}. Always rely on the official notice for final updates.`,
  });

  if (
    (type === 'application' || type === 'admission' || type === 'upcoming') &&
    !(item.fee?.genObc && /₹0|free|exempt|no application fee/i.test(item.fee.genObc))
  ) {
    faqs.push({
      question: 'What if online fee payment is deducted but the form shows pending?',
      answer:
        'Wait 24–48 hours for bank/gateway reconciliation before attempting another payment, and check the Verify Payment option in your candidate dashboard.',
    });
  }

  if (type === 'dv') {
    faqs.push({
      question: 'Do I need to submit an online application or pay a fee for Document Verification?',
      answer:
        'No. Document Verification is only for already shortlisted candidates listed in the official DV notice. Bring original certificates and photocopies per your schedule.',
    });
  } else if (type === 'answer_key') {
    faqs.push({
      question: 'Can fresh candidates apply through this answer key notice?',
      answer:
        statusInfo.computedStatus === 'closing_soon'
          ? `No. This notice is strictly for candidates who appeared in the examination to review responses or submit key objections up to ${statusInfo.dateValue}.`
          : 'No. This notice is published for candidates who appeared in the examination to check their responses.',
    });
  } else if (type === 'result') {
    faqs.push({
      question: 'Does this result notice require a new application form?',
      answer:
        'No. This page covers an official result or selection list update. Follow the next-stage DV or counselling instructions issued by the authority.',
    });
  } else if (type === 'admit_card' || type === 'exam') {
    faqs.push({
      question: 'Who is eligible to download or appear under this notice?',
      answer:
        'Only candidates who previously registered for this examination cycle can download their hall ticket or appear per the notified schedule.',
    });
  }

  faqs.push({
    question: 'Is CSC DOST an official government website?',
    answer:
      'No. CSC DOST is an independent citizen information and facilitation portal run by Authorised CSC VLE Wasim Ahmad Khanday (VLE ID 212515670018) at Sangran Qazigund, Anantnag, J&K.',
  });

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
        label: 'Last Date',
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
  const isEdu = item.section === 'education' || isIgnouItem(item);
  return {
    sectionLabel: isEdu ? 'Education & Admissions' : 'Jobs & Recruitment',
    sectionPath: isEdu ? '/education' : '/jobs',
    categoryLabel: isIgnouItem(item)
      ? 'IGNOU'
      : SARKARI_CATEGORIES[item.category]?.label || item.org || resolvePostOrg(item),
  };
}
