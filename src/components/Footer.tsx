import React from 'react';
import type { PolicyTab } from './PrivacyPolicyModal';
import { useLanguage, type Language } from '../contexts/LanguageContext';

export interface FooterProps {
  cafeName?: string;
  onOpenPrivacyPolicy?: (tab?: PolicyTab) => void;
}

export default function Footer({ cafeName = 'CSC DOST' }: FooterProps) {
  const { language, setLanguage, t } = useLanguage();
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

  const exploreLinks = [
    { href: '/jobs', label: t.catJobs || 'Jobs & Recruitment' },
    { href: '/jobs?tab=exams', label: 'Admit Cards' },
    { href: '/jobs?tab=results', label: 'Results & Answer Keys' },
    { href: '/education', label: t.catAdmissions || 'Admissions & IGNOU' },
    { href: '/schemes', label: t.catSchemes || 'Government Schemes' },
    { href: '/services', label: t.catServices || 'CSC E-Services' },
    { href: '/tools', label: t.navTools || 'Document Tools' },
    { href: '/calculators', label: t.navCalculators || 'Citizen Calculators' },
    { href: '/archive', label: 'Notice Archive' },
  ];

  const links = [
    { href: '/about-us', label: t.footerAbout },
    { href: '/contact-us', label: t.footerContact },
    { href: '/privacy-policy', label: t.footerPrivacy },
    { href: '/terms-of-service', label: t.footerTerms },
    { href: '/disclaimer', label: t.footerDisclaimer },
    { href: '/refund-policy', label: t.footerRefund },
  ];

  const langOptions: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हिं' },
    { code: 'ur', label: 'اردو' },
  ];

  return (
    <footer
      aria-label="Site Footer"
      className="w-full bg-[#101A36] text-slate-200 border-t border-white/10 mt-5 px-3.5 sm:px-4 lg:px-0 pt-4 lg:pt-10 pb-[calc(76px+env(safe-area-inset-bottom))] lg:pb-8"
    >
      <div className="max-w-[1180px] mx-auto lg:px-6 space-y-3 lg:space-y-6 text-start">
        {/* Desktop 3 Columns / Mobile Compact Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-10">
          {/* Column 1: Operator Details */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 lg:flex-col lg:items-start lg:gap-2">
              <div>
                <div className="text-[13px] lg:text-[15px] font-extrabold text-white tabular-nums">
                  {cafeName} © {currentYear}
                </div>
                <div className="text-[11px] lg:text-[12.5px] text-slate-300 mt-0.5 leading-snug">
                  Wasim Ahmad Khanday · VLE ID: 212515670018
                </div>
              </div>

              <div
                role="group"
                aria-label="Language switcher"
                className="inline-flex items-center bg-white/10 border border-white/15 rounded-lg p-0.5 shrink-0"
              >
                {langOptions.map((opt) => {
                  const active = language === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => setLanguage(opt.code)}
                      aria-pressed={active}
                      className={`min-h-[30px] px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#F59E0B] text-[#101A36]'
                          : 'text-slate-200 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-[11.5px] lg:text-[12.5px] text-slate-300 leading-relaxed">
              Sangran Qazigund, Anantnag, J&amp;K 192221 ·{' '}
              <a
                href="tel:+917006833767"
                dir="ltr"
                className="text-white font-semibold underline decoration-white/30 hover:text-[#F59E0B]"
              >
                +91 70068 33767
              </a>
            </div>
          </div>

          {/* Column 2: Explore Links (Desktop 3-col layout) */}
          <div className="hidden lg:block space-y-2.5">
            <div className="text-[12px] font-extrabold uppercase tracking-wider text-slate-300">
              Explore
            </div>
            <nav aria-label="Explore Sections" className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12.5px] font-semibold">
              {exploreLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLink(link.href, e)}
                  className="text-slate-200 hover:text-[#F59E0B] transition-colors no-underline py-0.5"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Column 3: Company & Legal Links (Compact wrap on Mobile/Tablet, Clean Column on Desktop) */}
          <div className="space-y-2 lg:space-y-2.5">
            <div className="hidden lg:block text-[12px] font-extrabold uppercase tracking-wider text-slate-300">
              Company
            </div>
            <nav
              aria-label="Footer Links"
              className="flex flex-wrap items-center gap-x-3 gap-y-1 lg:grid lg:grid-cols-2 lg:gap-x-4 lg:gap-y-1.5 text-[11.5px] lg:text-[12.5px] font-semibold border-t border-white/10 lg:border-t-0 pt-2.5 lg:pt-0"
            >
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLink(link.href, e)}
                  className="min-h-[32px] lg:min-h-0 lg:py-0.5 inline-flex items-center text-slate-200 hover:text-[#F59E0B] transition-colors no-underline"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <p className="text-[11px] lg:text-[12px] text-slate-300 leading-relaxed m-0 border-t border-white/10 pt-2.5 lg:pt-4">
          CSC DOST is an independent portal, not an official government website. Always confirm details on the official notification.
        </p>
      </div>
    </footer>
  );
}
