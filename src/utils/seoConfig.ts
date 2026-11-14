export const SITE_ORIGIN = 'https://www.cscdost.com';
export const SITE_NAME = 'CSC DOST';

export type CategorySlug = 'jobs' | 'education' | 'schemes' | 'services' | 'tools' | 'calculators';

export interface RouteSeoMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: 'index, follow' | 'noindex, nofollow';
  ogType?: 'website' | 'article';
  breadcrumbs?: { name: string; url: string }[];
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
      'Read how CSC DOST handles citizen application details, local browser document processing and data privacy under applicable Indian laws.',
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
      'Important notice: CSC DOST is an independent private citizen facilitation center in Qazigund, Anantnag and is not an official government website.',
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
};

export const PRIVATE_NOINDEX_META: Record<'apply' | 'track' | 'admin' | 'notfound', RouteSeoMeta> = {
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
  notfound: {
    title: 'Page Not Found (404) | CSC DOST',
    description:
      'The requested page could not be found on CSC DOST. Explore active jobs, admissions, schemes, e-services, tools and calculators.',
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
    title: `${guide.title} – Eligibility, Documents & Steps | CSC DOST`,
    description: guide.summary,
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
    document.title = meta.title;

    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaTag('name', 'title', meta.title);
    setMetaTag('name', 'description', meta.description);
    setMetaTag('name', 'robots', meta.robots);

    setMetaTag('property', 'og:type', meta.ogType || 'website');
    setMetaTag('property', 'og:url', meta.canonicalUrl);
    setMetaTag('property', 'og:title', meta.title);
    setMetaTag('property', 'og:description', meta.description);

    setMetaTag('name', 'twitter:title', meta.title);
    setMetaTag('name', 'twitter:description', meta.description);

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
