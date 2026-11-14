import React, { useEffect, useMemo } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Info,
  MessageCircle,
  Printer,
  Share2,
  XCircle,
} from 'lucide-react';
import {
  SarkariItem,
  isIgnouItem,
  isRecruitmentSarkariItem,
} from '../data/sarkariData';
import {
  getDeduplicatedSarkariPosts,
  resolvePostOrg,
} from '../data/sarkariMigration';
import { computeSarkariStatus, type ComputedSarkariStatus } from '../utils/sarkariStatus';
import { useSyncedSarkariPosts, sortByNewestPostDate } from '../utils/postDataSync';
import { useLanguage, type Language } from '../contexts/LanguageContext';
import { buildWhatsAppNotification } from '../utils/whatsappFormatter';
import SarkariNotificationBanner from './SarkariNotificationBanner';
import {
  AdSlot,
  AlertsBox,
  Breadcrumbs,
  Card,
  ChecklistWithProgress,
  Chip,
  DateBlock,
  FaqAccordion,
  HelpApplyingCard,
  StatusPill,
  StickyMobileActionBar,
  type BreadcrumbItem,
} from './ui';
import {
  buildPostFaqs,
  deriveTimelineForPost,
  getCategoryBreadcrumb,
  getChecklistTitleForType,
  getDocumentsForPost,
  getProcessSectionConfig,
  hasRealDataValue,
  isGenericNoticePlaceholder,
  isNonApplicationTemplateType,
  resolveEffectiveTemplateType,
  resolvePostPdfUrl,
  resolvePostPortalUrl,
  splitSummaryParagraphs,
  toIsoDate,
} from './post/postHelpers';
import {
  PostExternalCtaRow,
  PostFactsGrid,
  PostFeeSection,
  PostProcessSteps,
  PostSscTimetableTable,
  PostTimelineCard,
  PostVacancyTable,
} from './post/PostTemplateSections';

interface SarkariDedicatedPageViewProps {
  item: SarkariItem;
  onBack: () => void;
  onApplyService: (serviceName: string) => void;
  onShare: (item: SarkariItem) => void;
  onNavigateRoute?: (path: string) => void;
}

function getPostStatusBadgeLabel(
  st: ComputedSarkariStatus,
  language: Language
): string {
  if (
    !st.isArchiveBucket &&
    st.computedStatus === 'closing_soon' &&
    (st.stage === 'answer_key' || st.stage === 'objection_window')
  ) {
    if (language === 'hi') return `आपत्ति तक ${st.dateValue}`;
    if (language === 'ur') return `اعتراض تک ${st.dateValue}`;
    return `Objections till ${st.dateValue}`;
  }
  return st.badgeLabel;
}

export default function SarkariDedicatedPageView({
  item,
  onBack,
  onApplyService,
  onShare,
  onNavigateRoute,
}: SarkariDedicatedPageViewProps) {
  const { language, t } = useLanguage();
  const allPosts = useSyncedSarkariPosts();

  const statusInfo = useMemo(() => computeSarkariStatus(item), [item]);
  const effectiveType = useMemo(
    () => resolveEffectiveTemplateType(item, statusInfo),
    [item, statusInfo]
  );
  const nonAppTemplate = isNonApplicationTemplateType(effectiveType);

  const orgName = useMemo(() => item.org || resolvePostOrg(item), [item]);
  const isIgnou = isIgnouItem(item);
  const isEducation = item.section === 'education' || isIgnou;
  const isSscTimetablePost =
    item.id === 'ssc-examination-schedule-cgept-dept-steno-cpo-nov-2026';

  const portalUrl = useMemo(() => resolvePostPortalUrl(item), [item]);
  const pdfUrl = useMemo(
    () => resolvePostPdfUrl(item, portalUrl),
    [item, portalUrl]
  );
  const isDirectPdfPortal = /\.pdf($|\?)/i.test(portalUrl);

  const { intro, remainder } = useMemo(
    () => splitSummaryParagraphs(item.summary || item.shortInfo),
    [item.summary, item.shortInfo]
  );

  const whatsappShareUrl = useMemo(
    () => buildWhatsAppNotification(item).whatsappShareUrl,
    [item]
  );

  const timelineSteps = useMemo(
    () => deriveTimelineForPost(item, effectiveType, statusInfo),
    [item, effectiveType, statusInfo]
  );

  const checklistItems = useMemo(
    () => getDocumentsForPost(item, effectiveType),
    [item, effectiveType]
  );

  const processConfig = useMemo(
    () => getProcessSectionConfig(item, effectiveType, statusInfo, portalUrl),
    [item, effectiveType, statusInfo, portalUrl]
  );

  const faqItems = useMemo(
    () => buildPostFaqs(item, effectiveType, orgName, portalUrl, statusInfo),
    [item, effectiveType, orgName, portalUrl, statusInfo]
  );

  const vacancyRows = item.vacancyTable || item.departmentBreakdown || [];

  // Breadcrumbs via / -> /jobs or /education (-> /education/ignou) -> category/org
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const { sectionLabel, sectionPath, categoryLabel } = getCategoryBreadcrumb(item);
    if (isIgnou) {
      return [
        { label: t.navHome, href: '/' },
        { label: t.educationPageTitle, href: '/education' },
        { label: 'IGNOU', href: '/education/ignou' },
        { label: item.learnerGroup || orgName },
      ];
    }
    return [
      { label: t.navHome, href: '/' },
      { label: sectionLabel, href: sectionPath },
      { label: categoryLabel },
    ];
  }, [item, isIgnou, orgName, t.navHome, t.educationPageTitle]);

  // Deduplicated related posts in the same section / org
  const relatedPosts = useMemo(() => {
    const deduped = getDeduplicatedSarkariPosts(allPosts);
    return [...deduped]
      .sort(sortByNewestPostDate)
      .filter((rel) => {
        if (rel.id === item.id || rel.isCancelled) return false;
        const relSt = computeSarkariStatus(rel);
        if (relSt.verificationStatus === 'needs_verification') return false;
        if (isIgnou) return isIgnouItem(rel);
        return (
          (rel.org || resolvePostOrg(rel)) === orgName ||
          rel.section === item.section ||
          rel.category === item.category
        );
      })
      .slice(0, 4)
      .map((rel) => ({
        item: rel,
        st: computeSarkariStatus(rel),
      }));
  }, [allPosts, item.id, item.section, item.category, isIgnou, orgName]);

  // Document title & Schema.org JSON-LD (JobPosting ONLY on active open/upcoming recruitment forms)
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${item.title} | CSC DOST`;

    const scriptId = 'csc-post-structured-schema';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const emitJobSchema =
      (effectiveType === 'application' || effectiveType === 'upcoming') &&
      (statusInfo.isOpen || statusInfo.isUpcoming) &&
      isRecruitmentSarkariItem(item) &&
      item.noticeType !== 'correction' &&
      item.stage !== 'correction' &&
      !statusInfo.isClosed &&
      !statusInfo.isCancelled;

    const schemaPayload = emitJobSchema
      ? {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: item.title,
          description: item.summary || item.shortInfo || item.title,
          datePosted: toIsoDate(item.postDate) || '2026-11-01',
          ...(toIsoDate(item.applyEnd || item.lastDate)
            ? { validThrough: toIsoDate(item.applyEnd || item.lastDate) }
            : {}),
          employmentType: 'FULL_TIME',
          hiringOrganization: {
            '@type': 'Organization',
            name: orgName,
            sameAs: portalUrl,
          },
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressRegion: 'Jammu and Kashmir',
              addressCountry: 'IN',
            },
          },
          directApply: false,
          url: `https://www.cscdost.com/post/${item.id}`,
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: item.title,
          description: item.summary || item.shortInfo || item.title,
          articleSection: orgName,
          datePublished: toIsoDate(item.postDate) || undefined,
          dateModified: toIsoDate(item.updatedAt || item.postDate) || undefined,
          author: {
            '@type': 'Organization',
            name: 'CSC DOST',
            url: 'https://www.cscdost.com',
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://www.cscdost.com/post/${item.id}`,
          },
        };

    scriptEl.textContent = JSON.stringify(schemaPayload);

    return () => {
      document.title = prevTitle;
      try {
        document.getElementById(scriptId)?.remove();
      } catch {}
    };
  }, [item, effectiveType, orgName, portalUrl, statusInfo.isClosed, statusInfo.isCancelled]);

  const navigateInternal = (path: string) => {
    if (onNavigateRoute) {
      onNavigateRoute(path);
    } else {
      window.history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRequestAssistance = () => {
    onApplyService(
      isEducation
        ? `Admission / Exam Form Assistance: ${item.title}`
        : `Filing Application: ${item.title}`
    );
  };

  const applyButtonLabel = isEducation
    ? t.getAdmissionHelp
    : t.getApplicationHelp;
  const officialButtonLabel = isDirectPdfPortal
    ? t.officialPdfBtn
    : t.officialPortalBtn;

  const eligibilityText =
    item.eligibility && !isGenericNoticePlaceholder(item.eligibility)
      ? item.eligibility
      : !isGenericNoticePlaceholder(item.qualification)
      ? item.qualification
      : undefined;

  const showEligibilityAgeCard =
    !nonAppTemplate &&
    (Boolean(eligibilityText) ||
      (!isEducation && hasRealDataValue(item.ageLimit)) ||
      (hasRealDataValue(item.ageLimit) && !isGenericNoticePlaceholder(item.ageLimit)));

  const showSelectionProcess =
    !nonAppTemplate || Boolean(item.selectionProcess && item.selectionProcess.length > 0);

  const selectionSteps =
    item.selectionProcess && item.selectionProcess.length > 0
      ? item.selectionProcess
      : isEducation
      ? [
          'Verification of submitted online registration / examination form.',
          'Merit evaluation, entrance score, or term-end assessment per university rules.',
          'Publication of selection / result status on the official portal.',
        ]
      : [
          'Written / Computer-Based Examination as prescribed in the official advertisement.',
          'Skill, Physical, or Trade Test (wherever applicable per recruitment rules).',
          'Document Verification of original educational, DOB, domicile, and category records.',
        ];

  return (
    <article
      aria-labelledby="post-page-h1"
      className="w-full bg-[var(--bg-page)] text-[var(--text-primary)] pb-28 md:pb-12"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-5 sm:space-y-6">
        {/* Top Breadcrumbs + Back Action */}
        <Breadcrumbs
          items={breadcrumbItems}
          onNavigate={onNavigateRoute}
          rightSlot={
            <button
              type="button"
              onClick={() => {
                if (isIgnou && onNavigateRoute) {
                  onNavigateRoute('/education/ignou');
                } else {
                  onBack();
                }
              }}
              className="min-h-[40px] inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)] hover:text-[#1F9D6B] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180 shrink-0" aria-hidden="true" />
              <span>{t.backToNotices}</span>
            </button>
          }
        />

        {/* Duplicate Entry Continuity Notice (keeps legacy /post/<slug> alive cleanly) */}
        {item.duplicateOfId && (
          <div className="rounded-2xl border border-[var(--status-closing-border)] bg-[var(--status-closing-bg)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start">
            <div className="flex items-start gap-2.5 min-w-0">
              <Info
                className="w-5 h-5 text-[var(--status-closing-text)] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="min-w-0 space-y-0.5">
                <div className="text-sm font-bold text-[var(--status-closing-text)]">
                  {t.duplicateNoticeBannerTitle}
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-primary)] m-0 leading-relaxed">
                  {item.duplicateNote ||
                    'This entry refers to the same official notice as our primary updated post.'}
                </p>
              </div>
            </div>
            <a
              href={`/post/${item.duplicateOfId}`}
              onClick={(e) => {
                e.preventDefault();
                navigateInternal(`/post/${item.duplicateOfId}`);
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#101A36] dark:bg-[#F5A623] text-white dark:text-[#101A36] text-sm font-bold inline-flex items-center justify-center gap-1.5 no-underline shrink-0"
            >
              <span>{t.viewCanonicalNotice}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180 shrink-0" aria-hidden="true" />
            </a>
          </div>
        )}

        {/* Contextual Status Callouts */}
        {statusInfo.isCancelled && (
          <div className="rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4 flex items-start gap-3 text-start">
            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1 min-w-0">
              <div className="text-sm font-bold text-rose-900 dark:text-rose-100">
                Notification Cancelled / Withdrawn
              </div>
              <p className="text-sm text-rose-800 dark:text-rose-200 m-0 leading-relaxed">
                This notice has been cancelled or superseded by the issuing authority.
              </p>
            </div>
          </div>
        )}

        {statusInfo.verificationStatus === 'needs_verification' && (
          <div className="rounded-2xl border border-[var(--status-closing-border)] bg-[var(--status-closing-bg)] p-4 flex items-start gap-3 text-start">
            <AlertCircle
              className="w-5 h-5 text-[var(--status-closing-text)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1 min-w-0">
              <div className="text-sm font-bold text-[var(--status-closing-text)]">
                Pending Official Portal Verification
              </div>
              <p className="text-sm text-[var(--text-primary)] m-0 leading-relaxed">
                {statusInfo.closingTimeNote ||
                  'Please verify live dates and eligibility directly on the official authority website.'}
              </p>
            </div>
          </div>
        )}

        {item.id === 'army-agniveer-rally-guide-2026' && (
          <div
            role="note"
            className="rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-card)] p-3.5 sm:p-4 flex items-start gap-3 text-start shadow-2xs"
          >
            <AlertCircle
              className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-relaxed m-0">
              Last updated 13 Aug 2026. Confirm the latest details on the official site (
              <a
                href="https://joinindianarmy.nic.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#1F9D6B] underline"
              >
                joinindianarmy.nic.in
              </a>
              ).
            </p>
          </div>
        )}

        {effectiveType === 'upcoming' && (
          <div className="rounded-2xl border border-[var(--status-upcoming-border)] bg-[var(--status-upcoming-bg)] p-4 flex items-start gap-3 text-start">
            <Clock
              className="w-5 h-5 text-[var(--status-upcoming-text)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1 min-w-0">
              <div className="text-sm font-bold text-[var(--status-upcoming-text)]">
                Upcoming Registration Window · {statusInfo.badgeLabel}
              </div>
              <p className="text-sm text-[var(--text-primary)] m-0 leading-relaxed">
                {statusInfo.closingTimeNote ||
                  `Registration is scheduled to open on ${item.applyStart || item.startDate}.`}
              </p>
            </div>
          </div>
        )}

        {!nonAppTemplate && statusInfo.isClosed && !statusInfo.isCancelled && (
          <div className="rounded-2xl border border-[var(--status-closed-border)] bg-[var(--status-closed-bg)] p-4 flex items-start gap-3 text-start">
            <AlertCircle
              className="w-5 h-5 text-[var(--status-closed-text)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1 min-w-0">
              <div className="text-sm font-bold text-[var(--text-primary)]">
                Application Window Closed ({item.applyEnd || item.lastDate || statusInfo.dateValue})
              </div>
              <p className="text-sm text-[var(--text-secondary)] m-0 leading-relaxed">
                {statusInfo.closingTimeNote ||
                  'The online submission deadline for this notification has passed. Official archive details remain available below.'}
              </p>
            </div>
          </div>
        )}

        {effectiveType === 'answer_key' && statusInfo.computedStatus === 'closing_soon' && (
          <div className="rounded-2xl border border-[var(--status-closing-border)] bg-[var(--status-closing-bg)] p-4 flex items-start gap-3 text-start">
            <Clock
              className="w-5 h-5 text-[var(--status-closing-text)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1 min-w-0">
              <div className="text-sm font-bold text-[var(--status-closing-text)]">
                {getPostStatusBadgeLabel(statusInfo, language)}
              </div>
              <p className="text-sm text-[var(--text-primary)] m-0 leading-relaxed">
                {statusInfo.closingTimeNote ||
                  `Answer key challenge window closes on ${statusInfo.dateValue}.`}
              </p>
            </div>
          </div>
        )}

        {item.isTentative && (
          <div className="rounded-2xl border border-[var(--status-closing-border)] bg-[var(--status-closing-bg)] p-4 flex items-start gap-3 text-start">
            <Info
              className="w-5 h-5 text-[var(--status-closing-text)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1 min-w-0">
              <div className="text-sm font-bold text-[var(--status-closing-text)]">
                Tentative Date Sheet Notice
              </div>
              <p className="text-sm text-[var(--text-primary)] m-0 leading-relaxed">
                This schedule is tentative for advance student planning. Confirm final examination dates on your official hall ticket.
              </p>
            </div>
          </div>
        )}

        {/* Header Block + DateBlock */}
        <header className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-6 space-y-4 text-start shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill
              status={statusInfo.computedStatus}
              label={getPostStatusBadgeLabel(statusInfo, language)}
              size="md"
            />
            <Chip>{orgName}</Chip>
            {item.jkDomicile && (
              <Chip variant="verified">{t.jkDomicileBadge}</Chip>
            )}
            {isIgnou && item.learnerGroup && (
              <Chip variant="accent">{item.learnerGroup}</Chip>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-4 items-start">
            <div className="space-y-2 min-w-0">
              <h1
                id="post-page-h1"
                className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] leading-snug tracking-tight m-0 break-words"
              >
                {item.title}
              </h1>

              {item.advertisementNo && (
                <p className="text-sm font-semibold text-[var(--text-secondary)] m-0">
                  {item.advertisementNo}
                </p>
              )}

              {intro && (
                <p className="text-base text-[var(--text-secondary)] leading-relaxed m-0 max-w-3xl break-words">
                  {intro}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[var(--text-muted)] pt-1 tabular-nums">
                {item.postDate && <span>Published: {item.postDate}</span>}
                {item.postDate && <span aria-hidden="true">·</span>}
                <span>
                  Last updated: {item.updatedAt || item.postDate || item.documentDate}
                </span>
                <span aria-hidden="true">·</span>
                <span>{t.independentChip}</span>
              </div>
            </div>

            <DateBlock
              tone={statusInfo.computedStatus}
              label={statusInfo.dateLabel}
              dateText={statusInfo.dateValue}
              hint={statusInfo.dateHint}
              className="w-full"
            />
          </div>

          {/* Primary Actions Bar */}
          <div className="pt-2 border-t border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3">
            <PostExternalCtaRow
              portalUrl={portalUrl}
              pdfUrl={pdfUrl}
              portalLabel={officialButtonLabel}
              pdfLabel={t.officialPdfBtn}
              canApplyOnline={statusInfo.canApplyOnline}
              applyLabel={applyButtonLabel}
              onApplyClick={handleRequestAssistance}
            />

            <div className="flex items-center gap-2">
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (onShare) {
                    e.preventDefault();
                    onShare(item);
                  }
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[var(--status-open-bg)] text-[var(--status-open-text)] border border-[var(--status-open-border)] font-bold text-sm inline-flex items-center gap-1.5 no-underline transition-colors hover:opacity-90"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t.shareOnWhatsApp}</span>
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                aria-label="Print notice details"
                className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] font-semibold text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>
        </header>

        {/* Official Summary Banner */}
        <SarkariNotificationBanner
          item={item}
          onApply={statusInfo.canApplyOnline ? handleRequestAssistance : undefined}
        />

        {/* Fixed-height AdSlot below header/banner (never adjacent to CTAs or inside forms) */}
        <AdSlot />

        {/* Main 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          {/* MAIN CONTENT COLUMN */}
          <div className="min-w-0 space-y-5">
            {/* Key Facts Grid tailored per template type */}
            <PostFactsGrid
              item={item}
              type={effectiveType}
              statusInfo={statusInfo}
              orgName={orgName}
              labels={{
                asPerNotice: t.asPerOfficialNotice,
                vacanciesLabel: t.vacanciesLabel,
                qualificationLabel: t.qualificationLabel,
                venueLabel: t.venueLabel,
                reportingTimeLabel: t.reportingTimeLabel,
                examWindowLabel: t.examWindowLabel,
                dvDateLabel: t.dvDateLabel,
                resultOutLabel: t.resultOutLabel,
                keyOutLabel: t.keyOutLabel,
                windowOpensLabel: t.windowOpensLabel,
                closingDateLabel: t.closingDateLabel,
                closedOnLabel: t.closedOnLabel,
              }}
            />

            {/* Overview Card */}
            <section
              id="overview-section"
              aria-label={t.postOverview}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-5 space-y-3 text-start"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1F9D6B] shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] m-0">
                  {t.postOverview}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[var(--text-primary)] leading-relaxed m-0">
                {item.shortInfo || intro}
              </p>
              {remainder && (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0">
                  {remainder}
                </p>
              )}
              {statusInfo.closingTimeNote && (
                <p className="text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-3 m-0">
                  {statusInfo.closingTimeNote}
                </p>
              )}
            </section>

            {/* STRICT: Fee Section ONLY rendered for application | admission | upcoming */}
            {!nonAppTemplate && (
              <PostFeeSection
                item={item}
                sectionTitle={t.postFeeDetails}
                asPerNoticeText={t.asPerOfficialNotice}
              />
            )}

            {/* Eligibility & Age Section (ONLY rendered when meaningful data exists on application/admission/upcoming) */}
            {showEligibilityAgeCard && (
              <section
                id="eligibility-section"
                aria-label="Eligibility & Age Criteria"
                className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-5 space-y-3 text-start"
              >
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] m-0">
                  {isEducation
                    ? 'Eligibility & Academic Requirements'
                    : 'Eligibility & Age Criteria'}
                </h2>

                {eligibilityText && (
                  <p className="text-sm sm:text-base text-[var(--text-primary)] leading-relaxed bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-3.5 m-0">
                    {eligibilityText}
                  </p>
                )}

                {hasRealDataValue(item.ageLimit) &&
                  (!isEducation || !isGenericNoticePlaceholder(item.ageLimit)) && (
                    <div className="pt-1">
                      <dl className="divide-y divide-[var(--border-default)] border-t border-[var(--border-default)] m-0">
                        <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                          <dt className="text-sm font-medium text-[var(--text-secondary)]">
                            {t.postAgeLimit}
                          </dt>
                          <dd className="text-sm sm:text-base font-bold text-[var(--text-primary)] m-0">
                            {item.ageLimit}
                          </dd>
                        </div>
                        {hasRealDataValue(item.ageRelaxationDetails) && (
                          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                            <dt className="text-sm font-medium text-[var(--text-secondary)]">
                              Age Relaxation
                            </dt>
                            <dd className="text-sm text-[var(--text-primary)] m-0">
                              {item.ageRelaxationDetails}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
              </section>
            )}

            {/* Special SSC Timetable Table */}
            {isSscTimetablePost && <PostSscTimetableTable />}

            {/* Vacancy / Programme Table (completely hidden when empty) */}
            <PostVacancyTable
              rows={vacancyRows}
              title={t.postVacancyBreakdown}
              isEducation={isEducation}
            />

            {/* Selection Process (hidden on non-application types unless custom verified stages exist) */}
            {showSelectionProcess && (
              <section
                id="selection-process"
                aria-label="Selection Process"
                className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-5 space-y-3 text-start"
              >
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] m-0">
                  {isEducation ? 'Selection & Evaluation' : 'Selection Process'}
                </h2>
                <ul className="space-y-2 list-none m-0 p-0">
                  {selectionSteps.map((step, idx) => (
                    <li
                      key={`${step}-${idx}`}
                      className="flex items-start gap-2.5 text-sm sm:text-base text-[var(--text-primary)] leading-relaxed"
                    >
                      <CheckCircle2
                        className="w-4 h-4 text-[#1F9D6B] shrink-0 mt-1"
                        aria-hidden="true"
                      />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Interactive Checklist With Progress (hidden automatically if empty) */}
            {checklistItems.length > 0 && (
              <ChecklistWithProgress
                title={getChecklistTitleForType(effectiveType)}
                items={checklistItems}
                storageKey={item.id}
              />
            )}

            {/* Type-Specific Action / Instruction Steps (NEVER "How to apply online" on non-application posts) */}
            {processConfig && (
              <PostProcessSteps
                id={processConfig.id}
                title={processConfig.title}
                subtitle={processConfig.subtitle}
                steps={processConfig.steps}
              />
            )}

            {/* Free WhatsApp Alert Subscription */}
            <AlertsBox />

            {/* Citizen Helpdesk Card (Operator Wasim Ahmad Khanday, VLE ID 212515670018, Qazigund) */}
            <HelpApplyingCard contextTitle={item.title} />

            {/* FAQs Accordion + FAQPage Schema */}
            <FaqAccordion items={faqItems} injectSchema />

            {/* Bottom Fixed-Height AdSlot */}
            <AdSlot />
          </div>

          {/* STICKY RIGHT SIDEBAR (320px Desktop, Stacked on Mobile) */}
          <aside className="space-y-5 lg:sticky lg:top-20">
            {/* Primary Portal & Assisted Application Card */}
            <Card className="p-4 sm:p-5 space-y-3.5 text-start">
              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-[var(--text-primary)] m-0">
                  {statusInfo.canApplyOnline
                    ? isEducation
                      ? 'Apply Online or Get Help'
                      : 'Submit Form or Get Help'
                    : 'Official Authority Link'}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0">
                  {statusInfo.canApplyOnline
                    ? 'Apply directly on the official portal or let CSC DOST prepare and file your application.'
                    : 'Access the official notification, result, admit card, or notice directly on the issuing portal.'}
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {statusInfo.canApplyOnline && (
                  <button
                    type="button"
                    onClick={handleRequestAssistance}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1F9D6B] hover:bg-[#178257] text-white font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>{applyButtonLabel}</span>
                  </button>
                )}

                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#101A36] hover:bg-[#1B2A52] text-white font-bold text-sm inline-flex items-center justify-center gap-2 no-underline transition-colors border border-white/10"
                >
                  <span>{officialButtonLabel}</span>
                  <ExternalLink className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
                </a>

                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] font-bold text-sm inline-flex items-center justify-center gap-2 no-underline transition-colors"
                  >
                    <span>{t.officialPdfBtn}</span>
                    <ExternalLink className="w-4 h-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => onShare(item)}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)] font-semibold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Share2 className="w-4 h-4 text-[#1F9D6B] shrink-0" aria-hidden="true" />
                  <span>{t.shareOnWhatsApp}</span>
                </button>
              </div>
            </Card>

            {/* Notice Timeline Milestones */}
            <PostTimelineCard steps={timelineSteps} title={t.postTimeline} />

            {/* Related Notices (Deduplicated) */}
            {relatedPosts.length > 0 && (
              <section
                aria-label={t.postRelated}
                className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 space-y-3 text-start"
              >
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-primary)] m-0">
                  {t.postRelated}
                </h2>
                <ul className="space-y-2.5 list-none m-0 p-0">
                  {relatedPosts.map(({ item: rel, st }) => (
                    <li key={rel.id}>
                      <a
                        href={`/post/${rel.id}`}
                        onClick={(e) => {
                          if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                            e.preventDefault();
                            navigateInternal(`/post/${rel.id}`);
                          }
                        }}
                        className="block rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] p-3 space-y-1.5 no-underline transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <StatusPill
                            status={st.computedStatus}
                            label={getPostStatusBadgeLabel(st, language)}
                          />
                          <span className="text-[11px] font-semibold text-[var(--text-muted)] tabular-nums truncate">
                            {st.dateValue}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-[var(--text-primary)] line-clamp-2 leading-snug m-0">
                          {rel.title}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <AlertsBox compact />
          </aside>
        </div>
      </div>

      {/* Sticky Bottom Mobile Quick Bar (Official Notice + Share on WhatsApp) */}
      <StickyMobileActionBar
        officialUrl={portalUrl}
        officialLabel={isDirectPdfPortal ? t.officialPdfBtn : t.officialNotice}
        shareWhatsAppUrl={whatsappShareUrl}
        aboveBottomNav={true}
      />
    </article>
  );
}
