import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  ArrowRight,
  Clock,
  GraduationCap,
  Briefcase,
  Award,
  Calendar,
  Sparkles,
  Archive,
  SlidersHorizontal,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Users,
  BookOpen,
} from 'lucide-react';
import {
  SarkariItem,
  isIgnouItem,
  isEducationSarkariItem,
  isRecruitmentSarkariItem,
} from '../../data/sarkariData';
import { getDeduplicatedSarkariPosts, resolvePostOrg } from '../../data/sarkariMigration';
import { computeSarkariStatus, parseDateToKolkataMs, type ComputedSarkariStatus } from '../../utils/sarkariStatus';
import { useSyncedSarkariPosts } from '../../utils/postDataSync';
import { useLanguage, type Language } from '../../contexts/LanguageContext';
import {
  AdSlot,
  AlertsBox,
  Breadcrumbs,
  Card,
  Chip,
  DateBlock,
  FilterChip,
  HelpApplyingCard,
  StatusPill,
  TabsWithCounts,
  type BreadcrumbItem,
  type TabWithCountItem,
} from '../ui';

export type ListStatusTabId = 'open_now' | 'exams' | 'results' | 'upcoming' | 'archive';
export type QualificationFilterId = 'all' | '10th' | '12th' | 'diploma' | 'graduate' | 'postgraduate';
export type SortOptionId = 'nearest' | 'newest';

export interface SarkariListPageProps {
  mode?: 'all' | 'jobs' | 'education';
  initialTab?: string;
  educationSubRoute?: boolean;
  onNavigateRoute?: (path: string) => void;
  onOpenDedicatedPage?: (item: SarkariItem) => void;
  onApplyService?: (serviceName: string) => void;
}

const ITEMS_PER_PAGE = 20;

const JOBS_PRIMARY_ORGS = ['JKSSB', 'SSC', 'RRB', 'Indian Army', 'IBPS / Banking'] as const;
const EDU_PRIMARY_ORGS = ['IGNOU', 'University of Kashmir', 'Cluster University Srinagar', 'NTA'] as const;

function mapInitialTabToOrg(
  initialTab?: string,
  mode?: 'all' | 'jobs' | 'education',
  educationSubRoute?: boolean
): string {
  if (educationSubRoute || initialTab === 'ignou') return 'IGNOU';
  switch (initialTab) {
    case 'jkssb':
      return 'JKSSB';
    case 'ssc_jobs':
      return 'SSC';
    case 'rrb_jobs':
      return 'RRB';
    case 'army_jobs':
      return 'Indian Army';
    case 'banking_jobs':
      return 'IBPS / Banking';
    case 'cluster_univ':
      return 'Cluster University Srinagar';
    case 'exam_forms':
    case 'admissions':
      return 'University of Kashmir';
    default:
      return mode === 'education' && educationSubRoute ? 'IGNOU' : 'all';
  }
}

function getOrgGroupKey(item: SarkariItem, section: 'jobs' | 'education'): string {
  const org = item.org || resolvePostOrg(item);
  if (section === 'jobs') {
    if ((JOBS_PRIMARY_ORGS as readonly string[]).includes(org)) return org;
    return '__other__';
  }
  if (org === 'NTA' || org === 'NTA / IIT') return 'NTA';
  if ((EDU_PRIMARY_ORGS as readonly string[]).includes(org)) return org;
  return '__other__';
}

const GENERIC_QUAL_REGEX =
  /^(as per (official )?(notice|notification|rules)|refer (to )?(official )?(notice|notification)|check (official )?notice|see (official )?notice|not specified|n\/a|-)$/i;

function hasSpecificDegreeKeyword(parts: string): boolean {
  return (
    /\b10th\b|matric|sslc/i.test(parts) ||
    /\b12th\b|10\+2|higher secondary|intermediate/i.test(parts) ||
    /\bdiploma\b|\biti\b|polytechnic|b\.?ed\b|d\.?el\.?ed|b\.?el\.?ed|certificate course/i.test(parts) ||
    /\bgraduate\b|\bgraduation\b|\bbachelor|\bdegree\b|\bb\.?tech\b|\bb\.?e\b|\bb\.?sc\b|\bb\.?a\b|\bb\.?com\b|\bug\b/i.test(parts) ||
    /post\s*graduate|\bpg\b|\bmaster|\bm\.?sc\b|\bm\.?a\b|\bm\.?com\b|\bm\.?tech\b|\bm\.?ed\b|\bphd\b|\bm\.?phil\b/i.test(parts)
  );
}

function isUnspecifiedQualification(item: SarkariItem): boolean {
  const explicitQual = (item.qualification || item.eligibility || '').trim();
  const tableQuals = (item.vacancyTable || [])
    .map((v) => `${v.postName} ${v.qualification}`)
    .filter(Boolean)
    .join(' ');
  const combined = [explicitQual, item.title, item.shortInfo, item.summary, tableQuals]
    .filter(Boolean)
    .join(' ');

  if (!explicitQual || GENERIC_QUAL_REGEX.test(explicitQual)) {
    return !hasSpecificDegreeKeyword(combined);
  }
  return !hasSpecificDegreeKeyword(combined);
}

function matchesQualificationFilter(item: SarkariItem, filter: QualificationFilterId): boolean {
  if (filter === 'all') return true;
  if (isUnspecifiedQualification(item)) return true;

  const parts = [
    item.qualification,
    item.eligibility,
    item.title,
    item.shortInfo,
    item.summary,
    ...(item.vacancyTable || []).map((v) => `${v.postName} ${v.qualification}`),
  ]
    .filter(Boolean)
    .join(' ');

  switch (filter) {
    case '10th':
      return /\b10th\b|matric|sslc/i.test(parts);
    case '12th':
      return /\b12th\b|10\+2|higher secondary|intermediate/i.test(parts);
    case 'diploma':
      return /\bdiploma\b|\biti\b|polytechnic|b\.?ed\b|d\.?el\.?ed|b\.?el\.?ed|certificate course/i.test(parts);
    case 'graduate':
      return /\bgraduate\b|\bgraduation\b|\bbachelor|\bdegree\b|\bb\.?tech\b|\bb\.?e\b|\bb\.?sc\b|\bb\.?a\b|\bb\.?com\b|\bug\b/i.test(parts);
    case 'postgraduate':
      return /post\s*graduate|\bpg\b|\bmaster|\bm\.?sc\b|\bm\.?a\b|\bm\.?com\b|\bm\.?tech\b|\bm\.?ed\b|\bphd\b|\bm\.?phil\b/i.test(parts);
    default:
      return true;
  }
}

function getBucketForPost(st: ComputedSarkariStatus): ListStatusTabId {
  if (st.isArchiveBucket || st.computedStatus === 'closed') return 'archive';
  if (st.stage === 'answer_key' || st.stage === 'objection_window') return 'results';
  if (st.computedStatus === 'upcoming') return 'upcoming';
  if (st.computedStatus === 'open' || st.computedStatus === 'closing_soon') return 'open_now';
  if (st.computedStatus === 'exam') return 'exams';
  if (st.computedStatus === 'result') return 'results';
  return 'archive';
}

function getPostTimestampMs(dateStr?: string): number {
  const parsed = parseDateToKolkataMs(dateStr, undefined, false);
  return parsed ? parsed.timestampMs : 0;
}

function getLocalizedStatusLabel(st: ComputedSarkariStatus, language: Language): string {
  if (!st.isArchiveBucket && st.computedStatus === 'closing_soon' && (st.stage === 'answer_key' || st.stage === 'objection_window')) {
    if (language === 'hi') return `आपत्ति तक ${st.dateValue}`;
    if (language === 'ur') return `اعتراض تک ${st.dateValue}`;
    return `Objections till ${st.dateValue}`;
  }
  if (language === 'en') return st.badgeLabel;

  if (language === 'hi') {
    if (st.computedStatus === 'open') return 'अभी खुला';
    if (st.computedStatus === 'closing_soon') {
      if (st.daysRemaining === 0) return 'आज अंतिम दिन';
      if (st.daysRemaining !== null) return `${st.daysRemaining} दिन शेष`;
      return 'जल्द बंद';
    }
    if (st.computedStatus === 'exam') {
      if (st.stage === 'admit_card') return 'एडमिट कार्ड';
      if (st.stage === 'document_verification') return 'दस्तावेज़ सत्यापन';
      if (st.stage === 'rc_update') return 'आरसी अपडेट';
      return 'परीक्षा कार्यक्रम';
    }
    if (st.computedStatus === 'result') {
      if (st.stage === 'answer_key' || st.stage === 'objection_window') return 'उत्तर कुंजी';
      return 'परिणाम घोषित';
    }
    if (st.computedStatus === 'upcoming') return 'आगामी';
    return 'बंद';
  }

  // Urdu
  if (st.computedStatus === 'open') return 'ابھی کھلا ہے';
  if (st.computedStatus === 'closing_soon') {
    if (st.daysRemaining === 0) return 'آج آخری دن';
    if (st.daysRemaining !== null) return `${st.daysRemaining} دن باقی`;
    return 'جلد بند ہوگا';
  }
  if (st.computedStatus === 'exam') {
    if (st.stage === 'admit_card') return 'ایڈمٹ کارڈ';
    if (st.stage === 'document_verification') return 'دستاویزات کی تصدیق';
    if (st.stage === 'rc_update') return 'آر سی اپ ڈیٹ';
    return 'امتحانی شیڈول';
  }
  if (st.computedStatus === 'result') {
    if (st.stage === 'answer_key' || st.stage === 'objection_window') return 'انسر کی';
    return 'نتیجہ جاری';
  }
  if (st.computedStatus === 'upcoming') return 'جلد آرہا ہے';
  return 'بند';
}

function getLocalizedDateLabel(st: ComputedSarkariStatus, language: Language): string {
  if (language === 'en') return st.dateLabel;
  if (language === 'hi') {
    switch (st.dateLabel) {
      case 'Apply by':
        return 'अंतिम तिथि';
      case 'Closed on':
        return 'बंद तिथि';
      case 'Opens':
        return 'आवेदन शुरू';
      case 'Exam on':
        return 'परीक्षा तिथि';
      case 'DV on':
        return 'सत्यापन तिथि';
      case 'Result out':
        return 'परिणाम तिथि';
      case 'Key out':
        return 'उत्तर कुंजी';
      case 'Objections till':
        return 'आपत्ति अंतिम तिथि';
      case 'Edit till':
        return 'सुधार अंतिम तिथि';
      case 'Edit window':
        return 'सुधार अवधि';
      case 'Admit card out':
        return 'प्रवेश पत्र';
      case 'Exam / Window':
        return 'परीक्षा अवधि';
      case 'Scheduled on':
        return 'निर्धारित तिथि';
      case 'Held on':
        return 'आयोजन तिथि';
      default:
        return 'तिथि';
    }
  }
  // Urdu
  switch (st.dateLabel) {
    case 'Apply by':
      return 'آخری تاریخ';
    case 'Closed on':
      return 'بند ہونے کی تاریخ';
    case 'Opens':
      return 'درخواست شروع';
    case 'Exam on':
      return 'امتحان کی تاریخ';
    case 'DV on':
      return 'تصدیق کی تاریخ';
    case 'Result out':
      return 'نتیجہ کی تاریخ';
    case 'Key out':
      return 'انسر کی تاریخ';
    case 'Objections till':
      return 'اعتراض کی آخری تاریخ';
    case 'Edit till':
      return 'تصحیح کی آخری تاریخ';
    case 'Edit window':
      return 'تصحیح کا وقت';
    case 'Admit card out':
      return 'ایڈمٹ کارڈ';
    case 'Exam / Window':
      return 'امتحان کی مدت';
    case 'Scheduled on':
      return 'مقررہ تاریخ';
    case 'Held on':
      return 'منعقدہ تاریخ';
    default:
      return 'تاریخ';
  }
}

function getLocalizedDateHint(st: ComputedSarkariStatus, language: Language): string | undefined {
  if (!st.dateHint || language === 'en') return st.dateHint;
  if (language === 'hi') {
    if (st.dateHint === 'Closes today') return 'आज अंतिम दिन';
    if (st.dateHint === 'Archived') return 'पुरालेख';
    if (st.dateHint === 'Published') return 'प्रकाशन';
    if (st.dateHint === 'Concluded') return 'संपन्न';
    if (st.dateHint === 'Download active') return 'डाउनलोड उपलब्ध';
    if (st.daysRemaining !== null && st.dateHint.endsWith('d left')) {
      return `${st.daysRemaining} दिन शेष`;
    }
    return st.dateHint;
  }
  if (st.dateHint === 'Closes today') return 'آج آخری دن';
  if (st.dateHint === 'Archived') return 'آرکائیو';
  if (st.dateHint === 'Published') return 'جاری';
  if (st.dateHint === 'Concluded') return 'مکمل';
  if (st.dateHint === 'Download active') return 'ڈاؤن لوڈ دستیاب';
  if (st.daysRemaining !== null && st.dateHint.endsWith('d left')) {
    return `${st.daysRemaining} دن باقی`;
  }
  return st.dateHint;
}

const OFFICIAL_PORTALS_LIST = [
  { label: 'JKSSB Portal', url: 'https://jkssb.nic.in', section: 'jobs' as const },
  { label: 'Join Indian Army', url: 'https://joinindianarmy.nic.in', section: 'jobs' as const },
  { label: 'Staff Selection Commission (SSC)', url: 'https://ssc.gov.in', section: 'jobs' as const },
  { label: 'Railway Recruitment (RRB)', url: 'https://www.rrbapply.gov.in', section: 'jobs' as const },
  { label: 'Kashmir University', url: 'https://kashmiruniversity.net', section: 'education' as const },
  { label: 'Cluster University Srinagar', url: 'https://cusrinagar.edu.in', section: 'education' as const },
  { label: 'IGNOU Official Announcements', url: 'https://www.ignou.ac.in/announcements/0?nav=1', section: 'education' as const },
];

export default function SarkariListPage({
  mode = 'jobs',
  initialTab,
  educationSubRoute = false,
  onNavigateRoute,
  onOpenDedicatedPage,
}: SarkariListPageProps) {
  const { language, t } = useLanguage();
  const allPosts = useSyncedSarkariPosts();
  const listTopRef = useRef<HTMLDivElement | null>(null);
  const pendingOrgRef = useRef<string | null>(null);

  const effectiveSection: 'jobs' | 'education' = mode === 'education' ? 'education' : 'jobs';

  const [searchQuery, setSearchQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState<string>(() =>
    mapInitialTabToOrg(initialTab, mode, educationSubRoute)
  );
  const [qualificationFilter, setQualificationFilter] = useState<QualificationFilterId>('all');
  const [jkOnly, setJkOnly] = useState(false);
  const [activeStatusTab, setActiveStatusTab] = useState<ListStatusTabId>('open_now');
  const [sortOption, setSortOption] = useState<SortOptionId>('nearest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (pendingOrgRef.current !== null) {
      setOrgFilter(pendingOrgRef.current);
      pendingOrgRef.current = null;
    } else {
      setOrgFilter(mapInitialTabToOrg(initialTab, mode, educationSubRoute));
    }
    setCurrentPage(1);
    setActiveStatusTab('open_now');
    setSearchQuery('');
    setQualificationFilter('all');
    setJkOnly(false);
  }, [mode, initialTab, educationSubRoute]);

  useEffect(() => {
    setSortOption(activeStatusTab === 'open_now' || activeStatusTab === 'upcoming' ? 'nearest' : 'newest');
    setCurrentPage(1);
  }, [activeStatusTab]);

  // 1. Deduplicate + compute IST status for every post in the current section
  const evaluatedPosts = useMemo(() => {
    const deduplicated = getDeduplicatedSarkariPosts(allPosts);
    return deduplicated
      .filter((item) => {
        if (item.isCancelled) return false;
        if (mode === 'education') return isEducationSarkariItem(item);
        if (mode === 'jobs') return isRecruitmentSarkariItem(item);
        return true;
      })
      .map((item) => {
        const st = computeSarkariStatus(item);
        const orgKey = getOrgGroupKey(item, effectiveSection);
        const bucket = getBucketForPost(st);
        return { item, st, orgKey, bucket };
      })
      .filter((entry) => entry.st.verificationStatus !== 'needs_verification');
  }, [allPosts, mode, effectiveSection]);

  // 2. Closing-within-7-days highlight rail (scoped to section, and to IGNOU when on /education/ignou)
  const closingSoonRail = useMemo(() => {
    return evaluatedPosts
      .filter(({ item, st }) => {
        if (educationSubRoute && !isIgnouItem(item)) return false;
        const isActiveCountdown =
          st.isOpen ||
          st.stage === 'answer_key' ||
          st.stage === 'objection_window' ||
          st.stage === 'correction';
        return !st.isArchiveBucket && isActiveCountdown && st.daysRemaining !== null && st.daysRemaining <= 7;
      })
      .sort((a, b) => (a.st.daysRemaining ?? 99) - (b.st.daysRemaining ?? 99));
  }, [evaluatedPosts, educationSubRoute]);

  // 3. Apply Search + Qualification + J&K filters (used for org counts & combined pipeline)
  const baseSearchQualJkFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return evaluatedPosts.filter(({ item }) => {
      if (jkOnly && !item.jkDomicile) return false;
      if (!matchesQualificationFilter(item, qualificationFilter)) return false;
      if (!q) return true;
      const haystack = [
        item.title,
        item.summary,
        item.shortInfo,
        item.org,
        item.department,
        item.institution,
        item.qualification,
        item.eligibility,
        item.advertisementNo,
        item.learnerGroup,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [evaluatedPosts, searchQuery, qualificationFilter, jkOnly]);

  // 4. Org filter options with live matching counts
  const orgChips = useMemo(() => {
    const primaryList = effectiveSection === 'jobs' ? JOBS_PRIMARY_ORGS : EDU_PRIMARY_ORGS;
    const countMap: Record<string, number> = {};
    for (const entry of baseSearchQualJkFiltered) {
      countMap[entry.orgKey] = (countMap[entry.orgKey] || 0) + 1;
    }

    const totalCount = baseSearchQualJkFiltered.length;
    const chips: Array<{ id: string; label: string; count: number }> = [
      { id: 'all', label: t.filterAll, count: totalCount },
    ];

    for (const orgName of primaryList) {
      const basePresence = evaluatedPosts.some((e) => e.orgKey === orgName);
      if (basePresence) {
        chips.push({
          id: orgName,
          label:
            orgName === 'Cluster University Srinagar'
              ? 'Cluster Univ'
              : orgName === 'University of Kashmir'
              ? 'Kashmir Univ'
              : orgName === 'IBPS / Banking'
              ? 'Banking'
              : orgName,
          count: countMap[orgName] || 0,
        });
      }
    }

    const hasOther = evaluatedPosts.some((e) => e.orgKey === '__other__');
    if (hasOther) {
      chips.push({
        id: '__other__',
        label: t.filterOther,
        count: countMap.__other__ || 0,
      });
    }

    return chips;
  }, [effectiveSection, baseSearchQualJkFiltered, evaluatedPosts, t.filterAll, t.filterOther]);

  // 5. Combined filter including Organisation (feeds the 5 status tabs & their counts)
  const filteredAcrossTabs = useMemo(() => {
    if (orgFilter === 'all') return baseSearchQualJkFiltered;
    return baseSearchQualJkFiltered.filter((entry) => entry.orgKey === orgFilter);
  }, [baseSearchQualJkFiltered, orgFilter]);

  // 6. Status tab counts strictly synchronized with ALL active filters
  const statusTabCounts = useMemo(() => {
    const counts: Record<ListStatusTabId, number> = {
      open_now: 0,
      exams: 0,
      results: 0,
      upcoming: 0,
      archive: 0,
    };
    for (const entry of filteredAcrossTabs) {
      counts[entry.bucket] += 1;
    }
    return counts;
  }, [filteredAcrossTabs]);

  const statusTabs: TabWithCountItem[] = useMemo(
    () => [
      {
        id: 'open_now',
        label: t.tabOpenNow,
        count: statusTabCounts.open_now,
        icon: <Clock className="w-4 h-4" />,
      },
      {
        id: 'exams',
        label: t.tabExamsAdmitCards,
        count: statusTabCounts.exams,
        icon: <Calendar className="w-4 h-4" />,
      },
      {
        id: 'results',
        label: t.tabResultsKeys,
        count: statusTabCounts.results,
        icon: <Award className="w-4 h-4" />,
      },
      {
        id: 'upcoming',
        label: t.tabUpcoming,
        count: statusTabCounts.upcoming,
        icon: <Sparkles className="w-4 h-4" />,
      },
      {
        id: 'archive',
        label: t.tabArchive,
        count: statusTabCounts.archive,
        icon: <Archive className="w-4 h-4" />,
      },
    ],
    [t, statusTabCounts]
  );

  // 7. Current tab sorted items
  const currentTabItems = useMemo(() => {
    const subset = filteredAcrossTabs.filter((entry) => entry.bucket === activeStatusTab);
    return [...subset].sort((a, b) => {
      if (sortOption === 'nearest' && (activeStatusTab === 'open_now' || activeStatusTab === 'upcoming')) {
        const aDays = a.st.daysRemaining ?? 9999;
        const bDays = b.st.daysRemaining ?? 9999;
        if (aDays !== bDays) return aDays - bDays;
        const aTarget = getPostTimestampMs(a.item.applyEnd || a.item.applyStart || a.item.lastDate || a.item.startDate);
        const bTarget = getPostTimestampMs(b.item.applyEnd || b.item.applyStart || b.item.lastDate || b.item.startDate);
        if (aTarget && bTarget && aTarget !== bTarget) return aTarget - bTarget;
      }
      const aPost = getPostTimestampMs(a.item.postedAt || a.item.postDate);
      const bPost = getPostTimestampMs(b.item.postedAt || b.item.postDate);
      return bPost - aPost;
    });
  }, [filteredAcrossTabs, activeStatusTab, sortOption]);

  // 8. Pagination (20 items per page)
  const totalPages = Math.max(1, Math.ceil(currentTabItems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return currentTabItems.slice(start, start + ITEMS_PER_PAGE);
  }, [currentTabItems, safePage]);

  const handleSelectOrgChip = (nextOrgId: string) => {
    setCurrentPage(1);
    if (educationSubRoute && nextOrgId !== 'IGNOU' && onNavigateRoute) {
      pendingOrgRef.current = nextOrgId;
      onNavigateRoute('/education');
      return;
    }
    setOrgFilter(nextOrgId);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setQualificationFilter('all');
    setJkOnly(false);
    setCurrentPage(1);
    if (educationSubRoute && onNavigateRoute) {
      pendingOrgRef.current = 'all';
      onNavigateRoute('/education');
    } else {
      setOrgFilter(educationSubRoute ? 'IGNOU' : 'all');
    }
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    qualificationFilter !== 'all' ||
    jkOnly ||
    orgFilter !== (educationSubRoute ? 'IGNOU' : 'all');

  const handlePostClick = (e: React.MouseEvent<HTMLElement>, item: SarkariItem) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    if (onOpenDedicatedPage) {
      e.preventDefault();
      onOpenDedicatedPage(item);
    }
  };

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(nextPage);
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Breadcrumbs & Heading copy
  const isIgnouPage = mode === 'education' && (educationSubRoute || orgFilter === 'IGNOU');

  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    if (mode === 'education') {
      if (educationSubRoute) {
        return [
          { label: t.navHome, href: '/' },
          { label: t.educationPageTitle, href: '/education' },
          { label: 'IGNOU' },
        ];
      }
      return [
        { label: t.navHome, href: '/' },
        { label: t.educationPageTitle },
      ];
    }
    return [
      { label: t.navHome, href: '/' },
      { label: t.jobsPageTitle },
    ];
  }, [mode, educationSubRoute, t]);

  const crossLinkHref = mode === 'education' ? '/jobs' : '/education';
  const crossLinkLabel = mode === 'education' ? t.jobsPageTitle : t.educationPageTitle;

  const pageTitle =
    mode === 'education'
      ? educationSubRoute
        ? t.ignouPageTitle
        : t.educationPageTitle
      : t.jobsPageTitle;

  const pageSubtitle =
    mode === 'education'
      ? educationSubRoute
        ? t.ignouPageSubtitle
        : t.educationPageSubtitle
      : t.jobsPageSubtitle;

  const nonEmptyOtherTabs = statusTabs.filter(
    (tab) => tab.id !== activeStatusTab && (tab.count ?? 0) > 0
  );

  const visiblePortals = OFFICIAL_PORTALS_LIST.filter(
    (p) => p.section === effectiveSection
  );

  const showingFrom = currentTabItems.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const showingTo = Math.min(safePage * ITEMS_PER_PAGE, currentTabItems.length);

  return (
    <section
      aria-labelledby="list-page-heading"
      className="w-full bg-[var(--bg-page)] text-[var(--text-primary)] pb-12 sm:pb-16"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-5 sm:space-y-6">
        {/* 1. Single Breadcrumb Bar + Cross-link */}
        <Breadcrumbs
          items={breadcrumbItems}
          onNavigate={onNavigateRoute}
          rightSlot={
            <a
              href={crossLinkHref}
              onClick={(e) => {
                if (onNavigateRoute) {
                  e.preventDefault();
                  onNavigateRoute(crossLinkHref);
                }
              }}
              className="min-h-[40px] inline-flex items-center gap-1 text-sm font-semibold text-[var(--text-primary)] hover:text-[#1F9D6B] hover:underline no-underline whitespace-nowrap"
            >
              <span>{crossLinkLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 shrink-0" aria-hidden="true" />
            </a>
          }
        />

        {/* 2. Page Header */}
        <header className="space-y-2.5 text-start">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)]">
              {effectiveSection === 'education' ? (
                <GraduationCap className="w-3.5 h-3.5 text-[#1F9D6B]" aria-hidden="true" />
              ) : (
                <Briefcase className="w-3.5 h-3.5 text-[#F5A623]" aria-hidden="true" />
              )}
              <span>{evaluatedPosts.length}</span>
            </span>

            {educationSubRoute && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[var(--status-exam-bg)] border border-[var(--status-exam-border)] text-[var(--status-exam-text)] text-xs font-semibold">
                ODL · Online · GOAL · E-Vidya Bharti · RC Srinagar
              </span>
            )}
          </div>

          <h1
            id="list-page-heading"
            className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight m-0"
          >
            {pageTitle}
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed m-0">
            {pageSubtitle}
          </p>

          {mode === 'education' && !educationSubRoute && (
            <div className="pt-0.5">
              <a
                href="/education/ignou"
                onClick={(e) => {
                  if (onNavigateRoute) {
                    e.preventDefault();
                    onNavigateRoute('/education/ignou');
                  }
                }}
                className="min-h-[40px] inline-flex items-center gap-1.5 text-sm font-bold text-[#1F9D6B] hover:underline no-underline"
              >
                <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t.browseIgnouLink}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 shrink-0" aria-hidden="true" />
              </a>
            </div>
          )}

          {mode === 'education' && educationSubRoute && (
            <div className="pt-0.5">
              <a
                href="/education"
                onClick={(e) => {
                  if (onNavigateRoute) {
                    e.preventDefault();
                    onNavigateRoute('/education');
                  }
                }}
                className="min-h-[40px] inline-flex items-center gap-1.5 text-sm font-bold text-[var(--text-primary)] hover:text-[#1F9D6B] hover:underline no-underline"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180 shrink-0" aria-hidden="true" />
                <span>{t.backToAllEducation}</span>
              </a>
            </div>
          )}
        </header>

        {/* 3. Closing Within 7 Days Urgent Rail */}
        {closingSoonRail.length > 0 && (
          <section
            aria-label={t.closingSoonRailTitle}
            className="rounded-2xl border border-[var(--status-closing-border)] bg-[var(--status-closing-bg)] p-3.5 sm:p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2 text-start">
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="w-4 h-4 text-[var(--status-closing-text)] shrink-0" aria-hidden="true" />
                <h2 className="text-sm sm:text-base font-extrabold text-[var(--status-closing-text)] m-0 truncate">
                  {t.closingSoonRailTitle}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--status-closing-border)] text-xs font-bold tabular-nums shrink-0">
                  {closingSoonRail.length}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 snap-x">
              {closingSoonRail.map(({ item, st }) => {
                const org = item.org || resolvePostOrg(item);
                const urgentText =
                  st.daysRemaining === 0
                    ? t.closingToday
                    : st.daysRemaining !== null
                    ? t.urgentDaysLeft(st.daysRemaining)
                    : st.badgeLabel;
                return (
                  <a
                    key={`rail-${item.id}`}
                    href={`/post/${item.id}`}
                    onClick={(e) => handlePostClick(e, item)}
                    className="snap-start shrink-0 w-[256px] sm:w-[290px] min-h-[44px] bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--status-closing-border)] rounded-xl p-3 flex flex-col justify-between gap-2 no-underline transition-colors text-start"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)] truncate">
                        {org}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[var(--status-closing-bg)] text-[var(--status-closing-text)] border border-[var(--status-closing-border)] text-[11px] font-bold tabular-nums shrink-0">
                        {urgentText}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[var(--text-primary)] line-clamp-2 leading-snug m-0">
                      {item.title}
                    </p>
                    <div className="text-xs font-semibold text-[var(--text-secondary)] tabular-nums">
                      {getLocalizedDateLabel(st, language)}: {st.dateValue}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Fixed-height AdSlot after urgent rail (never near action buttons) */}
        <AdSlot />

        {/* 4. Filter Bar (Search + Org Chips + Qualification + J&K Toggle) */}
        <div
          ref={listTopRef}
          className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-2xs scroll-mt-20"
        >
          {/* Search + Qualification + J&K Toggle Row */}
          <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center">
            <div className="relative flex-1 min-w-0">
              <Search
                className="w-4 h-4 text-[var(--text-muted)] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={
                  effectiveSection === 'education'
                    ? t.eduSearchPlaceholder
                    : t.jobsSearchPlaceholder
                }
                aria-label={t.searchButton}
                className="w-full min-h-[44px] ps-10 pe-10 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] focus:border-[#101A36] dark:focus:border-[#F5A623] rounded-xl text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  aria-label={t.clearSearch}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] absolute end-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-0">
                <label htmlFor="qualification-filter" className="sr-only">
                  {t.filterQualificationLabel}
                </label>
                <div className="relative flex-1 sm:w-48">
                  <SlidersHorizontal
                    className="w-4 h-4 text-[var(--text-muted)] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <select
                    id="qualification-filter"
                    value={qualificationFilter}
                    onChange={(e) => {
                      setQualificationFilter(e.target.value as QualificationFilterId);
                      setCurrentPage(1);
                    }}
                    className="w-full min-h-[44px] ps-9 pe-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl text-sm font-semibold text-[var(--text-primary)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                  >
                    <option value="all">{t.qualAll}</option>
                    <option value="10th">{t.qual10th}</option>
                    <option value="12th">{t.qual12th}</option>
                    <option value="diploma">{t.qualDiploma}</option>
                    <option value="graduate">{t.qualGraduate}</option>
                    <option value="postgraduate">{t.qualPostgraduate}</option>
                  </select>
                </div>
              </div>

              <FilterChip
                label={t.filterJkDomicileOnly}
                active={jkOnly}
                onClick={() => {
                  setJkOnly((prev) => !prev);
                  setCurrentPage(1);
                }}
                className="shrink-0"
              />
            </div>
          </div>

          {/* Organisation / Institution Filter Chips */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block text-start">
              {effectiveSection === 'education' ? t.filterInstLabel : t.filterOrgLabel}
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {orgChips.map((chip) => (
                <FilterChip
                  key={chip.id}
                  label={chip.label}
                  count={chip.count}
                  active={orgFilter === chip.id}
                  onClick={() => handleSelectOrgChip(chip.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 5. Status Tabs (5 Mutually Exclusive Buckets with Synchronized Counts) */}
        <div className="space-y-2">
          <TabsWithCounts
            tabs={statusTabs}
            activeTabId={activeStatusTab}
            onChange={(id) => setActiveStatusTab(id as ListStatusTabId)}
            ariaLabel={pageTitle}
          />
        </div>

        {/* 6. Main 2-Column Layout (List + 320px Sticky Desktop Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          {/* MAIN LIST COLUMN */}
          <div className="min-w-0 space-y-4">
            {/* Results Count + Sort Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--text-secondary)] px-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                  {currentTabItems.length === 0
                    ? '0'
                    : `${showingFrom}–${showingTo} / ${currentTabItems.length}`}
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-[#1F9D6B] hover:underline cursor-pointer px-1.5 py-1"
                  >
                    {t.resetFilters}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="list-sort-select"
                  className="text-xs font-semibold text-[var(--text-muted)]"
                >
                  {t.sortLabel}:
                </label>
                <select
                  id="list-sort-select"
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value as SortOptionId);
                    setCurrentPage(1);
                  }}
                  className="min-h-[38px] px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                >
                  {(activeStatusTab === 'open_now' || activeStatusTab === 'upcoming') && (
                    <option value="nearest">{t.sortNearestDeadline}</option>
                  )}
                  <option value="newest">{t.sortNewestPosted}</option>
                </select>
              </div>
            </div>

            {/* Cards List */}
            {paginatedItems.length > 0 ? (
              <div className="space-y-3">
                {paginatedItems.map(({ item, st }, index) => {
                  const orgLabel = item.org || resolvePostOrg(item);
                  const qualificationText = item.qualification || item.eligibility;
                  const showVacancies =
                    Boolean(item.totalPosts) &&
                    item.posts !== 'As per official notice' &&
                    item.totalPosts !== 'N/A';

                  return (
                    <React.Fragment key={item.id}>
                      <Card
                        as="article"
                        statusStripe={st.computedStatus}
                        className="p-4 sm:p-5 space-y-3.5 transition-colors hover:border-[var(--border-strong)]"
                      >
                        {/* Top Badges Row */}
                        <div className="flex flex-wrap items-center gap-2 text-start">
                          <StatusPill
                            status={st.computedStatus}
                            label={getLocalizedStatusLabel(st, language)}
                          />
                          <Chip>{orgLabel}</Chip>
                          {item.jkDomicile && (
                            <Chip variant="verified">{t.jkDomicileBadge}</Chip>
                          )}
                          {isIgnouItem(item) && item.learnerGroup && (
                            <Chip variant="accent">{item.learnerGroup}</Chip>
                          )}
                        </div>

                        {/* Title + Summary + DateBlock */}
                        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_180px] gap-3 sm:gap-4 items-start text-start">
                          <div className="space-y-1.5 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold leading-snug m-0">
                              <a
                                href={`/post/${item.id}`}
                                onClick={(e) => handlePostClick(e, item)}
                                className="text-[var(--text-primary)] hover:text-[#1F9D6B] hover:underline no-underline transition-colors break-words"
                              >
                                {item.title}
                              </a>
                            </h3>

                            {(item.summary || item.shortInfo) && (
                              <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed m-0">
                                {item.summary || item.shortInfo}
                              </p>
                            )}

                            {/* Compact Facts (Max 3) */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                              {showVacancies && (
                                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)] tabular-nums">
                                  <Users className="w-3.5 h-3.5 text-[#1F9D6B] shrink-0" aria-hidden="true" />
                                  <span>
                                    {t.vacanciesLabel}: {item.totalPosts}
                                  </span>
                                </span>
                              )}

                              {qualificationText && (
                                <span className="inline-flex flex-wrap items-center gap-1.5 max-w-full">
                                  <GraduationCap className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                                  <span className="line-clamp-1">
                                    <strong className="font-semibold text-[var(--text-primary)]">
                                      {t.qualificationLabel}:
                                    </strong>{' '}
                                    {qualificationText}
                                  </span>
                                  {isUnspecifiedQualification(item) && (
                                    <span className="px-1.5 py-0.5 rounded bg-[var(--status-closing-bg)] border border-[var(--status-closing-border)] text-[var(--status-closing-text)] text-[11px] font-bold whitespace-nowrap shrink-0">
                                      {t.checkNoticeTag}
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          <DateBlock
                            compact
                            tone={st.computedStatus}
                            label={getLocalizedDateLabel(st, language)}
                            dateText={st.dateValue}
                            hint={getLocalizedDateHint(st, language)}
                            className="w-full sm:w-auto"
                          />
                        </div>

                        {/* Footer Meta + Action Link */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-default)] text-xs text-[var(--text-muted)]">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums min-w-0">
                            {item.postDate && <span>{item.postDate}</span>}
                            {item.advertisementNo && (
                              <span className="truncate max-w-[200px] sm:max-w-[280px]">
                                {item.advertisementNo}
                              </span>
                            )}
                          </div>

                          <a
                            href={`/post/${item.id}`}
                            onClick={(e) => handlePostClick(e, item)}
                            className="min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-[#101A36] hover:text-white dark:hover:bg-[#F5A623] dark:hover:text-[#101A36] text-[var(--text-primary)] font-bold text-xs sm:text-sm no-underline transition-colors shrink-0"
                          >
                            <span>{t.viewDetails}</span>
                            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 shrink-0" aria-hidden="true" />
                          </a>
                        </div>
                      </Card>

                      {/* Fixed-height AdSlot after every 8 cards (never adjacent to page bottom actions) */}
                      {(index + 1) % 8 === 0 && index + 1 < paginatedItems.length && (
                        <AdSlot />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 text-center space-y-4">
                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">
                    {t.emptyListTitle}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto m-0 leading-relaxed">
                    {activeStatusTab === 'open_now' && nonEmptyOtherTabs.length > 0
                      ? t.noOpenNowHint
                      : t.emptyListSubtitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {nonEmptyOtherTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveStatusTab(tab.id as ListStatusTabId)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm font-semibold text-[var(--text-primary)] cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>{tab.label}</span>
                      <span className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-xs font-bold tabular-nums">
                        {tab.count}
                      </span>
                    </button>
                  ))}

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-[#101A36] dark:bg-[#F5A623] text-white dark:text-[#101A36] text-sm font-bold cursor-pointer"
                    >
                      {t.resetFilters}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 20-Item Pagination Controls */}
            {totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="flex flex-wrap items-center justify-between gap-3 pt-2"
              >
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => handlePageChange(safePage - 1)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] text-sm font-semibold text-[var(--text-primary)] disabled:opacity-45 disabled:cursor-not-allowed hover:bg-[var(--bg-subtle)] cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4 rtl:rotate-180 shrink-0" aria-hidden="true" />
                  <span>{t.paginationPrev}</span>
                </button>

                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => {
                    const isCurrent = pageNum === safePage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={`min-w-[44px] min-h-[44px] px-3 rounded-xl border text-sm font-bold tabular-nums cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-[#101A36] dark:bg-[#F5A623] text-white dark:text-[#101A36] border-[#101A36] dark:border-[#F5A623]'
                            : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-subtle)]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => handlePageChange(safePage + 1)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] text-sm font-semibold text-[var(--text-primary)] disabled:opacity-45 disabled:cursor-not-allowed hover:bg-[var(--bg-subtle)] cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>{t.paginationNext}</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180 shrink-0" aria-hidden="true" />
                </button>
              </nav>
            )}
          </div>

          {/* DESKTOP STICKY SIDEBAR (320px) / MOBILE BOTTOM STACK */}
          <aside className="space-y-5 lg:sticky lg:top-20">
            <AlertsBox compact />

            <HelpApplyingCard
              compact
              contextTitle={isIgnouPage ? 'IGNOU Notification Assistance' : pageTitle}
            />

            {/* Official Portals Reference Card */}
            <section
              aria-label={t.officialPortalsTitle}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 space-y-3 text-start"
            >
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-primary)] m-0">
                {t.officialPortalsTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed m-0">
                {t.officialPortalsSubtitle}
              </p>
              <ul className="space-y-1.5 list-none m-0 p-0">
                {visiblePortals.map((portal) => (
                  <li key={portal.url}>
                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] px-3 py-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm font-semibold text-[var(--text-primary)] hover:text-[#1F9D6B] flex items-center justify-between gap-2 no-underline transition-colors"
                    >
                      <span className="truncate">{portal.label}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
