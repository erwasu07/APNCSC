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
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Clock,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { SARKARI_DATA, SARKARI_CATEGORIES, SarkariItem } from '../data/sarkariData';
import { SERVICES_LIST, ServiceItem } from '../servicesData';
import { GUIDE_ARTICLES, GuideArticle } from './GuidesKnowledgeHub';

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
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [recruitmentFilter, setRecruitmentFilter] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Listen for search focus event from Navbar
  useEffect(() => {
    const handleFocusSearch = () => {
      const el = document.getElementById('portal-universal-search');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    window.addEventListener('focus-csc-search', handleFocusSearch);
    return () => window.removeEventListener('focus-csc-search', handleFocusSearch);
  }, []);

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

  // Government scheme guides
  const schemeGuides = useMemo(() => {
    return GUIDE_ARTICLES.filter(g => g.category === 'Central Scheme' || g.id.includes('kisan') || g.id.includes('ayushman'));
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const getCategoryLabel = (category: string) => {
    return SARKARI_CATEGORIES[category]?.label || category;
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* ==================================================================== */}
      {/* COMPACT HERO SECTION */}
      {/* ==================================================================== */}
      <section className="pt-4 sm:pt-8 pb-4 text-center max-w-4xl mx-auto space-y-4">
        
        {/* Quiet Authority Kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-[#E3E8EF] rounded-md text-xs font-medium text-[#5F6B7A]">
          <span className="w-2 h-2 rounded-full bg-[#188038]" aria-hidden="true" />
          <span>Independent Citizen Information &amp; Digital Assistance</span>
        </div>

        {/* H1 Heading */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#172033] tracking-tight leading-tight">
          Your Guide to Government Services, Schemes &amp; Recruitment
        </h1>

        {/* Purpose / Supporting Text */}
        <p className="text-sm sm:text-base text-[#5F6B7A] max-w-2xl mx-auto leading-relaxed">
          CSC DOST provides clear, verified summaries of public recruitments, citizen welfare schemes, and digital application procedures with direct access to official government portals.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => scrollToSection('recruitment-section')}
            className="px-5 py-2.5 bg-[#0B57D0] hover:bg-[#0842a0] text-white text-sm font-semibold rounded-lg transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B57D0]"
          >
            Explore Latest Updates →
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('popular-guides-section')}
            className="px-5 py-2.5 bg-white hover:bg-[#F7F9FC] text-[#172033] text-sm font-semibold rounded-lg transition-colors border border-[#E3E8EF] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B57D0]"
          >
            Browse Guides
          </button>
        </div>

        {/* Universal Search Input */}
        <div className="pt-4 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="w-5 h-5 text-[#5F6B7A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="portal-universal-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search CSC DOST... (e.g. JKSSB, PM-KISAN, PAN Card, Army)"
              className="w-full pl-11 pr-24 py-3 bg-white border border-[#E3E8EF] focus:border-[#0B57D0] rounded-xl text-sm text-[#172033] placeholder-[#5F6B7A] shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B57D0]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#5F6B7A] hover:text-[#172033] px-2 py-1 bg-slate-100 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* Popular Search Keywords */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2.5 text-xs text-[#5F6B7A]">
            <span className="font-medium text-slate-500">Popular:</span>
            {popularKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => setSearchQuery(kw)}
                className="px-2 py-0.5 bg-white hover:bg-slate-100 text-[#172033] border border-[#E3E8EF] rounded text-xs transition-colors cursor-pointer"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* ==================================================================== */}
      {/* SEARCH RESULTS DROPDOWN / PANEL (When user types) */}
      {/* ==================================================================== */}
      {searchResults && (
        <section aria-label="Search Results" className="bg-white border border-[#E3E8EF] rounded-2xl p-5 shadow-md max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E8EF] pb-3">
            <h2 className="text-sm font-bold text-[#172033]">
              Search Results for "{searchQuery}" ({searchResults.total} found)
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#0B57D0] hover:underline font-medium cursor-pointer"
            >
              Close Search
            </button>
          </div>

          {searchResults.total === 0 ? (
            <p className="text-xs text-[#5F6B7A] py-4 text-center">
              No matching records found. Try searching for "JKSSB", "Army", "PAN", "Aadhaar", or "Kisan".
            </p>
          ) : (
            <div className="space-y-4">
              {/* Job Results */}
              {searchResults.jobs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-[#5F6B7A] tracking-wider block">
                    Recruitments &amp; Notifications
                  </span>
                  <div className="divide-y divide-[#E3E8EF]">
                    {searchResults.jobs.map(job => (
                      <div
                        key={job.id}
                        onClick={() => onOpenJob(job)}
                        className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-xs text-[#5F6B7A] mb-0.5">
                            <span className="font-semibold text-[#0B57D0]">{getCategoryLabel(job.category)}</span>
                            {job.lastDate && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>Last Date: {job.lastDate}</span>
                              </>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-[#172033] leading-snug">
                            {job.title}
                          </h3>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#0B57D0] shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guide Results */}
              {searchResults.guides.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#E3E8EF]">
                  <span className="text-xs font-bold uppercase text-[#5F6B7A] tracking-wider block">
                    Citizen Guides &amp; Procedures
                  </span>
                  <div className="divide-y divide-[#E3E8EF]">
                    {searchResults.guides.map(guide => (
                      <div
                        key={guide.id}
                        onClick={() => {
                          if (onOpenGuide) onOpenGuide(guide.id);
                          else scrollToSection('popular-guides-section');
                        }}
                        className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <div>
                          <span className="text-xs text-[#0B57D0] font-semibold block mb-0.5">{guide.category}</span>
                          <h3 className="text-sm font-bold text-[#172033] leading-snug">
                            {guide.title}
                          </h3>
                        </div>
                        <span className="text-xs text-[#0B57D0] font-semibold shrink-0">Read Guide →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Digital Services */}
              {searchResults.services.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#E3E8EF]">
                  <span className="text-xs font-bold uppercase text-[#5F6B7A] tracking-wider block">
                    Digital Services
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResults.services.map(svc => (
                      <div
                        key={svc.id}
                        onClick={() => onOpenService(svc)}
                        className="p-3 border border-[#E3E8EF] hover:border-[#0B57D0] rounded-lg cursor-pointer transition-colors"
                      >
                        <h3 className="text-xs font-bold text-[#172033]">{svc.name}</h3>
                        <p className="text-[11px] text-[#5F6B7A] line-clamp-1 mt-0.5">{svc.description}</p>
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
      {/* SECTION 1: POPULAR CATEGORIES */}
      {/* ==================================================================== */}
      <section aria-labelledby="popular-categories-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="popular-categories-heading" className="text-lg sm:text-xl font-bold text-[#172033]">
              Popular Categories
            </h2>
            <p className="text-xs text-[#5F6B7A]">Explore information by official sector</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'jobs', title: 'Jobs & Recruitment', count: `${SARKARI_DATA.length}+ Updates`, icon: Briefcase, target: 'recruitment-section' },
            { id: 'schemes', title: 'Government Schemes', count: 'Central & State', icon: Award, target: 'schemes-section' },
            { id: 'aadhaar', title: 'Aadhaar Services', count: 'UIDAI Guidance', icon: Fingerprint, hash: '#service/aadhaar-card-services' },
            { id: 'pan', title: 'PAN Card', count: 'NSDL / UTIITSL', icon: CreditCard, hash: '#service/pan-card-new-correction' },
            { id: 'digital-services', title: 'Digital Services', count: `${SERVICES_LIST.length} Services`, icon: FileText, hash: '#apply' },
            { id: 'guides', title: 'Citizen Guides', count: `${GUIDE_ARTICLES.length} Walkthroughs`, icon: BookOpen, target: 'popular-guides-section' },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  if (cat.hash) {
                    window.location.hash = cat.hash;
                  } else if (cat.target) {
                    scrollToSection(cat.target);
                  }
                }}
                className="bg-white border border-[#E3E8EF] hover:border-[#0B57D0] p-4 rounded-xl text-left transition-all hover:shadow-xs group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B57D0]"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B57D0] flex items-center justify-center mb-2.5 group-hover:bg-[#0B57D0] group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#172033] group-hover:text-[#0B57D0] transition-colors leading-snug">
                  {cat.title}
                </h3>
                <span className="text-[11px] text-[#5F6B7A] block mt-0.5">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 2: LATEST UPDATES (Consistent Article Card Component) */}
      {/* ==================================================================== */}
      <section aria-labelledby="latest-updates-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#E3E8EF] pb-3">
          <div>
            <h2 id="latest-updates-heading" className="text-lg sm:text-xl font-bold text-[#172033]">
              Latest Updates
            </h2>
            <p className="text-xs text-[#5F6B7A]">Recently posted notifications and examination circulars</p>
          </div>
          <button
            type="button"
            onClick={() => scrollToSection('recruitment-section')}
            className="text-xs font-semibold text-[#0B57D0] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({SARKARI_DATA.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {latestUpdates.map((item) => (
            <article
              key={item.id}
              onClick={() => onOpenJob(item)}
              className="bg-white border border-[#E3E8EF] hover:border-[#0B57D0] rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-xs group cursor-pointer"
            >
              <div className="space-y-2">
                {/* Category & Date Metadata (Clean text, no pill clutter) */}
                <div className="flex items-center gap-2 text-xs text-[#5F6B7A]">
                  <span className="text-[#0B57D0] font-semibold">{getCategoryLabel(item.category)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.postDate}</span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-[#172033] group-hover:text-[#0B57D0] transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h3>

                {/* Short Description */}
                <p className="text-xs text-[#5F6B7A] leading-relaxed line-clamp-2">
                  {item.shortInfo || (item.eligibility ? `Eligibility: ${item.eligibility}` : 'Detailed official recruitment notification.')}
                </p>
              </div>

              {/* Card Footer Action */}
              <div className="pt-4 mt-3 border-t border-[#E3E8EF] flex items-center justify-between text-xs font-semibold text-[#0B57D0]">
                <span>Read More</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 3: POPULAR GUIDES */}
      {/* ==================================================================== */}
      <section id="popular-guides-section" aria-labelledby="popular-guides-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#E3E8EF] pb-3">
          <div>
            <h2 id="popular-guides-heading" className="text-lg sm:text-xl font-bold text-[#172033]">
              Popular Citizen Guides
            </h2>
            <p className="text-xs text-[#5F6B7A]">In-depth, step-by-step instructions for essential procedures</p>
          </div>
          <button
            type="button"
            onClick={() => scrollToSection('knowledge-hub')}
            className="text-xs font-semibold text-[#0B57D0] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Explore Knowledge Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GUIDE_ARTICLES.slice(0, 6).map((guide) => (
            <article
              key={guide.id}
              onClick={() => {
                if (onOpenGuide) onOpenGuide(guide.id);
                else scrollToSection('knowledge-hub');
              }}
              className="bg-white border border-[#E3E8EF] hover:border-[#0B57D0] rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-xs group cursor-pointer"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-[#5F6B7A]">
                  <span className="font-semibold text-[#0B57D0]">{guide.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{guide.readTime}</span>
                </div>

                <h3 className="text-base font-bold text-[#172033] group-hover:text-[#0B57D0] transition-colors leading-snug">
                  {guide.title}
                </h3>

                <p className="text-xs text-[#5F6B7A] leading-relaxed line-clamp-3">
                  {guide.summary}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[#E3E8EF] flex items-center justify-between text-xs font-semibold text-[#0B57D0]">
                <span>Read Full Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 4: GOVERNMENT SCHEMES */}
      {/* ==================================================================== */}
      <section id="schemes-section" aria-labelledby="schemes-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#E3E8EF] pb-3">
          <div>
            <h2 id="schemes-heading" className="text-lg sm:text-xl font-bold text-[#172033]">
              Government Schemes
            </h2>
            <p className="text-xs text-[#5F6B7A]">Key welfare programs, financial assistance, and health coverage</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* PM KISAN Card */}
          <div className="bg-white border border-[#E3E8EF] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#188038]">Financial Assistance</span>
              <span className="text-xs text-[#5F6B7A]">Central Scheme</span>
            </div>
            <h3 className="text-base font-bold text-[#172033]">
              PM Kisan Samman Nidhi Yojana (₹6,000 / Year)
            </h3>
            <p className="text-xs text-[#5F6B7A] leading-relaxed">
              Direct Benefit Transfer (DBT) income support of ₹2,000 in three 4-monthly cycles to landholding farmer families. Requires completed biometric/OTP eKYC and active NPCI bank seeding.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <a
                href="https://pmkisan.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F9FC] hover:bg-slate-100 text-[#172033] border border-[#E3E8EF] text-xs font-semibold rounded-lg transition-colors"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#5F6B7A]" />
              </a>
              <button
                type="button"
                onClick={() => {
                  if (onOpenGuide) onOpenGuide('pm-kisan-ekyc-status-guide-2026');
                  else scrollToSection('knowledge-hub');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-[#0B57D0] hover:underline"
              >
                View eKYC Guide →
              </button>
            </div>
          </div>

          {/* Ayushman Bharat PM-JAY Card */}
          <div className="bg-white border border-[#E3E8EF] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B57D0]">Healthcare Cover</span>
              <span className="text-xs text-[#5F6B7A]">Health Assurance</span>
            </div>
            <h3 className="text-base font-bold text-[#172033]">
              Ayushman Bharat PM-JAY &amp; SEHAT Golden Card
            </h3>
            <p className="text-xs text-[#5F6B7A] leading-relaxed">
              Provides cashless in-patient treatment of up to ₹5,00,000 per family per year across 27,000+ empaneled hospitals nationwide. 100% universal coverage in J&amp;K via SEHAT.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <a
                href="https://beneficiary.nha.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F9FC] hover:bg-slate-100 text-[#172033] border border-[#E3E8EF] text-xs font-semibold rounded-lg transition-colors"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#5F6B7A]" />
              </a>
              <button
                type="button"
                onClick={() => {
                  if (onOpenGuide) onOpenGuide('ayushman-bharat-golden-card-guide-2026');
                  else scrollToSection('knowledge-hub');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-[#0B57D0] hover:underline"
              >
                View Golden Card Guide →
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 5: RECRUITMENT UPDATES (Filterable) */}
      {/* ==================================================================== */}
      <section id="recruitment-section" aria-labelledby="recruitment-heading" className="space-y-4 scroll-mt-20">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#E3E8EF] pb-3">
          <div>
            <h2 id="recruitment-heading" className="text-lg sm:text-xl font-bold text-[#172033]">
              Recruitment &amp; Admissions
            </h2>
            <p className="text-xs text-[#5F6B7A]">Browse active notifications by examination authority</p>
          </div>
        </div>

        {/* Filter Bar (Interactive Buttons) */}
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
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                recruitmentFilter === tab.id
                  ? 'bg-[#12304A] text-white font-bold'
                  : 'bg-white text-[#172033] border border-[#E3E8EF] hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Recruitment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecruitment.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#E3E8EF] hover:border-[#0B57D0] rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-xs group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#5F6B7A]">
                  <span className="font-semibold text-[#0B57D0]">{getCategoryLabel(item.category)}</span>
                  {item.lastDate && (
                    <span className="text-rose-700 font-medium">Last Date: {item.lastDate}</span>
                  )}
                </div>

                <h3 
                  onClick={() => onOpenJob(item)}
                  className="text-sm font-bold text-[#172033] hover:text-[#0B57D0] cursor-pointer transition-colors leading-snug line-clamp-2"
                >
                  {item.title}
                </h3>

                {item.totalPosts && (
                  <p className="text-xs text-[#172033] font-medium">
                    Vacancies / Seats: <span className="font-bold text-[#0B57D0]">{item.totalPosts}</span>
                  </p>
                )}

                <p className="text-xs text-[#5F6B7A] line-clamp-2 leading-relaxed">
                  {item.shortInfo || item.eligibility || 'Click to view complete educational eligibility, age limit, and official link.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 mt-3 border-t border-[#E3E8EF] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenJob(item)}
                  className="text-xs font-semibold text-[#0B57D0] hover:underline"
                >
                  Read Notification →
                </button>

                {item.officialLink && (
                  <a
                    href={item.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#5F6B7A] hover:text-[#172033]"
                    title="Visit official portal"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 6: WHY CSC DOST / ABOUT CSC DOST */}
      {/* ==================================================================== */}
      <section id="about-section" aria-labelledby="about-heading" className="bg-white border border-[#E3E8EF] rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0B57D0]" />
            <h2 id="about-heading" className="text-lg sm:text-xl font-bold text-[#172033]">
              About CSC DOST &amp; Independent Portal Disclosure
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#5F6B7A] leading-relaxed">
            <strong>CSC DOST (cscdost.com)</strong> is an independent citizen digital assistance center operated by <strong>Authorized CSC Village Level Entrepreneur (VLE) Wasim Ahmad Khanday (CSC ID: 212515670018)</strong>, located at Sangran Qazigund, Anantnag, Jammu &amp; Kashmir.
          </p>

          <p className="text-xs sm:text-sm text-[#5F6B7A] leading-relaxed">
            Our purpose is to make government services and employment updates accessible to citizens by summarizing complex notifications, explaining step-by-step procedures, and providing in-person assistance for online form submissions, document formatting, and status tracking.
          </p>

          {/* Trust points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-[#172033]">
            <div className="flex items-start gap-2 p-3 bg-[#F7F9FC] rounded-lg border border-[#E3E8EF]">
              <CheckCircle2 className="w-4 h-4 text-[#188038] shrink-0 mt-0.5" />
              <div>
                <strong>Official Sources First</strong>
                <p className="text-[#5F6B7A] text-[11px] mt-0.5">Every notification links directly to the official government portal.</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-[#F7F9FC] rounded-lg border border-[#E3E8EF]">
              <CheckCircle2 className="w-4 h-4 text-[#188038] shrink-0 mt-0.5" />
              <div>
                <strong>No Double Charges</strong>
                <p className="text-[#5F6B7A] text-[11px] mt-0.5">Tariffs follow regulated CSC service norms with printed e-receipts.</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-[#F7F9FC] rounded-lg border border-[#E3E8EF]">
              <CheckCircle2 className="w-4 h-4 text-[#188038] shrink-0 mt-0.5" />
              <div>
                <strong>DPDP Privacy Compliant</strong>
                <p className="text-[#5F6B7A] text-[11px] mt-0.5">Candidate data is handled solely for filing applications with full consent.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 7: REAL CITIZEN FAQS */}
      {/* ==================================================================== */}
      <section aria-labelledby="faq-heading" className="space-y-4 max-w-4xl mx-auto">
        <div className="text-center space-y-1">
          <h2 id="faq-heading" className="text-lg sm:text-xl font-bold text-[#172033]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#5F6B7A]">Answers to common queries regarding notifications, services, and online filing</p>
        </div>

        <div className="space-y-2.5">
          {[
            {
              q: 'Is CSC DOST an official government department?',
              a: 'No. CSC DOST (cscdost.com) is an independent citizen digital assistance and informational portal operated by Authorized CSC VLE Wasim Ahmad Khanday. We provide verified informational summaries and application assistance. Official government portals are always directly linked for verification.'
            },
            {
              q: 'How do I verify if a job notification is genuine before applying?',
              a: 'Every recruitment card on CSC DOST includes the official portal domain (e.g. jkssb.nic.in, joinindianarmy.nic.in, ssc.gov.in, rrbapply.gov.in) and a "Visit Official Portal" link. We recommend reviewing the PDF notification on the authority\'s server before submission.'
            },
            {
              q: 'Can I apply online through the CSC DOST desk or do I have to visit in person?',
              a: 'You can do both. You can use our "Apply Online" desk to upload your documents, generate a reference tracking token, and have our authorized operators process your application. You can also visit our physical center at Sangran Qazigund for biometric authentication.'
            },
            {
              q: 'What should I do if my payment was deducted on an official exam portal but the receipt failed?',
              a: 'Bank reconciliations typically take 24 to 48 hours. Avoid paying twice immediately. Log in to the official portal to check "Re-verify Payment" or contact our helpdesk with your bank UTR number for verification.'
            },
            {
              q: 'What documents are typically needed for Aadhaar updates or new PAN cards?',
              a: 'For Aadhaar updates, UIDAI accepts valid Proof of Identity (PoI) and Proof of Address (PoA) such as Voter ID, electricity bill, bank passbook with photo seal, or Domicile. For new PAN applications, Aadhaar OTP verification allows paperless e-PAN generation within hours.'
            }
          ].map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B57D0]"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-bold text-[#172033] leading-snug">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#0B57D0] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#5F6B7A] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-[#5F6B7A] leading-relaxed border-t border-[#E3E8EF] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
