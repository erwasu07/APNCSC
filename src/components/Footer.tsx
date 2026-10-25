import React from 'react';
import { ArrowUp, Info, MapPin, ExternalLink, Lock, Wrench, ShieldCheck, Heart } from 'lucide-react';
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
      const el = document.getElementById('services-bento') || document.getElementById('services-catalogue');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.location.hash = '#services-catalogue';
      return;
    }
    if (target === 'tools') {
      window.location.hash = '#tools';
      return;
    }
    if (target.startsWith('tool:')) {
      const toolId = target.replace('tool:', '');
      window.location.hash = `#tools/${toolId}`;
      return;
    }
    if (target === 'education') {
      const el = document.getElementById('education-resources');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (target === 'about') {
      const el = document.getElementById('node-info');
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
    <footer id="footer" className="bg-[#0B1F49] text-slate-300 pt-14 pb-8 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Column 1: CSC DOST Brand & Independent Summary */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center gap-3">
              <img
                src="/favicon.svg"
                alt="CSC DOST"
                width="36"
                height="36"
                className="w-9 h-9 object-contain"
              />
              <span className="text-xl font-black text-white tracking-tight">
                CSC DOST
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              CSC DOST is an independent citizen digital assistance and knowledge portal. We provide simplified recruitment updates, welfare scheme guidance, online form-filling assistance, and free browser-based document tools.
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1 border-t border-slate-800/80">
              <p>Operator: Wasim Ahmad Khanday (CSC ID: 212515670018)</p>
              <p>Center: Sangran Qazigund, Anantnag, Jammu &amp; Kashmir 192221</p>
            </div>
          </div>

          {/* Column 2: Free Online Tools */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Online Tools
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('tool:image-compressor')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Image Compressor (20KB / 50KB)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('tool:image-to-pdf')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Image to PDF Maker
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('tool:pdf-merge')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  PDF Merge Tool
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('tool:background-remover')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Background Remover
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('tool:passport-photo-maker')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Passport Photo Maker (35×45 mm)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('tool:signature-resizer')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Signature Resizer (10–20 KB)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Government Schemes & Updates */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Schemes &amp; Jobs
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('jobs')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Latest Recruitments
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('schemes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  PM-KISAN Samman Nidhi
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('schemes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Ayushman Bharat PM-JAY
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('education')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Education Notices
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
            </ul>
          </div>

          {/* Column 4: Information & Policies */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Information &amp; Legal
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
          <div className="flex items-center gap-2 text-[#F59E0B] font-bold text-xs">
            <Info className="w-4 h-4 shrink-0" />
            <span>Important Citizen Disclaimer</span>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-400">
            <strong>CSC DOST (cscdost.com)</strong> is an independent citizen digital assistance desk operated by Authorized CSC VLE Wasim Ahmad Khanday. <strong>We are NOT an official government department, ministry, or government-owned website.</strong> Official government portals can be accessed directly at <a href="https://csc.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-300 underline">csc.gov.in</a>, <a href="https://digitalseva.csc.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-300 underline">digitalseva.csc.gov.in</a>, and respective official recruiting agency portals.
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
