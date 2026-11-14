import React from 'react';
import { PhoneCall, MapPin } from 'lucide-react';
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
    { href: '/disclaimer', label: t.footerDisclaimer },
    { href: '/terms-of-service', label: t.footerTerms },
    { href: '/refund-policy', label: t.footerRefund },
  ];

  return (
    <footer
      aria-label="Site Footer"
      className="w-full bg-[#101A36] text-slate-200 border-t border-white/10 mt-8 pt-7 pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5 text-start">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <img
              src="/csc-dost-header-logo.png"
              alt=""
              width={40}
              height={40}
              className="w-10 h-10 rounded-full bg-white p-0.5 object-contain shrink-0"
              loading="lazy"
            />
            <div className="space-y-1">
              <div className="text-base font-extrabold text-white tracking-tight">
                {cafeName} <span className="text-[#F5A623]">·</span>{' '}
                <span className="text-sm font-medium text-slate-300">
                  Wasim Ahmad Khanday (VLE ID: 212515670018)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
                  <span>{t.footerAddress}</span>
                </span>
                <a
                  href="tel:+917006833767"
                  dir="ltr"
                  className="inline-flex items-center gap-1.5 text-white hover:text-[#F5A623] font-semibold no-underline transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-[#1F9D6B] shrink-0" aria-hidden="true" />
                  <span>+91 70068 33767</span>
                </a>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-300 font-medium md:text-end shrink-0">
            © {currentYear} {cafeName}
          </div>
        </div>

        <nav
          aria-label="Footer Links"
          className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-sm font-semibold"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLink(link.href, e)}
              className="text-slate-100 hover:text-[#F5A623] transition-colors py-1 no-underline"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-sm text-slate-300 leading-relaxed">
          {t.footerDisclaimerNote}
        </p>
      </div>
    </footer>
  );
}
