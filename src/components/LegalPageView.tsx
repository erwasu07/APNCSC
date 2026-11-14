import React, { useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  Info,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Award,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Breadcrumbs } from './ui/Breadcrumbs';
import { Card } from './ui/Card';

export type LegalPageType =
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'disclaimer'
  | 'refund';

interface LegalPageViewProps {
  pageType: LegalPageType;
  onNavigate: (type: LegalPageType) => void;
  onBackToHome: () => void;
}

export const LEGAL_PAGE_CONFIG: Record<
  LegalPageType,
  { title: string; metaTitle: string; path: string }
> = {
  about: {
    title: 'About CSC DOST',
    metaTitle: 'About Us | CSC DOST - Authorized CSC VLE Digital Assistance Center',
    path: '/about-us',
  },
  contact: {
    title: 'Contact Us & Citizen Helpdesk',
    metaTitle: 'Contact Us & Help Desk | CSC DOST Support Center',
    path: '/contact-us',
  },
  privacy: {
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy | CSC DOST - Digital Assistance & Information Portal',
    path: '/privacy-policy',
  },
  terms: {
    title: 'Terms of Service & Citizen Agreement',
    metaTitle: 'Terms of Service | CSC DOST - Citizen E-Governance Assistance',
    path: '/terms-of-service',
  },
  disclaimer: {
    title: 'Disclaimer & Government Non-Affiliation',
    metaTitle: 'Disclaimer & Government Non-Affiliation | CSC DOST',
    path: '/disclaimer',
  },
  refund: {
    title: 'Refund & Cancellation Policy',
    metaTitle: 'Refund & Cancellation Policy | CSC DOST',
    path: '/refund-policy',
  },
};

export default function LegalPageView({
  pageType,
  onNavigate,
  onBackToHome,
}: LegalPageViewProps) {
  const { t } = useLanguage();
  const safePageType: LegalPageType =
    pageType && LEGAL_PAGE_CONFIG[pageType] ? pageType : 'privacy';
  const currentConfig = LEGAL_PAGE_CONFIG[safePageType];

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  }, [safePageType]);

  const navItems: { type: LegalPageType; label: string; icon: React.ReactNode }[] = [
    { type: 'about', label: 'About Us', icon: <Info className="w-4 h-4 shrink-0" /> },
    { type: 'contact', label: 'Contact Helpdesk', icon: <Phone className="w-4 h-4 shrink-0" /> },
    { type: 'privacy', label: 'Privacy Policy', icon: <ShieldCheck className="w-4 h-4 shrink-0" /> },
    { type: 'terms', label: 'Terms of Service', icon: <FileText className="w-4 h-4 shrink-0" /> },
    { type: 'disclaimer', label: 'Disclaimer', icon: <AlertTriangle className="w-4 h-4 shrink-0" /> },
    { type: 'refund', label: 'Refund Policy', icon: <RotateCcw className="w-4 h-4 shrink-0" /> },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-0 py-4 sm:py-2 space-y-6 text-start text-[var(--text-primary)]">
      {/* Shared Breadcrumbs & Back to Portal */}
      <Breadcrumbs
        items={[
          { label: t.navHome, href: '/' },
          { label: currentConfig.title },
        ]}
        onNavigate={() => onBackToHome()}
        rightSlot={
          <button
            type="button"
            onClick={onBackToHome}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            <span>Back to Portal</span>
          </button>
        }
      />

      {/* Government Non-Affiliation Trust Notice */}
      <aside
        aria-label="Official Transparency Notice"
        className="bg-[var(--status-closing-bg)] border border-[var(--status-closing-border)] border-s-4 border-s-[var(--status-closing-stripe)] p-4 rounded-e-xl text-sm sm:text-base text-[var(--text-primary)]"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="w-5 h-5 text-[var(--status-closing-text)] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <p className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-xs m-0">
              Official Transparency Notice
            </p>
            <p className="mt-1 leading-relaxed text-sm sm:text-base text-[var(--text-secondary)] m-0">
              <strong className="text-[var(--text-primary)]">CSC DOST (cscdost.com)</strong> is an
              independent digital facilitation and citizen information portal operated by authorized
              CSC Village Level Entrepreneur (VLE){' '}
              <strong className="text-[var(--text-primary)]">Wasim Ahmad Khanday</strong> (VLE ID:{' '}
              <strong className="text-[var(--text-primary)]">212515670018</strong>). We are{' '}
              <strong className="text-[var(--text-primary)]">NOT</strong> an official government
              website or a representative of any government department. All official recruitment and
              scheme notifications are linked to their respective government portals (
              <code className="bg-[var(--bg-card)] border border-[var(--border-default)] px-1.5 py-0.5 rounded text-[var(--text-primary)] font-mono text-xs">
                .gov.in / .nic.in
              </code>
              ).
            </p>
          </div>
        </div>
      </aside>

      {/* Policy Tab Navigation */}
      <nav
        aria-label="Static Policy Pages"
        className="flex flex-wrap gap-2 pb-4 border-b border-[var(--border-default)]"
      >
        {navItems.map((item) => {
          const isActive = safePageType === item.type;
          const targetHref = LEGAL_PAGE_CONFIG[item.type].path;
          return (
            <a
              key={item.type}
              href={targetHref}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.type);
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors no-underline ${
                isActive
                  ? 'bg-[#101A36] text-white shadow-xs border border-[#101A36]'
                  : 'bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-default)]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Main Content Card */}
      <Card className="p-5 sm:p-8 lg:p-10 shadow-xs">
        {safePageType === 'about' && <AboutContent />}
        {safePageType === 'contact' && <ContactContent />}
        {safePageType === 'privacy' && <PrivacyContent />}
        {safePageType === 'terms' && <TermsContent />}
        {safePageType === 'disclaimer' && <DisclaimerContent />}
        {safePageType === 'refund' && <RefundContent />}
      </Card>
    </div>
  );
}

function AboutContent() {
  return (
    <article className="space-y-6">
      <header className="border-b border-[var(--border-default)] pb-6">
        <div className="flex items-center gap-2 text-[var(--status-exam-text)] font-semibold text-xs tracking-wider uppercase mb-2">
          <Building2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Operator Profile &amp; Mission</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight m-0">
          About CSC DOST (cscdost.com)
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-2 m-0">
          Last Reviewed &amp; Verified: October 2026 • Published by CSC VLE Wasim Ahmad Khanday
        </p>
      </header>

      <section className="space-y-6 text-[var(--text-secondary)] leading-relaxed text-base">
        <p>
          Welcome to <strong className="text-[var(--text-primary)]">CSC DOST</strong> (operating
          digitally at{' '}
          <code className="bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded font-mono text-sm text-[var(--text-primary)]">
            www.cscdost.com
          </code>
          ), an independent citizen assistance, e-governance facilitation, and informational guidance
          platform.
        </p>
        <p>
          CSC DOST was established to bridge the digital divide between rural/semi-urban citizens
          and modern digital e-governance systems. Millions of candidates and families across Jammu
          &amp; Kashmir and India face technical barriers, complex form-filling requirements, strict
          image compression criteria, and unfamiliar payment gateways when applying for
          recruitments, competitive examinations, scholarship schemes, or welfare programs. CSC DOST
          offers verified guides, step-by-step assistance, and direct links to official
          authorities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="bg-[var(--status-exam-bg)] border border-[var(--status-exam-border)] p-5 rounded-xl">
            <div className="flex items-center gap-2 text-[var(--status-exam-text)] font-bold mb-2">
              <Award className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>Certified CSC Entrepreneur</span>
            </div>
            <ul className="text-sm space-y-1.5 text-[var(--text-secondary)] list-none p-0 m-0">
              <li>
                <strong className="text-[var(--text-primary)]">Lead Operator:</strong> Wasim Ahmad
                Khanday
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">CSC VLE ID:</strong> 212515670018
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Physical Center:</strong> Sangran
                Qazigund, District Anantnag, J&amp;K (PIN: 192221)
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Contact:</strong> +91 70068 33767
              </li>
            </ul>
          </div>

          <div className="bg-[var(--status-open-bg)] border border-[var(--status-open-border)] p-5 rounded-xl">
            <div className="flex items-center gap-2 text-[var(--status-open-text)] font-bold mb-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>Editorial &amp; Verification Ethics</span>
            </div>
            <ul className="text-sm space-y-1.5 text-[var(--text-secondary)] list-none p-0 m-0">
              <li>
                <strong className="text-[var(--text-primary)]">Primary Sources:</strong> Official
                gazettes &amp; government portals only
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Zero Clickbait:</strong> Exact
                advertisement dates, age limits, and fees
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Data Safety:</strong> Zero document
                resale or third-party marketing
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Direct Portals:</strong> Explicit
                redirection to official authority links
              </li>
            </ul>
          </div>
        </div>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          Core Services Provided
        </h2>
        <ul className="list-disc ps-5 space-y-2 text-[var(--text-secondary)]">
          <li>
            <strong className="text-[var(--text-primary)]">
              Recruitment Bulletin &amp; Sarkari Results:
            </strong>{' '}
            Daily verified updates on Indian Army, RRB Railways, SSC Staff Selection Commission,
            JKSSB, Kashmir University admissions, and Cluster University Srinagar notices.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Citizen E-Governance Guidance:</strong>{' '}
            Educational walkthroughs for PAN card registration, Aadhaar address correction, Ayushman
            Bharat PM-JAY Golden Card issuance, PM-KISAN e-KYC, and state domicile certificates.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Browser-Based Document Tools:</strong>{' '}
            Free client-side image resizers, photo signature joiners, and document optimizers
            designed to meet exact government pixel and kilobyte specifications without sending
            files to private external servers.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">
              VLE Appointment &amp; Assisted Submission:
            </strong>{' '}
            Optional citizen facilitation where applicants who cannot complete complex online forms
            can book physical or virtual assistance from our certified VLE center.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          Strict Non-Affiliation Declaration
        </h2>
        <p>
          CSC DOST is operated as an independent Common Services Center (CSC) digital kiosk by Wasim
          Ahmad Khanday. We are <strong className="text-[var(--text-primary)]">not</strong> an
          agency, affiliate, branch, or representative of the Government of India, the Government of
          Jammu &amp; Kashmir, or any recruitment board (including UPSC, SSC, RRB, or JKSSB). For
          official policies, visit the central CSC portal at{' '}
          <a
            href="https://digitalseva.csc.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1F9D6B] underline font-semibold"
          >
            digitalseva.csc.gov.in
          </a>{' '}
          or the National Government Portal of India at{' '}
          <a
            href="https://india.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1F9D6B] underline font-semibold"
          >
            india.gov.in
          </a>
          .
        </p>
      </section>
    </article>
  );
}

function ContactContent() {
  return (
    <article className="space-y-6">
      <header className="border-b border-[var(--border-default)] pb-6">
        <div className="flex items-center gap-2 text-[var(--status-exam-text)] font-semibold text-xs tracking-wider uppercase mb-2">
          <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Helpdesk &amp; Citizen Support</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight m-0">
          Contact Us &amp; Physical Center Details
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-2 m-0">
          We are available to assist citizens with technical questions, application tracking, and
          grievances.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--bg-subtle)] border border-[var(--border-default)] p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 m-0">
            <Building2 className="w-5 h-5 text-[var(--status-exam-text)] shrink-0" aria-hidden="true" />
            <span>Physical Facilitation Center</span>
          </h2>
          <div className="text-sm space-y-2.5 text-[var(--text-secondary)]">
            <p className="flex items-start gap-2 m-0">
              <MapPin className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-1" aria-hidden="true" />
              <span>
                <strong className="text-[var(--text-primary)]">Address:</strong> CSC DOST Facilitation
                Desk, Sangran Qazigund, District Anantnag, Jammu &amp; Kashmir, PIN: 192221, India
              </span>
            </p>
            <p className="flex items-center gap-2 m-0">
              <Award className="w-4 h-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
              <span>
                <strong className="text-[var(--text-primary)]">CSC VLE ID:</strong> 212515670018
              </span>
            </p>
            <p className="flex items-center gap-2 m-0">
              <Info className="w-4 h-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
              <span>
                <strong className="text-[var(--text-primary)]">Operator:</strong> Wasim Ahmad Khanday
              </span>
            </p>
            <p className="m-0">
              <strong className="text-[var(--text-primary)]">Working Hours:</strong> Monday –
              Saturday: 9:00 AM – 7:00 PM IST (Closed Sundays &amp; National Holidays)
            </p>
          </div>
        </div>

        <div className="bg-[var(--bg-subtle)] border border-[var(--border-default)] p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 m-0">
            <Mail className="w-5 h-5 text-[#1F9D6B] shrink-0" aria-hidden="true" />
            <span>Electronic Helpdesk &amp; Inquiries</span>
          </h2>
          <div className="text-sm space-y-2.5 text-[var(--text-secondary)]">
            <p className="flex items-center gap-2 m-0">
              <Phone className="w-4 h-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
              <span>
                <strong className="text-[var(--text-primary)]">Phone / Helpline:</strong>{' '}
                <a
                  href="tel:+917006833767"
                  dir="ltr"
                  className="text-[#1F9D6B] font-semibold hover:underline"
                >
                  +91 70068 33767
                </a>
              </span>
            </p>
            <p className="flex items-center gap-2 m-0">
              <Mail className="w-4 h-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
              <span>
                <strong className="text-[var(--text-primary)]">Support Email:</strong>{' '}
                <a
                  href="mailto:support@cscdost.com"
                  className="text-[#1F9D6B] font-semibold hover:underline"
                >
                  support@cscdost.com
                </a>
              </span>
            </p>
            <p className="flex items-center gap-2 m-0">
              <ShieldCheck className="w-4 h-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
              <span>
                <strong className="text-[var(--text-primary)]">Grievance Officer:</strong> Wasim Ahmad
                Khanday (
                <a
                  href="mailto:wasimkhanday@gmail.com"
                  className="text-[#1F9D6B] font-semibold hover:underline"
                >
                  wasimkhanday@gmail.com
                </a>
                )
              </span>
            </p>
            <p className="m-0">
              <strong className="text-[var(--text-primary)]">Standard Response Time:</strong> Within
              24-48 business hours for all citizen inquiries.
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-4 text-[var(--text-secondary)] leading-relaxed text-base">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Application Assistance &amp; Tracking Inquiries
        </h2>
        <p>
          If you submitted an appointment or assistance request through our online portal, you can
          monitor its progress in real-time using our live tracking desk at{' '}
          <code className="bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded font-mono text-sm text-[var(--text-primary)]">
            https://www.cscdost.com/track
          </code>{' '}
          using your assigned Application Tracking Token (e.g.{' '}
          <code className="bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded font-mono text-sm text-[var(--text-primary)]">
            CSC-XXXXXXXX
          </code>
          ).
        </p>
        <p>
          For urgent queries regarding fee payments, document verification, or portal technical
          errors, please reach out directly via WhatsApp helpline at{' '}
          <strong className="text-[var(--text-primary)]">+91 70068 33767</strong> with your
          tracking ID.
        </p>
      </section>
    </article>
  );
}

function PrivacyContent() {
  return (
    <article className="space-y-6">
      <header className="border-b border-[var(--border-default)] pb-6">
        <div className="flex items-center gap-2 text-[var(--status-exam-text)] font-semibold text-xs tracking-wider uppercase mb-2">
          <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Legal Compliance &amp; DPDP Act 2023</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight m-0">
          Privacy Policy
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-2 m-0">
          Effective Date: February 2026 • Last Reviewed: October 2026
        </p>
      </header>

      <section className="space-y-6 text-[var(--text-secondary)] leading-relaxed text-base">
        <p>
          At <strong className="text-[var(--text-primary)]">CSC DOST</strong> (accessible from{' '}
          <code className="bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded font-mono text-sm text-[var(--text-primary)]">
            https://www.cscdost.com
          </code>
          ), the privacy and digital security of our visitors and applicants is of paramount
          importance. This Privacy Policy document outlines the types of personal information that is
          collected and recorded by CSC DOST and how we use, safeguard, and disclose it in strict
          accordance with the{' '}
          <strong className="text-[var(--text-primary)]">
            Digital Personal Data Protection (DPDP) Act, 2023
          </strong>{' '}
          and the{' '}
          <strong className="text-[var(--text-primary)]">Information Technology Act, 2000</strong>.
        </p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          1. Scope and Applicability
        </h2>
        <p>
          This policy applies to all visitors, applicants, and registered users of our website, web
          push notifications, and physical facilitation counter. By utilizing our services or
          accessing our site, you consent to the data practices described herein.
        </p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          2. Information We Collect
        </h2>
        <ul className="list-disc ps-5 space-y-2">
          <li>
            <strong className="text-[var(--text-primary)]">Informational Visitors:</strong> We
            collect standard, anonymous server log files (IP addresses, browser type, referring
            pages, date/time stamps) strictly for aggregate security analytics and system health
            monitoring.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Assisted Form Applicants:</strong> When
            you voluntarily submit an application assistance request, we collect only necessary
            personal data: Full Name, Father's Name, Date of Birth, Gender, Mobile Number, Email
            Address, and uploaded proof documents (e.g. Matriculation diploma, Domicile certificate,
            Photograph, Signature).
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Web Push Subscribers:</strong> If you
            grant browser notification permissions, we store your anonymous cryptographic Web Push
            subscription endpoint and keys to deliver official job notifications and exam alerts. No
            identity data is associated with push tokens.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Payment Information:</strong> Online fee
            transactions are processed directly by{' '}
            <strong className="text-[var(--text-primary)]">
              Razorpay (PCI-DSS Level 1 compliant gateway)
            </strong>
            . CSC DOST does <strong className="text-[var(--text-primary)]">not</strong> collect,
            store, or view your debit/credit card numbers, CVVs, net-banking passwords, or UPI PINs.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          3. Purpose and Legal Basis for Processing
        </h2>
        <p>
          We collect and process your information exclusively for the following lawful purposes:
        </p>
        <ul className="list-disc ps-5 space-y-2">
          <li>
            Assisting you in submitting your form to the designated official government portal
            (e.g., JKSSB, SSC, University of Kashmir).
          </li>
          <li>
            Providing real-time application status updates and payment receipts via SMS, WhatsApp,
            and Web Push notifications.
          </li>
          <li>
            Complying with mandatory record-keeping requirements under the CSC e-Governance Services
            India scheme.
          </li>
          <li>Preventing fraudulent submissions, spam, and cyber threats.</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          4. Client-Side Document Tools Data Isolation
        </h2>
        <p>
          Our browser-based document resizing, signature joining, and PDF generation tools operate{' '}
          <strong className="text-[var(--text-primary)]">
            entirely inside your local web browser
          </strong>{' '}
          via HTML5 Canvas and WebAssembly. Your photos, signatures, and certificates are never
          uploaded to our servers when utilizing these offline utilities.
        </p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          5. Third-Party Advertising &amp; Google AdSense
        </h2>
        <p>
          We use Google AdSense (Publisher ID:{' '}
          <code className="bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded font-mono text-sm text-[var(--text-primary)]">
            ca-pub-3600904217061779
          </code>
          ) to serve contextual and interest-based advertisements that support our free educational
          articles and recruitment bulletins. Google uses cookies, including the DoubleClick DART
          cookie, to serve ads to users based on their visits to this and other websites on the
          Internet.
        </p>
        <p>
          Users may opt out of personalized advertising by visiting{' '}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1F9D6B] underline font-semibold"
          >
            Google Ads Settings
          </a>{' '}
          or through the{' '}
          <a
            href="https://aboutads.info"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1F9D6B] underline font-semibold"
          >
            Network Advertising Initiative Opt-Out Page
          </a>
          .
        </p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          6. Data Retention and Erasure
        </h2>
        <p>
          Application records and uploaded documents are retained securely for a period of up to 180
          days after application processing to permit verification and candidate support, after which
          they are systematically purged from our encrypted storage. Citizens may request immediate
          deletion of their personal records by emailing{' '}
          <strong className="text-[var(--text-primary)]">support@cscdost.com</strong> with their
          tracking token.
        </p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          7. Contact &amp; Grievance Redressal Officer
        </h2>
        <p>
          For inquiries or grievance redressal concerning this policy, contact our Data Grievance
          Officer:
        </p>
        <div className="bg-[var(--bg-subtle)] border border-[var(--border-default)] p-4 rounded-xl text-sm space-y-1">
          <p className="m-0">
            <strong className="text-[var(--text-primary)]">Officer:</strong> Wasim Ahmad Khanday
          </p>
          <p className="m-0">
            <strong className="text-[var(--text-primary)]">Designation:</strong> Lead VLE &amp;
            Operator, CSC DOST
          </p>
          <p className="m-0">
            <strong className="text-[var(--text-primary)]">Email:</strong> support@cscdost.com /
            wasimkhanday@gmail.com
          </p>
          <p className="m-0">
            <strong className="text-[var(--text-primary)]">Address:</strong> Sangran Qazigund,
            District Anantnag, Jammu &amp; Kashmir 192221
          </p>
        </div>
      </section>
    </article>
  );
}

function TermsContent() {
  return (
    <article className="space-y-6">
      <header className="border-b border-[var(--border-default)] pb-6">
        <div className="flex items-center gap-2 text-[var(--status-exam-text)] font-semibold text-xs tracking-wider uppercase mb-2">
          <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Citizen Agreement</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight m-0">
          Terms of Service &amp; User Agreement
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-2 m-0">
          Effective Date: February 2026 • Last Reviewed: October 2026
        </p>
      </header>

      <section className="space-y-6 text-[var(--text-secondary)] leading-relaxed text-base">
        <p>
          These Terms of Service govern your access to and use of{' '}
          <strong className="text-[var(--text-primary)]">CSC DOST</strong> (
          <code className="bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded font-mono text-sm text-[var(--text-primary)]">
            www.cscdost.com
          </code>
          ) and services rendered at our physical CSC facilitation desk in Sangran Qazigund,
          J&amp;K.
        </p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          1. Nature of Portal and Scope of Service
        </h2>
        <p>
          CSC DOST operates as an authorized independent Common Services Center (CSC) kiosk under
          CSC e-Governance Services India Limited. We provide informational articles, recruitment
          updates, client-side document processing tools, and voluntary application facilitation.
        </p>
        <p>
          <strong className="text-[var(--text-primary)]">We are not a government agency.</strong> We
          do not formulate government policies, issue exam admit cards, evaluate answers, or make
          recruitment decisions. The decision to accept, reject, or schedule examinations rests
          exclusively with the relevant government or university authorities (e.g., UPSC, SSC, RRB,
          JKSSB, Kashmir University).
        </p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          2. Applicant Responsibilities and Accuracy of Data
        </h2>
        <ul className="list-disc ps-5 space-y-2">
          <li>
            Applicants are solely responsible for verifying their eligibility criteria (such as
            minimum education qualification, age limits, and category reservations) against the
            original official notification issued by the respective authority.
          </li>
          <li>
            You warrant that all information, photographs, certificates, and details submitted
            through our assisted application portal are authentic, complete, and legally valid.
          </li>
          <li>
            Submitting forged documents or false statements is punishable under the Bharatiya Nyaya
            Sanhita (BNS) and the IT Act. CSC DOST reserves the right to cancel fraudulent requests
            without refund.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          3. Fees and Service Charges
        </h2>
        <p>Fees displayed on CSC DOST for assisted application submissions comprise:</p>
        <ol className="list-decimal ps-5 space-y-2">
          <li>
            <strong className="text-[var(--text-primary)]">Official Government Fee:</strong> The
            statutory application or examination fee mandated by the issuing authority.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">
              CSC Facilitation / Operator Charge:
            </strong>{' '}
            A nominal convenience fee for document scanning, image formatting, data entry, and
            printing services in compliance with prescribed CSC norms.
          </li>
        </ol>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          4. Limitation of Liability
        </h2>
        <p>
          While we exercise reasonable diligence to accurately submit applications before official
          deadlines, CSC DOST shall not be held liable for:
        </p>
        <ul className="list-disc ps-5 space-y-2">
          <li>
            Server downtime, slowdowns, or technical failures on third-party government websites
            (e.g. JKSSB, SSC, RRB servers crashing during the final hours of application closing).
          </li>
          <li>
            Late applications submitted to our desk less than 6 hours prior to official server
            cutoffs.
          </li>
          <li>
            Rejection of applications by government authorities due to disqualifying criteria or
            biometric discrepancies.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          5. Governing Law and Jurisdiction
        </h2>
        <p>
          These terms and any disputes arising out of the use of CSC DOST shall be governed by and
          construed in accordance with the laws of India, subject to the exclusive jurisdiction of
          the competent courts in District Anantnag, Jammu &amp; Kashmir.
        </p>
      </section>
    </article>
  );
}

function DisclaimerContent() {
  return (
    <article className="space-y-6">
      <header className="border-b border-[var(--border-default)] pb-6">
        <div className="flex items-center gap-2 text-[var(--status-closing-text)] font-semibold text-xs tracking-wider uppercase mb-2">
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Non-Government Declaration</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight m-0">
          Disclaimer &amp; Government Non-Affiliation
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-2 m-0">
          Public Disclosure in Compliance with E-Commerce &amp; Advertising Guidelines
        </p>
      </header>

      <section className="space-y-6 text-[var(--text-secondary)] leading-relaxed text-base">
        <div className="bg-[var(--status-closing-bg)] border border-[var(--status-closing-border)] border-s-4 border-s-[var(--status-closing-stripe)] p-4 rounded-e-xl mb-6">
          <p className="font-bold text-[var(--text-primary)] text-sm uppercase m-0">
            Key Legal Declaration
          </p>
          <p className="text-[var(--text-secondary)] text-sm mt-1 m-0">
            <strong className="text-[var(--text-primary)]">CSC DOST (cscdost.com)</strong> is{' '}
            <strong className="text-[var(--text-primary)]">NOT</strong> an official government
            website, agency, or department. It is an independent private educational and digital
            facilitation website operated by authorized CSC VLE Wasim Ahmad Khanday (CSC VLE ID:
            212515670018).
          </p>
        </div>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          1. Informational and Educational Purpose Only
        </h2>
        <p>
          All information published on this website—including recruitment notifications, syllabus
          details, exam dates, answer keys, cutoff marks, and government schemes—is compiled solely
          for the educational guidance and convenience of job-seekers and citizens.
        </p>
        <p>
          Although we strive to verify every notice from official gazettes and portals, errors or
          subsequent changes by government authorities may occur. CSC DOST does not guarantee the
          absolute accuracy, completeness, or timeliness of any published material.
        </p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          2. Verify From Official Government Portals
        </h2>
        <p>
          Citizens are strongly advised to always cross-verify all notifications, recruitment rules,
          eligibility criteria, and fee structures from the original advertisement published on the
          respective official government portals:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6 text-xs sm:text-sm">
          <div className="border border-[var(--border-default)] p-3.5 rounded-xl bg-[var(--bg-subtle)]">
            <span className="font-bold text-[var(--text-primary)] block">
              J&amp;K Services Selection Board
            </span>
            <a
              href="https://jkssb.nic.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F9D6B] hover:underline inline-flex items-center gap-1 mt-1 font-mono font-semibold"
            >
              jkssb.nic.in <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
          <div className="border border-[var(--border-default)] p-3.5 rounded-xl bg-[var(--bg-subtle)]">
            <span className="font-bold text-[var(--text-primary)] block">
              Staff Selection Commission
            </span>
            <a
              href="https://ssc.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F9D6B] hover:underline inline-flex items-center gap-1 mt-1 font-mono font-semibold"
            >
              ssc.gov.in <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
          <div className="border border-[var(--border-default)] p-3.5 rounded-xl bg-[var(--bg-subtle)]">
            <span className="font-bold text-[var(--text-primary)] block">
              Railway Recruitment Boards
            </span>
            <a
              href="https://rrbapply.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F9D6B] hover:underline inline-flex items-center gap-1 mt-1 font-mono font-semibold"
            >
              rrbapply.gov.in <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
          <div className="border border-[var(--border-default)] p-3.5 rounded-xl bg-[var(--bg-subtle)]">
            <span className="font-bold text-[var(--text-primary)] block">
              Indian Army Join Portal
            </span>
            <a
              href="https://joinindianarmy.nic.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F9D6B] hover:underline inline-flex items-center gap-1 mt-1 font-mono font-semibold"
            >
              joinindianarmy.nic.in <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
          <div className="border border-[var(--border-default)] p-3.5 rounded-xl bg-[var(--bg-subtle)]">
            <span className="font-bold text-[var(--text-primary)] block">
              University of Kashmir
            </span>
            <a
              href="https://kashmiruniversity.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F9D6B] hover:underline inline-flex items-center gap-1 mt-1 font-mono font-semibold"
            >
              kashmiruniversity.net <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
          <div className="border border-[var(--border-default)] p-3.5 rounded-xl bg-[var(--bg-subtle)]">
            <span className="font-bold text-[var(--text-primary)] block">
              Cluster University Srinagar
            </span>
            <a
              href="https://cusrinagar.edu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F9D6B] hover:underline inline-flex items-center gap-1 mt-1 font-mono font-semibold"
            >
              cusrinagar.edu.in <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        </div>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          3. Trademark &amp; Copyright Ownership
        </h2>
        <p>
          All trademarks, logos, acronyms, and service marks (such as SSC, UPSC, RRB, JKSSB, UIDAI,
          CSC) mentioned on this website belong to their respective government departments, statutory
          boards, or organizations. They are referenced here strictly under the doctrine of{' '}
          <strong className="text-[var(--text-primary)]">nominative fair use</strong> for
          identification and citizen navigation purposes.
        </p>
      </section>
    </article>
  );
}

function RefundContent() {
  return (
    <article className="space-y-6">
      <header className="border-b border-[var(--border-default)] pb-6">
        <div className="flex items-center gap-2 text-[var(--status-exam-text)] font-semibold text-xs tracking-wider uppercase mb-2">
          <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Payment Policies</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight m-0">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-2 m-0">
          Effective Date: February 2026 • Last Reviewed: October 2026
        </p>
      </header>

      <section className="space-y-6 text-[var(--text-secondary)] leading-relaxed text-base">
        <p>
          At <strong className="text-[var(--text-primary)]">CSC DOST</strong>, we maintain a
          transparent and fair refund policy for all assisted application processing and digital
          appointment services.
        </p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          1. Assisted Application Cancellation &amp; Refunds
        </h2>
        <ul className="list-disc ps-5 space-y-2">
          <li>
            <strong className="text-[var(--text-primary)]">Prior to Submission:</strong> If an
            applicant requests cancellation <em>before</em> our VLE team has processed or submitted
            the form to the government portal, a full 100% refund of both the government fee and
            convenience charges will be initiated.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">After Final Submission:</strong> Once an
            application has been successfully submitted to the official government portal and an
            official registration number or challan has been generated, statutory government fees
            cannot be refunded, as government treasuries do not permit clawbacks.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">
              Rejected or Incomplete Forms due to Portal Outages:
            </strong>{' '}
            If a submission fails due to an official government server closure or outage prior to
            the deadline, any unspent fees will be returned within 5-7 working days.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          2. Mode and Timeline of Refund
        </h2>
        <p>
          Approved refunds are processed through our Razorpay payment gateway back to the original
          source account (UPI, debit card, or net banking) within{' '}
          <strong className="text-[var(--text-primary)]">5 to 7 business days</strong>.
        </p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-4">
          3. Dispute and Refund Requests
        </h2>
        <p>
          To request a refund or raise a billing grievance, please email{' '}
          <strong className="text-[var(--text-primary)]">support@cscdost.com</strong> with your
          Application Tracking Token (e.g.{' '}
          <code className="bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded font-mono text-sm text-[var(--text-primary)]">
            CSC-XXXXXXXX
          </code>
          ) and payment transaction reference ID.
        </p>
      </section>
    </article>
  );
}
