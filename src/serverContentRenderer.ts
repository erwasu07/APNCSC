/**
 * Server-Side Semantic Content Renderer for cscdost.com
 * Ensures search crawlers (Googlebot, Bingbot, AdSense crawler), social bots,
 * and text-only user agents receive rich, fully accessible semantic HTML
 * inside <div id="root"> prior to client-side hydration.
 */

import {
  SarkariItem,
  isPublishedSarkariItem,
  isIgnouItem,
  isEducationSarkariItem,
  isRecruitmentSarkariItem,
  parseSarkariDateSortValue,
} from './data/sarkariData';
import { ServiceItem } from './servicesData';
import { GUIDE_ARTICLES, GuideArticle } from './data/guidesData';
import { TOOLS_LIST, ToolItem } from './components/tools/toolsData';
import { computeSarkariStatus } from './utils/sarkariStatus';
import { resolvePostOrg } from './data/sarkariMigration';
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

function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderPostSubstantiveHtml(item: SarkariItem): string {
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

      <!-- Short Summary -->
      <section style="margin-bottom:24px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Notification Overview</h2>
        <p style="font-size:15px; color:#334155; line-height:1.7; margin:0;">
          ${safeShortInfo}
        </p>
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
            <li><strong>Web Push Subscribers:</strong> If you grant browser notification permissions, we store your anonymous cryptographic Web Push subscription endpoint and keys to deliver official job notifications and exam alerts. No identity data is associated with push tokens.</li>
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
            Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style="color:#2563eb;">Google Ads Settings</a> or through the <a href="https://aboutads.info" target="_blank" rel="noopener noreferrer" style="color:#2563eb;">Network Advertising Initiative Opt-Out Page</a>.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">6. Data Retention and Erasure</h2>
          <p>
            Application records and uploaded documents are retained securely for a period of up to 180 days after application processing to permit verification and candidate support, after which they are systematically purged from our encrypted storage. Citizens may request immediate deletion of their personal records by emailing <strong>support@cscdost.com</strong> with their tracking token.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">7. Grievance Redressal Officer</h2>
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

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">4. Contact &amp; Questions</h2>
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

export function renderHomepageSubstantiveHtml(posts: SarkariItem[], services: ServiceItem[]): string {
  const verifiedVisiblePosts = posts
    .filter((p) => {
      if (!isPublishedSarkariItem(p)) return false;
      const st = computeSarkariStatus(p);
      return st.verificationStatus !== 'needs_verification' && !p.isCancelled;
    })
    .sort(
      (a, b) =>
        parseSarkariDateSortValue(b.postDate || b.documentDate) -
        parseSarkariDateSortValue(a.postDate || a.documentDate)
    );

  const closingThisWeek = verifiedVisiblePosts
    .filter((p) => {
      if (p.duplicateOfId) return false;
      const st = computeSarkariStatus(p);
      return st.isUrgentUnder7Days && st.daysRemaining !== null && st.daysRemaining >= 0 && st.daysRemaining <= 7;
    })
    .sort((a, b) => (computeSarkariStatus(a).daysRemaining ?? 99) - (computeSarkariStatus(b).daysRemaining ?? 99))
    .slice(0, 6);

  const recruitmentPosts = verifiedVisiblePosts
    .filter((p) => isRecruitmentSarkariItem(p))
    .slice(0, 6);
  const educationPosts = verifiedVisiblePosts
    .filter((p) => isEducationSarkariItem(p))
    .slice(0, 4);
  const popularSchemes = GUIDE_ARTICLES.filter(
    (g) => g.category === 'Central Scheme' || g.category === 'State Services' || g.category === 'Identity & Tax'
  ).slice(0, 4);
  const topServices = services.slice(0, 6);
  const topTools = TOOLS_LIST.filter((t) => t.popular || t.featured).slice(0, 6);

  const categoryCards = [
    { href: '/jobs', title: 'Jobs', desc: 'JKSSB, Banking, Indian Army, SSC & RRB openings.' },
    { href: '/education', title: 'Admissions', desc: 'Kashmir Univ, Cluster Univ & IGNOU notifications.' },
    { href: '/schemes', title: 'Schemes', desc: 'PM-KISAN, Ayushman PM-JAY & citizen welfare guides.' },
    { href: '/services', title: 'CSC Services', desc: 'PAN card, domicile, Aadhaar & certificate filing.' },
    { href: '/tools', title: 'Tools & Calculators', desc: 'Photo resizer, PDF tools & age/fee calculators.' },
  ];

  const closingWeekHtml =
    closingThisWeek.length > 0
      ? `
    <section aria-labelledby="ssr-closing-week-heading" style="margin-bottom:28px;">
      <div style="display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
        <h2 id="ssr-closing-week-heading" style="font-size:20px; font-weight:800; color:#101A36; margin:0;">
          Closing this week
        </h2>
        <a href="/jobs" style="font-size:14px; font-weight:700; color:#1F9D6B; text-decoration:none;">View all jobs →</a>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(290px, 1fr)); gap:12px;">
        ${closingThisWeek
          .map((post) => {
            const st = computeSarkariStatus(post);
            const daysText = st.daysRemaining === 0 ? 'Closes today' : `${st.daysRemaining}d left`;
            return `
          <article style="background:#ffffff; border:1px solid #FECACA; border-left:4px solid #DC2626; border-radius:12px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px; font-size:12px; font-weight:700;">
              <span style="color:#475569; text-transform:uppercase;">${escapeHtml(post.category?.replace(/_/g, ' '))}</span>
              <span style="padding:2px 8px; border-radius:6px; background:#FEF2F2; color:#B91C1C; border:1px solid #FECACA;">
                ${escapeHtml(daysText)}${post.lastDate ? ` · ${escapeHtml(post.lastDate)}` : ''}
              </span>
            </div>
            <h3 style="font-size:15px; font-weight:700; margin:0;">
              <a href="/post/${escapeHtml(post.id)}" style="color:#101A36; text-decoration:none;">${escapeHtml(post.title)}</a>
            </h3>
          </article>`;
          })
          .join('')}
      </div>
    </section>`
      : '';

  return `
  ${renderPrimaryCategoryNavHtml()}
  <main class="ssr-homepage-wrapper" style="max-width:1100px; margin:0 auto; padding:8px 16px 32px 16px; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:16px; color:#101A36; background:#F6F8FC; line-height:1.6;">
    <section style="background:#101A36; color:#ffffff; border-radius:16px; padding:28px 24px; margin-bottom:24px;">
      <div style="display:inline-block; background:rgba(245,166,35,0.18); border:1px solid rgba(245,166,35,0.5); color:#F5A623; font-size:13px; font-weight:700; padding:4px 12px; border-radius:999px; margin-bottom:12px;">
        Independent portal, not a government website
      </div>
      <h1 style="font-size:28px; font-weight:800; line-height:1.25; margin:0 0 10px 0; color:#ffffff;">
        CSC DOST – J&amp;K Jobs, Admissions, Schemes &amp; Citizen Services
      </h1>
      <p style="font-size:16px; color:#E2E8F0; max-width:780px; margin:0 0 16px 0;">
        Explore J&amp;K jobs, university admissions, government schemes, CSC e-services, browser document tools and citizen calculators in one fast, lightweight portal.
      </p>
      <div style="display:flex; flex-wrap:wrap; gap:10px;">
        <a href="/jobs" style="background:#F5A623; color:#101A36; font-weight:700; font-size:15px; padding:10px 18px; border-radius:10px; text-decoration:none;">Browse Latest Jobs</a>
        <a href="/track" style="background:#1F9D6B; color:#ffffff; font-weight:700; font-size:15px; padding:10px 18px; border-radius:10px; text-decoration:none;">Track Application</a>
      </div>
    </section>

    ${closingWeekHtml}

    <section aria-labelledby="explore-categories-ssr" style="margin-bottom:28px;">
      <h2 id="explore-categories-ssr" style="font-size:20px; font-weight:800; color:#101A36; margin:0 0 12px 0;">
        Explore Core Services
      </h2>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(190px, 1fr)); gap:12px;">
        ${categoryCards
          .map(
            (card) => `
          <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:16px;">
            <h3 style="font-size:17px; font-weight:700; margin:0 0 6px 0;">
              <a href="${card.href}" style="color:#101A36; text-decoration:none;">${card.title}</a>
            </h3>
            <p style="font-size:14px; color:#475569; margin:0;">${card.desc}</p>
          </article>
        `
          )
          .join('')}
      </div>
    </section>

    <section aria-labelledby="ssr-recruitment-heading" style="margin-bottom:28px;">
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:12px;">
        <h2 id="ssr-recruitment-heading" style="font-size:20px; font-weight:800; color:#101A36; margin:0;">
          Latest Jobs
        </h2>
        <a href="/jobs" style="font-size:14px; font-weight:700; color:#1F9D6B; text-decoration:none;">View all jobs →</a>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:14px;">
        ${recruitmentPosts
          .map((post) => {
            const st = computeSarkariStatus(post);
            const urgent = st.isUrgentUnder7Days;
            return `
          <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px; font-size:12px; font-weight:700;">
              <span style="color:#475569; text-transform:uppercase;">${escapeHtml(post.category?.replace(/_/g, ' '))}</span>
              <span style="padding:2px 8px; border-radius:6px; background:${urgent ? '#FEF2F2' : '#ECFDF5'}; color:${urgent ? '#B91C1C' : '#1F9D6B'}; border:1px solid ${urgent ? '#FECACA' : '#A7F3D0'};">
                ${escapeHtml(st.badgeLabel)}${post.lastDate ? ` · ${escapeHtml(post.lastDate)}` : ''}
              </span>
            </div>
            <h3 style="font-size:16px; font-weight:700; margin:0 0 6px 0;">
              <a href="/post/${escapeHtml(post.id)}" style="color:#101A36; text-decoration:none;">${escapeHtml(post.title)}</a>
            </h3>
            <p style="font-size:14px; color:#475569; margin:0 0 8px 0;">${escapeHtml((post.shortInfo || '').slice(0, 100))}...</p>
            <div style="font-size:13px; color:#64748B;">Vacancies: <strong>${escapeHtml(post.totalPosts || 'Open')}</strong></div>
          </article>
        `;
          })
          .join('')}
      </div>
    </section>

    <section aria-labelledby="ssr-education-heading" style="margin-bottom:28px;">
      <div style="display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h2 id="ssr-education-heading" style="font-size:20px; font-weight:800; color:#101A36; margin:0;">
          Admissions &amp; Universities
        </h2>
        <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
          <a href="/education/ignou" style="font-size:14px; font-weight:700; color:#1F9D6B; text-decoration:none;">IGNOU Notifications →</a>
          <a href="/education" style="font-size:14px; font-weight:700; color:#101A36; text-decoration:none;">View all admissions →</a>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:14px;">
        ${educationPosts
          .map(
            (post) => `
          <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:16px;">
            <h3 style="font-size:16px; font-weight:700; margin:0 0 6px 0;">
              <a href="/post/${escapeHtml(post.id)}" style="color:#101A36; text-decoration:none;">${escapeHtml(post.title)}</a>
            </h3>
            <p style="font-size:14px; color:#475569; margin:0;">${escapeHtml((post.shortInfo || '').slice(0, 100))}...</p>
          </article>
        `
          )
          .join('')}
      </div>
    </section>

    <section aria-labelledby="ssr-schemes-heading" style="margin-bottom:28px;">
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:12px;">
        <h2 id="ssr-schemes-heading" style="font-size:20px; font-weight:800; color:#101A36; margin:0;">
          Popular Government Schemes
        </h2>
        <a href="/schemes" style="font-size:14px; font-weight:700; color:#1F9D6B; text-decoration:none;">All schemes →</a>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:14px;">
        ${popularSchemes
          .map(
            (guide) => `
          <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:16px;">
            <h3 style="font-size:16px; font-weight:700; margin:0 0 6px 0;">
              <a href="/scheme/${escapeHtml(guide.id)}" style="color:#101A36; text-decoration:none;">${escapeHtml(guide.title)}</a>
            </h3>
            <p style="font-size:14px; color:#475569; margin:0;">${escapeHtml(guide.summary.slice(0, 110))}...</p>
          </article>
        `
          )
          .join('')}
      </div>
    </section>

    <section aria-labelledby="ssr-services-heading" style="margin-bottom:28px;">
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:12px;">
        <h2 id="ssr-services-heading" style="font-size:20px; font-weight:800; color:#101A36; margin:0;">
          Popular CSC E-Services
        </h2>
        <a href="/services" style="font-size:14px; font-weight:700; color:#1F9D6B; text-decoration:none;">Browse all services →</a>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:12px;">
        ${topServices
          .map(
            (service) => `
          <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:16px;">
            <h3 style="font-size:16px; font-weight:700; margin:0 0 6px 0;">
              <a href="/service/${escapeHtml(service.id)}" style="color:#101A36; text-decoration:none;">${escapeHtml(service.name)}</a>
            </h3>
            <p style="font-size:14px; color:#475569; margin:0;">${escapeHtml(service.description.slice(0, 85))}...</p>
          </article>
        `
          )
          .join('')}
      </div>
    </section>

    <section aria-labelledby="ssr-tools-heading" style="margin-bottom:28px;">
      <div style="display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h2 id="ssr-tools-heading" style="font-size:20px; font-weight:800; color:#101A36; margin:0;">
          Document Tools &amp; Citizen Calculators
        </h2>
        <div style="display:flex; gap:14px;">
          <a href="/calculators" style="font-size:14px; font-weight:700; color:#101A36; text-decoration:none;">Citizen Calculators →</a>
          <a href="/tools" style="font-size:14px; font-weight:700; color:#1F9D6B; text-decoration:none;">All Document Tools →</a>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:12px;">
        ${topTools
          .map(
            (tool) => `
          <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:16px;">
            <h3 style="font-size:16px; font-weight:700; margin:0 0 6px 0;">
              <a href="/tools/${escapeHtml(tool.id)}" style="color:#101A36; text-decoration:none;">${escapeHtml(tool.name)}</a>
            </h3>
            <p style="font-size:14px; color:#475569; margin:0;">${escapeHtml(tool.shortDescription.slice(0, 95))}...</p>
          </article>
        `
          )
          .join('')}
      </div>
    </section>

    <section aria-labelledby="ssr-alerts-heading" style="background:#ffffff; border:1px solid #E2E8F0; border-radius:16px; padding:20px; margin-bottom:24px;">
      <h2 id="ssr-alerts-heading" style="font-size:19px; font-weight:800; color:#101A36; margin:0 0 6px 0;">
        Get Free Job &amp; Admission Alerts
      </h2>
      <p style="font-size:15px; color:#475569; margin:0 0 12px 0;">
        Receive verified J&amp;K and national updates directly on your phone.
      </p>
      <div style="display:flex; flex-wrap:wrap; gap:10px;">
        <a href="https://chat.whatsapp.com/GqeYfcw1sdN0EQtGvVR1fI" target="_blank" rel="noopener noreferrer" style="background:#1F9D6B; color:#ffffff; font-weight:700; font-size:14px; padding:10px 16px; border-radius:10px; text-decoration:none;">Join WhatsApp Group</a>
        <span aria-disabled="true" style="background:#F1F5F9; color:#475569; border:1px solid #CBD5E1; font-weight:600; font-size:14px; padding:10px 16px; border-radius:10px;">Telegram Channel (Coming soon)</span>
      </div>
    </section>

    <section aria-labelledby="ssr-help-heading" style="background:#ffffff; border:1px solid #E2E8F0; border-radius:16px; padding:20px; margin-bottom:24px;">
      <h2 id="ssr-help-heading" style="font-size:20px; font-weight:800; color:#101A36; margin:0 0 8px 0;">
        Need help applying?
      </h2>
      <p style="font-size:15px; color:#475569; margin:0 0 12px 0;">
        Authorized CSC facilitation support by <strong>Wasim Ahmad Khanday</strong> (VLE ID: <strong>212515670018</strong>) · Sangran Qazigund, Anantnag, Jammu &amp; Kashmir 192221.
      </p>
      <div style="display:flex; flex-wrap:wrap; gap:10px;">
        <a href="tel:+917006833767" style="background:#101A36; color:#ffffff; font-weight:700; font-size:14px; padding:10px 16px; border-radius:10px; text-decoration:none;">Call +91 70068 33767</a>
        <a href="https://wa.me/917006833767" target="_blank" rel="noopener noreferrer" style="background:#1F9D6B; color:#ffffff; font-weight:700; font-size:14px; padding:10px 16px; border-radius:10px; text-decoration:none;">WhatsApp CSC DOST</a>
      </div>
    </section>

    <section aria-label="Authorized CSC Citizen Facilitation Desk" style="background:#ffffff; border:1px solid #E2E8F0; border-radius:16px; padding:18px 20px; margin-bottom:28px;">
      <h2 style="font-size:17px; font-weight:800; color:#101A36; margin:0 0 8px 0;">
        Authorized CSC Citizen Facilitation Desk
      </h2>
      <p style="font-size:14px; color:#475569; margin:0 0 6px 0;">
        <strong>Operator:</strong> Wasim Ahmad Khanday · <strong>Authorized CSC VLE ID:</strong> 212515670018 · <strong>Centre:</strong> Sangran Qazigund, Anantnag, Jammu &amp; Kashmir 192221 · <strong>Helpline:</strong> +91 70068 33767
      </p>
      <p style="font-size:13px; color:#64748B; margin:0;">
        CSC DOST is an independent portal, not an official government website. Always confirm details on the official notification.
      </p>
    </section>

    <footer style="background:#101A36; color:#E2E8F0; border-radius:16px; padding:24px 20px; text-align:center; font-size:14px; line-height:1.8;">
      <p style="margin:0 0 10px 0;">
        <a href="/about-us" style="color:#ffffff; text-decoration:none; margin:0 8px;">About</a> ·
        <a href="/contact-us" style="color:#ffffff; text-decoration:none; margin:0 8px;">Contact</a> ·
        <a href="/privacy-policy" style="color:#ffffff; text-decoration:none; margin:0 8px;">Privacy Policy</a> ·
        <a href="/disclaimer" style="color:#ffffff; text-decoration:none; margin:0 8px;">Disclaimer</a> ·
        <a href="/terms-of-service" style="color:#ffffff; text-decoration:none; margin:0 8px;">Terms of Use</a> ·
        <a href="/refund-policy" style="color:#ffffff; text-decoration:none; margin:0 8px;">Refund Policy</a>
      </p>
      <p style="margin:0 0 4px 0; font-size:13px; color:#CBD5E1;">
        Sangran Qazigund, Anantnag, Jammu &amp; Kashmir 192221 · Helpline: <a href="tel:+917006833767" style="color:#F5A623; text-decoration:none; font-weight:700;">+91 70068 33767</a>
      </p>
      <p style="margin:0; font-size:12px; color:#94A3B8;">© ${new Date().getFullYear()} CSC DOST · Independent Citizen Portal (Not a Government Website)</p>
    </footer>
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

      <section style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:10px; padding:16px; margin-bottom:20px;">
        <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Privacy Note</h2>
        <p style="font-size:15px; color:#334155; margin:0;">Files are processed in your browser and not uploaded to any server.</p>
        ${
          usesPdfWorker
            ? `<p style="font-size:13px; color:#334155; margin:8px 0 0 0;">Technical note: The open-source pdf.js worker script is loaded from cdnjs.cloudflare.com for local rendering while your PDF document itself never leaves your device.</p>`
            : ''
        }
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
  categoryType: 'jobs' | 'education' | 'ignou' | 'schemes' | 'services' | 'tools' | 'calculators' | 'apply' | 'track' | 'admin',
  posts: SarkariItem[],
  services: ServiceItem[]
): string {
  const verifiedPosts = posts
    .filter((p) => {
      if (!isPublishedSarkariItem(p)) return false;
      const st = computeSarkariStatus(p);
      return st.verificationStatus !== 'needs_verification' && !p.isCancelled;
    })
    .sort(
      (a, b) =>
        parseSarkariDateSortValue(b.postDate || b.documentDate) -
        parseSarkariDateSortValue(a.postDate || a.documentDate)
    );

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

      <section style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:18px;">
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

      <section style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:18px;">
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

      <section style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:18px;">
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
            Calculates exact calendar years, months, and days against cutoff dates (default 2026-01-01) plus reference category age ceilings.
          </p>
        </article>
        <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:20px;">
          <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">Photo &amp; Signature Spec Inspector</h2>
          <p style="font-size:14px; color:#475569; line-height:1.5; margin:0;">
            Reads pixel dimensions and KB file size locally in your browser without uploading files to any server.
          </p>
        </article>
        <article style="background:#ffffff; border:1px solid #E2E8F0; border-radius:12px; padding:20px;">
          <h2 style="font-size:18px; font-weight:700; color:#101A36; margin:0 0 8px 0;">CSC Regulated Fee Breakdown</h2>
          <p style="font-size:14px; color:#475569; line-height:1.5; margin:0;">
            Shows recorded statutory departmental fee and facilitation charge ranges. Always confirm current rates with the official source before applying.
          </p>
        </article>
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
