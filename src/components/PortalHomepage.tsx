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
import { SERVICES_LIST, CATEGORY_LABELS, ServiceItem } from '../servicesData';
import { GUIDE_ARTICLES } from './GuidesKnowledgeHub';
import { TOOLS_LIST } from './tools/toolsData';
import CitizenToolsDesk from './CitizenToolsDesk';
import { ColourAccentCard } from './shared/ContentDesignSystem';

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

function renderStatusBadge(status: JobDeadlineStatus) {
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

  // Jobs with computed real deadline status and content type badge (Job vs Admission)
  const jobsWithStatus = useMemo(() => {
    return SARKARI_DATA.map((item) => {
      const isAdmission =
        item.category === 'cluster_univ' ||
        item.category === 'exam_forms' ||
        item.category === 'admissions' ||
        item.category === 'nta';
      return {
        item,
        isAdmission,
        contentTypeLabel: isAdmission ? ('Admission' as const) : ('Job' as const),
        status: computeJobDeadlineStatus(item.lastDate),
        organisation: getRecruitingOrganisation(item),
        qualification: getShortQualification(item.eligibility),
      };
    });
  }, []);

  // Mixed-Content "Latest Updates" feed (Jobs, Admissions, Schemes, Services, Guides)
  const mixedLatestUpdates = useMemo(() => {
    const topJobs = jobsWithStatus
      .filter((j) => !j.isAdmission)
      .slice(0, 3)
      .map((j) => ({
        id: `job-${j.item.id}`,
        categoryType: 'job' as const,
        categoryBadge: 'Job',
        organisation: j.organisation,
        title: j.item.title,
        summaryField: j.item.shortInfo,
        metadataLine: j.qualification ? `Qualification: ${j.qualification}` : undefined,
        dateOrMeta: j.item.lastDate ? `Closing: ${j.item.lastDate}` : `Published: ${j.item.postDate}`,
        statusBadge: renderStatusBadge(j.status),
        officialHref: j.item.officialLink,
        actionLabel: 'View Details →',
        onOpen: () => onOpenJob(j.item),
      }));

    const topAdmissions = jobsWithStatus
      .filter((j) => j.isAdmission)
      .slice(0, 2)
      .map((j) => ({
        id: `adm-${j.item.id}`,
        categoryType: 'admission' as const,
        categoryBadge: 'Admission',
        organisation: j.organisation,
        title: j.item.title,
        summaryField: j.item.shortInfo,
        metadataLine: j.qualification ? `Qualification: ${j.qualification}` : undefined,
        dateOrMeta: j.item.lastDate ? `Closing: ${j.item.lastDate}` : `Published: ${j.item.postDate}`,
        statusBadge: renderStatusBadge(j.status),
        officialHref: j.item.officialLink,
        actionLabel: 'View Details →',
        onOpen: () => onOpenJob(j.item),
      }));

    const topSchemes = GUIDE_ARTICLES.filter((g) => g.category === 'Central Scheme')
      .slice(0, 2)
      .map((scheme) => ({
        id: `sch-${scheme.id}`,
        categoryType: 'scheme' as const,
        categoryBadge: 'Scheme',
        organisation: scheme.responsibleDepartment || scheme.officialPortal,
        title: scheme.title,
        summaryField: scheme.summary,
        metadataLine: scheme.benefitSummary ? `Benefit: ${scheme.benefitSummary}` : undefined,
        dateOrMeta: scheme.lastUpdated ? `Updated: ${scheme.lastUpdated}` : undefined,
        statusBadge: undefined,
        officialHref: scheme.officialUrl,
        actionLabel: 'Explore Scheme →',
        onOpen: () => {
          if (onOpenGuide) onOpenGuide(scheme.id);
          else scrollToSection('knowledge-hub');
        },
      }));

    const topServices = SERVICES_LIST.slice(0, 2).map((svc) => ({
      id: `svc-${svc.id}`,
      categoryType: 'service' as const,
      categoryBadge: 'CSC Service',
      organisation: CATEGORY_LABELS[svc.category] || 'CSC Digital Seva Desk',
      title: svc.name,
      summaryField: svc.description,
      metadataLine: svc.price ? `Fee: ${svc.price}` : undefined,
      dateOrMeta: svc.estimatedTime ? `Est. Time: ${svc.estimatedTime}` : undefined,
      statusBadge: undefined,
      officialHref: undefined,
      actionLabel: 'View Service →',
      onOpen: () => onOpenService(svc),
    }));

    const topGuides = GUIDE_ARTICLES.filter((g) => g.category !== 'Central Scheme')
      .slice(0, 2)
      .map((guide) => ({
        id: `gde-${guide.id}`,
        categoryType: guide.category === 'Education' ? ('admission' as const) : ('guide' as const),
        categoryBadge: guide.category === 'Education' ? 'Admission / Education' : 'Guide',
        organisation: guide.officialPortal,
        title: guide.title,
        summaryField: guide.summary,
        metadataLine: undefined,
        dateOrMeta: `${guide.readTime} · ${guide.lastUpdated}`,
        statusBadge: undefined,
        officialHref: guide.officialUrl,
        actionLabel: 'Read Guide →',
        onOpen: () => {
          if (onOpenGuide) onOpenGuide(guide.id);
          else scrollToSection('knowledge-hub');
        },
      }));

    return [...topJobs, ...topAdmissions, ...topSchemes, ...topServices, ...topGuides];
  }, [jobsWithStatus, onOpenJob, onOpenService, onOpenGuide]);

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

  return (
    <div className="space-y-0 md:space-y-14 pb-0 md:pb-8 w-full max-w-7xl mx-auto px-0 md:px-6">
      {/* ==================================================================== */}
      {/* 1. SHORTENED, ACTION-FOCUSED HERO SECTION */}
      {/* ==================================================================== */}
      <section
        id="hero-heading-section"
        aria-labelledby="hero-heading"
        className="w-full bg-white border-b border-[#E2E8F0] md:border md:rounded-2xl px-4 py-4 sm:p-8 md:p-10 shadow-none md:shadow-2xs mt-0 md:mt-4"
      >
        <div className="max-w-3xl mx-auto text-center space-y-3.5 md:space-y-5">
          <div>
            <h1
              id="hero-heading"
              className="text-2xl sm:text-4xl font-extrabold text-[#102A43] tracking-tight leading-tight"
            >
              Online Services, Job Updates &amp; Application Assistance
            </h1>

            <p className="text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto leading-relaxed mt-1.5 sm:mt-2">
              Find citizen services, explore recruitment updates and get help with online applications—all in one place.
            </p>
          </div>

          {/* Prominent Search Field */}
          <div className="max-w-2xl mx-auto">
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
                className="w-full min-h-[44px] pl-11 pr-20 py-2.5 sm:py-3.5 bg-[#F6F8FC] focus:bg-white border border-[#E2E8F0] focus:border-[#2563EB] rounded-xl text-sm text-[#102A43] placeholder-[#64748B] focus:outline-none focus:ring-3 focus:ring-[#2563EB]/15 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#64748B] hover:text-[#102A43] px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* 5 Quick Shortcuts Below Search */}
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 pt-2.5 text-xs">
              <span className="text-[#64748B] font-medium mr-0.5">Quick shortcuts:</span>
              <button
                type="button"
                onClick={() => {
                  setJobOrgFilter('jkssb');
                  scrollToSection('recruitment-section');
                }}
                className="min-h-[36px] px-2.5 py-1.5 bg-[#F6F8FC] hover:bg-blue-50 text-[#102A43] hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg font-medium transition-colors cursor-pointer"
              >
                JKSSB
              </button>
              <button
                type="button"
                onClick={() => {
                  const panSvc = SERVICES_LIST.find((s) => s.id === 'csc-pan');
                  if (panSvc) onOpenService(panSvc);
                }}
                className="min-h-[36px] px-2.5 py-1.5 bg-[#F6F8FC] hover:bg-blue-50 text-[#102A43] hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg font-medium transition-colors cursor-pointer"
              >
                PAN Card
              </button>
              <button
                type="button"
                onClick={() => {
                  const domSvc = SERVICES_LIST.find((s) => s.id === 'jk-domicile-cert');
                  if (domSvc) onOpenService(domSvc);
                }}
                className="min-h-[36px] px-2.5 py-1.5 bg-[#F6F8FC] hover:bg-blue-50 text-[#102A43] hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg font-medium transition-colors cursor-pointer"
              >
                Domicile
              </button>
              <button
                type="button"
                onClick={() => {
                  const schSvc = SERVICES_LIST.find((s) => s.id === 'edu-scholarship');
                  if (schSvc) onOpenService(schSvc);
                }}
                className="min-h-[36px] px-2.5 py-1.5 bg-[#F6F8FC] hover:bg-blue-50 text-[#102A43] hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg font-medium transition-colors cursor-pointer"
              >
                Scholarships
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#tools';
                }}
                className="min-h-[36px] px-2.5 py-1.5 bg-[#F6F8FC] hover:bg-blue-50 text-[#102A43] hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg font-medium transition-colors cursor-pointer"
              >
                Image Tools
              </button>
            </div>
          </div>

          {/* Two Main Hero Actions: Explore Services (Primary) & Track Application (Secondary) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => scrollToSection('popular-services')}
              className="min-h-[44px] px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-2"
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
              className="min-h-[44px] px-5 py-2.5 bg-white hover:bg-[#F6F8FC] text-[#102A43] border border-[#E2E8F0] text-sm font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
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
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Citizen Services
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {searchResults.services.map((svc) => (
                        <ColourAccentCard
                          key={svc.id}
                          categoryType="service"
                          categoryLabel="CSC Service"
                          organisation={CATEGORY_LABELS[svc.category] || 'CSC Digital Seva Desk'}
                          title={svc.name}
                          summary={svc.description}
                          footerMeta={svc.price ? `Fee: ${svc.price}` : svc.estimatedTime ? `Est: ${svc.estimatedTime}` : undefined}
                          actionLabel="View Service →"
                          onPrimaryClick={() => onOpenService(svc)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.jobs.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Jobs &amp; Recruitment Notices
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {searchResults.jobs.map((job) => {
                        const st = computeJobDeadlineStatus(job.lastDate);
                        const isAdmission =
                          job.category === 'cluster_univ' ||
                          job.category === 'exam_forms' ||
                          job.category === 'admissions' ||
                          job.category === 'nta';
                        return (
                          <ColourAccentCard
                            key={job.id}
                            categoryType={isAdmission ? 'admission' : 'job'}
                            categoryLabel={isAdmission ? 'Admission' : 'Job'}
                            organisation={getRecruitingOrganisation(job)}
                            statusBadge={renderStatusBadge(st)}
                            title={job.title}
                            summary={job.shortInfo}
                            footerMeta={job.lastDate ? `Closing: ${job.lastDate}` : job.postDate ? `Published: ${job.postDate}` : undefined}
                            officialHref={job.officialLink}
                            officialLabel="Official Link"
                            actionLabel="View Details →"
                            onPrimaryClick={() => onOpenJob(job)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {searchResults.guides.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Scheme &amp; Citizen Guides
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {searchResults.guides.map((guide) => {
                        const isScheme = guide.category === 'Central Scheme';
                        return (
                          <ColourAccentCard
                            key={guide.id}
                            categoryType={isScheme ? 'scheme' : guide.category === 'Education' ? 'admission' : 'guide'}
                            categoryLabel={isScheme ? 'Scheme' : guide.category}
                            organisation={guide.responsibleDepartment || guide.officialPortal}
                            title={guide.title}
                            summary={guide.summary}
                            footerMeta={`${guide.readTime} · ${guide.lastUpdated}`}
                            officialHref={guide.officialUrl}
                            officialLabel="Official Portal"
                            actionLabel={isScheme ? 'Explore Scheme →' : 'Read Guide →'}
                            onPrimaryClick={() => {
                              if (onOpenGuide) onOpenGuide(guide.id);
                              else scrollToSection('knowledge-hub');
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {searchResults.tools.length > 0 && (
                  <div className="space-y-2.5">
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
        className="w-full bg-[#F6F8FC] px-3 md:px-0 py-5 md:py-0 space-y-3.5 md:space-y-4 scroll-mt-20"
      >
        <div
          id="sarkari-board"
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 border-b border-[#E2E8F0] pb-3 scroll-mt-20 px-1 md:px-0"
        >
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
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 px-1 md:px-0">
          <div
            role="tablist"
            aria-label="Filter jobs by organisation"
            className="flex flex-wrap sm:flex-nowrap items-center gap-x-1.5 gap-y-2 sm:overflow-x-auto text-xs font-medium"
          >
            {[
              { id: 'all', label: 'All Recruitments' },
              { id: 'latest_mixed', label: 'Latest Updates (All Categories)' },
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
                className={`min-h-[38px] px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer border ${
                  jobOrgFilter === tab.id
                    ? 'bg-[#2563EB] text-white border-[#2563EB] font-semibold'
                    : 'bg-white text-[#102A43] border-[#E2E8F0] hover:bg-[#F6F8FC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {jobOrgFilter !== 'latest_mixed' && (
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-xs">
              <span className="text-[#64748B] font-medium mr-0.5">Status:</span>
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
                  className={`min-h-[36px] px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    jobStatusFilter === st.id
                      ? 'bg-[#102A43] text-white border-[#102A43] font-semibold'
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#102A43]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {jobOrgFilter === 'latest_mixed' ? (
          /* ================================================================ */
          /* MIXED-CONTENT LATEST UPDATES VIEW (Jobs, Admissions, Schemes...) */
          /* ================================================================ */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {mixedLatestUpdates.map((upd) => (
              <ColourAccentCard
                key={upd.id}
                categoryType={upd.categoryType}
                categoryLabel={upd.categoryBadge}
                organisation={upd.organisation}
                statusBadge={upd.statusBadge}
                title={upd.title}
                summary={upd.summaryField}
                metadataLine={upd.metadataLine}
                footerMeta={upd.dateOrMeta}
                officialHref={upd.officialHref}
                officialLabel="Official Link"
                actionLabel={upd.actionLabel}
                onPrimaryClick={upd.onOpen}
              />
            ))}
          </div>
        ) : (
          /* ================================================================ */
          /* RECRUITMENT & ADMISSIONS LISTING VIEW                            */
          /* ================================================================ */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {displayedJobs.map(
                ({ item, isAdmission, contentTypeLabel, status, organisation, qualification }) => (
                  <ColourAccentCard
                    key={item.id}
                    id={`home-recruitment-card-${item.id}`}
                    categoryType={isAdmission ? 'admission' : 'job'}
                    categoryLabel={contentTypeLabel}
                    organisation={organisation}
                    statusBadge={renderStatusBadge(status)}
                    title={item.title}
                    summary={item.shortInfo}
                    metadataLine={
                      qualification ? (
                        <span>
                          <strong className="font-semibold text-[#102A43]">Qualification:</strong>{' '}
                          {qualification}
                        </span>
                      ) : undefined
                    }
                    footerMeta={
                      item.lastDate ? (
                        <span>
                          Closing Date:{' '}
                          <strong className="font-semibold text-[#102A43]">{item.lastDate}</strong>
                        </span>
                      ) : item.postDate ? (
                        <span>Published: {item.postDate}</span>
                      ) : undefined
                    }
                    officialHref={item.officialLink}
                    officialLabel="Official Link"
                    actionLabel="View Details →"
                    onPrimaryClick={() => onOpenJob(item)}
                  />
                )
              )}
            </div>

            {filteredJobs.length > 6 && (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllJobs((prev) => !prev)}
                  className="min-h-[44px] px-5 py-2.5 bg-white hover:bg-[#F6F8FC] text-[#102A43] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-2"
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
          </>
        )}
      </section>

      {/* ==================================================================== */}
      {/* 2. FAST, SIMPLE & SECURE DOCUMENT TOOLS */}
      {/* ==================================================================== */}
      <section
        id="tools-preview"
        aria-labelledby="tools-preview-heading"
        className="w-full bg-white md:bg-transparent border-y border-[#E2E8F0] md:border-0 px-4 py-4 md:p-0 space-y-3.5 md:space-y-4 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-1 md:border-b md:border-[#E2E8F0] md:pb-3">
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
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
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

        <div className="-mx-4 md:mx-0 divide-y divide-[#E2E8F0] md:divide-y-0 border-t md:border-0 border-[#E2E8F0] bg-white md:bg-transparent grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-4">
          {previewTools.map((tool) => {
            const ToolIcon = getToolIcon(tool.iconName);
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  window.location.hash = `#tools/${tool.id}`;
                }}
                className="text-left bg-white md:border md:border-[#E2E8F0] md:hover:border-[#2563EB] md:rounded-2xl px-4 py-3.5 md:p-5 flex flex-col justify-between transition-colors md:shadow-2xs group cursor-pointer"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 md:block md:space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                      <ToolIcon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold text-[#102A43] group-hover:text-[#2563EB] transition-colors">
                      {tool.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                    {tool.shortDescription}
                  </p>
                </div>
                <div className="pt-2 mt-1.5 md:pt-3 md:mt-3 md:border-t border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-[#2563EB]">
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
        className="w-full bg-[#F6F8FC] px-3 md:px-0 py-5 md:py-0 space-y-3.5 md:space-y-4 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2.5 border-b border-[#E2E8F0] px-1 md:px-0">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] uppercase tracking-wider mb-1">
              <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Higher Education &amp; Admissions</span>
            </div>
            <h2
              id="education-heading"
              className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight"
            >
              Education &amp; Learning Resources
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {educationUpdates.map(({ item, status, organisation, qualification }) => (
            <ColourAccentCard
              key={item.id}
              categoryType="admission"
              categoryLabel="Admission"
              organisation={organisation}
              statusBadge={renderStatusBadge(status)}
              title={item.title}
              summary={item.shortInfo}
              metadataLine={
                qualification ? (
                  <span>
                    <strong className="font-semibold text-[#102A43]">Eligibility:</strong>{' '}
                    {qualification}
                  </span>
                ) : undefined
              }
              footerMeta={
                item.lastDate ? (
                  <span>
                    Closing: <strong className="font-semibold text-[#102A43]">{item.lastDate}</strong>
                  </span>
                ) : item.postDate ? (
                  <span>Published: {item.postDate}</span>
                ) : undefined
              }
              officialHref={item.officialLink}
              officialLabel="Official Link"
              actionLabel="View Details →"
              onPrimaryClick={() => onOpenJob(item)}
            />
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. ESSENTIAL CITIZEN E-SERVICES */}
      {/* ==================================================================== */}
      <section
        id="popular-services"
        aria-labelledby="popular-services-heading"
        className="w-full bg-[#F6F8FC] px-3 md:px-0 py-5 md:py-0 space-y-3.5 md:space-y-4 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2.5 border-b border-[#E2E8F0] px-1 md:px-0">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Citizen Service Desk</span>
            </div>
            <h2
              id="popular-services-heading"
              className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight"
            >
              Essential Citizen E-Services
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {popularServices.map((item) => (
            <ColourAccentCard
              key={item.title}
              categoryType="service"
              categoryLabel="CSC E-Service"
              organisation={
                item.service ? CATEGORY_LABELS[item.service.category] : 'CSC Digital Seva Desk'
              }
              title={item.title}
              summary={item.shortDescription}
              footerMeta={
                item.service?.price ? (
                  <span>
                    Fee: <strong className="font-semibold text-[#102A43]">{item.service.price}</strong>
                  </span>
                ) : undefined
              }
              actionLabel="View Service →"
              onPrimaryClick={() => {
                if (item.service) onOpenService(item.service);
              }}
            />
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. DIGITAL TOOLS & CITIZEN CALCULATORS */}
      {/* ==================================================================== */}
      <CitizenToolsDesk onApplyService={onApplyService} />

      {/* Organised Service Directory Category Previews */}
      <section
        id="service-directory-preview"
        aria-labelledby="directory-preview-heading"
        className="w-full bg-white md:bg-transparent border-b border-[#E2E8F0] md:border-0 px-4 pt-3 pb-0 md:p-0 space-y-3.5 md:space-y-5 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-1 md:border-b md:border-[#E2E8F0] md:pb-3">
          <div>
            <h2
              id="directory-preview-heading"
              className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight"
            >
              Browse Services by Category
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
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

        <div className="-mx-4 md:mx-0 divide-y divide-[#E2E8F0] md:divide-y-0 border-t md:border-0 border-[#E2E8F0] bg-white md:bg-transparent grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-4">
          {directoryCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectServiceDirectoryCategory(cat.id)}
                className="text-left bg-white md:border md:border-[#E2E8F0] md:hover:border-[#2563EB] md:rounded-2xl px-4 py-3.5 md:p-5 flex flex-col justify-between transition-colors md:shadow-2xs group cursor-pointer"
              >
                <div className="space-y-1.5">
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

                <div className="pt-2 mt-1.5 md:pt-3 md:mt-3 md:border-t border-[#E2E8F0] flex items-center justify-between text-xs font-semibold text-[#2563EB]">
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
        className="w-full bg-[#F6F8FC] px-3 md:px-0 py-5 md:py-0 space-y-3.5 md:space-y-4 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2.5 border-b border-[#E2E8F0] px-1 md:px-0">
          <div>
            <h2
              id="schemes-heading"
              className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight"
            >
              Government Schemes &amp; Citizen Benefits
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
              Key welfare schemes, eligibility guides, and direct official portal links.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('open-guide-article', { detail: { category: 'Central Scheme' } })
              );
              scrollToSection('knowledge-hub');
            }}
            className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All Guides &amp; Schemes</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <ColourAccentCard
            categoryType="scheme"
            categoryLabel="Government Scheme"
            organisation="Ministry of Agriculture & Farmers Welfare"
            title="PM Kisan Samman Nidhi (₹6,000/Year)"
            summary="Direct Benefit Transfer of ₹2,000 every four months for eligible landholding farmer families. Requires active e-KYC and Aadhaar-seeded bank account."
            footerMeta="Benefit: ₹6,000 / year"
            officialHref="https://pmkisan.gov.in"
            officialLabel="pmkisan.gov.in"
            actionLabel="Explore Scheme →"
            onPrimaryClick={() => {
              if (onOpenGuide) onOpenGuide('pm-kisan-ekyc-status-guide-2026');
              else scrollToSection('knowledge-hub');
            }}
          />

          <ColourAccentCard
            categoryType="scheme"
            categoryLabel="Government Scheme"
            organisation="National Health Authority (NHA)"
            title="Ayushman Bharat PM-JAY & SEHAT"
            summary="Cashless hospitalisation coverage up to ₹5,00,000 per family per year across empaneled hospitals, including universal coverage for J&K residents."
            footerMeta="Coverage: Up to ₹5 Lakh"
            officialHref="https://beneficiary.nha.gov.in"
            officialLabel="nha.gov.in"
            actionLabel="Explore Scheme →"
            onPrimaryClick={() => {
              if (onOpenGuide) onOpenGuide('ayushman-bharat-golden-card-guide-2026');
              else {
                const ayushmanSvc = SERVICES_LIST.find((s) => s.id === 'csc-ayushman');
                if (ayushmanSvc) onOpenService(ayushmanSvc);
              }
            }}
          />

          <ColourAccentCard
            categoryType="scheme"
            categoryLabel="Government Scheme"
            organisation="Ministry of Labour & Social Welfare"
            title="e-Shram & Social Welfare Pensions"
            summary="Registration for unorganised sector workers, old-age/widow/disability pension schemes (ISSS), and marriage assistance in Jammu & Kashmir."
            footerMeta="Social Security & DBT"
            officialHref="https://eshram.gov.in"
            officialLabel="eshram.gov.in"
            actionLabel="Explore Scheme →"
            onPrimaryClick={() => {
              const eshramSvc = SERVICES_LIST.find((s) => s.id === 'csc-eshram');
              if (eshramSvc) onOpenService(eshramSvc);
            }}
          />
        </div>
      </section>

      {/* Simple 3-Step "How It Works" Section */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="w-full bg-white border-b border-[#E2E8F0] md:border md:rounded-2xl px-4 py-4 sm:p-8 space-y-3.5 md:space-y-6 shadow-none md:shadow-2xs"
      >
        <div className="max-w-2xl">
          <h2
            id="how-it-works-heading"
            className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight"
          >
            How Online Service Assistance Works
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
            Requesting help with an application or certificate through CSC DOST takes three simple steps.
          </p>
        </div>

        <div className="-mx-4 md:mx-0 divide-y divide-[#E2E8F0] md:divide-y-0 border-y md:border-0 border-[#E2E8F0] grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-5">
          <div className="px-4 py-3.5 md:p-5 md:rounded-xl bg-white md:bg-[#F6F8FC] md:border md:border-[#E2E8F0] space-y-1.5">
            <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#2563EB] text-white text-xs font-bold">
              1
            </div>
            <h3 className="text-base font-bold text-[#102A43]">Choose a service</h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Select the citizen service, certificate, or recruitment form you need and review the required documents and fee details.
            </p>
          </div>

          <div className="px-4 py-3.5 md:p-5 md:rounded-xl bg-white md:bg-[#F6F8FC] md:border md:border-[#E2E8F0] space-y-1.5">
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

          <div className="px-4 py-3.5 md:p-5 md:rounded-xl bg-white md:bg-[#F6F8FC] md:border md:border-[#E2E8F0] space-y-1.5">
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
    </div>
  );
}
