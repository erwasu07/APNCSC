import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Calculator,
  Camera,
  Crop,
  FileArchive,
  FileCheck2,
  FileDown,
  FileImage,
  Files,
  Image as ImageIcon,
  Minimize2,
  PenTool,
  Receipt,
  RefreshCw,
  RotateCw,
  Scissors,
  Search,
  ShieldAlert,
  Split,
  Wrench,
  X,
} from 'lucide-react';
import './category-midnight.css';
import {
  buildCategoryDataset,
  type CategorySlug,
  type NormalizedCategoryItem,
  type StatusFilterId,
} from './categoryDataMapper';
import { useSyncedSarkariPosts } from '../../utils/postDataSync';
import { CORE_CATEGORIES, SITE_ORIGIN, getCategorySeoMeta, IGNOU_EDUCATION_SEO } from '../../utils/seoConfig';
import type { SarkariItem } from '../../data/sarkariData';
import type { ServiceItem } from '../../servicesData';
import { AdSlot } from '../ui';

const PAGE_BATCH_SIZE = 20;

const CATEGORY_NAV_PILLS: { slug: CategorySlug; label: string; href: string }[] = [
  { slug: 'jobs', label: 'Jobs', href: '/jobs' },
  { slug: 'education', label: 'Education', href: '/education' },
  { slug: 'schemes', label: 'Schemes', href: '/schemes' },
  { slug: 'services', label: 'Services', href: '/services' },
  { slug: 'tools', label: 'Tools', href: '/tools' },
  { slug: 'calculators', label: 'Calculators', href: '/calculators' },
];

const LEGAL_FOOTER_LINKS = [
  { label: 'About', href: '/about-us' },
  { label: 'Contact', href: '/contact-us' },
  { label: 'Privacy', href: '/privacy-policy' },
  { label: 'Terms', href: '/terms-of-service' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Refund', href: '/refund-policy' },
];

export interface CategoryPageProps {
  category: CategorySlug;
  educationSubRoute?: boolean;
  routeSearch?: string;
  onNavigateRoute?: (path: string) => void;
  onOpenPost?: (item: SarkariItem) => void;
  onOpenScheme?: (schemeId: string) => void;
  onOpenService?: (service: ServiceItem) => void;
  onOpenTool?: (toolId: string) => void;
  onApplyService?: (serviceName?: string) => void;
}

function normalizeUrlOrgParam(rawOrg: string | null, category: CategorySlug): string {
  if (!rawOrg) return 'all';
  const lower = rawOrg.trim().toLowerCase();
  if (category === 'jobs') {
    if (lower === 'jkssb') return 'JKSSB';
    if (lower === 'ssc' || lower === 'ssc_jobs') return 'SSC';
    if (lower === 'rrb' || lower === 'rrb_jobs') return 'RRB';
    if (lower === 'army' || lower === 'indian army' || lower === 'army_jobs') return 'Indian Army';
    if (lower === 'banking' || lower === 'banking_jobs' || lower.includes('ibps')) return 'Banking';
  }
  if (category === 'education') {
    if (lower === 'ignou') return 'IGNOU';
    if (lower.includes('kashmir')) return 'Kashmir Univ';
    if (lower.includes('cluster')) return 'Cluster Univ';
    if (lower.includes('nta')) return 'NTA';
  }
  return rawOrg.trim();
}

function renderItemIcon(iconName?: string): React.ReactNode {
  switch (iconName) {
    case 'Minimize2':
      return <Minimize2 className="w-5 h-5" aria-hidden="true" />;
    case 'Crop':
      return <Crop className="w-5 h-5" aria-hidden="true" />;
    case 'FileImage':
      return <FileImage className="w-5 h-5" aria-hidden="true" />;
    case 'FileDown':
      return <FileDown className="w-5 h-5" aria-hidden="true" />;
    case 'Files':
      return <Files className="w-5 h-5" aria-hidden="true" />;
    case 'Split':
      return <Split className="w-5 h-5" aria-hidden="true" />;
    case 'FileArchive':
      return <FileArchive className="w-5 h-5" aria-hidden="true" />;
    case 'Scissors':
      return <Scissors className="w-5 h-5" aria-hidden="true" />;
    case 'Camera':
      return <Camera className="w-5 h-5" aria-hidden="true" />;
    case 'Signature':
      return <PenTool className="w-5 h-5" aria-hidden="true" />;
    case 'RefreshCw':
      return <RefreshCw className="w-5 h-5" aria-hidden="true" />;
    case 'RotateCw':
      return <RotateCw className="w-5 h-5" aria-hidden="true" />;
    case 'ShieldAlert':
      return <ShieldAlert className="w-5 h-5" aria-hidden="true" />;
    case 'Calculator':
      return <Calculator className="w-5 h-5" aria-hidden="true" />;
    case 'Image':
      return <ImageIcon className="w-5 h-5" aria-hidden="true" />;
    case 'Receipt':
      return <Receipt className="w-5 h-5" aria-hidden="true" />;
    case 'FileCheck2':
      return <FileCheck2 className="w-5 h-5" aria-hidden="true" />;
    default:
      return <Wrench className="w-5 h-5" aria-hidden="true" />;
  }
}

export default function CategoryPage({
  category,
  educationSubRoute = false,
  routeSearch,
  onNavigateRoute,
  onOpenPost,
  onOpenScheme,
  onOpenService,
  onOpenTool,
  onApplyService,
}: CategoryPageProps) {
  const syncedPosts = useSyncedSarkariPosts(true);
  const pendingTagRef = useRef<string | null>(null);

  const rawSearch =
    routeSearch !== undefined
      ? routeSearch
      : typeof window !== 'undefined'
      ? window.location.search
      : '';

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    const p = new URLSearchParams(rawSearch);
    return p.get('q') || '';
  });

  const [activeStatus, setActiveStatus] = useState<StatusFilterId>(() => {
    const p = new URLSearchParams(rawSearch);
    const t = p.get('tab');
    if (t === 'results' || t === 'exams' || p.get('filter') === 'answer_key') return 'updates';
    if (t === 'archive') return 'closed';
    if (t === 'open_now' || t === 'upcoming') return 'open';
    return 'all';
  });

  const [activeTag, setActiveTag] = useState<string>(() => {
    if (category === 'education' && educationSubRoute) return 'IGNOU';
    const p = new URLSearchParams(rawSearch);
    return normalizeUrlOrgParam(p.get('org'), category);
  });

  const [visibleLimit, setVisibleLimit] = useState<number>(PAGE_BATCH_SIZE);

  // Sync filters cleanly when navigating between category routes or subroutes
  useEffect(() => {
    const p = new URLSearchParams(rawSearch);
    const qParam = p.get('q') || '';
    const tParam = p.get('tab');
    const fParam = p.get('filter');
    const orgParam = p.get('org');

    setSearchQuery(qParam);
    setVisibleLimit(PAGE_BATCH_SIZE);

    if (pendingTagRef.current !== null) {
      setActiveTag(pendingTagRef.current);
      pendingTagRef.current = null;
    } else if (category === 'education' && educationSubRoute) {
      setActiveTag('IGNOU');
    } else if (orgParam) {
      setActiveTag(normalizeUrlOrgParam(orgParam, category));
    } else {
      setActiveTag('all');
    }

    if (tParam === 'results' || tParam === 'exams' || fParam === 'answer_key') {
      setActiveStatus('updates');
    } else if (tParam === 'archive') {
      setActiveStatus('closed');
    } else if (tParam === 'open_now' || tParam === 'upcoming') {
      setActiveStatus('open');
    } else {
      setActiveStatus('all');
    }
  }, [category, educationSubRoute, rawSearch]);

  // Load Manrope + Instrument Serif dynamically ONLY while CategoryPage is mounted
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const linkId = 'cm-google-fonts';
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Instrument+Serif:ital@1&display=swap';
      document.head.appendChild(link);
    }
    return () => {
      try {
        const el = document.getElementById(linkId);
        if (el && el.parentNode) el.parentNode.removeChild(el);
      } catch {}
    };
  }, []);

  const dataset = useMemo(
    () => buildCategoryDataset(category, syncedPosts, educationSubRoute),
    [category, syncedPosts, educationSubRoute]
  );

  // Inject structured CollectionPage + BreadcrumbList JSON-LD for active category
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const scriptId = 'cm-collection-schema';
    const meta =
      category === 'education' && educationSubRoute
        ? IGNOU_EDUCATION_SEO
        : getCategorySeoMeta(category);
    const catMeta = CORE_CATEGORIES.find((c) => c.slug === category);

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: meta.title,
      description: meta.description,
      url: meta.canonicalUrl,
      isPartOf: {
        '@type': 'WebSite',
        name: 'CSC DOST',
        url: `${SITE_ORIGIN}/`,
      },
      mainEntity: {
        '@type': 'ItemList',
        name: catMeta?.label || meta.title,
        numberOfItems: dataset.allItems.length,
        itemListElement: dataset.allItems.slice(0, 20).map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.title,
          url: `${SITE_ORIGIN}${item.href}`,
        })),
      },
    };

    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => {
      try {
        const el = document.getElementById(scriptId);
        if (el && el.parentNode) el.parentNode.removeChild(el);
      } catch {}
    };
  }, [category, educationSubRoute, dataset.allItems]);

  // 1. Search-filtered pool (used to keep status & tag counts responsive to search)
  const searchFilteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return dataset.allItems;
    return dataset.allItems.filter((item) => item.searchHaystack.includes(q));
  }, [dataset.allItems, searchQuery]);

  // 2. Apply tag filter before status counts
  const tagAndSearchItems = useMemo(() => {
    if (activeTag === 'all') return searchFilteredItems;
    return searchFilteredItems.filter((item) => item.tag === activeTag);
  }, [searchFilteredItems, activeTag]);

  const liveStatusCounts = useMemo<Record<StatusFilterId, number>>(() => {
    return {
      all: tagAndSearchItems.length,
      open: tagAndSearchItems.filter((i) => i.statusBucket === 'open').length,
      updates: tagAndSearchItems.filter((i) => i.statusBucket === 'updates').length,
      closed: tagAndSearchItems.filter((i) => i.statusBucket === 'closed').length,
    };
  }, [tagAndSearchItems]);

  // 3. Final filtered list (across ALL items before slicing to 20)
  const filteredItems = useMemo(() => {
    const base =
      dataset.hero.hasDeadlines && activeStatus !== 'all'
        ? tagAndSearchItems.filter((i) => i.statusBucket === activeStatus)
        : tagAndSearchItems;

    // Non-deadline categories sort alphabetically when actively filtering
    if (!dataset.hero.hasDeadlines && (searchQuery.trim() !== '' || activeTag !== 'all')) {
      return [...base].sort((a, b) => a.title.localeCompare(b.title));
    }
    return base;
  }, [tagAndSearchItems, dataset.hero.hasDeadlines, activeStatus, searchQuery, activeTag]);

  const isFilteringNonDeadline =
    !dataset.hero.hasDeadlines && (searchQuery.trim() !== '' || activeTag !== 'all');

  // Slice to visibleLimit (20 initially, +20 per "Load more")
  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleLimit),
    [filteredItems, visibleLimit]
  );

  // Organize visibleItems into display groups
  const groupedSections = useMemo(() => {
    if (dataset.hero.hasDeadlines) {
      const buckets: {
        id: string;
        label: string;
        dotTone: 'is-green' | 'is-amber' | 'is-muted';
        items: NormalizedCategoryItem[];
      }[] = [
        {
          id: 'open',
          label: 'Applications open',
          dotTone: 'is-green',
          items: visibleItems.filter((i) => i.statusBucket === 'open'),
        },
        {
          id: 'updates',
          label: 'Results and updates',
          dotTone: 'is-amber',
          items: visibleItems.filter((i) => i.statusBucket === 'updates'),
        },
        {
          id: 'closed',
          label: 'Closed',
          dotTone: 'is-muted',
          items: visibleItems.filter((i) => i.statusBucket === 'closed'),
        },
      ];
      return buckets.filter((g) => g.items.length > 0);
    }

    if (isFilteringNonDeadline) {
      return visibleItems.length > 0
        ? [
            {
              id: 'filtered',
              label: activeTag !== 'all' ? activeTag : 'Matching results',
              dotTone: 'is-blue' as const,
              items: visibleItems,
            },
          ]
        : [];
    }

    // Group non-deadline categories cleanly by tag
    const groupMap = new Map<string, NormalizedCategoryItem[]>();
    for (const item of visibleItems) {
      const list = groupMap.get(item.tag) || [];
      list.push(item);
      groupMap.set(item.tag, list);
    }
    return Array.from(groupMap.entries()).map(([tag, items]) => ({
      id: tag,
      label: tag,
      dotTone: 'is-blue' as const,
      items,
    }));
  }, [dataset.hero.hasDeadlines, visibleItems, isFilteringNonDeadline, activeTag]);

  const navigateRoute = (e: React.MouseEvent<HTMLElement>, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (onNavigateRoute) {
      e.preventDefault();
      onNavigateRoute(href);
    }
  };

  const handleOpenItem = (e: React.MouseEvent<HTMLAnchorElement>, item: NormalizedCategoryItem) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();

    if (item.rawPost && onOpenPost) {
      onOpenPost(item.rawPost);
      return;
    }
    if (item.rawScheme && onOpenScheme) {
      onOpenScheme(item.rawScheme.id);
      return;
    }
    if (item.rawService && onOpenService) {
      onOpenService(item.rawService);
      return;
    }
    if (item.rawTool && onOpenTool) {
      onOpenTool(item.rawTool.id);
      return;
    }
    if (onNavigateRoute) {
      onNavigateRoute(item.href);
      return;
    }
    window.location.href = item.href;
  };

  const handleApplyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (onApplyService) {
      e.preventDefault();
      onApplyService();
    } else if (onNavigateRoute) {
      e.preventDefault();
      onNavigateRoute('/apply');
    }
  };

  const handleSelectTag = (tagId: string) => {
    setVisibleLimit(PAGE_BATCH_SIZE);
    if (category === 'education' && educationSubRoute && tagId !== 'IGNOU' && onNavigateRoute) {
      pendingTagRef.current = tagId;
      onNavigateRoute('/education');
      return;
    }
    setActiveTag(tagId);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveStatus('all');
    setVisibleLimit(PAGE_BATCH_SIZE);
    if (category === 'education' && educationSubRoute && onNavigateRoute) {
      pendingTagRef.current = 'all';
      onNavigateRoute('/education');
    } else {
      setActiveTag('all');
    }
  };

  const remainingCount = Math.max(0, filteredItems.length - visibleItems.length);
  const useIconBadge = category === 'tools' || category === 'calculators';

  return (
    <div className="cat-midnight">
      {/* 1. LIVE STRIP (Deadlines categories: jobs, education) */}
      {dataset.hero.hasDeadlines && dataset.liveStripItem && (
        <div className="cm-live-strip">
          <div className="cm-container">
            <a
              href={dataset.liveStripItem.href}
              onClick={(e) => handleOpenItem(e, dataset.liveStripItem!)}
              className="cm-live-strip-link"
            >
              <span className="cm-live-strip-dot" aria-hidden="true" />
              <span className="cm-live-strip-days">
                {dataset.liveStripItem.daysRemaining === 0
                  ? 'Closes today'
                  : `${dataset.liveStripItem.daysRemaining} days left`}
              </span>
              <span className="cm-live-strip-text">
                {dataset.liveStripItem.title} closes {dataset.liveStripItem.dateDisplay} →
              </span>
            </a>
          </div>
        </div>
      )}

      {/* 2. HERO */}
      <header className="cm-hero">
        <div className="cm-hero-grid" aria-hidden="true" />
        <div className="cm-container cm-hero-inner">
          {/* Top Brand + Apply Pill Row */}
          <div className="cm-hero-topbar cm-anim">
            <a
              href="/"
              onClick={(e) => navigateRoute(e, '/')}
              className="cm-brand"
              aria-label="CSC DOST Homepage"
            >
              <span className="cm-brand-mark" aria-hidden="true">
                CD
              </span>
              <span className="cm-brand-name">CSC DOST</span>
            </a>

            <a
              href="/apply"
              onClick={handleApplyClick}
              className="cm-btn-primary cm-btn-sm"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>

          {/* Scrollable 6-Category Pill Navigation */}
          <nav aria-label="Portal Categories" className="cm-catnav cm-anim cm-delay-1">
            {CATEGORY_NAV_PILLS.map((pill) => {
              const isActive = pill.slug === category;
              return (
                <a
                  key={pill.slug}
                  href={pill.href}
                  onClick={(e) => navigateRoute(e, pill.href)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`cm-catnav-pill ${isActive ? 'is-active' : ''}`}
                >
                  {pill.label}
                </a>
              );
            })}
          </nav>

          {/* Live Bulletin Status Pill */}
          <div className="cm-live-tag cm-anim cm-delay-2">
            <span className="cm-live-tag-dot" aria-hidden="true" />
            <span>Live bulletin · updated {dataset.updatedLabel}</span>
          </div>

          {/* Hero Title (up to 76px with Instrument Serif italic accent) */}
          <h1 className="cm-h1 cm-anim cm-delay-2">
            {dataset.hero.h1Lead}
            <em className="cm-h1-accent">{dataset.hero.h1Accent}</em>
          </h1>

          <p className="cm-hero-desc cm-anim cm-delay-3">{dataset.hero.description}</p>

          {category === 'education' && (
            <a
              href={educationSubRoute ? '/education' : '/education/ignou'}
              onClick={(e) =>
                navigateRoute(e, educationSubRoute ? '/education' : '/education/ignou')
              }
              className="cm-subroute-link cm-anim cm-delay-3"
            >
              <span>
                {educationSubRoute
                  ? '← Back to all Education & Admissions'
                  : 'Open IGNOU Dedicated Bulletin →'}
              </span>
            </a>
          )}
        </div>
      </header>

      {/* 3. GLASS STATS CARD */}
      <section aria-label="Category Statistics" className="cm-stats-wrap cm-anim cm-delay-3">
        <div className="cm-container">
          <div className="cm-stats-card">
            {dataset.stats.map((stat) => (
              <div key={stat.label} className="cm-stat-cell">
                <span className="cm-stat-val">{stat.value}</span>
                <span className="cm-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED RAIL */}
      {dataset.featuredItems.length > 0 && (
        <section aria-label={dataset.hero.featuredTitle} className="cm-rail-section cm-anim cm-delay-4">
          <div className="cm-container">
            <div className="cm-section-kicker">
              <h2 className="cm-kicker-title">
                <span
                  className={`cm-dot-glow ${dataset.hero.hasDeadlines ? 'is-amber' : 'is-blue'}`}
                  aria-hidden="true"
                />
                <span>{dataset.hero.featuredTitle}</span>
              </h2>
            </div>

            <div className="cm-rail">
              {dataset.featuredItems.map((item) => {
                const isDeadline = dataset.hero.hasDeadlines && item.daysRemaining !== null;
                return (
                  <a
                    key={`rail-${item.id}`}
                    href={item.href}
                    onClick={(e) => handleOpenItem(e, item)}
                    className="cm-rail-card"
                  >
                    <div className="cm-rail-card-inner">
                      <div>
                        <div className="cm-rail-label">
                          <span>
                            {item.tag} · {item.statusLabel}
                          </span>
                        </div>
                        <h3 className="cm-rail-title" style={{ marginTop: 8 }}>
                          {item.title}
                        </h3>
                        {!isDeadline && item.description && (
                          <p className="cm-rail-desc" style={{ marginTop: 6 }}>
                            {item.description}
                          </p>
                        )}
                      </div>

                      {isDeadline ? (
                        <div>
                          <div className="cm-rail-progress-track" style={{ marginBottom: 12 }}>
                            <div
                              className={`cm-rail-progress-bar ${
                                (item.daysRemaining ?? 99) <= 7 ? 'is-urgent' : ''
                              }`}
                              style={{ width: `${item.progressPct ?? 40}%` }}
                            />
                          </div>
                          <div className="cm-rail-foot">
                            <div>
                              <span className="cm-rail-days-num">
                                {item.daysRemaining === 0 ? 'Today' : item.daysRemaining}
                              </span>
                              <span className="cm-rail-days-sub">
                                {item.daysRemaining === 0
                                  ? `Closes ${item.dateDisplay}`
                                  : `days left · ${item.dateDisplay}`}
                              </span>
                            </div>
                            <span className="cm-round-arrow" aria-hidden="true">
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="cm-rail-foot">
                          <div className="cm-badge-46" aria-hidden="true">
                            {useIconBadge ? renderItemIcon(item.iconName) : item.initials}
                          </div>
                          <span className="cm-round-arrow" aria-hidden="true">
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. STICKY GLASS FILTER BAR */}
      <div className="cm-filter-bar">
        <div className="cm-container cm-filter-stack">
          <div className="cm-search-wrap">
            <Search className="w-4 h-4 cm-search-icon" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleLimit(PAGE_BATCH_SIZE);
              }}
              placeholder={dataset.hero.searchPlaceholder}
              aria-label={`Search ${dataset.hero.navLabel}`}
              className="cm-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setVisibleLimit(PAGE_BATCH_SIZE);
                }}
                aria-label="Clear search"
                className="cm-search-clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status pills ONLY for deadline categories (jobs, education) */}
          {dataset.hero.hasDeadlines && (
            <div className="cm-pills-row" role="tablist" aria-label="Filter by status">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'open', label: 'Open' },
                  { id: 'updates', label: 'Updates' },
                  { id: 'closed', label: 'Closed' },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  role="tab"
                  aria-selected={activeStatus === pill.id}
                  onClick={() => {
                    setActiveStatus(pill.id);
                    setVisibleLimit(PAGE_BATCH_SIZE);
                  }}
                  className={`cm-pill ${activeStatus === pill.id ? 'is-active' : ''}`}
                >
                  <span>{pill.label}</span>
                  <span className="cm-pill-count">{liveStatusCounts[pill.id]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Scrollable Tag Pills built from existing tags */}
          {dataset.tagOptions.length > 1 && (
            <div className="cm-pills-row" aria-label="Filter by tag">
              {dataset.tagOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={activeTag === opt.id}
                  onClick={() => handleSelectTag(opt.id)}
                  className={`cm-pill ${activeTag === opt.id ? 'is-active' : ''}`}
                >
                  <span>{opt.label}</span>
                  <span className="cm-pill-count">{opt.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6 & 7. GROUPS + ITEM ROWS + ADS + LOAD MORE */}
      <div className="cm-container cm-list-body">
        {groupedSections.length > 0 ? (
          groupedSections.map((group, groupIdx) => (
            <React.Fragment key={group.id}>
              <section aria-labelledby={`cm-group-${group.id}`} className="cm-group">
                <div className="cm-group-head">
                  <h2 id={`cm-group-${group.id}`} className="cm-kicker-title">
                    <span className={`cm-dot-glow ${group.dotTone}`} aria-hidden="true" />
                    <span>{group.label}</span>
                  </h2>
                  <span className="cm-group-count cm-tabular">{group.items.length}</span>
                </div>

                <div>
                  {group.items.map((item) => {
                    const dotClass =
                      item.statusBucket === 'open'
                        ? 'is-open'
                        : item.statusBucket === 'updates'
                        ? 'is-update'
                        : 'is-closed';

                    const showCountdown =
                      dataset.hero.hasDeadlines && item.daysRemaining !== null;
                    const showUpcomingDays =
                      dataset.hero.hasDeadlines &&
                      item.daysRemaining === null &&
                      item.daysToStart !== null;
                    const showEnded =
                      dataset.hero.hasDeadlines &&
                      item.daysRemaining === null &&
                      item.daysToStart === null &&
                      item.hasPastDeadlineDate;

                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        onClick={(e) => handleOpenItem(e, item)}
                        className="cm-row"
                      >
                        <span className="cm-badge-46" aria-hidden="true">
                          {useIconBadge ? renderItemIcon(item.iconName) : item.initials}
                        </span>

                        <div className="cm-row-main">
                          <h3 className="cm-row-title">{item.title}</h3>
                          <div className="cm-row-meta">
                            <span className={`cm-status-dot ${dotClass}`} aria-hidden="true" />
                            <span>{item.tag}</span>
                            {item.dateDisplay && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{item.dateDisplay}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="cm-row-right">
                          {showCountdown ? (
                            <>
                              <span
                                className={`cm-days-big ${
                                  (item.daysRemaining ?? 99) <= 7 ? 'is-urgent' : ''
                                }`}
                              >
                                {item.daysRemaining === 0 ? 'Today' : item.daysRemaining}
                              </span>
                              <span className="cm-days-sub">
                                {item.daysRemaining === 0
                                  ? 'closes'
                                  : item.daysRemaining === 1
                                  ? 'day left'
                                  : 'days left'}
                              </span>
                            </>
                          ) : showUpcomingDays ? (
                            <>
                              <span className="cm-days-big">{item.daysToStart}</span>
                              <span className="cm-days-sub">to open</span>
                            </>
                          ) : showEnded ? (
                            <span className="cm-days-big is-ended">Ended</span>
                          ) : (
                            <span className="cm-row-arrow" aria-hidden="true">
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </section>

              {/* Google AdSense Slot cleanly placed between groups */}
              {groupIdx < groupedSections.length - 1 && (
                <div className="cm-ad-wrap">
                  <AdSlot />
                </div>
              )}
            </React.Fragment>
          ))
        ) : (
          <div className="cm-empty">
            <h2 className="cm-empty-title">No matching items found</h2>
            <p className="cm-empty-desc">
              Try clearing your search or switching status and category tags.
            </p>
            <button type="button" onClick={handleResetFilters} className="cm-btn-secondary">
              Reset filters
            </button>
          </div>
        )}

        {/* Load more pagination (+20 items per tap) */}
        {remainingCount > 0 && (
          <div className="cm-load-more-wrap">
            <button
              type="button"
              onClick={() => setVisibleLimit((prev) => prev + PAGE_BATCH_SIZE)}
              className="cm-btn-secondary"
            >
              <span>Load more</span>
              <span className="cm-tabular">({remainingCount} remaining)</span>
            </button>
          </div>
        )}

        {/* Single AdSlot below single-group listings so AdSense stays preserved */}
        {groupedSections.length === 1 && (
          <div className="cm-ad-wrap">
            <AdSlot />
          </div>
        )}

        {/* 8. HELP PANEL */}
        <section aria-label="Assisted Application Support" className="cm-help-panel">
          <div className="cm-help-panel-inner">
            <div>
              <h2 className="cm-help-title">Need help filling the form?</h2>
              <p className="cm-help-desc">
                Submit your documents online to our Authorised CSC desk or visit our Sangran
                Qazigund centre for verification and filing.
              </p>
            </div>
            <a href="/apply" onClick={handleApplyClick} className="cm-btn-primary">
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* 9. PUBLISHER BLOCK */}
        <section aria-label="Publisher Disclosure" className="cm-publisher">
          <p>
            Wasim Ahmad Khanday, Authorised CSC VLE ID 212515670018, Sangran Qazigund, Anantnag,
            J&amp;K 192221, +91 70068 33767
          </p>
          <p>CSC DOST is not a government website.</p>
          <nav aria-label="Legal & Support Links" className="cm-publisher-links">
            {LEGAL_FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => navigateRoute(e, link.href)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </section>
      </div>

      {/* 10. MOBILE FIXED BOTTOM BAR (hidden >= 768px) */}
      <div className="cm-mobile-bar">
        <div className="cm-mobile-bar-inner">
          <span className="cm-mobile-bar-text">
            Need help applying? Visit our assisted desk
          </span>
          <a href="/apply" onClick={handleApplyClick} className="cm-btn-primary cm-btn-sm">
            <span>Apply Now</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
