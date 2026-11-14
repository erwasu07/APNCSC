import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { GUIDE_ARTICLES, GuideArticle } from '../data/guidesData';
import { useLanguage } from '../contexts/LanguageContext';
import SchemeDetailView from './schemes/SchemeDetailView';
import {
  AdSlot,
  AlertsBox,
  Breadcrumbs,
  Card,
  Chip,
  FilterChip,
  HelpApplyingCard,
} from './ui';

export type { GuideArticle };
export { GUIDE_ARTICLES };

interface GuidesKnowledgeHubProps {
  onSelectService?: (serviceName: string) => void;
  initialArticleId?: string | null;
  onClearInitialArticle?: () => void;
  onOpenArticle?: (articleId: string) => void;
  onNavigateRoute?: (path: string) => void;
}

const ORDERED_CATEGORIES: GuideArticle['category'][] = [
  'Central Scheme',
  'Recruitment',
  'Identity & Tax',
  'Education',
  'State Services',
];

export default function GuidesKnowledgeHub({
  onSelectService,
  initialArticleId,
  onClearInitialArticle,
  onOpenArticle,
  onNavigateRoute,
}: GuidesKnowledgeHubProps) {
  const { language, t } = useLanguage();
  const [selectedArticle, setSelectedArticle] = useState<GuideArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (initialArticleId) {
      const found = GUIDE_ARTICLES.find((a) => a.id === initialArticleId);
      setSelectedArticle(found || null);
    } else {
      setSelectedArticle(null);
    }
  }, [initialArticleId]);

  useEffect(() => {
    const handleOpenGuideEvent = (e: Event) => {
      const custom = e as CustomEvent<{ guideId?: string; category?: string }>;
      if (custom.detail?.guideId) {
        const found = GUIDE_ARTICLES.find((a) => a.id === custom.detail.guideId);
        if (found) {
          setSelectedArticle(found);
        }
      } else if (custom.detail?.category) {
        setSelectedArticle(null);
        setSelectedCategory(custom.detail.category);
      }
    };
    window.addEventListener('open-guide-article', handleOpenGuideEvent);
    return () => {
      window.removeEventListener('open-guide-article', handleOpenGuideEvent);
    };
  }, []);

  const searchMatchingArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return GUIDE_ARTICLES;
    return GUIDE_ARTICLES.filter(
      (article) =>
        article.title.toLowerCase().includes(q) ||
        article.hindiTitle.toLowerCase().includes(q) ||
        (article.urduTitle && article.urduTitle.toLowerCase().includes(q)) ||
        article.summary.toLowerCase().includes(q) ||
        article.officialPortal.toLowerCase().includes(q) ||
        (article.responsibleDepartment &&
          article.responsibleDepartment.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const availableCategories = useMemo(() => {
    const present = ORDERED_CATEGORIES.filter((cat) =>
      GUIDE_ARTICLES.some((a) => a.category === cat)
    );
    return ['All', ...present];
  }, []);

  const filteredArticles = useMemo(() => {
    return searchMatchingArticles.filter(
      (article) => selectedCategory === 'All' || article.category === selectedCategory
    );
  }, [searchMatchingArticles, selectedCategory]);

  const relatedGuides = useMemo(() => {
    if (!selectedArticle) return [];
    const sameCategory = GUIDE_ARTICLES.filter(
      (g) => g.id !== selectedArticle.id && g.category === selectedArticle.category
    );
    const others = GUIDE_ARTICLES.filter(
      (g) => g.id !== selectedArticle.id && g.category !== selectedArticle.category
    );
    return [...sameCategory, ...others].slice(0, 3);
  }, [selectedArticle]);

  const handleCloseArticle = () => {
    setSelectedArticle(null);
    if (onClearInitialArticle) {
      onClearInitialArticle();
    } else if (onNavigateRoute) {
      onNavigateRoute('/schemes');
    } else {
      try {
        window.history.pushState(null, '', '/schemes');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch {}
    }
  };

  const handleOpenArticleById = (articleId: string) => {
    const found = GUIDE_ARTICLES.find((a) => a.id === articleId);
    if (!found) return;

    if (onOpenArticle) {
      onOpenArticle(articleId);
    } else {
      setSelectedArticle(found);
      try {
        window.history.pushState(null, '', `/scheme/${articleId}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {}
    }
  };

  const handleBreadcrumbNavigate = (href: string) => {
    if (onNavigateRoute) {
      onNavigateRoute(href);
    } else {
      try {
        window.history.pushState(null, '', href);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch {}
    }
  };

  const getLocalizedArticleTitle = (article: GuideArticle) => {
    if (language === 'ur' && article.urduTitle) return article.urduTitle;
    if (language === 'hi' && article.hindiTitle) return article.hindiTitle;
    return article.title;
  };

  const getCategoryLabel = (cat: string) => {
    if (cat === 'Central Scheme') return t.catSchemes;
    return cat;
  };

  if (selectedArticle) {
    return (
      <SchemeDetailView
        article={selectedArticle}
        relatedArticles={relatedGuides}
        onBack={handleCloseArticle}
        onOpenRelated={handleOpenArticleById}
        onRequestHelp={(serviceName) => onSelectService?.(serviceName)}
      />
    );
  }

  return (
    <section
      id="knowledge-hub"
      aria-labelledby="schemes-hub-h1"
      className="w-full bg-[var(--bg-page)] text-[var(--text-primary)] pb-12"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-5">
        <Breadcrumbs
          items={[
            { label: t.navHome, href: '/' },
            { label: t.navSchemes },
          ]}
          onNavigate={handleBreadcrumbNavigate}
        />

        {/* Page Header */}
        <header className="space-y-2 text-start">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#1F9D6B]">
              <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t.schemesHubEyebrow}</span>
            </span>
            <Chip>{t.independentChip}</Chip>
          </div>
          <h1
            id="schemes-hub-h1"
            className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight m-0"
          >
            {t.schemesHubTitle}
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed m-0">
            {t.schemesHubSubtitle}
          </p>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed m-0">
            For J&amp;K state welfare facilitation, also see{' '}
            <a
              href="/service/jk-ladli-beti"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                  e.preventDefault();
                  handleBreadcrumbNavigate('/service/jk-ladli-beti');
                }
              }}
              className="font-bold text-[#1F9D6B] hover:underline"
            >
              Ladli Beti &amp; State Marriage Assistance Scheme
            </a>{' '}
            and{' '}
            <a
              href="/service/jk-pension-isss"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                  e.preventDefault();
                  handleBreadcrumbNavigate('/service/jk-pension-isss');
                }
              }}
              className="font-bold text-[#1F9D6B] hover:underline"
            >
              JK-ISSS &amp; GOI NSAP Social Pension Sanction
            </a>
            .
          </p>
        </header>

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
            {t.schemesNoGuaranteeNote}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-3.5 sm:p-4 space-y-3">
          <div className="relative w-full">
            <label htmlFor="knowledge-hub-search" className="sr-only">
              {t.schemesSearchPlaceholder}
            </label>
            <Search
              className="w-4 h-4 text-[var(--text-muted)] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="knowledge-hub-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.schemesSearchPlaceholder}
              className="w-full min-h-[44px] ps-10 pe-10 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] focus:border-[#1F9D6B] rounded-xl text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label={t.clearSearch}
                className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] absolute end-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div
            role="group"
            aria-label="Filter government schemes and guides"
            className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
          >
            {availableCategories.map((cat) => {
              const count =
                cat === 'All'
                  ? searchMatchingArticles.length
                  : searchMatchingArticles.filter((a) => a.category === cat).length;
              return (
                <FilterChip
                  key={cat}
                  label={cat === 'All' ? t.filterAll : getCategoryLabel(cat)}
                  active={selectedCategory === cat}
                  count={count}
                  onClick={() => setSelectedCategory(cat)}
                />
              );
            })}
          </div>
        </div>

        {/* Scheme & Guide Cards Grid */}
        {filteredArticles.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <p className="text-base font-bold text-[var(--text-primary)] m-0">
              {t.schemesNoMatchTitle}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#101A36] text-white font-bold text-sm inline-flex items-center justify-center cursor-pointer hover:bg-[#1B2A52]"
            >
              {t.resetFilters}
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => {
              const isScheme = article.category === 'Central Scheme';
              const localizedTitle = getLocalizedArticleTitle(article);

              return (
                <Card
                  key={article.id}
                  statusStripe={isScheme ? 'open' : undefined}
                  interactive
                  className="p-4 sm:p-5 flex flex-col justify-between gap-4 text-start"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Chip variant={isScheme ? 'verified' : 'default'}>
                        {getCategoryLabel(article.category)}
                      </Chip>
                      <span className="text-xs font-semibold text-[var(--text-muted)]">
                        {article.readTime}
                      </span>
                    </div>

                    <a
                      href={`/scheme/${article.id}`}
                      onClick={(e) => {
                        if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                          e.preventDefault();
                          handleOpenArticleById(article.id);
                        }
                      }}
                      className="block group no-underline space-y-2"
                    >
                      <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] group-hover:text-[#1F9D6B] transition-colors leading-snug m-0">
                        {localizedTitle}
                      </h2>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 m-0">
                        {article.summary}
                      </p>
                    </a>

                    <dl className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[var(--border-default)] text-xs">
                      <div className="space-y-0.5 min-w-0">
                        <dt className="font-semibold text-[var(--text-muted)] truncate">
                          {isScheme ? t.schemesBenefitLabel : t.departmentLabel}
                        </dt>
                        <dd className="font-bold text-[var(--text-primary)] truncate m-0">
                          {isScheme
                            ? article.benefitSummary || t.schemesAsPerGuidelines
                            : article.responsibleDepartment || article.officialPortal}
                        </dd>
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <dt className="font-semibold text-[var(--text-muted)] truncate">
                          {isScheme ? t.schemesRegionLabel : 'Updated'}
                        </dt>
                        <dd className="font-bold text-[var(--text-primary)] truncate m-0">
                          {isScheme
                            ? article.applicableRegion || t.schemesAsPerGuidelines
                            : article.lastUpdated}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Card Action Footer: Internal Guide Link + External Official Portal Link (separate anchors) */}
                  <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between gap-2">
                    <a
                      href={`/scheme/${article.id}`}
                      onClick={(e) => {
                        if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                          e.preventDefault();
                          handleOpenArticleById(article.id);
                        }
                      }}
                      className="min-h-[40px] inline-flex items-center gap-1.5 text-sm font-bold text-[#1F9D6B] hover:underline no-underline"
                    >
                      <span>{t.exploreScheme}</span>
                      <ArrowRight
                        className="w-4 h-4 rtl:rotate-180 shrink-0"
                        aria-hidden="true"
                      />
                    </a>

                    <a
                      href={article.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] px-2.5 py-1.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs font-semibold text-[var(--text-primary)] inline-flex items-center gap-1 no-underline transition-colors shrink-0"
                    >
                      <span className="truncate max-w-[130px]">{article.officialPortal}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                    </a>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <AdSlot />

        {/* Editorial Official Source Note */}
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-secondary)] text-start">
          <ShieldCheck
            className="w-4 h-4 text-[#1F9D6B] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="leading-relaxed m-0">
            All scheme guides and citizen walkthroughs on CSC DOST link directly to official portals (
            <a
              href="https://pmkisan.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F9D6B] hover:underline font-semibold"
            >
              pmkisan.gov.in
            </a>
            ,{' '}
            <a
              href="https://beneficiary.nha.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F9D6B] hover:underline font-semibold"
            >
              beneficiary.nha.gov.in
            </a>
            ,{' '}
            <a
              href="https://myaadhaar.uidai.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F9D6B] hover:underline font-semibold"
            >
              myaadhaar.uidai.gov.in
            </a>
            ,{' '}
            <a
              href="https://www.incometax.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F9D6B] hover:underline font-semibold"
            >
              incometax.gov.in
            </a>
            ,{' '}
            <a
              href="https://jkssb.nic.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F9D6B] hover:underline font-semibold"
            >
              jkssb.nic.in
            </a>
            , and{' '}
            <a
              href="https://joinindianarmy.nic.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F9D6B] hover:underline font-semibold"
            >
              joinindianarmy.nic.in
            </a>
            ). Confirm final eligibility rules, deadlines, and fees directly on the official portal.
          </p>
        </div>

        {/* Citizen Helpdesk & Alerts */}
        <HelpApplyingCard contextTitle={t.schemesHubTitle} />
        <AlertsBox />
      </div>
    </section>
  );
}
