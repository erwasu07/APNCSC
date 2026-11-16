import type { CategorySlug } from '../../utils/seoConfig';
import { CATEGORY_META_MAP, IGNOU_EDUCATION_SEO } from '../../utils/seoConfig';
import {
  type SarkariItem,
  isEducationSarkariItem,
  isIgnouItem,
  isRecruitmentSarkariItem,
} from '../../data/sarkariData';
import { getDeduplicatedSarkariPosts, resolvePostOrg } from '../../data/sarkariMigration';
import {
  computeSarkariStatus,
  getNowInAsiaKolkata,
  parseDateToKolkataMs,
} from '../../utils/sarkariStatus';
import { isOlderThan12Months } from '../../utils/postLifecycle';
import { GUIDE_ARTICLES, type GuideArticle } from '../../data/guidesData';
import { SERVICES_LIST, CATEGORY_LABELS, type ServiceItem } from '../../servicesData';
import { TOOLS_LIST, TOOLS_CATEGORIES, type ToolItem } from '../tools/toolsData';
import { PORTAL_PRESETS, SERVICE_FEE_CATALOGUE } from '../CitizenToolsDesk';

export type { CategorySlug };

export type StatusFilterId = 'all' | 'open' | 'updates' | 'closed';

export interface CategoryStatMetric {
  label: string;
  value: number;
}

export interface NormalizedCategoryItem {
  id: string;
  title: string;
  description: string;
  href: string;
  tag: string;
  initials: string;
  iconName?: string;
  statusBucket: 'open' | 'updates' | 'closed';
  statusLabel: string;
  dateDisplay?: string;
  daysRemaining: number | null;
  daysToStart: number | null;
  hasPastDeadlineDate: boolean;
  progressPct?: number;
  featuredScore: number;
  sortTargetMs: number;
  postTimestampMs: number;
  searchHaystack: string;
  rawPost?: SarkariItem;
  rawService?: ServiceItem;
  rawScheme?: GuideArticle;
  rawTool?: ToolItem;
}

export interface CategoryHeroConfig {
  navLabel: string;
  h1Lead: string;
  h1Accent: string;
  description: string;
  hasDeadlines: boolean;
  featuredTitle: string;
  searchPlaceholder: string;
}

export interface MappedCategoryDataset {
  hero: CategoryHeroConfig;
  updatedLabel: string;
  stats: [CategoryStatMetric, CategoryStatMetric, CategoryStatMetric];
  liveStripItem: NormalizedCategoryItem | null;
  featuredItems: NormalizedCategoryItem[];
  allItems: NormalizedCategoryItem[];
  tagOptions: { id: string; label: string; count: number }[];
  statusCounts: Record<StatusFilterId, number>;
}

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatCompactDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  const match = raw.match(/(\b\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (!match) return raw;
  const d = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const y = parseInt(match[3], 10);
  if (m < 1 || m > 12) return raw;
  return `${d} ${MONTH_SHORT[m - 1]} ${y}`;
}

function getInitials(label: string): string {
  const cleaned = label.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'CD';
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

function getJobsOrEduTag(item: SarkariItem, mode: 'jobs' | 'education'): string {
  const org = item.org || resolvePostOrg(item);
  if (mode === 'jobs') {
    if (org === 'IBPS / Banking') return 'Banking';
    if (['JKSSB', 'SSC', 'RRB', 'Indian Army'].includes(org)) return org;
    return org || 'Other';
  }
  if (org === 'University of Kashmir') return 'Kashmir Univ';
  if (org === 'Cluster University Srinagar') return 'Cluster Univ';
  if (org === 'NTA' || org === 'NTA / IIT') return 'NTA';
  return org || 'Other';
}

function formatUpdatedBulletinDate(dates: (string | undefined)[]): string {
  let maxMs = 0;
  for (const d of dates) {
    if (!d) continue;
    const kol = parseDateToKolkataMs(d, undefined, false);
    if (kol && kol.timestampMs > maxMs) {
      maxMs = kol.timestampMs;
    } else {
      const parsed = Date.parse(d);
      if (!Number.isNaN(parsed) && parsed > maxMs) {
        maxMs = parsed;
      }
    }
  }
  if (maxMs > 0) {
    const dt = new Date(maxMs);
    const day = dt.getUTCDate();
    const mon = MONTH_SHORT[dt.getUTCMonth()];
    const yr = dt.getUTCFullYear();
    return `${day} ${mon} ${yr}`;
  }
  const now = getNowInAsiaKolkata();
  return `${now.day} ${MONTH_SHORT[now.month - 1]} ${now.year}`;
}

function parseMonthYearFromEnglishDate(dateStr?: string): { month: number; year: number } | null {
  if (!dateStr) return null;
  const parsed = Date.parse(dateStr);
  if (!Number.isNaN(parsed)) {
    const d = new Date(parsed);
    return { month: d.getUTCMonth() + 1, year: d.getUTCFullYear() };
  }
  const kol = parseDateToKolkataMs(dateStr, undefined, false);
  if (kol) {
    const d = new Date(kol.timestampMs);
    return { month: d.getUTCMonth() + 1, year: d.getUTCFullYear() };
  }
  return null;
}

function mapDeadlinePosts(
  category: 'jobs' | 'education',
  posts: SarkariItem[],
  educationSubRoute: boolean
): MappedCategoryDataset {
  const { nowMs } = getNowInAsiaKolkata();
  const deduped = getDeduplicatedSarkariPosts(posts).filter((item) => {
    if (item.isCancelled) return false;
    if (isOlderThan12Months(item)) return false;
    if (category === 'jobs') return isRecruitmentSarkariItem(item);
    return isEducationSarkariItem(item);
  });

  const mapped: NormalizedCategoryItem[] = [];
  let openAndUpcomingCount = 0;
  let deadlinesThisWeekCount = 0;

  for (const item of deduped) {
    const st = computeSarkariStatus(item);
    if (st.verificationStatus === 'needs_verification') continue;

    const tag = getJobsOrEduTag(item, category);
    const initials = getInitials(tag);

    let statusBucket: 'open' | 'updates' | 'closed' = 'updates';
    if (
      st.isOpen ||
      st.isUpcoming ||
      st.computedStatus === 'closing_soon' ||
      st.stage === 'objection_window' && !st.isArchiveBucket && st.daysRemaining !== null
    ) {
      statusBucket = 'open';
    } else if (st.isArchiveBucket || st.computedStatus === 'closed') {
      statusBucket = 'closed';
    } else {
      statusBucket = 'updates';
    }

    if (statusBucket === 'open') {
      openAndUpcomingCount += 1;
    }

    if (st.daysRemaining !== null && st.daysRemaining >= 0 && st.daysRemaining <= 7) {
      deadlinesThisWeekCount += 1;
    }

    const startParsed = parseDateToKolkataMs(item.applyStart || item.startDate, undefined, false);
    const endParsed = parseDateToKolkataMs(item.applyEnd || item.lastDate, item.closingTime, true);
    const postParsed = parseDateToKolkataMs(item.postedAt || item.postDate, undefined, false);

    const daysToStart =
      st.isUpcoming && startParsed
        ? Math.max(1, Math.ceil((startParsed.timestampMs - nowMs) / (1000 * 60 * 60 * 24)))
        : null;

    const hasPastDeadlineDate =
      statusBucket === 'closed' &&
      Boolean(endParsed && endParsed.timestampMs < nowMs) &&
      (st.stage === 'recruitment' ||
        st.stage === 'admission' ||
        st.stage === 're_registration' ||
        st.stage === 'exam_form' ||
        st.stage === 'assignment' ||
        st.stage === 'correction' ||
        st.stage === 'objection_window' ||
        st.stage === 'answer_key');

    const sortTargetMs =
      statusBucket === 'open'
        ? endParsed?.timestampMs || startParsed?.timestampMs || Number.MAX_SAFE_INTEGER
        : endParsed?.timestampMs || postParsed?.timestampMs || 0;

    const progressPct =
      st.daysRemaining !== null
        ? Math.max(12, Math.min(100, Math.round(((30 - Math.min(30, st.daysRemaining)) / 30) * 100)))
        : undefined;

    mapped.push({
      id: item.id,
      title: item.title,
      description: item.summary || item.shortInfo || '',
      href: `/post/${item.id}`,
      tag,
      initials,
      statusBucket,
      statusLabel: st.badgeLabel,
      dateDisplay: formatCompactDate(st.dateValue) || st.dateValue,
      daysRemaining: st.daysRemaining,
      daysToStart,
      hasPastDeadlineDate,
      progressPct,
      featuredScore: st.daysRemaining !== null ? 100 - Math.min(99, st.daysRemaining) : 0,
      sortTargetMs,
      postTimestampMs: postParsed?.timestampMs || 0,
      searchHaystack: [
        item.title,
        item.summary,
        item.shortInfo,
        item.org,
        tag,
        item.department,
        item.institution,
        item.qualification,
        item.eligibility,
        item.advertisementNo,
        item.learnerGroup,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
      rawPost: item,
    });
  }

  // Sort: open nearest target date first, updates/closed newest first
  const sorted = [...mapped].sort((a, b) => {
    const rank = { open: 0, updates: 1, closed: 2 };
    if (rank[a.statusBucket] !== rank[b.statusBucket]) {
      return rank[a.statusBucket] - rank[b.statusBucket];
    }
    if (a.statusBucket === 'open') {
      if (a.daysRemaining !== null && b.daysRemaining === null) return -1;
      if (a.daysRemaining === null && b.daysRemaining !== null) return 1;
      if (a.sortTargetMs !== b.sortTargetMs) return a.sortTargetMs - b.sortTargetMs;
    }
    if (b.postTimestampMs !== a.postTimestampMs) return b.postTimestampMs - a.postTimestampMs;
    return b.sortTargetMs - a.sortTargetMs;
  });

  // Featured rail ("Closing soon") & live strip: active deadlines sorted nearest first
  const scopedForRail =
    category === 'education' && educationSubRoute
      ? sorted.filter((entry) => entry.rawPost && isIgnouItem(entry.rawPost))
      : sorted;

  const activeDeadlines = scopedForRail
    .filter((entry) => entry.daysRemaining !== null && entry.daysRemaining >= 0)
    .sort((a, b) => a.sortTargetMs - b.sortTargetMs);

  const featuredItems = activeDeadlines.slice(0, 6);
  const liveStripItem = activeDeadlines[0] || null;

  // Build ordered tag list strictly from existing org tags
  const preferredOrder =
    category === 'jobs'
      ? ['JKSSB', 'SSC', 'RRB', 'Indian Army', 'Banking']
      : ['IGNOU', 'Kashmir Univ', 'Cluster Univ', 'NTA'];

  const tagCounts = new Map<string, number>();
  for (const item of sorted) {
    tagCounts.set(item.tag, (tagCounts.get(item.tag) || 0) + 1);
  }

  const orderedTags: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: sorted.length },
  ];
  for (const tag of preferredOrder) {
    const count = tagCounts.get(tag) || 0;
    if (count > 0) {
      orderedTags.push({ id: tag, label: tag, count });
      tagCounts.delete(tag);
    }
  }
  for (const [tag, count] of Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1])) {
    orderedTags.push({ id: tag, label: tag, count });
  }

  const statusCounts: Record<StatusFilterId, number> = {
    all: sorted.length,
    open: sorted.filter((i) => i.statusBucket === 'open').length,
    updates: sorted.filter((i) => i.statusBucket === 'updates').length,
    closed: sorted.filter((i) => i.statusBucket === 'closed').length,
  };

  const hero: CategoryHeroConfig =
    category === 'jobs'
      ? {
          navLabel: 'Jobs',
          h1Lead: 'Jobs ',
          h1Accent: '& Recruitment',
          description: CATEGORY_META_MAP.jobs.description,
          hasDeadlines: true,
          featuredTitle: 'Closing soon',
          searchPlaceholder: 'Search JKSSB, SSC, RRB, Army or qualification...',
        }
      : {
          navLabel: 'Education',
          h1Lead: educationSubRoute ? 'IGNOU ' : 'Education ',
          h1Accent: educationSubRoute ? 'Bulletin' : '& Admissions',
          description: educationSubRoute
            ? IGNOU_EDUCATION_SEO.description
            : CATEGORY_META_MAP.education.description,
          hasDeadlines: true,
          featuredTitle: 'Closing soon',
          searchPlaceholder: 'Search IGNOU, Kashmir Univ, Cluster Univ or exams...',
        };

  const stats: [CategoryStatMetric, CategoryStatMetric, CategoryStatMetric] =
    category === 'jobs'
      ? [
          { label: 'Open and upcoming', value: openAndUpcomingCount },
          { label: 'Deadlines this week', value: deadlinesThisWeekCount },
          { label: 'Notices listed', value: sorted.length },
        ]
      : [
          { label: 'Admissions open', value: openAndUpcomingCount },
          { label: 'Deadlines this week', value: deadlinesThisWeekCount },
          { label: 'Guides listed', value: sorted.length },
        ];

  return {
    hero,
    updatedLabel: formatUpdatedBulletinDate(deduped.map((i) => i.updatedAt || i.postDate)),
    stats,
    liveStripItem,
    featuredItems,
    allItems: sorted,
    tagOptions: orderedTags,
    statusCounts,
  };
}

function mapSchemesDataset(): MappedCategoryDataset {
  const now = getNowInAsiaKolkata();
  let updatedThisMonth = 0;

  const items: NormalizedCategoryItem[] = GUIDE_ARTICLES.map((g, idx) => {
    const parsed = parseMonthYearFromEnglishDate(g.lastUpdated);
    if (parsed && parsed.month === now.month && parsed.year === now.year) {
      updatedThisMonth += 1;
    }

    return {
      id: g.id,
      title: g.title,
      description: g.summary,
      href: `/scheme/${g.id}`,
      tag: g.category,
      initials: getInitials(g.title),
      statusBucket: 'open',
      statusLabel: g.benefitSummary || g.officialPortal,
      dateDisplay: g.lastUpdated,
      daysRemaining: null,
      daysToStart: null,
      hasPastDeadlineDate: false,
      featuredScore: GUIDE_ARTICLES.length - idx,
      sortTargetMs: 0,
      postTimestampMs: parsed ? Date.UTC(parsed.year, parsed.month - 1, 1) : 0,
      searchHaystack: [
        g.title,
        g.summary,
        g.category,
        g.officialPortal,
        g.responsibleDepartment,
        g.benefitSummary,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
      rawScheme: g,
    };
  });

  const tagCounts = new Map<string, number>();
  for (const item of items) {
    tagCounts.set(item.tag, (tagCounts.get(item.tag) || 0) + 1);
  }
  const tagOptions = [
    { id: 'all', label: 'All', count: items.length },
    ...Array.from(tagCounts.entries()).map(([tag, count]) => ({
      id: tag,
      label: tag,
      count,
    })),
  ];

  return {
    hero: {
      navLabel: 'Schemes',
      h1Lead: 'Government ',
      h1Accent: 'Schemes',
      description: CATEGORY_META_MAP.schemes.description,
      hasDeadlines: false,
      featuredTitle: 'Popular',
      searchPlaceholder: 'Search PM-KISAN, Ayushman, PAN, Aadhaar or JKSSB guide...',
    },
    updatedLabel: formatUpdatedBulletinDate(GUIDE_ARTICLES.map((g) => g.lastUpdated)),
    stats: [
      { label: 'Active schemes', value: GUIDE_ARTICLES.length },
      { label: 'Updated this month', value: updatedThisMonth },
      { label: 'Schemes listed', value: GUIDE_ARTICLES.length },
    ],
    liveStripItem: null,
    featuredItems: items.slice(0, 6),
    allItems: items,
    tagOptions,
    statusCounts: { all: items.length, open: items.length, updates: 0, closed: 0 },
  };
}

function mapServicesDataset(): MappedCategoryDataset {
  const items: NormalizedCategoryItem[] = SERVICES_LIST.map((s, idx) => {
    const tag = CATEGORY_LABELS[s.category] || s.category;
    return {
      id: s.id,
      title: s.name,
      description: s.description,
      href: `/service/${s.id}`,
      tag,
      initials: getInitials(s.name),
      statusBucket: 'open',
      statusLabel: s.estimatedTime,
      dateDisplay: s.price,
      daysRemaining: null,
      daysToStart: null,
      hasPastDeadlineDate: false,
      featuredScore: s.popular ? 1000 - idx : 100 - idx,
      sortTargetMs: 0,
      postTimestampMs: 0,
      searchHaystack: [s.name, s.description, tag, s.price, s.estimatedTime, ...s.requirements]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
      rawService: s,
    };
  });

  const featuredItems = [...items]
    .sort((a, b) => b.featuredScore - a.featuredScore)
    .slice(0, 6);

  const tagCounts = new Map<string, number>();
  for (const item of items) {
    tagCounts.set(item.tag, (tagCounts.get(item.tag) || 0) + 1);
  }
  const tagOptions = [
    { id: 'all', label: 'All', count: items.length },
    ...Object.values(CATEGORY_LABELS)
      .filter((label) => (tagCounts.get(label) || 0) > 0)
      .map((label) => ({
        id: label,
        label,
        count: tagCounts.get(label) || 0,
      })),
  ];

  // Services with updated 2026 event notes (e.g. Oct 2026 / dynamic timestamps)
  const updatedThisMonthCount = SERVICES_LIST.filter(
    (s) => /nov(?:ember)?\s*2026/i.test(s.description)
  ).length;

  return {
    hero: {
      navLabel: 'Services',
      h1Lead: 'CSC ',
      h1Accent: 'E-Services',
      description: CATEGORY_META_MAP.services.description,
      hasDeadlines: false,
      featuredTitle: 'Popular',
      searchPlaceholder: 'Search Domicile, PAN, Aadhaar, Revenue Fard or certificates...',
    },
    updatedLabel: formatUpdatedBulletinDate(GUIDE_ARTICLES.map((g) => g.lastUpdated)),
    stats: [
      { label: 'Services available', value: SERVICES_LIST.length },
      { label: 'Updated this month', value: updatedThisMonthCount },
      { label: 'Guides listed', value: GUIDE_ARTICLES.length },
    ],
    liveStripItem: null,
    featuredItems,
    allItems: items,
    tagOptions,
    statusCounts: { all: items.length, open: items.length, updates: 0, closed: 0 },
  };
}

function mapToolsDataset(): MappedCategoryDataset {
  const items: NormalizedCategoryItem[] = TOOLS_LIST.map((tool, idx) => ({
    id: tool.id,
    title: tool.name,
    description: tool.shortDescription,
    href: `/tools/${tool.id}`,
    tag: tool.categoryLabel,
    initials: getInitials(tool.name),
    iconName: tool.iconName,
    statusBucket: 'open',
    statusLabel: tool.badge || 'Local Browser Tool',
    dateDisplay: tool.specs || 'Zero server upload',
    daysRemaining: null,
    daysToStart: null,
    hasPastDeadlineDate: false,
    featuredScore: (tool.popular ? 200 : 0) + (tool.featured ? 100 : 0) + (50 - idx),
    sortTargetMs: 0,
    postTimestampMs: 0,
    searchHaystack: [
      tool.name,
      tool.shortDescription,
      tool.categoryLabel,
      tool.specs,
      tool.badge,
      ...tool.keywords,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
    rawTool: tool,
  }));

  const featuredItems = [...items]
    .sort((a, b) => b.featuredScore - a.featuredScore)
    .slice(0, 6);

  const tagCounts = new Map<string, number>();
  for (const item of items) {
    tagCounts.set(item.tag, (tagCounts.get(item.tag) || 0) + 1);
  }
  const tagOptions = [
    { id: 'all', label: 'All', count: items.length },
    ...TOOLS_CATEGORIES.filter((c) => c.id !== 'all' && (tagCounts.get(c.label) || 0) > 0).map(
      (c) => ({
        id: c.label,
        label: c.label,
        count: tagCounts.get(c.label) || 0,
      })
    ),
  ];

  const addedRecentlyCount = TOOLS_LIST.filter((t) => t.category === 'document').length;

  return {
    hero: {
      navLabel: 'Tools',
      h1Lead: 'Document ',
      h1Accent: 'Tools',
      description: CATEGORY_META_MAP.tools.description,
      hasDeadlines: false,
      featuredTitle: 'Most used',
      searchPlaceholder: 'Search photo compressor, PDF merge, signature resizer...',
    },
    updatedLabel: formatUpdatedBulletinDate(GUIDE_ARTICLES.map((g) => g.lastUpdated)),
    stats: [
      { label: 'Free tools', value: TOOLS_LIST.length },
      { label: 'Added recently', value: addedRecentlyCount },
      { label: 'Tools listed', value: TOOLS_LIST.length },
    ],
    liveStripItem: null,
    featuredItems,
    allItems: items,
    tagOptions,
    statusCounts: { all: items.length, open: items.length, updates: 0, closed: 0 },
  };
}

function mapCalculatorsDataset(): MappedCategoryDataset {
  const coreCalculators: NormalizedCategoryItem[] = [
    {
      id: 'calc-age',
      title: 'Recruitment Age Eligibility Calculator',
      description:
        'Compute exact chronological age on official advertisement cutoff dates with reference relaxations for OM, RBA, OBC, EWS, SC/ST, PwD, and ESM.',
      href: '/calculators?calc=age',
      tag: 'Age Eligibility',
      initials: 'AG',
      iconName: 'Calculator',
      statusBucket: 'open',
      statusLabel: 'Interactive Calculator',
      dateDisplay: 'JKSSB · SSC · RRB · Army',
      daysRemaining: null,
      daysToStart: null,
      hasPastDeadlineDate: false,
      featuredScore: 300,
      sortTargetMs: 0,
      postTimestampMs: 0,
      searchHaystack:
        'recruitment age eligibility calculator jkssb ssc rrb army cutoff dob category relaxation om rba obc sc st pwd esm',
    },
    {
      id: 'calc-photo',
      title: 'Photo & Signature Spec Inspector',
      description:
        'Inspect local file KB size and natural pixel resolution against JKSSB, SSC, Indian Army, RRB, and university portal requirements.',
      href: '/calculators?calc=photo',
      tag: 'Photo & Specs',
      initials: 'PS',
      iconName: 'Image',
      statusBucket: 'open',
      statusLabel: 'Local Browser Check',
      dateDisplay: 'Zero server uploads',
      daysRemaining: null,
      daysToStart: null,
      hasPastDeadlineDate: false,
      featuredScore: 295,
      sortTargetMs: 0,
      postTimestampMs: 0,
      searchHaystack:
        'photo signature spec inspector kb pixels jpg jpeg dimensions jkssb ssc army rrb kashmir university',
    },
    {
      id: 'calc-fee',
      title: 'CSC Regulated Fee Estimator',
      description:
        'Review statutory government/departmental fees alongside prescribed CSC facilitation charges across certificates, cards, and portals.',
      href: '/calculators?calc=fee',
      tag: 'Fee Estimates',
      initials: 'FE',
      iconName: 'Receipt',
      statusBucket: 'open',
      statusLabel: 'Fee Estimator',
      dateDisplay: 'Statutory + CSC tariff',
      daysRemaining: null,
      daysToStart: null,
      hasPastDeadlineDate: false,
      featuredScore: 290,
      sortTargetMs: 0,
      postTimestampMs: 0,
      searchHaystack:
        'csc regulated fee estimator statutory fee domicile pan aadhaar pm kisan passport jkssb',
    },
  ];

  const presetItems: NormalizedCategoryItem[] = PORTAL_PRESETS.map((p, idx) => ({
    id: `preset-${p.id}`,
    title: `${p.name} Photo & Signature Rule Checker`,
    description: `${p.note} Photo: ${p.photoSize} (${p.photoDim}) · Signature: ${p.sigSize}.`,
    href: `/calculators?calc=photo&preset=${encodeURIComponent(p.id)}`,
    tag: 'Photo & Specs',
    initials: getInitials(p.name),
    iconName: 'FileCheck2',
    statusBucket: 'open',
    statusLabel: p.format,
    dateDisplay: `Photo ${p.photoSize}`,
    daysRemaining: null,
    daysToStart: null,
    hasPastDeadlineDate: false,
    featuredScore: 200 - idx,
    sortTargetMs: 0,
    postTimestampMs: 0,
    searchHaystack: `${p.name} ${p.photoSize} ${p.photoDim} ${p.sigSize} ${p.format} ${p.note}`.toLowerCase(),
  }));

  const feeItems: NormalizedCategoryItem[] = SERVICE_FEE_CATALOGUE.map((f, idx) => ({
    id: `fee-${f.id}`,
    title: `${f.name} — Fee Estimate`,
    description: `Statutory fee: ${f.govFee}. Prescribed CSC charge: ${f.cscFee}. Includes ${f.includes.slice(0, 2).join(', ')}.`,
    href: `/calculators?calc=fee&service=${encodeURIComponent(f.id)}`,
    tag: 'Fee Estimates',
    initials: getInitials(f.name),
    iconName: 'Receipt',
    statusBucket: 'open',
    statusLabel: f.govFee,
    dateDisplay: `Est. ${f.totalEstimated}`,
    daysRemaining: null,
    daysToStart: null,
    hasPastDeadlineDate: false,
    featuredScore: 150 - idx,
    sortTargetMs: 0,
    postTimestampMs: 0,
    searchHaystack: `${f.name} ${f.govFee} ${f.cscFee} ${f.totalEstimated} ${f.includes.join(' ')}`.toLowerCase(),
  }));

  const allItems = [...coreCalculators, ...presetItems, ...feeItems];
  const featuredItems = [...allItems]
    .sort((a, b) => b.featuredScore - a.featuredScore)
    .slice(0, 6);

  const tags = ['Age Eligibility', 'Photo & Specs', 'Fee Estimates'];
  const tagOptions = [
    { id: 'all', label: 'All', count: allItems.length },
    ...tags.map((tag) => ({
      id: tag,
      label: tag,
      count: allItems.filter((i) => i.tag === tag).length,
    })),
  ];

  return {
    hero: {
      navLabel: 'Calculators',
      h1Lead: 'Citizen ',
      h1Accent: 'Calculators',
      description: CATEGORY_META_MAP.calculators.description,
      hasDeadlines: false,
      featuredTitle: 'Popular',
      searchPlaceholder: 'Search age cutoff, JKSSB photo spec, PAN or domicile fee...',
    },
    updatedLabel: formatUpdatedBulletinDate(GUIDE_ARTICLES.map((g) => g.lastUpdated)),
    stats: [
      { label: 'Calculators', value: coreCalculators.length },
      { label: 'Added recently', value: PORTAL_PRESETS.length },
      { label: 'Calculators listed', value: allItems.length },
    ],
    liveStripItem: null,
    featuredItems,
    allItems,
    tagOptions,
    statusCounts: { all: allItems.length, open: allItems.length, updates: 0, closed: 0 },
  };
}

export function buildCategoryDataset(
  category: CategorySlug,
  posts: SarkariItem[],
  educationSubRoute = false
): MappedCategoryDataset {
  switch (category) {
    case 'jobs':
      return mapDeadlinePosts('jobs', posts, false);
    case 'education':
      return mapDeadlinePosts('education', posts, educationSubRoute);
    case 'schemes':
      return mapSchemesDataset();
    case 'services':
      return mapServicesDataset();
    case 'tools':
      return mapToolsDataset();
    case 'calculators':
      return mapCalculatorsDataset();
  }
}
