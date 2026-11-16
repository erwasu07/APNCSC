/**
 * Server-Side Semantic Content Renderer for cscdost.com
 * Ensures search crawlers (Googlebot, Bingbot, AdSense crawler), social bots,
 * and text-only user agents receive rich, fully accessible semantic HTML
 * inside <div id="root"> prior to client-side hydration.
 */

import {
  SarkariItem,
  SARKARI_DATA,
  isPublishedSarkariItem,
  isIgnouItem,
  isEducationSarkariItem,
  isRecruitmentSarkariItem,
  parseSarkariDateSortValue,
} from './data/sarkariData';
import { ServiceItem } from './servicesData';
import { GUIDE_ARTICLES, GuideArticle } from './data/guidesData';
import { TOOLS_LIST, ToolItem } from './components/tools/toolsData';
import { computeSarkariStatus, getActiveClosingDeadlines } from './utils/sarkariStatus';
import { getDeduplicatedSarkariPosts, resolvePostOrg } from './data/sarkariMigration';
import {
  buildPostFaqs,
  getChecklistTitleForType,
  getDocumentsForPost,
  getProcessSectionConfig,
  hasRealDataValue,
  isNonApplicationTemplateType,
  resolveEffectiveTemplateType,
  resolvePostPortalUrl,
} from './components/post/postHelpers';
import {
  getDaysSinceClosing,
  isOlderThan12Months,
  isStaleOver90Days,
} from './utils/postLifecycle';
import {
  buildPostEnrichmentData,
  EDITORIAL_AUTHOR_TEXT,
  getRelatedNoticesForPost,
} from './components/post/postEnrichmentHelpers';

function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderPostSubstantiveHtml(
  item: SarkariItem,
  allPosts: SarkariItem[] = SARKARI_DATA
): string {
  const computed = computeSarkariStatus(item);
  const effectiveType = resolveEffectiveTemplateType(item, computed);
  const nonAppTemplate = isNonApplicationTemplateType(effectiveType);
  const orgName = item.org || resolvePostOrg(item);
  const portalUrl = resolvePostPortalUrl(item);

  const safeTitle = escapeHtml(item.title);
  const safeOrg = escapeHtml(orgName);
  const safeCategory = escapeHtml(item.category?.replace(/_/g, ' ').toUpperCase() || 'RECRUITMENT NOTICE');
  const safePostDate = escapeHtml(item.postDate || 'Recent');
  const safeLastUpdated = escapeHtml(item.updatedAt || item.postDate || item.documentDate || 'Recent');
  const safeStartDate = escapeHtml(item.applyStart || item.startDate || 'As per official notice');
  const safeLastDate = escapeHtml(computed.dateValue || item.applyEnd || item.lastDate || 'Check Official Notice');
  const safeAdvtNo = escapeHtml(item.advertisementNo || '');
  const safeTotalPosts = escapeHtml(item.totalPosts || 'As per official notice');
  const safeAgeLimit = escapeHtml(item.ageLimit || 'As per official notice');
  const safeEligibility = escapeHtml(item.eligibility || item.qualification || 'As per official notice');
  const safeShortInfo = escapeHtml(item.summary || item.shortInfo || 'Official notification details, important schedule, and verified portal links.');
  const safeGenObc = escapeHtml(item.fees?.genObc || item.fee?.genObc || 'As per official notice');
  const safeScSt = escapeHtml(item.fees?.scSt || item.fee?.scSt || 'As per official notice');
  const safeOfficialLink = escapeHtml(portalUrl);

  const rawFeeStr = `${item.fees?.genObc || ''} ${item.fee?.genObc || ''}`.trim();
  const isZeroFee =
    rawFeeStr.length > 0 &&
    (rawFeeStr.toLowerCase().includes('0') ||
      rawFeeStr.toLowerCase().includes('nil') ||
      rawFeeStr.toLowerCase().includes('exempt') ||
      rawFeeStr.toLowerCase().includes('free'));

  const paymentInstructionText = item.paymentInstructions
    ? escapeHtml(item.paymentInstructions)
    : isZeroFee
      ? '₹0/- (Exempted / Free for all candidates). No payment is required.'
      : 'Pay online through the official authority portal as specified in the notification';

  const isIgnouPost = isIgnouItem(item);
  const isEducationPost = isEducationSarkariItem(item) || item.section === 'education';
  const isSscTimetablePost = item.id === 'ssc-examination-schedule-cgept-dept-steno-cpo-nov-2026';

  const isDateSheet =
    effectiveType === 'exam' ||
    item.noticeType === 'date_sheet' ||
    item.category === 'exam_forms' ||
    item.stage === 'date_sheet' ||
    isSscTimetablePost;

  const docsChecklist = getDocumentsForPost(item, effectiveType);
  const checklistTitle = getChecklistTitleForType(effectiveType);
  const processConfig = getProcessSectionConfig(item, effectiveType, computed, portalUrl);
  const faqItems = buildPostFaqs(item, effectiveType, orgName, portalUrl, computed);
  const isStale90 = isStaleOver90Days(item);
  const daysClosed = getDaysSinceClosing(item);
  const enrichment = buildPostEnrichmentData(item, effectiveType, computed, orgName, portalUrl);
  const relatedNotices = getRelatedNoticesForPost(item, allPosts, 4);
  const faqSchemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }).replace(/</g, '\\u003c');

  return `
  ${renderPrimaryCategoryNavHtml(isEducationPost ? 'education' : 'jobs')}
  <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:16px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#101A36; line-height:1.6;">
    <!-- Breadcrumb Navigation -->
    <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
      <a href="/" style="color:#101A36; font-weight:600; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      ${
        isIgnouPost
          ? `<a href="/education" style="color:#101A36; font-weight:600; text-decoration:none;">Education &amp; Admissions</a>
             <span style="margin:0 6px;">/</span>
             <a href="/education/ignou" style="color:#101A36; font-weight:600; text-decoration:none;">IGNOU</a>`
          : isEducationPost
          ? `<a href="/education" style="color:#101A36; font-weight:600; text-decoration:none;">Education &amp; Admissions</a>`
          : `<a href="/jobs" style="color:#101A36; font-weight:600; text-decoration:none;">Jobs &amp; Recruitment</a>`
      }
      <span style="margin:0 6px;">/</span>
      <span style="color:#101A36; font-weight:700;">${safeTitle}</span>
    </nav>

    <!-- Government Transparency Notice -->
    <aside style="background:#fffbeb; border-left:4px solid #f59e0b; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:20px; font-size:13px; color:#92400e;">
      <strong>Independent Portal Notice:</strong> CSC DOST (cscdost.com) is an independent portal, not a government website, operated by Authorized CSC VLE Wasim Ahmad Khanday (VLE ID: 212515670018). Always confirm details on the official notification linked below.
    </aside>
    ${isStale90 ? `
    <aside role="status" style="background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #dc2626; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:20px; font-size:14px; color:#7f1d1d;">
      <strong>Closed:</strong> The submission deadline passed (${escapeHtml(safeLastDate)}${daysClosed !== null && daysClosed > 0 ? `, ${daysClosed} days ago` : ''}). This page is kept live for historical reference only; confirm any fresh cycles on the official authority website.
    </aside>
    ` : ''}
    ${!computed.canApplyOnline ? `
    <aside style="background:${computed.verificationStatus === 'needs_verification' ? '#fffbeb' : computed.isCancelled ? '#fff1f2' : '#f8fafc'}; border:1px solid ${computed.verificationStatus === 'needs_verification' ? '#fde68a' : computed.isCancelled ? '#fecdd3' : '#cbd5e1'}; border-left:4px solid ${computed.verificationStatus === 'needs_verification' ? '#d97706' : computed.isCancelled ? '#e11d48' : '#475569'}; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:20px; font-size:13px; color:#0f172a;">
      <strong>Status (${escapeHtml(computed.badgeLabel)}):</strong> ${
        computed.verificationStatus === 'needs_verification'
          ? 'This notice could not be freshly corroborated from the official portal and is paused for assisted application requests. Verify directly on the authority website.'
          : computed.isCancelled
          ? 'This notification has been cancelled or withdrawn by the issuing authority.'
          : computed.isClosed
          ? escapeHtml(computed.closingTimeNote || `The application window concluded on ${safeLastDate}. Assisted applications are closed.`)
          : computed.isUpcoming
          ? `Window is scheduled to open on ${safeStartDate}.`
          : 'Check the official authority portal link below for downloads, schedules, or post-application instructions.'
      }
    </aside>
    ` : ''}

    ${item.id === 'army-agniveer-rally-guide-2026' ? `
    <aside role="note" style="background:#FFFFFF; border:2px solid #D97706; padding:12px 16px; border-radius:10px; margin-bottom:16px; font-size:14px; font-weight:600; color:#101A36;">
      Last updated 13 Aug 2026. Confirm the latest details on the official site (<a href="https://joinindianarmy.nic.in" target="_blank" rel="noopener noreferrer" style="color:#1F9D6B; font-weight:700;">joinindianarmy.nic.in</a>).
    </aside>
    ` : ''}

    ${item.isTentative ? `
    <aside style="background:#fffbeb; border:1px solid #fde68a; border-left:4px solid #d97706; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:20px; font-size:13px; color:#92400e;">
      <strong>Tentative Date Sheet Notice:</strong> This schedule is explicitly marked as <strong>Tentative</strong>${item.learnerGroup ? ` for <strong>${escapeHtml(item.learnerGroup)}</strong>` : ''}. Verify clash adjustments and the final date sheet directly on the official portal before examinations.
    </aside>
    ` : ''}

    <!-- Article Header -->
    <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
        <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:10px;">
          ${isIgnouPost ? 'IGNOU UPDATE' : isDateSheet ? 'EXAMINATION SCHEDULE' : safeOrg} · ${escapeHtml(effectiveType.replace(/_/g, ' ').toUpperCase())}${item.isTentative ? ' · TENTATIVE' : ''}
        </span>
        <h1 style="font-size:26px; line-height:1.3; font-weight:800; color:#101A36; margin:0 0 12px 0;">
          ${safeTitle}
        </h1>
        <div style="font-size:13px; color:#475569; display:flex; flex-wrap:wrap; gap:14px;">
          <span><strong>Published:</strong> ${safePostDate}</span>
          <span><strong>Last updated:</strong> ${safeLastUpdated}</span>
          ${item.documentDate ? `<span><strong>Circular Date:</strong> ${escapeHtml(item.documentDate)}</span>` : ''}
          ${item.learnerGroup ? `<span><strong>Learner Group:</strong> <strong style="color:#0369a1;">${escapeHtml(item.learnerGroup)}</strong></span>` : ''}
          ${safeAdvtNo ? `<span><strong>Advt / Ref No:</strong> ${safeAdvtNo}</span>` : ''}
          <span><strong>${escapeHtml(computed.dateLabel)}:</strong> <strong style="color:#101A36;">${safeLastDate}</strong></span>
        </div>
      </header>

      <!-- Short Summary & Quick Summary -->
      <section style="margin-bottom:24px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Notification Overview</h2>
        <p style="font-size:15px; color:#334155; line-height:1.7; margin:0 0 14px 0;">
          ${safeShortInfo}
        </p>
        <h3 style="font-size:16px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Quick summary</h3>
        <ul style="padding-left:20px; margin:0; font-size:14px; color:#334155; line-height:1.75;">
          ${enrichment.quickSummary.map(point => `<li>${escapeHtml(point)}</li>`).join('')}
        </ul>
      </section>

      <!-- Key Dates & Conditional Application Fee (Strictly hidden on DV, Admit Card, Exam, Result, Answer Key) -->
      <section style="margin-bottom:24px; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
          <h3 style="font-size:15px; font-weight:700; color:#101A36; margin:0 0 10px 0;">Important Dates</h3>
          <ul style="list-style:none; padding:0; margin:0; font-size:14px; color:#334155; line-height:1.8;">
            <li><strong>Published:</strong> ${safePostDate}</li>
            <li><strong>Last updated:</strong> ${safeLastUpdated}</li>
            ${
              !nonAppTemplate
                ? `<li><strong>Window Opens:</strong> ${safeStartDate}</li>
                   <li><strong>${escapeHtml(computed.dateLabel)}:</strong> <span style="font-weight:700; color:#101A36;">${safeLastDate}</span></li>`
                : `<li><strong>${escapeHtml(computed.dateLabel)}:</strong> <span style="font-weight:700; color:#101A36;">${safeLastDate}</span></li>
                   ${hasRealDataValue(item.eventDate) && item.eventDate !== computed.dateValue ? `<li><strong>${escapeHtml(item.eventLabel || 'Event Date')}:</strong> ${escapeHtml(item.eventDate)}</li>` : ''}`
            }
            <li><strong>Status:</strong> ${escapeHtml(computed.badgeLabel)}</li>
          </ul>
        </div>

        ${
          !nonAppTemplate && (hasRealDataValue(item.fees?.genObc || item.fee?.genObc) || hasRealDataValue(item.fees?.scSt || item.fee?.scSt))
            ? `<div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
          <h3 style="font-size:15px; font-weight:700; color:#101A36; margin:0 0 10px 0;">Application Fee</h3>
          <ul style="list-style:none; padding:0; margin:0; font-size:14px; color:#334155; line-height:1.8;">
            <li><strong>General / OBC / EWS:</strong> ${isZeroFee ? '₹0/- (Exempted)' : safeGenObc}</li>
            <li><strong>SC / ST / PwD / Female:</strong> ${isZeroFee ? '₹0/- (Exempted)' : safeScSt}</li>
            <li><strong>Payment Note:</strong> ${paymentInstructionText}</li>
          </ul>
        </div>`
            : `<div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
          <h3 style="font-size:15px; font-weight:700; color:#101A36; margin:0 0 10px 0;">Official Notice Details</h3>
          <ul style="list-style:none; padding:0; margin:0; font-size:14px; color:#334155; line-height:1.8;">
            <li><strong>Issuing Body:</strong> ${safeOrg}</li>
            ${hasRealDataValue(item.venue) ? `<li><strong>Venue:</strong> ${escapeHtml(item.venue)}</li>` : ''}
            ${hasRealDataValue(item.reportingTime) ? `<li><strong>Reporting Time:</strong> ${escapeHtml(item.reportingTime)}</li>` : ''}
            <li><strong>Portal Verification:</strong> <a href="${safeOfficialLink}" target="_blank" rel="noopener noreferrer" style="color:#1F9D6B; font-weight:600;">${safeOfficialLink}</a></li>
          </ul>
        </div>`
        }
      </section>

      <!-- Key Facts & Qualification Table -->
      <section style="margin-bottom:24px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 12px 0;">${nonAppTemplate ? 'Notice Summary &amp; Key Facts' : 'Eligibility Criteria &amp; Vacancy Details'}</h2>
        <table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left; border:1px solid #e2e8f0;">
          <tbody>
            ${
              !nonAppTemplate && hasRealDataValue(item.totalPosts)
                ? `<tr style="border-bottom:1px solid #e2e8f0;">
              <th style="padding:10px 14px; background:#f1f5f9; width:32%; font-weight:600; color:#101A36;">Total Vacancies / Intake</th>
              <td style="padding:10px 14px; color:#101A36; font-weight:600;">${safeTotalPosts}</td>
            </tr>`
                : ''
            }
            ${
              !nonAppTemplate && !isEducationPost && hasRealDataValue(item.ageLimit)
                ? `<tr style="border-bottom:1px solid #e2e8f0;">
              <th style="padding:10px 14px; background:#f1f5f9; font-weight:600; color:#101A36;">Age Limit</th>
              <td style="padding:10px 14px; color:#334155;">
                ${safeAgeLimit}
                ${item.ageRelaxationDetails ? `<div style="margin-top:4px; font-size:13px; color:#475569;"><strong>Relaxation Details:</strong> ${escapeHtml(item.ageRelaxationDetails)}</div>` : ''}
              </td>
            </tr>`
                : ''
            }
            <tr style="border-bottom:1px solid #e2e8f0;">
              <th style="padding:10px 14px; background:#f1f5f9; width:32%; font-weight:600; color:#101A36;">Qualification / Covered Candidates</th>
              <td style="padding:10px 14px; color:#334155;">${safeEligibility}</td>
            </tr>
            ${
              item.selectionProcess && item.selectionProcess.length > 0
                ? `<tr style="border-bottom:1px solid #e2e8f0;">
              <th style="padding:10px 14px; background:#f1f5f9; font-weight:600; color:#101A36;">${nonAppTemplate ? 'Exam / Verification Scheme' : 'Selection Process'}</th>
              <td style="padding:10px 14px; color:#334155;">${item.selectionProcess.map(s => escapeHtml(s)).join('<br>')}</td>
            </tr>`
                : ''
            }
          </tbody>
        </table>
      </section>

      ${docsChecklist.length > 0 ? `
      <section style="margin-bottom:24px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 10px 0;">${escapeHtml(checklistTitle)}</h2>
        <ul style="padding-left:20px; font-size:14px; color:#334155; line-height:1.8; margin:0;">
          ${docsChecklist.map(doc => `<li>${escapeHtml(doc)}</li>`).join('')}
        </ul>
      </section>
      ` : ''}

      ${processConfig ? `
      <section style="margin-bottom:28px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 6px 0;">${escapeHtml(processConfig.title)}</h2>
        <p style="font-size:14px; color:#475569; margin:0 0 12px 0;">${escapeHtml(processConfig.subtitle)}</p>
        <ol style="padding-left:20px; font-size:14px; color:#334155; line-height:1.8; margin:0;">
          ${processConfig.steps.map(step => `<li><strong>${escapeHtml(step.title)}:</strong> ${escapeHtml(step.description)}</li>`).join('')}
        </ol>
      </section>
      ` : ''}

      <section style="margin-bottom:24px; display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px;">
        <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; padding:16px;">
          <h2 style="font-size:16px; font-weight:700; color:#065f46; margin:0 0 8px 0;">Who should apply</h2>
          <ul style="padding-left:18px; margin:0; font-size:14px; color:#1e293b; line-height:1.7;">
            ${enrichment.whoShouldApply.map(point => `<li>${escapeHtml(point)}</li>`).join('')}
          </ul>
        </div>
        <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:8px; padding:16px;">
          <h2 style="font-size:16px; font-weight:700; color:#9f1239; margin:0 0 8px 0;">Who should not apply</h2>
          <ul style="padding-left:18px; margin:0; font-size:14px; color:#1e293b; line-height:1.7;">
            ${enrichment.whoShouldNotApply.map(point => `<li>${escapeHtml(point)}</li>`).join('')}
          </ul>
        </div>
      </section>

      <section style="margin-bottom:24px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Common mistakes to avoid</h2>
        <ul style="padding-left:20px; font-size:14px; color:#334155; line-height:1.75; margin:0;">
          ${enrichment.commonMistakes.map(point => `<li>${escapeHtml(point)}</li>`).join('')}
        </ul>
      </section>

      <section style="margin-bottom:24px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">What to do next</h2>
        <ol style="padding-left:20px; font-size:14px; color:#334155; line-height:1.75; margin:0;">
          ${enrichment.whatToDoNext.map(point => `<li>${escapeHtml(point)}</li>`).join('')}
        </ol>
      </section>

      <section style="margin-bottom:24px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 10px 0;">Frequently Asked Questions</h2>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${faqItems.map(f => `
          <details style="border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
            <summary style="font-weight:700; color:#101A36; cursor:pointer;">${escapeHtml(f.question)}</summary>
            <p style="margin:8px 0 0 0; font-size:14px; color:#334155;">${escapeHtml(f.answer)}</p>
          </details>`).join('')}
        </div>
      </section>

      <section style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:20px; font-size:14px; color:#334155;">
        <h2 style="font-size:16px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Source and last verified</h2>
        <p style="margin:0 0 6px 0;"><strong>Official source:</strong> <a href="${safeOfficialLink}" target="_blank" rel="noopener noreferrer" style="color:#1F9D6B; font-weight:700;">${escapeHtml(enrichment.sourceDomain)}</a></p>
        <p style="margin:0 0 8px 0;"><strong>Last verified:</strong> ${escapeHtml(enrichment.verifiedDateText)}</p>
        <p style="margin:0; padding-top:8px; border-top:1px solid #e2e8f0;">
          <strong>Editorial review:</strong> ${escapeHtml(EDITORIAL_AUTHOR_TEXT)}. <a href="/about-us" style="color:#1F9D6B; font-weight:600;">About CSC DOST Editorial Desk →</a>
        </p>
      </section>

      ${relatedNotices.length > 0 ? `
      <section style="margin-bottom:24px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 10px 0;">Related notices</h2>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${relatedNotices.map(rel => `
          <a href="/post/${escapeHtml(rel.id)}" style="display:block; background:#f8fafc; border:1px solid #e2e8f0; border-left:4px solid #1F9D6B; border-radius:8px; padding:12px 14px; text-decoration:none; color:#101A36;">
            <div style="font-size:12px; font-weight:700; color:#0E6450; margin-bottom:3px;">${escapeHtml(rel.relationLabel)}${rel.dateText ? ` · Date / Closing: ${escapeHtml(rel.dateText)}` : ''}</div>
            <div style="font-size:14px; font-weight:700; color:#101A36;">${escapeHtml(rel.title)} →</div>
          </a>`).join('')}
        </div>
      </section>
      ` : ''}

      <!-- Official Links Action Section -->
      <section style="background:#f1f5f9; border-radius:10px; padding:18px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px;">
        <div>
          <div style="font-weight:700; font-size:15px; color:#101A36;">Official Board Portal &amp; Verification Links</div>
          <div style="font-size:13px; color:#475569;">Verify official notification details directly on the issuing authority portal.</div>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <a href="${safeOfficialLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#1F9D6B; color:#ffffff; font-weight:700; font-size:14px; padding:10px 18px; border-radius:8px; text-decoration:none;">
            ${isSscTimetablePost ? 'Official Portal (ssc.gov.in) ↗' : isIgnouPost ? 'Official IGNOU Circular / Portal ↗' : 'Official Portal / Notice ↗'}
          </a>
          ${!computed.canApplyOnline ? `
          <a href="/" style="display:inline-block; background:#ffffff; color:#101A36; border:1px solid #cbd5e1; font-weight:600; font-size:14px; padding:10px 18px; border-radius:8px; text-decoration:none;">
            Return to Portal Homepage
          </a>
          ` : `
          <a href="/apply" style="display:inline-block; background:#101A36; color:#ffffff; font-weight:600; font-size:14px; padding:10px 18px; border-radius:8px; text-decoration:none;">
            Assisted Application Desk
          </a>
          `}
        </div>
      </section>
    </article>

    <script type="application/ld+json">${faqSchemaJson}</script>

    <!-- Footer Disclaimers -->
    <footer style="margin-top:30px; font-size:12px; color:#475569; text-align:center; line-height:1.6;">
      <p>Published by CSC DOST | Operator: Wasim Ahmad Khanday (CSC VLE ID: 212515670018) | Sangran Qazigund, Anantnag, J&amp;K 192221 · +91 70068 33767</p>
      <p>
        <a href="/about-us" style="color:#101A36; font-weight:600; text-decoration:none;">About</a> •
        <a href="/contact-us" style="color:#101A36; font-weight:600; text-decoration:none;">Contact</a> •
        <a href="/privacy-policy" style="color:#101A36; font-weight:600; text-decoration:none;">Privacy Policy</a> •
        <a href="/terms-of-service" style="color:#101A36; font-weight:600; text-decoration:none;">Terms of Service</a> •
        <a href="/disclaimer" style="color:#101A36; font-weight:600; text-decoration:none;">Disclaimer</a>
      </p>
    </footer>
  </main>
  `;
}

export function renderServiceSubstantiveHtml(service: ServiceItem): string {
  const safeName = escapeHtml(service.name);
  const safeDescription = escapeHtml(service.description);
  const hasFeeLines = Array.isArray(service.feeLines) && service.feeLines.length > 0;
  const hasPrice = Boolean(service.price && service.price.trim().length > 0);
  const safePrice = escapeHtml(hasPrice ? service.price.trim() : 'Ask us');
  const safeFeeHtml = hasFeeLines
    ? service.feeLines!.map((l) => `<div>${escapeHtml(l)}</div>`).join('')
    : safePrice;
  const hasTime = Boolean(service.estimatedTime && service.estimatedTime.trim().length > 0);
  const safeTime = escapeHtml(service.estimatedTime?.trim() || '');
  const safeCategory = escapeHtml(service.category);
  const safeOfficialUrl =
    service.officialUrl && service.officialUrl.trim().length > 0
      ? escapeHtml(service.officialUrl.trim())
      : service.category === 'cards_adda'
      ? ''
      : '';
  const safeDocs = Array.isArray(service.requirements) ? service.requirements.filter(Boolean) : [];
  const waEnquiryUrl = `https://wa.me/917006833767?text=${encodeURIComponent(
    `Hello Wasim Ahmad Khanday (CSC DOST), I would like to enquire about ${service.name}: https://www.cscdost.com/service/${service.id}`
  )}`;

  const faqItems = [
    {
      question: `What documents are needed for ${service.name}?`,
      answer:
        safeDocs.length > 0
          ? `Listed documents: ${safeDocs.join(', ')}. Additional verification may be requested by the issuing authority.`
          : 'Document requirements depend on your specific application case. Contact +91 70068 33767 before applying.',
    },
    {
      question: `What are the charges for ${service.name}?`,
      answer: `${hasPrice ? `Listed reference charge: ${service.price.trim()}. ` : 'Fee is confirmed on enquiry ("Ask us"). '}Final charges depend on the service and any government fee. Please confirm before applying.`,
    },
    {
      question: `How long does ${service.name} typically take?`,
      answer: hasTime
        ? `Indicative timeline noted in the service entry: ${service.estimatedTime.trim()}. Actual completion depends on issuing authority verification.`
        : 'Processing time depends on departmental verification. Contact +91 70068 33767 for current turnaround expectations.',
    },
  ];
  const faqSchemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }).replace(/</g, '\\u003c');

  return `
  ${renderPrimaryCategoryNavHtml('services')}
  <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:12px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:16px; color:#101A36; line-height:1.6;">
    <nav aria-label="Breadcrumb" style="font-size:14px; color:#475569; margin-bottom:16px;">
      <a href="/" style="color:#101A36; font-weight:600; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      <a href="/services" style="color:#101A36; font-weight:600; text-decoration:none;">CSC E-Services</a>
      <span style="margin:0 6px;">/</span>
      <span style="color:#101A36; font-weight:700;">${safeName}</span>
    </nav>

    <aside style="background:#FFFBEB; border-left:4px solid #F5A623; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:20px; font-size:14px; color:#101A36;">
      <strong>Fee &amp; Transparency Notice:</strong> Final charges depend on the service and any government fee. Please confirm before applying. Operated by Wasim Ahmad Khanday (CSC VLE ID: 212515670018, Sangran Qazigund, Anantnag, J&amp;K 192221).
    </aside>

    <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:14px; padding:24px;">
      <header style="border-bottom:1px solid #E2E8F0; padding-bottom:18px; margin-bottom:20px;">
        <span style="display:inline-block; background:#ECFDF5; color:#1F9D6B; border:1px solid #A7F3D0; font-size:12px; font-weight:700; text-transform:uppercase; padding:4px 10px; border-radius:6px; margin-bottom:10px;">
          ${safeCategory}
        </span>
        <h1 style="font-size:28px; line-height:1.3; font-weight:800; color:#101A36; margin:0 0 12px 0;">
          ${safeName}
        </h1>
        <p style="font-size:16px; color:#475569; margin:0;">
          ${safeDescription}
        </p>
      </header>

      <section style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-bottom:24px;">
        <div style="background:#F6F8FC; border:1px solid #E2E8F0; border-radius:10px; padding:16px;">
          <div style="font-size:12px; font-weight:600; color:#64748B; text-transform:uppercase;">Fee</div>
          <div style="font-size:16px; font-weight:800; color:#1F9D6B; margin-top:4px; line-height:1.45;">${safeFeeHtml}</div>
        </div>
        ${
          hasTime
            ? `<div style="background:#F6F8FC; border:1px solid #E2E8F0; border-radius:10px; padding:16px;">
          <div style="font-size:12px; font-weight:600; color:#64748B; text-transform:uppercase;">Typical Time</div>
          <div style="font-size:18px; font-weight:800; color:#101A36; margin-top:4px;">${safeTime}</div>
        </div>`
            : ''
        }
      </section>

      <section style="margin-bottom:24px;">
        <h2 style="font-size:20px; font-weight:700; color:#101A36; margin:0 0 12px 0;">Documents Checklist</h2>
        ${
          safeDocs.length > 0
            ? `<ul style="padding-left:20px; font-size:15px; color:#334155; line-height:1.8; margin:0;">
          ${safeDocs.map((doc) => `<li>${escapeHtml(doc)}</li>`).join('')}
        </ul>`
            : `<p style="font-size:15px; color:#475569; margin:0;">Ask us — document requirements depend on your specific application case.</p>`
        }
      </section>

      <section style="margin-bottom:24px;">
        <h2 style="font-size:20px; font-weight:700; color:#101A36; margin:0 0 12px 0;">Process Steps</h2>
        <ol style="padding-left:20px; font-size:15px; color:#334155; line-height:1.8; margin:0;">
          <li>Confirm required documents and total fee (${safePrice}) on WhatsApp or +91 70068 33767 before applying.</li>
          <li>Submit clear supporting document scans online or at CSC DOST (Sangran Qazigund, Anantnag).</li>
          <li>Application is filed on the relevant official portal with OTP or biometric verification where needed.</li>
          <li>Save your submission receipt / reference number to monitor progress.</li>
        </ol>
      </section>

      <section style="margin-bottom:24px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 10px 0;">Service Scope &amp; Pre-Submission Verification</h2>
        <p style="font-size:14px; color:#334155; margin:0 0 10px 0;">
          CSC DOST provides independent citizen facilitation for <strong>${safeName}</strong> under the ${safeCategory} category through our Authorized Common Services Center kiosk (VLE ID: 212515670018, Sangran Qazigund, Anantnag). ${hasTime ? `Indicative timeline noted for this filing: ${safeTime}. ` : ''}Final acceptance and certificate issuance depend strictly on verification by the competent government department.
        </p>
        <ul style="padding-left:20px; font-size:14px; color:#334155; line-height:1.75; margin:0;">
          <li>Ensure applicant name, parent name, and date of birth match across Aadhaar, Matriculation certificate, and revenue records before filing.</li>
          <li>Confirm exact government fee plus CSC operator facilitation charges (${safePrice}) in advance before initiating any payment.</li>
          <li>Keep an active mobile number ready for Aadhaar OTP or portal login verification alerts during form entry.</li>
          <li>Retain your official acknowledgement slip and CSC tracking token to review application updates on <a href="/track" style="color:#1F9D6B; font-weight:600;">cscdost.com/track</a>.</li>
        </ul>
      </section>

      <section style="margin-bottom:24px;">
        <h2 style="font-size:20px; font-weight:700; color:#101A36; margin:0 0 10px 0;">Frequently Asked Questions</h2>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${faqItems
            .map(
              (f) => `
          <details style="border:1px solid #E2E8F0; border-radius:10px; padding:12px;">
            <summary style="font-weight:700; color:#101A36; cursor:pointer;">${escapeHtml(f.question)}</summary>
            <p style="margin:8px 0 0 0; font-size:14px; color:#334155;">${escapeHtml(f.answer)}</p>
          </details>`
            )
            .join('')}
        </div>
      </section>

      <section style="background:#F6F8FC; border:1px solid #E2E8F0; border-radius:12px; padding:18px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px;">
        <div>
          <div style="font-weight:700; font-size:16px; color:#101A36;">Enquire or Request Filing Help</div>
          <div style="font-size:14px; color:#475569;">Final charges depend on the service and any government fee. Please confirm before applying.</div>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <a href="${escapeHtml(waEnquiryUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#1F9D6B; color:#ffffff; font-weight:700; font-size:14px; padding:10px 18px; border-radius:10px; text-decoration:none;">
            Enquire on WhatsApp
          </a>
          <a href="tel:+917006833767" style="display:inline-block; background:#101A36; color:#ffffff; font-weight:700; font-size:14px; padding:10px 18px; border-radius:10px; text-decoration:none;">
            Call +91 70068 33767
          </a>
          ${
            safeOfficialUrl
              ? `<a href="${safeOfficialUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#ffffff; color:#101A36; border:1px solid #CBD5E1; font-weight:600; font-size:14px; padding:10px 18px; border-radius:10px; text-decoration:none;">
            Official Portal ↗
          </a>`
              : ''
          }
        </div>
      </section>
    </article>
    <script type="application/ld+json">${faqSchemaJson}</script>
  </main>
  `;
}

export function renderLegalPageSubstantiveHtml(pageType: string): string {
  const norm = pageType.toLowerCase();
  const navTabs = [
    { key: 'about', href: '/about-us', label: 'About Us' },
    { key: 'contact', href: '/contact-us', label: 'Contact Helpdesk' },
    { key: 'privacy', href: '/privacy-policy', label: 'Privacy Policy' },
    { key: 'terms', href: '/terms-of-service', label: 'Terms of Service' },
    { key: 'disclaimer', href: '/disclaimer', label: 'Disclaimer' },
    { key: 'refund', href: '/refund-policy', label: 'Refund Policy' },
  ];

  const activeTabKey = norm.includes('privacy')
    ? 'privacy'
    : norm.includes('disclaimer')
    ? 'disclaimer'
    : norm.includes('terms')
    ? 'terms'
    : norm.includes('about')
    ? 'about'
    : norm.includes('contact')
    ? 'contact'
    : 'refund';

  const legalHeaderShell = `
  ${renderPrimaryCategoryNavHtml()}
  <div style="max-width:960px; margin:0 auto; padding:4px 16px 0 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <aside style="background:#FFFBEB; border:1px solid #FDE68A; border-left:4px solid #F5A623; border-radius:0 10px 10px 0; padding:12px 16px; margin-bottom:14px; font-size:14px; color:#101A36; line-height:1.5;">
      <strong>Official Transparency Notice:</strong> CSC DOST (cscdost.com) is an independent citizen portal operated by Authorized CSC VLE <strong>Wasim Ahmad Khanday</strong> (VLE ID: <strong>212515670018</strong>). We are <strong>NOT</strong> an official government website.
    </aside>
    <nav aria-label="Static Policy Pages" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
      ${navTabs
        .map(
          (tab) =>
            `<a href="${tab.href}" style="display:inline-block; padding:8px 14px; border-radius:8px; font-size:13px; font-weight:700; text-decoration:none; ${
              tab.key === activeTabKey
                ? 'background:#101A36; color:#ffffff; border:1px solid #101A36;'
                : 'background:#ffffff; color:#101A36; border:1px solid #E2E8F0;'
            }">${tab.label}</a>`
        )
        .join('')}
    </nav>
  </div>`;

  if (norm.includes('privacy')) {
    return `${legalHeaderShell}
    <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.7;">
      <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
        <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#0f172a; font-weight:600;">Privacy Policy</span>
      </nav>

      <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
          <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:8px;">
            Legal Compliance &amp; DPDP Act 2023
          </span>
          <h1 style="font-size:28px; font-weight:800; color:#0f172a; margin:0 0 8px 0;">Privacy Policy</h1>
          <p style="font-size:13px; color:#64748b; margin:0;">Effective Date: February 2026 • Last Reviewed: October 2026</p>
        </header>

        <section style="font-size:15px; color:#334155; space-y:16px;">
          <p>
            At <strong>CSC DOST</strong> (accessible from <code>https://www.cscdost.com</code>), the privacy and digital security of our visitors and applicants is of paramount importance. This Privacy Policy document outlines the types of personal information that is collected and recorded by CSC DOST and how we use, safeguard, and disclose it in strict accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>Information Technology Act, 2000</strong>.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">1. Scope and Applicability</h2>
          <p>
            This policy applies to all visitors, applicants, and registered users of our website, web push notifications, and physical facilitation counter. By utilizing our services or accessing our site, you consent to the data practices described herein.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">2. Information We Collect</h2>
          <ul style="padding-left:20px; margin:0 0 16px 0; line-height:1.8;">
            <li><strong>Informational Visitors:</strong> We collect standard, anonymous server log files (IP addresses, browser type, referring pages, date/time stamps) strictly for aggregate security analytics and system health monitoring.</li>
            <li><strong>Assisted Form Applicants:</strong> When you voluntarily submit an application assistance request, we collect only necessary personal data: Full Name, Father's Name, Date of Birth, Gender, Mobile Number, Email Address, and uploaded proof documents (e.g. Matriculation diploma, Domicile certificate, Photograph, Signature).</li>
            <li><strong>Web Push Subscribers:</strong> If you click &ldquo;Enable Notifications&rdquo; and grant browser notification permission, we store your browser push subscription endpoint URL, cryptographic encryption keys (<code>p256dh</code> and <code>auth</code>), browser user-agent, the page you subscribed from, and timestamps strictly to deliver requested recruitment, exam date-sheet, admission, and CSC welfare scheme alerts. No personal identity is linked to push subscriptions. You can <strong>unsubscribe at any time</strong> by clicking &ldquo;Unsubscribe&rdquo; in Notification Preferences or blocking Notifications in your browser site settings; unsubscribed or expired (HTTP 404/410) rows are permanently deleted from our database.</li>
            <li><strong>Payment Information:</strong> Online fee transactions are processed directly by <strong>Razorpay (PCI-DSS Level 1 compliant gateway)</strong>. CSC DOST does <strong>not</strong> collect, store, or view your debit/credit card numbers, CVVs, net-banking passwords, or UPI PINs.</li>
          </ul>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">3. Purpose and Legal Basis for Processing</h2>
          <p>We collect and process your information exclusively for the following lawful purposes:</p>
          <ul style="padding-left:20px; margin:0 0 16px 0; line-height:1.8;">
            <li>Assisting you in submitting your form to the designated official government portal (e.g., JKSSB, SSC, University of Kashmir).</li>
            <li>Providing real-time application status updates and payment receipts via SMS, WhatsApp, and Web Push notifications.</li>
            <li>Complying with mandatory record-keeping requirements under the CSC e-Governance Services India scheme.</li>
            <li>Preventing fraudulent submissions, spam, and cyber threats.</li>
          </ul>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">4. Client-Side Document Tools Data Isolation</h2>
          <p>
            Our browser-based document resizing, signature joining, and PDF generation tools operate <strong>entirely inside your local web browser</strong> via HTML5 Canvas and WebAssembly. Your photos, signatures, and certificates are never uploaded to our servers when utilizing these offline utilities.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">5. Third-Party Advertising &amp; Google AdSense</h2>
          <p>
            We use Google AdSense (Publisher ID: <code>ca-pub-3600904217061779</code>) to serve contextual and interest-based advertisements that support our free educational articles and recruitment bulletins. Google uses cookies, including the DoubleClick DART cookie, to serve ads to users based on their visits to this and other websites on the Internet.
          </p>
          <p>
            Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style="color:#2563eb;">Google Ads Settings</a> or through the <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" style="color:#2563eb;">Network Advertising Initiative Opt-Out Page</a>.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">6. Cookies and Browser Storage Controls</h2>
          <p>
            CSC DOST uses minimal browser storage (<code>localStorage</code>) to remember your language preference, theme selection, and cookie banner acknowledgement (<code>csc_cookie_consent</code>). Third-party advertising partners such as Google AdSense may place or read cookies and web beacons to measure ad delivery and show relevant ads. You can manage personalized ad preferences via <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style="color:#2563eb;">Google Ads Settings</a> or <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" style="color:#2563eb;">Network Advertising Initiative Opt-Out Page</a>, or disable cookies at any time in your web browser settings.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">7. Data Retention and Erasure</h2>
          <p>
            Application records and uploaded documents are retained securely for a period of up to 180 days after application processing to permit verification and candidate support, after which they are systematically purged from our encrypted storage. Citizens may request immediate deletion of their personal records by emailing <strong>support@cscdost.com</strong> with their tracking token.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">8. Grievance Redressal Officer</h2>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
            <p style="margin:0 0 6px 0;"><strong>Data Grievance Officer:</strong> Wasim Ahmad Khanday</p>
            <p style="margin:0 0 6px 0;"><strong>Designation:</strong> Lead VLE &amp; Operator, CSC DOST (VLE ID: 212515670018)</p>
            <p style="margin:0 0 6px 0;"><strong>Email:</strong> <a href="mailto:support@cscdost.com" style="color:#2563eb;">support@cscdost.com</a> / <a href="mailto:wasimkhanday@gmail.com" style="color:#2563eb;">wasimkhanday@gmail.com</a></p>
            <p style="margin:0;"><strong>Physical Office:</strong> Sangran Qazigund, District Anantnag, Jammu &amp; Kashmir 192221</p>
          </div>
        </section>
      </article>

      <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
        <p>CSC DOST (cscdost.com) | Authorized CSC VLE ID: 212515670018 | Sangran Qazigund, Anantnag, J&amp;K</p>
      </footer>
    </main>
    `;
  }

  if (norm.includes('disclaimer')) {
    return `${legalHeaderShell}
    <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.7;">
      <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
        <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#0f172a; font-weight:600;">Disclaimer</span>
      </nav>

      <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
          <span style="display:inline-block; background:#fef3c7; color:#92400e; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:8px;">
            Legal Disclaimer &amp; Non-Affiliation
          </span>
          <h1 style="font-size:28px; font-weight:800; color:#0f172a; margin:0 0 8px 0;">Disclaimer &amp; Government Non-Affiliation</h1>
          <p style="font-size:13px; color:#64748b; margin:0;">Effective Date: February 2026 • Last Reviewed &amp; Updated: October 2026</p>
        </header>

        <section style="font-size:15px; color:#334155; space-y:16px;">
          <div style="background:#fffbeb; border:1px solid #fef3c7; border-left:4px solid #f59e0b; padding:16px; border-radius:0 8px 8px 0; margin-bottom:20px;">
            <p style="margin:0; font-weight:700; color:#92400e; font-size:16px;">Independent Digital Facilitation Notice</p>
            <p style="margin:8px 0 0 0; color:#78350f; font-size:14px; line-height:1.6;">
              CSC DOST (<code>www.cscdost.com</code>) is an independent private digital facilitation center operated by CSC Village Level Entrepreneur (VLE) Wasim Ahmad Khanday (VLE ID: 212515670018). We are <strong>NOT</strong> an official government website and we do not represent any government department, recruitment agency, or university.
            </p>
          </div>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">1. Informational &amp; Facilitation Scope</h2>
          <p>
            All information provided on CSC DOST regarding government recruitment (JKSSB, SSC, RRB, Indian Army), university admissions (University of Kashmir, Cluster University Srinagar), and central schemes (PM-KISAN, Ayushman Bharat PM-JAY) is published strictly for educational guidance and citizen awareness.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">2. Primary Sources &amp; Verification</h2>
          <p>
            We strongly advise all candidates and citizens to cross-verify notification details, dates, fee amounts, and eligibility requirements directly from official government gazettes and recruitment boards (<code style="background:#f1f5f9; padding:2px 6px; border-radius:4px;">.gov.in / .nic.in</code>) before applying or remitting any payment.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">3. External Hyperlinks</h2>
          <p>
            CSC DOST contains links to third-party government and organizational websites. We do not exercise editorial or administrative control over external portals, nor do we assume liability for their content, availability, or operational changes.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">4. Independent Pre-Application Verification Checklist</h2>
          <p>
            Before submitting an application, paying any statutory fee, or attending an examination or physical rally, citizens and candidates should always complete these verification checks directly on the issuing authority's website:
          </p>
          <ul style="padding-left:20px; margin:0 0 16px 0; line-height:1.8;">
            <li>Confirm the exact Advertisement Number, circular date, and whether any corrigendum or deadline extension was subsequently issued.</li>
            <li>Verify reservation category rules, domicile eligibility, age relaxation dates, and minimum educational qualifications from the original notification PDF.</li>
            <li>Cross-check fee exemptions, bank portal charges, and official last-date closing times in IST prior to making payment.</li>
          </ul>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">5. Contact &amp; Questions</h2>
          <p>
            If you have questions regarding this disclaimer, please contact us at <a href="mailto:support@cscdost.com" style="color:#2563eb;">support@cscdost.com</a> or phone: <a href="tel:+917006833767" style="color:#2563eb;">+91 70068 33767</a>. Physical Office: Sangran Qazigund, District Anantnag, Jammu &amp; Kashmir 192221.
          </p>
        </section>
      </article>

      <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
        <p>CSC DOST (cscdost.com) | Authorized CSC VLE ID: 212515670018 | Sangran Qazigund, Anantnag, J&amp;K</p>
      </footer>
    </main>
    `;
  }

  if (norm.includes('terms')) {
    return `${legalHeaderShell}
    <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.7;">
      <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
        <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#0f172a; font-weight:600;">Terms of Service</span>
      </nav>

      <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
          <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:8px;">
            Citizen Agreement
          </span>
          <h1 style="font-size:28px; font-weight:800; color:#0f172a; margin:0 0 8px 0;">Terms of Service &amp; User Agreement</h1>
          <p style="font-size:13px; color:#64748b; margin:0;">Effective Date: February 2026 • Last Reviewed: October 2026</p>
        </header>

        <section style="font-size:15px; color:#334155; line-height:1.7;">
          <p>
            These Terms of Service govern your access to and use of <strong>CSC DOST</strong> (<code>www.cscdost.com</code>) and services rendered at our physical CSC facilitation desk in Sangran Qazigund, J&amp;K.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">1. Nature of Portal and Scope of Service</h2>
          <p>
            CSC DOST operates as an authorized independent Common Services Center (CSC) kiosk under CSC e-Governance Services India Limited. We provide informational articles, recruitment updates, client-side document processing tools, and voluntary application facilitation.
          </p>
          <p>
            <strong>We are not a government agency.</strong> We do not formulate government policies, issue exam admit cards, evaluate answers, or make recruitment decisions. The decision to accept, reject, or schedule examinations rests exclusively with the relevant government or university authorities (e.g., UPSC, SSC, RRB, JKSSB, Kashmir University).
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">2. Applicant Responsibilities and Accuracy of Data</h2>
          <ul style="padding-left:20px; margin:0 0 16px 0; line-height:1.8;">
            <li>
              Applicants are solely responsible for verifying their eligibility criteria (such as minimum education qualification, age limits, and category reservations) against the original official notification issued by the respective authority.
            </li>
            <li>
              You warrant that all information, photographs, certificates, and details submitted through our assisted application portal are authentic, complete, and legally valid.
            </li>
            <li>
              Submitting forged documents or false statements is punishable under the Bharatiya Nyaya Sanhita (BNS) and the IT Act. CSC DOST reserves the right to cancel fraudulent requests without refund.
            </li>
          </ul>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">3. Fees and Service Charges</h2>
          <p>Fees displayed on CSC DOST for assisted application submissions comprise:</p>
          <ol style="padding-left:20px; margin:0 0 16px 0; line-height:1.8;">
            <li>
              <strong>Official Government Fee:</strong> The statutory application or examination fee mandated by the issuing authority.
            </li>
            <li>
              <strong>CSC Facilitation / Operator Charge:</strong> A nominal convenience fee for document scanning, image formatting, data entry, and printing services in compliance with prescribed CSC norms.
            </li>
          </ol>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">4. Limitation of Liability</h2>
          <p>
            While we exercise reasonable diligence to accurately submit applications before official deadlines, CSC DOST shall not be held liable for:
          </p>
          <ul style="padding-left:20px; margin:0 0 16px 0; line-height:1.8;">
            <li>
              Server downtime, slowdowns, or technical failures on third-party government websites (e.g. JKSSB, SSC, RRB servers crashing during the final hours of application closing).
            </li>
            <li>
              Late applications submitted to our desk less than 6 hours prior to official server cutoffs.
            </li>
            <li>
              Rejection of applications by government authorities due to disqualifying criteria or biometric discrepancies.
            </li>
          </ul>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">5. Governing Law and Jurisdiction</h2>
          <p>
            These terms and any disputes arising out of the use of CSC DOST shall be governed by and construed in accordance with the laws of India, subject to the exclusive jurisdiction of the competent courts in District Anantnag, Jammu &amp; Kashmir.
          </p>
        </section>
      </article>

      <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
        <p>CSC DOST (cscdost.com) | Authorized CSC VLE ID: 212515670018 | Sangran Qazigund, Anantnag, J&amp;K</p>
      </footer>
    </main>
    `;
  }

  if (norm.includes('about')) {
    return `${legalHeaderShell}
    <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.7;">
      <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
        <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#0f172a; font-weight:600;">About Us</span>
      </nav>

      <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
          <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:8px;">
            Operator Profile &amp; Mission
          </span>
          <h1 style="font-size:28px; font-weight:800; color:#0f172a; margin:0 0 8px 0;">About CSC DOST (cscdost.com)</h1>
          <p style="font-size:13px; color:#64748b; margin:0;">Published by Authorized CSC VLE Wasim Ahmad Khanday • Verified &amp; Active</p>
        </header>

        <section style="font-size:15px; color:#334155; space-y:16px;">
          <p>
            Welcome to <strong>CSC DOST</strong> (operating digitally at <code>www.cscdost.com</code>), an independent citizen assistance, e-governance facilitation, and informational guidance platform.
          </p>
          <p>
            CSC DOST was established to bridge the digital divide between rural/semi-urban citizens and modern digital e-governance systems. Millions of candidates and families across Jammu &amp; Kashmir and India face technical barriers, complex form-filling requirements, strict image compression criteria, and unfamiliar payment gateways when applying for recruitments, competitive examinations, scholarship schemes, or welfare programs. CSC DOST offers verified guides, step-by-step assistance, and direct links to official authorities.
          </p>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:18px; margin:20px 0;">
            <h2 style="font-size:18px; font-weight:700; color:#0f172a; margin:0 0 10px 0;">Certified CSC Entrepreneur Details</h2>
            <ul style="list-style:none; padding:0; margin:0; font-size:14px; color:#334155; line-height:1.9;">
              <li><strong>Lead Operator:</strong> Wasim Ahmad Khanday</li>
              <li><strong>Authorized CSC VLE ID:</strong> 212515670018</li>
              <li><strong>MSME Udyam Registration:</strong> UDYAM-JK-01-0041957</li>
              <li><strong>Physical Facilitation Center:</strong> Sangran Qazigund, District Anantnag, Jammu &amp; Kashmir (PIN: 192221)</li>
              <li><strong>Helpline Contact:</strong> +91 70068 33767 / +91 96821 32895</li>
              <li><strong>Support Email:</strong> support@cscdost.com</li>
            </ul>
          </div>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">Core Services Provided</h2>
          <ul style="padding-left:20px; margin:0 0 16px 0; line-height:1.8;">
            <li><strong>Recruitment Bulletin &amp; Sarkari Results:</strong> Daily verified updates on Indian Army, RRB Railways, SSC Staff Selection Commission, JKSSB, Kashmir University admissions, and Cluster University Srinagar notices.</li>
            <li><strong>Citizen E-Governance Guidance:</strong> Educational walkthroughs for PAN card registration, Aadhaar address correction, Ayushman Bharat PM-JAY Golden Card issuance, PM-KISAN e-KYC, and state domicile certificates.</li>
            <li><strong>Browser-Based Document Tools:</strong> Free client-side image resizers, photo signature joiners, and document optimizers designed to meet exact government pixel and kilobyte specifications without sending files to private external servers.</li>
            <li><strong>Assisted Application Desk:</strong> Optional citizen facilitation where applicants who cannot complete complex online forms can book physical or virtual assistance from our certified VLE center.</li>
          </ul>
        </section>
      </article>

      <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
        <p>CSC DOST (cscdost.com) | Authorized CSC VLE ID: 212515670018 | Sangran Qazigund, Anantnag, J&amp;K</p>
      </footer>
    </main>
    `;
  }

  if (norm.includes('contact')) {
    return `${legalHeaderShell}
    <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.7;">
      <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
        <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#0f172a; font-weight:600;">Contact Us</span>
      </nav>

      <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
          <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:8px;">
            Helpdesk &amp; Citizen Support
          </span>
          <h1 style="font-size:28px; font-weight:800; color:#0f172a; margin:0 0 8px 0;">Contact Us &amp; Physical Center Details</h1>
          <p style="font-size:13px; color:#64748b; margin:0;">We are available to assist citizens with technical questions, application tracking, and grievances.</p>
        </header>

        <section style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px; margin:20px 0;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:18px;">
            <h2 style="font-size:16px; font-weight:700; color:#0f172a; margin:0 0 10px 0;">🏢 Physical Facilitation Desk</h2>
            <p style="font-size:14px; color:#334155; line-height:1.8; margin:0;">
              <strong>Address:</strong> CSC DOST Facilitation Desk, Sangran Qazigund, District Anantnag, Jammu &amp; Kashmir, PIN: 192221, India<br/>
              <strong>CSC VLE ID:</strong> 212515670018<br/>
              <strong>Operator:</strong> Wasim Ahmad Khanday<br/>
              <strong>Working Hours:</strong> Mon – Sat: 9:00 AM – 7:00 PM IST (Closed Sundays)
            </p>
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:18px;">
            <h2 style="font-size:16px; font-weight:700; color:#0f172a; margin:0 0 10px 0;">📞 Electronic Helpdesk</h2>
            <p style="font-size:14px; color:#334155; line-height:1.8; margin:0;">
              <strong>Helpline / Phone:</strong> <a href="tel:+917006833767" style="color:#2563eb;">+91 70068 33767</a><br/>
              <strong>Alternate Contact:</strong> +91 96821 32895<br/>
              <strong>Support Email:</strong> <a href="mailto:support@cscdost.com" style="color:#2563eb;">support@cscdost.com</a><br/>
              <strong>Grievance Officer:</strong> Wasim Ahmad Khanday (<a href="mailto:wasimkhanday@gmail.com" style="color:#2563eb;">wasimkhanday@gmail.com</a>)<br/>
              <strong>Tracking Desk:</strong> <a href="/track" style="color:#2563eb;">cscdost.com/track</a>
            </p>
          </div>
        </section>

        <section style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:18px; margin-top:16px; font-size:14px; color:#334155; line-height:1.7;">
          <h2 style="font-size:17px; font-weight:700; color:#0f172a; margin:0 0 8px 0;">Service Turnaround &amp; Citizen Verification Desk</h2>
          <p style="margin:0 0 10px 0;">
            Every assisted citizen request received by CSC DOST is reviewed by Authorised CSC VLE Wasim Ahmad Khanday at our Sangran Qazigund facilitation desk during working hours (Monday to Saturday, 9:00 AM to 7:00 PM IST). Enquiries submitted via phone, WhatsApp, or email are typically acknowledged the same working day or on the next working morning.
          </p>
          <p style="margin:0 0 10px 0;">
            Citizens from Anantnag, Kulgam, Qazigund, and across Jammu &amp; Kashmir can contact our desk for recruitment form assistance (JKSSB, SSC, RRB, Indian Army), university examination or admission queries (University of Kashmir, Cluster University Srinagar, IGNOU), and central or state welfare schemes such as PM-KISAN, Ayushman Bharat PM-JAY, and domicile certificate filings.
          </p>
          <p style="margin:0 0 8px 0; font-weight:700; color:#0f172a;">Before visiting or messaging the helpdesk, please keep ready:</p>
          <ul style="padding-left:20px; margin:0;">
            <li>Your exact Advertisement Number, scheme title, or university circular name you are enquiring about.</li>
            <li>Your Application Tracking Token (if checking progress or payment status for an existing request).</li>
            <li>Clear scans of academic, identity, or domicile certificates where eligibility verification or document resizing is needed.</li>
          </ul>
        </section>
      </article>

      <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
        <p>CSC DOST (cscdost.com) | Authorized CSC VLE ID: 212515670018 | Sangran Qazigund, Anantnag, J&amp;K</p>
      </footer>
    </main>
    `;
  }

  // Refund policy fallback
  return `${legalHeaderShell}
  <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.7;">
    <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
      <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      <span style="color:#0f172a; font-weight:600;">Refund Policy</span>
    </nav>

    <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
        <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:8px;">
          Payment Policies
        </span>
        <h1 style="font-size:28px; font-weight:800; color:#0f172a; margin:0 0 8px 0;">Refund &amp; Cancellation Policy</h1>
        <p style="font-size:13px; color:#64748b; margin:0;">Effective Date: February 2026 • Last Reviewed: October 2026</p>
      </header>

      <section style="font-size:15px; color:#334155; line-height:1.7;">
        <p>
          At <strong>CSC DOST</strong>, we maintain a transparent and fair refund policy for all assisted application processing and digital appointment services.
        </p>

        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">1. Assisted Application Cancellation &amp; Refunds</h2>
        <ul style="padding-left:20px; margin:0 0 16px 0; line-height:1.8;">
          <li>
            <strong>Prior to Submission:</strong> If an applicant requests cancellation <em>before</em> our VLE team has processed or submitted the form to the government portal, a full 100% refund of both the government fee and convenience charges will be initiated.
          </li>
          <li>
            <strong>After Final Submission:</strong> Once an application has been successfully submitted to the official government portal and an official registration number or challan has been generated, statutory government fees cannot be refunded, as government treasuries do not permit clawbacks.
          </li>
          <li>
            <strong>Rejected or Incomplete Forms due to Portal Outages:</strong> If a submission fails due to an official government server closure or outage prior to the deadline, any unspent fees will be returned within 5-7 working days.
          </li>
        </ul>

        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">2. Mode and Timeline of Refund</h2>
        <p>
          Approved refunds are processed through our Razorpay payment gateway back to the original source account (UPI, debit card, or net banking) within <strong>5 to 7 business days</strong>.
        </p>

        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">3. Dispute and Refund Requests</h2>
        <p>
          To request a refund or raise a billing grievance, please email <strong>support@cscdost.com</strong> with your Application Tracking Token (e.g. <code>CSC-XXXXXXXX</code>) and payment transaction reference ID.
        </p>

        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">4. Failed UPI / Card Transactions &amp; Reconciliation</h2>
        <p>
          If an amount is debited from your bank account during Razorpay checkout due to network interruption while your CSC DOST application screen shows pending, do not initiate a second payment immediately. Wait up to 24 hours for automated gateway reconciliation or share your Razorpay Payment ID, UTR number, and registered mobile number with our desk at <a href="tel:+917006833767" style="color:#2563eb;">+91 70068 33767</a> or <a href="mailto:support@cscdost.com" style="color:#2563eb;">support@cscdost.com</a>. Duplicate or uncaptured gateway debits are settled automatically by banking rails within 5 to 7 working days.
        </p>
      </section>
    </article>

    <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
      <p>CSC DOST (cscdost.com) | Authorized CSC VLE ID: 212515670018 | Sangran Qazigund, Anantnag, J&amp;K</p>
    </footer>
  </main>
  `;
}

function renderPrimaryCategoryNavHtml(activeCategory?: string): string {
  const categories = [
    { slug: 'jobs', href: '/jobs', label: 'Jobs &amp; Recruitment' },
    { slug: 'education', href: '/education', label: 'Education &amp; Admissions' },
    { slug: 'schemes', href: '/schemes', label: 'Government Schemes' },
    { slug: 'services', href: '/services', label: 'CSC E-Services' },
    { slug: 'tools', href: '/tools', label: 'Document Tools' },
    { slug: 'calculators', href: '/calculators', label: 'Citizen Calculators' },
  ];

  return `
  <header style="background:#101A36; color:#ffffff; border-bottom:1px solid rgba(255,255,255,0.1); margin-bottom:20px;">
    <div style="max-width:1100px; margin:0 auto; padding:14px 16px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px;">
      <a href="/" style="font-size:20px; font-weight:800; color:#ffffff; text-decoration:none;">CSC DOST</a>
      <nav aria-label="Main Categories" style="display:flex; flex-wrap:wrap; gap:14px; font-size:15px; font-weight:600;">
        ${categories
          .map(
            (cat) =>
              `<a href="${cat.href}" style="color:${activeCategory === cat.slug ? '#F5A623' : '#E2E8F0'}; text-decoration:${activeCategory === cat.slug ? 'underline' : 'none'};">${cat.label}</a>`
          )
          .join('')}
      </nav>
    </div>
  </header>`;
}

export function renderHomepageSubstantiveHtml(
  posts: SarkariItem[],
  services: ServiceItem[],
  alertsConfig?: { whatsappUrl: string; whatsappType: 'channel' | 'group'; telegramUrl?: string }
): string {
  const dedupedPosts = getDeduplicatedSarkariPosts(posts);
  const verifiedVisiblePosts = dedupedPosts
    .filter((p) => {
      if (!isPublishedSarkariItem(p)) return false;
      if (isOlderThan12Months(p)) return false;
      const st = computeSarkariStatus(p);
      return st.verificationStatus !== 'needs_verification' && !p.isCancelled;
    })
    .sort(
      (a, b) =>
        parseSarkariDateSortValue(b.postDate || b.documentDate) -
        parseSarkariDateSortValue(a.postDate || a.documentDate)
    );

  const closingSoonDeadlines = getActiveClosingDeadlines(dedupedPosts, { maxDays: 7 }).slice(0, 4);

  const recruitmentPool = verifiedVisiblePosts.filter((p) => isRecruitmentSarkariItem(p));
  const latestTwelveJobs =
    recruitmentPool.length >= 12
      ? recruitmentPool.slice(0, 12)
      : [
          ...recruitmentPool,
          ...verifiedVisiblePosts.filter((p) => !recruitmentPool.some((r) => r.id === p.id)),
        ].slice(0, 12);
  const educationPosts = verifiedVisiblePosts
    .filter((p) => isEducationSarkariItem(p))
    .slice(0, 6);
  const popularSchemes = GUIDE_ARTICLES.filter(
    (g) => g.category === 'Central Scheme' || g.category === 'State Services' || g.category === 'Identity & Tax'
  ).slice(0, 4);

  const featuredToolIds = ['image-compressor', 'passport-photo-maker', 'signature-resizer', 'pdf-merge'];
  const topTools = featuredToolIds
    .map((id) => TOOLS_LIST.find((t) => t.id === id))
    .filter((t): t is ToolItem => Boolean(t));

  const featuredServices = services.slice(0, 6);
  const waUrl = alertsConfig?.whatsappUrl || 'https://chat.whatsapp.com/GqeYfcw1sdN0EQtGvVR1fI';
  const telegramUrl = alertsConfig?.telegramUrl || '';

  const categoryCards = [
    { href: '/jobs', title: 'Jobs' },
    { href: '/jobs?tab=exams', title: 'Admit Card' },
    { href: '/jobs?tab=results', title: 'Results' },
    { href: '/jobs?tab=results&filter=answer_key', title: 'Answer Key' },
    { href: '/education', title: 'Admission' },
    { href: '/schemes', title: 'Schemes' },
    { href: '/tools', title: 'Tools' },
    { href: '/deadlines', title: 'News' },
  ];

  const closingSoonHtml =
    closingSoonDeadlines.length > 0
      ? `
    <section aria-label="Closing Today &amp; Soon" style="background:#FEF2F2; border:1px solid #FECACA; border-radius:12px; padding:10px 12px; margin-bottom:14px;">
      <div style="font-size:12px; font-weight:800; color:#E5484D; margin-bottom:6px;">Closing Soon:</div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        ${closingSoonDeadlines
          .map(
            (d) => `
          <a href="/post/${escapeHtml(d.item.id)}" style="background:#ffffff; border:1px solid #FECACA; border-radius:8px; padding:4px 8px; font-size:11px; font-weight:700; color:#101A36; text-decoration:none;">
            ${escapeHtml(d.institution)} · ${escapeHtml(d.daysRemaining === 0 ? 'Today' : `${d.daysRemaining}d left`)}
          </a>`
          )
          .join('')}
      </div>
    </section>`
      : '';

  return `
  <div style="min-height:100vh; background:#F4F6FB; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:14px; color:#101A36; line-height:1.5;">
  <header style="background:#ffffff; border-bottom:1px solid #E3E8F2; padding:12px 24px;">
    <div style="max-width:1180px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:16px;">
      <a href="/" style="display:inline-flex; align-items:center; gap:8px; font-size:17px; font-weight:800; color:#101A36; text-decoration:none;">CSC DOST</a>
      <nav aria-label="Primary sections" style="display:flex; flex-wrap:wrap; gap:14px; font-size:13px; font-weight:700;">
        <a href="/jobs" style="color:#2455E6; text-decoration:none;">Jobs</a>
        <a href="/jobs?tab=exams" style="color:#2455E6; text-decoration:none;">Admit Card</a>
        <a href="/jobs?tab=results" style="color:#2455E6; text-decoration:none;">Results</a>
        <a href="/education" style="color:#2455E6; text-decoration:none;">Admissions</a>
        <a href="/services" style="color:#2455E6; text-decoration:none;">Services</a>
        <a href="/tools" style="color:#2455E6; text-decoration:none;">Tools</a>
      </nav>
    </div>
  </header>
  <div style="max-width:1180px; margin:0 auto;">

  <main class="ssr-homepage-wrapper" style="padding:0 0 24px 0;">
    <section style="background:linear-gradient(135deg,#101A36,#1C2C66); color:#ffffff; padding:20px 14px 44px 14px;">
      <h1 style="font-size:21px; font-weight:800; line-height:1.25; margin:0 0 6px 0; color:#ffffff;">
        Every government update, <span style="color:#F59E0B;">one trusted place</span>
      </h1>
      <p style="font-size:13px; color:#CBD5E1; margin:0 0 12px 0;">
        J&amp;K and all-India jobs, results and CSC services.
      </p>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        <a href="/jobs?org=JKSSB" style="background:rgba(255,255,255,0.14); color:#ffffff; font-size:11px; font-weight:600; padding:4px 10px; border-radius:999px; text-decoration:none;">JKSSB</a>
        <a href="/jobs?org=SSC" style="background:rgba(255,255,255,0.14); color:#ffffff; font-size:11px; font-weight:600; padding:4px 10px; border-radius:999px; text-decoration:none;">SSC</a>
        <a href="/jobs?org=RRB" style="background:rgba(255,255,255,0.14); color:#ffffff; font-size:11px; font-weight:600; padding:4px 10px; border-radius:999px; text-decoration:none;">Railway</a>
        <a href="/jobs?org=Indian+Army" style="background:rgba(255,255,255,0.14); color:#ffffff; font-size:11px; font-weight:600; padding:4px 10px; border-radius:999px; text-decoration:none;">Army</a>
        <a href="/service/csc-pmkisan" style="background:rgba(255,255,255,0.14); color:#ffffff; font-size:11px; font-weight:600; padding:4px 10px; border-radius:999px; text-decoration:none;">PM-KISAN</a>
        <a href="/service/csc-aadhaar" style="background:rgba(255,255,255,0.14); color:#ffffff; font-size:11px; font-weight:600; padding:4px 10px; border-radius:999px; text-decoration:none;">Aadhaar</a>
      </div>
    </section>

    <div style="padding:0 12px;">
      <section aria-label="Highlights" style="margin-top:-32px; margin-bottom:14px; display:grid; grid-template-columns:repeat(4,1fr); gap:6px; text-align:center;">
        <div style="background:#ffffff; border:1px solid #E3E8F2; border-radius:12px; padding:8px 4px;"><strong style="display:block; font-size:12px;">1,200+</strong><span style="font-size:10px; color:#5B6478;">Vacancies</span></div>
        <div style="background:#ffffff; border:1px solid #E3E8F2; border-radius:12px; padding:8px 4px;"><strong style="display:block; font-size:12px;">Daily</strong><span style="font-size:10px; color:#5B6478;">Updates</span></div>
        <div style="background:#ffffff; border:1px solid #E3E8F2; border-radius:12px; padding:8px 4px;"><strong style="display:block; font-size:12px;">40+</strong><span style="font-size:10px; color:#5B6478;">Services</span></div>
        <div style="background:#ffffff; border:1px solid #E3E8F2; border-radius:12px; padding:8px 4px;"><strong style="display:block; font-size:12px;">Free</strong><span style="font-size:10px; color:#5B6478;">Alerts</span></div>
      </section>

      <section aria-labelledby="ssr-about-intro" style="background:#ffffff; border:1px solid #E3E8F2; border-radius:14px; padding:14px; margin-bottom:14px;">
        <h2 id="ssr-about-intro" style="font-size:15px; font-weight:800; margin:0 0 6px 0;">What CSC DOST Is</h2>
        <p style="font-size:13px; color:#475569; margin:0; line-height:1.6;">
          CSC DOST (www.cscdost.com) is an independent citizen-information and Common Services Center (CSC) facilitation portal for Jammu &amp; Kashmir and all-India applicants. We publish verified summaries of JKSSB, SSC, RRB, Indian Army, Kashmir University, Cluster University Srinagar, and IGNOU circulars alongside government welfare guides, citizen calculators, and browser-local document resizing tools.
        </p>
      </section>

      <section aria-label="Categories" style="margin-bottom:14px;">
        <h2 style="font-size:15px; font-weight:800; margin:0 0 8px 0;">Categories</h2>
        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px;">
          ${categoryCards
            .map(
              (card) => `
            <a href="${card.href}" style="display:block; text-align:center; background:#ffffff; border:1px solid #E3E8F2; border-radius:12px; padding:10px 4px; text-decoration:none; font-size:11px; font-weight:700; color:#101A36;">
              ${card.title}
            </a>`
            )
            .join('')}
        </div>
      </section>

      ${closingSoonHtml}

      <section aria-labelledby="ssr-recruitment-heading" style="background:#ffffff; border:1px solid #E3E8F2; border-radius:14px; padding:14px; margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h2 id="ssr-recruitment-heading" style="font-size:16px; font-weight:800; margin:0;">Latest 12 Job &amp; Recruitment Updates</h2>
          <a href="/jobs" style="font-size:12px; font-weight:700; color:#2455E6; text-decoration:none;">All Jobs →</a>
        </div>
        <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px;">
          ${latestTwelveJobs
            .map((post) => {
              const org = post.org || resolvePostOrg(post);
              return `
            <li style="border-bottom:1px solid #E3E8F2; padding-bottom:6px; display:flex; flex-wrap:wrap; justify-content:space-between; gap:6px;">
              <a href="/post/${escapeHtml(post.id)}" style="font-size:13px; font-weight:600; color:#101A36; text-decoration:none;">${escapeHtml(post.title)}</a>
              <span style="font-size:11px; color:#5B6478;">${escapeHtml(org)}${post.lastDate ? ` · Last date: ${escapeHtml(post.lastDate)}` : ''}</span>
            </li>`;
            })
            .join('')}
        </ul>
      </section>

      <section aria-labelledby="ssr-education-heading" style="background:#ffffff; border:1px solid #E3E8F2; border-radius:14px; padding:14px; margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h2 id="ssr-education-heading" style="font-size:15px; font-weight:800; margin:0;">Admissions, Exam Forms &amp; IGNOU</h2>
          <a href="/education" style="font-size:12px; font-weight:700; color:#2455E6; text-decoration:none;">All Education →</a>
        </div>
        <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:6px;">
          ${educationPosts
            .map(
              (post) => `
            <li style="border-bottom:1px solid #E3E8F2; padding-bottom:6px;">
              <a href="/post/${escapeHtml(post.id)}" style="font-size:13px; font-weight:600; color:#101A36; text-decoration:none;">${escapeHtml(post.title)}</a>
            </li>`
            )
            .join('')}
        </ul>
      </section>

      <section aria-labelledby="ssr-services-heading" style="margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h2 id="ssr-services-heading" style="font-size:15px; font-weight:800; margin:0;">CSC services</h2>
          <a href="/services" style="font-size:12px; font-weight:700; color:#2455E6; text-decoration:none;">All →</a>
        </div>
        <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:8px;">
          ${featuredServices
            .slice(0, 4)
            .map(
              (svc) => `
            <a href="/service/${escapeHtml(svc.id)}" style="background:#ffffff; border:1px solid #E3E8F2; border-radius:12px; padding:10px; text-decoration:none; font-size:12px; font-weight:700; color:#101A36;">
              ${escapeHtml(svc.name)}
            </a>`
            )
            .join('')}
        </div>
      </section>

      <section aria-labelledby="ssr-tools-heading" style="margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h2 id="ssr-tools-heading" style="font-size:15px; font-weight:800; margin:0;">Free tools</h2>
          <a href="/tools" style="font-size:12px; font-weight:700; color:#2455E6; text-decoration:none;">All →</a>
        </div>
        <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:8px;">
          ${topTools
            .map(
              (tool) => `
            <a href="/tools/${escapeHtml(tool.id)}" style="background:#ffffff; border:1px solid #E3E8F2; border-radius:12px; padding:10px; text-decoration:none; font-size:12px; font-weight:700; color:#101A36;">
              ${escapeHtml(tool.name)}
            </a>`
            )
            .join('')}
        </div>
      </section>

      <section aria-labelledby="ssr-schemes-heading" style="background:#ffffff; border:1px solid #E3E8F2; border-radius:14px; padding:14px; margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h2 id="ssr-schemes-heading" style="font-size:15px; font-weight:800; margin:0;">Featured Government Scheme Guides</h2>
          <a href="/schemes" style="font-size:12px; font-weight:700; color:#2455E6; text-decoration:none;">All Schemes →</a>
        </div>
        <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px;">
          ${popularSchemes
            .map(
              (guide) => `
            <li style="border-bottom:1px solid #E3E8F2; padding-bottom:8px;">
              <a href="/scheme/${escapeHtml(guide.id)}" style="font-size:13px; font-weight:700; color:#101A36; text-decoration:none; display:block; margin-bottom:2px;">${escapeHtml(guide.title)}</a>
              <span style="font-size:12px; color:#5B6478;">${escapeHtml(guide.summary)}</span>
            </li>`
            )
            .join('')}
        </ul>
      </section>

      <section aria-labelledby="ssr-operator-heading" style="background:#ffffff; border:1px solid #E3E8F2; border-radius:14px; padding:14px; margin-bottom:14px;">
        <h2 id="ssr-operator-heading" style="font-size:15px; font-weight:800; margin:0 0 6px 0;">Who runs this site</h2>
        <p style="font-size:13px; color:#334155; margin:0 0 6px 0; line-height:1.6;">
          CSC DOST is operated by <strong>Wasim Ahmad Khanday</strong>, Authorized Common Services Center Village Level Entrepreneur (<strong>CSC VLE ID: 212515670018</strong> · MSME: UDYAM-JK-01-0041957).
        </p>
        <p style="font-size:13px; color:#475569; margin:0;">
          Center Address: Sangran Qazigund, District Anantnag, Jammu &amp; Kashmir 192221 · Helpline Phone: <a href="tel:+917006833767" style="color:#2455E6; font-weight:600; text-decoration:none;">+91 70068 33767</a> · Email: <a href="mailto:support@cscdost.com" style="color:#2455E6; font-weight:600; text-decoration:none;">support@cscdost.com</a>.
        </p>
      </section>

      <section aria-labelledby="ssr-alerts-heading" style="background:#101A36; color:#ffffff; border-radius:14px; padding:16px; margin-bottom:14px;">
        <h2 id="ssr-alerts-heading" style="font-size:16px; font-weight:800; color:#ffffff; margin:0 0 4px 0;">
          Free instant alerts
        </h2>
        <p style="font-size:12px; color:#CBD5E1; margin:0 0 12px 0;">
          Join our WhatsApp group for daily job notices, results and J&amp;K updates.
        </p>
        <div style="display:flex; gap:8px;">
          <a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener noreferrer" style="background:#0F9D6B; color:#ffffff; font-weight:700; font-size:13px; padding:9px 14px; border-radius:10px; text-decoration:none;">WhatsApp</a>
          ${
            telegramUrl
              ? `<a href="${escapeHtml(telegramUrl)}" target="_blank" rel="noopener noreferrer" style="background:rgba(255,255,255,0.14); color:#ffffff; font-weight:700; font-size:13px; padding:9px 14px; border-radius:10px; text-decoration:none;">Telegram</a>`
              : `<span style="background:rgba(255,255,255,0.1); color:#CBD5E1; font-weight:700; font-size:12px; padding:9px 12px; border-radius:10px;">Telegram Coming soon</span>`
          }
        </div>
      </section>

      <footer style="background:#101A36; color:#E2E8F0; border-radius:14px; padding:14px; font-size:12px; line-height:1.6;">
        <p style="margin:0 0 6px 0; font-weight:700;">
          CSC DOST © ${new Date().getFullYear()} · Wasim Ahmad Khanday · VLE ID: 212515670018 · Sangran Qazigund, Anantnag, J&amp;K 192221 · +91 70068 33767
        </p>
        <p style="margin:0 0 6px 0; display:flex; flex-wrap:wrap; gap:10px;">
          <a href="/about-us" style="color:#ffffff; text-decoration:none;">About Us</a>
          <a href="/contact-us" style="color:#ffffff; text-decoration:none;">Contact Us</a>
          <a href="/privacy-policy" style="color:#ffffff; text-decoration:none;">Privacy Policy</a>
          <a href="/terms-of-service" style="color:#ffffff; text-decoration:none;">Terms of Service</a>
          <a href="/disclaimer" style="color:#ffffff; text-decoration:none;">Disclaimer</a>
          <a href="/refund-policy" style="color:#ffffff; text-decoration:none;">Refund Policy</a>
          <a href="/archive" style="color:#ffffff; text-decoration:none;">Notice Archive</a>
        </p>
        <p style="margin:0; font-size:11px; color:#CBD5E1;">
          CSC DOST is an independent portal, not an official government website. Always confirm details on the official notification.
        </p>
      </footer>
    </div>
  </main>
  </div>
  </div>
  `;
}

export function renderArchiveSubstantiveHtml(posts: SarkariItem[]): string {
  const archivedPosts = getDeduplicatedSarkariPosts(posts)
    .filter((p) => isPublishedSarkariItem(p) && isOlderThan12Months(p))
    .sort(
      (a, b) =>
        parseSarkariDateSortValue(b.postDate || b.documentDate) -
        parseSarkariDateSortValue(a.postDate || a.documentDate)
    );

  return `
  ${renderPrimaryCategoryNavHtml('jobs')}
  <main class="ssr-category-wrapper" style="max-width:1100px; margin:0 auto; padding:8px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:16px; color:#101A36; line-height:1.6;">
    <nav aria-label="Breadcrumb" style="font-size:14px; color:#475569; margin-bottom:16px;">
      <a href="/" style="color:#101A36; font-weight:600; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      <span style="color:#101A36; font-weight:700;">Notice Archive</span>
    </nav>

    <header style="border-bottom:1px solid #E2E8F0; padding-bottom:16px; margin-bottom:24px;">
      <h1 style="font-size:28px; font-weight:800; color:#101A36; margin:0 0 8px 0;">Archived Recruitment &amp; Exam Notices</h1>
      <p style="font-size:15px; color:#475569; margin:0 0 12px 0; max-width:850px;">
        Notifications older than 12 months are moved out of active job and education feeds into this historical archive while remaining accessible at their original URLs for candidate reference.
      </p>
      <div style="display:flex; flex-wrap:wrap; gap:10px; font-size:13px;">
        <a href="/jobs" style="color:#1F9D6B; font-weight:700; text-decoration:none;">Browse Active Recruitment →</a>
        <a href="/education" style="color:#1F9D6B; font-weight:700; text-decoration:none;">Browse Active Education Notices →</a>
        <a href="/deadlines" style="color:#1F9D6B; font-weight:700; text-decoration:none;">Upcoming Closing Deadlines →</a>
      </div>
    </header>

    <section style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:16px; margin-bottom:24px;">
      ${
        archivedPosts.length > 0
          ? archivedPosts
              .map(
                (post) => `
        <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:18px;">
          <div style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; margin-bottom:6px;">
            Archived · ${escapeHtml(post.org || resolvePostOrg(post))}
          </div>
          <h2 style="font-size:17px; font-weight:700; line-height:1.35; margin:0 0 8px 0;">
            <a href="/post/${escapeHtml(post.id)}" style="color:#101A36; text-decoration:none;">${escapeHtml(post.title)}</a>
          </h2>
          <p style="font-size:14px; color:#475569; line-height:1.5; margin:0 0 10px 0;">${escapeHtml(post.shortInfo || '')}</p>
          <div style="font-size:12px; color:#64748B; border-top:1px solid #F1F5F9; padding-top:8px;">
            Published: ${escapeHtml(post.postDate || 'Archived')} · Last Date: ${escapeHtml(post.lastDate || 'Closed')}
          </div>
        </article>`
              )
              .join('')
          : `<p style="font-size:15px; color:#475569;">No archived notices older than 12 months are currently listed.</p>`
      }
    </section>

    <section style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:18px; font-size:14px; color:#334155; line-height:1.65;">
      <h2 style="font-size:17px; font-weight:700; color:#101A36; margin:0 0 8px 0;">How CSC DOST Handles Older Circulars</h2>
      <p style="margin:0 0 8px 0;">
        To help citizens avoid applying to expired recruitments, CSC DOST automatically separates active notifications from closed circulars. Notices whose closing date passed more than 90 days ago carry a visible Closed banner, and notices older than 12 months are grouped on this archive route instead of homepage or active category feeds.
      </p>
      <p style="margin:0 0 8px 0;">
        Applicants checking historical advertisement numbers, past eligibility criteria, or old selection processes can still inspect every individual bulletin directly via its archived link above. However, online registration windows on those expired recruitments are closed and assisted filing requests are disabled.
      </p>
      <p style="margin:0;">
        Operated by Wasim Ahmad Khanday (Authorized CSC VLE ID: 212515670018, Sangran Qazigund, Anantnag, J&amp;K 192221). Always verify fresh cycles directly on the official issuing authority website before preparing any documents or fees.
      </p>
    </section>
  </main>
  `;
}

export function renderSchemeSubstantiveHtml(guide: GuideArticle): string {
  const safeTitle = escapeHtml(guide.title);
  const safeSummary = escapeHtml(guide.summary);
  const safeCategory = escapeHtml(guide.category);
  const safePortal = escapeHtml(guide.officialPortal);
  const safeOfficialUrl = escapeHtml(guide.officialUrl);
  const fallbackWithPortal = `As per official scheme guidelines (<a href="${safeOfficialUrl}" target="_blank" rel="noopener noreferrer" style="color:#1F9D6B; font-weight:600;">${safePortal}</a>)`;

  const faqSchemaJson =
    guide.faqs && guide.faqs.length > 0
      ? JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: guide.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }).replace(/</g, '\\u003c')
      : '';

  return `
  ${renderPrimaryCategoryNavHtml('schemes')}
  <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:12px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:16px; color:#101A36; line-height:1.65;">
    <nav aria-label="Breadcrumb" style="font-size:14px; color:#475569; margin-bottom:16px;">
      <a href="/" style="color:#101A36; font-weight:600; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      <a href="/schemes" style="color:#101A36; font-weight:600; text-decoration:none;">Government Schemes</a>
      <span style="margin:0 6px;">/</span>
      <span style="color:#101A36; font-weight:700;">${safeTitle}</span>
    </nav>

    ${
      guide.id === 'army-agniveer-rally-guide-2026'
        ? `<aside role="note" style="background:#FFFFFF; border:2px solid #D97706; padding:12px 16px; border-radius:10px; margin-bottom:14px; font-size:14px; font-weight:600; color:#101A36;">
      Last updated 13 Aug 2026. Confirm the latest details on the official site (<a href="https://joinindianarmy.nic.in" target="_blank" rel="noopener noreferrer" style="color:#1F9D6B; font-weight:700;">joinindianarmy.nic.in</a>).
    </aside>`
        : ''
    }

    <aside style="background:#FFFBEB; border-left:4px solid #F5A623; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:20px; font-size:14px; color:#101A36;">
      <strong>Independent Citizen Guide:</strong> CSC DOST (cscdost.com) is an independent portal, not a government website, operated by Wasim Ahmad Khanday (Authorized CSC VLE ID: 212515670018, Sangran Qazigund, Anantnag, J&amp;K 192221). This site does not guarantee scheme approval or benefit sanction. Always verify details on the official portal linked below.
    </aside>

    <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:14px; padding:24px;">
      <header style="border-bottom:1px solid #E2E8F0; padding-bottom:18px; margin-bottom:20px;">
        <span style="display:inline-block; background:#ECFDF5; color:#1F9D6B; border:1px solid #A7F3D0; font-size:12px; font-weight:700; text-transform:uppercase; padding:4px 10px; border-radius:6px; margin-bottom:10px;">
          ${safeCategory} · ${escapeHtml(guide.readTime)}
        </span>
        <h1 style="font-size:28px; line-height:1.3; font-weight:800; color:#101A36; margin:0 0 12px 0;">
          ${safeTitle}
        </h1>
        <p style="font-size:16px; color:#475569; margin:0 0 10px 0;">${safeSummary}</p>
        <div style="font-size:13px; color:#64748B;">
          <strong>Official Portal:</strong> ${safePortal} · <strong>Last Updated:</strong> ${escapeHtml(guide.lastUpdated)}
        </div>
      </header>

      <section style="background:#F6F8FC; border:1px solid #E2E8F0; border-radius:12px; padding:16px; margin-bottom:22px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 12px 0;">Scheme Summary</h2>
        <dl style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin:0; font-size:14px;">
          <div>
            <dt style="font-size:12px; color:#64748B; font-weight:600;">Department</dt>
            <dd style="margin:2px 0 0 0; font-weight:700; color:#101A36;">${guide.responsibleDepartment ? escapeHtml(guide.responsibleDepartment) : fallbackWithPortal}</dd>
          </div>
          <div>
            <dt style="font-size:12px; color:#64748B; font-weight:600;">Intended Beneficiaries</dt>
            <dd style="margin:2px 0 0 0; font-weight:700; color:#101A36;">${guide.intendedBeneficiaries ? escapeHtml(guide.intendedBeneficiaries) : fallbackWithPortal}</dd>
          </div>
          <div>
            <dt style="font-size:12px; color:#64748B; font-weight:600;">Benefit Amount / Scope</dt>
            <dd style="margin:2px 0 0 0; font-weight:700; color:#101A36;">${guide.benefitSummary ? escapeHtml(guide.benefitSummary) : fallbackWithPortal}</dd>
          </div>
          <div>
            <dt style="font-size:12px; color:#64748B; font-weight:600;">Applicable Region</dt>
            <dd style="margin:2px 0 0 0; font-weight:700; color:#101A36;">${guide.applicableRegion ? escapeHtml(guide.applicableRegion) : fallbackWithPortal}</dd>
          </div>
          <div>
            <dt style="font-size:12px; color:#64748B; font-weight:600;">Application Window / Deadline</dt>
            <dd style="margin:2px 0 0 0; font-weight:700; color:#101A36;">${fallbackWithPortal}</dd>
          </div>
          <div>
            <dt style="font-size:12px; color:#64748B; font-weight:600;">Official Fee</dt>
            <dd style="margin:2px 0 0 0; font-weight:700; color:#101A36;">${fallbackWithPortal}</dd>
          </div>
        </dl>
      </section>

      ${guide.sections
        .map(
          (sec) => `
      <section style="margin-bottom:22px;">
        <h2 style="font-size:20px; font-weight:700; color:#101A36; margin:0 0 8px 0;">${escapeHtml(sec.heading)}</h2>
        <p style="font-size:16px; color:#334155; margin:0 0 10px 0;">${escapeHtml(sec.content)}</p>
        ${
          sec.bulletPoints && sec.bulletPoints.length > 0
            ? `<ul style="padding-left:20px; margin:0; font-size:15px; color:#334155;">${sec.bulletPoints
                .map((bp) => `<li>${escapeHtml(bp)}</li>`)
                .join('')}</ul>`
            : ''
        }
      </section>
      `
        )
        .join('')}

      <section style="margin-bottom:22px;">
        <h2 style="font-size:20px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Eligibility Checklist</h2>
        <ul style="padding-left:20px; font-size:15px; color:#334155; margin:0;">
          ${guide.eligibility.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}
        </ul>
      </section>

      <section style="margin-bottom:22px;">
        <h2 style="font-size:20px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Documents Required</h2>
        <ul style="padding-left:20px; font-size:15px; color:#334155; margin:0;">
          ${guide.documentsRequired.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}
        </ul>
      </section>

      <section style="margin-bottom:24px;">
        <h2 style="font-size:20px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Step-by-Step Apply Guide</h2>
        <ol style="padding-left:20px; font-size:15px; color:#334155; margin:0;">
          ${guide.stepByStep.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
        </ol>
      </section>

      ${
        guide.faqs && guide.faqs.length > 0
          ? `
      <section style="margin-bottom:24px;">
        <h2 style="font-size:20px; font-weight:700; color:#101A36; margin:0 0 10px 0;">Frequently Asked Questions</h2>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${guide.faqs
            .map(
              (f) => `
          <details style="border:1px solid #E2E8F0; border-radius:10px; padding:12px;">
            <summary style="font-weight:700; color:#101A36; cursor:pointer;">${escapeHtml(f.question)}</summary>
            <p style="margin:8px 0 0 0; font-size:14px; color:#334155;">${escapeHtml(f.answer)}</p>
          </details>`
            )
            .join('')}
        </div>
      </section>
      `
          : ''
      }

      <section style="background:#F6F8FC; border:1px solid #E2E8F0; border-radius:12px; padding:18px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px;">
        <div>
          <div style="font-weight:700; font-size:16px; color:#101A36;">Official Authority Portal &amp; Assisted Filing</div>
          <div style="font-size:14px; color:#475569;">Verify details on ${safePortal} or contact Wasim Ahmad Khanday (+91 70068 33767).</div>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <a href="${safeOfficialUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#101A36; color:#ffffff; font-weight:700; font-size:14px; padding:10px 18px; border-radius:10px; text-decoration:none;">
            Official Portal ↗
          </a>
          <a href="/apply" style="display:inline-block; background:#1F9D6B; color:#ffffff; font-weight:700; font-size:14px; padding:10px 18px; border-radius:10px; text-decoration:none;">
            Need help applying? Contact us
          </a>
        </div>
      </section>
    </article>
    ${faqSchemaJson ? `<script type="application/ld+json">${faqSchemaJson}</script>` : ''}
  </main>
  `;
}

export function renderToolDetailSubstantiveHtml(tool: ToolItem): string {
  const safeName = escapeHtml(tool.name);
  const safeDesc = escapeHtml(tool.shortDescription);
  const safeCat = escapeHtml(tool.categoryLabel);
  const safeSpecs = escapeHtml(tool.specs || 'Local browser HTML5 Canvas / JavaScript processing');
  const usesPdfWorker = tool.id === 'pdf-compressor' || tool.id === 'pdf-to-image';

  return `
  ${renderPrimaryCategoryNavHtml('tools')}
  <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:12px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:16px; color:#101A36; line-height:1.65;">
    <nav aria-label="Breadcrumb" style="font-size:14px; color:#475569; margin-bottom:16px;">
      <a href="/" style="color:#101A36; font-weight:600; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      <a href="/tools" style="color:#101A36; font-weight:600; text-decoration:none;">Document Tools</a>
      <span style="margin:0 6px;">/</span>
      <span style="color:#101A36; font-weight:700;">${safeName}</span>
    </nav>

    <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:14px; padding:24px;">
      <header style="border-bottom:1px solid #E2E8F0; padding-bottom:18px; margin-bottom:20px;">
        <span style="display:inline-block; background:#ECFDF5; color:#1F9D6B; border:1px solid #A7F3D0; font-size:12px; font-weight:700; text-transform:uppercase; padding:4px 10px; border-radius:6px; margin-bottom:10px;">
          ${safeCat} · Processed Locally in Browser
        </span>
        <h1 style="font-size:28px; font-weight:800; color:#101A36; margin:0 0 10px 0;">${safeName}</h1>
        <p style="font-size:16px; color:#475569; margin:0;">${safeDesc}</p>
      </header>

      <section style="background:#F6F8FC; border:1px solid #E2E8F0; border-radius:10px; padding:16px; margin-bottom:16px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">How This Tool Works</h2>
        <p style="font-size:15px; color:#334155; margin:0 0 8px 0;">${safeDesc}</p>
        <p style="font-size:15px; color:#334155; margin:0;"><strong>Supported capabilities:</strong> ${safeSpecs}</p>
      </section>

      <section style="background:#ffffff; border:1px solid #E2E8F0; border-radius:10px; padding:16px; margin-bottom:16px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Step-by-Step Usage</h2>
        <ol style="padding-left:20px; font-size:15px; color:#334155; line-height:1.75; margin:0 0 10px 0;">
          <li>Select or drag your photograph, signature, or document file from your phone or computer.</li>
          <li>Choose the target dimensions, DPI, or file-size limit matching your JKSSB, SSC, RRB, or university portal circular.</li>
          <li>Preview the processed output right inside your browser to confirm clarity and legibility before saving.</li>
          <li>Download the optimized file directly to your device and verify its KB size on the official portal upload screen.</li>
        </ol>
        <p style="font-size:14px; color:#475569; margin:0;">
          Use <strong>${safeName}</strong> when government or university forms reject high-resolution camera photos, oversized scanned PDFs, or signatures outside strict width-to-height bounds. Because no registration or login is required, citizens and CSC operators can format files in seconds.
        </p>
      </section>

      <section style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:10px; padding:16px; margin-bottom:20px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Privacy &amp; Portal Compatibility Note</h2>
        <p style="font-size:15px; color:#334155; margin:0;">Files are processed in your browser using HTML5 Canvas and client-side JavaScript and are never uploaded to any external server. Operated by CSC DOST (Authorized CSC VLE ID: 212515670018, Sangran Qazigund, Anantnag, J&amp;K 192221) as a free citizen utility alongside our official recruitment, admission, and e-governance bulletins.</p>
        ${
          usesPdfWorker
            ? `<p style="font-size:13px; color:#334155; margin:8px 0 0 0;">Technical note: The open-source pdf.js worker script is loaded from cdnjs.cloudflare.com for local rendering while your PDF document itself never leaves your device.</p>`
            : ''
        }
      </section>

      <section style="margin-bottom:20px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 10px 0;">Frequently Asked Questions</h2>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <details style="border:1px solid #E2E8F0; border-radius:10px; padding:12px;">
            <summary style="font-weight:700; color:#101A36; cursor:pointer;">Are my photos or documents uploaded to CSC DOST servers?</summary>
            <p style="margin:8px 0 0 0; font-size:14px; color:#334155;">No. ${safeName} runs completely inside your local browser session, so personal IDs, photos, and signatures remain strictly on your own device.</p>
          </details>
          <details style="border:1px solid #E2E8F0; border-radius:10px; padding:12px;">
            <summary style="font-weight:700; color:#101A36; cursor:pointer;">Does ${safeName} work on Android phones and slower connections?</summary>
            <p style="margin:8px 0 0 0; font-size:14px; color:#334155;">Yes. Once the page loads, processing takes place offline in device memory without sending large images over mobile data.</p>
          </details>
          <details style="border:1px solid #E2E8F0; border-radius:10px; padding:12px;">
            <summary style="font-weight:700; color:#101A36; cursor:pointer;">Should I still verify portal upload rules before submitting my form?</summary>
            <p style="margin:8px 0 0 0; font-size:14px; color:#334155;">Yes. Recruitment boards and universities sometimes update pixel dimensions or KB caps in individual circulars. Always verify exact upload requirements on the official portal.</p>
          </details>
        </div>
      </section>

      <div style="display:flex; flex-wrap:wrap; gap:10px;">
        <a href="/tools" style="background:#101A36; color:#ffffff; font-weight:700; font-size:14px; padding:10px 18px; border-radius:10px; text-decoration:none;">Back to All Document Tools</a>
        <a href="/calculators" style="background:#1F9D6B; color:#ffffff; font-weight:700; font-size:14px; padding:10px 18px; border-radius:10px; text-decoration:none;">Citizen Calculators</a>
      </div>
    </article>
  </main>
  `;
}

export function renderCategorySubstantiveHtml(
  categoryType: 'jobs' | 'education' | 'ignou' | 'deadlines' | 'schemes' | 'services' | 'tools' | 'calculators' | 'apply' | 'track' | 'admin',
  posts: SarkariItem[],
  services: ServiceItem[]
): string {
  const dedupedPosts = getDeduplicatedSarkariPosts(posts);
  const verifiedPosts = dedupedPosts
    .filter((p) => {
      if (!isPublishedSarkariItem(p)) return false;
      if (isOlderThan12Months(p)) return false;
      const st = computeSarkariStatus(p);
      return st.verificationStatus !== 'needs_verification' && !p.isCancelled;
    })
    .sort(
      (a, b) =>
        parseSarkariDateSortValue(b.postDate || b.documentDate) -
        parseSarkariDateSortValue(a.postDate || a.documentDate)
    );

  if (categoryType === 'deadlines') {
    const activeDeadlines = getActiveClosingDeadlines(dedupedPosts, { includeAllActive: true });
    return `
    ${renderPrimaryCategoryNavHtml('jobs')}
    <main class="ssr-category-wrapper" style="max-width:1100px; margin:0 auto; padding:8px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:16px; color:#101A36; line-height:1.6;">
      <nav aria-label="Breadcrumb" style="font-size:14px; color:#475569; margin-bottom:16px;">
        <a href="/" style="color:#101A36; font-weight:600; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#101A36; font-weight:700;">Closing Deadlines</span>
      </nav>

      <header style="border-bottom:1px solid #E2E8F0; padding-bottom:16px; margin-bottom:24px;">
        <h1 style="font-size:28px; font-weight:800; color:#101A36; margin:0 0 8px 0;">Closing Deadlines – Jobs &amp; Education</h1>
        <p style="font-size:16px; color:#475569; margin:0; max-width:850px;">
          Active recruitment forms, university admissions, exam forms, and assignment submission deadlines sorted soonest first (Asia/Kolkata time).
        </p>
      </header>

      <section style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:16px;">
        ${activeDeadlines
          .map((d) => {
            const daysText = d.daysRemaining === 0 ? 'Closes today' : `${d.daysRemaining}d left`;
            return `
          <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px; font-size:12px; font-weight:700;">
                <span style="color:#475569; text-transform:uppercase;">${escapeHtml(d.institution)}</span>
                <span style="color:#B45309;">${escapeHtml(daysText)} · ${escapeHtml(d.closingDate)}${d.closingTime ? ` (${escapeHtml(d.closingTime)})` : ''}</span>
              </div>
              <h2 style="font-size:16px; font-weight:700; line-height:1.35; margin:0 0 8px 0;">
                <a href="/post/${escapeHtml(d.item.id)}" style="color:#101A36; text-decoration:none;">${escapeHtml(d.item.title)}</a>
              </h2>
            </div>
            <div style="border-top:1px solid #F1F5F9; padding-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:13px;">
              <span style="color:#475569;">${d.section === 'education' ? 'Education' : 'Jobs'}</span>
              <a href="/post/${escapeHtml(d.item.id)}" style="color:#1F9D6B; font-weight:700; text-decoration:none;">View Details →</a>
            </div>
          </article>`;
          })
          .join('')}
      </section>
    </main>
    `;
  }

  if (categoryType === 'jobs') {
    const jobPosts = verifiedPosts.filter((p) => isRecruitmentSarkariItem(p));

    return `
    ${renderPrimaryCategoryNavHtml('jobs')}
    <main class="ssr-category-wrapper" style="max-width:1100px; margin:0 auto; padding:8px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:16px; color:#101A36; line-height:1.6;">
      <nav aria-label="Breadcrumb" style="font-size:14px; color:#475569; margin-bottom:16px;">
        <a href="/" style="color:#101A36; font-weight:600; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#101A36; font-weight:700;">Jobs &amp; Recruitment</span>
      </nav>

      <header style="border-bottom:1px solid #E2E8F0; padding-bottom:16px; margin-bottom:24px;">
        <h1 style="font-size:28px; font-weight:800; color:#101A36; margin:0 0 8px 0;">Jobs &amp; Recruitment</h1>
        <p style="font-size:16px; color:#475569; margin:0; max-width:850px;">
          Latest JKSSB, Banking, Indian Army, SSC and RRB recruitment notifications, eligibility rules and closing dates on CSC DOST.
        </p>
      </header>

      <section style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:18px; margin-bottom:20px;">
        ${jobPosts.map(post => {
          const st = computeSarkariStatus(post);
          const urgent = st.isUrgentUnder7Days;
          return `
          <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:11px; font-weight:700; color:#101A36; background:#F6F8FC; border:1px solid #E2E8F0; padding:3px 8px; border-radius:4px; text-transform:uppercase;">
                  ${escapeHtml(post.category?.replace(/_/g, ' '))}
                </span>
                <span style="font-size:12px; color:${urgent ? '#B91C1C' : st.canApplyOnline ? '#1F9D6B' : '#475569'}; font-weight:700;">${escapeHtml(st.badgeLabel)}</span>
              </div>
              <h2 style="font-size:17px; font-weight:700; line-height:1.35; margin:0 0 8px 0;">
                <a href="/post/${escapeHtml(post.id)}" style="color:#101A36; text-decoration:none;">
                  ${escapeHtml(post.title)}
                </a>
              </h2>
              <p style="font-size:14px; color:#475569; line-height:1.5; margin:0 0 12px 0;">
                ${escapeHtml((post.shortInfo || '').slice(0, 120))}...
              </p>
            </div>
            <div style="border-top:1px solid #F1F5F9; padding-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:13px;">
              <span style="color:#475569;">${post.lastDate ? `Last Date: <strong>${escapeHtml(post.lastDate)}</strong>` : `Vacancies: <strong>${escapeHtml(post.totalPosts || 'Open')}</strong>`}</span>
              <a href="/post/${escapeHtml(post.id)}" style="color:#1F9D6B; font-weight:700; text-decoration:none;">
                View Details →
              </a>
            </div>
          </article>
        `;
        }).join('')}
      </section>
      <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; font-size:14px;">
        <span>Looking for recruitment circulars older than 12 months?</span>
        <a href="/archive" style="color:#1F9D6B; font-weight:700; text-decoration:none;">View archived notices (12+ months old) →</a>
      </div>
    </main>
    `;
  }

  if (categoryType === 'ignou') {
    const ignouPosts = verifiedPosts.filter((p) => isIgnouItem(p));

    return `
    ${renderPrimaryCategoryNavHtml('education')}
    <main class="ssr-category-wrapper" style="max-width:1100px; margin:0 auto; padding:8px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:16px; color:#101A36; line-height:1.6;">
      <nav aria-label="Breadcrumb" style="font-size:14px; color:#475569; margin-bottom:16px;">
        <a href="/" style="color:#101A36; font-weight:600; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <a href="/education" style="color:#101A36; font-weight:600; text-decoration:none;">Education &amp; Admissions</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#101A36; font-weight:700;">IGNOU</span>
      </nav>

      <header style="border-bottom:1px solid #E2E8F0; padding-bottom:16px; margin-bottom:24px;">
        <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:700; color:#101A36; background:#F6F8FC; border:1px solid #E2E8F0; padding:4px 10px; border-radius:6px; text-transform:uppercase;">
            Education &amp; Admissions · IGNOU (${ignouPosts.length} Notices)
          </span>
          <a href="/education" style="font-size:14px; font-weight:700; color:#1F9D6B; text-decoration:none;">← Back to Education &amp; Admissions</a>
        </div>
        <h1 style="font-size:28px; font-weight:800; color:#101A36; margin:0 0 8px 0;">IGNOU Latest Notifications</h1>
        <p style="font-size:16px; color:#475569; margin:0 0 12px 0; max-width:850px;">
          Find IGNOU admission, re-registration, assignment, exam form, datesheet, hall ticket and result updates with official links on CSC DOST.
        </p>
        <div style="font-size:14px; color:#101A36; background:#F6F8FC; border:1px solid #E2E8F0; border-radius:8px; padding:10px 14px;">
          <strong>Learner Streams Covered:</strong> ODL (Open &amp; Distance Learning) · Online Programmes · GOAL · E-Vidya Bharti · Regional Centre Srinagar
        </div>
      </header>

      <section style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:18px;">
        ${ignouPosts.map(post => {
          const st = computeSarkariStatus(post);
          return `
          <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
                <span style="font-size:11px; font-weight:700; color:#101A36; background:#F6F8FC; border:1px solid #E2E8F0; padding:3px 8px; border-radius:4px; text-transform:uppercase;">
                  IGNOU${post.learnerGroup ? ` · ${escapeHtml(post.learnerGroup)}` : ''}
                </span>
                <span style="font-size:12px; color:${post.isTentative ? '#92400E' : st.isUrgentUnder7Days ? '#B91C1C' : st.canApplyOnline ? '#1F9D6B' : '#101A36'}; font-weight:700;">
                  ${escapeHtml(post.isTentative ? 'Tentative' : st.badgeLabel)}
                </span>
              </div>
              <h2 style="font-size:17px; font-weight:700; line-height:1.35; margin:0 0 8px 0;">
                <a href="/post/${escapeHtml(post.id)}" style="color:#101A36; text-decoration:none;">
                  ${escapeHtml(post.title)}
                </a>
              </h2>
              <p style="font-size:14px; color:#475569; line-height:1.5; margin:0 0 12px 0;">
                ${escapeHtml((post.shortInfo || '').slice(0, 130))}...
              </p>
            </div>
            <div style="border-top:1px solid #F1F5F9; padding-top:12px; display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; font-size:13px;">
              <span style="color:#475569;">
                ${post.lastDate ? `Due / Schedule: <strong>${escapeHtml(post.lastDate)}</strong>` : `Date: <strong>${escapeHtml(post.documentDate || post.postDate)}</strong>`}
              </span>
              <div style="display:flex; gap:10px; align-items:center;">
                <a href="${escapeHtml(post.officialLink)}" target="_blank" rel="noopener noreferrer" style="color:#101A36; font-weight:600; text-decoration:none;">Official Link ↗</a>
                <a href="/post/${escapeHtml(post.id)}" style="color:#1F9D6B; font-weight:700; text-decoration:none;">View Details →</a>
              </div>
            </div>
          </article>
        `;
        }).join('')}
      </section>
    </main>
    `;
  }

  if (categoryType === 'education') {
    const eduPosts = verifiedPosts.filter((p) => isEducationSarkariItem(p));
    const ignouCount = eduPosts.filter((p) => isIgnouItem(p)).length;

    return `
    ${renderPrimaryCategoryNavHtml('education')}
    <main class="ssr-category-wrapper" style="max-width:1100px; margin:0 auto; padding:8px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:16px; color:#101A36; line-height:1.6;">
      <nav aria-label="Breadcrumb" style="font-size:14px; color:#475569; margin-bottom:16px;">
        <a href="/" style="color:#101A36; font-weight:600; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#101A36; font-weight:700;">Education &amp; Admissions</span>
      </nav>

      <header style="border-bottom:1px solid #E2E8F0; padding-bottom:16px; margin-bottom:24px;">
        <h1 style="font-size:28px; font-weight:800; color:#101A36; margin:0 0 8px 0;">Education &amp; Admissions</h1>
        <p style="font-size:16px; color:#475569; margin:0 0 14px 0; max-width:850px;">
          Official University of Kashmir, Cluster University Srinagar and IGNOU admissions, re-registration, examination forms, date sheets and scholarship notices.
        </p>
        <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:10px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <span style="font-size:14px; color:#101A36;">
            <strong>IGNOU Student Corner:</strong> ODL, Online, GOAL &amp; E-Vidya Bharti circulars (${ignouCount} notices)
          </span>
          <a href="/education/ignou" style="font-size:14px; font-weight:700; color:#1F9D6B; text-decoration:none;">IGNOU Latest Notifications →</a>
        </div>
      </header>

      <section style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:18px; margin-bottom:20px;">
        ${eduPosts.map(post => {
          const st = computeSarkariStatus(post);
          return `
          <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:11px; font-weight:700; color:#101A36; background:#F6F8FC; border:1px solid #E2E8F0; padding:3px 8px; border-radius:4px; text-transform:uppercase;">
                  ${escapeHtml(isIgnouItem(post) ? 'IGNOU' : post.category?.replace(/_/g, ' '))}
                </span>
                <span style="font-size:12px; color:#101A36; font-weight:600;">${post.lastDate ? `Date: ${escapeHtml(post.lastDate)}` : `Published: ${escapeHtml(post.postDate)}`}</span>
              </div>
              <h2 style="font-size:17px; font-weight:700; line-height:1.35; margin:0 0 8px 0;">
                <a href="/post/${escapeHtml(post.id)}" style="color:#101A36; text-decoration:none;">
                  ${escapeHtml(post.title)}
                </a>
              </h2>
              <p style="font-size:14px; color:#475569; line-height:1.5; margin:0 0 12px 0;">
                ${escapeHtml((post.shortInfo || '').slice(0, 120))}...
              </p>
            </div>
            <div style="border-top:1px solid #F1F5F9; padding-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:13px;">
              <span style="color:${st.isUrgentUnder7Days ? '#B91C1C' : st.canApplyOnline ? '#1F9D6B' : '#475569'}; font-weight:700;">${escapeHtml(st.badgeLabel)}</span>
              <a href="/post/${escapeHtml(post.id)}" style="color:#1F9D6B; font-weight:700; text-decoration:none;">
                View Details →
              </a>
            </div>
          </article>
        `;
        }).join('')}
      </section>
      <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; font-size:14px;">
        <span>Looking for older university or exam notices (12+ months old)?</span>
        <a href="/archive" style="color:#1F9D6B; font-weight:700; text-decoration:none;">View archived notices (12+ months old) →</a>
      </div>
    </main>
    `;
  }

  if (categoryType === 'schemes') {
    const schemeServices = services.filter(
      s =>
        s.category?.toLowerCase().includes('scheme') ||
        s.id === 'jk-ladli-beti' ||
        s.id === 'jk-pension-isss' ||
        s.id.includes('kisan') ||
        s.id.includes('ayushman') ||
        s.id.includes('golden')
    );

    return `
    ${renderPrimaryCategoryNavHtml('schemes')}
    <main class="ssr-category-wrapper" style="max-width:1100px; margin:0 auto; padding:8px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:16px; color:#101A36; line-height:1.6;">
      <nav aria-label="Breadcrumb" style="font-size:14px; color:#475569; margin-bottom:16px;">
        <a href="/" style="color:#101A36; font-weight:600; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#101A36; font-weight:700;">Government Schemes</span>
      </nav>

      <header style="border-bottom:1px solid #E2E8F0; padding-bottom:16px; margin-bottom:24px;">
        <h1 style="font-size:28px; font-weight:800; color:#101A36; margin:0 0 8px 0;">Government Schemes &amp; Citizen Guides</h1>
        <p style="font-size:16px; color:#475569; margin:0 0 10px 0; max-width:850px;">
          Eligibility criteria, document checklists and application guides for PM-KISAN, Ayushman Bharat PM-JAY and citizen welfare programs.
        </p>
        <p style="font-size:14px; color:#475569; margin:0; max-width:850px;">
          For J&amp;K state welfare facilitation, see <a href="/service/jk-ladli-beti" style="color:#1F9D6B; font-weight:700; text-decoration:underline;">Ladli Beti &amp; State Marriage Assistance Scheme</a> and <a href="/service/jk-pension-isss" style="color:#1F9D6B; font-weight:700; text-decoration:underline;">JK-ISSS &amp; GOI NSAP Social Pension Sanction</a>.
        </p>
      </header>

      <section style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px; margin-bottom:28px;">
        ${GUIDE_ARTICLES.map(g => `
          <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:18px;">
            <div style="font-size:11px; font-weight:700; color:#1F9D6B; text-transform:uppercase; margin-bottom:6px;">${escapeHtml(g.category)} · ${escapeHtml(g.readTime)}</div>
            <h2 style="font-size:17px; font-weight:700; color:#101A36; margin:0 0 8px 0;">
              <a href="/scheme/${escapeHtml(g.id)}" style="color:#101A36; text-decoration:none;">${escapeHtml(g.title)}</a>
            </h2>
            <p style="font-size:14px; color:#475569; line-height:1.5; margin:0 0 12px 0;">${escapeHtml(g.summary.slice(0, 120))}...</p>
            <a href="/scheme/${escapeHtml(g.id)}" style="color:#1F9D6B; font-size:13px; font-weight:700; text-decoration:none;">Read Full Scheme Guide →</a>
          </article>
        `).join('')}
      </section>

      ${schemeServices.length > 0 ? `
      <section style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px;">
        ${schemeServices.map(s => `
          <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:18px;">
            <div style="font-size:11px; font-weight:700; color:#1F9D6B; text-transform:uppercase; margin-bottom:4px;">${escapeHtml(s.category)}</div>
            <h2 style="font-size:16px; font-weight:700; color:#101A36; margin:0 0 6px 0;">
              <a href="/service/${escapeHtml(s.id)}" style="color:#101A36; text-decoration:none;">${escapeHtml(s.name)}</a>
            </h2>
            <p style="font-size:14px; color:#475569; line-height:1.4; margin:0 0 10px 0;">${escapeHtml(s.description)}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; border-top:1px solid #F1F5F9; padding-top:10px;">
              <span style="font-weight:700; color:#101A36;">${escapeHtml(s.price?.trim() || 'Ask us')}</span>
              <a href="/service/${escapeHtml(s.id)}" style="color:#1F9D6B; font-weight:700; text-decoration:none;">View Service Details →</a>
            </div>
          </article>
        `).join('')}
      </section>
      ` : ''}
    </main>
    `;
  }

  if (categoryType === 'services') {
    return `
    ${renderPrimaryCategoryNavHtml('services')}
    <main class="ssr-category-wrapper" style="max-width:1100px; margin:0 auto; padding:8px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:16px; color:#101A36; line-height:1.6;">
      <nav aria-label="Breadcrumb" style="font-size:14px; color:#475569; margin-bottom:16px;">
        <a href="/" style="color:#101A36; font-weight:600; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#101A36; font-weight:700;">CSC E-Services</span>
      </nav>

      <header style="border-bottom:1px solid #E2E8F0; padding-bottom:16px; margin-bottom:20px;">
        <h1 style="font-size:28px; font-weight:800; color:#101A36; margin:0 0 8px 0;">CSC E-Services</h1>
        <p style="font-size:16px; color:#475569; margin:0 0 10px 0; max-width:850px;">
          Complete directory of assisted citizen e-services: PAN card registration, Aadhaar assistance, J&amp;K domicile certificates, income certificates and document services.
        </p>
        <p style="font-size:14px; font-weight:600; color:#92400E; background:#FFFBEB; border:1px solid #FDE68A; padding:10px 14px; border-radius:8px; margin:0;">
          Final charges depend on the service and any government fee. Please confirm before applying.
        </p>
      </header>

      <section style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px;">
        ${services.map(s => {
          const docs = Array.isArray(s.requirements) && s.requirements.length > 0 ? s.requirements.join(', ') : 'Ask us';
          const fee = s.price && s.price.trim() ? s.price.trim() : 'Ask us';
          const feeHtml = Array.isArray(s.feeLines) && s.feeLines.length > 0
            ? s.feeLines.map(line => `<div>${escapeHtml(line)}</div>`).join('')
            : escapeHtml(fee);
          const waHref = `https://wa.me/917006833767?text=${encodeURIComponent(`Hello Wasim Ahmad Khanday (CSC DOST), I would like to enquire about ${s.name}`)}`;
          return `
          <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:18px; display:flex; flex-direction:column; justify-content:space-between; gap:10px;">
            <div>
              <div style="font-size:11px; font-weight:700; color:#1F9D6B; text-transform:uppercase; margin-bottom:4px;">${escapeHtml(s.category)}</div>
              <h2 style="font-size:17px; font-weight:700; color:#101A36; margin:0 0 6px 0;">
                <a href="/service/${escapeHtml(s.id)}" style="color:#101A36; text-decoration:none;">${escapeHtml(s.name)}</a>
              </h2>
              <p style="font-size:14px; color:#475569; line-height:1.45; margin:0 0 8px 0;">${escapeHtml(s.description)}</p>
              <div style="font-size:13px; color:#334155; margin-bottom:4px;"><strong>Documents needed:</strong> ${escapeHtml(docs)}</div>
              ${s.estimatedTime && s.estimatedTime.trim() ? `<div style="font-size:13px; color:#334155; margin-bottom:4px;"><strong>Typical time:</strong> ${escapeHtml(s.estimatedTime.trim())}</div>` : ''}
              <div style="font-size:13px; font-weight:700; color:#101A36;"><strong>Fee:</strong> ${feeHtml}</div>
            </div>
            <div style="border-top:1px solid #F1F5F9; padding-top:10px; display:flex; flex-wrap:wrap; gap:8px; font-size:13px;">
              <a href="${escapeHtml(waHref)}" target="_blank" rel="noopener noreferrer" style="background:#1F9D6B; color:#ffffff; padding:6px 10px; border-radius:8px; font-weight:700; text-decoration:none;">Enquire on WhatsApp</a>
              <a href="tel:+917006833767" style="background:#101A36; color:#ffffff; padding:6px 10px; border-radius:8px; font-weight:700; text-decoration:none;">Call +91 70068 33767</a>
            </div>
          </article>
        `;
        }).join('')}
      </section>
    </main>
    `;
  }

  if (categoryType === 'tools') {
    return `
    ${renderPrimaryCategoryNavHtml('tools')}
    <main class="ssr-category-wrapper" style="max-width:1100px; margin:0 auto; padding:8px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:16px; color:#101A36; line-height:1.6;">
      <nav aria-label="Breadcrumb" style="font-size:14px; color:#475569; margin-bottom:16px;">
        <a href="/" style="color:#101A36; font-weight:600; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#101A36; font-weight:700;">Document Tools</span>
      </nav>

      <header style="border-bottom:1px solid #E2E8F0; padding-bottom:16px; margin-bottom:24px;">
        <h1 style="font-size:28px; font-weight:800; color:#101A36; margin:0 0 8px 0;">Document Tools</h1>
        <p style="font-size:16px; color:#475569; margin:0; max-width:850px;">
          Free browser-based photo resizers, signature crop tools, PDF compressors and image converters processed 100% locally on your device.
        </p>
      </header>

      <section style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:18px; margin-bottom:24px;">
        ${TOOLS_LIST
          .map(
            (t) => `
          <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:20px;">
            <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">
              <a href="/tools/${escapeHtml(t.id)}" style="color:#101A36; text-decoration:none;">${escapeHtml(t.name)}</a>
            </h2>
            <p style="font-size:14px; color:#475569; line-height:1.5; margin:0 0 12px 0;">${escapeHtml(t.shortDescription)}</p>
            <a href="/tools/${escapeHtml(t.id)}" style="font-size:14px; font-weight:700; color:#1F9D6B; text-decoration:none;">Open Tool →</a>
          </article>
        `
          )
          .join('')}
      </section>

      <section style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:18px; font-size:14px; color:#334155;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Browser-Local Privacy &amp; Document Preparation Tips</h2>
        <p style="margin:0 0 8px 0;">
          All CSC DOST document utilities run inside your device browser using HTML5 Canvas and client-side PDF routines. Your photographs, signatures, domicile certificates, and marksheets stay strictly on your own phone or computer.
        </p>
        <p style="margin:0;">
          Before uploading files on JKSSB, SSC, RRB, Kashmir University, or IGNOU portals, double-check the exact KB range and pixel width/height noted in your target recruitment notification. Need fee or age checks too? Visit <a href="/calculators" style="color:#1F9D6B; font-weight:700; text-decoration:none;">Citizen Calculators →</a>.
        </p>
      </section>
    </main>
    `;
  }

  if (categoryType === 'calculators') {
    return `
    ${renderPrimaryCategoryNavHtml('calculators')}
    <main class="ssr-category-wrapper" style="max-width:1100px; margin:0 auto; padding:8px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#101A36; line-height:1.6;">
      <nav aria-label="Breadcrumb" style="font-size:14px; color:#475569; margin-bottom:16px;">
        <a href="/" style="color:#101A36; font-weight:600; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#101A36; font-weight:700;">Citizen Calculators</span>
      </nav>

      <header style="border-bottom:1px solid #E2E8F0; padding-bottom:16px; margin-bottom:20px;">
        <h1 style="font-size:28px; font-weight:800; color:#101A36; margin:0 0 8px 0;">Citizen Calculators</h1>
        <p style="font-size:16px; color:#475569; margin:0 0 10px 0; max-width:850px;">
          Check recruitment age against cutoff dates, inspect photo and signature dimensions locally, and review indicative CSC service fees.
        </p>
        <p style="font-size:14px; font-weight:600; color:#92400E; background:#FFFBEB; border:1px solid #FDE68A; padding:10px 14px; border-radius:8px; margin:0;">
          Rates &amp; benchmarks as of 2026-01-01 (Age Calculator) or without verification date recorded (Fee &amp; Portal Presets) — confirm with the official source before applying.
        </p>
      </header>

      <section style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:18px; margin-bottom:24px;">
        <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:20px;">
          <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Recruitment Age Eligibility Calculator</h2>
          <p style="font-size:14px; color:#475569; line-height:1.5; margin:0;">
            Calculates exact calendar years, months, and days against cutoff dates (default 2026-01-01) plus reference category age ceilings for Open Merit, SC, ST, RBA, OBC, and EWS candidates.
          </p>
        </article>
        <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:20px;">
          <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Photo &amp; Signature Spec Inspector</h2>
          <p style="font-size:14px; color:#475569; line-height:1.5; margin:0;">
            Reads pixel dimensions, aspect ratio, and KB file size locally in your browser without uploading personal images to any remote server.
          </p>
        </article>
        <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:20px;">
          <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">CSC Regulated Fee Breakdown</h2>
          <p style="font-size:14px; color:#475569; line-height:1.5; margin:0;">
            Shows recorded statutory departmental fee and facilitation charge ranges. Always confirm current rates with the official source before applying.
          </p>
        </article>
      </section>

      <section style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:20px; margin-bottom:20px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 10px 0;">How to Use Citizen Calculators</h2>
        <ol style="padding-left:20px; font-size:14px; color:#334155; line-height:1.75; margin:0;">
          <li><strong>Age Eligibility Calculator:</strong> Enter your Date of Birth from your Matriculation certificate and select the exact cutoff date printed in the JKSSB, SSC, RRB, or Army advertisement.</li>
          <li><strong>Photo &amp; Signature Spec Inspector:</strong> Select your prepared JPG/PNG image to inspect its exact dimensions in pixels and file size in kilobytes before uploading to an exam portal.</li>
          <li><strong>CSC Fee Estimator:</strong> Select a citizen service category to view indicative government treasury charges and facilitation fee components before visiting our desk.</li>
        </ol>
      </section>

      <section style="margin-bottom:20px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 10px 0;">Frequently Asked Questions</h2>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <details style="border:1px solid #E2E8F0; border-radius:10px; padding:12px; background:#ffffff;">
            <summary style="font-weight:700; color:#101A36; cursor:pointer;">Does the Age Calculator replace official notification cutoff rules?</summary>
            <p style="margin:8px 0 0 0; font-size:14px; color:#334155;">No. Always check the exact lower and upper birth-date brackets ("not born before / not born after") printed inside the official recruitment PDF, especially when relaxation or ex-serviceman rules apply.</p>
          </details>
          <details style="border:1px solid #E2E8F0; border-radius:10px; padding:12px; background:#ffffff;">
            <summary style="font-weight:700; color:#101A36; cursor:pointer;">Are images checked by the Photo &amp; Signature Spec Inspector uploaded anywhere?</summary>
            <p style="margin:8px 0 0 0; font-size:14px; color:#334155;">No. Inspection occurs locally inside your web browser memory without sending files to CSC DOST servers.</p>
          </details>
          <details style="border:1px solid #E2E8F0; border-radius:10px; padding:12px; background:#ffffff;">
            <summary style="font-weight:700; color:#101A36; cursor:pointer;">Can I resize a photograph right after checking its dimensions?</summary>
            <p style="margin:8px 0 0 0; font-size:14px; color:#334155;">Yes. Open our <a href="/tools" style="color:#1F9D6B; font-weight:600;">Document Tools</a> suite to resize passport photos, crop signatures, or compress PDFs locally.</p>
          </details>
        </div>
      </section>
    </main>
    `;
  }

  if (categoryType === 'admin') {
    return `
    <main class="ssr-category-wrapper" style="max-width:720px; margin:0 auto; padding:32px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a;">
      <h1 style="font-size:24px; font-weight:800; margin:0 0 10px 0;">CSC DOST Staff Portal</h1>
      <p style="font-size:14px; color:#475569;">Authorized operator login required.</p>
    </main>
    `;
  }

  // Apply or Track transactional pages (marked noindex in meta)
  return `
  <main class="ssr-category-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.6;">
    <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
      <a href="/" style="color:#1e56c8; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      <span style="color:#0f172a; font-weight:600;">${categoryType === 'apply' ? 'Assisted Application Desk' : 'Track Application Status'}</span>
    </nav>
    <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px;">
      <h1 style="font-size:26px; font-weight:800; color:#0f172a; margin:0 0 10px 0;">
        ${categoryType === 'apply' ? 'Assisted Online Application Desk' : 'Track Application Status'}
      </h1>
      <p style="font-size:15px; color:#475569; line-height:1.7;">
        ${categoryType === 'apply' ? 'Submit an assisted form request to the CSC DOST facilitation desk in Sangran Qazigund, Anantnag.' : 'Check your CSC DOST application processing progress and payment status using your tracking token.'}
      </p>
      <div style="margin-top:20px;">
        <a href="/" style="display:inline-block; background:#1e56c8; color:#ffffff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
          Return to Homepage
        </a>
      </div>
    </article>
  </main>
  `;
}

export function renderNotFoundSubstantiveHtml(requestedPath: string): string {
  const safePath = escapeHtml(requestedPath);
  return `
  <main class="ssr-not-found-wrapper" style="min-height:70vh; display:flex; align-items:center; justify-content:center; padding:40px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; background:#f8fafc;">
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; max-width:540px; padding:36px; text-align:center; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="font-size:48px; margin-bottom:12px;">📋</div>
      <h1 style="font-size:24px; font-weight:800; color:#0f172a; margin:0 0 10px 0;">Page or Notification Not Found (404)</h1>
      <p style="color:#64748b; font-size:14px; line-height:1.6; margin:0 0 20px 0;">
        The requested address <code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:13px; color:#0f172a;">${safePath}</code> does not exist or may have expired after the recruitment closing date.
      </p>
      <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
        <a href="/" style="display:inline-block; background:#2563eb; color:#ffffff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
          Return to Homepage
        </a>
        <a href="/jobs" style="display:inline-block; background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
          Latest Sarkari Jobs
        </a>
      </div>
    </div>
  </main>
  `;
}
