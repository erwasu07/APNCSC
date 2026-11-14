import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  GraduationCap,
  ShieldCheck,
  CreditCard,
  FileText,
  Calculator,
  LayoutGrid,
  BookOpen,
  MapPin,
  Bell,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
  Phone,
  Clock,
  MessageCircle,
  Fingerprint,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import { SARKARI_DATA, SarkariItem } from '../data/sarkariData';
import { computeSarkariStatus } from '../utils/sarkariStatus';
import { SERVICES_LIST, ServiceItem } from '../servicesData';
import { GUIDE_ARTICLES } from './GuidesKnowledgeHub';
import { TOOLS_LIST } from './tools/toolsData';

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
  onApplyService,
  onOpenGuide,
  onOpenTrack,
  onNavigateRoute,
}: PortalHomepageProps) {
  // Tabs for Latest Updates: 'recruitment' | 'education' | 'schemes'
  const [latestUpdatesTab, setLatestUpdatesTab] = useState<'recruitment' | 'education' | 'schemes'>('recruitment');
  
  // Collapsible FAQ state (collapsed by default)
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Listen for search events from Header and keyboard shortcuts
  useEffect(() => {
    const handleFocusSearch = () => {
      setIsSearchActive(true);
      setTimeout(() => {
        const el = document.getElementById('portal-inline-search-input');
        if (el) el.focus();
      }, 50);
    };

    const handleHeaderSearch = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string; submit?: boolean }>;
      const q = customEvent.detail?.query ?? '';
      setSearchQuery(q);
      setIsSearchActive(Boolean(q.trim()));
    };

    const handleHashChange = () => {
      if (window.location.hash === '#faq') {
        setIsFaqOpen(true);
        setTimeout(() => {
          const el = document.getElementById('faq-section');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    };

    window.addEventListener('focus-csc-search', handleFocusSearch);
    window.addEventListener('csc-header-search', handleHeaderSearch);
    window.addEventListener('hashchange', handleHashChange);
    
    // Check initial hash
    if (window.location.hash === '#faq') {
      setIsFaqOpen(true);
    }

    return () => {
      window.removeEventListener('focus-csc-search', handleFocusSearch);
      window.removeEventListener('csc-header-search', handleHeaderSearch);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleNavigate = (path: string) => {
    if (path === '#faq') {
      setIsFaqOpen(true);
      setTimeout(() => {
        const el = document.getElementById('faq-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return;
    }

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

  // 9 Shortcuts in exact 3x3 row order
  const exploreShortcuts = [
    // Row 1
    {
      id: 'jobs',
      title: 'Jobs & Recruitment',
      shortDesc: 'Latest vacancies & notifications',
      icon: Briefcase,
      tintBg: 'bg-blue-50 text-[#1E56C8] border-blue-100/80',
      path: '/jobs',
    },
    {
      id: 'education',
      title: 'Education & Admissions',
      shortDesc: 'University admissions & datesheets',
      icon: GraduationCap,
      tintBg: 'bg-purple-50 text-[#7C3AED] border-purple-100/80',
      path: '/education',
    },
    {
      id: 'schemes',
      title: 'Government Schemes',
      shortDesc: 'Central & J&K citizen welfare',
      icon: ShieldCheck,
      tintBg: 'bg-emerald-50 text-[#059669] border-emerald-100/80',
      path: '/schemes',
    },
    // Row 2
    {
      id: 'services',
      title: 'CSC E-Services',
      shortDesc: 'PAN, certificates & applications',
      icon: CreditCard,
      tintBg: 'bg-cyan-50 text-[#0284C7] border-cyan-100/80',
      path: '/services',
    },
    {
      id: 'tools',
      title: 'Document Tools',
      shortDesc: 'Photo resize, crop & PDF utils',
      icon: FileText,
      tintBg: 'bg-indigo-50 text-[#4F46E5] border-indigo-100/80',
      path: '/tools',
    },
    {
      id: 'calculators',
      title: 'Citizen Calculators',
      shortDesc: 'Age & fee eligibility calculator',
      icon: Calculator,
      tintBg: 'bg-amber-50 text-[#D97706] border-amber-100/80',
      path: '/calculators',
    },
    // Row 3
    {
      id: 'categories',
      title: 'Service Categories',
      shortDesc: 'Browse by department & service type',
      icon: LayoutGrid,
      tintBg: 'bg-fuchsia-50 text-[#9333EA] border-fuchsia-100/80',
      path: '/services',
    },
    {
      id: 'guides',
      title: 'Citizen Guides',
      shortDesc: 'Step-by-step application walkthroughs',
      icon: BookOpen,
      tintBg: 'bg-rose-50 text-[#E11D48] border-rose-100/80',
      path: '/schemes',
    },
    {
      id: 'help-faqs',
      title: 'Local Help & FAQs',
      shortDesc: 'Centre address, phones & hours',
      icon: MapPin,
      tintBg: 'bg-teal-50 text-[#0D9488] border-teal-100/80',
      path: '#faq',
    },
  ];

  // Helper to format organization name for notices
  const getOrganisationLabel = (item: SarkariItem): string => {
    switch (item.category) {
      case 'jkssb':
        return 'J&K Services Selection Board (JKSSB)';
      case 'banking_jobs':
        return item.department || 'J&K Bank / Banking Careers';
      case 'army_jobs':
        return 'Indian Army';
      case 'ssc_jobs':
        return 'Staff Selection Commission (SSC)';
      case 'rrb_jobs':
        return 'Railway Recruitment Board (RRB)';
      case 'cluster_univ':
        return 'Cluster University Srinagar';
      case 'exam_forms':
      case 'admissions':
        return 'University of Kashmir';
      case 'nta':
        return 'National Testing Agency (NTA)';
      default:
        return item.department || 'Official Public Notice';
    }
  };

  // Up to 2 recent verified published notices per tab without duplicates (active open first)
  const recruitmentNotices = useMemo(() => {
    const isRecruitment = (item: SarkariItem) =>
      item.noticeType === 'recruitment' ||
      item.postType === 'Job' ||
      item.category === 'jkssb' ||
      item.category === 'banking_jobs' ||
      item.category === 'army_jobs' ||
      item.category === 'ssc_jobs' ||
      item.category === 'rrb_jobs' ||
      item.category === 'jobs';

    return SARKARI_DATA.filter((item) => {
      if (!isRecruitment(item)) return false;
      const st = computeSarkariStatus(item);
      return st.verificationStatus !== 'needs_verification' && !item.isCancelled;
    })
      .sort((a, b) => {
        const stA = computeSarkariStatus(a);
        const stB = computeSarkariStatus(b);
        if (stA.canApplyOnline !== stB.canApplyOnline) return stA.canApplyOnline ? -1 : 1;
        return 0;
      })
      .slice(0, 2);
  }, []);

  const educationNotices = useMemo(() => {
    const isEducation = (item: SarkariItem) =>
      item.noticeType !== 'recruitment' &&
      item.postType !== 'Job' &&
      (item.category === 'cluster_univ' ||
        item.category === 'exam_forms' ||
        item.category === 'admissions' ||
        item.category === 'nta' ||
        item.noticeType === 'admission' ||
        item.noticeType === 'exam_form' ||
        item.noticeType === 'date_sheet');

    return SARKARI_DATA.filter((item) => {
      if (!isEducation(item)) return false;
      const st = computeSarkariStatus(item);
      return st.verificationStatus !== 'needs_verification' && !item.isCancelled;
    })
      .sort((a, b) => {
        const stA = computeSarkariStatus(a);
        const stB = computeSarkariStatus(b);
        if (stA.canApplyOnline !== stB.canApplyOnline) return stA.canApplyOnline ? -1 : 1;
        return 0;
      })
      .slice(0, 2);
  }, []);

  const schemeNotices = useMemo(() => {
    return GUIDE_ARTICLES.filter((g) => g.category === 'Central Scheme' || g.category === 'State Services').slice(0, 2);
  }, []);

  // 3 Popular Citizen Services mapped to real services
  const popularServices = useMemo(() => {
    const findSvc = (id: string, fallbackIdx: number) =>
      SERVICES_LIST.find((s) => s.id === id) || SERVICES_LIST[fallbackIdx];

    return [
      {
        id: 'csc-pan',
        title: 'PAN Card Services',
        icon: CreditCard,
        service: findSvc('csc-pan', 0),
      },
      {
        id: 'csc-aadhaar',
        title: 'Aadhaar Assistance',
        icon: Fingerprint,
        service: findSvc('csc-aadhaar', 1),
      },
      {
        id: 'jk-domicile-cert',
        title: 'J&K Domicile & Certificates',
        icon: FileText,
        service: findSvc('jk-domicile-cert', 5),
      },
    ];
  }, []);

  // Search Results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedServices = SERVICES_LIST.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedJobs = SARKARI_DATA.filter((j) => {
      const st = computeSarkariStatus(j);
      if (st.verificationStatus === 'needs_verification' || j.isCancelled) return false;
      return (
        j.title.toLowerCase().includes(q) ||
        j.shortInfo.toLowerCase().includes(q) ||
        (j.eligibility && j.eligibility.toLowerCase().includes(q))
      );
    }).slice(0, 5);

    const matchedGuides = GUIDE_ARTICLES.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchedTools = TOOLS_LIST.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q)
    ).slice(0, 3);

    return {
      services: matchedServices,
      jobs: matchedJobs,
      guides: matchedGuides,
      tools: matchedTools,
      total: matchedServices.length + matchedJobs.length + matchedGuides.length + matchedTools.length,
    };
  }, [searchQuery]);

  return (
    <div className="w-full pb-4 sm:pb-8 space-y-3 sm:space-y-4 px-3 sm:px-4 max-w-[1100px] mx-auto select-none">
      
      {/* ==================================================================== */}
      {/* 1. SHORT BLUE WELCOME STRIP                                          */}
      {/* ==================================================================== */}
      <section
        aria-label="Welcome to CSC DOST"
        className="w-full bg-gradient-to-r from-[#0A2540] via-[#0E3A7E] to-[#1E56C8] text-white rounded-2xl p-4 sm:p-5 shadow-sm overflow-hidden relative"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-200">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
              <span>CSC DOST · Independent Citizen Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Jobs, Admissions &amp; Citizen Services
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-normal leading-snug">
              Explore J&amp;K jobs, admissions, government schemes, CSC e-services, tools and calculators.
            </p>
          </div>

          {/* Actions: Search Button & Track Application Button */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 mt-2 md:mt-0 flex-wrap">
            {/* Search Icon & Button */}
            <button
              type="button"
              onClick={() => {
                setIsSearchActive((prev) => !prev);
                setTimeout(() => {
                  const el = document.getElementById('portal-inline-search-input');
                  if (el) el.focus();
                }, 50);
              }}
              className={`h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl border flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs ${
                isSearchActive
                  ? 'bg-white text-[#0A2540] border-white'
                  : 'bg-white/15 hover:bg-white/25 active:scale-95 text-white border-white/25'
              }`}
              title="Search jobs, services, schemes"
              aria-label="Search jobs, services, schemes"
            >
              <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Search</span>
            </button>

            {/* Track Application Button */}
            <button
              type="button"
              onClick={() => {
                if (onOpenTrack) onOpenTrack();
                else handleNavigate('/track');
              }}
              className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-[#071F3D] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Track Application Status"
              aria-label="Track Application Status"
            >
              <svg
                className="w-4 h-4 shrink-0 text-[#071F3D]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <circle cx="9.5" cy="14" r="1.5" />
                <line x1="13" y1="14" x2="16.5" y2="14" />
                <line x1="8" y1="18" x2="16" y2="18" />
              </svg>
              <span className="whitespace-nowrap">Track Application</span>
            </button>
          </div>
        </div>

        {/* Live Search Drawer / Overlay when user searches */}
        {isSearchActive && (
          <div className="mt-4 pt-3.5 border-t border-white/20">
            <div className="flex items-center bg-white rounded-xl px-3 py-1.5 shadow-md">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                id="portal-inline-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, admissions, PAN, domicile, tools..."
                className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchActive(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results dropdown panel */}
            {searchResults && searchResults.total > 0 && (
              <div className="mt-2 bg-white rounded-xl p-3 text-slate-900 shadow-xl max-h-80 overflow-y-auto space-y-3 text-left">
                {searchResults.jobs.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Recruitment &amp; Notices
                    </div>
                    <div className="divide-y divide-slate-100">
                      {searchResults.jobs.map((j) => (
                        <button
                          key={j.id}
                          type="button"
                          onClick={() => {
                            setIsSearchActive(false);
                            onOpenJob(j);
                          }}
                          className="w-full text-left py-2 hover:bg-slate-50 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-slate-800 line-clamp-1">{j.title}</span>
                          <span className="text-[#1E56C8] font-bold ml-2 shrink-0">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.services.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Citizen Services
                    </div>
                    <div className="divide-y divide-slate-100">
                      {searchResults.services.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setIsSearchActive(false);
                            onOpenService(s);
                          }}
                          className="w-full text-left py-2 hover:bg-slate-50 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-slate-800 line-clamp-1">{s.name}</span>
                          <span className="text-[#1E56C8] font-bold ml-2 shrink-0">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ==================================================================== */}
      {/* 2. EXPLORE CSC DOST SECTION (9 SHORTCUTS IN 3x3 GRID)               */}
      {/* ==================================================================== */}
      <section aria-labelledby="explore-section-title" className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2
            id="explore-section-title"
            className="text-base sm:text-lg font-extrabold text-[#0F172A] tracking-tight"
          >
            Explore CSC DOST
          </h2>
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Quick access to every main section
          </span>
        </div>

        {/* 3x3 GRID ON MOBILE AND DESKTOP */}
        <nav aria-label="CSC DOST Categories" className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {exploreShortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate(item.path);
                }}
                className="group p-2 sm:p-3 bg-white border border-[#E2E8F0] hover:border-[#1E56C8] rounded-xl text-center shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row items-center md:text-left justify-center md:justify-start gap-1.5 md:gap-3 cursor-pointer min-h-[82px] sm:min-h-[88px] no-underline"
              >
                {/* Small Tinted Icon */}
                <span
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${item.tintBg}`}
                >
                  <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
                </span>

                {/* Text Label */}
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] sm:text-xs md:text-sm font-bold text-[#0F172A] leading-tight line-clamp-2 md:line-clamp-1 group-hover:text-[#1E56C8] transition-colors">
                    {item.title}
                  </div>
                  {/* Short description on desktop */}
                  <p className="hidden md:block text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {item.shortDesc}
                  </p>
                </div>

                {/* Desktop subtle right arrow */}
                <span className="hidden md:inline text-slate-300 group-hover:text-[#1E56C8] group-hover:translate-x-0.5 transition-all text-xs shrink-0 pr-1">
                  →
                </span>
              </a>
            );
          })}
        </nav>
      </section>

      {/* ==================================================================== */}
      {/* 3. LATEST UPDATES & POPULAR SERVICES (SIDE-BY-SIDE ON DESKTOP)       */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-3 sm:gap-4 items-start">
        
        {/* LATEST UPDATES CARD */}
        <section
          aria-labelledby="latest-updates-heading"
          className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3"
        >
          {/* Card Header: Bell + Title */}
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E56C8] flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </span>
              <h2
                id="latest-updates-heading"
                className="text-sm sm:text-base font-extrabold text-[#0F172A] tracking-tight"
              >
                Latest Updates
              </h2>
            </div>

            {/* Live Indicator */}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true" />
              <span>Official Notices</span>
            </span>
          </div>

          {/* 3 Tabs: Recruitment, Education, Schemes */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFC] rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setLatestUpdatesTab('recruitment')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                latestUpdatesTab === 'recruitment'
                  ? 'bg-[#EEF4FF] text-[#1E56C8] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recruitment
            </button>
            <button
              type="button"
              onClick={() => setLatestUpdatesTab('education')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                latestUpdatesTab === 'education'
                  ? 'bg-[#EEF4FF] text-[#1E56C8] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Education
            </button>
            <button
              type="button"
              onClick={() => setLatestUpdatesTab('schemes')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                latestUpdatesTab === 'schemes'
                  ? 'bg-[#EEF4FF] text-[#1E56C8] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Schemes
            </button>
          </div>

          {/* Tab Content: Up to 2 Items */}
          <div className="divide-y divide-[#F1F5F9] min-h-[110px] flex flex-col justify-center">
            {latestUpdatesTab === 'recruitment' && (
              <>
                {recruitmentNotices.length > 0 ? (
                  recruitmentNotices.map((item) => (
                    <a
                      key={item.id}
                      href={`/post/${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenJob(item);
                      }}
                      className="group w-full py-2.5 text-left flex items-center justify-between gap-2 hover:bg-slate-50 px-1 rounded-lg transition-colors cursor-pointer no-underline"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E56C8] flex items-center justify-center shrink-0 mt-0.5">
                          <Briefcase className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#1E56C8] transition-colors line-clamp-1">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
                            {getOrganisationLabel(item)}
                            {item.lastDate ? ` · ${item.lastDate}` : ''}
                            {` · ${computeSarkariStatus(item).badgeLabel}`}
                          </div>
                        </div>
                      </div>
                      <span className="text-slate-400 group-hover:text-[#1E56C8] group-hover:translate-x-0.5 transition-all text-xs shrink-0 pl-1">
                        →
                      </span>
                    </a>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500">
                    No active recruitment notices found.
                  </div>
                )}
                <div className="pt-2">
                  <a
                    href="/jobs"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate('/jobs');
                    }}
                    className="text-xs font-bold text-[#1E56C8] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all recruitment notices</span>
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </>
            )}

            {latestUpdatesTab === 'education' && (
              <>
                {educationNotices.length > 0 ? (
                  educationNotices.map((item) => (
                    <a
                      key={item.id}
                      href={`/post/${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenJob(item);
                      }}
                      className="group w-full py-2.5 text-left flex items-center justify-between gap-2 hover:bg-slate-50 px-1 rounded-lg transition-colors cursor-pointer no-underline"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0 mt-0.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#7C3AED] transition-colors line-clamp-1">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
                            {getOrganisationLabel(item)}
                            {item.lastDate ? ` · ${item.lastDate}` : ''}
                            {` · ${computeSarkariStatus(item).badgeLabel}`}
                          </div>
                        </div>
                      </div>
                      <span className="text-slate-400 group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition-all text-xs shrink-0 pl-1">
                        →
                      </span>
                    </a>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500">
                    No active education notices found.
                  </div>
                )}
                <div className="pt-2">
                  <a
                    href="/education"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate('/education');
                    }}
                    className="text-xs font-bold text-[#1E56C8] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all education notices</span>
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </>
            )}

            {latestUpdatesTab === 'schemes' && (
              <>
                {schemeNotices.length > 0 ? (
                  schemeNotices.map((guide) => (
                    <a
                      key={guide.id}
                      href="/schemes"
                      onClick={(e) => {
                        e.preventDefault();
                        if (onOpenGuide) onOpenGuide(guide.id);
                        else handleNavigate('/schemes');
                      }}
                      className="group w-full py-2.5 text-left flex items-center justify-between gap-2 hover:bg-slate-50 px-1 rounded-lg transition-colors cursor-pointer no-underline"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#059669] transition-colors line-clamp-1">
                            {guide.title}
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
                            {guide.responsibleDepartment || guide.officialPortal || 'Citizen Scheme'}
                          </div>
                        </div>
                      </div>
                      <span className="text-slate-400 group-hover:text-[#059669] group-hover:translate-x-0.5 transition-all text-xs shrink-0 pl-1">
                        →
                      </span>
                    </a>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500">
                    No active schemes found.
                  </div>
                )}
                <div className="pt-2">
                  <a
                    href="/schemes"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate('/schemes');
                    }}
                    className="text-xs font-bold text-[#1E56C8] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all government schemes</span>
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </>
            )}
          </div>
        </section>

        {/* POPULAR CITIZEN SERVICES CARD */}
        <section
          aria-labelledby="popular-services-heading"
          className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3"
        >
          {/* Card Header: CreditCard + Title */}
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E56C8] flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </span>
              <h2
                id="popular-services-heading"
                className="text-sm sm:text-base font-extrabold text-[#0F172A] tracking-tight"
              >
                Popular Citizen Services
              </h2>
            </div>
          </div>

          {/* 3 Compact Rows */}
          <div className="divide-y divide-[#F1F5F9]">
            {popularServices.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`/service/${item.service.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenService(item.service);
                  }}
                  className="group w-full py-2.5 text-left flex items-center justify-between gap-2 hover:bg-slate-50 px-1 rounded-lg transition-colors cursor-pointer no-underline"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-[#1E56C8] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#1E56C8] transition-colors truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-slate-400 group-hover:text-[#1E56C8] group-hover:translate-x-0.5 transition-all text-xs shrink-0 pl-1">
                    →
                  </span>
                </a>
              );
            })}
          </div>

          {/* Footer Link: Browse all services */}
          <div className="pt-2">
            <a
              href="/services"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('/services');
              }}
              className="text-xs font-bold text-[#1E56C8] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Browse all services</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </div>

      {/* ==================================================================== */}
      {/* 4. COLLAPSIBLE HELP & FAQS SECTION                                  */}
      {/* ==================================================================== */}
      <section
        id="faq-section"
        aria-labelledby="faq-section-heading"
        className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 sm:p-4 shadow-xs"
      >
        <button
          type="button"
          onClick={() => setIsFaqOpen((prev) => !prev)}
          aria-expanded={isFaqOpen}
          aria-controls="faq-content-panel"
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4" />
            </span>
            <div>
              <h2
                id="faq-section-heading"
                className="text-sm sm:text-base font-extrabold text-[#0F172A] tracking-tight"
              >
                Help &amp; Frequently Asked Questions
              </h2>
              <p className="text-[11px] text-slate-500 font-normal">
                Application assistance, tracking &amp; local centre details
              </p>
            </div>
          </div>
          <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-900 shrink-0">
            {isFaqOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {/* Collapsible Content */}
        {isFaqOpen && (
          <div id="faq-content-panel" className="mt-4 pt-3 border-t border-[#F1F5F9] space-y-4 animate-fade-in text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* Question 1: How to request assistance */}
              <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
                <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E56C8]" />
                  <span>How do I request online application assistance?</span>
                </h3>
                <p className="text-[11.5px] text-[#64748B] mt-1.5 leading-relaxed">
                  Click the <strong>Apply</strong> option on any recruitment or service card, or navigate directly to the application desk to submit your documents and requirements securely.
                </p>
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => handleNavigate('/apply')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E56C8] hover:underline"
                  >
                    <span>Open Application Desk</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Question 2: How to track application */}
              <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
                <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E56C8]" />
                  <span>How can I track my submitted application?</span>
                </h3>
                <p className="text-[11.5px] text-[#64748B] mt-1.5 leading-relaxed">
                  Enter your tracking token or phone number on the <strong>Track</strong> page to inspect real-time progress, acknowledgment slips, and download completed forms.
                </p>
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenTrack) onOpenTrack();
                      else handleNavigate('/track');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E56C8] hover:underline"
                  >
                    <span>Check Application Status</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Centre Contact & Location Box */}
            <div className="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100/80 space-y-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1E56C8]" />
                <span>Local CSC DOST Centre Information</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11.5px]">
                <div>
                  <span className="text-slate-500 block font-medium">Physical Address:</span>
                  <span className="font-semibold text-slate-800">
                    Sangran, Qazigund, Anantnag, Jammu &amp; Kashmir 192221
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Contact Helpline:</span>
                  <a href="tel:+917006833767" className="font-semibold text-[#1E56C8] hover:underline block">
                    +91 70068 33767
                  </a>
                  <a href="tel:+919682132895" className="font-semibold text-[#1E56C8] hover:underline block">
                    +91 96821 32895
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Office Hours:</span>
                  <span className="font-semibold text-slate-800 block">
                    Mon - Sat: 08:30 AM - 08:00 PM
                  </span>
                  <span className="text-slate-600 text-[11px] block">
                    Sun: 10:00 AM - 04:00 PM
                  </span>
                </div>
              </div>

              {/* Direct WhatsApp Helpline */}
              <div className="pt-2 border-t border-blue-100/80 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] text-slate-600">
                  Need direct assistance from our center executive?
                </span>
                <a
                  href="https://wa.me/917006833767?text=Hello%20CSC%20DOST,%20I%20need%20assistance%20with%20an%20online%20service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#16A34A] hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

          </div>
        )}
      </section>

    </div>
  );
}
