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
  FileCheck,
  Wrench,
  Minimize2,
  Crop,
  FileImage,
  FileDown,
  Files,
  Split,
  FileArchive,
  Scissors,
  Camera,
  PenTool,
  RefreshCw,
  Zap
} from 'lucide-react';
import { SARKARI_DATA, SARKARI_CATEGORIES, SarkariItem } from '../data/sarkariData';
import { SERVICES_LIST, ServiceItem } from '../servicesData';
import { GUIDE_ARTICLES, GuideArticle } from './GuidesKnowledgeHub';
import { TOOLS_LIST, ToolItem } from './tools/toolsData';
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

  // Quick popular search shortcuts
  const popularKeywords = ['JKSSB', 'PM-KISAN', 'Image Compressor', 'Aadhaar', 'PDF to Image', 'Passport Photo', 'Army', 'PAN'];

  // Global search matching across jobs, services, guides, and tools
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedTools = TOOLS_LIST.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.shortDescription.toLowerCase().includes(q) ||
      t.keywords.some(k => k.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchedJobs = SARKARI_DATA.filter(j => 
      j.title.toLowerCase().includes(q) || 
      j.shortInfo.toLowerCase().includes(q) ||
      (j.eligibility && j.eligibility.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchedServices = SERVICES_LIST.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchedGuides = GUIDE_ARTICLES.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.summary.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q)
    ).slice(0, 3);

    return {
      tools: matchedTools,
      jobs: matchedJobs,
      services: matchedServices,
      guides: matchedGuides,
      total: matchedTools.length + matchedJobs.length + matchedServices.length + matchedGuides.length
    };
  }, [searchQuery]);

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

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Minimize2': return Minimize2;
      case 'Crop': return Crop;
      case 'FileImage': return FileImage;
      case 'FileDown': return FileDown;
      case 'Files': return Files;
      case 'Split': return Split;
      case 'FileArchive': return FileArchive;
      case 'Scissors': return Scissors;
      case 'Camera': return Camera;
      case 'Signature': return PenTool;
      case 'RefreshCw': return RefreshCw;
      default: return Wrench;
    }
  };

  // 12 Tools matching the approved demo
  const demoTools = useMemo(() => {
    return TOOLS_LIST.slice(0, 12);
  }, []);

  return (
    <div className="space-y-14 sm:space-y-20 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* ==================================================================== */}
      {/* 3. HOMEPAGE HERO SECTION */}
      {/* ==================================================================== */}
      <section className="relative overflow-hidden pt-6 sm:pt-12 pb-8 text-center max-w-5xl mx-auto space-y-6">
        
        {/* Subtle decorative background vector elements */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none opacity-50">
          <div className="w-[540px] h-[320px] bg-gradient-to-tr from-[#EAF4FF] to-blue-50 rounded-full blur-3xl transform -translate-y-10" />
        </div>

        {/* Quiet Authority Kicker */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#EAF4FF] border border-[#BFDBFE] rounded-full text-xs font-bold text-[#0759E8] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" aria-hidden="true" />
          <span>Your Trusted Digital Assistance Partner</span>
        </div>

        {/* Approved Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#0B1F49] tracking-tight leading-[1.12]">
          Digital Services, <br className="hidden sm:inline" />
          <span className="text-[#0759E8]">Made Simple.</span>
        </h1>

        {/* Approved Supporting Description */}
        <p className="text-sm sm:text-base md:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
          Get step-by-step guides for government schemes, latest job updates, educational resources and free online tools — all in one place.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => scrollToSection('services-bento')}
            className="px-6 py-3 bg-[#0759E8] hover:bg-[#0646b8] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer flex items-center gap-2"
          >
            <span>Explore Services</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.hash = '#tools';
            }}
            className="px-6 py-3 bg-white hover:bg-[#F8FAFC] text-[#0B1F49] text-xs sm:text-sm font-bold rounded-xl transition-all border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-2xs cursor-pointer flex items-center gap-2"
          >
            <Wrench className="w-4 h-4 text-[#0759E8]" />
            <span>Online Tools</span>
          </button>
        </div>

        {/* Large Functional Global Search Bar */}
        <div className="pt-4 max-w-2xl mx-auto">
          <div className="relative group">
            <Search className="w-5 h-5 text-[#64748B] group-focus-within:text-[#0759E8] absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              id="portal-universal-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services, schemes, jobs, or tools (e.g., JKSSB, PM-KISAN, Compress 20KB)..."
              className="w-full pl-12 pr-24 py-3.5 bg-white border border-[#E2E8F0] focus:border-[#0759E8] rounded-2xl text-xs sm:text-sm text-[#14213D] placeholder-[#64748B] shadow-xs focus:ring-4 focus:ring-[#EAF4FF] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#64748B] hover:text-[#14213D] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Popular Search Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 text-xs text-[#64748B]">
            <span className="font-semibold text-slate-500">Popular:</span>
            {popularKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => setSearchQuery(kw)}
                className="px-2.5 py-1 bg-white hover:bg-[#EAF4FF] hover:text-[#0759E8] text-[#14213D] border border-[#E2E8F0] rounded-lg text-xs font-medium transition-colors cursor-pointer"
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
            <h2 className="text-sm font-bold text-[#0B1F49]">
              Search Results for "{searchQuery}" ({searchResults.total} found)
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#0759E8] hover:underline font-semibold cursor-pointer"
            >
              Close Search
            </button>
          </div>

          {searchResults.total === 0 ? (
            <p className="text-xs text-[#64748B] py-4 text-center">
              No matching records found. Try searching for "JKSSB", "Army", "PAN", "Aadhaar", or "Compress".
            </p>
          ) : (
            <div className="space-y-4">
              
              {/* Online Tools Results */}
              {searchResults.tools.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-[#0759E8] tracking-wider block">
                    Free Online Tools
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResults.tools.map(tool => (
                      <div
                        key={tool.id}
                        onClick={() => {
                          window.location.hash = `#tools/${tool.id}`;
                        }}
                        className="p-3 border border-[#E2E8F0] hover:border-[#0759E8] bg-[#F8FAFC] hover:bg-[#EAF4FF]/40 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <h3 className="text-xs font-bold text-[#14213D]">{tool.name}</h3>
                          <p className="text-[11px] text-[#64748B] line-clamp-1">{tool.shortDescription}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#0759E8] shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Results */}
              {searchResults.jobs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
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
                            <span className="font-semibold text-[#0759E8]">{getCategoryLabel(job.category)}</span>
                            {job.lastDate && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>Last Date: {job.lastDate}</span>
                              </>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-[#14213D] leading-snug">
                            {job.title}
                          </h3>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#0759E8] shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Digital Services */}
              {searchResults.services.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                  <span className="text-xs font-bold uppercase text-[#64748B] tracking-wider block">
                    Citizen Services
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResults.services.map(svc => (
                      <div
                        key={svc.id}
                        onClick={() => onOpenService(svc)}
                        className="p-3 border border-[#E2E8F0] hover:border-[#0759E8] rounded-xl cursor-pointer transition-colors"
                      >
                        <h3 className="text-xs font-bold text-[#14213D]">{svc.name}</h3>
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
      {/* 1. RECRUITMENT UPDATES SECTION (Public Recruitments) */}
      {/* ==================================================================== */}
      <section id="recruitment-section" aria-labelledby="recruitment-heading" className="space-y-5 scroll-mt-20">
        <div id="sarkari-board" className="scroll-mt-20" />
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="text-xs font-bold uppercase text-[#0759E8] tracking-wider block mb-1">
              Public Recruitments
            </span>
            <h2 id="recruitment-heading" className="text-xl sm:text-2xl font-black text-[#0B1F49] tracking-tight">
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
                  ? 'bg-[#0759E8] text-white border-[#0759E8] font-bold shadow-2xs'
                  : 'bg-white text-[#14213D] border-[#E2E8F0] hover:bg-[#F8FAFC]'
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
              className="bg-white border border-[#E2E8F0] hover:border-[#0759E8] rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xs group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-bold text-[#0759E8]">{getCategoryLabel(item.category)}</span>
                  {item.lastDate && (
                    <span className="text-rose-700 font-semibold">Last Date: {item.lastDate}</span>
                  )}
                </div>

                <h3 
                  onClick={() => onOpenJob(item)}
                  className="text-sm sm:text-base font-bold text-[#14213D] hover:text-[#0759E8] cursor-pointer transition-colors leading-snug line-clamp-2"
                >
                  {item.title}
                </h3>

                {item.totalPosts && (
                  <p className="text-xs text-[#14213D]">
                    Vacancies / Seats: <span className="font-bold text-[#0759E8]">{item.totalPosts}</span>
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
                  className="text-xs font-bold text-[#0759E8] hover:underline cursor-pointer"
                >
                  View Details →
                </button>

                {item.officialLink && (
                  <a
                    href={item.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#64748B] hover:text-[#14213D]"
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
      {/* 2. ONLINE TOOLS DASHBOARD (Fast, Simple & Secure Document Tools) */}
      {/* ==================================================================== */}
      <section id="online-tools-dashboard" aria-labelledby="tools-dashboard-heading" className="space-y-5 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="text-xs font-bold uppercase text-[#0759E8] tracking-wider block mb-1">
              Free Online Tools
            </span>
            <h2 id="tools-dashboard-heading" className="text-xl sm:text-2xl font-black text-[#0B1F49] tracking-tight">
              Fast, Simple &amp; Secure Document Tools
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Process images, format PDFs, and prepare application documents 100% locally in your browser.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.hash = '#tools';
            }}
            className="text-xs font-bold text-[#0759E8] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 12 Tools Grid Matching Approved Demo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {demoTools.map((tool) => {
            const ToolIcon = getToolIcon(tool.iconName);
            return (
              <div
                key={tool.id}
                onClick={() => {
                  window.location.hash = `#tools/${tool.id}`;
                }}
                className="bg-white border border-[#E2E8F0] hover:border-[#0759E8] rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-sm hover:-translate-y-0.5 group cursor-pointer"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] text-[#0759E8] flex items-center justify-center group-hover:bg-[#0759E8] group-hover:text-white transition-colors">
                      <ToolIcon className="w-5 h-5" />
                    </div>
                    {tool.badge && (
                      <span className="text-[10px] font-bold text-[#0759E8] bg-[#EAF4FF] px-2 py-0.5 rounded-full">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#14213D] group-hover:text-[#0759E8] transition-colors leading-snug">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-[#64748B] line-clamp-2 mt-1 leading-relaxed">
                      {tool.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#0759E8]">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. EDUCATION & LEARNING RESOURCES (Higher Education & Admissions) */}
      {/* ==================================================================== */}
      <section id="education-resources" aria-labelledby="education-heading" className="space-y-5 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="text-xs font-bold uppercase text-[#0759E8] tracking-wider block mb-1">
              Higher Education &amp; Admissions
            </span>
            <h2 id="education-heading" className="text-xl sm:text-2xl font-black text-[#0B1F49] tracking-tight">
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
              className="text-xs font-bold text-[#0759E8] hover:underline flex items-center gap-1"
            >
              <span>KU Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-300">·</span>
            <a
              href="https://cusrinagar.edu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#0759E8] hover:underline flex items-center gap-1"
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
              className="bg-white border border-[#E2E8F0] hover:border-[#0759E8] rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xs group cursor-pointer"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-bold text-[#0759E8]">{getCategoryLabel(item.category)}</span>
                  {item.lastDate && (
                    <span className="text-[#14213D] font-semibold">Ends: {item.lastDate}</span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#14213D] group-hover:text-[#0759E8] transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  {item.shortInfo || item.eligibility || 'Official notification circular and candidate instructions.'}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#0759E8]">
                <span>View Date Sheet / Notice</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. POPULAR DIGITAL SERVICES BENTO GRID (Essential Citizen E-Services) */}
      {/* ==================================================================== */}
      <section id="services-bento" aria-labelledby="popular-services-heading" className="space-y-5 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="text-xs font-bold uppercase text-[#0759E8] tracking-wider block mb-1">
              Popular Digital Services
            </span>
            <h2 id="popular-services-heading" className="text-xl sm:text-2xl font-black text-[#0B1F49] tracking-tight">
              Essential Citizen E-Services
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Quickly submit applications, download official acknowledgments, and request operator assistance.
            </p>
          </div>
          <button
            type="button"
            onClick={() => scrollToSection('services-catalogue')}
            className="text-xs font-bold text-[#0759E8] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All {SERVICES_LIST.length} Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
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
          ].map((svc) => {
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
                className="bg-white border border-[#E2E8F0] hover:border-[#0759E8] rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xs group cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] text-[#0759E8] flex items-center justify-center group-hover:bg-[#0759E8] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#0759E8] bg-[#EAF4FF] px-2.5 py-0.5 rounded-full">
                      {svc.highlight}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-[#64748B] block mb-0.5">
                      {svc.category}
                    </span>
                    <h3 className="text-base font-bold text-[#14213D] group-hover:text-[#0759E8] transition-colors leading-snug">
                      {svc.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                    {svc.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#0759E8]">
                  <span>Access Service</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. CITIZEN CALCULATORS SUITE (Digital Tools & Citizen Calculators) */}
      {/* ==================================================================== */}
      <CitizenToolsDesk onApplyService={onApplyService} />

      {/* ==================================================================== */}
      {/* 6. GOVERNMENT SCHEMES DISCOVERY */}
      {/* ==================================================================== */}
      <section id="schemes-section" aria-labelledby="schemes-heading" className="space-y-5 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="text-xs font-bold uppercase text-[#0759E8] tracking-wider block mb-1">
              Welfare &amp; Subsidies
            </span>
            <h2 id="schemes-heading" className="text-xl sm:text-2xl font-black text-[#0B1F49] tracking-tight">
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
            <h3 className="text-base font-bold text-[#14213D]">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 text-[#14213D] border border-[#E2E8F0] text-xs font-semibold rounded-lg transition-colors"
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
                className="px-3 py-1.5 text-xs font-bold text-[#0759E8] hover:underline cursor-pointer"
              >
                View eKYC Guide →
              </button>
            </div>
          </div>

          {/* Ayushman Bharat PM-JAY Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0759E8]">Universal Healthcare Cover</span>
              <span className="text-[#64748B]">National Health Authority</span>
            </div>
            <h3 className="text-base font-bold text-[#14213D]">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 text-[#14213D] border border-[#E2E8F0] text-xs font-semibold rounded-lg transition-colors"
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
                className="px-3 py-1.5 text-xs font-bold text-[#0759E8] hover:underline cursor-pointer"
              >
                View Golden Card Guide →
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
