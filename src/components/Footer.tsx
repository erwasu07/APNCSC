import React, { useState, useEffect } from 'react';
import { ArrowUp, ShieldCheck, Heart, Info } from 'lucide-react';

interface FooterProps {
  cafeName: string;
}

export default function Footer({ cafeName }: FooterProps) {
  const [showScroll, setShowScroll] = useState(false);
  const [showCookie, setShowCookie] = useState(true);

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 300) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

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
      {/* TRICOLOR TOP FOOTER ACCENT */}
      <div className="w-full h-[4px] bg-gradient-to-r from-[#FF9933] via-white to-[#128807] shadow-inner mt-16"></div>

      <footer id="footer" className="bg-slate-950 text-slate-300 py-16 border-t border-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 mb-10 pb-10 border-b border-slate-900">
            {/* Left Col - Brand & Mandates */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                {/* Emblem graphic box */}
                <div className="w-9 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-blue-900 font-extrabold text-xs shadow-md">
                  CSC
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-base font-black tracking-tight text-white font-display">
                    APNA<span className="text-orange-500">CSC</span>
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">Digital Seva Terminal</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                Operated as an official co-partner in coordination with the National Institute of Electronics &amp; Information Technology (NIELIT) and UIDAI, Ministry of Electronics &amp; IT, Government of India.
              </p>

              <div className="flex items-center gap-2.5 text-[10px] bg-slate-900 p-3 rounded-xl text-slate-400 border border-slate-800/80 max-w-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Government regulated tariff plan strictly applied for all public transactions.</span>
              </div>
            </div>

            {/* Col 2 - Govt Directories */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-200 border-l-2 border-orange-500 pl-2">Government of India</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">National Portal of India</a></li>
                <li><a href="https://www.meity.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">Ministry of IT (MeitY)</a></li>
                <li><a href="https://www.digitalindia.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">Digital India Initiative</a></li>
                <li><a href="https://uidai.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">UIDAI Aadhaar Portal</a></li>
                <li><a href="https://www.mygov.in" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">MyGov Citizen Portal</a></li>
              </ul>
            </div>

            {/* Col 3 - Candidate Zone */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-200 border-l-2 border-orange-500 pl-2">Student &amp; Services Zone</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#services" className="hover:text-orange-400 transition-colors">Apply CCC / BCC Online</a></li>
                <li><a href="#sarkari-board" className="hover:text-orange-400 transition-colors">Download Exam Admit Cards</a></li>
                <li><a href="https://student.nielit.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">NIELIT Candidate Portal</a></li>
                <li><a href="#services" className="hover:text-orange-400 transition-colors">Aadhaar Card Demographics</a></li>
                <li><a href="#sarkari-board" className="hover:text-orange-400 transition-colors">Check Sarkari Result updates</a></li>
              </ul>
            </div>

            {/* Col 4 - Policies */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-200 border-l-2 border-orange-500 pl-2">Legalities &amp; Policy</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Biometric demographic transactions are safe &amp; encrypted directly via GoI portals. No client-side records are cached.
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] font-bold text-slate-400 pt-1">
                <a href="#privacy" className="hover:text-white underline transition-colors">Privacy Policy</a>
                <a href="#terms" className="hover:text-white underline transition-colors">Terms of Use</a>
                <a href="#hyperlink" className="hover:text-white underline transition-colors">Hyperlink Policy</a>
                <a href="#copyright" className="hover:text-white underline transition-colors">Copyright Policy</a>
                <a href="#disclaimer" className="hover:text-white underline transition-colors">Disclaimer</a>
                <a href="#help" className="hover:text-white underline transition-colors">Help</a>
              </div>
            </div>
          </div>

          {/* OFFICIAL GOVERNMENT INITIATIVE BANNER LOGOS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 pb-10 mb-8 border-b border-slate-900 text-center text-xs font-bold text-slate-500">
            <div className="border border-slate-900 bg-slate-900/50 p-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-1.5">
              <span className="text-orange-400">●</span> Digital India
            </div>
            <div className="border border-slate-900 bg-slate-900/50 p-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-1.5">
              <span className="text-white">●</span> National Portal of India
            </div>
            <div className="border border-slate-900 bg-slate-900/50 p-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-1.5">
              <span className="text-green-500">●</span> MyGov.in
            </div>
            <div className="border border-slate-900 bg-slate-900/50 p-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-1.5">
              <span className="text-blue-400">●</span> MeitY Portal
            </div>
            <div className="border border-slate-900 bg-slate-900/50 p-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-1.5">
              <span className="text-purple-400">●</span> NIC India
            </div>
          </div>

          {/* GIGW FOOTER CREDITS */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-semibold font-mono border-t border-slate-950 pt-2">
            <div className="text-center md:text-left space-y-1">
              <p>© 2026 Verified Common Service Centre  ID :- 212515670018</p>
              <p className="text-slate-600">All Rights Reserved. Author: @Wasim Ahmad Khanday</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1 text-[9px]">
              <span>Last Updated: 11 Jul 2026 (Live Release)</span>
              <span className="bg-slate-900 text-orange-400 px-2 py-0.5 rounded-md font-mono border border-slate-800">
                Visitor Hits Counter: 24,958,102
              </span>
            </div>
          </div>

        </div>
      </footer>

      {/* Back to Top floating arrow */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-[#e66e19] hover:bg-orange-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all z-40 animate-fade-in"
          aria-label="Back to top"
          id="scroll-to-top-btn"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Cookie consent compliance banner */}
      {showCookie && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:max-w-md bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl shadow-2xl z-40 animate-fade-in flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <Info className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              We utilize local browser cookies to temporarily store your secure administrator desk credentials and session preferences in accordance with GIGW rules.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={dismissCookie}
              className="px-4 py-1.5 bg-[#e66e19] hover:bg-orange-600 text-white text-[10px] font-bold rounded-lg transition-colors"
              id="cookie-accept-btn"
            >
              I Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}
