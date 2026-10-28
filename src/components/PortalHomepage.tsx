import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  Briefcase,
  CreditCard,
  Fingerprint,
  FileText,
  GraduationCap,
  ShieldCheck,
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
  Info,
  HeartHandshake,
  LayoutGrid,
  X,
  Zap,
  Users,
  Globe,
  Monitor,
  ChevronRight,
} from 'lucide-react';
import { SARKARI_DATA, SARKARI_CATEGORIES, SarkariItem } from '../data/sarkariData';
import { SERVICES_LIST, CATEGORY_LABELS, ServiceItem } from '../servicesData';
import { GUIDE_ARTICLES } from './GuidesKnowledgeHub';
import { TOOLS_LIST } from './tools/toolsData';
import CitizenToolsDesk from './CitizenToolsDesk';
import { ColourAccentCard, PortalCardFact } from './shared/ContentDesignSystem';

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
  if (cleaned.length <= 68) return cleaned;
  return `${cleaned.slice(0, 66).trim()}…`;
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
}: PortalHomepageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  const [jobOrgFilter, setJobOrgFilter] = useState<string>('all');
  const [jobStatusFilter, setJobStatusFilter] = useState<'active' | 'all' | 'closed'>('active');
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [showAllEducation, setShowAllEducation] = useState(false);

  // Listen for search focus and live query events from Header and keyboard shortcuts (Ctrl+K, /, Escape)
  useEffect(() => {
    const handleFocusSearch = () => {
      const headerInput = document.getElementById('csc-header-search-input') as HTMLInputElement | null;
      if (headerInput && headerInput.offsetParent !== null) {
        headerInput.focus();
        return;
      }
      setShowHeaderSearch(true);
      setTimeout(() => {
        const el = document.getElementById('portal-universal-search');
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 60);
    };

    const handleHeaderSearch = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string; submit?: boolean }>;
      const q = customEvent.detail?.query ?? '';
      setSearchQuery(q);
      if (q.trim()) {
        setShowHeaderSearch(true);
        if (customEvent.detail?.submit) {
          setTimeout(() => {
            const el = document.getElementById('hero-heading-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
        }
      } else if (!customEvent.detail?.submit) {
        setShowHeaderSearch(false);
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
      } else if (e.key === 'Escape' && (searchQuery || showHeaderSearch)) {
        setSearchQuery('');
        setShowHeaderSearch(false);
        window.dispatchEvent(new CustomEvent('csc-header-search-clear'));
      }
    };

    window.addEventListener('focus-csc-search', handleFocusSearch);
    window.addEventListener('csc-header-search', handleHeaderSearch);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('focus-csc-search', handleFocusSearch);
      window.removeEventListener('csc-header-search', handleHeaderSearch);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchQuery, showHeaderSearch]);

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
        iconBg: '#EFF6FF',
        iconBorder: '#DBEAFE',
        iconColor: '#2563EB',
        service: findSvc('csc-pan', 0),
      },
      {
        title: 'Aadhaar Assistance',
        shortDescription: 'Address updates, demographic corrections, and PVC card requests.',
        icon: Fingerprint,
        iconBg: '#F5F3FF',
        iconBorder: '#EDE9FE',
        iconColor: '#7C3AED',
        service: findSvc('csc-aadhaar', 1),
      },
      {
        title: 'J&K Domicile & Certificates',
        shortDescription: 'Domicile, Income, Caste, RBA, and Revenue certificate applications.',
        icon: FileText,
        iconBg: '#ECFDF5',
        iconBorder: '#D1FAE5',
        iconColor: '#059669',
        service: findSvc('jk-domicile-cert', 5),
      },
      {
        title: 'Job Application Assistance',
        shortDescription: 'Online form filling, photo/signature resizing, and admit card downloads.',
        icon: Briefcase,
        iconBg: '#FFF7ED',
        iconBorder: '#FFEDD5',
        iconColor: '#EA580C',
        service: findSvc('edu-exams', 14),
      },
      {
        title: 'Ayushman Card Assistance',
        shortDescription: 'PM-JAY & SEHAT Golden Card registration and family KYC verification.',
        icon: ShieldCheck,
        iconBg: '#F0FDFA',
        iconBorder: '#CCFBF1',
        iconColor: '#0D9488',
        service: findSvc('csc-ayushman', 3),
      },
      {
        title: 'Passport Application Assistance',
        shortDescription: 'Fresh passport filing, renewal support, and PSK slot booking.',
        icon: Compass,
        iconBg: '#FFF1F2',
        iconBorder: '#FFE4E6',
        iconColor: '#E11D48',
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
      .map((j) => {
        const facts: PortalCardFact[] = [];
        if (j.qualification) {
          facts.push({ icon: 'qualification', label: 'Qualification', value: j.qualification });
        }
        if (j.item.lastDate) {
          facts.push({ icon: 'calendar', label: 'Closing Date', value: j.item.lastDate });
        } else if (j.item.postDate) {
          facts.push({ icon: 'calendar', label: 'Published', value: j.item.postDate });
        }
        return {
          id: `job-${j.item.id}`,
          rawId: j.item.id,
          categoryType: j.item.category,
          categoryBadge: 'Job / Recruitment',
          organisation: j.organisation,
          title: j.item.title,
          summaryField: j.item.shortInfo,
          infoFacts: facts,
          statusBadge: renderStatusBadge(j.status),
          officialHref: j.item.officialLink,
          actionLabel: 'View Details →',
          thumbnailUrl: j.item.thumbnailUrl || `/thumbnails/${j.item.id}.png`,
          onOpen: () => onOpenJob(j.item),
        };
      });

    const topAdmissions = jobsWithStatus
      .filter((j) => j.isAdmission)
      .slice(0, 2)
      .map((j) => {
        const facts: PortalCardFact[] = [];
        if (j.qualification) {
          facts.push({ icon: 'qualification', label: 'Eligibility', value: j.qualification });
        }
        if (j.item.lastDate) {
          facts.push({ icon: 'calendar', label: 'Closing Date', value: j.item.lastDate });
        } else if (j.item.postDate) {
          facts.push({ icon: 'calendar', label: 'Published', value: j.item.postDate });
        }
        return {
          id: `adm-${j.item.id}`,
          rawId: j.item.id,
          categoryType: 'admission' as const,
          categoryBadge: 'Admission / Education',
          organisation: j.organisation,
          title: j.item.title,
          summaryField: j.item.shortInfo,
          infoFacts: facts,
          statusBadge: renderStatusBadge(j.status),
          officialHref: j.item.officialLink,
          actionLabel: 'View Details →',
          thumbnailUrl: j.item.thumbnailUrl || `/thumbnails/${j.item.id}.png`,
          onOpen: () => onOpenJob(j.item),
        };
      });

    const topSchemes = GUIDE_ARTICLES.filter((g) => g.category === 'Central Scheme')
      .slice(0, 2)
      .map((scheme) => {
        const facts: PortalCardFact[] = [];
        if (scheme.benefitSummary) {
          facts.push({ icon: 'benefit', label: 'Benefit', value: scheme.benefitSummary });
        }
        if (scheme.applicableRegion) {
          facts.push({ icon: 'region', label: 'Region', value: scheme.applicableRegion });
        } else if (scheme.lastUpdated) {
          facts.push({ icon: 'clock', label: 'Updated', value: scheme.lastUpdated });
        }
        return {
          id: `sch-${scheme.id}`,
          categoryType: 'scheme' as const,
          categoryBadge: 'Government Scheme',
          organisation: scheme.responsibleDepartment || scheme.officialPortal,
          title: scheme.title,
          summaryField: scheme.summary,
          infoFacts: facts,
          statusBadge: undefined,
          officialHref: scheme.officialUrl,
          actionLabel: 'Explore Scheme →',
          onOpen: () => {
            if (onOpenGuide) onOpenGuide(scheme.id);
            else scrollToSection('knowledge-hub');
          },
        };
      });

    const topServices = SERVICES_LIST.slice(0, 2).map((svc) => {
      const facts: PortalCardFact[] = [];
      if (svc.requirements && svc.requirements.length > 0) {
        facts.push({
          icon: 'requirement',
          label: 'Requirement',
          value: svc.requirements[0],
        });
      }
      if (svc.price) {
        facts.push({
          icon: 'fee',
          label: 'Fee',
          value: svc.estimatedTime ? `${svc.price} (${svc.estimatedTime})` : svc.price,
        });
      } else if (svc.estimatedTime) {
        facts.push({
          icon: 'clock',
          label: 'Processing',
          value: svc.estimatedTime,
        });
      }
      return {
        id: `svc-${svc.id}`,
        categoryType: 'service' as const,
        categoryBadge: 'CSC E-Service',
        organisation: CATEGORY_LABELS[svc.category] || 'CSC Digital Seva Desk',
        title: svc.name,
        summaryField: svc.description,
        infoFacts: facts,
        statusBadge: undefined,
        officialHref: undefined,
        actionLabel: 'View Service →',
        onOpen: () => onOpenService(svc),
      };
    });

    const topGuides = GUIDE_ARTICLES.filter((g) => g.category !== 'Central Scheme')
      .slice(0, 2)
      .map((guide) => {
        const facts: PortalCardFact[] = [
          { icon: 'topic', label: 'Topic', value: guide.category },
          { icon: 'clock', label: 'Updated', value: `${guide.lastUpdated} · ${guide.readTime}` },
        ];
        return {
          id: `gde-${guide.id}`,
          categoryType: guide.category === 'Education' ? ('admission' as const) : ('guide' as const),
          categoryBadge: guide.category === 'Education' ? 'Admission / Education' : 'Citizen Guide',
          organisation: guide.officialPortal,
          title: guide.title,
          summaryField: guide.summary,
          infoFacts: facts,
          statusBadge: undefined,
          officialHref: guide.officialUrl,
          actionLabel: 'Read Guide →',
          onOpen: () => {
            if (onOpenGuide) onOpenGuide(guide.id);
            else scrollToSection('knowledge-hub');
          },
        };
      });

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
        iconBg: '#EFF6FF',
        iconBorder: '#DBEAFE',
        iconColor: '#2563EB',
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
        iconBg: '#ECFDF5',
        iconBorder: '#D1FAE5',
        iconColor: '#059669',
        count: countByFilter(
          (s) => s.category === 'revenue' || s.category === 'jk_state' || s.id === 'csc-certificates'
        ),
      },
      {
        id: 'jobs_assistance',
        title: 'Jobs & Application Assistance',
        description: 'JKSSB, SSC, Army & Railway online forms, admit cards, and document formatting.',
        icon: Briefcase,
        iconBg: '#FFF7ED',
        iconBorder: '#FFEDD5',
        iconColor: '#EA580C',
        count: countByFilter((s) => ['edu-exams', 'dig-form', 'dig-photo'].includes(s.id)),
      },
      {
        id: 'education',
        title: 'Education & Scholarships',
        description: 'NSP & State scholarships, college admissions, IGNOU forms, and exam registrations.',
        icon: GraduationCap,
        iconBg: '#F5F3FF',
        iconBorder: '#EDE9FE',
        iconColor: '#7C3AED',
        count: countByFilter((s) => s.category === 'education'),
      },
      {
        id: 'welfare',
        title: 'Welfare & Health',
        description: 'Ayushman Bharat Golden Card, PM-KISAN e-KYC, e-Shram, and pension schemes.',
        icon: ShieldCheck,
        iconBg: '#FFF1F2',
        iconBorder: '#FFE4E6',
        iconColor: '#E11D48',
        count: countByFilter((s) =>
          ['csc-ayushman', 'csc-pmkisan', 'csc-eshram'].includes(s.id) ||
          s.name.toLowerCase().includes('pension') ||
          s.name.toLowerCase().includes('welfare') ||
          s.name.toLowerCase().includes('marriage')
        ),
      },
      {
        id: 'business',
        title: 'Business & Tax',
        description: 'UDYAM MSME registration, GST assistance, and Class-3 Digital Signature (DSC).',
        icon: Building2,
        iconBg: '#FFFBEB',
        iconBorder: '#FEF3C7',
        iconColor: '#D97706',
        count: countByFilter((s) => s.category === 'business'),
      },
      {
        id: 'digital',
        title: 'Digital & Printing Services',
        description: 'Document scanning, PDF formatting, passport photo printing, and utility bills.',
        icon: Laptop,
        iconBg: '#F0FDFA',
        iconBorder: '#CCFBF1',
        iconColor: '#0D9488',
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

  // 6 Circular Category Shortcuts for "Browse by need"
  const browseCategories = useMemo(
    () => [
      {
        id: 'documents',
        label: 'Documents',
        Icon: FileText,
        circleBg: '#EFF6FF',
        circleBorder: '#DBEAFE',
        iconColor: '#2563EB',
        onClick: () => selectServiceDirectoryCategory('identity'),
      },
      {
        id: 'jobs',
        label: 'Jobs',
        Icon: Briefcase,
        circleBg: '#ECFDF5',
        circleBorder: '#D1FAE5',
        iconColor: '#0D9488',
        onClick: () => {
          setJobOrgFilter('all');
          scrollToSection('recruitment-section');
        },
      },
      {
        id: 'education',
        label: 'Education',
        Icon: GraduationCap,
        circleBg: '#F5F3FF',
        circleBorder: '#EDE9FE',
        iconColor: '#7C3AED',
        onClick: () => scrollToSection('education-resources'),
      },
      {
        id: 'schemes',
        label: 'Schemes',
        Icon: HeartHandshake,
        circleBg: '#FFFBEB',
        circleBorder: '#FEF3C7',
        iconColor: '#D97706',
        onClick: () => scrollToSection('schemes-section'),
      },
      {
        id: 'tools',
        label: 'Tools',
        Icon: Wrench,
        circleBg: '#EFF6FF',
        circleBorder: '#DBEAFE',
        iconColor: '#102A43',
        onClick: () => {
          window.location.hash = '#tools';
        },
      },
      {
        id: 'all-services',
        label: 'All Services',
        Icon: LayoutGrid,
        circleBg: '#F1F5F9',
        circleBorder: '#E2E8F0',
        iconColor: '#102A43',
        onClick: () => selectServiceDirectoryCategory('all'),
      },
    ],
    []
  );

  return (
    <div className="w-full pb-0 md:pb-8">
      {/* ==================================================================== */}
      {/* 1. COMPACT "BROWSE BY NEED" SECTION (Full-Width White Section)       */}
      {/* ==================================================================== */}
      <section
        id="hero-heading-section"
        aria-label="Browse by need"
        className="w-full bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-4 md:py-6"
      >
        <div className="max-w-7xl mx-auto">
          {/* DESKTOP LAYOUT (>= 768px): Left Heading + Right 6 Circular Shortcuts in 1 Row */}
          <div className="hidden md:flex md:items-center md:justify-between md:gap-8">
            <div className="max-w-sm shrink-0">
              <h1
                id="hero-heading"
                className="text-2xl lg:text-[28px] font-extrabold text-[#102A43] tracking-tight leading-[1.22]"
              >
                Everyday services.
                <span className="block">One simple place.</span>
              </h1>
              <p className="text-sm text-[#475569] mt-1.5">
                Choose a category to get started.
              </p>
            </div>

            <div
              role="navigation"
              aria-label="Category shortcuts"
              className="flex items-start justify-end gap-5 lg:gap-7"
            >
              {browseCategories.map((cat) => {
                const CatIcon = cat.Icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={cat.onClick}
                    className="group flex flex-col items-center text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] rounded-xl cursor-pointer min-w-[68px]"
                  >
                    <span
                      style={{
                        backgroundColor: cat.circleBg,
                        borderColor: cat.circleBorder,
                        color: cat.iconColor,
                      }}
                      className="w-14 h-14 lg:w-16 lg:h-16 rounded-full border flex items-center justify-center transition-transform group-hover:-translate-y-0.5"
                    >
                      <CatIcon className="w-6 h-6 lg:w-7 lg:h-7" aria-hidden="true" />
                    </span>
                    <span className="mt-2 text-xs lg:text-[13px] font-semibold text-[#102A43] group-hover:text-[#2563EB] transition-colors whitespace-nowrap">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MOBILE LAYOUT (<= 767px): Stacked Heading + 3x2 Circular Shortcut Grid */}
          <div className="md:hidden">
            <div className="text-left">
              <h1 className="text-[20px] font-extrabold text-[#102A43] tracking-tight leading-snug">
                What do you need today?
              </h1>
              <p className="text-[13px] text-[#475569] mt-0.5">
                Choose a category to begin.
              </p>
            </div>

            <div
              role="navigation"
              aria-label="Category shortcuts"
              className="mt-3.5 grid grid-cols-3 gap-x-3 gap-y-3.5"
            >
              {browseCategories.map((cat) => {
                const CatIcon = cat.Icon;
                return (
                  <button
                    key={`mob-${cat.id}`}
                    type="button"
                    onClick={cat.onClick}
                    className="group min-h-[44px] min-w-[44px] py-0.5 flex flex-col items-center justify-start text-center focus-visible:outline-2 focus-visible:outline-[#2563EB] rounded-xl cursor-pointer"
                  >
                    <span
                      style={{
                        backgroundColor: cat.circleBg,
                        borderColor: cat.circleBorder,
                        color: cat.iconColor,
                      }}
                      className="w-[52px] h-[52px] rounded-full border flex items-center justify-center transition-transform active:scale-95"
                    >
                      <CatIcon className="w-6 h-6" aria-hidden="true" />
                    </span>
                    <span className="mt-1.5 text-[13px] font-semibold text-[#102A43] leading-snug">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COMPACT POPULAR LINKS ROW */}
          <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-[13px]">
            <span className="font-semibold text-[#64748B]">Popular services:</span>

            <button
              type="button"
              onClick={() => {
                const panSvc = SERVICES_LIST.find((s) => s.id === 'csc-pan');
                if (panSvc) onOpenService(panSvc);
              }}
              className="font-semibold text-[#102A43] hover:text-[#2563EB] inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>PAN card assistance</span>
              <span aria-hidden="true" className="text-[#2563EB]">
                →
              </span>
            </button>

            <span aria-hidden="true" className="text-[#CBD5E1] hidden sm:inline">
              ·
            </span>

            <button
              type="button"
              onClick={() => {
                const domSvc = SERVICES_LIST.find((s) => s.id === 'jk-domicile-cert');
                if (domSvc) onOpenService(domSvc);
              }}
              className="font-semibold text-[#102A43] hover:text-[#2563EB] inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Domicile guidance</span>
              <span aria-hidden="true" className="text-[#2563EB]">
                →
              </span>
            </button>

            <span aria-hidden="true" className="text-[#CBD5E1] hidden sm:inline">
              ·
            </span>

            <button
              type="button"
              onClick={() => {
                window.location.hash = '#tools';
              }}
              className="font-semibold text-[#102A43] hover:text-[#2563EB] inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Photo &amp; PDF tools</span>
              <span aria-hidden="true" className="text-[#2563EB]">
                →
              </span>
            </button>
          </div>

          {/* Toggleable Universal Search Drawer (Opened when Header Search is clicked) */}
          {(showHeaderSearch || Boolean(searchQuery)) && (
            <div className="mt-4 pt-4 border-t border-[#E2E8F0] space-y-4">
              <div className="max-w-2xl relative">
                <label htmlFor="portal-universal-search" className="sr-only">
                  Search services, jobs, schemes or guides
                </label>
                <Search
                  className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="portal-universal-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services, jobs, schemes or guides…"
                  className="w-full min-h-[42px] pl-10 pr-20 py-2 bg-[#F6F8FC] focus:bg-white border border-[#E2E8F0] focus:border-[#2563EB] rounded-xl text-sm text-[#102A43] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowHeaderSearch(false);
                    window.dispatchEvent(new CustomEvent('csc-header-search-clear'));
                  }}
                  aria-label="Close search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#64748B] hover:text-[#102A43] px-2 py-1 bg-white border border-[#E2E8F0] rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close</span>
                </button>
              </div>

              {searchResults && (
                <div
                  role="region"
                  aria-label="Search Results"
                  className="space-y-5 text-left"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#102A43]">
                      Search Results for &ldquo;{searchQuery}&rdquo; ({searchResults.total} found)
                    </h2>
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
                                categoryLabel="CSC E-Service"
                                organisation={CATEGORY_LABELS[svc.category] || 'CSC Digital Seva Desk'}
                                title={svc.name}
                                summary={svc.description}
                                infoFacts={[
                                  ...(svc.requirements?.[0]
                                    ? [
                                        {
                                          icon: 'requirement' as const,
                                          label: 'Requirement',
                                          value: svc.requirements[0],
                                        },
                                      ]
                                    : []),
                                  ...(svc.price
                                    ? [{ icon: 'fee' as const, label: 'Fee', value: svc.price }]
                                    : []),
                                ]}
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
                              const qual = getShortQualification(job.eligibility);
                              return (
                                <ColourAccentCard
                                  key={job.id}
                                  id={`search-recruitment-card-${job.id}`}
                                  thumbnailUrl={job.thumbnailUrl || `/thumbnails/${job.id}.png`}
                                  categoryType={isAdmission ? 'admission' : job.category}
                                  categoryLabel={isAdmission ? 'Admission / Education' : 'Job / Recruitment'}
                                  organisation={getRecruitingOrganisation(job)}
                                  statusBadge={renderStatusBadge(st)}
                                  title={job.title}
                                  summary={job.shortInfo}
                                  infoFacts={[
                                    ...(qual
                                      ? [
                                          {
                                            icon: 'qualification' as const,
                                            label: isAdmission ? 'Eligibility' : 'Qualification',
                                            value: qual,
                                          },
                                        ]
                                      : []),
                                    ...(job.lastDate
                                      ? [
                                          {
                                            icon: 'calendar' as const,
                                            label: 'Closing Date',
                                            value: job.lastDate,
                                          },
                                        ]
                                      : []),
                                  ]}
                                  officialHref={job.officialLink}
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
                                  categoryType={
                                    isScheme
                                      ? 'scheme'
                                      : guide.category === 'Education'
                                      ? 'admission'
                                      : 'guide'
                                  }
                                  categoryLabel={isScheme ? 'Government Scheme' : guide.category}
                                  organisation={guide.responsibleDepartment || guide.officialPortal}
                                  title={guide.title}
                                  summary={guide.summary}
                                  infoFacts={[
                                    {
                                      icon: isScheme ? ('benefit' as const) : ('topic' as const),
                                      label: isScheme ? 'Benefit' : 'Topic',
                                      value: guide.benefitSummary || guide.category,
                                    },
                                    {
                                      icon: 'clock' as const,
                                      label: 'Updated',
                                      value: `${guide.lastUpdated} · ${guide.readTime}`,
                                    },
                                  ]}
                                  officialHref={guide.officialUrl}
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
            </div>
          )}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* ALIGNED CONTENT CONTAINER BELOW "BROWSE BY NEED"                     */}
      {/* ==================================================================== */}
      <div className="space-y-0 md:space-y-12 pt-0 md:pt-8 w-full max-w-7xl mx-auto px-0 md:px-6">
        {/* ================================================================== */}
        {/* 2. PUBLIC RECRUITMENTS — LATEST RECRUITMENT & EXAM NOTICES         */}
        {/* ================================================================== */}
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
                  id={upd.id}
                  thumbnailUrl={upd.thumbnailUrl}
                  categoryType={upd.categoryType}
                  categoryLabel={upd.categoryBadge}
                  organisation={upd.organisation}
                  statusBadge={upd.statusBadge}
                  title={upd.title}
                  summary={upd.summaryField}
                  infoFacts={upd.infoFacts}
                  officialHref={upd.officialHref}
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
                  ({ item, isAdmission, status, organisation, qualification }) => {
                    const facts: PortalCardFact[] = [];
                    if (qualification) {
                      facts.push({
                        icon: 'qualification',
                        label: isAdmission ? 'Eligibility' : 'Qualification',
                        value: qualification,
                      });
                    }
                    if (item.lastDate) {
                      facts.push({
                        icon: 'calendar',
                        label: 'Closing Date',
                        value: item.lastDate,
                      });
                    } else if (item.postDate) {
                      facts.push({
                        icon: 'calendar',
                        label: 'Published',
                        value: item.postDate,
                      });
                    }

                    return (
                      <ColourAccentCard
                        key={item.id}
                        id={`home-recruitment-card-${item.id}`}
                        thumbnailUrl={item.thumbnailUrl || `/thumbnails/${item.id}.png`}
                        categoryType={isAdmission ? 'admission' : item.category}
                        categoryLabel={
                          isAdmission
                            ? 'Admission / Education'
                            : SARKARI_CATEGORIES[item.category]?.label || 'Job / Recruitment'
                        }
                        organisation={organisation}
                        statusBadge={renderStatusBadge(status)}
                        title={item.title}
                        summary={item.shortInfo}
                        infoFacts={facts}
                        officialHref={item.officialLink}
                        href={`/post/${item.id}`}
                        actionLabel="View Details →"
                        onPrimaryClick={() => onOpenJob(item)}
                      />
                    );
                  }
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
        className="w-full bg-[#F7F9FC] md:bg-transparent border-y border-[#E2E8F0] md:border-0 px-3 py-4 md:p-0 space-y-3.5 md:space-y-4 scroll-mt-20"
      >
        {/* MOBILE LAYOUT (< 768px): Premium Document Tools Banner + Compact Tool Cards */}
        <div className="md:hidden space-y-3.5">
          {/* Premium Document Tools Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-[#F5F3FF] to-[#EEF2FF] border border-[#DDD6FE] p-3.5 shadow-[0_4px_14px_rgba(79,70,229,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider">
                  <Wrench className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>ONLINE DOCUMENT SUITE</span>
                </div>
                <h2 className="text-[22px] font-extrabold text-[#102A43] tracking-tight leading-[1.18] mt-1">
                  Fast, Simple &amp; Secure Document Tools
                </h2>
                <p className="text-[13px] text-[#475569] leading-[1.38] mt-1">
                  Resize photos, compress images, convert files, and format PDFs directly in your browser.
                </p>
              </div>

              {/* Lightweight Document / PDF SVG Illustration */}
              <div
                aria-hidden="true"
                className="w-14 h-14 rounded-2xl bg-white/90 border border-[#DDD6FE] shadow-2xs flex items-center justify-center shrink-0 mt-0.5"
              >
                <svg
                  viewBox="0 0 56 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-11 h-11"
                >
                  <rect x="8" y="10" width="26" height="34" rx="4" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="2" />
                  <path d="M14 18H28M14 23H24M14 28H22" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
                  <rect x="24" y="20" width="24" height="26" rx="4" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="2" />
                  <rect x="28" y="25" width="16" height="9" rx="1.5" fill="#DDD6FE" />
                  <circle cx="32" cy="28.5" r="1.5" fill="#6D28D9" />
                  <path d="M29 33L33 29.5L36 32L39 29L43 33" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M31 40H41" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* 4 Horizontal Tool Benefits Row */}
            <div className="mt-3 grid grid-cols-4 divide-x divide-[#E0E7FF] bg-white/95 border border-[#E0E7FF] rounded-xl py-2 px-1">
              <div className="flex flex-col items-center text-center px-1 gap-1">
                <span className="w-6 h-6 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <span className="text-[10.5px] font-semibold text-[#102A43] leading-tight">
                  Free Tools
                </span>
              </div>

              <div className="flex flex-col items-center text-center px-1 gap-1">
                <span className="w-6 h-6 rounded-lg bg-[#D1FAE5] text-[#059669] flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <span className="text-[10.5px] font-semibold text-[#102A43] leading-tight">
                  Privacy
                </span>
              </div>

              <div className="flex flex-col items-center text-center px-1 gap-1">
                <span className="w-6 h-6 rounded-lg bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <span className="text-[10.5px] font-semibold text-[#102A43] leading-tight">
                  Browser Based
                </span>
              </div>

              <div className="flex flex-col items-center text-center px-1 gap-1">
                <span className="w-6 h-6 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
                  <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <span className="text-[10.5px] font-semibold text-[#102A43] leading-tight">
                  No App Needed
                </span>
              </div>
            </div>

            {/* View All Tools CTA Button */}
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#tools';
              }}
              className="mt-3 w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] active:scale-[0.99] text-white text-[13.5px] font-bold shadow-[0_3px_10px_rgba(79,70,229,0.22)] flex items-center justify-center gap-1.5 transition-transform cursor-pointer"
            >
              <span>View All Tools ({TOOLS_LIST.length})</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Popular Tools Header Row */}
          <div className="flex items-center justify-between px-0.5 pt-0.5">
            <h3 className="text-[16px] font-extrabold text-[#102A43] tracking-tight">
              Popular Tools
            </h3>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#tools';
              }}
              className="min-h-[36px] px-1 text-[13px] font-bold text-[#4F46E5] hover:text-[#2563EB] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>See All</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Compact Tool Cards List */}
          <div className="space-y-2.5">
            {previewTools.map((tool) => {
              const ToolIcon = getToolIcon(tool.iconName);
              const accentMap: Record<
                string,
                { bg: string; border: string; icon: string; action: string }
              > = {
                'image-compressor': {
                  bg: '#EFF6FF',
                  border: '#DBEAFE',
                  icon: '#2563EB',
                  action: '#2563EB',
                },
                'image-resizer': {
                  bg: '#ECFDF5',
                  border: '#D1FAE5',
                  icon: '#059669',
                  action: '#059669',
                },
                'image-to-pdf': {
                  bg: '#FFF1F2',
                  border: '#FFE4E6',
                  icon: '#E11D48',
                  action: '#E11D48',
                },
                'pdf-to-image': {
                  bg: '#FFF7ED',
                  border: '#FFEDD5',
                  icon: '#EA580C',
                  action: '#EA580C',
                },
              };
              const accent = accentMap[tool.id] || {
                bg: '#EFF6FF',
                border: '#DBEAFE',
                icon: '#2563EB',
                action: '#2563EB',
              };

              return (
                <button
                  key={`mob-tool-${tool.id}`}
                  type="button"
                  onClick={() => {
                    window.location.hash = `#tools/${tool.id}`;
                  }}
                  className="w-full text-left bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[15px] p-3.5 shadow-[0_2px_8px_rgba(16,42,67,0.04)] active:scale-[0.99] transition-all flex items-start justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      style={{
                        backgroundColor: accent.bg,
                        borderColor: accent.border,
                        color: accent.icon,
                      }}
                      className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5"
                    >
                      <ToolIcon className="w-5 h-5" aria-hidden="true" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-[15px] font-bold text-[#102A43] leading-snug group-hover:text-[#2563EB] transition-colors">
                        {tool.name}
                      </h4>
                      <p className="text-[12.5px] text-[#475569] leading-[1.35] line-clamp-2 mt-0.5">
                        {tool.shortDescription}
                      </p>
                      <span
                        style={{ color: accent.action }}
                        className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-bold"
                      >
                        <span>Open Tool</span>
                        <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </div>

                  <span
                    aria-hidden="true"
                    className="w-7 h-7 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] group-hover:text-[#2563EB] flex items-center justify-center shrink-0 self-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DESKTOP LAYOUT (>= 768px): Preserved Unchanged */}
        <div className="hidden md:flex sm:flex-row sm:items-end justify-between gap-2 pb-1 md:border-b md:border-[#E2E8F0] md:pb-3">
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

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          {educationUpdates.map(({ item, status, organisation, qualification }) => {
            const facts: PortalCardFact[] = [];
            if (qualification) {
              facts.push({ icon: 'qualification', label: 'Eligibility', value: qualification });
            }
            if (item.lastDate) {
              facts.push({ icon: 'calendar', label: 'Closing Date', value: item.lastDate });
            } else if (item.postDate) {
              facts.push({ icon: 'calendar', label: 'Published', value: item.postDate });
            }
            return (
              <ColourAccentCard
                key={item.id}
                id={`home-admission-card-${item.id}`}
                thumbnailUrl={item.thumbnailUrl || `/thumbnails/${item.id}.png`}
                categoryType="admission"
                categoryLabel="Admission / Education"
                organisation={organisation}
                statusBadge={renderStatusBadge(status)}
                title={item.title}
                summary={item.shortInfo}
                infoFacts={facts}
                officialHref={item.officialLink}
                href={`/post/${item.id}`}
                actionLabel="View Details →"
                onPrimaryClick={() => onOpenJob(item)}
              />
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. ESSENTIAL CITIZEN E-SERVICES */}
      {/* ==================================================================== */}
      <section
        id="popular-services"
        aria-labelledby="popular-services-heading"
        className="w-full bg-[#F7F9FC] md:bg-[#F6F8FC] px-3 md:px-0 py-4 md:py-0 space-y-3.5 md:space-y-4 scroll-mt-20"
      >
        {/* MOBILE LAYOUT (< 768px): Compact Premium Service Banner + Compact Service Cards */}
        <div className="md:hidden space-y-3.5">
          {/* Compact Service Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-[#F4F8FF] to-[#EBF3FF] border border-[#DBEAFE] p-3.5 shadow-[0_4px_14px_rgba(37,99,235,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>CITIZEN SERVICE DESK</span>
                </div>
                <h2 className="text-[22px] font-extrabold text-[#102A43] tracking-tight leading-[1.18] mt-1">
                  Essential Citizen E-Services
                </h2>
                <p className="text-[13px] text-[#475569] leading-[1.38] mt-1">
                  Get help with identity, certificates, and important government services quickly and easily.
                </p>
              </div>

              {/* Lightweight Citizen Identity & Certificate SVG Illustration */}
              <div
                aria-hidden="true"
                className="w-14 h-14 rounded-2xl bg-white/95 border border-[#DBEAFE] shadow-2xs flex items-center justify-center shrink-0 mt-0.5"
              >
                <svg
                  viewBox="0 0 56 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-11 h-11"
                >
                  <rect x="6" y="12" width="34" height="24" rx="4" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" />
                  <circle cx="15" cy="22" r="4" fill="#BFDBFE" stroke="#2563EB" strokeWidth="1.5" />
                  <path d="M10.5 30C11.5 27.8 13.2 27 15 27C16.8 27 18.5 27.8 19.5 30" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M23 19H34M23 24H31M23 29H28" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
                  <path
                    d="M41 25L49 28.5V35.5C49 40.5 45.6 44.8 41 46.5C36.4 44.8 33 40.5 33 35.5V28.5L41 25Z"
                    fill="#ECFDF5"
                    stroke="#059669"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path d="M38 35.5L40.2 37.7L44.5 33.2" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* 3 Service Benefits in One Horizontal Row */}
            <div className="mt-3 grid grid-cols-3 divide-x divide-[#DBEAFE] bg-white/95 border border-[#DBEAFE] rounded-xl py-2 px-1">
              <div className="flex items-center justify-center gap-1.5 px-1">
                <span className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <span className="text-[11px] font-semibold text-[#102A43] leading-tight">
                  Quick Assistance
                </span>
              </div>

              <div className="flex items-center justify-center gap-1.5 px-1">
                <span className="w-6 h-6 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <span className="text-[11px] font-semibold text-[#102A43] leading-tight">
                  Verified Guidance
                </span>
              </div>

              <div className="flex items-center justify-center gap-1.5 px-1">
                <span className="w-6 h-6 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <span className="text-[11px] font-semibold text-[#102A43] leading-tight">
                  CSC Support
                </span>
              </div>
            </div>

            {/* View All Services Button */}
            <button
              type="button"
              onClick={() => scrollToSection('services')}
              className="mt-3 w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#3B82F6] active:scale-[0.99] text-white text-[13.5px] font-bold shadow-[0_3px_10px_rgba(37,99,235,0.22)] flex items-center justify-center gap-1.5 transition-transform cursor-pointer"
            >
              <span>View All Services</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Popular Services Sub-Header */}
          <div className="flex items-center justify-between px-0.5 pt-0.5">
            <h3 className="text-[16px] font-extrabold text-[#102A43] tracking-tight">
              Popular Services
            </h3>
            <button
              type="button"
              onClick={() => scrollToSection('services')}
              className="min-h-[36px] px-1 text-[13px] font-bold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>See All</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Compact Service Cards List */}
          <div className="space-y-2.5">
            {popularServices.map((item) => {
              const SvcIcon = item.icon;
              const reqText = item.service?.requirements?.[0];
              const feeText = item.service?.price;
              const timeText = item.service?.estimatedTime;

              return (
                <button
                  key={`mob-svc-${item.title}`}
                  type="button"
                  onClick={() => {
                    if (item.service) onOpenService(item.service);
                  }}
                  className="w-full text-left bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[15px] p-3.5 shadow-[0_2px_8px_rgba(16,42,67,0.04)] active:scale-[0.99] transition-all group cursor-pointer block"
                >
                  {/* Top Row: Colored Icon + Name & Short Description + Chevron */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        style={{
                          backgroundColor: item.iconBg,
                          borderColor: item.iconBorder,
                          color: item.iconColor,
                        }}
                        className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5"
                      >
                        <SvcIcon className="w-5 h-5" aria-hidden="true" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-[15px] font-bold text-[#102A43] leading-snug group-hover:text-[#2563EB] transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[12.5px] text-[#475569] leading-[1.35] line-clamp-2 mt-0.5">
                          {item.shortDescription}
                        </p>
                      </div>
                    </div>

                    <span
                      aria-hidden="true"
                      className="w-7 h-7 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] group-hover:text-[#2563EB] flex items-center justify-center shrink-0 mt-1"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Bottom Row: Requirement Chip + Fee & Processing Time Chips */}
                  <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] flex flex-wrap items-center gap-1.5 text-[11px] leading-snug">
                    {reqText && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155]">
                        <span className="font-semibold text-[#64748B]">Requirement:</span>
                        <span className="font-semibold text-[#102A43]">{reqText}</span>
                      </span>
                    )}

                    {feeText && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ECFDF5] border border-[#D1FAE5] text-[#065F46] tabular-nums">
                        <span className="font-semibold">Fee:</span>
                        <span className="font-bold">{feeText}</span>
                      </span>
                    )}

                    {timeText && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EFF6FF] border border-[#DBEAFE] text-[#1E40AF] tabular-nums">
                        <span className="font-semibold">Processing:</span>
                        <span className="font-semibold">{timeText}</span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DESKTOP LAYOUT (>= 768px): Preserved Unchanged */}
        <div className="hidden md:flex sm:flex-row sm:items-end justify-between gap-2 pb-2.5 border-b border-[#E2E8F0] px-1 md:px-0">
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

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularServices.map((item) => {
            const facts: PortalCardFact[] = [];
            if (item.service?.requirements?.[0]) {
              facts.push({
                icon: 'requirement',
                label: 'Requirement',
                value: item.service.requirements[0],
              });
            }
            if (item.service?.price) {
              facts.push({
                icon: 'fee',
                label: 'Fee',
                value: item.service.estimatedTime
                  ? `${item.service.price} (${item.service.estimatedTime})`
                  : item.service.price,
              });
            }
            return (
              <ColourAccentCard
                key={item.title}
                categoryType="service"
                categoryLabel="CSC E-Service"
                organisation={
                  item.service ? CATEGORY_LABELS[item.service.category] : 'CSC Digital Seva Desk'
                }
                title={item.title}
                summary={item.shortDescription}
                infoFacts={facts}
                href={item.service ? `/service/${item.service.id}` : undefined}
                actionLabel="View Service →"
                onPrimaryClick={() => {
                  if (item.service) onOpenService(item.service);
                }}
              />
            );
          })}
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
        className="w-full bg-[#F7F9FC] md:bg-transparent border-b border-[#E2E8F0] md:border-0 px-3 md:px-0 py-4 md:p-0 space-y-3.5 md:space-y-5 scroll-mt-20"
      >
        {/* MOBILE LAYOUT (< 768px): Premium Category Header Banner + 2-Column Category Grid */}
        <div className="md:hidden space-y-3">
          {/* Premium Category Header Banner */}
          <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-white via-[#F4F8FF] to-[#EBF3FF] border border-[#DBEAFE] p-3.5 shadow-[0_4px_14px_rgba(37,99,235,0.06)]">
            {/* Subtle decorative accent circles */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#DBEAFE]/40 blur-xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-10 -bottom-6 w-20 h-20 rounded-full bg-[#BFDBFE]/30 blur-lg"
            />

            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#2563EB] uppercase tracking-wider">
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>SERVICE CATEGORIES</span>
                </div>
                <h2 className="text-[23px] font-extrabold text-[#102A43] tracking-tight leading-[1.18] mt-1">
                  Browse Services by Category
                </h2>
                <p className="text-[13px] text-[#475569] leading-[1.38] mt-1">
                  Explore all CSC services across different categories and find the help you need.
                </p>
              </div>

              {/* Lightweight Folder & Documents SVG Illustration */}
              <div
                aria-hidden="true"
                className="w-14 h-14 rounded-2xl bg-white/95 border border-[#DBEAFE] shadow-2xs flex items-center justify-center shrink-0 mt-0.5"
              >
                <svg
                  viewBox="0 0 56 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-11 h-11"
                >
                  {/* Back Document Sheet */}
                  <rect
                    x="14"
                    y="8"
                    width="26"
                    height="30"
                    rx="3.5"
                    fill="#EFF6FF"
                    stroke="#3B82F6"
                    strokeWidth="1.75"
                  />
                  <path
                    d="M19 14H33M19 18.5H29"
                    stroke="#60A5FA"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  {/* Front Service Folder */}
                  <path
                    d="M7 20C7 17.7909 8.79086 16 11 16H21.5L25 20H45C47.2091 20 49 21.7909 49 24V42C49 44.2091 47.2091 46 45 46H11C8.79086 46 7 44.2091 7 42V20Z"
                    fill="#DBEAFE"
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Folder Inner Highlight Flap */}
                  <rect
                    x="11"
                    y="25"
                    width="22"
                    height="14"
                    rx="2.5"
                    fill="#FFFFFF"
                    stroke="#93C5FD"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M15 30H27M15 34H23"
                    stroke="#2563EB"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  {/* Category Check Badge */}
                  <circle
                    cx="41"
                    cy="37"
                    r="6.5"
                    fill="#ECFDF5"
                    stroke="#059669"
                    strokeWidth="1.75"
                  />
                  <path
                    d="M38.3 37L40.2 38.9L43.8 35.2"
                    stroke="#059669"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 2-Column Mobile Category Card Grid */}
          <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2.5">
            {[
              ...directoryCategories,
              {
                id: 'all',
                title: 'All Citizen Services',
                description: 'Browse our complete directory of citizen e-services, certificates, and online forms.',
                icon: LayoutGrid,
                iconBg: '#EEF2FF',
                iconBorder: '#E0E7FF',
                iconColor: '#4F46E5',
                count: SERVICES_LIST.length,
              },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={`mob-cat-${cat.id}`}
                  type="button"
                  onClick={() => selectServiceDirectoryCategory(cat.id)}
                  className="w-full text-left bg-white border border-[#E2E8F0] hover:border-[#BFDBFE] rounded-[16px] p-3 shadow-[0_2px_8px_rgba(16,42,67,0.04)] active:scale-[0.99] transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div
                      style={{
                        backgroundColor: cat.iconBg,
                        borderColor: cat.iconBorder,
                        color: cat.iconColor,
                      }}
                      className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mb-2"
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>

                    <h3 className="text-[13.5px] font-bold text-[#102A43] leading-[1.25] group-hover:text-[#2563EB] transition-colors">
                      {cat.title}
                    </h3>

                    <p className="text-[11.5px] text-[#475569] leading-[1.35] line-clamp-2 mt-1">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] flex items-center justify-between gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0] tabular-nums">
                      {cat.count} Services
                    </span>
                    <span
                      aria-hidden="true"
                      className="w-6 h-6 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0 group-hover:bg-[#2563EB] group-hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DESKTOP LAYOUT (>= 768px): Preserved Unchanged */}
        <div className="hidden md:flex sm:flex-row sm:items-end justify-between gap-2 pb-1 md:border-b md:border-[#E2E8F0] md:pb-3">
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

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            infoFacts={[
              { icon: 'benefit', label: 'Benefit', value: '₹6,000 / year (DBT)' },
              { icon: 'region', label: 'Region', value: 'All India' },
            ]}
            officialHref="https://pmkisan.gov.in"
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
            infoFacts={[
              { icon: 'benefit', label: 'Benefit', value: 'Up to ₹5 Lakh / family' },
              { icon: 'region', label: 'Region', value: 'J&K SEHAT & All India' },
            ]}
            officialHref="https://beneficiary.nha.gov.in"
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
            infoFacts={[
              { icon: 'benefit', label: 'Benefit', value: 'Social Security & DBT' },
              { icon: 'region', label: 'Region', value: 'J&K & National Portal' },
            ]}
            officialHref="https://eshram.gov.in"
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
    </div>
  );
}
