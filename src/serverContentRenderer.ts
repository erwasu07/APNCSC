/**
 * Server-Side Semantic Content Renderer for cscdost.com
 * Ensures search crawlers (Googlebot, Bingbot, AdSense crawler), social bots,
 * and text-only user agents receive rich, fully accessible semantic HTML
 * inside <div id="root"> prior to client-side hydration.
 */

import { SarkariItem } from './data/sarkariData';
import { ServiceItem } from './servicesData';

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
  const safeTitle = escapeHtml(item.title);
  const safeCategory = escapeHtml(item.category?.replace(/_/g, ' ').toUpperCase() || 'RECRUITMENT NOTICE');
  const safePostDate = escapeHtml(item.postDate || 'Recent');
  const safeStartDate = escapeHtml(item.startDate || 'Open');
  const safeLastDate = escapeHtml(item.lastDate || 'Check Notification');
  const safeAdvtNo = escapeHtml(item.advertisementNo || 'Refer to Gazette');
  const safeTotalPosts = escapeHtml(item.totalPosts || 'Open / As per rules');
  const safeAgeLimit = escapeHtml(item.ageLimit || 'As per official rules');
  const safeEligibility = escapeHtml(item.eligibility || 'Refer to official recruitment gazette');
  const safeShortInfo = escapeHtml(item.shortInfo || 'Comprehensive recruitment notification details, eligibility, important dates, and official application instructions.');
  const safeGenObc = escapeHtml(item.fees?.genObc || 'Refer to notification');
  const safeScSt = escapeHtml(item.fees?.scSt || 'Refer to notification');
  const safeOfficialLink = escapeHtml(item.officialLink || 'https://www.cscdost.com');

  return `
  <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.6;">
    <!-- Breadcrumb Navigation -->
    <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
      <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      <a href="/#sarkari-board" style="color:#2563eb; text-decoration:none;">Recruitment Updates</a>
      <span style="margin:0 6px;">/</span>
      <span style="color:#0f172a; font-weight:600;">${safeTitle}</span>
    </nav>

    <!-- Government Transparency Notice -->
    <aside style="background:#fffbeb; border-left:4px solid #f59e0b; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:20px; font-size:13px; color:#92400e;">
      <strong>Official Transparency Notice:</strong> CSC DOST (cscdost.com) is an independent private digital facilitation center operated by authorized CSC VLE Wasim Ahmad Khanday (VLE ID: 212515670018). We are <strong>not</strong> an official government recruitment board. All notifications are linked directly to official government portals.
    </aside>

    <!-- Article Header -->
    <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
        <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:10px;">
          ${safeCategory}
        </span>
        <h1 style="font-size:26px; line-height:1.3; font-weight:800; color:#0f172a; margin:0 0 12px 0;">
          ${safeTitle}
        </h1>
        <div style="font-size:13px; color:#64748b; display:flex; flex-wrap:wrap; gap:16px;">
          <span><strong>Post Date:</strong> ${safePostDate}</span>
          <span><strong>Advt No:</strong> ${safeAdvtNo}</span>
          <span><strong>Last Date to Apply:</strong> <strong style="color:#b91c1c;">${safeLastDate}</strong></span>
        </div>
      </header>

      <!-- Short Summary -->
      <section style="margin-bottom:24px;">
        <h2 style="font-size:18px; font-weight:700; color:#1e293b; margin:0 0 8px 0;">Notification Summary</h2>
        <p style="font-size:15px; color:#334155; line-height:1.7; margin:0;">
          ${safeShortInfo}
        </p>
      </section>

      <!-- Key Dates & Application Fees Table -->
      <section style="margin-bottom:24px; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
          <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0 0 10px 0;">📅 Important Dates</h3>
          <ul style="list-style:none; padding:0; margin:0; font-size:14px; color:#334155; line-height:1.8;">
            <li><strong>Notification Released:</strong> ${safePostDate}</li>
            <li><strong>Online Application Start:</strong> ${safeStartDate}</li>
            <li><strong>Last Date to Apply Online:</strong> <span style="color:#b91c1c; font-weight:700;">${safeLastDate}</span></li>
            <li><strong>Exam / Admit Card:</strong> Check official portal for schedule</li>
          </ul>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
          <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0 0 10px 0;">💳 Application Fee</h3>
          <ul style="list-style:none; padding:0; margin:0; font-size:14px; color:#334155; line-height:1.8;">
            <li><strong>General / OBC / EWS:</strong> ${safeGenObc}</li>
            <li><strong>SC / ST / PwD / Female:</strong> ${safeScSt}</li>
            <li><strong>Payment Mode:</strong> Net Banking, Debit/Credit Card, UPI through Official Gateway</li>
          </ul>
        </div>
      </section>

      <!-- Eligibility, Age Limit & Vacancies -->
      <section style="margin-bottom:24px;">
        <h2 style="font-size:18px; font-weight:700; color:#1e293b; margin:0 0 12px 0;">Eligibility Criteria &amp; Vacancy Details</h2>
        <table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left; border:1px solid #e2e8f0;">
          <tbody>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <th style="padding:10px 14px; background:#f1f5f9; width:30%; font-weight:600; color:#1e293b;">Total Vacancies</th>
              <td style="padding:10px 14px; color:#0f172a; font-weight:600;">${safeTotalPosts}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <th style="padding:10px 14px; background:#f1f5f9; font-weight:600; color:#1e293b;">Age Limit</th>
              <td style="padding:10px 14px; color:#334155;">${safeAgeLimit} (Age relaxation applicable as per government norms)</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <th style="padding:10px 14px; background:#f1f5f9; font-weight:600; color:#1e293b;">Educational Qualification</th>
              <td style="padding:10px 14px; color:#334155;">${safeEligibility}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Step-by-Step Instructions -->
      <section style="margin-bottom:28px;">
        <h2 style="font-size:18px; font-weight:700; color:#1e293b; margin:0 0 10px 0;">How to Apply Online</h2>
        <ol style="padding-left:20px; font-size:14px; color:#334155; line-height:1.8; margin:0;">
          <li>Review the complete official advertisement brochure to verify your educational eligibility and age requirements.</li>
          <li>Prepare scanned copies of your Matriculation (10th) mark sheet, identity proof (Aadhaar / Voter ID), passport photograph, and signature in accordance with board specifications.</li>
          <li>Visit the official recruiting website or authority link provided below.</li>
          <li>Complete one-time registration (OTR) or applicant login using valid mobile number and email.</li>
          <li>Fill in academic credentials, examination center preferences, and communication address accurately.</li>
          <li>Submit mandatory application fees via the secured payment gateway before the closing date: <strong>${safeLastDate}</strong>.</li>
          <li>Download and print the final application confirmation receipt for your records and examination entry.</li>
        </ol>
      </section>

      <!-- Official Links Action Section -->
      <section style="background:#f1f5f9; border-radius:10px; padding:18px; display:flex; flex-wrap:wrap; items-center; justify-content:space-between; gap:12px;">
        <div>
          <div style="font-weight:700; font-size:15px; color:#0f172a;">Official Board Portal &amp; Direct Links</div>
          <div style="font-size:13px; color:#64748b;">Verify official notification details directly on the government portal.</div>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <a href="${safeOfficialLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#2563eb; color:#ffffff; font-weight:600; font-size:14px; padding:10px 18px; border-radius:8px; text-decoration:none;">
            Official Portal / Gazette ↗
          </a>
          <a href="/apply" style="display:inline-block; background:#ffffff; color:#0f172a; border:1px solid #cbd5e1; font-weight:600; font-size:14px; padding:10px 18px; border-radius:8px; text-decoration:none;">
            Assisted Application Desk
          </a>
        </div>
      </section>
    </article>

    <!-- Footer Disclaimers -->
    <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
      <p>Published by CSC DOST | Operator: Wasim Ahmad Khanday (CSC VLE ID: 212515670018) | Sangran Qazigund, Anantnag, J&amp;K 192221</p>
      <p>
        <a href="/privacy-policy" style="color:#2563eb; text-decoration:none;">Privacy Policy</a> •
        <a href="/terms-of-service" style="color:#2563eb; text-decoration:none;">Terms of Service</a> •
        <a href="/disclaimer" style="color:#2563eb; text-decoration:none;">Disclaimer</a> •
        <a href="/contact-us" style="color:#2563eb; text-decoration:none;">Contact Helpdesk</a>
      </p>
    </footer>
  </main>
  `;
}

export function renderServiceSubstantiveHtml(service: ServiceItem): string {
  const safeName = escapeHtml(service.name);
  const safeDescription = escapeHtml(service.description);
  const safePrice = escapeHtml(service.price);
  const safeTime = escapeHtml(service.estimatedTime);
  const safeCategory = escapeHtml(service.category);
  const safeOfficialUrl = 'https://digitalseva.csc.gov.in';
  const safeDocs = Array.isArray(service.requirements) ? service.requirements : [];

  return `
  <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.6;">
    <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
      <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      <a href="/#services" style="color:#2563eb; text-decoration:none;">Citizen Services</a>
      <span style="margin:0 6px;">/</span>
      <span style="color:#0f172a; font-weight:600;">${safeName}</span>
    </nav>

    <aside style="background:#fffbeb; border-left:4px solid #f59e0b; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:20px; font-size:13px; color:#92400e;">
      <strong>Citizen Transparency Notice:</strong> CSC DOST operates as an authorized Village Level Entrepreneur (VLE ID: 212515670018) under the Digital India Common Services Center framework to provide assisted e-governance service filing and document preparation.
    </aside>

    <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
        <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:10px;">
          ${safeCategory}
        </span>
        <h1 style="font-size:26px; line-height:1.3; font-weight:800; color:#0f172a; margin:0 0 12px 0;">
          ${safeName} Application &amp; Assistance
        </h1>
        <p style="font-size:15px; color:#475569; margin:0;">
          ${safeDescription}
        </p>
      </header>

      <section style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:16px; margin-bottom:24px;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
          <div style="font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase;">Official Fee</div>
          <div style="font-size:20px; font-weight:800; color:#15803d; margin-top:4px;">${safePrice}</div>
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
          <div style="font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase;">Estimated Processing Time</div>
          <div style="font-size:20px; font-weight:800; color:#1e293b; margin-top:4px;">${safeTime}</div>
        </div>
      </section>

      <section style="margin-bottom:24px;">
        <h2 style="font-size:18px; font-weight:700; color:#1e293b; margin:0 0 12px 0;">Required Documents</h2>
        <ul style="padding-left:20px; font-size:14px; color:#334155; line-height:1.8; margin:0;">
          ${safeDocs.map(doc => `<li>${escapeHtml(doc)}</li>`).join('')}
        </ul>
      </section>

      <section style="background:#f1f5f9; border-radius:10px; padding:18px; display:flex; flex-wrap:wrap; items-center; justify-content:space-between; gap:12px;">
        <div>
          <div style="font-weight:700; font-size:15px; color:#0f172a;">Apply Online or Direct Portal</div>
          <div style="font-size:13px; color:#64748b;">Submit your application through our assisted counter or visit the official department portal.</div>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <a href="/apply?service=${encodeURIComponent(service.name)}" style="display:inline-block; background:#2563eb; color:#ffffff; font-weight:600; font-size:14px; padding:10px 18px; border-radius:8px; text-decoration:none;">
            Apply Online with CSC DOST
          </a>
          <a href="${safeOfficialUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#ffffff; color:#0f172a; border:1px solid #cbd5e1; font-weight:600; font-size:14px; padding:10px 18px; border-radius:8px; text-decoration:none;">
            Official Department Portal ↗
          </a>
        </div>
      </section>
    </article>

    <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
      <p>CSC DOST | Operator: Wasim Ahmad Khanday (VLE ID: 212515670018) | Sangran Qazigund, Anantnag, J&amp;K 192221</p>
      <p>
        <a href="/privacy-policy" style="color:#2563eb; text-decoration:none;">Privacy Policy</a> •
        <a href="/terms-of-service" style="color:#2563eb; text-decoration:none;">Terms of Service</a> •
        <a href="/disclaimer" style="color:#2563eb; text-decoration:none;">Disclaimer</a> •
        <a href="/contact-us" style="color:#2563eb; text-decoration:none;">Contact Helpdesk</a>
      </p>
    </footer>
  </main>
  `;
}

export function renderLegalPageSubstantiveHtml(pageType: string): string {
  const norm = pageType.toLowerCase();

  if (norm.includes('privacy')) {
    return `
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
          <p style="font-size:13px; color:#64748b; margin:0;">Effective Date: February 2026 • Last Reviewed &amp; Updated: October 2026</p>
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
          <p>We process citizen information exclusively for:</p>
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
    return `
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
    return `
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
          <p style="font-size:13px; color:#64748b; margin:0;">Effective Date: February 2026 • Last Reviewed &amp; Updated: October 2026</p>
        </header>

        <section style="font-size:15px; color:#334155; space-y:16px;">
          <p>
            These Terms of Service govern your access to and use of <strong>CSC DOST</strong> (<code>www.cscdost.com</code>) and services rendered at our physical CSC facilitation desk in Sangran Qazigund, J&amp;K.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">1. Nature of Services</h2>
          <p>
            CSC DOST offers citizen assistance for online application filling, document preparation, and government scheme enrollment. We charge nominal facilitation fees strictly for clerical, printing, and digital data-entry assistance in accordance with CSC e-Governance norms.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">2. Applicant Responsibility</h2>
          <p>
            Applicants are solely responsible for ensuring the accuracy and authenticity of personal details, dates of birth, educational certificates, and category claims submitted through our assistance portal. CSC DOST is not liable for rejections arising from incorrect information provided by the candidate.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">3. Payments &amp; Gateway</h2>
          <p>
            All electronic payments are processed securely via Razorpay. Official government exam fees are paid directly to designated recruitment boards. Facilitation charges are clearly itemized on payment receipts.
          </p>

          <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">4. Legal Jurisdiction</h2>
          <p>
            Any dispute arising out of or in connection with services provided by CSC DOST shall be subject to the exclusive jurisdiction of the competent courts in District Anantnag, Jammu &amp; Kashmir.
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
    return `
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
    return `
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
  return `
  <main class="ssr-article-wrapper" style="max-width:960px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.7;">
    <nav aria-label="Breadcrumb" style="font-size:13px; color:#64748b; margin-bottom:16px;">
      <a href="/" style="color:#2563eb; text-decoration:none;">Home</a>
      <span style="margin:0 6px;">/</span>
      <span style="color:#0f172a; font-weight:600;">Refund Policy</span>
    </nav>

    <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:28px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      <header style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:20px;">
        <span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:4px 10px; border-radius:6px; margin-bottom:8px;">
          Fee Policy
        </span>
        <h1 style="font-size:28px; font-weight:800; color:#0f172a; margin:0 0 8px 0;">Refund &amp; Cancellation Policy</h1>
        <p style="font-size:13px; color:#64748b; margin:0;">Effective Date: February 2026 • Last Reviewed: October 2026</p>
      </header>

      <section style="font-size:15px; color:#334155; space-y:16px;">
        <p>
          At <strong>CSC DOST</strong>, we strive to deliver transparent, reliable digital facilitation and e-governance application assistance.
        </p>
        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">1. Facilitation Fees</h2>
        <p>
          Facilitation fees paid for clerical form-filling and application assistance are refundable if the assistance request is cancelled prior to form submission on the government portal. Once an application is officially filed and an application number is generated on the government system, facilitation charges become non-refundable.
        </p>
        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">2. Government Examination &amp; Portal Fees</h2>
        <p>
          Official fees remitted directly to recruitment boards (JKSSB, SSC, UPSC, RRB) or government authorities are governed strictly by each respective department's policies and are generally non-refundable once remitted.
        </p>
        <h2 style="font-size:20px; font-weight:700; color:#0f172a; margin:24px 0 10px 0;">3. Refund Processing</h2>
        <p>
          Approved refunds will be processed to the original payment source within 5-7 business days via our payment gateway (Razorpay). For inquiries, email <a href="mailto:support@cscdost.com" style="color:#2563eb;">support@cscdost.com</a> with your transaction token.
        </p>
      </section>
    </article>

    <footer style="margin-top:30px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
      <p>CSC DOST (cscdost.com) | Authorized CSC VLE ID: 212515670018 | Sangran Qazigund, Anantnag, J&amp;K</p>
    </footer>
  </main>
  `;
}

export function renderHomepageSubstantiveHtml(posts: SarkariItem[], services: ServiceItem[]): string {
  const topPosts = posts.slice(0, 15);
  const topServices = services.slice(0, 8);

  return `
  <main class="ssr-homepage-wrapper" style="max-width:1100px; margin:0 auto; padding:24px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif; color:#0f172a; line-height:1.6;">
    <!-- Hero Banner -->
    <header style="background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color:#ffffff; border-radius:16px; padding:32px 24px; margin-bottom:28px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#93c5fd; margin-bottom:8px;">
        Authorized CSC Village Level Entrepreneur • VLE ID: 212515670018
      </div>
      <h1 style="font-size:32px; font-weight:800; line-height:1.2; margin:0 0 12px 0;">
        CSC DOST – Independent Digital Assistance &amp; Citizen Information Portal
      </h1>
      <p style="font-size:16px; color:#e0e7ff; max-width:800px; line-height:1.6; margin:0 0 20px 0;">
        Fast, verified recruitment updates (JKSSB, Indian Army, SSC, RRB), central scheme guides (PM-KISAN, Ayushman Bharat PM-JAY, Aadhaar, PAN card), and free citizen document preparation tools.
      </p>
      <div style="display:flex; flex-wrap:wrap; gap:12px; font-size:14px;">
        <a href="#sarkari-board" style="background:#ffffff; color:#1e3a8a; font-weight:700; padding:10px 20px; border-radius:8px; text-decoration:none;">
          Browse Latest Jobs
        </a>
        <a href="/tools" style="background:rgba(255,255,255,0.15); color:#ffffff; font-weight:600; padding:10px 20px; border-radius:8px; text-decoration:none; border:1px solid rgba(255,255,255,0.3);">
          Online Document Tools
        </a>
        <a href="/track" style="background:rgba(255,255,255,0.15); color:#ffffff; font-weight:600; padding:10px 20px; border-radius:8px; text-decoration:none; border:1px solid rgba(255,255,255,0.3);">
          Track Application
        </a>
      </div>
    </header>

    <!-- Government Transparency Notice -->
    <aside style="background:#fffbeb; border-left:4px solid #f59e0b; padding:12px 16px; border-radius:0 8px 8px 0; margin-bottom:28px; font-size:13px; color:#92400e;">
      <strong>Official Transparency Notice:</strong> CSC DOST (cscdost.com) is an independent private digital facilitation center operated by CSC VLE Wasim Ahmad Khanday in Sangran Qazigund, Anantnag, J&amp;K. We are <strong>NOT</strong> an official government website. Official portals end with <code style="background:#fef3c7; padding:2px 4px; border-radius:3px;">.gov.in</code> or <code style="background:#fef3c7; padding:2px 4px; border-radius:3px;">.nic.in</code>.
    </aside>

    <!-- Latest Recruitment Notifications -->
    <section id="sarkari-board" style="margin-bottom:36px;">
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:16px;">
        <h2 style="font-size:22px; font-weight:800; color:#0f172a; margin:0;">
          Latest Sarkari Jobs &amp; Notifications
        </h2>
        <span style="font-size:13px; color:#64748b;">Updated Daily</span>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:16px;">
        ${topPosts.map(post => `
          <article style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:11px; font-weight:700; color:#2563eb; background:#eff6ff; padding:3px 8px; border-radius:4px; text-transform:uppercase;">
                  ${escapeHtml(post.category?.replace(/_/g, ' '))}
                </span>
                <span style="font-size:12px; color:#b91c1c; font-weight:600;">Last Date: ${escapeHtml(post.lastDate)}</span>
              </div>
              <h3 style="font-size:16px; font-weight:700; line-height:1.35; margin:0 0 8px 0;">
                <a href="/post/${escapeHtml(post.id)}" style="color:#0f172a; text-decoration:none;">
                  ${escapeHtml(post.title)}
                </a>
              </h3>
              <p style="font-size:13px; color:#475569; line-height:1.5; margin:0 0 12px 0;">
                ${escapeHtml((post.shortInfo || '').slice(0, 110))}...
              </p>
            </div>
            <div style="border-top:1px solid #f1f5f9; padding-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:12px;">
              <span style="color:#64748b;">Posts: <strong>${escapeHtml(post.totalPosts || 'Open')}</strong></span>
              <a href="/post/${escapeHtml(post.id)}" style="color:#2563eb; font-weight:600; text-decoration:none;">
                View Details &amp; Apply →
              </a>
            </div>
          </article>
        `).join('')}
      </div>
    </section>

    <!-- Core Citizen Services -->
    <section id="services" style="margin-bottom:36px;">
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:16px;">
        <h2 style="font-size:22px; font-weight:800; color:#0f172a; margin:0;">
          Citizen E-Governance Services
        </h2>
        <span style="font-size:13px; color:#64748b;">Assisted Digital Counter</span>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:14px;">
        ${topServices.map(service => `
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:16px;">
            <div style="font-size:11px; font-weight:600; color:#15803d; text-transform:uppercase; margin-bottom:4px;">${escapeHtml(service.category)}</div>
            <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0 0 6px 0;">
              <a href="/service/${escapeHtml(service.id)}" style="color:#0f172a; text-decoration:none;">${escapeHtml(service.name)}</a>
            </h3>
            <p style="font-size:12px; color:#64748b; line-height:1.4; margin:0 0 10px 0;">${escapeHtml(service.description.slice(0, 85))}...</p>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px;">
              <span style="font-weight:700; color:#0f172a;">${escapeHtml(service.price)}</span>
              <a href="/service/${escapeHtml(service.id)}" style="color:#2563eb; font-weight:600; text-decoration:none;">View Service →</a>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Frequently Asked Questions -->
    <section style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:24px; margin-bottom:36px;">
      <h2 style="font-size:20px; font-weight:800; color:#0f172a; margin:0 0 16px 0;">Frequently Asked Questions</h2>
      <div style="space-y:14px;">
        <div style="margin-bottom:14px;">
          <h3 style="font-size:15px; font-weight:700; color:#1e293b; margin:0 0 4px 0;">What is CSC DOST?</h3>
          <p style="font-size:14px; color:#475569; margin:0;">
            CSC DOST (cscdost.com) is an independent citizen assistance portal and information desk operated by authorized CSC Village Level Entrepreneur Wasim Ahmad Khanday in Sangran Qazigund, Anantnag, Jammu &amp; Kashmir.
          </p>
        </div>
        <div>
          <h3 style="font-size:15px; font-weight:700; color:#1e293b; margin:0 0 4px 0;">Is CSC DOST an official government website?</h3>
          <p style="font-size:14px; color:#475569; margin:0;">
            No. CSC DOST is a private digital facilitation center and information portal. We are NOT an official government website. Official government portals include csc.gov.in, digitalseva.csc.gov.in, and jkssb.nic.in.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer Links -->
    <footer style="border-top:1px solid #e2e8f0; padding-top:20px; text-align:center; font-size:13px; color:#64748b; line-height:1.8;">
      <p style="margin:0 0 8px 0;">
        <a href="/about-us" style="color:#2563eb; text-decoration:none; margin:0 8px;">About Us</a> |
        <a href="/contact-us" style="color:#2563eb; text-decoration:none; margin:0 8px;">Contact Helpdesk</a> |
        <a href="/privacy-policy" style="color:#2563eb; text-decoration:none; margin:0 8px;">Privacy Policy (DPDP Act)</a> |
        <a href="/terms-of-service" style="color:#2563eb; text-decoration:none; margin:0 8px;">Terms of Service</a> |
        <a href="/disclaimer" style="color:#2563eb; text-decoration:none; margin:0 8px;">Disclaimer</a> |
        <a href="/refund-policy" style="color:#2563eb; text-decoration:none; margin:0 8px;">Refund Policy</a>
      </p>
      <p style="margin:0; font-size:12px;">© 2026 CSC DOST • Operator: Wasim Ahmad Khanday (CSC VLE ID: 212515670018) • Sangran Qazigund, Anantnag, J&amp;K 192221</p>
    </footer>
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
        <a href="/#sarkari-board" style="display:inline-block; background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
          Latest Sarkari Jobs
        </a>
      </div>
    </div>
  </main>
  `;
}
