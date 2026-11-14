import React from 'react';
import { PhoneCall, MapPin, ShieldAlert } from 'lucide-react';
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
      className="w-full bg-[var(--bg-header-dark)] text-slate-200 border-t border-white/10 mt-8 pt-6 pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4 text-start">
        {/* Operator & Centre Row */}
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
                <span className="text-sm font-medium text-slate-200">
                  Wasim Ahmad Khanday · Authorized CSC VLE ID 212515670018
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
                  <span>Sangran Qazigund, Anantnag, J&amp;K 192221</span>
                </span>
                <a
                  href="tel:+917006833767"
                  dir="ltr"
                  className="min-h-[44px] md:min-h-0 inline-flex items-center gap-1.5 text-white hover:text-[#F5A623] font-semibold no-underline transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-[#1F9D6B] shrink-0" aria-hidden="true" />
                  <span className="tabular-nums">+91 70068 33767</span>
                </a>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-300 font-medium md:text-end shrink-0 tabular-nums">
            © {currentYear} {cafeName}
          </div>
        </div>

        {/* Legal & Policy Navigation */}
        <nav
          aria-label="Footer Links"
          className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-sm font-semibold"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLink(link.href, e)}
              className="min-h-[44px] inline-flex items-center text-slate-100 hover:text-[#F5A623] transition-colors py-1 no-underline"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mandatory Independent Portal Disclaimer */}
        <div className="flex items-start gap-2 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-slate-200 leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="m-0">{t.footerDisclaimerNote}</p>
        </div>
      </div>
    </footer>
  );
}
