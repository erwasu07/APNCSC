import React from 'react';
import type { PolicyTab, LegalTab } from './PrivacyPolicyModal';

export interface FooterProps {
  cafeName?: string;
  onOpenPrivacyPolicy?: (tab?: PolicyTab) => void;
  onOpenAdmin?: () => void;
}

export default function Footer({ cafeName = 'CSC DOST' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLegalLink = (path: string, e: React.MouseEvent<HTMLAnchorElement>) => {
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

  return (
    <footer
      aria-label="Site Footer"
      className="w-full bg-[#F1F5F9] border-t border-[#E2E8F0] text-[#0F172A] mt-4 sm:mt-6 pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-6 pt-5"
    >
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 space-y-3.5">
        
        {/* FIRST ROW: Brand/Logo/Address on left, Copyright on right */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
          {/* Left: Logo + Name + Location */}
          <div className="flex items-center gap-2.5">
            <img
              src="/csc-dost-header-logo.png"
              alt="CSC DOST Logo"
              className="w-8 h-8 rounded-full object-contain shrink-0"
              loading="lazy"
            />
            <div className="leading-tight">
              <span className="text-xs sm:text-sm font-extrabold text-[#092442] block">
                {cafeName}
              </span>
              <span className="text-[10.5px] sm:text-[11px] text-[#64748B] block font-medium">
                Sangran, Qazigund, Anantnag
              </span>
            </div>
          </div>

          {/* Right: Copyright */}
          <div className="text-[11px] sm:text-xs text-[#64748B] font-medium sm:text-right shrink-0">
            © {currentYear} {cafeName}
          </div>
        </div>

        {/* SECOND ROW: Centred 4 visible policy/contact links */}
        <nav
          aria-label="Footer Legal & Contact Links"
          className="flex items-center justify-center flex-wrap gap-x-1 sm:gap-x-2 gap-y-1 text-center border-t border-[#E2E8F0] pt-3"
        >
          <a
            href="/privacy-policy"
            onClick={(e) => handleLegalLink('/privacy-policy', e)}
            className="text-xs sm:text-[12.5px] text-[#475569] hover:text-[#1E56C8] font-medium py-1.5 px-1.5 sm:px-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E56C8] rounded-md"
          >
            Privacy Policy
          </a>
          <span className="text-slate-300 select-none text-xs" aria-hidden="true">
            ·
          </span>
          <a
            href="/terms-of-service"
            onClick={(e) => handleLegalLink('/terms-of-service', e)}
            className="text-xs sm:text-[12.5px] text-[#475569] hover:text-[#1E56C8] font-medium py-1.5 px-1.5 sm:px-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E56C8] rounded-md"
          >
            Terms of Use
          </a>
          <span className="text-slate-300 select-none text-xs" aria-hidden="true">
            ·
          </span>
          <a
            href="/disclaimer"
            onClick={(e) => handleLegalLink('/disclaimer', e)}
            className="text-xs sm:text-[12.5px] text-[#475569] hover:text-[#1E56C8] font-medium py-1.5 px-1.5 sm:px-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E56C8] rounded-md"
          >
            Disclaimer
          </a>
          <span className="text-slate-300 select-none text-xs" aria-hidden="true">
            ·
          </span>
          <a
            href="/contact-us"
            onClick={(e) => handleLegalLink('/contact-us', e)}
            className="text-xs sm:text-[12.5px] text-[#475569] hover:text-[#1E56C8] font-medium py-1.5 px-1.5 sm:px-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E56C8] rounded-md"
          >
            Contact
          </a>
        </nav>

      </div>
    </footer>
  );
}
