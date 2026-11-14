import React, { useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Clock,
  ExternalLink,
  FileCheck,
  MessageCircle,
  PhoneCall,
  Printer,
  Share2,
  ShieldAlert,
} from 'lucide-react';
import { ServiceItem, CATEGORY_LABELS, SERVICES_LIST } from '../servicesData';
import { buildServiceWhatsAppNotification } from '../utils/whatsappFormatter';
import { useLanguage } from '../contexts/LanguageContext';
import {
  AdSlot,
  AlertsBox,
  Breadcrumbs,
  Card,
  ChecklistWithProgress,
  Chip,
  FaqAccordion,
  HelpApplyingCard,
  StickyMobileActionBar,
  type FaqItem,
} from './ui';

interface ServiceDedicatedPageViewProps {
  service: ServiceItem;
  onBack: () => void;
  onApplyService: (serviceName: string) => void;
  onShare: (service: ServiceItem) => void;
  onNavigateRoute?: (path: string) => void;
}

export default function ServiceDedicatedPageView({
  service,
  onBack,
  onApplyService,
  onShare,
  onNavigateRoute,
}: ServiceDedicatedPageViewProps) {
  const { t } = useLanguage();

  const categoryTitle = CATEGORY_LABELS[service.category] || 'CSC E-Services';
  const feeDisplay =
    service.price && service.price.trim().length > 0 ? service.price.trim() : t.servicesAskUs;
  const timeDisplay =
    service.estimatedTime && service.estimatedTime.trim().length > 0
      ? service.estimatedTime.trim()
      : '';
  const docsList = useMemo(
    () =>
      Array.isArray(service.requirements)
        ? service.requirements.filter((r) => Boolean(r && r.trim()))
        : [],
    [service.requirements]
  );

  const officialPortal = useMemo(() => {
    if (service.officialUrl && service.officialUrl.trim().length > 0) {
      return {
        name: 'Official Portal',
        url: service.officialUrl.trim(),
      };
    }

    // For all cards_adda services without an explicit officialUrl in data, do not guess portal URLs
    if (service.category === 'cards_adda') {
      return null;
    }

    const sId = service.id.toLowerCase();
    const sName = service.name.toLowerCase();

    if (sId.includes('pan') || sName.includes('pan')) {
      return {
        name: 'NSDL Protean / Income Tax Portal',
        url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html',
      };
    }
    if (sId.includes('aadhaar') || sName.includes('aadhaar')) {
      return {
        name: 'Unique Identification Authority of India (UIDAI)',
        url: 'https://myaadhaar.uidai.gov.in',
      };
    }
    if (sId.includes('ayushman') || sName.includes('ayushman') || sName.includes('golden')) {
      return {
        name: 'National Health Authority (NHA Beneficiary Portal)',
        url: 'https://beneficiary.nha.gov.in',
      };
    }
    if (sId.includes('voter') || sName.includes('voter')) {
      return {
        name: 'Election Commission of India (ECI Voters Portal)',
        url: 'https://voters.eci.gov.in',
      };
    }
    if (sId.includes('pmkisan') || sName.includes('kisan')) {
      return {
        name: 'PM-KISAN Official Portal (Ministry of Agriculture)',
        url: 'https://pmkisan.gov.in',
      };
    }
    if (sId.includes('passport') || sName.includes('passport')) {
      return {
        name: 'Passport Seva Online (Ministry of External Affairs)',
        url: 'https://www.passportindia.gov.in',
      };
    }
    if (
      sId.includes('parivahan') ||
      sId.includes('dl') ||
      sId.includes('driving') ||
      sName.includes('license') ||
      sName.includes('rc')
    ) {
      return {
        name: 'Parivahan Sewa (Ministry of Road Transport & Highways)',
        url: 'https://parivahan.gov.in',
      };
    }
    if (sId.includes('shram') || sName.includes('shram')) {
      return {
        name: 'Ministry of Labour & Employment (e-Shram Portal)',
        url: 'https://eshram.gov.in',
      };
    }
    if (
      sId.includes('domicile') ||
      sId.includes('unnat') ||
      sName.includes('domicile') ||
      sName.includes('revenue') ||
      service.category === 'jk_state' ||
      service.category === 'revenue'
    ) {
      return {
        name: 'e-UNNAT & Jan Sugam J&K Citizen Services Portal',
        url: 'https://eunnat.jk.gov.in',
      };
    }
    return null;
  }, [service]);

  const whatsappShareUrl = useMemo(
    () => buildServiceWhatsAppNotification(service).whatsappShareUrl,
    [service]
  );

  const whatsappEnquiryUrl = useMemo(() => {
    const msg = `Hello Wasim Ahmad Khanday (CSC DOST), I would like to enquire about ${service.name}: https://www.cscdost.com/service/${service.id}`;
    return `https://wa.me/917006833767?text=${encodeURIComponent(msg)}`;
  }, [service]);

  // Inject Service JSON-LD schema cleanly
  useEffect(() => {
    const scriptId = 'csc-service-schema';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    scriptEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name,
      description: service.description,
      serviceType: categoryTitle,
      provider: {
        '@type': 'LocalBusiness',
        name: 'CSC DOST',
        telephone: '+91-70068-33767',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Sangran Qazigund',
          addressLocality: 'Anantnag',
          addressRegion: 'Jammu and Kashmir',
          postalCode: '192221',
          addressCountry: 'IN',
        },
      },
      url: `https://www.cscdost.com/service/${encodeURIComponent(service.id)}`,
    });

    return () => {
      try {
        document.getElementById(scriptId)?.remove();
      } catch {}
    };
  }, [service, categoryTitle]);

  const processSteps = useMemo(
    () => [
      {
        title: 'Confirm service requirements and fee before applying',
        description: `Review the required documents below and confirm applicable charges (${feeDisplay}) with CSC DOST on +91 70068 33767 or WhatsApp before proceeding. Final charges depend on the service and any government fee.`,
      },
      {
        title: 'Submit details & supporting documents',
        description: `Click "${t.servicesApplyOnline}" or visit our Sangran Qazigund facilitation desk with clear copies/originals of the documents listed for ${service.name}.`,
      },
      {
        title: 'Portal verification & filing',
        description: officialPortal
          ? `Your application or request is prepared and submitted on ${officialPortal.name} with required OTP or biometric verification where applicable.`
          : 'Your request is prepared and processed with required OTP, verification, or document checks where applicable.',
      },
      {
        title: 'Save acknowledgment & track progress',
        description:
          'Receive your submission acknowledgment or tracking reference token. Issuing authority timelines apply for final verification and issuance.',
      },
    ],
    [feeDisplay, officialPortal, service.name, t.servicesApplyOnline]
  );

  const serviceFaqs: FaqItem[] = useMemo(() => {
    const docsAnswer =
      docsList.length > 0
        ? `Listed documents for ${service.name}: ${docsList.join(', ')}. Additional verification may be requested by the issuing authority depending on your case.`
        : `Required documents depend on your specific application case. Contact Wasim Ahmad Khanday on +91 70068 33767 or WhatsApp before visiting.`;

    const feeAnswer =
      service.price && service.price.trim().length > 0
        ? `The listed reference charge is ${service.price.trim()}. Final charges depend on the service and any government fee. Please confirm before applying.`
        : `Fee details are confirmed upon checking your request ("Ask us"). Final charges depend on the service and any government fee. Please confirm before applying.`;

    const timeAnswer = timeDisplay
      ? `Indicative timeline noted in the service entry is ${timeDisplay}. Actual completion depends on departmental verification and portal processing.`
      : `Processing time varies by department verification and application type. Contact us on +91 70068 33767 for current turnaround expectations.`;

    return [
      {
        question: `What documents are needed for ${service.name}?`,
        answer: docsAnswer,
      },
      {
        question: `What are the charges for ${service.name}?`,
        answer: feeAnswer,
      },
      {
        question: `How long does ${service.name} typically take?`,
        answer: timeAnswer,
      },
      {
        question: 'Can I get help with this service at CSC DOST?',
        answer: officialPortal
          ? `Yes. You can apply directly via ${officialPortal.name} (${officialPortal.url}), or contact CSC DOST (+91 70068 33767) operated by Authorized CSC VLE Wasim Ahmad Khanday (VLE ID 212515670018) for assisted document preparation and online filing.`
          : `Yes. Contact CSC DOST (+91 70068 33767) operated by Authorized CSC VLE Wasim Ahmad Khanday (VLE ID 212515670018) at Sangran Qazigund, Anantnag for document verification and assisted processing.`,
      },
    ];
  }, [docsList, officialPortal, service.name, service.price, timeDisplay]);

  const relatedServices = useMemo(() => {
    return SERVICES_LIST.filter((s) => s.id !== service.id && s.category === service.category).slice(
      0,
      4
    );
  }, [service]);

  const navigateRoute = (href: string) => {
    if (href === '/services') {
      onBack();
    } else if (onNavigateRoute) {
      onNavigateRoute(href);
    } else {
      window.history.pushState(null, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <article
      aria-labelledby="service-page-h1"
      className="w-full bg-[var(--bg-page)] text-[var(--text-primary)] pb-28 md:pb-12"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-5 sm:space-y-6">
        <Breadcrumbs
          items={[
            { label: t.navHome, href: '/' },
            { label: t.navServices, href: '/services' },
            { label: service.name },
          ]}
          onNavigate={navigateRoute}
          rightSlot={
            <button
              type="button"
              onClick={onBack}
              className="min-h-[40px] inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)] hover:text-[#1F9D6B] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180 shrink-0" aria-hidden="true" />
              <span>{t.servicesBackToAll}</span>
            </button>
          }
        />

        {/* Transparency & Fee Confirmation Notice */}
        <div
          role="note"
          className="rounded-2xl border border-[var(--status-closing-border)] bg-[var(--status-closing-bg)] p-3.5 sm:p-4 flex items-start gap-3 text-start"
        >
          <ShieldAlert
            className="w-5 h-5 text-[var(--status-closing-text)] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-relaxed m-0">
            {t.servicesFeeNote}
          </p>
        </div>

        {/* Service Header Card */}
        <header className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-6 space-y-4 text-start shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <Chip variant="verified">{categoryTitle}</Chip>
            <Chip>{t.independentChip}</Chip>
          </div>

          <div className="space-y-2">
            <h1
              id="service-page-h1"
              className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] leading-snug tracking-tight m-0 break-words"
            >
              {service.name}
            </h1>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed m-0 max-w-3xl break-words">
              {service.description}
            </p>
          </div>

          {/* Summary Strip: Fee (or "Ask us"), Typical Time (only if present), Documents Count, Official Portal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                <Banknote className="w-4 h-4 text-[#1F9D6B] shrink-0" aria-hidden="true" />
                <span>{t.servicesFeeLabel}</span>
              </div>
              {Array.isArray(service.feeLines) && service.feeLines.length > 0 ? (
                <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1 leading-snug space-y-1">
                  {service.feeLines.map((line, idx) => (
                    <div key={`${service.id}-summary-fee-${idx}`}>{line}</div>
                  ))}
                </div>
              ) : (
                <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1 leading-snug">
                  {feeDisplay}
                </div>
              )}
            </div>

            {timeDisplay && (
              <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  <Clock className="w-4 h-4 text-[#2563EB] shrink-0" aria-hidden="true" />
                  <span>{t.servicesTypicalTime}</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1 leading-snug">
                  {timeDisplay}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                <FileCheck className="w-4 h-4 text-[#D97706] shrink-0" aria-hidden="true" />
                <span>{t.servicesDocsNeeded}</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1 leading-snug tabular-nums">
                {docsList.length > 0 ? `${docsList.length} listed items` : t.servicesAskUs}
              </div>
            </div>
          </div>

          {/* Primary Actions: Enquire on WhatsApp, Call +91 70068 33767, Apply Online, Official Portal */}
          <div className="pt-3 border-t border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={whatsappEnquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1F9D6B] hover:bg-[#178257] text-white font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 no-underline transition-colors"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t.servicesEnquireWhatsapp}</span>
              </a>

              <a
                href="tel:+917006833767"
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#101A36] hover:bg-[#1B2A52] text-white font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 no-underline transition-colors border border-white/10"
              >
                <PhoneCall className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
                <span dir="ltr" className="tabular-nums">
                  {t.servicesCallBtn} +91 70068 33767
                </span>
              </a>

              <button
                type="button"
                onClick={() => onApplyService(service.name)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>{t.servicesApplyOnline}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 shrink-0" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {officialPortal && (
                <a
                  href={officialPortal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] font-semibold text-sm inline-flex items-center gap-1.5 no-underline"
                >
                  <span>{t.officialPortalBtn}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </a>
              )}

              <button
                type="button"
                onClick={() => onShare(service)}
                aria-label="Share service"
                className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] font-semibold text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                aria-label="Print service checklist"
                className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] font-semibold text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>
        </header>

        <AdSlot />

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          {/* LEFT MAIN COLUMN */}
          <div className="min-w-0 space-y-5">
            {/* Documents Checklist (Strictly from data; shows Ask us if none listed) */}
            {docsList.length > 0 ? (
              <div id="service-documents" className="scroll-mt-20">
                <ChecklistWithProgress
                  title={t.servicesDocsChecklistTitle}
                  items={docsList}
                  storageKey={`service_docs_${service.id}`}
                  note={`Bring clear originals or legible scans. ${t.servicesFeeNote}`}
                />
              </div>
            ) : (
              <Card className="p-5 space-y-2 text-start">
                <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">
                  {t.servicesDocsChecklistTitle}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] m-0">
                  {t.servicesAskUs} — document requirements depend on your specific application case.
                </p>
              </Card>
            )}

            {/* Process Steps */}
            <section
              id="service-process-steps"
              aria-label={t.servicesProcessStepsTitle}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-5 space-y-3.5 text-start scroll-mt-20"
            >
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] m-0">
                  {t.servicesProcessStepsTitle}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] m-0">
                  {officialPortal ? (
                    <>
                      How CSC DOST helps prepare and submit your request, or apply independently via{' '}
                      <a
                        href={officialPortal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#1F9D6B] hover:underline"
                      >
                        {officialPortal.name}
                      </a>
                      .
                    </>
                  ) : (
                    'How CSC DOST helps verify documents, prepare your request, and confirm applicable charges.'
                  )}
                </p>
              </div>

              <ol className="space-y-2.5 list-none m-0 p-0">
                {processSteps.map((step, idx) => (
                  <li
                    key={step.title}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]"
                  >
                    <span className="w-7 h-7 rounded-lg bg-[#101A36] dark:bg-[#F5A623] text-white dark:text-[#101A36] text-xs font-extrabold tabular-nums flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] m-0">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="text-xs font-semibold text-[var(--text-muted)] m-0 pt-1">
                {t.servicesFeeNote}
              </p>
            </section>

            {/* Help Applying Card (Wasim Ahmad Khanday · VLE ID 212515670018 · Call & WhatsApp) */}
            <HelpApplyingCard contextTitle={service.name} />

            {/* FAQ Accordion with FAQPage JSON-LD */}
            <div id="service-faqs" className="scroll-mt-20">
              <FaqAccordion items={serviceFaqs} title={t.servicesFaqTitle} injectSchema />
            </div>

            <AdSlot />
          </div>

          {/* RIGHT STICKY SIDEBAR */}
          <aside className="space-y-5 lg:sticky lg:top-20">
            <Card className="p-4 sm:p-5 space-y-3.5 text-start">
              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-[var(--text-primary)] m-0">
                  Direct Enquiry &amp; Support
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0">
                  Confirm required documents, government fee, and service charges before submitting.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <a
                  href={whatsappEnquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1F9D6B] hover:bg-[#178257] text-white font-bold text-sm inline-flex items-center justify-center gap-2 no-underline transition-colors"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{t.servicesEnquireWhatsapp}</span>
                </a>

                <a
                  href="tel:+917006833767"
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#101A36] hover:bg-[#1B2A52] text-white font-bold text-sm inline-flex items-center justify-center gap-2 no-underline transition-colors border border-white/10"
                >
                  <PhoneCall className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
                  <span dir="ltr" className="tabular-nums">
                    {t.servicesCallBtn} · +91 70068 33767
                  </span>
                </a>

                <button
                  type="button"
                  onClick={() => onApplyService(service.name)}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>{t.servicesApplyOnline}</span>
                </button>
              </div>

              <p className="text-xs text-[var(--text-muted)] leading-relaxed m-0 pt-2 border-t border-[var(--border-default)]">
                {t.servicesFeeNote}
              </p>
            </Card>

            {/* Related Services */}
            {relatedServices.length > 0 && (
              <section
                aria-label={t.servicesRelatedTitle}
                className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 space-y-3 text-start"
              >
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-primary)] m-0">
                  {t.servicesRelatedTitle}
                </h2>
                <ul className="space-y-2.5 list-none m-0 p-0">
                  {relatedServices.map((rel) => (
                    <li key={rel.id}>
                      <a
                        href={`/service/${rel.id}`}
                        onClick={(e) => {
                          if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                            e.preventDefault();
                            navigateRoute(`/service/${rel.id}`);
                          }
                        }}
                        className="block rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] p-3 space-y-1 no-underline transition-colors"
                      >
                        <p className="text-sm font-bold text-[var(--text-primary)] line-clamp-2 leading-snug m-0">
                          {rel.name}
                        </p>
                        <div className="text-xs font-semibold text-[#1F9D6B]">
                          {rel.price?.trim() || t.servicesAskUs}
                        </div>
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

      {/* Mobile Sticky Bottom Quick Bar */}
      <StickyMobileActionBar
        officialUrl={whatsappEnquiryUrl}
        officialLabel={t.servicesEnquireWhatsapp}
        shareWhatsAppUrl={whatsappShareUrl}
        aboveBottomNav={true}
      />
    </article>
  );
}
