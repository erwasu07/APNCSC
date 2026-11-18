import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  SarkariItem,
  isPublishedSarkariItem,
  isEducationSarkariItem,
  isRecruitmentSarkariItem,
} from '../data/sarkariData';
import { getDeduplicatedSarkariPosts, resolvePostOrg } from '../data/sarkariMigration';
import { computeSarkariStatus, getActiveClosingDeadlines } from '../utils/sarkariStatus';
import { useSyncedSarkariPosts, sortByNewestPostDate } from '../utils/postDataSync';
import { isOlderThan12Months } from '../utils/postLifecycle';
import { SERVICES_LIST, ServiceItem } from '../servicesData';
import { PUBLISHED_GUIDE_ARTICLES as GUIDE_ARTICLES } from '../data/guidesData';
import { TOOLS_LIST } from './tools/toolsData';
import { usePublicAlertsConfig } from './ui/AlertsBox';
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

type UpdatesTabId = 'jobs' | 'admit_card' | 'results' | 'answer_key' | 'admission';

const UPDATES_TABS: { id: UpdatesTabId; label: string; viewAllLabel: string; href: string }[] = [
  { id: 'jobs', label: 'Jobs', viewAllLabel: 'View all jobs', href: '/jobs' },
  { id: 'admit_card', label: 'Admit Card', viewAllLabel: 'View all admit cards', href: '/jobs?tab=exams' },
  { id: 'results', label: 'Results', viewAllLabel: 'View all results', href: '/jobs?tab=results' },
  { id: 'answer_key', label: 'Answer Key', viewAllLabel: 'View all answer keys', href: '/jobs?tab=results&filter=answer_key' },
  { id: 'admission', label: 'Admission', viewAllLabel: 'View all admissions', href: '/education' },
];

const HERO_CHIPS = ['JKSSB', 'SSC', 'Railway', 'Army', 'PM-KISAN', 'Aadhaar'] as const;

const CATEGORY_GRID_ITEMS = [
  { id: 'jobs', emoji: '💼', label: 'Jobs', href: '/jobs' },
  { id: 'admit', emoji: '🪪', label: 'Admit Card', href: '/jobs?tab=exams' },
  { id: 'results', emoji: '📊', label: 'Results', href: '/jobs?tab=results' },
  { id: 'keys', emoji: '🔑', label: 'Answer Key', href: '/jobs?tab=results&filter=answer_key' },
  { id: 'admission', emoji: '🎓', label: 'Admission', href: '/education' },
  { id: 'schemes', emoji: '🏛️', label: 'Schemes', href: '/schemes' },
  { id: 'tools', emoji: '🧮', label: 'Tools', href: '/tools' },
  { id: 'news', emoji: '📰', label: 'News', href: '/deadlines' },
] as const;

const SERVICE_CARD_META: Record<string, { emoji: string; shortTitle: string; shortDesc: string }> = {
  'csc-pan': { emoji: '🪪', shortTitle: 'PAN Card', shortDesc: 'New & e-KYC' },
  'csc-aadhaar': { emoji: '📱', shortTitle: 'Aadhaar', shortDesc: 'Address & ASK' },
  'csc-ayushman': { emoji: '🏥', shortTitle: 'Ayushman', shortDesc: '₹5L Health Card' },
  'csc-certificates': { emoji: '📜', shortTitle: 'Certificates', shortDesc: 'Domicile & Caste' },
  'csc-pmkisan': { emoji: '🌾', shortTitle: 'PM-KISAN', shortDesc: 'e-KYC & Status' },
  'csc-passport': { emoji: '🛂', shortTitle: 'Passport', shortDesc: 'Fresh & Renewal' },
  'csc-ration': { emoji: '🍚', shortTitle: 'Ration Card', shortDesc: 'Add & Updates' },
  'csc-dl': { emoji: '🚗', shortTitle: 'Driving Licence', shortDesc: 'LL & Renewal' },
};

const TOOL_CARD_META: Record<string, { emoji: string; shortTitle: string; shortDesc: string }> = {
  'image-compressor': { emoji: '🖼️', shortTitle: 'Photo Resize', shortDesc: '20KB / 50KB KB' },
  'passport-photo-maker': { emoji: '📸', shortTitle: 'Passport Photo', shortDesc: 'A4 Print Sheet' },
  'signature-resizer': { emoji: '✍️', shortTitle: 'Sign Resizer', shortDesc: '10–20 KB Crop' },
  'pdf-merge': { emoji: '📑', shortTitle: 'Merge PDF', shortDesc: 'Combine files' },
  'image-to-pdf': { emoji: '📄', shortTitle: 'JPG to PDF', shortDesc: 'A4 Document' },
  'pdf-compressor': { emoji: '📦', shortTitle: 'Compress PDF', shortDesc: 'Reduce MB size' },
  'background-remover': { emoji: '✂️', shortTitle: 'Remove BG', shortDesc: 'White backdrop' },
};

const HOMEPAGE_FAQS = [
  {
    q: 'Is CSC DOST an official government website?',
    a: 'No. CSC DOST is an independent citizen portal run by Authorized CSC VLE Wasim Ahmad Khanday (VLE ID: 212515670018, Sangran Qazigund, Anantnag, J&K). Always confirm final dates and eligibility on the official authority website linked on every page.',
  },
  {
    q: 'How can I apply or get help with an online form?',
    a: 'Every notification includes the official portal link and step-by-step instructions. For assisted CSC form filling, document scanning, or status tracking, call +91 70068 33767 or visit Sangran Qazigund.',
  },
];

function isJkPriorityItem(item: SarkariItem): boolean {
  if (item.jkDomicile) return true;
  if (
    item.category === 'jkssb' ||
    item.category === 'banking_jobs' ||
    item.category === 'cluster_univ' ||
    item.category === 'admissions' ||
    item.category === 'exam_forms'
  ) {
    return true;
  }
  const haystack = `${item.title} ${item.org || ''} ${item.department || ''} ${item.institution || ''}`.toLowerCase();
  return /jkssb|j&k|jammu|kashmir|srinagar|cluster\s*univ|skuast|jkpsc|jk\s*bank|bopee/.test(haystack);
}

function matchesSearchTerm(text: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const normalized = text.toLowerCase();
  if (normalized.includes(q)) return true;
  if (q === 'railway' && /\brrb\b|railway/.test(normalized)) return true;
  if (q === 'army' && /agniveer|join\s*indian\s*army|\barmy\b/.test(normalized)) return true;
  if (q === 'pm-kisan' && /pm[\s-]*kisan|kisan/.test(normalized)) return true;
  return false;
}

function postMatchesQuery(item: SarkariItem, query: string): boolean {
  if (!query.trim()) return true;
  const hay = [
    item.title,
    item.org,
    item.department,
    item.institution,
    item.shortInfo,
    item.summary,
    item.category,
  ]
    .filter(Boolean)
    .join(' ');
  return matchesSearchTerm(hay, query);
}

export default function PortalHomepage({
  onOpenJob,
  onOpenService,
  onOpenGuide,
  onNavigateRoute,
}: PortalHomepageProps) {
  const allPosts = useSyncedSarkariPosts();
  const alertsConfig = usePublicAlertsConfig();

  const [searchInput, setSearchInput] = useState('');
  const [activeFilterQuery, setActiveFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState<UpdatesTabId>('jobs');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

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

  // Verified, deduplicated posts (< 12 months old for active homepage feeds)
  const verifiedPosts = useMemo(() => {
    return getDeduplicatedSarkariPosts(allPosts).filter((item) => {
      if (!isPublishedSarkariItem(item) || item.isCancelled) return false;
      if (isOlderThan12Months(item)) return false;
      const st = computeSarkariStatus(item);
      return st.verificationStatus !== 'needs_verification';
    });
  }, [allPosts]);

  // Bucketed lists sorted J&K-first, then urgency/open status, then newest postDate
  const bucketedLists = useMemo(() => {
    const compareJkFirst = (a: SarkariItem, b: SarkariItem, prioritizeOpen: boolean) => {
      const jkA = isJkPriorityItem(a) ? 1 : 0;
      const jkB = isJkPriorityItem(b) ? 1 : 0;
      if (jkA !== jkB) return jkB - jkA;

      const stA = computeSarkariStatus(a);
      const stB = computeSarkariStatus(b);

      if (prioritizeOpen && stA.canApplyOnline !== stB.canApplyOnline) {
        return stA.canApplyOnline ? -1 : 1;
      }
      if (stA.isUrgentUnder7Days !== stB.isUrgentUnder7Days) {
        return stA.isUrgentUnder7Days ? -1 : 1;
      }
      return sortByNewestPostDate(a, b);
    };

    const jobs: SarkariItem[] = [];
    const admit_card: SarkariItem[] = [];
    const results: SarkariItem[] = [];
    const answer_key: SarkariItem[] = [];
    const admission: SarkariItem[] = [];

    for (const item of verifiedPosts) {
      const st = computeSarkariStatus(item);
      if (st.stage === 'answer_key' || st.stage === 'objection_window') {
        answer_key.push(item);
      } else if (st.stage === 'result' || st.stage === 'grade_card') {
        results.push(item);
      } else if (
        st.stage === 'admit_card' ||
        st.stage === 'examination' ||
        st.stage === 'document_verification' ||
        st.stage === 'date_sheet'
      ) {
        admit_card.push(item);
      } else if (isEducationSarkariItem(item)) {
        admission.push(item);
      } else if (isRecruitmentSarkariItem(item)) {
        jobs.push(item);
      }
    }

    return {
      jobs: jobs.sort((a, b) => compareJkFirst(a, b, true)),
      admit_card: admit_card.sort((a, b) => compareJkFirst(a, b, false)),
      results: results.sort((a, b) => compareJkFirst(a, b, false)),
      answer_key: answer_key.sort((a, b) => compareJkFirst(a, b, false)),
      admission: admission.sort((a, b) => compareJkFirst(a, b, true)),
    };
  }, [verifiedPosts]);

  // Execute cross-list search ("Go" or quick chip) and jump to the first matching tab
  const applySearchAndJump = (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    setSearchInput(trimmed);
    setActiveFilterQuery(trimmed);

    if (trimmed) {
      const tabOrder: UpdatesTabId[] = [
        activeTab,
        ...(['jobs', 'admit_card', 'results', 'answer_key', 'admission'] as UpdatesTabId[]).filter(
          (id) => id !== activeTab
        ),
      ];
      const firstMatchingTab = tabOrder.find((tabId) =>
        bucketedLists[tabId].some((item) => postMatchesQuery(item, trimmed))
      );
      if (firstMatchingTab) {
        setActiveTab(firstMatchingTab);
      }

      const sectionEl = document.getElementById('latest-updates-section');
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  useEffect(() => {
    const handleHeaderSearch = (e: Event) => {
      const custom = e as CustomEvent<{ query?: string; submit?: boolean }>;
      if (typeof custom.detail?.query === 'string') {
        setSearchInput(custom.detail.query);
        setActiveFilterQuery(custom.detail.query.trim());
        if (custom.detail.submit) {
          applySearchAndJump(custom.detail.query);
        }
      }
    };
    window.addEventListener('csc-header-search', handleHeaderSearch);
    return () => window.removeEventListener('csc-header-search', handleHeaderSearch);
  });

  // Closing soon notices (within 7 days, computed dynamically)
  const closingSoonChips = useMemo(() => {
    return getActiveClosingDeadlines(allPosts, { maxDays: 7 }).slice(0, 4);
  }, [allPosts]);

  // Sidebar Closing soon list (within 7 days, fallback to upcoming deadlines)
  const closingSoonSidebarList = useMemo(() => {
    if (closingSoonChips.length > 0) return closingSoonChips;
    return getActiveClosingDeadlines(allPosts, { includeAllActive: true }).slice(0, 4);
  }, [closingSoonChips, allPosts]);

  // Active tab list (filtered by search query if present; 5 rows on mobile/tablet, up to 7 on desktop)
  const visibleTabPosts = useMemo(() => {
    const source = bucketedLists[activeTab];
    const filtered = activeFilterQuery
      ? source.filter((item) => postMatchesQuery(item, activeFilterQuery))
      : source;
    return filtered.slice(0, 7);
  }, [bucketedLists, activeTab, activeFilterQuery]);

  // Extra cross-portal matches for Services / Schemes / Tools when filtering (e.g. PM-KISAN, Aadhaar)
  const extraSearchMatches = useMemo(() => {
    if (!activeFilterQuery) return null;
    const services = SERVICES_LIST.filter((s) =>
      matchesSearchTerm(`${s.name} ${s.description}`, activeFilterQuery)
    ).slice(0, 3);
    const schemes = GUIDE_ARTICLES.filter((g) =>
      matchesSearchTerm(`${g.title} ${g.summary}`, activeFilterQuery)
    ).slice(0, 3);
    const tools = TOOLS_LIST.filter((t) =>
      matchesSearchTerm(`${t.name} ${t.shortDescription}`, activeFilterQuery)
    ).slice(0, 2);
    if (services.length === 0 && schemes.length === 0 && tools.length === 0) return null;
    return { services, schemes, tools };
  }, [activeFilterQuery]);

  // Featured horizontal CSC services row
  const swipeServices = useMemo(() => {
    const orderedIds = Object.keys(SERVICE_CARD_META);
    return orderedIds
      .map((id) => SERVICES_LIST.find((s) => s.id === id))
      .filter((s): s is ServiceItem => Boolean(s));
  }, []);

  // Featured horizontal Tools row
  const swipeTools = useMemo(() => {
    const orderedIds = Object.keys(TOOL_CARD_META);
    return orderedIds
      .map((id) => TOOLS_LIST.find((t) => t.id === id))
      .filter((t): t is NonNullable<typeof t> => Boolean(t));
  }, []);

  const currentTabConfig = UPDATES_TABS.find((t) => t.id === activeTab) || UPDATES_TABS[0];

  const getRowBadge = (item: SarkariItem) => {
    const st = computeSarkariStatus(item);
    if (st.daysRemaining === 0 && (st.isOpen || st.isClosingSoon)) {
      return {
        label: 'TODAY',
        cls: 'bg-[#E5484D]/12 text-[#C81E24] dark:bg-[#E5484D]/25 dark:text-[#FCA5A5]',
      };
    }
    if (
      st.stage === 'result' ||
      st.stage === 'grade_card' ||
      st.stage === 'admit_card' ||
      st.stage === 'answer_key' ||
      st.stage === 'objection_window'
    ) {
      return {
        label: 'OUT',
        cls: 'bg-[#0F9D6B]/12 text-[#0A6B49] dark:bg-[#0F9D6B]/25 dark:text-[#6EE7B7]',
      };
    }
    if (item.isNew) {
      return {
        label: 'NEW',
        cls: 'bg-[#0F9D6B]/12 text-[#0A6B49] dark:bg-[#0F9D6B]/25 dark:text-[#6EE7B7]',
      };
    }
    if (st.canApplyOnline) {
      return {
        label: 'FORM',
        cls: 'bg-[#EEF2FF] text-[#2455E6] dark:bg-[#2455E6]/25 dark:text-[#93C5FD]',
      };
    }
    return {
      label: st.isClosed ? 'CLOSED' : 'INFO',
      cls: 'bg-[#F1F5F9] text-[#5B6478] dark:bg-slate-800 dark:text-slate-300',
    };
  };

  const formatShortChipTitle = (item: SarkariItem) => {
    const org = item.org || resolvePostOrg(item);
    const shortTitle = item.title.length > 26 ? `${item.title.slice(0, 24).trim()}…` : item.title;
    return org && !shortTitle.toUpperCase().startsWith(org.toUpperCase())
      ? `${org} · ${shortTitle}`
      : shortTitle;
  };

  return (
    <div className="w-full pb-4 text-start">
      {/* ================================================================== */}
      {/* 3. HERO & 4. STATS STRIP (Full-width navy block on Desktop >=1024) */}
      {/* ================================================================== */}
      <div className="lg:bg-[linear-gradient(135deg,#101A36_0%,#1C2C66_100%)] lg:relative lg:overflow-hidden">
        <div
          aria-hidden="true"
          className="hidden lg:block pointer-events-none absolute -top-20 end-10 w-80 h-80 rounded-full bg-[#2455E6]/25 blur-3xl"
        />

        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#101A36_0%,#1C2C66_100%)] lg:bg-none text-white max-w-[1180px] mx-auto px-3 sm:px-4 lg:px-6 pt-4 lg:pt-8 pb-[44px] lg:pb-0">
          <div
            aria-hidden="true"
            className="lg:hidden pointer-events-none absolute -top-12 -end-10 w-44 h-44 rounded-full bg-[#2455E6]/30 blur-2xl"
          />

          <div className="relative z-10 lg:max-w-[640px] space-y-2.5 lg:space-y-3.5">
            <h1 className="text-[21px] lg:text-[34px] font-extrabold leading-[1.25] lg:leading-[1.18] tracking-tight text-white m-0">
              Every government update,{' '}
              <span className="text-[#F59E0B]">one trusted place</span>
            </h1>

            <p className="text-[13px] lg:text-[15px] text-[#CBD5E1] leading-snug m-0">
              J&amp;K and all-India jobs, results and CSC services.
            </p>

            {/* Search Bar */}
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                applySearchAndJump(searchInput);
              }}
              className="bg-white rounded-[12px] p-1 ps-3 flex items-center gap-1.5 shadow-sm"
            >
              <label htmlFor="portal-inline-search-input" className="sr-only">
                Search JKSSB, SSC, Aadhaar
              </label>
              <input
                id="portal-inline-search-input"
                type="search"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setActiveFilterQuery(e.target.value.trim());
                }}
                placeholder="Search JKSSB, SSC, Aadhaar…"
                className="flex-1 min-w-0 bg-transparent text-[13.5px] lg:text-[14px] text-[#101A36] placeholder:text-[#5B6478] outline-none border-none py-1.5"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setActiveFilterQuery('');
                  }}
                  aria-label="Clear search"
                  className="min-w-[32px] min-h-[36px] text-xs font-bold text-[#5B6478] hover:text-[#101A36] cursor-pointer px-1"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="bg-[#2455E6] hover:bg-[#1D4ED8] text-white font-bold text-[13px] rounded-[9px] px-4 lg:px-5 min-h-[40px] shrink-0 cursor-pointer transition-colors"
              >
                Go
              </button>
            </form>

            {/* Horizontal Scrollable Translucent Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              {HERO_CHIPS.map((chip) => {
                const active = activeFilterQuery.toLowerCase() === chip.toLowerCase();
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      if (active) {
                        setSearchInput('');
                        setActiveFilterQuery('');
                      } else {
                        applySearchAndJump(chip);
                      }
                    }}
                    className={`min-h-[36px] px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#F59E0B] text-[#101A36] border-[#F59E0B]'
                        : 'bg-white/12 hover:bg-white/20 text-white border-white/30'
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. STATS STRIP (Overlaps hero bottom below 1024px; sits in hero bottom row >=1024px) */}
        <div className="max-w-[1180px] mx-auto px-3 sm:px-4 lg:px-6 -mt-8 lg:mt-7 lg:pb-7 relative z-20">
          <div className="grid grid-cols-4 gap-2 lg:gap-4">
            {[
              { value: '1,200+', label: 'Vacancies' },
              { value: 'Daily', label: 'Updates' },
              { value: '40+', label: 'Services' },
              { value: 'Free', label: 'Alerts' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-[#16213A] border border-[#E3E8F2] dark:border-[#283757] rounded-[12px] py-2.5 lg:py-3 px-1 lg:px-3 text-center shadow-[0_4px_14px_rgba(16,26,54,0.08)]"
              >
                <div className="text-[15px] lg:text-[18px] font-extrabold text-[#101A36] dark:text-white leading-tight tabular-nums">
                  {stat.value}
                </div>
                <div className="text-[10px] lg:text-[12px] font-semibold text-[#5B6478] dark:text-[#94A3B8] mt-0.5 leading-tight truncate">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Container (12px mobile padding, 24px desktop side padding, max-w 1180px) */}
      <div className="max-w-[1180px] mx-auto p-3 sm:p-4 lg:px-6 lg:py-6 space-y-4 lg:space-y-6">
        {/* ================================================================ */}
        {/* 5. CATEGORIES GRID (4x2 on <1024px, single row of 8 on >=1024px) */}
        {/* ================================================================ */}
        <section aria-labelledby="categories-heading">
          <h2
            id="categories-heading"
            className="text-[15px] lg:text-[17px] font-extrabold text-[#101A36] dark:text-white mb-2 lg:mb-3 m-0"
          >
            Categories
          </h2>
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 lg:gap-3">
            {CATEGORY_GRID_ITEMS.map((cat) => (
              <a
                key={cat.id}
                href={cat.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(cat.href);
                }}
                className="bg-white dark:bg-[#16213A] border border-[#E3E8F2] dark:border-[#283757] hover:border-[#2455E6] rounded-[12px] py-2.5 px-1 min-h-[68px] lg:min-h-[78px] flex flex-col items-center justify-center gap-1 shadow-[0_2px_8px_rgba(16,26,54,0.04)] no-underline transition-colors"
              >
                <span className="text-[20px] lg:text-[22px] leading-none" aria-hidden="true">
                  {cat.emoji}
                </span>
                <span className="text-[11px] lg:text-[12px] font-bold text-[#101A36] dark:text-white leading-tight text-center">
                  {cat.label}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ================================================================ */}
        {/* 6. CLOSING SOON STRIP (Full width under Categories)              */}
        {/* ================================================================ */}
        {closingSoonChips.length > 0 && (
          <section
            aria-label="Closing soon deadlines"
            className="w-full rounded-[12px] border border-[#E5484D]/35 bg-[#E5484D]/[0.08] dark:bg-[#E5484D]/15 px-3 lg:px-4 py-2 lg:py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar"
          >
            <span className="text-[12px] lg:text-[13px] font-extrabold text-[#C81E24] dark:text-[#FCA5A5] shrink-0 whitespace-nowrap">
              ⏰ Today:
            </span>
            {closingSoonChips.map((d) => (
              <a
                key={d.item.id}
                href={`/post/${d.item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenJob(d.item);
                }}
                className="min-h-[36px] px-2.5 py-1 bg-white dark:bg-[#16213A] border border-[#E5484D]/30 hover:border-[#E5484D] rounded-[8px] inline-flex items-center gap-1.5 text-[11.5px] lg:text-[12px] font-semibold text-[#101A36] dark:text-white whitespace-nowrap shrink-0 no-underline transition-colors"
              >
                <span>{formatShortChipTitle(d.item)}</span>
                <span className="text-[10px] font-extrabold text-[#C81E24] dark:text-[#FCA5A5] tabular-nums">
                  {d.daysRemaining === 0 ? 'Today' : `${d.daysRemaining}d`}
                </span>
              </a>
            ))}
          </section>
        )}

        {/* ================================================================ */}
        {/* 7 & 8. MAIN 2-COLUMN DESKTOP AREA (~68% Left / ~32% Sticky Right) */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,68fr)_minmax(0,32fr)] gap-4 lg:gap-6 items-start">
          {/* LEFT COLUMN (68% on Desktop): Latest updates, CSC services grid, Free tools grid */}
          <div className="min-w-0 space-y-4 lg:space-y-6">
            {/* Mobile & Tablet AdSlot 1 */}
            <div className="lg:hidden">
              <AdSlot />
            </div>

            {/* 7. LATEST UPDATES CARD (Pill tabs + single active list) */}
            <section id="latest-updates-section" aria-labelledby="latest-updates-heading" className="scroll-mt-20">
              <div className="flex items-center justify-between gap-2 mb-2 lg:mb-2.5">
                <h2
                  id="latest-updates-heading"
                  className="text-[15px] lg:text-[17px] font-extrabold text-[#101A36] dark:text-white m-0"
                >
                  Latest updates
                </h2>
                <a
                  href={currentTabConfig.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(currentTabConfig.href);
                  }}
                  className="min-h-[40px] inline-flex items-center text-[12.5px] lg:text-[13px] font-bold text-[#2455E6] dark:text-[#60A5FA] no-underline hover:underline"
                >
                  All →
                </a>
              </div>

              {activeFilterQuery && (
                <div className="flex items-center justify-between gap-2 mb-2 px-3 py-1.5 rounded-[10px] bg-[#EEF2FF] dark:bg-[#1E2C4A] border border-[#2455E6]/25 text-[12px]">
                  <span className="font-semibold text-[#101A36] dark:text-white truncate">
                    Filtering: <strong>{activeFilterQuery}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setActiveFilterQuery('');
                    }}
                    className="font-bold text-[#2455E6] dark:text-[#60A5FA] cursor-pointer shrink-0 min-h-[32px] px-1"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Horizontal Pill Tabs */}
              <div
                role="tablist"
                aria-label="Latest update categories"
                className="flex items-center gap-1.5 lg:gap-2 overflow-x-auto no-scrollbar pb-2.5"
              >
                {UPDATES_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      type="button"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab.id)}
                      className={`min-h-[40px] px-3.5 lg:px-4 rounded-full text-[12px] lg:text-[12.5px] font-bold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#2455E6] text-white border-[#2455E6]'
                          : 'bg-white dark:bg-[#16213A] text-[#5B6478] dark:text-[#CBD5E1] border-[#E3E8F2] dark:border-[#283757] hover:border-[#2455E6]/50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Single Active List Card */}
              <div className="bg-white dark:bg-[#16213A] border border-[#E3E8F2] dark:border-[#283757] rounded-[14px] shadow-[0_2px_10px_rgba(16,26,54,0.05)] overflow-hidden divide-y divide-[#E3E8F2] dark:divide-[#283757]">
                {visibleTabPosts.length > 0 ? (
                  visibleTabPosts.map((item, idx) => {
                    const badge = getRowBadge(item);
                    return (
                      <a
                        key={item.id}
                        href={`/post/${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenJob(item);
                        }}
                        className={`${
                          idx >= 5 ? 'hidden lg:flex' : 'flex'
                        } min-h-[48px] px-3.5 lg:px-4 py-2.5 lg:py-3 items-center justify-between gap-2.5 hover:bg-[#EEF2FF]/60 dark:hover:bg-[#1E2C4A]/60 transition-colors no-underline`}
                      >
                        <span className="text-[13px] lg:text-[13.5px] font-semibold text-[#101A36] dark:text-[#F1F5F9] leading-snug line-clamp-2 flex-1 min-w-0">
                          {item.title}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-[6px] shrink-0 leading-tight ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </a>
                    );
                  })
                ) : (
                  <div className="px-4 py-5 text-center text-[13px] text-[#5B6478] dark:text-[#94A3B8]">
                    No updates match &ldquo;{activeFilterQuery}&rdquo; under {currentTabConfig.label}.
                  </div>
                )}

                <a
                  href={currentTabConfig.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(currentTabConfig.href);
                  }}
                  className="min-h-[44px] px-3.5 py-2 flex items-center justify-center text-[13px] font-bold text-[#2455E6] dark:text-[#60A5FA] hover:bg-[#EEF2FF]/40 dark:hover:bg-[#1E2C4A]/40 no-underline transition-colors"
                >
                  {currentTabConfig.viewAllLabel} →
                </a>
              </div>

              {/* Matching Services / Schemes / Tools when Search Query is Active */}
              {extraSearchMatches && (
                <div className="mt-2.5 bg-white dark:bg-[#16213A] border border-[#E3E8F2] dark:border-[#283757] rounded-[14px] p-3 space-y-2">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B6478] dark:text-[#94A3B8]">
                    Matching Services, Schemes &amp; Tools
                  </div>
                  <div className="space-y-1.5">
                    {extraSearchMatches.schemes.map((scheme) => (
                      <a
                        key={scheme.id}
                        href={`/scheme/${scheme.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (onOpenGuide) onOpenGuide(scheme.id);
                          else navigate(`/scheme/${scheme.id}`);
                        }}
                        className="min-h-[40px] px-2.5 py-1.5 rounded-[10px] bg-[#F4F6FB] dark:bg-[#1E2C4A] flex items-center justify-between gap-2 text-[12.5px] font-semibold text-[#101A36] dark:text-white no-underline"
                      >
                        <span className="truncate">{scheme.title}</span>
                        <span className="text-[10px] font-extrabold text-[#0A6B49] dark:text-[#6EE7B7] uppercase shrink-0">
                          SCHEME
                        </span>
                      </a>
                    ))}
                    {extraSearchMatches.services.map((svc) => (
                      <a
                        key={svc.id}
                        href={`/service/${svc.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenService(svc);
                        }}
                        className="min-h-[40px] px-2.5 py-1.5 rounded-[10px] bg-[#F4F6FB] dark:bg-[#1E2C4A] flex items-center justify-between gap-2 text-[12.5px] font-semibold text-[#101A36] dark:text-white no-underline"
                      >
                        <span className="truncate">{svc.name}</span>
                        <span className="text-[10px] font-extrabold text-[#2455E6] dark:text-[#93C5FD] uppercase shrink-0">
                          CSC
                        </span>
                      </a>
                    ))}
                    {extraSearchMatches.tools.map((tool) => (
                      <a
                        key={tool.id}
                        href={`/tools/${tool.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/tools/${tool.id}`);
                        }}
                        className="min-h-[40px] px-2.5 py-1.5 rounded-[10px] bg-[#F4F6FB] dark:bg-[#1E2C4A] flex items-center justify-between gap-2 text-[12.5px] font-semibold text-[#101A36] dark:text-white no-underline"
                      >
                        <span className="truncate">{tool.name}</span>
                        <span className="text-[10px] font-extrabold text-[#92400E] dark:text-[#FCD34D] uppercase shrink-0">
                          TOOL
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 8a. CSC SERVICES (Swipe row below 1024px, Grid on >=1024px) */}
            <section aria-labelledby="csc-services-heading">
              <div className="flex items-center justify-between gap-2 mb-2 lg:mb-2.5">
                <h2
                  id="csc-services-heading"
                  className="text-[15px] lg:text-[17px] font-extrabold text-[#101A36] dark:text-white m-0"
                >
                  CSC services
                </h2>
                <a
                  href="/services"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/services');
                  }}
                  className="min-h-[40px] inline-flex items-center text-[12.5px] lg:text-[13px] font-bold text-[#2455E6] dark:text-[#60A5FA] no-underline hover:underline"
                >
                  All →
                </a>
              </div>

              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 lg:grid lg:grid-cols-4 lg:gap-3 lg:overflow-visible lg:pb-0">
                {swipeServices.map((svc) => {
                  const meta = SERVICE_CARD_META[svc.id] || {
                    emoji: '🏛️',
                    shortTitle: svc.name,
                    shortDesc: svc.estimatedTime || 'CSC Help',
                  };
                  return (
                    <a
                      key={svc.id}
                      href={`/service/${svc.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenService(svc);
                      }}
                      className="w-[118px] shrink-0 lg:w-auto lg:shrink bg-white dark:bg-[#16213A] border border-[#E3E8F2] dark:border-[#283757] hover:border-[#2455E6] rounded-[12px] p-2.5 lg:p-3.5 flex flex-col justify-between gap-1.5 shadow-[0_2px_8px_rgba(16,26,54,0.04)] no-underline transition-colors"
                    >
                      <span className="text-[20px] lg:text-[22px] leading-none" aria-hidden="true">
                        {meta.emoji}
                      </span>
                      <div className="space-y-0.5">
                        <div className="text-[12px] lg:text-[13px] font-bold text-[#101A36] dark:text-white leading-tight line-clamp-2">
                          {meta.shortTitle}
                        </div>
                        <div className="text-[10.5px] lg:text-[11.5px] text-[#5B6478] dark:text-[#94A3B8] leading-snug line-clamp-2">
                          {meta.shortDesc}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>

            {/* 8b. FREE TOOLS (Swipe row below 1024px, Grid on >=1024px) */}
            <section aria-labelledby="free-tools-heading">
              <div className="flex items-center justify-between gap-2 mb-2 lg:mb-2.5">
                <h2
                  id="free-tools-heading"
                  className="text-[15px] lg:text-[17px] font-extrabold text-[#101A36] dark:text-white m-0"
                >
                  Free tools
                </h2>
                <a
                  href="/tools"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/tools');
                  }}
                  className="min-h-[40px] inline-flex items-center text-[12.5px] lg:text-[13px] font-bold text-[#2455E6] dark:text-[#60A5FA] no-underline hover:underline"
                >
                  All →
                </a>
              </div>

              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 lg:grid lg:grid-cols-4 lg:gap-3 lg:overflow-visible lg:pb-0">
                {swipeTools.map((tool) => {
                  const meta = TOOL_CARD_META[tool.id] || {
                    emoji: '🛠️',
                    shortTitle: tool.name,
                    shortDesc: 'Browser tool',
                  };
                  return (
                    <a
                      key={tool.id}
                      href={`/tools/${tool.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/tools/${tool.id}`);
                      }}
                      className="w-[118px] shrink-0 lg:w-auto lg:shrink bg-white dark:bg-[#16213A] border border-[#E3E8F2] dark:border-[#283757] hover:border-[#2455E6] rounded-[12px] p-2.5 lg:p-3.5 flex flex-col justify-between gap-1.5 shadow-[0_2px_8px_rgba(16,26,54,0.04)] no-underline transition-colors"
                    >
                      <span className="text-[20px] lg:text-[22px] leading-none" aria-hidden="true">
                        {meta.emoji}
                      </span>
                      <div className="space-y-0.5">
                        <div className="text-[12px] lg:text-[13px] font-bold text-[#101A36] dark:text-white leading-tight line-clamp-2">
                          {meta.shortTitle}
                        </div>
                        <div className="text-[10.5px] lg:text-[11.5px] text-[#5B6478] dark:text-[#94A3B8] leading-snug line-clamp-2">
                          {meta.shortDesc}
                        </div>
                      </div>
                    </a>
                  );
                })}

                <a
                  href="/calculators"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/calculators');
                  }}
                  className="w-[118px] shrink-0 lg:w-auto lg:shrink bg-white dark:bg-[#16213A] border border-[#E3E8F2] dark:border-[#283757] hover:border-[#2455E6] rounded-[12px] p-2.5 lg:p-3.5 flex flex-col justify-between gap-1.5 shadow-[0_2px_8px_rgba(16,26,54,0.04)] no-underline transition-colors"
                >
                  <span className="text-[20px] lg:text-[22px] leading-none" aria-hidden="true">
                    🧮
                  </span>
                  <div className="space-y-0.5">
                    <div className="text-[12px] lg:text-[13px] font-bold text-[#101A36] dark:text-white leading-tight line-clamp-2">
                      Age Calculator
                    </div>
                    <div className="text-[10.5px] lg:text-[11.5px] text-[#5B6478] dark:text-[#94A3B8] leading-snug line-clamp-2">
                      JKSSB &amp; SSC
                    </div>
                  </div>
                </a>
              </div>
            </section>

            {/* Mobile & Tablet AdSlot 2 */}
            <div className="lg:hidden">
              <AdSlot />
            </div>
          </div>

          {/* RIGHT SIDEBAR (32% sticky on Desktop >=1024px; stacks below on <1024px) */}
          <aside
            aria-label="Closing deadlines, alerts and quick FAQ"
            className="space-y-4 lg:sticky lg:top-[80px]"
          >
            {/* 1. Desktop Closing Soon List */}
            {closingSoonSidebarList.length > 0 && (
              <section
                aria-labelledby="sidebar-closing-heading"
                className="hidden lg:block bg-white dark:bg-[#16213A] border border-[#E3E8F2] dark:border-[#283757] rounded-[14px] shadow-[0_2px_10px_rgba(16,26,54,0.05)] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-[#E3E8F2] dark:border-[#283757] flex items-center justify-between gap-2">
                  <h2
                    id="sidebar-closing-heading"
                    className="text-[14.5px] font-extrabold text-[#101A36] dark:text-white m-0"
                  >
                    ⏰ Closing soon
                  </h2>
                  <a
                    href="/deadlines"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/deadlines');
                    }}
                    className="text-[12px] font-bold text-[#2455E6] dark:text-[#60A5FA] no-underline hover:underline"
                  >
                    All deadlines →
                  </a>
                </div>
                <div className="divide-y divide-[#E3E8F2] dark:divide-[#283757]">
                  {closingSoonSidebarList.map((d) => (
                    <a
                      key={d.item.id}
                      href={`/post/${d.item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenJob(d.item);
                      }}
                      className="px-4 py-2.5 flex items-start justify-between gap-2.5 hover:bg-[#EEF2FF]/60 dark:hover:bg-[#1E2C4A]/60 transition-colors no-underline"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="text-[12.5px] font-semibold text-[#101A36] dark:text-[#F1F5F9] leading-snug line-clamp-2">
                          {d.item.title}
                        </div>
                        <div className="text-[11px] text-[#5B6478] dark:text-[#94A3B8] truncate">
                          {d.institution} · {d.closingDate}
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-[6px] bg-[#E5484D]/12 text-[#C81E24] dark:bg-[#E5484D]/25 dark:text-[#FCA5A5] shrink-0 tabular-nums mt-0.5">
                        {d.daysRemaining === 0 ? 'Today' : `${d.daysRemaining}d left`}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* 2. Navy WhatsApp + Telegram CTA Card */}
            <section
              aria-label="Free job and result alerts"
              className="bg-[#101A36] text-white rounded-[14px] p-4 shadow-[0_4px_16px_rgba(16,26,54,0.12)] space-y-3"
            >
              <div className="space-y-1">
                <h2 className="text-[15px] font-extrabold text-white m-0 leading-snug">
                  Get instant J&amp;K job &amp; result alerts
                </h2>
                <p className="text-[12.5px] text-[#CBD5E1] m-0 leading-relaxed">
                  Daily official notifications, admit cards and closing reminders straight on your phone.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={alertsConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-3 py-2 rounded-[10px] bg-[#0F9D6B] hover:bg-[#0B7F56] text-white font-bold text-[12.5px] inline-flex items-center justify-center gap-1.5 no-underline transition-colors"
                >
                  <span aria-hidden="true">💬</span>
                  <span>
                    {alertsConfig.whatsappType === 'channel' ? 'WhatsApp Channel' : 'WhatsApp Group'}
                  </span>
                </a>

                {alertsConfig.telegramUrl ? (
                  <a
                    href={alertsConfig.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-3 py-2 rounded-[10px] bg-white/12 hover:bg-white/20 border border-white/20 text-white font-bold text-[12.5px] inline-flex items-center justify-center gap-1.5 no-underline transition-colors"
                  >
                    <span aria-hidden="true">✈️</span>
                    <span>Telegram Alerts</span>
                  </a>
                ) : (
                  <span
                    aria-label="Telegram channel coming soon"
                    className="min-h-[44px] px-3 py-2 rounded-[10px] bg-white/10 border border-white/15 text-slate-200 font-bold text-[12px] inline-flex items-center justify-center gap-1.5 text-center"
                  >
                    <span aria-hidden="true">✈️</span>
                    <span>Telegram · Soon</span>
                  </span>
                )}
              </div>
            </section>

            {/* 3. Desktop Sticky Sidebar AdSense Slot */}
            <div className="hidden lg:block">
              <AdSlot />
            </div>

            {/* 4. 2-Item FAQ Accordion */}
            <section aria-labelledby="homepage-faq-heading">
              <h2
                id="homepage-faq-heading"
                className="text-[15px] font-extrabold text-[#101A36] dark:text-white mb-2 m-0"
              >
                Quick FAQ
              </h2>

              <div className="bg-white dark:bg-[#16213A] border border-[#E3E8F2] dark:border-[#283757] rounded-[14px] shadow-[0_2px_10px_rgba(16,26,54,0.04)] overflow-hidden divide-y divide-[#E3E8F2] dark:divide-[#283757]">
                {HOMEPAGE_FAQS.map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={faq.q}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        className="w-full min-h-[44px] px-3.5 py-3 flex items-center justify-between gap-2 text-start cursor-pointer hover:bg-[#F4F6FB]/70 dark:hover:bg-[#1E2C4A]/50 transition-colors"
                      >
                        <span className="text-[13px] font-bold text-[#101A36] dark:text-white leading-snug">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#5B6478] dark:text-[#94A3B8] shrink-0 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen && (
                        <p className="px-3.5 pb-3 pt-0 text-[12.5px] text-[#5B6478] dark:text-[#CBD5E1] leading-relaxed m-0">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
