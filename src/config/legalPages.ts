export type LegalPageType =
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'disclaimer'
  | 'refund'
  | 'editorial';

export const LEGAL_PAGE_CONFIG: Record<
  LegalPageType,
  { title: string; metaTitle: string; path: string }
> = {
  about: {
    title: 'About CSC DOST',
    metaTitle: 'About Us | CSC DOST - Authorized CSC VLE Digital Assistance Center',
    path: '/about-us',
  },
  contact: {
    title: 'Contact Us & Citizen Helpdesk',
    metaTitle: 'Contact Us & Help Desk | CSC DOST Support Center',
    path: '/contact-us',
  },
  privacy: {
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy | CSC DOST - Digital Assistance & Information Portal',
    path: '/privacy-policy',
  },
  terms: {
    title: 'Terms of Service & Citizen Agreement',
    metaTitle: 'Terms of Service | CSC DOST - Citizen E-Governance Assistance',
    path: '/terms-of-service',
  },
  disclaimer: {
    title: 'Disclaimer & Government Non-Affiliation',
    metaTitle: 'Disclaimer & Government Non-Affiliation | CSC DOST',
    path: '/disclaimer',
  },
  refund: {
    title: 'Refund & Cancellation Policy',
    metaTitle: 'Refund & Cancellation Policy | CSC DOST',
    path: '/refund-policy',
  },
  editorial: {
    title: 'Editorial & Corrections Policy',
    metaTitle: 'Editorial & Corrections Policy | CSC DOST',
    path: '/editorial-policy',
  },
};
