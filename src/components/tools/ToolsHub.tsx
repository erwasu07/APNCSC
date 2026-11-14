import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Minimize2,
  RefreshCw,
  Scissors,
  FileImage,
  Files,
  Split,
  FileArchive,
  FileDown,
  Camera,
  PenTool,
  ShieldAlert,
  RotateCw,
  CheckCircle2,
  Lock,
  Calculator,
  Info,
} from 'lucide-react';
import { TOOLS_LIST, TOOLS_CATEGORIES, ToolItem } from './toolsData';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  AdSlot,
  AlertsBox,
  Breadcrumbs,
  Card,
  Chip,
  FaqAccordion,
  FilterChip,
  HelpApplyingCard,
  type FaqItem,
} from '../ui';
import ImageCompressorTool from './ImageCompressorTool';
import ImageToPdfTool from './ImageToPdfTool';
import PdfMergeTool from './PdfMergeTool';
import PdfSplitTool from './PdfSplitTool';
import PdfCompressorTool from './PdfCompressorTool';
import BackgroundRemoverTool from './BackgroundRemoverTool';
import PassportPhotoTool from './PassportPhotoTool';
import ImageSignatureResizerTool from './ImageSignatureResizerTool';
import PdfToImageTool from './PdfToImageTool';
import ImageConverterTool from './ImageConverterTool';
import PdfWatermarkRotateTool from './PdfWatermarkRotateTool';
import PdfMetadataCleanerTool from './PdfMetadataCleanerTool';

interface ToolsHubProps {
  initialToolId?: string;
  onSelectTool?: (toolId: string | null) => void;
  onNavigateRoute?: (path: string) => void;
}

const PDF_WORKER_TOOLS = new Set(['pdf-compressor', 'pdf-to-image']);

export default function ToolsHub({
  initialToolId,
  onSelectTool,
  onNavigateRoute,
}: ToolsHubProps) {
  const { t } = useLanguage();
  const [activeToolId, setActiveToolId] = useState<string | null>(initialToolId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    setActiveToolId(initialToolId || null);
  }, [initialToolId]);

  const navigateRoute = (href: string) => {
    if (onNavigateRoute) {
      onNavigateRoute(href);
      return;
    }
    try {
      window.history.pushState(null, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.location.href = href;
    }
  };

  const selectTool = (toolId: string | null) => {
    setActiveToolId(toolId);
    if (onSelectTool) onSelectTool(toolId);
    const targetPath = toolId ? `/tools/${toolId}` : '/tools';
    navigateRoute(targetPath);
  };

  const resolveToolMeta = (id: string): ToolItem | undefined => {
    const exact = TOOLS_LIST.find((item) => item.id === id);
    if (exact) return exact;
    if (id === 'image-signature-resizer') {
      return TOOLS_LIST.find((item) => item.id === 'signature-resizer');
    }
    if (id === 'image-converter') {
      return TOOLS_LIST.find((item) => item.id === 'jpg-to-png');
    }
    return undefined;
  };

  const searchMatchingTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return TOOLS_LIST;
    return TOOLS_LIST.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.categoryLabel.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const filteredTools = useMemo(() => {
    if (selectedCategory === 'all') return searchMatchingTools;
    return searchMatchingTools.filter((tool) => tool.category === selectedCategory);
  }, [searchMatchingTools, selectedCategory]);

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Minimize2':
        return Minimize2;
      case 'RefreshCw':
        return RefreshCw;
      case 'Scissors':
        return Scissors;
      case 'FileImage':
        return FileImage;
      case 'Files':
        return Files;
      case 'Split':
        return Split;
      case 'FileArchive':
        return FileArchive;
      case 'FileDown':
        return FileDown;
      case 'Camera':
        return Camera;
      case 'Signature':
        return PenTool;
      case 'Crop':
        return Scissors;
      case 'RotateCw':
        return RotateCw;
      case 'ShieldAlert':
        return ShieldAlert;
      default:
        return Sparkles;
    }
  };

  const hubFaqs: FaqItem[] = useMemo(
    () => [
      {
        question: 'Are these document tools free to use?',
        answer:
          'Yes. All 14 photo compressors, PDF utilities, signature resizers, and metadata cleaners on CSC DOST are free with no sign-up or watermarks.',
      },
      {
        question: 'Are my photos, signatures, or PDFs uploaded to a server?',
        answer:
          'No. Files are processed locally in your browser memory using HTML5 Canvas and client-side JavaScript libraries, and are never uploaded to any server. Note: PDF Compressor and PDF to Image download the open-source pdf.js worker script from cdnjs.cloudflare.com for local rendering while keeping your PDF document strictly on your device.',
      },
      {
        question: 'Do resized photos and signatures work on JKSSB, SSC, and RRB portals?',
        answer:
          'Yes. Photo and signature tools support target KB limits (such as 10–20 KB signatures and 20–50 KB passport photos) and pixel sizes used by major Indian application portals. Always confirm final upload rules on the concerned exam portal.',
      },
      {
        question: 'Can I use these tools on a mobile phone over slow internet?',
        answer:
          'Yes. Once loaded, image and PDF operations run directly on your device processor without waiting to upload or download large document files over mobile data.',
      },
    ],
    []
  );

  // =========================================================================
  // INDIVIDUAL TOOL VIEW (/tools/<slug>): Shared 4-Part Tool Layout
  // (1) Input + (2) Result -> (3) Short Explanation -> (4) Privacy Note
  // =========================================================================
  if (activeToolId) {
    const currentTool = resolveToolMeta(activeToolId);
    const displayName = currentTool?.name || 'Document Tool';
    const relatedTools = TOOLS_LIST.filter(
      (item) => item.id !== currentTool?.id && item.category === currentTool?.category
    ).slice(0, 3);
    const usesPdfWorkerCdn = PDF_WORKER_TOOLS.has(activeToolId);

    return (
      <div className="w-full bg-[var(--bg-page)] text-[var(--text-primary)] pb-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-5 sm:space-y-6">
          <Breadcrumbs
            items={[
              { label: t.navHome, href: '/' },
              { label: t.navTools, href: '/tools' },
              { label: displayName },
            ]}
            onNavigate={navigateRoute}
            rightSlot={
              <button
                type="button"
                onClick={() => selectTool(null)}
                className="min-h-[40px] inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)] hover:text-[#1F9D6B] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180 shrink-0" aria-hidden="true" />
                <span>{t.toolsBackToAll}</span>
              </button>
            }
          />

          {/* Header Summary Bar */}
          <header className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-6 space-y-3 text-start shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Chip variant="verified">
                  {currentTool?.categoryLabel || t.navTools}
                </Chip>
                <Chip>{t.toolsPrivacyBadge}</Chip>
              </div>
              <a
                href="/calculators"
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                    e.preventDefault();
                    navigateRoute('/calculators');
                  }
                }}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:text-[#1F9D6B] no-underline"
              >
                <Calculator className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
                <span>{t.navCalculators}</span>
              </a>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight leading-snug m-0">
                {displayName}
              </h1>
              {currentTool?.shortDescription && (
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed m-0 max-w-3xl">
                  {currentTool.shortDescription}
                </p>
              )}
            </div>
          </header>

          {/* 1. INPUT & 2. RESULT WORKSPACE (Light-safe container preserves tool UI readability across light/dark themes) */}
          <section
            aria-label={`${displayName} workspace`}
            className="bg-white text-[#101A36] border border-[var(--border-default)] rounded-2xl p-4 sm:p-6 shadow-2xs overflow-x-hidden"
          >
            {activeToolId === 'image-compressor' && <ImageCompressorTool />}
            {activeToolId === 'image-resizer' && <ImageSignatureResizerTool initialMode="image" />}
            {(activeToolId === 'signature-resizer' ||
              activeToolId === 'image-signature-resizer') && (
              <ImageSignatureResizerTool initialMode="signature" />
            )}
            {activeToolId === 'image-to-pdf' && <ImageToPdfTool />}
            {activeToolId === 'pdf-to-image' && <PdfToImageTool />}
            {activeToolId === 'pdf-merge' && <PdfMergeTool />}
            {activeToolId === 'pdf-split' && <PdfSplitTool />}
            {activeToolId === 'pdf-compressor' && <PdfCompressorTool />}
            {activeToolId === 'background-remover' && <BackgroundRemoverTool />}
            {activeToolId === 'passport-photo-maker' && <PassportPhotoTool />}
            {activeToolId === 'jpg-to-png' && <ImageConverterTool initialFormat="image/png" />}
            {activeToolId === 'png-to-jpg' && <ImageConverterTool initialFormat="image/jpeg" />}
            {activeToolId === 'image-converter' && <ImageConverterTool />}
            {activeToolId === 'pdf-watermark-rotate' && <PdfWatermarkRotateTool />}
            {activeToolId === 'pdf-metadata-cleaner' && <PdfMetadataCleanerTool />}
          </section>

          <AdSlot />

          {/* 3. SHORT EXPLANATION & 4. PRIVACY NOTE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            <Card className="p-5 space-y-3 text-start flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#2563EB] shrink-0" aria-hidden="true" />
                  <h2 className="text-lg font-extrabold text-[var(--text-primary)] m-0">
                    {t.toolsExplanationTitle}
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed m-0">
                  {currentTool?.shortDescription ||
                    'Prepare compliant images and PDF documents directly in your browser without desktop software.'}
                </p>
                {currentTool?.specs && (
                  <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-3 text-sm">
                    <span className="font-semibold text-[var(--text-muted)] me-1.5">
                      {t.toolsCapabilitiesLabel}:
                    </span>
                    <strong className="text-[var(--text-primary)]">{currentTool.specs}</strong>
                  </div>
                )}
              </div>

              {currentTool?.keywords && currentTool.keywords.length > 0 && (
                <div className="pt-3 border-t border-[var(--border-default)] space-y-1.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {t.toolsCommonUsesLabel}
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] m-0 leading-relaxed">
                    {currentTool.keywords.slice(0, 6).join(' · ')}
                  </p>
                </div>
              )}
            </Card>

            <section
              role="note"
              className="rounded-2xl border border-[var(--status-open-border)] bg-[var(--status-open-bg)] p-5 space-y-3 text-start shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1F9D6B] text-white flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] m-0">
                    {t.toolsPrivacyTitle}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0">
                    {t.toolsPrivacyDesc}
                  </p>
                  {usesPdfWorkerCdn && (
                    <p className="text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-2.5 mt-2 m-0 leading-relaxed">
                      {t.toolsPrivacyNotePdfWorker}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Related Tools */}
          {relatedTools.length > 0 && (
            <section aria-label={t.toolsRelatedTitle} className="space-y-3 text-start">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-extrabold text-[var(--text-primary)] m-0">
                  {t.toolsRelatedTitle}
                </h2>
                <a
                  href="/tools"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                      e.preventDefault();
                      selectTool(null);
                    }
                  }}
                  className="text-sm font-bold text-[#1F9D6B] hover:underline no-underline"
                >
                  {t.viewAllTools}
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedTools.map((rel) => {
                  const RelIcon = getToolIcon(rel.iconName);
                  return (
                    <a
                      key={rel.id}
                      href={`/tools/${rel.id}`}
                      onClick={(e) => {
                        if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                          e.preventDefault();
                          selectTool(rel.id);
                        }
                      }}
                      className="block rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] hover:border-[var(--border-strong)] p-4 space-y-2 no-underline transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] flex items-center justify-center shrink-0">
                          <RelIcon className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] m-0 leading-snug">
                          {rel.name}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 m-0 leading-relaxed">
                        {rel.shortDescription}
                      </p>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          <HelpApplyingCard contextTitle={displayName} />
          <AlertsBox />
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN TOOLS HUB (/tools)
  // =========================================================================
  return (
    <div className="w-full bg-[var(--bg-page)] text-[var(--text-primary)] pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-5 sm:space-y-6">
        <Breadcrumbs
          items={[{ label: t.navHome, href: '/' }, { label: t.toolsHubTitle }]}
          onNavigate={navigateRoute}
          rightSlot={
            <a
              href="/calculators"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                  e.preventDefault();
                  navigateRoute('/calculators');
                }
              }}
              className="min-h-[40px] inline-flex items-center gap-1.5 text-sm font-bold text-[#1F9D6B] hover:underline no-underline"
            >
              <Calculator className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t.calculatorsShortcut}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 shrink-0" aria-hidden="true" />
            </a>
          }
        />

        {/* Hub Header & Search */}
        <header className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-6 space-y-4 text-start shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Chip variant="verified">{t.toolsPrivacyBadge}</Chip>
            <span className="text-xs font-bold text-[var(--text-muted)] tabular-nums">
              {TOOLS_LIST.length} free tools
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight m-0">
              {t.toolsHubTitle}
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed m-0 max-w-3xl">
              {t.toolsHubSubtitle}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search
              className="w-4 h-4 text-[var(--text-muted)] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.toolsSearchPlaceholder}
              aria-label={t.toolsSearchPlaceholder}
              className="w-full min-h-[44px] ps-10 pe-20 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] focus:border-[#101A36] text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#1F9D6B]/25"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute end-2 top-1/2 -translate-y-1/2 min-h-[34px] px-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
              >
                {t.clearSearch}
              </button>
            )}
          </div>
        </header>

        {/* Verified Client-Side Privacy Notice */}
        <section
          role="note"
          className="rounded-2xl border border-[var(--status-open-border)] bg-[var(--status-open-bg)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1F9D6B] text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] m-0">
                {t.toolsPrivacyTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed m-0">
                {t.toolsPrivacyDesc}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-xs font-bold text-[#146C48] dark:text-[#6EE7B7] shrink-0 self-start sm:self-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1F9D6B] shrink-0" aria-hidden="true" />
            <span>Zero Server Upload</span>
          </span>
        </section>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {TOOLS_CATEGORIES.map((cat) => {
            const count =
              cat.id === 'all'
                ? searchMatchingTools.length
                : searchMatchingTools.filter((item) => item.category === cat.id).length;
            return (
              <FilterChip
                key={cat.id}
                label={cat.id === 'all' ? t.filterAll : cat.label}
                active={selectedCategory === cat.id}
                count={count}
                onClick={() => setSelectedCategory(cat.id)}
              />
            );
          })}
        </div>

        {/* Tools Grid */}
        {filteredTools.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <p className="text-base font-bold text-[var(--text-primary)] m-0">
              No tools found matching &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#101A36] text-white font-bold text-sm cursor-pointer hover:bg-[#1B2A52]"
            >
              {t.resetFilters}
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => {
              const IconComponent = getToolIcon(tool.iconName);
              return (
                <Card
                  key={tool.id}
                  interactive
                  className="p-4 sm:p-5 flex flex-col justify-between gap-4 text-start"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-11 h-11 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] flex items-center justify-center shrink-0">
                        <IconComponent className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <Chip variant="default">{tool.categoryLabel}</Chip>
                    </div>

                    <a
                      href={`/tools/${tool.id}`}
                      onClick={(e) => {
                        if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                          e.preventDefault();
                          selectTool(tool.id);
                        }
                      }}
                      className="block group no-underline space-y-1.5"
                    >
                      <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] group-hover:text-[#1F9D6B] transition-colors leading-snug m-0">
                        {tool.name}
                      </h2>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2 m-0">
                        {tool.shortDescription}
                      </p>
                    </a>

                    {tool.specs && (
                      <p className="text-xs font-semibold text-[var(--text-muted)] m-0 pt-2 border-t border-[var(--border-default)]">
                        {tool.specs}
                      </p>
                    )}
                  </div>

                  <a
                    href={`/tools/${tool.id}`}
                    onClick={(e) => {
                      if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                        e.preventDefault();
                        selectTool(tool.id);
                      }
                    }}
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[#101A36] text-[var(--text-primary)] hover:text-white border border-[var(--border-default)] font-bold text-sm inline-flex items-center justify-between no-underline transition-colors"
                  >
                    <span>{t.toolsLaunchBtn}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180 shrink-0" aria-hidden="true" />
                  </a>
                </Card>
              );
            })}
          </div>
        )}

        <AdSlot />

        <FaqAccordion items={hubFaqs} title={t.calculatorsFaqTitle} injectSchema />

        <HelpApplyingCard contextTitle={t.toolsHubTitle} />
        <AlertsBox />
      </div>
    </div>
  );
}
