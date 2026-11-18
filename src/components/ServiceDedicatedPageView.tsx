import React, { useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  CheckSquare,
  Clock,
  ExternalLink,
  FileCheck,
  GitMerge,
  MessageCircle,
  PhoneCall,
  Printer,
  Share2,
  UserCheck,
} from 'lucide-react';
import { ServiceItem, CATEGORY_LABELS, SERVICES_LIST } from '../servicesData';
import { buildServiceWhatsAppNotification } from '../utils/whatsappFormatter';
import { useLanguage } from '../contexts/LanguageContext';
import { deriveStoredServiceFacts, getClusterForServiceId } from '../utils/serviceMetadata';
import {
  AdSlot,
  AlertsBox,
  Breadcrumbs,
  Card,
  ChecklistWithProgress,
  Chip,
  HelpApplyingCard,
  StickyMobileActionBar,
} from './ui';

interface ServiceDedicatedPageViewProps {
  service: ServiceItem;
  allServices?: ServiceItem[];
  onBack: () => void;
  onApplyService: (serviceName: string) => void;
  onShare: (service: ServiceItem) => void;
  onNavigateRoute?: (path: string) => void;
}

function VerifyBadge({ label = '[VERIFY]' }: { label?: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono text-xs font-bold">
      {label}
    </span>
  );
}

export default function ServiceDedicatedPageView({
  service,
  allServices = SERVICES_LIST,
  onBack,
  onApplyService,
  onShare,
  onNavigateRoute,
}: ServiceDedicatedPageViewProps) {
  const { t } = useLanguage();

  const categoryTitle = CATEGORY_LABELS[service.category] || 'CSC E-Services';
  const facts = useMemo(() => deriveStoredServiceFacts(service), [service]);
  const cluster = useMemo(() => getClusterForServiceId(service.id), [service.id]);

  const whatsappShareUrl = useMemo(
    () => buildServiceWhatsAppNotification(service).whatsappShareUrl,
    [service]
  );

  const whatsappEnquiryUrl = useMemo(() => {
    const msg = `Hello Wasim Ahmad Khanday (CSC DOST), I would like to enquire about ${service.name}: https://www.cscdost.com/service/${service.id}`;
    return `https://wa.me/917006833767?text=${encodeURIComponent(msg)}`;
  }, [service]);

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

  const relatedServices = useMemo(() => {
    return allServices
      .filter((s) => s.id !== service.id && s.category === service.category && !s.duplicateOfId)
      .slice(0, 4);
  }, [allServices, service]);

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
      className="w-full bg-[var(--bg-page)] text-[var(--text-primary)] pb-24"
    >
      <div className="max-w-[1180px] mx-auto px-3 sm:px-4 lg:px-6 pt-4 lg:pt-6 space-y-4">
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

        {cluster && (
          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3.5 flex flex-wrap items-center justify-between gap-2 text-start">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
              <GitMerge className="w-4 h-4 text-sky-600 shrink-0" aria-hidden="true" />
              <span>
                Part of <strong>{cluster.title}</strong>
              </span>
            </div>
            <a
              href={cluster.hubPath}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                  e.preventDefault();
                  navigateRoute(cluster.hubPath);
                }
              }}
              className="text-xs font-bold text-sky-700 dark:text-sky-300 underline"
            >
              Compare All in Hub →
            </a>
          </div>
        )}

        {/* Service Header Card */}
        <header className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-6 space-y-4 text-start shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <Chip variant="verified">{categoryTitle}</Chip>
            {facts.hasVerifyPlaceholders ? (
              <VerifyBadge label={`Needs Staff Verification (${facts.missingVerifyFields.length} [VERIFY])`} />
            ) : (
              <Chip variant="verified">Verified Service Sheet</Chip>
            )}
          </div>

          <div className="space-y-2">
            <h1
              id="service-page-h1"
              className="text-xl font-extrabold text-[var(--text-primary)] leading-snug tracking-tight m-0 break-words"
            >
              {service.name}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0 break-words">
              {service.description}
            </p>
          </div>

          {/* Service-Specific Snapshot: Authority, Fees, Processing Time */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 pt-1">
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                <Building2 className="w-4 h-4 text-[#101A36] dark:text-[#93C5FD] shrink-0" aria-hidden="true" />
                <span>Issuing Authority</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1 leading-snug">
                {facts.authorityFromStoredData ? facts.issuingAuthority : <VerifyBadge />}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                <Banknote className="w-4 h-4 text-[#1F9D6B] shrink-0" aria-hidden="true" />
                <span>{t.servicesFeeLabel}</span>
              </div>
              {facts.feeLines.length > 0 ? (
                <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1 leading-snug space-y-1">
                  {facts.feeLines.map((line, idx) => (
                    <div key={`${service.id}-summary-fee-${idx}`}>{line}</div>
                  ))}
                </div>
              ) : (
                <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1 leading-snug">
                  {facts.feesFromStoredData ? facts.feesText : <VerifyBadge label={facts.feesText} />}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                <Clock className="w-4 h-4 text-[#2563EB] shrink-0" aria-hidden="true" />
                <span>Processing Time</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1 leading-snug">
                {facts.timeFromStoredData ? facts.estimatedTime : <VerifyBadge />}
              </div>
            </div>
          </div>

          {/* Primary Actions */}
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
                  +91 70068 33767
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
              {facts.officialPortalUrl && (
                <a
                  href={facts.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] font-semibold text-sm inline-flex items-center gap-1.5 no-underline"
                >
                  <span>{facts.officialPortalLabel || t.officialPortalBtn}</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 lg:gap-6 items-start">
          {/* LEFT MAIN COLUMN: 8 SERVICE-SPECIFIC SECTIONS */}
          <div className="min-w-0 space-y-5">
            {/* 4. Who Is Eligible */}
            <Card className="p-4 sm:p-5 space-y-2 text-start">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#1F9D6B] shrink-0" aria-hidden="true" />
                <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">
                  Who Is Eligible — {service.name}
                </h2>
              </div>
              {facts.eligibilityFromStoredData ? (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0">
                  {facts.eligibility}
                </p>
              ) : (
                <p className="text-sm text-amber-700 dark:text-amber-300 m-0">
                  Eligibility criteria for {service.name}: <VerifyBadge />
                </p>
              )}
            </Card>

            {/* 5. Exact Documents Checklist */}
            {facts.requirements.length > 0 ? (
              <div id="service-documents" className="scroll-mt-20">
                <ChecklistWithProgress
                  title={`Exact Documents List — ${service.name}`}
                  items={facts.requirements}
                  storageKey={`service_docs_${service.id}`}
                />
              </div>
            ) : (
              <Card className="p-4 sm:p-5 space-y-2 text-start">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#D97706] shrink-0" aria-hidden="true" />
                  <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">
                    Exact Documents List — {service.name}
                  </h2>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300 m-0">
                  Required documents for {service.name}: <VerifyBadge />
                </p>
              </Card>
            )}

            {/* 6. Step-by-Step Flow */}
            <Card className="p-4 sm:p-5 space-y-3 text-start">
              <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">
                Step-by-Step Flow — {service.name}
              </h2>
              {facts.stepFlowFromStoredData ? (
                <ol className="space-y-2 list-decimal pl-5 m-0 text-sm text-[var(--text-secondary)]">
                  {facts.stepFlow.map((step, idx) => (
                    <li key={`${service.id}-step-${idx}`} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-amber-700 dark:text-amber-300 m-0">
                  Application workflow for {service.name}: <VerifyBadge />
                </p>
              )}
            </Card>

            {/* 7. Common Rejection Reasons */}
            <Card className="p-4 sm:p-5 space-y-3 text-start">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" aria-hidden="true" />
                <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">
                  Common Rejection Reasons — {service.name}
                </h2>
              </div>
              {facts.rejectionReasonsFromStoredData ? (
                <ul className="space-y-2 list-disc pl-5 m-0 text-sm text-[var(--text-secondary)]">
                  {facts.rejectionReasons.map((reason, idx) => (
                    <li key={`${service.id}-reject-${idx}`} className="leading-relaxed">
                      {reason}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-amber-700 dark:text-amber-300 m-0">
                  Rejection causes for {service.name}: <VerifyBadge />
                </p>
              )}
            </Card>

            {/* 8. What CSC DOST Staff Check Before Submitting */}
            <Card className="p-4 sm:p-5 space-y-3 text-start">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#1F9D6B] shrink-0" aria-hidden="true" />
                <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">
                  What CSC DOST Staff Check Before Submitting
                </h2>
              </div>
              {facts.staffChecksFromStoredData ? (
                <ul className="space-y-2 list-disc pl-5 m-0 text-sm text-[var(--text-secondary)]">
                  {facts.staffChecks.map((chk, idx) => (
                    <li key={`${service.id}-check-${idx}`} className="leading-relaxed">
                      {chk}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-amber-700 dark:text-amber-300 m-0">
                  Pre-submission checks for {service.name}: <VerifyBadge />
                </p>
              )}
            </Card>

            <HelpApplyingCard contextTitle={service.name} />

            {/* Compact Collapsed Boilerplate (Disclaimer & Generic FAQ) */}
            <details className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 text-start">
              <summary className="text-sm font-bold text-[var(--text-primary)] cursor-pointer select-none">
                Independent Disclaimer &amp; General Desk FAQ
              </summary>
              <p className="mt-2 mb-0 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                CSC DOST is an independent private CSC facilitation desk (VLE 212515670018, Sangran Qazigund, Anantnag), not a government portal. Final statutory fees and processing timelines depend on the competent issuing authority. Confirm details on +91 70068 33767 before payment.
              </p>
            </details>

            <AdSlot />
          </div>

          {/* SUPPORT & RELATED SIDEBAR */}
          <aside className="space-y-4 lg:sticky lg:top-[80px]">
            <Card className="p-4 sm:p-5 space-y-3.5 text-start">
              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-[var(--text-primary)] m-0">
                  Direct Desk Support
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed m-0">
                  Verify document eligibility and exact charges for {service.name} prior to filing.
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
                    +91 70068 33767
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
            </Card>

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
                          {rel.price?.trim() || '[VERIFY]'}
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

      <StickyMobileActionBar
        officialUrl={whatsappEnquiryUrl}
        officialLabel={t.servicesEnquireWhatsapp}
        shareWhatsAppUrl={whatsappShareUrl}
        aboveBottomNav={true}
      />
    </article>
  );
}
