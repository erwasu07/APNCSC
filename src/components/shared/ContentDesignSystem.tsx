import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Printer,
  Share2,
  FileSearch,
  CheckCircle2,
  Info,
} from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export interface KeyFactItem {
  label: string;
  value?: React.ReactNode;
  highlight?: 'default' | 'primary' | 'danger' | 'success';
}

export interface TocSectionItem {
  id: string;
  label: string;
}

export interface RelatedEntryItem {
  id: string;
  categoryLabel: string;
  title: string;
  meta?: string;
  statusNode?: React.ReactNode;
  onClick: () => void;
}

/**
 * Compact Breadcrumb navigation: Home / Category / Current item
 */
export function ContentBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const validItems = items.filter((i) => i && i.label);
  if (validItems.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-xs text-[#64748B]"
    >
      {validItems.map((item, idx) => {
        const isLast = idx === validItems.length - 1;
        return (
          <React.Fragment key={`${item.label}-${idx}`}>
            {idx > 0 && (
              <span aria-hidden="true" className="text-[#94A3B8] select-none">
                /
              </span>
            )}
            {item.onClick && !isLast ? (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-[#2563EB] hover:underline font-medium transition-colors cursor-pointer text-left"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={
                  isLast
                    ? 'text-[#102A43] font-semibold line-clamp-1 max-w-[260px] sm:max-w-md'
                    : 'text-[#64748B] font-medium'
                }
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

/**
 * Splits a long notification title into a full main title + optional secondary subtitle
 * without losing any characters or identifiers.
 */
export function splitTitleAndSubtitle(rawTitle: string, explicitSubtitle?: string): {
  mainTitle: string;
  subtitle?: string;
} {
  if (explicitSubtitle) {
    return { mainTitle: rawTitle, subtitle: explicitSubtitle };
  }
  return { mainTitle: rawTitle };
}

/**
 * Splits a lengthy summary into a concise opening introduction (2-3 sentences)
 * and returns the full text for the Overview section so nothing is lost.
 */
export function extractConciseIntro(summary?: string): {
  conciseIntro: string;
  hasExtendedOverview: boolean;
} {
  if (!summary || !summary.trim()) {
    return { conciseIntro: '', hasExtendedOverview: false };
  }
  const clean = summary.replace(/\s+/g, ' ').trim();
  if (clean.length <= 240) {
    return { conciseIntro: clean, hasExtendedOverview: false };
  }

  // Split by sentence boundaries
  const sentences = clean.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length >= 2) {
    const firstTwo = sentences.slice(0, 2).join(' ').trim();
    if (firstTwo.length <= 280) {
      return { conciseIntro: firstTwo, hasExtendedOverview: true };
    }
  }

  return { conciseIntro: clean, hasExtendedOverview: false };
}

/**
 * Article Header: Breadcrumbs, Category/Organisation Kicker, Single H1 Title,
 * Optional Subtitle, Short Intro, and Clean Unboxed Metadata.
 */
export function ContentArticleHeader({
  breadcrumbs,
  categoryLabel,
  organisationLabel,
  title,
  subtitle,
  intro,
  metadataItems,
  statusBadge,
}: {
  breadcrumbs: BreadcrumbItem[];
  categoryLabel?: string;
  organisationLabel?: string;
  title: string;
  subtitle?: string;
  intro?: string;
  metadataItems?: { label?: string; value: string }[];
  statusBadge?: React.ReactNode;
}) {
  const validMeta = (metadataItems || []).filter((m) => m && m.value && m.value.trim().length > 0);

  return (
    <header className="space-y-3 pb-4 sm:pb-6 border-b border-[#E2E8F0]">
      <ContentBreadcrumbs items={breadcrumbs} />

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          {organisationLabel && (
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              {organisationLabel}
            </span>
          )}
          {organisationLabel && categoryLabel && (
            <span aria-hidden="true" className="text-xs text-[#94A3B8]">
              ·
            </span>
          )}
          {categoryLabel && (
            <span className="text-xs font-semibold text-[#475569]">{categoryLabel}</span>
          )}
          {statusBadge && <div className="ml-auto sm:ml-1">{statusBadge}</div>}
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#102A43] tracking-tight leading-snug break-words">
          {title}
        </h1>

        {subtitle && (
          <p className="text-xs sm:text-sm font-semibold text-[#475569] leading-snug">
            {subtitle}
          </p>
        )}
      </div>

      {intro && (
        <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-[72ch] break-words">
          {intro}
        </p>
      )}

      {validMeta.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#64748B] pt-1">
          {validMeta.map((meta, idx) => (
            <React.Fragment key={`${meta.label || 'meta'}-${idx}`}>
              {idx > 0 && (
                <span aria-hidden="true" className="text-[#CBD5E1]">
                  ·
                </span>
              )}
              <span>
                {meta.label ? `${meta.label}: ` : ''}
                <strong className="font-semibold text-[#102A43] tabular-nums">
                  {meta.value}
                </strong>
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
    </header>
  );
}

/**
 * Key Information Strip:
 * Flat, subtle background band with hairline separators instead of nested cards.
 * Stacks into clean labelled rows on mobile and a multi-column band on larger screens.
 */
export function KeyInfoStrip({ facts }: { facts: KeyFactItem[] }) {
  const validFacts = facts.filter(
    (f) =>
      f &&
      f.value !== undefined &&
      f.value !== null &&
      String(f.value).trim() !== '' &&
      String(f.value).trim().toLowerCase() !== 'n/a'
  );

  if (validFacts.length === 0) return null;

  const getValueColor = (highlight?: KeyFactItem['highlight']) => {
    switch (highlight) {
      case 'primary':
        return 'text-[#2563EB] font-bold';
      case 'danger':
        return 'text-[#B91C1C] font-bold';
      case 'success':
        return 'text-[#15803D] font-bold';
      default:
        return 'text-[#102A43] font-semibold';
    }
  };

  return (
    <section
      aria-label="Key Summary Information"
      className="-mx-4 px-4 py-3 sm:mx-0 sm:px-5 sm:py-4 bg-[#F6F8FC] border-y sm:border border-[#E2E8F0] sm:rounded-xl"
    >
      {/* Mobile: Stacked key-value rows with subtle horizontal dividers */}
      <dl className="sm:hidden divide-y divide-[#E2E8F0] text-xs">
        {validFacts.map((fact, idx) => (
          <div
            key={`${fact.label}-${idx}`}
            className="py-2 first:pt-0 last:pb-0 flex items-baseline justify-between gap-4"
          >
            <dt className="text-[#64748B] font-medium shrink-0">{fact.label}</dt>
            <dd className={`text-right break-words tabular-nums ${getValueColor(fact.highlight)}`}>
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Tablet/Desktop: Flat horizontal band with vertical hairline separators */}
      <dl
        className={`hidden sm:grid gap-y-4 ${
          validFacts.length <= 3
            ? 'sm:grid-cols-3'
            : validFacts.length === 4
            ? 'sm:grid-cols-2 md:grid-cols-4'
            : 'sm:grid-cols-3 md:grid-cols-5'
        }`}
      >
        {validFacts.map((fact, idx) => (
          <div
            key={`${fact.label}-${idx}`}
            className={`space-y-1 ${
              idx > 0 ? 'sm:border-l sm:border-[#E2E8F0] sm:pl-4' : ''
            } pr-2 min-w-0`}
          >
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] truncate">
              {fact.label}
            </dt>
            <dd
              className={`text-xs sm:text-sm leading-snug break-words tabular-nums ${getValueColor(
                fact.highlight
              )}`}
            >
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Primary Actions Bar:
 * Royal blue for CSC DOST assistance, outlined for official sources,
 * and a clear distinction between independent assistance and official government portals.
 */
export function PrimaryActionBar({
  primaryActionLabel,
  onPrimaryAction,
  officialLinks,
  onTrackApplication,
  assistanceNote,
}: {
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  officialLinks?: { label: string; url: string }[];
  onTrackApplication?: () => void;
  assistanceNote?: string;
}) {
  return (
    <div className="space-y-2.5 py-1">
      <div className="flex flex-wrap items-center gap-2.5">
        {primaryActionLabel && onPrimaryAction && (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="min-h-[44px] px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-2 shadow-2xs"
          >
            <span>{primaryActionLabel}</span>
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
        )}

        {officialLinks &&
          officialLinks.map((link, idx) => (
            <a
              key={`${link.url}-${idx}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 py-2.5 bg-white hover:bg-[#F6F8FC] text-[#102A43] hover:text-[#2563EB] border border-[#CBD5E1] hover:border-[#2563EB] text-xs sm:text-sm font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <span>{link.label}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#64748B] shrink-0" aria-hidden="true" />
            </a>
          ))}

        {onTrackApplication && (
          <button
            type="button"
            onClick={onTrackApplication}
            className="min-h-[44px] px-4 py-2.5 bg-[#F6F8FC] hover:bg-slate-200/70 text-[#102A43] border border-[#E2E8F0] text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <FileSearch className="w-4 h-4 text-[#2563EB] shrink-0" aria-hidden="true" />
            <span>Track Application</span>
          </button>
        )}
      </div>

      {assistanceNote && (
        <p className="text-[11px] sm:text-xs text-[#64748B] leading-relaxed flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" aria-hidden="true" />
          <span>{assistanceNote}</span>
        </p>
      )}
    </div>
  );
}

/**
 * Compact Mobile Horizontal Section Navigation Strip ("On this page")
 */
export function MobileSectionNav({
  sections,
  activeId,
  onSelect,
}: {
  sections: TocSectionItem[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  if (!sections || sections.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className="lg:hidden -mx-4 px-4 py-2.5 bg-white border-b border-[#E2E8F0] sticky top-16 z-30 overflow-x-auto no-scrollbar"
    >
      <div className="flex items-center gap-1.5 min-w-max">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mr-1 shrink-0">
          On this page:
        </span>
        {sections.map((sec) => {
          const isActive = activeId === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSelect(sec.id)}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                isActive
                  ? 'bg-[#102A43] text-white border-[#102A43]'
                  : 'bg-[#F6F8FC] text-[#475569] border-[#E2E8F0] hover:text-[#102A43]'
              }`}
            >
              {sec.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Open Content Section (no enclosing decorative card box)
 */
export function ContentSection({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-28 py-5 sm:py-6 first:pt-2 border-b border-[#E2E8F0] last:border-b-0 space-y-3.5"
    >
      <div>
        <h2
          id={`${id}-heading`}
          className="text-base sm:text-lg font-bold text-[#102A43] tracking-tight"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">{subtitle}</p>
        )}
      </div>
      <div className="text-xs sm:text-sm text-[#334155] leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

/**
 * Key-Value Information Rows:
 * Converts simple key-value tables into clean stacked labelled rows on narrow screens
 * and aligned 2-column rows on wider viewports with subtle horizontal dividers.
 */
export function KeyValueRows({
  rows,
}: {
  rows: { label: string; value?: React.ReactNode; emphasize?: boolean }[];
}) {
  const validRows = rows.filter(
    (r) =>
      r &&
      r.value !== undefined &&
      r.value !== null &&
      String(r.value).trim() !== ''
  );

  if (validRows.length === 0) return null;

  return (
    <dl className="divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
      {validRows.map((row, idx) => (
        <div
          key={`${row.label}-${idx}`}
          className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-6"
        >
          <dt className="text-xs sm:text-sm font-medium text-[#64748B] sm:w-2/5 shrink-0">
            {row.label}
          </dt>
          <dd
            className={`text-xs sm:text-sm sm:w-3/5 sm:text-right break-words tabular-nums ${
              row.emphasize
                ? 'font-bold text-[#102A43]'
                : 'font-semibold text-[#1E293B]'
            }`}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Clean Checklisted Items (for Eligibility, Required Documents, Benefits, Conditions)
 */
export function ContentChecklist({
  items,
  columns = 1,
}: {
  items: string[];
  columns?: 1 | 2;
}) {
  const valid = (items || []).filter((i) => i && i.trim().length > 0);
  if (valid.length === 0) return null;

  return (
    <ul
      className={`grid grid-cols-1 ${
        columns === 2 ? 'sm:grid-cols-2 gap-x-6' : ''
      } divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]`}
    >
      {valid.map((item, idx) => (
        <li
          key={idx}
          className="py-2.5 flex items-start gap-2.5 text-xs sm:text-sm text-[#1E293B]"
        >
          <CheckCircle2
            className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span className="leading-relaxed break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Numbered Step-by-Step Procedure List
 */
export function StepByStepList({
  steps,
}: {
  steps: { title?: string; description: string }[];
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <ol className="divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
      {steps.map((step, idx) => (
        <li key={idx} className="py-3.5 flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-[#F6F8FC] border border-[#CBD5E1] text-[#102A43] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
            {idx + 1}
          </span>
          <div className="space-y-0.5 min-w-0 flex-1">
            {step.title && (
              <strong className="block text-xs sm:text-sm font-bold text-[#102A43]">
                {step.title}
              </strong>
            )}
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed break-words">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Official Sources & CSC DOST Assistance Split Section
 */
export function OfficialSourcesAndAssistance({
  officialAuthorityName,
  officialLinks,
  assistanceTitle,
  assistanceDescription,
  assistanceButtonLabel,
  onAssistanceClick,
}: {
  officialAuthorityName: string;
  officialLinks: { label: string; url: string; note?: string }[];
  assistanceTitle: string;
  assistanceDescription: string;
  assistanceButtonLabel: string;
  onAssistanceClick: () => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
      {/* Official Sources Column */}
      <div className="p-4 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl space-y-2.5 flex flex-col justify-between">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
            Official Source &amp; Authority
          </span>
          <h3 className="text-sm font-bold text-[#102A43]">
            {officialAuthorityName}
          </h3>
          <p className="text-xs text-[#475569] leading-relaxed">
            Verify official notices, rules, and submit applications directly on the authority portal:
          </p>
        </div>

        <div className="space-y-2 pt-1">
          {officialLinks.map((lnk, idx) => (
            <div key={idx} className="space-y-1">
              <a
                href={lnk.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[40px] w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 text-[#102A43] hover:text-[#2563EB] border border-[#CBD5E1] hover:border-[#2563EB] text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span>{lnk.label}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" aria-hidden="true" />
              </a>
              {lnk.note && (
                <span className="block text-[11px] text-[#64748B] font-mono break-all">
                  {lnk.note}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CSC DOST Assistance Column */}
      <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2.5 flex flex-col justify-between">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] block">
            Independent Citizen Assistance
          </span>
          <h3 className="text-sm font-bold text-[#102A43]">{assistanceTitle}</h3>
          <p className="text-xs text-[#475569] leading-relaxed">
            {assistanceDescription}
          </p>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={onAssistanceClick}
            className="min-h-[40px] w-full sm:w-auto px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <span>{assistanceButtonLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Shared Content Page Layout:
 * - Full-width open sections on mobile (<= 767px)
 * - Clean 12-column layout on desktop with slim, unboxed "On this page" sidebar
 * - Optional sticky mobile bottom action bar with safe-area spacing
 */
export function ContentPageLayout({
  backLabel,
  onBack,
  onPrint,
  onShare,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  tocSections,
  activeTocId,
  onSelectToc,
  relatedTitle = 'Related Updates',
  relatedItems = [],
  sidebarAssistanceTitle,
  sidebarAssistanceDesc,
  children,
}: {
  backLabel: string;
  onBack: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  tocSections: TocSectionItem[];
  activeTocId: string;
  onSelectToc: (id: string) => void;
  relatedTitle?: string;
  relatedItems?: RelatedEntryItem[];
  sidebarAssistanceTitle?: string;
  sidebarAssistanceDesc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white md:bg-[#F6F8FC] text-[#102A43] pb-24 md:pb-16 pt-0 md:pt-4 font-sans w-full">
      {/* Top Utility & Back Bar */}
      <div className="bg-white border-b border-[#E2E8F0] md:border md:rounded-xl max-w-6xl mx-auto px-4 py-2.5 sm:px-5 sm:py-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[40px] inline-flex items-center gap-2 px-3 py-1.5 bg-[#F6F8FC] hover:bg-slate-200/70 text-[#102A43] border border-[#E2E8F0] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
          <span>{backLabel}</span>
        </button>

        <div className="flex items-center gap-2">
          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F6F8FC] text-[#475569] hover:text-[#102A43] text-xs font-semibold rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
              title="Print this page"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Print</span>
            </button>
          )}

          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F6F8FC] text-[#475569] hover:text-[#102A43] text-xs font-semibold rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
              title="Share this page"
            >
              <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Share</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content & Unboxed Desktop Sidebar */}
      <div className="max-w-6xl mx-auto px-0 md:px-0 mt-0 md:mt-5">
        <div className="bg-white md:border md:border-[#E2E8F0] md:rounded-2xl px-4 py-4 sm:px-8 sm:py-7">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-10 items-start">
            {/* Primary Reading Column */}
            <article className="lg:col-span-8 min-w-0 w-full max-w-full">
              {children}

              {/* Mobile Related Content at bottom of article */}
              {relatedItems.length > 0 && (
                <section
                  aria-label={relatedTitle}
                  className="lg:hidden pt-5 mt-2 border-t border-[#E2E8F0] space-y-3"
                >
                  <h2 className="text-base font-bold text-[#102A43]">
                    {relatedTitle}
                  </h2>
                  <div className="-mx-4 divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
                    {relatedItems.map((rel) => (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={rel.onClick}
                        className="w-full text-left px-4 py-3.5 hover:bg-[#F6F8FC] transition-colors flex items-start justify-between gap-3 cursor-pointer"
                      >
                        <div className="space-y-1 min-w-0">
                          <span className="text-[11px] font-semibold text-[#2563EB] block">
                            {rel.categoryLabel}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-[#102A43] leading-snug">
                            {rel.title}
                          </h3>
                          {rel.meta && (
                            <span className="text-[11px] text-[#64748B] block">
                              {rel.meta}
                            </span>
                          )}
                        </div>
                        <ArrowRight
                          className="w-4 h-4 text-[#2563EB] shrink-0 mt-1"
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </article>

            {/* Slim Unboxed Desktop Sidebar with Vertical Hairline Divider */}
            <aside
              aria-label="On this page and related links"
              className="hidden lg:block lg:col-span-4 lg:border-l lg:border-[#E2E8F0] lg:pl-7 sticky top-24 space-y-7"
            >
              {/* On this page */}
              {tocSections.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                    On this page
                  </span>
                  <nav aria-label="On this page" className="space-y-1 border-l border-[#E2E8F0]">
                    {tocSections.map((sec) => {
                      const isActive = activeTocId === sec.id;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => onSelectToc(sec.id)}
                          className={`w-full text-left pl-3 py-1.5 text-xs transition-colors cursor-pointer -ml-px border-l-2 ${
                            isActive
                              ? 'border-[#2563EB] text-[#2563EB] font-bold'
                              : 'border-transparent text-[#64748B] hover:text-[#102A43] font-medium'
                          }`}
                        >
                          {sec.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              )}

              {/* Subtle Assistance Callout */}
              {primaryActionLabel && onPrimaryAction && (
                <div className="pt-5 border-t border-[#E2E8F0] space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] block">
                    CSC DOST Assistance
                  </span>
                  <h3 className="text-sm font-bold text-[#102A43] leading-snug">
                    {sidebarAssistanceTitle || 'Need help with this application?'}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {sidebarAssistanceDesc ||
                      'Our operators can verify your documents, resize photos, and assist with online submission.'}
                  </p>
                  <button
                    type="button"
                    onClick={onPrimaryAction}
                    className="min-h-[40px] w-full px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <span>{primaryActionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}

              {/* Related Items */}
              {relatedItems.length > 0 && (
                <div className="pt-5 border-t border-[#E2E8F0] space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                    {relatedTitle}
                  </span>
                  <div className="divide-y divide-[#E2E8F0]">
                    {relatedItems.map((rel) => (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={rel.onClick}
                        className="w-full text-left py-2.5 first:pt-0 last:pb-0 group cursor-pointer space-y-0.5"
                      >
                        <span className="text-[11px] font-semibold text-[#2563EB] block">
                          {rel.categoryLabel}
                        </span>
                        <h4 className="text-xs font-bold text-[#102A43] group-hover:text-[#2563EB] transition-colors leading-snug line-clamp-2">
                          {rel.title}
                        </h4>
                        {rel.meta && (
                          <span className="text-[11px] text-[#64748B] block tabular-nums">
                            {rel.meta}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      {/* Compact Sticky Mobile Action Bar (<= 767px) */}
      {(primaryActionLabel || secondaryActionLabel) && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs border-t border-[#E2E8F0] px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] flex items-center gap-2 shadow-lg">
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="min-h-[42px] px-3.5 py-2 bg-[#F6F8FC] hover:bg-slate-200 text-[#102A43] border border-[#CBD5E1] text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
            >
              {secondaryActionLabel}
            </button>
          )}
          {primaryActionLabel && onPrimaryAction && (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="min-h-[42px] flex-1 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <span className="truncate">{primaryActionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
