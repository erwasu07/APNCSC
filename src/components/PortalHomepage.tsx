import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  GraduationCap,
  ShieldCheck,
  CreditCard,
  Wrench,
  Search,
  MapPin,
  ArrowRight,
  Calculator,
  Clock,
  Building2,
  Users,
  PhoneCall,
  UserCheck,
  X,
} from 'lucide-react';
import {
  SarkariItem,
  isPublishedSarkariItem,
  isIgnouItem,
  isEducationSarkariItem,
  isRecruitmentSarkariItem,
} from '../data/sarkariData';
import { computeSarkariStatus } from '../utils/sarkariStatus';
import { useSyncedSarkariPosts, sortByNewestPostDate } from '../utils/postDataSync';
import { SERVICES_LIST, ServiceItem } from '../servicesData';
import { GUIDE_ARTICLES } from '../data/guidesData';
import { TOOLS_LIST } from './tools/toolsData';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Section } from './ui/Section';
import { AlertsBox } from './ui/AlertsBox';
import { HelpApplyingCard } from './ui/HelpApplyingCard';
import { AdSlot } from './ui/AdSlot';

export interface PortalHomepageProps {
  onOpenJob: (item: SarkariItem) => void;
  onOpenService: (item: ServiceItem) => void;
  onApplyService: (serviceName: string) => void;
  onOpenGuide?: (guideId: string) => void;
  onOpenTrack?: () => void;
  onOpenLegal?: (tab: 'privacy' | 'terms' | 'disclaimer') => void;
  onNavigateRoute?: (route: string) => void;
}

export default function PortalHomepage({
  onOpenJob,
  onOpenService,
  onOpenGuide,
  onOpenTrack,
  onNavigateRoute,
}: PortalHomepageProps) {
  const { t, language } = useLanguage();
  const allPosts = useSyncedSarkariPosts();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleHeaderSearch = (e: Event) => {
      const custom = e as CustomEvent<{ query?: string }>;
      if (typeof custom.detail?.query === 'string') {
        setSearchQuery(custom.detail.query);
      }
    };

    const handleFocusSearch = () => {
      const el = document.getElementById('portal-inline-search-input');
      if (el) el.focus();
    };

    window.addEventListener('csc-header-search', handleHeaderSearch);
    window.addEventListener('focus-csc-search', handleFocusSearch);
    return () => {
      window.removeEventListener('csc-header-search', handleHeaderSearch);
      window.removeEventListener('focus-csc-search', handleFocusSearch);
    };
  }, []);

  const navigate = (path: string) => {
    if (onNavigateRoute) {
      onNavigateRoute(path);
      return;
    }
    try {
      window.history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch {
      window.location.href = path;
    }
  };

  const getOrganisationLabel = (item: SarkariItem): string => {
    if (isIgnouItem(item)) return 'IGNOU';
    switch (item.category) {
      case 'jkssb':
        return 'JKSSB';
      case 'banking_jobs':
        return item.department || 'Banking / J&K Bank';
      case 'army_jobs':
        return 'Indian Army';
      case 'ssc_jobs':
        return 'SSC';
      case 'rrb_jobs':
        return 'RRB';
      case 'cluster_univ':
        return 'Cluster University Srinagar';
      case 'exam_forms':
      case 'admissions':
        return 'University of Kashmir';
      case 'nta':
        return 'NTA';
      default:
        return item.department || 'Public Notice';
    }
  };

  // Five required Category Tiles (Jobs, Education, Schemes, Services, Tools & Calculators)
  const categoryTiles = [
    {
      id: 'jobs',
      title: t.catJobs,
      desc: t.catJobsDesc,
      href: '/jobs',
      Icon: Briefcase,
      iconBg: 'bg-[#101A36] text-[#F5A623]',
    },
    {
      id: 'admissions',
      title: t.catAdmissions,
      desc: t.catAdmissionsDesc,
      href: '/education',
      Icon: GraduationCap,
      iconBg: 'bg-[#101A36] text-[#F5A623]',
    },
    {
      id: 'schemes',
      title: t.catSchemes,
      desc: t.catSchemesDesc,
      href: '/schemes',
      Icon: ShieldCheck,
      iconBg: 'bg-[#1F9D6B] text-white',
    },
    {
      id: 'services',
      title: t.catServices,
      desc: t.catServicesDesc,
      href: '/services',
      Icon: CreditCard,
      iconBg: 'bg-[#101A36] text-white',
    },
    {
      id: 'tools',
      title: t.catTools,
      desc: t.catToolsDesc,
      href: '/tools',
      Icon: Wrench,
      iconBg: 'bg-[#F5A623] text-[#101A36]',
    },
  ];

  // Computed "Closing this week" items: strictly 0 <= daysRemaining <= 7
  const closingThisWeek = useMemo(() => {
    return allPosts
      .filter((item) => {
        if (!isPublishedSarkariItem(item) || item.isCancelled || item.duplicateOfId) return false;
        const st = computeSarkariStatus(item);
        return (
          st.verificationStatus !== 'needs_verification' &&
          st.isUrgentUnder7Days &&
          st.daysRemaining !== null &&
          st.daysRemaining >= 0 &&
          st.daysRemaining <= 7
        );
      })
      .sort((a, b) => {
        const stA = computeSarkariStatus(a);
        const stB = computeSarkariStatus(b);
        const diff = (stA.daysRemaining ?? 99) - (stB.daysRemaining ?? 99);
        if (diff !== 0) return diff;
        return sortByNewestPostDate(a, b);
      })
      .slice(0, 6);
  }, [allPosts]);

  // Latest Jobs (open/upcoming sorted first, newest post date)
  const latestJobs = useMemo(() => {
    return allPosts
      .filter((item) => {
        if (!isPublishedSarkariItem(item) || !isRecruitmentSarkariItem(item)) return false;
        const st = computeSarkariStatus(item);
        return st.verificationStatus !== 'needs_verification' && !item.isCancelled;
      })
      .sort((a, b) => {
        const stA = computeSarkariStatus(a);
        const stB = computeSarkariStatus(b);
        if (stA.canApplyOnline !== stB.canApplyOnline) return stA.canApplyOnline ? -1 : 1;
        if (stA.isUrgentUnder7Days !== stB.isUrgentUnder7Days) return stA.isUrgentUnder7Days ? -1 : 1;
        return sortByNewestPostDate(a, b);
      })
      .slice(0, 6);
  }, [allPosts]);

  // Admissions & University updates
  const admissionNotices = useMemo(() => {
    return allPosts
      .filter((item) => {
        if (!isPublishedSarkariItem(item) || !isEducationSarkariItem(item)) return false;
        const st = computeSarkariStatus(item);
        return st.verificationStatus !== 'needs_verification' && !item.isCancelled;
      })
      .sort((a, b) => {
        const stA = computeSarkariStatus(a);
        const stB = computeSarkariStatus(b);
        if (stA.canApplyOnline !== stB.canApplyOnline) return stA.canApplyOnline ? -1 : 1;
        return sortByNewestPostDate(a, b);
      })
      .slice(0, 4);
  }, [allPosts]);

  // Popular Schemes (prioritize Central Schemes first, then citizen guides)
  const popularSchemes = useMemo(() => {
    const central = GUIDE_ARTICLES.filter((g) => g.category === 'Central Scheme');
    const others = GUIDE_ARTICLES.filter((g) => g.category !== 'Central Scheme');
    return [...central, ...others].slice(0, 4);
  }, []);

  // Featured Document Tools
  const featuredTools = useMemo(() => TOOLS_LIST.slice(0, 5), []);

  // Instant Unified Search Results
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!trimmedSearch) return null;
    const jobs = allPosts
      .filter(
        (p) =>
          isPublishedSarkariItem(p) &&
          (p.title.toLowerCase().includes(trimmedSearch) ||
            (p.department || '').toLowerCase().includes(trimmedSearch) ||
            p.shortInfo.toLowerCase().includes(trimmedSearch))
      )
      .slice(0, 4);

    const schemes = GUIDE_ARTICLES.filter(
      (g) =>
        g.title.toLowerCase().includes(trimmedSearch) ||
        g.summary.toLowerCase().includes(trimmedSearch) ||
        g.hindiTitle.toLowerCase().includes(trimmedSearch)
    ).slice(0, 3);

    const services = SERVICES_LIST.filter(
      (s) =>
        s.name.toLowerCase().includes(trimmedSearch) ||
        s.description.toLowerCase().includes(trimmedSearch)
    ).slice(0, 3);

    const tools = TOOLS_LIST.filter(
      (tool) =>
        tool.name.toLowerCase().includes(trimmedSearch) ||
        tool.shortDescription.toLowerCase().includes(trimmedSearch)
    ).slice(0, 3);

    return {
      jobs,
      schemes,
      services,
      tools,
      total: jobs.length + schemes.length + services.length + tools.length,
    };
  }, [trimmedSearch, allPosts]);

  const handleOpenScheme = (schemeId: string) => {
    if (onOpenGuide) {
      onOpenGuide(schemeId);
    } else {
      navigate(`/scheme/${schemeId}`);
    }
  };

  return (
    <div className="w-full space-y-8 sm:space-y-10 pb-6 text-start">
      {/* ================================================================== */}
      {/* HERO SECTION (#101A36 Navy, Disclosure Chip, Prominent Search)      */}
      {/* ================================================================== */}
      <section className="w-full bg-[#101A36] text-white md:rounded-2xl px-4 py-7 sm:px-8 sm:py-10 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <Badge variant="chip" className="text-xs sm:text-sm py-1 px-3">
            <ShieldCheck className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
            <span>{t.independentChip}</span>
          </Badge>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            {t.heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
            {t.heroSubtitle}
          </p>

          {/* Prominent Search Box + Track CTA */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="flex-1 flex items-center bg-white rounded-xl border-2 border-transparent focus-within:border-[#F5A623] px-3.5 min-h-[52px] shadow-xs"
            >
              <Search className="w-5 h-5 text-[#526075] shrink-0 me-2.5" aria-hidden="true" />
              <label htmlFor="portal-inline-search-input" className="sr-only">
                {t.heroSearchPlaceholder}
              </label>
              <input
                id="portal-inline-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.heroSearchPlaceholder}
                className="w-full bg-transparent text-base text-[#101A36] placeholder:text-[#526075] outline-none border-none py-2.5"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label={t.clearSearch}
                  className="p-1.5 text-[#526075] hover:text-[#101A36] cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </form>

            <a
              href="/track"
              onClick={(e) => {
                e.preventDefault();
                if (onOpenTrack) onOpenTrack();
                else navigate('/track');
              }}
              className="min-h-[52px] px-5 py-3 rounded-xl bg-[#F5A623] hover:bg-[#E09416] text-[#101A36] font-bold text-base inline-flex items-center justify-center gap-2 transition-colors no-underline shrink-0"
            >
              <MapPin className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{t.trackButton}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* INSTANT SEARCH RESULTS (SHOWN WHEN USER TYPES IN SEARCH BOX)       */}
      {/* ================================================================== */}
      {searchResults && (
        <div className="px-3 sm:px-0">
          <Card className="p-4 sm:p-6 space-y-4 border-[#F5A623]">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--border-default)] pb-3">
              <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">
                {t.searchResultsTitle} ({searchResults.total})
              </h2>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="min-h-[44px] md:min-h-0 px-2 text-sm font-semibold text-[var(--text-primary)] hover:underline cursor-pointer"
              >
                {t.clearSearch}
              </button>
            </div>

            {searchResults.total === 0 ? (
              <p className="text-base text-[var(--text-secondary)] py-2 m-0">{t.noSearchResults}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.jobs.map((job) => (
                  <a
                    key={job.id}
                    href={`/post/${job.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenJob(job);
                    }}
                    className="p-3.5 rounded-xl bg-[var(--bg-subtle)] hover:border-[var(--border-strong)] border border-[var(--border-default)] flex items-center justify-between gap-3 no-underline transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                        {getOrganisationLabel(job)}
                      </span>
                      <p className="text-base font-bold text-[var(--text-primary)] truncate m-0">
                        {job.title}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--text-primary)] shrink-0 rtl:rotate-180" />
                  </a>
                ))}
                {searchResults.schemes.map((scheme) => (
                  <a
                    key={scheme.id}
                    href={`/scheme/${scheme.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenScheme(scheme.id);
                    }}
                    className="p-3.5 rounded-xl bg-[var(--bg-subtle)] hover:border-[var(--border-strong)] border border-[var(--border-default)] flex items-center justify-between gap-3 no-underline transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[var(--status-open-text)] uppercase">
                        {scheme.category}
                      </span>
                      <p className="text-base font-bold text-[var(--text-primary)] truncate m-0">
                        {scheme.title}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--text-primary)] shrink-0 rtl:rotate-180" />
                  </a>
                ))}
                {searchResults.services.map((svc) => (
                  <a
                    key={svc.id}
                    href={`/service/${svc.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenService(svc);
                    }}
                    className="p-3.5 rounded-xl bg-[var(--bg-subtle)] hover:border-[var(--border-strong)] border border-[var(--border-default)] flex items-center justify-between gap-3 no-underline transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                        {t.catServices}
                      </span>
                      <p className="text-base font-bold text-[var(--text-primary)] truncate m-0">
                        {svc.name}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--text-primary)] shrink-0 rtl:rotate-180" />
                  </a>
                ))}
                {searchResults.tools.map((tool) => (
                  <a
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/tools/${tool.id}`);
                    }}
                    className="p-3.5 rounded-xl bg-[var(--bg-subtle)] hover:border-[var(--border-strong)] border border-[var(--border-default)] flex items-center justify-between gap-3 no-underline transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[var(--status-closing-text)] uppercase">
                        {t.catTools}
                      </span>
                      <p className="text-base font-bold text-[var(--text-primary)] truncate m-0">
                        {tool.name}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--text-primary)] shrink-0 rtl:rotate-180" />
                  </a>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ================================================================== */}
      {/* CLOSING THIS WEEK STRIP (COMPUTED <= 7 DAYS FROM OFFICIAL DATES)   */}
      {/* ================================================================== */}
      {closingThisWeek.length > 0 && (
        <div className="px-3 sm:px-0">
          <Section
            id="closing-this-week"
            title={t.closingThisWeekTitle}
            subtitle={t.closingThisWeekSubtitle}
            actionLabel={t.viewAllJobs}
            actionHref="/jobs"
            onActionClick={() => navigate('/jobs')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {closingThisWeek.map((item) => {
                const st = computeSarkariStatus(item);
                return (
                  <Card
                    key={item.id}
                    as="a"
                    href={`/post/${item.id}`}
                    interactive
                    statusStripe="closing_soon"
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenJob(item);
                    }}
                    className="p-4 flex flex-col justify-between gap-2.5"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="navy">{getOrganisationLabel(item)}</Badge>
                        <Badge variant="urgent">
                          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>
                            {t.urgentDaysLeft(st.daysRemaining!)}
                            {item.lastDate ? ` · ${item.lastDate}` : ''}
                          </span>
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug line-clamp-2 m-0">
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] pt-1 border-t border-[var(--border-default)]">
                      <span className="truncate pe-2">
                        {item.noticeType === 'answer_key'
                          ? `${t.objectionsTillPrefix} ${item.lastDate || t.asPerOfficialNotice}`
                          : `${t.lastDateLabel}: ${item.lastDate || t.asPerOfficialNotice}`}
                      </span>
                      <span className="font-bold text-[var(--text-primary)] inline-flex items-center gap-1 shrink-0">
                        <span>{t.viewDetails}</span>
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Section>
        </div>
      )}

      {/* ================================================================== */}
      {/* 5 CATEGORY TILES (Jobs, Admissions, Schemes, Services, Tools/Calc) */}
      {/* ================================================================== */}
      <div className="px-3 sm:px-0">
        <Section
          id="categories"
          title={t.categoriesHeading}
          subtitle={t.categoriesSubheading}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {categoryTiles.map((tile) => {
              const IconComponent = tile.Icon;
              return (
                <Card
                  key={tile.id}
                  as="a"
                  href={tile.href}
                  interactive
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(tile.href);
                  }}
                  className="p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tile.iconBg}`}
                    >
                      <IconComponent className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-snug m-0">
                        {tile.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mt-1 leading-snug m-0">
                        {tile.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      </div>

      {/* ================================================================== */}
      {/* LATEST JOBS LIST (Title, Department, Vacancies, Red <7d Badge)     */}
      {/* ================================================================== */}
      <div className="px-3 sm:px-0">
        <Section
          id="latest-jobs"
          title={t.latestJobsHeading}
          subtitle={t.latestJobsSubheading}
          actionLabel={t.viewAllJobs}
          actionHref="/jobs"
          onActionClick={() => navigate('/jobs')}
        >
          <div className="space-y-3">
            {latestJobs.map((job) => {
              const status = computeSarkariStatus(job);
              const isUrgent = status.isUrgentUnder7Days && status.daysRemaining !== null;
              const deadlineText = job.lastDate || job.postDate || t.asPerOfficialNotice;

              return (
                <Card
                  key={job.id}
                  as="article"
                  interactive
                  statusStripe={isUrgent ? 'closing_soon' : status.canApplyOnline ? 'open' : undefined}
                  onClick={() => onOpenJob(job)}
                  className="p-4 sm:p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="navy">{getOrganisationLabel(job)}</Badge>
                        {isUrgent ? (
                          <Badge variant="urgent">
                            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>
                              {t.urgentDaysLeft(status.daysRemaining!)} · {deadlineText}
                            </span>
                          </Badge>
                        ) : status.canApplyOnline ? (
                          <Badge variant="green">
                            <span>
                              {t.lastDateLabel}: {deadlineText}
                            </span>
                          </Badge>
                        ) : (
                          <Badge variant="neutral">
                            <span>{status.badgeLabel}</span>
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-snug m-0">
                        <a
                          href={`/post/${job.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onOpenJob(job);
                          }}
                          className="text-[var(--text-primary)] hover:underline no-underline"
                        >
                          {job.title}
                        </a>
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-[var(--text-secondary)]">
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-[var(--text-primary)] shrink-0" aria-hidden="true" />
                          <span>
                            <strong className="text-[var(--text-primary)]">{t.departmentLabel}:</strong>{' '}
                            {job.department || getOrganisationLabel(job)}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[var(--text-primary)] shrink-0" aria-hidden="true" />
                          <span>
                            <strong className="text-[var(--text-primary)]">{t.vacanciesLabel}:</strong>{' '}
                            {job.totalPosts || t.asPerOfficialNotice}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 pt-1 md:pt-0">
                      <a
                        href={`/post/${job.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onOpenJob(job);
                        }}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1F9D6B] hover:bg-[#178257] text-white font-bold text-sm inline-flex items-center gap-1.5 no-underline transition-colors"
                      >
                        <span>{t.viewDetails}</span>
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      </div>

      {/* ================================================================== */}
      {/* AD SLOT 1 (STRICTLY BETWEEN SECTIONS)                              */}
      {/* ================================================================== */}
      <div className="px-3 sm:px-0">
        <AdSlot />
      </div>

      {/* ================================================================== */}
      {/* ADMISSIONS SECTION (KU, Cluster Univ, IGNOU)                       */}
      {/* ================================================================== */}
      <div className="px-3 sm:px-0">
        <Section
          id="admissions"
          title={t.admissionsHeading}
          subtitle={t.admissionsSubheading}
          secondaryAction={
            <a
              href="/education/ignou"
              onClick={(e) => {
                e.preventDefault();
                navigate('/education/ignou');
              }}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--status-closing-bg)] text-[var(--status-closing-text)] border border-[var(--status-closing-border)] hover:opacity-90 text-sm font-bold no-underline transition-opacity"
            >
              <span>{t.ignouShortcut}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            </a>
          }
          actionLabel={t.viewAllAdmissions}
          actionHref="/education"
          onActionClick={() => navigate('/education')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {admissionNotices.map((notice) => {
              const status = computeSarkariStatus(notice);
              return (
                <Card
                  key={notice.id}
                  as="a"
                  href={`/post/${notice.id}`}
                  interactive
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenJob(notice);
                  }}
                  className="p-4 sm:p-5 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="navy">{getOrganisationLabel(notice)}</Badge>
                      {status.isUrgentUnder7Days && status.daysRemaining !== null ? (
                        <Badge variant="urgent">
                          {t.urgentDaysLeft(status.daysRemaining)}
                        </Badge>
                      ) : (
                        <Badge variant={status.canApplyOnline ? 'green' : 'neutral'}>
                          {status.badgeLabel}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-snug m-0">
                      {notice.title}
                    </h3>
                    <p className="text-base text-[var(--text-secondary)] line-clamp-2 leading-relaxed m-0">
                      {notice.shortInfo}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] border-t border-[var(--border-default)] pt-2.5">
                    <span>
                      {notice.lastDate ? `${t.lastDateLabel}: ${notice.lastDate}` : `Posted: ${notice.postDate}`}
                    </span>
                    <span className="font-bold text-[var(--text-primary)] inline-flex items-center gap-1">
                      <span>{t.viewDetails}</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      </div>

      {/* ================================================================== */}
      {/* POPULAR GOVERNMENT SCHEMES (DIRECT /scheme/:id LINKS)              */}
      {/* ================================================================== */}
      <div className="px-3 sm:px-0">
        <Section
          id="schemes"
          title={t.schemesHeading}
          subtitle={t.schemesSubheading}
          actionLabel={t.viewAllSchemes}
          actionHref="/schemes"
          onActionClick={() => navigate('/schemes')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {popularSchemes.map((scheme) => {
              const displayTitle =
                language === 'ur' && scheme.urduTitle
                  ? scheme.urduTitle
                  : language === 'hi' && scheme.hindiTitle
                  ? scheme.hindiTitle
                  : scheme.title;

              return (
                <Card
                  key={scheme.id}
                  as="a"
                  href={`/scheme/${scheme.id}`}
                  interactive
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenScheme(scheme.id);
                  }}
                  className="p-4 sm:p-5 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="green">
                        {scheme.category === 'Central Scheme' ? t.catSchemes : scheme.category}
                      </Badge>
                      {scheme.benefitSummary && (
                        <Badge variant="amber">{scheme.benefitSummary}</Badge>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-snug m-0">
                      {displayTitle}
                    </h3>
                    <p className="text-base text-[var(--text-secondary)] line-clamp-2 leading-relaxed m-0">
                      {scheme.summary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-[var(--border-default)] pt-2.5">
                    <span className="text-[var(--text-secondary)] truncate pe-2">{scheme.officialPortal}</span>
                    <span className="font-bold text-[var(--status-open-text)] inline-flex items-center gap-1 shrink-0">
                      <span>{t.exploreScheme}</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      </div>

      {/* ================================================================== */}
      {/* TOOLS & CALCULATORS GRID                                           */}
      {/* ================================================================== */}
      <div className="px-3 sm:px-0">
        <Section
          id="tools-calculators"
          title={t.toolsHeading}
          subtitle={t.toolsSubheading}
          actionLabel={t.viewAllTools}
          actionHref="/tools"
          onActionClick={() => navigate('/tools')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {featuredTools.map((tool) => (
              <Card
                key={tool.id}
                as="a"
                href={`/tools/${tool.id}`}
                interactive
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/tools/${tool.id}`);
                }}
                className="p-4 flex flex-col justify-between gap-2.5"
              >
                <div className="space-y-1.5">
                  <Badge variant="amber">{tool.category}</Badge>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] m-0">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0">
                    {tool.shortDescription}
                  </p>
                </div>
                <span className="text-sm font-bold text-[var(--text-primary)] inline-flex items-center gap-1 pt-1">
                  <span>{t.toolsLaunchBtn}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                </span>
              </Card>
            ))}

            {/* Citizen Calculators Tile */}
            <Card
              as="a"
              href="/calculators"
              interactive
              onClick={(e) => {
                e.preventDefault();
                navigate('/calculators');
              }}
              className="p-4 bg-[#101A36] text-white border-[#101A36] flex flex-col justify-between gap-2.5 hover:bg-[#18264D]"
            >
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-lg bg-[#F5A623] text-[#101A36] flex items-center justify-center">
                  <Calculator className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white m-0">
                  {t.calculatorsShortcut}
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed m-0">
                  JKSSB &amp; SSC age eligibility calculator, photo/signature spec check, and CSC fee estimator.
                </p>
              </div>
              <span className="text-sm font-bold text-[#F5A623] inline-flex items-center gap-1 pt-1">
                <span>{t.calculatorsShortcut}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
              </span>
            </Card>
          </div>
        </Section>
      </div>

      {/* ================================================================== */}
      {/* AD SLOT 2 (STRICTLY BETWEEN SECTIONS)                              */}
      {/* ================================================================== */}
      <div className="px-3 sm:px-0">
        <AdSlot />
      </div>

      {/* ================================================================== */}
      {/* WHATSAPP ALERTS BOX (TELEGRAM KEPT AS "Coming soon")               */}
      {/* ================================================================== */}
      <div className="px-3 sm:px-0">
        <AlertsBox />
      </div>

      {/* ================================================================== */}
      {/* "NEED HELP APPLYING?" HELPDESK CARD                                */}
      {/* ================================================================== */}
      <div className="px-3 sm:px-0">
        <HelpApplyingCard onTrackClick={onOpenTrack} />
      </div>

      {/* ================================================================== */}
      {/* OPERATOR TRUST STRIP (ONLY VERIFIED FACTS FROM USER DATA)          */}
      {/* ================================================================== */}
      <div className="px-3 sm:px-0">
        <section
          aria-label={t.trustStripTitle}
          className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-5 space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-default)] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1F9D6B] shrink-0" aria-hidden="true" />
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] m-0">
                {t.trustStripTitle}
              </h2>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
              {t.independentChip}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="flex items-start gap-2.5 bg-[var(--bg-subtle)] rounded-xl px-3 py-2.5 border border-[var(--border-default)]">
              <UserCheck className="w-4 h-4 text-[var(--text-primary)] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {t.helpOperatorLabel}
                </span>
                <span className="font-bold text-[var(--text-primary)] block">
                  Wasim Ahmad Khanday
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-[var(--bg-subtle)] rounded-xl px-3 py-2.5 border border-[var(--border-default)]">
              <ShieldCheck className="w-4 h-4 text-[#1F9D6B] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Authorized CSC {t.helpVleLabel}
                </span>
                <span className="font-mono font-bold text-[var(--text-primary)] block tabular-nums">
                  212515670018
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-[var(--bg-subtle)] rounded-xl px-3 py-2.5 border border-[var(--border-default)]">
              <MapPin className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {t.helpLocationLabel}
                </span>
                <span className="font-semibold text-[var(--text-primary)] block">
                  {t.footerAddress}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-[var(--bg-subtle)] rounded-xl px-3 py-2.5 border border-[var(--border-default)]">
              <PhoneCall className="w-4 h-4 text-[#1F9D6B] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Helpline
                </span>
                <a
                  href="tel:+917006833767"
                  dir="ltr"
                  className="font-bold text-[var(--text-primary)] hover:text-[#1F9D6B] tabular-nums no-underline"
                >
                  +91 70068 33767
                </a>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] m-0 leading-relaxed">
            {t.footerDisclaimerNote}
          </p>
        </section>
      </div>
    </div>
  );
}
