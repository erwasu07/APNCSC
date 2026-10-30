import React, { useState, useEffect, useMemo } from 'react';
import { SarkariItem, SARKARI_CATEGORIES, SARKARI_DATA } from '../data/sarkariData';
import { computeSarkariStatus, ComputedSarkariStatus } from '../utils/sarkariStatus';
import SarkariNotificationBanner from './SarkariNotificationBanner';
import { buildWhatsAppNotification } from '../utils/whatsappFormatter';
import { AlertCircle, Clock, CheckCircle2, XCircle, FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import {
  ContentPageLayout,
  ContentArticleHeader,
  KeyInfoStrip,
  PrimaryActionBar,
  MobileSectionNav,
  ContentSection,
  KeyValueRows,
  ContentChecklist,
  StepByStepList,
  OfficialSourcesAndAssistance,
  extractConciseIntro,
  KeyInfoFact,
  SectionNavItem,
  RelatedContentItem,
} from './shared/ContentDesignSystem';
import WhatsAppChannelPopup, { WhatsAppChannelInPostCard } from './shared/WhatsAppChannelPopup';

interface SarkariDedicatedPageViewProps {
  item: SarkariItem;
  onBack: () => void;
  onApplyService: (serviceName: string) => void;
  onShare: (item: SarkariItem) => void;
}

const ADMISSION_EDUCATION_CATEGORIES = new Set([
  'admissions',
  'exam_forms',
  'cluster_univ',
  'nta',
]);

export default function SarkariDedicatedPageView({
  item,
  onBack,
  onApplyService,
  onShare,
}: SarkariDedicatedPageViewProps) {
  const isAdmissionOrEdu = ADMISSION_EDUCATION_CATEGORIES.has(item.category);
  const isInfoOnlyNotice = ['results', 'answer_keys', 'syllabus'].includes(item.category);

  const [activeSectionId, setActiveSectionId] = useState<string>('overview-section');

  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${item.title} – Official Notification & Details | CSC DOST`;
    return () => {
      document.title = originalTitle;
    };
  }, [item]);

  const organisationName = useMemo(() => {
    if (item.category === 'army_jobs') return 'Indian Army (joinindianarmy.nic.in)';
    if (item.category === 'rrb_jobs') return 'Railway Recruitment Boards (RRB)';
    if (item.category === 'ssc_jobs') return 'Staff Selection Commission (SSC)';
    if (item.category === 'cluster_univ') return 'Cluster University Srinagar (CUS)';
    if (item.category === 'jkssb') return 'J&K Services Selection Board (JKSSB)';
    if (item.category === 'exam_forms') return 'University of Kashmir (Examinations)';
    if (item.category === 'admissions') return 'University of Kashmir (Admissions)';
    if (item.category === 'nta') return 'National Testing Agency (NTA)';

    const titleUpper = item.title.toUpperCase();
    if (titleUpper.includes('ARMY') || titleUpper.includes('AGNIVEER')) return 'Indian Army';
    if (titleUpper.includes('SSC')) return 'Staff Selection Commission (SSC)';
    if (titleUpper.includes('RRB') || titleUpper.includes('RAILWAY') || titleUpper.includes('RPF'))
      return 'Railway Recruitment Boards (RRB)';
    if (titleUpper.includes('IBPS')) return 'Institute of Banking Personnel Selection (IBPS)';
    if (titleUpper.includes('JKSSB') || titleUpper.includes('J&K'))
      return 'J&K Services Selection Board (JKSSB)';
    if (titleUpper.includes('UP POLICE') || titleUpper.includes('UPPRPB'))
      return 'UP Police Recruitment Board';
    if (titleUpper.includes('UPSC')) return 'Union Public Service Commission (UPSC)';
    if (titleUpper.includes('NEET') || titleUpper.includes('NTA') || titleUpper.includes('JEE') || titleUpper.includes('CUET'))
      return 'National Testing Agency (NTA)';
    if (titleUpper.includes('CBSE') || titleUpper.includes('CTET'))
      return 'Central Board of Secondary Education (CBSE)';
    if (titleUpper.includes('DELHI UNIVERSITY') || titleUpper.includes('CSAS'))
      return 'University of Delhi';
    if (titleUpper.includes('IGNOU')) return 'Indira Gandhi National Open University (IGNOU)';
    return SARKARI_CATEGORIES[item.category]?.label || 'Official Recruiting / Examination Authority';
  }, [item]);

  const officialPortalUrl = useMemo(() => {
    if (item.officialLink && item.officialLink.trim()) return item.officialLink.trim();
    if (item.category === 'army_jobs') return 'https://joinindianarmy.nic.in';
    if (item.category === 'rrb_jobs') return 'https://www.rrbapply.gov.in';
    if (item.category === 'ssc_jobs') return 'https://ssc.gov.in';
    if (item.category === 'cluster_univ') return 'https://cusrinagar.edu.in';
    if (item.category === 'jkssb') return 'https://jkssb.nic.in';
    if (item.category === 'exam_forms' || item.category === 'admissions')
      return 'https://kashmiruniversity.net';
    return 'https://www.india.gov.in';
  }, [item]);

  const isDirectPdfUrl = useMemo(() => {
    return /\.pdf($|\?)/i.test(officialPortalUrl);
  }, [officialPortalUrl]);

  const statusInfo: ComputedSarkariStatus = useMemo(() => {
    return computeSarkariStatus(item);
  }, [item]);

  const canApplyOnline = statusInfo.canApplyOnline;
  const isClosed = statusInfo.applicationStatus === 'closed';
  const isUpcoming = statusInfo.applicationStatus === 'upcoming';
  const isCancelled = statusInfo.applicationStatus === 'cancelled';

  // Extract Academic Session if present in title or shortInfo for Admissions/Education
  const extractedSession = useMemo(() => {
    const match = `${item.title} ${item.shortInfo || ''}`.match(/\b(202\d\s*[-–]\s*(?:20)?2\d|Session\s+202\d)\b/i);
    return match ? match[0] : undefined;
  }, [item]);

  const { intro, remainder } = useMemo(() => {
    const fallbackText = isAdmissionOrEdu
      ? `${organisationName} has published an official update regarding ${item.title}. Review the eligibility requirements, important dates, fee details, and registration instructions below.`
      : `${organisationName} has released the official notification for ${item.title}. Review the vacancy details, eligibility criteria, age limits, fee structure, and application procedure below.`;
    return extractConciseIntro(item.shortInfo || fallbackText, 240);
  }, [item.shortInfo, item.title, organisationName, isAdmissionOrEdu]);

  // Key Information Strip tailored by Content Type
  const keyFacts: KeyInfoFact[] = useMemo(() => {
    if (isAdmissionOrEdu) {
      return [
        {
          label: 'Institution',
          value: organisationName,
          tone: 'default',
        },
        {
          label: 'Course / Programme',
          value: item.advertisementNo || SARKARI_CATEGORIES[item.category]?.label,
          tone: 'blue',
        },
        {
          label: 'Academic Session',
          value: extractedSession || item.session,
          tone: 'default',
        },
        {
          label: 'Available Seats / Intake',
          value: item.totalPosts,
          tone: 'default',
        },
        {
          label: 'Closing Date',
          value: item.lastDate,
          tone: statusInfo.isClosingSoon ? 'rose' : 'default',
        },
        {
          label: 'Admission / Exam Status',
          value: statusInfo.badgeLabel,
          tone: statusInfo.badgeTone,
        },
      ];
    }

    return [
      {
        label: 'Recruiting Organisation',
        value: organisationName,
        tone: 'default',
      },
      {
        label: 'Advertisement No.',
        value: item.advertisementNo,
        tone: 'default',
      },
      {
        label: 'Vacancies',
        value: item.totalPosts,
        tone: 'blue',
      },
      {
        label: 'Application Closing Date',
        value: item.lastDate,
        tone: statusInfo.isClosingSoon ? 'rose' : 'default',
      },
      {
        label: 'Application Status',
        value: statusInfo.badgeLabel,
        tone: statusInfo.badgeTone,
      },
    ];
  }, [
    isAdmissionOrEdu,
    organisationName,
    item.advertisementNo,
    item.category,
    item.totalPosts,
    item.lastDate,
    item.session,
    extractedSession,
    statusInfo,
  ]);

  // Section Navigation tailored by Content Type
  const sections: SectionNavItem[] = useMemo(() => {
    if (isAdmissionOrEdu) {
      return [
        { id: 'overview-section', title: 'Overview' },
        { id: 'eligibility-section', title: 'Eligibility & Academic Requirements' },
        { id: 'important-dates', title: 'Important Dates' },
        { id: 'fee-structure', title: 'Fee Details' },
        ...(item.departmentBreakdown && item.departmentBreakdown.length > 0
          ? [{ id: 'vacancy-details', title: 'Programme & Seat Breakdown' }]
          : []),
        { id: 'documents-required', title: 'Required Documents' },
        { id: 'how-to-apply', title: 'Application / Registration Process' },
        { id: 'selection-process', title: 'Selection / Counselling / Exam Details' },
        { id: 'official-links', title: 'Official Sources' },
        { id: 'faqs-section', title: 'FAQs' },
      ];
    }

    return [
      { id: 'overview-section', title: 'Overview' },
      { id: 'important-dates', title: 'Important Dates' },
      { id: 'eligibility-section', title: 'Eligibility & Qualifications' },
      { id: 'age-criteria', title: 'Age Criteria' },
      { id: 'fee-structure', title: 'Application Fees' },
      ...(item.departmentBreakdown && item.departmentBreakdown.length > 0
        ? [{ id: 'vacancy-details', title: 'Vacancy Breakdown' }]
        : []),
      { id: 'selection-process', title: 'Selection Process' },
      { id: 'documents-required', title: 'Documents Required' },
      { id: 'how-to-apply', title: 'How to Apply' },
      { id: 'official-links', title: 'Official Sources' },
      { id: 'faqs-section', title: 'FAQs' },
    ];
  }, [isAdmissionOrEdu, item.departmentBreakdown]);

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Related items from same category or related board
  const relatedItems: RelatedContentItem[] = useMemo(() => {
    return SARKARI_DATA.filter(
      (i) => i.id !== item.id && (i.category === item.category || i.category === 'jkssb')
    )
      .slice(0, 4)
      .map((rel) => ({
        id: rel.id,
        title: rel.title,
        categoryLabel: SARKARI_CATEGORIES[rel.category]?.label || rel.category,
        metaText: rel.lastDate ? `Closing Date: ${rel.lastDate}` : `Published: ${rel.postDate}`,
        thumbnailUrl: rel.thumbnailUrl || `/thumbnails/${rel.id}.png`,
        onClick: () => {
          window.location.hash = `#post/${rel.id}`;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      }));
  }, [item]);

  const primaryAssistanceLabel = isAdmissionOrEdu
    ? 'Get Admission Help'
    : 'Get Application Help';

  const officialButtonLabel = isDirectPdfUrl
    ? isAdmissionOrEdu
      ? 'Official Admission Notice (PDF)'
      : 'Official Notification (PDF)'
    : isAdmissionOrEdu
    ? 'Official University Portal'
    : 'Official Application Portal';

  const handleRequestAssistance = () => {
    onApplyService(
      isAdmissionOrEdu
        ? `Admission / Exam Form Assistance: ${item.title}`
        : `Filing Application: ${item.title}`
    );
  };

  return (
    <ContentPageLayout
      breadcrumbs={[
        { label: 'Home', onClick: onBack },
        {
          label: isAdmissionOrEdu ? 'Admissions & Education' : 'Jobs & Recruitment',
          onClick: onBack,
        },
        { label: SARKARI_CATEGORIES[item.category]?.label || 'Notice' },
      ]}
      onBack={onBack}
      backLabel={isAdmissionOrEdu ? 'Back to Education Notices' : 'Back to All Notifications'}
      onPrint={() => window.print()}
      whatsappShareUrl={buildWhatsAppNotification(item).whatsappShareUrl}
      onShare={() => onShare(item)}
      sections={sections}
      activeSectionId={activeSectionId}
      onSelectSection={scrollToSection}
      relatedTitle={isAdmissionOrEdu ? 'Related Academic Notices' : 'Related Recruitment Notices'}
      relatedItems={relatedItems}
      sidebarCta={
        canApplyOnline
          ? {
              badge: isAdmissionOrEdu ? 'Admission Desk Support' : 'Application Support',
              title: isAdmissionOrEdu
                ? 'Need Help With Your Admission or Exam Form?'
                : 'Need Help Submitting Your Online Application?',
              description:
                'Submit your documents to our CSC DOST operator desk for document sizing, form preparation, and verified online filing.',
              buttonLabel: primaryAssistanceLabel,
              onAction: handleRequestAssistance,
            }
          : {
              badge: isClosed
                ? 'Applications Closed'
                : isUpcoming
                ? 'Upcoming Notice'
                : isCancelled
                ? 'Notice Cancelled'
                : 'Notice Archived',
              title: isClosed
                ? 'Application Window Concluded'
                : isUpcoming
                ? 'Application Window Not Yet Open'
                : isCancelled
                ? 'Recruitment Cancelled'
                : 'Notice Information',
              description:
                statusInfo.closingTimeNote ||
                (isClosed
                  ? 'The official submission window for this recruitment has ended. CSC DOST cannot accept assisted applications for closed notices.'
                  : 'Online applications will open on the announced date.'),
              buttonLabel: 'Official Authority Portal',
              onAction: () => window.open(officialPortalUrl, '_blank', 'noopener,noreferrer'),
            }
      }
      mobileStickyAction={
        canApplyOnline
          ? {
              primaryLabel: primaryAssistanceLabel,
              onPrimaryClick: handleRequestAssistance,
              secondaryLabel: isDirectPdfUrl ? 'Official PDF' : 'Official Portal',
              secondaryHref: officialPortalUrl,
            }
          : {
              primaryLabel: isDirectPdfUrl ? 'Official PDF' : 'Official Portal',
              onPrimaryClick: () => window.open(officialPortalUrl, '_blank', 'noopener,noreferrer'),
              secondaryLabel: 'Back to Notices',
              onSecondaryClick: onBack,
            }
      }
      schemaJson={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: item.title,
        description: item.shortInfo || item.title,
        articleSection: SARKARI_CATEGORIES[item.category]?.label || 'Recruitment',
        datePublished: item.postDate || undefined,
        author: {
          '@type': 'Organization',
          name: 'CSC DOST',
          url: 'https://www.cscdost.com',
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://www.cscdost.com/#post/${item.id}`,
        },
      }}
    >
      {/* Explicit Authoritative Status Notice Banner */}
      {isClosed && (
        <div className="mb-5 p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Applications Closed</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                Archived Notification
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {statusInfo.closingTimeNote || `The online application deadline concluded on ${item.lastDate}.`} Online application assistance is disabled for this recruitment. All official links and archived details remain accessible for your reference.
            </p>
          </div>
        </div>
      )}

      {isUpcoming && (
        <div className="mb-5 p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-sm font-bold text-blue-950 dark:text-blue-100 flex items-center gap-2">
              <span>Upcoming Application Window</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                Starts {item.startDate}
              </span>
            </div>
            <p className="text-xs text-blue-800 dark:text-blue-200 mt-1 leading-relaxed">
              Online applications are scheduled to commence on <strong>{item.startDate}</strong>. Assisted registration and form preparation will become available once the official portal opens.
            </p>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="mb-5 p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-sm font-bold text-rose-950 dark:text-rose-100">
              Notification Cancelled
            </div>
            <p className="text-xs text-rose-800 dark:text-rose-200 mt-1 leading-relaxed">
              This notification has been formally cancelled or withdrawn by the issuing authority. Applications are closed.
            </p>
          </div>
        </div>
      )}

      {statusInfo.verificationStatus === 'needs_verification' && (
        <div className="mb-5 p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-sm font-bold text-amber-950 dark:text-amber-100">
              Needs Authoritative Verification
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-200 mt-1 leading-relaxed">
              {statusInfo.closingTimeNote || 'This post is under editorial review and pending corroboration with the latest official gazette/portal.'} Assisted applications are suspended.
            </p>
          </div>
        </div>
      )}

      {/* A–E: Category/Organisation Label, Single H1, Concise Intro, and Metadata */}
      <ContentArticleHeader
        categoryLabel={organisationName}
        secondaryBadge={SARKARI_CATEGORIES[item.category]?.label}
        title={item.title}
        subtitle={
          item.advertisementNo ? `Reference / Advertisement No: ${item.advertisementNo}` : undefined
        }
        intro={intro}
        metadata={[
          ...(item.postDate ? [{ label: 'Published', value: item.postDate }] : []),
          ...(item.startDate ? [{ label: 'Starts', value: item.startDate }] : []),
          ...(item.lastDate
            ? [{ label: 'Closing Date', value: item.lastDate, emphasize: true }]
            : []),
          { label: 'Closing Time', value: item.closingTime || 'Inclusive through 23:59 IST' },
          { label: 'Last Verified', value: item.verification?.lastVerified || '30/10/2026 IST' },
          {
            label: 'Verification',
            value: item.verification?.verificationStatus === 'needs_verification' ? 'Needs Verification' : 'Verified (Official Portal)',
          },
          { label: 'Source', value: organisationName },
        ]}
      />

      {/* Master Reference 2048 x 677 px Post Thumbnail Banner */}
      <SarkariNotificationBanner
        item={item}
        className="mb-5"
        onApply={canApplyOnline ? handleRequestAssistance : undefined}
      />

      {/* F: Key Information Strip (Flat subtle background band with separators, no rounded cards) */}
      <KeyInfoStrip facts={keyFacts} />

      {/* G: Clear Primary Actions */}
      <PrimaryActionBar
        primaryAction={
          canApplyOnline
            ? {
                label: primaryAssistanceLabel,
                onClick: handleRequestAssistance,
              }
            : undefined
        }
        officialLinks={[
          {
            label: officialButtonLabel,
            href: officialPortalUrl,
          },
          ...(item.verification?.officialNotificationUrl && item.verification.officialNotificationUrl !== officialPortalUrl
            ? [
                {
                  label: 'Official Notification PDF',
                  href: item.verification.officialNotificationUrl,
                },
              ]
            : []),
        ]}
        onTrackApplication={() => {
          window.location.hash = '#track';
        }}
        assistanceDisclaimer={
          canApplyOnline
            ? 'CSC DOST provides independent document preparation and form-filling assistance. You may also apply directly on the official authority portal above.'
            : 'Applications for this notification are closed. CSC DOST cannot accept assisted submissions for concluded cycles.'
        }
      />

      {/* H: Compact Navigation to Page Sections (Sticky on Mobile) */}
      <MobileSectionNav
        sections={sections}
        activeSectionId={activeSectionId}
        onSelectSection={scrollToSection}
      />

      {/* WhatsApp Channel Alert Card */}
      <WhatsAppChannelInPostCard postTitle={item.title} />

      {/* I: Main Content Sections */}

      {/* 1. OVERVIEW */}
      <ContentSection
        id="overview-section"
        title="Overview"
        subtitle={
          isAdmissionOrEdu
            ? 'Summary of the academic notice, institution details, and key instructions.'
            : 'Summary of the recruitment notification, recruiting authority, and key parameters.'
        }
      >
        <p className="text-xs sm:text-sm text-[#102A43] leading-relaxed">
          {item.shortInfo || intro}
        </p>
        {remainder && (
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">{remainder}</p>
        )}

        <KeyValueRows
          rows={[
            {
              label: isAdmissionOrEdu ? 'University / Institution' : 'Recruiting Organisation',
              value: organisationName,
              boldValue: true,
            },
            {
              label: isAdmissionOrEdu ? 'Notice / Programme Title' : 'Post / Examination Title',
              value: item.title,
              boldValue: true,
            },
            {
              label: 'Advertisement / Reference No.',
              value: item.advertisementNo,
            },
            {
              label: isAdmissionOrEdu ? 'Available Seats / Intake' : 'Total Vacancies',
              value: item.totalPosts,
              boldValue: true,
            },
            {
              label: 'Current Status',
              value: isInfoOnlyNotice ? 'Published — Check Official Notice' : statusInfo.badgeLabel,
              tone:
                statusInfo.applicationStatus === 'open'
                  ? 'emerald'
                  : statusInfo.isClosingSoon
                  ? 'rose'
                  : 'default',
              boldValue: true,
            },
          ]}
        />
      </ContentSection>

      {/* 2. IMPORTANT DATES */}
      <ContentSection
        id="important-dates"
        title="Important Dates"
        subtitle="Verify the notification release date, registration window, and closing deadline."
      >
        <KeyValueRows
          rows={[
            {
              label: 'Notification Published Date',
              value: item.postDate,
            },
            {
              label: isAdmissionOrEdu
                ? 'Registration / Form Start Date'
                : 'Online Application Start Date',
              value: item.startDate || item.postDate,
              tone: 'emerald',
              boldValue: true,
            },
            {
              label: isAdmissionOrEdu
                ? 'Last Date for Form Submission'
                : 'Last Date to Apply Online',
              value: item.lastDate || 'Refer to official notification',
              tone: 'rose',
              boldValue: true,
            },
            {
              label: 'Fee Payment Closing Date',
              value: item.lastDate || 'As specified in official notice',
            },
            {
              label: isAdmissionOrEdu
                ? 'Entrance / Examination Schedule'
                : 'Admit Card & Examination Date',
              value: 'As notified by the authority on the official portal',
            },
          ]}
        />
      </ContentSection>

      {/* 3. ELIGIBILITY & QUALIFICATIONS */}
      <ContentSection
        id="eligibility-section"
        title={
          isAdmissionOrEdu
            ? 'Eligibility & Academic Requirements'
            : 'Eligibility & Qualifications'
        }
        subtitle="Minimum academic qualifications and mandatory certificates required before applying."
      >
        <div className="p-3.5 bg-[#F6F8FC] border-l-2 border-[#2563EB] text-xs sm:text-sm text-[#102A43] leading-relaxed">
          {item.eligibility ||
            (isAdmissionOrEdu
              ? 'Candidates must have passed the qualifying examination from a recognised board or university as prescribed in the official admission brochure.'
              : 'Candidates must possess the required educational qualification (10th / 12th / Diploma / Graduation) from a recognised board or university as specified in the official recruitment notification.')}
        </div>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Applicants must ensure that their qualifying marksheet or degree certificate is issued on
          or before the cut-off date specified by {organisationName}.
        </p>
      </ContentSection>

      {/* 4. AGE CRITERIA (Shown for Jobs & Recruitment, or if item.ageLimit is provided) */}
      {(!isAdmissionOrEdu || item.ageLimit) && (
        <ContentSection
          id="age-criteria"
          title="Age Criteria"
          subtitle="Minimum and maximum age limits along with statutory category relaxations."
        >
          <KeyValueRows
            rows={[
              {
                label: 'Prescribed Age Limit',
                value:
                  item.ageLimit ||
                  'As per official recruitment rules of the recruiting board.',
                boldValue: true,
              },
              {
                label: 'Age Relaxation',
                value:
                  'Upper age limit relaxation applies to SC, ST, OBC, RBA, EWS, PwD, and Ex-Servicemen categories as per government norms.',
              },
              {
                label: 'Age Verification Document',
                value: 'Date of Birth recorded on the Class 10th (Matriculation) certificate.',
              },
            ]}
          />
        </ContentSection>
      )}

      {/* 5. FEES */}
      <ContentSection
        id="fee-structure"
        title={isAdmissionOrEdu ? 'Fee Details' : 'Application Fees'}
        subtitle="Official statutory examination or registration fees payable during online submission."
      >
        <KeyValueRows
          rows={[
            ...(item.feePerSubject
              ? [
                  {
                    label: 'Fee Per Subject / Paper',
                    value: item.feePerSubject,
                    boldValue: true,
                  },
                ]
              : []),
            {
              label: isAdmissionOrEdu
                ? 'General / Open Merit Fee'
                : 'General / OBC / Open Merit Candidates',
              value: item.fees?.genObc || 'Refer to official notification',
              boldValue: true,
            },
            {
              label: 'SC / ST / PwD / Reserved Categories',
              value: item.fees?.scSt || 'As per statutory fee structure in notice',
              tone: 'emerald',
              boldValue: true,
            },
            {
              label: 'Accepted Payment Modes',
              value: 'Online via UPI, Net Banking, Debit Card, or Credit Card',
            },
          ]}
        />
      </ContentSection>

      {/* 6. VACANCY / PROGRAMME BREAKDOWN (if available) */}
      {item.departmentBreakdown && item.departmentBreakdown.length > 0 && (
        <ContentSection
          id="vacancy-details"
          title={isAdmissionOrEdu ? 'Programme & Seat Breakdown' : 'Vacancy Breakdown'}
          subtitle="Detailed post-wise or department-wise distribution."
        >
          <div className="w-full overflow-x-auto border border-[#E2E8F0] rounded-lg">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-[#F6F8FC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <th className="py-2.5 px-3">Department / Wing</th>
                  <th className="py-2.5 px-3">Post / Programme</th>
                  <th className="py-2.5 px-3 text-center">Posts / Seats</th>
                  <th className="py-2.5 px-3">Qualification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {item.departmentBreakdown.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-[#F6F8FC]/60">
                    <td className="py-2.5 px-3 font-semibold text-[#102A43]">{dept.department}</td>
                    <td className="py-2.5 px-3 text-[#2563EB] font-medium">{dept.postName}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-[#102A43]">
                      {dept.posts}
                    </td>
                    <td className="py-2.5 px-3 text-[#64748B] text-xs">{dept.qualification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentSection>
      )}

      {/* 7. SELECTION / COUNSELLING / EXAMINATION PROCESS */}
      <ContentSection
        id="selection-process"
        title={
          isAdmissionOrEdu
            ? 'Selection, Counselling & Examination Details'
            : 'Selection Process'
        }
        subtitle={
          isAdmissionOrEdu
            ? 'How candidates are evaluated and admitted for this programme or examination.'
            : 'Stages of evaluation conducted by the recruiting authority.'
        }
      >
        <ContentChecklist
          columns={1}
          items={
            isAdmissionOrEdu
              ? [
                  'Verification of online registration form and academic eligibility credentials.',
                  'Academic merit evaluation or entrance test score (such as CUET / University Entrance Test) as applicable.',
                  'Publication of merit list / date sheet and counselling schedule on the official institution portal.',
                  'Physical verification of original marksheets, migration, and category certificates at the allotted college or department.',
                ]
              : item.category === 'army_jobs'
              ? [
                  'Phase I: Online Computer-Based Common Entrance Examination (CEE) at designated examination centres.',
                  'Phase II: Physical Fitness Test (1.6 km run, beam pull-ups, 9-feet ditch, zig-zag balance) & Physical Measurement Test (PMT) at rally ground.',
                  'Document Verification of original academic, domicile, character, and unmarried certificates.',
                  'Comprehensive Medical Examination at the rally site as per military standards.',
                ]
              : [
                  'Written Examination (Computer-Based Test / OMR Objective Examination) as per official syllabus.',
                  'Physical Standard / Skill / Typewriting Test (wherever prescribed for specific technical or uniformed posts).',
                  'Document Verification (DV) of original qualification, domicile, and reservation certificates.',
                  'Publication of provisional and final selection lists by the recruiting board.',
                ]
          }
        />
      </ContentSection>

      {/* 8. DOCUMENTS REQUIRED */}
      <ContentSection
        id="documents-required"
        title={isAdmissionOrEdu ? 'Required Documents' : 'Documents Required'}
        subtitle="Keep clear scanned copies of these documents ready before starting your online form."
      >
        <ContentChecklist
          items={
            isAdmissionOrEdu
              ? [
                  'Class 10th (Matriculation) Marksheet & Date of Birth Certificate',
                  'Class 12th / Qualifying Degree Marksheet & Provisional Certificate',
                  'Aadhaar Card or Valid Government Photo Identity',
                  'Domicile Certificate (for state/UT quota seats)',
                  'Reserved Category Certificate (SC/ST/OBC/RBA/EWS), if applicable',
                  'Recent Passport-Size Colour Photograph & Scanned Signature',
                ]
              : [
                  'Aadhaar Card / Valid Government Photo Identity Proof',
                  'Class 10th Marksheet & Certificate (for Date of Birth verification)',
                  'Qualifying Educational Marksheets & Degree / Diploma Certificates',
                  'Domicile Certificate issued by competent authority',
                  'Category / Reservation Certificate (SC/ST/OBC/EWS/RBA), if applicable',
                  'Recent Passport-Size Photograph (20KB–50KB) & Scanned Signature (10KB–20KB)',
                ]
          }
        />
      </ContentSection>

      {/* 9. HOW TO APPLY / APPLICATION PROCESS */}
      <ContentSection
        id="how-to-apply"
        title={isAdmissionOrEdu ? 'Application / Registration Process' : 'How to Apply'}
        subtitle="Follow these steps to submit your form online or request assistance through CSC DOST."
      >
        <StepByStepList
          steps={[
            {
              title: isAdmissionOrEdu
                ? 'Open the Official University / Examination Portal'
                : 'Visit the Official Recruitment Portal',
              description: `Access ${officialPortalUrl} and locate the notification for "${item.title}".`,
            },
            {
              title: 'Complete Candidate Registration / Login',
              description:
                'Sign in using your One-Time Registration (OTR) credentials or register with an active mobile number and email ID.',
            },
            {
              title: 'Enter Personal & Academic Particulars',
              description:
                'Fill in your name, parentage, date of birth, and qualification details strictly matching your Class 10th and qualifying marksheets.',
            },
            {
              title: 'Upload Photograph, Signature & Certificates',
              description:
                'Upload clear, properly sized JPG/PDF scans of your passport photo, signature, and supporting certificates.',
            },
            {
              title: 'Pay the Statutory Fee & Download Confirmation Receipt',
              description:
                'Complete the online fee payment and save a PDF copy and printout of the final submitted form with your application reference number.',
            },
          ]}
        />
      </ContentSection>

      {/* 10. OFFICIAL SOURCES & ASSISTANCE */}
      <OfficialSourcesAndAssistance
        sectionId="official-links"
        organisationName={organisationName}
        officialLinks={[
          {
            label: officialButtonLabel,
            href: officialPortalUrl,
          },
        ]}
        assistanceTitle={
          isAdmissionOrEdu
            ? 'CSC DOST Admission & Examination Form Desk'
            : 'CSC DOST Online Application Assistance Desk'
        }
        assistanceDescription={
          canApplyOnline
            ? "Prefer assisted filing? Submit your documents through CSC DOST and our operator will resize your photo/signature, prepare your online form, and share your confirmation receipt."
            : "The official application window has closed. CSC DOST assisted filing is disabled for this recruitment."
        }
        assistanceButtonLabel={primaryAssistanceLabel}
        onRequestAssistance={canApplyOnline ? handleRequestAssistance : undefined}
      />

      {/* 11. FREQUENTLY ASKED QUESTIONS */}
      <ContentSection
        id="faqs-section"
        title="Frequently Asked Questions"
        showBottomBorder={false}
      >
        <div className="divide-y divide-[#E2E8F0] border-t border-[#E2E8F0]">
          <div className="py-3 space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-[#102A43]">
              Where can I verify the official notification for {item.title}?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              You can verify the official notice and submit applications directly through{' '}
              <span className="font-semibold text-[#102A43]">{organisationName}</span> at{' '}
              <a
                href={officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563EB] hover:underline break-all"
              >
                {officialPortalUrl}
              </a>
              .
            </p>
          </div>

          <div className="py-3 space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-[#102A43]">
              What happens if my online fee payment is deducted but the form shows pending?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Avoid paying a second time immediately. Wait 24–48 hours for payment gateway
              reconciliation or use the &ldquo;Verify Payment Status&rdquo; option inside your
              candidate login dashboard.
            </p>
          </div>

          <div className="py-3 space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-[#102A43]">
              Is requesting assistance through CSC DOST the same as submitting on the government portal?
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              CSC DOST is an independent citizen service and facilitation centre. When you request
              assistance here, our operator prepares and files your application on the official
              portal after verifying your documents and shares the official acknowledgment slip with
              you.
            </p>
          </div>
        </div>
      </ContentSection>

      {/* WhatsApp Channel Popup Modal & Floating Badge */}
      <WhatsAppChannelPopup postTitle={item.title} />
    </ContentPageLayout>
  );
}
