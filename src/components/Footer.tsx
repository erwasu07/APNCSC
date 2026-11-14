import React from 'react';
import type { PolicyTab } from './PrivacyPolicyModal';
import { useLanguage } from '../contexts/LanguageContext';

export interface FooterProps {
  cafeName?: string;
  onOpenPrivacyPolicy?: (tab?: PolicyTab) => void;
  onOpenAdmin?: () => void;
}

export default function Footer({ cafeName = 'CSC DOST' }: FooterProps) {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const handleLink = (path: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      window.history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch {
      window.location.href = path;
    }
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const links = [
    { href: '/about-us', label: t.footerAbout },
    { href: '/contact-us', label: t.footerContact },
    { href: '/privacy-policy', label: t.footerPrivacy },
    { href: '/terms-of-service', label: t.footerTerms },
    { href: '/disclaimer', label: t.footerDisclaimer },
    { href: '/refund-policy', label: t.footerRefund },
  ];

  return (
    <footer
      aria-label="Site Footer"
      className="w-full bg-[var(--bg-header-dark)] text-slate-200 border-t border-white/10 mt-6 pt-4 pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-2.5 text-start">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs sm:text-sm font-bold text-white tabular-nums">
            {cafeName} © {currentYear}
          </div>

          <nav
            aria-label="Footer Links"
            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm font-semibold"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLink(link.href, e)}
                className="min-h-[36px] inline-flex items-center text-slate-200 hover:text-[#F5A623] transition-colors no-underline"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed m-0 border-t border-white/10 pt-2.5">
          {t.footerDisclaimerNote}
        </p>
      </div>
    </footer>
  );
}
