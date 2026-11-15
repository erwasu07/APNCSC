import React, { useEffect, useMemo } from 'react';
import {
  isIgnouItem,
  isRecruitmentSarkariItem,
  type SarkariItem,
} from '../data/sarkariData';
import { resolvePostOrg } from '../data/sarkariMigration';
import { computeSarkariStatus } from '../utils/sarkariStatus';
import { useLanguage } from '../contexts/LanguageContext';
import { buildWhatsAppNotification } from '../utils/whatsappFormatter';
import { AdSlot } from './ui';
import {
  buildPostFaqs,
  getCategoryBreadcrumb,
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
  buildBulletinKeyFacts,
  buildFeeNoticeBox,
  buildImportantDateRows,
  computeBulletinSeal,
  extractVacancyTotalLabel,
  formatLongDate,
  getShortOrgName,
  parseAgeLimitRows,
  parseEligibilityBlocks,
} from './post/postBulletinHelpers';
import './post/post-bulletin.css';

interface SarkariDedicatedPageViewProps {
  item: SarkariItem;
  onBack: () => void;
  onApplyService: (serviceName: string) => void;
  onShare: (item: SarkariItem) => void;
  onNavigateRoute?: (path: string) => void;
}

const PB_FONT_LINK_ID = 'pb-google-fonts';
const PB_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Libre+Franklin:wght@400;500;600;700&display=swap';

const SSC_TIMETABLE_ROWS = [
  {
    exam: 'Coast Guard Enrolled Persons Test (CGEPT) 01/2027 & 02/2027',
    dates: '17 – 18 November 2026',
    mode: 'Computer Based Exam',
  },
  {
    exam: 'Annual Departmental Typing & Stenographer Skill Test 2025',
    dates: '20 – 21 November 2026',
    mode: 'Skill / Typing Test',
  },
  {
    exam: 'Sub-Inspector in Delhi Police & CAPFs Examination (Paper-II)',
    dates: '28 November 2026',
    mode: 'Computer Based Exam',
  },
];

export default function SarkariDedicatedPageView({
  item,
  onApplyService,
  onShare,
  onNavigateRoute,
}: SarkariDedicatedPageViewProps) {
  const { t } = useLanguage();

  const statusInfo = useMemo(() => computeSarkariStatus(item), [item]);
  const effectiveType = useMemo(
    () => resolveEffectiveTemplateType(item, statusInfo),
    [item, statusInfo]
  );
  const nonAppTemplate = isNonApplicationTemplateType(effectiveType);

  const orgName = useMemo(() => item.org || resolvePostOrg(item), [item]);
  const shortOrg = useMemo(() => getShortOrgName(orgName), [orgName]);
  const isIgnou = isIgnouItem(item);
  const isEducation = item.section === 'education' || isIgnou;
  const isSscTimetablePost =
    item.id === 'ssc-examination-schedule-cgept-dept-steno-cpo-nov-2026';

  const portalUrl = useMemo(() => resolvePostPortalUrl(item), [item]);
  const pdfUrl = useMemo(
    () => resolvePostPdfUrl(item, portalUrl),
    [item, portalUrl]
  );

  const { intro, remainder } = useMemo(
    () => splitSummaryParagraphs(item.summary || item.shortInfo),
    [item.summary, item.shortInfo]
  );

  const whatsappShareUrl = useMemo(
    () => buildWhatsAppNotification(item).whatsappShareUrl,
    [item]
  );

  const seal = useMemo(
    () => computeBulletinSeal(item, effectiveType, statusInfo),
    [item, effectiveType, statusInfo]
  );

  const keyFacts = useMemo(
    () => buildBulletinKeyFacts(item, effectiveType, statusInfo, orgName),
    [item, effectiveType, statusInfo, orgName]
  );

  const dateRows = useMemo(
    () => buildImportantDateRows(item, effectiveType, statusInfo),
    [item, effectiveType, statusInfo]
  );

  const feeNotice = useMemo(
    () => buildFeeNoticeBox(item, effectiveType),
    [item, effectiveType]
  );

  const vacancyRows = item.vacancyTable || item.departmentBreakdown || [];
  const hasFeeCol = useMemo(
    () => vacancyRows.some((r) => hasRealDataValue(r.fee)),
    [vacancyRows]
  );
  const vacancyTotalLabel = useMemo(
    () => extractVacancyTotalLabel(item, vacancyRows),
    [item, vacancyRows]
  );

  const parsedEligibility = useMemo(
    () => parseEligibilityBlocks(item.eligibility, item.qualification),
    [item.eligibility, item.qualification]
  );

  const ageRows = useMemo(
    () =>
      !nonAppTemplate
        ? parseAgeLimitRows(item.ageLimit, item.ageRelaxationDetails)
        : [],
    [nonAppTemplate, item.ageLimit, item.ageRelaxationDetails]
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

  const breadcrumbSegments = useMemo(() => {
    const { sectionLabel, sectionPath, categoryLabel } = getCategoryBreadcrumb(item);
    if (isIgnou) {
      return [
        { label: t.educationPageTitle || 'Education', href: '/education' },
        { label: 'IGNOU', href: '/education/ignou' },
        { label: item.learnerGroup || orgName },
      ];
    }
    return [
      { label: sectionLabel, href: sectionPath },
      { label: categoryLabel },
    ];
  }, [item, isIgnou, orgName, t.educationPageTitle]);

  const publishedDateText = useMemo(
    () => formatLongDate(item.postDate),
    [item.postDate]
  );
  const lastUpdatedText = useMemo(
    () =>
      formatLongDate(
        item.updatedAt || item.verification?.lastVerified || item.postDate || item.documentDate
      ),
    [item.updatedAt, item.verification?.lastVerified, item.postDate, item.documentDate]
  );

  // Load Google Fonts (Libre Baskerville + Libre Franklin) ONLY while post route is active
  useEffect(() => {
    let fontLink = document.getElementById(PB_FONT_LINK_ID) as HTMLLinkElement | null;
    if (!fontLink) {
      fontLink = document.createElement('link');
      fontLink.id = PB_FONT_LINK_ID;
      fontLink.rel = 'stylesheet';
      fontLink.href = PB_FONT_HREF;
      document.head.appendChild(fontLink);
    }
    return () => {
      try {
        document.getElementById(PB_FONT_LINK_ID)?.remove();
      } catch {}
    };
  }, []);

  // Document title & Schema.org JSON-LD (JobPosting ONLY on active recruitment; Article otherwise + FAQPage)
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

    // Emit FAQPage JSON-LD strictly for FAQ section visibility
    const faqScriptId = 'csc-post-faq-schema';
    let faqScriptEl = document.getElementById(faqScriptId) as HTMLScriptElement | null;
    if (faqItems.length > 0) {
      if (!faqScriptEl) {
        faqScriptEl = document.createElement('script');
        faqScriptEl.id = faqScriptId;
        faqScriptEl.type = 'application/ld+json';
        document.head.appendChild(faqScriptEl);
      }
      faqScriptEl.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((fq) => ({
          '@type': 'Question',
          name: fq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: fq.answer,
          },
        })),
      });
    } else if (faqScriptEl) {
      faqScriptEl.remove();
    }

    return () => {
      document.title = prevTitle;
      try {
        document.getElementById(scriptId)?.remove();
        document.getElementById(faqScriptId)?.remove();
      } catch {}
    };
  }, [
    item,
    effectiveType,
    orgName,
    portalUrl,
    statusInfo.isClosed,
    statusInfo.isCancelled,
    statusInfo.isOpen,
    statusInfo.isUpcoming,
    faqItems,
  ]);

  const navigateInternal = (path: string) => {
    if (onNavigateRoute) {
      onNavigateRoute(path);
    } else {
      window.history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAssistedApply = (e?: React.MouseEvent) => {
    if (e && !e.metaKey && !e.ctrlKey && e.button === 0) {
      e.preventDefault();
    } else if (e) {
      return;
    }
    onApplyService(
      isEducation
        ? `Admission / Exam Form Assistance: ${item.title}`
        : `Filing Application: ${item.title}`
    );
  };

  // Sequential section numbering (1, 2, 3...) without skipping gaps if optional sections omit
  let sectionCounter = 0;
  const nextSectionNumber = () => ++sectionCounter;

  const showEligibilitySection =
    !nonAppTemplate &&
    (Boolean(parsedEligibility) ||
      ageRows.length > 0 ||
      Boolean(item.selectionProcess && item.selectionProcess.length > 0));

  const showVacancySection = vacancyRows.length > 0 || isSscTimetablePost;
  const showDatesSection =
    dateRows.length > 0 ||
    Boolean(feeNotice) ||
    (!nonAppTemplate && statusInfo.isClosed && !statusInfo.isCancelled) ||
    statusInfo.isUpcoming;

  return (
    <article
      aria-labelledby="post-page-h1"
      className="post-bulletin"
    >
      <div className="pb-sheet">
        {/* 1. LETTERHEAD STRIP */}
        <div className="pb-letterhead">
          <div className="pb-lh-left">
            <div className="pb-crest" aria-hidden="true">
              CD
            </div>
            <div className="pb-lh-brand-wrap">
              <div className="pb-lh-brand">CSC DOST</div>
              <div className="pb-lh-sub">
                Independent citizen information portal · cscdost.com
              </div>
            </div>
          </div>

          <div className="pb-lh-right">
            <div className="pb-lh-doc-type">Information Bulletin</div>
            {lastUpdatedText && (
              <div className="pb-lh-updated">Updated {lastUpdatedText}</div>
            )}
          </div>
        </div>

        <div className="pb-body">
          {/* Contextual Callouts (Duplicate continuity / Cancellation / Verification / Agniveer guide notice) */}
          {(item.duplicateOfId ||
            statusInfo.isCancelled ||
            statusInfo.verificationStatus === 'needs_verification' ||
            item.id === 'army-agniveer-rally-guide-2026' ||
            item.isTentative) && (
            <div className="pb-status-stack">
              {item.duplicateOfId && (
                <div className="pb-notice pb-notice--info" role="note">
                  <strong>Updated notice available.</strong>{' '}
                  {item.duplicateNote ||
                    'This archive entry refers to the same notification as the primary notice.'}{' '}
                  <a
                    href={`/post/${item.duplicateOfId}`}
                    onClick={(e) => {
                      if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                        e.preventDefault();
                        navigateInternal(`/post/${item.duplicateOfId}`);
                      }
                    }}
                  >
                    {t.viewCanonicalNotice || 'View updated notice'}
                  </a>
                </div>
              )}

              {statusInfo.isCancelled && (
                <div className="pb-notice pb-notice--warn" role="alert">
                  <strong>Notification Cancelled / Withdrawn.</strong> This notice has
                  been cancelled or superseded by the issuing authority.
                </div>
              )}

              {statusInfo.verificationStatus === 'needs_verification' && (
                <div className="pb-notice pb-notice--warn" role="note">
                  <strong>Pending Official Portal Verification.</strong>{' '}
                  {statusInfo.closingTimeNote ||
                    'Please verify live dates and eligibility directly on the official authority website.'}
                </div>
              )}

              {item.id === 'army-agniveer-rally-guide-2026' && (
                <div className="pb-notice pb-notice--warn" role="note">
                  Last updated 13 Aug 2026. Confirm the latest details on the official site (
                  <a
                    href="https://joinindianarmy.nic.in"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    joinindianarmy.nic.in
                  </a>
                  ).
                </div>
              )}

              {item.isTentative && (
                <div className="pb-notice pb-notice--warn" role="note">
                  <strong>Tentative Schedule.</strong> This schedule is tentative for
                  advance planning. Confirm final dates on your official hall ticket.
                </div>
              )}
            </div>
          )}

          {/* 2. TITLE BLOCK (Breadcrumb + H1 + CSS 150px Circular Seal) */}
          <nav aria-label="Breadcrumb" className="pb-breadcrumb">
            {breadcrumbSegments.map((seg, idx) => (
              <React.Fragment key={`${seg.label}-${idx}`}>
                {idx > 0 && (
                  <span className="pb-breadcrumb-sep" aria-hidden="true">
                    ›
                  </span>
                )}
                {seg.href ? (
                  <a
                    href={seg.href}
                    onClick={(e) => {
                      if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                        e.preventDefault();
                        navigateInternal(seg.href!);
                      }
                    }}
                  >
                    {seg.label}
                  </a>
                ) : (
                  <span>{seg.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>

          <div className="pb-title-grid">
            <div className="pb-title-text">
              <h1 id="post-page-h1" className="pb-h1">
                {item.title}
              </h1>

              <div className="pb-title-meta">
                {publishedDateText && <span>Published {publishedDateText}</span>}
                {lastUpdatedText && (
                  <span>Last updated {lastUpdatedText}</span>
                )}
                {hasRealDataValue(item.advertisementNo) && (
                  <span className="pb-advt-tag">{item.advertisementNo}</span>
                )}
              </div>
            </div>

            <div className="pb-seal-wrap">
              <div
                className={`pb-seal ${seal.isClosed ? 'pb-seal--closed' : ''}`}
                aria-label={`${seal.kicker} ${seal.main} ${seal.sub}`}
              >
                <span className="pb-seal-kicker">{seal.kicker}</span>
                <span
                  className={`pb-seal-main ${
                    seal.compactMain ? 'pb-seal-main--compact' : ''
                  }`}
                >
                  {seal.main}
                </span>
                <span className="pb-seal-sub">{seal.sub}</span>
              </div>
            </div>
          </div>

          {/* 3. SUBJECT BOX */}
          {intro && (
            <div className="pb-subject">
              <span className="pb-subject-label">Subject:</span> {intro}
              {remainder && <p>{remainder}</p>}
            </div>
          )}

          {/* 4. KEY-FACTS GRID (4 cells: 2x2 mobile, 4-col desktop) */}
          <section aria-label="Key notification facts" className="pb-facts">
            {keyFacts.map((fact) => (
              <div key={fact.label} className="pb-fact-cell">
                <div className="pb-fact-label">{fact.label}</div>
                <div className="pb-fact-value">{fact.value}</div>
              </div>
            ))}
          </section>

          {/* 5+. NUMBERED SECTION 1: IMPORTANT DATES & FEE NOTICE */}
          {showDatesSection && (
            <section className="pb-section" aria-labelledby="pb-sec-dates">
              <h2 id="pb-sec-dates" className="pb-h2">
                <span className="pb-sec-num">{nextSectionNumber()}.</span>
                <span>Important dates</span>
              </h2>

              {dateRows.length > 0 && (
                <div className="pb-table-wrap">
                  <table className="pb-table">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: '48%' }}>
                          Event
                        </th>
                        <th scope="col" style={{ width: '52%' }}>
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dateRows.map((row) => (
                        <tr
                          key={`${row.event}-${row.date}`}
                          className={row.highlight ? 'pb-row-highlight' : undefined}
                        >
                          <td>{row.event}</td>
                          <td>{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {feeNotice && (
                <div className={`pb-notice pb-notice--${feeNotice.variant}`}>
                  <strong>{feeNotice.strongPrefix}</strong> {feeNotice.body}
                </div>
              )}

              {!nonAppTemplate && statusInfo.isClosed && !statusInfo.isCancelled && (
                <div className="pb-notice pb-notice--warn">
                  <strong>Window closed.</strong>{' '}
                  {statusInfo.closingTimeNote ||
                    `The online submission deadline (${
                      item.applyEnd || item.lastDate || statusInfo.dateValue
                    }) has passed.`}
                </div>
              )}

              {effectiveType === 'upcoming' && (
                <div className="pb-notice pb-notice--info">
                  <strong>Upcoming window.</strong>{' '}
                  {statusInfo.closingTimeNote ||
                    `Online registration opens on ${formatLongDate(
                      item.applyStart || item.startDate || statusInfo.dateValue
                    )}.`}
                </div>
              )}
            </section>
          )}

          {/* Overflow-safe AdSense Slot between Important Dates & Vacancy/Details */}
          <div className="pb-ad-wrap">
            <AdSlot />
          </div>

          {/* NUMBERED SECTION: VACANCY DETAILS / SSC TIMETABLE */}
          {showVacancySection && (
            <section className="pb-section" aria-labelledby="pb-sec-vacancy">
              <h2 id="pb-sec-vacancy" className="pb-h2">
                <span className="pb-sec-num">{nextSectionNumber()}.</span>
                <span>
                  {isSscTimetablePost
                    ? 'Examination timetable'
                    : isEducation
                    ? 'Programme & seat details'
                    : 'Vacancy details'}
                </span>
              </h2>

              {isSscTimetablePost ? (
                <div className="pb-table-wrap">
                  <table className="pb-table pb-table--multi">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: '48%' }}>
                          Examination
                        </th>
                        <th scope="col" style={{ width: '28%' }}>
                          Scheduled Dates
                        </th>
                        <th scope="col" style={{ width: '24%' }}>
                          Stage / Mode
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {SSC_TIMETABLE_ROWS.map((r) => (
                        <tr key={r.exam}>
                          <td data-label="Examination">{r.exam}</td>
                          <td data-label="Scheduled Dates">{r.dates}</td>
                          <td data-label="Stage / Mode">{r.mode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="pb-table-wrap">
                  <table className="pb-table pb-table--multi">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: '28%' }}>
                          {isEducation ? 'Department' : 'Department / Cadre'}
                        </th>
                        <th scope="col" style={{ width: hasFeeCol ? '28%' : '34%' }}>
                          {isEducation ? 'Programme' : 'Post Name'}
                        </th>
                        <th
                          scope="col"
                          className="pb-col-num"
                          style={{ width: '14%' }}
                        >
                          {isEducation ? 'Seats' : 'Posts'}
                        </th>
                        <th scope="col" style={{ width: hasFeeCol ? '16%' : '24%' }}>
                          Qualification
                        </th>
                        {hasFeeCol && (
                          <th scope="col" style={{ width: '14%' }}>
                            Pay / Fee
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {vacancyRows.map((row, idx) => (
                        <tr key={`${row.department}-${row.postName}-${idx}`}>
                          <td
                            data-label={isEducation ? 'Department' : 'Department / Cadre'}
                          >
                            {row.department}
                          </td>
                          <td data-label={isEducation ? 'Programme' : 'Post Name'}>
                            {row.postName}
                          </td>
                          <td
                            data-label={isEducation ? 'Seats' : 'Posts'}
                            className="pb-col-num"
                          >
                            <strong>{row.posts}</strong>
                          </td>
                          <td data-label="Qualification">{row.qualification}</td>
                          {hasFeeCol && (
                            <td data-label="Pay / Fee">{row.fee || '—'}</td>
                          )}
                        </tr>
                      ))}
                      {vacancyTotalLabel && (
                        <tr className="pb-row-total">
                          <td data-label="Summary">Total</td>
                          <td data-label="Scope">All notified cadres</td>
                          <td
                            data-label={isEducation ? 'Total Seats' : 'Total Posts'}
                            className="pb-col-num"
                          >
                            {vacancyTotalLabel}
                          </td>
                          <td data-label="Note">As per official notification</td>
                          {hasFeeCol && <td data-label="Pay Level">—</td>}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* NUMBERED SECTION: ELIGIBILITY (QUALIFICATION CARDS + AGE TABLE) */}
          {showEligibilitySection && (
            <section className="pb-section" aria-labelledby="pb-sec-eligibility">
              <h2 id="pb-sec-eligibility" className="pb-h2">
                <span className="pb-sec-num">{nextSectionNumber()}.</span>
                <span>Eligibility</span>
              </h2>

              {parsedEligibility && (
                <>
                  <h3 className="pb-subh3">Educational qualification</h3>
                  <div className="pb-qual-list">
                    {parsedEligibility.cards.map((card, idx) => (
                      <div key={`${card.title || 'qual'}-${idx}`} className="pb-qual-card">
                        {card.title && (
                          <h4 className="pb-qual-title">{card.title}</h4>
                        )}
                        <div className="pb-qual-lines">
                          {card.lines.map((line, lIdx) => (
                            <span key={`${line}-${lIdx}`}>{line}</span>
                          ))}
                        </div>
                        {card.ref && <div className="pb-qual-ref">{card.ref}</div>}
                      </div>
                    ))}
                    {parsedEligibility.note && (
                      <div className="pb-qual-note">{parsedEligibility.note}</div>
                    )}
                  </div>
                </>
              )}

              {ageRows.length > 0 && (
                <>
                  <h3 className="pb-subh3">Age limit</h3>
                  <div className="pb-table-wrap">
                    <table className="pb-table">
                      <thead>
                        <tr>
                          <th scope="col" style={{ width: '50%' }}>
                            Category
                          </th>
                          <th scope="col" style={{ width: '50%' }}>
                            Upper age limit
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {ageRows.map((row, idx) => (
                          <tr key={`${row.category}-${idx}`}>
                            <td>{row.category}</td>
                            <td>{row.limit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {item.selectionProcess && item.selectionProcess.length > 0 && (
                <>
                  <h3 className="pb-subh3">Selection stages</h3>
                  <ol className="pb-ol">
                    {item.selectionProcess.map((stage, idx) => (
                      <li key={`${stage}-${idx}`}>{stage}</li>
                    ))}
                  </ol>
                </>
              )}
            </section>
          )}

          {/* NUMBERED SECTION: DOCUMENTS REQUIRED (BULLETED LIST) */}
          {checklistItems.length > 0 && (
            <section className="pb-section" aria-labelledby="pb-sec-docs">
              <h2 id="pb-sec-docs" className="pb-h2">
                <span className="pb-sec-num">{nextSectionNumber()}.</span>
                <span>Documents required</span>
              </h2>
              <ul className="pb-ul">
                {checklistItems.map((doc, idx) => (
                  <li key={`${doc}-${idx}`}>{doc}</li>
                ))}
              </ul>
            </section>
          )}

          {/* NUMBERED SECTION: HOW TO APPLY / PROCESS STEPS (NUMBERED LIST) */}
          {processConfig && processConfig.steps.length > 0 && (
            <section className="pb-section" aria-labelledby="pb-sec-process">
              <h2 id="pb-sec-process" className="pb-h2">
                <span className="pb-sec-num">{nextSectionNumber()}.</span>
                <span>
                  {effectiveType === 'application' || effectiveType === 'admission'
                    ? 'How to apply'
                    : processConfig.title}
                </span>
              </h2>
              {processConfig.subtitle && (
                <p className="pb-prose">{processConfig.subtitle}</p>
              )}
              <ol className="pb-ol">
                {processConfig.steps.map((step, idx) => (
                  <li key={`${step.title}-${idx}`}>
                    <span className="pb-step-title">{step.title}</span>
                    <span className="pb-step-desc">{step.description}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Overflow-safe AdSense Slot above FAQ */}
          <div className="pb-ad-wrap">
            <AdSlot />
          </div>

          {/* NUMBERED SECTION: FREQUENTLY ASKED QUESTIONS (<details>/<summary>) */}
          {faqItems.length > 0 && (
            <section className="pb-section" aria-labelledby="pb-sec-faq">
              <h2 id="pb-sec-faq" className="pb-h2">
                <span className="pb-sec-num">{nextSectionNumber()}.</span>
                <span>Frequently asked questions</span>
              </h2>
              <div className="pb-faq-list">
                {faqItems.map((faq, idx) => (
                  <details key={`${faq.question}-${idx}`} className="pb-faq-item">
                    <summary className="pb-faq-summary">
                      <span className="pb-faq-arrow" aria-hidden="true">
                        ▶
                      </span>
                      <span>{faq.question}</span>
                    </summary>
                    <div className="pb-faq-answer">{faq.answer}</div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* 10. VERIFICATION PANEL */}
          <section
            aria-label="Official portal verification"
            className="pb-verify-panel pb-print-hide"
          >
            <h2 className="pb-verify-title">
              {nonAppTemplate
                ? 'Verify on the official portal'
                : 'Verify and apply on the official portal'}
            </h2>
            <p className="pb-verify-sub">
              Confirm every detail on the issuing authority’s website before submitting.
            </p>
            <div className="pb-btn-row">
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pb-btn pb-btn--primary"
              >
                Official {shortOrg} portal
              </a>
              <a
                href="https://www.cscdost.com/apply"
                onClick={handleAssistedApply}
                className="pb-btn pb-btn--outline"
              >
                Assisted desk
              </a>
            </div>
            <div className="pb-verify-extra">
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pb-verify-link"
                >
                  Official notification PDF
                </a>
              )}
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
                className="pb-verify-link"
              >
                Share on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => window.print()}
                className="pb-verify-link"
              >
                Print bulletin
              </button>
            </div>
          </section>

          {/* 11. PUBLISHER BLOCK */}
          <footer aria-label="Bulletin publisher details" className="pb-publisher">
            <div>
              <strong>Published by CSC DOST.</strong> Operator: Wasim Ahmad Khanday,
              Authorised CSC VLE (ID 212515670018), Sangran Qazigund, Anantnag, J&amp;K
              192221. Phone{' '}
              <a href="tel:+917006833767" dir="ltr">
                +91 70068 33767
              </a>
              .
            </div>
            <p className="pb-publisher-disclaimer">
              CSC DOST is not a government website. This bulletin is for information only.
            </p>
          </footer>
        </div>
      </div>

      {/* 12. FIXED MOBILE BOTTOM BAR (Hidden >= 860px and in print) */}
      <div
        className={`pb-bottom-bar pb-print-hide ${
          !seal.hasDeadline ? 'pb-bottom-bar--no-date' : ''
        }`}
        role="region"
        aria-label="Quick application action"
      >
        {seal.hasDeadline && (
          <div className="pb-bb-left">
            <span className="pb-bb-days">{seal.bottomDaysText}</span>
            <span className="pb-bb-date">{seal.bottomDateText}</span>
          </div>
        )}
        <a
          href="https://www.cscdost.com/apply"
          onClick={handleAssistedApply}
          className="pb-btn pb-btn--primary pb-bb-apply"
        >
          Apply Now
        </a>
      </div>
    </article>
  );
}
