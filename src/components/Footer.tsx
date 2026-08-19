import React, { useState, useEffect } from 'react';
import { ArrowUp, Lock, Key, Info, MapPin } from 'lucide-react';
import { PolicyTab } from './PrivacyPolicyModal';

interface FooterProps {
  cafeName: string;
  onOpenPrivacyPolicy?: (tab?: PolicyTab) => void;
  onOpenAdmin?: () => void;
}

export default function Footer({ cafeName, onOpenPrivacyPolicy, onOpenAdmin }: FooterProps) {
  const [showCookie, setShowCookie] = useState(true);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dismissCookie = () => {
    setShowCookie(false);
    localStorage.setItem('cookie_dismissed_2026', 'true');
  };

  useEffect(() => {
    if (localStorage.getItem('cookie_dismissed_2026')) {
      setShowCookie(false);
    }
  }, []);

  return (
    <>
      {/* Tricolor Accent Line */}
      <div className="w-full h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#128807]"></div>

      <footer id="footer" className="bg-[#030712] text-slate-300 py-12 px-4 sm:px-6 md:px-8 border-t border-slate-900 font-sans transition-colors">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Column 1: Branding */}
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#f59e0b] text-slate-950 text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
                  CSC
                </span>
                <span className="text-lg font-black text-white tracking-wider uppercase font-display">
                  CSC DOST PORTAL
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-xl font-medium">
                Independent Digital Assistance Service Center providing online application assistance, exam hall ticket updates, PAN card filing guidance, and digital documentation support.
              </p>
            </div>

            {/* Column 2: Actions */}
            <div className="md:col-span-4 flex flex-col items-start md:items-end gap-3">
              <div className="flex items-center gap-2">
                <a
                  href="https://share.google/9jGqiH9vxn5BNUES3"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in Google Maps for Directions"
                  className="p-2 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 rounded-lg flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                >
                  <MapPin className="w-4 h-4" />
                </a>
                {onOpenAdmin && (
                  <button
                    onClick={onOpenAdmin}
                    title="Staff Admin Login Portal"
                    className="p-2 bg-[#0a0f1d] hover:bg-slate-800 text-amber-500 hover:text-amber-400 rounded-lg border border-slate-800 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Lock className="w-4 h-4 text-amber-500" />
                    <Key className="w-4 h-4 text-amber-400" />
                  </button>
                )}
              </div>
              <button
                onClick={scrollToTop}
                className="px-4 py-2 bg-[#111827] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-extrabold uppercase rounded-xl text-center transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Back To Top</span>
              </button>
            </div>

          </div>

          {/* Explicit Legal Disclaimer Box for Google Search Console / Safe Browsing Compliance */}
          <div className="p-4 bg-slate-900/80 border border-amber-500/30 rounded-2xl text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Authorized VLE &amp; Service Portal Disclaimer</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-300 font-sans">
              <strong>CSC DOST (cscdost.com)</strong> is operated by <strong>Authorized CSC Village Level Entrepreneur (VLE) Wasim Ahmad Khanday (CSC ID: 212515670018, Reg. Date: 11-11-2020)</strong> issued by CSC e-Governance Services India Limited, Ministry of Electronics and Information Technology, Government of India. We provide online application form filling assistance, document printing, and exam updates. This portal is a private digital assistance desk facilitating citizen applications on official government portals. Official portals can be accessed directly at <a href="https://csc.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-semibold">csc.gov.in</a> or <a href="https://digitalseva.csc.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-semibold">digitalseva.csc.gov.in</a>.
            </p>
          </div>

          {/* Bottom Copyright & Policies Section */}
          <div className="pt-6 border-t border-slate-900 space-y-3 text-center md:text-left">
            {/* Policy Links in One Horizontal Line */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs font-medium text-slate-400">
              <button
                onClick={() => onOpenPrivacyPolicy?.('privacy')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                • Privacy Policy (DPDP Act Compliant)
              </button>
              <button
                onClick={() => onOpenPrivacyPolicy?.('hyperlink')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                • Hyperlink Policy
              </button>
              <button
                onClick={() => onOpenPrivacyPolicy?.('copyright')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                • Copyright Policy &amp; Attribution
              </button>
              <button
                onClick={() => onOpenPrivacyPolicy?.('disclaimer')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                • Service Disclaimer
              </button>
              <button
                onClick={() => onOpenPrivacyPolicy?.('refund')}
                className="hover:text-white transition-colors cursor-pointer font-semibold text-amber-400/90 hover:text-amber-300"
              >
                • Refund and Cancellation Policy
              </button>
            </div>

            {/* Copyright & Subtext */}
            <div className="text-[11px] text-slate-500 font-mono space-y-1">
              <p>© 2026 CSC DOST (cscdost.com). All Rights Reserved. Operator: Wasim Ahmad Khanday.</p>
              <p className="text-[10px] text-slate-500 font-sans">
                Independent Digital Assistance &amp; Informational Portal.
              </p>
            </div>
          </div>

        </div>
      </footer>

      {/* Cookie consent compliance banner */}
      {showCookie && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:max-w-md bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl shadow-2xl z-40 flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <Info className="w-5 h-5 text-[#f59e0b] mt-0.5 shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              We utilize local browser cookies to temporarily store your secure administrator desk credentials and session preferences in accordance with GIGW rules.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={dismissCookie}
              className="px-4 py-1.5 bg-[#f59e0b] hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg transition-colors cursor-pointer"
            >
              I Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}
