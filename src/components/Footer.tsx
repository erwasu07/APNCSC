import React from 'react';
import { ArrowUp, Info, MapPin, ExternalLink, Lock } from 'lucide-react';
import { PolicyTab } from './PrivacyPolicyModal';

interface FooterProps {
  cafeName: string;
  onOpenPrivacyPolicy?: (tab?: PolicyTab) => void;
  onOpenAdmin?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export default function Footer({ 
  cafeName, 
  onOpenPrivacyPolicy, 
  onOpenAdmin,
  onNavigateSection 
}: FooterProps) {

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (target: string) => {
    if (target === 'jobs') {
      const el = document.getElementById('recruitment-section') || document.getElementById('sarkari-board');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.location.hash = '#jobs';
      return;
    }
    if (target === 'schemes') {
      const el = document.getElementById('schemes-section') || document.getElementById('knowledge-hub');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.location.hash = '#schemes';
      return;
    }
    if (target === 'services' || target === 'csc-services') {
      const el = document.getElementById('services-catalogue') || document.getElementById('services') || document.getElementById('services-board');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.location.hash = '#services-catalogue';
      return;
    }
    if (target === 'aadhaar') {
      window.location.hash = '#service/aadhaar-card-services';
      return;
    }
    if (target === 'pan') {
      window.location.hash = '#service/pan-card-new-correction';
      return;
    }
    if (target === 'guides') {
      const el = document.getElementById('popular-guides-section') || document.getElementById('knowledge-hub');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.location.hash = '#guides';
      return;
    }
    if (target === 'about') {
      const el = document.getElementById('node-info');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (target === 'faq') {
      const el = document.getElementById('faq-section') || document.getElementById('faq');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (target === 'contact') {
      const el = document.getElementById('node-info');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
  };

  return (
    <footer id="footer" className="bg-[#12304A] text-slate-300 pt-12 pb-8 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Main 3-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Column 1: CSC DOST Brand & Independent Summary */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/favicon.svg"
                alt="CSC DOST"
                width="32"
                height="32"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-extrabold text-white tracking-tight">
                CSC DOST
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              CSC DOST is an independent citizen digital assistance and knowledge portal. We provide simplified recruitment updates, welfare scheme guidance, and online form-filling assistance linking to official government portals.
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <p>Operator: Wasim Ahmad Khanday (CSC ID: 212515670018)</p>
              <p>Center: Sangran Qazigund, Anantnag, Jammu &amp; Kashmir 192221</p>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Explore
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('jobs')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Jobs &amp; Recruitment
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('schemes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Government Schemes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('services')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  CSC E-Services
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('guides')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Citizen Guides &amp; Knowledge Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Information & Legal */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Information &amp; Policies
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About CSC DOST
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact &amp; Location
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPrivacyPolicy?.('disclaimer')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Independent Service Disclaimer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPrivacyPolicy?.('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy (DPDP Act)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPrivacyPolicy?.('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPrivacyPolicy?.('refund')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Refund &amp; Cancellation Policy
                </button>
              </li>
            </ul>

            {onOpenAdmin && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Staff Operator Login</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Independent Portal Trust & Disclaimer Banner */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <Info className="w-4 h-4 shrink-0" />
            <span>Important Citizen Disclaimer</span>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-400">
            <strong>CSC DOST (cscdost.com)</strong> is an independent citizen digital assistance desk operated by Authorized CSC VLE Wasim Ahmad Khanday. <strong>We are NOT an official government department, ministry, or government-owned website.</strong> Official government portals can be accessed directly at <a href="https://csc.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-300 underline">csc.gov.in</a>, <a href="https://digitalseva.csc.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-300 underline">digitalseva.csc.gov.in</a>, and respective official recruiting agency portals. For all official filings, citizens are encouraged to verify notifications directly against official government gazettes.
          </p>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © 2026 CSC DOST (cscdost.com). All Rights Reserved.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer font-medium"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
