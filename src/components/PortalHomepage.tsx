import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  Briefcase,
  CreditCard,
  Fingerprint,
  FileText,
  ExternalLink,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
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
  Building2,
  Landmark,
  Laptop,
  FileSearch,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { SARKARI_DATA, SARKARI_CATEGORIES, SarkariItem } from '../data/sarkariData';
import { SERVICES_LIST, ServiceItem } from '../servicesData';
import { GUIDE_ARTICLES } from './GuidesKnowledgeHub';
import { TOOLS_LIST } from './tools/toolsData';
import CitizenToolsDesk from './CitizenToolsDesk';

interface PortalHomepageProps {
  onOpenJob: (item: SarkariItem) => void;
  onOpenService: (item: ServiceItem) => void;
  onApplyService: (serviceName: string) => void;
  onOpenGuide?: (guideId: string) => void;
  onOpenTrack?: () => void;
  onOpenLegal?: (tab: 'privacy' | 'terms' | 'disclaimer') => void;
}

export type JobDeadlineStatus = {
  code: 'open' | 'closing_soon' | 'closed' | 'check_notice';
  label: 'Open' | 'Closing Soon' | 'Closed' | 'Check Notice';
  daysRemaining: number | null;
};

/**
 * Computes deadline status strictly from item.lastDate (DD/MM/YYYY) against Asia/Kolkata current date.
 * Date-only deadlines are treated as inclusive of the closing date (through 23:59:59 IST).
 */
export function computeJobDeadlineStatus(lastDateStr?: string): JobDeadlineStatus {
  if (!lastDateStr || typeof lastDateStr !== 'string') {
    return { code: 'check_notice', label: 'Check Notice', daysRemaining: null };
  }

  // Extract first DD/MM/YYYY or DD-MM-YYYY pattern if present
  const match = lastDateStr.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!match) {
    return { code: 'check_notice', label: 'Check Notice', daysRemaining: null };
  }

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000 || year > 2100) {
    return { code: 'check_notice', label: 'Check Notice', daysRemaining: null };
  }

  // Get today's YYYY-MM-DD in Asia/Kolkata timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(new Date());
  const curYear = parseInt(parts.find((p) => p.type === 'year')?.value || '2026', 10);
  const curMonth = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10);
  const curDay = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);

  const todayUtcMs = Date.UTC(curYear, curMonth - 1, curDay);
  const deadlineUtcMs = Date.UTC(year, month - 1, day);

  const diffDays = Math.floor((deadlineUtcMs - todayUtcMs) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { code: 'closed', label: 'Closed', daysRemaining: diffDays };
  }
  if (diffDays <= 7) {
    return { code: 'closing_soon', label: 'Closing Soon', daysRemaining: diffDays };
  }
  return { code: 'open', label: 'Open', daysRemaining: diffDays };
}

function getRecruitingOrganisation(item: SarkariItem): string {
  switch (item.category) {
    case 'jkssb':
      return 'J&K Services Selection Board (JKSSB)';
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
      return SARKARI_CATEGORIES[item.category]?.label || 'Public Notice';
  }
}

function getShortQualification(eligibility?: string): string | null {
  if (!eligibility || !eligibility.trim()) return null;
  const cleaned = eligibility.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 72) return cleaned;
  return `${cleaned.slice(0, 70).trim()}…`;
}

export default function PortalHomepage({
  onOpenJob,
  onOpenService,
  onApplyService,
  onOpenGuide,
  onOpenTrack,
}: PortalHomepageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobOrgFilter, setJobOrgFilter] = useState<string>('all');
  const [jobStatusFilter, setJobStatusFilter] = useState<'active' | 'all' | 'closed'>('active');
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [showAllEducation, setShowAllEducation] = useState(false);

  // Listen for search focus event and keyboard shortcuts (Ctrl+K, /, Escape)
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
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && !isInput) {
        e.preventDefault();
        handleFocusSearch();
      } else if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };

    window.addEventListener('focus-csc-search', handleFocusSearch);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('focus-csc-search', handleFocusSearch);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchQuery]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectServiceDirectoryCategory = (categoryKey: string) => {
    window.dispatchEvent(
      new CustomEvent('select-service-directory-category', { detail: { category: categoryKey } })
    );
    scrollToSection('services');
  };

  // Global search matching across services, jobs, schemes/guides, and tools
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedServices = SERVICES_LIST.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    ).slice(0, 6);

    const matchedJobs = SARKARI_DATA.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.shortInfo.toLowerCase().includes(q) ||
        (j.eligibility && j.eligibility.toLowerCase().includes(q)) ||
        j.category.toLowerCase().includes(q)
    ).slice(0, 6);

    const matchedGuides = GUIDE_ARTICLES.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedTools = TOOLS_LIST.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q))
    ).slice(0, 4);

    return {
      services: matchedServices,
      jobs: matchedJobs,
      guides: matchedGuides,
      tools: matchedTools,
      total:
        matchedServices.length +
        matchedJobs.length +
        matchedGuides.length +
        matchedTools.length,
    };
  }, [searchQuery]);

  // 6 Popular Services mapped directly to existing service records
  const popularServices = useMemo(() => {
    const findSvc = (id: string, fallbackIdx: number) =>
      SERVICES_LIST.find((s) => s.id === id) || SERVICES_LIST[fallbackIdx];

    return [
      {
        title: 'PAN Card Services',
        shortDescription: 'New PAN application, corrections, and Aadhaar e-KYC assistance.',
        icon: CreditCard,
        service: findSvc('csc-pan', 0),
      },
      {
        title: 'Aadhaar Assistance',
        shortDescription: 'Address updates, demographic corrections, and PVC card requests.',
        icon: Fingerprint,
        service: findSvc('csc-aadhaar', 1),
      },
      {
        title: 'J&K Domicile & Certificates',
        shortDescription: 'Domicile, Income, Caste, RBA, and Revenue certificate applications.',
        icon: FileText,
        service: findSvc('jk-domicile-cert', 5),
      },
      {
        title: 'Job Application Assistance',
        shortDescription: 'Online form filling, photo/signature resizing, and admit card downloads.',
        icon: Briefcase,
        service: findSvc('edu-exams', 14),
      },
      {
        title: 'Ayushman Card Assistance',
        shortDescription: 'PM-JAY & SEHAT Golden Card registration and family KYC verification.',
        icon: ShieldCheck,
        service: findSvc('csc-ayushman', 3),
      },
      {
        title: 'Passport Application Assistance',
        shortDescription: 'Fresh passport filing, renewal support, and PSK slot booking.',
        icon: Compass,
        service: findSvc('csc-passport', 7),
      },
    ];
  }, []);

  // Jobs with computed real deadline status
  const jobsWithStatus = useMemo(() => {
    return SARKARI_DATA.map((item) => ({
      item,
      status: computeJobDeadlineStatus(item.lastDate),
      organisation: getRecruitingOrganisation(item),
      qualification: getShortQualification(item.eligibility),
    }));
  }, []);

  // Filtered and prioritized recruitment notices
  const filteredJobs = useMemo(() => {
    const orgFiltered = jobsWithStatus.filter(({ item }) => {
      if (jobOrgFilter === 'all') return true;
      if (jobOrgFilter === 'universities') {
        return (
          item.category === 'cluster_univ' ||
          item.category === 'exam_forms' ||
          item.category === 'admissions'
        );
      }
      return item.category === jobOrgFilter;
    });

    const statusFiltered = orgFiltered.filter(({ status }) => {
      if (jobStatusFilter === 'active') {
        return status.code === 'open' || status.code === 'closing_soon' || status.code === 'check_notice';
      }
      if (jobStatusFilter === 'closed') {
        return status.code === 'closed';
      }
      return true;
    });

    // Fallback to all orgFiltered if no active notices exist for a filter
    const listToSort = statusFiltered.length > 0 ? statusFiltered : orgFiltered;

    const priorityMap: Record<JobDeadlineStatus['code'], number> = {
      closing_soon: 1,
      open: 2,
      check_notice: 3,
      closed: 4,
    };

    return [...listToSort].sort((a, b) => {
      const pDiff = priorityMap[a.status.code] - priorityMap[b.status.code];
      if (pDiff !== 0) return pDiff;
      return 0;
    });
  }, [jobsWithStatus, jobOrgFilter, jobStatusFilter]);

  const displayedJobs = showAllJobs ? filteredJobs : filteredJobs.slice(0, 6);

  // Education updates (University of Kashmir & Cluster University)
  const educationUpdates = useMemo(() => {
    const eduList = jobsWithStatus.filter(
      ({ item }) =>
        item.category === 'cluster_univ' ||
        item.category === 'exam_forms' ||
        item.category === 'admissions'
    );
    return showAllEducation ? eduList : eduList.slice(0, 3);
  }, [jobsWithStatus, showAllEducation]);

  // 7 Service Directory Category Previews with real counts from SERVICES_LIST
  const directoryCategories = useMemo(() => {
    const countByFilter = (predicate: (s: ServiceItem) => boolean) =>
      SERVICES_LIST.filter(predicate).length;

    return [
      {
        id: 'identity',
        title: 'Identity & Documents',
        description: 'PAN Card, Aadhaar updates, Voter ID, Passport, and Driving Licence services.',
        icon: CreditCard,
        count: countByFilter(
          (s) =>
            s.category === 'cards_adda' ||
            ['csc-pan', 'csc-aadhaar', 'csc-voter', 'csc-passport', 'csc-dl', 'csc-ration'].includes(s.id)
        ),
      },
      {
        id: 'jk_revenue',
        title: 'J&K Certificates & Revenue',
        description: 'Domicile, Income, RBA/OBC/SC/ST certificates, Jamabandi, Fard, and Mutations.',
        icon: Landmark,
        count: countByFilter(
          (s) => s.category === 'revenue' || s.category === 'jk_state' || s.id === 'csc-certificates'
        ),
      },
      {
        id: 'jobs_assistance',
        title: 'Jobs & Application Assistance',
        description: 'JKSSB, SSC, Army & Railway online forms, admit cards, and document formatting.',
        icon: Briefcase,
        count: countByFilter((s) => ['edu-exams', 'dig-form', 'dig-photo'].includes(s.id)),
      },
      {
        id: 'education',
        title: 'Education & Scholarships',
        description: 'NSP & State scholarships, college admissions, IGNOU forms, and exam registrations.',
        icon: GraduationCap,
        count: countByFilter((s) => s.category === 'education'),
      },
      {
        id: 'welfare',
        title: 'Welfare & Health',
        description: 'Ayushman Bharat Golden Card, PM-KISAN e-KYC, e-Shram, and pension schemes.',
        icon: ShieldCheck,
        count: countByFilter((s) =>
          ['csc-ayushman', 'csc-pmkisan', 'csc-eshram'].includes(s.id) ||
          s.name.toLowerCase().includes('pension') ||
          s.name.toLowerCase().includes('welfare')
        ),
      },
      {
        id: 'business',
        title: 'Business & Tax',
        description: 'UDYAM MSME registration, GST assistance, and Class-3 Digital Signature (DSC).',
        icon: Building2,
        count: countByFilter((s) => s.category === 'business'),
      },
      {
        id: 'digital',
        title: 'Digital & Printing Services',
        description: 'Document scanning, PDF formatting, passport photo printing, and utility bills.',
        icon: Laptop,
        count: countByFilter((s) => s.category === 'digital' || s.id === 'csc-utility'),
      },
    ];
  }, []);

  // 4 Useful Online Tools Preview
  const previewTools = useMemo(() => {
    return TOOLS_LIST.slice(0, 4);
  }, []);

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Minimize2':
        return Minimize2;
      case 'Crop':
        return Crop;
      case 'FileImage':
        return FileImage;
      case 'FileDown':
        return FileDown;
      case 'Files':
        return Files;
      case 'Split':
        return Split;
      case 'FileArchive':
        return FileArchive;
      case 'Scissors':
        return Scissors;
      case 'Camera':
        return Camera;
      case 'Signature':
        return PenTool;
      case 'RefreshCw':
        return RefreshCw;
      default:
        return Wrench;
    }
  };

  const renderStatusBadge = (status: JobDeadlineStatus) => {
    if (status.code === 'open') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" aria-hidden="true" />
          <span>Open</span>
        </span>
      );
    }
    if (status.code === 'closing_soon') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" aria-hidden="true" />
          <span>Closing Soon</span>
        </span>
      );
    }
    if (status.code === 'closed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-[#64748B] border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" aria-hidden="true" />
          <span>Closed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" aria-hidden="true" />
        <span>Check Notice</span>
      </span>
    );
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-8 w-full max-w-7xl mx-auto px-4 sm:px-6">
      {/* ==================================================================== */}
      {/* 1. SHORTENED, ACTION-FOCUSED HERO SECTION */}
      {/* ==================================================================== */}
      <section
        aria-labelledby="hero-heading"
        className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 shadow-2xs mt-2 sm:mt-4"
      >
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h1
            id="hero-heading"
            className="text-2xl sm:text-4xl font-extrabold text-[#102A43] tracking-tight leading-tight"
          >
            Online Services, Job Updates &amp; Application Assistance
          </h1>

          <p className="text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Find citizen services, explore recruitment updates and get help with online applications—all in one place.
          </p>

          {/* Prominent Search Field */}
          <div className="max-w-2xl mx-auto pt-1">
            <label htmlFor="portal-universal-search" className="sr-only">
              Search services, jobs, schemes or guides
            </label>
            <div className="relative">
              <Search
                className="w-5 h-5 text-[#64748B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="portal-universal-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, jobs, schemes or guides…"
                className="w-full pl-12 pr-24 py-3.5 bg-[#F6F8FC] focus:bg-white border border-[#E2E8F0] focus:border-[#2563EB] rounded-xl text-sm text-[#102A43] placeholder-[#64748B] focus:outline-none focus:ring-3 focus:ring-[#2563EB]/15 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#64748B] hover:text-[#102A43] px-2.5 py-1 bg-white border border-[#E2E8F0] rounded-lg transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* 5 Quick Shortcuts Below Search */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs">
              <span className="text-[#64748B] font-medium">Quick shortcuts:</span>
              <button
                type="button"
                onClick={() => {
                  setJobOrgFilter('jkssb');
                  scrollToSection('recruitment-section');
                }}
                className="px-2.5 py-1 bg-[#F6F8FC] hover:bg-blue-50 text-[#102A43] hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg font-medium transition-colors cursor-pointer"
              >
                JKSSB
              </button>
              <button
                type="button"
                onClick={() => {
                  const panSvc = SERVICES_LIST.find((s) => s.id === 'csc-pan');
                  if (panSvc) onOpenService(panSvc);
                }}
                className="px-2.5 py-1 bg-[#F6F8FC] hover:bg-blue-50 text-[#102A43] hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg font-medium transition-colors cursor-pointer"
              >
                PAN Card
              </button>
              <button
                type="button"
                onClick={() => {
                  const domSvc = SERVICES_LIST.find((s) => s.id === 'jk-domicile-cert');
                  if (domSvc) onOpenService(domSvc);
                }}
                className="px-2.5 py-1 bg-[#F6F8FC] hover:bg-blue-50 text-[#102A43] hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg font-medium transition-colors cursor-pointer"
              >
                Domicile
              </button>
              <button
                type="button"
                onClick={() => {
                  const schSvc = SERVICES_LIST.find((s) => s.id === 'edu-scholarship');
                  if (schSvc) onOpenService(schSvc);
                }}
                className="px-2.5 py-1 bg-[#F6F8FC] hover:bg-blue-50 text-[#102A43] hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg font-medium transition-colors cursor-pointer"
              >
                Scholarships
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#tools';
                }}
                className="px-2.5 py-1 bg-[#F6F8FC] hover:bg-blue-50 text-[#102A43] hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg font-medium transition-colors cursor-pointer"
              >
                Image Tools
              </button>
            </div>
          </div>

          {/* Two Main Hero Actions: Explore Services (Primary) & Track Application (Secondary) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => scrollToSection('popular-services')}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenTrack) onOpenTrack();
                else window.location.hash = '#track';
              }}
              className="px-5 py-2.5 bg-white hover:bg-[#F6F8FC] text-[#102A43] border border-[#E2E8F0] text-sm font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <FileSearch className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
              <span>Track Application</span>
            </button>
          </div>
        </div>

        {/* Live Search Results Panel */}
        {searchResults && (
          <div
            role="region"
            aria-label="Search Results"
            className="mt-6 pt-6 border-t border-[#E2E8F0] max-w-4xl mx-auto space-y-5 text-left"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#102A43]">
                Search Results for &ldquo;{searchQuery}&rdquo; ({searchResults.total} found)
              </h2>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                Close Search
              </button>
            </div>

            {searchResults.total === 0 ? (
              <div className="bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl p-6 text-center space-y-2">
                <p className="text-sm font-semibold text-[#102A43]">
                  No matching services, jobs, schemes or tools found.
                </p>
                <p className="text-xs text-[#64748B]">
                  Try searching for keywords like &ldquo;PAN Card&rdquo;, &ldquo;Domicile&rdquo;, &ldquo;JKSSB&rdquo;, &ldquo;PM-KISAN&rdquo;, or &ldquo;Compress&rdquo;.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {searchResults.services.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Citizen Services
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {searchResults.services.map((svc) => (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => onOpenService(svc)}
                          className="p-3.5 text-left bg-[#F6F8FC] hover:bg-blue-50/60 border border-[#E2E8F0] hover:border-[#2563EB] rounded-xl transition-colors flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div>
                            <div className="text-sm font-bold text-[#102A43]">{svc.name}</div>
                            <p className="text-xs text-[#64748B] line-clamp-1 mt-0.5">
                              {svc.description}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#2563EB] shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.jobs.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Jobs &amp; Recruitment Notices
                    </h3>
                    <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl bg-white">
                      {searchResults.jobs.map((job) => {
                        const st = computeJobDeadlineStatus(job.lastDate);
                        return (
                          <button
                            key={job.id}
                            type="button"
                            onClick={() => onOpenJob(job)}
                            className="w-full p-3.5 text-left hover:bg-[#F6F8FC] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                                <span className="font-semibold text-[#102A43]">
                                  {getRecruitingOrganisation(job)}
                                </span>
                                {job.lastDate && <span>• Closing: {job.lastDate}</span>}
                                {renderStatusBadge(st)}
                              </div>
                              <div className="text-sm font-bold text-[#102A43] line-clamp-1">
                                {job.title}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#2563EB] shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {searchResults.guides.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Scheme &amp; Citizen Guides
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {searchResults.guides.map((guide) => (
                        <button
                          key={guide.id}
                          type="button"
                          onClick={() => {
                            if (onOpenGuide) onOpenGuide(guide.id);
                            else scrollToSection('knowledge-hub');
                          }}
                          className="p-3.5 text-left bg-[#F6F8FC] hover:bg-blue-50/60 border border-[#E2E8F0] hover:border-[#2563EB] rounded-xl transition-colors flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div>
                            <div className="text-sm font-bold text-[#102A43] line-clamp-1">
                              {guide.title}
                            </div>
                            <p className="text-xs text-[#64748B] line-clamp-1 mt-0.5">
                              {guide.summary}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#2563EB] shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.tools.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Online Document Tools
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {searchResults.tools.map((tool) => (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => {
                            window.location.hash = `#tools/${tool.id}`;
                          }}
                          className="p-3.5 text-left bg-[#F6F8FC] hover:bg-blue-50/60 border border-[#E2E8F0] hover:border-[#2563EB] rounded-xl transition-colors flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div>
                            <div className="text-sm font-bold text-[#102A43]">{tool.name}</div>
                            <p className="text-xs text-[#64748B] line-clamp-1 mt-0.5">
                              {tool.shortDescription}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#2563EB] shrink-0" />
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
      {/* 1. PUBLIC RECRUITMENTS — LATEST RECRUITMENT & EXAM NOTICES */}
      {/* ==================================================================== */}
      <section
        id="recruitment-section"
        aria-labelledby="recruitment-heading"
        className="space-y-5 scroll-mt-20"
      >
        <div id="sarkari-board" className="scroll-mt-20" />
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
              <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Public Recruitments</span>
            </div>
            <h2
              id="recruitment-heading"
              className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight"
            >
              Latest Recruitment &amp; Exam Notices
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Verified recruitment updates from JKSSB, Indian Army, SSC, Railway RRB, and state universities.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {filteredJobs.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllJobs((prev) => !prev)}
                className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>
                  {showAllJobs ? 'Show Compact List (6)' : `View All Jobs (${filteredJobs.length})`}
                </span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls: Organisation + Status Filter (Open vs All/Closed) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Filter jobs by organisation"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-medium"
          >
            {[
              { id: 'all', label: 'All Organisations' },
              { id: 'jkssb', label: 'JKSSB' },
              { id: 'army_jobs', label: 'Indian Army' },
              { id: 'ssc_jobs', label: 'SSC' },
              { id: 'rrb_jobs', label: 'Railway RRB' },
              { id: 'universities', label: 'Universities' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={jobOrgFilter === tab.id}
                onClick={() => {
                  setJobOrgFilter(tab.id);
                  setShowAllJobs(false);
                }}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer border ${
                  jobOrgFilter === tab.id
                    ? 'bg-[#2563EB] text-white border-[#2563EB] font-semibold'
                    : 'bg-white text-[#102A43] border-[#E2E8F0] hover:bg-[#F6F8FC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#64748B] font-medium mr-1">Status:</span>
            {[
              { id: 'active', label: 'Open & Active' },
              { id: 'all', label: 'All Notices' },
              { id: 'closed', label: 'Closed Archive' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setJobStatusFilter(st.id as 'active' | 'all' | 'closed');
                  setShowAllJobs(false);
                }}
                className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  jobStatusFilter === st.id
                    ? 'bg-[#102A43] text-white border-[#102A43] font-semibold'
                    : 'bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#102A43]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Compact Table View */}
        <div className="hidden md:block bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6F8FC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                <th className="py-3.5 px-5">Recruitment / Notice</th>
                <th className="py-3.5 px-4">Organisation</th>
                <th className="py-3.5 px-4">Closing Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-sm">
              {displayedJobs.map(({ item, status, organisation, qualification }) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#F6F8FC]/80 transition-colors"
                >
                  <td className="py-4 px-5 max-w-md">
                    <button
                      type="button"
                      onClick={() => onOpenJob(item)}
                      className="text-left font-bold text-[#102A43] hover:text-[#2563EB] transition-colors leading-snug cursor-pointer block"
                    >
                      {item.title}
                    </button>
                    {qualification && (
                      <p className="text-xs text-[#64748B] mt-1">
                        <span className="font-medium text-[#102A43]">Qualification:</span>{' '}
                        {qualification}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold text-[#102A43] whitespace-nowrap">
                    {organisation}
                  </td>
                  <td className="py-4 px-4 text-xs text-[#102A43] whitespace-nowrap font-medium">
                    {item.lastDate || 'See Notice'}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">{renderStatusBadge(status)}</td>
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-3">
                      {item.officialLink && (
                        <a
                          href={item.officialLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-[#64748B] hover:text-[#102A43] inline-flex items-center gap-1"
                          title="Official Source Portal"
                        >
                          <span>Official Link</span>
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenJob(item)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-[#2563EB] text-[#2563EB] hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards View */}
        <div className="md:hidden space-y-3">
          {displayedJobs.map(({ item, status, organisation, qualification }) => (
            <article
              key={item.id}
              className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#2563EB]">{organisation}</span>
                {renderStatusBadge(status)}
              </div>

              <h3 className="text-sm font-bold text-[#102A43] leading-snug">
                <button
                  type="button"
                  onClick={() => onOpenJob(item)}
                  className="text-left hover:text-[#2563EB] cursor-pointer"
                >
                  {item.title}
                </button>
              </h3>

              {qualification && (
                <p className="text-xs text-[#64748B]">
                  <span className="font-semibold text-[#102A43]">Qualification:</span>{' '}
                  {qualification}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
                <span>
                  Closing Date:{' '}
                  <strong className="text-[#102A43]">{item.lastDate || 'See Notice'}</strong>
                </span>

                <div className="flex items-center gap-3">
                  {item.officialLink && (
                    <a
                      href={item.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#64748B] hover:text-[#102A43] inline-flex items-center gap-1"
                    >
                      <span>Official</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => onOpenJob(item)}
                    className="font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredJobs.length > 6 && (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setShowAllJobs((prev) => !prev)}
              className="px-5 py-2.5 bg-white hover:bg-[#F6F8FC] text-[#102A43] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <span>
                {showAllJobs
                  ? 'Show Fewer Notices'
                  : `View All ${filteredJobs.length} Recruitment Notices`}
              </span>
              <ArrowRight className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
            </button>
          </div>
        )}
      </section>

      {/* ==================================================================== */}
      {/* 2. FAST, SIMPLE & SECURE DOCUMENT TOOLS */}
      {/* ==================================================================== */}
      <section
        id="tools-preview"
        aria-labelledby="tools-preview-heading"
        className="space-y-4 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
              <Wrench className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Online Document Suite</span>
            </div>
            <h2
              id="tools-preview-heading"
              className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight"
            >
              Fast, Simple &amp; Secure Document Tools
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Resize photos, compress images to 20KB–50KB, and format PDFs directly in your browser.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#tools';
            }}
            className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All Tools ({TOOLS_LIST.length})</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {previewTools.map((tool) => {
            const ToolIcon = getToolIcon(tool.iconName);
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  window.location.hash = `#tools/${tool.id}`;
                }}
                className="text-left bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-5 flex flex-col justify-between transition-colors shadow-2xs group cursor-pointer"
              >
                <div className="space-y-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                    <ToolIcon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-bold text-[#102A43] group-hover:text-[#2563EB] transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                    {tool.shortDescription}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-[#2563EB]">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. HIGHER EDUCATION & ADMISSIONS — EDUCATION & LEARNING RESOURCES */}
      {/* ==================================================================== */}
      <section
        id="education-resources"
        aria-labelledby="education-heading"
        className="space-y-4 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
              <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Higher Education &amp; Admissions</span>
            </div>
            <h2
              id="education-heading"
              className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight"
            >
              Education &amp; Learning Resources
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Admission notices, examination forms, and academic updates from Kashmir University and Cluster University.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAllEducation((prev) => !prev)}
            className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>{showAllEducation ? 'Show 3 Previews' : 'View All Education Notices'}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {educationUpdates.map(({ item, status, organisation }) => (
            <article
              key={item.id}
              className="bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-5 flex flex-col justify-between transition-colors shadow-2xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#2563EB]">{organisation}</span>
                  {renderStatusBadge(status)}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#102A43] line-clamp-2 leading-snug">
                  <button
                    type="button"
                    onClick={() => onOpenJob(item)}
                    className="text-left hover:text-[#2563EB] cursor-pointer"
                  >
                    {item.title}
                  </button>
                </h3>
                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  {item.shortInfo}
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                <span className="text-[#64748B]">
                  Closing: <strong className="text-[#102A43]">{item.lastDate || 'See Notice'}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => onOpenJob(item)}
                  className="font-semibold text-[#2563EB] hover:underline cursor-pointer"
                >
                  View Notice →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. ESSENTIAL CITIZEN E-SERVICES */}
      {/* ==================================================================== */}
      <section
        id="popular-services"
        aria-labelledby="popular-services-heading"
        className="space-y-5 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Citizen Service Desk</span>
            </div>
            <h2
              id="popular-services-heading"
              className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight"
            >
              Essential Citizen E-Services
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Frequently requested identity, certificate, and application assistance services.
            </p>
          </div>
          <button
            type="button"
            onClick={() => scrollToSection('services')}
            className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularServices.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-5 flex flex-col justify-between transition-colors shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-[#102A43] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    {item.shortDescription}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (item.service) onOpenService(item.service);
                    }}
                    className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View Service</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Organised Service Directory Category Previews */}
      <section
        id="service-directory-preview"
        aria-labelledby="directory-preview-heading"
        className="space-y-5 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <h2
              id="directory-preview-heading"
              className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight"
            >
              Browse Services by Category
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Explore our complete directory of {SERVICES_LIST.length} citizen services organised into clear categories.
            </p>
          </div>
          <button
            type="button"
            onClick={() => selectServiceDirectoryCategory('all')}
            className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Open Full Directory</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {directoryCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectServiceDirectoryCategory(cat.id)}
                className="text-left bg-white border border-[#E2E8F0] hover:border-[#2563EB] rounded-2xl p-5 flex flex-col justify-between transition-colors shadow-2xs group cursor-pointer"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold text-[#64748B] bg-[#F6F8FC] border border-[#E2E8F0] px-2.5 py-0.5 rounded-full">
                      {cat.count} services
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#102A43] group-hover:text-[#2563EB] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">{cat.description}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-[#2563EB]">
                  <span>Browse Category</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Government Schemes Preview (3 items + View All) */}
      <section
        id="schemes-section"
        aria-labelledby="schemes-heading"
        className="space-y-4 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <h2
              id="schemes-heading"
              className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight"
            >
              Government Schemes &amp; Citizen Benefits
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Key welfare schemes, eligibility guides, and direct official portal links.
            </p>
          </div>
          <button
            type="button"
            onClick={() => scrollToSection('knowledge-hub')}
            className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All Guides &amp; Schemes</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
            <div className="space-y-2.5">
              <span className="inline-block text-xs font-semibold text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Farmer Income Support
              </span>
              <h3 className="text-base font-bold text-[#102A43]">
                PM Kisan Samman Nidhi (₹6,000/Year)
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Direct Benefit Transfer of ₹2,000 every four months for eligible landholding किसान families. Requires active e-KYC and Aadhaar-seeded bank account.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (onOpenGuide) onOpenGuide('pm-kisan-ekyc-status-guide-2026');
                  else scrollToSection('knowledge-hub');
                }}
                className="font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                Read e-KYC Guide →
              </button>
              <a
                href="https://pmkisan.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#64748B] hover:text-[#102A43] inline-flex items-center gap-1"
              >
                <span>pmkisan.gov.in</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
          </article>

          <article className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
            <div className="space-y-2.5">
              <span className="inline-block text-xs font-semibold text-[#2563EB] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                Healthcare Assurance
              </span>
              <h3 className="text-base font-bold text-[#102A43]">
                Ayushman Bharat PM-JAY &amp; SEHAT
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Cashless hospitalisation coverage up to ₹5,00,000 per family per year across empaneled hospitals, including universal coverage for J&amp;K residents.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  const ayushmanSvc = SERVICES_LIST.find((s) => s.id === 'csc-ayushman');
                  if (ayushmanSvc) onOpenService(ayushmanSvc);
                }}
                className="font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                Request Card Assistance →
              </button>
              <a
                href="https://beneficiary.nha.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#64748B] hover:text-[#102A43] inline-flex items-center gap-1"
              >
                <span>nha.gov.in</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
          </article>

          <article className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
            <div className="space-y-2.5">
              <span className="inline-block text-xs font-semibold text-[#102A43] bg-[#F6F8FC] border border-[#E2E8F0] px-2.5 py-0.5 rounded-full">
                Social Security &amp; Labour
              </span>
              <h3 className="text-base font-bold text-[#102A43]">
                e-Shram &amp; Social Welfare Pensions
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Registration for unorganised sector workers, old-age/widow/disability pension schemes (ISSS), and marriage assistance in Jammu &amp; Kashmir.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  const eshramSvc = SERVICES_LIST.find((s) => s.id === 'csc-eshram');
                  if (eshramSvc) onOpenService(eshramSvc);
                }}
                className="font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                View Service Details →
              </button>
              <a
                href="https://eshram.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#64748B] hover:text-[#102A43] inline-flex items-center gap-1"
              >
                <span>eshram.gov.in</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
      </section>

      {/* Simple 3-Step "How It Works" Section */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs"
      >
        <div className="max-w-2xl">
          <h2
            id="how-it-works-heading"
            className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight"
          >
            How Online Service Assistance Works
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Requesting help with an application or certificate through CSC DOST takes three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-[#F6F8FC] border border-[#E2E8F0] space-y-2">
            <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#2563EB] text-white text-xs font-bold">
              1
            </div>
            <h3 className="text-base font-bold text-[#102A43]">Choose a service</h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Select the citizen service, certificate, or recruitment form you need and review the required documents and fee details.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#F6F8FC] border border-[#E2E8F0] space-y-2">
            <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#2563EB] text-white text-xs font-bold">
              2
            </div>
            <h3 className="text-base font-bold text-[#102A43]">
              Review requirements and submit your request
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Enter your basic applicant details, upload clear scans of required documents, and submit your assistance request online.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#F6F8FC] border border-[#E2E8F0] space-y-2">
            <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#2563EB] text-white text-xs font-bold">
              3
            </div>
            <h3 className="text-base font-bold text-[#102A43]">
              Track your request and receive assistance
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Save your CSC DOST reference token to track progress as our operator verifies your documents and assists with your filing.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-[#102A43]">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong>Please note:</strong> Submitting a request on CSC DOST initiates application preparation and operator assistance at our centre. Final verification, approval, and certificate issuance are performed by the respective official government department or recruiting authority.
          </p>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. DIGITAL TOOLS & CITIZEN CALCULATORS */}
      {/* ==================================================================== */}
      <CitizenToolsDesk onApplyService={onApplyService} />
    </div>
  );
}
