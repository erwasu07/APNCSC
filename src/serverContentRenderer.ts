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
import { PUBLISHED_GUIDE_ARTICLES as GUIDE_ARTICLES, GuideArticle } from './data/guidesData';
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
  resolvePostPdfUrl,
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
import {
  deriveStoredServiceFacts,
  getClusterForServiceId,
  isNonPlaceholderFeeNote,
  isValidHttpUrl,
  hasExplicitContent,
  hasExplicitList,
  type ServiceClusterHubOverride,
  type ServiceClusterSuggestion,
} from './utils/serviceMetadata';

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
  const pdfUrl = resolvePostPdfUrl(item, portalUrl);

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
    <aside style="background:#fffbeb; border-left:4px solid #f59e0b; padding:10px 14px; border-radius:0 8px 8px 0; margin-bottom:18px; font-size:13px; color:#92400e;">
      <strong>Independent Summary (${safeOrg}):</strong> Verify "${safeTitle}" directly on <a href="${safeOfficialLink}" target="_blank" rel="noopener noreferrer" style="color:#92400e; font-weight:700;">${escapeHtml(enrichment.sourceDomain)}</a>.
    </aside>
    ${isStale90 ? `
    <aside role="status" style="background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #dc2626; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:20px; font-size:14px; color:#7f1d1d;">
      <strong>Closed (${escapeHtml(safeLastDate)}):</strong> "${safeTitle}" passed closing${daysClosed !== null && daysClosed > 0 ? ` ${daysClosed} days ago` : ''}; verify any new ${safeOrg} cycle on ${escapeHtml(enrichment.sourceDomain)}.
    </aside>
    ` : ''}
    ${!computed.canApplyOnline ? `
    <aside style="background:${computed.verificationStatus === 'needs_verification' ? '#fffbeb' : computed.isCancelled ? '#fff1f2' : '#f8fafc'}; border:1px solid ${computed.verificationStatus === 'needs_verification' ? '#fde68a' : computed.isCancelled ? '#fecdd3' : '#cbd5e1'}; border-left:4px solid ${computed.verificationStatus === 'needs_verification' ? '#d97706' : computed.isCancelled ? '#e11d48' : '#475569'}; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:20px; font-size:13px; color:#0f172a;">
      <strong>${escapeHtml(computed.badgeLabel)} (${safeOrg}):</strong> ${
        computed.verificationStatus === 'needs_verification'
          ? `Confirm "${safeTitle}" status directly on ${escapeHtml(enrichment.sourceDomain)}.`
          : computed.isCancelled
          ? `${safeOrg} cancelled or withdrew "${safeTitle}".`
          : computed.isClosed
          ? escapeHtml(computed.closingTimeNote || `"${safeTitle}" closed on ${safeLastDate}.`)
          : computed.isUpcoming
          ? `${safeOrg} scheduled opening for "${safeTitle}": ${safeStartDate}.`
          : `Check ${escapeHtml(enrichment.sourceDomain)} for "${safeTitle}" updates.`
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
        ${
          Array.isArray(item.verification?.amendmentUrls) && item.verification.amendmentUrls.length > 0
            ? `<p style="margin:0 0 6px 0;"><strong>Latest circular / amendment:</strong> ${item.verification.amendmentUrls
                .map((u, idx) => `<a href="${escapeHtml(u)}" target="_blank" rel="noopener noreferrer" style="color:#1F9D6B; font-weight:600;">Official Amendment PDF${item.verification!.amendmentUrls!.length > 1 ? ` #${idx + 1}` : ''} ↗</a>`)
                .join(' · ')}</p>`
            : ''
        }
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
          <div style="font-weight:700; font-size:15px; color:#101A36;">Official ${safeOrg} Source Links</div>
          <div style="font-size:13px; color:#475569;">Confirm "${safeTitle}" on ${escapeHtml(enrichment.sourceDomain)}.</div>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <a href="${safeOfficialLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#1F9D6B; color:#ffffff; font-weight:700; font-size:14px; padding:10px 18px; border-radius:8px; text-decoration:none;">
            ${isSscTimetablePost ? 'Official Portal (ssc.gov.in) ↗' : isIgnouPost ? 'Official IGNOU Circular / Portal ↗' : `${safeOrg} Official Portal ↗`}
          </a>
          ${
            pdfUrl
              ? `<a href="${escapeHtml(pdfUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#ffffff; color:#101A36; border:1px solid #cbd5e1; font-weight:700; font-size:14px; padding:10px 18px; border-radius:8px; text-decoration:none;">
            Notification PDF ↗
          </a>`
              : ''
          }
          ${!computed.canApplyOnline ? `
          <a href="/" style="display:inline-block; background:#ffffff; color:#101A36; border:1px solid #cbd5e1; font-weight:600; font-size:14px; padding:10px 18px; border-radius:8px; text-decoration:none;">
            CSC DOST Home
          </a>
          ` : `
          <a href="/apply?service=${encodeURIComponent(item.title)}" style="display:inline-block; background:#101A36; color:#ffffff; font-weight:600; font-size:14px; padding:10px 18px; border-radius:8px; text-decoration:none;">
            Request Assistance
          </a>
          `}
        </div>
      </section>
    </article>

    <script type="application/ld+json">${faqSchemaJson}</script>

    <!-- Footer Disclaimers -->
    ${renderSsrPolicyFooterHtml()}
  </main>
  `;
}

function renderSsrPolicyFooterHtml(): string {
  return `
    <footer style="margin-top:30px; font-size:12px; color:#475569; text-align:center; line-height:1.7; border-top:1px solid #E2E8F0; padding-top:16px;">
      <p style="margin:0 0 6px 0;">Published by CSC DOST | Operator: Wasim Ahmad Khanday (CSC VLE ID: 212515670018) | Sangran Qazigund, Anantnag, J&amp;K 192221 · +91 70068 33767 · <a href="mailto:urnxtfd@gmail.com" style="color:#101A36; font-weight:600; text-decoration:underline;">urnxtfd@gmail.com</a></p>
      <p style="margin:0;">
        <a href="/about-us" style="color:#101A36; font-weight:600; text-decoration:none;">About</a> •
        <a href="/contact-us" style="color:#101A36; font-weight:600; text-decoration:none;">Contact</a> •
        <a href="/editorial-policy" style="color:#101A36; font-weight:600; text-decoration:none;">Editorial Policy</a> •
        <a href="/privacy-policy" style="color:#101A36; font-weight:600; text-decoration:none;">Privacy Policy</a> •
        <a href="/terms-of-service" style="color:#101A36; font-weight:600; text-decoration:none;">Terms of Service</a> •
        <a href="/disclaimer" style="color:#101A36; font-weight:600; text-decoration:none;">Disclaimer</a> •
        <a href="/refund-policy" style="color:#101A36; font-weight:600; text-decoration:none;">Refund Policy</a>
      </p>
    </footer>`;
}

export function renderServiceSubstantiveHtml(service: ServiceItem): string {
  const facts = deriveStoredServiceFacts(service);
  const cluster = getClusterForServiceId(service.id);
  const safeName = escapeHtml(service.name);
  const safeDescription = escapeHtml(service.description);
  const safeCategory = escapeHtml(service.category);

  const safeFeeHtml =
    facts.feeLines.length > 0
      ? facts.feeLines.map((l) => `<div>${escapeHtml(l)}</div>`).join('')
      : facts.feesText
        ? escapeHtml(facts.feesText)
        : '';

  const waEnquiryUrl = `https://wa.me/917006833767?text=${encodeURIComponent(
    `Hello CSC DOST, enquiry for ${service.name} (${service.id})`
  )}`;

  const serviceSchemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    serviceType: service.category,
    provider: {
      '@type': 'LocalBusiness',
      name: 'CSC DOST',
      telephone: '+91-70068-33767',
    },
    url: `https://www.cscdost.com/service/${encodeURIComponent(service.id)}`,
  }).replace(/</g, '\\u003c');

  const summaryCards: string[] = [];
  if (facts.authorityFromStoredData) {
    summaryCards.push(`
        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:14px;">
          <h2 style="font-size:12px; font-weight:700; color:#475569; margin:0 0 4px 0;">Issuing Authority</h2>
          <div style="font-size:14px; font-weight:700; color:#101A36;">${escapeHtml(facts.issuingAuthority)}</div>
        </div>`);
  }
  if (facts.feesFromStoredData && safeFeeHtml) {
    summaryCards.push(`
        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:14px;">
          <h2 style="font-size:12px; font-weight:700; color:#475569; margin:0 0 4px 0;">Fees &amp; Charges</h2>
          <div style="font-size:14px; font-weight:700; color:#1F9D6B;">${safeFeeHtml}</div>
        </div>`);
  }
  if (facts.timeFromStoredData) {
    summaryCards.push(`
        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:14px;">
          <h2 style="font-size:12px; font-weight:700; color:#475569; margin:0 0 4px 0;">Processing Time</h2>
          <div style="font-size:14px; font-weight:700; color:#101A36;">${escapeHtml(facts.estimatedTime)}</div>
        </div>`);
  }

  return `
  ${renderPrimaryCategoryNavHtml('services')}
  <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:12px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:15px; color:#101A36; line-height:1.55;">
    <nav aria-label="Breadcrumb" style="font-size:14px; color:#475569; margin-bottom:14px;">
      <a href="/" style="color:#101A36; font-weight:600; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      <a href="/services" style="color:#101A36; font-weight:600; text-decoration:none;">Services</a>
      <span style="margin:0 6px;">/</span>
      <span style="color:#101A36; font-weight:700;">${safeName}</span>
    </nav>

    ${
      cluster
        ? `<div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:10px 14px; margin-bottom:14px; font-size:13px;">
      <strong>${escapeHtml(cluster.title)}:</strong> <a href="${escapeHtml(cluster.hubPath)}" style="color:#1D4ED8; font-weight:700; text-decoration:underline;">View Hub Comparison →</a>
    </div>`
        : ''
    }

    <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:14px; padding:22px;">
      <header style="border-bottom:1px solid #E2E8F0; padding-bottom:14px; margin-bottom:18px;">
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom:8px;">
          <span style="display:inline-block; background:#ECFDF5; color:#1F9D6B; border:1px solid #A7F3D0; font-size:11px; font-weight:700; text-transform:uppercase; padding:3px 9px; border-radius:6px;">
            ${safeCategory}${facts.hasVerifyPlaceholders ? '' : ' · Verified'}
          </span>
          ${
            facts.lastVerifiedFromStoredData
              ? `<span style="font-size:12px; color:#64748B; font-weight:600;">Last verified: ${escapeHtml(facts.lastVerifiedDate)}</span>`
              : ''
          }
        </div>
        <h1 style="font-size:26px; line-height:1.28; font-weight:800; color:#101A36; margin:0 0 8px 0;">${safeName}</h1>
        <p style="font-size:15px; color:#475569; margin:0;">${safeDescription}</p>
      </header>

      ${
        summaryCards.length > 0
          ? `<section style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:18px;">
        ${summaryCards.join('')}
      </section>`
          : ''
      }

      ${
        facts.eligibilityFromStoredData
          ? `<section style="margin-bottom:16px;">
        <h2 style="font-size:17px; font-weight:700; color:#101A36; margin:0 0 6px 0;">Who Is Eligible — ${safeName}</h2>
        <p style="font-size:14px; color:#334155; margin:0; white-space:pre-line;">${escapeHtml(facts.eligibility)}</p>
      </section>`
          : ''
      }

      ${
        facts.requirements.length > 0
          ? `<section style="margin-bottom:16px;">
        <h2 style="font-size:17px; font-weight:700; color:#101A36; margin:0 0 6px 0;">Exact Documents List — ${safeName}</h2>
        <ul style="padding-left:20px; font-size:14px; color:#334155; margin:0;">
          ${facts.requirements.map((doc) => `<li>${escapeHtml(doc)}</li>`).join('')}
        </ul>
      </section>`
          : ''
      }

      ${
        facts.stepFlow.length > 0
          ? `<section style="margin-bottom:16px;">
        <h2 style="font-size:17px; font-weight:700; color:#101A36; margin:0 0 6px 0;">Step-by-Step Flow — ${safeName}</h2>
        <ol style="padding-left:20px; font-size:14px; color:#334155; margin:0;">
          ${facts.stepFlow.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
        </ol>
      </section>`
          : ''
      }

      ${
        facts.rejectionReasons.length > 0
          ? `<section style="margin-bottom:16px;">
        <h2 style="font-size:17px; font-weight:700; color:#101A36; margin:0 0 6px 0;">Common Rejection Reasons — ${safeName}</h2>
        <ul style="padding-left:20px; font-size:14px; color:#334155; margin:0;">
          ${facts.rejectionReasons.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
        </ul>
      </section>`
          : ''
      }

      ${
        facts.staffChecks.length > 0
          ? `<section style="margin-bottom:16px;">
        <h2 style="font-size:17px; font-weight:700; color:#101A36; margin:0 0 6px 0;">CSC DOST Staff Pre-Submission Checks</h2>
        <ul style="padding-left:20px; font-size:14px; color:#334155; margin:0;">
          ${facts.staffChecks.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}
        </ul>
      </section>`
          : ''
      }

      <details style="border:1px solid #E2E8F0; border-radius:8px; padding:10px 12px; margin-bottom:16px; background:#F8FAFC; font-size:13px;">
        <summary style="font-weight:700; color:#101A36; cursor:pointer;">Disclaimer &amp; FAQ</summary>
        <p style="margin:6px 0 0 0; color:#475569;">Independent CSC desk (VLE 212515670018, Qazigund). Confirm charges (+91 70068 33767) before applying.</p>
      </details>

      <div style="display:flex; gap:10px; flex-wrap:wrap; padding-top:8px; border-top:1px solid #E2E8F0;">
        <a href="${escapeHtml(waEnquiryUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#1F9D6B; color:#ffffff; font-weight:700; font-size:14px; padding:9px 16px; border-radius:10px; text-decoration:none;">WhatsApp</a>
        <a href="tel:+917006833767" style="display:inline-block; background:#101A36; color:#ffffff; font-weight:700; font-size:14px; padding:9px 16px; border-radius:10px; text-decoration:none;">+91 70068 33767</a>
        <a href="/apply?service=${encodeURIComponent(service.name)}" style="display:inline-block; background:#F8FAFC; color:#101A36; border:1px solid #CBD5E1; font-weight:700; font-size:14px; padding:9px 16px; border-radius:10px; text-decoration:none;">Request Filing</a>
        ${
          facts.officialPortalUrl
            ? `<a href="${escapeHtml(facts.officialPortalUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#ffffff; color:#101A36; border:1px solid #CBD5E1; font-weight:600; font-size:14px; padding:9px 16px; border-radius:10px; text-decoration:none;">${escapeHtml(facts.officialPortalLabel || 'Official Portal')} ↗</a>`
            : ''
        }
      </div>
    </article>
    <script type="application/ld+json">${serviceSchemaJson}</script>
    ${renderSsrPolicyFooterHtml()}
  </main>
  `;
}

export function renderServiceClusterHubHtml(
  cluster: ServiceClusterSuggestion,
  members: ServiceItem[],
  hubOverride?: ServiceClusterHubOverride
): string {
  const safeTitle = escapeHtml(cluster.title);
  const hasWhatFor = hasExplicitContent(hubOverride?.whatDocumentIsFor);
  const hasHowDiff = hasExplicitContent(hubOverride?.howServicesDiffer);
  const commonMistakes = Array.isArray(hubOverride?.commonMistakes) && hasExplicitList(hubOverride.commonMistakes)
    ? hubOverride.commonMistakes.map((s) => s.trim()).filter(Boolean)
    : [];
  const officialSources = Array.isArray(hubOverride?.officialSources)
    ? hubOverride.officialSources.filter((s) => hasExplicitContent(s?.label) && isValidHttpUrl(s?.url))
    : [];

  return `
  ${renderPrimaryCategoryNavHtml('services')}
  <main class="ssr-article-wrapper" style="max-width:1040px; margin:0 auto; padding:12px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:15px; color:#101A36; line-height:1.6;">
    <nav aria-label="Breadcrumb" style="font-size:14px; color:#475569; margin-bottom:14px;">
      <a href="/" style="color:#101A36; font-weight:600; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      <a href="/services" style="color:#101A36; font-weight:600; text-decoration:none;">Services</a>
      <span style="margin:0 6px;">/</span>
      <span style="color:#101A36; font-weight:700;">${safeTitle}</span>
    </nav>

    <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:14px; padding:24px;">
      <header style="border-bottom:1px solid #E2E8F0; padding-bottom:16px; margin-bottom:20px;">
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom:8px;">
          <span style="display:inline-block; background:#EFF6FF; color:#1D4ED8; font-size:11px; font-weight:700; text-transform:uppercase; padding:4px 10px; border-radius:6px;">
            Consolidated Service Hub · ${members.length} Services
          </span>
          ${
            hasExplicitContent(hubOverride?.lastVerifiedDate)
              ? `<span style="font-size:12px; color:#64748B; font-weight:600;">Last verified: ${escapeHtml(hubOverride!.lastVerifiedDate!)}</span>`
              : ''
          }
        </div>
        <h1 style="font-size:26px; font-weight:800; color:#101A36; margin:0 0 8px 0;">${safeTitle}</h1>
        <p style="font-size:15px; color:#475569; margin:0;">${escapeHtml(cluster.summary)}</p>
      </header>

      ${
        hasWhatFor
          ? `<section style="margin-bottom:20px;">
        <h2 style="font-size:19px; font-weight:800; color:#101A36; margin:0 0 8px 0;">What These Documents &amp; Services Are For</h2>
        <div style="font-size:15px; color:#334155; line-height:1.65; white-space:pre-line;">${escapeHtml(hubOverride!.whatDocumentIsFor!)}</div>
      </section>`
          : ''
      }

      ${
        hasHowDiff
          ? `<section style="margin-bottom:20px;">
        <h2 style="font-size:19px; font-weight:800; color:#101A36; margin:0 0 8px 0;">How These Services Differ From Each Other</h2>
        <div style="font-size:15px; color:#334155; line-height:1.65; white-space:pre-line;">${escapeHtml(hubOverride!.howServicesDiffer!)}</div>
      </section>`
          : ''
      }

      <section style="margin-bottom:22px;">
        <h2 style="font-size:19px; font-weight:800; color:#101A36; margin:0 0 10px 0;">Comparison Table</h2>
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:13px; border:1px solid #E2E8F0;">
            <thead>
              <tr style="background:#F8FAFC; text-align:left;">
                <th style="padding:10px; border-bottom:1px solid #E2E8F0;">Service</th>
                <th style="padding:10px; border-bottom:1px solid #E2E8F0;">Issuing Authority</th>
                <th style="padding:10px; border-bottom:1px solid #E2E8F0;">Who It Is For</th>
                <th style="padding:10px; border-bottom:1px solid #E2E8F0;">Typical Time</th>
                <th style="padding:10px; border-bottom:1px solid #E2E8F0;">Fee Note</th>
              </tr>
            </thead>
            <tbody>
              ${members
                .map((m) => {
                  const f = deriveStoredServiceFacts(m);
                  return `
                  <tr style="border-bottom:1px solid #E2E8F0;">
                    <td style="padding:10px; vertical-align:top; font-weight:700; color:#101A36;">${escapeHtml(m.name)}</td>
                    <td style="padding:10px; vertical-align:top; color:#334155;">${f.authorityFromStoredData ? escapeHtml(f.issuingAuthority) : ''}</td>
                    <td style="padding:10px; vertical-align:top; color:#334155;">${f.eligibilityFromStoredData ? escapeHtml(f.eligibility) : ''}</td>
                    <td style="padding:10px; vertical-align:top; color:#334155;">${f.timeFromStoredData ? escapeHtml(f.estimatedTime) : ''}</td>
                    <td style="padding:10px; vertical-align:top; font-weight:700; color:#1F9D6B;">${f.feesFromStoredData ? escapeHtml(f.feesText) : ''}</td>
                  </tr>`;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section style="margin-bottom:22px;">
        <h2 style="font-size:19px; font-weight:800; color:#101A36; margin:0 0 12px 0;">Service-by-Service Breakdown &amp; Specific Differences</h2>
        <div style="display:flex; flex-direction:column; gap:14px;">
          ${members
            .map((m) => {
              const f = deriveStoredServiceFacts(m);
              const diffNote = hubOverride?.perServiceDifferences?.[m.id];
              return `
              <div style="border:1px solid #E2E8F0; border-radius:10px; padding:14px; background:#F8FAFC;">
                <h3 style="font-size:16px; font-weight:700; color:#101A36; margin:0 0 6px 0;">${escapeHtml(m.name)}</h3>
                <p style="font-size:14px; color:#334155; margin:0 0 6px 0;">${escapeHtml(m.description)}</p>
                ${
                  hasExplicitContent(diffNote)
                    ? `<p style="font-size:14px; color:#1E293B; margin:0 0 6px 0;"><strong>Key Difference:</strong> ${escapeHtml(diffNote!)}</p>`
                    : ''
                }
                ${
                  f.eligibilityFromStoredData
                    ? `<p style="font-size:13px; color:#334155; margin:0 0 6px 0;"><strong>Eligibility:</strong> ${escapeHtml(f.eligibility)}</p>`
                    : ''
                }
                ${
                  f.requirements.length > 0
                    ? `<div style="font-size:13px; color:#334155;"><strong>Stored Documents Checklist:</strong> ${f.requirements.map((r) => escapeHtml(r)).join(', ')}</div>`
                    : ''
                }
              </div>`;
            })
            .join('')}
        </div>
      </section>

      ${
        commonMistakes.length > 0
          ? `<section style="margin-bottom:20px;">
        <h2 style="font-size:19px; font-weight:800; color:#101A36; margin:0 0 8px 0;">Common Mistakes &amp; Rejection Causes</h2>
        <ul style="padding-left:20px; font-size:14px; color:#334155; margin:0;">
          ${commonMistakes.map((mistake) => `<li style="margin-bottom:4px;">${escapeHtml(mistake)}</li>`).join('')}
        </ul>
      </section>`
          : ''
      }

      ${
        officialSources.length > 0
          ? `<section style="margin-bottom:12px;">
        <h2 style="font-size:19px; font-weight:800; color:#101A36; margin:0 0 8px 0;">Official Portals &amp; Sources</h2>
        <ul style="padding-left:20px; font-size:14px; color:#334155; margin:0;">
          ${officialSources
            .map(
              (src) =>
                `<li style="margin-bottom:4px;"><a href="${escapeHtml(src.url)}" target="_blank" rel="noopener noreferrer" style="color:#1D4ED8; font-weight:600;">${escapeHtml(src.label)} ↗</a></li>`
            )
            .join('')}
        </ul>
      </section>`
          : ''
      }
    </article>
    ${renderSsrPolicyFooterHtml()}
  </main>
  `;
}

export function renderLegalPageSubstantiveHtml(pageType: string): string {
  const norm = pageType.toLowerCase();
  const navTabs = [
    { key: 'about', href: '/about-us', label: 'About Us' },
    { key: 'contact', href: '/contact-us', label: 'Contact Helpdesk' },
    { key: 'editorial', href: '/editorial-policy', label: 'Editorial Policy' },
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
    : norm.includes('editorial')
    ? 'editorial'
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

  if (norm.includes('editorial')) {
    return `${legalHeaderShell}
    <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.7;">
      <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
        <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
        <span style="margin:0 6px;">/</span>
        <span style="color:#0f172a; font-weight:600;">Editorial Policy</span>
      </nav>

      <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
          <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:8px;">
            Verification &amp; Publishing Standards
          </span>
          <h1 style="font-size:28px; font-weight:800; color:#0f172a; margin:0 0 8px 0;">Editorial Policy &amp; Fact-Checking Standards</h1>
          <p style="font-size:13px; color:#64748b; margin:0;">Editor-in-Chief: Wasim Ahmad Khanday (CSC VLE ID: 212515670018) • Last Reviewed: November 2026</p>
        </header>

        <section style="font-size:15px; color:#334155; line-height:1.75;">
          <p>
            <strong>CSC DOST</strong> (<code>https://www.cscdost.com</code>) publishes structured recruitment guides, university examination summaries, and citizen e-governance instructions for Jammu &amp; Kashmir and all-India applicants. Every article published on this website follows strict editorial verification rules designed to prevent misinformation and low-value thin content.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">1. Official Primary Sources Only</h2>
          <p>
            Our editorial desk checks and cites only primary official portals and official PDFs (<code>.gov.in</code>, <code>.nic.in</code>, JKSSB, SSC, RRB, Join Indian Army, University of Kashmir, Cluster University Srinagar, and IGNOU). We never copy or republish rumours from unverified blogs, social media forwards, or third-party aggregator websites.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">2. Human Verification &amp; Plain-Language Value</h2>
          <ul style="padding-left:20px; margin:0 0 16px 0;">
            <li>Every recruitment notice, date sheet, or scheme guide must be reviewed by a human editor (<strong>Wasim Ahmad Khanday</strong>) before publication.</li>
            <li>Automated portal monitoring creates internal review drafts only and is strictly prohibited from auto-publishing live articles without human review and original rewriting.</li>
            <li>Each published post includes verified eligibility rules, important schedule milestones, document checklists, step-by-step application guidance, and a direct link to the primary official circular.</li>
            <li>Where an official notice does not specify a value (such as vacancy breakup, fee exemption, or cut-off time), CSC DOST explicitly instructs readers to check the official notification instead of guessing figures.</li>
          </ul>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">3. Timestamps, Closing Deadlines &amp; Corrections</h2>
          <p>
            All articles carry clear <strong>Published</strong> and <strong>Last Updated</strong> dates. Expired recruitment circulars are visibly marked as <strong>Closed</strong> after the deadline passes and moved out of active job feeds into our <a href="/archive" style="color:#2563eb; font-weight:600;">Notice Archive</a> after 12 months. Whenever an issuing authority releases a corrigendum or last-date extension, we update the bulletin and note the revision date.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">4. Report an Error or Request a Correction</h2>
          <p>
            Readers who spot a typographical error, broken official PDF link, or updated date circular can report it directly to our editorial desk via email at <a href="mailto:urnxtfd@gmail.com" style="color:#2563eb; font-weight:600;">urnxtfd@gmail.com</a>, phone at <a href="tel:+917006833767" style="color:#2563eb;">+91 70068 33767</a>, or through our <a href="/contact-us" style="color:#2563eb; font-weight:600;">Contact Helpdesk</a>. Verified corrections are applied within 24 hours.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">5. Service-Page Verification &amp; Advertising Independence</h2>
          <p>
            No scheme guide or CSC service fee sheet may be marked verified while any verification gap remains open. Editorial selections, scheme summaries, and job rankings remain completely independent of third-party advertising networks and reflect only primary official notifications.
          </p>
        </section>
      </article>
      ${renderSsrPolicyFooterHtml()}
    </main>
    `;
  }

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
            Application records and uploaded documents are retained securely for a period of up to 180 days after application processing to permit verification and candidate support, after which they are systematically purged from our encrypted storage. Citizens may request immediate deletion of their personal records by emailing <a href="mailto:urnxtfd@gmail.com" style="color:#2563eb; font-weight:600;">urnxtfd@gmail.com</a> with their tracking token.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">8. Grievance Redressal Officer</h2>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
            <p style="margin:0 0 6px 0;"><strong>Data Grievance Officer:</strong> Wasim Ahmad Khanday</p>
            <p style="margin:0 0 6px 0;"><strong>Designation:</strong> Lead VLE &amp; Operator, CSC DOST (VLE ID: 212515670018)</p>
            <p style="margin:0 0 6px 0;"><strong>Email:</strong> <a href="mailto:urnxtfd@gmail.com" style="color:#2563eb; font-weight:600;">urnxtfd@gmail.com</a></p>
            <p style="margin:0 0 6px 0;"><strong>Helpline:</strong> <a href="tel:+917006833767" style="color:#2563eb;">+91 70068 33767</a></p>
            <p style="margin:0;"><strong>Physical Office:</strong> Sangran Qazigund, District Anantnag, Jammu &amp; Kashmir 192221</p>
          </div>
        </section>
      </article>

      ${renderSsrPolicyFooterHtml()}
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

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">5. Assisted Filing Scope &amp; Non-Guarantee Policy</h2>
          <p>
            Using CSC DOST's informational guides, browser document tools, or assisted form-entry desk does not confer preference, shortcut approval, or guaranteed sanction from any recruitment board, university, or government department. Final scrutiny of eligibility certificates, merit lists, and payments always remains exclusively with the competent statutory authority.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">6. Contact &amp; Questions</h2>
          <p>
            If you have questions regarding this disclaimer or need to report an official circular update, please contact us at <a href="mailto:urnxtfd@gmail.com" style="color:#2563eb; font-weight:600;">urnxtfd@gmail.com</a> or phone: <a href="tel:+917006833767" style="color:#2563eb;">+91 70068 33767</a>. Physical Office: Sangran Qazigund, District Anantnag, Jammu &amp; Kashmir 192221.
          </p>
        </section>
      </article>

      ${renderSsrPolicyFooterHtml()}
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

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">5. Governing Law, Support &amp; Jurisdiction</h2>
          <p>
            These terms and any disputes arising out of the use of CSC DOST shall be governed by and construed in accordance with the laws of India, subject to the exclusive jurisdiction of the competent courts in District Anantnag, Jammu &amp; Kashmir. Questions regarding these Terms of Service may be sent to <a href="mailto:urnxtfd@gmail.com" style="color:#2563eb; font-weight:600;">urnxtfd@gmail.com</a> or <a href="tel:+917006833767" style="color:#2563eb;">+91 70068 33767</a>.
          </p>
        </section>
      </article>

      ${renderSsrPolicyFooterHtml()}
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
              <li><strong>Support Email:</strong> <a href="mailto:urnxtfd@gmail.com" style="color:#2563eb; font-weight:600;">urnxtfd@gmail.com</a></li>
            </ul>
          </div>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">Core Services Provided</h2>
          <ul style="padding-left:20px; margin:0 0 16px 0; line-height:1.8;">
            <li><strong>Recruitment Bulletin &amp; Sarkari Results:</strong> Daily verified updates on Indian Army, RRB Railways, SSC Staff Selection Commission, JKSSB, Kashmir University admissions, and Cluster University Srinagar notices.</li>
            <li><strong>Citizen E-Governance Guidance:</strong> Educational walkthroughs for PAN card registration, Aadhaar address correction, Ayushman Bharat PM-JAY Golden Card issuance, PM-KISAN e-KYC, and state domicile certificates.</li>
            <li><strong>Browser-Based Document Tools:</strong> Free client-side image resizers, photo signature joiners, and document optimizers designed to meet exact government pixel and kilobyte specifications without sending files to private external servers.</li>
            <li><strong>Assisted Application Desk:</strong> Optional citizen facilitation where applicants who cannot complete complex online forms can book physical or virtual assistance from our certified VLE center.</li>
          </ul>
          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">Editorial Independence &amp; Official Source Standards</h2>
          <p>
            Every notification published on CSC DOST is verified directly against primary government portals (<code>.gov.in</code>, <code>.nic.in</code>) and official university circulars before publication. Read our <a href="/editorial-policy" style="color:#2563eb; font-weight:600;">Editorial Policy</a> or <a href="/disclaimer" style="color:#2563eb; font-weight:600;">Government Non-Affiliation Disclaimer</a> to learn how we review updates and report corrections.
          </p>
          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">Transparency &amp; Citizen Trust Commitments</h2>
          <p>
            Operating from Sangran Qazigund since registration under MSME Udyam (<code>UDYAM-JK-01-0041957</code>), we separate informational content—always free for every visitor—from optional counter facilitation. Whether an applicant visits in person across Anantnag and Kulgam or submits documents remotely with a tracking token, published timestamps, primary source URLs, and clear helpline escalation via <a href="mailto:urnxtfd@gmail.com" style="color:#2563eb; font-weight:600;">urnxtfd@gmail.com</a> remain standard across every page.
          </p>
        </section>
      </article>

      ${renderSsrPolicyFooterHtml()}
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
              <strong>Support Email:</strong> <a href="mailto:urnxtfd@gmail.com" style="color:#2563eb; font-weight:600;">urnxtfd@gmail.com</a><br/>
              <strong>Grievance Officer:</strong> Wasim Ahmad Khanday (<a href="mailto:urnxtfd@gmail.com" style="color:#2563eb; font-weight:600;">urnxtfd@gmail.com</a>)<br/>
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
          <p style="margin:12px 0 0 0;">
            You can also submit an online contact inquiry directly once the interactive helpdesk loads, or visit <a href="/editorial-policy" style="color:#2563eb; font-weight:600;">Editorial Policy</a> to report a correction on any published circular summary.
          </p>
          <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:14px 0 6px 0;">Escalation, Privacy &amp; Refund Requests</h3>
          <p style="margin:0;">
            For personal document deletion requests under DPDP Act 2023 guidelines, delayed UPI reconciliation checks, or duplicate fee refund follow-ups, email <a href="mailto:urnxtfd@gmail.com" style="color:#2563eb; font-weight:600;">urnxtfd@gmail.com</a> with your CSC tracking token and Razorpay reference ID. Grievance enquiries are logged directly by operator Wasim Ahmad Khanday (CSC VLE ID: 212515670018) and receive a written status reply within one to two working days, alongside our full <a href="/refund-policy" style="color:#2563eb; font-weight:600;">Refund &amp; Pricing Policy</a>.
          </p>
        </section>
      </article>

      ${renderSsrPolicyFooterHtml()}
    </main>
    `;
  }

  // Refund & Service Pricing Policy
  return `${legalHeaderShell}
  <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.7;">
    <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
      <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      <span style="color:#0f172a; font-weight:600;">Refund &amp; Service Pricing Policy</span>
    </nav>

    <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
        <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:8px;">
          Payment &amp; Pricing Transparency
        </span>
        <h1 style="font-size:28px; font-weight:800; color:#0f172a; margin:0 0 8px 0;">Refund, Cancellation &amp; Service Pricing Policy</h1>
        <p style="font-size:13px; color:#64748b; margin:0;">Effective Date: February 2026 • Last Reviewed: November 2026</p>
      </header>

      <section style="font-size:15px; color:#334155; line-height:1.7;">
        <p>
          At <strong>CSC DOST</strong> (operated by Authorized CSC VLE <strong>Wasim Ahmad Khanday</strong>, VLE ID: <code>212515670018</code>, Sangran Qazigund, Anantnag, J&amp;K), citizens may read all job bulletins, scheme guides, and browser-local document tools free of cost. Charges apply only when you voluntarily request assisted form filing or physical printing at our desk.
        </p>

        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">1. Indicative Service Pricing Tiers &amp; Delivery Timeframes</h2>
        <p style="font-size:14px; color:#475569; margin:0 0 12px 0;">
          All listed totals distinguish statutory government/university fees from CSC facilitation charges. Exact statutory amounts depend on official department tariffs at submission time.
        </p>
        <div style="overflow-x:auto; margin-bottom:18px;">
          <table style="width:100%; border-collapse:collapse; font-size:14px; border:1px solid #e2e8f0;">
            <thead>
              <tr style="background:#f1f5f9; text-align:left;">
                <th style="padding:10px 12px; border-bottom:1px solid #e2e8f0;">Service Category</th>
                <th style="padding:10px 12px; border-bottom:1px solid #e2e8f0;">Published Rate / CSC Charge</th>
                <th style="padding:10px 12px; border-bottom:1px solid #e2e8f0;">Estimated Turnaround</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 12px;"><strong>CSC Welfare &amp; Identity Assistance</strong> (PM-KISAN e-KYC, Ayushman, Voter ID, e-Shram, Aadhaar Update Guidance)</td>
                <td style="padding:10px 12px;">Govt fee as applicable (₹0–₹15) + <strong>₹70 CSC facilitation charge</strong></td>
                <td style="padding:10px 12px;">Same day – 7 days (subject to UIDAI/dept verification)</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 12px;"><strong>PAN Card &amp; Instant e-PAN</strong> (New / Correction)</td>
                <td style="padding:10px 12px;">₹107 statutory NSDL/UTIITSL fee + <strong>₹70 CSC charge</strong></td>
                <td style="padding:10px 12px;">e-PAN in ~2 hrs; physical card 3–7 days</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 12px;"><strong>J&amp;K State Certificates</strong> (Domicile, RBA, OBC, SC, ST, EWS, Birth/Death, Marriage)</td>
                <td style="padding:10px 12px;">₹20–₹50 govt fee + <strong>₹70 CSC charge</strong></td>
                <td style="padding:10px 12px;">5 – 30 days depending on Tehsildar/Registrar schedule</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 12px;"><strong>J&amp;K Revenue Extracts</strong> (Fard, Jamabandi, Girdawari, Mutation, Legal Heir, Income)</td>
                <td style="padding:10px 12px;">₹100 govt fee + <strong>₹70 CSC charge</strong></td>
                <td style="padding:10px 12px;">2 – 30 days depending on Patwari/Tehsildar workflow</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px 12px;"><strong>Admissions, Scholarships &amp; Exam Forms</strong> (JKSSB, SSC, RRB, KU, CUS, IGNOU, NSP)</td>
                <td style="padding:10px 12px;"><strong>₹50 – ₹100 CSC filing</strong> + official exam/university fee</td>
                <td style="padding:10px 12px;">Same day (typically 20 mins – 2 hrs)</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;"><strong>Business &amp; Compliance</strong> (MSME UDYAM, GST Reg/Return, Class-3 DSC)</td>
                <td style="padding:10px 12px;">UDYAM ₹70; GST ₹300–₹500; DSC ₹500–₹1,500</td>
                <td style="padding:10px 12px;">Same day – 7 days</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">2. What Assisted Service Includes</h2>
        <ul style="padding-left:20px; margin:0 0 16px 0; line-height:1.8;">
          <li>Pre-filing checklist review against the primary official notification or department portal.</li>
          <li>Document scanning, photo/signature resizing to portal pixel and KB limits, and form data entry.</li>
          <li>OTP/biometric coordination where permitted and delivery of the official acknowledgement receipt plus a CSC tracking token via <a href="/track" style="color:#2563eb; font-weight:600;">cscdost.com/track</a>.</li>
        </ul>

        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">3. Cancellation &amp; Refund Rules</h2>
        <ul style="padding-left:20px; margin:0 0 16px 0; line-height:1.8;">
          <li><strong>Prior to Submission:</strong> Full 100% refund of both the statutory fee and CSC facilitation charge if cancelled before portal filing begins.</li>
          <li><strong>After Final Submission:</strong> Statutory government or examination fees already remitted to the government treasury or university portal cannot be clawed back or refunded.</li>
          <li><strong>Portal Failure Before Cutoff:</strong> If submission cannot be completed due to an official government portal outage before the deadline, unspent fees are refunded in full.</li>
        </ul>

        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">4. Refund Timeline, Failed UPI Debits &amp; Contact</h2>
        <p>
          Approved refunds are credited via Razorpay to your original UPI, debit card, or bank account within <strong>5 to 7 business days</strong>. If money is debited during a network drop while your CSC DOST token still shows pending, do not pay twice—wait up to 24 hours for automated settlement or write to <a href="mailto:urnxtfd@gmail.com" style="color:#2563eb; font-weight:600;">urnxtfd@gmail.com</a> or call <a href="tel:+917006833767" style="color:#2563eb;">+91 70068 33767</a> with your Application Tracking Token and payment UTR/Razorpay ID.
        </p>
      </section>
    </article>

    ${renderSsrPolicyFooterHtml()}
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
    <div style="background:#0B132B; border-top:1px solid rgba(255,255,255,0.12); padding:6px 16px; text-align:center; font-size:11.5px; color:#E2E8F0;">
      Independent citizen portal — not an official government website. <a href="/disclaimer" style="color:#93C5FD; font-weight:700; text-decoration:underline;">Read Disclaimer →</a>
    </div>
  </header>`;
}

export function renderHomepageSubstantiveHtml(
  posts: SarkariItem[],
  services: ServiceItem[],
  alertsConfig?: { whatsappUrl: string; whatsappType: 'channel' | 'group'; telegramUrl?: string },
  publishedGuides: GuideArticle[] = GUIDE_ARTICLES
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
  const popularSchemes = publishedGuides.filter(
    (g) => g.category === 'Central Scheme' || g.category === 'State Services' || g.category === 'Identity & Tax'
  ).slice(0, 4);

  const featuredServices = services.slice(0, 6);
  const waUrl = alertsConfig?.whatsappUrl || 'https://chat.whatsapp.com/GqeYfcw1sdN0EQtGvVR1fI';
  const telegramUrl = alertsConfig?.telegramUrl || '';

  const categoryCards = [
    { href: '/jobs', title: 'Jobs & Recruitment' },
    { href: '/jobs?tab=exams', title: 'Admit Cards' },
    { href: '/jobs?tab=results', title: 'Results' },
    { href: '/jobs?tab=results&filter=answer_key', title: 'Answer Keys' },
    { href: '/education', title: 'Admissions & Exams' },
    { href: '/education/ignou', title: 'IGNOU Hub' },
    { href: '/schemes', title: 'Govt Schemes' },
    { href: '/services', title: 'CSC E-Services' },
    { href: '/tools', title: 'Document Tools' },
    { href: '/calculators', title: 'Citizen Calculators' },
    { href: '/deadlines', title: 'Closing Deadlines' },
    { href: '/archive', title: 'Notice Archive' },
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
  <header style="background:#ffffff; border-bottom:1px solid #E3E8F2;">
    <div style="max-width:1180px; margin:0 auto; padding:12px 24px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px;">
      <a href="/" style="display:inline-flex; align-items:center; gap:8px; font-size:17px; font-weight:800; color:#101A36; text-decoration:none;">CSC DOST</a>
      <nav aria-label="Primary sections" style="display:flex; flex-wrap:wrap; gap:14px; font-size:13px; font-weight:700;">
        <a href="/jobs" style="color:#2455E6; text-decoration:none;">Jobs</a>
        <a href="/education" style="color:#2455E6; text-decoration:none;">Admissions</a>
        <a href="/education/ignou" style="color:#2455E6; text-decoration:none;">IGNOU</a>
        <a href="/schemes" style="color:#2455E6; text-decoration:none;">Schemes</a>
        <a href="/services" style="color:#2455E6; text-decoration:none;">Services</a>
        <a href="/tools" style="color:#2455E6; text-decoration:none;">Tools</a>
        <a href="/calculators" style="color:#2455E6; text-decoration:none;">Calculators</a>
        <a href="/deadlines" style="color:#2455E6; text-decoration:none;">Deadlines</a>
      </nav>
    </div>
    <div style="background:#FFFBEB; border-top:1px solid #FDE68A; padding:6px 16px; text-align:center; font-size:11.5px; color:#78350F; font-weight:600;">
      Independent citizen portal — not an official government website. <a href="/disclaimer" style="color:#B45309; font-weight:700; text-decoration:underline;">Read Disclaimer →</a>
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
        <h2 style="font-size:15px; font-weight:800; margin:0 0 8px 0;">Browse All Categories</h2>
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
          <h2 id="ssr-services-heading" style="font-size:15px; font-weight:800; margin:0;">CSC E-Services</h2>
          <a href="/services" style="font-size:12px; font-weight:700; color:#2455E6; text-decoration:none;">All Services →</a>
        </div>
        <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:8px;">
          ${featuredServices
            .slice(0, 6)
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
          <h2 id="ssr-tools-heading" style="font-size:15px; font-weight:800; margin:0;">Free Citizen Document Tools &amp; Calculators</h2>
          <a href="/tools" style="font-size:12px; font-weight:700; color:#2455E6; text-decoration:none;">Tools Hub →</a>
        </div>
        <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:8px;">
          ${TOOLS_LIST.map(
            (tool) => `
            <a href="/tools/${escapeHtml(tool.id)}" style="background:#ffffff; border:1px solid #E3E8F2; border-radius:12px; padding:10px; text-decoration:none; font-size:12px; font-weight:700; color:#101A36;">
              ${escapeHtml(tool.name)}
            </a>`
          ).join('')}
          <a href="/calculators" style="background:#ffffff; border:1px solid #E3E8F2; border-radius:12px; padding:10px; text-decoration:none; font-size:12px; font-weight:700; color:#2455E6;">
            Age, Fee &amp; Percentage Calculators →
          </a>
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
          Center Address: Sangran Qazigund, District Anantnag, Jammu &amp; Kashmir 192221 · Helpline Phone: <a href="tel:+917006833767" style="color:#2455E6; font-weight:600; text-decoration:none;">+91 70068 33767</a> · Email: <a href="mailto:urnxtfd@gmail.com" style="color:#2455E6; font-weight:600; text-decoration:none;">urnxtfd@gmail.com</a>.
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
          CSC DOST © ${new Date().getFullYear()} · Wasim Ahmad Khanday · VLE ID: 212515670018 · Sangran Qazigund, Anantnag, J&amp;K 192221 · +91 70068 33767 · <a href="mailto:urnxtfd@gmail.com" style="color:#93C5FD; text-decoration:underline;">urnxtfd@gmail.com</a>
        </p>
        <p style="margin:0 0 6px 0; display:flex; flex-wrap:wrap; gap:10px;">
          <a href="/about-us" style="color:#ffffff; text-decoration:none;">About Us</a>
          <a href="/contact-us" style="color:#ffffff; text-decoration:none;">Contact Us</a>
          <a href="/editorial-policy" style="color:#ffffff; text-decoration:none;">Editorial Policy</a>
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
      <p style="margin:0 0 8px 0;">
        If an authority re-opens a suspended advertisement, publishes a supplementary merit list, or issues an extension circular, the updated bulletin is restored to active <a href="/jobs" style="color:#1F9D6B; font-weight:600;">Recruitment</a> or <a href="/education" style="color:#1F9D6B; font-weight:600;">Education</a> listings with refreshed dates and source links. Citizens researching upcoming cycles can also review active <a href="/deadlines" style="color:#1F9D6B; font-weight:600;">Closing Deadlines</a> or verify portal requirements with our desk on <a href="/contact-us" style="color:#1F9D6B; font-weight:600;">Contact Us</a>.
      </p>
      <p style="margin:0;">
        Operated by Wasim Ahmad Khanday (Authorized CSC VLE ID: 212515670018, Sangran Qazigund, Anantnag, J&amp;K 192221). Always verify fresh cycles directly on the official issuing authority website before preparing any documents or fees.
      </p>
    </section>
    ${renderSsrPolicyFooterHtml()}
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
          <strong>Official Portal:</strong> ${safePortal} · <strong>Last updated:</strong> ${escapeHtml(guide.lastUpdated)}${guide.reviewedBy ? ` · <strong>Reviewed by:</strong> ${escapeHtml(guide.reviewedBy)}` : ''}
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

interface ToolRichSpec {
  overview: string;
  capabilities: string[];
  workflow: string[];
  specsNote: string;
  faqs: Array<{ q: string; a: string }>;
}

const TOOL_RICH_SPECS: Record<string, ToolRichSpec> = {
  'image-compressor': {
    overview:
      'Government recruitment portals such as JKSSB, SSC OTR, RRB Apply, and Kashmir University admit-card modules routinely reject raw smartphone portraits because modern camera sensors save 3 MB to 8 MB JPEG files while portals cap portrait uploads at 20 KB–50 KB or 10 KB–20 KB. Image Compressor solves that mismatch inside your device browser by iteratively running canvas re-encoding passes at descending JPEG/WebP quality ratios until the exported byte count sits cleanly below your selected kilobyte ceiling without distorting facial proportions or slicing off forehead margins.',
    capabilities: [
      'Instant one-tap byte ceilings for 20 KB, 50 KB, 100 KB, and 200 KB recruitment forms plus fine custom KB slider control.',
      'Accepts JPG, JPEG, PNG, and WebP photographs up to 30 MB inside local device memory without remote cloud upload.',
      'Live preview comparing original versus compressed clarity, pixel dimensions, and exact KB savings before saving.',
      'Smart fallback step-down automatically trims excessive megapixel width if aggressive quantization alone cannot hit ultra-low 20 KB targets.',
      'Strips bulky camera EXIF thumbnail blobs so precious kilobytes go toward keeping eyes, ears, and date stamps crisp.',
    ],
    workflow: [
      'Choose a well-lit candidate portrait, scanned marksheet, or domicile image from phone storage or desktop.',
      'Select the exact target ceiling published in your notification—typically 20–50 KB for passport photos or 100–200 KB for document scans.',
      'Toggle JPEG output (universally required by Indian government portals) or WebP and let binary-search encoding converge just under the limit.',
      'Inspect eyes, eyeglasses reflections, and small certificate serial digits in preview, then download the submission-ready file.',
    ],
    specsNote:
      'JPEG quantization preserves edge luminance while trimming invisible high-frequency chrominance variance, keeping biometric features and stamped dates sharp during automated OTR validation. Always keep a slight 2–3 KB safety margin below portal maximums.',
    faqs: [
      {
        q: 'Why does hitting exact 20 KB sometimes soften portrait backgrounds?',
        a: 'Smaller byte budgets force stronger JPEG block compression; cropping empty wall space around the shoulders before compressing allocates more bits to the candidate face.',
      },
      {
        q: 'Which image extension do JKSSB, SSC, and RRB portals expect?',
        a: 'Almost every Indian recruitment portal mandates plain .jpg or .jpeg uploads for candidate photographs and signatures rather than .png or .webp.',
      },
      {
        q: 'Can I compress a dense A4 certificate scan down to 50 KB without making text unreadable?',
        a: 'Text documents carry lots of sharp black strokes, so pushing an A4 scan below 100 KB can blur small numbers; crop borders tightly and check legibility at 100% zoom.',
      },
      {
        q: 'Does Image Compressor upload my ID documents or portraits to CSC DOST servers?',
        a: 'No. Canvas decoding and JPEG quantization run strictly inside browser RAM and vanish once the tab closes.',
      },
    ],
  },
  'image-resizer': {
    overview:
      'Many admission and civil service forms enforce strict horizontal and vertical pixel frames—such as 160×200 px, 200×230 px, 140×60 px, or 300×400 px—where even a 2-pixel deviation triggers an immediate validation rejection. Image Resizer rescales candidate portraits, thumb impressions, and scanned slips to exact numeric pixel widths and heights inside HTML5 Canvas while giving you explicit control over aspect-ratio locking so faces never look unnaturally squished or vertically stretched.',
    capabilities: [
      'Exact numeric width × height pixel fields supporting both locked aspect scaling and manual custom target dimensions.',
      'Built-in common recruitment preset sizes alongside freehand pixel entry down to small signature boxes.',
      'Exports clean JPEG or PNG output with crisp white canvas fill when converting alpha-transparent graphics.',
      'Zero-distortion proportional fit check warns before extreme aspect changes elongate or flatten facial features.',
      'Displays before-and-after pixel geometry and rendered file size immediately upon adjustment.',
    ],
    workflow: [
      'Load your already-cropped portrait, left-thumb impression, or document photograph into the resizer.',
      'Enter required portal width and height in pixels, leaving Aspect Lock turned ON when proportional scaling fits within limits.',
      'If an agency enforces a strict unmatched ratio (e.g., 200×230 px), crop surplus margin proportionally first before locking exact pixel dimensions.',
      'Choose JPEG or PNG format, preview edge sharpness at full zoom, and download directly to your Downloads folder.',
    ],
    specsNote:
      'Multi-step canvas downscaling interpolates oversized 4000×3000 px mobile photos smoothly, eliminating harsh jagged pixels along collar lines, hair edges, and inked signatures.',
    faqs: [
      {
        q: 'Should I keep Aspect Ratio Lock enabled when changing pixel width?',
        a: 'Yes whenever possible—locking proportions calculates the matching height automatically so heads and eyes are never stretched.',
      },
      {
        q: 'How do I handle portals demanding 200×230 px when my photo is 35×45 mm?',
        a: 'Use Passport Photo Maker or crop excess top/side backdrop lightly before applying exact 200×230 pixel dimensions so facial geometry stays accurate.',
      },
      {
        q: 'Does reducing pixels from 3000 px down to 200 px automatically lower KB size?',
        a: 'Yes, fewer pixels dramatically cut raw image bytes; pair Image Resizer with Image Compressor if you also need a strict 20–50 KB ceiling.',
      },
    ],
  },
  'image-to-pdf': {
    overview:
      'Scholarship portals, university verification counters, and J&K e-UNNAT service applications frequently request a single consolidated PDF file containing multiple certificate photographs—for instance Class 10th marksheet, Domicile Certificate, Aadhaar Card, and Category proof combined together. Image to PDF packs multiple JPG, PNG, and WebP photos onto cleanly aligned A4 or US Letter sheets directly inside your browser without altering certificate seals or uploading sensitive family records online.',
    capabilities: [
      'Combines multiple camera snaps or scanned JPG, PNG, and WebP certificates into one ordered portable PDF.',
      'Interactive thumbnail drag-and-drop sequence ordering plus per-page 90-degree clockwise rotation for sideways phone shots.',
      'Configurable A4 (210×297 mm) or US Letter page templates with clean white margins so corner serial numbers stay printable.',
      'Auto-fit image scaling centres portrait and landscape certificates neatly without stretching aspect ratios.',
      'Generates standard cross-platform PDF streams compatible with Adobe Reader, Chrome, and portal preview viewers.',
    ],
    workflow: [
      'Select two or more academic marksheets, revenue extracts, or identity photographs from your device.',
      'Verify each sheet faces upright using per-page rotate buttons and drag thumbnails into official checklist sequence.',
      'Choose A4 sheet layout and safe margin padding so laser printers will not clip embossed seals or signatures.',
      'Generate the combined PDF and verify every page opens sharply in your browser before submitting.',
    ],
    specsNote:
      'Uniform A4 page embedding prevents awkward page-size jumps when clerks inspect or print merged multi-certificate dossiers at scrutiny desks.',
    faqs: [
      {
        q: 'Can I put my 10th diploma first, 12th marksheet second, and Domicile third?',
        a: 'Yes, drag the uploaded thumbnail cards into the exact checklist order prior to clicking export.',
      },
      {
        q: 'My phone saved one certificate sideways—can I rotate just that page?',
        a: 'Yes, use the individual 90-degree rotation control on that card without affecting the remaining pages.',
      },
      {
        q: 'What if the combined PDF exceeds a portal 1 MB limit?',
        a: 'Run the exported bundle through PDF Compressor or shrink very large camera photos first with Image Compressor before building the PDF.',
      },
    ],
  },
  'pdf-to-image': {
    overview:
      'Several admission counters, messaging helplines, and legacy portals refuse PDF attachments and accept only JPG or PNG uploads—even when your hall ticket, university provisional certificate, or e-Aadhaar slip arrives strictly as a multi-page PDF. PDF to Image decodes PDF vector glyphs, stamps, and barcodes page-by-page inside local browser memory using pdf.js canvas rendering and exports crisp raster images or a single bundled ZIP package.',
    capabilities: [
      'Client-side pdf.js rendering decodes multi-page notices, roll-number slips, and fee receipts cleanly without uploading files.',
      'Selectable 150 DPI screen-friendly resolution or 300 DPI high-clarity print/barcode rendering.',
      'Supports crisp lossless PNG exports for crisp text and lightweight JPG images for strict portal upload fields.',
      'Per-page thumbnail preview lets you export a single required sheet instead of every appendix page.',
      'One-click ZIP archive builder bundles all rendered pages together cleanly for multi-sheet circulars.',
    ],
    workflow: [
      'Drop your admit card, marksheet PDF, or multi-page circular into the browser canvas reader.',
      'Pick 300 DPI for small dense tables, QR codes, or tiny signatures, or 150 DPI for fast mobile sharing.',
      'Choose PNG for crisp monochrome stamps or JPG for lightweight photo/document upload fields.',
      'Download individual rendered pages directly or package the entire multi-page set inside a ZIP archive.',
    ],
    specsNote:
      'Rendering dense official circulars at 300 DPI keeps micro-printed verification barcodes, candidate photographs, and embossed QR matrices readable on mobile screens and printouts alike.',
    faqs: [
      {
        q: 'When should I choose 300 DPI over 150 DPI?',
        a: 'Pick 300 DPI whenever small QR codes, marksheet subjects, or serial numbers need maximum clarity; pick 150 DPI when small file size matters most.',
      },
      {
        q: 'Can I extract only page 2 of a 10-page admit card PDF as a JPG?',
        a: 'Yes—wait for thumbnails to render, then click the download button beneath page 2 alone.',
      },
      {
        q: 'Does PDF to Image handle password-locked e-Aadhaar PDFs?',
        a: 'Remove or unlock standard reader passwords cleanly in your viewer first, or inspect unencrypted PDFs directly inside the browser.',
      },
    ],
  },
  'pdf-merge': {
    overview:
      'Recruitment document verification modules and scholarship portals often provide just one attachment slot labeled "Combined Qualification & Category Certificates PDF." Keeping five separate PDFs slows down filing and forces awkward re-scanning. PDF Merge stitches multiple existing PDF documents—such as Aadhaar, Domicile Certificate, Provisional Degree, and Fee Receipt—into one clean sequential document inside JavaScript RAM without degrading underlying vector fonts.',
    capabilities: [
      'Joins multiple standalone PDF documents into a single contiguous file without uploading records to remote servers.',
      'Displays exact page count per queued PDF alongside drag reordering controls before assembly.',
      'Copies underlying PDF page trees losslessly via pdf-lib so vector typography and line art stay razor-sharp.',
      'Preserves mixed portrait and landscape page dimensions cleanly within the merged dossier.',
      'Fast local assembly handles typical multi-certificate application packets in a couple of seconds.',
    ],
    workflow: [
      'Select all separate PDF certificates, receipts, or annexures you want bundled together.',
      'Drag the file rows into exact checklist sequence matching the board upload instructions.',
      'Check individual page counts so blank trailing sheets or wrong attachments are caught early.',
      'Click Merge PDFs and save your unified document; follow with PDF Compressor if total KB exceeds portal caps.',
    ],
    specsNote:
      'Because pdf-lib transfers vector streams directly rather than rasterizing pages into bitmaps, crisp digital text from e-UNNAT and DigiLocker certificates retains infinite zoom clarity.',
    faqs: [
      {
        q: 'Will merging two DigiLocker PDFs make the QR code or text blurry?',
        a: 'No. PDF Merge copies original vector streams intact without rasterizing text into low-DPI images.',
      },
      {
        q: 'Why does my merged PDF become larger than the portal 500 KB limit?',
        a: 'Merging sums the byte weights of its source files; run the combined output through PDF Compressor afterward to stay within strict portal limits.',
      },
      {
        q: 'Can I merge PDFs with image files directly?',
        a: 'Convert JPG/PNG certificates to PDF first using Image to PDF, then combine everything cleanly in PDF Merge.',
      },
    ],
  },
  'pdf-split': {
    overview:
      'Official JKSSB selection gazettes, university examination date sheets, and consolidated family dossiers frequently run 40 to 200 pages long when you only need to save or upload two specific pages bearing your roll number or certificate. PDF Split extracts exact single pages or comma-separated intervals locally in your browser without damaging the original source PDF.',
    capabilities: [
      'Flexible range syntax accepting intervals and single indices such as "1-3, 7, 12-15".',
      'Saves selected pages either as one trimmed single PDF or as separate individual per-page files packed in a ZIP.',
      'Reports total page count immediately upon opening heavy circulars or multi-certificate packets.',
      'Preserves original vector fonts, official watermarks, and table borders cleanly without re-rasterizing.',
      'Leaves the original file untouched on device storage while creating a clean trimmed download.',
    ],
    workflow: [
      'Load your multi-page gazette, syllabus PDF, or combined certificate scan.',
      'Note the total page count and enter the exact page numbers or hyphenated intervals you want extracted.',
      'Pick single trimmed PDF output for concise portal uploads, or ZIP per-page mode when splitting separate certificates.',
      'Verify extracted pages open cleanly in your PDF viewer before sharing or uploading.',
    ],
    specsNote:
      'Trimming an 80-page official PDF down to the two relevant pages trims megabytes cleanly while retaining exact original page geometry and digital legibility.',
    faqs: [
      {
        q: 'Can I extract non-adjacent pages such as page 1, page 4, and pages 9-11 together?',
        a: 'Yes—type "1, 4, 9-11" into the page range field to build a clean 5-page PDF in that exact order.',
      },
      {
        q: 'How do I split a 4-page combined scan into four separate certificate PDFs?',
        a: 'Select the per-page ZIP export option so every page downloads neatly as its own standalone file.',
      },
      {
        q: 'Does splitting alter fonts inside university roll-number gazettes?',
        a: 'No. Page objects are extracted verbatim without image conversion so search and print quality stay identical.',
      },
    ],
  },
  'pdf-compressor': {
    overview:
      'High-resolution mobile scanner apps routinely create 4 MB to 12 MB PDF scans for simple 2-page caste or revenue certificates, causing uploads to time out on 300 KB or 1 MB government portal forms. PDF Compressor compacts redundant PDF stream bloat and gives you Low, Medium, and High compression presets inside browser memory so you can trade byte weight against visual sharpness safely.',
    capabilities: [
      'Three selectable presets—Low, Medium, and High—tailored to sharp seals, standard portal uploads, and tight KB ceilings.',
      'Shows live pre-compression and post-compression file size with exact percentage reduction saved.',
      'Strips redundant embedded metadata streams and re-encodes bloated image scans efficiently inside the browser.',
      'Works completely client-side so confidential bank passbooks, affidavits, and revenue extracts never touch remote servers.',
      'Clean preview download ensures you can verify serial numbers before attaching to final forms.',
    ],
    workflow: [
      'Select your oversized certificate PDF or merged multi-page verification dossier.',
      'Begin with Medium compression for typical 500 KB–1 MB portal thresholds, or choose Low for delicate handwritten Patwari remarks.',
      'Compare original versus output size readout; switch to High if a strict 200 KB–300 KB cap still needs extra trimming.',
      'Open the saved PDF and confirm all official stamps, barcodes, and signature lines remain easy to read.',
    ],
    specsNote:
      'Medium compression typically reduces camera-scanned multi-megabyte certificates by 60–80% while preserving dark ink legibility on Domicile, RBA, and marksheet scans.',
    faqs: [
      {
        q: 'Which preset is safest for Domicile, Category, and Revenue Fard PDFs?',
        a: 'Start with Medium; verify the Tehsildar seal and QR reference number remain crisp before submitting.',
      },
      {
        q: 'Why does a tiny 80 KB vector DigiLocker PDF barely shrink under Low?',
        a: 'Clean vector PDFs already contain compressed instructions rather than raw camera bitmaps, so only image-heavy PDFs see huge byte drops.',
      },
      {
        q: 'What if I also need to remove unnecessary appendix pages before compressing?',
        a: 'Run PDF Split first to drop unused sheets, then compress only the remaining essential pages.',
      },
    ],
  },
  'background-remover': {
    overview:
      'Recruitment agencies reject candidate portraits photographed against patterned curtains, wood doors, or dim room shadows. Background Remover isolates the candidate portrait foreground inside your browser without transmitting private photos to external cloud AI endpoints, allowing you to export either a crisp alpha-transparent PNG cutout or a clean studio-white backdrop ready for form sizing.',
    capabilities: [
      '100% browser-local foreground segmentation model keeps candidate portraits strictly on your device.',
      'One-click switching between alpha-transparent PNG cutouts and solid pure-white (#FFFFFF) studio backdrops.',
      'Smooth edge feathering handles collared shirts, headscarves, glasses frames, and shoulder contours cleanly.',
      'Fast preview lets you inspect hairlines and ear margins before downloading.',
      'Pairs smoothly with Passport Photo Maker and Image Compressor for complete form readiness.',
    ],
    workflow: [
      'Pick a bright, front-facing portrait taken at arm’s length or tripod height with clear contrast behind the shoulders.',
      'Run local foreground segmentation and wait a few seconds for mask extraction to finish inside browser memory.',
      'Select solid pure-white backdrop for official exam applications (or transparent PNG for custom print layouts).',
      'Inspect shoulder and ear edges closely, download the studio-clean image, then export to 35×45 mm JPEG if needed.',
    ],
    specsNote:
      'Even front daylight facing a plain doorway with zero harsh flash shadows behind the head produces the cleanest automated hair and shoulder separation.',
    faqs: [
      {
        q: 'Should I upload a transparent PNG cutout directly to SSC or JKSSB?',
        a: 'No. Recruitment portals require solid white or light plain backgrounds saved as .jpg/.jpeg—choose white backdrop and convert with PNG to JPG if required.',
      },
      {
        q: 'Is my portrait photo sent to a third-party GPU API for background removal?',
        a: 'No. All foreground segmentation executes locally inside browser memory with zero remote photo upload.',
      },
      {
        q: 'Why do messy dark hair edges sometimes look faintly haloed?',
        a: 'Strong contrast between hair and wall behind you prevents dark color bleed; reshoot near an open window facing outside light for cleaner cutouts.',
      },
    ],
  },
  'passport-photo-maker': {
    overview:
      'Passport Photo Maker aligns front portraits accurately into official 35×45 mm (Indian passport, visa, JKSSB, SSC) or 2×2 inch (US visa / pan-card style) photo proportions without squishing facial width, and lets you generate printable A4 multi-copy studio sheets ready for matte or glossy photo paper printing.',
    capabilities: [
      'Precision physical frame presets including 35×45 mm (413×531 px at 300 DPI) and 2×2 inch studio cutouts.',
      'Proportional interactive crop guides center eyes and shoulders without stretching vertical facial ratio.',
      'Automated A4 (210×297 mm) print sheet builder arranging 6, 8, 12, or 16 crisp photo copies with clean cut spacing.',
      'Supports exporting either a single digital file for online portal upload or the full A4 studio sheet.',
      'Runs entirely offline inside HTML5 Canvas with zero distortion or third-party watermark.',
    ],
    workflow: [
      'Upload a bright plain-background portrait (use Background Remover first if household clutter appears behind you).',
      'Choose 35×45 mm or 2×2 inch target preset and center chin-to-crown alignment inside frame guides.',
      'Download the single cropped portrait for online OTR forms—compress with Image Compressor if a strict 20–50 KB ceiling applies.',
      'Or switch to A4 multi-copy layout (8 or 16 copies) and print at 100% Actual Size on glossy photo paper.',
    ],
    specsNote:
      'Maintaining exact physical aspect ratios protects against automated biometric distortion rejection that happens when rectangular smartphone photos are squeezed directly into passport boxes.',
    faqs: [
      {
        q: 'What printer scale setting should I choose for the 8-copy or 16-copy A4 sheet?',
        a: 'Select A4 paper size and set print scale to 100% ("Actual Size")—never "Fit to Page"—so physical cutouts stay true 35×45 mm.',
      },
      {
        q: 'Does Passport Photo Maker stretch my face to hit 35×45 mm?',
        a: 'No. Excess margin outside the frame is trimmed proportionally so head width and eye spacing remain exact.',
      },
      {
        q: 'Can I put date-of-photo or name labels cleanly?',
        a: 'If a notice explicitly specifies white plain unlabelled portrait, leave clean margins without extra graphics.',
      },
    ],
  },
  'signature-resizer': {
    overview:
      'Smartphone photos of signatures written on notebook paper look muddy grey under indoor LEDs and routinely fail strict 10 KB–20 KB portal limits or automated ink contrast checks. Signature Resizer crops excess blank paper tightly around your pen strokes, boosts white paper thresholds cleanly, darkens blue/black ink clarity, and outputs compact 10–20 KB compliant JPEG signatures.',
    capabilities: [
      'Interactive tight crop frame removes empty margins so pen strokes fill the required 140×60 px or 300×120 px box cleanly.',
      'Paper-whitening brightness and contrast threshold converts dull grey indoor lighting into uniform pure white.',
      'Enhances blue or black ballpoint strokes for unmistakable stroke continuity against light backdrop.',
      'Targets compact 10 KB–20 KB JPEG ceilings commonly enforced across JKSSB, SSC, IBPS, and RRB forms.',
      'Processes handwritten signatures strictly inside your browser without storing biometric ink specimens remotely.',
    ],
    workflow: [
      'Sign steadily on blank unruled white A4 paper using dark black or blue ballpoint ink in uniform daylight.',
      'Snap a sharp straight overhead photo (avoid tilting the phone or casting hand shadows across the paper).',
      'Crop closely around the full signature width, turn on paper-white cleanup, and match portal pixel/KB ceilings.',
      'Confirm every letter loop looks clean and unbroken before downloading the final JPEG.',
    ],
    specsNote:
      'Signing on ruled lined paper or using faint pale gel pens hurts cleanup thresholds; plain white printer paper plus dark ballpoint ink delivers crisp scanner-grade contrast.',
    faqs: [
      {
        q: 'Why do examination boards reject signatures signed in ALL CAPS or on lined pages?',
        a: 'Official instructions mandate running-hand signature (not block capitals) on clean unruled white paper so verification desks can match handwriting.',
      },
      {
        q: 'My phone shadow turned half the paper dark yellow—will threshold cleanup fix it?',
        a: 'Moderate lighting dullness cleans cleanly to bright white, though heavy diagonal arm shadows may darken pen edges; retake near window daylight for best results.',
      },
      {
        q: 'What is the typical KB ceiling for exam signatures?',
        a: 'Most boards (SSC, JKSSB, IBPS, NTA) ask for 10 KB to 20 KB JPEG files inside roughly 140×60 px to 200×80 px proportions.',
      },
    ],
  },
  'jpg-to-png': {
    overview:
      'JPG to PNG Converter decodes lossy JPEG scans or photographs inside an HTML5 Canvas pixel buffer and saves clean lossless PNG files. Switching from JPEG to PNG stops additional generational compression artifacts when you plan to edit graphics, insert transparent overlays, or preserve crisp sharp screenshots for design templates and documentation packets.',
    capabilities: [
      'Lossless PNG re-encoding preserves decoded pixel width, height, and color channels verbatim.',
      'Eliminates further JPEG mosquito-noise artifacts during repeated cropping or graphical layout edits.',
      'Batch-friendly browser execution converts files immediately without remote image hosting.',
      'Displays exact source and exported dimensions before download.',
      'Clean standard .png MIME headers compatible across desktop editors and print shops.',
    ],
    workflow: [
      'Upload one or more .jpg / .jpeg graphics, logos, or scanned slips into the converter.',
      'Review decoded dimensions and sharpness inside the preview panel.',
      'Click convert to generate lossless PNG streams directly inside browser memory.',
      'Save the .png files locally for transparent editing or sharp graphic placement.',
    ],
    specsNote:
      'Remember that converting an already-compressed JPG into PNG freezes existing pixels losslessly—it stops future degradation, though PNG files naturally take more kilobytes than JPEGs.',
    faqs: [
      {
        q: 'Why does a 45 KB JPG become 240 KB after converting to PNG?',
        a: 'JPEG throws away subtle pixel variations using lossy math, whereas PNG stores every decoded RGB pixel losslessly.',
      },
      {
        q: 'Should I convert JPG photos into PNG before uploading to JKSSB or SSC?',
        a: 'No! Most government exam forms reject PNG uploads and explicitly require .jpg/.jpeg for portraits and signatures.',
      },
      {
        q: 'Does converting JPG to PNG automatically erase the background?',
        a: 'No—JPG files have no alpha channel; use Background Remover if you want a transparent PNG cutout.',
      },
    ],
  },
  'png-to-jpg': {
    overview:
      'Submitting transparent PNG signatures, logos, or mobile screenshots to government recruitment portals often triggers an "Invalid File Type" error—or worse, server-side scripts turn transparent pixels completely solid black, hiding dark ink completely. PNG to JPG Converter flattens alpha transparency cleanly onto a pure #FFFFFF white backdrop and exports standard web-ready JPEG images with adjustable byte quality.',
    capabilities: [
      'Automatically pre-fills solid #FFFFFF pure-white canvas behind transparent PNG alpha regions.',
      'Prevents black-box signature corruption on legacy exam and university upload modules.',
      'Adjustable JPEG quality slider lets you shrink oversized PNG screenshots cleanly below strict KB caps.',
      'Converts lossless PNG files instantaneously inside browser RAM without network transfer.',
      'Preserves original pixel aspect ratios while producing universally accepted .jpg output.',
    ],
    workflow: [
      'Drop your transparent cutout, Canva graphic, or mobile screenshot PNG into the converter.',
      'Confirm the live preview shows a crisp bright white backdrop behind all dark ink or edges.',
      'Dial JPEG quality down slightly if you need the final .jpg file under a specific portal kilobyte cap.',
      'Download the flattened JPEG image ready for upload.',
    ],
    specsNote:
      'Pre-filling pure white before RGB encoding guarantees predictable brightness across older portal scripts that strip alpha transparency channels blindly.',
    faqs: [
      {
        q: 'Why do transparent PNG signatures turn into a black rectangle on some exam forms?',
        a: 'Legacy server-side thumbnail libraries discard alpha transparency (0,0,0,0) and leave RGB bytes as 0,0,0 (black). Flattening onto #FFFFFF white fixes this permanently.',
      },
      {
        q: 'Will converting my screenshot from PNG to JPG shrink file size?',
        a: 'Yes—lossy JPEG encoding typically shrinks large flat or photographic PNG files by 50% to 85% immediately.',
      },
      {
        q: 'Can I keep transparency inside a JPG file?',
        a: 'The JPEG specification does not support alpha transparency; choose PNG when transparent backgrounds are needed for graphic design.',
      },
    ],
  },
  'pdf-watermark-rotate': {
    overview:
      'Scanned property papers, ration cards, and identity PDFs frequently end up upside-down after quick phone scans—or need a clean diagonal "For Bank KYC Only" / "Self-Attested Copy" watermark stamped across every page before sharing over messaging apps. PDF Watermark & Page Rotator lets you rotate individual or all pages permanently by 90°, 180°, or 270° and stamp custom diagonal purpose watermarks locally in your browser.',
    capabilities: [
      'Permanent 90°, 180°, and 270° page rotation saved cleanly into PDF page orientation dictionaries.',
      'Optional diagonal text watermark stamped transparently across every page without obscuring underlying ID numbers.',
      'Adjustable watermark text label, opacity, and subtle angle suitable for purpose-scoped photocopy protection.',
      'Runs completely offline inside pdf-lib so sensitive Aadhaar, PAN, and land records stay private.',
      'Preserves underlying crisp text and scanned clarity without rasterizing vector pages.',
    ],
    workflow: [
      'Select the sideways PDF scan or sensitive identity document you want prepared.',
      'Click rotate buttons to orient skewed pages cleanly upright.',
      'Optionally enter a concise diagonal purpose label (for example: "Submitted for Bank KYC · Nov 2026") and tune opacity.',
      'Generate and inspect every rotated/watermarked page before sharing or printing.',
    ],
    specsNote:
      'Stamping low-opacity diagonal purpose notes across identity PDFs clarifies submission context and deters unauthorized reuse while keeping QR codes and serial numbers scannable.',
    faqs: [
      {
        q: 'Does page rotation stick permanently when clerks open the PDF on office Windows PCs?',
        a: 'Yes. Standard /Rotate page dictionary flags are updated directly inside the downloaded PDF binary.',
      },
      {
        q: 'Can I use this tool only to rotate upside-down pages without adding any watermark?',
        a: 'Yes—leave the watermark text box empty and apply rotation alone.',
      },
      {
        q: 'Will a semi-transparent diagonal watermark block barcode scanners?',
        a: 'Using soft opacity (around 15–25%) keeps printed barcodes, seals, and numbers completely legible.',
      },
    ],
  },
  'pdf-metadata-cleaner': {
    overview:
      'Nearly every PDF generated by mobile scanning apps, office suites, or desktop print drivers secretly embeds hidden document properties—including Author account name, computer username, software build tags, CreationDate, and ModDate timestamps. PDF Metadata Cleaner inspects those trailer info fields inside browser memory and scrubs identifying metadata cleanly before you submit resumes or sensitive PDFs publicly.',
    capabilities: [
      'Reads and displays hidden Author, Creator, Producer, Title, Subject, Keywords, and timestamp fields.',
      'One-click sanitization wipes personal author names, phone scanner app tags, and internal file titles.',
      'Leaves visible page graphics, stamps, and vector fonts completely untouched.',
      'Executes 100% locally in JavaScript RAM with zero upload of private resumes or legal filings.',
      'Shows clean verification confirming empty metadata properties on the exported sanitized file.',
    ],
    workflow: [
      'Open any exported resume, tender annexure, or scanned PDF inside PDF Metadata Cleaner.',
      'Review the revealed hidden Info Dictionary tags embedded by your word processor or scanner app.',
      'Click Clean Metadata to strip Author, Creator, Producer, Subject, and timestamp markers.',
      'Download the scrubbed PDF copy safe for external portal or public submission.',
    ],
    specsNote:
      'Stripping trailer dictionary tags modifies zero visible layout coordinates while removing personal workstation names and automated scanner software signatures.',
    faqs: [
      {
        q: 'Will wiping PDF metadata erase any visible signature, stamp, or resume line?',
        a: 'No. Visible content streams remain bit-for-bit intact; only non-visible header/trailer metadata strings are cleared.',
      },
      {
        q: 'Why do phone scanner apps store Author and Producer strings inside PDFs?',
        a: 'Scanning apps auto-fill your device account handle and app version into standard PDF info tags unless scrubbed manually.',
      },
      {
        q: 'Can PDF Metadata Cleaner strip XMP XML metadata packets too?',
        a: 'The sanitizer clears standard trailer metadata dictionary keys cleanly before re-saving your PDF stream.',
      },
    ],
  },
};

export function renderToolDetailSubstantiveHtml(tool: ToolItem): string {
  const safeName = escapeHtml(tool.name);
  const safeDesc = escapeHtml(tool.shortDescription);
  const safeCat = escapeHtml(tool.categoryLabel);
  const safeSpecs = escapeHtml(tool.specs || 'Local browser HTML5 Canvas / JavaScript processing');
  const rich = TOOL_RICH_SPECS[tool.id];

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
          ${safeCat} · ${safeSpecs}
        </span>
        <h1 style="font-size:28px; font-weight:800; color:#101A36; margin:0 0 10px 0;">${safeName}</h1>
        <p style="font-size:16px; color:#475569; margin:0;">${safeDesc}</p>
      </header>

      <section style="background:#F6F8FC; border:1px solid #E2E8F0; border-radius:10px; padding:16px; margin-bottom:16px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Why &amp; How ${safeName} Works</h2>
        <p style="font-size:15px; color:#334155; margin:0 0 10px 0;">${escapeHtml(rich?.overview || tool.shortDescription)}</p>
        ${
          rich
            ? `<ul style="padding-left:20px; font-size:14px; color:#334155; margin:0;">
          ${rich.capabilities.map((cap) => `<li>${escapeHtml(cap)}</li>`).join('')}
        </ul>`
            : `<p style="font-size:14px; color:#334155; margin:0;"><strong>Specification:</strong> ${safeSpecs}</p>`
        }
      </section>

      <section style="background:#ffffff; border:1px solid #E2E8F0; border-radius:10px; padding:16px; margin-bottom:16px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">${safeName} Workflow</h2>
        <ol style="padding-left:20px; font-size:15px; color:#334155; line-height:1.75; margin:0 0 10px 0;">
          ${(rich?.workflow || [tool.shortDescription]).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
        </ol>
        ${
          rich
            ? `<p style="font-size:14px; color:#475569; margin:0;">${escapeHtml(rich.specsNote)}</p>`
            : ''
        }
      </section>

      ${
        rich && rich.faqs.length > 0
          ? `<section style="margin-bottom:18px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 10px 0;">${safeName} Questions</h2>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${rich.faqs
            .map(
              (f) => `
          <details style="border:1px solid #E2E8F0; border-radius:10px; padding:12px;">
            <summary style="font-weight:700; color:#101A36; cursor:pointer;">${escapeHtml(f.q)}</summary>
            <p style="margin:8px 0 0 0; font-size:14px; color:#334155;">${escapeHtml(f.a)}</p>
          </details>`
            )
            .join('')}
        </div>
      </section>`
          : ''
      }

      <details style="border:1px solid #E2E8F0; border-radius:8px; padding:10px 12px; margin-bottom:18px; background:#ECFDF5; font-size:13px;">
        <summary style="font-weight:700; color:#101A36; cursor:pointer;">Local Privacy &amp; Portal Spec Check</summary>
        <p style="margin:6px 0 0 0; color:#334155;">${safeName} processes files offline inside your device browser (zero server upload). Verify final pixel/KB figures with <a href="/calculators" style="color:#1F9D6B; font-weight:700;">Citizen Calculators</a>.</p>
      </details>

      <div style="display:flex; flex-wrap:wrap; gap:10px;">
        <a href="/tools" style="background:#101A36; color:#ffffff; font-weight:700; font-size:14px; padding:10px 18px; border-radius:10px; text-decoration:none;">All Document Tools</a>
        <a href="/calculators" style="background:#1F9D6B; color:#ffffff; font-weight:700; font-size:14px; padding:10px 18px; border-radius:10px; text-decoration:none;">Photo Spec Inspector</a>
      </div>
    </article>
    ${renderSsrPolicyFooterHtml()}
  </main>
  `;
}

export function renderCategorySubstantiveHtml(
  categoryType: 'jobs' | 'education' | 'ignou' | 'deadlines' | 'schemes' | 'services' | 'tools' | 'calculators' | 'apply' | 'track' | 'admin',
  posts: SarkariItem[],
  services: ServiceItem[],
  publishedGuides: GuideArticle[] = GUIDE_ARTICLES
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

      <section style="margin-top:24px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:18px; font-size:14px; color:#334155; line-height:1.65;">
        <h2 style="font-size:17px; font-weight:700; color:#101A36; margin:0 0 8px 0;">How Closing Deadlines Are Tracked &amp; Verified</h2>
        <p style="margin:0 0 8px 0;">
          All countdown dates on this page follow Indian Standard Time (<code>Asia/Kolkata</code>) and display exact closing times where explicitly notified by JKSSB, SSC, RRB, Kashmir University, Cluster University Srinagar, or IGNOU. Notifications whose closing date has already passed are automatically removed from this active tracker and tagged <strong>Closed</strong> on their individual summary pages.
        </p>
        <p style="margin:0;">
          Avoid waiting for the final few hours before a deadline, as official recruitment and examination portals frequently slow down under heavy traffic. Always confirm fee payment cutoffs and edit-window notices on the issuing authority's primary website, or reach CSC DOST desk at <a href="tel:+917006833767" style="color:#1F9D6B; font-weight:700;">+91 70068 33767</a> (<a href="/contact-us" style="color:#1F9D6B; font-weight:600;">Sangran Qazigund, Anantnag</a>) for assisted online submission during working hours (Mon–Sat, 9 AM–7 PM IST). Browse full directories: <a href="/jobs" style="color:#1F9D6B; font-weight:600;">Jobs</a> · <a href="/education" style="color:#1F9D6B; font-weight:600;">Education</a> · <a href="/archive" style="color:#1F9D6B; font-weight:600;">Notice Archive</a>.
        </p>
      </section>
      ${renderSsrPolicyFooterHtml()}
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
        ${publishedGuides.map(g => `
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
              ${isNonPlaceholderFeeNote(s.price) ? `<span style="font-weight:700; color:#101A36;">${escapeHtml(s.price!.trim())}</span>` : '<span></span>'}
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
          const facts = deriveStoredServiceFacts(s);
          const docs = facts.requirements.length > 0 ? facts.requirements.join(', ') : '';
          const feeHtml = facts.feeLines.length > 0
            ? facts.feeLines.map(line => `<div>${escapeHtml(line)}</div>`).join('')
            : facts.feesFromStoredData
              ? escapeHtml(facts.feesText)
              : '';
          const waHref = `https://wa.me/917006833767?text=${encodeURIComponent(`Hello Wasim Ahmad Khanday (CSC DOST), I would like to enquire about ${s.name}`)}`;
          return `
          <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:18px; display:flex; flex-direction:column; justify-content:space-between; gap:10px;">
            <div>
              <div style="font-size:11px; font-weight:700; color:#1F9D6B; text-transform:uppercase; margin-bottom:4px;">${escapeHtml(s.category)}</div>
              <h2 style="font-size:17px; font-weight:700; color:#101A36; margin:0 0 6px 0;">
                <a href="/service/${escapeHtml(s.id)}" style="color:#101A36; text-decoration:none;">${escapeHtml(s.name)}</a>
              </h2>
              <p style="font-size:14px; color:#475569; line-height:1.45; margin:0 0 8px 0;">${escapeHtml(s.description)}</p>
              ${docs ? `<div style="font-size:13px; color:#334155; margin-bottom:4px;"><strong>Documents needed:</strong> ${escapeHtml(docs)}</div>` : ''}
              ${facts.timeFromStoredData ? `<div style="font-size:13px; color:#334155; margin-bottom:4px;"><strong>Typical time:</strong> ${escapeHtml(facts.estimatedTime)}</div>` : ''}
              ${feeHtml ? `<div style="font-size:13px; font-weight:700; color:#101A36;"><strong>Fee:</strong> ${feeHtml}</div>` : ''}
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
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 10px 0;">How Calculations Work, Official Verification &amp; Limitations</h2>
        <p style="font-size:14px; color:#334155; margin:0 0 10px 0; line-height:1.65;">
          Government recruitment rules determine age eligibility on a specific crucial cutoff date (commonly 01 January of the recruitment year for JKSSB posts, or 01 August / 01 July for SSC and RRB cycles). Our Age Calculator computes calendar years, months, and remaining days strictly between your Matriculation certificate Date of Birth and the chosen reference date, accounting for leap years.
        </p>
        <p style="font-size:14px; color:#334155; margin:0 0 10px 0; line-height:1.65;">
          Category age limits (such as General/OM 40 years or SC/ST/RBA 43 years under standard J&amp;K civil services rules, versus 18–25/27/30 brackets for SSC and Defence entries) vary sharply by post and advertisement. Likewise, indicative CSC facilitation and statutory fee totals shown in the Fee Estimator represent common desk ranges and can vary with departmental revisions or GST updates. Always confirm exact age cutoffs, relaxation clauses, and payable fees in the official notification PDF before paying or submitting your form.
        </p>
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
      ${renderSsrPolicyFooterHtml()}
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
