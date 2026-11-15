import React from 'react';
import type { PolicyTab } from './PrivacyPolicyModal';
import { useLanguage, type Language } from '../contexts/LanguageContext';

export interface FooterProps {
  cafeName?: string;
  onOpenPrivacyPolicy?: (tab?: PolicyTab) => void;
  onOpenAdmin?: () => void;
}

export default function Footer({ cafeName = 'CSC DOST', onOpenAdmin }: FooterProps) {
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
      className="w-full bg-[#101A36] text-slate-200 border-t border-white/10 mt-5 px-3.5 pt-4 pb-[calc(76px+env(safe-area-inset-bottom))]"
    >
      <div className="space-y-3 text-start">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[13px] font-extrabold text-white tabular-nums">
              {cafeName} © {currentYear}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
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

        <div className="text-[11.5px] text-slate-300 leading-snug">
          Sangran Qazigund, Anantnag, J&amp;K 192221 ·{' '}
          <a
            href="tel:+917006833767"
            dir="ltr"
            className="text-white font-semibold underline decoration-white/30 hover:text-[#F59E0B]"
          >
            +91 70068 33767
          </a>
        </div>

        <nav
          aria-label="Footer Links"
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-semibold border-t border-white/10 pt-2.5"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLink(link.href, e)}
              className="min-h-[32px] inline-flex items-center text-slate-200 hover:text-[#F59E0B] transition-colors no-underline"
            >
              {link.label}
            </a>
          ))}
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="min-h-[32px] inline-flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px] ms-auto"
            >
              {t.staffLogin}
            </button>
          )}
        </nav>

        <p className="text-[11px] text-slate-300 leading-relaxed m-0 border-t border-white/10 pt-2.5">
          CSC DOST is an independent portal, not an official government website. Always confirm details on the official notification.
        </p>
      </div>
    </footer>
  );
}
