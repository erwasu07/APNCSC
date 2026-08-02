import React, { useState, useEffect } from 'react';
import { ArrowUp, Eye, Lock, ShieldCheck, Info } from 'lucide-react';
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
          
          {/* Main 3-Column Footer Grid (Image 6 Exact Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Column 1: Branding & VLE Credentials */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-[#f59e0b] text-slate-950 text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
                  CSC
                </span>
                <span className="text-lg font-black text-white tracking-wider uppercase font-display">
                  CSC DOST PORTAL
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-md font-medium">
                Authorized Common Services Centre Digital Shop providing online sarkari application filing, exam hall tickets, PAN card updates, and e-KYC services across Digital India.
              </p>

              {/* Dark Credentials Box */}
              <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs font-mono text-slate-300 max-w-md">
                <p>
                  <span className="text-slate-500">VLE Station ID:</span> <strong className="text-white">212515670018</strong>
                </p>
                <p>
                  <span className="text-slate-500">Authorized VLE Lead:</span> <strong className="text-white">Wasim Ahmad Khanday</strong>
                </p>
                <p>
                  <span className="text-slate-500">Helpdesk Contact:</span> <strong className="text-white">+91 70068 33767</strong>
                </p>
              </div>
            </div>

            {/* Column 2: Portal Policies */}
            <div className="md:col-span-4 space-y-3">
              <ul className="space-y-2 text-xs font-medium text-slate-400">
                <li>
                  <button
                    onClick={() => onOpenPrivacyPolicy?.('privacy')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    • Privacy Policy (DPDP Act Compliant)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenPrivacyPolicy?.('hyperlink')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    • Official Hyperlink Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenPrivacyPolicy?.('copyright')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    • Copyright Policy &amp; Attribution
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenPrivacyPolicy?.('disclaimer')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    • Service Disclaimer
                  </button>
                </li>
                <li className="pt-1">
                  {onOpenAdmin && (
                    <button
                      onClick={onOpenAdmin}
                      className="text-[#f59e0b] hover:text-amber-300 underline font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>🔑 Staff Admin Login Portal</span>
                    </button>
                  )}
                </li>
              </ul>
            </div>

            {/* Column 3: Visitor Statistics Counter Box */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-black uppercase text-white tracking-wider border-l-2 border-emerald-500 pl-2">
                Visitor Statistics
              </h4>

              <div className="bg-[#0a0f1d] border border-slate-800 rounded-2xl p-4 text-center space-y-2 shadow-inner">
                <div className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase flex items-center justify-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>LIVE PORTAL HITS COUNTER</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black font-mono text-[#f59e0b] tracking-wider">
                  24,958,180
                </p>
                <p className="text-[10px] text-emerald-400 font-bold">
                  ● Live Updates Active • Digital India Hub
                </p>
              </div>

              <button
                onClick={scrollToTop}
                className="w-full py-2.5 bg-[#111827] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-extrabold uppercase rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Back To Top</span>
              </button>
            </div>

          </div>

          {/* Bottom Copyright & Disclaimer Line */}
          <div className="pt-6 border-t border-slate-900 text-[11px] text-slate-500 space-y-1 text-center md:text-left font-mono">
            <p>© 2026 Verified Common Service Centre ID :- 212515670018. All Rights Reserved. Author: Wasim Ahmad Khanday</p>
            <p className="text-[10px] text-slate-600">
              Designed and developed for Ministry of Electronics &amp; IT (MeitY) CSC e-Governance initiative.
            </p>
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
