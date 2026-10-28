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
  Briefcase,
  Shield,
  Train,
  GraduationCap,
  HeartHandshake,
  FileText,
  BookOpen,
  Calendar,
  Clock,
  Tag,
  MapPin,
  MessageCircle,
} from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export type ToneType = 'default' | 'blue' | 'emerald' | 'rose' | 'amber' | 'slate';

export interface KeyInfoFact {
  label: string;
  value?: React.ReactNode;
  tone?: ToneType;
  highlight?: 'default' | 'primary' | 'danger' | 'success';
}

export type KeyFactItem = KeyInfoFact;

export interface SectionNavItem {
  id: string;
  title?: string;
  label?: string;
}

export type TocSectionItem = SectionNavItem;

export interface RelatedContentItem {
  id: string;
  categoryLabel: string;
  title: string;
  metaText?: string;
  meta?: string;
  statusNode?: React.ReactNode;
  thumbnailUrl?: string;
  onClick: () => void;
}

export type RelatedEntryItem = RelatedContentItem;

/**
 * Compact Breadcrumb navigation: Home / Category / Current item
 */
export function ContentBreadcrumbs({ items = [] }: { items?: BreadcrumbItem[] }) {
  const safeItems = Array.isArray(items) ? items.filter((i) => i && i.label) : [];
  if (safeItems.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-xs text-[#64748B]"
    >
      {safeItems.map((item, idx) => {
        const isLast = idx === safeItems.length - 1;
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
 * and returns any remaining text for the Overview section so nothing is lost.
 */
export function extractConciseIntro(
  summary?: string,
  maxLength = 240
): {
  intro: string;
  remainder: string;
  conciseIntro: string;
  hasExtendedOverview: boolean;
} {
  if (!summary || !summary.trim()) {
    return {
      intro: '',
      remainder: '',
      conciseIntro: '',
      hasExtendedOverview: false,
    };
  }
  const clean = summary.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) {
    return {
      intro: clean,
      remainder: '',
      conciseIntro: clean,
      hasExtendedOverview: false,
    };
  }

  const sentences = clean.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length >= 2) {
    const firstTwo = sentences.slice(0, 2).join(' ').trim();
    const rest = sentences.slice(2).join(' ').trim();
    if (firstTwo.length <= maxLength + 40) {
      return {
        intro: firstTwo,
        remainder: rest,
        conciseIntro: firstTwo,
        hasExtendedOverview: Boolean(rest),
      };
    }
  }

  return {
    intro: clean,
    remainder: '',
    conciseIntro: clean,
    hasExtendedOverview: false,
  };
}

/**
 * Article Header: Category/Organisation Kicker, Single H1 Title,
 * Optional Subtitle, Short Intro, and Clean Unboxed Metadata.
 */
export function ContentArticleHeader({
  breadcrumbs,
  categoryLabel,
  organisationLabel,
  secondaryBadge,
  title,
  subtitle,
  intro,
  metadata,
  metadataItems,
  statusBadge,
}: {
  breadcrumbs?: BreadcrumbItem[];
  categoryLabel?: string;
  organisationLabel?: string;
  secondaryBadge?: string;
  title: string;
  subtitle?: string;
  intro?: string;
  metadata?: { label?: string; value: string; emphasize?: boolean }[];
  metadataItems?: { label?: string; value: string; emphasize?: boolean }[];
  statusBadge?: React.ReactNode;
}) {
  const rawMeta = metadata || metadataItems || [];
  const validMeta = Array.isArray(rawMeta)
    ? rawMeta.filter((m) => m && m.value && String(m.value).trim().length > 0)
    : [];

  const primaryKicker = organisationLabel || categoryLabel;
  const secondaryKicker = organisationLabel && categoryLabel ? categoryLabel : secondaryBadge;

  return (
    <header className="space-y-3 pb-4 sm:pb-6 border-b border-[#E2E8F0]">
      {breadcrumbs && breadcrumbs.length > 0 && <ContentBreadcrumbs items={breadcrumbs} />}

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          {primaryKicker && (
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              {primaryKicker}
            </span>
          )}
          {primaryKicker && secondaryKicker && (
            <span aria-hidden="true" className="text-xs text-[#94A3B8]">
              ·
            </span>
          )}
          {secondaryKicker && (
            <span className="text-xs font-semibold text-[#475569]">{secondaryKicker}</span>
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
                <strong
                  className={`tabular-nums ${
                    meta.emphasize
                      ? 'font-bold text-[#B91C1C]'
                      : 'font-semibold text-[#102A43]'
                  }`}
                >
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
export function KeyInfoStrip({ facts = [] }: { facts?: KeyInfoFact[] }) {
  const safeFacts = Array.isArray(facts) ? facts : [];
  const validFacts = safeFacts.filter(
    (f) =>
      f &&
      f.value !== undefined &&
      f.value !== null &&
      String(f.value).trim() !== '' &&
      String(f.value).trim().toLowerCase() !== 'n/a'
  );

  if (validFacts.length === 0) return null;

  const getValueColor = (fact: KeyInfoFact) => {
    const tone = fact.tone;
    if (tone === 'blue' || fact.highlight === 'primary') return 'text-[#2563EB] font-bold';
    if (tone === 'rose' || fact.highlight === 'danger') return 'text-[#B91C1C] font-bold';
    if (tone === 'emerald' || fact.highlight === 'success') return 'text-[#15803D] font-bold';
    if (tone === 'amber') return 'text-[#B45309] font-bold';
    if (tone === 'slate') return 'text-[#475569] font-semibold';
    return 'text-[#102A43] font-semibold';
  };

  return (
    <section
      aria-label="Key Summary Information"
      className="-mx-4 px-4 py-3 sm:mx-0 sm:px-5 sm:py-4 bg-[#F6F8FC] border-y sm:border border-[#E2E8F0] sm:rounded-xl my-3 sm:my-4"
    >
      {/* Mobile: Stacked key-value rows with subtle horizontal dividers */}
      <dl className="sm:hidden divide-y divide-[#E2E8F0] text-xs">
        {validFacts.map((fact, idx) => (
          <div
            key={`${fact.label}-${idx}`}
            className="py-2 first:pt-0 last:pb-0 flex items-baseline justify-between gap-4"
          >
            <dt className="text-[#64748B] font-medium shrink-0">{fact.label}</dt>
            <dd className={`text-right break-words tabular-nums ${getValueColor(fact)}`}>
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
                fact
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
  primaryAction,
  primaryActionLabel,
  onPrimaryAction,
  officialLinks = [],
  onTrackApplication,
  assistanceDisclaimer,
  assistanceNote,
}: {
  primaryAction?: { label: string; onClick: () => void };
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  officialLinks?: { label: string; href?: string; url?: string }[];
  onTrackApplication?: () => void;
  assistanceDisclaimer?: string;
  assistanceNote?: string;
}) {
  const resolvedPrimaryLabel = primaryAction?.label || primaryActionLabel;
  const resolvedPrimaryClick = primaryAction?.onClick || onPrimaryAction;
  const resolvedDisclaimer = assistanceDisclaimer || assistanceNote;
  const safeLinks = Array.isArray(officialLinks) ? officialLinks : [];

  return (
    <div className="space-y-2.5 py-2">
      <div className="flex flex-wrap items-center gap-2.5">
        {resolvedPrimaryLabel && resolvedPrimaryClick && (
          <button
            type="button"
            onClick={resolvedPrimaryClick}
            className="min-h-[44px] px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-2 shadow-2xs"
          >
            <span>{resolvedPrimaryLabel}</span>
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
        )}

        {safeLinks.map((link, idx) => {
          const targetHref = link.href || link.url || '#';
          return (
            <a
              key={`${targetHref}-${idx}`}
              href={targetHref}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 py-2.5 bg-white hover:bg-[#F6F8FC] text-[#102A43] hover:text-[#2563EB] border border-[#CBD5E1] hover:border-[#2563EB] text-xs sm:text-sm font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <span>{link.label}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#64748B] shrink-0" aria-hidden="true" />
            </a>
          );
        })}

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

      {resolvedDisclaimer && (
        <p className="text-[11px] sm:text-xs text-[#64748B] leading-relaxed flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" aria-hidden="true" />
          <span>{resolvedDisclaimer}</span>
        </p>
      )}
    </div>
  );
}

/**
 * Compact Mobile Horizontal Section Navigation Strip ("On this page")
 */
export function MobileSectionNav({
  sections = [],
  activeSectionId,
  activeId,
  onSelectSection,
  onSelect,
}: {
  sections?: SectionNavItem[];
  activeSectionId?: string;
  activeId?: string;
  onSelectSection?: (id: string) => void;
  onSelect?: (id: string) => void;
}) {
  const safeSections = Array.isArray(sections) ? sections : [];
  if (safeSections.length === 0) return null;

  const currentId = activeSectionId || activeId || '';
  const handleSelect = onSelectSection || onSelect || (() => {});

  return (
    <nav
      aria-label="On this page"
      className="lg:hidden -mx-4 px-4 py-2.5 bg-white border-y border-[#E2E8F0] sticky top-16 z-30 overflow-x-auto no-scrollbar my-2"
    >
      <div className="flex items-center gap-1.5 min-w-max">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mr-1 shrink-0">
          On this page:
        </span>
        {safeSections.map((sec) => {
          const isActive = currentId === sec.id;
          const displayLabel = sec.title || sec.label || sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => handleSelect(sec.id)}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                isActive
                  ? 'bg-[#102A43] text-white border-[#102A43]'
                  : 'bg-[#F6F8FC] text-[#475569] border-[#E2E8F0] hover:text-[#102A43]'
              }`}
            >
              {displayLabel}
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
  showBottomBorder = true,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  showBottomBorder?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`scroll-mt-28 py-4 sm:py-6 first:pt-2 ${
        showBottomBorder ? 'border-b border-[#E2E8F0] last:border-b-0' : ''
      } space-y-3`}
    >
      <div>
        <h2
          id={`${id}-heading`}
          className="text-base sm:text-lg font-bold text-[#102A43] tracking-tight"
        >
          {title}
        </h2>
        {subtitle && <p className="text-xs sm:text-sm text-[#64748B] mt-1">{subtitle}</p>}
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
  rows = [],
}: {
  rows?: {
    label: string;
    value?: React.ReactNode;
    tone?: ToneType;
    boldValue?: boolean;
    emphasize?: boolean;
  }[];
}) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const validRows = safeRows.filter(
    (r) =>
      r &&
      r.value !== undefined &&
      r.value !== null &&
      String(r.value).trim() !== ''
  );

  if (validRows.length === 0) return null;

  const getRowValueClasses = (row: {
    tone?: ToneType;
    boldValue?: boolean;
    emphasize?: boolean;
  }) => {
    const isBold = row.boldValue || row.emphasize;
    if (row.tone === 'emerald') return 'font-bold text-[#15803D]';
    if (row.tone === 'rose') return 'font-bold text-[#B91C1C]';
    if (row.tone === 'blue') return 'font-bold text-[#2563EB]';
    if (row.tone === 'amber') return 'font-bold text-[#B45309]';
    return isBold ? 'font-bold text-[#102A43]' : 'font-medium text-[#1E293B]';
  };

  return (
    <dl className="divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
      {validRows.map((row, idx) => (
        <div
          key={`${row.label}-${idx}`}
          className="py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-6"
        >
          <dt className="text-xs sm:text-sm font-medium text-[#64748B] sm:w-2/5 shrink-0">
            {row.label}
          </dt>
          <dd
            className={`text-xs sm:text-sm sm:w-3/5 sm:text-right break-words tabular-nums ${getRowValueClasses(
              row
            )}`}
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
  items = [],
  columns = 2,
}: {
  items?: string[];
  columns?: 1 | 2;
}) {
  const safeItems = Array.isArray(items)
    ? items.filter((i) => i && String(i).trim().length > 0)
    : [];
  if (safeItems.length === 0) return null;

  return (
    <ul
      className={`grid grid-cols-1 ${
        columns === 2 ? 'sm:grid-cols-2 gap-x-6' : ''
      } divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]`}
    >
      {safeItems.map((item, idx) => (
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
  steps = [],
}: {
  steps?: { title?: string; description: string }[];
}) {
  const safeSteps = Array.isArray(steps) ? steps : [];
  if (safeSteps.length === 0) return null;

  return (
    <ol className="divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
      {safeSteps.map((step, idx) => (
        <li key={idx} className="py-3 flex items-start gap-3">
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
  sectionId = 'official-sources',
  organisationName,
  officialAuthorityName,
  officialLinks = [],
  assistanceTitle,
  assistanceDescription,
  assistanceButtonLabel,
  onRequestAssistance,
  onAssistanceClick,
}: {
  sectionId?: string;
  organisationName?: string;
  officialAuthorityName?: string;
  officialLinks?: { label: string; href?: string; url?: string; note?: string }[];
  assistanceTitle: string;
  assistanceDescription: string;
  assistanceButtonLabel: string;
  onRequestAssistance?: () => void;
  onAssistanceClick?: () => void;
}) {
  const resolvedAuthority = organisationName || officialAuthorityName || 'Official Authority';
  const resolvedAssistanceAction = onRequestAssistance || onAssistanceClick;
  const safeLinks = Array.isArray(officialLinks) ? officialLinks : [];

  return (
    <section
      id={sectionId}
      aria-labelledby={`${sectionId}-heading`}
      className="scroll-mt-28 py-4 sm:py-6 border-b border-[#E2E8F0] space-y-3.5"
    >
      <div>
        <h2
          id={`${sectionId}-heading`}
          className="text-base sm:text-lg font-bold text-[#102A43] tracking-tight"
        >
          Official Sources &amp; Assistance
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Verify directly on the official authority portal or request operator support at CSC DOST.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Official Sources Column */}
        <div className="p-4 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl space-y-2.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
              Official Source &amp; Authority
            </span>
            <h3 className="text-sm font-bold text-[#102A43]">{resolvedAuthority}</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Access official notifications, instructions, and direct online portals:
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {safeLinks.map((lnk, idx) => {
              const targetHref = lnk.href || lnk.url || '#';
              return (
                <div key={idx} className="space-y-1">
                  <a
                    href={targetHref}
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
              );
            })}
          </div>
        </div>

        {/* CSC DOST Assistance Column */}
        <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] block">
              Independent Citizen Assistance
            </span>
            <h3 className="text-sm font-bold text-[#102A43]">{assistanceTitle}</h3>
            <p className="text-xs text-[#475569] leading-relaxed">{assistanceDescription}</p>
          </div>

          {resolvedAssistanceAction && (
            <div className="pt-1">
              <button
                type="button"
                onClick={resolvedAssistanceAction}
                className="min-h-[40px] w-full sm:w-auto px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <span>{assistanceButtonLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Shared Content Page Layout:
 * - Full-width open sections on mobile (<= 767px)
 * - Clean 12-column layout on desktop with slim, unboxed "On this page" sidebar
 * - Optional sticky mobile bottom action bar with safe-area spacing
 */
export function ContentPageLayout({
  breadcrumbs = [],
  backLabel,
  onBack,
  onPrint,
  onShare,
  whatsappShareUrl,
  sections,
  tocSections,
  activeSectionId,
  activeTocId,
  onSelectSection,
  onSelectToc,
  relatedTitle = 'Related Updates',
  relatedItems = [],
  sidebarCta,
  primaryActionLabel,
  onPrimaryAction,
  sidebarAssistanceTitle,
  sidebarAssistanceDesc,
  mobileStickyAction,
  secondaryActionLabel,
  onSecondaryAction,
  schemaJson,
  children,
}: {
  breadcrumbs?: BreadcrumbItem[];
  backLabel: string;
  onBack: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  whatsappShareUrl?: string;
  sections?: SectionNavItem[];
  tocSections?: SectionNavItem[];
  activeSectionId?: string;
  activeTocId?: string;
  onSelectSection?: (id: string) => void;
  onSelectToc?: (id: string) => void;
  relatedTitle?: string;
  relatedItems?: RelatedContentItem[];
  sidebarCta?: {
    badge?: string;
    title: string;
    description: string;
    buttonLabel: string;
    onAction: () => void;
  };
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  sidebarAssistanceTitle?: string;
  sidebarAssistanceDesc?: string;
  mobileStickyAction?: {
    primaryLabel: string;
    onPrimaryClick: () => void;
    secondaryLabel?: string;
    secondaryHref?: string;
    onSecondaryClick?: () => void;
  };
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  schemaJson?: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const navItems = Array.isArray(sections)
    ? sections
    : Array.isArray(tocSections)
    ? tocSections
    : [];
  const currentSectionId = activeSectionId || activeTocId || '';
  const handleSelectSection = onSelectSection || onSelectToc || (() => {});
  const safeRelated = Array.isArray(relatedItems) ? relatedItems : [];

  const resolvedSidebarCta =
    sidebarCta ||
    (primaryActionLabel && onPrimaryAction
      ? {
          badge: 'CSC DOST Assistance',
          title: sidebarAssistanceTitle || 'Need help with this application?',
          description:
            sidebarAssistanceDesc ||
            'Our operators can verify your documents, resize photos, and assist with online submission.',
          buttonLabel: primaryActionLabel,
          onAction: onPrimaryAction,
        }
      : undefined);

  const resolvedMobileBar =
    mobileStickyAction ||
    (primaryActionLabel && onPrimaryAction
      ? {
          primaryLabel: primaryActionLabel,
          onPrimaryClick: onPrimaryAction,
          secondaryLabel: secondaryActionLabel,
          onSecondaryClick: onSecondaryAction,
        }
      : undefined);

  return (
    <div className="min-h-screen bg-white md:bg-[#F6F8FC] text-[#102A43] pb-24 md:pb-16 pt-0 md:pt-4 font-sans w-full">
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
      )}

      {/* Top Utility, Breadcrumb & Back Bar */}
      <div className="bg-white border-b border-[#E2E8F0] md:border md:rounded-xl max-w-6xl mx-auto px-4 py-2.5 sm:px-5 sm:py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F8FC] hover:bg-slate-200/70 text-[#102A43] border border-[#E2E8F0] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
            <span>{backLabel}</span>
          </button>

          {breadcrumbs && breadcrumbs.length > 0 && (
            <ContentBreadcrumbs items={breadcrumbs} />
          )}
        </div>

        <div className="flex items-center gap-2">
          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F6F8FC] text-[#475569] hover:text-[#102A43] text-xs font-semibold rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
              title="Print this page"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Print</span>
            </button>
          )}

          {whatsappShareUrl && (
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg border border-emerald-600 transition-colors cursor-pointer"
              title="Share formatted notification on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
          )}

          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F6F8FC] text-[#475569] hover:text-[#102A43] text-xs font-semibold rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
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
              {safeRelated.length > 0 && (
                <section
                  aria-label={relatedTitle}
                  className="lg:hidden pt-5 mt-3 border-t border-[#E2E8F0] space-y-3"
                >
                  <h2 className="text-base font-bold text-[#102A43]">{relatedTitle}</h2>
                  <div className="space-y-2.5">
                    {safeRelated.map((rel) => {
                      const displayMeta = rel.metaText || rel.meta;
                      return (
                        <ColourAccentCard
                          key={rel.id}
                          categoryType={rel.categoryLabel}
                          categoryLabel={rel.categoryLabel}
                          title={rel.title}
                          footerMeta={displayMeta}
                          statusBadge={rel.statusNode}
                          onPrimaryClick={rel.onClick}
                        />
                      );
                    })}
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
              {navItems.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                    On this page
                  </span>
                  <nav aria-label="On this page" className="space-y-1 border-l border-[#E2E8F0]">
                    {navItems.map((sec) => {
                      const isActive = currentSectionId === sec.id;
                      const displayLabel = sec.title || sec.label || sec.id;
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => handleSelectSection(sec.id)}
                          className={`w-full text-left pl-3 py-1.5 text-xs transition-colors cursor-pointer -ml-px border-l-2 ${
                            isActive
                              ? 'border-[#2563EB] text-[#2563EB] font-bold'
                              : 'border-transparent text-[#64748B] hover:text-[#102A43] font-medium'
                          }`}
                        >
                          {displayLabel}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              )}

              {/* Subtle Assistance Callout */}
              {resolvedSidebarCta && (
                <div className="pt-5 border-t border-[#E2E8F0] space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] block">
                    {resolvedSidebarCta.badge || 'CSC DOST Assistance'}
                  </span>
                  <h3 className="text-sm font-bold text-[#102A43] leading-snug">
                    {resolvedSidebarCta.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {resolvedSidebarCta.description}
                  </p>
                  <button
                    type="button"
                    onClick={resolvedSidebarCta.onAction}
                    className="min-h-[40px] w-full px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <span>{resolvedSidebarCta.buttonLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}

              {/* Related Items */}
              {safeRelated.length > 0 && (
                <div className="pt-5 border-t border-[#E2E8F0] space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                    {relatedTitle}
                  </span>
                  <div className="space-y-2.5">
                    {safeRelated.map((rel) => {
                      const displayMeta = rel.metaText || rel.meta;
                      const relTheme = getCategoryTheme(rel.categoryLabel);
                      const iconCfg = getPortalCardIconConfig(
                        rel.categoryLabel,
                        rel.categoryLabel,
                        undefined,
                        rel.title
                      );
                      const RelIcon = iconCfg.Icon;
                      return (
                        <article
                          key={rel.id}
                          className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[11px] p-3.5 transition-colors space-y-2.5 shadow-none"
                        >
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                style={{
                                  backgroundColor: iconCfg.bg,
                                  borderColor: iconCfg.border,
                                  color: iconCfg.color,
                                }}
                                className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0"
                              >
                                <RelIcon className="w-4 h-4" aria-hidden="true" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-[#102A43] leading-snug truncate">
                                  {rel.categoryLabel}
                                </div>
                                <div className="text-[11px] font-medium text-[#64748B] leading-snug">
                                  {relTheme.defaultBadgeLabel}
                                </div>
                              </div>
                            </div>
                            {rel.statusNode && <div className="shrink-0">{rel.statusNode}</div>}
                          </div>

                          {/* Related Item Post Thumbnail */}
                          {(rel.thumbnailUrl || rel.id) && (
                            <div
                              onClick={rel.onClick}
                              className="overflow-hidden rounded-lg border border-[#E2E8F0] hover:border-[#CBD5E1] bg-slate-50 cursor-pointer w-full aspect-[1200/630]"
                            >
                              <img
                                src={rel.thumbnailUrl || `/thumbnails/${rel.id}.png`}
                                alt={rel.title}
                                loading="lazy"
                                className="w-full h-full object-contain block"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  if (!target.dataset.triedApi) {
                                    target.dataset.triedApi = '1';
                                    target.src = `/api/thumbnails/post/${rel.id}.png`;
                                  } else {
                                    target.style.display = 'none';
                                  }
                                }}
                              />
                            </div>
                          )}

                          <h4 className="text-sm font-bold text-[#102A43] leading-[1.4]">
                            <button
                              type="button"
                              onClick={rel.onClick}
                              className="text-left hover:text-[#2563EB] transition-colors cursor-pointer w-full focus-visible:outline-2 focus-visible:outline-[#2563EB] rounded"
                            >
                              {rel.title}
                            </button>
                          </h4>

                          {displayMeta && (
                            <div className="bg-[#F6F8FC] border border-[#E2E8F0]/80 rounded-lg px-2.5 py-1.5 text-[11px] text-[#475569] flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#64748B] shrink-0" aria-hidden="true" />
                              <span className="truncate font-medium text-[#102A43]">{displayMeta}</span>
                            </div>
                          )}

                          <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-end">
                            <button
                              type="button"
                              onClick={rel.onClick}
                              className="min-h-[36px] px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>{relTheme.defaultActionLabel}</span>
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      {/* Compact Sticky Mobile Action Bar (<= 767px) */}
      {resolvedMobileBar && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs border-t border-[#E2E8F0] px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] flex items-center gap-2 shadow-lg">
          {resolvedMobileBar.secondaryLabel && resolvedMobileBar.secondaryHref && (
            <a
              href={resolvedMobileBar.secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[42px] px-3.5 py-2 bg-[#F6F8FC] hover:bg-slate-200 text-[#102A43] border border-[#CBD5E1] text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1 shrink-0"
            >
              <span>{resolvedMobileBar.secondaryLabel}</span>
              <ExternalLink className="w-3 h-3 text-[#64748B]" aria-hidden="true" />
            </a>
          )}
          {resolvedMobileBar.secondaryLabel &&
            !resolvedMobileBar.secondaryHref &&
            resolvedMobileBar.onSecondaryClick && (
              <button
                type="button"
                onClick={resolvedMobileBar.onSecondaryClick}
                className="min-h-[42px] px-3.5 py-2 bg-[#F6F8FC] hover:bg-slate-200 text-[#102A43] border border-[#CBD5E1] text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                {resolvedMobileBar.secondaryLabel}
              </button>
            )}
          <button
            type="button"
            onClick={resolvedMobileBar.onPrimaryClick}
            className="min-h-[42px] flex-1 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <span className="truncate">{resolvedMobileBar.primaryLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * ============================================================================
 * APPROVED OPTION 1 PORTAL LISTING CARD SYSTEM
 * ============================================================================
 * Compact white portal cards (#FFFFFF) on #F6F8FC listing background with:
 * - Top Row: 40–44px category/organisation icon tile + Organisation name + smaller category label + status badge
 * - Title: Bold navy #102A43 (17–18px on mobile, line-height 1.4)
 * - Optional short summary (up to 2 lines, non-repetitive)
 * - Information Strip: Compact pale-grey band (#F6F8FC) with up to 2 real facts + small icons & labels
 * - Bottom Action Row: Quiet "Official source ↗" link on left (when available) + prominent #2563EB button on right
 */
export type ListingCategoryKey =
  | 'job'
  | 'scheme'
  | 'admission'
  | 'guide'
  | 'service'
  | 'neutral';

export interface CategoryColourTheme {
  key: ListingCategoryKey;
  accent: string;
  paleTint: string;
  badgeText: string;
  badgeBorder: string;
  defaultBadgeLabel: string;
  defaultActionLabel: string;
}

export const CATEGORY_COLOUR_THEMES: Record<ListingCategoryKey, CategoryColourTheme> = {
  job: {
    key: 'job',
    accent: '#2563EB',
    paleTint: '#EFF6FF',
    badgeText: '#1D4ED8',
    badgeBorder: '#DBEAFE',
    defaultBadgeLabel: 'Job / Recruitment',
    defaultActionLabel: 'View Details →',
  },
  scheme: {
    key: 'scheme',
    accent: '#D97706',
    paleTint: '#FFFBEB',
    badgeText: '#B45309',
    badgeBorder: '#FEF3C7',
    defaultBadgeLabel: 'Government Scheme',
    defaultActionLabel: 'Explore Scheme →',
  },
  admission: {
    key: 'admission',
    accent: '#7C3AED',
    paleTint: '#F5F3FF',
    badgeText: '#6D28D9',
    badgeBorder: '#EDE9FE',
    defaultBadgeLabel: 'Admission / Education',
    defaultActionLabel: 'View Details →',
  },
  guide: {
    key: 'guide',
    accent: '#D97706',
    paleTint: '#FFFBEB',
    badgeText: '#B45309',
    badgeBorder: '#FEF3C7',
    defaultBadgeLabel: 'Citizen Guide',
    defaultActionLabel: 'Read Guide →',
  },
  service: {
    key: 'service',
    accent: '#2563EB',
    paleTint: '#EFF6FF',
    badgeText: '#1D4ED8',
    badgeBorder: '#DBEAFE',
    defaultBadgeLabel: 'CSC E-Service',
    defaultActionLabel: 'View Service →',
  },
  neutral: {
    key: 'neutral',
    accent: '#475569',
    paleTint: '#F8FAFC',
    badgeText: '#334155',
    badgeBorder: '#E2E8F0',
    defaultBadgeLabel: 'Public Update',
    defaultActionLabel: 'View Details →',
  },
};

export function resolveListingCategoryKey(rawCategory?: string): ListingCategoryKey {
  if (!rawCategory) return 'neutral';
  const norm = rawCategory.trim().toLowerCase();

  if (
    norm === 'job' ||
    norm === 'jobs' ||
    norm === 'jkssb' ||
    norm === 'army_jobs' ||
    norm === 'ssc_jobs' ||
    norm === 'rrb_jobs' ||
    norm === 'recruitment' ||
    norm.includes('job') ||
    norm.includes('recruitment') ||
    norm.includes('vacancy') ||
    norm.includes('admit_card') ||
    norm.includes('result') ||
    norm.includes('answer_key') ||
    norm.includes('syllabus')
  ) {
    return 'job';
  }

  if (
    norm === 'scheme' ||
    norm === 'schemes' ||
    norm === 'central scheme' ||
    norm.includes('scheme') ||
    norm.includes('welfare') ||
    norm.includes('kisan') ||
    norm.includes('ayushman') ||
    norm.includes('benefit')
  ) {
    return 'scheme';
  }

  if (
    norm === 'admission' ||
    norm === 'admissions' ||
    norm === 'cluster_univ' ||
    norm === 'exam_forms' ||
    norm === 'nta' ||
    norm === 'education' ||
    norm.includes('admission') ||
    norm.includes('university') ||
    norm.includes('exam') ||
    norm.includes('education') ||
    norm.includes('scholarship')
  ) {
    return 'admission';
  }

  if (
    norm === 'guide' ||
    norm === 'guides' ||
    norm === 'identity & tax' ||
    norm === 'state services' ||
    norm.includes('guide') ||
    norm.includes('knowledge')
  ) {
    return 'guide';
  }

  if (
    norm === 'service' ||
    norm === 'services' ||
    norm === 'csc_service' ||
    norm === 'cards_adda' ||
    norm === 'jk_state' ||
    norm === 'revenue' ||
    norm === 'business' ||
    norm === 'digital' ||
    norm.includes('service') ||
    norm.includes('certificate') ||
    norm.includes('identity')
  ) {
    return 'service';
  }

  return 'neutral';
}

export function getCategoryTheme(rawCategory?: string): CategoryColourTheme {
  const key = resolveListingCategoryKey(rawCategory);
  return CATEGORY_COLOUR_THEMES[key];
}

export function getPortalCardIconConfig(
  categoryType?: string,
  categoryLabel?: string,
  organisation?: string,
  title?: string
) {
  const combined = `${categoryType || ''} ${categoryLabel || ''} ${organisation || ''} ${
    title || ''
  }`.toLowerCase();

  if (
    combined.includes('army') ||
    combined.includes('defence') ||
    combined.includes('agniveer') ||
    combined.includes('military')
  ) {
    return {
      Icon: Shield,
      bg: '#ECFDF5',
      border: '#D1FAE5',
      color: '#0D9488',
    };
  }

  if (
    combined.includes('rrb') ||
    combined.includes('railway') ||
    combined.includes('rpf') ||
    combined.includes('ntpc')
  ) {
    return {
      Icon: Train,
      bg: '#EFF6FF',
      border: '#DBEAFE',
      color: '#2563EB',
    };
  }

  const key = resolveListingCategoryKey(categoryType || categoryLabel);

  if (key === 'job') {
    return {
      Icon: Briefcase,
      bg: '#EFF6FF',
      border: '#DBEAFE',
      color: '#2563EB',
    };
  }

  if (key === 'admission') {
    return {
      Icon: GraduationCap,
      bg: '#F5F3FF',
      border: '#EDE9FE',
      color: '#7C3AED',
    };
  }

  if (key === 'scheme') {
    return {
      Icon: HeartHandshake,
      bg: '#FFFBEB',
      border: '#FEF3C7',
      color: '#D97706',
    };
  }

  if (key === 'service') {
    return {
      Icon: FileText,
      bg: '#EFF6FF',
      border: '#DBEAFE',
      color: '#2563EB',
    };
  }

  return {
    Icon: BookOpen,
    bg: '#F8FAFC',
    border: '#E2E8F0',
    color: '#2563EB',
  };
}

export interface PortalCardFact {
  icon?:
    | 'qualification'
    | 'calendar'
    | 'benefit'
    | 'region'
    | 'requirement'
    | 'fee'
    | 'topic'
    | 'clock';
  label?: string;
  value: React.ReactNode;
}

function renderFactIcon(iconType?: PortalCardFact['icon']) {
  switch (iconType) {
    case 'qualification':
      return <GraduationCap className="w-3.5 h-3.5 text-[#64748B] shrink-0 mt-0.5" aria-hidden="true" />;
    case 'calendar':
      return <Calendar className="w-3.5 h-3.5 text-[#64748B] shrink-0 mt-0.5" aria-hidden="true" />;
    case 'benefit':
      return <HeartHandshake className="w-3.5 h-3.5 text-[#64748B] shrink-0 mt-0.5" aria-hidden="true" />;
    case 'region':
      return <MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0 mt-0.5" aria-hidden="true" />;
    case 'requirement':
      return <FileText className="w-3.5 h-3.5 text-[#64748B] shrink-0 mt-0.5" aria-hidden="true" />;
    case 'fee':
      return <Tag className="w-3.5 h-3.5 text-[#64748B] shrink-0 mt-0.5" aria-hidden="true" />;
    case 'topic':
      return <BookOpen className="w-3.5 h-3.5 text-[#64748B] shrink-0 mt-0.5" aria-hidden="true" />;
    case 'clock':
    default:
      return <Clock className="w-3.5 h-3.5 text-[#64748B] shrink-0 mt-0.5" aria-hidden="true" />;
  }
}

export interface ColourAccentCardProps {
  key?: React.Key;
  id?: string;
  categoryType?: string;
  categoryLabel?: string;
  organisation?: string;
  statusBadge?: React.ReactNode;
  title: string;
  summary?: string;
  /** Structured up to 2 facts for the pale-grey information strip */
  infoFacts?: PortalCardFact[];
  /** Optional content-specific structured line (auto-mapped into info strip if infoFacts not provided) */
  metadataLine?: React.ReactNode;
  /** Optional second fact (e.g. Closing date, Read time, or Fee) */
  footerMeta?: React.ReactNode;
  /** Primary action label (defaults to category-appropriate label with arrow) */
  actionLabel?: string;
  onPrimaryClick: () => void;
  /** Optional canonical URL path for real semantic <a> navigation and crawlers */
  href?: string;
  /** Optional featured post thumbnail URL (2048x677 aspect ratio) */
  thumbnailUrl?: string;
  /** Optional official source link on bottom-left */
  officialHref?: string;
  officialLabel?: string;
  /** Optional secondary action button on footer */
  secondaryActionLabel?: string;
  onSecondaryClick?: () => void;
}

export function ColourAccentCard({
  id,
  categoryType,
  categoryLabel,
  organisation,
  statusBadge,
  title,
  summary,
  infoFacts,
  metadataLine,
  footerMeta,
  actionLabel,
  onPrimaryClick,
  href,
  thumbnailUrl,
  officialHref,
  officialLabel = 'Official source',
  secondaryActionLabel,
  onSecondaryClick,
}: ColourAccentCardProps) {
  const theme = getCategoryTheme(categoryType || categoryLabel);
  const resolvedCategoryLabel = categoryLabel || theme.defaultBadgeLabel;
  const resolvedOrganisation = organisation || resolvedCategoryLabel;
  const resolvedSubCategory = organisation ? resolvedCategoryLabel : theme.defaultBadgeLabel;

  const resolvedActionLabel = actionLabel
    ? actionLabel.includes('→')
      ? actionLabel
      : `${actionLabel} →`
    : theme.defaultActionLabel;

  const iconCfg = getPortalCardIconConfig(categoryType, categoryLabel, organisation, title);
  const CategoryIcon = iconCfg.Icon;

  // Build up to 2 genuine facts for the information strip
  const resolvedFacts: PortalCardFact[] = React.useMemo(() => {
    if (Array.isArray(infoFacts) && infoFacts.length > 0) {
      return infoFacts
        .filter((f) => f && f.value !== undefined && f.value !== null && f.value !== '')
        .slice(0, 2);
    }

    const fallbackFacts: PortalCardFact[] = [];
    const catKey = theme.key;

    if (metadataLine !== undefined && metadataLine !== null && metadataLine !== '') {
      const firstIcon: PortalCardFact['icon'] =
        catKey === 'job' || catKey === 'admission'
          ? 'qualification'
          : catKey === 'scheme'
          ? 'benefit'
          : catKey === 'service'
          ? 'requirement'
          : 'topic';
      fallbackFacts.push({
        icon: firstIcon,
        value: metadataLine,
      });
    }

    if (footerMeta !== undefined && footerMeta !== null && footerMeta !== '') {
      const secondIcon: PortalCardFact['icon'] =
        catKey === 'job' || catKey === 'admission'
          ? 'calendar'
          : catKey === 'service'
          ? 'fee'
          : 'clock';
      fallbackFacts.push({
        icon: secondIcon,
        value: footerMeta,
      });
    }

    return fallbackFacts.slice(0, 2);
  }, [infoFacts, metadataLine, footerMeta, theme.key]);

  return (
    <article
      id={id}
      className="w-full bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[11px] p-[14px] sm:p-4 transition-colors flex flex-col justify-between shadow-none"
    >
      <div>
        {/* A. TOP ROW: 40–44px icon tile + Organisation name + smaller category label + status badge */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              style={{
                backgroundColor: iconCfg.bg,
                borderColor: iconCfg.border,
                color: iconCfg.color,
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center shrink-0"
            >
              <CategoryIcon className="w-5 h-5" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <div className="text-xs sm:text-[13px] font-semibold text-[#102A43] leading-snug break-words">
                {resolvedOrganisation}
              </div>
              <div className="text-[11px] font-medium text-[#64748B] leading-snug mt-0.5">
                {resolvedSubCategory}
              </div>
            </div>
          </div>

          {statusBadge && <div className="shrink-0">{statusBadge}</div>}
        </div>

        {/* Optional 2048x677 Master Post Thumbnail */}
        {/* TOP POST THUMBNAIL (Standard 1200x630 Social Aspect Ratio) */}
        {thumbnailUrl && (
          href ? (
            <a
              href={href}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                  e.preventDefault();
                  onPrimaryClick();
                }
              }}
              className="mt-2.5 overflow-hidden rounded-lg border border-[#E2E8F0] hover:border-[#CBD5E1] bg-slate-50 block transition-transform duration-150 hover:scale-[1.005] w-full aspect-[1200/630]"
            >
              <img
                src={thumbnailUrl}
                alt={title}
                loading="lazy"
                className="w-full h-full object-contain block"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedFallback && id) {
                    target.dataset.triedFallback = '1';
                    target.src = `/thumbnails/${id}.png`;
                  } else {
                    target.style.display = 'none';
                  }
                }}
              />
            </a>
          ) : (
            <div
              onClick={onPrimaryClick}
              className="mt-2.5 overflow-hidden rounded-lg border border-[#E2E8F0] hover:border-[#CBD5E1] bg-slate-50 cursor-pointer transition-transform duration-150 hover:scale-[1.005] w-full aspect-[1200/630]"
            >
              <img
                src={thumbnailUrl}
                alt={title}
                loading="lazy"
                className="w-full h-full object-contain block"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedFallback && id) {
                    target.dataset.triedFallback = '1';
                    target.src = `/thumbnails/${id}.png`;
                  } else {
                    target.style.display = 'none';
                  }
                }}
              />
            </div>
          )
        )}

        {/* B. TITLE: 10px below top row, Bold Navy #102A43, 17–18px on mobile, line-height 1.4 */}
        <h3 className="mt-2.5 text-[17px] sm:text-[18px] font-bold text-[#102A43] leading-[1.4] break-words">
          {href ? (
            <a
              href={href}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                  e.preventDefault();
                  onPrimaryClick();
                }
              }}
              className="text-left text-[#102A43] hover:text-[#2563EB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] rounded transition-colors block w-full"
            >
              {title}
            </a>
          ) : (
            <button
              type="button"
              onClick={onPrimaryClick}
              className="text-left text-[#102A43] hover:text-[#2563EB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] rounded transition-colors cursor-pointer w-full"
            >
              {title}
            </button>
          )}
        </h3>

        {/* C. OPTIONAL SHORT SUMMARY: Max 2 lines, only when helpful */}
        {summary && (
          <p className="mt-1.5 text-[13.5px] sm:text-[14px] text-[#475569] leading-[1.45] line-clamp-2 break-words">
            {summary}
          </p>
        )}

        {/* D. INFORMATION STRIP: 8–10px below title/summary, pale-grey band (#F6F8FC) with up to 2 facts */}
        {resolvedFacts.length > 0 && (
          <div
            className={`mt-2.5 bg-[#F6F8FC] border border-[#E2E8F0]/80 rounded-lg px-3 py-2 ${
              resolvedFacts.length === 2
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0]'
                : 'block'
            }`}
          >
            {resolvedFacts.map((fact, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 text-xs text-[#334155] leading-snug min-w-0 ${
                  resolvedFacts.length === 2 && idx === 1 ? 'pt-1.5 sm:pt-0 sm:pl-3' : ''
                }`}
              >
                {renderFactIcon(fact.icon)}
                <div className="min-w-0 break-words">
                  {fact.label ? (
                    <>
                      <span className="text-[#64748B] font-medium">{fact.label}: </span>
                      <span className="font-semibold text-[#102A43]">{fact.value}</span>
                    </>
                  ) : (
                    fact.value
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* E. BOTTOM ACTION ROW: 10–12px below info strip, quiet official source on left, filled #2563EB button on right */}
      <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-xs">
        <div className="min-w-0 flex items-center gap-3">
          {officialHref ? (
            <a
              href={officialHref}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[38px] py-1.5 text-xs font-medium text-[#64748B] hover:text-[#102A43] hover:underline focus-visible:outline-2 focus-visible:outline-[#2563EB] rounded inline-flex items-center gap-1 transition-colors"
            >
              <span>{officialLabel === 'Official Link' || officialLabel === 'Official Portal' ? 'Official source' : officialLabel}</span>
              <span aria-hidden="true">↗</span>
            </a>
          ) : secondaryActionLabel && onSecondaryClick ? (
            <button
              type="button"
              onClick={onSecondaryClick}
              className="min-h-[38px] py-1.5 text-xs font-medium text-[#475569] hover:text-[#102A43] hover:underline focus-visible:outline-2 focus-visible:outline-[#2563EB] rounded inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{secondaryActionLabel}</span>
            </button>
          ) : (
            <span />
          )}
        </div>

        {href ? (
          <a
            href={href}
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                e.preventDefault();
                onPrimaryClick();
              }
            }}
            className="min-h-[40px] sm:min-h-[42px] px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-[13px] font-semibold rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] inline-flex items-center justify-center gap-1.5 transition-colors shrink-0 ml-auto no-underline"
          >
            <span>{resolvedActionLabel}</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={onPrimaryClick}
            className="min-h-[40px] sm:min-h-[42px] px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-[13px] font-semibold rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 ml-auto"
          >
            <span>{resolvedActionLabel}</span>
          </button>
        )}
      </div>
    </article>
  );
}


