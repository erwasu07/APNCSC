export const SITE_ORIGIN = 'https://www.cscdost.com';
export const SITE_NAME = 'CSC DOST';

export type CategorySlug = 'jobs' | 'education' | 'schemes' | 'services' | 'tools' | 'calculators';

export interface RouteSeoMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: 'index, follow' | 'noindex, follow' | 'noindex, nofollow';
  ogType?: 'website' | 'article';
  ogImage?: string;
  breadcrumbs?: { name: string; url: string }[];
}

function normalizeSeoWhitespace(text: string): string {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\u2013|\u2014/g, '-')
    .trim();
}

function trimAtWordBoundary(text: string, maxLen: number): string {
  const clean = normalizeSeoWhitespace(text);
  if (clean.length <= maxLen) return clean;
  const sliced = clean.slice(0, maxLen + 1);
  const lastSpace = sliced.lastIndexOf(' ');
  const cut = lastSpace >= Math.floor(maxLen * 0.55) ? sliced.slice(0, lastSpace) : clean.slice(0, maxLen);
  return cut.replace(/[\s,;:\-–—(\[/]+$/g, '').trim();
}

function compactTitlePhrases(raw: string): string {
  return normalizeSeoWhitespace(raw)
    .replace(/\bJammu\s*(?:&|and)\s*Kashmir\b/gi, 'J&K')
    .replace(/\bUniversity of Kashmir\b/gi, 'Kashmir Univ')
    .replace(/\bCluster University Srinagar\b/gi, 'CUS Srinagar')
    .replace(/\bCluster University\b/gi, 'Cluster Univ')
    .replace(/\bRegional Centre\b/gi, 'RC')
    .replace(/\bExamination Form\b/gi, 'Exam Form')
    .replace(/\bExamination\b/gi, 'Exam')
    .replace(/\bNotification\b/gi, 'Notice')
    .replace(/\bTentative Date Sheet for\b/gi, 'Tentative Datesheet')
    .replace(/\bTentative Date Sheet\b/gi, 'Tentative Datesheet')
    .replace(/\bRevised Tentative Date Sheet\b/gi, 'Rev Datesheet')
    .replace(/\bDate Sheet\b/gi, 'Datesheet')
    .replace(/\bSupplementary\b/gi, 'Suppl')
    .replace(/\bAssignment Submission\b/gi, 'Assignment')
    .replace(/\bRe-Registration\b/gi, 'Re-Reg')
    .replace(/\bRegistration\b/gi, 'Reg')
    .replace(/\bRecruitment\b/gi, 'Jobs')
    .replace(/\bAdmissions\b/gi, 'Adm')
    .replace(/\bAdmission\b/gi, 'Adm')
    .replace(/\bSemester\b/gi, 'Sem')
    .replace(/\bStenographer\b/gi, 'Steno')
    .replace(/\bJunior Hindi Translator\b/gi, 'JHT')
    .replace(/\bDistance & Online Education\b/gi, 'DDOE')
    .replace(/\bOpen & Distance Learning\b/gi, 'ODL')
    .replace(/\bCommon Eligibility Test\b/gi, 'CET')
    .replace(/\s*\(\s*Closing Today\s*\)/gi, '')
    .replace(/\s*[-–—]\s*Last Date\s+[0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{4}/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Formats an HTML <title> strictly under 60 chars (max 59) while preserving distinct tags/year discriminators.
 */
export function formatSeoTitle(
  rawTitle: string,
  suffix = ' | CSC DOST',
  maxLen = 59
): string {
  const clean = normalizeSeoWhitespace(rawTitle);
  if (!clean) return 'CSC DOST Portal';
  if (clean.length + suffix.length <= maxLen) {
    return `${clean}${suffix}`;
  }

  const compacted = compactTitlePhrases(clean);
  if (compacted.length + suffix.length <= maxLen) {
    return `${compacted}${suffix}`;
  }

  // Prefer keeping suffix when possible (budget = 48 chars); if compacted itself <= 59, drop suffix only if needed to preserve meaning
  const budgetWithSuffix = maxLen - suffix.length;
  if (budgetWithSuffix >= 36) {
    // Preserve short trailing parenthetical discriminator e.g. "(GOAL)" or "(ODL)" or "(2026)"
    const parenMatch = compacted.match(/\(([^()]{2,18})\)$/);
    if (parenMatch) {
      const tag = ` (${parenMatch[1].trim()})`;
      const headBudget = budgetWithSuffix - tag.length;
      if (headBudget >= 22) {
        const head = trimAtWordBoundary(compacted.slice(0, compacted.length - parenMatch[0].length), headBudget);
        return `${head}${tag}${suffix}`.slice(0, maxLen);
      }
    }
    const trimmed = trimAtWordBoundary(compacted, budgetWithSuffix);
    if (trimmed.length >= 24) {
      return `${trimmed}${suffix}`;
    }
  }

  if (compacted.length <= maxLen) return compacted;
  return trimAtWordBoundary(compacted, maxLen);
}

const POST_EXACT_SEO_MAP: Record<string, { title: string; description: string }> = {
  'indian-army-tes-57-course-closing-today': {
    title: 'Army 10+2 TES-57 (July 2027) Closed | CSC DOST',
    description:
      'Indian Army TES-57 (July 2027 Course) application window closed 12/11/2026. Check 10+2 PCM & JEE Main eligibility and SSB details on CSC DOST.',
  },
  'army-tes-55-course-july-2027': {
    title: 'Army 10+2 TES-55 (July 2027) Application | CSC DOST',
    description:
      'Indian Army TES-55 (July 2027 Course) online application (last date 30/09/2026). Check 10+2 PCM & JEE Main criteria and SSB notice on CSC DOST.',
  },
  'army-tes-54-course-jan-2027': {
    title: 'Army 10+2 TES-54 (Jan 2027) Application | CSC DOST',
    description:
      'Indian Army TES-54 (January 2027 Course) online application (last date 22/09/2026). View 10+2 PCM criteria, age limit & SSB details on CSC DOST.',
  },
  'army-tgc-145-course-2026': {
    title: 'Army TGC-145 (July 2027) Recruitment | CSC DOST',
    description:
      'Indian Army 145th Technical Graduate Course (TGC-145, July 2027) recruitment notice (last date 30/10/2026). Check B.E./B.Tech streams on CSC DOST.',
  },
  'army-tgc-143-course-jul-2027': {
    title: 'Army TGC-143 (Jul 2027) Recruitment | CSC DOST',
    description:
      'Indian Army 143rd Technical Graduate Course (TGC-143, July 2027) recruitment notice (last date 19/09/2026). Check branch eligibility on CSC DOST.',
  },
  'rrb-isolated-ministerial-cen-09-2026': {
    title: 'RRB Ministerial CEN 09/2026 (191 Posts) | CSC DOST',
    description:
      'RRB Isolated & Ministerial Categories CEN 09/2026 recruitment for 191 vacancies. Online form open 05/11/2026 to 04/12/2026 at rrbapply.gov.in.',
  },
  'rrb-ministerial-isolated-cen08-2026': {
    title: 'RRB Ministerial CEN 08/2026 (1,280 Posts) | CSC DOST',
    description:
      'RRB Ministerial & Isolated Categories CEN 08/2026 recruitment (1,280 posts, last date 20/09/2026). Check Welfare Inspector & Translator details.',
  },
  'rrb-ministerial-isolated-2026': {
    title: 'RRB Ministerial CEN 06/2026 (1,038 Posts) | CSC DOST',
    description:
      'RRB Ministerial & Isolated Categories CEN 06/2026 recruitment (1,038 posts, last date 17/09/2026). Check Jr Steno, Law Asst & Translator details.',
  },
  'jkssb-advt-06-2026': {
    title: 'JKSSB Advt 06/2026 Application (357 Posts) | CSC DOST',
    description:
      'JKSSB Advt 06/2026 Online Application for 357 Draftsman (Civil) & Works Supervisor posts in PW(R&B) Dept (last date 30/08/2026). View eligibility.',
  },
  'jkssb-dv-notice-advt06-2026-works-supervisor': {
    title: 'JKSSB Advt 06/2026 DV Notice (Draftsman) | CSC DOST',
    description:
      'JKSSB Advt 06/2026 Document Verification (DV Notice) for 357 Draftsman (Civil) & Works Supervisor posts (DV until 24/09/2026). Check schedule & docs.',
  },
  'jkssb-advt-10-of-2026-je-mechanical-pwd': {
    title: 'JKSSB Advt 10/2026 JE Mechanical Postponed | CSC DOST',
    description:
      'JKSSB Advt 10 of 2026 (127 Junior Engineer Mechanical posts in PW(R&B) Dept) online form postponed per 15/11/2026 notice. Fresh dates to be notified.',
  },
  'ssc-cpo-pet-pst-result-paper-2-exam-date-2026': {
    title: 'SSC CPO SI 2025 PET/PST Result & Corrigendum | CSC DOST',
    description:
      'SSC SI Delhi Police & CAPFs Exam 2025 PET/PST result (10,676 qualified), Corrigendum dated 16/11/2026, and Paper-II exam date 28/11/2026 on CSC DOST.',
  },
};

/**
 * Formats a post <title> strictly < 60 chars and deduplicates colliding prefixes using learnerGroup/session/advt/stage/id.
 */
export function formatPostSeoTitle(item: {
  id: string;
  title: string;
  learnerGroup?: string;
  session?: string;
  advertisementNo?: string;
  postDate?: string;
}): string {
  const exact = POST_EXACT_SEO_MAP[item.id];
  if (exact) return exact.title;

  const clean = normalizeSeoWhitespace(item.title);
  if (clean.length + ' | CSC DOST'.length <= 59) {
    return `${clean} | CSC DOST`;
  }

  // Extract a meaningful unique tag if title is very long
  const rawTag =
    (item.learnerGroup && item.learnerGroup.length <= 16 ? item.learnerGroup : '') ||
    (item.title.match(/\b(Tier[- ]?\d+|Paper[- ]?\d+|Sem(?:ester)?[- ]?[\d&\-I]+|Batch[- ]?20\d{2}|CEN\s*(?:No\.?)?\s*\d+\/?20\d{2}|Advt\.?\s*(?:No\.?)?\s*\d+\/?20\d{2}|TES[- ]?\d+|TGC[- ]?\d+|DV Notice|Answer Key|Admit Card|Result|ODL|GOAL|E-Vidya Bharti|CDOE|DDOE|2nd|1st|4th|7th|8th)\b/i)?.[0] || '') ||
    (item.advertisementNo?.match(/\b(CEN\s*(?:No\.?)?\s*\d+\/?20\d{2}|Advt\.?\s*(?:No\.?)?\s*\d+\/?20\d{2})\b/i)?.[0] || '');

  const compacted = compactTitlePhrases(clean);
  if (compacted.length + ' | CSC DOST'.length <= 59) {
    return `${compacted} | CSC DOST`;
  }

  const suffix = ' | CSC DOST';
  const maxCore = 59 - suffix.length; // 48
  const tagClean = rawTag ? compactTitlePhrases(rawTag).replace(/\s*No\.?\s*/gi, ' ').replace(/\s+/g, ' ').trim().slice(0, 14) : '';

  if (tagClean && !compacted.slice(0, maxCore - tagClean.length - 1).toLowerCase().includes(tagClean.toLowerCase())) {
    const coreBudget = maxCore - tagClean.length - 3;
    if (coreBudget >= 20) {
      const head = trimAtWordBoundary(compacted, coreBudget);
      return `${head} (${tagClean})${suffix}`.slice(0, 59);
    }
  }

  return formatSeoTitle(compacted, suffix, 59);
}

export function formatSeoDescription(
  rawDesc: string,
  maxLen = 154
): string {
  const clean = normalizeSeoWhitespace(rawDesc);
  if (!clean) return 'Official citizen guides and updates on CSC DOST.';
  if (clean.length <= maxLen) return clean;

  // Keep complete first sentence if informative (>= 75 chars)
  const firstPeriod = clean.indexOf('. ');
  if (firstPeriod >= 75 && firstPeriod + 1 <= maxLen) {
    return clean.slice(0, firstPeriod + 1);
  }

  const cut = trimAtWordBoundary(clean, maxLen - 3);
  return `${cut}...`;
}

export function formatPostSeoDescription(item: {
  id: string;
  title: string;
  shortInfo?: string;
  summary?: string;
  advertisementNo?: string;
  lastDate?: string;
  totalPosts?: string | number;
}): string {
  const exact = POST_EXACT_SEO_MAP[item.id];
  if (exact) return exact.description;

  const fallback = `Official notification dates, eligibility and verification links for ${item.title} on CSC DOST.`;
  return formatSeoDescription(item.summary || item.shortInfo || fallback, 154);
}

export interface CategoryMetaEntry {
  slug: CategorySlug;
  path: string;
  label: string;
  title: string;
  description: string;
  canonicalUrl: string;
}

export const CORE_CATEGORIES: CategoryMetaEntry[] = [
  {
    slug: 'jobs',
    path: '/jobs',
    label: 'Jobs & Recruitment',
    title: 'Jobs & Recruitment | CSC DOST',
    description:
      'Browse latest J&K and all-India government job notifications, JKSSB, Banking, Indian Army, SSC and RRB vacancies on CSC DOST.',
    canonicalUrl: `${SITE_ORIGIN}/jobs`,
  },
  {
    slug: 'education',
    path: '/education',
    label: 'Education & Admissions',
    title: 'Education & Admissions | CSC DOST',
    description:
      'Check IGNOU, University of Kashmir and Cluster University admissions, examination forms, date sheets and scholarship notices on CSC DOST.',
    canonicalUrl: `${SITE_ORIGIN}/education`,
  },
  {
    slug: 'schemes',
    path: '/schemes',
    label: 'Government Schemes',
    title: 'Government Schemes | CSC DOST',
    description:
      'Explore PM-KISAN, Ayushman Bharat PM-JAY, and central or J&K citizen welfare scheme guides with official portal links on CSC DOST.',
    canonicalUrl: `${SITE_ORIGIN}/schemes`,
  },
  {
    slug: 'services',
    path: '/services',
    label: 'CSC E-Services',
    title: 'CSC E-Services | CSC DOST',
    description:
      'Browse PAN card, Aadhaar assistance, J&K domicile, income certificates and CSC e-governance services directory at CSC DOST.',
    canonicalUrl: `${SITE_ORIGIN}/services`,
  },
  {
    slug: 'tools',
    path: '/tools',
    label: 'Document Tools',
    title: 'Document Tools | CSC DOST',
    description:
      'Use free browser-based photo resizers, signature cropper, PDF compressor and image converters with zero server uploads on CSC DOST.',
    canonicalUrl: `${SITE_ORIGIN}/tools`,
  },
  {
    slug: 'calculators',
    path: '/calculators',
    label: 'Citizen Calculators',
    title: 'Citizen Calculators | CSC DOST',
    description:
      'Calculate recruitment age eligibility, inspect photo and signature size rules, and estimate regulated CSC service fees on CSC DOST.',
    canonicalUrl: `${SITE_ORIGIN}/calculators`,
  },
];

export const CATEGORY_META_MAP: Record<CategorySlug, CategoryMetaEntry> = CORE_CATEGORIES.reduce(
  (acc, item) => {
    acc[item.slug] = item;
    return acc;
  },
  {} as Record<CategorySlug, CategoryMetaEntry>
);

export const DEADLINES_SEO: RouteSeoMeta = {
  title: 'Closing Deadlines – Jobs & Education Forms | CSC DOST',
  description:
    'Live Asia/Kolkata closing deadlines for active J&K recruitment jobs, university admissions, exam forms, and assignment submissions on CSC DOST.',
  canonicalUrl: `${SITE_ORIGIN}/deadlines`,
  robots: 'index, follow',
  ogType: 'website',
  breadcrumbs: [
    { name: 'Home', url: `${SITE_ORIGIN}/` },
    { name: 'Closing Deadlines', url: `${SITE_ORIGIN}/deadlines` },
  ],
};

export const ARCHIVE_SEO: RouteSeoMeta = {
  title: 'Archived Recruitment & Exam Notices | CSC DOST',
  description:
    'Browse archived J&K and central recruitment, admission, and examination notifications older than 12 months on CSC DOST.',
  canonicalUrl: `${SITE_ORIGIN}/archive`,
  robots: 'index, follow',
  ogType: 'website',
  breadcrumbs: [
    { name: 'Home', url: `${SITE_ORIGIN}/` },
    { name: 'Archive', url: `${SITE_ORIGIN}/archive` },
  ],
};

export const IGNOU_EDUCATION_SEO: RouteSeoMeta = {
  title: 'IGNOU Latest Notifications, Admissions & Exams | CSC DOST',
  description:
    'Find IGNOU admission, re-registration, assignment, exam form, datesheet, hall ticket and result updates with official links on CSC DOST.',
  canonicalUrl: `${SITE_ORIGIN}/education/ignou`,
  robots: 'index, follow',
  ogType: 'website',
  breadcrumbs: [
    { name: 'Home', url: `${SITE_ORIGIN}/` },
    { name: 'Education & Admissions', url: `${SITE_ORIGIN}/education` },
    { name: 'IGNOU', url: `${SITE_ORIGIN}/education/ignou` },
  ],
};

export const HOMEPAGE_SEO: RouteSeoMeta = {
  title: 'CSC DOST – Jobs, Admissions & Citizen Services',
  description:
    'Explore J&K jobs, university admissions, government schemes, CSC e-services, document tools and citizen calculators with CSC DOST.',
  canonicalUrl: `${SITE_ORIGIN}/`,
  robots: 'index, follow',
  ogType: 'website',
};

export const LEGAL_SEO_MAP: Record<string, RouteSeoMeta> = {
  privacy: {
    title: 'Privacy Policy | CSC DOST',
    description:
      'Read how CSC DOST handles citizen application details, cookies, local browser processing and privacy under Indian law.',
    canonicalUrl: `${SITE_ORIGIN}/privacy-policy`,
    robots: 'index, follow',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'Privacy Policy', url: `${SITE_ORIGIN}/privacy-policy` },
    ],
  },
  terms: {
    title: 'Terms of Service | CSC DOST',
    description:
      'Review terms of service, citizen responsibilities and facilitation fee disclosures for CSC DOST digital assistance center.',
    canonicalUrl: `${SITE_ORIGIN}/terms-of-service`,
    robots: 'index, follow',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'Terms of Service', url: `${SITE_ORIGIN}/terms-of-service` },
    ],
  },
  disclaimer: {
    title: 'Disclaimer & Non-Affiliation | CSC DOST',
    description:
      'Important notice: CSC DOST is an independent private citizen facilitation center in Qazigund, Anantnag and not a government site.',
    canonicalUrl: `${SITE_ORIGIN}/disclaimer`,
    robots: 'index, follow',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'Disclaimer', url: `${SITE_ORIGIN}/disclaimer` },
    ],
  },
  about: {
    title: 'About Us | CSC DOST',
    description:
      'Learn about CSC DOST in Sangran Qazigund, Anantnag, J&K, operated by Authorized CSC VLE Wasim Ahmad Khanday (VLE ID: 212515670018).',
    canonicalUrl: `${SITE_ORIGIN}/about-us`,
    robots: 'index, follow',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'About Us', url: `${SITE_ORIGIN}/about-us` },
    ],
  },
  contact: {
    title: 'Contact Us & Citizen Helpdesk | CSC DOST',
    description:
      'Contact CSC DOST helpdesk in Sangran Qazigund, Anantnag, J&K by phone (+91-7006833767) or email (support@cscdost.com).',
    canonicalUrl: `${SITE_ORIGIN}/contact-us`,
    robots: 'index, follow',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'Contact Us', url: `${SITE_ORIGIN}/contact-us` },
    ],
  },
  refund: {
    title: 'Refund & Cancellation Policy | CSC DOST',
    description:
      'Review CSC DOST cancellation and refund terms for assisted application submissions and digital citizen services.',
    canonicalUrl: `${SITE_ORIGIN}/refund-policy`,
    robots: 'index, follow',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'Refund Policy', url: `${SITE_ORIGIN}/refund-policy` },
    ],
  },
  editorial: {
    title: 'Editorial & Corrections Policy | CSC DOST',
    description:
      'Read how CSC DOST verifies notices from official .gov.in and university portals, timestamps updates, and handles corrections.',
    canonicalUrl: `${SITE_ORIGIN}/editorial-policy`,
    robots: 'index, follow',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'Editorial Policy', url: `${SITE_ORIGIN}/editorial-policy` },
    ],
  },
};

export const PRIVATE_NOINDEX_META: Record<'apply' | 'track' | 'admin' | 'staff' | 'notfound', RouteSeoMeta> = {
  apply: {
    title: 'Assisted Online Application Desk | CSC DOST',
    description:
      'Submit an assisted form application request to the CSC DOST facilitation desk in Sangran Qazigund, Anantnag.',
    canonicalUrl: `${SITE_ORIGIN}/apply`,
    robots: 'noindex, nofollow',
    ogType: 'website',
  },
  track: {
    title: 'Track Application Status | CSC DOST',
    description:
      'Check the processing status and payment receipt of your CSC DOST assisted application request.',
    canonicalUrl: `${SITE_ORIGIN}/track`,
    robots: 'noindex, nofollow',
    ogType: 'website',
  },
  admin: {
    title: 'Staff Management Portal | CSC DOST',
    description: 'Internal staff management console for CSC DOST operators.',
    canonicalUrl: `${SITE_ORIGIN}/admin`,
    robots: 'noindex, nofollow',
    ogType: 'website',
  },
  staff: {
    title: 'Staff Login Portal | CSC DOST',
    description: 'Operator workspace login and queue management for CSC DOST staff.',
    canonicalUrl: `${SITE_ORIGIN}/staff`,
    robots: 'noindex, nofollow',
    ogType: 'website',
  },
  notfound: {
    title: 'Page Not Found (404) | CSC DOST',
    description:
      'The requested page could not be found on CSC DOST. Explore active jobs, admissions, schemes, e-services and calculators.',
    canonicalUrl: `${SITE_ORIGIN}/`,
    robots: 'noindex, nofollow',
    ogType: 'website',
  },
};

export function getCategorySeoMeta(slug: CategorySlug): RouteSeoMeta {
  const entry = CATEGORY_META_MAP[slug];
  return {
    title: entry.title,
    description: entry.description,
    canonicalUrl: entry.canonicalUrl,
    robots: 'index, follow',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: entry.label, url: entry.canonicalUrl },
    ],
  };
}

export function getSchemeSeoMeta(guide: {
  id: string;
  title: string;
  summary: string;
}): RouteSeoMeta {
  const canonicalUrl = `${SITE_ORIGIN}/scheme/${guide.id}`;
  return {
    title: formatSeoTitle(`${guide.title} Guide`),
    description: formatSeoDescription(guide.summary),
    canonicalUrl,
    robots: 'index, follow',
    ogType: 'article',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'Government Schemes', url: `${SITE_ORIGIN}/schemes` },
      { name: guide.title, url: canonicalUrl },
    ],
  };
}

/**
 * Updates browser head metadata dynamically when client-side SPA navigation occurs.
 */
export function applyClientSeo(meta: RouteSeoMeta): void {
  if (typeof document === 'undefined') return;

  try {
    const safeTitle = formatSeoTitle(meta.title, '', 59);
    const safeDesc = formatSeoDescription(meta.description, 154);

    document.title = safeTitle;

    // Remove legacy generic <meta name="keywords"> tag if present
    document.querySelectorAll('meta[name="keywords"]').forEach((el) => el.remove());

    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaTag('name', 'title', safeTitle);
    setMetaTag('name', 'description', safeDesc);
    setMetaTag('name', 'robots', meta.robots);

    setMetaTag('property', 'og:type', meta.ogType || 'website');
    setMetaTag('property', 'og:url', meta.canonicalUrl);
    setMetaTag('property', 'og:title', safeTitle);
    setMetaTag('property', 'og:description', safeDesc);

    if (meta.ogImage) {
      setMetaTag('property', 'og:image', meta.ogImage);
      setMetaTag('property', 'og:image:secure_url', meta.ogImage);
      setMetaTag('property', 'og:image:alt', safeTitle);
      setMetaTag('name', 'twitter:image', meta.ogImage);
      setMetaTag('name', 'twitter:image:alt', safeTitle);
    }

    setMetaTag('name', 'twitter:title', safeTitle);
    setMetaTag('name', 'twitter:description', safeDesc);

    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', meta.canonicalUrl);
  } catch {
    // Ignore head update errors in constrained environments
  }
}
