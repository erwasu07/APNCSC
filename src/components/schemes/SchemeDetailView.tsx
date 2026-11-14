import React, { useEffect, useMemo } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Gift,
  Globe,
  Info,
  MessageCircle,
  PhoneCall,
  Printer,
  ShieldAlert,
  Users,
} from 'lucide-react';
import type { GuideArticle } from '../../data/guidesData';
import { useLanguage } from '../../contexts/LanguageContext';
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
} from '../ui';

interface SchemeDetailViewProps {
  article: GuideArticle;
  relatedArticles: GuideArticle[];
  onBack: () => void;
  onOpenRelated: (id: string) => void;
  onRequestHelp: (serviceName: string) => void;
}

export default function SchemeDetailView({
  article,
  relatedArticles,
  onBack,
  onOpenRelated,
  onRequestHelp,
}: SchemeDetailViewProps) {
  const { language, t } = useLanguage();

  const isCentralScheme = article.category === 'Central Scheme';

  const localizedTitle =
    language === 'ur' && article.urduTitle
      ? article.urduTitle
      : language === 'hi' && article.hindiTitle
      ? article.hindiTitle
      : article.title;

  const secondaryTitle =
    language === 'en' ? undefined : article.title;

  const whatsappShareUrl = useMemo(() => {
    const shareText = `${article.title}\nOfficial Portal: ${article.officialUrl}\nDetails: https://www.cscdost.com/scheme/${encodeURIComponent(article.id)}`;
    return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  }, [article]);

  // Inject Article structured schema cleanly for this /scheme/<slug> page
  useEffect(() => {
    const scriptId = 'csc-scheme-article-schema';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    scriptEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.summary,
      articleSection: isCentralScheme ? 'Government Schemes' : article.category,
      author: {
        '@type': 'Organization',
        name: 'CSC DOST',
        url: 'https://www.cscdost.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'CSC DOST',
        url: 'https://www.cscdost.com',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://www.cscdost.com/scheme/${encodeURIComponent(article.id)}`,
      },
    });

    return () => {
      try {
        document.getElementById(scriptId)?.remove();
      } catch {}
    };
  }, [article, isCentralScheme]);

  const handleContactHelpClick = () => {
    onRequestHelp(article.title);
  };

  const scrollToHelpCard = () => {
    const el = document.getElementById('scheme-helpdesk-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const summaryRows = [
    {
      label: t.schemesDeptLabel,
      value: article.responsibleDepartment,
      icon: <Building2 className="w-4 h-4 text-[#1F9D6B] shrink-0" aria-hidden="true" />,
      tone: 'default' as const,
    },
    {
      label: t.schemesBeneficiariesLabel,
      value: article.intendedBeneficiaries,
      icon: <Users className="w-4 h-4 text-[#2563EB] shrink-0" aria-hidden="true" />,
      tone: 'default' as const,
    },
    {
      label: t.schemesBenefitLabel,
      value: article.benefitSummary,
      icon: <Gift className="w-4 h-4 text-[#1F9D6B] shrink-0" aria-hidden="true" />,
      tone: article.benefitSummary ? ('open' as const) : ('default' as const),
    },
    {
      label: t.schemesRegionLabel,
      value: article.applicableRegion,
      icon: <Globe className="w-4 h-4 text-[#2563EB] shrink-0" aria-hidden="true" />,
      tone: 'default' as const,
    },
    {
      label: t.schemesDeadlineLabel,
      value: undefined,
      icon: <Calendar className="w-4 h-4 text-[#D97706] shrink-0" aria-hidden="true" />,
      tone: 'default' as const,
    },
    {
      label: t.schemesFeeLabel,
      value: undefined,
      icon: <Banknote className="w-4 h-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />,
      tone: 'default' as const,
    },
  ];

  const tocSections = [
    { id: 'scheme-summary-box', label: t.schemesSummaryBoxTitle },
    { id: 'scheme-overview', label: t.postOverview },
    ...(article.eligibility.length > 0
      ? [{ id: 'scheme-eligibility', label: t.schemesEligibilityTitle }]
      : []),
    ...(article.documentsRequired.length > 0
      ? [{ id: 'scheme-documents', label: t.schemesDocumentsTitle }]
      : []),
    ...(article.stepByStep.length > 0
      ? [{ id: 'scheme-apply-guide', label: t.schemesApplyGuideTitle }]
      : []),
    ...(article.faqs.length > 0 ? [{ id: 'scheme-faqs', label: 'FAQs' }] : []),
  ];

  return (
    <article
      aria-labelledby="scheme-page-h1"
      className="w-full bg-[var(--bg-page)] text-[var(--text-primary)] pb-28 md:pb-12"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-5 sm:space-y-6">
        {/* Top Breadcrumbs & Back Link */}
        <Breadcrumbs
          items={[
            { label: t.navHome, href: '/' },
            { label: t.navSchemes, href: '/schemes' },
            { label: isCentralScheme ? t.catSchemes : article.category },
          ]}
          onNavigate={(href) => {
            if (href === '/schemes') {
              onBack();
            } else {
              window.history.pushState(null, '', href);
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          }}
          rightSlot={
            <button
              type="button"
              onClick={onBack}
              className="min-h-[40px] inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)] hover:text-[#1F9D6B] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180 shrink-0" aria-hidden="true" />
              <span>{t.schemesBackToAll}</span>
            </button>
          }
        />

        {/* Visible Date Confirmation Notice for Army Agniveer Guide */}
        {article.id === 'army-agniveer-rally-guide-2026' && (
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

        {/* Independent Portal & No-Approval-Guarantee Disclaimer */}
        <div
          role="note"
          className="rounded-2xl border border-[var(--status-closing-border)] bg-[var(--status-closing-bg)] p-3.5 sm:p-4 flex items-start gap-3 text-start"
        >
          <ShieldAlert
            className="w-5 h-5 text-[var(--status-closing-text)] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)] leading-relaxed m-0">
            {t.schemesNoGuaranteeNote}{' '}
            <a
              href={article.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#101A36] dark:text-[#FCD34D] underline inline-flex items-center gap-1"
            >
              <span>{article.officialPortal}</span>
              <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
            </a>
          </p>
        </div>

        {/* Article Header Card */}
        <header className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-6 space-y-4 text-start shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <Chip variant={isCentralScheme ? 'verified' : 'default'}>
              {isCentralScheme ? t.catSchemes : article.category}
            </Chip>
            <Chip>{article.officialPortal}</Chip>
            <Chip variant="accent">{article.readTime}</Chip>
          </div>

          <div className="space-y-2">
            <h1
              id="scheme-page-h1"
              className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] leading-snug tracking-tight m-0 break-words"
            >
              {localizedTitle}
            </h1>

            {secondaryTitle && (
              <p className="text-sm font-semibold text-[var(--text-secondary)] m-0">
                {secondaryTitle}
              </p>
            )}

            <p className="text-base text-[var(--text-secondary)] leading-relaxed m-0 max-w-3xl break-words">
              {article.summary}
            </p>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[var(--text-muted)] pt-1">
              <span>Last Updated: {article.lastUpdated}</span>
              <span aria-hidden="true">·</span>
              <span>{article.author}</span>
              <span aria-hidden="true">·</span>
              <span>{t.independentChip}</span>
            </div>
          </div>

          {/* Primary Actions Bar */}
          <div className="pt-3 border-t border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={article.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#101A36] hover:bg-[#1B2A52] text-white font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 no-underline transition-colors border border-white/10"
              >
                <span>{t.schemesOfficialPortalBtn}</span>
                <ExternalLink className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={handleContactHelpClick}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1F9D6B] hover:bg-[#178257] text-white font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t.schemesNeedHelpCta}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[var(--status-open-bg)] text-[var(--status-open-text)] border border-[var(--status-open-border)] font-bold text-sm inline-flex items-center gap-1.5 no-underline transition-colors hover:opacity-90"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t.shareOnWhatsApp}</span>
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                aria-label="Print scheme guide"
                className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] font-semibold text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>
        </header>

        {/* SCHEME SUMMARY BOX (Shows existing verified facts; missing fields explicitly point to official guidelines & link) */}
        <section
          id="scheme-summary-box"
          aria-labelledby="scheme-summary-heading"
          className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-5 space-y-3.5 text-start scroll-mt-20"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="scheme-summary-heading"
              className="text-lg sm:text-xl font-bold text-[var(--text-primary)] m-0"
            >
              {t.schemesSummaryBoxTitle}
            </h2>
            <a
              href={article.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-bold text-[#1F9D6B] hover:underline inline-flex items-center gap-1 no-underline"
            >
              <span>{article.officialPortal}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summaryRows.map((row) => {
              const hasValue = Boolean(row.value && row.value.trim());
              return (
                <div
                  key={row.label}
                  className={`rounded-xl border p-3.5 text-start ${
                    row.tone === 'open'
                      ? 'bg-[var(--status-open-bg)] border-[var(--status-open-border)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-default)]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    {row.icon}
                    <span>{row.label}</span>
                  </div>
                  {hasValue ? (
                    <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-1 leading-snug">
                      {row.value}
                    </div>
                  ) : (
                    <div className="mt-1 space-y-0.5">
                      <div className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                        {t.schemesAsPerGuidelines}
                      </div>
                      <a
                        href={article.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1F9D6B] hover:underline no-underline"
                      >
                        <span>{article.officialPortal}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Ad Slot between top summary and detailed guide */}
        <AdSlot />

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          {/* LEFT MAIN CONTENT */}
          <div className="min-w-0 space-y-5">
            {/* Overview & Detailed Guideline Sections */}
            <section
              id="scheme-overview"
              aria-label={t.postOverview}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-6 space-y-5 text-start scroll-mt-20"
            >
              {article.sections.map((sec, idx) => (
                <div
                  key={`${sec.heading}-${idx}`}
                  className={
                    idx > 0
                      ? 'pt-5 border-t border-[var(--border-default)] space-y-2.5'
                      : 'space-y-2.5'
                  }
                >
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] m-0">
                    {sec.heading}
                  </h2>
                  <p className="text-sm sm:text-base text-[var(--text-primary)] leading-relaxed m-0">
                    {sec.content}
                  </p>
                  {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                    <ul className="space-y-2 list-none m-0 p-0 pt-1">
                      {sec.bulletPoints.map((bp, bidx) => (
                        <li
                          key={bidx}
                          className="flex items-start gap-2.5 text-sm sm:text-base text-[var(--text-primary)] leading-relaxed"
                        >
                          <CheckCircle2
                            className="w-4 h-4 text-[#1F9D6B] shrink-0 mt-1"
                            aria-hidden="true"
                          />
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {sec.tips && (
                    <div className="p-3.5 rounded-xl bg-[var(--status-closing-bg)] border border-[var(--status-closing-border)] text-sm text-[var(--text-primary)] flex items-start gap-2">
                      <AlertCircle
                        className="w-4 h-4 text-[var(--status-closing-text)] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>
                        <strong>Helpful Note:</strong> {sec.tips}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </section>

            {/* Interactive Eligibility Checklist */}
            {article.eligibility.length > 0 && (
              <div id="scheme-eligibility" className="scroll-mt-20">
                <ChecklistWithProgress
                  title={t.schemesEligibilityTitle}
                  items={article.eligibility}
                  storageKey={`scheme_elig_${article.id}`}
                  note={`${t.schemesAsPerGuidelines}. Confirm final eligibility on ${article.officialPortal}.`}
                />
              </div>
            )}

            {/* Interactive Documents Required Checklist */}
            {article.documentsRequired.length > 0 && (
              <div id="scheme-documents" className="scroll-mt-20">
                <ChecklistWithProgress
                  title={t.schemesDocumentsTitle}
                  items={article.documentsRequired}
                  storageKey={`scheme_docs_${article.id}`}
                  note={`Always verify exact document formats on ${article.officialPortal} before submitting.`}
                />
              </div>
            )}

            {/* Step-by-Step Apply Guide */}
            {article.stepByStep.length > 0 && (
              <section
                id="scheme-apply-guide"
                aria-label={t.schemesApplyGuideTitle}
                className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-5 space-y-3.5 text-start scroll-mt-20"
              >
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] m-0">
                    {t.schemesApplyGuideTitle}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] m-0">
                    Follow these steps on the official portal ({article.officialPortal}) or request operator assistance below.
                  </p>
                </div>

                <ol className="space-y-2.5 list-none m-0 p-0">
                  {article.stepByStep.map((stepText, idx) => (
                    <li
                      key={`${idx}-${stepText.slice(0, 20)}`}
                      className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]"
                    >
                      <span className="w-7 h-7 rounded-lg bg-[#101A36] dark:bg-[#F5A623] text-white dark:text-[#101A36] text-xs font-extrabold tabular-nums flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm sm:text-base text-[var(--text-primary)] leading-relaxed m-0">
                        {stepText}
                      </p>
                    </li>
                  ))}
                </ol>

                {/* Official Link + Need Help Applying Action Strip */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <a
                    href={article.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#101A36] hover:bg-[#1B2A52] text-white font-bold text-sm inline-flex items-center gap-2 no-underline transition-colors border border-white/10"
                  >
                    <span>{t.schemesOfficialPortalBtn}</span>
                    <ExternalLink className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
                  </a>

                  <button
                    type="button"
                    onClick={handleContactHelpClick}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1F9D6B] hover:bg-[#178257] text-white font-bold text-sm inline-flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{t.schemesNeedHelpCta}</span>
                  </button>
                </div>
              </section>
            )}

            {/* Citizen Helpdesk Card (Operator Trust Details + Call & WhatsApp) */}
            <div id="scheme-helpdesk-section" className="scroll-mt-20">
              <HelpApplyingCard contextTitle={article.title} />
            </div>

            {/* FAQ Accordion with FAQPage Schema */}
            {article.faqs.length > 0 && (
              <div id="scheme-faqs" className="scroll-mt-20">
                <FaqAccordion items={article.faqs} injectSchema />
              </div>
            )}

            <AdSlot />
          </div>

          {/* RIGHT STICKY SIDEBAR (320px Desktop, Stacked on Mobile) */}
          <aside className="space-y-5 lg:sticky lg:top-20">
            {/* Official Link + Need Help Applying CTA Card */}
            <Card className="p-4 sm:p-5 space-y-3.5 text-start">
              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-[var(--text-primary)] m-0">
                  Official Portal &amp; Support
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0">
                  Apply or verify status directly on the official authority website, or contact CSC DOST for guided e-KYC and form filing help.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <a
                  href={article.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#101A36] hover:bg-[#1B2A52] text-white font-bold text-sm inline-flex items-center justify-center gap-2 no-underline transition-colors border border-white/10"
                >
                  <span>{t.schemesOfficialPortalBtn}</span>
                  <ExternalLink className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={handleContactHelpClick}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1F9D6B] hover:bg-[#178257] text-white font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{t.schemesNeedHelpCta}</span>
                </button>

                <button
                  type="button"
                  onClick={scrollToHelpCard}
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Info className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                  <span>VLE Helpdesk Details &amp; Phone</span>
                </button>
              </div>

              <p className="text-xs text-[var(--text-muted)] leading-relaxed m-0 pt-1 border-t border-[var(--border-default)]">
                CSC DOST does not guarantee approval or benefit sanction. Official eligibility is decided by the department.
              </p>
            </Card>

            {/* Quick Section Jump TOC */}
            <nav
              aria-label="Page sections"
              className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 space-y-2 text-start"
            >
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] m-0">
                On this page
              </h2>
              <ul className="space-y-1 list-none m-0 p-0">
                {tocSections.map((sec) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(sec.id)?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }}
                      className="min-h-[38px] px-2.5 py-1.5 rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[#1F9D6B] flex items-center justify-between gap-2 no-underline transition-colors"
                    >
                      <span className="truncate">{sec.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] rtl:rotate-180 shrink-0" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Related Schemes & Guides */}
            {relatedArticles.length > 0 && (
              <section
                aria-label={t.schemesRelatedTitle}
                className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 space-y-3 text-start"
              >
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-primary)] m-0">
                  {t.schemesRelatedTitle}
                </h2>
                <ul className="space-y-2.5 list-none m-0 p-0">
                  {relatedArticles.map((rel) => (
                    <li key={rel.id}>
                      <a
                        href={`/scheme/${rel.id}`}
                        onClick={(e) => {
                          if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                            e.preventDefault();
                            onOpenRelated(rel.id);
                          }
                        }}
                        className="block rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] p-3 space-y-1 no-underline transition-colors"
                      >
                        <div className="text-[11px] font-bold uppercase tracking-wide text-[#1F9D6B]">
                          {rel.category === 'Central Scheme' ? t.catSchemes : rel.category}
                        </div>
                        <p className="text-sm font-bold text-[var(--text-primary)] line-clamp-2 leading-snug m-0">
                          {language === 'ur' && rel.urduTitle
                            ? rel.urduTitle
                            : language === 'hi' && rel.hindiTitle
                            ? rel.hindiTitle
                            : rel.title}
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

      {/* Sticky Bottom Mobile Quick Bar (Official Portal + Share on WhatsApp) */}
      <StickyMobileActionBar
        officialUrl={article.officialUrl}
        officialLabel={t.schemesOfficialPortalBtn}
        shareWhatsAppUrl={whatsappShareUrl}
        aboveBottomNav={true}
      />
    </article>
  );
}
