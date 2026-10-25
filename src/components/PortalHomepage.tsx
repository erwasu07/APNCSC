import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ArrowRight, 
  BookOpen, 
  Briefcase, 
  CreditCard, 
  Fingerprint, 
  Award, 
  FileText, 
  Calendar, 
  ExternalLink,
  GraduationCap,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck
} from 'lucide-react';
import { SARKARI_DATA, SARKARI_CATEGORIES, SarkariItem } from '../data/sarkariData';
import { SERVICES_LIST, ServiceItem } from '../servicesData';
import { GUIDE_ARTICLES, GuideArticle } from './GuidesKnowledgeHub';
import CitizenToolsDesk from './CitizenToolsDesk';

interface PortalHomepageProps {
  onOpenJob: (item: SarkariItem) => void;
  onOpenService: (item: ServiceItem) => void;
  onApplyService: (serviceName: string) => void;
  onOpenGuide?: (guideId: string) => void;
  onOpenTrack?: () => void;
  onOpenLegal?: (tab: 'privacy' | 'terms' | 'disclaimer') => void;
}

export default function PortalHomepage({
  onOpenJob,
  onOpenService,
  onApplyService,
  onOpenGuide,
  onOpenTrack,
  onOpenLegal
}: PortalHomepageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recruitmentFilter, setRecruitmentFilter] = useState<string>('all');

  // Listen for search focus event from Navbar and keyboard shortcuts (Ctrl+K, /, Escape)
  useEffect(() => {
    const handleFocusSearch = () => {
      const el = document.getElementById('portal-universal-search');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && !isInput) {
        e.preventDefault();
        handleFocusSearch();
      } else if (e.key === 'Escape') {
        if (searchQuery) {
          setSearchQuery('');
        }
      }
    };

    window.addEventListener('focus-csc-search', handleFocusSearch);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('focus-csc-search', handleFocusSearch);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchQuery]);

  // Quick popular search chips
  const popularKeywords = ['JKSSB', 'PM-KISAN', 'Aadhaar', 'PAN', 'Army Recruitment', 'SSC', 'RRB'];

  // Global search matching across jobs, services, and guides
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedJobs = SARKARI_DATA.filter(j => 
      j.title.toLowerCase().includes(q) || 
      j.shortInfo.toLowerCase().includes(q) ||
      (j.eligibility && j.eligibility.toLowerCase().includes(q))
    ).slice(0, 6);

    const matchedServices = SERVICES_LIST.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedGuides = GUIDE_ARTICLES.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.summary.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q)
    ).slice(0, 4);

    return {
      jobs: matchedJobs,
      services: matchedServices,
      guides: matchedGuides,
      total: matchedJobs.length + matchedServices.length + matchedGuides.length
    };
  }, [searchQuery]);

  // Latest updates (top recent 8 items from SARKARI_DATA)
  const latestUpdates = useMemo(() => {
    return SARKARI_DATA.slice(0, 8);
  }, []);

  // Recruitment filtered items
  const filteredRecruitment = useMemo(() => {
    if (recruitmentFilter === 'all') return SARKARI_DATA.slice(0, 9);
    return SARKARI_DATA.filter(item => item.category === recruitmentFilter).slice(0, 9);
  }, [recruitmentFilter]);

  // Education resources: Filtered items from Kashmir University and Cluster University
  const educationItems = useMemo(() => {
    return SARKARI_DATA.filter(
      item => item.category === 'cluster_univ' || item.category === 'exam_forms' || item.category === 'admissions'
    ).slice(0, 6);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const getCategoryLabel = (category: string) => {
    return SARKARI_CATEGORIES[category]?.label || category;
  };

  // Popular Services for the Bento Grid
  const bentoServices = [
    {
      id: 'aadhaar-card-services',
      title: 'Aadhaar Card Services',
      description: 'Demographic address update, mobile number seeding, PVC card ordering & biometric eKYC guidance.',
      category: 'UIDAI Identity',
      icon: Fingerprint,
      highlight: 'High Demand',
      hash: '#service/aadhaar-card-services'
    },
    {
      id: 'pan-card-new-correction',
      title: 'PAN Card (New & Correction)',
      description: 'Paperless biometric e-Sign application, minor to major conversion, father name & DOB corrections via NSDL/UTIITSL.',
      category: 'Tax & Identity',
      icon: CreditCard,
      highlight: 'Instant e-PAN',
      hash: '#service/pan-card-new-correction'
    },
    {
      id: 'jkssb-online-recruitment',
      title: 'JKSSB Online Application',
      description: 'Complete form submission, document scanning, photo & signature pixel compliance, fee receipt & tracking slip.',
      category: 'State Recruitment',
      icon: Briefcase,
      highlight: 'MTS / Class-IV Active',
      target: 'recruitment-section'
    },
    {
      id: 'ayushman-bharat-golden-card',
      title: 'Ayushman Bharat PM-JAY & SEHAT',
      description: '₹5,00,000 cashless annual healthcare assurance. Individual KYC verification and PVC Golden Card generation.',
      category: 'Healthcare',
      icon: ShieldCheck,
      highlight: 'Universal Cover',
      target: 'schemes-section'
    },
    {
      id: 'jk-domicile-revenue',
      title: 'J&K Domicile & Revenue Certificates',
      description: 'Online filing of Domicile, PRC conversion, Character, Legal Heir, and Revenue extract certificates on JanSugam.',
      category: 'Revenue & Citizens',
      icon: FileText,
      highlight: 'Govt Certified',
      hash: '#apply'
    },
    {
      id: 'passport-appointment-seva',
      title: 'Passport Seva Kendra Appointment',
      description: 'Online application filing, Annexure documentation, and biometric interview slot booking at PSK Srinagar & Jammu.',
      category: 'Travel & MEA',
      icon: Compass,
      highlight: 'Fast Slots',
      hash: '#apply'
    }
  ];

  return (
    <div className="space-y-14 sm:space-y-20 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* ==================================================================== */}
      {/* 2. PREMIUM HERO & GLOBAL SEARCH */}
      {/* ==================================================================== */}
      <section className="relative overflow-hidden pt-6 sm:pt-10 pb-8 text-center max-w-5xl mx-auto space-y-6">
        
        {/* Subtle decorative background vector elements (SaaS inspired, no heavy clutter) */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-[500px] h-[300px] bg-gradient-to-tr from-blue-100/60 to-emerald-50/40 rounded-full blur-3xl transform -translate-y-12" />
        </div>

        {/* Eyebrow Label */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs font-semibold text-[#2563EB] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" aria-hidden="true" />
          <span>Your Digital Assistance Partner</span>
        </div>

        {/* Powerful Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#102A56] tracking-tight leading-[1.12]">
          Everything You Need, <br className="hidden sm:inline" />
          <span className="text-[#2563EB]">All in One Place</span>
        </h1>

        {/* Supporting Text */}
        <p className="text-sm sm:text-base md:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
          Access verified government schemes, latest public recruitments, university admissions, citizen document services, and step-by-step digital assistance.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => scrollToSection('services-bento')}
            className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer flex items-center gap-2"
          >
            <span>Explore Services</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('recruitment-section')}
            className="px-6 py-3 bg-white hover:bg-[#F8FAFC] text-[#102A56] text-sm font-bold rounded-xl transition-all border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-2xs cursor-pointer"
          >
            <span>Latest Updates</span>
          </button>
        </div>

        {/* Large Functional Global Search Bar */}
        <div className="pt-4 max-w-2xl mx-auto">
          <div className="relative group">
            <Search className="w-5 h-5 text-[#64748B] group-focus-within:text-[#2563EB] absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              id="portal-universal-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services, schemes, recruitments (e.g., JKSSB, PM-KISAN, PAN, Army)..."
              className="w-full pl-12 pr-24 py-3.5 bg-white border border-[#E2E8F0] focus:border-[#2563EB] rounded-2xl text-sm text-[#0F172A] placeholder-[#64748B] shadow-xs focus:ring-4 focus:ring-[#EFF6FF] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Popular Search Keywords */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 text-xs text-[#64748B]">
            <span className="font-semibold text-slate-500">Popular:</span>
            {popularKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => setSearchQuery(kw)}
                className="px-2.5 py-1 bg-white hover:bg-[#EFF6FF] hover:text-[#2563EB] text-[#0F172A] border border-[#E2E8F0] rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* ==================================================================== */}
      {/* SEARCH RESULTS DROPDOWN / EXPANDED PANEL */}
      {/* ==================================================================== */}
      {searchResults && (
        <section aria-label="Search Results" className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-md max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h2 className="text-sm font-bold text-[#102A56]">
              Search Results for "{searchQuery}" ({searchResults.total} found)
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
            >
              Close Search
            </button>
          </div>

          {searchResults.total === 0 ? (
            <p className="text-xs text-[#64748B] py-4 text-center">
              No matching records found. Try searching for "JKSSB", "Army", "PAN", "Aadhaar", or "Kisan".
            </p>
          ) : (
            <div className="space-y-4">
              {/* Job Results */}
              {searchResults.jobs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-[#64748B] tracking-wider block">
                    Recruitments &amp; Notifications
                  </span>
                  <div className="divide-y divide-[#E2E8F0]">
                    {searchResults.jobs.map(job => (
                      <div
                        key={job.id}
                        onClick={() => onOpenJob(job)}
                        className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-0.5">
                            <span className="font-semibold text-[#2563EB]">{getCategoryLabel(job.category)}</span>
                            {job.lastDate && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>Last Date: {job.lastDate}</span>
                              </>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-[#0F172A] leading-snug">
                            {job.title}
                          </h3>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#2563EB] shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guide Results */}
              {searchResults.guides.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                  <span className="text-xs font-bold uppercase text-[#64748B] tracking-wider block">
                    Citizen Guides &amp; Procedures
                  </span>
                  <div className="divide-y divide-[#E2E8F0]">
                    {searchResults.guides.map(guide => (
                      <div
                        key={guide.id}
                        onClick={() => {
                          if (onOpenGuide) onOpenGuide(guide.id);
                          else scrollToSection('knowledge-hub');
                        }}
                        className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <div>
                          <span className="text-xs text-[#2563EB] font-semibold block mb-0.5">{guide.category}</span>
                          <h3 className="text-sm font-bold text-[#0F172A] leading-snug">
                            {guide.title}
                          </h3>
                        </div>
                        <span className="text-xs text-[#2563EB] font-semibold shrink-0">Read Guide →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Digital Services */}
              {searchResults.services.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                  <span className="text-xs font-bold uppercase text-[#64748B] tracking-wider block">
                    Digital Services
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResults.services.map(svc => (
                      <div
                        key={svc.id}
                        onClick={() => onOpenService(svc)}
                        className="p-3 border border-[#E2E8F0] hover:border-[#2563EB] rounded-xl cursor-pointer transition-colors"
                      >
                        <h3 className="text-xs font-bold text-[#0F172A]">{svc.name}</h3>
                        <p className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5">{svc.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ==================================================================== */}
      {/* 3. QUICK ACCESS SHORTCUTS */}
      {/* ==================================================================== */}
      <section aria-labelledby="quick-shortcuts-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="quick-shortcuts-heading" className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Quick Access Shortcuts
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'jobs', title: 'Recruitments', sub: `${SARKARI_DATA.length}+ Active Notices`, icon: Briefcase, target: 'recruitment-section' },
            { id: 'schemes', title: 'Govt Schemes', sub: 'Central & State PM-JAY', icon: Award, target: 'schemes-section' },
            { id: 'education', title: 'Education Hub', sub: 'KU & CUS Notices', icon: GraduationCap, target: 'education-resources' },
            { id: 'tools', title: 'Citizen Tools', sub: 'Age & Spec Calculator', icon: Sparkles, target: 'citizen-tools' },
            { id: 'services', title: 'CSC Services', sub: `${SERVICES_LIST.length}+ e-Services`, icon: Layers, target: 'services-bento' },
            { id: 'guides', title: 'Step-by-Step Guides', sub: `${GUIDE_ARTICLES.length} Walkthroughs`, icon: BookOpen, target: 'knowledge-hub' },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => scrollToSection(cat.target)}
                className="bg-white border border-[#E2E8F0] hover:border-[#2563EB] p-3.5 rounded-xl text-left transition-all hover:shadow-xs group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-2 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug">
                  {cat.title}
                </h3>
                <span className="text-[10px] text-[#64748B] block mt-0.5 truncate">
                  {cat.sub}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. POPULAR DIGITAL SERVICES BENTO GRID */}
      {/* ==================================================================== */}
      <section id="services-bento" aria-labelledby="popular-services-heading" className="space-y-5 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="text-xs font-bold uppercase text-[#2563EB] tracking-wider block mb-1">
              Popular Digital Services
            </span>
            <h2 id="popular-services-heading" className="text-xl sm:text-2xl font-extrabold text-[#102A56] tracking-tight">
              Essential Citizen E-Services
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Quickly submit applications, download official acknowledgments, and request operator assistance.
            </p>
          </div>
          <button
            type="button"
            onClick={() => scrollToSection('services-catalogue')}
            className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All {SERVICES_LIST.length} Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bentoServices.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.id}
                onClick={() => {
                  if (svc.hash) {
                    window.location.hash = svc.hash;
                  } else if (svc.target) {
                    scrollToSection(svc.target);
                  }
                }}
                className="bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xs group cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full">
                      {svc.highlight}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-[#64748B] block mb-0.5">
                      {svc.category}
                    </span>
                    <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug">
                      {svc.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                    {svc.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#2563EB]">
                  <span>Access Service</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. LATEST RECRUITMENT & GOVERNMENT UPDATES */}
      {/* ==================================================================== */}
      <section id="recruitment-section" aria-labelledby="recruitment-heading" className="space-y-5 scroll-mt-20">
        <div id="sarkari-board" className="scroll-mt-20" />
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="text-xs font-bold uppercase text-[#2563EB] tracking-wider block mb-1">
              Public Recruitments
            </span>
            <h2 id="recruitment-heading" className="text-xl sm:text-2xl font-extrabold text-[#102A56] tracking-tight">
              Latest Recruitment &amp; Exam Notices
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Verified public recruitment updates from JKSSB, Indian Army, SSC, RRB, and state boards.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
          {[
            { id: 'all', label: 'All Updates' },
            { id: 'jkssb', label: 'JKSSB' },
            { id: 'army_jobs', label: 'Indian Army' },
            { id: 'ssc_jobs', label: 'SSC' },
            { id: 'rrb_jobs', label: 'Railway RRB' },
            { id: 'cluster_univ', label: 'Cluster Univ' },
            { id: 'exam_forms', label: 'KU Exam Forms' },
            { id: 'admissions', label: 'KU Admissions' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRecruitmentFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer border ${
                recruitmentFilter === tab.id
                  ? 'bg-[#2563EB] text-white border-[#2563EB] font-bold shadow-2xs'
                  : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Recruitment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecruitment.map((item) => (
            <article
              key={item.id}
              className="bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xs group"
            >
              <div className="space-y-3">
                {/* Meta without pills */}
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-bold text-[#2563EB]">{getCategoryLabel(item.category)}</span>
                  {item.lastDate && (
                    <span className="text-rose-700 font-semibold">Last Date: {item.lastDate}</span>
                  )}
                </div>

                <h3 
                  onClick={() => onOpenJob(item)}
                  className="text-sm sm:text-base font-bold text-[#0F172A] hover:text-[#2563EB] cursor-pointer transition-colors leading-snug line-clamp-2"
                >
                  {item.title}
                </h3>

                {item.totalPosts && (
                  <p className="text-xs text-[#0F172A]">
                    Vacancies / Seats: <span className="font-bold text-[#2563EB]">{item.totalPosts}</span>
                  </p>
                )}

                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  {item.shortInfo || item.eligibility || 'Click to view complete educational eligibility, age limit, and official link.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenJob(item)}
                  className="text-xs font-bold text-[#2563EB] hover:underline"
                >
                  Read Notification →
                </button>

                {item.officialLink && (
                  <a
                    href={item.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#64748B] hover:text-[#0F172A]"
                    title="Visit official portal"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. GOVERNMENT SCHEMES DISCOVERY */}
      {/* ==================================================================== */}
      <section id="schemes-section" aria-labelledby="schemes-heading" className="space-y-5 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="text-xs font-bold uppercase text-[#2563EB] tracking-wider block mb-1">
              Welfare &amp; Subsidies
            </span>
            <h2 id="schemes-heading" className="text-xl sm:text-2xl font-extrabold text-[#102A56] tracking-tight">
              Government Schemes Discovery
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Income support, universal health insurance, and social security entitlements for citizens.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* PM KISAN Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#16A34A]">Direct Benefit Transfer (DBT)</span>
              <span className="text-[#64748B]">Ministry of Agriculture</span>
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">
              PM Kisan Samman Nidhi Yojana (₹6,000 / Year)
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Direct Benefit Transfer income support of ₹2,000 in three 4-monthly cycles to landholding farmer families. Requires completed biometric/OTP eKYC and active NPCI bank seeding.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://pmkisan.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold rounded-lg transition-colors"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
              </a>
              <button
                type="button"
                onClick={() => {
                  if (onOpenGuide) onOpenGuide('pm-kisan-ekyc-status-guide-2026');
                  else scrollToSection('knowledge-hub');
                }}
                className="px-3 py-1.5 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                View eKYC Guide →
              </button>
            </div>
          </div>

          {/* Ayushman Bharat PM-JAY Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2563EB]">Universal Healthcare Cover</span>
              <span className="text-[#64748B]">National Health Authority</span>
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">
              Ayushman Bharat PM-JAY &amp; SEHAT Golden Card
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Provides cashless in-patient treatment of up to ₹5,00,000 per family per year across 27,000+ empaneled hospitals nationwide. 100% universal coverage in J&amp;K via SEHAT.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://beneficiary.nha.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold rounded-lg transition-colors"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
              </a>
              <button
                type="button"
                onClick={() => {
                  if (onOpenGuide) onOpenGuide('ayushman-bharat-golden-card-guide-2026');
                  else scrollToSection('knowledge-hub');
                }}
                className="px-3 py-1.5 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                View Golden Card Guide →
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. EDUCATION & LEARNING RESOURCES */}
      {/* ==================================================================== */}
      <section id="education-resources" aria-labelledby="education-heading" className="space-y-5 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="text-xs font-bold uppercase text-[#2563EB] tracking-wider block mb-1">
              Higher Education &amp; Admissions
            </span>
            <h2 id="education-heading" className="text-xl sm:text-2xl font-extrabold text-[#102A56] tracking-tight">
              Education &amp; Learning Resources
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              University circulars, date sheets, entrance forms, and academic admissions for J&amp;K students.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <a
              href="https://kashmiruniversity.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <span>KU Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-300">·</span>
            <a
              href="https://cusrinagar.edu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <span>CUS Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {educationItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenJob(item)}
              className="bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xs group cursor-pointer"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-bold text-[#2563EB]">{getCategoryLabel(item.category)}</span>
                  {item.lastDate && (
                    <span className="text-[#0F172A] font-semibold">Ends: {item.lastDate}</span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  {item.shortInfo || item.eligibility || 'Official notification circular and candidate instructions.'}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#2563EB]">
                <span>View Date Sheet / Notice</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. DIGITAL TOOLS & CITIZEN CALCULATORS */}
      {/* ==================================================================== */}
      <CitizenToolsDesk onApplyService={onApplyService} />

      {/* Featured Banner: Advanced Free Online Tools Suite */}
      <section className="bg-gradient-to-r from-[#102A56] to-[#1E3A8A] text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden space-y-6">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-bold text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>New Feature Suite</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            Free Online Tools Hub — Fast, Simple &amp; Secure
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
            Compress images to 20 KB/50 KB, create PDFs from photos, merge and split documents, format 35×45 mm passport photo sheets, and remove backgrounds with 100% private, client-side processing.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#tools';
              }}
              className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Explore All Free Online Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.hash = '#tools/image-compressor';
              }}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              Image Compressor (20KB - 50KB)
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.hash = '#tools/image-to-pdf';
              }}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              Image to PDF Maker
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
